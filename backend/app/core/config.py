from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RecallFlow API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = (
        "postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
