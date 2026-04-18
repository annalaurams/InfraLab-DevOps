
# distribui as variáveis do .env

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()