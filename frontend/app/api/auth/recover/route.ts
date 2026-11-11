import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig } from "@/lib/supabase";
import { getAppUrl } from "@/lib/app-url";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  // Rate Limiting chống spam email khôi phục mật khẩu
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.RESEND_EMAIL);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: `Em thao tác quá nhanh. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây.` } },
      { status: 429, headers: { "Retry-After": rateLimitStatus.resetSeconds.toString() } }
    );
  }

  let body: { email?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Email không hợp lệ.", 400); }
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập email hợp lệ.", 400);
  }
  try {
    const { url, anonKey } = getSupabaseConfig();
    const redirectTo = getAppUrl("/auth/reset-password", request);
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
