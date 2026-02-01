"""Simple telemetry simulator that publishes MQTT payloads for demo devices."""
from __future__ import annotations

import asyncio
import json
import os
import random
from datetime import datetime, timezone
from typing import List
from uuid import UUID

import paho.mqtt.client as mqtt
import requests

from pydantic import BaseModel


class DeviceRecord(BaseModel):
    id: UUID


class DeviceListResponse(BaseModel):
    items: List[DeviceRecord]


class Simulator:
    def __init__(self) -> None:
        self.enabled = os.getenv("SIMULATOR_ENABLED", "false").lower() in {"1", "true", "yes"}
        self.interval = float(os.getenv("SIMULATOR_PUBLISH_INTERVAL_SEC", "2"))
        self.topic_prefix = os.getenv("MQTT_TOPIC_PREFIX", "iot").strip("/") or "iot"
        self.mqtt_host = os.getenv("MQTT_HOST", "mosquitto")
        self.mqtt_port = int(os.getenv("MQTT_PORT", "1883"))
        api_base = os.getenv("INTERNAL_API_URL", "http://api:4000").rstrip("/")
        self.api_devices_url = f"{api_base}/devices"
        self.api_token = os.getenv("SIMULATOR_API_TOKEN")
        self.device_ids = self._load_devices()
        self.client = mqtt.Client(client_id="iot-simulator")

    def _load_devices(self) -> List[UUID]:
        explicit = os.getenv("SIMULATOR_DEVICE_ID") or os.getenv("SIMULATOR_MQTT_DEVICE_IDS")
        if explicit:
            values = [value.strip() for value in explicit.split(",") if value.strip()]
            return [UUID(value) for value in values]
        if not self.api_token:
            print("[simulator] No SIMULATOR_DEVICE_ID or SIMULATOR_API_TOKEN provided; simulator idle")
            return []
        try:
            response = requests.get(
                self.api_devices_url,
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=5,
            )
            response.raise_for_status()
            payload = DeviceListResponse.model_validate(response.json())
            max_devices = int(os.getenv("SIMULATOR_DEVICE_COUNT", "1"))
            return [item.id for item in payload.items[:max_devices]]
        except Exception as exc:  # noqa: BLE001
            print(f"[simulator] failed to fetch devices: {exc}")
            return []

    async def run(self) -> None:
        if not self.enabled:
            print("[simulator] disabled (set SIMULATOR_ENABLED=true to enable)")
            while True:
                await asyncio.sleep(self.interval)

        if not self.device_ids:
            print("[simulator] no devices available; waiting…")

        self.client.connect(self.mqtt_host, self.mqtt_port, keepalive=60)
        self.client.loop_start()
        try:
            while True:
                await self.publish_once()
                await asyncio.sleep(self.interval)
        finally:
            self.client.loop_stop()
            self.client.disconnect()

    async def publish_once(self) -> None:
        if not self.device_ids:
            return
        now = datetime.now(timezone.utc).isoformat()
        for device_id in self.device_ids:
            payload = {
                "ts": now,
                "metrics": {
                    "temp_c": round(random.uniform(20.0, 32.0), 2),
                    "humidity_pct": round(random.uniform(35.0, 65.0), 2),
                    "voltage_v": round(random.uniform(218.0, 231.0), 2),
                    "current_a": round(random.uniform(0.5, 5.0), 2),
                    "power_w": round(random.uniform(50.0, 450.0), 2),
                },
            }
            topic = f"{self.topic_prefix}/{device_id}/telemetry"
            self.client.publish(topic, json.dumps(payload), qos=0, retain=False)
            print(f"[simulator] published telemetry to {topic}")


async def main() -> None:
    simulator = Simulator()
    await simulator.run()


if __name__ == "__main__":
    asyncio.run(main())
