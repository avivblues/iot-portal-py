import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.health import router as health_router


def parse_origins(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="IoT Portal API", version="0.1.0")

origins = parse_origins(os.getenv("API_ALLOWED_ORIGINS"))
print(f"[cors] API_ALLOWED_ORIGINS parsed = {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
