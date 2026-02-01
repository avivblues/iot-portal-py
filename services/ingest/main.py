"""MQTT → InfluxDB ingest service.

Subscribes to the telemetry topic, validates payloads, persists each metric to InfluxDB, and
notifies the API so SSE clients receive instantaneous updates.
"""
from __future__ import annotations

import json
import logging
import os
import signal
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Optional
from uuid import UUID

import paho.mqtt.client as mqtt
import requests
from influxdb_client import InfluxDBClient, Point, WritePrecision
from pydantic import BaseModel, Field, ValidationError

logging.basicConfig(level=logging.INFO, format="[ingest] %(message)s")
logger = logging.getLogger(__name__)


class TelemetryMetrics(BaseModel):
    temp_c: float | None = Field(default=None, description="Temperature °C")
    humidity_pct: float | None = Field(default=None, description="Humidity %")
    voltage_v: float | None = Field(default=None, description="Voltage V")
    current_a: float | None = Field(default=None, description="Current A")
    power_w: float | None = Field(default=None, description="Power W")

    def as_dict(self) -> Dict[str, float]:
        return {key: value for key, value in self.model_dump().items() if value is not None}


class TelemetryPayload(BaseModel):
    ts: datetime | None = Field(default=None)
    metrics: TelemetryMetrics


@dataclass
class DeviceContext:
    device_id: UUID
    tenant_id: UUID


class IngestService:
    def __init__(self) -> None:
        self.mqtt_host = os.getenv("MQTT_HOST", "mosquitto")
        self.mqtt_port = int(os.getenv("MQTT_PORT", "1883"))
        self.mqtt_username = os.getenv("MQTT_USERNAME") or None
        self.mqtt_password = os.getenv("MQTT_PASSWORD") or None
        prefix = os.getenv("MQTT_TOPIC_PREFIX", "iot").strip("/")
        self.topic_prefix = prefix or "iot"

        self.influx_url = os.getenv("INFLUX_URL", "http://influxdb:8086")
        self.influx_org = os.getenv("INFLUX_ORG", "iot-org")
        self.influx_bucket = os.getenv("INFLUX_BUCKET", "iot_telemetry")
        self.influx_token = os.getenv("INFLUX_TOKEN", "dev-token")

        api_base = os.getenv("INTERNAL_API_URL", "http://api:4000").rstrip("/")
        self.internal_ingest_url = f"{api_base}/internal/telemetry_ingest"
        self.http = requests.Session()

        self.mqtt_client = mqtt.Client(client_id="iot-ingest")
        if self.mqtt_username and self.mqtt_password:
            self.mqtt_client.username_pw_set(self.mqtt_username, self.mqtt_password)
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.on_disconnect = self.on_disconnect

        self.influx_client = InfluxDBClient(url=self.influx_url, token=self.influx_token, org=self.influx_org)
        self.write_api = self.influx_client.write_api()

        self.last_values: Dict[UUID, Dict[str, float]] = {}
        self._stopping = False

    def start(self) -> None:
        logger.info("connecting to MQTT broker %s:%s", self.mqtt_host, self.mqtt_port)
        self.mqtt_client.connect(self.mqtt_host, self.mqtt_port, keepalive=60)
        self.mqtt_client.loop_start()
        signal.signal(signal.SIGTERM, self.stop)
        signal.signal(signal.SIGINT, self.stop)
        try:
            while not self._stopping:
                signal.pause()
        except AttributeError:
            # Windows containers do not implement signal.pause
            while not self._stopping:
                time.sleep(1)

    def stop(self, *_: object) -> None:
        if self._stopping:
            return
        self._stopping = True
        logger.info("shutting down ingest service")
        try:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        finally:
            self.write_api.close()
            self.influx_client.close()
            self.http.close()
            sys.exit(0)

    # MQTT callbacks -----------------------------------------------------
    def on_connect(self, client: mqtt.Client, _userdata: object, _flags: dict, rc: int) -> None:
        if rc != 0:
            logger.error("failed to connect to MQTT: rc=%s", rc)
            return
        topic = f"{self.topic_prefix}/+/telemetry"
        client.subscribe(topic)
        logger.info("subscribed to %s", topic)

    def on_disconnect(self, _client: mqtt.Client, _userdata: object, rc: int) -> None:
        if not self._stopping:
            logger.warning("unexpected MQTT disconnect (rc=%s); reconnecting…", rc)

    def on_message(self, _client: mqtt.Client, _userdata: object, msg: mqtt.MQTTMessage) -> None:
        device_uuid = self._parse_device_uuid(msg.topic)
        if not device_uuid:
            logger.warning("discarded message with invalid topic: %s", msg.topic)
            return

        try:
            payload = TelemetryPayload.model_validate_json(msg.payload)
        except ValidationError as exc:
            logger.warning("invalid payload for %s: %s", device_uuid, exc)
            return

        timestamp = self._normalize_timestamp(payload.ts)
        metrics = payload.metrics.as_dict()
        if not metrics:
            logger.info("empty metrics for %s; skipping", device_uuid)
            return

        context = self._notify_api(device_uuid, timestamp, payload)
        if not context:
            return

        self._write_influx(context, timestamp, metrics)
        self.last_values[context.device_id] = metrics

    # Helpers ------------------------------------------------------------
    def _parse_device_uuid(self, topic: str) -> Optional[UUID]:
        try:
            _, device_id, suffix = topic.split("/", 2)
        except ValueError:
            return None
        if suffix != "telemetry":
            return None
        try:
            return UUID(device_id)
        except ValueError:
            return None

    def _normalize_timestamp(self, ts: datetime | None) -> datetime:
        if ts is None:
            return datetime.now(timezone.utc)
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc)

    def _notify_api(self, device_id: UUID, timestamp: datetime, payload: TelemetryPayload) -> Optional[DeviceContext]:
        body = {
            "device_id": str(device_id),
            "ts": timestamp.isoformat(),
            "metrics": payload.metrics.model_dump(),
        }
        try:
            response = self.http.post(self.internal_ingest_url, json=body, timeout=5)
            response.raise_for_status()
            data = response.json()
            device_id = UUID(data["device_id"])
            tenant_id = UUID(data["tenant_id"])
            return DeviceContext(device_id=device_id, tenant_id=tenant_id)
        except requests.RequestException as exc:
            logger.error("failed to notify API for %s: %s", device_id, exc)
        except (KeyError, ValueError) as exc:
            logger.error("invalid API response for %s: %s", device_id, exc)
        return None

    def _write_influx(self, context: DeviceContext, timestamp: datetime, metrics: Dict[str, float]) -> None:
        points = []
        for key, value in metrics.items():
            point = (
                Point("telemetry")
                .tag("tenant_id", str(context.tenant_id))
                .tag("device_id", str(context.device_id))
                .tag("metric", key)
                .field("value", value)
                .time(timestamp, WritePrecision.NS)
            )
            points.append(point)
        try:
            self.write_api.write(bucket=self.influx_bucket, org=self.influx_org, record=points)
            logger.info("wrote %s metrics for device %s", len(points), context.device_id)
        except Exception as exc:  # noqa: BLE001
            logger.error("failed to write to Influx: %s", exc)


def main() -> None:
    service = IngestService()
    service.start()


if __name__ == "__main__":
    main()
