from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from ..core.errors import api_error
from ..db.models import Alert, AlertSeverity, AlertStatus, User
from ..db.session import get_db
from ..routes.auth import get_current_user
from ..schemas.alert import AlertListResponse, AlertResponse, AlertSummary

router = APIRouter(prefix="/alerts", tags=["alerts"])


def _serialize_alert(alert: Alert) -> AlertResponse:
    device = alert.device
    return AlertResponse(
        id=alert.id,
        device_id=alert.device_id,
        device_name=device.name if device else "Unknown device",
        device_location=device.location if device else None,
        metric_key=alert.metric_key,
        status=alert.status,
        severity=alert.severity,
        message=alert.message,
        value=alert.value,
        threshold_min=alert.threshold_min,
        threshold_max=alert.threshold_max,
        created_at=alert.created_at,
        acked_at=alert.acked_at,
        resolved_at=alert.resolved_at,
    )


def _build_summary(db: Session, tenant_id: UUID) -> AlertSummary:
    counts = {status: 0 for status in AlertStatus}
    rows = (
        db.query(Alert.status, func.count(Alert.id))
        .filter(Alert.tenant_id == tenant_id)
        .group_by(Alert.status)
        .all()
    )
    for status_value, total in rows:
        counts[status_value] = total

    critical_active = (
        db.query(func.count(Alert.id))
        .filter(
            Alert.tenant_id == tenant_id,
            Alert.severity == AlertSeverity.critical,
            Alert.status.in_([AlertStatus.open, AlertStatus.acked]),
        )
        .scalar()
        or 0
    )

    return AlertSummary(
        open=counts[AlertStatus.open],
        acked=counts[AlertStatus.acked],
        resolved=counts[AlertStatus.resolved],
        critical_active=critical_active,
    )


def _get_alert(alert_id: UUID, current_user: User, db: Session) -> Alert:
    alert = (
        db.query(Alert)
        .options(selectinload(Alert.device))
        .filter(Alert.id == alert_id, Alert.tenant_id == current_user.tenant_id)
        .first()
    )
    if not alert:
        raise api_error("Alert not found", status_code=status.HTTP_404_NOT_FOUND)
    return alert


@router.get("", response_model=AlertListResponse)
def list_alerts(
    status_filter: AlertStatus | None = Query(default=None, alias="status"),
    device_id: UUID | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Alert)
        .options(selectinload(Alert.device))
        .filter(Alert.tenant_id == current_user.tenant_id)
        .order_by(Alert.created_at.desc())
    )

    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if device_id:
        query = query.filter(Alert.device_id == device_id)

    alerts = query.offset(offset).limit(limit).all()
    summary = _build_summary(db, current_user.tenant_id)
    return AlertListResponse(items=[_serialize_alert(alert) for alert in alerts], summary=summary)


@router.post("/{alert_id}/ack", response_model=AlertResponse)
def acknowledge_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = _get_alert(alert_id, current_user, db)
    if alert.status == AlertStatus.resolved:
        raise api_error("Alert already resolved", status_code=status.HTTP_400_BAD_REQUEST)

    alert.status = AlertStatus.acked
    alert.acked_at = datetime.now(timezone.utc)
    db.commit()
    db.expunge(alert)
    return _serialize_alert(_get_alert(alert_id, current_user, db))


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = _get_alert(alert_id, current_user, db)
    if alert.status == AlertStatus.resolved:
        return _serialize_alert(alert)

    alert.status = AlertStatus.resolved
    alert.resolved_at = datetime.now(timezone.utc)
    if alert.acked_at is None:
        alert.acked_at = alert.resolved_at
    db.commit()
    db.expunge(alert)
    return _serialize_alert(_get_alert(alert_id, current_user, db))
