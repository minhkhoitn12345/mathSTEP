import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getSupabaseConfig } from "@/lib/supabase";
import { getAppUrl } from "@/lib/app-url";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { url, anonKey } = getSupabaseConfig();
    const settingsResponse = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    const settings = await settingsResponse.json().catch(() => null) as { external?: { google?: unknown } } | null;
    if (!settingsResponse.ok || settings?.external?.google !== true) {
      const disabled = new URL(getAppUrl("/", request));
      disabled.searchParams.set("auth_error", "google-disabled");
      return NextResponse.redirect(disabled);
    }
    const redirectTo = getAppUrl("/auth/callback", request);
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const authorize = new URL(`${url}/auth/v1/authorize`);
    authorize.searchParams.set("provider", "google");
    authorize.searchParams.set("redirect_to", redirectTo);
    authorize.searchParams.set("apikey", anonKey);
    authorize.searchParams.set("code_challenge", challenge);
    authorize.searchParams.set("code_challenge_method", "s256");
    const response = NextResponse.redirect(authorize);
    response.cookies.set("mathstep_oauth_verifier", verifier, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
    return response;
  } catch {
    return NextResponse.redirect(new URL(getAppUrl("/?auth_error=unavailable", request)));
  }
}
