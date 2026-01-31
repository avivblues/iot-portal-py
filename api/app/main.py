from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.routes import router as auth_router
from .config import settings

app = FastAPI(title="IoT Portal Auth API")

allowed_origins = {str(settings.frontend_base_url), "http://localhost:5173"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"ok": True}


app.include_router(auth_router)
