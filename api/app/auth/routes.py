from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import User, UserIdentity
from .jwt import create_access_token, get_current_user
from .oauth import oauth

router = APIRouter()


def frontend_redirect(token: str) -> RedirectResponse:
    base = str(settings.frontend_base_url).rstrip("/")
    return RedirectResponse(url=f"{base}/auth/callback?token={token}")


@router.get("/auth/google")
async def auth_google(request: Request):
    return await oauth.google.authorize_redirect(request, str(settings.google_callback_url))


@router.get("/auth/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    profile_response = await oauth.google.get("userinfo", token=token)
    profile_response.raise_for_status()
    profile = profile_response.json()

    user = upsert_user_identity(
        db=db,
        provider="google",
        provider_user_id=profile.get("sub") or profile.get("id"),
        email=profile.get("email"),
        display_name=profile.get("name") or profile.get("email") or "Google User",
        avatar_url=profile.get("picture"),
    )
    jwt_token = create_access_token(user_id=user.id, provider="google")
    return frontend_redirect(jwt_token)


@router.get("/auth/facebook")
async def auth_facebook(request: Request):
    return await oauth.facebook.authorize_redirect(request, str(settings.facebook_callback_url))


@router.get("/auth/facebook/callback")
async def auth_facebook_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.facebook.authorize_access_token(request)
    profile_response = await oauth.facebook.get(
        "me?fields=id,name,email,picture.type(large)", token=token
    )
    profile_response.raise_for_status()
    profile = profile_response.json()

    picture_data = (
        profile.get("picture", {})
        .get("data", {})
        if isinstance(profile.get("picture"), dict)
        else {}
    )

    user = upsert_user_identity(
        db=db,
        provider="facebook",
        provider_user_id=profile.get("id"),
        email=profile.get("email"),  # May be missing, that's OK
        display_name=profile.get("name") or profile.get("email") or "Facebook User",
        avatar_url=picture_data.get("url"),
    )
    jwt_token = create_access_token(user_id=user.id, provider="facebook")
    return frontend_redirect(jwt_token)


@router.get("/me")
async def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
    }


def upsert_user_identity(
    *,
    db: Session,
    provider: str,
    provider_user_id: str | None,
    email: str | None,
    display_name: str,
    avatar_url: str | None,
) -> User:
    if provider_user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing provider user id")

    identity = (
        db.query(UserIdentity)
        .filter(UserIdentity.provider == provider, UserIdentity.provider_user_id == provider_user_id)
        .first()
    )

    if identity:
        user = identity.user
        user.display_name = display_name
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)
        return user

    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        user = User(email=email, display_name=display_name, avatar_url=avatar_url)
        db.add(user)
        db.flush()  # get primary key before identity insert

    new_identity = UserIdentity(user_id=user.id, provider=provider, provider_user_id=provider_user_id)
    db.add(new_identity)
    db.commit()
    db.refresh(user)
    return user
