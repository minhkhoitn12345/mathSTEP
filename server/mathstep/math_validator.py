"""Small, allow-listed expression evaluator. It never uses eval/exec."""

from __future__ import annotations

import ast
import math
import operator

from .contracts import MathCheck, MathValidation


MAX_ABS_VALUE = 1e100
MAX_POWER = 12
BINOPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
}
CMPOPS = {
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
}


class MathInputError(ValueError):
    pass


def _bounded(value: float | int) -> float | int:
    if not math.isfinite(float(value)) or abs(float(value)) > MAX_ABS_VALUE:
        raise MathInputError("Kết quả nằm ngoài phạm vi kiểm tra an toàn.")
    return value


def _evaluate(node: ast.AST, variables: dict[str, float], angle_unit: str) -> float | bool:
    if isinstance(node, ast.Expression):
        return _evaluate(node.body, variables, angle_unit)
    if isinstance(node, ast.Constant) and type(node.value) in (int, float):
        return _bounded(node.value)
    if isinstance(node, ast.Name):
        if node.id not in variables:
            raise MathInputError(f"Thiếu giá trị cho biến {node.id}.")
        return _bounded(variables[node.id])
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        value = _evaluate(node.operand, variables, angle_unit)
        if isinstance(value, bool):
            raise MathInputError("Không thể áp dụng dấu số học lên kết quả đúng/sai.")
        return _bounded(value if isinstance(node.op, ast.UAdd) else -value)
    if isinstance(node, ast.BinOp) and type(node.op) in BINOPS:
        left = _evaluate(node.left, variables, angle_unit)
        right = _evaluate(node.right, variables, angle_unit)
        if isinstance(left, bool) or isinstance(right, bool):
            raise MathInputError("Biểu thức số học không hợp lệ.")
        if isinstance(node.op, ast.Pow) and abs(float(right)) > MAX_POWER:
            raise MathInputError("Số mũ vượt giới hạn kiểm tra.")
        try:
            return _bounded(BINOPS[type(node.op)](left, right))
        except (ArithmeticError, OverflowError) as error:
            raise MathInputError("Không thể tính biểu thức này.") from error
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
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in {"sin", "cos", "tan"} and len(node.args) == 1 and not node.keywords:
        argument = _evaluate(node.args[0], variables, angle_unit)
        if isinstance(argument, bool):
            raise MathInputError("Góc phải là một giá trị số.")
        radians = math.radians(argument) if angle_unit == "deg" else argument
        return _bounded(getattr(math, node.func.id)(radians))
    raise MathInputError("Biểu thức chứa cú pháp hoặc phép toán chưa được hỗ trợ.")


def validate_math(check: MathCheck) -> MathValidation:
    if any(not name.isidentifier() or name.startswith("__") for name in check.variables):
        return MathValidation(status="unavailable", explanation="Tên biến không hợp lệ.")
    try:
        tree = ast.parse(check.expression, mode="eval")
        result = _evaluate(tree, check.variables, check.angle_unit)
    except (SyntaxError, MathInputError, TypeError, ValueError) as error:
        return MathValidation(status="unavailable", explanation=str(error))
    rendered_inputs = ", ".join(f"{key}={value:g}" for key, value in check.variables.items())
    detail = f"Thay {rendered_inputs} vào {check.expression.strip()} được {result}." if rendered_inputs else f"{check.expression.strip()} = {result}."
    return MathValidation(status="verified", result=result, explanation=detail)
