# IoT Portal Boilerplate

Clean R&D starter featuring FastAPI and React (Vite + TypeScript).

## Structure

- `api/` – FastAPI application with `/health`
- `frontend/` – Vite React shell with a health-check UI
- `docker-compose.yml` – Dev orchestration for API (4000) and frontend (5173)

## Quick Start

```bash
cp .env.example .env
# adjust variables as needed

# build and run
docker compose up -d --build

# verify
curl http://localhost:4000/health

# verify environment wiring
docker compose exec frontend sh -lc 'echo $VITE_API_BASE_URL'
grep -R "localhost:4000" -n frontend
```

## Deployment Script

`./deploy.sh` performs `git pull`, rebuilds via Docker Compose, and curls the health endpoint.
