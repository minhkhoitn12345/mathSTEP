import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig, setAuthCookies } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { verifyMathCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  // 1. RATE LIMITING: Chống spam tạo tài khoản hàng loạt
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.SIGNUP);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      {
        detail: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Em đã gửi quá nhiều yêu cầu đăng ký. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây trước khi thử lại.`,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": rateLimitStatus.resetSeconds.toString() },
      }
    );
  }

  let body: {
    email?: unknown;
    password?: unknown;
    name?: unknown;
    captchaAnswer?: unknown;
    captchaToken?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_REQUEST", "Thông tin đăng ký không hợp lệ.", 400);
  }

  // 2. CAPTCHA VERIFICATION: Bắt buộc để chống bot spam đăng ký
  if (!body.captchaToken || body.captchaAnswer === undefined || body.captchaAnswer === null || body.captchaAnswer === "") {
    return jsonError("CAPTCHA_REQUIRED", "Vui lòng nhập kết quả phép tính chống spam.", 400);
  }
  const captchaResult = verifyMathCaptcha(body.captchaAnswer, body.captchaToken);
  if (!captchaResult.valid) {
    return jsonError("CAPTCHA_FAILED", captchaResult.reason || "Kết quả tính nhẩm chưa chính xác. Vui lòng thử lại.", 400);
  }

  // 3. XSS SANITIZATION
  const cleanEmail = sanitizeUserText(body.email).toLowerCase();
  const cleanName = sanitizeUserText(body.name).slice(0, 100);
  const password = typeof body.password === "string" ? body.password : "";

  if (!cleanEmail || !cleanName || password.length < 6 || password.length > 256) {
    return jsonError("INVALID_REQUEST", "Vui lòng nhập họ tên và mật khẩu có ít nhất 6 ký tự.", 400);
  }

  try {
    const { url, anonKey } = getSupabaseConfig();
    const redirectTo = new URL("/auth/callback", request.nextUrl.origin).toString();

    // 4. ROLE ENFORCEMENT: Gán cứng role: "student" để ngăn chặn Privilege Escalation
    const upstream = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          full_name: cleanName,
          role: "student", // Mặc định luôn là học sinh, không cho client tự cấp quyền admin/teacher
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await upstream.json().catch(() => null) as {
      access_token?: unknown;
      refresh_token?: unknown;
      expires_in?: unknown;
    } | null;

    if (!upstream.ok) {
      return jsonError(
        "SIGNUP_FAILED",
        "Chưa tạo được tài khoản. Hãy kiểm tra định dạng email hoặc thử lại sau.",
        upstream.status === 429 ? 429 : 400
      );
    }

    if (typeof data?.access_token === "string" && typeof data.refresh_token === "string") {
      const response = NextResponse.json({ ok: true, confirmation_required: false });
      setAuthCookies(response, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: typeof data.expires_in === "number" ? data.expires_in : 3600,
      });
      return response;
    }

    return NextResponse.json({ ok: true, confirmation_required: true });
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đăng ký.", 502);
  }
}
