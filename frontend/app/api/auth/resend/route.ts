import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.RESEND_EMAIL);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: `Vui lòng đợi ${rateLimitStatus.resetSeconds}s trước khi yêu cầu gửi lại email xác thực.` } },
      { status: 429, headers: { "Retry-After": rateLimitStatus.resetSeconds.toString() } }
    );
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_REQUEST", "Email không hợp lệ.", 400);
  }

  const cleanEmail = sanitizeUserText(body.email).toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập email hợp lệ.", 400);
  }

  try {
    const { url, anonKey } = getSupabaseConfig();
    const redirectTo = new URL("/auth/callback", request.nextUrl.origin).toString();
    const upstream = await fetch(`${url}/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "signup", email: cleanEmail }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return jsonError(
        "RESEND_FAILED",
        "Chưa gửi lại được email. Hãy đợi một chút rồi thử lại.",
        upstream.status === 429 ? 429 : 400
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ email.", 502);
  }
}
