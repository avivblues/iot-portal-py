from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db.models import Alert, AlertStatus, Device, DeviceStatus, User
from ..db.session import get_db
from ..routes.auth import get_current_user
from ..schemas.dashboard import (
    DashboardAlertPoint,
    DashboardFleetHealth,
    DashboardStatusSlice,
    DashboardSummaryResponse,
    DashboardTelemetryPoint,
)
from ..services.telemetry_store import TelemetryStore, get_telemetry_store

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
telemetry_store: TelemetryStore = get_telemetry_store()

ONLINE_WINDOW_MINUTES = 5
WARNING_WINDOW_MINUTES = 30
TELEMETRY_WINDOW_HOURS = 1
TELEMETRY_INTERVAL = "5m"


def _count_devices(db: Session, tenant_id) -> Dict[str, int]:
    rows = (
        db.query(Device.status, func.count(Device.id))
        .filter(Device.tenant_id == tenant_id)
        .group_by(Device.status)
        .all()
    )
    counts = {status.value: 0 for status in DeviceStatus}
    for status, total in rows:
        counts[status.value] = total
    return counts


def _count_online_devices(devices: List[Device]) -> int:
    threshold = datetime.now(timezone.utc) - timedelta(minutes=ONLINE_WINDOW_MINUTES)
    return sum(1 for device in devices if device.last_seen_at and device.last_seen_at >= threshold)


def _build_status_slices(counts: Dict[str, int]) -> List[DashboardStatusSlice]:
    order = ["active", "maintenance", "inactive"]
    labels = {
        "active": "Active",
        "maintenance": "Maintenance",
        "inactive": "Inactive",
    }
    return [DashboardStatusSlice(label=labels[key], value=counts.get(key, 0)) for key in order]


def _build_fleet_health(devices: List[Device]) -> DashboardFleetHealth:
    now = datetime.now(timezone.utc)
    healthy_cutoff = now - timedelta(minutes=ONLINE_WINDOW_MINUTES)
    warning_cutoff = now - timedelta(minutes=WARNING_WINDOW_MINUTES)
    healthy = 0
    warning = 0
    critical = 0

    for device in devices:
        last_seen = device.last_seen_at
        if last_seen and last_seen >= healthy_cutoff:
            healthy += 1
        elif last_seen and last_seen >= warning_cutoff:
            warning += 1
        else:
            critical += 1
    return DashboardFleetHealth(healthy=healthy, warning=warning, critical=critical)


def _build_alerts_trend(db: Session, tenant_id) -> List[DashboardAlertPoint]:
    now = datetime.now(timezone.utc)
    start_day = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    rows = (
        db.query(func.date_trunc("day", Alert.created_at).label("day"), func.count(Alert.id))
        .filter(Alert.tenant_id == tenant_id, Alert.created_at >= start_day)
        .group_by("day")
        .order_by("day")
        .all()
    )
    counts = {row.day.date(): row[1] for row in rows}
    points: List[DashboardAlertPoint] = []
    for index in range(7):
        day = start_day + timedelta(days=index)
        label = day.strftime("%a")
        count = counts.get(day.date(), 0)
        points.append(DashboardAlertPoint(label=label, count=count))
    return points


def _count_active_alerts(db: Session, tenant_id) -> int:
    return (
        db.query(func.count(Alert.id))
        .filter(Alert.tenant_id == tenant_id, Alert.status.in_([AlertStatus.open, AlertStatus.acked]))
        .scalar()
        or 0
    )


def _count_resolved_today(db: Session, tenant_id) -> int:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.count(Alert.id))
        .filter(Alert.tenant_id == tenant_id, Alert.resolved_at.isnot(None), Alert.resolved_at >= start_of_day)
        .scalar()
        or 0
    )


def _build_telemetry_series(tenant_id) -> List[DashboardTelemetryPoint]:
    now = datetime.now(timezone.utc)
    start = now - timedelta(hours=TELEMETRY_WINDOW_HOURS)
    try:
        power_points = telemetry_store.fetch_metric_series(tenant_id, "power_w", start, now, TELEMETRY_INTERVAL)
        current_points = telemetry_store.fetch_metric_series(tenant_id, "current_a", start, now, TELEMETRY_INTERVAL)
    except RuntimeError:
        return []

    combined: Dict[datetime, DashboardTelemetryPoint] = {}
    for point in power_points:
        combined[point.timestamp] = DashboardTelemetryPoint(timestamp=point.timestamp, power_w=point.value, current_a=None)
    for point in current_points:
        existing = combined.get(point.timestamp)
        if existing:
            existing.current_a = point.value
        else:
            combined[point.timestamp] = DashboardTelemetryPoint(timestamp=point.timestamp, power_w=None, current_a=point.value)
    return sorted(combined.values(), key=lambda item: item.timestamp)


@router.get("/summary", response_model=DashboardSummaryResponse)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenant_id = current_user.tenant_id
    devices = (
        db.query(Device)
        .filter(Device.tenant_id == tenant_id)
        .all()
    )
    total_devices = len(devices)
    status_counts = _count_devices(db, tenant_id)
    online_devices = _count_online_devices(devices)
    active_alerts = _count_active_alerts(db, tenant_id)
    resolved_today = _count_resolved_today(db, tenant_id)
    alerts_trend = _build_alerts_trend(db, tenant_id)
    telemetry_series = _build_telemetry_series(tenant_id)

    return DashboardSummaryResponse(
        total_devices=total_devices,
        online_devices=online_devices,
        offline_devices=max(total_devices - online_devices, 0),
        active_alerts=active_alerts,
        resolved_today=resolved_today,
        alerts_trend=alerts_trend,
        telemetry_series=telemetry_series,
        device_status_split=_build_status_slices(status_counts),
        fleet_health=_build_fleet_health(devices),
    )
