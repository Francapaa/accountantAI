from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AccountantAI Backend"
    app_env: str = "development"
    debug: bool = True

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    gemini_api_key: str = ""

    whatsapp_verify_token: str = ""
    whatsapp_access_token: str = ""
    whatsapp_app_secret: str = ""

    # Single platform WABA (Model A): one Meta App + WABA shared by all
    # accountants. `whatsapp_phone_number_id` is a default; accountants link
    # their own numbers in `whatsapp_connections`.
    whatsapp_business_account_id: str = ""
    whatsapp_phone_number_id: str = ""

    cors_origins: list[str] = ["http://localhost:3000"]

    # Ingestion / embedding
    embedding_model: str = "gemini-embedding-2"
    embedding_dimensions: int = 1536
    embedding_batch_size: int = 16
    user_agent: str = "AccountantAI-Ingestion/0.1 (+contact)"
    request_timeout_seconds: float = 60.0
    ingest_rate_limit_delay: float = 2.0
    robots_check_enabled: bool = True
    headless: bool = True


settings = Settings()
