import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const TEACHER_ROLE_COOKIE = "mathstep_teacher_role";
const TEACHER_ROLE_TTL_SECONDS = 60 * 60 * 8;

function getTeacherSecret(): string | null {
  const secret = process.env.TEACHER_ACCESS_CODE?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function signTeacherRole(expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`teacher:${expiresAt}`).digest("hex");
}

export function verifyTeacherRole(request: NextRequest): boolean {
  const secret = getTeacherSecret();
  const value = request.cookies.get(TEACHER_ROLE_COOKIE)?.value;
  if (!secret || !value) return false;

  const [expiresAtText, signature, extra] = value.split(".");
  if (!expiresAtText || !signature || extra !== undefined || !/^\d+$/.test(expiresAtText)) return false;
  const expiresAt = Number(expiresAtText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + TEACHER_ROLE_TTL_SECONDS) return false;

  const expected = signTeacherRole(expiresAt, secret);
  const providedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function setTeacherRoleCookie(response: NextResponse): void {
  const secret = getTeacherSecret();
  if (!secret) throw new Error("Teacher role code is not configured.");
  const expiresAt = Math.floor(Date.now() / 1000) + TEACHER_ROLE_TTL_SECONDS;
  response.cookies.set(TEACHER_ROLE_COOKIE, `${expiresAt}.${signTeacherRole(expiresAt, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TEACHER_ROLE_TTL_SECONDS,
  });
}

export function clearTeacherRoleCookie(response: NextResponse): void {
  response.cookies.set(TEACHER_ROLE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function isValidTeacherCode(candidate: unknown): boolean {
  const expected = getTeacherSecret();
  if (!expected || typeof candidate !== "string" || candidate.length > 512) return false;
  const candidateBuffer = Buffer.from(candidate, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}
