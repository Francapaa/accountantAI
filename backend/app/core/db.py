from supabase import Client, create_client

from app.core.config import settings


def assert_env() -> tuple[str, str]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "Supabase is not configured. Add SUPABASE_URL and "
            "SUPABASE_SERVICE_ROLE_KEY to the backend .env file."
        )
    return settings.supabase_url, settings.supabase_service_role_key


_supabase: Client | None = None


def get_supabase_client() -> Client:
    """Server-side Supabase client (service role).

    Used for privileged operations (normativa ingestion, RAG, cron).
    Never expose the service role key to the frontend.
    """
    global _supabase
    if _supabase is None:
        url, key = assert_env()
        _supabase = create_client(url, key)
    return _supabase
