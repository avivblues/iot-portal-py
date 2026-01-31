import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .db.session import Base, engine
from .routes.auth import router as auth_router
from .routes.health import router as health_router

settings = get_settings()


def parse_origins(raw: str | None) -> list[str]:
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


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("[db] ensured tables are created")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    print(f"[request] {request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f}ms)")
    return response


app.include_router(health_router)
app.include_router(auth_router)
