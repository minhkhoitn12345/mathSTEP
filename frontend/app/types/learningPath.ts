import { ModuleCategory } from "./curriculum";

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface WorkedStep {
  stepNumber: number;
  title: string;
  mathExpression?: string;
  explanation: string;
  rationale: string; // Lý do sư phạm tại sao lại làm bước này
}

export interface CheckpointQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanationCorrect: string;
  explanationIncorrect: string;
  socraticHint: string;
}

export interface ReviewQuizItem {
  id: string;
  level?: "basic" | "intermediate" | "advanced";
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanationCorrect: string;
  explanationIncorrect: string;
  errorTag?: string; // Ví dụ: M01, M08, SG02, E01
}

export interface DetailedLessonContent {
  lessonId: string;
  moduleId: ModuleCategory;
  order: number;
  code: string;
  title: string;
  subtitle: string;
  grade: 10 | 11;
  estimatedMinutes: number;
  xpReward: number;

  // 1. Mục tiêu bài học
  objectives: string[];

  // 2. Lý thuyết ngắn gọn, có công thức & điều kiện áp dụng
  theory: {
    coreConcept: string;
    formulas: {
      formula: string;
      meaning: string;
      conditions?: string;
    }[];
    notes: string[];
    miniTip: string; // Mẹo nhớ nhanh / Cheat sheet
  };

  // 3. Ví dụ được giải thích tuần tự, nêu lý do cho từng bước
  workedExample: {
    problemStatement: string;
    steps: WorkedStep[];
    conclusion: string;
  };

  // 4. Câu hỏi tự luyện sau mỗi phần
  checkpoints: CheckpointQuestion[];

  // 5. Bài ôn tập ngắn cuối bài (Mini Review Quiz)
  reviewQuiz: ReviewQuizItem[];

  // 6. Liên kết phòng mô phỏng tương ứng
  simulationRef: {
    moduleId: ModuleCategory;
    simulationType: "single_inequality" | "system_inequality" | "optimization" | "practice" | "spatial_geometry" | "trigonometry";
    lessonIndex: number;
    labName: string;
    actionPrompt: string;
  };
}

export interface UserLearningProgress {
  completedLessonIds: string[];
  lastActiveLessonId: string;
  quizScores: Record<string, number>; // lessonId -> percentage
  earnedXp: number;
  streakDays: number;
  lastStudyDate: string;
}
