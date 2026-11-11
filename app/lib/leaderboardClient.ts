export async function recordLessonCompletion(lessonId: string): Promise<void> {
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ lessonId }),
    });
  } catch {
    // Local progress remains usable if the ranking endpoint is unavailable.
  }
}
