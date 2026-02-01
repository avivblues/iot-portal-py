from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status


def error_payload(message: str, details: Any | None = None) -> dict[str, Any | None]:
    return {"error": {"message": message, "details": details}}


def api_error(
    message: str,
    *,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    details: Any | None = None,
    headers: dict[str, str] | None = None,
) -> HTTPException:
    return HTTPException(status_code=status_code, detail=error_payload(message, details), headers=headers)
