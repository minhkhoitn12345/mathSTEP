import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";

export const runtime = "nodejs";

function testKeyError(code: string, message: string, status: number) {
  return NextResponse.json({ detail: { code, message } }, { status, headers: NO_CACHE_HEADERS });
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.TEST_KEY);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: `Thao tác kiểm tra key quá nhanh. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây.` } },
      { status: 429, headers: { "Retry-After": rateLimitStatus.resetSeconds.toString(), ...NO_CACHE_HEADERS } }
    );
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4096) return testKeyError("REQUEST_TOO_LARGE", "Yêu cầu quá lớn.", 413);
    const body = await request.json().catch(() => null);
    const { provider, model, apiKey } = body || {};

    if (!apiKey || typeof apiKey !== "string") {
      return testKeyError("MISSING_KEY", "Vui lòng nhập API key.", 400);
    }

    const key = apiKey.trim();
    if (key.length < 20 || key.length > 512 || !/^[\x21-\x7E]+$/.test(key)) {
      return testKeyError("KEY_INVALID_FORMAT", "API key không hợp lệ hoặc chứa ký tự đặc biệt không được phép.", 400);
    }

    if (!new Set(["gemini", "openai", "deepseek"]).has(provider)) {
      return testKeyError("UNSUPPORTED_PROVIDER", "Nhà cung cấp chưa được hỗ trợ.", 400);
    }

    if (provider === "gemini") {
      const rawModel = typeof model === "string" ? model : "gemini-3-flash-preview";
      const modelName = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "gemini-3-flash-preview";
      
      const candidateModels = [modelName, "gemini-3-flash-preview", "gemini-3.5-flash-lite"].filter(
        (m, idx, arr) => arr.indexOf(m) === idx
      );

      let lastError = "";
      for (const m of candidateModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": key },
              body: JSON.stringify({
                contents: [{ parts: [{ text: "Hãy trả lời đúng 2 từ: 'SẴN SÀNG'." }] }],
                generationConfig: { maxOutputTokens: 20 },
              }),
              signal: AbortSignal.timeout(10000),
            }
          );
          const data = await res.json();
          if (res.ok) {
            return NextResponse.json({ ok: true, message: `Kết nối thành công với Google ${m}!` }, { headers: NO_CACHE_HEADERS });
          } else {
            lastError = data.error?.message || "Model không khả dụng.";
          }
        } catch {}
      }
      return testKeyError("KEY_INVALID", lastError || "Google API key không hợp lệ hoặc model không khả dụng.", 400);
    }

    if (provider === "openai" || provider === "deepseek") {
      const baseUrl =
        provider === "deepseek"
          ? "https://api.deepseek.com/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const rawModel = typeof model === "string" ? model : (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
      const modelName = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");

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
        return testKeyError("KEY_INVALID", data.error?.message || "API key không hợp lệ.", 400);
      }
      return NextResponse.json({ ok: true, message: `Kết nối thành công với ${modelName}!` }, { headers: NO_CACHE_HEADERS });
    }

    return testKeyError("UNSUPPORTED_PROVIDER", "Nhà cung cấp chưa được hỗ trợ.", 400);
  } catch {
    // Bảo mật: Không trả về raw error message / stack trace cho phía client
    return testKeyError(
      "TEST_FAILED",
      "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc tính hợp lệ của API Key.",
      500
    );
  }
}
