export function snapToMilestone(value: number, milestones: number[], tolerance: number): number {
  const closest = milestones.reduce((best, mark) => Math.abs(mark - value) < Math.abs(best - value) ? mark : best, milestones[0] ?? value);
  return Math.abs(closest - value) <= tolerance ? closest : value;
}

export function formatRadianToPi(rad: number): string {
  if (!Number.isFinite(rad)) return "\\text{không xác định}";
  const ratio = rad / Math.PI;
  for (const denominator of [1, 2, 3, 4, 6, 12]) {
    const numerator = Math.round(ratio * denominator);
    if (Math.abs(ratio - numerator / denominator) > 0.0005) continue;
    if (numerator === 0) return "0";
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const divisor = gcd(Math.abs(numerator), denominator);
    const n = numerator / divisor;
    const d = denominator / divisor;
    const top = n === 1 ? "\\pi" : n === -1 ? "-\\pi" : `${n}\\pi`;
    return d === 1 ? top : `\\frac{${top}}{${d}}`;
  }
  return `${ratio.toFixed(2)}\\pi`;
}

export function formatExactLength(value: number): string {
  const half = Math.round(value * 2);
  if (Math.abs(value * 2 - half) < 0.001) return half % 2 === 0 ? String(half / 2) : `\\frac{${half}}{2}`;
  return value.toFixed(1).replace(".", "{,}");
}
