from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from ..db.models import DeviceStatus


class DeviceBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class DeviceCreateRequest(DeviceBase):
    mqtt_topic_base: str | None = Field(default=None, max_length=255)
    device_key: str | None = Field(default=None, max_length=255)


class DeviceUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    status: DeviceStatus | None = None


class DeviceResponse(DeviceBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    mqtt_topic_base: str
    telemetry_topic: str
    device_key: str
    status: str
    last_seen_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class DeviceListResponse(BaseModel):
    items: list[DeviceResponse]