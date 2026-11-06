from __future__ import annotations

import re
import unicodedata

from .contracts import ChatRequest


# Từ điển chuẩn hóa từ lóng, viết tắt Gen Z và thuật ngữ Toán phổ thông
GENZ_MATH_MAP: dict[str, str] = {
    # Thuật ngữ toán học phổ biến
    "bpt": "bat phuong trinh",
    "pt": "phuong trinh",
    "hpt": "he phuong trinh",
    "dk": "dieu kien",
    "toado": "toa do",
    "td": "toa do",
    "gtln": "gia tri lon nhat",
    "gtnn": "gia tri nho nhat",
    "gttn": "gia tri nho nhat",
    "mn": "mien nghiem",
    "dtb": "duong bien",
    "hmt": "ham muc tieu",
    "dt": "duong thang",
    "mp": "mat phang",
    "lg": "luong giac",
    "dtlg": "duong tron luong giac",
    "hhkg": "hinh hoc khong gian",
    "vg": "vuong goc",
    "ss": "song song",
    "ct": "cong thuc",
    "dl": "dinh ly",
    "th": "truong hop",
    "bdt": "bat dang thuc",
    "vt": "ve trai",
    "vp": "ve phai",
    "bbt": "bang bien thien",
    "cd": "cuc dai",
    "ct": "cuc tieu",
    "tc": "tiem can",
    "tcd": "tiem can dung",
    "tcn": "tiem can ngang",
    "dh": "dao ham",
    "nh": "nguyen ham",
    "tp": "tich phan",
    "xs": "xac suat",
    "kgm": "khong gian mau",
    "bc": "bien co",
    "tt": "tiep tuyen",
    # Từ ngữ xưng hô, giao tiếp và trợ giúp của học sinh Gen Z
    "k": "khong",
    "ko": "khong",
    "kh": "khong",
    "hong": "khong",
    "hom": "khong",
    "k0": "khong",
    "dc": "duoc",
    "chx": "chua",
    "mk": "minh",
    "mik": "minh",
    "vs": "voi",
    "lm": "lam",
    "s": "sao",
    "v": "vay",
    "z": "vay",
    "thk": "thay",
    "ad": "tro giang",
    "bot": "tro giang",
    "oke": "da hieu",
    "okela": "da hieu",
    "oki": "da hieu",
    "uk": "da hieu",
    "uhm": "da hieu",
    "helpp": "goi y",
    "help": "goi y",
    "cuu": "goi y",
    "check": "kiem tra bai",
    "nx": "nua",
    "ik": "di",
    "nha": "nhe",
    "nhe": "nhe",
    "nhoe": "nhe",
    "nhi": "nhe",
    "j": "gi",
    "cx": "cung",
}

RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    (
        "diagnose",
        (
            "dung khong",
            "dung k",
            "dung chua",
            "sai o dau",
            "sai k",
            "kiem tra bai",
            "kiem tra giup",
            "check e",
            "check giup",
            "check ho",
            "em lam nhu nay",
            "em lam the nay",
            "cho nao sai",
            "ket qua nay",
            "loi sai",
            "em tinh ra",
            "dap an la",
            "em chon",
            "co dung k",
            "sao sai",
            "tinh dung chua",
        ),
    ),
    (
        "hint",
        (
            "khong biet lam",
            "ko biet lam",
            "chua biet lam",
            "kho qua",
            "bi qua",
            "goi y",
            "cho e goi y",
            "cho em goi y",
            "hint",
            "lam tiep",
            "buoc tiep theo",
            "chi e voi",
            "chi e cach lam",
            "chi em voi",
            "bat dau tu dau",
            "bat dau sao",
            "nen lam gi",
            "go mo",
            "huong dan",
            "cuu e",
            "help",
            "giup e",
        ),
    ),
    (
        "practice",
        (
            "bai tuong tu",
            "cho em bai",
            "cho e bai",
            "luyen tap",
            "bai tap khac",
            "ra bai",
            "bai moi",
            "them bai",
            "cho xin bai",
            "bai tap nua",
            "luyen them",
        ),
    ),
    (
        "reflect",
        (
            "da hieu",
            "em hieu roi",
            "hieu r",
            "thi ra la vay",
            "ok roi",
            "ok r",
            "tom tat lai",
            "em hieu chua",
            "tu danh gia",
            "rut ra dieu gi",
            "tong ket",
        ),
    ),
    (
        "simulation_help",
        (
            "huong dan mo hinh",
            "cach keo diem",
            "keo diem",
            "xoay hinh",
            "cach xoay",
            "mo phong",
            "thao tac mo hinh",
            "ve lai do thi",
            "xem tren do thi",
            "tren do thi",
            "xem mo hinh",
            "chinh slider",
            "thanh truot",
        ),
    ),
    (
        "explain",
        (
            "la gi",
            "la sao",
            "giai thich",
            "vi sao",
            "tai sao",
            "sao lai",
            "khai niem",
            "dinh nghia",
            "chung minh",
            "phan biet",
            "cong thuc",
            "khong hieu",
            "ko hieu",
            "chua hieu",
            "chx hieu",
            "hong hieu",
        ),
    ),
    (
        "clarification_needed",
        (
            "chua ro cau hoi",
            "chua hieu de",
            "khong hieu cau hoi",
            "khong biet noi gi",
            "chua ro y",
            "y thay la gi",
            "y co la gi",
            "hoi gi the",
            "hoi j the",
            "hoi gi vay",
            "khong hieu gi het",
        ),
    ),
)

MATH_SHORT_VALID_ANSWERS: frozenset[str] = frozenset({
    "thuoc", "khong thuoc", "co", "khong", "dung", "sai", "thoa man", "khong thoa man",
    "nghiem", "vo nghiem", "vo so nghiem", "song song", "vuong goc", "cat nhau", "trung nhau",
    "dong phang", "cuc dai", "cuc tieu", "lon nhat", "nho nhat", "dap an", "chon", "am", "duong"
})

GREETINGS: frozenset[str] = frozenset({
    "chao", "xin chao", "hi", "hello", "halo", "chao ban", "chao thay", "chao co", "hi bot"
})


def _normalize(text: str) -> str:
    """Loại bỏ dấu tiếng Việt, chuyển chữ thường và chuẩn hóa từ lóng Gen Z / thuật ngữ viết tắt."""
    decomposed = unicodedata.normalize("NFD", text.casefold())
    without_marks = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    cleaned = without_marks.replace("đ", "d")

    # Thay thế các từ viết tắt và tiếng lóng Gen Z
    tokens = re.findall(r"\b\w+\b|[^\w\s]", cleaned)
    expanded = [GENZ_MATH_MAP.get(token, token) for token in tokens]
    return " ".join(expanded)


def is_low_information_or_ambiguous(raw_text: str, previous_turn_content: str | None = None) -> bool:
    """Xác định tin nhắn của học sinh có mơ hồ, rời rạc, vô nghĩa hoặc thiếu ngữ cảnh trầm trọng hay không."""
    cleaned = raw_text.strip()
    if not cleaned:
        return True

    # Ký tự lặp vô nghĩa (ví dụ: 22222222, aaaaaa, ......, ????)
    if re.search(r"(.)\1{3,}", cleaned):
        return True

    # Toàn dấu câu hoặc biểu cảm mặt cười không chứa chữ cái hoặc số toán học
    if not re.search(r"[a-zA-Z0-9]", cleaned):
        return True

    # Multiline fragments: dán nhiều dòng ngắn vô nghĩa hoặc rời rạc (ví dụ: m \n 22222222 \n EM \n T)
    lines = [l.strip() for l in cleaned.splitlines() if l.strip()]
    if len(lines) >= 3 and all(len(line) <= 4 or re.match(r"^(\d)\1+$", line) for line in lines):
        return True

    # Bàn phím gõ ngẫu nhiên (keyboard mash): 5 phụ âm liên tiếp không hợp lệ
    if re.search(r"\b[bcdfghjklmnpqrstvwxyz]{5,}\b", cleaned.lower()):
        return True

    norm = _normalize(cleaned)
    tokens = re.findall(r"\b\w+\b", norm)

    # Nếu là câu chào
    if norm in GREETINGS:
        return False

    # Nếu câu trước có hỏi trắc nghiệm (A, B, C, D) và tin nhắn là một chữ cái lựa chọn
    if previous_turn_content and any(marker in previous_turn_content for marker in ("A.", "B.", "A, B", "đáp án", "phương án")):
        if cleaned.upper() in {"A", "B", "C", "D", "1", "2", "3", "4"}:
            return False

    # Chứa ký hiệu biểu thức toán học rõ ràng: =, <, >, <=, >=, +, -, *, /, (, )
    has_math_symbols = bool(re.search(r"[=<>]|[+\-*/]\s*\d|\(\s*[-+]?\d+", cleaned))
    if has_math_symbols:
        return False

    # Nếu số từ rất ít (<= 2 từ) và không chứa từ khóa toán học ngắn hợp lệ
    if len(tokens) <= 2:
        has_valid_math = any(kw in norm for kw in MATH_SHORT_VALID_ANSWERS)
        if not has_valid_math:
            return True

    # Nếu tất cả token đều chỉ có 1 ký tự và không có ký hiệu toán
    if all(len(t) <= 1 for t in tokens) and not has_math_symbols:
        return True

    return False


def detect_intent(request: ChatRequest) -> str:
    message = _normalize(request.message)
    previous_content = ""
    if request.history:
        previous_turn = request.history[-1]
        if previous_turn.role.value == "assistant":
            previous_content = previous_turn.content

    # 1. Câu chào mở đầu
    if message in GREETINGS:
        return "general"

    # 2. Kiểm tra nếu tin nhắn là vô nghĩa, gõ phím ngẫu nhiên, spam hoặc thiếu ngữ cảnh trầm trọng
    if is_low_information_or_ambiguous(request.message, previous_content):
        return "clarification_needed"

    # 3. Kiểm tra các quy tắc intent tiêu chuẩn
    for intent, phrases in RULES:
        if any(phrase in message for phrase in phrases):
            return intent

    # 4. Kiểm tra bài làm của học sinh trong context
    if request.learning_context.student_work and request.learning_context.student_work.answer:
        return "student_response"

    # 5. Nếu lượt trước trợ giảng đặt câu hỏi và tin nhắn hiện tại có nghĩa
    if previous_content and "?" in previous_content:
        return "student_response"

    return "general"
