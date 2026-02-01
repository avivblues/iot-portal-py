"""Threshold evaluation worker.

Watches telemetry in InfluxDB, compares against device thresholds, and posts alert updates
back to the API via internal endpoints.
"""
from __future__ import annotations

import logging
import os
import signal
import time
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple
from uuid import UUID

import httpx
from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError
from pydantic import BaseModel, ValidationError

logging.basicConfig(level=logging.INFO, format="[worker] %(message)s")
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class MetricDefinition:
    label: str
    unit: str


METRIC_DEFINITIONS: Dict[str, MetricDefinition] = {
    "temp_c": MetricDefinition("Temperature", "°C"),
    "humidity_pct": MetricDefinition("Humidity", "%"),
    "voltage_v": MetricDefinition("Voltage", "V"),
    "current_a": MetricDefinition("Current", "A"),
    "power_w": MetricDefinition("Power", "W"),
}


class ThresholdConfig(BaseModel):
    metric_key: str
    min_value: float | None = None
    max_value: float | None = None
    hysteresis: float | None = None
    enabled: bool = True


class DeviceSnapshot(BaseModel):
    device_id: UUID
    tenant_id: UUID
    name: str
    thresholds: List[ThresholdConfig]


class ActiveAlert(BaseModel):
    device_id: UUID
    metric_key: str


class MonitoringSnapshot(BaseModel):
    devices: List[DeviceSnapshot]
    active_alerts: List[ActiveAlert] = []


class AlertEvaluation(BaseModel):
    tenant_id: UUID
    device_id: UUID
    metric_key: str
    value: float | None = None
    threshold_min: float | None = None
    threshold_max: float | None = None
    message: str
    severity: str = "critical"
    breached: bool


class AlertEvaluationBatch(BaseModel):
    items: List[AlertEvaluation]


class WorkerService:
    def __init__(self) -> None:
        self.interval = int(os.getenv("WORKER_INTERVAL_SEC", "10"))
        api_base = os.getenv("INTERNAL_API_URL", "http://api:4000").rstrip("/")
        self.snapshot_url = f"{api_base}/internal/monitoring/snapshot"
        self.evaluations_url = f"{api_base}/internal/alerts/evaluations"

        self.http = httpx.Client(timeout=10.0)

        influx_url = os.getenv("INFLUX_URL", "http://influxdb:8086")
        influx_org = os.getenv("INFLUX_ORG", "iot-org")
        influx_token = os.getenv("INFLUX_TOKEN", "dev-token")
        self.influx_bucket = os.getenv("INFLUX_BUCKET", "iot_telemetry")
        self.influx = InfluxDBClient(url=influx_url, token=influx_token, org=influx_org)
        self.query_api = self.influx.query_api()

        self.active_alerts: Dict[Tuple[UUID, str], None] = {}
        self.alert_directions: Dict[Tuple[UUID, str], Optional[str]] = {}
        self._stopping = False

    def run(self) -> None:
        logger.info("alert worker online (interval=%ss)", self.interval)
        signal.signal(signal.SIGTERM, self.stop)
        signal.signal(signal.SIGINT, self.stop)
        while not self._stopping:
            start = time.perf_counter()
            try:
                self._run_cycle()
            except Exception:  # noqa: BLE001
                logger.exception("evaluation cycle failed")
            elapsed = time.perf_counter() - start
            sleep_for = max(self.interval - elapsed, 1)
            time.sleep(sleep_for)
        self.shutdown()

    def stop(self, *_: object) -> None:
        if self._stopping:
            return
        logger.info("stopping alert worker")
        self._stopping = True

    def shutdown(self) -> None:
        logger.info("shutting down resources")
        try:
            self.http.close()
        finally:
            self.influx.close()

    # Core cycle -------------------------------------------------------
    def _run_cycle(self) -> None:
        snapshot = self._fetch_snapshot()
        if snapshot is None or not snapshot.devices:
            return

        self._seed_active_alerts(snapshot.active_alerts)

        batch: List[AlertEvaluation] = []
        for device in snapshot.devices:
            metrics = self._fetch_latest_metrics(device)
            if not metrics:
                continue
            batch.extend(self._evaluate_device(device, metrics))

        if batch:
            self._send_evaluations(batch)
            self._update_active_cache(batch)

    def _fetch_snapshot(self) -> MonitoringSnapshot | None:
        try:
            response = self.http.get(self.snapshot_url)
            response.raise_for_status()
            return MonitoringSnapshot.model_validate(response.json())
        except (httpx.HTTPError, ValidationError) as exc:
            logger.error("failed to fetch monitoring snapshot: %s", exc)
            return None

    def _seed_active_alerts(self, alerts: Iterable[ActiveAlert]) -> None:
        self.active_alerts = {}
        self.alert_directions = {}
        for alert in alerts:
            key = (alert.device_id, alert.metric_key)
            self.active_alerts[key] = None
            self.alert_directions[key] = None

    def _fetch_latest_metrics(self, device: DeviceSnapshot) -> Dict[str, float]:
        flux = f'''
from(bucket: "{self.influx_bucket}")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "telemetry")
  |> filter(fn: (r) => r.tenant_id == "{device.tenant_id}" and r.device_id == "{device.device_id}")
  |> keep(columns: ["_time", "_value", "metric"])
  |> group(columns: ["metric"])
  |> last()
'''
        try:
            tables = self.query_api.query(flux)
        except InfluxDBError as exc:  # noqa: BLE001
            logger.error("failed to query telemetry for %s: %s", device.device_id, exc)
            return {}

        metrics: Dict[str, float] = {}
        for table in tables:
            for record in table.records:
                key = record.values.get("metric")
                value = record.get_value()
                if key:
                    metrics[key] = value
        return metrics

    def _evaluate_device(self, device: DeviceSnapshot, metrics: Dict[str, float]) -> List[AlertEvaluation]:
        evaluations: List[AlertEvaluation] = []
        for threshold in device.thresholds:
            if not threshold.enabled:
                continue
            if threshold.min_value is None and threshold.max_value is None:
                continue

            value = metrics.get(threshold.metric_key)
            key = (device.device_id, threshold.metric_key)
            was_breached = key in self.active_alerts
            previous_direction = self.alert_directions.get(key)
            breached_state, direction = self._determine_state(value, threshold, was_breached, previous_direction)
            if breached_state is None:
                continue

            message = self._build_message(threshold.metric_key, value, threshold, breached_state, direction)
            evaluations.append(
                AlertEvaluation(
                    tenant_id=device.tenant_id,
                    device_id=device.device_id,
                    metric_key=threshold.metric_key,
                    value=value,
                    threshold_min=threshold.min_value,
                    threshold_max=threshold.max_value,
                    message=message,
                    breached=breached_state,
                )
            )

            if breached_state:
                self.alert_directions[key] = direction
            else:
                self.alert_directions.pop(key, None)

        return evaluations

    def _determine_state(
        self,
        value: float | None,
        threshold: ThresholdConfig,
        was_breached: bool,
        previous_direction: Optional[str],
    ) -> Tuple[Optional[bool], Optional[str]]:
        if value is None:
            return (True, previous_direction) if was_breached else (None, None)

        hysteresis = threshold.hysteresis or 0.0
        upper = threshold.max_value
        lower = threshold.min_value

        if was_breached:
            upper_clear = True
            lower_clear = True
            if upper is not None:
                release_high = upper - hysteresis if hysteresis else upper
                upper_clear = value <= release_high
            if lower is not None:
                release_low = lower + hysteresis if hysteresis else lower
                lower_clear = value >= release_low
            if upper_clear and lower_clear:
                return (False, None)
            direction = previous_direction
            if upper is not None and value >= (upper - hysteresis):
                direction = "high"
            elif lower is not None and value <= (lower + hysteresis):
                direction = "low"
            return (True, direction or previous_direction or "high")

        if upper is not None and value > upper:
            return (True, "high")
        if lower is not None and value < lower:
            return (True, "low")
        return (False, None)

    def _build_message(
        self,
        metric_key: str,
        value: float | None,
        threshold: ThresholdConfig,
        breached: bool,
        direction: Optional[str],
    ) -> str:
        definition = METRIC_DEFINITIONS.get(metric_key)
        label = definition.label if definition else metric_key
        unit = definition.unit if definition else ""
        pretty_value = f"{value:.2f}{unit}" if value is not None else f"n/a{unit}".rstrip()

        if breached:
            if direction == "high" and threshold.max_value is not None:
                return f"{label} {pretty_value} above max {threshold.max_value:.2f}{unit}".rstrip()
            if direction == "low" and threshold.min_value is not None:
                return f"{label} {pretty_value} below min {threshold.min_value:.2f}{unit}".rstrip()
            return f"{label} {pretty_value} outside configured range"

        target_min = f"{threshold.min_value:.2f}{unit}" if threshold.min_value is not None else None
        target_max = f"{threshold.max_value:.2f}{unit}" if threshold.max_value is not None else None
        if target_min and target_max:
            window = f"{target_min} – {target_max}"
        else:
            window = target_min or target_max or "safe band"
        return f"{label} {pretty_value} within {window}"

    def _send_evaluations(self, evaluations: List[AlertEvaluation]) -> None:
        batch = AlertEvaluationBatch(items=evaluations)
        try:
            response = self.http.post(self.evaluations_url, json=batch.model_dump(mode="json"))
            response.raise_for_status()
            logger.info("submitted %s evaluations", len(evaluations))
        except httpx.HTTPError as exc:
            logger.error("failed to submit evaluations: %s", exc)

    def _update_active_cache(self, evaluations: Iterable[AlertEvaluation]) -> None:
        for evaluation in evaluations:
            key = (evaluation.device_id, evaluation.metric_key)
            if evaluation.breached:
                self.active_alerts[key] = None
            else:
                self.active_alerts.pop(key, None)
                self.alert_directions.pop(key, None)


def main() -> None:
    service = WorkerService()
    service.run()


if __name__ == "__main__":
    main()
