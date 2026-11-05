import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let session;
  try { session = await getAccessToken(request); }
  catch { return jsonError("SUPABASE_UNAVAILABLE", "Chưa xác minh được phiên đăng nhập.", 502); }
  const { token, refreshed } = session;
  if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để trò chuyện.", 401);
  const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return responseWithSessionCookies(jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình địa chỉ FastAPI.", 503), refreshed);
  try {
    const body = await request.text();
    if (body.length > 32_000) return responseWithSessionCookies(jsonError("REQUEST_TOO_LARGE", "Tin nhắn vượt quá giới hạn cho phép.", 413), refreshed);
    const upstream = await fetch(`${baseUrl}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    const result = await upstream.json().catch(() => ({ detail: { code: "AI_RESPONSE_INVALID", message: "Phản hồi dịch vụ chưa hợp lệ." } }));
    return responseWithSessionCookies(NextResponse.json(result, { status: upstream.status }), refreshed);
  } catch {
    return responseWithSessionCookies(jsonError("AI_SERVICE_UNAVAILABLE", "Chưa kết nối được linh vật. Em thử lại sau nhé.", 502), refreshed);
  }
}
