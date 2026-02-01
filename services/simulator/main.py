"""MQTT telemetry simulator placeholder.

Will be upgraded in later phases to publish structured telemetry payloads.
"""
from __future__ import annotations

import asyncio
import os


async def main() -> None:
    interval = int(os.getenv("SIMULATOR_PUBLISH_INTERVAL_SEC", "2"))
    enabled = os.getenv("SIMULATOR_ENABLED", "false").lower() in {"1", "true", "yes"}

    if not enabled:
        print("[simulator] disabled (set SIMULATOR_ENABLED=true to run). Sleeping…")
    else:
        print("[simulator] placeholder running; Phase 3 will publish MQTT messages")

    while True:
        await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(main())
