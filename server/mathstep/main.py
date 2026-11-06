import logging

from fastapi import FastAPI, Header, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .config import get_settings
from .contracts import ChatRequest, ChatResponse
from .orchestrator import process_chat
from .supabase_auth import validate_supabase_session
from .supabase_store import SupabaseStore


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("mathstep")
app = FastAPI(title="MathSTEP AI Orchestrator", version="0.2.0")


class UserApiKeyPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    api_key: str = Field(min_length=20, max_length=512)

    @field_validator("api_key")
    @classmethod
    def validate_api_key(cls, value: str) -> str:
        if value != value.strip() or not value.isascii() or any(char.isspace() for char in value):
            raise ValueError("API key contains invalid whitespace or characters")
        return value


@app.exception_handler(RequestValidationError)
async def request_validation_error(_request: Request, _error: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": {"code": "INVALID_REQUEST", "message": "Dữ liệu gửi lên chưa đúng định dạng."}})


@app.middleware("http")
async def error_contract(request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Unhandled request failure")
        return JSONResponse(status_code=500, content={"detail": {"code": "INTERNAL_ERROR", "message": "Đã có lỗi xử lý. Em thử lại sau nhé."}})


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "mathstep-ai"}


def _bearer_token(authorization: str | None) -> str | None:
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip() or None
    return None


@app.post("/assistant/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, authorization: str | None = Header(default=None)) -> ChatResponse:
    settings = get_settings()
    token = _bearer_token(authorization)
    user = await validate_supabase_session(token, settings)
    user_api_key = await SupabaseStore(settings).get_user_ai_key(user.user_id)
    response = await process_chat(payload, user, settings, user_api_key)
    conversation_id, message_id = await SupabaseStore(settings).save_turn(user, payload, response)
    return response.model_copy(update={"conversation_id": conversation_id, "message_id": message_id})


@app.get("/assistant/account/api-key")
async def get_api_key_status(authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    user = await validate_supabase_session(_bearer_token(authorization), settings)
    return await SupabaseStore(settings).get_user_ai_key_status(user.user_id)


@app.put("/assistant/account/api-key")
async def save_api_key(payload: UserApiKeyPayload, authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    user = await validate_supabase_session(_bearer_token(authorization), settings)
    key = payload.api_key.strip()
    if len(key) < 20 or len(key) > 512 or not key.isascii() or any(char.isspace() for char in key):
        return JSONResponse(status_code=400, content={"detail": {"code": "INVALID_API_KEY", "message": "API key không hợp lệ."}})
    return await SupabaseStore(settings).set_user_ai_key(user.user_id, key)


@app.delete("/assistant/account/api-key")
async def remove_api_key(authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    user = await validate_supabase_session(_bearer_token(authorization), settings)
    await SupabaseStore(settings).delete_user_ai_key(user.user_id)
    return {"configured": False}


@app.get("/assistant/conversations")
async def list_conversations(
    authorization: str | None = Header(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0, le=10000),
) -> dict:
    settings = get_settings()
    token = _bearer_token(authorization)
    await validate_supabase_session(token, settings)
    assert token is not None
    return await SupabaseStore(settings).list_conversations(token, limit, offset)


@app.get("/assistant/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    token = _bearer_token(authorization)
    await validate_supabase_session(token, settings)
    assert token is not None
    return await SupabaseStore(settings).get_conversation(token, conversation_id)
