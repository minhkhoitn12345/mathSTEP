import { NextRequest, NextResponse } from "next/server";

export type SupabaseTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase chưa được cấu hình.");
  return { url, anonKey };
}

export function setAuthCookies(response: NextResponse, tokens: SupabaseTokens) {
  const secure = process.env.NODE_ENV === "production";
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set("mathstep_access_token", tokens.access_token, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: tokens.expires_in ?? 3600,
  });
  response.cookies.set("mathstep_refresh_token", tokens.refresh_token, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  const secure = process.env.NODE_ENV === "production";
  for (const name of ["mathstep_access_token", "mathstep_refresh_token"]) {
    response.cookies.set(name, "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  }
}

export type SupabaseUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  app_metadata?: { provider?: string; providers?: string[]; role?: string };
  user_metadata?: { full_name?: string; name?: string };
  role?: string;
};

export async function getSupabaseUser(accessToken: string): Promise<SupabaseUser | null> {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("Supabase Auth request failed.");
  return await response.json() as SupabaseUser;
}

export async function refreshSupabaseSession(refreshToken: string): Promise<SupabaseTokens | null> {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const data = await response.json() as Partial<SupabaseTokens>;
  if (typeof data.access_token !== "string" || typeof data.refresh_token !== "string") return null;
  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in };
}

export async function getAccessToken(request: NextRequest): Promise<{ token: string | null; refreshed: SupabaseTokens | null }> {
  const current = request.cookies.get("mathstep_access_token")?.value;
  const refresh = request.cookies.get("mathstep_refresh_token")?.value;
  if (current && await getSupabaseUser(current)) return { token: current, refreshed: null };
  if (refresh) {
    const tokens = await refreshSupabaseSession(refresh);
    if (tokens) return { token: tokens.access_token, refreshed: tokens };
  }
  return { token: null, refreshed: null };
}

export function responseWithSessionCookies(response: Response, tokens: SupabaseTokens | null) {
  const result = new NextResponse(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
  result.headers.set("Cache-Control", "private, no-store");
  if (tokens) setAuthCookies(result, tokens);
  return result;
}
