import logging
import os
import time
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import get_settings
from .core.errors import error_payload
from .routes.alerts import router as alerts_router
from .routes.auth import router as auth_router
from .routes.dashboard import router as dashboard_router
from .routes.devices import router as devices_router
from .routes.health import router as health_router
from .routes.internal import router as internal_router

settings = get_settings()
logger = logging.getLogger("iot_portal.api")


def parse_origins(raw: Optional[str]) -> list[str]:
    if not raw:
        return []
    return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]


app = FastAPI(title=settings.api_title, version=settings.api_version)

allowed_origins = parse_origins(os.getenv("API_ALLOWED_ORIGINS", settings.api_allowed_origins))
print(f"[cors] API_ALLOWED_ORIGINS parsed = {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _normalize_error(detail):
    if isinstance(detail, dict) and "error" in detail:
        return detail
    if isinstance(detail, dict):
        return error_payload(detail.get("message", "Request failed"), detail.get("details"))
    if detail:
        return error_payload(str(detail))
    return error_payload("Request failed")


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):  # noqa: D401
    """Return normalized JSON errors for explicit HTTP exceptions."""

    payload = _normalize_error(exc.detail)
    return JSONResponse(status_code=exc.status_code, content=payload, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(request: Request, exc: RequestValidationError):  # noqa: D401
    """Wrap FastAPI validation errors to the required contract."""

    payload = error_payload("Invalid request", details=exc.errors())
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload)


@app.exception_handler(Exception)
async def handle_unexpected_exception(request: Request, exc: Exception):  # noqa: D401,BLE001
    """Catch-all to be sure clients never see internal traces."""

    logger.exception("Unhandled exception", extra={"path": request.url.path})
    payload = error_payload("Internal server error")
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    print(f"[request] {request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f}ms)")
    return response


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(devices_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(internal_router)
