/**
 * MathSTEP MiniCAS: Exact rational functions & arithmetic verification engine.
 * Không sử dụng eval() hay Function constructor để đảm bảo an toàn tuyệt đối.
 */

export interface Rational {
  n: bigint;
  d: bigint;
}

const ZERO = BigInt(0);
const ONE = BigInt(1);

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || ONE;
};

export const R = (n: number | bigint, d: number | bigint = ONE): Rational => {
  let bn = BigInt(n);
  let bd = BigInt(d);
  if (!bd) throw new Error("Không chia cho 0.");
  if (bd < ZERO) {
    bn = -bn;
    bd = -bd;
  }
  const g = gcd(bn, bd);
  return { n: bn / g, d: bd / g };
};

export const plus = (a: Rational, b: Rational): Rational =>
  R(a.n * b.d + b.n * a.d, a.d * b.d);

export const times = (a: Rational, b: Rational): Rational =>
  R(a.n * b.n, a.d * b.d);

export const neg = (a: Rational): Rational => R(-a.n, a.d);

export const real = (r: Rational): number => Number(r.n) / Number(r.d);

export function parseNumberFraction(s: string): number {
  const clean = String(s).trim().replace(/,/g, ".");
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(clean)) {
    const parts = clean.split("/").map((x) => x.trim());
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      return den === 0 ? NaN : num / den;
    }
    return parseFloat(parts[0]);
  }
  return NaN;
}

export function verifyAnswer(
  expectedVal: number | string,
  userVal: string,
  tolerance = 0.005
): { correct: boolean; enteredNum: number; expectedNum: number; message: string } {
  const enteredNum = parseNumberFraction(userVal);
  const expectedNum = typeof expectedVal === "number" ? expectedVal : parseNumberFraction(expectedVal);

  if (isNaN(enteredNum)) {
    return {
      correct: false,
      enteredNum: NaN,
      expectedNum,
      message: "Vui lòng nhập một số hợp lệ (ví dụ: 13, 0.5 hoặc 1/2).",
    };
  }

  const diff = Math.abs(enteredNum - expectedNum);
  const maxAllow = Math.max(tolerance, Math.abs(expectedNum) * 0.001);
  const isCorrect = diff <= maxAllow;

  return {
    correct: isCorrect,
    enteredNum,
    expectedNum,
    message: isCorrect
      ? "✓ Chính xác! Đáp số của em đã khớp với tính toán toán học."
      : `Chưa khớp. Sai lệch: ${diff.toFixed(4)}. Hãy kiểm tra lại công thức và điều kiện bài toán.`,
  };
}
