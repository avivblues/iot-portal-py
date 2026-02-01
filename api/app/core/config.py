from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    api_title: str = "IoT Portal API"
    api_version: str = "0.2.0"

    database_url: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expires_min: int = 1440

    api_allowed_origins: str = "http://localhost:5173"

    influx_url: str = "http://influxdb:8086"
    influx_token: str = "dev-token"
    influx_org: str = "iot-org"
    influx_bucket: str = "iot_telemetry"

    mqtt_host: str = "mosquitto"
    mqtt_port: int = 1883
    mqtt_username: str | None = None
    mqtt_password: str | None = None
    mqtt_topic_prefix: str = "iot"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip().rstrip("/") for origin in self.api_allowed_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
