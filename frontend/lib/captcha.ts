// MathSTEP Smart Math Challenge Captcha
// Chống Botnet Spam đăng ký và Brute-force mật khẩu bằng HMAC mật không lộ đáp số

import crypto from "crypto";

const PRODUCTION_FALLBACK_CAPTCHA_SECRET = "mathstep-secret-captcha-key-prod-2026-fallback-32chars";
const DEVELOPMENT_CAPTCHA_SECRET = "mathstep-secret-captcha-key-dev-2026";
const CAPTCHA_TTL_SECONDS = 300; // Hiệu lực trong 5 phút

// Bộ nhớ chống tấn công Replay (Single-use token cache)
const usedTokens = new Set<string>();

function getCaptchaSecret(): string {
  const configuredSecret = process.env.CAPTCHA_SECRET?.trim();
  if (configuredSecret && configuredSecret.length >= 32) return configuredSecret;
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_FALLBACK_CAPTCHA_SECRET;
  }
  return DEVELOPMENT_CAPTCHA_SECRET;
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    // Dọn dẹp cache token định kỳ để tránh rò rỉ bộ nhớ
    if (usedTokens.size > 5000) {
      usedTokens.clear();
    }
  }, 10 * 60 * 1000);
}

export interface CaptchaChallenge {
  token: string;
  question: string;
}

/**
 * Sinh một câu hỏi thử thách toán học ngẫu nhiên kèm token HMAC an toàn (KHÔNG lộ đáp số)
 */
export function generateMathCaptcha(): CaptchaChallenge {
  const ops = ["+", "-", "x"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = 0;
  let b = 0;
  let answer = 0;

  if (op === "+") {
    a = Math.floor(Math.random() * 20) + 5;
    b = Math.floor(Math.random() * 20) + 3;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 30) + 20;
    b = Math.floor(Math.random() * 15) + 2;
    answer = a - b;
  } else {
    // Phép nhân nhỏ
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString("hex");

  // HMAC bảo mật: Gắn kết đáp số + thời gian + nonce ngẫu nhiên
  const payloadToHash = `${answer}:${timestamp}:${nonce}`;
  const hmac = crypto
    .createHmac("sha256", getCaptchaSecret())
    .update(payloadToHash)
    .digest("hex");

  // Token đóng gói: base64(timestamp:nonce:hmac) -> TUYỆT ĐỐI KHÔNG chứa đáp số
  const token = Buffer.from(`${timestamp}:${nonce}:${hmac}`).toString("base64url");

  return {
    token,
    question: `${a} ${op === "x" ? "×" : op} ${b} = ?`,
  };
}

/**
 * Xác thực câu trả lời Captcha từ client
 */
export function verifyMathCaptcha(userAnswer: unknown, token: unknown): { valid: boolean; reason?: string } {
  if (userAnswer === undefined || userAnswer === null || userAnswer === "") {
    return { valid: false, reason: "Vui lòng nhập kết quả câu hỏi xác thực." };
  }
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "Token xác thực captcha không hợp lệ hoặc bị thiếu." };
  }

  // 1. Chống tấn công Replay (Một token chỉ dùng đúng 1 lần)
  if (usedTokens.has(token)) {
    return { valid: false, reason: "Mã xác thực này đã được sử dụng. Vui lòng lấy câu hỏi mới." };
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return { valid: false, reason: "Mã token captcha bị biến dạng." };
    }

    const [timestampStr, nonce, expectedHmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // 2. Kiểm tra thời gian hết hạn (5 phút)
    if (isNaN(timestamp) || now - timestamp > CAPTCHA_TTL_SECONDS * 1000 || timestamp > now + 30_000) {
      return { valid: false, reason: "Câu hỏi xác thực đã hết hạn (quá 5 phút). Vui lòng đổi câu khác." };
    }

    const answerText = String(userAnswer).trim();
    if (!/^\d+$/.test(answerText)) {
      return { valid: false, reason: "Đáp số phải là một số nguyên hợp lệ." };
    }
    const numericUserAnswer = Number(answerText);
    if (!Number.isSafeInteger(numericUserAnswer)) {
      return { valid: false, reason: "Đáp số phải là một số nguyên hợp lệ." };
    }

    // 3. Tính toán lại HMAC với đáp số người dùng gửi lên
    const candidatePayload = `${numericUserAnswer}:${timestampStr}:${nonce}`;
    const calculatedHmac = crypto
      .createHmac("sha256", getCaptchaSecret())
      .update(candidatePayload)
      .digest("hex");

    // So sánh thời gian thực (Constant-time comparison) chống tấn công Timing Attack
    const hmacA = Buffer.from(calculatedHmac, "hex");
    const hmacB = Buffer.from(expectedHmac, "hex");

    if (hmacA.length !== hmacB.length || !crypto.timingSafeEqual(hmacA, hmacB)) {
      return { valid: false, reason: "Kết quả tính nhẩm chưa chính xác. Vui lòng thử lại!" };
    }

    // Đánh dấu token đã được dùng thành công (Anti-Replay)
    usedTokens.add(token);

    return { valid: true };
  } catch {
    return { valid: false, reason: "Lỗi trong quá trình xác thực bảo mật captcha." };
  }
}
