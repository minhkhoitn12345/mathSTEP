import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies, type SupabaseTokens } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const SOCRATIC_SYSTEM_PROMPT = `Bạn là Trợ lý Socratic TES MathSTEP - gia sư toán học tương tác chuyên sâu cho học sinh THPT Việt Nam (Chương trình GDPT 2018).
Các nguyên tắc sư phạm bắt buộc:
1. Phương pháp Socratic: Đặt câu hỏi gợi mở, gợi ý từng bước theo nấc thang tư duy. Tuyệt đối KHÔNG giải hộ bài toán hoặc đưa ra đáp số cuối cùng ngay lập tức.
2. Chẩn đoán và sửa lỗi: Giúp học sinh tự phát hiện ngộ nhận nhận thức (lỗi chuyển dịch văn bản sang biến số, lỗi trực quan hình không gian, lỗi biến đổi đại số).
3. Chuẩn hóa công thức Toán học: Bắt buộc dùng cú pháp KaTeX/LaTeX chuẩn: công thức trong dòng kẹp giữa $...$, công thức khối đặt riêng dòng kẹp giữa $$...$$.
4. Tôn trọng người học: Ngôn phong sư phạm ân cần, súc tích, khích lệ tinh thần tự khám phá của học sinh.`;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

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
      return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập hoặc nhập API Key riêng trong Cài đặt để trò chuyện với Trợ lý Socratic TES.", 401);
    }

    // 1. NẾU NGƯỜI DÙNG CẤU HÌNH API KEY RIÊNG (Gemini, OpenAI, DeepSeek...)
    if (customAi?.apiKey && typeof customAi.apiKey === "string" && customAi.apiKey.trim().length > 10) {
      const key = customAi.apiKey.trim();
      const userMessage = payload.message || "";
      const contextDesc = `[Chủ đề: ${payload.learning_context?.module || "Toán THPT"}, Bước học: ${payload.learning_context?.learning_stage || "Khám phá"}]`;

      // A. Google Gemini (Gemini 2.5 Flash, Gemini 2.5 Pro...)
      if (customAi.provider === "gemini") {
        const model = customAi.model || "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SOCRATIC_SYSTEM_PROMPT }] },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${contextDesc}\n\nHọc sinh hỏi/thao tác: ${userMessage}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
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
                source: "custom_gemini",
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
              { role: "system", content: SOCRATIC_SYSTEM_PROMPT },
              { role: "user", content: `${contextDesc}\nHọc sinh: ${userMessage}` },
            ],
            temperature: 0.4,
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
                source: "custom_llm",
              }),
              refreshed
            );
          }
        }
      }
    }

    // 2. NẾU KHÔNG CÓ CUSTOM API KEY HOẶC CÓ FASTAPI BACKEND
    const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return responseWithSessionCookies(
        jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình dịch vụ AI trung tâm. Vui lòng sử dụng API Key cá nhân hoặc chế độ Offline Socratic.", 503),
        refreshed
      );
    }

    const upstream = await fetch(`${baseUrl}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: rawText,
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
