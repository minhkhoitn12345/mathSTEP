import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, getSupabaseConfig, responseWithSessionCookies } from "@/lib/supabase";
import { sanitizeUserText } from "@/lib/xssSanitizer";
import { extractUserRole } from "@/lib/rbac";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để xem thông tin.", 401);

    const { url, anonKey } = getSupabaseConfig();
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return jsonError("USER_NOT_FOUND", "Không tìm thấy thông tin người dùng.", 404);

    const user = await res.json();
    const meta = user.user_metadata || {};
    const role = extractUserRole(user);

    const profile = {
      id: user.id,
      name: meta.full_name || meta.name || "",
      email: user.email || "",
      role,
      grade: meta.grade || 10,
      school: meta.school || "",
      target: meta.target || "Nghiên cứu KHKT & GDPT 2018",
      created_at: user.created_at,
    };

    return responseWithSessionCookies(
      NextResponse.json({ ok: true, profile }),
      refreshed
    );
  } catch {
    return jsonError("SERVER_ERROR", "Chưa tải được hồ sơ người dùng.", 500);
  }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, { maxRequests: 10, windowSeconds: 60, actionName: "profile_update" });
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: "Em cập nhật hồ sơ quá thường xuyên. Vui lòng thử lại sau 1 phút." } },
      { status: 429 }
    );
  }

  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để cập nhật thông tin.", 401);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("INVALID_BODY", "Dữ liệu cập nhật không hợp lệ.", 400);
    }

    // XSS Sanitization & Chống Privilege Escalation: Tuyệt đối không cho phép cập nhật trường 'role'
    const cleanName = sanitizeUserText(body.name).slice(0, 100);
    const cleanSchool = sanitizeUserText(body.school).slice(0, 150);
    const cleanTarget = sanitizeUserText(body.target).slice(0, 200);
    const grade = typeof body.grade === "number" && [10, 11, 12].includes(body.grade) ? body.grade : undefined;

    const { url, anonKey } = getSupabaseConfig();
    const updateRes = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          full_name: cleanName || undefined,
          name: cleanName || undefined,
          grade,
          school: cleanSchool || undefined,
          target: cleanTarget || undefined,
          // role KHÔNG BAO GIỜ lấy từ client body để ngăn ngừa leo thang đặc quyền
        },
      }),
    });

    if (!updateRes.ok) {
      return jsonError("UPDATE_FAILED", "Không thể cập nhật hồ sơ người dùng.", updateRes.status);
    }

    const updatedUser = await updateRes.json();
    const meta = updatedUser.user_metadata || {};
    const role = extractUserRole(updatedUser);

    const profile = {
      id: updatedUser.id,
      name: meta.full_name || meta.name || "",
      email: updatedUser.email || "",
      role,
      grade: meta.grade || 10,
      school: meta.school || "",
      target: meta.target || "Nghiên cứu KHKT & GDPT 2018",
    };

    return responseWithSessionCookies(
      NextResponse.json({ ok: true, profile }),
      refreshed
    );
  } catch {
    return jsonError("SERVER_ERROR", "Chưa cập nhật được hồ sơ.", 500);
  }
}
