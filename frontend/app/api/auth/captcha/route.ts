import { NextRequest, NextResponse } from "next/server";
import { generateMathCaptcha } from "@/lib/captcha";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Rate limiting chống botnet flood-request sinh captcha làm cạn kiệt tài nguyên
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.CAPTCHA);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      {
        ok: false,
        error: `Quá nhiều yêu cầu tạo câu hỏi. Vui lòng đợi ${rateLimitStatus.resetSeconds}s.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimitStatus.resetSeconds.toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  try {
    const challenge = generateMathCaptcha();
    return NextResponse.json(
      {
        ok: true,
        challenge,
        question: challenge.question,
        token: challenge.token,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Chưa cấu hình được dịch vụ xác thực. Vui lòng thử lại sau." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
