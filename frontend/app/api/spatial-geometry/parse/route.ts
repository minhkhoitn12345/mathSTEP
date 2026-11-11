import { NextRequest, NextResponse } from "next/server";
import { detectPromptInjection } from "@/lib/promptSecurity";
import { getClientIp, checkRateLimit, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { parseSpatialGeometryProblem } from "@/app/lib/spatialGeometryProblemParser";

export const runtime = "nodejs";
export const maxDuration = 60;

const SPATIAL_PROBLEM_PROMPT = `Bạn là chuyên gia Hình học không gian THPT Việt Nam và bộ phân tích dữ liệu cho MathSTEP.
Đọc đề toán do người dùng gửi, kiểm tra tính nhất quán toán học, rồi trả về đúng một đối tượng JSON theo schema đầy đủ được mô tả sau; không thêm markdown hay văn xuôi ngoài JSON.

Schema:
{
  "problemId": "mã ngắn ổn định",
  "problemMetadata": { "title": "...", "gradeLevel": "Lớp 11", "topic": "...", "originalText": "..." },
  "sceneConfig": { "cameraPosition": [6,5,7], "target": [0,1.2,0] },
  "geometry": {
    "type": "pyramid|prism|cylinder|cone|sphere",
    "vertices": [{ "id": "S", "label": "S", "coords": [0,4,0] }],
    "solidEdges": [["S","B"]], "dashedEdges": [["A","B"]],
    "faces": [["S","A","B"]],
    "heightLine": { "start": "S", "end": "H", "hasRightAngleMark": true },
    "angleMarker": { "vertex": "C", "firstRay": "S", "secondRay": "A", "label": "∠SCA" }
  },
  "pedagogy": {
    "level1_Identify": { "question": "...", "targetNodeId": "A", "successExplanation": "..." },
    "level2_Construction": { "question": "...", "cutPlaneEquation": "...", "expectedPolygonType": "...", "crossSectionVertices": ["Q","M","N","P"], "requiredNodeIds": ["M"] },
    "level3_ParametricSlider": { "parameter": "k=SM/SB", "min": 0.05, "max": 0.95, "step": 0.01, "formulaLatex": "...", "targetRatio": 0.25 },
    "socraticHints": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
  }
}

Quy ước tọa độ của MathSTEP: x sang phải, y thẳng đứng hướng lên, z nằm ngang; đáy có y=0. Tọa độ phải cùng tỉ lệ, hữu hạn. Chỉ liệt kê cạnh khuất thật trong dashedEdges; các mặt phải tham chiếu đỉnh đã khai báo. Không bịa giả thiết không có trong đề; nếu thiếu dữ kiện, nêu rõ trong câu hỏi hoặc title thay vì kết luận duy nhất. Công thức và lời giải phải đúng toán học. Thiết diện song song đáy qua điểm tỉ số k tính từ S có tọa độ S+k(E-S), độ cao h(1-k), tỉ số diện tích k² và thể tích khối chóp nhỏ k³. Ba gợi ý phải dẫn dắt, không tiết lộ đáp án ngay.`;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const rateLimit = checkRateLimit(getClientIp(request), RATE_LIMIT_RULES.GEOMETRY_PARSER);
  if (!rateLimit.success) return jsonError("RATE_LIMIT_EXCEEDED", `Vui lòng đợi ${rateLimit.resetSeconds} giây rồi thử lại.`, 429);

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_000) return jsonError("REQUEST_TOO_LARGE", "Yêu cầu quá lớn.", 413);
    const body = await request.json().catch(() => null) as { prompt?: unknown; custom_ai?: { provider?: unknown; model?: unknown; apiKey?: unknown } } | null;
    if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) return jsonError("MISSING_PROMPT", "Vui lòng nhập đề hình học không gian.", 400);
    if (body.prompt.length > 8_000) return jsonError("PROMPT_TOO_LARGE", "Đề bài tối đa 8.000 ký tự.", 413);
    if (body.custom_ai?.provider && body.custom_ai.provider !== "gemini") return jsonError("UNSUPPORTED_PROVIDER", "Chỉ hỗ trợ Google Gemini.", 400);

    const prompt = sanitizeUserText(body.prompt).trim();
    if (detectPromptInjection(prompt).isMalicious) return jsonError("PROMPT_INJECTION_DETECTED", "Đề bài chứa cấu trúc không hợp lệ.", 400);
    const customKey = typeof body.custom_ai?.apiKey === "string" ? body.custom_ai.apiKey.trim() : "";
    const apiKey = customKey || process.env.GEMINI_API_KEY || "";
    if (apiKey.length < 20 || apiKey.length > 512) return jsonError("GEMINI_KEY_REQUIRED", "Hãy cấu hình khóa Gemini trong Cài đặt AI rồi thử lại.", 400);

    const rawModel = typeof body.custom_ai?.model === "string" ? body.custom_ai.model : "gemini-2.5-flash";
    const model = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SPATIAL_PROBLEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: `Phân tích đề sau và tạo dữ liệu MathSTEP:\n${prompt}` }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096, response_mime_type: "application/json" },
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!response.ok) return jsonError("GEMINI_REQUEST_FAILED", "Gemini chưa phân tích được đề này. Hãy kiểm tra cấu hình AI hoặc thử lại.", 502);
    const geminiResponse: unknown = await response.json();
    const problem = parseSpatialGeometryProblem(geminiResponse);
    return NextResponse.json({ ok: true, problem }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Spatial geometry parser]", error instanceof Error ? error.message : "Unknown parser error");
    return jsonError("INVALID_GEMINI_GEOMETRY", "Dữ liệu Gemini trả về chưa đúng cấu trúc hoặc thiếu dữ kiện hình học.", 422);
  }
}
