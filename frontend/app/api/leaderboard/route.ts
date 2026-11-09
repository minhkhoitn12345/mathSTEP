import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getAccessToken, getSupabaseConfig, getSupabaseUser, responseWithSessionCookies } from "@/lib/supabase";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { sanitizeUserText } from "@/lib/xssSanitizer";

export const runtime = "nodejs";

const COLUMNS = "user_id,display_name,total_xp,longest_streak_days,completed_lessons,updated_at";

function authHeaders(anonKey: string, token: string, json = false): HeadersInit {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function isValidCount(value: unknown, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max;
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
      const params = new URLSearchParams({ select: COLUMNS, order, limit: own ? "1" : "50" });
      if (own) params.set("user_id", `eq.${user.id}`);
      const response = await fetch(`${url}/rest/v1/student_leaderboard?${params}`, {
        headers: authHeaders(anonKey, token),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("LEADERBOARD_READ_FAILED");
      return response.json();
    };

    const [streak, xp, lessons, own] = await Promise.all([
      query("longest_streak_days.desc,updated_at.asc"),
      query("total_xp.desc,updated_at.asc"),
      query("completed_lessons.desc,updated_at.asc"),
      query("total_xp.desc", true),
    ]);
    const meta = user.user_metadata ?? {};
    const name = sanitizeUserText(meta.full_name || meta.name || `Học sinh ${user.id.slice(0, 4)}`).slice(0, 80);
    const response = NextResponse.json({
      ok: true,
      profile: { userId: user.id, displayName: name },
      boards: { streak, xp, lessons },
      own: Array.isArray(own) ? own[0] ?? null : null,
    });
    return responseWithSessionCookies(response, refreshed);
  } catch {
    return jsonError("LEADERBOARD_UNAVAILABLE", "Chưa tải được bảng xếp hạng. Em thử tải lại sau nhé.", 503);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  const rate = checkRateLimit(getClientIp(request), { maxRequests: 8, windowSeconds: 60, actionName: "leaderboard_write" });
  if (!rate.success) return jsonError("RATE_LIMITED", "Em vừa đồng bộ tiến độ. Vui lòng thử lại sau ít phút.", 429);

  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) return jsonError("UNAUTHORIZED", "Đăng nhập để lưu kết quả lên bảng xếp hạng.", 401);

    const body = await request.json().catch(() => null);
    if (
      !body ||
      !isValidCount(body.earnedXp, 2000) ||
      !isValidCount(body.longestStreakDays, 36500) ||
      !isValidCount(body.completedLessons, 15)
    ) {
      return jsonError("INVALID_PROGRESS", "Tiến độ gửi lên chưa hợp lệ.", 400);
    }

    const user = await getSupabaseUser(token);
    if (!user) return jsonError("UNAUTHORIZED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
    const meta = user.user_metadata ?? {};
    const displayName = sanitizeUserText(meta.full_name || meta.name || `Học sinh ${user.id.slice(0, 4)}`)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "Học sinh";
    const { url, anonKey } = getSupabaseConfig();
    const existingQuery = new URLSearchParams({
      select: "total_xp,longest_streak_days,completed_lessons",
      user_id: `eq.${user.id}`,
      limit: "1",
    });
    const existingResponse = await fetch(`${url}/rest/v1/student_leaderboard?${existingQuery}`, {
      headers: authHeaders(anonKey, token),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!existingResponse.ok) return jsonError("LEADERBOARD_READ_FAILED", "Chưa tải được tiến độ xếp hạng.", 503);
    const existingRows = await existingResponse.json();
    const previous = Array.isArray(existingRows) ? existingRows[0] : null;
    const response = await fetch(`${url}/rest/v1/student_leaderboard?on_conflict=user_id`, {
      method: "POST",
      headers: {
        ...authHeaders(anonKey, token, true),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: user.id,
        display_name: displayName,
        total_xp: Math.max(body.earnedXp, Number(previous?.total_xp ?? 0)),
        longest_streak_days: Math.max(body.longestStreakDays, Number(previous?.longest_streak_days ?? 0)),
        completed_lessons: Math.max(body.completedLessons, Number(previous?.completed_lessons ?? 0)),
        updated_at: new Date().toISOString(),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return jsonError("LEADERBOARD_SAVE_FAILED", "Chưa đồng bộ được tiến độ. Tiến độ học vẫn được lưu trên thiết bị này.", 503);

    return responseWithSessionCookies(NextResponse.json({ ok: true }), refreshed);
  } catch {
    return jsonError("LEADERBOARD_SAVE_FAILED", "Chưa đồng bộ được tiến độ. Tiến độ học vẫn được lưu trên thiết bị này.", 503);
  }
}
