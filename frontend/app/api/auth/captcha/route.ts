import { NextResponse } from "next/server";
import { generateMathCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";

export async function GET() {
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
}
