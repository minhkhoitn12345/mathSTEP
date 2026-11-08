import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies, type SupabaseTokens } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { detectPromptInjection, getSafeSocraticFallback, wrapDefensivePrompt } from "@/lib/promptSecurity";
import { retrieveMathKnowledge } from "@/lib/mathRagEngine";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_SOCRATIC_SYSTEM_PROMPT = `Bạn là Trợ lý gợi mở Socratic MathSTEP (Linh vật Opti) - Chuyên gia Sư phạm Toán học THPT (Chương trình GDPT 2018).
Hệ thống vận hành dựa trên 4 trụ cột lý luận khoa học: Raymond Duval (Chuyển đổi hệ thống biểu đạt), Newman (5 tầng lỗi R-C-T-P-E), George Polya (4 bước giải & 3 phương diện Nhìn lại), và Paul & Elder (Hệ thống câu hỏi Socratic không mớm lời).

CÁC NGUYÊN TẮC SƯ PHẠM BẮT BUỘC:
1. PHƯƠNG PHÁP SOCRATIC 3 TẦNG (Paul & Elder):
   - Tuyệt đối KHÔNG giải hộ bài toán hoặc đưa ra ngay đáp số cuối cùng.
   - Tầng 1 (Định hướng - H1): Đặt câu hỏi mở để học sinh tự soi chiếu suy nghĩ. TUYỆT ĐỐI TRÁNH CÂU HỎI ĐÓNG CÓ/KHÔNG ("Em có hiểu không?", "Điểm này có thuộc không?"). Hãy hỏi: "Theo em...", "Nếu thay tọa độ thì...", "Em nhận thấy điều gì...".
   - Tầng 2 (Quy tắc - H2): Gợi ý phương pháp hoặc chỉ dẫn quy tắc SGK tương ứng.
   - Tầng 3 (Sửa chữa - H3): Đặt bài toán con hoặc dùng phản ví dụ trực quan cụ thể để học sinh tự nhận ra mâu thuẫn.

2. ĐỊNH VỊ TẦNG LỖI NEWMAN ĐỂ CAN THIỆP ĐÚNG CHỖ:
   - Tầng Hiểu đề (C): Nếu học sinh chưa biết gọi ẩn x, y là đại lượng nào -> Hỏi câu hỏi cuối của đề bài.
   - Tầng Chuyển hóa (T): Dịch từ tự nhiên sang đại số -> Nhắc nhở quy tắc đồng nhất đơn vị (không cộng protein với lipit); "không quá / tối đa C" là <= C; "ít nhất / tối thiểu" là >= C.
   - Tầng Kỹ năng thực hiện (P): Nhầm hoành/tung độ; vẽ đoạn thẳng cụt; quên nét đứt (<, >); chọn điểm thử O(0;0) khi đường bờ đi qua gốc tọa độ.
   - Tầng Kết luận (E): Bỏ quên điều kiện nguyên (x, y thuộc N) trong bài toán thực tế đếm đồ vật (số bàn, số ghế).

3. TIẾN TRÌNH 4 BƯỚC POLYA & 3 PHƯƠNG DIỆN NHÌN LẠI (LOOKING BACK):
   - Khi học sinh tìm ra đáp án, luôn hướng dẫn học sinh Nhìn lại (Bước 4 Polya):
     + Phương diện 1: Kiểm tra tính thỏa mãn đại số và tính hợp lý thực tiễn (đơn vị nghìn/triệu đồng, x và y nguyên).
     + Phương diện 2: Tối ưu hóa cách trình bày (rút gọn hệ số, chọn tỉ lệ trục Oxy).
     + Phương diện 3: Khai thác mở rộng (Nếu thay đổi tiền lãi của sản phẩm thì miền đa giác có đổi không? Ta chỉ cần tính lại bước nào?).

4. QUY ƯỚC TOÁN HỌC SGK VIỆT NAM (KNTT, CTST, CÁNH DIỀU):
   - Miền nghiệm: Gạch bỏ phần không thỏa mãn, phần giữ trắng là miền nghiệm.
   - Đường bờ: Có dấu bằng (<=, >=) vẽ NÉT LIỀN (kể cả bờ); Dấu ngặt (<, >) vẽ NÉT ĐỨT (không kể bờ).
   - Điểm thử: Bắt buộc không thuộc đường bờ. Khi c = 0 (đường thẳng đi qua gốc tọa độ O), TUYỆT ĐỐI KHÔNG CHỌN O(0; 0); phải chọn P(1; 0) hoặc Q(0; 1).
   - Tọa độ đỉnh đa giác: Phải giải hệ phương trình hai đường bờ, KHÔNG ước lượng bằng mắt thường.

5. CHUẨN HÓA CÔNG THỨC TOÁN HỌC (KaTeX & Khoảng cách):
   - Công thức trong dòng kẹp giữa $...$, khối kẹp giữa $...$.
   - Luôn chừa đúng 1 dấu cách trước và sau dấu $: "điểm $M(2; 3)$ thuộc" (KHÔNG viết dính liền "điểm$M(2; 3)$thuộc").
   - Thêm khoảng trống nhỏ \, trước dấu mở ngoặc: $N\,\left(\frac{2}{3}\right)$, $SH \perp (ABCD)$.
6. GIỌNG ĐIỆU SƯ PHẠM: Thân thiện, tôn trọng, đồng hành cùng bạn nhỏ (Linh vật Opti), khích lệ sự tự chủ của học sinh.`;

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
    // Budget & DoS Protection: Giới hạn tối đa 12.000 ký tự cho mỗi lượt hỏi đáp Socratic
    if (rawText.length > 12_000) {
      return responseWithSessionCookies(
        jsonError("REQUEST_TOO_LARGE", "Nội dung câu hỏi quá dài (tối đa 12.000 ký tự).", 413),
        refreshed
      );
    }

    const payload = JSON.parse(rawText);
    const customAi = payload.custom_ai as {
      provider?: string;
      model?: string;
      apiKey?: string;
    } | undefined;

    const serverGeminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
    const hasCustomKey = Boolean(
      customAi?.apiKey && typeof customAi.apiKey === "string" && customAi.apiKey.trim().length > 10
    );

    if (!token && !hasCustomKey && !serverGeminiKey) {
      return jsonError(
        "UNAUTHORIZED",
        "Vui lòng đăng nhập hoặc cấu hình API Key riêng trong Cài đặt để tiếp tục trao đổi với Trợ lý Socratic.",
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

    // 6. XỬ LÝ GỌI MÔ HÌNH VỚI CUSTOM API KEY HOẶC SERVER DEFAULT GEMINI KEY
    const effectiveApiKey = hasCustomKey ? customAi!.apiKey!.trim() : serverGeminiKey;
    const effectiveProvider = hasCustomKey ? (customAi?.provider || "gemini") : "gemini";
    const effectiveModel = hasCustomKey ? (customAi?.model || "gemini-3-flash-preview") : "gemini-3-flash-preview";

    if (effectiveApiKey && effectiveApiKey.length > 10) {
      const key = effectiveApiKey;

      // A. Google Gemini (Gemini 3 Flash, Gemini 3.5 Flash Lite...)
      if (effectiveProvider === "gemini") {
        const rawModel = effectiveModel || "gemini-3-flash-preview";
        const model = rawModel.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64) || "gemini-3-flash-preview";
        
        // Tự động fallback sang các model thế hệ mới nếu model cũ bị deprecated
        const candidateModels = [model, "gemini-3-flash-preview", "gemini-3.5-flash-lite"].filter(
          (m, idx, arr) => arr.indexOf(m) === idx
        );

        for (const candidateModel of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${encodeURIComponent(key)}`,
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
                    model_used: candidateModel,
                    source: hasCustomKey ? "custom_gemini_rag" : "server_gemini_rag",
                  }),
                  refreshed
                );
              }
            }
          } catch {}
        }
      }

      // B. OpenAI hoặc DeepSeek
      if (effectiveProvider === "openai" || effectiveProvider === "deepseek") {
        const baseUrl =
          effectiveProvider === "deepseek"
            ? "https://api.deepseek.com/chat/completions"
            : "https://api.openai.com/v1/chat/completions";
        const model =
          effectiveModel ||
          (effectiveProvider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");

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
            temperature: 0.4,
            max_tokens: 2048,
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
                source: hasCustomKey ? "custom_llm_rag" : "server_llm_rag",
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
      jsonError("AI_SERVICE_UNAVAILABLE", "Chưa kết nối được máy chủ trợ lý. Hệ thống chuyển sang chế độ tự động.", 502),
      refreshed
    );
  }
}
