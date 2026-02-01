from __future__ import annotations

import asyncio
import threading
from dataclasses import dataclass
from datetime import datetime
from typing import Dict
from uuid import UUID

from ..core.telemetry import METRIC_DEFINITIONS
from ..schemas.telemetry import TelemetryLastMetric, TelemetryLastResponse


@dataclass(frozen=True)
class TelemetrySample:
    device_id: UUID
    timestamp: datetime | None
    metrics: Dict[str, float | None]


class TelemetryHub:
    """In-memory cache that fans out telemetry updates to SSE subscribers."""

    def __init__(self) -> None:
        self._last: Dict[UUID, TelemetryLastResponse] = {}
        self._subscribers: Dict[UUID, set[asyncio.Queue[TelemetryLastResponse]]] = {}
        self._lock = threading.Lock()

    def _build_payload(self, sample: TelemetrySample) -> TelemetryLastResponse:
        metric_payload: Dict[str, TelemetryLastMetric] = {}
        for definition in METRIC_DEFINITIONS.values():
            metric_payload[definition.key.value] = TelemetryLastMetric(
                unit=definition.unit,
                value=sample.metrics.get(definition.key.value),
            )
        return TelemetryLastResponse(device_id=sample.device_id, timestamp=sample.timestamp, metrics=metric_payload)

    def update(self, sample: TelemetrySample) -> TelemetryLastResponse:
        payload = self._build_payload(sample)
        with self._lock:
            self._last[sample.device_id] = payload
            subscribers = list(self._subscribers.get(sample.device_id, set()))
        for queue in subscribers:
            self._offer(queue, payload)
        return payload

    def _offer(self, queue: asyncio.Queue[TelemetryLastResponse], payload: TelemetryLastResponse) -> None:
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            try:
                queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            queue.put_nowait(payload)

    def get_last(self, device_id: UUID) -> TelemetryLastResponse | None:
        with self._lock:
            cached = self._last.get(device_id)
        return cached

    def subscribe(self, device_id: UUID) -> asyncio.Queue[TelemetryLastResponse]:
        queue: asyncio.Queue[TelemetryLastResponse] = asyncio.Queue(maxsize=1)
        with self._lock:
            if device_id not in self._subscribers:
                self._subscribers[device_id] = set()
            self._subscribers[device_id].add(queue)
        return queue

    def unsubscribe(self, device_id: UUID, queue: asyncio.Queue[TelemetryLastResponse]) -> None:
        with self._lock:
            subscribers = self._subscribers.get(device_id)
            if not subscribers:
                return
            subscribers.discard(queue)
            if not subscribers:
                self._subscribers.pop(device_id, None)


telemetry_hub = TelemetryHub()
