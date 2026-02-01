from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from typing import Dict, List
from uuid import UUID

from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError

from ..core.config import get_settings
from ..core.telemetry import METRIC_DEFINITIONS
from ..schemas.telemetry import (
    TelemetryLastMetric,
    TelemetryLastResponse,
    TelemetryRangePoint,
    TelemetryRangeResponse,
)


class TelemetryStore:
    """Thin wrapper for Flux queries against InfluxDB."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = InfluxDBClient(url=settings.influx_url, token=settings.influx_token, org=settings.influx_org)
        self._query_api = self._client.query_api()
        self._bucket = settings.influx_bucket

    def _empty_metric_payload(self) -> Dict[str, TelemetryLastMetric]:
        payload: Dict[str, TelemetryLastMetric] = {}
        for definition in METRIC_DEFINITIONS.values():
            payload[definition.key.value] = TelemetryLastMetric(unit=definition.unit, value=None)
        return payload

    def build_empty_last(self, device_id: UUID) -> TelemetryLastResponse:
        return TelemetryLastResponse(device_id=device_id, timestamp=None, metrics=self._empty_metric_payload())

    def fetch_last(self, tenant_id: UUID, device_id: UUID) -> TelemetryLastResponse | None:
        flux = f'''
from(bucket: "{self._bucket}")
  |> range(start: -30d)
  |> filter(fn: (r) => r._measurement == "telemetry")
  |> filter(fn: (r) => r.tenant_id == "{tenant_id}" and r.device_id == "{device_id}")
  |> keep(columns: ["_time", "_value", "metric"])
  |> group(columns: ["metric"])
  |> last()
'''
        try:
            tables = self._query_api.query(flux)
        except InfluxDBError as exc:  # noqa: BLE001
            raise RuntimeError(f"Telemetry query failed: {exc}") from exc

        latest_at: datetime | None = None
        metrics = self._empty_metric_payload()
        if not tables:
            return None

        for table in tables:
            for record in table.records:
                metric_key = record.values.get("metric")
                value = record.get_value()
                timestamp = record.get_time()
                if metric_key in metrics:
                    metrics[metric_key] = TelemetryLastMetric(unit=metrics[metric_key].unit, value=value)
                    if latest_at is None or (timestamp and timestamp > latest_at):
                        latest_at = timestamp

        if latest_at is None:
            return None
        return TelemetryLastResponse(device_id=device_id, timestamp=latest_at, metrics=metrics)

    def fetch_range(
        self,
        tenant_id: UUID,
        device_id: UUID,
        metric: str,
        start: datetime,
        stop: datetime,
        interval: str,
    ) -> TelemetryRangeResponse:
        start_iso = start.astimezone(timezone.utc).isoformat()
        stop_iso = stop.astimezone(timezone.utc).isoformat()
        flux = f'''
from(bucket: "{self._bucket}")
  |> range(start: time(v: "{start_iso}"), stop: time(v: "{stop_iso}"))
  |> filter(fn: (r) => r._measurement == "telemetry")
  |> filter(fn: (r) => r.tenant_id == "{tenant_id}" and r.device_id == "{device_id}" and r.metric == "{metric}")
  |> aggregateWindow(every: {interval}, fn: mean, createEmpty: false)
  |> keep(columns: ["_time", "_value"])
'''
        try:
            tables = self._query_api.query(flux)
        except InfluxDBError as exc:  # noqa: BLE001
            raise RuntimeError(f"Telemetry range query failed: {exc}") from exc

        points: List[TelemetryRangePoint] = []
        for table in tables:
            for record in table.records:
                timestamp = record.get_time()
                value = record.get_value()
                if timestamp is None:
                    continue
                points.append(TelemetryRangePoint(timestamp=timestamp, value=value))

        return TelemetryRangeResponse(device_id=device_id, metric=metric, interval=interval, points=points)

    def fetch_metric_series(
        self,
        tenant_id: UUID,
        metric: str,
        start: datetime,
        stop: datetime,
        interval: str,
        device_id: UUID | None = None,
    ) -> list[TelemetryRangePoint]:
        start_iso = start.astimezone(timezone.utc).isoformat()
        stop_iso = stop.astimezone(timezone.utc).isoformat()
        device_filter = ""
        if device_id:
            device_filter = f' and r.device_id == "{device_id}"'
        flux = f'''
from(bucket: "{self._bucket}")
  |> range(start: time(v: "{start_iso}"), stop: time(v: "{stop_iso}"))
  |> filter(fn: (r) => r._measurement == "telemetry")
  |> filter(fn: (r) => r.tenant_id == "{tenant_id}"{device_filter} and r.metric == "{metric}")
  |> aggregateWindow(every: {interval}, fn: mean, createEmpty: false)
  |> keep(columns: ["_time", "_value"])
'''
        try:
            tables = self._query_api.query(flux)
        except InfluxDBError as exc:  # noqa: BLE001
            raise RuntimeError(f"Telemetry series query failed: {exc}") from exc

        points: List[TelemetryRangePoint] = []
        for table in tables:
            for record in table.records:
                timestamp = record.get_time()
                value = record.get_value()
                if timestamp is None:
                    continue
                points.append(TelemetryRangePoint(timestamp=timestamp, value=value))
        return points


@lru_cache()
def get_telemetry_store() -> TelemetryStore:
    return TelemetryStore()
