from functools import lru_cache
import os
from pathlib import Path

from pydantic import BaseModel
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Settings(BaseModel):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    ai_base_url: str = ""
    ai_api_key: str = ""
    ai_model: str = ""
    llm_timeout_seconds: float = 45.0
    allow_full_solutions: bool = False
    force_assessment_mode: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL", "").rstrip("/"),
        supabase_anon_key=os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("SUPABASE_ANON_KEY", "")),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        ai_base_url=os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        ai_api_key=os.getenv("AI_API_KEY", ""),
        ai_model=os.getenv("AI_MODEL", ""),
        llm_timeout_seconds=float(os.getenv("LLM_TIMEOUT_SECONDS", "45")),
        allow_full_solutions=os.getenv("ALLOW_FULL_SOLUTIONS", "false").lower() == "true",
        force_assessment_mode=os.getenv("FORCE_ASSESSMENT_MODE", "false").lower() == "true",
    )
