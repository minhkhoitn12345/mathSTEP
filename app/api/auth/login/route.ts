import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError, isValidEmail, isValidPassword } from "@/lib/security";
import { getSupabaseConfig, setAuthCookies } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { verifyMathCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  // 1. RATE LIMITING: Chống Brute-force mật khẩu
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.LOGIN);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      {
        detail: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Em đã thử đăng nhập sai quá nhiều lần. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây để bảo vệ an toàn tài khoản.`,
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
    captchaAnswer?: unknown;
    captchaToken?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_REQUEST", "Thông tin đăng nhập không hợp lệ.", 400);
  }

  // 2. CAPTCHA VERIFICATION: Bắt buộc để chống botnet brute-force mật khẩu
  if (!body.captchaToken || body.captchaAnswer === undefined || body.captchaAnswer === null || body.captchaAnswer === "") {
    return jsonError("CAPTCHA_REQUIRED", "Vui lòng nhập kết quả phép tính chống spam.", 400);
  }
  const captchaResult = verifyMathCaptcha(body.captchaAnswer, body.captchaToken);
  if (!captchaResult.valid) {
    return jsonError("CAPTCHA_FAILED", captchaResult.reason || "Xác thực phép toán chưa đúng.", 400);
  }

  // 3. SCHEMA VALIDATION & XSS SANITIZATION
  if (!isValidEmail(body.email)) {
    return jsonError("INVALID_EMAIL", "Định dạng email không hợp lệ.", 400);
  }
  if (!isValidPassword(body.password)) {
    return jsonError("INVALID_PASSWORD", "Mật khẩu phải từ 6 đến 256 ký tự.", 400);
  }
  const cleanEmail = sanitizeUserText(body.email).toLowerCase();
  const password = body.password;

  try {
    const { url, anonKey } = getSupabaseConfig();
    const upstream = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await upstream.json().catch(() => null) as {
      access_token?: unknown;
      refresh_token?: unknown;
      expires_in?: unknown;
      error_code?: unknown;
      code?: unknown;
      msg?: unknown;
    } | null;

    if (!upstream.ok || typeof data?.access_token !== "string" || typeof data.refresh_token !== "string") {
      if (data?.error_code === "email_not_confirmed" || data?.code === "email_not_confirmed") {
        return jsonError(
          "EMAIL_NOT_CONFIRMED",
          "Email chưa được xác nhận. Hãy kiểm tra hộp thư hoặc gửi lại email xác nhận để kích hoạt.",
          401
        );
      }
      return jsonError(
        "LOGIN_FAILED",
        "Email hoặc mật khẩu chưa chính xác.",
        upstream.status === 429 ? 429 : 401
      );
    }

    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: typeof data.expires_in === "number" ? data.expires_in : 3600,
    });
    return response;
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đăng nhập.", 502);
  }
}
