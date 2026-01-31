from authlib.integrations.starlette_client import OAuth

from ..config import settings

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="facebook",
    client_id=settings.facebook_client_id,
    client_secret=settings.facebook_client_secret,
    access_token_url="https://graph.facebook.com/v18.0/oauth/access_token",
    authorize_url="https://www.facebook.com/v18.0/dialog/oauth",
    api_base_url="https://graph.facebook.com/v18.0/",
    client_kwargs={"scope": "email public_profile"},
)
