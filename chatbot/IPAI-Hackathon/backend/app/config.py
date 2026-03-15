from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # LLM Provider: "mistral" (free) or "gemini" (free) or "claude" (paid)
    llm_provider: str = "mistral"

    # Mistral (free — no credit card, just phone verification)
    mistral_api_key: str = ""
    mistral_model: str = "mistral-small-latest"

    # Gemini (free — no credit card needed)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Claude (paid — requires API billing)
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-20250514"

    # Database & storage
    database_url: str = "sqlite:///./data/tutor.db"
    chroma_path: str = "./data/chroma"
    upload_path: str = "./data/uploads"

    class Config:
        env_file = ".env"


settings = Settings()

Path(settings.upload_path).mkdir(parents=True, exist_ok=True)
Path(settings.chroma_path).mkdir(parents=True, exist_ok=True)
Path("./data").mkdir(parents=True, exist_ok=True)
