import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, getSupabaseUser } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { clearTeacherRoleCookie, isValidTeacherCode, setTeacherRoleCookie } from "@/lib/teacherRole";

export const runtime = "nodejs";

/**
 * POST /api/account/verify-teacher
 * Xác thực và kích hoạt vai trò Giáo viên qua mã định danh Sư phạm (Teacher Access Code)
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);

  const clientIp = getClientIp(request);
  const rateLimitStatus = checkRateLimit(clientIp, { maxRequests: 5, windowSeconds: 60, actionName: "verify_teacher" });
  if (!rateLimitStatus.success) {
    return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: "Quá nhiều lần thử mã giáo viên. Vui lòng thử lại sau 1 phút." } },
      { status: 429 }
    );
  }

  try {
    const { token } = await getAccessToken(request);
    if (!token) {
      return jsonError("UNAUTHORIZED", "Vui lòng đăng nhập tài khoản trước khi kích hoạt quyền Giáo viên.", 401);
    }

    const user = await getSupabaseUser(token);
    if (!user) {
      return jsonError("UNAUTHORIZED", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.", 401);
    }

    const rawBody = await request.text();
    if (rawBody.length > 2048) return jsonError("REQUEST_TOO_LARGE", "Yêu cầu quá lớn.", 413);
    const body = JSON.parse(rawBody);
    const teacherCode = typeof body?.teacherCode === "string" ? body.teacherCode.trim() : "";
    if (!isValidTeacherCode(teacherCode)) {
      return jsonError(
        "INVALID_TEACHER_CODE",
        "Mã xác thực Sư phạm không chính xác. Vui lòng liên hệ ban quản trị hoặc nhập đúng mã được cấp cho giáo viên.",
        400
      );
    }

    const response = NextResponse.json({
      ok: true,
      role: "teacher",
      message: "Chúc mừng quý thầy/cô! Đã kích hoạt thành công quyền Giáo viên Toán THPT.",
    });
    response.headers.set("Cache-Control", "private, no-store");
    setTeacherRoleCookie(response);

    return response;
  } catch {
    return jsonError("SERVER_ERROR", "Chưa thể xác thực vai trò giáo viên lúc này.", 500);
  }
}

/**
 * DELETE /api/account/verify-teacher
 * Chuyển đổi về góc nhìn Học sinh (Dành cho Giáo viên muốn kiểm thử giao diện học sinh)
 */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);

  const response = NextResponse.json({
    ok: true,
    role: "student",
    message: "Đã chuyển đổi thành công về góc nhìn Học sinh.",
  });

  response.headers.set("Cache-Control", "private, no-store");
  clearTeacherRoleCookie(response);

  return response;
}
