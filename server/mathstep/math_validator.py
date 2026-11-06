"""Small, secure expression evaluator for high school mathematics. It never uses eval/exec."""

from __future__ import annotations

import ast
import math
import operator
import re

from .contracts import MathCheck, MathValidation


MAX_ABS_VALUE = 1e100
MAX_POWER = 12

BINOPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
}

CMPOPS = {
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
}

MATH_CONSTANTS = {
    "pi": math.pi,
    "e": math.e,
}


class MathInputError(ValueError):
    pass


def _cot(val: float) -> float:
    t = math.tan(val)
    if abs(t) < 1e-12:
        raise MathInputError("cot không xác định khi tan = 0 (khi góc là k*pi).")
    return 1.0 / t


MATH_FUNCTIONS = {
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "cot": _cot,
    "sqrt": math.sqrt,
    "abs": abs,
    "floor": math.floor,
    "ceil": math.ceil,
    "round": round,
    "min": min,
    "max": max,
}


RESERVED_KEYWORDS = {"and", "or", "not", "in", "is"}


def _bounded(value: float | int | bool) -> float | int | bool:
    if isinstance(value, bool):
        return value
    if not math.isfinite(float(value)) or abs(float(value)) > MAX_ABS_VALUE:
        raise MathInputError("Kết quả nằm ngoài phạm vi kiểm tra an toàn.")
    return value


def _normalize_expression(expr: str) -> str:
    """Chuẩn hóa ký hiệu toán học phổ biến và phép nhân ẩn của học sinh."""
    s = expr.strip()
    # Ký hiệu Unicode
    s = s.replace("≤", "<=").replace("≥", ">=").replace("≠", "!=").replace("×", "*")
    # Số mũ ^ -> **
    s = s.replace("^", "**")

    # Phép nhân ẩn: số đứng liền trước chữ cái (ví dụ: 2x -> 2*x, 3.5y -> 3.5*y), ngoại trừ từ khóa logic
    def _insert_mult(match: re.Match) -> str:
        num = match.group(1)
        ident = match.group(3)
        if ident in RESERVED_KEYWORDS:
            return f"{num} {ident}"
        return f"{num}*{ident}"

    s = re.sub(r"(\d+(\.\d+)?)\s*([a-zA-Z_]\w*)", _insert_mult, s)
    # Phép nhân ẩn: số hoặc chữ cái đứng liền trước ngoặc mở (ví dụ: 2(x+y) -> 2*(x+y)), ngoại trừ tên hàm
    def _paren_mult(match: re.Match) -> str:
        left = match.group(1)
        if left in MATH_FUNCTIONS or left in RESERVED_KEYWORDS:
            return f"{left}("
        return f"{left}*("

    s = re.sub(r"(\d+|[a-zA-Z_]\w*)\s*\(", _paren_mult, s)
    # Phép nhân ẩn: ngoặc đóng đứng liền trước số/chữ/ngoặc mở (ví dụ: (x+1)(x-2) -> (x+1)*(x-2))
    def _post_paren_mult(match: re.Match) -> str:
        right = match.group(1)
        if right in RESERVED_KEYWORDS:
            return f") {right}"
        return f")*{right}"

    s = re.sub(r"\)\s*(\d+|[a-zA-Z_]\w*|\()", _post_paren_mult, s)
    return s


def _evaluate(node: ast.AST, variables: dict[str, float], angle_unit: str) -> float | int | bool:
    if isinstance(node, ast.Expression):
        return _evaluate(node.body, variables, angle_unit)

    if isinstance(node, ast.Constant) and type(node.value) in (int, float, bool):
        return _bounded(node.value)

    if isinstance(node, ast.Name):
        if node.id in variables:
            return _bounded(variables[node.id])
        if node.id in MATH_CONSTANTS:
            return _bounded(MATH_CONSTANTS[node.id])
        raise MathInputError(f"Thiếu giá trị cho biến hoặc hằng số '{node.id}'.")

    if isinstance(node, ast.UnaryOp):
        if isinstance(node.op, (ast.UAdd, ast.USub)):
            val = _evaluate(node.operand, variables, angle_unit)
            if isinstance(val, bool):
                raise MathInputError("Không thể áp dụng dấu số học lên kết quả đúng/sai.")
            return _bounded(val if isinstance(node.op, ast.UAdd) else -val)
        if isinstance(node.op, ast.Not):
            val = _evaluate(node.operand, variables, angle_unit)
            return not bool(val)

    if isinstance(node, ast.BinOp) and type(node.op) in BINOPS:
        left = _evaluate(node.left, variables, angle_unit)
        right = _evaluate(node.right, variables, angle_unit)
        if isinstance(left, bool) or isinstance(right, bool):
            raise MathInputError("Biểu thức số học không thể chứa giá trị logic đúng/sai.")
        if isinstance(node.op, ast.Pow) and abs(float(right)) > MAX_POWER:
            raise MathInputError("Số mũ vượt giới hạn kiểm tra an toàn (tối đa 12).")
        try:
            return _bounded(BINOPS[type(node.op)](left, right))
        except (ArithmeticError, OverflowError) as error:
            raise MathInputError("Phép tính gây lỗi số học hoặc chia cho 0.") from error

    if isinstance(node, ast.Compare):
        left = _evaluate(node.left, variables, angle_unit)
        for op, comparator in zip(node.ops, node.comparators):
            if type(op) not in CMPOPS:
                raise MathInputError("Phép so sánh này chưa được hỗ trợ.")
            right = _evaluate(comparator, variables, angle_unit)
            if isinstance(left, bool) or isinstance(right, bool):
                raise MathInputError("Không thể so sánh lồng kết quả đúng/sai.")
            if not CMPOPS[type(op)](left, right):
                return False
            left = right
        return True

    # Hỗ trợ logic and / or (dành cho hệ bất phương trình nhiều ràng buộc)
    if isinstance(node, ast.BoolOp):
        if isinstance(node.op, ast.And):
            for value in node.values:
                res = _evaluate(value, variables, angle_unit)
                if not bool(res):
                    return False
            return True
        if isinstance(node.op, ast.Or):
            for value in node.values:
                res = _evaluate(value, variables, angle_unit)
                if bool(res):
                    return True
            return False

    # Hỗ trợ hàm số toán học (lượng giác, căn bậc hai, min/max, v.v.)
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        fname = node.func.id
        if fname in MATH_FUNCTIONS and not node.keywords:
            evaluated_args = []
            for arg in node.args:
                v = _evaluate(arg, variables, angle_unit)
                if isinstance(v, bool):
                    raise MathInputError(f"Hàm {fname} yêu cầu tham số là giá trị số.")
                evaluated_args.append(v)

            if fname in {"sin", "cos", "tan", "cot"}:
                if len(evaluated_args) != 1:
                    raise MathInputError(f"Hàm lượng giác {fname} chỉ nhận 1 góc duy nhất.")
                angle_val = evaluated_args[0]
                rad = math.radians(angle_val) if angle_unit == "deg" else angle_val
                try:
                    return _bounded(MATH_FUNCTIONS[fname](rad))
                except (ValueError, ZeroDivisionError) as err:
                    raise MathInputError(f"Giá trị góc không xác định cho hàm {fname}.") from err

            if fname == "sqrt":
                if len(evaluated_args) != 1 or evaluated_args[0] < 0:
                    raise MathInputError("Biểu thức dưới dấu căn bậc hai (sqrt) phải không âm (≥ 0).")
                return _bounded(math.sqrt(evaluated_args[0]))

            if fname in {"abs", "floor", "ceil", "round"}:
                return _bounded(MATH_FUNCTIONS[fname](*evaluated_args))

            if fname in {"min", "max"}:
                if not evaluated_args:
                    raise MathInputError(f"Hàm {fname} cần ít nhất 1 tham số.")
                return _bounded(MATH_FUNCTIONS[fname](*evaluated_args))

    raise MathInputError("Biểu thức chứa cú pháp hoặc phép toán chưa được hỗ trợ.")


def validate_math(check: MathCheck) -> MathValidation:
    """Thẩm định toán học: kiểm tra tính toán, điều kiện miền nghiệm hoặc hệ bất phương trình."""
    if any(not name.isidentifier() or name.startswith("__") for name in check.variables):
        return MathValidation(status="unavailable", explanation="Tên biến không hợp lệ.")

    normalized_expr = _normalize_expression(check.expression)
    try:
        tree = ast.parse(normalized_expr, mode="eval")
        result = _evaluate(tree, check.variables, check.angle_unit)
    except (SyntaxError, MathInputError, TypeError, ValueError) as error:
        return MathValidation(status="unavailable", explanation=str(error))

    rendered_inputs = ", ".join(f"{key}={value:g}" for key, value in check.variables.items())

    if isinstance(result, bool):
        if result:
            detail = (
                f"Thỏa mãn: Điểm ({rendered_inputs}) THỎA MÃN ràng buộc: {check.expression.strip()}."
                if rendered_inputs
                else f"Mệnh đề đúng: {check.expression.strip()} là ĐÚNG."
            )
        else:
            detail = (
                f"Không thỏa mãn: Điểm ({rendered_inputs}) KHÔNG THỎA MÃN ràng buộc: {check.expression.strip()}."
                if rendered_inputs
                else f"Mệnh đề sai: {check.expression.strip()} là SAI."
            )
    else:
        # Làm tròn đẹp mắt nếu là số thực gần nguyên
        val_str = f"{result:.4g}" if isinstance(result, float) else str(result)
        detail = (
            f"Thay ({rendered_inputs}) vào biểu thức {check.expression.strip()} được kết quả là {val_str}."
            if rendered_inputs
            else f"Giá trị của {check.expression.strip()} = {val_str}."
        )

    return MathValidation(status="verified", result=result, explanation=detail)
