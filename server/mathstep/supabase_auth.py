from dataclasses import dataclass

import httpx
from fastapi import HTTPException

from .config import Settings


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str | None = None
    name: str | None = None


async def validate_supabase_session(token: str | None, settings: Settings) -> AuthenticatedUser:
    if not token:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Vui lòng đăng nhập để tiếp tục."})
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail={"code": "AUTH_NOT_CONFIGURED", "message": "Chưa cấu hình Supabase Auth."})
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={"apikey": settings.supabase_anon_key, "Authorization": f"Bearer {token}"},
            )
        if response.status_code in (401, 403):
            raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."})
        response.raise_for_status()
        data = response.json()
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(status_code=502, detail={"code": "SUPABASE_AUTH_ERROR", "message": "Không xác minh được phiên đăng nhập."}) from error

    user_id = data.get("id") if isinstance(data, dict) else None
    if not isinstance(user_id, str):
        raise HTTPException(status_code=502, detail={"code": "SUPABASE_AUTH_RESPONSE_INVALID", "message": "Supabase không trả về danh tính hợp lệ."})
    metadata = data.get("user_metadata") if isinstance(data.get("user_metadata"), dict) else {}
    name = metadata.get("full_name") or metadata.get("name")
    return AuthenticatedUser(
        user_id=user_id,
        email=data.get("email") if isinstance(data.get("email"), str) else None,
        name=name if isinstance(name, str) else None,
    )
