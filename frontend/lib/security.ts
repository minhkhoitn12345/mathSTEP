import type { NextRequest } from "next/server";

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function isJsonRequest(request: NextRequest): boolean {
  return request.headers.get("content-type")?.toLowerCase().includes("application/json") ?? false;
}

/**
 * Kiểm tra định dạng Email hợp lệ ở tầng Server (Server-side Schema Validation)
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(trimmed);
}

/**
 * Kiểm tra độ dài mật khẩu an toàn
 */
export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6 && password.length <= 256;
}

export function jsonError(code: string, message: string, status: number): Response {
  return Response.json({ detail: { code, message } }, { status, headers: { "Cache-Control": "private, no-store" } });
}
