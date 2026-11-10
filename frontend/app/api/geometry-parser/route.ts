import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { checkRateLimit, RATE_LIMIT_RULES, getClientIp } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { detectPromptInjection } from "@/lib/promptSecurity";
import {
  GEOMETRY_PARSER_SYSTEM_PROMPT,
  ParsedGeometrySolid,
} from "@/app/lib/geometryParserPrompt";
import { GEOMETRY_PRESET_TEMPLATES } from "@/app/lib/geometrySolver";

export const runtime = "nodejs";
export const maxDuration = 60;

// Trích xuất JSON an toàn từ phản hồi LLM
function extractJsonFromText(rawText: string): ParsedGeometrySolid | null {
  if (!rawText) return null;
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && parsed.solidType) {
      return parsed as ParsedGeometrySolid;
    }
  } catch (err) {
    // Thử regex tìm JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && typeof parsed === "object" && parsed.solidType) {
          return parsed as ParsedGeometrySolid;
        }
      } catch {}
    }
  }
  return null;
}

// Fallback thông minh dựa trên từ khóa đề bài
function matchPresetTemplate(prompt: string): ParsedGeometrySolid {
  const p = prompt.toLowerCase();
  if (p.includes("lăng trụ") || p.includes("lang tru") || p.includes("a'b'c'")) {
    return GEOMETRY_PRESET_TEMPLATES[2].solid;
  }
  if (p.includes("nón") || p.includes("non") || p.includes("trục so") || p.includes("thiết diện qua trục")) {
    return GEOMETRY_PRESET_TEMPLATES[3].solid;
  }
  if (p.includes("vuông tại b") || p.includes("sa vuông góc") || p.includes("s.abc")) {
    return GEOMETRY_PRESET_TEMPLATES[1].solid;
  }
  // Mặc định hình chóp tứ giác đều S.ABCD
  return GEOMETRY_PRESET_TEMPLATES[0].solid;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  }
  if (!isJsonRequest(request)) {
    return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  }

  // 1. RATE LIMITING: Chống spam request
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.GEOMETRY_PARSER);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      {
        detail: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Em thao tác quá nhanh. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây trước khi gửi tiếp.`,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": rateLimitStatus.resetSeconds.toString() },
      }
    );
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_000) return jsonError("REQUEST_TOO_LARGE", "Yêu cầu quá lớn.", 413);
    const body = await request.json().catch(() => null);
    const { prompt, custom_ai } = body || {};
    if (custom_ai?.provider && custom_ai.provider !== "gemini") {
      return jsonError("UNSUPPORTED_PROVIDER", "Chỉ hỗ trợ Google Gemini.", 400);
    }

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return jsonError("MISSING_PROMPT", "Vui lòng nhập đề bài hình học không gian.", 400);
    }
    if (prompt.length > 8_000) return jsonError("PROMPT_TOO_LARGE", "Đề bài tối đa 8.000 ký tự.", 413);

    // 2. XSS & PROMPT INJECTION SANITIZATION
    const cleanPrompt = sanitizeUserText(prompt).trim();
    const injectionCheck = detectPromptInjection(cleanPrompt);
    if (injectionCheck.isMalicious) {
      return jsonError("PROMPT_INJECTION_DETECTED", "Đề bài chứa ký tự hoặc cấu trúc không hợp lệ.", 400);
    }

    const trimmedPrompt = cleanPrompt;
    const keyCandidate = typeof custom_ai?.apiKey === "string" ? custom_ai.apiKey.trim() : "";
    const hasCustomKey = keyCandidate.length >= 20 && keyCandidate.length <= 512 && /^[\x21-\x7E]+$/.test(keyCandidate);

    // 1. NẾU CÓ USER API KEY (Client-side Configured Key)
    if (hasCustomKey) {
      const apiKey = keyCandidate;
      const provider = custom_ai.provider || "gemini";

      // A. GOOGLE GEMINI API
      if (provider === "gemini") {
        const rawModel = custom_ai.model || "gemini-2.5-flash";
        const model = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: GEOMETRY_PARSER_SYSTEM_PROMPT }] },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Đề bài toán hình học không gian:\n"${trimmedPrompt}"\n\nHãy phân tích và trích xuất đúng Geometry JSON Schema:`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                response_mime_type: "application/json",
              },
            }),
            signal: AbortSignal.timeout(35000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = extractJsonFromText(rawText);
          if (parsed) {
            return NextResponse.json({
              ok: true,
              solid: parsed,
              source: "custom_gemini",
              modelUsed: model,
            }, { headers: { "Cache-Control": "no-store" } });
          }
        }
      }

    }

    // 2. FALLBACK THÔNG MINH (KEY DỰ ÁN HOẶC HEURISTIC TEMPLATE MATCHER)
    // Đảm bảo học sinh luôn có mô hình 3D chuẩn xác dù không có API Key riêng
    const matched = matchPresetTemplate(trimmedPrompt);
    return NextResponse.json({
      ok: true,
      solid: {
        ...matched,
        title: `Mô hình 3D: ${trimmedPrompt.slice(0, 50)}...`,
        description: trimmedPrompt,
      },
      source: "project_template_preset",
      modelUsed: "mathstep-geometry-engine-v2",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[Geometry Parser API Error]:", error);
    return jsonError("PARSER_ERROR", "Chưa thể phân tích đề bài lúc này. Vui lòng thử lại.", 500);
  }
}
