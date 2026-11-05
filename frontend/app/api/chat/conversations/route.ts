import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  let session;
  try { session = await getAccessToken(request); }
  catch { return jsonError("SUPABASE_UNAVAILABLE", "Chưa xác minh được phiên đăng nhập.", 502); }
  const { token, refreshed } = session;
  if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để xem lịch sử.", 401);
  const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return responseWithSessionCookies(jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình địa chỉ FastAPI.", 503), refreshed);
  try {
    const upstream = await fetch(`${baseUrl}/assistant/conversations`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    const body = await upstream.json().catch(() => ({}));
    return responseWithSessionCookies(NextResponse.json(body, { status: upstream.status }), refreshed);
  } catch {
    return responseWithSessionCookies(jsonError("FASTAPI_UNAVAILABLE", "Chưa tải được lịch sử chat.", 502), refreshed);
  }
}
