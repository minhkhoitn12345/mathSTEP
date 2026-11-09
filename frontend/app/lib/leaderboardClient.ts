import type { UserLearningProgress } from "../types/learningPath";

export async function syncLeaderboardProgress(progress: UserLearningProgress): Promise<void> {
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        earnedXp: progress.earnedXp,
        longestStreakDays: progress.longestStreakDays,
        completedLessons: progress.completedLessonIds.length,
      }),
    });
  } catch {
    // Keep local lesson progress usable if the leaderboard service is unavailable.
  }
}
