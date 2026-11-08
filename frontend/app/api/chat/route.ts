import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies, type SupabaseTokens } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { detectPromptInjection, getSafeSocraticFallback, wrapDefensivePrompt } from "@/lib/promptSecurity";
import { retrieveMathKnowledge } from "@/lib/mathRagEngine";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_SOCRATIC_SYSTEM_PROMPT = `Bạn là Trợ lý Socratic TES MathSTEP - gia sư toán học tương tác chuyên sâu cho học sinh THPT Việt Nam (Chương trình GDPT 2018).
Các nguyên tắc sư phạm bắt buộc:
1. Phương pháp Socratic: Đặt câu hỏi gợi mở, gợi ý từng bước theo nấc thang tư duy. Tuyệt đối KHÔNG giải hộ bài toán hoặc đưa ra đáp số cuối cùng ngay lập tức.
2. Chẩn đoán và sửa lỗi: Giúp học sinh tự phát hiện ngộ nhận nhận thức (lỗi chuyển dịch văn bản sang biến số, lỗi trực quan hình không gian, lỗi biến đổi đại số).
3. Bám sát sách giáo khoa Kết nối tri thức: Sử dụng đúng thuật ngữ và phương pháp trong tài liệu RAG được cung cấp.
4. Chuẩn hóa công thức Toán học & Quy tắc khoảng trắng:
   - Bắt buộc dùng cú pháp KaTeX/LaTeX chuẩn: công thức trong dòng kẹp giữa $...$, công thức khối đặt riêng dòng kẹp giữa $$...$$.
   - QUAN TRỌNG: Luôn chèn đúng 1 dấu cách trước và sau ký hiệu $, ví dụ: "điểm $M(2; 3)$ thuộc" (TUYỆT ĐỐI KHÔNG viết dính liền "điểm$M(2; 3)$thuộc").
   - Bên trong công thức, thêm khoảng trắng nhỏ \\, trước dấu mở ngoặc, ví dụ: $N\\,\\left(\\frac{SN}{SB} = \\frac{2}{3}\\right)$ hoặc $SH \\perp (ABCD)$ để các chữ không bị dính sát vào nhau.
5. Tôn trọng người học: Ngôn phong sư phạm ân cần, súc tích, khích lệ tinh thần tự khám phá của học sinh.`;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  // 1. BACKEND RATE LIMITING (Phòng chống DoS và spam API AI)
  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, RATE_LIMIT_RULES.CHAT);
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      {
        detail: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Em thao tác quá nhanh. Vui lòng đợi ${rateLimitStatus.resetSeconds} giây trước khi gửi câu hỏi tiếp theo.`,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimitStatus.resetSeconds.toString(),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  let session: { token: string | null; refreshed: SupabaseTokens | null } = { token: null, refreshed: null };
  try {
    session = await getAccessToken(request);
  } catch {
    // Phiên Supabase không sẵn sàng, tiếp tục kiểm tra nếu có Custom AI Key
  }

  const { token, refreshed } = session;

  try {
    const rawText = await request.text();
    if (rawText.length > 32_000) {
      return responseWithSessionCookies(
        jsonError("REQUEST_TOO_LARGE", "Tin nhắn vượt quá giới hạn cho phép.", 413),
        refreshed
      );
    }

    const payload = JSON.parse(rawText);
    const customAi = payload.custom_ai as {
      provider?: string;
      model?: string;
      apiKey?: string;
    } | undefined;

    const hasCustomKey = Boolean(
      customAi?.apiKey && typeof customAi.apiKey === "string" && customAi.apiKey.trim().length > 10
    );

    if (!token && !hasCustomKey) {
      return jsonError(
        "UNAUTHORIZED",
        "Vui lòng đăng nhập hoặc nhập API Key riêng trong Cài đặt để trò chuyện với Trợ lý Socratic TES.",
        401
      );
    }

    // 2. XSS SANITIZATION: Làm sạch tin nhắn đầu vào
    const rawUserMessage = typeof payload.message === "string" ? payload.message : "";
    const cleanUserMessage = sanitizeUserText(rawUserMessage);

    // 3. PROMPT INJECTION & JAILBREAK DETECTION: Phòng chống bẻ gãy vai trò Socratic
    const injectionCheck = detectPromptInjection(cleanUserMessage);
    if (injectionCheck.isMalicious) {
      // Chặn ngay lập tức tại middleware, trả về phản hồi sư phạm an toàn
      return responseWithSessionCookies(
        NextResponse.json({
          ok: true,
          answer: getSafeSocraticFallback(injectionCheck.reason),
          intent: "security_redirect",
          model_used: "guardrail_firewall",
          source: "prompt_security",
        }),
        refreshed
      );
    }

    // 4. RAG KNOWLEDGE RETRIEVAL: Rút trích tri thức SGK KNTT tương ứng với trạm học
    const moduleId = payload.learning_context?.module || "spatial_geometry";
    const stationId = payload.learning_context?.station_id;
    const learningStage = payload.learning_context?.learning_stage;
    const ragContext = retrieveMathKnowledge(
      moduleId,
      stationId,
      typeof learningStage === "number" ? learningStage : 0,
      cleanUserMessage
    );

    // 5. DEFENSIVE PROMPT WRAPPING: Đóng gói prompt với hàng rào cô lập dữ liệu
    const { systemPrompt, userPrompt } = wrapDefensivePrompt(
      BASE_SOCRATIC_SYSTEM_PROMPT,
      cleanUserMessage,
      ragContext
    );

    // 6. XỬ LÝ GỌI MÔ HÌNH VỚI CUSTOM API KEY (Gemini, OpenAI, DeepSeek)
    if (customAi?.apiKey && typeof customAi.apiKey === "string" && customAi.apiKey.trim().length > 10) {
      const key = customAi.apiKey.trim();

      // A. Google Gemini (Gemini 2.5 Flash, Gemini 2.5 Pro...)
      if (customAi.provider === "gemini") {
        const model = customAi.model || "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [
                {
                  role: "user",
                  parts: [{ text: userPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              },
            }),
            signal: AbortSignal.timeout(45_000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const answerText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answerText) {
            return responseWithSessionCookies(
              NextResponse.json({
                ok: true,
                answer: answerText,
                intent: "guided_socratic",
                model_used: model,
                source: "custom_gemini_rag",
              }),
              refreshed
            );
          }
        }
      }

      // B. OpenAI hoặc DeepSeek
      if (customAi.provider === "openai" || customAi.provider === "deepseek") {
        const baseUrl =
          customAi.provider === "deepseek"
            ? "https://api.deepseek.com/chat/completions"
            : "https://api.openai.com/v1/chat/completions";
        const model =
          customAi.model ||
          (customAi.provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");

        const upstreamRes = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(45_000),
        });

        if (upstreamRes.ok) {
          const upstreamData = await upstreamRes.json();
          const answerText = upstreamData.choices?.[0]?.message?.content;
          if (answerText) {
            return responseWithSessionCookies(
              NextResponse.json({
                ok: true,
                answer: answerText,
                intent: "guided_socratic",
                model_used: model,
                source: "custom_llm_rag",
              }),
              refreshed
            );
          }
        }
      }
    }

    // 7. NẾU CÓ DỊCH VỤ FASTAPI BACKEND
    const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return responseWithSessionCookies(
        jsonError(
          "FASTAPI_NOT_CONFIGURED",
          "Chưa cấu hình dịch vụ AI trung tâm. Vui lòng sử dụng API Key cá nhân trong Cài đặt hoặc trải nghiệm chế độ offline.",
          503
        ),
        refreshed
      );
    }

    const upstream = await fetch(`${baseUrl}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...payload,
        message: cleanUserMessage,
        rag_context: ragContext,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

    const result = await upstream
      .json()
      .catch(() => ({ detail: { code: "AI_RESPONSE_INVALID", message: "Phản hồi dịch vụ chưa hợp lệ." } }));

    return responseWithSessionCookies(
      NextResponse.json(result, { status: upstream.status }),
      refreshed
    );
  } catch {
    return responseWithSessionCookies(
      jsonError("AI_SERVICE_UNAVAILABLE", "Chưa kết nối được linh vật. Hệ thống chuyển sang chế độ tự động.", 502),
      refreshed
    );
  }
}
