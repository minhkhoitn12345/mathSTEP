import logging

from fastapi import FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .config import get_settings
from .contracts import ChatRequest, ChatResponse
from .orchestrator import process_chat
from .supabase_auth import validate_supabase_session
from .supabase_store import SupabaseStore


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("mathstep")
app = FastAPI(title="MathSTEP AI Orchestrator", version="0.2.0")


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
    response = await process_chat(payload, user, settings)
    conversation_id, message_id = await SupabaseStore(settings).save_turn(user, payload, response)
    return response.model_copy(update={"conversation_id": conversation_id, "message_id": message_id})


@app.get("/assistant/conversations")
async def list_conversations(authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    token = _bearer_token(authorization)
    await validate_supabase_session(token, settings)
    assert token is not None
    return await SupabaseStore(settings).list_conversations(token)


@app.get("/assistant/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, authorization: str | None = Header(default=None)) -> dict:
    settings = get_settings()
    token = _bearer_token(authorization)
    await validate_supabase_session(token, settings)
    assert token is not None
    return await SupabaseStore(settings).get_conversation(token, conversation_id)
