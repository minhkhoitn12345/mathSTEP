import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getAccessToken, getSupabaseUser, setAuthCookies } from "@/lib/supabase";
import { jsonError } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { token, refreshed } = await getAccessToken(request);
    if (!token) {
      const response = NextResponse.json({ authenticated: false, name: null, email: null }, { headers: { "Cache-Control": "private, no-store" } });
      if (request.cookies.has("mathstep_access_token") || request.cookies.has("mathstep_refresh_token")) clearAuthCookies(response);
      return response;
    }
    const user = await getSupabaseUser(token);
    if (!user) return NextResponse.json({ authenticated: false, name: null, email: null }, { headers: { "Cache-Control": "private, no-store" } });
    const metadata = user.user_metadata ?? {};
    const response = NextResponse.json({
      authenticated: true,
      name: metadata.full_name ?? metadata.name ?? null,
      email: user.email ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
    if (refreshed) setAuthCookies(response, refreshed);
    return response;
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kiểm tra được phiên đăng nhập.", 502);
  }
}
