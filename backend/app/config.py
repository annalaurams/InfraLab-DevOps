import os

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILES_BY_ENV = {
    "local": ".env",
    "dev": ".env.dev",
    "prod": ".env.prod",
}

app_env = os.getenv("APP_ENV", "local").lower()
default_env_file = ENV_FILES_BY_ENV.get(app_env, ".env")
selected_env_file = os.getenv("ENV_FILE", default_env_file)

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(
        env_file=selected_env_file,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()