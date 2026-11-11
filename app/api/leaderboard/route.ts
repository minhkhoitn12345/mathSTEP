import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getAccessToken, getSupabaseConfig, getSupabaseUser, responseWithSessionCookies } from "@/lib/supabase";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import { sanitizeUserText } from "@/lib/xssSanitizer";

export const runtime = "nodejs";

const COLUMNS = "user_id,display_name,total_xp:verified_total_xp,longest_streak_days:verified_longest_streak_days,completed_lessons:verified_completed_lessons,updated_at";
function authHeaders(anonKey: string, token: string, json = false): HeadersInit {
  return { apikey: anonKey, Authorization: `Bearer ${token}`, ...(json ? { "Content-Type": "application/json" } : {}) };
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(getClientIp(request), { maxRequests: 30, windowSeconds: 60, actionName: "leaderboard_read" });
  if (!rate.success) return jsonError("RATE_LIMITED", "Em thao tác hơi nhanh. Vui lòng thử lại sau ít phút.", 429);
  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) return jsonError("UNAUTHORIZED", "Đăng nhập để xem bảng xếp hạng.", 401);
    const user = await getSupabaseUser(token);
    if (!user) return jsonError("UNAUTHORIZED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
    const { url, anonKey } = getSupabaseConfig();
    const query = async (order: string, own = false) => {
      const params = new URLSearchParams({ select: COLUMNS, order, limit: own ? "1" : "50", verified_completed_lessons: "gt.0" });
      if (own) params.set("user_id", `eq.${user.id}`);
      const response = await fetch(`${url}/rest/v1/student_leaderboard?${params}`, { headers: authHeaders(anonKey, token), cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("LEADERBOARD_READ_FAILED");
      return await response.json() as Array<Record<string, unknown>>;
    };
    const [streak, xp, lessons, own] = await Promise.all([
      query("verified_longest_streak_days.desc,updated_at.asc"), query("verified_total_xp.desc,updated_at.asc"),
      query("verified_completed_lessons.desc,updated_at.asc"), query("verified_total_xp.desc", true),
    ]);
    const shape = (rows: Array<Record<string, unknown>>) => rows.map(({ user_id, ...row }) => ({
      ...row,
      display_name: sanitizeUserText(typeof row.display_name === "string" ? row.display_name : "Học sinh").slice(0, 80),
      is_current_user: user_id === user.id,
    }));
    const metadata = user.user_metadata ?? {};
    const displayName = sanitizeUserText(metadata.full_name || metadata.name || "Học sinh").slice(0, 80);
    const response = NextResponse.json({ ok: true, profile: { displayName }, boards: { streak: shape(streak), xp: shape(xp), lessons: shape(lessons) }, own: shape(own)[0] ?? null });
    return responseWithSessionCookies(response, refreshed);
  } catch {
    return jsonError("LEADERBOARD_UNAVAILABLE", "Chưa tải được bảng xếp hạng. Em thử tải lại sau nhé.", 503);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  const rate = checkRateLimit(getClientIp(request), { maxRequests: 12, windowSeconds: 60, actionName: "leaderboard_write" });
  if (!rate.success) return jsonError("RATE_LIMITED", "Em vừa đồng bộ tiến độ. Vui lòng thử lại sau ít phút.", 429);
  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) return jsonError("UNAUTHORIZED", "Đăng nhập để lưu kết quả học tập.", 401);
    const user = await getSupabaseUser(token);
    if (!user) return jsonError("UNAUTHORIZED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > 2048) return jsonError("INVALID_LESSON", "Yêu cầu vượt quá giới hạn.", 413);
    const rawBody = await request.text();
    if (rawBody.length > 2048) return jsonError("INVALID_LESSON", "Yêu cầu vượt quá giới hạn.", 413);
    let body: { lessonId?: unknown } | null;
    try { body = JSON.parse(rawBody) as { lessonId?: unknown } | null; }
    catch { return jsonError("INVALID_LESSON", "Bài học không hợp lệ.", 400); }
    const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
    const validLessonIds = new Set(CORE_3_MODULES.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
    if (!validLessonIds.has(lessonId)) return jsonError("INVALID_LESSON", "Bài học không hợp lệ.", 400);
    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/rpc/record_lesson_completion`, {
      method: "POST", headers: authHeaders(anonKey, token, true), body: JSON.stringify({ p_lesson_id: lessonId }),
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return jsonError("LEADERBOARD_SAVE_FAILED", "Chưa ghi nhận được bài hoàn thành. Tiến độ vẫn được giữ trên thiết bị này.", 503);
    const result = NextResponse.json({ ok: true });
    return responseWithSessionCookies(result, refreshed);
  } catch {
    return jsonError("LEADERBOARD_SAVE_FAILED", "Chưa ghi nhận được bài hoàn thành. Tiến độ vẫn được giữ trên thiết bị này.", 503);
  }
}
