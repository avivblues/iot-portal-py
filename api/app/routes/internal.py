from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, selectinload

from ..core.errors import api_error
from ..db.models import Alert, AlertStatus, Device
from ..db.session import get_db
from ..schemas.internal import (
    InternalActiveAlert,
    InternalAlertEvaluationRequest,
    InternalAlertEvaluationResponse,
    InternalDeviceSnapshot,
    InternalMonitoringSnapshotResponse,
    InternalThresholdItem,
)
from ..schemas.telemetry import InternalTelemetryIngestRequest, TelemetryIngestResponse
from ..services.telemetry_hub import TelemetrySample, telemetry_hub

router = APIRouter(prefix="/internal", tags=["internal"])


def _normalize_timestamp(value: datetime | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


@router.post("/telemetry_ingest", response_model=TelemetryIngestResponse, include_in_schema=False)
def telemetry_ingest(payload: InternalTelemetryIngestRequest, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == payload.device_id).first()
    if not device:
        raise api_error("Device not found", status_code=status.HTTP_404_NOT_FOUND)

    timestamp = _normalize_timestamp(payload.ts)
    device.last_seen_at = timestamp
    db.commit()
    db.refresh(device)

    telemetry_hub.update(TelemetrySample(device_id=device.id, timestamp=timestamp, metrics=payload.metrics.as_dict()))

    return TelemetryIngestResponse(device_id=device.id, tenant_id=device.tenant_id)


@router.get("/monitoring/snapshot", response_model=InternalMonitoringSnapshotResponse, include_in_schema=False)
def monitoring_snapshot(db: Session = Depends(get_db)):
    devices = (
        db.query(Device)
        .options(selectinload(Device.thresholds))
        .all()
    )
    device_payloads: list[InternalDeviceSnapshot] = []
    for device in devices:
        thresholds = [
            InternalThresholdItem(
                metric_key=threshold.metric_key,
                min_value=threshold.min_value,
                max_value=threshold.max_value,
                hysteresis=threshold.hysteresis,
                enabled=threshold.enabled,
            )
            for threshold in device.thresholds
        ]
        if not thresholds:
            continue
        device_payloads.append(
            InternalDeviceSnapshot(
                device_id=device.id,
                tenant_id=device.tenant_id,
                name=device.name,
                thresholds=thresholds,
            )
        )

    active_alerts = (
        db.query(Alert)
        .filter(Alert.status.in_([AlertStatus.open, AlertStatus.acked]))
        .with_entities(Alert.device_id, Alert.metric_key, Alert.status)
        .all()
    )
    alert_payloads = [
        InternalActiveAlert(device_id=item.device_id, metric_key=item.metric_key, status=item.status)
        for item in active_alerts
    ]
    return InternalMonitoringSnapshotResponse(devices=device_payloads, active_alerts=alert_payloads)


@router.post("/alerts/evaluations", response_model=InternalAlertEvaluationResponse, include_in_schema=False)
def ingest_alert_evaluations(
    payload: InternalAlertEvaluationRequest,
    db: Session = Depends(get_db),
):
    created = 0
    updated = 0
    resolved = 0
    now = datetime.now(timezone.utc)

    for item in payload.items:
        alert = (
            db.query(Alert)
            .filter(
                Alert.device_id == item.device_id,
                Alert.tenant_id == item.tenant_id,
                Alert.metric_key == item.metric_key,
                Alert.status.in_([AlertStatus.open, AlertStatus.acked]),
            )
            .first()
        )

        if item.breached:
            if alert:
                alert.value = item.value
                alert.threshold_min = item.threshold_min
                alert.threshold_max = item.threshold_max
                alert.message = item.message
                alert.severity = item.severity
                updated += 1
            else:
                alert = Alert(
                    tenant_id=item.tenant_id,
                    device_id=item.device_id,
                    metric_key=item.metric_key,
                    message=item.message,
                    value=item.value,
                    threshold_min=item.threshold_min,
                    threshold_max=item.threshold_max,
                    severity=item.severity,
                    status=AlertStatus.open,
                )
                db.add(alert)
                created += 1
        else:
            if alert:
                alert.status = AlertStatus.resolved
                alert.resolved_at = now
                alert.value = item.value
                alert.threshold_min = item.threshold_min
                alert.threshold_max = item.threshold_max
                alert.message = item.message
                resolved += 1

    db.commit()
    return InternalAlertEvaluationResponse(created=created, updated=updated, resolved=resolved)
