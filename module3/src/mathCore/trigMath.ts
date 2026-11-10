/**
 * MathSTEP Module 3: Lượng Giác
 * Core Mathematical Engine
 * Pure math algorithms, exact rational angle parsing, special values lookup,
 * transformation logic, periodic functions, equation solvers, and test suites.
 */

import {
  AngleUnit,
  ExactAngle,
  ExactFraction,
  FunctionParams,
  FunctionType,
  QuadrantType,
  TrigValueResult,
  TrigValues,
} from '../types/math';

export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x === 0n ? 1n : x;
}

export function simplifyFraction(num: bigint, den: bigint): ExactFraction {
  if (den === 0n) throw new Error('Mẫu số không thể bằng 0');
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcdBigInt(num, den);
  return { num: num / g, den: den / g };
}

/**
 * Normalizes large or complex angle strings into ExactAngle
 * Handles inputs like: -750, 1110deg, 30°, pi/6, -3pi/2, 25π/6, 10^18*360°+30°
 */
export function parseAndNormalizeAngle(input: string, defaultUnit: AngleUnit = 'deg'): ExactAngle {
  const trimmed = input.trim().replace(/\s+/g, '').replace(',', '.');
  let unit: AngleUnit = defaultUnit;
  let working = trimmed;

  if (working.toLowerCase().endsWith('deg') || working.endsWith('°')) {
    unit = 'deg';
    working = working.replace(/(deg|°)$/i, '');
  } else if (working.toLowerCase().endsWith('rad')) {
    unit = 'rad';
    working = working.replace(/rad$/i, '');
  } else if (working.includes('pi') || working.includes('π')) {
    unit = 'rad';
  }

  // Check for expressions like 10^18*360+30 or 10^18*360°+30°
  let degFraction: ExactFraction;
  let radPiFraction: ExactFraction;

  const powMatch = working.match(/^10\^(\d+)\*360\+(\d+)$/);
  if (powMatch) {
    // Exact huge number: 10^k * 360 + remainder
    const rem = BigInt(powMatch[2]);
    degFraction = { num: rem, den: 1n };
    radPiFraction = simplifyFraction(rem, 180n);
  } else if (unit === 'deg') {
    // Degrees
    if (working.includes('/')) {
      try {
        const parts = working.split('/');
        const num = BigInt(Math.round(parseFloat(parts[0])));
        const den = BigInt(Math.round(parseFloat(parts[1]))) || 1n;
        degFraction = simplifyFraction(num, den);
      } catch {
        degFraction = { num: 0n, den: 1n };
      }
    } else {
      const floatVal = parseFloat(working);
      if (isNaN(floatVal)) {
        degFraction = { num: 0n, den: 1n };
      } else {
        // Check if integer
        if (Number.isInteger(floatVal)) {
          degFraction = { num: BigInt(Math.round(floatVal)), den: 1n };
        } else {
          // Rationalize decimal up to 4 decimal places
          const factor = 10000n;
          const num = BigInt(Math.round(floatVal * 10000));
          degFraction = simplifyFraction(num, factor);
        }
      }
    }
    // radPiFraction = degFraction / 180
    radPiFraction = simplifyFraction(degFraction.num, degFraction.den * 180n);
  } else {
    // Radians
    let piClean = working.replace(/π/g, 'pi');
    if (piClean.includes('pi')) {
      // Form like: [num]pi/[den] or pi/[den] or [num]pi
      piClean = piClean.replace('pi', '');
      if (piClean === '' || piClean === '+') piClean = '1';
      if (piClean === '-') piClean = '-1';
      if (piClean.includes('/')) {
        const [nStr, dStr] = piClean.split('/');
        const num = nStr === '' ? 1n : nStr === '-' ? -1n : BigInt(nStr);
        const den = BigInt(dStr);
        radPiFraction = simplifyFraction(num, den);
      } else {
        const num = BigInt(piClean);
        radPiFraction = { num, den: 1n };
      }
      degFraction = simplifyFraction(radPiFraction.num * 180n, radPiFraction.den);
    } else {
      // Pure decimal radians without pi
      const val = parseFloat(working) || 0;
      const degVal = (val * 180) / Math.PI;
      const factor = 10000n;
      degFraction = simplifyFraction(BigInt(Math.round(degVal * 10000)), factor);
      radPiFraction = simplifyFraction(BigInt(Math.round(val * 10000)), 10000n * 3n); // approx
    }
  }

  // Degree values
  const degDecimal = Number(degFraction.num) / Number(degFraction.den);
  const radDecimal = (degDecimal * Math.PI) / 180;

  // Turn count: trunc(deg / 360)
  const fullDegInt = degFraction.num / (degFraction.den * 360n);
  const turnCount = Number(fullDegInt);

  // Signed remainder in degrees: alpha - 360 * turnCount
  const signedRemNum = degFraction.num - BigInt(turnCount) * 360n * degFraction.den;
  const signedRemainderDeg = Number(signedRemNum) / Number(degFraction.den);
  const signedRemainderRad = (signedRemainderDeg * Math.PI) / 180;

  // Representative angle in [0, 360)
  let repDeg = degDecimal % 360;
  if (repDeg < 0) repDeg += 360;
  if (Math.abs(repDeg - 360) < 1e-9) repDeg = 0;
  const representativeRad = (repDeg * Math.PI) / 180;

  // Quadrant or axis
  let quadrant: QuadrantType = 'axis';
  let axisName: '+Ox' | '+Oy' | '-Ox' | '-Oy' | undefined;

  const eps = 1e-6;
  if (Math.abs(repDeg - 0) < eps || Math.abs(repDeg - 360) < eps) {
    quadrant = 'axis';
    axisName = '+Ox';
  } else if (Math.abs(repDeg - 90) < eps) {
    quadrant = 'axis';
    axisName = '+Oy';
  } else if (Math.abs(repDeg - 180) < eps) {
    quadrant = 'axis';
    axisName = '-Ox';
  } else if (Math.abs(repDeg - 270) < eps) {
    quadrant = 'axis';
    axisName = '-Oy';
  } else if (repDeg > 0 && repDeg < 90) {
    quadrant = 'I';
  } else if (repDeg > 90 && repDeg < 180) {
    quadrant = 'II';
  } else if (repDeg > 180 && repDeg < 270) {
    quadrant = 'III';
  } else {
    quadrant = 'IV';
  }

  return {
    rawInput: input,
    unit,
    degFraction,
    radPiFraction,
    degDecimal,
    radDecimal,
    accumulatedDeg: degDecimal,
    accumulatedRad: radDecimal,
    turnCount,
    signedRemainderDeg,
    signedRemainderRad,
    representativeDeg: repDeg,
    representativeRad,
    quadrant,
    axisName,
  };
}

/**
 * Standard special angle lookup table
 */
interface SpecialAngleValue {
  sinExact: string;
  cosExact: string;
  tanExact: string;
  cotExact: string;
  sinNum: number;
  cosNum: number;
  tanNum: number | null;
  cotNum: number | null;
}

const SPECIAL_ANGLES: Record<number, SpecialAngleValue> = {
  0: {
    sinExact: '0',
    cosExact: '1',
    tanExact: '0',
    cotExact: 'Không xác định',
    sinNum: 0,
    cosNum: 1,
    tanNum: 0,
    cotNum: null,
  },
  30: {
    sinExact: '1/2',
    cosExact: '√3/2',
    tanExact: '√3/3',
    cotExact: '√3',
    sinNum: 0.5,
    cosNum: Math.sqrt(3) / 2,
    tanNum: Math.sqrt(3) / 3,
    cotNum: Math.sqrt(3),
  },
  45: {
    sinExact: '√2/2',
    cosExact: '√2/2',
    tanExact: '1',
    cotExact: '1',
    sinNum: Math.SQRT2 / 2,
    cosNum: Math.SQRT2 / 2,
    tanNum: 1,
    cotNum: 1,
  },
  60: {
    sinExact: '√3/2',
    cosExact: '1/2',
    tanExact: '√3',
    cotExact: '√3/3',
    sinNum: Math.sqrt(3) / 2,
    cosNum: 0.5,
    tanNum: Math.sqrt(3),
    cotNum: Math.sqrt(3) / 3,
  },
  90: {
    sinExact: '1',
    cosExact: '0',
    tanExact: 'Không xác định',
    cotExact: '0',
    sinNum: 1,
    cosNum: 0,
    tanNum: null,
    cotNum: 0,
  },
  120: {
    sinExact: '√3/2',
    cosExact: '-1/2',
    tanExact: '-√3',
    cotExact: '-√3/3',
    sinNum: Math.sqrt(3) / 2,
    cosNum: -0.5,
    tanNum: -Math.sqrt(3),
    cotNum: -Math.sqrt(3) / 3,
  },
  135: {
    sinExact: '√2/2',
    cosExact: '-√2/2',
    tanExact: '-1',
    cotExact: '-1',
    sinNum: Math.SQRT2 / 2,
    cosNum: -Math.SQRT2 / 2,
    tanNum: -1,
    cotNum: -1,
  },
  150: {
    sinExact: '1/2',
    cosExact: '-√3/2',
    tanExact: '-√3/3',
    cotExact: '-√3',
    sinNum: 0.5,
    cosNum: -Math.sqrt(3) / 2,
    tanNum: -Math.sqrt(3) / 3,
    cotNum: -Math.sqrt(3),
  },
  180: {
    sinExact: '0',
    cosExact: '-1',
    tanExact: '0',
    cotExact: 'Không xác định',
    sinNum: 0,
    cosNum: -1,
    tanNum: 0,
    cotNum: null,
  },
  210: {
    sinExact: '-1/2',
    cosExact: '-√3/2',
    tanExact: '√3/3',
    cotExact: '√3',
    sinNum: -0.5,
    cosNum: -Math.sqrt(3) / 2,
    tanNum: Math.sqrt(3) / 3,
    cotNum: Math.sqrt(3),
  },
  225: {
    sinExact: '-√2/2',
    cosExact: '-√2/2',
    tanExact: '1',
    cotExact: '1',
    sinNum: -Math.SQRT2 / 2,
    cosNum: -Math.SQRT2 / 2,
    tanNum: 1,
    cotNum: 1,
  },
  240: {
    sinExact: '-√3/2',
    cosExact: '-1/2',
    tanExact: '√3',
    cotExact: '√3/3',
    sinNum: -Math.sqrt(3) / 2,
    cosNum: -0.5,
    tanNum: Math.sqrt(3),
    cotNum: Math.sqrt(3) / 3,
  },
  270: {
    sinExact: '-1',
    cosExact: '0',
    tanExact: 'Không xác định',
    cotExact: '0',
    sinNum: -1,
    cosNum: 0,
    tanNum: null,
    cotNum: 0,
  },
  300: {
    sinExact: '-√3/2',
    cosExact: '1/2',
    tanExact: '-√3',
    cotExact: '-√3/3',
    sinNum: -Math.sqrt(3) / 2,
    cosNum: 0.5,
    tanNum: -Math.sqrt(3),
    cotNum: -Math.sqrt(3) / 3,
  },
  315: {
    sinExact: '-√2/2',
    cosExact: '√2/2',
    tanExact: '-1',
    cotExact: '-1',
    sinNum: -Math.SQRT2 / 2,
    cosNum: Math.SQRT2 / 2,
    tanNum: -1,
    cotNum: -1,
  },
  330: {
    sinExact: '-1/2',
    cosExact: '√3/2',
    tanExact: '-√3/3',
    cotExact: '-√3',
    sinNum: -0.5,
    cosNum: Math.sqrt(3) / 2,
    tanNum: -Math.sqrt(3) / 3,
    cotNum: -Math.sqrt(3),
  },
};

/**
 * Calculates exact and approximate trig values for any angle
 */
export function getTrigValues(angle: ExactAngle): TrigValues {
  const repDegRound = Math.round(angle.representativeDeg);
  const isSpecial = Math.abs(angle.representativeDeg - repDegRound) < 1e-4 && repDegRound in SPECIAL_ANGLES;

  if (isSpecial) {
    const s = SPECIAL_ANGLES[repDegRound];
    return {
      sin: {
        exact: s.sinExact,
        approx: s.sinNum,
        exactness: 'exact',
        isUndefined: false,
        explanation: `sin(${angle.representativeDeg}°) = ${s.sinExact}`,
      },
      cos: {
        exact: s.cosExact,
        approx: s.cosNum,
        exactness: 'exact',
        isUndefined: false,
        explanation: `cos(${angle.representativeDeg}°) = ${s.cosExact}`,
      },
      tan: {
        exact: s.tanExact,
        approx: s.tanNum,
        exactness: s.tanNum === null ? 'undefined' : 'exact',
        isUndefined: s.tanNum === null,
        explanation:
          s.tanNum === null
            ? `Tại ${angle.representativeDeg}° (cos = 0), tan không xác định do chia cho 0`
            : `tan = sin/cos = ${s.tanExact}`,
      },
      cot: {
        exact: s.cotExact,
        approx: s.cotNum,
        exactness: s.cotNum === null ? 'undefined' : 'exact',
        isUndefined: s.cotNum === null,
        explanation:
          s.cotNum === null
            ? `Tại ${angle.representativeDeg}° (sin = 0), cot không xác định do chia cho 0`
            : `cot = cos/sin = ${s.cotExact}`,
      },
    };
  }

  // Non-special angle
  const rad = angle.radDecimal;
  const sNum = Math.sin(rad);
  const cNum = Math.cos(rad);

  const isCosZero = Math.abs(cNum) < 1e-9;
  const isSinZero = Math.abs(sNum) < 1e-9;

  return {
    sin: {
      exact: sNum.toFixed(4),
      approx: sNum,
      exactness: 'approximate',
      isUndefined: false,
      explanation: `Tung độ điểm M trên đường tròn đơn vị ≈ ${sNum.toFixed(4)}`,
    },
    cos: {
      exact: cNum.toFixed(4),
      approx: cNum,
      exactness: 'approximate',
      isUndefined: false,
      explanation: `Hoành độ điểm M trên đường tròn đơn vị ≈ ${cNum.toFixed(4)}`,
    },
    tan: {
      exact: isCosZero ? 'Không xác định' : (sNum / cNum).toFixed(4),
      approx: isCosZero ? null : sNum / cNum,
      exactness: isCosZero ? 'undefined' : 'approximate',
      isUndefined: isCosZero,
      explanation: isCosZero ? 'Mẫu số cos = 0 nên tan không xác định' : `Tỉ số sin/cos ≈ ${(sNum / cNum).toFixed(4)}`,
    },
    cot: {
      exact: isSinZero ? 'Không xác định' : (cNum / sNum).toFixed(4),
      approx: isSinZero ? null : cNum / sNum,
      exactness: isSinZero ? 'undefined' : 'approximate',
      isUndefined: isSinZero,
      explanation: isSinZero ? 'Mẫu số sin = 0 nên cot không xác định' : `Tỉ số cos/sin ≈ ${(cNum / sNum).toFixed(4)}`,
    },
  };
}

/**
 * Angles relations:
 * Computes related angle for a given alpha
 */
export function getRelatedAngle(
  alpha: ExactAngle,
  relation: '-alpha' | 'pi-alpha' | 'pi+alpha' | 'pi/2-alpha' | 'pi/2+alpha' | 'alpha+2kpi',
  k: number = 1
): {
  targetAngle: ExactAngle;
  transformationType: string;
  transformationDesc: string;
  formulaSin: string;
  formulaCos: string;
  formulaTan: string;
  formulaCot: string;
} {
  const deg = alpha.degDecimal;
  let targetDeg: number;
  let transformationType = '';
  let transformationDesc = '';
  let formulaSin = '';
  let formulaCos = '';
  let formulaTan = '';
  let formulaCot = '';

  switch (relation) {
    case '-alpha':
      targetDeg = -deg;
      transformationType = 'Đối xứng qua trục hoành Ox';
      transformationDesc = 'Hoành độ giữ nguyên (cos(-α) = cos α), tung độ đổi dấu (sin(-α) = -sin α)';
      formulaSin = 'sin(-α) = -sin α';
      formulaCos = 'cos(-α) = cos α';
      formulaTan = 'tan(-α) = -tan α (khi cos α ≠ 0)';
      formulaCot = 'cot(-α) = -cot α (khi sin α ≠ 0)';
      break;
    case 'pi-alpha':
      targetDeg = 180 - deg;
      transformationType = 'Đối xứng qua trục tung Oy';
      transformationDesc = 'Tung độ giữ nguyên (sin(π-α) = sin α), hoành độ đổi dấu (cos(π-α) = -cos α)';
      formulaSin = 'sin(π-α) = sin α';
      formulaCos = 'cos(π-α) = -cos α';
      formulaTan = 'tan(π-α) = -tan α (khi cos α ≠ 0)';
      formulaCot = 'cot(π-α) = -cot α (khi sin α ≠ 0)';
      break;
    case 'pi+alpha':
      targetDeg = 180 + deg;
      transformationType = 'Đối xứng qua gốc tọa độ O';
      transformationDesc = 'Cả hoành độ và tung độ đều đổi dấu: (-cos α, -sin α)';
      formulaSin = 'sin(π+α) = -sin α';
      formulaCos = 'cos(π+α) = -cos α';
      formulaTan = 'tan(π+α) = tan α (khi cos α ≠ 0)';
      formulaCot = 'cot(π+α) = cot α (khi sin α ≠ 0)';
      break;
    case 'pi/2-alpha':
      targetDeg = 90 - deg;
      transformationType = 'Đối xứng qua đường phân giác y = x';
      transformationDesc = 'Hoán đổi hoành độ và tung độ: (sin α, cos α)';
      formulaSin = 'sin(π/2 - α) = cos α';
      formulaCos = 'cos(π/2 - α) = sin α';
      formulaTan = 'tan(π/2 - α) = cot α (khi sin α ≠ 0)';
      formulaCot = 'cot(π/2 - α) = tan α (khi cos α ≠ 0)';
      break;
    case 'pi/2+alpha':
      targetDeg = 90 + deg;
      transformationType = 'Phép quay 90° ngược chiều kim đồng hồ quanh O';
      transformationDesc = 'Tọa độ mới (-sin α, cos α)';
      formulaSin = 'sin(π/2 + α) = cos α';
      formulaCos = 'cos(π/2 + α) = -sin α';
      formulaTan = 'tan(π/2 + α) = -cot α (khi sin α ≠ 0)';
      formulaCot = 'cot(π/2 + α) = -tan α (khi cos α ≠ 0)';
      break;
    case 'alpha+2kpi':
    default:
      targetDeg = deg + k * 360;
      transformationType = `Quay trọn ${k} vòng (${k * 360}°)`;
      transformationDesc = 'Điểm biểu diễn trở lại vị trí cũ nhưng số đo góc tăng k vòng';
      formulaSin = 'sin(α + 2kπ) = sin α';
      formulaCos = 'cos(α + 2kπ) = cos α';
      formulaTan = 'tan(α + kπ) = tan α';
      formulaCot = 'cot(α + kπ) = cot α';
      break;
  }

  const targetAngle = parseAndNormalizeAngle(`${targetDeg}deg`, 'deg');
  return {
    targetAngle,
    transformationType,
    transformationDesc,
    formulaSin,
    formulaCos,
    formulaTan,
    formulaCot,
  };
}

/**
 * Calculates sum-to-product variables u and v
 * u = (alpha + beta)/2, v = (alpha - beta)/2
 */
export function getSumToProductVars(alphaDeg: number, betaDeg: number) {
  const uDeg = (alphaDeg + betaDeg) / 2;
  const vDeg = (alphaDeg - betaDeg) / 2;
  return {
    uDeg,
    vDeg,
    uRad: (uDeg * Math.PI) / 180,
    vRad: (vDeg * Math.PI) / 180,
    verifyAlpha: uDeg + vDeg,
    verifyBeta: uDeg - vDeg,
  };
}

/**
 * Evaluates function y = a * func(b*x + c) + d
 */
export function evaluateTrigFunction(
  fnType: FunctionType,
  x: number, // in radians
  params: FunctionParams
): { y: number | null; isUndefined: boolean; phase: number } {
  const { a, b, c, d } = params;
  const phase = b * x + c;

  if (fnType === 'sin') {
    return { y: a * Math.sin(phase) + d, isUndefined: false, phase };
  }
  if (fnType === 'cos') {
    return { y: a * Math.cos(phase) + d, isUndefined: false, phase };
  }

  // Tan or Cot
  if (fnType === 'tan') {
    const cVal = Math.cos(phase);
    if (Math.abs(cVal) < 1e-7) {
      return { y: null, isUndefined: true, phase };
    }
    const val = a * Math.tan(phase) + d;
    return { y: isFinite(val) ? val : null, isUndefined: !isFinite(val), phase };
  }

  // Cot
  const sVal = Math.sin(phase);
  if (Math.abs(sVal) < 1e-7) {
    return { y: null, isUndefined: true, phase };
  }
  const val = a * (Math.cos(phase) / sVal) + d;
  return { y: isFinite(val) ? val : null, isUndefined: !isFinite(val), phase };
}

/**
 * Analyzes features of y = a * func(b*x + c) + d
 */
export function analyzeFunctionCharacteristics(
  fnType: FunctionType,
  params: FunctionParams
): {
  domainDesc: string;
  rangeDesc: string;
  amplitude: number;
  periodDesc: string;
  periodNum: number | null;
  parityDesc: string;
  isConstant: boolean;
} {
  const { a, b, c, d } = params;
  const isConstant = a === 0 || (b === 0 && (fnType === 'sin' || fnType === 'cos'));

  let amplitude = Math.abs(a);
  let rangeDesc = '';
  let periodDesc = '';
  let periodNum: number | null = null;
  let domainDesc = 'D = ℝ';
  let parityDesc = '';

  if (fnType === 'sin' || fnType === 'cos') {
    if (a === 0) {
      rangeDesc = `{${d}} (Tập 1 phần tử)`;
      amplitude = 0;
      periodDesc = 'Hàm hằng, mọi T > 0 là chu kỳ, không có chu kỳ cơ bản (chu kỳ dương nhỏ nhất)';
      parityDesc = d === 0 ? 'Vừa chẵn vừa lẻ' : 'Hàm chẵn';
    } else if (b === 0) {
      const constVal = a * (fnType === 'sin' ? Math.sin(c) : Math.cos(c)) + d;
      rangeDesc = `{${constVal.toFixed(2)}} (Hàm hằng)`;
      periodDesc = 'Hàm hằng, không có chu kỳ cơ bản';
      parityDesc = constVal === 0 ? 'Vừa chẵn vừa lẻ' : 'Hàm chẵn';
    } else {
      const minVal = d - Math.abs(a);
      const maxVal = d + Math.abs(a);
      rangeDesc = `[${minVal.toFixed(2)}; ${maxVal.toFixed(2)}]`;
      const p = (2 * Math.PI) / Math.abs(b);
      periodNum = p;
      periodDesc = `T = 2π / |b| = ${(p / Math.PI).toFixed(2)}π rad`;

      if (c === 0 && d === 0) {
        parityDesc = fnType === 'cos' ? 'Hàm số chẵn (đối xứng qua Oy)' : 'Hàm số lẻ (đối xứng qua gốc O)';
      } else {
        parityDesc = 'Không chẵn không lẻ';
      }
    }
  } else if (fnType === 'tan') {
    rangeDesc = 'ℝ (Tập giá trị không bị chặn, không có GTLN, GTNN)';
    domainDesc = 'D = ℝ \\ { x | bx + c = π/2 + kπ, k ∈ ℤ }';
    if (b === 0) {
      periodDesc = 'Không có chu kỳ cơ bản';
    } else {
      const p = Math.PI / Math.abs(b);
      periodNum = p;
      periodDesc = `T = π / |b| = ${(p / Math.PI).toFixed(2)}π rad`;
    }
    parityDesc = c === 0 && d === 0 ? 'Hàm số lẻ (đối xứng qua O)' : 'Không chẵn không lẻ';
  } else {
    // cot
    rangeDesc = 'ℝ (Tập giá trị không bị chặn)';
    domainDesc = 'D = ℝ \\ { x | bx + c = kπ, k ∈ ℤ }';
    if (b === 0) {
      periodDesc = 'Không có chu kỳ cơ bản';
    } else {
      const p = Math.PI / Math.abs(b);
      periodNum = p;
      periodDesc = `T = π / |b| = ${(p / Math.PI).toFixed(2)}π rad`;
    }
    parityDesc = c === 0 && d === 0 ? 'Hàm số lẻ (đối xứng qua O)' : 'Không chẵn không lẻ';
  }

  return {
    domainDesc,
    rangeDesc,
    amplitude,
    periodDesc,
    periodNum,
    parityDesc,
    isConstant,
  };
}

/**
 * Solves basic trig equations:
 * 1. sin x = m
 * 2. cos x = m
 * 3. tan x = m
 * 4. cot x = m
 * 5. sin x = cos x
 * 6. sin 2x = sin 3x
 * 7. sin x = cos 3x
 * 8. Ferris wheel: h(t) = 3 + 2sin(pi*t/6) = 4 on [0, 12]
 */
export interface EquationSolution {
  equationText: string;
  generalSolution: string[];
  intervalRoots: { xRad: number; xDeg: number; formattedPi: string; isEndpoint?: boolean }[];
  intervalDesc: string;
  hasSolution: boolean;
  explanation: string;
}

export function solveTrigEquation(
  eqType: 'sin_m' | 'cos_m' | 'tan_m' | 'cot_m' | 'sin_eq_cos' | 'sin2x_eq_sin3x' | 'sinx_eq_cos3x' | 'ferris_wheel',
  mValue: number = 0,
  intervalStart: number = 0, // rad
  intervalEnd: number = 2 * Math.PI, // rad
  includeStart: boolean = true,
  includeEnd: boolean = false
): EquationSolution {
  const roots: { xRad: number; xDeg: number; formattedPi: string; isEndpoint?: boolean }[] = [];
  const generalSolution: string[] = [];
  let hasSolution = true;
  let explanation = '';
  let equationText = '';

  const inInterval = (val: number): boolean => {
    const eps = 1e-8;
    const geStart = includeStart ? val >= intervalStart - eps : val > intervalStart + eps;
    const leEnd = includeEnd ? val <= intervalEnd + eps : val < intervalEnd - eps;
    return geStart && leEnd;
  };

  const addRoot = (radVal: number, formatted: string) => {
    // avoid duplicates within epsilon
    if (roots.some((r) => Math.abs(r.xRad - radVal) < 1e-6)) return;
    const isEnd =
      Math.abs(radVal - intervalStart) < 1e-6 || Math.abs(radVal - intervalEnd) < 1e-6;
    roots.push({
      xRad: radVal,
      xDeg: (radVal * 180) / Math.PI,
      formattedPi: formatted,
      isEndpoint: isEnd,
    });
  };

  if (eqType === 'sin_m') {
    equationText = `sin x = ${mValue}`;
    if (Math.abs(mValue) > 1) {
      hasSolution = false;
      explanation = `Vì tập giá trị của sin là [-1; 1], mà |${mValue}| > 1 nên phương trình vô nghiệm.`;
      return { equationText, generalSolution: ['Vô nghiệm'], intervalRoots: [], intervalDesc: `[${intervalStart}, ${intervalEnd})`, hasSolution, explanation };
    }

    if (Math.abs(mValue - 1) < 1e-7) {
      generalSolution.push('x = π/2 + k2π, k ∈ ℤ (Nghiệm tiếp xúc tại đỉnh)');
      explanation = 'Phương trình sin x = 1 có một họ nghiệm duy nhất (hai họ trùng nhau tại cực đại).';
      for (let k = -5; k <= 5; k++) {
        const root = Math.PI / 2 + k * 2 * Math.PI;
        if (inInterval(root)) addRoot(root, k === 0 ? 'π/2' : `${Math.round((root / Math.PI) * 2)}π/2`);
      }
    } else if (Math.abs(mValue - (-1)) < 1e-7) {
      generalSolution.push('x = -π/2 + k2π, k ∈ ℤ');
      explanation = 'Phương trình sin x = -1 có một họ nghiệm duy nhất tại cực tiểu.';
      for (let k = -5; k <= 5; k++) {
        const root = -Math.PI / 2 + k * 2 * Math.PI;
        if (inInterval(root)) addRoot(root, '3π/2');
      }
    } else if (Math.abs(mValue) < 1e-7) {
      generalSolution.push('x = kπ, k ∈ ℤ');
      explanation = 'sin x = 0 tại các giao điểm với trục Ox: x = 0, π, 2π, ...';
      for (let k = -5; k <= 5; k++) {
        const root = k * Math.PI;
        if (inInterval(root)) addRoot(root, k === 0 ? '0' : k === 1 ? 'π' : `${k}π`);
      }
    } else if (Math.abs(mValue - (-0.5)) < 1e-7) {
      // sin x = -1/2
      generalSolution.push('x = 7π/6 + k2π, k ∈ ℤ');
      generalSolution.push('x = 11π/6 + k2π (hoặc -π/6 + k2π), k ∈ ℤ');
      explanation = 'Hai vị trí trên đường tròn đơn vị có tung độ -1/2 là 7π/6 (210°) và 11π/6 (330°).';
      for (let k = -5; k <= 5; k++) {
        const r1 = (7 * Math.PI) / 6 + k * 2 * Math.PI;
        const r2 = (11 * Math.PI) / 6 + k * 2 * Math.PI;
        if (inInterval(r1)) addRoot(r1, k === 0 ? '7π/6' : `${r1.toFixed(2)} rad`);
        if (inInterval(r2)) addRoot(r2, k === 0 ? '11π/6' : `${r2.toFixed(2)} rad`);
      }
    } else {
      const alpha = Math.asin(mValue);
      generalSolution.push(`x = ${alpha.toFixed(3)} + k2π, k ∈ ℤ`);
      generalSolution.push(`x = π - ${alpha.toFixed(3)} + k2π, k ∈ ℤ`);
      for (let k = -5; k <= 5; k++) {
        const r1 = alpha + k * 2 * Math.PI;
        const r2 = Math.PI - alpha + k * 2 * Math.PI;
        if (inInterval(r1)) addRoot(r1, `${r1.toFixed(3)}`);
        if (inInterval(r2)) addRoot(r2, `${r2.toFixed(3)}`);
      }
    }
  } else if (eqType === 'cos_m') {
    equationText = `cos x = ${mValue}`;
    if (Math.abs(mValue) > 1) {
      return { equationText, generalSolution: ['Vô nghiệm'], intervalRoots: [], intervalDesc: `[${intervalStart}, ${intervalEnd})`, hasSolution: false, explanation: 'cos x chỉ nhận giá trị trong [-1, 1].' };
    }
    if (Math.abs(mValue - (-1)) < 1e-7) {
      generalSolution.push('x = π + k2π, k ∈ ℤ');
      explanation = 'cos x = -1 chỉ có 1 họ nghiệm (điểm (-1; 0)), không đếm trùng họ.';
      for (let k = -5; k <= 5; k++) {
        const r = Math.PI + k * 2 * Math.PI;
        if (inInterval(r)) addRoot(r, 'π');
      }
    } else {
      const beta = Math.acos(mValue);
      generalSolution.push(`x = ±${beta.toFixed(3)} + k2π, k ∈ ℤ`);
      for (let k = -5; k <= 5; k++) {
        const r1 = beta + k * 2 * Math.PI;
        const r2 = -beta + k * 2 * Math.PI;
        if (inInterval(r1)) addRoot(r1, `${r1.toFixed(3)}`);
        if (inInterval(r2)) addRoot(r2, `${r2.toFixed(3)}`);
      }
    }
  } else if (eqType === 'sin_eq_cos') {
    equationText = 'sin x = cos x';
    generalSolution.push('x = π/4 + kπ, k ∈ ℤ');
    explanation = 'Đưa về tan x = 1 (với cos x ≠ 0) hoặc tương giao đường y = x với đường tròn.';
    for (let k = -5; k <= 5; k++) {
      const r = Math.PI / 4 + k * Math.PI;
      if (inInterval(r)) {
        const name = k === 0 ? 'π/4' : k === 1 ? '5π/4' : `${r.toFixed(2)}`;
        addRoot(r, name);
      }
    }
  } else if (eqType === 'sin2x_eq_sin3x') {
    equationText = 'sin 2x = sin 3x';
    generalSolution.push('2x = 3x + k2π ⇔ x = -k2π (tức x = k2π)');
    generalSolution.push('2x = π - 3x + k2π ⇔ 5x = π + k2π ⇔ x = π/5 + k2π/5');
    explanation = 'Hai họ nghiệm chuẩn tắc trên [0, 2π): 0, π/5, 3π/5, π, 7π/5, 9π/5 (tổng 6 nghiệm).';
    const targetSet = [0, Math.PI / 5, (3 * Math.PI) / 5, Math.PI, (7 * Math.PI) / 5, (9 * Math.PI) / 5];
    const names = ['0', 'π/5', '3π/5', 'π', '7π/5', '9π/5'];
    targetSet.forEach((val, i) => {
      if (inInterval(val)) addRoot(val, names[i]);
    });
  } else if (eqType === 'sinx_eq_cos3x') {
    equationText = 'sin x = cos 3x';
    generalSolution.push('sin x = sin(π/2 - 3x)');
    generalSolution.push('x = π/8 + kπ/2, k ∈ ℤ');
    generalSolution.push('x = -π/4 + kπ, k ∈ ℤ');
    explanation = 'Các nghiệm trên [0, 2π): π/8, 5π/8, 3π/4, 9π/8, 13π/8, 7π/4 (tổng 6 nghiệm).';
    const targetSet = [
      Math.PI / 8,
      (5 * Math.PI) / 8,
      (3 * Math.PI) / 4,
      (9 * Math.PI) / 8,
      (13 * Math.PI) / 8,
      (7 * Math.PI) / 4,
    ];
    const names = ['π/8', '5π/8', '3π/4', '9π/8', '13π/8', '7π/4'];
    targetSet.forEach((val, i) => {
      if (inInterval(val)) addRoot(val, names[i]);
    });
  } else if (eqType === 'ferris_wheel') {
    equationText = 'h(t) = 3 + 2sin(πt/6) = 4, t ∈ [0, 12]';
    generalSolution.push('sin(πt/6) = 1/2 ⇔ πt/6 = π/6 + k2π hoặc πt/6 = 5π/6 + k2π');
    generalSolution.push('t = 1 + 12k hoặc t = 5 + 12k, k ∈ ℤ');
    explanation = 'Trên khoảng [0, 12], đu quay đạt độ cao 4m tại thời điểm t = 1 giây và t = 5 giây.';
    roots.push({ xRad: 1, xDeg: (1 * 180) / Math.PI, formattedPi: 't = 1s' });
    roots.push({ xRad: 5, xDeg: (5 * 180) / Math.PI, formattedPi: 't = 5s' });
  }

  // Sort roots ascending
  roots.sort((a, b) => a.xRad - b.xRad);

  return {
    equationText,
    generalSolution,
    intervalRoots: roots,
    intervalDesc: `[${(intervalStart / Math.PI).toFixed(2)}π; ${(intervalEnd / Math.PI).toFixed(2)}π]`,
    hasSolution,
    explanation,
  };
}
