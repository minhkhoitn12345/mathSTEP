import { NextRequest, NextResponse } from "next/server";
import { isJsonRequest, isSameOrigin, jsonError } from "@/lib/security";
import { getAccessToken, responseWithSessionCookies } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getFastApiBaseUrl } from "@/lib/fastapi";

export const runtime = "nodejs";

async function getSession(request: NextRequest) {
  try {
    const session = await getAccessToken(request);
    if (!session.token) return { response: jsonError("UNAUTHORIZED", "Vui lòng đăng nhập để tiếp tục.", 401) };
    return { token: session.token, refreshed: session.refreshed };
  } catch {
    return { response: jsonError("SUPABASE_UNAVAILABLE", "Chưa xác minh được phiên đăng nhập.", 502) };
  }
}

async function proxy(request: NextRequest, method: "GET" | "PUT" | "DELETE") {
  if (method !== "GET" && !isSameOrigin(request)) return jsonError("FORBIDDEN", "Yêu cầu không hợp lệ.", 403);
  if (method === "PUT" && !isJsonRequest(request)) return jsonError("INVALID_CONTENT_TYPE", "Yêu cầu phải ở định dạng JSON.", 415);
  if (method !== "GET") {
    const limit = checkRateLimit(getClientIp(request), { maxRequests: 8, windowSeconds: 300, actionName: "api_key_change" });
    if (!limit.success) return NextResponse.json(
      { detail: { code: "RATE_LIMIT_EXCEEDED", message: "Thao tác với API key quá thường xuyên. Vui lòng thử lại sau." } },
      { status: 429, headers: { "Retry-After": String(limit.resetSeconds), "Cache-Control": "no-store" } }
    );
  }

  const session = await getSession(request);
  if ("response" in session) return session.response;
  const baseUrl = getFastApiBaseUrl();
  if (!baseUrl) return responseWithSessionCookies(jsonError("FASTAPI_NOT_CONFIGURED", "Chưa cấu hình dịch vụ tài khoản.", 503), session.refreshed);

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (method === "PUT" && contentLength > 2048) return responseWithSessionCookies(jsonError("REQUEST_TOO_LARGE", "API key quá dài.", 413), session.refreshed);
    const body = method === "PUT" ? await request.text() : undefined;
    if (body && body.length > 1024) return responseWithSessionCookies(jsonError("REQUEST_TOO_LARGE", "API key quá dài.", 413), session.refreshed);
    if (method === "PUT") {
      if (!body || body.trim().length === 0) {
        return responseWithSessionCookies(jsonError("INVALID_REQUEST", "Dữ liệu API key không được để trống.", 400), session.refreshed);
      }
      try {
        const parsed = JSON.parse(body);
        if (!parsed.api_key || typeof parsed.api_key !== "string" || parsed.api_key.trim().length < 20 || parsed.api_key.trim().length > 512 || !/^[\x21-\x7E]+$/.test(parsed.api_key)) {
          return responseWithSessionCookies(jsonError("INVALID_API_KEY", "API key phải từ 20 đến 512 ký tự ASCII, không chứa khoảng trắng.", 400), session.refreshed);
        }
      } catch {
        return responseWithSessionCookies(jsonError("INVALID_JSON", "Định dạng JSON không hợp lệ.", 400), session.refreshed);
      }
    }
    const upstream = await fetch(`${baseUrl}/assistant/account/api-key`, {
      method,
      headers: { Authorization: `Bearer ${session.token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const data = await upstream.json().catch(() => ({ detail: { code: "ACCOUNT_RESPONSE_INVALID", message: "Dịch vụ tài khoản trả về dữ liệu không hợp lệ." } }));
    return responseWithSessionCookies(NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } }), session.refreshed);
  } catch {
    return responseWithSessionCookies(jsonError("ACCOUNT_UNAVAILABLE", "Chưa kết nối được dịch vụ tài khoản.", 502), session.refreshed);
  }
}

export async function GET(request: NextRequest) { return proxy(request, "GET"); }
export async function PUT(request: NextRequest) { return proxy(request, "PUT"); }
export async function DELETE(request: NextRequest) { return proxy(request, "DELETE"); }
