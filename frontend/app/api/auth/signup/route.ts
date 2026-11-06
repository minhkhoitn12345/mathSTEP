import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig, setAuthCookies } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Thông tin đăng ký không hợp lệ.", 400); }
  if (typeof body.email !== "string" || typeof body.password !== "string" || body.password.length < 6 || body.password.length > 256 || typeof body.name !== "string" || !body.name.trim() || body.name.length > 100) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập họ tên và mật khẩu có ít nhất 6 ký tự.", 400);
  }
  try {
    const { url, anonKey } = getSupabaseConfig();
    const redirectTo = new URL("/auth/callback", request.nextUrl.origin).toString();
    const upstream = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST", headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password, data: { full_name: typeof body.name === "string" ? body.name.slice(0, 100) : "" } }),
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json().catch(() => null) as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown } | null;
    if (!upstream.ok) return jsonError("SIGNUP_FAILED", "Chưa tạo được tài khoản. Hãy kiểm tra email hoặc thử lại sau.", upstream.status === 429 ? 429 : 400);
    if (typeof data?.access_token === "string" && typeof data.refresh_token === "string") {
      const response = NextResponse.json({ ok: true, confirmation_required: false });
      setAuthCookies(response, { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: typeof data.expires_in === "number" ? data.expires_in : 3600 });
      return response;
    }
    return NextResponse.json({ ok: true, confirmation_required: true });
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đăng ký.", 502);
  }
}
