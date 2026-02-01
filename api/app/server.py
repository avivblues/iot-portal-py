import os
import subprocess
import time
from urllib.parse import urlparse

import psycopg2
import uvicorn


def _wait_for_database(url: str) -> None:
    parsed = urlparse(url)
    host = parsed.hostname or "postgres"
    port = parsed.port or 5432
    user = parsed.username or "postgres"
    password = parsed.password or ""
    dbname = (parsed.path or "/postgres").lstrip("/")

    for attempt in range(60):
        try:
            conn = psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)
            conn.close()
            return
        except psycopg2.OperationalError:
            time.sleep(1)
    raise RuntimeError("database never became available")


def _run_alembic_upgrade() -> None:
    subprocess.run(["alembic", "upgrade", "head"], check=True)


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    print("[api] waiting for database...")
    _wait_for_database(database_url)

    print("[api] running migrations...")
    _run_alembic_upgrade()

    port_value = int(os.getenv("PORT", "4000"))
    print(f"[api] starting uvicorn on port {port_value}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port_value)


if __name__ == "__main__":
    main()
