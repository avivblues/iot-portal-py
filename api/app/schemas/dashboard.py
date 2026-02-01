from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel


class DashboardTelemetryPoint(BaseModel):
    timestamp: datetime
    power_w: float | None = None
    current_a: float | None = None


class DashboardAlertPoint(BaseModel):
    label: str
    count: int


class DashboardStatusSlice(BaseModel):
    label: str
    value: int


class DashboardFleetHealth(BaseModel):
    healthy: int
    warning: int
    critical: int


class DashboardSummaryResponse(BaseModel):
    total_devices: int
    online_devices: int
    offline_devices: int
    active_alerts: int
    resolved_today: int
    alerts_trend: List[DashboardAlertPoint]
    telemetry_series: List[DashboardTelemetryPoint]
    device_status_split: List[DashboardStatusSlice]
    fleet_health: DashboardFleetHealth
