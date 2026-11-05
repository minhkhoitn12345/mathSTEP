import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig, setAuthCookies } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Thông tin đăng nhập không hợp lệ.", 400); }
  if (typeof body.email !== "string" || typeof body.password !== "string" || body.password.length > 256) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập email và mật khẩu hợp lệ.", 400);
  }
  try {
    const { url, anonKey } = getSupabaseConfig();
    const upstream = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json().catch(() => null) as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown } | null;
    if (!upstream.ok || typeof data?.access_token !== "string" || typeof data.refresh_token !== "string") {
      return jsonError("LOGIN_FAILED", "Email hoặc mật khẩu chưa chính xác.", upstream.status === 429 ? 429 : 401);
    }
    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: typeof data.expires_in === "number" ? data.expires_in : 3600 });
    return response;
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đăng nhập.", 502);
  }
}
