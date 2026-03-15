from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None
_service_client: Client | None = None


def get_supabase() -> Client:
    """Return a Supabase client using the anon key (respects RLS)."""
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _client


def get_supabase_admin() -> Client:
    """Return a Supabase client using the service-role key (bypasses RLS)."""
    global _service_client
    if _service_client is None:
        _service_client = create_client(
            settings.supabase_url, settings.supabase_service_role_key
        )
    return _service_client
