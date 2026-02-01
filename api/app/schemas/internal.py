from __future__ import annotations

from typing import List
from uuid import UUID

from pydantic import BaseModel, Field

from ..db.models import AlertSeverity, AlertStatus


class InternalThresholdItem(BaseModel):
    metric_key: str
    min_value: float | None = None
    max_value: float | None = None
    hysteresis: float | None = None
    enabled: bool = True


class InternalDeviceSnapshot(BaseModel):
    device_id: UUID
    tenant_id: UUID
    name: str
    thresholds: List[InternalThresholdItem]


class InternalActiveAlert(BaseModel):
    device_id: UUID
    metric_key: str
    status: AlertStatus


class InternalMonitoringSnapshotResponse(BaseModel):
    devices: List[InternalDeviceSnapshot]
    active_alerts: List[InternalActiveAlert]


class InternalAlertEvaluationItem(BaseModel):
    tenant_id: UUID
    device_id: UUID
    metric_key: str
    value: float | None = None
    threshold_min: float | None = None
    threshold_max: float | None = None
    message: str
    severity: AlertSeverity = AlertSeverity.critical
    breached: bool


class InternalAlertEvaluationRequest(BaseModel):
    items: List[InternalAlertEvaluationItem] = Field(min_length=1)


class InternalAlertEvaluationResponse(BaseModel):
    created: int
    updated: int
    resolved: int
