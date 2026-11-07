import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig, setAuthCookies } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let body: { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown; code?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Phiên đăng nhập không hợp lệ.", 400); }
  let accessToken = body.access_token;
  let refreshToken = body.refresh_token;
  let expiresIn = body.expires_in;
  try {
    const { url, anonKey } = getSupabaseConfig();
    if (typeof body.code === "string") {
      const verifier = request.cookies.get("mathstep_oauth_verifier")?.value;
      if (!verifier) return jsonError("OAUTH_FAILED", "Phiên Google đã hết hạn. Hãy bắt đầu đăng nhập lại.", 401);
      const exchange = await fetch(`${url}/auth/v1/token?grant_type=pkce`, {
        method: "POST", headers: { apikey: anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ auth_code: body.code, code_verifier: verifier }), cache: "no-store", signal: AbortSignal.timeout(10000),
      });
      const tokens = await exchange.json().catch(() => null) as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown } | null;
      if (!exchange.ok || typeof tokens?.access_token !== "string" || typeof tokens.refresh_token !== "string") return jsonError("OAUTH_FAILED", "Google chưa hoàn tất đăng nhập. Hãy thử lại.", 401);
      accessToken = tokens.access_token; refreshToken = tokens.refresh_token; expiresIn = tokens.expires_in;
    }
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") return jsonError("INVALID_REQUEST", "Phiên đăng nhập không hợp lệ.", 400);
    const check = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!check.ok) return jsonError("OAUTH_FAILED", "Google chưa hoàn tất đăng nhập. Hãy thử lại.", 401);
    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, { access_token: accessToken, refresh_token: refreshToken, expires_in: typeof expiresIn === "number" ? expiresIn : 3600 });
    response.cookies.set("mathstep_oauth_verifier", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đăng nhập.", 502);
  }
}
