from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status


def api_error(message: str, *, status_code: int = status.HTTP_400_BAD_REQUEST, details: Any | None = None) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"message": message, "details": details})
