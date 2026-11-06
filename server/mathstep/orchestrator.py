from uuid import uuid4

from fastapi import HTTPException

from .config import Settings
from .contracts import ChatRequest, ChatResponse, MascotState, MathCheck, MathValidation, NextAction
from .intent_router import detect_intent
from .llm import generate_response
from .math_validator import validate_math
from .supabase_auth import AuthenticatedUser


SUPPORTED_ACTIONS = {"ask", "show_hint", "none"}
SUPPORTED_EMOTIONS = {"encouraging", "confused", "explaining", "warning"}
SUPPORTED_ANIMATIONS = {"idle", "thinking", "talking"}


def _simulation_validation(request: ChatRequest) -> MathValidation | None:
    if request.math_check:
        return validate_math(request.math_check)
    simulation = request.learning_context.simulation
    if not simulation or not simulation.inequalities or not simulation.selected_point:
        return None
    names = ("x", "y", "z")
    variables = dict(zip(names, simulation.selected_point))
    explanations: list[str] = []
    results: list[bool] = []
    for expression in simulation.inequalities:
        check = MathCheck(expression=expression, variables=variables)
        result = validate_math(check)
        if result.status != "verified" or not isinstance(result.result, bool):
            return MathValidation(status="unavailable", explanation=f"Chưa thể kiểm tra điều kiện {expression}: {result.explanation}")
        explanations.append(result.explanation)
        results.append(result.result)
    overall = all(results)
    return MathValidation(status="verified", result=overall, explanation=" ".join(explanations) + (" Điểm thỏa tất cả điều kiện." if overall else " Điểm chưa thỏa tất cả điều kiện."))


def _safe_next_action(raw: object) -> NextAction:
    if not isinstance(raw, dict):
        return NextAction(type="none")
    action = raw.get("type")
    if action not in SUPPORTED_ACTIONS:
        return NextAction(type="none")
    payload = raw.get("payload") if isinstance(raw.get("payload"), dict) else {}
    question = payload.get("question")
    if action in {"ask", "show_hint"} and isinstance(question, str) and question.strip():
        return NextAction(type=action, payload={"question": question.strip()[:500]})
    return NextAction(type="none")


async def process_chat(request: ChatRequest, user: AuthenticatedUser, settings: Settings, user_api_key: str | None = None) -> ChatResponse:
    effective_mode = request.mode
    if settings.force_assessment_mode:
        effective_mode = type(request.mode).ASSESSMENT
    if effective_mode.value == "assessment" and request.hint_level == 4:
        raise HTTPException(status_code=400, detail={"code": "ASSESSMENT_HINT_LIMIT", "message": "Trong chế độ đánh giá, không thể yêu cầu lời giải đầy đủ."})
    if request.hint_level == 4 and not settings.allow_full_solutions:
        effective_hint = 3
    else:
        effective_hint = request.hint_level
    intent = detect_intent(request)
    validation = _simulation_validation(request)
    effective_request = request.model_copy(update={"hint_level": effective_hint, "mode": effective_mode})
    raw = await generate_response(effective_request, intent, validation.model_dump() if validation else None, settings, user_api_key)
    mascot_raw = raw.get("mascot") if isinstance(raw.get("mascot"), dict) else {}
    action = _safe_next_action(raw.get("next_action"))
    emotion = mascot_raw.get("emotion") if mascot_raw.get("emotion") in SUPPORTED_EMOTIONS else "encouraging"
    animation = mascot_raw.get("animation") if mascot_raw.get("animation") in SUPPORTED_ANIMATIONS else "talking"
    return ChatResponse(
        conversation_id=request.conversation_id or str(uuid4()),
        message_id=str(uuid4()),
        answer=raw["answer"].strip()[:5000],
        intent=intent,
        mode=effective_mode,
        hint_level=effective_hint,
        citations=[],  # No approved RAG corpus is connected in this MVP.
        math_validation=validation,
        next_action=action,
        mascot=MascotState(emotion=emotion, animation=animation),
    )
