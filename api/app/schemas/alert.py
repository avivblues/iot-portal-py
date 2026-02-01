from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from ..db.models import AlertSeverity, AlertStatus


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    device_name: str
    device_location: str | None = None
    metric_key: str
    status: AlertStatus
    severity: AlertSeverity
    message: str
    value: float | None = None
    threshold_min: float | None = None
    threshold_max: float | None = None
    created_at: datetime
    acked_at: datetime | None = None
    resolved_at: datetime | None = None


class AlertSummary(BaseModel):
    open: int
    acked: int
    resolved: int
    critical_active: int


class AlertListResponse(BaseModel):
    items: list[AlertResponse]
    summary: AlertSummary
