import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getAccessToken, getSupabaseUser, setAuthCookies } from "@/lib/supabase";
import { jsonError } from "@/lib/security";
import { extractUserRole } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) {
      const response = NextResponse.json(
        { authenticated: false, name: null, email: null, role: "guest" },
        { headers: { "Cache-Control": "private, no-store" } }
      );
      if (request.cookies.has("mathstep_access_token") || request.cookies.has("mathstep_refresh_token")) {
        clearAuthCookies(response);
      }
      return response;
    }

    const user = await getSupabaseUser(token);
    if (!user) {
      return NextResponse.json(
        { authenticated: false, name: null, email: null, role: "guest", user: null },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const metadata = user.user_metadata ?? {};
    const userName = metadata.full_name ?? metadata.name ?? null;
    const userEmail = user.email ?? null;
    const isEmailVerified = Boolean(
      user.email_confirmed_at || user.confirmed_at || user.app_metadata?.provider === "google"
    );
    const role = extractUserRole(user);

    const response = NextResponse.json(
      {
        authenticated: true,
        name: userName,
        email: userEmail,
        role,
        email_verified: isEmailVerified,
        provider: user.app_metadata?.provider || "email",
        user: {
          id: user.id,
          name: userName,
          email: userEmail,
          role,
          email_verified: isEmailVerified,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );

    if (refreshed) setAuthCookies(response, refreshed);
    return response;
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kiểm tra được phiên đăng nhập.", 502);
  }
}
