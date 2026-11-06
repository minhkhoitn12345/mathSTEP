from __future__ import annotations
import sys
import unittest

sys.stdout.reconfigure(encoding='utf-8')

from mathstep.contracts import (
    Turn,
    TurnRole,
    ChatMode,
    ChatRequest,
    LearningContext,
    Module,
    LearningStage,
)
from mathstep.intent_router import detect_intent
from mathstep.llm import sanitize_pedagogical_response


class TestIntentDetection(unittest.TestCase):
    def setUp(self):
        self.context = LearningContext(
            module=Module.LINEAR_PROGRAMMING,
            learning_stage=LearningStage.EXPLORE,
        )
        self.history_with_question = [
            Turn(
                role=TurnRole.ASSISTANT,
                content="Nếu thay tọa độ điểm M(2; 3) vào bất phương trình mà thu được khẳng định đúng thì điểm M có thuộc miền nghiệm không, vì sao?",
            )
        ]

    def test_multiline_gibberish_is_clarification_needed(self):
        req = ChatRequest(
            message="m\n22222222\nEM\nT",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        self.assertEqual(detect_intent(req), "clarification_needed")

    def test_single_letter_without_mc_is_clarification_needed(self):
        for char in ["T", "m", "z", "p"]:
            req = ChatRequest(
                message=char,
                mode=ChatMode.GUIDED_LEARNING,
                hint_level=1,
                learning_context=self.context,
                history=self.history_with_question,
            )
            self.assertEqual(detect_intent(req), "clarification_needed", f"Failed for {char}")

    def test_repeated_digits_is_clarification_needed(self):
        req = ChatRequest(
            message="22222222",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        self.assertEqual(detect_intent(req), "clarification_needed")

    def test_keyboard_mash_is_clarification_needed(self):
        req = ChatRequest(
            message="asdfgh",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        self.assertEqual(detect_intent(req), "clarification_needed")

    def test_valid_math_assertion_is_student_response(self):
        for ans in ["thuộc", "không thuộc", "thuoc", "khong thuoc", "đúng", "dung"]:
            req = ChatRequest(
                message=ans,
                mode=ChatMode.GUIDED_LEARNING,
                hint_level=1,
                learning_context=self.context,
                history=self.history_with_question,
            )
            self.assertEqual(detect_intent(req), "student_response", f"Failed for {ans}")

    def test_full_student_response_with_reasoning(self):
        req = ChatRequest(
            message="Thay tọa độ M(2; 3) vào bpt ta được 2 + 3 <= 6 là 5 <= 6 đúng nên M thuộc miền nghiệm",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        self.assertEqual(detect_intent(req), "student_response")

    def test_explicit_clarification_rule(self):
        req = ChatRequest(
            message="em chưa rõ câu hỏi",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        self.assertEqual(detect_intent(req), "clarification_needed")

    def test_greeting_is_general(self):
        req = ChatRequest(
            message="chào bạn",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=[],
        )
        self.assertEqual(detect_intent(req), "general")

    def test_hint_intent(self):
        req = ChatRequest(
            message="hướng dẫn em với",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=[],
        )
        self.assertEqual(detect_intent(req), "hint")

    def test_pedagogical_guard_intercepts_premature_praise(self):
        req = ChatRequest(
            message="m\n22222222\nEM\nT",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=self.context,
            history=self.history_with_question,
        )
        fake_llm_hallucination = {
            "answer": "Chính xác! Khi thay tọa độ điểm M(2; 3) vào bất phương trình...",
            "mascot": {"emotion": "encouraging", "animation": "talking"},
            "next_action": {"type": "ask", "payload": {"question": "Làm thế nào để kiểm tra hệ?"}},
        }
        sanitized = sanitize_pedagogical_response(fake_llm_hallucination, "clarification_needed", req)
        # Verify it no longer contains premature praise
        self.assertFalse(sanitized["answer"].startswith("Chính xác!"))
        self.assertTrue("Thầy/cô chưa hiểu rõ ý của em" in sanitized["answer"])
        self.assertEqual(sanitized["mascot"]["emotion"], "confused")
        self.assertEqual(sanitized["next_action"]["type"], "ask")


if __name__ == "__main__":
    unittest.main()
