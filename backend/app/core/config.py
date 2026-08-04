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

    JWT_SECRET_KEY: str = "dev_secret_key_change_me_in_production_1234567890"
    ALGORITHM: str = "HS256"

    GROQ_API_KEY: str
    LLM_MODEL: str = "llama-3.3-70b-versatile"

    HUGGINGFACEHUB_API_TOKEN: str
    EMBEDDING_MODEL: str = "mixedbread-ai/mxbai-embed-large-v1"



settings = Settings()
