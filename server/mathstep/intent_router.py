from .contracts import ChatRequest


RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("hint", ("không biết làm", "gợi ý", "làm tiếp", "bắt đầu từ đâu", "hint")),
    ("diagnose", ("đúng không", "sai ở đâu", "kiểm tra bài", "em làm như này", "chỗ nào sai")),
    ("practice", ("bài tương tự", "cho em bài", "luyện tập", "bài tập khác")),
    ("reflect", ("đã hiểu", "tóm tắt lại", "em hiểu chưa", "tự đánh giá")),
    ("simulation_help", ("mô hình", "điểm này", "kéo điểm", "xoay hình", "miền nghiệm")),
    ("explain", ("là gì", "giải thích", "vì sao", "tại sao", "khái niệm")),
)


def detect_intent(request: ChatRequest) -> str:
    message = request.message.casefold()
    for intent, phrases in RULES:
        if any(phrase in message for phrase in phrases):
            return intent
    if request.learning_context.student_work and request.learning_context.student_work.answer:
        return "diagnose"
    return "general"
