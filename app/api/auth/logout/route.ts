import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin, jsonError } from "@/lib/security";
import { clearAuthCookies, getSupabaseConfig } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  const accessToken = request.cookies.get("mathstep_access_token")?.value;
  try {
    if (accessToken) {
      const { url, anonKey } = getSupabaseConfig();
      await fetch(`${url}/auth/v1/logout`, {
        method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
        cache: "no-store", signal: AbortSignal.timeout(5000),
      });
    }
  } catch {
    // Clear the browser session even if the upstream revoke endpoint is unavailable.
  }
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
