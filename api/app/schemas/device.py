from __future__ import annotations

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from ..core.telemetry import METRIC_DEFINITIONS, MetricKey


class DeviceMetricSchema(BaseModel):
    metric_key: str
    unit: str
    enabled: bool = True

    model_config = ConfigDict(from_attributes=True)


class DeviceBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    mqtt_topic_base: str = Field(min_length=3, max_length=255)
    device_key: str = Field(min_length=8, max_length=255)


class DeviceCreateRequest(DeviceBase):
    metrics: List[str] | None = None  # reserved for future extension


class DeviceResponse(DeviceBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    metrics: list[DeviceMetricSchema]


class DeviceListResponse(BaseModel):
    items: list[DeviceResponse]


class ThresholdConfig(BaseModel):
    metric_key: MetricKey
    min_value: float | None = None
    max_value: float | None = None
    hysteresis: float | None = None
    enabled: bool = True


class ThresholdResponse(ThresholdConfig):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class TelemetryLastMetric(BaseModel):
    unit: str
    value: float | None = None


class TelemetryLastResponse(BaseModel):
    device_id: UUID
    timestamp: datetime | None
    metrics: dict[str, TelemetryLastMetric]

    @staticmethod
    def empty(device_id: UUID) -> "TelemetryLastResponse":
        return TelemetryLastResponse(
            device_id=device_id,
            timestamp=None,
            metrics={definition.key.value: TelemetryLastMetric(unit=definition.unit, value=None) for definition in METRIC_DEFINITIONS.values()},
        )