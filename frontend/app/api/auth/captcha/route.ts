import { NextResponse } from "next/server";
import { generateMathCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";

export async function GET() {
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
          "Cache-Control": "no-store, no-cache, must-revalidate",
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
