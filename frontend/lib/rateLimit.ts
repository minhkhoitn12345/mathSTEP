// In-Memory Sliding Window Rate Limiter cho Next.js Edge & Node.js API Routes
// Chống DoS, Brute-Force mật khẩu và spam API Chatbot AI

import type { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// Bộ nhớ đệm cục bộ lưu các yêu cầu theo IP / User Identifier
const rateLimitStore = new Map<string, RateLimitRecord>();

// Định kỳ dọn dẹp các bản ghi quá hạn mỗi 5 phút để tránh rò rỉ bộ nhớ
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number; // Số lượng request tối đa trong khoảng thời gian
  windowSeconds: number; // Khoảng thời gian (giây)
  actionName: string; // Tên hành động để phân loại (chat, login, signup...)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${config.actionName}:${identifier}`;

  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Lọc các timestamp nằm trong cửa sổ thời gian
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= config.maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    rateLimitStore.set(key, record);
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }

  // Thêm request mới
  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
  const oldest = record.timestamps[0];
  const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    resetSeconds,
  };
}

/**
 * Lấy địa chỉ IP thực của client từ các header proxy Vercel / Cloudflare
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

// Cấu hình Rate Limit mẫu cho các API MathSTEP:
export const RATE_LIMIT_RULES = {
  CHAT: { maxRequests: 25, windowSeconds: 60, actionName: "chat" }, // 25 tin nhắn/phút
  LOGIN: { maxRequests: 6, windowSeconds: 300, actionName: "login" }, // Tối đa 6 lần thử đăng nhập/5 phút
  SIGNUP: { maxRequests: 4, windowSeconds: 600, actionName: "signup" }, // Tối đa 4 lần đăng ký/10 phút
  RESEND_EMAIL: { maxRequests: 2, windowSeconds: 300, actionName: "resend" }, // Tối đa 2 lần gửi lại email/5 phút
  GEOMETRY_PARSER: { maxRequests: 15, windowSeconds: 60, actionName: "geom_parse" }, // 15 lượt dựng hình 3D/phút
};
