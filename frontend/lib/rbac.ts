// Hệ thống Phân Quyền Vai Trò Chuẩn Mực (Role-Based Access Control - RBAC)
// Kiểm soát truy cập chặt chẽ giữa Học sinh (Student), Giáo viên (Teacher) và Quản trị / Nghiên cứu KHKT (Admin / Researcher)

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getSupabaseUser, SupabaseUser } from "./supabase";
import { jsonError } from "./security";

export type UserRole = "guest" | "student" | "teacher" | "researcher" | "admin";

export type Permission =
  | "station:view" // Xem mô hình 2D/3D và đề bài
  | "station:practice" // Thao tác thanh trượt, kéo thả đỉnh hình học
  | "chat:socratic_guest" // Chat Socratic thử nghiệm (giới hạn 5 câu/ngày)
  | "chat:socratic_full" // Chat Socratic không giới hạn (đã xác thực email)
  | "teacher:dashboard" // Xem ma trận lỗi sai học sinh, thống kê bẫy ngộ nhận
  | "teacher:lecture_mode" // Chế độ trình chiếu lớp học (phóng to 1.5x)
  | "research:view_methodology" // Xem nhật ký tự học và đề tài KHKT (Phụ lục V & VI)
  | "admin:manage_system"; // Quản trị cấu hình toàn hệ thống

// Bảng ma trận quyền hạn theo vai trò (Role-Permission Matrix)
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: ["station:view", "station:practice", "chat:socratic_guest", "research:view_methodology"],
  student: [
    "station:view",
    "station:practice",
    "chat:socratic_full",
    "research:view_methodology",
  ],
  teacher: [
    "station:view",
    "station:practice",
    "chat:socratic_full",
    "teacher:dashboard",
    "teacher:lecture_mode",
    "research:view_methodology",
  ],
  researcher: [
    "station:view",
    "station:practice",
    "chat:socratic_full",
    "teacher:dashboard",
    "teacher:lecture_mode",
    "research:view_methodology",
    "admin:manage_system",
  ],
  admin: [
    "station:view",
    "station:practice",
    "chat:socratic_full",
    "teacher:dashboard",
    "teacher:lecture_mode",
    "research:view_methodology",
    "admin:manage_system",
  ],
};

/**
 * Trích xuất vai trò an toàn từ metadata người dùng và phiên xác thực giáo viên
 * TUYỆT ĐỐI KHÔNG tin cậy role gửi từ form request body của client
 */
export function extractUserRole(user: SupabaseUser | null, request?: NextRequest): UserRole {
  if (!user) return "guest";

  // 1. Kiểm tra cookie xác thực giáo viên hợp lệ
  if (request) {
    const teacherCookie = request.cookies.get("mathstep_teacher_role")?.value;
    if (teacherCookie === "teacher") {
      return "teacher";
    }
  }

  // 2. Kiểm tra app_metadata (chỉ Supabase Admin Service Key mới sửa được)
  const appRole = user.app_metadata?.role as string | undefined;
  if (appRole && ["student", "teacher", "researcher", "admin"].includes(appRole)) {
    return appRole as UserRole;
  }

  // 3. Kiểm tra email quản trị viên đặc biệt hoặc giáo viên trường (Bảo mật: TUYỆT ĐỐI không đọc role từ user_metadata)
  const email = user.email?.toLowerCase() || "";
  if (email.endsWith("@admin.mathstep.edu.vn") || email === "admin@mathstep.vn") {
    return "admin";
  }
  if (
    email.endsWith("@teacher.mathstep.edu.vn") ||
    email.endsWith("@giaovien.edu.vn") ||
    user.app_metadata?.role === "teacher"
  ) {
    return "teacher";
  }

  return "student";
}

/**
 * Kiểm tra xem một vai trò có quyền thực hiện hành động hay không
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];
  return allowedPermissions.includes(permission);
}

/**
 * Middleware bảo vệ API Route: Yêu cầu quyền hạn tối thiểu
 */
export async function enforcePermission(
  request: NextRequest,
  requiredPermission: Permission
): Promise<{
  authorized: boolean;
  user: SupabaseUser | null;
  role: UserRole;
  errorResponse?: NextResponse;
}> {
  const { token } = await getAccessToken(request);

  let user: SupabaseUser | null = null;
  if (token) {
    try {
      user = await getSupabaseUser(token);
    } catch {
      // Token hết hạn hoặc không hợp lệ
    }
  }

  const role = extractUserRole(user, request);

  // Kiểm tra quyền
  if (!hasPermission(role, requiredPermission)) {
    // Nếu là khách cần đăng nhập
    if (role === "guest") {
      return {
        authorized: false,
        user: null,
        role,
        errorResponse: jsonError(
          "UNAUTHORIZED",
          "Vui lòng đăng nhập tài khoản để thực hiện chức năng này.",
          401
        ) as NextResponse,
      };
    }

    // Nếu đã đăng nhập nhưng không đủ quyền
    return {
      authorized: false,
      user,
      role,
      errorResponse: jsonError(
        "FORBIDDEN",
        `Tài khoản vai trò [${role.toUpperCase()}] không có quyền [${requiredPermission}]. Chức năng chỉ dành cho Giáo viên hoặc Quản trị viên.`,
        403
      ) as NextResponse,
    };
  }

  return { authorized: true, user, role };
}
