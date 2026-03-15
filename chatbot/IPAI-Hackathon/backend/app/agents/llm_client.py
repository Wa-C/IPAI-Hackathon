"""
LLM Client — unified interface for Mistral (free), Gemini (free), and Claude (paid).

Switch between providers by setting LLM_PROVIDER in .env:
  - "mistral" → Mistral API (free experiment tier, no credit card)
  - "gemini"  → Google Gemini API (free, no credit card)
  - "claude"  → Anthropic Claude API (paid, better quality)
"""

import json
import httpx
from app.config import settings


class LLMClient:
    """Unified LLM client that wraps Mistral, Gemini, and Claude APIs."""

    def __init__(self):
        self.provider = settings.llm_provider

    def generate(self, system_prompt: str, messages: list[dict], max_tokens: int = 2000) -> str:
        """
        Generate a response from the LLM.

        Args:
            system_prompt: System instructions for the model
            messages: List of {"role": "user"|"assistant", "content": "..."} dicts
            max_tokens: Maximum response length

        Returns:
            The model's text response
        """
        if self.provider == "mistral":
            return self._call_mistral(system_prompt, messages, max_tokens)
        elif self.provider == "gemini":
            return self._call_gemini(system_prompt, messages, max_tokens)
        elif self.provider == "claude":
            return self._call_claude(system_prompt, messages, max_tokens)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

    def _call_mistral(self, system_prompt: str, messages: list[dict], max_tokens: int) -> str:
        """
        Call Mistral API (free experiment tier).
        Uses OpenAI-compatible chat completions format — very simple.
        """
        # Build messages with system prompt first
        mistral_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            mistral_messages.append({"role": msg["role"], "content": msg["content"]})

        payload = {
            "model": settings.mistral_model,
            "messages": mistral_messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.mistral_api_key}",
                "Content-Type": "application/json"
            },
            timeout=60.0
        )

        if response.status_code != 200:
            error_detail = response.text[:500]
            raise RuntimeError(f"Mistral API error ({response.status_code}): {error_detail}")

        data = response.json()
        return data["choices"][0]["message"]["content"]

    def _call_gemini(self, system_prompt: str, messages: list[dict], max_tokens: int) -> str:
        """Call Google Gemini API (free tier)."""
        gemini_contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

        payload = {
            "contents": gemini_contents,
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.7
            }
        }

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        )

        response = httpx.post(url, json=payload, timeout=60.0)

        if response.status_code != 200:
            error_detail = response.text[:500]
            raise RuntimeError(f"Gemini API error ({response.status_code}): {error_detail}")

        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            raise RuntimeError(f"Unexpected Gemini response format: {e}")

    def _call_claude(self, system_prompt: str, messages: list[dict], max_tokens: int) -> str:
        """Call Anthropic Claude API (paid)."""
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        response = client.messages.create(
            model=settings.claude_model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages
        )

        return response.content[0].text


# Singleton instance
llm = LLMClient()
