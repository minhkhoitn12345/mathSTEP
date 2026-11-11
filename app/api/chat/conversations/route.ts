import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies } from "@/lib/supabase";
import { getFastApiBaseUrl } from "@/lib/fastapi";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  let session;
  try { session = await getAccessToken(request); }
  catch { return jsonError("SUPABASE_UNAVAILABLE", "Chưa xác minh được phiên đăng nhập.", 502); }
  const { token, refreshed } = session;
  if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để xem lịch sử.", 401);
  const baseUrl = getFastApiBaseUrl();
  if (!baseUrl) return responseWithSessionCookies(jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình địa chỉ FastAPI.", 503), refreshed);
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0 || offset > 10000) {
      return responseWithSessionCookies(jsonError("INVALID_PAGINATION", "Tham số lịch sử không hợp lệ.", 400), refreshed);
    }
    const upstream = await fetch(`${baseUrl}/assistant/conversations?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    const body = await upstream.json().catch(() => ({}));
    return responseWithSessionCookies(NextResponse.json(body, { status: upstream.status }), refreshed);
  } catch {
    return responseWithSessionCookies(jsonError("FASTAPI_UNAVAILABLE", "Chưa tải được lịch sử chat.", 502), refreshed);
  }
}
