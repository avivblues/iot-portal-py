# IoT Portal Boilerplate

Clean R&D starter featuring FastAPI, Postgres, and React (Vite + TypeScript).

## Structure

- `api/` – FastAPI application exposing `/health` plus `/auth/*`
- `frontend/` – React login/register/dashboard shell backed by the API
- `docker-compose.yml` – Dev orchestration for Postgres, API (4000), and frontend (5173)

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

## Manual verification workflow

From the project root:

```bash
# Clean start
docker compose down --remove-orphans
docker compose up -d --build

# API checks
curl -s http://localhost:4000/health

curl -s -X POST http://localhost:4000/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email":"test@demo.local","password":"Passw0rd!","full_name":"Test User"}'

TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"test@demo.local","password":"Passw0rd!"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')
curl -s http://localhost:4000/auth/me -H "Authorization: Bearer $TOKEN"

# Frontend
open http://localhost:5173/register
```

## Deployment Script

`./deploy.sh` performs `git pull`, rebuilds via Docker Compose, and curls the health endpoint.
