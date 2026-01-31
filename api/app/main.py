from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.routes import router as auth_router

app = FastAPI(title="IoT Portal Auth API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://103.150.191.221:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"ok": True}


app.include_router(auth_router)
