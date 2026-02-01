# IoT Portal Boilerplate

Clean R&D starter featuring FastAPI and React (Vite + TypeScript).

## Structure

- `api/` – FastAPI application (auth, future devices/telemetry APIs)
- `frontend/` – Vite React shell (login/register/dashboard)
- `services/ingest` – MQTT → Influx consumer (placeholder until Phase 3)
- `services/worker` – Threshold evaluator (placeholder until Phase 4)
- `services/simulator` – Optional telemetry publisher (disabled by default)
- `docker-compose.yml` – Dev orchestration for API (4000), frontend (5173), Mosquitto (1883), InfluxDB (8086) + background services

## Quick Start

```bash
cp .env.example .env
# adjust variables as needed

# build and run full stack
docker compose up -d --build

# verify
curl http://localhost:4000/health

# optional: run telemetry simulator profile once ingest logic is implemented
# docker compose --profile sim up -d simulator

# verify environment wiring
docker compose exec frontend sh -lc 'echo $VITE_API_BASE_URL'
grep -R "localhost:4000" -n frontend
```

## Telemetry Contract (Phase 1)

- MQTT Topic: `iot/{device_id}/telemetry`
- Payload schema defined in `api/app/schemas/telemetry.py`
- InfluxDB bucket: `iot_telemetry`, measurement: `telemetry`, tags: `tenant_id`, `device_id`, `metric`, field: `value`

## Deployment Script

`./deploy.sh` performs `git pull`, rebuilds via Docker Compose, and curls the health endpoint.
