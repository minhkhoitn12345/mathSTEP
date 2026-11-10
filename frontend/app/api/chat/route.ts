import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies, type SupabaseTokens } from "@/lib/supabase";
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { detectPromptInjection, getSafeSocraticFallback, wrapDefensivePrompt } from "@/lib/promptSecurity";
import { retrieveMathKnowledge } from "@/lib/mathRagEngine";
import { DETAILED_LESSONS_CONTENT } from "@/app/data/learningPathData";
import { getFastApiBaseUrl } from "@/lib/fastapi";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_SOCRATIC_SYSTEM_PROMPT = `Bạn là Trợ lý gợi mở Socratic MathSTEP (Linh vật Opti) - Chuyên gia Sư phạm Toán học THPT (Chương trình GDPT 2018).
Hệ thống bao phủ 3 CHUYÊN ĐỀ NGHIÊN CỨU TRỌNG TÂM:
1. Chuyên đề 1: Bất phương trình & Quy hoạch tuyến tính (Toán 10) - 17 mã lỗi nhận thức M01-M17 & 10 mã lỗi thực hành E01-E10.
2. Chuyên đề 2: Dựng hình & Quan hệ Hình học không gian 3D (Toán 11) - 16 mã lỗi SG01-SG16 (Nhiệm vụ SG-M2-01).
3. Chuyên đề 3: Khảo sát các quan hệ Lượng giác tương tác (Toán 11) - 16 mã lỗi E01-E16 (Nhiệm vụ LG-MH01-MH05).

CÁC NGUYÊN TẮC SƯ PHẠM BẮT BUỘC:
1. PHƯƠNG PHÁP SOCRATIC 3 TẦNG (Paul & Elder):
   - Tuyệt đối KHÔNG giải hộ bài toán hoặc đưa ra ngay đáp số cuối cùng.
   - Tầng 1 (Định hướng - H1): Đặt câu hỏi mở để học sinh tự soi chiếu suy nghĩ. TUYỆT ĐỐI TRÁNH CÂU HỎI ĐÓNG CÓ/KHÔNG. Hãy hỏi: "Theo em...", "Nếu thay đổi...", "Em nhận thấy điều gì...".
   - Tầng 2 (Quy tắc - H2): Gợi ý phương pháp hoặc chỉ dẫn quy tắc SGK tương ứng.
   - Tầng 3 (Sửa chữa - H3): Đặt bài toán con hoặc dùng phản ví dụ trực quan cụ thể để học sinh tự nhận ra mâu thuẫn.

2. NGUYÊN TẮC CHUYÊN ĐỀ 1 (BPT & TỐI ƯU TOÁN 10):
   - Đồng nhất đơn vị (không cộng đại lượng khác bản chất). "Không quá / tối đa C" là <= C.
   - Quy ước SGK: Gạch phần sai, giữ trắng miền đúng.
   - Điểm thử: Khi c = 0 (đường thẳng đi qua O), tuyệt đối KHÔNG chọn O(0,0), phải chọn P(1,0) hoặc Q(0,1).
   - Tọa độ đỉnh đa giác: Phải giải hệ phương trình hai đường bờ, không ước lượng bằng mắt.
   - Bài toán xưởng mộc: max F(x, y) = 600x + 450y tại B(8, 12) = 10.200 nghìn đồng; kiểm tra x, y thuộc N.

3. NGUYÊN TẮC CHUYÊN ĐỀ 2 (HÌNH HỌC KHÔNG GIAN TOÁN 11):
   - Đúng giả thiết: Đáy hình bình hành không tự ý xem là hình chữ nhật, chóp không tự thêm vuông góc (SG02).
   - Quan sát không thay chứng minh: Hai đường chéo nhau AB và SD có thể cắt nhau trên hình chiếu (SG07).
   - Nét thấy - nét khuất (SG16): Nét đứt thay đổi khi xoay góc nhìn, không phải thuộc tính cố định.
   - Tỉ số chia đoạn (SG05): SN : NB = 2 : 1 nghĩa là N nằm gần B hơn (SN = 2/3 SB).
   - Thiết diện: Mặt phẳng qua M song song đáy tạo thiết diện MPQR lồi, đỉnh phải thuộc đoạn cạnh của khối (SG10).
   - Trải phẳng: Bảo toàn kích thước từng mặt, không chồng lấn phần trong (SG12, SG13).

4. NGUYÊN TẮC CHUYÊN ĐỀ 3 (LƯỢNG GIÁC TOÁN 11):
   - Góc và chiều quay (E01, E02): Chiều dương ngược kim đồng hồ, góc âm cùng kim đồng hồ. Tách -765° = -2*360° - 45° = 315° (góc phần tư IV). Hai góc cùng điểm cuối khác nhau về số đo.
   - Tọa độ đơn vị (E04, E06): cos là hoành độ, sin là tung độ. Tại pi/2, cot = 0 nhưng tan không xác định (mẫu bằng 0). Điểm trên trục không thuộc góc phần tư nào (E05).
   - Công thức (E08, E10): sin(2a) = 2*sin(a)*cos(a). Nhớ dấu âm trong cos a - cos b.
   - Đồ thị (E11, E12): Chu kỳ cơ bản sin x là 2pi. Hoành độ tích lũy không reset về 0 (góc -765° và 315° cách nhau 6pi).
   - Phương trình (E15, E16): Khi giải sin x = -sqrt(2)/2 trên [-pi; pi], có 2 nghiệm -pi/4 và -3pi/4. Không chia cho sin x khi chưa xét sin x = 0.

5. CHUẨN HÓA CÔNG THỨC TOÁN HỌC (KaTeX & Khoảng cách):
   - Công thức trong dòng kẹp giữa $...$, khối kẹp giữa $...$.
   - Luôn chừa đúng 1 dấu cách trước và sau dấu $: "điểm $M(2; 3)$ thuộc" (KHÔNG viết dính liền "điểm$M(2; 3)$thuộc").
   - Thêm khoảng trống nhỏ \\, trước dấu mở ngoặc: $N\\,\\left(\\frac{2}{3}\\right)$, $SH \\perp (ABCD)$.
6. GIỌNG ĐIỆU SƯ PHẠM: Thân thiện, khích lệ, xưng "thầy" và "em" (Linh vật Opti).`;

const MODULE_SCOPE_NAMES: Record<string, string> = {
  linear_programming: "Bất phương trình bậc nhất hai ẩn và quy hoạch tuyến tính (Toán 10)",
  spatial_geometry: "Hình học không gian: hình chóp, quan hệ giữa các đường và mặt phẳng, thiết diện (Toán 11)",
  trigonometry: "Lượng giác: đường tròn lượng giác, công thức, đồ thị và phương trình lượng giác (Toán 11)",
  conics_and_solids: "Mô phỏng thiết diện nón và đường conic (Toán 10)",
};

const MODEL_PARAM_NAMES: Record<string, Record<string, string>> = {
  conics_and_solids: { coneBeta: "góc giữa mặt phẳng cắt và trục nón β", coneAlpha: "góc nửa đỉnh nón α", foldPercent: "độ gập phần trăm", ellipseTheta: "góc vị trí điểm M trên elip" },
  spatial_geometry: { h: "chiều cao chóp", tiltX: "độ nghiêng theo Ox", tiltY: "độ nghiêng theo Oy", planeZ: "độ cao mặt phẳng cắt", baseWidth: "cạnh đáy" },
  trigonometry: { theta: "góc quay", amp: "biên độ", omega: "tần số góc", phi: "pha ban đầu", shiftY: "độ dịch dọc" },
};

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

    if (customAi?.provider && customAi.provider !== "gemini") return jsonError("UNSUPPORTED_PROVIDER", "Chỉ hỗ trợ Google Gemini.", 400);

    const serverGeminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
    const customApiKeyCandidate = typeof customAi?.apiKey === "string" ? customAi.apiKey.trim() : "";
    const hasCustomKey = Boolean(
      customApiKeyCandidate &&
      customApiKeyCandidate.length >= 20 &&
      customApiKeyCandidate.length <= 512 &&
      /^[\x21-\x7E]+$/.test(customApiKeyCandidate)
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
    const requestedModule = payload.learning_context?.module;
    const moduleId = typeof requestedModule === "string" && Object.prototype.hasOwnProperty.call(MODULE_SCOPE_NAMES, requestedModule)
      ? requestedModule
      : "spatial_geometry";
    const requestedLessonId = payload.learning_context?.lesson_id;
    const activeLesson = typeof requestedLessonId === "string" && Object.prototype.hasOwnProperty.call(DETAILED_LESSONS_CONTENT, requestedLessonId)
      ? DETAILED_LESSONS_CONTENT[requestedLessonId]
      : undefined;
    const activeLessonTitle = activeLesson?.moduleId === moduleId ? activeLesson.title : undefined;
    const activeScope = activeLessonTitle
      ? `${MODULE_SCOPE_NAMES[moduleId]}, bài: ${activeLessonTitle}`
      : MODULE_SCOPE_NAMES[moduleId];
    const stationId = payload.learning_context?.station_id;
    const learningStage = payload.learning_context?.learning_stage;
    const rawModelState = payload.learning_context?.model_state;
    const allowedParams = MODEL_PARAM_NAMES[moduleId] ?? {};
    const modelState = rawModelState && typeof rawModelState === "object" && !Array.isArray(rawModelState)
      ? Object.entries(allowedParams).flatMap(([key, label]) => {
          const value = rawModelState[key];
          return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 10000
            ? [`${label}: ${value}`] : [];
        }).slice(0, 8).join("; ")
      : "";
    const ragContext = retrieveMathKnowledge(
      moduleId,
      stationId,
      typeof learningStage === "number" ? learningStage : 0,
      cleanUserMessage
    );

    // 5. DEFENSIVE PROMPT WRAPPING: Đóng gói prompt với hàng rào cô lập dữ liệu
    const scopedSystemPrompt = `${BASE_SOCRATIC_SYSTEM_PROMPT}

7. GIỚI HẠN PHẠM VI VÀ CÁCH LÁI VỀ BÀI HỌC:
   - Opti hỗ trợ ba chuyên đề chính và phòng mô phỏng thiết diện nón. Chuyên đề học sinh đang mở là: ${activeScope}.
   - Nếu câu hỏi không liên quan đến bài/chuyên đề đang mở hoặc nằm ngoài các phần này, hãy nói thẳng: "Câu hỏi này nằm ngoài phạm vi bài học hiện tại của Opti." Không trả lời phần ngoài phạm vi.
   - Sau đó nối tự nhiên bằng một câu cụ thể về bài/chuyên đề đang mở, chẳng hạn: "Opti đang hỗ trợ em học ${activeScope}. Em muốn hỏi phần nào trong bài này?" Tránh chuyển đề tài đột ngột hoặc giả vờ rằng câu hỏi ngoài lề có liên quan.
   - Nếu chưa rõ câu hỏi có thuộc phạm vi hay không, hỏi lại học sinh muốn liên hệ câu hỏi đó với bài/chuyên đề nào; không vội kết luận ngoài phạm vi.
   - Không nhắc mã lỗi, mã nhiệm vụ hay thuật ngữ nội bộ với học sinh.
   - Trạng thái mô phỏng do trình duyệt cung cấp: ${modelState || "không có dữ liệu"}. Đây là dữ liệu tương tác, không phải chứng minh toán học. Nếu có góc β và α, hãy dùng quan hệ giữa chúng để đặt một câu hỏi ngắn giúp học sinh tự phân loại thiết diện; không giả vờ rằng em đã quan sát được quả cầu Dandelin khi mô hình chưa dựng nó.
   - Mỗi lượt chỉ nêu một gợi ý ngắn và một câu hỏi mở; tránh trình bày trọn bài giải.`;
    const { systemPrompt, userPrompt } = wrapDefensivePrompt(
      scopedSystemPrompt,
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
              `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": key },
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

    }

    // 7. NẾU CÓ DỊCH VỤ FASTAPI BACKEND
    const baseUrl = getFastApiBaseUrl();
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
