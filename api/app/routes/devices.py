from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, selectinload

from ..core.errors import api_error
from ..core.telemetry import METRIC_DEFINITIONS
from ..db.models import Device, DeviceMetric, DeviceThreshold, User
from ..db.session import get_db
from ..routes.auth import get_current_user
from ..schemas.device import (
    DeviceCreateRequest,
    DeviceListResponse,
    DeviceMetricSchema,
    DeviceResponse,
    TelemetryLastResponse,
    ThresholdConfig,
    ThresholdResponse,
)

router = APIRouter(prefix="/devices", tags=["devices"])


def _serialize_device(device: Device) -> DeviceResponse:
    metric_payload = [DeviceMetricSchema.model_validate(metric) for metric in device.metrics]
    return DeviceResponse(
        id=device.id,
        tenant_id=device.tenant_id,
        name=device.name,
        location=device.location,
        mqtt_topic_base=device.mqtt_topic_base,
        device_key=device.device_key,
        status=device.status.value if hasattr(device.status, "value") else device.status,
        created_at=device.created_at,
        updated_at=device.updated_at,
        metrics=metric_payload,
    )


def _get_device(db: Session, tenant_id: UUID, device_id: UUID) -> Device:
    device = (
        db.query(Device)
        .options(selectinload(Device.metrics), selectinload(Device.thresholds))
        .filter(Device.id == device_id, Device.tenant_id == tenant_id)
        .first()
    )
    if not device:
        raise api_error("Device not found", status_code=status.HTTP_404_NOT_FOUND)
    return device


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    payload: DeviceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Device).filter(Device.device_key == payload.device_key).first()
    if existing:
        raise api_error("Device key already registered", status_code=status.HTTP_409_CONFLICT)

    device = Device(
        tenant_id=current_user.tenant_id,
        name=payload.name,
        location=payload.location,
        mqtt_topic_base=payload.mqtt_topic_base,
        device_key=payload.device_key,
    )

    for definition in METRIC_DEFINITIONS.values():
        device.metrics.append(
            DeviceMetric(metric_key=definition.key.value, unit=definition.unit, enabled=True)
        )

    db.add(device)
    db.commit()
    db.refresh(device)
    return _serialize_device(device)


@router.get("", response_model=DeviceListResponse)
def list_devices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    devices = (
        db.query(Device)
        .options(selectinload(Device.metrics))
        .filter(Device.tenant_id == current_user.tenant_id)
        .order_by(Device.created_at.desc())
        .all()
    )
    return DeviceListResponse(items=[_serialize_device(device) for device in devices])


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = _get_device(db, current_user.tenant_id, device_id)
    return _serialize_device(device)


@router.get("/{device_id}/thresholds", response_model=List[ThresholdResponse])
def get_thresholds(device_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _get_device(db, current_user.tenant_id, device_id)
    thresholds = (
        db.query(DeviceThreshold)
        .filter(DeviceThreshold.device_id == device_id)
        .order_by(DeviceThreshold.metric_key)
        .all()
    )
    return [ThresholdResponse.model_validate(threshold) for threshold in thresholds]


@router.put("/{device_id}/thresholds", response_model=List[ThresholdResponse])
def put_thresholds(
    device_id: UUID,
    payload: List[ThresholdConfig],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = _get_device(db, current_user.tenant_id, device_id)

    valid_keys = {definition.key.value for definition in METRIC_DEFINITIONS.values()}
    existing = {
        threshold.metric_key: threshold
        for threshold in db.query(DeviceThreshold).filter(DeviceThreshold.device_id == device.id).all()
    }

    for item in payload:
        metric_key = item.metric_key.value if hasattr(item.metric_key, "value") else item.metric_key
        if metric_key not in valid_keys:
            raise api_error("Unsupported metric key", details={"metric_key": metric_key})

        threshold = existing.get(metric_key)
        if threshold:
            threshold.min_value = item.min_value
            threshold.max_value = item.max_value
            threshold.hysteresis = item.hysteresis
            threshold.enabled = item.enabled
        else:
            threshold = DeviceThreshold(
                device_id=device.id,
                metric_key=metric_key,
                min_value=item.min_value,
                max_value=item.max_value,
                hysteresis=item.hysteresis,
                enabled=item.enabled,
            )
            db.add(threshold)
            existing[metric_key] = threshold

    db.commit()

    refreshed = (
        db.query(DeviceThreshold)
        .filter(DeviceThreshold.device_id == device.id)
        .order_by(DeviceThreshold.metric_key)
        .all()
    )
    return [ThresholdResponse.model_validate(threshold) for threshold in refreshed]


@router.get("/{device_id}/telemetry/last", response_model=TelemetryLastResponse)
def telemetry_last(device_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _get_device(db, current_user.tenant_id, device_id)
    # Phase 2 placeholder: actual values will arrive in Phase 3 when ingest service writes to InfluxDB.
    return TelemetryLastResponse.empty(device_id)
