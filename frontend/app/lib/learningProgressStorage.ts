import { UserLearningProgress, LessonStatus } from "../types/learningPath";

const STORAGE_KEY = "mathstep_learning_progress_v1";

const DEFAULT_PROGRESS: UserLearningProgress = {
  completedLessonIds: [],
  lastActiveLessonId: "lp-lesson-1",
  quizScores: {},
  earnedXp: 0,
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split("T")[0],
};

export function loadUserLearningProgress(): UserLearningProgress {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserLearningProgress>;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      lastActiveLessonId: parsed.lastActiveLessonId || "lp-lesson-1",
      quizScores: parsed.quizScores || {},
      earnedXp: typeof parsed.earnedXp === "number" ? parsed.earnedXp : 0,
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 1,
      lastStudyDate: parsed.lastStudyDate || new Date().toISOString().split("T")[0],
    };
  } catch (err) {
    console.warn("Failed to load learning progress from localStorage", err);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserLearningProgress(progress: UserLearningProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn("Failed to save learning progress to localStorage", err);
  }
}

export function markLessonCompleted(
  lessonId: string,
  scorePercentage: number,
  xpEarned: number
): UserLearningProgress {
  const current = loadUserLearningProgress();
  const alreadyCompleted = current.completedLessonIds.includes(lessonId);

  const updatedCompleted = alreadyCompleted
    ? current.completedLessonIds
    : [...current.completedLessonIds, lessonId];

  const updatedXp = alreadyCompleted
    ? current.earnedXp
    : current.earnedXp + xpEarned;

  const today = new Date().toISOString().split("T")[0];
  let updatedStreak = current.streakDays;
  if (current.lastStudyDate !== today) {
    updatedStreak += 1;
  }

  const updated: UserLearningProgress = {
    ...current,
    completedLessonIds: updatedCompleted,
    lastActiveLessonId: lessonId,
    quizScores: {
      ...current.quizScores,
      [lessonId]: Math.max(current.quizScores[lessonId] || 0, scorePercentage),
    },
    earnedXp: updatedXp,
    streakDays: updatedStreak,
    lastStudyDate: today,
  };

  saveUserLearningProgress(updated);
  return updated;
}

export function setLastActiveLesson(lessonId: string): void {
  const current = loadUserLearningProgress();
  saveUserLearningProgress({
    ...current,
    lastActiveLessonId: lessonId,
  });
}

export function getLessonStatus(
  lessonId: string,
  progress: UserLearningProgress
): LessonStatus {
  if (progress.completedLessonIds.includes(lessonId)) {
    return "completed";
  }
  if (progress.lastActiveLessonId === lessonId) {
    return "in_progress";
  }
  return "not_started";
}
