"""Telemetry ingest placeholder service.

Phase 1 keeps the container alive and logs environment wiring. The real MQTT -> Influx
pipeline will be implemented in Phase 3.
"""
from __future__ import annotations

import asyncio
import os
from datetime import datetime

import pydantic


class TelemetryContract(pydantic.BaseModel):
    ts: datetime
    metrics: dict[str, float]


async def main() -> None:
    poll_interval = int(os.getenv("INGEST_POLL_INTERVAL_SEC", "2"))
    mqtt_host = os.getenv("MQTT_HOST", "mosquitto")
    influx_url = os.getenv("INFLUX_URL", "http://influxdb:8086")

    print("[ingest] starting placeholder loop")
    print(f"[ingest] MQTT host: {mqtt_host}")
    print(f"[ingest] Influx URL: {influx_url}")

    while True:
        print("[ingest] awaiting Phase 3 implementation…")
        await asyncio.sleep(poll_interval)


if __name__ == "__main__":
    asyncio.run(main())
