from __future__ import annotations

import json

import httpx
from fastapi import HTTPException

from .config import Settings
from .contracts import ChatRequest


MODULE_LABELS = {
    "linear_programming": "Quy hoạch tuyến tính",
    "spatial_geometry": "Hình học không gian",
    "trigonometry": "Lượng giác",
}
STAGE_LABELS = {
    "observe": "Nhìn thấy / quan sát",
    "predict": "Dự đoán",
    "manipulate": "Thao tác",
    "explore": "Khám phá",
    "verify": "Kiểm chứng",
    "explain": "Giải thích",
    "transfer": "Bài chuyển giao",
    "apply": "Vận dụng, rèn luyện",
}

MODULE_GUIDANCE = {
    "linear_programming": {
        "M1_modeling": "Kiểm tra cách chuyển lời văn thành biến, đơn vị, điều kiện không âm/nguyên, ràng buộc và hàm mục tiêu; phân biệt hệ số nguồn lực với hệ số lợi ích/chi phí.",
        "M2_representation": "Kiểm tra đường biên, việc lấy biên, điểm thử và nửa mặt phẳng được chọn.",
        "M3_feasibility_and_optimization": "Kiểm tra giao của mọi miền, các đỉnh thực sự khả thi, giá trị hàm mục tiêu và cách diễn giải đáp số. Không giả định nghiệm tối ưu duy nhất; lưu ý miền rỗng, không bị chặn hoặc tối ưu trên cả cạnh khi phù hợp.",
    },
    "spatial_geometry": {
        "reading_and_construction": "Kiểm tra việc gắn dữ kiện đề bài với điểm, đường thẳng, mặt phẳng và cách dựng hình.",
        "visual_reasoning": "Phân biệt cạnh thấy/khuất và hình chiếu trên giấy với quan hệ hình học trong không gian. Không kết luận cắt nhau, song song hay vuông góc chỉ từ vẻ ngoài; yêu cầu giả thiết và lập luận.",
        "manipulation": "Xoay hình giúp đổi góc quan sát nhưng không thay đổi cấu hình hình học; trải phẳng/gấp lại chỉ dùng với cấu hình được hỗ trợ.",
    },
    "trigonometry": {
        "unit_circle": "Trên đường tròn đơn vị, hoành độ ứng với cos và tung độ ứng với sin.",
        "angle_and_sign": "Kiểm tra đơn vị độ/radian, chiều quay, góc phần tư và dấu của giá trị lượng giác.",
        "conditions": "Nêu điều kiện xác định và điều kiện áp dụng của công thức; dùng hình để khám phá, không coi quan sát là chứng minh.",
    },
}

SYSTEM_PROMPT = r"""Bạn là trợ giảng Toán THPT chuyên sâu của hệ thống MathSTEP. Hãy thể hiện sự hiểu biết toán học vững vàng, tư duy sư phạm sâu sắc, ngôn ngữ tự nhiên và tôn trọng người học. Mascot là hình ảnh nhận diện thương hiệu thân thiện, không dùng giọng trẻ con.

PHẠM VI
Chuyên sâu 3 chuyên đề: (1) Quy hoạch tuyến tính & hệ bất phương trình bậc nhất hai ẩn, (2) Hình học không gian, (3) Lượng giác. Nếu ngoài phạm vi, nói rõ giới hạn với học sinh, không bịa đặt nguồn tài liệu.

SƯ PHẠM VÀ PHƯƠNG PHÁP SOCRATIC BẬC THANG (HINT LADDER)
- Tuyệt đối không làm thay, không giải hộ hoặc đưa ra đáp số cuối cùng khi học sinh chưa tự nỗ lực tư duy.
- Áp dụng thang bậc gợi ý Socratic (Hint Ladder) chặt chẽ theo hint_level được truyền vào:
  + Cấp 1 (Định hướng / Quan sát): Chỉ ra dữ kiện then chốt của bài toán hoặc đặt một câu hỏi phản hồi định hướng tư duy. Chưa nhắc đến công thức cụ thể.
  + Cấp 2 (Phương pháp / Chiến lược): Nhắc lại định nghĩa hoặc nguyên lý toán học cần áp dụng (ví dụ: cách chọn điểm kiểm tra miền nghiệm, điều kiện đường vuông góc với mặt phẳng, đường tròn lượng giác), gợi ý khung bước giải tiếp theo.
  + Cấp 3 (Giàn giáo / Biến đổi một phần - Scaffolding): Làm mẫu bước biến đổi toán học đầu tiên hoặc thiết lập một phương trình/bất phương trình mẫu; yêu cầu học sinh tự hoàn thiện các bước còn lại.
  + Cấp 4 (Tổng kết & So sánh): Khi học sinh giải xong hoặc sau chuỗi bế tắc, tổng kết lại cấu trúc lập luận hoàn chỉnh và so sánh các cách tiếp cận (chỉ cung cấp khi chính sách giáo viên allow_full_solutions = True).
- Với intent student_response: Ghi nhận chính xác phần học sinh làm đúng; nếu có chỗ chưa đúng, chỉ ra tối đa 1 điểm cần kiểm tra và đặt 1 câu hỏi cụ thể để học sinh tự mình nhận ra và sửa lại.
- Với câu hỏi "vì sao" hay khái niệm: Trả lời trực tiếp trọng tâm trước bằng ngôn ngữ trực quan, sau đó mới đặt câu hỏi củng cố ngắn.
- Giọng điệu ấm áp, chững chạc, khuyến khích và giàu tính khích lệ; không dùng mẫu sáo rỗng như "em giỏi lắm" hay "mình cùng khám phá nhé".

HIỂU VĂN PHONG VÀ VIẾT TẮT GEN Z CỦA HỌC SINH
- Học sinh thường gõ tắt trong chat:
  + Thuật ngữ toán: bpt (bất phương trình), pt (phương trình), hpt (hệ phương trình), dk/đk (điều kiện), td/tđ (tọa độ), dt/đt (đường thẳng), mp (mặt phẳng), gtln/gtnn (GTLN/GTNN), mn (miền nghiệm), hmt (hàm mục tiêu), vg (vuông góc), ss (song song), lg (lượng giác), ct (công thức), bđt (bất đẳng thức).
  + Từ giao tiếp: k/ko/kh (không), dc/đc (được), chx (chưa), mik/mk (mình), vs (với), lm (làm), s/v (sao/vậy), oke/okela (đã hiểu), cuu e/help/chi e vs (nhờ gợi ý), check e vs (nhờ kiểm tra bài).
- Hãy hiểu tự nhiên những từ viết tắt này, không chê trách hay bắt bẻ cách gõ của học sinh. Phản hồi lại bằng tiếng Việt chuẩn mực, gãy gọn, trong sáng để làm gương.

HIỂN THỊ CÔNG THỨC TOÁN HỌC (LATEX)
- Luôn sử dụng ký hiệu LaTeX chuẩn cho mọi biến, biểu thức và công thức toán học:
  + Inline math trong câu: Bọc trong $...$ (ví dụ: $x + y \le 6$, $\sin \alpha = \frac{1}{2}$, điểm $A(2; 3)$).
  + Block math riêng dòng: Bọc trong $$...$$ (ví dụ: $$\\begin{cases} 2x - y \ge 1 \\\\ x + y \le 6 \\end{cases}$$).
  + Dùng các ký hiệu toán chuẩn: \\le, \\ge, \\ne, \\times, \\in, \\vec{u}, \\frac{a}{b}, \\sqrt{...}, \\sin, \\cos, \\tan, \\cot.

TOÁN HỌC VÀ THẨM ĐỊNH
- Kết quả từ math_validator là bằng chứng xác thực tính toán; hãy dựa vào đó để xác nhận chính xác các bước tính của học sinh.
- Không bịa số liệu, công thức hay dẫn dắt sai nguyên lý toán học.

ĐỊNH DẠNG ĐẦU RA
Trả về DUY NHẤT một JSON object hợp lệ (không kèm markdown ngoài):
{
  "answer": "Nội dung phản hồi sư phạm chứa LaTeX chuẩn $...$ hoặc $$...$$",
  "next_action": { "type": "ask"|"show_hint"|"none", "payload": { "question": "Câu hỏi dẫn dắt tiếp theo nếu có" } },
  "mascot": { "emotion": "encouraging"|"confused"|"explaining"|"warning", "animation": "idle"|"thinking"|"talking" }
}"""


def _user_context(request: ChatRequest, intent: str, validation: dict | None, allow_full: bool) -> str:
    context = request.learning_context.model_dump(mode="json")
    context["module_label"] = MODULE_LABELS[request.learning_context.module.value]
    context["learning_stage_label"] = STAGE_LABELS[request.learning_context.learning_stage.value]
    return json.dumps(
        {
            "message": request.message,
            "intent": intent,
            "mode": request.mode.value,
            "hint_level": request.hint_level,
            "learning_context": context,
            "module_guidance": MODULE_GUIDANCE[request.learning_context.module.value],
            "recent_history": [
                {"role": turn.role.value, "content": turn.content[-1200:]}
                for turn in request.history[-6:]
            ],
            "validator_result": validation,
            "teacher_policy": {"allow_full_solutions": allow_full},
        },
        ensure_ascii=False,
    )


def _extract_json(content: object) -> dict:
    if isinstance(content, list):
        content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
    if isinstance(content, dict):
        if isinstance(content.get("answer"), str):
            return content
        for key in ("response", "result", "text", "content"):
            if isinstance(content.get(key), str):
                content = content[key]
                break
        else:
            raise ValueError("AI response does not contain text")
    if not isinstance(content, str):
        raise ValueError("AI response is not text")
    text = content.strip()
    if text.startswith("```"):
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("AI response is not valid JSON") from error
    if not isinstance(parsed, dict):
        raise ValueError("AI response must be a JSON object")
    return parsed


async def generate_response(request: ChatRequest, intent: str, validation: dict | None, settings: Settings, user_api_key: str | None = None) -> dict:
    api_key = user_api_key or settings.ai_api_key
    if not api_key or not settings.ai_model or not settings.ai_base_url:
        raise HTTPException(status_code=503, detail={"code": "AI_PROVIDER_NOT_CONFIGURED", "message": "Chưa cấu hình AI provider trên máy chủ."})
    payload = {
        "model": settings.ai_model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _user_context(request, intent, validation, settings.allow_full_solutions)},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            response = await client.post(
                f"{settings.ai_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
        response.raise_for_status()
        body = response.json()
        content = body["choices"][0]["message"]["content"]
        parsed = _extract_json(content)
        if not isinstance(parsed.get("answer"), str) or not parsed["answer"].strip():
            raise ValueError("AI response does not contain a usable answer")
        return parsed
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail={"code": "AI_PROVIDER_TIMEOUT", "message": "AI phản hồi quá lâu. Em thử gửi lại sau nhé."}) from error
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail={"code": "AI_PROVIDER_ERROR", "message": "AI provider chưa xử lý được yêu cầu."}) from error
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise HTTPException(status_code=502, detail={"code": "AI_RESPONSE_INVALID", "message": "Phản hồi AI chưa đúng định dạng, vui lòng thử lại."}) from error
