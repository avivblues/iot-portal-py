import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import User

ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)


def create_access_token(*, user_id: uuid.UUID, provider: str) -> str:
    expires_delta = timedelta(seconds=settings.jwt_expires_in)
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": str(user_id),
        "provider": provider,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    payload = decode_access_token(credentials.credentials)
    user = db.get(User, uuid.UUID(payload["user_id"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
