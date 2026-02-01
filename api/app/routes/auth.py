import uuid
from typing import Optional

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core import security
from ..core.errors import api_error
from ..core.tenancy import DEFAULT_TENANT_ID
from ..db.models import User
from ..db.session import get_db
from ..schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()


def _user_public(user: User) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name)


def _issue_token(user: User) -> AuthResponse:
    token = security.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": _user_public(user)}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, request.email)
    if existing:
        raise api_error("Email already registered", status_code=status.HTTP_409_CONFLICT)

    user = User(
        tenant_id=DEFAULT_TENANT_ID,
        email=request.email.strip().lower(),
        full_name=request.full_name.strip() if request.full_name else None,
        password_hash=security.hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_token(user)


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not security.verify_password(request.password, user.password_hash):
        raise api_error("Invalid email or password", status_code=status.HTTP_401_UNAUTHORIZED)
    return _issue_token(user)


def resolve_user_from_token(db: Session, token: str) -> User:
    credentials_exception = api_error(
        "Invalid or expired token",
        status_code=status.HTTP_401_UNAUTHORIZED,
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.decode_access_token(token)
    except Exception as exc:  # noqa: BLE001
        raise credentials_exception from exc

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError as exc:
        raise credentials_exception from exc

    user = db.get(User, user_uuid)
    if not user:
        raise credentials_exception
    return user


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    return resolve_user_from_token(db, token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

