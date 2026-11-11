import type { NextRequest } from "next/server";

const PRODUCTION_APP_URL = "https://mathstep-vn.vercel.app";

export function getAppOrigin(request: NextRequest): string {
  const configuredUrl = process.env.APP_BASE_URL?.trim();
  const baseUrl = configuredUrl || (process.env.NODE_ENV === "production" ? PRODUCTION_APP_URL : request.nextUrl.origin);
  const parsedUrl = new URL(baseUrl);

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("APP_BASE_URL must use HTTPS in production.");
  }

  return parsedUrl.origin;
}

export function getAppUrl(path: string, request: NextRequest): string {
  return new URL(path, getAppOrigin(request)).toString();
}
