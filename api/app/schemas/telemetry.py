from __future__ import annotations

from datetime import datetime
from typing import Annotated, Dict

from pydantic import BaseModel, Field, NonNegativeFloat

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
*** End Patch