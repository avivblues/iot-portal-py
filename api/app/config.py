import os
from functools import lru_cache
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pydantic import AnyHttpUrl, BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    api_base_url: AnyHttpUrl = Field(..., alias="API_BASE_URL")
    frontend_base_url: AnyHttpUrl = Field(..., alias="FRONTEND_BASE_URL")

    pg_host: str = Field(..., alias="PG_HOST")
    pg_db: str = Field(..., alias="PG_DB")
    pg_user: str = Field(..., alias="PG_USER")
    pg_pass: str = Field(..., alias="PG_PASS")

    google_client_id: str = Field(..., alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(..., alias="GOOGLE_CLIENT_SECRET")
    google_callback_url: AnyHttpUrl = Field(..., alias="GOOGLE_CALLBACK_URL")

    facebook_client_id: str = Field(..., alias="FACEBOOK_CLIENT_ID")
    facebook_client_secret: str = Field(..., alias="FACEBOOK_CLIENT_SECRET")
    facebook_callback_url: AnyHttpUrl = Field(..., alias="FACEBOOK_CALLBACK_URL")

    jwt_secret: str = Field(..., alias="JWT_SECRET")
    jwt_expires_in: int = Field(3600, alias="JWT_EXPIRES_IN")

    class Config:
        populate_by_name = True

    @property
    def database_url(self) -> str:
        password = quote_plus(self.pg_pass)
        return (
            f"postgresql+psycopg2://{self.pg_user}:{password}@{self.pg_host}/{self.pg_db}"
        )


@lru_cache()
def get_settings() -> Settings:
    # Using a cache prevents repeated environment parsing.
    return Settings(**os.environ)


settings = get_settings()
