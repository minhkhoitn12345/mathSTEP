from uuid import UUID

import httpx
from fastapi import HTTPException

from .config import Settings
from .contracts import ChatRequest, ChatResponse
from .supabase_auth import AuthenticatedUser


class SupabaseStore:
    def __init__(self, settings: Settings) -> None:
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise HTTPException(status_code=503, detail={"code": "DATABASE_NOT_CONFIGURED", "message": "Chưa cấu hình Supabase."})
        self.base_url = settings.supabase_url.rstrip("/")
        self.anon_key = settings.supabase_anon_key
        self.service_role_key = settings.supabase_service_role_key

    def _headers(self, token: str, api_key: str | None = None) -> dict[str, str]:
        return {
            "apikey": api_key or self.anon_key,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def _call(self, method: str, path: str, token: str, api_key: str | None = None, **kwargs) -> httpx.Response:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.request(
                    method,
                    f"{self.base_url}/rest/v1/{path.lstrip('/')}",
                    headers=self._headers(token, api_key),
                    **kwargs,
                )
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Phiên đăng nhập đã hết hạn."})
            if response.status_code == 403:
                raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Không có quyền truy cập dữ liệu này."})
            response.raise_for_status()
            return response
        except HTTPException:
            raise
        except httpx.HTTPStatusError as error:
            raise HTTPException(status_code=502, detail={"code": "SUPABASE_DATABASE_ERROR", "message": "Supabase chưa lưu hoặc tải được dữ liệu."}) from error
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail={"code": "SUPABASE_UNAVAILABLE", "message": "Chưa kết nối được Supabase."}) from error

    async def save_turn(
        self,
        user: AuthenticatedUser,
        request: ChatRequest,
        response: ChatResponse,
    ) -> tuple[str, str]:
        if not self.service_role_key:
            raise HTTPException(status_code=503, detail={"code": "DATABASE_NOT_CONFIGURED", "message": "Chưa cấu hình server key cho chức năng lưu chat."})
        try:
            conversation_id = str(UUID(request.conversation_id)) if request.conversation_id else None
        except ValueError as error:
            raise HTTPException(status_code=400, detail={"code": "INVALID_CONVERSATION_ID", "message": "Mã hội thoại không hợp lệ."}) from error
        result = await self._call(
            "POST",
            "rpc/record_chat_turn",
            self.service_role_key,
            api_key=self.service_role_key,
            json={
                "p_user_id": user.user_id,
                "p_conversation_id": conversation_id,
                "p_module": request.learning_context.module.value,
                "p_title": request.message[:120],
                "p_user_content": request.message,
                "p_assistant_content": response.answer,
                "p_intent": response.intent,
                "p_learning_stage": request.learning_context.learning_stage.value,
                "p_hint_level": response.hint_level,
                "p_math_validation": response.math_validation.model_dump(mode="json") if response.math_validation else None,
            },
        )
        try:
            rows = result.json()
            row = rows[0] if isinstance(rows, list) and rows else rows
            saved_conversation_id = str(UUID(str(row["conversation_id"])))
            saved_message_id = str(UUID(str(row["message_id"])))
        except (ValueError, TypeError, KeyError, IndexError) as error:
            raise HTTPException(status_code=502, detail={"code": "SUPABASE_RESPONSE_INVALID", "message": "Supabase trả về dữ liệu hội thoại không hợp lệ."}) from error
        return saved_conversation_id, saved_message_id

    async def list_conversations(self, token: str) -> dict:
        response = await self._call(
            "GET",
            "conversations",
            token,
            params={"select": "id,title,module,updated_at", "order": "updated_at.desc", "limit": "20"},
        )
        return {"items": response.json()}

    async def get_conversation(self, token: str, conversation_id: str) -> dict:
        try:
            conversation_id = str(UUID(conversation_id))
        except ValueError as error:
            raise HTTPException(status_code=400, detail={"code": "INVALID_CONVERSATION_ID", "message": "Mã hội thoại không hợp lệ."}) from error

        conversation_response = await self._call(
            "GET",
            "conversations",
            token,
            params={"id": f"eq.{conversation_id}", "select": "id,title,module,created_at,updated_at", "limit": "1"},
        )
        conversations = conversation_response.json()
        if not isinstance(conversations, list) or not conversations:
            raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND", "message": "Không tìm thấy hội thoại này."})

        messages_response = await self._call(
            "GET",
            "messages",
            token,
            params={
                "conversation_id": f"eq.{conversation_id}",
                "select": "id,role,content,intent,learning_stage,hint_level,math_validation,created_at",
                "order": "created_at.asc",
            },
        )
        return {"conversation": conversations[0], "messages": messages_response.json()}
