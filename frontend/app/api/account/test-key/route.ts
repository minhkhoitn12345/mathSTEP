import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, { maxRequests: 10, windowSeconds: 60, actionName: "test_key" });
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: `Thao tác kiểm tra key quá nhanh. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây.` } },
      { status: 429, headers: { "Retry-After": rateLimitStatus.resetSeconds.toString() } }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const { provider, model, apiKey } = body || {};

    if (!apiKey || typeof apiKey !== "string") {
      return jsonError("MISSING_KEY", "Vui lòng nhập API key.", 400);
    }

    const key = apiKey.trim();

    if (provider === "gemini") {
      const rawModel = typeof model === "string" ? model : "gemini-2.5-flash";
      const modelName = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "gemini-2.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hãy trả lời đúng 2 từ: 'SẴN SÀNG'." }] }],
            generationConfig: { maxOutputTokens: 20 },
          }),
          signal: AbortSignal.timeout(10000),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return jsonError(
          "KEY_INVALID",
          data.error?.message || "Google API key không hợp lệ hoặc model không khả dụng.",
          400
        );
      }
      return NextResponse.json({ ok: true, message: `Kết nối thành công với Google ${modelName}!` });
    }

    if (provider === "openai" || provider === "deepseek") {
      const baseUrl =
        provider === "deepseek"
          ? "https://api.deepseek.com/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const modelName = model || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: "Ping test" }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (!res.ok) {
        return jsonError("KEY_INVALID", data.error?.message || "API key không hợp lệ.", 400);
      }
      return NextResponse.json({ ok: true, message: `Kết nối thành công với ${modelName}!` });
    }

    return jsonError("UNSUPPORTED_PROVIDER", "Nhà cung cấp chưa được hỗ trợ.", 400);
  } catch (err: unknown) {
    return jsonError(
      "TEST_FAILED",
      err instanceof Error ? err.message : "Không thể kiểm tra API key.",
      500
    );
  }
}
