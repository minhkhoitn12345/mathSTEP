/**
 * MathSTEP Module 3: Lượng Giác - Lõi Toán Học "Tự kiến tạo" (ConstructLab)
 * Rigorous mathematical verification engine for inverse problems, graphs,
 * real-world modeling, domain singularities, and wave superposition.
 */

// Tolerance for numerical checks
const EPSILON = 1e-6;

/**
 * Normalizes an angle into [0, 2*PI)
 */
export function normalizeRad(rad: number): number {
  const twoPi = 2 * Math.PI;
  let r = rad % twoPi;
  if (r < 0) r += twoPi;
  if (Math.abs(r - twoPi) < EPSILON) r = 0;
  return r;
}

/**
 * Normalizes an angle into [0, 360)
 */
export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  if (Math.abs(d - 360) < EPSILON) d = 0;
  return d;
}

// ==========================================
// KT01: Inverse Value to Positions
// ==========================================
export interface ValueToPositionResult {
  validM: boolean;
  pointsOnCircle: Array<{ x: number; y: number; angleRad: number; angleDeg: number }>;
  quadrantByPoint: Array<'I' | 'II' | 'III' | 'IV' | 'axis'>;
  filteredByDomain: Array<{ x: number; y: number; angleRad: number; angleDeg: number }>;
  cosValues: string[];
  tanValues: string[];
  cotValues: string[];
}

export function solvePositionsFromTrigValue(
  func: 'sin' | 'cos' | 'tan' | 'cot',
  m: number,
  domainIntervalRad?: [number, number]
): ValueToPositionResult {
  const points: Array<{ x: number; y: number; angleRad: number; angleDeg: number }> = [];

  if (func === 'sin') {
    if (Math.abs(m) > 1) {
      return {
        validM: false,
        pointsOnCircle: [],
        quadrantByPoint: [],
        filteredByDomain: [],
        cosValues: [],
        tanValues: [],
        cotValues: [],
      };
    }
    const y = m;
    const xMag = Math.sqrt(Math.max(0, 1 - y * y));
    if (Math.abs(xMag) < EPSILON) {
      // y = 1 or -1 -> single point on circle
      const angle = y > 0 ? Math.PI / 2 : (3 * Math.PI) / 2;
      points.push({ x: 0, y, angleRad: angle, angleDeg: (angle * 180) / Math.PI });
    } else {
      // Two points: (+xMag, y) and (-xMag, y)
      const a1 = normalizeRad(Math.asin(y));
      const a2 = normalizeRad(Math.PI - Math.asin(y));
      points.push({ x: xMag, y, angleRad: a1, angleDeg: (a1 * 180) / Math.PI });
      points.push({ x: -xMag, y, angleRad: a2, angleDeg: (a2 * 180) / Math.PI });
    }
  } else if (func === 'cos') {
    if (Math.abs(m) > 1) {
      return {
        validM: false,
        pointsOnCircle: [],
        quadrantByPoint: [],
        filteredByDomain: [],
        cosValues: [],
        tanValues: [],
        cotValues: [],
      };
    }
    const x = m;
    const yMag = Math.sqrt(Math.max(0, 1 - x * x));
    if (Math.abs(yMag) < EPSILON) {
      const angle = x > 0 ? 0 : Math.PI;
      points.push({ x, y: 0, angleRad: angle, angleDeg: (angle * 180) / Math.PI });
    } else {
      const a1 = normalizeRad(Math.acos(x));
      const a2 = normalizeRad(2 * Math.PI - Math.acos(x));
      points.push({ x, y: yMag, angleRad: a1, angleDeg: (a1 * 180) / Math.PI });
      points.push({ x, y: -yMag, angleRad: a2, angleDeg: (a2 * 180) / Math.PI });
    }
  } else if (func === 'tan') {
    // tan alpha = m => line y = m*x. Intersect with x^2+y^2=1: x^2(1+m^2)=1
    const x1 = 1 / Math.sqrt(1 + m * m);
    const y1 = m * x1;
    const a1 = normalizeRad(Math.atan2(y1, x1));
    const x2 = -x1;
    const y2 = -y1;
    const a2 = normalizeRad(Math.atan2(y2, x2));
    points.push({ x: x1, y: y1, angleRad: a1, angleDeg: (a1 * 180) / Math.PI });
    points.push({ x: x2, y: y2, angleRad: a2, angleDeg: (a2 * 180) / Math.PI });
  }

  // Determine quadrant
  const quadrantByPoint = points.map((p) => {
    if (Math.abs(p.x) < EPSILON || Math.abs(p.y) < EPSILON) return 'axis' as const;
    if (p.x > 0 && p.y > 0) return 'I' as const;
    if (p.x < 0 && p.y > 0) return 'II' as const;
    if (p.x < 0 && p.y < 0) return 'III' as const;
    return 'IV' as const;
  });

  // Filter by domain
  let filtered = [...points];
  if (domainIntervalRad) {
    const [minRad, maxRad] = domainIntervalRad;
    filtered = points.filter((p) => {
      // test representative angle and multi-turn
      const normMin = minRad;
      const normMax = maxRad;
      // Check if p.angleRad fits in [normMin, normMax] modulo 2pi
      let fits = false;
      for (let k = -3; k <= 3; k++) {
        const testAng = p.angleRad + k * 2 * Math.PI;
        if (testAng >= normMin - EPSILON && testAng <= normMax + EPSILON) {
          fits = true;
          break;
        }
      }
      return fits;
    });
  }

  // Calculate remaining values
  const cosValues: string[] = [];
  const tanValues: string[] = [];
  const cotValues: string[] = [];

  points.forEach((p) => {
    const cosVal = p.x;
    const sinVal = p.y;
    cosValues.push(cosVal.toFixed(3));
    if (Math.abs(cosVal) < EPSILON) {
      tanValues.push('Không xác định');
    } else {
      tanValues.push((sinVal / cosVal).toFixed(3));
    }
    if (Math.abs(sinVal) < EPSILON) {
      cotValues.push('Không xác định');
    } else {
      cotValues.push((cosVal / sinVal).toFixed(3));
    }
  });

  return {
    validM: true,
    pointsOnCircle: points,
    quadrantByPoint,
    filteredByDomain: filtered,
    cosValues,
    tanValues,
    cotValues,
  };
}

// ==========================================
// KT03: Formula Parser & Harmonic Normalizer
// Checks mathematical equivalence of y = a*sin(bx+c)+d or a*cos(bx+c)+d
// ==========================================
export interface HarmonicParameters {
  amplitude: number; // positive A
  angularFreq: number; // positive omega (b)
  midline: number; // d
  period: number; // T = 2*PI / omega
  phaseOffsetRad: number; // phi in [-PI, PI) where f(x) = A*cos(omega*x + phi) + d
}

/**
 * Evaluates expression string or parameters f(x)
 */
export function evaluateHarmonic(params: HarmonicParameters, x: number): number {
  return params.amplitude * Math.cos(params.angularFreq * x + params.phaseOffsetRad) + params.midline;
}

/**
 * Checks if two sets of harmonic parameters represent the EXACT same function globally on R.
 * f1(x) = A1*cos(w1*x + phi1) + d1
 * f2(x) = A2*cos(w2*x + phi2) + d2
 */
export function areHarmonicsEquivalent(h1: HarmonicParameters, h2: HarmonicParameters): boolean {
  // 1. Midline must match
  if (Math.abs(h1.midline - h2.midline) > EPSILON) return false;

  // 2. Frequency must match
  if (Math.abs(h1.angularFreq - h2.angularFreq) > EPSILON) return false;

  // 3. Amplitude must match
  if (Math.abs(h1.amplitude - h2.amplitude) > EPSILON) return false;

  // If amplitude is 0 (constant function), phases don't matter
  if (h1.amplitude < EPSILON) return true;

  // 4. Phase difference must be a multiple of 2*PI
  const phaseDiff = Math.abs(h1.phaseOffsetRad - h2.phaseOffsetRad) % (2 * Math.PI);
  const diffCloseToZero = phaseDiff < EPSILON || Math.abs(phaseDiff - 2 * Math.PI) < EPSILON;

  return diffCloseToZero;
}

/**
 * Converts a standard formula string or parsed parts into normalized HarmonicParameters
 * Supported forms:
 *   a*cos(b*x + c) + d
 *   a*sin(b*x + c) + d
 * Note: sin(theta) = cos(theta - PI/2)
 */
export function parseHarmonicFormula(
  family: 'sin' | 'cos',
  a: number,
  b: number,
  cRad: number,
  d: number
): HarmonicParameters {
  // If a < 0: -A*cos(u) = A*cos(u + PI)
  let amp = Math.abs(a);
  let omega = Math.abs(b);
  let phase = cRad;

  // Handle b < 0:
  // cos(-w*x + c) = cos(w*x - c)
  // sin(-w*x + c) = -sin(w*x - c)
  if (b < 0) {
    phase = -phase;
    if (family === 'sin') {
      a = -a; // negative sign passed outside
    }
  }

  // Convert sin to cos: sin(u) = cos(u - PI/2)
  if (family === 'sin') {
    phase = phase - Math.PI / 2;
  }

  // If a < 0, add PI to phase
  if (a < 0) {
    phase = phase + Math.PI;
  }

  // Normalize phase to [-PI, PI)
  let normPhase = phase % (2 * Math.PI);
  if (normPhase < -Math.PI) normPhase += 2 * Math.PI;
  if (normPhase >= Math.PI) normPhase -= 2 * Math.PI;

  const period = omega > EPSILON ? (2 * Math.PI) / omega : 0;

  return {
    amplitude: amp,
    angularFreq: omega,
    midline: d,
    period,
    phaseOffsetRad: normPhase,
  };
}

// ==========================================
// KT04: Ferris Wheel Model Verifier
// h(t) = 90 - 75*cos(PI*t / 15)
// ==========================================
export interface FerrisWheelCheckpoint {
  t: number;
  expectedH: number;
  modelH: number;
  passed: boolean;
}

export interface FerrisWheelCheckResult {
  validMidline: boolean;
  validAmplitude: boolean;
  validPeriod: boolean;
  validInitialH: boolean; // h(0) == 15
  validCheckpoint20: boolean; // h(20) == 127.5
  allPassed: boolean;
  modelErrorDesc?: string;
  checkpoints: FerrisWheelCheckpoint[];
}

export function verifyFerrisWheelModel(
  proposedA: number,
  proposedB: number, // in rad per minute
  proposedCRad: number,
  proposedD: number,
  family: 'sin' | 'cos'
): FerrisWheelCheckResult {
  // Target constants
  const targetMin = 15;
  const targetMax = 165;
  const targetD = 90;
  const targetA = 75;
  const targetT = 30; // 30 mins
  const targetOmega = (2 * Math.PI) / targetT; // PI/15 rad/min

  const harmonic = parseHarmonicFormula(family, proposedA, proposedB, proposedCRad, proposedD);

  // 1. Midline check
  const validMidline = Math.abs(harmonic.midline - targetD) < EPSILON;

  // 2. Amplitude check
  const validAmplitude = Math.abs(harmonic.amplitude - targetA) < EPSILON;

  // 3. Period check: T = 30 min => omega = PI/15 ≈ 0.2094395
  const validPeriod = Math.abs(harmonic.angularFreq - targetOmega) < 1e-4;

  // 4. Initial condition: at t=0, h(0) must equal 15
  const h0 = evaluateHarmonic(harmonic, 0);
  const validInitialH = Math.abs(h0 - targetMin) < 0.1;

  // 5. Checkpoint t=20: h(20) must equal 127.5
  // h(20) = 90 - 75*cos(20*PI/15) = 90 - 75*cos(4*PI/3) = 90 - 75*(-0.5) = 90 + 37.5 = 127.5
  const h20 = evaluateHarmonic(harmonic, 20);
  const validCheckpoint20 = Math.abs(h20 - 127.5) < 0.1;

  const checkpoints: FerrisWheelCheckpoint[] = [
    { t: 0, expectedH: 15, modelH: h0, passed: validInitialH },
    { t: 7.5, expectedH: 90, modelH: evaluateHarmonic(harmonic, 7.5), passed: Math.abs(evaluateHarmonic(harmonic, 7.5) - 90) < 0.2 },
    { t: 15, expectedH: 165, modelH: evaluateHarmonic(harmonic, 15), passed: Math.abs(evaluateHarmonic(harmonic, 15) - 165) < 0.2 },
    { t: 20, expectedH: 127.5, modelH: h20, passed: validCheckpoint20 },
    { t: 30, expectedH: 15, modelH: evaluateHarmonic(harmonic, 30), passed: Math.abs(evaluateHarmonic(harmonic, 30) - 15) < 0.2 },
  ];

  let modelErrorDesc: string | undefined;
  if (!validMidline) modelErrorDesc = 'Đường giữa chưa khớp tâm trục quay 90m.';
  else if (!validAmplitude) modelErrorDesc = 'Biên độ chưa khớp bán kính bánh xe 75m.';
  else if (!validPeriod) modelErrorDesc = 'Chu kỳ chưa khớp 30 phút (tần số góc ω = 2π/30 = π/15).';
  else if (!validInitialH) {
    modelErrorDesc =
      'Sai điều kiện ban đầu! Tại thời điểm t=0 khách lên ở điểm thấp nhất (h=15m). Hàm của em cho h(0) = ' +
      h0.toFixed(1) +
      'm (ví dụ dạng sin khởi hành tại đường giữa 90m thay vì đáy).';
  } else if (!validCheckpoint20) {
    modelErrorDesc = 'Thời điểm kiểm tra t=20 phút chưa đạt 127.5m.';
  }

  const allPassed = validMidline && validAmplitude && validPeriod && validInitialH && validCheckpoint20;

  return {
    validMidline,
    validAmplitude,
    validPeriod,
    validInitialH,
    validCheckpoint20,
    allPassed,
    modelErrorDesc,
    checkpoints,
  };
}

// ==========================================
// KT05: Domain Singularities Checker
// ==========================================
export interface DomainExclusionCheck {
  expression: string;
  conditionFormula: string;
  excludedAnglesDegInCycle: number[];
  excludedAnglesFormulaText: string;
  isAngleExcluded: (angleRad: number) => boolean;
}

export const DOMAIN_CASES: Record<string, DomainExclusionCheck> = {
  sin_over_1_plus_cos: {
    expression: 'y = sin(x) / (1 + cos(x))',
    conditionFormula: '1 + cos(x) ≠ 0 ⇔ cos(x) ≠ -1',
    excludedAnglesDegInCycle: [180],
    excludedAnglesFormulaText: 'x ≠ π + k*2π (k ∈ ℤ)',
    isAngleExcluded: (r: number) => {
      const norm = normalizeRad(r);
      return Math.abs(norm - Math.PI) < 1e-4;
    },
  },
  sin2_over_sin: {
    expression: 'y = sin²(x) / sin(x)',
    conditionFormula: 'sin(x) ≠ 0',
    excludedAnglesDegInCycle: [0, 180],
    excludedAnglesFormulaText: 'x ≠ k*π (k ∈ ℤ)',
    isAngleExcluded: (r: number) => {
      const norm = normalizeRad(r);
      return Math.abs(norm - 0) < 1e-4 || Math.abs(norm - Math.PI) < 1e-4;
    },
  },
  tan_x: {
    expression: 'y = tan(x)',
    conditionFormula: 'cos(x) ≠ 0',
    excludedAnglesDegInCycle: [90, 270],
    excludedAnglesFormulaText: 'x ≠ π/2 + k*π (k ∈ ℤ)',
    isAngleExcluded: (r: number) => {
      const norm = normalizeRad(r);
      return Math.abs(norm - Math.PI / 2) < 1e-4 || Math.abs(norm - (3 * Math.PI) / 2) < 1e-4;
    },
  },
};

// ==========================================
// KT06: Wave Superposition Checker
// sin(x) + cos(x) = sqrt(2)*sin(x + PI/4)
// ==========================================
export function verifyWaveSuperposition(
  amplitudeA: number,
  phaseCRad: number,
  family: 'sin' | 'cos'
): { passed: boolean; feedback: string } {
  // Target: y = sqrt(2) * sin(x + PI/4)
  const targetHarmonic = parseHarmonicFormula('sin', Math.SQRT2, 1, Math.PI / 4, 0);
  const studentHarmonic = parseHarmonicFormula(family, amplitudeA, 1, phaseCRad, 0);

  const equiv = areHarmonicsEquivalent(targetHarmonic, studentHarmonic);
  if (equiv) {
    return {
      passed: true,
      feedback:
        'Chính xác hoàn toàn! Đã chứng minh và kiểm chứng đẳng thức: sin(x) + cos(x) = √2 sin(x + π/4) = √2 cos(x - π/4). Biên độ dao động tổng hợp bằng √2 ≈ 1.414.',
    };
  } else {
    return {
      passed: false,
      feedback: `Chưa tương đương! Đồ thị tổng hợp có biên độ √2 ≈ 1.414 và độ lệch pha π/4 rad (45°). Hiện tại tham số em đưa ra là biên độ ${amplitudeA.toFixed(
        3
      )}.`,
    };
  }
}
