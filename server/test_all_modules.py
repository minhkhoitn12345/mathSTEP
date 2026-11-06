from __future__ import annotations
import sys
import unittest

sys.stdout.reconfigure(encoding="utf-8")

from mathstep.contracts import (
    Turn,
    TurnRole,
    ChatMode,
    ChatRequest,
    LearningContext,
    Module,
    LearningStage,
)
from mathstep.curriculum_knowledge import get_curriculum_knowledge, CURRICULUM_KNOWLEDGE
from mathstep.intent_router import detect_intent


class TestAllModules(unittest.TestCase):
    def test_all_seven_modules_have_curriculum_knowledge(self):
        expected_modules = [
            "linear_programming",
            "spatial_geometry",
            "trigonometry",
            "functions",
            "calculus",
            "probability",
            "conics_and_solids",
        ]
        for mod in expected_modules:
            self.assertIn(mod, CURRICULUM_KNOWLEDGE, f"Missing curriculum knowledge for {mod}")
            knowledge = get_curriculum_knowledge(mod)
            self.assertTrue(len(knowledge["title"]) > 0)
            self.assertTrue(len(knowledge["textbook_sources"]) > 0)
            self.assertTrue(len(knowledge["core_definitions"]) > 0)
            self.assertTrue(len(knowledge["common_student_errors"]) > 0)

    def test_functions_module_intent_and_terms(self):
        ctx = LearningContext(module=Module.FUNCTIONS, learning_stage=LearningStage.EXPLORE)
        req = ChatRequest(
            message="cho em hoi ve bang bien thien va cuc dai cuc tieu cua ham bac 3",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=ctx,
            history=[],
        )
        self.assertIn(detect_intent(req), ["student_response", "general", "explain", "hint"])

    def test_calculus_module_terms(self):
        ctx = LearningContext(module=Module.CALCULUS, learning_stage=LearningStage.EXPLORE)
        req = ChatRequest(
            message="lam sao tinh tich phan dien tich va the tich khoi tron xoay quanh ox",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=ctx,
            history=[],
        )
        self.assertIn(detect_intent(req), ["student_response", "general", "explain", "hint"])

    def test_probability_module_terms(self):
        ctx = LearningContext(module=Module.PROBABILITY, learning_stage=LearningStage.EXPLORE)
        req = ChatRequest(
            message="xac suat co dieu kien va cong thuc bayes ap dung cho hai hop bi the nao",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=ctx,
            history=[],
        )
        self.assertIn(detect_intent(req), ["student_response", "general", "explain", "hint"])

    def test_conics_module_terms(self):
        ctx = LearningContext(module=Module.CONICS_AND_SOLIDS, learning_stage=LearningStage.EXPLORE)
        req = ChatRequest(
            message="khi nao cat mat non tao thanh elip va parabol",
            mode=ChatMode.GUIDED_LEARNING,
            hint_level=1,
            learning_context=ctx,
            history=[],
        )
        self.assertIn(detect_intent(req), ["student_response", "general", "explain", "hint"])


if __name__ == "__main__":
    unittest.main()
