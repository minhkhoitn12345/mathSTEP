import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getSupabaseConfig, getSupabaseUser, responseWithSessionCookies } from "@/lib/supabase";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import type { UserLearningProgress } from "@/app/types/learningPath";

export const runtime = "nodejs";
const LESSON_IDS = new Set(CORE_3_MODULES.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
const MAX_XP = 2000;
const MAX_STREAK = 36500;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || value === "") return value === "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function sanitizeProgress(value: unknown): UserLearningProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.completedLessonIds) || !raw.completedLessonIds.every((id) => typeof id === "string" && LESSON_IDS.has(id))) return null;
  if (typeof raw.lastActiveLessonId !== "string" || !LESSON_IDS.has(raw.lastActiveLessonId)) return null;
  if (!raw.quizScores || typeof raw.quizScores !== "object" || Array.isArray(raw.quizScores)) return null;
  const quizScores: Record<string, number> = {};
  for (const [lessonId, score] of Object.entries(raw.quizScores as Record<string, unknown>)) {
    if (!LESSON_IDS.has(lessonId) || typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) return null;
    quizScores[lessonId] = score;
  }
  const bounded = (candidate: unknown, max: number): candidate is number => typeof candidate === "number" && Number.isInteger(candidate) && candidate >= 0 && candidate <= max;
  if (!bounded(raw.earnedXp, MAX_XP) || !bounded(raw.streakDays, MAX_STREAK) || !bounded(raw.longestStreakDays, MAX_STREAK) || !validDate(raw.lastStudyDate)) return null;
  return {
    completedLessonIds: [...new Set(raw.completedLessonIds as string[])],
    lastActiveLessonId: raw.lastActiveLessonId,
    quizScores,
    earnedXp: raw.earnedXp,
    streakDays: raw.streakDays,
    longestStreakDays: Math.max(raw.longestStreakDays, raw.streakDays),
    lastStudyDate: raw.lastStudyDate,
  };
}

async function requireUser(request: NextRequest) {
  const session = await getAccessToken(request);
  const token = session.token;
  if (!token) return { error: jsonError("UNAUTHORIZED", "Đăng nhập để đồng bộ tiến độ học.", 401) };
  const user = await getSupabaseUser(token);
  if (!user) return { error: jsonError("UNAUTHORIZED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401) };
  return { token, refreshed: session.refreshed, user };
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(getClientIp(request), { maxRequests: 40, windowSeconds: 60, actionName: "learning_progress_read" });
  if (!rate.success) return jsonError("RATE_LIMITED", "Em thao tác hơi nhanh. Vui lòng thử lại sau.", 429);
  try {
    const session = await requireUser(request);
    if ("error" in session) return session.error;
    const { url, anonKey } = getSupabaseConfig();
    const params = new URLSearchParams({ select: "progress,updated_at", user_id: `eq.${session.user.id}`, limit: "1" });
    const response = await fetch(`${url}/rest/v1/student_learning_progress?${params}`, { headers: { apikey: anonKey, Authorization: `Bearer ${session.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) return jsonError("PROGRESS_READ_FAILED", "Chưa tải được tiến độ từ tài khoản.", 503);
    const rows = await response.json() as Array<{ progress: unknown; updated_at: string }>;
    const progress = rows[0] ? sanitizeProgress(rows[0].progress) : null;
    const result = NextResponse.json({ ok: true, progress, updatedAt: rows[0]?.updated_at ?? null });
    return responseWithSessionCookies(result, session.refreshed);
  } catch {
    return jsonError("PROGRESS_READ_FAILED", "Chưa tải được tiến độ từ tài khoản.", 503);
  }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  const rate = checkRateLimit(getClientIp(request), { maxRequests: 30, windowSeconds: 60, actionName: "learning_progress_write" });
  if (!rate.success) return jsonError("RATE_LIMITED", "Tiến độ vừa được đồng bộ. Vui lòng đợi một chút.", 429);
  try {
    const session = await requireUser(request);
    if ("error" in session) return session.error;
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > 32_768) return jsonError("PAYLOAD_TOO_LARGE", "Dữ liệu tiến độ vượt quá giới hạn.", 413);
    const rawBody = await request.text();
    if (rawBody.length > 32_768) return jsonError("PAYLOAD_TOO_LARGE", "Dữ liệu tiến độ vượt quá giới hạn.", 413);
    let body: { progress?: unknown } | null;
    try { body = JSON.parse(rawBody) as { progress?: unknown } | null; }
    catch { return jsonError("INVALID_PROGRESS", "Dữ liệu tiến độ không hợp lệ.", 400); }
    const progress = sanitizeProgress(body?.progress);
    if (!progress) return jsonError("INVALID_PROGRESS", "Dữ liệu tiến độ không hợp lệ.", 400);
    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/student_learning_progress?on_conflict=user_id`, {
      method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${session.token}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: session.user.id, progress, updated_at: new Date().toISOString() }), cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return jsonError("PROGRESS_SAVE_FAILED", "Chưa lưu được tiến độ vào tài khoản.", 503);
    return responseWithSessionCookies(NextResponse.json({ ok: true }), session.refreshed);
  } catch {
    return jsonError("PROGRESS_SAVE_FAILED", "Chưa lưu được tiến độ vào tài khoản.", 503);
  }
}
