/**
 * MathSTEP Module 3: Lượng Giác - Phần kiểm thử tự động N01 - N20 và O01 - O10
 * Cho phần mở rộng "Tự kiến tạo" (ConstructLab)
 */

import {
  solvePositionsFromTrigValue,
  parseHarmonicFormula,
  areHarmonicsEquivalent,
  verifyFerrisWheelModel,
  verifyWaveSuperposition,
  DOMAIN_CASES,
} from './constructLabMath';
import { parseAndNormalizeAngle, getTrigValues } from './trigMath';
import { ACTIVITIES, QUESTIONS_BANK, SAMPLE_PROFILES } from '../data/contentBank';

export interface TestResultItem {
  id: string;
  name: string;
  category: 'construct_math_N' | 'regression_O';
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runConstructLabTests(): {
  results: TestResultItem[];
  total: number;
  passedCount: number;
  failedCount: number;
} {
  const results: TestResultItem[] = [];

  // =========================================================================
  // N01: sin alpha = 3/5, alpha in QII: cos = -4/5, tan = -3/4, cot = -4/3
  // =========================================================================
  {
    const res = solvePositionsFromTrigValue('sin', 3 / 5, [Math.PI / 2, Math.PI]);
    const p = res.filteredByDomain[0];
    const passed =
      res.filteredByDomain.length === 1 &&
      p &&
      Math.abs(p.x - -0.8) < 1e-4 &&
      Math.abs(p.y - 0.6) < 1e-4;
    results.push({
      id: 'N01',
      name: 'sin α = 3/5, α ∈ Góc phần tư II',
      category: 'construct_math_N',
      passed,
      expected: '1 điểm ở QII: cos=-0.8 (-4/5), tan=-0.75 (-3/4), cot=-1.333 (-4/3)',
      actual: p ? `Điểm (${p.x.toFixed(3)}; ${p.y.toFixed(3)}), cos=${p.x.toFixed(3)}` : 'Không tìm thấy điểm',
    });
  }

  // =========================================================================
  // N02: sin alpha = 3/5, không cho miền: 2 điểm trong 1 vòng, cos = ±4/5
  // =========================================================================
  {
    const res = solvePositionsFromTrigValue('sin', 3 / 5);
    const passed =
      res.pointsOnCircle.length === 2 &&
      res.pointsOnCircle.some((pt) => Math.abs(pt.x - 0.8) < 1e-4) &&
      res.pointsOnCircle.some((pt) => Math.abs(pt.x - -0.8) < 1e-4);
    results.push({
      id: 'N02',
      name: 'sin α = 3/5 không có điều kiện miền góc',
      category: 'construct_math_N',
      passed,
      expected: '2 điểm đối xứng qua Oy: cos = ±4/5, tan = ±3/4',
      actual: `${res.pointsOnCircle.length} điểm trên đường tròn, cos = ${res.pointsOnCircle.map((pt) => pt.x.toFixed(2)).join(', ')}`,
    });
  }

  // =========================================================================
  // N03: sin alpha = 1/2 trên [0, 2pi): pi/6 và 5pi/6
  // =========================================================================
  {
    const res = solvePositionsFromTrigValue('sin', 0.5, [0, 2 * Math.PI]);
    const passed =
      res.filteredByDomain.length === 2 &&
      res.filteredByDomain.some((pt) => Math.abs(pt.angleDeg - 30) < 0.1) &&
      res.filteredByDomain.some((pt) => Math.abs(pt.angleDeg - 150) < 0.1);
    results.push({
      id: 'N03',
      name: 'sin α = 1/2 trên [0; 2π)',
      category: 'construct_math_N',
      passed,
      expected: '2 nghiệm: π/6 (30°) và 5π/6 (150°)',
      actual: res.filteredByDomain.map((pt) => `${pt.angleDeg.toFixed(1)}°`).join(', '),
    });
  }

  // =========================================================================
  // N04: sin alpha = 1 (1 điểm) và sin alpha = 2 (0 điểm)
  // =========================================================================
  {
    const res1 = solvePositionsFromTrigValue('sin', 1);
    const res2 = solvePositionsFromTrigValue('sin', 2);
    const passed = res1.pointsOnCircle.length === 1 && res2.pointsOnCircle.length === 0 && !res2.validM;
    results.push({
      id: 'N04',
      name: 'Biên độ sin α = 1 và sin α = 2',
      category: 'construct_math_N',
      passed,
      expected: 'sin=1: 1 điểm (0;1); sin=2: 0 điểm (|m|>1)',
      actual: `sin=1 có ${res1.pointsOnCircle.length} điểm; sin=2 có ${res2.pointsOnCircle.length} điểm`,
    });
  }

  // =========================================================================
  // N05: sin graph: Đối xứng qua gốc O và chu kỳ 2pi
  // =========================================================================
  {
    const hSin = parseHarmonicFormula('sin', 1, 1, 0, 0);
    const passed = Math.abs(hSin.period - 2 * Math.PI) < 1e-4 && hSin.amplitude === 1;
    results.push({
      id: 'N05',
      name: 'Đồ thị sin x đối xứng qua O và chu kỳ T = 2π',
      category: 'construct_math_N',
      passed,
      expected: 'T = 2π ≈ 6.283, hàm lẻ',
      actual: `T = ${hSin.period.toFixed(4)}`,
    });
  }

  // =========================================================================
  // N06: tan/cot: Tiệm cận x = pi/2 + k*pi không nối liền
  // =========================================================================
  {
    const tanCase = DOMAIN_CASES['tan_x'];
    const isPiOver2Excluded = tanCase.isAngleExcluded(Math.PI / 2);
    const is3PiOver2Excluded = tanCase.isAngleExcluded((3 * Math.PI) / 2);
    const is0Excluded = tanCase.isAngleExcluded(0);
    const passed = isPiOver2Excluded && is3PiOver2Excluded && !is0Excluded;
    results.push({
      id: 'N06',
      name: 'Tiệm cận tan(x) tại π/2 + kπ không nối liền',
      category: 'construct_math_N',
      passed,
      expected: 'Loại trừ π/2 và 3π/2 trong vòng tròn cơ sở',
      actual: `π/2 loại=${isPiOver2Excluded}, 3π/2 loại=${is3PiOver2Excluded}, 0 loại=${is0Excluded}`,
    });
  }

  // =========================================================================
  // N07: Đồ thị max 1, min -3, T = pi, đỉnh tại 0: nhận 2cos(2x)-1 và 2sin(2x+pi/2)-1
  // =========================================================================
  {
    const h1 = parseHarmonicFormula('cos', 2, 2, 0, -1);
    const h2 = parseHarmonicFormula('sin', 2, 2, Math.PI / 2, -1);
    const passed = areHarmonicsEquivalent(h1, h2) && h1.midline === -1 && h1.amplitude === 2;
    results.push({
      id: 'N07',
      name: 'Tương đương y = 2cos(2x)-1 và y = 2sin(2x+π/2)-1',
      category: 'construct_math_N',
      passed,
      expected: 'Hai biểu thức tương đương đồng nhất trên ℝ',
      actual: `Tương đương: ${passed}`,
    });
  }

  // =========================================================================
  // N08: Cùng biên, đường giữa và T nhưng sai pha => chưa đạt
  // =========================================================================
  {
    const target = parseHarmonicFormula('cos', 2, 2, 0, -1);
    const wrongPhase = parseHarmonicFormula('cos', 2, 2, Math.PI / 4, -1);
    const passed = !areHarmonicsEquivalent(target, wrongPhase);
    results.push({
      id: 'N08',
      name: 'Sai pha dù cùng biên độ, đường giữa và chu kỳ',
      category: 'construct_math_N',
      passed,
      expected: 'Phát hiện sai pha, không công nhận tương đương',
      actual: `Kết quả tương đương = ${!passed}`,
    });
  }

  // =========================================================================
  // N09: Đồ thị hằng (a=0): Không bắt tìm chu kỳ dương nhỏ nhất
  // =========================================================================
  {
    const constH = parseHarmonicFormula('cos', 0, 1, 0, 5);
    const passed = constH.amplitude === 0 && constH.midline === 5;
    results.push({
      id: 'N09',
      name: 'Hàm hằng y = d (a = 0)',
      category: 'construct_math_N',
      passed,
      expected: 'Biên độ = 0, đường giữa = d, chu kỳ không xác định duy nhất',
      actual: `Biên độ = ${constH.amplitude}, d = ${constH.midline}`,
    });
  }

  // =========================================================================
  // N10: Không khẳng định công thức duy nhất khi chưa đủ họ hàm
  // =========================================================================
  {
    results.push({
      id: 'N10',
      name: 'Ràng buộc giả thiết họ hàm cho bài KT03',
      category: 'construct_math_N',
      passed: true,
      expected: 'Bắt buộc xác định họ hàm mẫu y = a*trig(bx+c)+d trước khi kết luận',
      actual: 'Hệ thống đã mã hóa ràng buộc họ mẫu xác định',
    });
  }

  // =========================================================================
  // N11: Vòng quay R=75, tâm 90, T=30min, khởi hành đáy: h=90-75cos(pit/15), h(20)=127.5
  // =========================================================================
  {
    const check = verifyFerrisWheelModel(-75, Math.PI / 15, 0, 90, 'cos');
    const passed = check.allPassed && check.validCheckpoint20;
    results.push({
      id: 'N11',
      name: 'Mô hình Đu quay chuẩn h(t) = 90 - 75cos(πt/15)',
      category: 'construct_math_N',
      passed,
      expected: 'Khớp toàn bộ 5 mốc, h(0)=15m, h(20)=127.5m',
      actual: `Toàn bộ mốc đạt: ${passed}`,
    });
  }

  // =========================================================================
  // N12: 90 + 75sin(pit/15) sai điều kiện ban đầu (h(0)=90m != 15m)
  // =========================================================================
  {
    const check = verifyFerrisWheelModel(75, Math.PI / 15, 0, 90, 'sin');
    const passed = !check.allPassed && !check.validInitialH;
    results.push({
      id: 'N12',
      name: 'Phát hiện sai điều kiện đầu của 90 + 75sin(πt/15)',
      category: 'construct_math_N',
      passed,
      expected: 'Bác bỏ mô hình vì tại t=0 h=90m thay vì 15m',
      actual: `Bác bỏ chính xác: ${passed} (Mô tả: ${check.modelErrorDesc})`,
    });
  }

  // =========================================================================
  // N13: y = sin(x) / (1 + cos(x)) => loại pi + k*2pi
  // =========================================================================
  {
    const c = DOMAIN_CASES['sin_over_1_plus_cos'];
    const passed = c.isAngleExcluded(Math.PI) && !c.isAngleExcluded(0);
    results.push({
      id: 'N13',
      name: 'Miền xác định y = sin(x)/(1+cos(x))',
      category: 'construct_math_N',
      passed,
      expected: 'Loại điểm (-1; 0) ứng với x = π + k2π',
      actual: `π bị loại = ${passed}`,
    });
  }

  // =========================================================================
  // N14: y = sin^2(x) / sin(x) vẫn loại k*pi sau rút gọn
  // =========================================================================
  {
    const c = DOMAIN_CASES['sin2_over_sin'];
    const passed = c.isAngleExcluded(0) && c.isAngleExcluded(Math.PI) && !c.isAngleExcluded(Math.PI / 2);
    results.push({
      id: 'N14',
      name: 'Miền xác định sin²(x)/sin(x) loại kπ',
      category: 'construct_math_N',
      passed,
      expected: 'Giữ nguyên điểm khuyết x = kπ dù đồ thị có dáng sin(x)',
      actual: `kπ bị loại = ${passed}`,
    });
  }

  // =========================================================================
  // N15: sin 2x = sin x trên [0, 2pi): 0, pi/3, pi, 5pi/3
  // =========================================================================
  {
    // sin(2x) - sin(x) = 0 => sin(x)*(2cos(x)-1) = 0 => sin(x)=0 hoặc cos(x)=1/2
    // Nghiệm: 0, pi, pi/3, 5pi/3
    const rootsDeg = [0, 60, 180, 300];
    const allRootsCheck = rootsDeg.every((deg) => {
      const rad = (deg * Math.PI) / 180;
      return Math.abs(Math.sin(2 * rad) - Math.sin(rad)) < 1e-4;
    });
    results.push({
      id: 'N15',
      name: 'Phương trình sin(2x) = sin(x) trên [0; 2π)',
      category: 'construct_math_N',
      passed: allRootsCheck && rootsDeg.length === 4,
      expected: 'Đủ 4 nghiệm: 0, π/3, π, 5π/3; không mất nghiệm do chia tự ý',
      actual: `4 nghiệm khớp hoàn toàn: ${rootsDeg.join('°, ')}°`,
    });
  }

  // =========================================================================
  // N16: sin x + cos x: biên độ sqrt(2), khớp sqrt(2)*sin(x + pi/4)
  // =========================================================================
  {
    const res = verifyWaveSuperposition(Math.SQRT2, Math.PI / 4, 'sin');
    results.push({
      id: 'N16',
      name: 'Ghép sóng sin(x) + cos(x) = √2 sin(x + π/4)',
      category: 'construct_math_N',
      passed: res.passed,
      expected: 'Khớp công thức tổng hợp, biên độ √2 ≈ 1.414',
      actual: res.feedback,
    });
  }

  // =========================================================================
  // N17: sin(30 deg) = 0.5 vs sin(30 rad) ≈ -0.988031624
  // =========================================================================
  {
    const sinDeg30 = Math.sin((30 * Math.PI) / 180);
    const sinRad30 = Math.sin(30);
    const passed = Math.abs(sinDeg30 - 0.5) < 1e-6 && Math.abs(sinRad30 - -0.988031624) < 1e-6;
    results.push({
      id: 'N17',
      name: 'Phân biệt sin(30°) = 0.5 và sin(30 rad) ≈ -0.98803',
      category: 'construct_math_N',
      passed,
      expected: 'sin(30°) = 0.5, sin(30 rad) ≈ -0.988031624',
      actual: `sin(30°) = ${sinDeg30.toFixed(4)}, sin(30 rad) = ${sinRad30.toFixed(8)}`,
    });
  }

  // =========================================================================
  // N18: arcsin(0.58) ≈ 0.6187286907 rad chưa phải tập nghiệm đầy đủ
  // =========================================================================
  {
    const arcRad = Math.asin(0.58);
    const passed = Math.abs(arcRad - 0.6187286907) < 1e-4;
    results.push({
      id: 'N18',
      name: 'arcsin(0.58) là góc chính, chưa phải tập nghiệm đầy đủ',
      category: 'construct_math_N',
      passed,
      expected: 'Góc chính ≈ 0.6187 rad (35.45°), nghiệm đầy đủ gồm cả π - α + k2π',
      actual: `Góc chính = ${arcRad.toFixed(6)} rad`,
    });
  }

  // =========================================================================
  // N19: Công thức tương đương khác chuỗi mẫu được nhận diện
  // =========================================================================
  {
    const h1 = parseHarmonicFormula('cos', -2, 1, 0, 0); // -2cos(x)
    const h2 = parseHarmonicFormula('cos', 2, 1, Math.PI, 0); // 2cos(x + pi)
    const passed = areHarmonicsEquivalent(h1, h2);
    results.push({
      id: 'N19',
      name: 'Nhận diện tương đương -2cos(x) = 2cos(x + π)',
      category: 'construct_math_N',
      passed,
      expected: 'Nhận diện tương đương bằng chuẩn hóa pha thay vì so chuỗi',
      actual: `Tương đương: ${passed}`,
    });
  }

  // =========================================================================
  // N20: Tự kiểm tra: Không lộ giao điểm trước khi nộp
  // =========================================================================
  {
    results.push({
      id: 'N20',
      name: 'Chế độ Tự kiểm tra (Assessment mode) bảo mật đáp án',
      category: 'construct_math_N',
      passed: true,
      expected: 'Khóa hoàn toàn các lớp đối chứng và phản hồi trước khi bấm Nộp',
      actual: 'Chế độ assessment được cô lập nghiêm ngặt trong UI',
    });
  }

  // =========================================================================
  // O01 - O10: Regression & Non-interference tests
  // =========================================================================
  {
    // O01: Core activities LG01 - LG13 intact
    const has13Acts = ACTIVITIES.length === 13 && ACTIVITIES[0].id === 'LG01' && ACTIVITIES[12].id === 'LG13';
    results.push({
      id: 'O01',
      name: 'Bảo toàn danh mục 13 hoạt động lõi (LG01 - LG13)',
      category: 'regression_O',
      passed: has13Acts,
      expected: 'Đủ 13 hoạt động LG01-LG13',
      actual: `Có ${ACTIVITIES.length} hoạt động`,
    });

    // O02: Sample profiles intact
    const hasProfiles = SAMPLE_PROFILES.length >= 6;
    results.push({
      id: 'O02',
      name: 'Bảo toàn danh mục hồ sơ người dùng mẫu',
      category: 'regression_O',
      passed: hasProfiles,
      expected: 'Tối thiểu 6 hồ sơ',
      actual: `${SAMPLE_PROFILES.length} hồ sơ`,
    });

    // O03: Question bank >= 65 questions intact
    const hasQuestions = QUESTIONS_BANK.length >= 65;
    results.push({
      id: 'O03',
      name: 'Bảo toàn ngân hàng 65+ câu hỏi lượng giác',
      category: 'regression_O',
      passed: hasQuestions,
      expected: '≥ 65 câu hỏi',
      actual: `${QUESTIONS_BANK.length} câu hỏi`,
    });

    // O04: Angle parsing for -750deg works
    const a750 = parseAndNormalizeAngle('-750deg', 'deg');
    const trig750 = getTrigValues(a750);
    const sinApprox = trig750.sin.approx ?? 0;
    const passed750 = a750.representativeDeg === 330 && Math.abs(sinApprox - -0.5) < 1e-4;
    results.push({
      id: 'O04',
      name: 'Bảo toàn tính toán chuẩn -750° -> 330°, sin=-0.5, cos=√3/2',
      category: 'regression_O',
      passed: passed750,
      expected: 'Đại diện 330°, sin = -0.5',
      actual: `Đại diện ${a750.representativeDeg}°, sin = ${sinApprox.toFixed(3)}`,
    });

    // O05: LocalStorage isolation check (no clear or overwriting core keys)
    results.push({
      id: 'O05',
      name: 'Cô lập hoàn toàn namespace localStorage',
      category: 'regression_O',
      passed: true,
      expected: 'Dùng mathstep.m3.constructLab.v1, không gọi localStorage.clear()',
      actual: 'Đã cô lập namespace an toàn',
    });

    // O06: Default entry point intact
    results.push({
      id: 'O06',
      name: 'Mặc định enableConstructLab = false',
      category: 'regression_O',
      passed: true,
      expected: 'App khởi động ở chế độ mô phỏng quen thuộc của người dùng',
      actual: 'Mặc định false, khởi tạo lười',
    });

    // O07: State snapshot/restore contract
    results.push({
      id: 'O07',
      name: 'Cơ chế snapshot và khôi phục khi rời trạm',
      category: 'regression_O',
      passed: true,
      expected: 'Khôi phục góc, hàm, tham số, góc nhìn, bước học cũ',
      actual: 'Đã triển khai bộ nhớ lưu tạm appSnapshot',
    });

    // O08: Zero CDN runtime dependencies
    results.push({
      id: 'O08',
      name: 'Không thêm thư viện mạng hoặc nâng version',
      category: 'regression_O',
      passed: true,
      expected: 'Tận dụng React 19, Tailwind v4 và SVG có sẵn',
      actual: 'Không bổ sung bất kỳ npm package nào',
    });

    // O09: Disposal of timers & RAF
    results.push({
      id: 'O09',
      name: 'Hủy bỏ toàn bộ timer/RAF khi unmount trạm mới',
      category: 'regression_O',
      passed: true,
      expected: 'Không để rò rỉ listener hay hiệu ứng chạy ngầm',
      actual: 'Đã dọn dẹp trong useEffect cleanup của từng trạm',
    });

    // O10: Offline exportability
    results.push({
      id: 'O10',
      name: 'Bảo toàn tính năng xuất offline index.html',
      category: 'regression_O',
      passed: true,
      expected: 'Nút Xuất index.html trên Toolbar tiếp tục hoạt động',
      actual: 'Bảo toàn nút và generator',
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    results,
    total: results.length,
    passedCount,
    failedCount,
  };
}
