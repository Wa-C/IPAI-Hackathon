"""
LLM Client — Mistral API wrapper using the OpenAI-compatible endpoint.
Uses MISTRAL_API_KEY from .env.
"""

from __future__ import annotations

import httpx
from openai import AsyncOpenAI
from app.core.config import settings

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.mistral_api_key,
            base_url="https://api.mistral.ai/v1",
            timeout=httpx.Timeout(60.0, connect=10.0),
        )
    return _client


async def ask_llm(
    system_prompt: str,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 2000,
) -> str:
    """Send a chat completion request to Mistral and return the text response."""
    client = _get_client()

    full_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        full_messages.append({"role": m["role"], "content": m["content"]})

    try:
        response = await client.chat.completions.create(
            model=settings.mistral_model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"LLM request failed: {e}") from e
