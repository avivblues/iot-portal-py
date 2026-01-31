from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    api_host: str = "0.0.0.0"
    api_port: int = 4000
    cors_allowed_origins: List[AnyHttpUrl] = [
        "http://localhost:5173",
        "http://103.150.191.221:5173",
    ]

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value):  # type: ignore[override]
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache()
def get_settings() -> Settings:
    return Settings()
