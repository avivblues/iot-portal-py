#!/usr/bin/env sh
set -e

echo "[api] waiting for database..."
python <<'PY'
import os
import time
from urllib.parse import urlparse

import psycopg2

url = os.environ.get("DATABASE_URL")
if not url:
	raise SystemExit("DATABASE_URL is required")

parsed = urlparse(url)
host = parsed.hostname or "postgres"
port = parsed.port or 5432
user = parsed.username or "postgres"
password = parsed.password or ""
dbname = (parsed.path or "/postgres").lstrip("/")

for attempt in range(60):
	try:
		psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)
		break
	except psycopg2.OperationalError:
		time.sleep(1)
else:
	raise SystemExit("database never became available")
PY

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 4000
