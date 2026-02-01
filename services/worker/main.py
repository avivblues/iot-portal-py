"""Alert evaluation worker placeholder.

Phase 1 keeps the container alive so docker-compose health can be verified. Real logic
arrives in Phase 4.
"""
from __future__ import annotations

import asyncio
import os


async def main() -> None:
    interval = int(os.getenv("WORKER_INTERVAL_SEC", "10"))
    print("[worker] starting placeholder loop")
    while True:
        print("[worker] waiting for Phase 4 implementation…")
        await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(main())
