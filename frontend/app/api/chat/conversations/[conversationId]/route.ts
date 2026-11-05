import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies } from "@/lib/supabase";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  let session;
  try { session = await getAccessToken(request); }
  catch { return jsonError("SUPABASE_UNAVAILABLE", "Chưa xác minh được phiên đăng nhập.", 502); }
  const { token, refreshed } = session;
  const { conversationId } = await params;
  if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để mở hội thoại.", 401);
  if (!UUID_PATTERN.test(conversationId)) return jsonError("INVALID_CONVERSATION_ID", "Mã hội thoại không hợp lệ.", 400);
  const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return responseWithSessionCookies(jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình địa chỉ FastAPI.", 503), refreshed);
  try {
    const upstream = await fetch(`${baseUrl}/assistant/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    const body = await upstream.json().catch(() => ({}));
    return responseWithSessionCookies(NextResponse.json(body, { status: upstream.status }), refreshed);
  } catch {
    return responseWithSessionCookies(jsonError("FASTAPI_UNAVAILABLE", "Chưa tải được hội thoại.", 502), refreshed);
  }
}
