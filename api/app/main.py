from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.health import router as health_router
from .settings import get_settings

settings = get_settings()

app = FastAPI(title="IoT Portal API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.cors_allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
