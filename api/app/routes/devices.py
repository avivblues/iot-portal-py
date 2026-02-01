from __future__ import annotations

import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.errors import api_error
from ..core.telemetry import metric_keys
from ..db.models import Device, DeviceStatus, DeviceThreshold, User
from ..db.session import get_db
from ..routes.auth import get_current_user
from ..schemas.device import DeviceCreateRequest, DeviceListResponse, DeviceResponse, DeviceUpdateRequest
from ..schemas.threshold import (
    ThresholdBulkUpdateRequest,
    ThresholdListResponse,
    ThresholdResponse,
)

router = APIRouter(prefix="/devices", tags=["devices"])
settings = get_settings()


def _generate_device_key() -> str:
    return secrets.token_urlsafe(24)


def _issue_device_key(db: Session) -> str:
    while True:
        candidate = _generate_device_key()
        exists = db.query(Device).filter(Device.device_key == candidate).first()
        if not exists:
            return candidate


def _serialize_device(device: Device) -> DeviceResponse:
    status_value = device.status.value if hasattr(device.status, "value") else device.status
    return DeviceResponse(
        id=device.id,
        tenant_id=device.tenant_id,
        name=device.name,
        location=device.location,
        mqtt_topic_base=device.mqtt_topic_base,
        device_key=device.device_key,
        status=status_value,
        last_seen_at=device.last_seen_at,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


def _get_device(db: Session, tenant_id: UUID, device_id: UUID) -> Device:
    device = (
        db.query(Device)
        .filter(Device.id == device_id, Device.tenant_id == tenant_id)
        .first()
    )
    if not device:
        raise api_error("Device not found", status_code=status.HTTP_404_NOT_FOUND)
    return device


def _serialize_threshold(threshold: DeviceThreshold) -> ThresholdResponse:
    return ThresholdResponse(
        id=threshold.id,
        device_id=threshold.device_id,
        metric_key=threshold.metric_key,
        min_value=threshold.min_value,
        max_value=threshold.max_value,
        hysteresis=threshold.hysteresis,
        enabled=threshold.enabled,
        created_at=threshold.created_at,
        updated_at=threshold.updated_at,
    )


def _metric_key_allowed(metric: str) -> bool:
    return metric in metric_keys()


def _ensure_thresholds(db: Session, device: Device) -> list[DeviceThreshold]:
    thresholds = (
        db.query(DeviceThreshold)
        .filter(DeviceThreshold.device_id == device.id)
        .all()
    )
    existing = {threshold.metric_key for threshold in thresholds}
    created = False
    for metric in metric_keys():
        if metric not in existing:
            threshold = DeviceThreshold(device_id=device.id, metric_key=metric, enabled=False)
            db.add(threshold)
            thresholds.append(threshold)
            created = True
    if created:
        db.flush()
    return thresholds


@router.get("", response_model=DeviceListResponse)
def list_devices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    devices = (
        db.query(Device)
        .filter(Device.tenant_id == current_user.tenant_id)
        .order_by(Device.created_at.desc())
        .all()
    )
    return DeviceListResponse(items=[_serialize_device(device) for device in devices])


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    payload: DeviceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device_key = payload.device_key or _issue_device_key(db)
    device = Device(
        tenant_id=current_user.tenant_id,
        name=payload.name,
        location=payload.location,
        device_key=device_key,
        mqtt_topic_base=payload.mqtt_topic_base or "",  # placeholder until id generated
    )

    db.add(device)
    db.flush()
    if not device.mqtt_topic_base:
        prefix = settings.mqtt_topic_prefix.strip("/") or "iot"
        device.mqtt_topic_base = f"{prefix}/{device.id}"

    _ensure_thresholds(db, device)

    db.commit()
    db.refresh(device)
    return _serialize_device(device)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    device = _get_device(db, current_user.tenant_id, device_id)
    return _serialize_device(device)


@router.patch("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: UUID,
    payload: DeviceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = _get_device(db, current_user.tenant_id, device_id)

    if payload.name is not None:
        device.name = payload.name
    if payload.location is not None:
        device.location = payload.location
    if payload.status is not None:
        if isinstance(payload.status, DeviceStatus):
            device.status = payload.status
        else:
            try:
                device.status = DeviceStatus(payload.status)
            except ValueError as exc:
                raise api_error("Invalid status", details={"status": payload.status}) from exc

    db.commit()
    db.refresh(device)
    return _serialize_device(device)


@router.get("/{device_id}/thresholds", response_model=ThresholdListResponse)
def list_thresholds(
    device_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = _get_device(db, current_user.tenant_id, device_id)
    thresholds = _ensure_thresholds(db, device)
    db.commit()
    ordered = sorted(thresholds, key=lambda t: t.metric_key)
    return ThresholdListResponse(items=[_serialize_threshold(item) for item in ordered])


@router.put("/{device_id}/thresholds", response_model=ThresholdListResponse)
def upsert_thresholds(
    device_id: UUID,
    payload: ThresholdBulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = _get_device(db, current_user.tenant_id, device_id)
    thresholds = {threshold.metric_key: threshold for threshold in _ensure_thresholds(db, device)}

    for item in payload.items:
        if not _metric_key_allowed(item.metric_key):
            raise api_error(
                "Unknown metric key",
                details={"metric_key": item.metric_key},
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        threshold = thresholds.get(item.metric_key)
        if not threshold:
            threshold = DeviceThreshold(device_id=device.id, metric_key=item.metric_key)
            db.add(threshold)
            thresholds[item.metric_key] = threshold
        threshold.min_value = item.min_value
        threshold.max_value = item.max_value
        threshold.hysteresis = item.hysteresis
        threshold.enabled = item.enabled

    db.commit()
    refreshed = sorted(thresholds.values(), key=lambda t: t.metric_key)
    return ThresholdListResponse(items=[_serialize_threshold(item) for item in refreshed])
