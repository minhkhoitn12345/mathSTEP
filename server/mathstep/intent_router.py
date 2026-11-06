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
            "mo hinh",
            "diem nay",
            "keo diem",
            "xoay hinh",
            "mien nghiem",
            "mo phong",
            "do thi",
            "duong tron luong giac",
            "ve hinh",
            "ve do thi",
            "truc oxy",
            "duong bien",
            "duong muc",
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
)


def _normalize(text: str) -> str:
    """Loại bỏ dấu tiếng Việt, chuyển chữ thường và chuẩn hóa từ lóng Gen Z / thuật ngữ viết tắt."""
    decomposed = unicodedata.normalize("NFD", text.casefold())
    without_marks = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    cleaned = without_marks.replace("đ", "d")

    # Thay thế các từ viết tắt và tiếng lóng Gen Z
    tokens = re.findall(r"\b\w+\b|[^\w\s]", cleaned)
    expanded = [GENZ_MATH_MAP.get(token, token) for token in tokens]
    return " ".join(expanded)


def detect_intent(request: ChatRequest) -> str:
    message = _normalize(request.message)
    for intent, phrases in RULES:
        if any(phrase in message for phrase in phrases):
            return intent
    if request.learning_context.student_work and request.learning_context.student_work.answer:
        return "student_response"
    if request.history:
        previous_turn = request.history[-1]
        if previous_turn.role.value == "assistant" and "?" in previous_turn.content:
            return "student_response"
    return "general"
