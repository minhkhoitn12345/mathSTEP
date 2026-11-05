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

export function jsonError(code: string, message: string, status: number): Response {
  return Response.json({ detail: { code, message } }, { status });
}
