import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getSupabaseConfig } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (!isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  let body: { access_token?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return jsonError("INVALID_REQUEST", "Thông tin đặt lại mật khẩu không hợp lệ.", 400); }
  if (typeof body.access_token !== "string" || body.access_token.length < 20 || typeof body.password !== "string" || body.password.length < 6 || body.password.length > 256) {
    return jsonError("INVALID_REQUEST", "Liên kết không hợp lệ hoặc mật khẩu chưa đủ 6 ký tự.", 400);
  }
  try {
    const { url, anonKey } = getSupabaseConfig();
    const upstream = await fetch(`${url}/auth/v1/user`, {
      method: "PUT", headers: { apikey: anonKey, Authorization: `Bearer ${body.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: body.password }), cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return jsonError("RESET_FAILED", "Liên kết đặt lại mật khẩu đã hết hạn. Hãy yêu cầu email mới.", upstream.status === 429 ? 429 : 400);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("SUPABASE_UNAVAILABLE", "Chưa kết nối được dịch vụ đặt lại mật khẩu.", 502);
  }
}
