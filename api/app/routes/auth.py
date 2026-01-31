import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core import security
from ..db.models import User
from ..db.session import get_db
from ..schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
    AuthResponse,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.decode_access_token(token)
    except Exception as exc:  # noqa: BLE001 - convert to HTTP error
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


def _user_public(user: User) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=request.email.strip().lower(),
        full_name=request.full_name.strip() if request.full_name else None,
        password_hash=security.hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = security.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": _user_public(user)}


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not security.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = security.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": _user_public(user)}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core import security
from ..db.models import User
from ..db.session import get_db
from ..schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

from ..schemas.auth import AuthResponse, UserPublic


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
    except Exception as exc:  # noqa: BLE001 - broad to convert to HTTP error
        raise credentials_exception from exc

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError as exc:  # invalid uuid
        raise credentials_exception from exc

    user = db.get(User, user_uuid)
    if not user:
        raise credentials_exception

    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    from ..core import security
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email.strip().lower(),
        full_name=payload.full_name.strip() if payload.full_name else None,
def _user_public(user: User) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name)


        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id))
    token = security.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": _user_public(user)}


    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
