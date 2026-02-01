from __future__ import annotations

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ThresholdBase(BaseModel):
    metric_key: str = Field(min_length=1, max_length=50)
    min_value: float | None = Field(default=None)
    max_value: float | None = Field(default=None)
    hysteresis: float | None = Field(default=None)
    enabled: bool = True


class ThresholdUpdateItem(ThresholdBase):
    pass


class ThresholdBulkUpdateRequest(BaseModel):
    items: List[ThresholdUpdateItem] = Field(min_length=1)


class ThresholdResponse(ThresholdBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    created_at: datetime
    updated_at: datetime


class ThresholdListResponse(BaseModel):
    items: List[ThresholdResponse]
