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

# optional: enable telemetry publishing by setting SIMULATOR_ENABLED=true in .env

# verify environment wiring
docker compose exec frontend sh -lc 'echo $VITE_API_BASE_URL'
grep -R "localhost:4000" -n frontend
```

## Phase 2 – Device telemetry MVP

- **Device registry** – Add devices from the Devices page (FastAPI `/devices`), which auto-generates secure `device_key` tokens and MQTT base topic `iot/{device_id}`.
- **Ingest service** – `services/ingest` subscribes to `iot/+/telemetry`, validates payloads, persists metrics to InfluxDB bucket `iot_telemetry`, updates `devices.last_seen_at`, and pushes real-time data into the API's SSE cache via `POST /internal/telemetry_ingest`.
- **Simulator** – `services/simulator` (optional profile) fetches devices via the API (or uses `SIMULATOR_DEVICE_ID`) and publishes demo telemetry every few seconds.
- **Realtime UI** – `/devices` lists hardware with last-seen timestamps; `/devices/:id` opens a live dashboard that streams metrics over `GET /stream/devices/{id}` (SSE) and renders gauges for `temp_c`, `humidity_pct`, `voltage_v`, `current_a`, and `power_w`.

### MQTT contract

- Telemetry topic: `iot/{device_id}/telemetry`
- Command topic reserved: `iot/{device_id}/command`
- Payload example:

```json
{
	"ts": "2026-02-01T12:00:00Z",
	"metrics": {
		"temp_c": 26.1,
		"humidity_pct": 44.3,
		"voltage_v": 228.9,
		"current_a": 1.8,
		"power_w": 415.0
	}
}
```

`ts` is optional; the ingest service will use server receive time when omitted.

### API surface

- `GET /devices`, `POST /devices`, `GET /devices/{id}` – CRUD for hardware (Bearer auth).
- `GET /devices/{id}/telemetry/last` – cached latest metrics for dashboards.
- `GET /stream/devices/{id}` – SSE channel (add `?token=<JWT>` when using EventSource in browsers).
- `POST /internal/telemetry_ingest` – ingest hook (Docker network only) invoked by the ingest service to update caches + `last_seen_at`.

### Services & env hints

- **Internal API base**: `INTERNAL_API_URL=http://api:4000` (used by ingest + simulator containers when running via Docker Compose).
- **Simulator token**: Set `SIMULATOR_API_TOKEN` to a valid Bearer token (e.g., grab from browser devtools after logging in) so the simulator can list `/devices`. Alternatively set `SIMULATOR_DEVICE_ID` (comma separated UUIDs) to target specific devices when publishing.
- **Manual telemetry**: publish from your host once Mosquitto is running:

```bash
mosquitto_pub -h localhost -p 1883 -t iot/<device_id>/telemetry \
	-m '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","metrics":{"temp_c":25.5,"humidity_pct":45,"voltage_v":229,"current_a":1.8,"power_w":410}}'
```

### Phase 3 telemetry proof (02 Feb 2026)

The following curl flows were executed against the running stack to demonstrate end-to-end telemetry ingestion and querying:

1. **Register + login** (captures JWT for subsequent calls):

		```bash
		curl -s -X POST http://localhost:4000/auth/register \
			-H 'Content-Type: application/json' \
			-d '{"email":"phasec@example.com","password":"Password123!","name":"Phase C"}'
		```

2. **Create device** (uses the bearer token from step 1):

		```bash
		curl -s -X POST http://localhost:4000/devices \
			-H 'Authorization: Bearer <token>' \
			-H 'Content-Type: application/json' \
			-d '{"name":"Phase C Sensor","location":"QA Lab"}'
		```

		Response excerpt:

		```json
		{
			"id": "6ba464e9-e5cc-4dac-8492-297d746c7a5f",
			"telemetry_topic": "iot/6ba464e9-e5cc-4dac-8492-297d746c7a5f/telemetry",
			"device_key": "JnoS5E5NlQx-NiDuWjSiM-qfa2FLIHiH"
		}
		```

3. **Simulator publishing** – `.env` pinned `SIMULATOR_DEVICE_ID=6ba464e9-e5cc-4dac-8492-297d746c7a5f` with `SIMULATOR_ENABLED=true`, then `docker compose up -d simulator`. Logs show:

		```text
		[simulator] published telemetry to iot/6ba464e9-e5cc-4dac-8492-297d746c7a5f/telemetry
		```

4. **Latest telemetry**:

		```bash
		curl -s -H 'Authorization: Bearer <token>' \
			http://localhost:4000/devices/6ba464e9-e5cc-4dac-8492-297d746c7a5f/telemetry/last
		```

		Sample payload:

		```json
		{
			"timestamp": "2026-02-01T18:34:55.560976Z",
			"metrics": {
				"temp_c": {"unit": "°C", "value": 28.29},
				"humidity_pct": {"unit": "%", "value": 57.09},
				"voltage_v": {"unit": "V", "value": 220.39},
				"current_a": {"unit": "A", "value": 0.6},
				"power_w": {"unit": "W", "value": 284.0}
			}
		}
		```

5. **Range query**:

		```bash
		curl -s -H 'Authorization: Bearer <token>' \
			"http://localhost:4000/devices/6ba464e9-e5cc-4dac-8492-297d746c7a5f/telemetry/range?metric=temp_c&interval=1m"
		```

		Response excerpt:

		```json
		{
			"interval": "1m",
			"points": [
				{"timestamp": "2026-02-01T18:35:00Z", "value": 25.61},
				{"timestamp": "2026-02-01T18:35:08.606165Z", "value": 23.18}
			]
		}
		```

### Phase 4 alert proof (02 Feb 2026)

1. **Tighten thresholds** so the simulator's random telemetry breaches immediately:

		```bash
		curl -s -X PUT http://localhost:4000/devices/6ba464e9-e5cc-4dac-8492-297d746c7a5f/thresholds \
			-H 'Authorization: Bearer <token>' \
			-H 'Content-Type: application/json' \
			-d '{"items":[{"metric_key":"temp_c","min_value":18,"max_value":24,"hysteresis":1,"enabled":true},{"metric_key":"voltage_v","min_value":215,"max_value":225,"hysteresis":1,"enabled":true}]}'
		```

2. **Worker evaluation** posts to `/internal/alerts/evaluations` (see `docker compose logs worker`) and new alerts appear via `GET /alerts`:

		```json
		{
			"items": [
				{
					"id": "ba0e8035-0b8f-4be1-8cf1-1a6a103618bb",
					"metric_key": "temp_c",
					"status": "open",
					"message": "Temperature 23.14°C above max 24.00°C"
				},
				{
					"id": "65102a6d-3d8b-4b82-b78d-f44ce6018546",
					"metric_key": "voltage_v",
					"status": "open",
					"message": "Voltage 225.06V above max 225.00V"
				}
			],
			"summary": { "open": 2, "acked": 0, "resolved": 0, "critical_active": 2 }
		}
		```

3. **Acknowledge** an alert, demonstrating `/alerts/{id}/ack`:

		```bash
		curl -s -X POST \
			http://localhost:4000/alerts/ba0e8035-0b8f-4be1-8cf1-1a6a103618bb/ack \
			-H 'Authorization: Bearer <token>'
		```

		Response excerpt:

		```json
		{
			"status": "acked",
			"acked_at": "2026-02-01T18:49:00.565896Z"
		}
		```

4. **Resolve** via `/alerts/{id}/resolve` (manual close or once metrics return inside the hysteresis window):

		```bash
		curl -s -X POST \
			http://localhost:4000/alerts/ba0e8035-0b8f-4be1-8cf1-1a6a103618bb/resolve \
			-H 'Authorization: Bearer <token>'
		```

		Returned payload shows `"status": "resolved"` and preserves the recorded `acked_at` timestamp.

5. Subsequent worker runs keep evaluating telemetry; additional alerts reopen automatically if the simulator continues sending out-of-band data, and the new frontend `/alerts` view streams the live queue, metrics summary, and action buttons.

## Telemetry Contract (Phase 1)

- MQTT Topic: `iot/{device_id}/telemetry`
- Payload schema defined in `api/app/schemas/telemetry.py`
- InfluxDB bucket: `iot_telemetry`, measurement: `telemetry`, tags: `tenant_id`, `device_id`, `metric`, field: `value`
