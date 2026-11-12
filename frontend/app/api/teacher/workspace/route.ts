import { NextRequest, NextResponse } from "next/server";
import { extractUserRole } from "@/lib/rbac";
import { jsonError, isJsonRequest, isSameOrigin } from "@/lib/security";
import { getAccessToken, getSupabaseConfig, getSupabaseUser, responseWithSessionCookies } from "@/lib/supabase";
import type { TeacherWorkspaceState } from "@/app/types/teacher";

export const runtime = "nodejs";
const MAX_WORKSPACE_CHARS = 512_000;

async function requireTeacher(request: NextRequest) {
  const session = await getAccessToken(request);
  if (!session.token) return { error: jsonError("UNAUTHORIZED", "Đăng nhập bằng tài khoản giáo viên để tiếp tục.", 401) };
  const user = await getSupabaseUser(session.token);
  if (!user) return { error: jsonError("UNAUTHORIZED", "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.", 401) };
  const role = extractUserRole(user, request);
  if (role !== "teacher" && role !== "admin") return { error: jsonError("FORBIDDEN", "Khu vực này chỉ dành cho tài khoản giáo viên.", 403) };
  return { token: session.token, refreshed: session.refreshed, user };
}

function validWorkspace(value: unknown): value is TeacherWorkspaceState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const workspace = value as Record<string, unknown>;
  return Array.isArray(workspace.classes)
    && Array.isArray(workspace.lessons)
    && Array.isArray(workspace.assignments)
    && Array.isArray(workspace.submissions)
    && Boolean(workspace.activeModel && typeof workspace.activeModel === "object" && !Array.isArray(workspace.activeModel));
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeacher(request);
    if ("error" in auth) return auth.error;
    const { url, anonKey } = getSupabaseConfig();
    const params = new URLSearchParams({ select: "workspace,updated_at", teacher_id: `eq.${auth.user.id}`, limit: "1" });
    const result = await fetch(`${url}/rest/v1/teacher_workspace_state?${params}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${auth.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) return jsonError("TEACHER_WORKSPACE_READ_FAILED", "Chưa tải được dữ liệu giáo viên từ máy chủ.", 503);
    const rows = await result.json() as Array<{ workspace: TeacherWorkspaceState; updated_at: string }>;
    return responseWithSessionCookies(NextResponse.json({ ok: true, workspace: rows[0]?.workspace ?? null, updatedAt: rows[0]?.updated_at ?? null }), auth.refreshed);
  } catch {
    return jsonError("TEACHER_WORKSPACE_READ_FAILED", "Chưa kết nối được dữ liệu giáo viên.", 503);
  }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Dữ liệu cần được gửi ở định dạng JSON.", 415);
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_WORKSPACE_CHARS) return jsonError("PAYLOAD_TOO_LARGE", "Bản nháp vượt quá dung lượng cho phép.", 413);
  try {
    const auth = await requireTeacher(request);
    if ("error" in auth) return auth.error;
    const rawBody = await request.text();
    if (rawBody.length > MAX_WORKSPACE_CHARS) return jsonError("PAYLOAD_TOO_LARGE", "Bản nháp vượt quá dung lượng cho phép.", 413);
    let body: { workspace?: unknown };
    try { body = JSON.parse(rawBody) as { workspace?: unknown }; }
    catch { return jsonError("INVALID_WORKSPACE", "Dữ liệu bản nháp không hợp lệ.", 400); }
    if (!validWorkspace(body.workspace)) return jsonError("INVALID_WORKSPACE", "Thiếu lớp học, học liệu, bài tập hoặc mô hình hợp lệ.", 400);

    const { url, anonKey } = getSupabaseConfig();
    const result = await fetch(`${url}/rest/v1/teacher_workspace_state?on_conflict=teacher_id`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ teacher_id: auth.user.id, workspace: body.workspace, updated_at: new Date().toISOString() }),
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) return jsonError("TEACHER_WORKSPACE_WRITE_FAILED", "Chưa đồng bộ được bản nháp lên máy chủ.", 503);
    const rows = await result.json() as Array<{ updated_at: string }>;
    return responseWithSessionCookies(NextResponse.json({ ok: true, updatedAt: rows[0]?.updated_at ?? new Date().toISOString() }), auth.refreshed);
  } catch {
    return jsonError("TEACHER_WORKSPACE_WRITE_FAILED", "Chưa đồng bộ được bản nháp lên máy chủ.", 503);
  }
}
