from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Auth toggle - set to false when ready to use real Supabase JWT auth
    auth_disabled: bool = True

    # FastAPI
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # AI / LLM
    grok_api_key: str = ""

    # Chatbot (Mistral)
    mistral_api_key: str = ""
    mistral_model: str = "mistral-small-latest"

    # Chatbot / RAG
    chroma_path: str = "./data/chroma"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
