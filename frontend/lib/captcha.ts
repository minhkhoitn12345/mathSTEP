// MathSTEP Smart Math Challenge Captcha
// Chống Botnet Spam đăng ký và Brute-force mật khẩu bằng câu hỏi toán học ngẫu nhiên

import crypto from "crypto";

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "mathstep-secret-captcha-key-2026";
const CAPTCHA_TTL_SECONDS = 300; // Hiệu lực trong 5 phút

export interface CaptchaChallenge {
  token: string;
  question: string;
}

/**
 * Sinh một câu hỏi thử thách toán học ngẫu nhiên kèm token bảo mật
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
    a = Math.floor(Math.random() * 30) + 15;
    b = Math.floor(Math.random() * 15) + 2;
    answer = a - b;
  } else {
    // Phép nhân nhỏ
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }

  const timestamp = Date.now();
  const rawPayload = `${answer}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(rawPayload)
    .digest("hex")
    .slice(0, 16);

  // Token đóng gói: base64(answer_hash:timestamp:sig)
  const token = Buffer.from(`${rawPayload}:${signature}`).toString("base64url");

  return {
    token,
    question: `${a} ${op === "x" ? "×" : op} ${b} = ?`,
  };
}

/**
 * Xác thực câu trả lời Captcha từ client
 */
export function verifyMathCaptcha(userAnswer: unknown, token: unknown): { valid: boolean; reason?: string } {
  if (typeof userAnswer !== "string" && typeof userAnswer !== "number") {
    return { valid: false, reason: "Vui lòng nhập câu trả lời câu hỏi xác thực toán học." };
  }
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "Token xác thực captcha không hợp lệ hoặc đã thiếu." };
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return { valid: false, reason: "Mã token captcha bị biến dạng." };
    }

    const [expectedAnswerStr, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // 1. Kiểm tra thời gian hết hạn (chống tấn công Replay)
    if (isNaN(timestamp) || now - timestamp > CAPTCHA_TTL_SECONDS * 1000) {
      return { valid: false, reason: "Câu hỏi xác thực đã hết hạn (quá 5 phút). Vui lòng đổi câu khác." };
    }

    // 2. Kiểm tra chữ ký mật HMAC
    const rawPayload = `${expectedAnswerStr}:${timestampStr}`;
    const expectedSig = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(rawPayload)
      .digest("hex")
      .slice(0, 16);

    if (signature !== expectedSig) {
      return { valid: false, reason: "Chữ ký xác thực bảo mật không hợp lệ." };
    }

    // 3. Đối chiếu kết quả tính toán
    const expectedAnswer = parseInt(expectedAnswerStr, 10);
    const numericUserAnswer = parseInt(String(userAnswer).trim(), 10);

    if (isNaN(numericUserAnswer) || numericUserAnswer !== expectedAnswer) {
      return { valid: false, reason: "Kết quả tính nhẩm chưa chính xác. Vui lòng thử lại!" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Lỗi trong quá trình giải mã xác thực bảo mật." };
  }
}
