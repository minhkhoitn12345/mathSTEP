from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Module(StrEnum):
    LINEAR_PROGRAMMING = "linear_programming"
    SPATIAL_GEOMETRY = "spatial_geometry"
    TRIGONOMETRY = "trigonometry"


class LearningStage(StrEnum):
    OBSERVE = "observe"
    PREDICT = "predict"
    MANIPULATE = "manipulate"
    EXPLORE = "explore"
    VERIFY = "verify"
    EXPLAIN = "explain"
    TRANSFER = "transfer"
    APPLY = "apply"


class ChatMode(StrEnum):
    GUIDED_LEARNING = "guided_learning"
    ASSESSMENT = "assessment"


class TurnRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class Turn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: TurnRole
    content: str = Field(min_length=1, max_length=4000)


class StudentWork(BaseModel):
    model_config = ConfigDict(extra="forbid")
    answer: str | None = Field(default=None, max_length=4000)
    submitted: bool = False


class SimulationState(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str | None = Field(default=None, max_length=80)
    inequalities: list[str] = Field(default_factory=list, max_length=8)
    selected_point: list[float] | None = Field(default=None, min_length=2, max_length=3)
    feasible_region_visible: bool | None = None


class LearningContext(BaseModel):
    model_config = ConfigDict(extra="forbid")
    module: Module
    lesson_id: str | None = Field(default=None, max_length=100)
    activity_id: str | None = Field(default=None, max_length=100)
    learning_stage: LearningStage = LearningStage.EXPLORE
    simulation: SimulationState | None = None
    student_work: StudentWork | None = None


class MathCheck(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expression: str = Field(min_length=1, max_length=250)
    variables: dict[str, float] = Field(default_factory=dict, max_length=8)
    angle_unit: str = Field(default="rad", pattern="^(rad|deg)$")


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    conversation_id: str | None = Field(default=None, max_length=80)
    message: str = Field(min_length=1, max_length=4000)
    mode: ChatMode = ChatMode.GUIDED_LEARNING
    learning_context: LearningContext
    history: list[Turn] = Field(default_factory=list, max_length=12)
    hint_level: int = Field(default=1, ge=1, le=4)
    math_check: MathCheck | None = None

    @field_validator("message")
    @classmethod
    def message_must_have_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("message must not be blank")
        return value


class MathValidation(BaseModel):
    status: str
    result: bool | float | None = None
    explanation: str


class NextAction(BaseModel):
    type: str = "ask"
    payload: dict[str, Any] = Field(default_factory=dict)


class MascotState(BaseModel):
    emotion: str = "encouraging"
    animation: str = "idle"
    message: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    intent: str
    mode: ChatMode
    hint_level: int
    citations: list[dict[str, Any]] = Field(default_factory=list)
    math_validation: MathValidation | None = None
    next_action: NextAction = Field(default_factory=NextAction)
    mascot: MascotState = Field(default_factory=MascotState)
