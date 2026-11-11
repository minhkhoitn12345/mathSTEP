"use client";

import { useEffect, useRef } from "react";
import type { UserLearningProgress } from "../types/learningPath";
import {
  loadScopedLearningProgress,
  loadUserLearningProgress,
  saveScopedLearningProgress,
  saveUserLearningProgress,
} from "./learningProgressStorage";

const OWNER_KEY = "mathstep_learning_progress_owner_v1";
const DEFAULT_PROGRESS: UserLearningProgress = {
  completedLessonIds: [], lastActiveLessonId: "lp-lesson-1", quizScores: {},
  earnedXp: 0, streakDays: 0, longestStreakDays: 0, lastStudyDate: "",
};

function mergeProgress(local: UserLearningProgress, cloud: UserLearningProgress): UserLearningProgress {
  const completedLessonIds = [...new Set([...cloud.completedLessonIds, ...local.completedLessonIds])];
  const quizScores = { ...cloud.quizScores };
  for (const [lessonId, score] of Object.entries(local.quizScores)) quizScores[lessonId] = Math.max(quizScores[lessonId] ?? 0, score);
  return {
    completedLessonIds,
    lastActiveLessonId: local.lastActiveLessonId || cloud.lastActiveLessonId,
    quizScores,
    earnedXp: Math.max(local.earnedXp, cloud.earnedXp),
    streakDays: Math.max(local.streakDays, cloud.streakDays),
    longestStreakDays: Math.max(local.longestStreakDays, cloud.longestStreakDays),
    lastStudyDate: local.lastStudyDate >= cloud.lastStudyDate ? local.lastStudyDate : cloud.lastStudyDate,
  };
}

export function useCloudLearningProgress(
  userId: string | null | undefined,
  progress: UserLearningProgress,
  onRestore: (progress: UserLearningProgress) => void,
) {
  const hydrated = useRef(false);
  const callbackRef = useRef(onRestore);
  callbackRef.current = onRestore;
  const scope = userId ? `user:${userId}` : "guest";

  useEffect(() => {
    let cancelled = false;
    if (userId === undefined) return;
    hydrated.current = false;
    const previousOwner = window.localStorage.getItem(OWNER_KEY);
    const scoped = loadScopedLearningProgress(scope);
    // Migrate existing guest progress to the first signed-in account once. Never
    // merge one account's local data into a different account.
    const mayMigrateLegacy = !userId || !previousOwner || previousOwner === "guest" || previousOwner === scope;
    const local = scoped ?? (mayMigrateLegacy ? loadUserLearningProgress() : DEFAULT_PROGRESS);
    saveUserLearningProgress(local);
    window.localStorage.setItem(OWNER_KEY, scope);
    callbackRef.current(local);

    if (!userId) {
      saveScopedLearningProgress("guest", local);
      hydrated.current = true;
      return () => { cancelled = true; };
    }

    void (async () => {
      try {
        const response = await fetch("/api/learning-progress", { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) throw new Error("progress read failed");
        const data = await response.json() as { progress?: UserLearningProgress | null };
        if (cancelled) return;
        const latestLocal = loadUserLearningProgress();
        const merged = data.progress ? mergeProgress(latestLocal, data.progress) : latestLocal;
        saveUserLearningProgress(merged);
        saveScopedLearningProgress(scope, merged);
        callbackRef.current(merged);
        hydrated.current = true;
        if (!data.progress || JSON.stringify(merged) !== JSON.stringify(data.progress)) {
          await fetch("/api/learning-progress", {
            method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
            body: JSON.stringify({ progress: merged }),
          });
        }
      } catch {
        if (!cancelled) hydrated.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [scope, userId]);

  useEffect(() => {
    if (userId === undefined || !hydrated.current) return;
    saveScopedLearningProgress(scope, progress);
    saveUserLearningProgress(progress);
    const timer = window.setTimeout(() => {
      if (!userId) return;
      void fetch("/api/learning-progress", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ progress }),
      }).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [scope, userId, progress]);
}
