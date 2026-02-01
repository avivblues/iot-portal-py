from __future__ import annotations

from datetime import datetime
from typing import Annotated, Dict, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

MetricValue = Annotated[float, Field(strict=True)]


class TelemetryMetrics(BaseModel):
    temp_c: MetricValue | None = Field(default=None, description="Temperature (°C)")
    humidity_pct: MetricValue | None = Field(default=None, description="Humidity (%)")
    voltage_v: MetricValue | None = Field(default=None, description="Voltage (V)")
    current_a: MetricValue | None = Field(default=None, description="Current (A)")
    power_w: MetricValue | None = Field(default=None, description="Power (W)")

    model_config = {
        "extra": "forbid",
    }

    def as_dict(self) -> Dict[str, float]:
        return {k: v for k, v in self.model_dump(exclude_none=True).items()}


class TelemetryPayload(BaseModel):
    ts: datetime | None = Field(default=None, description="ISO8601 timestamp supplied by device")
    metrics: TelemetryMetrics

    model_config = {
        "extra": "forbid",
    }


class InternalTelemetryIngestRequest(TelemetryPayload):
    device_id: UUID


class TelemetryLastMetric(BaseModel):
    unit: str
    value: float | None


class TelemetryLastResponse(BaseModel):
    device_id: UUID
    timestamp: datetime | None
    metrics: Dict[str, TelemetryLastMetric]


class TelemetryRangePoint(BaseModel):
    timestamp: datetime
    value: float | None


class TelemetryRangeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    device_id: UUID
    metric: str
    interval: str
    points: List[TelemetryRangePoint]


class TelemetryIngestResponse(BaseModel):
    device_id: UUID
    tenant_id: UUID