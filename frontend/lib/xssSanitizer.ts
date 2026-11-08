// Module Khử Độc XSS & Phòng Chống Injection HTML Độc Hại (XSS Sanitizer)
// Bảo vệ ứng dụng khỏi Stored / Reflected XSS trong nội dung Chat, Ghi chú và Đề bài toán học

/**
 * Làm sạch chuỗi văn bản thuần (Text Sanitization)
 * Loại bỏ toàn bộ các thẻ HTML độc hại và thuộc tính chèn mã JavaScript
 */
export function sanitizeUserText(rawInput: unknown): string {
  if (typeof rawInput !== "string") return "";

  let sanitized = rawInput;

  // 1. Loại bỏ các thẻ mã độc nguy hiểm
  sanitized = sanitized.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  sanitized = sanitized.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*\/?\s*>/gi, "");

  // 2. Vô hiệu hóa các pseudo-protocol: javascript:, vbscript:, data:text/html
  sanitized = sanitized.replace(/(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, "blocked:");

  // 3. Loại bỏ các HTML event handler (onload, onerror, onclick, onmouseover...)
  sanitized = sanitized.replace(/\s+on[a-z0-9_]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, "");

  // 4. Giới hạn độ dài tối đa chống tấn công Buffer/DoS
  if (sanitized.length > 50_000) {
    sanitized = sanitized.slice(0, 50_000);
  }

  return sanitized.trim();
}

/**
 * Kiểm tra xem chuỗi có chứa dấu hiệu tấn công XSS rõ ràng hay không
 */
export function containsXssPayload(input: string): boolean {
  if (!input || typeof input !== "string") return false;

  const xssPatterns = [
    /<\s*script/i,
    /javascript\s*:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /<iframe/i,
    /<svg[^>]*onload/i,
    /<img[^>]*onerror/i,
    /document\.(cookie|location|write)/i,
    /window\.location/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Làm sạch các trường dữ liệu JSON người dùng gửi lên
 */
export function sanitizeJsonPayload<T>(payload: T): T {
  if (typeof payload === "string") {
    return sanitizeUserText(payload) as unknown as T;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeJsonPayload(item)) as unknown as T;
  }
  if (payload !== null && typeof payload === "object") {
    const cleanedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(payload)) {
      cleanedObj[key] = sanitizeJsonPayload(val);
    }
    return cleanedObj as T;
  }
  return payload;
}
