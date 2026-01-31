from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Service health probe")
async def read_health():
    return {"ok": True}
