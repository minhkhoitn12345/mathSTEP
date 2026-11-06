import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let body: { email?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Email không hợp lệ.", 400); }
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập email hợp lệ.", 400);
  }
  try {
    const { url, anonKey } = getSupabaseConfig();
    const redirectTo = new URL("/auth/reset-password", request.nextUrl.origin).toString();
    const upstream = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST", headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim().toLowerCase() }), cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return jsonError("RECOVERY_FAILED", "Chưa gửi được email đặt lại mật khẩu. Hãy thử lại sau.", upstream.status === 429 ? 429 : 400);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đặt lại mật khẩu.", 502);
  }
}
