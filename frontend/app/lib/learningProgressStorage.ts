import { UserLearningProgress, LessonStatus } from "../types/learningPath";

const STORAGE_KEY = "mathstep_learning_progress_v1";

const DEFAULT_PROGRESS: UserLearningProgress = {
  completedLessonIds: [],
  lastActiveLessonId: "lp-lesson-1",
  quizScores: {},
  earnedXp: 0,
  streakDays: 0,
  lastStudyDate: "",
};

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateSerial(dateKey: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return Math.floor(date.getTime() / 86_400_000);
}

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
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 0,
      lastStudyDate: typeof parsed.lastStudyDate === "string" ? parsed.lastStudyDate : "",
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

  const today = getLocalDateKey();
  const todaySerial = getDateSerial(today);
  const previousStudySerial = getDateSerial(current.lastStudyDate);
  const daysSinceLastStudy =
    todaySerial !== null && previousStudySerial !== null
      ? todaySerial - previousStudySerial
      : null;
  const updatedStreak =
    daysSinceLastStudy === 0
      ? current.streakDays
      : daysSinceLastStudy === 1
        ? current.streakDays + 1
        : 1;

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
