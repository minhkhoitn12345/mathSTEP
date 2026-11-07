"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { verifyAnswer } from "../lib/miniCas";
import StationCatalogModal from "./StationCatalogModal";
import WorksheetPrintModal from "./WorksheetPrintModal";
import { StationItem, getStationById } from "../lib/stationCatalogData";
import { generateIsomorphicIntegerProblem, IntegerProblem } from "../lib/integerVertexGenerator";
import Interactive2DMathCanvas, { BoundaryLine, PolygonVertex } from "./Interactive2DMathCanvas";
import Stereometry3DCanvas from "./Stereometry3DCanvas";

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export type GeoToolMode = "move" | "rotate" | "ar";

export interface Constraint {
  a: number;
  b: number;
  c: number;
  op: "<=" | "<" | ">=" | ">";
}

export interface ObservationRecord {
  at: string;
  params: Record<string, number>;
  summary: string;
}

export interface EvidenceRecord {
  stepId: number;
  stepName: string;
  completedAt: string;
  summary: string;
  data: Record<string, unknown>;
}

interface MathStepWorkbenchProps {
  moduleId: ModuleId;
  stationId?: string;
  onAskTutor?: (question: string) => void;
  onStepChange?: (stepNumber: number, stepTitle: string) => void;
  onSelectStation?: (station: StationItem) => void;
  onBackToCatalog?: () => void;
}

// 7 Bước sư phạm chuẩn theo nghiên cứu giáo dục toán học & file index (2).html
// 8 Bước nhận thức chuẩn KHKT & Giáo dục toán học (Ainsworth DeFT, Alfieri, Chi, Duval, Newman)
const STEP_NAMES = [
  "Nhìn thấy",
  "Dự đoán",
  "Thao tác",
  "Khám phá & Lỗi",
  "Kiểm chứng",
  "Giải thích",
  "Chuyển giao",
  "Rèn luyện độc lập",
];

const MODULE_META: Record<
  ModuleId,
  {
    title: string;
    source: string;
    goal: string;
    simulation: string;
    is3D: boolean;
  }
> = {
  linear_programming: {
    title: "Hệ bất phương trình & Quy hoạch tuyến tính",
    source: "KNTT Toán 10 Tập 1 Bài 4, tr.26",
    goal: "Nghiệm của hệ là miền đa giác giao nhau; giá trị tối ưu luôn đạt tại các đỉnh của đa giác miền nghiệm.",
    simulation: "2D: Chồng miền nghiệm Oxy; di chuyển đường mức mục tiêu F(x, y) = ux + vy; tìm điểm tối ưu và điểm nguyên.",
    is3D: false,
  },
  spatial_geometry: {
    title: "Hình học không gian & Khối đa diện",
    source: "KNTT Toán 11 Tập 1 Bài 10, tr.70",
    goal: "Quan sát phối cảnh 3D; phân biệt nét liền/nét đứt; kiểm chứng thiết diện cắt và quan hệ vuông góc SA ⊥ đáy.",
    simulation: "3D: Xoay hình chóp 360°, đổi góc chiếu Trước/Trên/Bên, kéo đỉnh S, điều chỉnh thiết diện cắt và đường cao.",
    is3D: true,
  },
  trigonometry: {
    title: "Đường tròn lượng giác & Góc quét",
    source: "KNTT Toán 11 Tập 1 Bài 1, tr.5",
    goal: "Hiểu bản chất sin, cos, tan là tọa độ hình chiếu trên đường tròn đơn vị; phân biệt dấu ở các góc phần tư.",
    simulation: "2D: Quét góc θ từ 0° đến 360°, quan sát trực tiếp tia quay và hình chiếu vuông góc lên 2 trục Ox, Oy.",
    is3D: false,
  },
  functions: {
    title: "Hàm số & Khảo sát đồ thị",
    source: "CTST Toán 12 Tập 1 Ch.I Bài 1, tr.6",
    goal: "Mối liên hệ giữa dấu đạo hàm f'(x) và tính đơn điệu; ý nghĩa hình học của hệ số góc tiếp tuyến tại tiếp điểm.",
    simulation: "2D: Đổi tham số đồ thị y = x³ - 3x, di chuyển tiếp điểm M(x₀, y₀), quan sát tiếp tuyến và cực trị.",
    is3D: false,
  },
  calculus: {
    title: "Tích phân Riemann & Khối tròn xoay 3D",
    source: "CTST Toán 12 Tập 2 Ch.IV Bài 3, tr.21",
    goal: "Ý nghĩa diện tích dưới đường cong qua tổng xấp xỉ Riemann; quay hình phẳng quanh Ox tạo khối tròn xoay 3D.",
    simulation: "2D/3D: Tăng số dải chữ nhật xấp xỉ diện tích ∫ f(x)dx; quan sát khối tròn xoay 3D và các lát cắt hình tròn.",
    is3D: true,
  },
  probability: {
    title: "Xác suất thực nghiệm & Công thức Bayes",
    source: "CTST Toán 12 Tập 2 Ch.VI Bài 2, tr.75",
    goal: "Quy luật số lớn khi lặp phép thử; phân biệt xác suất điều kiện P(A|B) và P(B|A) qua sơ đồ cây và công thức Bayes.",
    simulation: "2D: Gieo xúc xắc lặp lại để thấy tần suất hội tụ về 1/6; trực quan hóa 2 nhánh xác suất hộp bi.",
    is3D: false,
  },
  conics_and_solids: {
    title: "Cắt mặt nón 3D & Ba đường Conic",
    source: "KNTT Toán 10 Tập 2 Bài 22, tr.48",
    goal: "Liên hệ giữa góc nghiêng mặt phẳng cắt β và 3 đường conic (Elip, Parabol, Hypebol); tính chất tiêu điểm MF₁ + MF₂ = 2a.",
    simulation: "3D: Kéo góc cắt β trên mặt nón tròn xoay hai tầng để sinh ra đường conic tương ứng; đo khoảng cách tiêu cự.",
    is3D: true,
  },
};

const DEFAULT_CONSTRAINTS: Constraint[] = [
  { a: 1, b: 0, c: 0, op: ">=" },
  { a: 0, b: 1, c: 0, op: ">=" },
  { a: 2, b: 1, c: 8, op: "<=" },
  { a: 1, b: 1, c: 5, op: "<=" },
];

const QUIZ_DATA: Record<ModuleId, { question: string; options: string[]; correctIdx: number; explanation: string }> = {
  linear_programming: {
    question: "Nghiệm của một hệ bất phương trình bậc nhất hai ẩn là gì?",
    options: [
      "Điểm thỏa mãn ít nhất một bất phương trình trong hệ",
      "Giao của tất cả miền nghiệm của các bất phương trình trong hệ",
      "Chỉ là các điểm nằm trên đường biên có dấu bằng",
    ],
    correctIdx: 1,
    explanation: "Miền nghiệm của hệ là phần mặt phẳng thỏa mãn đồng thời tất cả các bất phương trình (giao các miền nghiệm).",
  },
  spatial_geometry: {
    question: "Nếu đường thẳng d vuông góc với mặt phẳng (P) thì d có tính chất gì?",
    options: [
      "d vuông góc với mọi đường thẳng nằm trong mặt phẳng (P)",
      "d chỉ vuông góc với duy nhất một đường thẳng trong (P)",
      "d song song với các đường thẳng nằm trong (P)",
    ],
    correctIdx: 0,
    explanation: "Định lý: Nếu đường thẳng vuông góc với mặt phẳng thì nó vuông góc với mọi đường thẳng nằm trong mặt phẳng đó.",
  },
  trigonometry: {
    question: "Với góc tù θ thuộc khoảng (90°; 180°), dấu của cos θ và sin θ thế nào?",
    options: [
      "cos θ > 0 và sin θ > 0",
      "cos θ < 0 và sin θ > 0",
      "cos θ < 0 và sin θ < 0",
    ],
    correctIdx: 1,
    explanation: "Ở góc phần tư thứ II, hoành độ điểm M âm (cos θ < 0) và tung độ dương (sin θ > 0).",
  },
  functions: {
    question: "Nếu đạo hàm f'(x₀) = 0 thì hàm số có chắc chắn đạt cực trị tại x₀ không?",
    options: [
      "Có, chắc chắn đạt cực trị tại x₀",
      "Không, f'(x) còn phải đổi dấu khi đi qua x₀",
      "Chỉ đạt cực trị nếu hàm số là hàm bậc 2",
    ],
    correctIdx: 1,
    explanation: "Ví dụ f(x) = x³ có f'(0) = 0 nhưng không đổi dấu nên x = 0 không phải là điểm cực trị.",
  },
  calculus: {
    question: "Ý nghĩa hình học của tích phân xác định ∫ₐᵇ f(x)dx với f(x) ≥ 0 là gì?",
    options: [
      "Độ dài đường cong y = f(x) trên đoạn [a; b]",
      "Diện tích hình phẳng giới hạn bởi đồ thị y = f(x), trục Ox và hai đường thẳng x=a, x=b",
      "Hệ số góc tiếp tuyến của hàm số tại trung điểm đoạn [a; b]",
    ],
    correctIdx: 1,
    explanation: "Tích phân xác định của hàm không âm trên [a; b] biểu thị diện tích hình thang cong giới hạn bởi đường cong và Ox.",
  },
  probability: {
    question: "Khi nào ta có đẳng thức P(A ∩ B) = P(A) · P(B)?",
    options: [
      "Khi hai biến cố A và B xung khắc",
      "Khi hai biến cố A và B độc lập với nhau",
      "Đẳng thức luôn đúng với mọi cặp biến cố",
    ],
    correctIdx: 1,
    explanation: "Quy tắc nhân xác suất cho hai biến cố độc lập: P(A ∩ B) = P(A) · P(B). Với biến cố xung khắc thì P(A ∩ B) = 0.",
  },
  conics_and_solids: {
    question: "Khi mặt phẳng cắt mặt nón tròn xoay với góc nghiêng β lớn hơn góc nghiêng đường sinh α thì giao tuyến là đường gì?",
    options: [
      "Đường Parabol (khi β = α)",
      "Đường Elip (khi β > α)",
      "Đường Hypebol (khi β < α)",
    ],
    correctIdx: 1,
    explanation: "Khi mặt phẳng cắt một tầng nón không song song đường sinh (β > α), thiết diện thu được là một đường Elip.",
  },
};

const TRANSFER_DATA: Record<ModuleId, { prompt: string; answer: number; hint: string }> = {
  linear_programming: {
    prompt: "Cho hệ x ≥ 0, y ≥ 0, 2x + y ≤ 8, x + y ≤ 5. Tìm giá trị lớn nhất của F(x, y) = 3x + 2y:",
    answer: 13,
    hint: "So sánh giá trị tại 4 đỉnh: (0;0)->0, (4;0)->12, (3;2)->13, (0;5)->10. GTLN là 13.",
  },
  spatial_geometry: {
    prompt: "Cho hình chóp tam giác đều có diện tích đáy S = 12 cm² và chiều cao h = 5 cm. Thể tích V bằng bao nhiêu cm³?",
    answer: 20,
    hint: "Công thức V = (1/3) · S · h = (1/3) · 12 · 5 = 20.",
  },
  trigonometry: {
    prompt: "Tính giá trị của biểu thức P = sin(30°) + cos(60°):",
    answer: 1,
    hint: "sin(30°) = 0.5; cos(60°) = 0.5 => Tổng bằng 1.",
  },
  functions: {
    prompt: "Cho hàm số f(x) = x³ - 3x. Tìm giá trị cực đại của hàm số:",
    answer: 2,
    hint: "Đạo hàm f'(x) = 3x² - 3 = 0 <=> x = ±1. Điểm cực đại là x = -1, giá trị cực đại f(-1) = 2.",
  },
  calculus: {
    prompt: "Tính tích phân I = ∫₀³ x² dx:",
    answer: 9,
    hint: "Nguyên hàm là x³/3 => [x³/3] từ 0 đến 3 = 27/3 - 0 = 9.",
  },
  probability: {
    prompt: "Gieo một con xúc xắc cân đối 6 mặt. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng bao nhiêu?",
    answer: 0.5,
    hint: "Các mặt chẵn là {2, 4, 6} (3 kết quả thuận lợi trong 6 kết quả đồng khả năng) => P = 3/6 = 0.5.",
  },
  conics_and_solids: {
    prompt: "Đường Elip có phương trình x²/25 + y²/9 = 1. Độ dài trục lớn 2a bằng bao nhiêu?",
    answer: 10,
    hint: "a² = 25 => a = 5 => Độ dài trục lớn 2a = 10.",
  },
};

const SOCRATIC_HINTS: Record<ModuleId, { level1: string; level2: string; level3: string }> = {
  linear_programming: {
    level1: "Định lý tối ưu: Giá trị lớn nhất hoặc nhỏ nhất của hàm mục tiêu F(x, y) = ax + by trên miền đa giác lồi luôn đạt tại một trong các ĐỈNH của miền nghiệm.",
    level2: "Cảnh báo bẫy: Cần kiểm tra xem các đỉnh có thỏa mãn điều kiện x ≥ 0, y ≥ 0 không. Nếu đề bài yêu cầu số nguyên thì chỉ lấy điểm (x, y) nguyên.",
    level3: "Phương pháp: Tìm tọa độ tất cả các đỉnh bằng cách giải hệ phương trình từng cặp đường biên; sau đó thay tọa độ từng đỉnh vào F(x, y) rồi so sánh giá trị lớn nhất.",
  },
  spatial_geometry: {
    level1: "Thể tích khối chóp tính bằng một phần ba tích diện tích đáy và chiều cao: V = (1/3) · S_đáy · h.",
    level2: "Cảnh báo bẫy: Cần phân biệt rõ đường cao h vuông góc với mặt phẳng đáy (SA ⊥ đáy) và chiều cao mặt bên (đường trung đoạn).",
    level3: "Phương pháp: Xác định diện tích đa giác đáy S_đáy, xác định độ dài chiều cao h, áp dụng V = (1/3) · S · h.",
  },
  trigonometry: {
    level1: "Góc bù, góc phụ và dấu ở các góc phần tư: Góc nhọn (0 đến 90°) cả sin và cos đều dương; góc tù (90° đến 180°) cos âm và sin dương.",
    level2: "Cảnh báo bẫy: sin(30°) = 1/2 và cos(60°) = 1/2 (hai góc phụ nhau thì sin góc này bằng cos góc kia). Đừng nhầm với √3/2.",
    level3: "Phương pháp: Thay trực tiếp các giá trị lượng giác của các góc đặc biệt vào biểu thức rồi quy đồng rút gọn.",
  },
  functions: {
    level1: "Mối liên hệ giữa đạo hàm và cực trị: Điểm cực trị là điểm làm cho đạo hàm f'(x) = 0 và đạo hàm phải ĐỔI DẤU khi đi qua điểm đó.",
    level2: "Cảnh báo bẫy: Phân biệt rõ 'điểm cực trị' (là giá trị x) và 'giá trị cực trị' (là giá trị y = f(x)). Đề bài hỏi giá trị cực đại tức là hỏi y.",
    level3: "Phương pháp: Tính f'(x) = 3x² - 3 = 0 <=> x = ±1. Lập bảng xét dấu: f' đổi dấu từ dương sang âm tại x = -1 => giá trị cực đại là f(-1) = (-1)³ - 3(-1) = 2.",
  },
  calculus: {
    level1: "Định lý cơ bản của giải tích: Tích phân ∫ f(x)dx từ a đến b bằng F(b) - F(a) với F(x) là một nguyên hàm của f(x).",
    level2: "Cảnh báo bẫy: Nguyên hàm của x^n là x^(n+1)/(n+1). Ví dụ nguyên hàm của x² là x³/3, đừng quên chia cho 3.",
    level3: "Phương pháp: Thay cận trên 3 và cận dưới 0 vào nguyên hàm: F(3) - F(0) = (3³)/3 - 0 = 27/3 = 9.",
  },
  probability: {
    level1: "Xác suất cổ điển: P(A) = n(A) / n(Ω) bằng số phần tử biến cố thuận lợi chia cho tổng số phần tử không gian mẫu đồng khả năng.",
    level2: "Cảnh báo bẫy: Kiểm tra xem các mặt có đồng khả năng không (xúc xắc cân đối, đồng chất).",
    level3: "Phương pháp: Không gian mẫu gieo xúc xắc là {1, 2, 3, 4, 5, 6} (6 kết quả). Biến cố số chẵn là {2, 4, 6} (3 kết quả thuận lợi). Xác suất P = 3/6 = 1/2 = 0.5.",
  },
  conics_and_solids: {
    level1: "Phương trình chính tắc của Elip: x²/a² + y²/b² = 1 với a > b > 0. Độ dài trục lớn là 2a và trục bé là 2b.",
    level2: "Cảnh báo bẫy: Đề bài cho mẫu số là a² = 25 chứ chưa phải a. Cần khai căn bậc hai để tìm a = 5 trước khi nhân đôi.",
    level3: "Phương pháp: a² = 25 => a = 5. Trục lớn có độ dài bằng 2a = 2 * 5 = 10.",
  },
};

function generateRandomProblem(mod: ModuleId): { prompt: string; answer: number; hint: string } {
  switch (mod) {
    case "linear_programming": {
      const u = Math.floor(Math.random() * 4) + 2;
      const v = Math.floor(Math.random() * 4) + 1;
      const v0 = 0;
      const v1 = u * 4;
      const v2 = u * 3 + v * 2;
      const v3 = v * 5;
      const maxVal = Math.max(v0, v1, v2, v3);
      return {
        prompt: `Cho hệ x ≥ 0, y ≥ 0, 2x + y ≤ 8, x + y ≤ 5. Tìm giá trị lớn nhất của F(x, y) = ${u}x + ${v}y:`,
        answer: maxVal,
        hint: `Tính giá trị tại 4 đỉnh: (0;0)->0, (4;0)->${v1}, (3;2)->${v2}, (0;5)->${v3}. GTLN là ${maxVal}.`,
      };
    }
    case "spatial_geometry": {
      const s = (Math.floor(Math.random() * 5) + 3) * 3;
      const h = Math.floor(Math.random() * 6) + 3;
      const v = (s * h) / 3;
      return {
        prompt: `Cho hình chóp tam giác đều có diện tích đáy S = ${s} cm² và chiều cao h = ${h} cm. Thể tích V bằng bao nhiêu cm³?`,
        answer: v,
        hint: `Công thức: V = (1/3) · S · h = (1/3) · ${s} · ${h} = ${v}.`,
      };
    }
    case "trigonometry": {
      const angles = [
        { deg: 30, sin: 0.5 },
        { deg: 90, sin: 1 },
        { deg: 150, sin: 0.5 },
        { deg: 270, sin: -1 },
      ];
      const a = angles[Math.floor(Math.random() * angles.length)];
      return {
        prompt: `Tính giá trị chính xác của sin(${a.deg}°):`,
        answer: a.sin,
        hint: `Điểm trên đường tròn đơn vị ứng với góc ${a.deg}° có tung độ y = ${a.sin}.`,
      };
    }
    case "calculus": {
      const b = Math.floor(Math.random() * 3) + 2;
      const k = Math.floor(Math.random() * 3) + 1;
      const ans = parseFloat(((k * Math.pow(b, 3)) / 3).toFixed(2));
      return {
        prompt: `Tính tích phân I = ∫₀^${b} (${k === 1 ? "" : k}x²) dx:`,
        answer: ans,
        hint: `Nguyên hàm là ${k === 1 ? "" : k}x³/3. Thay cận [0; ${b}] => ${k}*${b}³/3 = ${ans}.`,
      };
    }
    case "functions": {
      const a = Math.floor(Math.random() * 3) + 1;
      const ans = 2 * Math.pow(a, 3);
      return {
        prompt: `Cho hàm số f(x) = x³ - ${3 * a * a}x. Tìm giá trị cực đại của hàm số:`,
        answer: ans,
        hint: `f'(x) = 3x² - ${3 * a * a} = 0 <=> x = ±${a}. Điểm cực đại là x = -${a}, giá trị cực đại f(-${a}) = ${ans}.`,
      };
    }
    case "probability": {
      const dice = Math.floor(Math.random() * 5) + 2;
      return {
        prompt: `Gieo một con xúc xắc cân đối 6 mặt. Xác suất để xuất hiện mặt có số chấm lớn hơn hoặc bằng ${dice} bằng bao nhiêu (ví dụ: 0.5 hoặc 3/6)?`,
        answer: parseFloat(((7 - dice) / 6).toFixed(4)),
        hint: `Số kết quả thuận lợi là ${7 - dice} trong 6 kết quả đồng khả năng => P = ${7 - dice}/6.`,
      };
    }
    case "conics_and_solids": {
      const a = Math.floor(Math.random() * 5) + 3;
      const a2 = a * a;
      return {
        prompt: `Đường Elip có phương trình x²/${a2} + y²/9 = 1. Độ dài trục lớn 2a bằng bao nhiêu?`,
        answer: 2 * a,
        hint: `a² = ${a2} => a = ${a} => Độ dài trục lớn 2a = 2 * ${a} = ${2 * a}.`,
      };
    }
    default:
      return { prompt: "Tính giá trị biểu thức:", answer: 1, hint: "Xem gợi ý SGK." };
  }
}

// --- Thuật toán toán học: Clip Polygon & Quy hoạch tuyến tính ---
function canonicalConstraint(c: Constraint) {
  const s = c.op.startsWith(">") ? -1 : 1;
  return { a: c.a * s, b: c.b * s, c: c.c * s, strict: c.op === "<" || c.op === ">" };
}

function satisfies(c: Constraint, x: number, y: number, tol = 1e-7) {
  const q = canonicalConstraint(c);
  const v = q.a * x + q.b * y - q.c;
  return q.strict ? v < -tol : v <= tol;
}

function clipPolygon(poly: [number, number][], c: Constraint): [number, number][] {
  const { a, b, c: d } = canonicalConstraint(c);
  const out: [number, number][] = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i];
    const B = poly[(i + 1) % poly.length];
    const va = a * A[0] + b * A[1] - d;
    const vb = a * B[0] + b * B[1] - d;
    if (va <= 1e-9) out.push(A);
    if ((va < 0 && vb > 0) || (va > 0 && vb < 0)) {
      const t = va / (va - vb);
      out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]);
    }
  }
  return out;
}

interface LPResult {
  feasible: boolean;
  vertices: [number, number][];
  best: [number, number];
  value: number;
  poly: [number, number][];
}

function solveLP(cs: Constraint[], u: number, v: number): LPResult {
  let poly: [number, number][] = [
    [-15, -15],
    [15, -15],
    [15, 15],
    [-15, 15],
  ];
  for (const c of cs) {
    poly = clipPolygon(poly, c);
  }
  if (!poly.length) return { feasible: false, vertices: [], best: [0, 0], value: 0, poly: [] };

  const vertices: [number, number][] = [];
  for (let i = 0; i < cs.length; i++) {
    for (let j = i + 1; j < cs.length; j++) {
      const a = canonicalConstraint(cs[i]);
      const b = canonicalConstraint(cs[j]);
      const det = a.a * b.b - a.b * b.a;
      if (Math.abs(det) < 1e-9) continue;
      const x = (a.c * b.b - a.b * b.c) / det;
      const y = (a.a * b.c - a.c * b.a) / det;
      if (cs.every((r) => satisfies(r, x, y, 1e-4))) {
        if (!vertices.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-4)) {
          vertices.push([parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
        }
      }
    }
  }

  let best = vertices[0] || [0, 0];
  let value = u * best[0] + v * best[1];
  for (const pt of vertices) {
    const val = u * pt[0] + v * pt[1];
    if (val > value) {
      value = val;
      best = pt;
    }
  }

  return { feasible: true, vertices, best, value: parseFloat(value.toFixed(2)), poly };
}

function getDefaultParams(mod: ModuleId): Record<string, number> {
  switch (mod) {
    case "linear_programming":
      return { x: 2, y: 3, u: 3, v: 2, k: 12 };
    case "spatial_geometry":
      return { h: 3, x: 0, cut: 0.5 };
    case "trigonometry":
      return { t: 60 };
    case "functions":
      return { x0: 0.5, a: -3, b: 0 };
    case "calculus":
      return { n: 8, b: 3, deltaT: 0.8 };
    case "probability":
      return { rolls: 30, lastDice: 6 };
    case "conics_and_solids":
      return { beta: 55, a: 2, theta: 45 };
    default:
      return {};
  }
}

// Helper phân tích chất lượng câu trả lời tự luận Socratic (Dự đoán / Đúc kết)
function checkSemanticQuality(str: string): { type: "short" | "good" | "neutral"; message: string } | null {
  const clean = str.trim();
  if (clean.length === 0) return null;
  const hasReason = /vì|do|bởi|khi|nếu|suy ra|tại|theo|điều kiện|lớn hơn|nhỏ hơn/.test(clean.toLowerCase());
  if (clean.length < 15 && !hasReason) {
    return {
      type: "short",
      message: "💡 Câu trả lời còn ngắn. Hãy thêm từ 'vì...' để câu trả lời có tính chứng minh toán học nhé!",
    };
  }
  if (hasReason) {
    return {
      type: "good",
      message: "✓ Rất tốt! Lập luận của em có căn cứ toán học rõ ràng.",
    };
  }
  return {
    type: "neutral",
    message: "ℹ️ Em có thể đối chiếu với đồ thị mô phỏng để giải thích sâu sắc hơn.",
  };
}

export default function MathStepWorkbench({
  moduleId,
  stationId,
  onAskTutor,
  onStepChange,
  onSelectStation,
  onBackToCatalog,
}: MathStepWorkbenchProps) {
  const currentStation = useMemo(() => (stationId ? getStationById(stationId) : undefined), [stationId]);
  const meta = useMemo(() => {
    if (currentStation) {
      return {
        title: currentStation.title,
        source: currentStation.source,
        goal: currentStation.goal,
        simulation: currentStation.simulation,
        is3D: currentStation.is3D,
      };
    }
    return MODULE_META[moduleId];
  }, [currentStation, moduleId]);

  // --- Step Progression State ---
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [prediction, setPrediction] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [manipulations, setManipulations] = useState<number>(0);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [transferInput, setTransferInput] = useState<string>("");
  const [evidenceHistory, setEvidenceHistory] = useState<EvidenceRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const [evidenceModalOpen, setEvidenceModalOpen] = useState<boolean>(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"task" | "scene" | "controls">("scene");
  const [isFullscreenScene, setIsFullscreenScene] = useState<boolean>(false);
  const [worksheetModalOpen, setWorksheetModalOpen] = useState<boolean>(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState<boolean>(false);
  const [canvasSnapshotUrl, setCanvasSnapshotUrl] = useState<string | null>(null);


  const [hintLevel, setHintLevel] = useState<number>(0);
  const [dynamicProblem, setDynamicProblem] = useState<{ prompt: string; answer: number | string; hint: string } | null>(null);
  const [transferVerification, setTransferVerification] = useState<{ correct: boolean; enteredNum: number; expectedNum: number; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Interactive Canvas & Camera State ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [toolMode, setToolMode] = useState<GeoToolMode>("move");
  const [camera, setCamera] = useState({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });
  const [selectedAxis, setSelectedAxis] = useState<"x" | "y" | "z">("x");

  // --- Math Simulation Parameters (Synchronized Sliders & Number inputs) ---
  const [params, setParams] = useState<Record<string, number>>(() => getDefaultParams(moduleId));

  // Linear Programming Constraints & Options
  const [constraints, setConstraints] = useState<Constraint[]>(DEFAULT_CONSTRAINTS);

  // Memoized 2D Boundary Lines for Interactive2DMathCanvas
  const boundaryLines: BoundaryLine[] = useMemo(() => {
    return constraints.map((c, i) => {
      const termA = c.a !== 0 ? (c.a === 1 ? "x" : c.a === -1 ? "-x" : `${c.a}x`) : "";
      const termB = c.b > 0 ? (c.a !== 0 ? " + " : "") + (c.b === 1 ? "y" : `${c.b}y`) : c.b < 0 ? (c.b === -1 ? " - y" : ` - ${Math.abs(c.b)}y`) : "";
      const eqStr = `${termA}${termB} = ${c.c}`;
      const colors = ["#4f46e5", "#0284c7", "#d97706", "#059669", "#7c3aed"];
      return {
        id: `line-${i}`,
        name: `d${i + 1}`,
        equation: eqStr,
        a: c.a,
        b: c.b,
        c: c.c,
        operator: c.op,
        color: colors[i % colors.length],
      };
    });
  }, [constraints]);

  // Memoized 2D Polygon Vertices for Interactive2DMathCanvas
  const polygonVertices: PolygonVertex[] = useMemo(() => {
    const lp = solveLP(constraints, params.u || 3, params.v || 2);
    if (!lp.feasible || !lp.vertices) return [];
    const vertexNames = ["O", "A", "B", "C", "D", "E", "F"];
    return lp.vertices.map((v, i) => ({
      label: vertexNames[i] || `P${i}`,
      x: v[0],
      y: v[1],
    }));
  }, [constraints, params.u, params.v]);
  const [showIntegerPoints, setShowIntegerPoints] = useState<boolean>(false);
  const [solidType, setSolidType] = useState<"pyramid" | "prism" | "frustum">("pyramid");

  // SGK KNTT & KHKT Strategy Features
  const [invertFilling, setInvertFilling] = useState<boolean>(false); // false = Chuẩn SGK KNTT (gạch sọc miền sai, giữ trắng miền đúng); true = Chuẩn GeoGebra quốc tế
  const [counterExampleActive, setCounterExampleActive] = useState<boolean>(false); // Phản ví dụ trực quan ghim chấm đỏ P(1; 0)
  const [isUnfolded, setIsUnfolded] = useState<boolean>(false); // Khai triển phẳng ↔ Gấp khối 3D
  const [foldPercent, setFoldPercent] = useState<number>(100); // 0: Khai triển phẳng, 100: Gấp khối 3D
  const [orthogonalView, setOrthogonalView] = useState<boolean>(false); // Góc nhìn trực giao
  const [fadingAnswers, setFadingAnswers] = useState({
    step1: "",
    step2: "",
    step3: "",
    step4: "",
  });
  const [fadingSubmitted, setFadingSubmitted] = useState<boolean>(false);
  const [fadingScore, setFadingScore] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);
  const [activeIntegerProblem, setActiveIntegerProblem] = useState<IntegerProblem | null>(null);

  // AR Settings
  const [arTilt, setArTilt] = useState<number>(35);
  const [arScale, setArScale] = useState<number>(1.0);

  // Reset parameters when moduleId or stationId changes, and load cached data
  useEffect(() => {
    setCurrentStep(0);
    setManipulations(0);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setTransferInput("");
    setTransferVerification(null);
    setHintLevel(0);
    setDynamicProblem(null);
    setCamera({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });
    setParams(getDefaultParams(moduleId));

    try {
      const cacheKey = `mathstep:state:${stationId || moduleId}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.prediction) setPrediction(data.prediction);
        else setPrediction("");
        if (data.reason) setReason(data.reason);
        else setReason("");
        if (Array.isArray(data.observations)) setObservations(data.observations);
        else setObservations([]);
        if (Array.isArray(data.evidenceHistory)) setEvidenceHistory(data.evidenceHistory);
      } else {
        setPrediction("");
        setReason("");
        setObservations([]);
      }
    } catch {
      setPrediction("");
      setReason("");
      setObservations([]);
    }
  }, [moduleId, stationId]);

  // Persist offline progress
  useEffect(() => {
    try {
      const cacheKey = `mathstep:state:${stationId || moduleId}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ prediction, reason, observations, evidenceHistory })
      );
    } catch {}
  }, [moduleId, stationId, prediction, reason, observations, evidenceHistory]);

  // Read URL hash on initial load for shared scene (#scene=...)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#scene=")) {
      try {
        const hashVal = decodeURIComponent(window.location.hash.replace("#scene=", ""));
        const parsed = JSON.parse(atob(hashVal));
        if (parsed.params) setParams(parsed.params);
        if (parsed.constraints) setConstraints(parsed.constraints);
        if (parsed.camera) setCamera(parsed.camera);
        if (typeof parsed.currentStep === "number") setCurrentStep(parsed.currentStep);
        showToast("✨ Đã khôi phục cảnh mô phỏng từ liên kết chia sẻ!");
      } catch {}
    }
  }, [showToast]);

  const updateParam = useCallback(
    (key: string, val: number) => {
      setParams((prev) => ({ ...prev, [key]: val }));
      setManipulations((m) => m + 1);
    },
    []
  );

  // --- Dynamic Live Math Metrics ---
  const metricsBadges = useMemo(() => {
    switch (moduleId) {
      case "linear_programming": {
        const lp = solveLP(constraints, params.u || 3, params.v || 2);
        const fVal = (params.u || 3) * (params.x || 0) + (params.v || 2) * (params.y || 0);
        const isFeas = constraints.every((c) => satisfies(c, params.x || 0, params.y || 0));
        return [
          `M(${params.x?.toFixed(1)}; ${params.y?.toFixed(1)}): ${isFeas ? "✓ Thỏa hệ" : "✗ Vi phạm hệ"}`,
          `F(M) = 3x + 2y = ${fVal.toFixed(1)}`,
          lp.feasible ? `GTLN F = ${lp.value} tại (${lp.best[0]}; ${lp.best[1]})` : "Miền nghiệm rỗng",
          `${lp.vertices.length} đỉnh đa giác miền nghiệm`,
        ];
      }
      case "spatial_geometry":
        return [
          `Đỉnh S(${params.x?.toFixed(1)}; 0; ${params.h?.toFixed(1)})`,
          `Chiều cao h = ${params.h?.toFixed(1)} (SA ⊥ đáy)`,
          `Thiết diện cắt t = ${(params.cut || 0.5).toFixed(2)}`,
          `Thể tích V = ${((16 * (params.h || 3)) / 3).toFixed(1)} đvtt`,
        ];
      case "trigonometry": {
        const rad = ((params.t || 60) * Math.PI) / 180;
        return [
          `Góc θ = ${params.t}° = ${(params.t / 180).toFixed(2)}π rad`,
          `cos θ = ${Math.cos(rad).toFixed(3)}`,
          `sin θ = ${Math.sin(rad).toFixed(3)}`,
          `tan θ = ${Math.abs(Math.cos(rad)) < 1e-4 ? "∞" : Math.tan(rad).toFixed(3)}`,
        ];
      }
      case "functions": {
        const x = params.x0 ?? 0.5;
        const y = x * x * x - 3 * x;
        const k = 3 * x * x - 3;
        return [
          `f(x) = x³ - 3x`,
          `Tiếp điểm M(${x.toFixed(2)}; ${y.toFixed(2)})`,
          `Hệ số góc tiếp tuyến f'(${x.toFixed(2)}) = ${k.toFixed(2)}`,
          `Cực đại (-1; 2) · Cực tiểu (1; -2)`,
        ];
      }
      case "calculus": {
        const b = params.b ?? 3;
        const n = params.n ?? 8;
        const exact = (b * b * b) / 3;
        return [
          `f(x) = x² trên [0; ${b}]`,
          `Tích phân chính xác S = ${exact.toFixed(2)}`,
          `Tổng Riemann N=${n} dải`,
          `Khối tròn xoay V = π ∫ x⁴ dx`,
        ];
      }
      case "probability":
        return [
          `Xúc xắc: Mặt ${params.lastDice ?? 6}`,
          `Số lần thực nghiệm: ${params.rolls ?? 30}`,
          `P(Mặt 6 lý thuyết) = 1/6 ≈ 16.7%`,
          `Bayes P(Hộp 1 | Đỏ) = 3/7 ≈ 42.9%`,
        ];
      case "conics_and_solids": {
        const beta = params.beta ?? 55;
        const conic = beta > 30 ? "Đường Elip" : beta === 30 ? "Đường Parabol" : "Đường Hypebol";
        return [
          `Góc nghiêng mặt cắt β = ${beta}°`,
          `Tiết diện conic: ${conic}`,
          `Đường sinh nón α = 30°`,
          `Tiêu cự 2c = 6.00 · Trục lớn 2a = 8.00`,
        ];
      }
      default:
        return [];
    }
  }, [moduleId, params, constraints]);

  // --- Real-time Canvas Rendering Engine (2D & 3D) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // 3D Projection Engine
      if (meta.is3D) {
        ctx.fillStyle = "#eaf1ee";
        ctx.fillRect(0, 0, W, H);

        const project3D = (v: [number, number, number]): [number, number, number] => {
          const cy = Math.cos(camera.yaw);
          const sy = Math.sin(camera.yaw);
          const cp = Math.cos(camera.pitch);
          const sp = Math.sin(camera.pitch);
          const x = v[0] * cy - v[1] * sy;
          const y = v[0] * sy + v[1] * cy;
          const z = v[2];
          const depth = y * cp + z * sp;
          const vertical = z * cp - y * sp;
          const sc = Math.min(W, H) * 0.11 * camera.zoom;
          return [W / 2 + x * sc + camera.panX, H * 0.58 - vertical * sc + camera.panY, depth];
        };

        // Grid floor on Oxy
        ctx.strokeStyle = "#cbd8d2";
        ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) {
          const a = project3D([i, -3, 0]);
          const b = project3D([i, 3, 0]);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();

          const c = project3D([-3, i, 0]);
          const d = project3D([3, i, 0]);
          ctx.beginPath();
          ctx.moveTo(c[0], c[1]);
          ctx.lineTo(d[0], d[1]);
          ctx.stroke();
        }

        // Coordinate axes
        const O = project3D([0, 0, 0]);
        const Ax = project3D([4, 0, 0]);
        const Ay = project3D([0, 4, 0]);
        const Az = project3D([0, 0, 4]);

        ctx.lineWidth = 2;
        // Ox (Red-orange)
        ctx.strokeStyle = "#c17b64";
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(Ax[0], Ax[1]);
        ctx.stroke();
        ctx.fillStyle = "#c17b64";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("x", Ax[0] + 5, Ax[1]);

        // Oy (Teal)
        ctx.strokeStyle = "#649c88";
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(Ay[0], Ay[1]);
        ctx.stroke();
        ctx.fillStyle = "#649c88";
        ctx.fillText("y", Ay[0] + 5, Ay[1]);

        // Oz (Blue)
        ctx.strokeStyle = "#688bab";
        ctx.beginPath();
        ctx.moveTo(O[0], O[1]);
        ctx.lineTo(Az[0], Az[1]);
        ctx.stroke();
        ctx.fillStyle = "#688bab";
        ctx.fillText("z", Az[0], Az[1] - 5);

        // 3D Objects per module
        if (moduleId === "spatial_geometry") {
          const h = params.h || 3;
          const apex: [number, number, number] = [params.x || 0, 0, h];
          const base: [number, number, number][] = [
            [-2, -2, 0],
            [2, -2, 0],
            [2, 2, 0],
            [-2, 2, 0],
          ];

          const bProj = base.map(project3D);

          if (isUnfolded) {
            // Khai triển phẳng 2D trên mặt phẳng Oxy (Unfolded Net)
            ctx.beginPath();
            bProj.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
            ctx.closePath();
            ctx.fillStyle = "#5cae9d55";
            ctx.fill();
            ctx.strokeStyle = "#16827d";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // 4 mặt tam giác mở phẳng xòe ra ngoài đáy
            const slantH = Math.sqrt(h * h + 4);
            const unfoldedApexes: [number, number, number][] = [
              [0, -2 - slantH, 0],
              [2 + slantH, 0, 0],
              [0, 2 + slantH, 0],
              [-2 - slantH, 0, 0],
            ];

            unfoldedApexes.forEach((ap, i) => {
              const pA = bProj[i];
              const pB = bProj[(i + 1) % 4];
              const pS = project3D(ap);

              ctx.beginPath();
              ctx.moveTo(pA[0], pA[1]);
              ctx.lineTo(pB[0], pB[1]);
              ctx.lineTo(pS[0], pS[1]);
              ctx.closePath();
              ctx.fillStyle = i % 2 === 0 ? "#14b8a633" : "#0d948822";
              ctx.fill();
              ctx.strokeStyle = "#087e7c";
              ctx.lineWidth = 1.8;
              ctx.stroke();

              // Nếp gấp nét đứt
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = "#64748b";
              ctx.beginPath();
              ctx.moveTo(pA[0], pA[1]);
              ctx.lineTo(pB[0], pB[1]);
              ctx.stroke();
              ctx.setLineDash([]);

              // Điểm đỉnh
              ctx.beginPath();
              ctx.arc(pS[0], pS[1], 5, 0, Math.PI * 2);
              ctx.fillStyle = "#dcaa44";
              ctx.fill();
              ctx.strokeStyle = "#fff";
              ctx.stroke();
              ctx.fillStyle = "#087e7c";
              ctx.font = "bold 10px sans-serif";
              ctx.fillText(`S${i + 1}`, pS[0] + 6, pS[1] - 4);
            });

            ctx.fillStyle = "#0f766e";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText("📂 Bản khai triển phẳng 2D: 4 mặt bên mở xòe trên mặt phẳng đáy", 15, 25);
          } else {
            // Khối chóp 3D gập hoàn chỉnh
            ctx.beginPath();
            bProj.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
            ctx.closePath();
            ctx.fillStyle = "#5cae9d55";
            ctx.fill();
            ctx.strokeStyle = "#16827d";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Faces to apex
            const SProj = project3D(apex);
            bProj.forEach((p, i) => {
              const next = bProj[(i + 1) % 4];
              ctx.beginPath();
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(next[0], next[1]);
              ctx.lineTo(SProj[0], SProj[1]);
              ctx.closePath();
              ctx.fillStyle = i % 2 === 0 ? "#14b8a644" : "#0d948833";
              ctx.fill();
              ctx.strokeStyle = "#0f766e";
              ctx.stroke();
            });

            // Altitude SA (Red dashed line)
            const footProj = project3D([params.x || 0, 0, 0]);
            ctx.beginPath();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 2.5;
            ctx.moveTo(SProj[0], SProj[1]);
            ctx.lineTo(footProj[0], footProj[1]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Apex handle (Yellow dot)
            ctx.beginPath();
            ctx.arc(SProj[0], SProj[1], 7, 0, Math.PI * 2);
            ctx.fillStyle = "#dcaa44";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#152f35";
            ctx.fillText("S", SProj[0] + 10, SProj[1] - 5);
          }
        } else if (moduleId === "conics_and_solids") {
          // Double cone wireframe
          ctx.strokeStyle = "#0d948888";
          ctx.lineWidth = 1.5;
          for (let z = -2.5; z <= 2.5; z += 0.5) {
            const r = Math.abs(z) * 0.8;
            ctx.beginPath();
            for (let deg = 0; deg <= 360; deg += 15) {
              const rad = (deg * Math.PI) / 180;
              const pt = project3D([r * Math.cos(rad), r * Math.sin(rad), z]);
              if (deg === 0) ctx.moveTo(pt[0], pt[1]);
              else ctx.lineTo(pt[0], pt[1]);
            }
            ctx.stroke();
          }

          // Cutting plane (Red translucent)
          const betaRad = ((params.beta || 55) * Math.PI) / 180;
          const planeCorners: [number, number, number][] = [
            [-2.5, -2, -2.5 * Math.tan(betaRad) * 0.4],
            [2.5, -2, 2.5 * Math.tan(betaRad) * 0.4],
            [2.5, 2, 2.5 * Math.tan(betaRad) * 0.4 + 1],
            [-2.5, 2, -2.5 * Math.tan(betaRad) * 0.4 + 1],
          ];
          const plProj = planeCorners.map(project3D);
          ctx.beginPath();
          plProj.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
          ctx.closePath();
          ctx.fillStyle = "#ef444444";
          ctx.fill();
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (moduleId === "calculus") {
          // 3D Solid of revolution around Ox
          const b = params.b || 3;
          ctx.strokeStyle = "#0d948866";
          ctx.lineWidth = 1;
          for (let x = 0; x <= b; x += 0.4) {
            const r = (x * x) / 3;
            ctx.beginPath();
            for (let deg = 0; deg <= 360; deg += 20) {
              const rad = (deg * Math.PI) / 180;
              const pt = project3D([x, r * Math.cos(rad), r * Math.sin(rad)]);
              if (deg === 0) ctx.moveTo(pt[0], pt[1]);
              else ctx.lineTo(pt[0], pt[1]);
            }
            ctx.stroke();
          }
        }
      } else {
        // 2D Interactive Coordinate Engine
        ctx.fillStyle = "#edf3f2";
        ctx.fillRect(0, 0, W, H);

        const xMin = -2;
        const xMax = 8;
        const yMin = -2;
        const yMax = 7;
        const scale = Math.min((W - 60) / (xMax - xMin), (H - 60) / (yMax - yMin)) * camera.zoom;

        const w2s = (x: number, y: number): [number, number] => [
          W / 2 + (x - (xMin + xMax) / 2) * scale + camera.panX,
          H / 2 - (y - (yMin + yMax) / 2) * scale + camera.panY,
        ];

        // 2D Grid
        ctx.strokeStyle = "#dbe5e3";
        ctx.lineWidth = 1;
        for (let x = Math.ceil(xMin); x <= xMax; x++) {
          const a = w2s(x, yMin);
          const b = w2s(x, yMax);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
          if (x !== 0) {
            ctx.fillStyle = "#829591";
            ctx.font = "10px sans-serif";
            ctx.fillText(String(x), a[0] - 4, w2s(0, 0)[1] + 14);
          }
        }
        for (let y = Math.ceil(yMin); y <= yMax; y++) {
          const a = w2s(xMin, y);
          const b = w2s(xMax, y);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
          if (y !== 0) {
            ctx.fillStyle = "#829591";
            ctx.font = "10px sans-serif";
            ctx.fillText(String(y), w2s(0, 0)[0] - 14, a[1] + 3);
          }
        }

        // Ox and Oy axes
        const O = w2s(0, 0);
        ctx.strokeStyle = "#728b87";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, O[1]);
        ctx.lineTo(W, O[1]);
        ctx.moveTo(O[0], 0);
        ctx.lineTo(O[0], H);
        ctx.stroke();
        ctx.fillStyle = "#152f35";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("x", W - 15, O[1] - 6);
        ctx.fillText("y", O[0] + 6, 15);
        ctx.fillText("O", O[0] - 14, O[1] + 14);

        if (stationId === "10.01" || stationId === "10.02") {
          // Preset Trạm 10.01 / 10.02: Tập hợp & Biểu đồ Venn 2D
          const rVenn = scale * 2.2;
          const centerA = w2s(-1.6, 0);
          const centerB = w2s(1.6, 0);

          // Circle A (Teal)
          ctx.beginPath();
          ctx.arc(centerA[0], centerA[1], rVenn, 0, Math.PI * 2);
          ctx.fillStyle = "#14b8a622";
          ctx.fill();
          ctx.strokeStyle = "#087e7c";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Circle B (Orange-brown)
          ctx.beginPath();
          ctx.arc(centerB[0], centerB[1], rVenn, 0, Math.PI * 2);
          ctx.fillStyle = "#b8743922";
          ctx.fill();
          ctx.strokeStyle = "#b87439";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Intersection Highlight A ∩ B
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerA[0], centerA[1], rVenn, 0, Math.PI * 2);
          ctx.clip();
          ctx.beginPath();
          ctx.arc(centerB[0], centerB[1], rVenn, 0, Math.PI * 2);
          ctx.fillStyle = "#05966955";
          ctx.fill();
          ctx.restore();

          // Labels
          ctx.font = "bold 15px sans-serif";
          ctx.fillStyle = "#087e7c";
          ctx.fillText("Tập A", centerA[0] - rVenn + 20, centerA[1] - rVenn + 25);
          ctx.fillStyle = "#b87439";
          ctx.fillText("Tập B", centerB[0] + rVenn - 55, centerB[1] - rVenn + 25);

          // Elements
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#0f766e";
          ctx.fillText("1", centerA[0] - 35, centerA[1] - 20);
          ctx.fillText("3", centerA[0] - 55, centerA[1] + 15);
          ctx.fillText("5", centerA[0] - 25, centerA[1] + 40);

          // Intersection elements
          ctx.fillStyle = "#065f46";
          ctx.fillText("2", O[0] - 5, O[1] - 15);
          ctx.fillText("4", O[0] - 5, O[1] + 25);
          ctx.font = "bold 10px sans-serif";
          ctx.fillText("A ∩ B = {2; 4}", O[0] - 35, O[1] + rVenn + 25);

          // B \ A elements
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#9a3412";
          ctx.fillText("6", centerB[0] + 30, centerB[1] - 15);
          ctx.fillText("8", centerB[0] + 45, centerB[1] + 30);
        } else if (stationId === "10.10") {
          // Preset Trạm 10.10: Parabol bậc hai y = ax² + bx + c
          const a = 0.5;
          const b = -1;
          const c = -2;
          const h = -b / (2 * a); // Đỉnh x = 1
          const kVal = a * h * h + b * h + c; // Đỉnh y = -2.5

          // Axis of symmetry x = h (Red dashed line)
          const symTop = w2s(h, 6);
          const symBot = w2s(h, -5);
          ctx.beginPath();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 1.5;
          ctx.moveTo(symTop[0], symTop[1]);
          ctx.lineTo(symBot[0], symBot[1]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#dc2626";
          ctx.font = "10px sans-serif";
          ctx.fillText(`Trục đ/x: x = ${h}`, symTop[0] + 5, symTop[1] + 20);

          // Parabola curve
          ctx.beginPath();
          ctx.strokeStyle = "#087e7c";
          ctx.lineWidth = 2.5;
          for (let px = 0; px <= W; px += 2) {
            const mx = (px - O[0]) / scale;
            const my = a * mx * mx + b * mx + c;
            const sy = O[1] - my * scale;
            if (px === 0) ctx.moveTo(px, sy);
            else ctx.lineTo(px, sy);
          }
          ctx.stroke();

          // Vertex I
          const sI = w2s(h, kVal);
          ctx.beginPath();
          ctx.arc(sI[0], sI[1], 6, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#ea580c";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`Đỉnh I(${h}; ${kVal})`, sI[0] + 8, sI[1] + 16);
        } else if (moduleId === "linear_programming") {
          const lp = solveLP(constraints, params.u || 3, params.v || 2);

          // Chuẩn SGK KNTT Toán 10 vs GeoGebra Quốc tế
          if (!invertFilling) {
            // SGK KNTT: Gạch sọc phần không thỏa mãn (Hatching non-feasible regions), giữ trắng miền nghiệm
            ctx.save();
            ctx.strokeStyle = "#94a3b838";
            ctx.lineWidth = 1.2;
            const stepHatch = 14;
            for (let d = -H; d < W + H; d += stepHatch) {
              ctx.beginPath();
              ctx.moveTo(d, 0);
              ctx.lineTo(d + H, H);
              ctx.stroke();
            }

            // Giữ trắng miền nghiệm thỏa mãn
            if (lp.feasible && lp.poly.length > 2) {
              ctx.beginPath();
              lp.poly.forEach((pt, i) => {
                const s = w2s(pt[0], pt[1]);
                if (i === 0) ctx.moveTo(s[0], s[1]);
                else ctx.lineTo(s[0], s[1]);
              });
              ctx.closePath();
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.strokeStyle = "#087e7c";
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
            ctx.restore();
          } else {
            // GeoGebra Quốc tế: Tô màu miền nghiệm thỏa mãn
            if (lp.feasible && lp.poly.length > 2) {
              ctx.beginPath();
              lp.poly.forEach((pt, i) => {
                const s = w2s(pt[0], pt[1]);
                if (i === 0) ctx.moveTo(s[0], s[1]);
                else ctx.lineTo(s[0], s[1]);
              });
              ctx.closePath();
              ctx.fillStyle = "#20a38844";
              ctx.fill();
              ctx.strokeStyle = "#087e7c";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }

          // Vẽ đường biên: Nét liền (≤, ≥) và Nét đứt (<, >)
          constraints.forEach((c) => {
            const isStrict = c.op === "<" || c.op === ">";
            ctx.beginPath();
            if (isStrict) {
              ctx.setLineDash([6, 6]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = isStrict ? 1.5 : 2;

            if (c.b !== 0) {
              const p1 = w2s(xMin, (c.c - c.a * xMin) / c.b);
              const p2 = w2s(xMax, (c.c - c.a * xMax) / c.b);
              ctx.moveTo(p1[0], p1[1]);
              ctx.lineTo(p2[0], p2[1]);
            } else if (c.a !== 0) {
              const xVal = c.c / c.a;
              const p1 = w2s(xVal, yMin);
              const p2 = w2s(xVal, yMax);
              ctx.moveTo(p1[0], p1[1]);
              ctx.lineTo(p2[0], p2[1]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          });

          // Tọa độ các đỉnh của miền nghiệm
          if (lp.feasible) {
            lp.vertices.forEach((v) => {
              const sp = w2s(v[0], v[1]);
              ctx.beginPath();
              ctx.arc(sp[0], sp[1], 5, 0, Math.PI * 2);
              ctx.fillStyle = "#087e7c";
              ctx.fill();
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.fillStyle = "#152f35";
              ctx.font = "bold 10px sans-serif";
              ctx.fillText(`(${v[0]}; ${v[1]})`, sp[0] + 6, sp[1] - 6);
            });
          }

          // Phản ví dụ trực quan (Visual Counter-Example Generator)
          if (counterExampleActive || currentStep === 3 || currentStep === 4) {
            const pX = 1;
            const pY = 0;
            const spP = w2s(pX, pY);

            // Chấm đỏ P(1; 0)
            ctx.beginPath();
            ctx.arc(spP[0], spP[1], 8, 0, Math.PI * 2);
            ctx.fillStyle = "#dc2626";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Vòng tròn xung quanh
            ctx.beginPath();
            ctx.arc(spP[0], spP[1], 14, 0, Math.PI * 2);
            ctx.strokeStyle = "#dc262688";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Khung badge phép tính mâu thuẫn
            const badgeW = 210;
            const badgeH = 46;
            const bx = Math.min(W - badgeW - 10, Math.max(10, spP[0] + 16));
            const by = Math.max(10, spP[1] - 25);

            ctx.fillStyle = "#fff1f2";
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(bx, by, badgeW, badgeH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(spP[0], spP[1]);
            ctx.lineTo(bx, by + badgeH / 2);
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#9f1239";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText("⚠️ Phản ví dụ trực quan:", bx + 8, by + 16);
            ctx.font = "bold 10px sans-serif";
            ctx.fillText("P(1; 0) ∉ Miền: -1 + 2(0) = -1 > 4 (Sai!)", bx + 8, by + 34);
          }

          // Integer Lattice Points (Lưới nguyên)
          if (showIntegerPoints) {
            for (let ix = 0; ix <= 6; ix++) {
              for (let iy = 0; iy <= 6; iy++) {
                if (constraints.every((c) => satisfies(c, ix, iy))) {
                  const sp = w2s(ix, iy);
                  ctx.beginPath();
                  ctx.arc(sp[0], sp[1], 3.5, 0, Math.PI * 2);
                  ctx.fillStyle = "#059669";
                  ctx.fill();
                }
              }
            }
          }

          // Objective level line 3x + 2y = k (Brown dashed line)
          const k = params.k ?? 12;
          const u = params.u ?? 3;
          const v = params.v ?? 2;
          if (v !== 0) {
            const p1 = w2s(-2, (k - u * -2) / v);
            const p2 = w2s(8, (k - u * 8) / v);
            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = "#b87439";
            ctx.lineWidth = 2;
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#b87439";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText(`F = ${k}`, p2[0] - 40, p2[1] - 8);
          }

          // Draggable Yellow Point M
          const sM = w2s(params.x ?? 2, params.y ?? 3);
          ctx.beginPath();
          ctx.arc(sM[0], sM[1], 7, 0, Math.PI * 2);
          ctx.fillStyle = "#dcaa44";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#152f35";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`M(${params.x?.toFixed(1)}; ${params.y?.toFixed(1)})`, sM[0] + 10, sM[1] - 6);
        } else if (moduleId === "trigonometry") {
          // Unit circle R=1 (scale = 90px)
          const O2 = w2s(0, 0);
          const rPx = scale * 1.5;
          ctx.beginPath();
          ctx.arc(O2[0], O2[1], rPx, 0, Math.PI * 2);
          ctx.strokeStyle = "#087e7c";
          ctx.lineWidth = 2;
          ctx.stroke();

          const rad = ((params.t || 60) * Math.PI) / 180;
          const px = O2[0] + rPx * Math.cos(rad);
          const py = O2[1] - rPx * Math.sin(rad);

          // Angle vector
          ctx.beginPath();
          ctx.moveTo(O2[0], O2[1]);
          ctx.lineTo(px, py);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Projection lines to Ox and Oy
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "#2563eb";
          ctx.moveTo(px, py);
          ctx.lineTo(px, O2[1]); // cos
          ctx.strokeStyle = "#16a34a";
          ctx.moveTo(px, py);
          ctx.lineTo(O2[0], py); // sin
          ctx.stroke();
          ctx.setLineDash([]);

          // Yellow draggable point
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#dcaa44";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#dc2626";
          ctx.fillText("M(cos θ; sin θ)", px + 10, py - 6);
        } else if (moduleId === "functions") {
          // Curve f(x) = x³ - 3x
          ctx.beginPath();
          ctx.strokeStyle = "#087e7c";
          ctx.lineWidth = 2.5;
          for (let px = 0; px <= W; px += 2) {
            const mx = (px - O[0]) / scale;
            const my = mx * mx * mx - 3 * mx;
            const sy = O[1] - my * scale;
            if (px === 0) ctx.moveTo(px, sy);
            else ctx.lineTo(px, sy);
          }
          ctx.stroke();

          // Tangent line at x0
          const x0 = params.x0 ?? 0.5;
          const y0 = x0 * x0 * x0 - 3 * x0;
          const k = 3 * x0 * x0 - 3;
          const sT = w2s(x0, y0);

          const tanP1 = w2s(x0 - 2, y0 - k * 2);
          const tanP2 = w2s(x0 + 2, y0 + k * 2);
          ctx.beginPath();
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.moveTo(tanP1[0], tanP1[1]);
          ctx.lineTo(tanP2[0], tanP2[1]);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sT[0], sT[1], 7, 0, Math.PI * 2);
          ctx.fillStyle = "#dcaa44";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (moduleId === "probability") {
          // Dice frequency bars
          const counts = [4, 5, 6, 5, 4, params.rolls ? Math.floor(params.rolls / 6) + 2 : 7];
          const total = counts.reduce((a, b) => a + b, 0);
          ctx.font = "bold 11px sans-serif";
          for (let i = 0; i < 6; i++) {
            const freq = counts[i] / total;
            const barH = freq * 180;
            const bx = O[0] - 120 + i * 40;
            const by = O[1] - barH;
            ctx.fillStyle = i === 5 ? "#087e7c" : "#94a3b8";
            ctx.fillRect(bx, by, 30, barH);
            ctx.fillStyle = "#152f35";
            ctx.fillText(`${i + 1}`, bx + 10, O[1] + 16);
            ctx.fillText(`${(freq * 100).toFixed(0)}%`, bx + 2, by - 6);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [moduleId, stationId, meta.is3D, camera, params, constraints, showIntegerPoints, invertFilling, counterExampleActive, isUnfolded, currentStep]);

  // Pointer Dragging Interaction
  const pointerRef = useRef<{ x: number; y: number; dragging: boolean }>({
    x: 0,
    y: 0,
    dragging: false,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerRef.current = { x: e.clientX, y: e.clientY, dragging: true };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.dragging) return;
    const dx = e.clientX - pointerRef.current.x;
    const dy = e.clientY - pointerRef.current.y;
    pointerRef.current = { x: e.clientX, y: e.clientY, dragging: true };

    if (meta.is3D || toolMode === "rotate") {
      setCamera((c) => ({
        ...c,
        yaw: c.yaw + dx * 0.009,
        pitch: Math.max(-1.5, Math.min(1.5, c.pitch - dy * 0.009)),
      }));
    } else {
      setCamera((c) => ({
        ...c,
        panX: c.panX + dx,
        panY: c.panY + dy,
      }));
    }
  };

  const handlePointerUp = () => {
    pointerRef.current.dragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCamera((c) => ({
      ...c,
      zoom: Math.max(0.3, Math.min(3.5, c.zoom * (e.deltaY < 0 ? 1.1 : 0.9))),
    }));
  };

  // --- Step Navigation & Evidence Tracing ---
  const handleSavePrediction = () => {
    if (prediction.trim().length < 8) {
      showToast("Vui lòng viết dự đoán rõ hơn (ít nhất 8 ký tự).");
      return;
    }
    const record: EvidenceRecord = {
      stepId: 2,
      stepName: "Dự đoán giả thiết",
      completedAt: new Date().toLocaleTimeString("vi-VN"),
      summary: `Dự đoán: "${prediction.trim()}"`,
      data: { prediction: prediction.trim() },
    };
    setEvidenceHistory((prev) => [record, ...prev]);
    showToast("✓ Đã lưu vết dự đoán vào sổ khám phá!");
  };

  const handleRecordObservation = () => {
    const obs: ObservationRecord = {
      at: new Date().toLocaleTimeString("vi-VN"),
      params: { ...params },
      summary: metricsBadges.join(" · "),
    };
    setObservations((prev) => [obs, ...prev.slice(0, 15)]);
    const record: EvidenceRecord = {
      stepId: 4,
      stepName: "Ghi nhận quan sát kiểm chứng",
      completedAt: obs.at,
      summary: obs.summary,
      data: { params: { ...params } },
    };
    setEvidenceHistory((prev) => [record, ...prev]);
    showToast(`✓ Đã lưu quan sát thứ ${observations.length + 1} vào bằng chứng!`);
  };

  const handleSaveReason = () => {
    if (reason.trim().length < 10) {
      showToast("Vui lòng giải thích chi tiết hơn (ít nhất 10 ký tự).");
      return;
    }
    const record: EvidenceRecord = {
      stepId: 5,
      stepName: "Đúc kết & Giải thích quy luật",
      completedAt: new Date().toLocaleTimeString("vi-VN"),
      summary: `Đúc kết: "${reason.trim()}"`,
      data: { explanation: reason.trim() },
    };
    setEvidenceHistory((prev) => [record, ...prev]);
    showToast("✓ Đã lưu vết giải thích quy luật toán học!");
  };

  const handleCheckQuiz = () => {
    if (quizAnswer === null) {
      showToast("Hãy chọn một phương án trả lời.");
      return;
    }
    setQuizSubmitted(true);
    const isCorrect = quizAnswer === QUIZ_DATA[moduleId].correctIdx;
    if (isCorrect) {
      showToast("✓ Chính xác! Em đã hiểu đúng bản chất toán học.");
    } else {
      showToast("Chưa chính xác. Đọc gợi ý giải thích rồi chọn lại nhé.");
    }
  };

  const currentProblem = dynamicProblem || TRANSFER_DATA[moduleId];

  const handleCheckTransfer = () => {
    if (!transferInput.trim()) {
      showToast("Vui lòng nhập đáp số (ví dụ: 13, 0.5 hoặc 1/2).");
      return;
    }
    const result = verifyAnswer(currentProblem.answer, transferInput);
    setTransferVerification(result);
    if (result.correct) {
      const record: EvidenceRecord = {
        stepId: 7,
        stepName: "Vận dụng thực tế",
        completedAt: new Date().toLocaleTimeString("vi-VN"),
        summary: `Đáp số đúng: ${transferInput.trim()} (kết quả kiểm định MiniCAS: ${result.enteredNum}).`,
        data: { input: transferInput.trim(), expected: currentProblem.answer },
      };
      setEvidenceHistory((prev) => [record, ...prev]);
      showToast("🎯 Tuyệt vời! MiniCAS đã kiểm chứng đáp số của em là chính xác!");
    } else {
      showToast(result.message);
    }
  };

  const handleNewProblem = () => {
    const p = generateRandomProblem(moduleId);
    setDynamicProblem(p);
    setTransferInput("");
    setTransferVerification(null);
    setHintLevel(0);
    showToast("🎲 Đã sinh bài toán tham số mới! Hãy thử sức nào.");
  };

  const handleShareScene = () => {
    try {
      const state = { moduleId, stationId, params, constraints, camera, currentStep };
      const hashStr = encodeURIComponent(btoa(JSON.stringify(state)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#scene=${hashStr}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast("🔗 Đã sao chép liên kết chia sẻ cảnh vào bộ nhớ tạm!");
        }).catch(() => {
          window.location.hash = `scene=${hashStr}`;
          showToast("🔗 Đã cập nhật URL hash với cảnh hiện tại!");
        });
      } else {
        window.location.hash = `scene=${hashStr}`;
        showToast("🔗 Đã cập nhật URL hash với cảnh hiện tại!");
      }
    } catch {
      showToast("Chưa thể tạo liên kết chia sẻ.");
    }
  };

  const handleExportEvidenceJson = () => {
    const exportData = {
      stationId: stationId || moduleId,
      moduleId,
      exportedAt: new Date().toISOString(),
      prediction,
      reason,
      observations,
      evidenceHistory,
      params,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mathstep-evidence-${moduleId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("💾 Đã xuất file JSON dữ liệu học tập!");
  };

  const handleImportEvidenceJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.prediction) setPrediction(json.prediction);
        if (json.reason) setReason(json.reason);
        if (Array.isArray(json.observations)) setObservations(json.observations);
        if (Array.isArray(json.evidenceHistory)) setEvidenceHistory(json.evidenceHistory);
        if (json.params) setParams(json.params);
        showToast("📂 Đã nạp thành công dữ liệu học tập từ file JSON!");
      } catch {
        showToast("Lỗi: File JSON không đúng định dạng.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleOpenWorksheet = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasSnapshotUrl(canvas.toDataURL("image/png"));
    }
    setWorksheetModalOpen(true);
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (onStepChange) onStepChange(next + 1, STEP_NAMES[next]);
    } else {
      showToast("🎉 Chúc mừng em đã hoàn thành toàn bộ 8 bước chu trình nhận thức!");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (onStepChange) onStepChange(prev + 1, STEP_NAMES[prev]);
    }
  };

  // Snapshot PNG Download
  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mo_hinh_${moduleId}.png`;
    a.click();
    showToast("📷 Đã chụp và tải ảnh mô hình về máy.");
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f6f5] border border-[#d9e4e2] rounded-2xl overflow-hidden shadow-sm font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#087e7c] text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in z-50">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. THANH TIÊU ĐỀ TRẠM HỌC & CĂN CỨ SGK (LAB-BAR) */}
      <div className="bg-white border-b border-[#d9e4e2] px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="px-3 py-1.5 rounded-xl bg-[#eef7f3] hover:bg-[#dbeee7] text-[#087e7c] font-bold text-xs border border-[#a3e2cf] flex items-center gap-1.5 shadow-sm transition-all"
              title="Quay lại danh mục 48 trạm học"
            >
              <span>←</span>
              <span>Danh mục trạm</span>
            </button>
          )}
          <button
            onClick={() => setCatalogModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#087e7c] text-white font-bold text-xs hover:bg-[#066563] flex items-center gap-1.5 shadow-sm transition-all"
            title="Mở danh mục 48 trạm học Toán THPT"
          >
            <span>📚</span>
            <span>48 Trạm học</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-[#087e7c] px-2 py-0.5 rounded bg-[#e2f1ec]">
                {stationId || (meta.is3D ? "3D" : "2D")}
              </span>
              <h2 className="text-sm font-bold text-[#152f35] tracking-tight">{meta.title}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#adf0d6] text-[#087e7c]">
                {meta.is3D ? "Không gian 3D" : "Hình học 2D"}
              </span>
            </div>
            <div className="text-[10px] text-[#63777c]">{meta.source}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Teacher Mode Toggle */}
          <button
            onClick={() => {
              setIsTeacherMode((v) => !v);
              showToast(!isTeacherMode ? "👨‍🏫 Đã bật Chế độ Giáo viên: Tự do chọn bước trình chiếu." : "Đã chuyển về Chế độ Học sinh.");
            }}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              isTeacherMode
                ? "bg-[#fef3c7] text-[#92400e] border-[#f59e0b] ring-1 ring-[#f59e0b]"
                : "bg-white text-gray-700 border-[#d9e4e2] hover:bg-gray-50"
            }`}
            title="Bật/Tắt chế độ dạy học tự do chọn bước"
          >
            <span>👨‍🏫</span>
            <span className="hidden sm:inline">{isTeacherMode ? "Chế độ dạy: BẬT" : "Chế độ dạy"}</span>
          </button>

          {/* Worksheet Print Button */}
          <button
            onClick={handleOpenWorksheet}
            className="text-xs font-semibold text-[#152f35] hover:bg-gray-100 border border-[#d9e4e2] px-2.5 py-1.5 rounded-lg bg-white flex items-center gap-1.5 transition-all"
            title="Xem trước và in phiếu học tập A4"
          >
            <span>🖨️</span>
            <span className="hidden md:inline">In phiếu A4</span>
          </button>

          {/* Share Scene Link Button */}
          <button
            onClick={handleShareScene}
            className="text-xs font-semibold text-[#152f35] hover:bg-gray-100 border border-[#d9e4e2] px-2.5 py-1.5 rounded-lg bg-white flex items-center gap-1.5 transition-all"
            title="Sao chép liên kết chia sẻ cảnh mô phỏng"
          >
            <span>🔗</span>
            <span className="hidden md:inline">Chia sẻ</span>
          </button>

          {/* Evidence Notebook Modal Button */}
          <button
            onClick={() => setEvidenceModalOpen(true)}
            className="text-xs font-semibold text-[#087e7c] hover:bg-[#eaf7f2] border border-[#d9e4e2] px-2.5 py-1.5 rounded-lg bg-white flex items-center gap-1.5 transition-all"
            title="Xem toàn bộ bằng chứng và lịch sử khám phá"
          >
            <span>📜</span>
            <span className="hidden sm:inline">Sổ khám phá</span>
            <span className="font-bold text-[10px]">({evidenceHistory.length})</span>
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={() => {
              setCamera({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });
              showToast("Đã đưa góc nhìn về cấu hình chuẩn ban đầu.");
            }}
            className="text-xs text-[#63777c] hover:text-[#152f35] border border-[#d9e4e2] px-2 py-1.5 rounded-lg bg-white"
            title="Khôi phục góc nhìn chuẩn"
          >
            ⟲
          </button>
        </div>
      </div>

      {/* 2. THANH LỘ TRÌNH 7 BƯỚC SƯ PHẠM (STEPBAR) */}
      <div className="bg-white border-b border-[#d9e4e2] px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {isTeacherMode && (
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-bold shrink-0">
            👨‍🏫 Tự do chuyển bước
          </span>
        )}
        {STEP_NAMES.map((name, idx) => {
          const isActive = currentStep === idx;
          const isPassed = currentStep > idx;
          return (
            <button
              key={name}
              onClick={() => {
                setCurrentStep(idx);
                if (onStepChange) onStepChange(idx + 1, name);
              }}
              className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 border ${
                isActive
                  ? "bg-[#123d43] text-white border-[#123d43] shadow-sm"
                  : isPassed
                  ? "bg-[#eef6f3] text-[#087e7c] border-[#d9e4e2] hover:bg-[#e2f1ec]"
                  : isTeacherMode
                  ? "bg-white text-gray-700 border-[#d9e4e2] hover:bg-gray-100"
                  : "bg-white text-[#63777c] border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <span>{isPassed ? "✓" : idx + 1}</span>
              <span className="truncate">{name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Tab Switcher (Chỉ hiển thị trên màn hình nhỏ/tablet) */}
      <div className="lg:hidden bg-white border-b border-[#d9e4e2] px-3 py-1.5 flex items-center justify-between gap-1 shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setActiveMobileTab("scene")}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center border transition-all ${
            activeMobileTab === "scene"
              ? "bg-[#087e7c] text-white border-[#087e7c] shadow-sm"
              : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2]"
          }`}
        >
          📐 Mô phỏng
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("task")}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center border transition-all ${
            activeMobileTab === "task"
              ? "bg-[#087e7c] text-white border-[#087e7c] shadow-sm"
              : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2]"
          }`}
        >
          📝 Nhiệm vụ (B{currentStep + 1})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("controls")}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center border transition-all ${
            activeMobileTab === "controls"
              ? "bg-[#087e7c] text-white border-[#087e7c] shadow-sm"
              : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2]"
          }`}
        >
          🎛️ Điều khiển
        </button>
      </div>

      {/* 3. KHÔNG GIAN 3 CỘT: NHIỆM VỤ (TRÁI) | MÔ PHỎNG & CANVAS (GIỮA) | ĐIỀU KHIỂN DỰNG HÌNH (PHẢI) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_minmax(320px,1fr)_290px] gap-3 p-3 overflow-y-auto">
        {/* CỘT 1: NHIỆM VỤ SƯ PHẠM (TASK-SIDE) */}
        <aside className={`bg-white border border-[#d9e4e2] rounded-xl p-3.5 flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto text-xs text-[#152f35] ${
          activeMobileTab === "task" ? "flex" : "hidden lg:flex"
        }`}>
          <div className="border-b border-[#d9e4e2] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087e7c]">
              BƯỚC {currentStep + 1} · {STEP_NAMES[currentStep]}
            </span>
            <h3 className="text-xs font-bold mt-1 text-[#152f35]">{meta.title}</h3>
          </div>

          {/* Nội dung từng bước */}
          {/* BƯỚC 1: NHÌN THẤY (OBSERVE) */}
          {currentStep === 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-[#63777c] leading-relaxed">{meta.simulation}</p>
              <div className="p-2.5 rounded-lg bg-[#eff8f4] border-l-4 border-[#087e7c] text-[11px]">
                <strong>Mục tiêu bài học</strong>
                <p className="mt-1 text-[#152f35]">{meta.goal}</p>
              </div>
              <p className="text-[10px] text-[#63777c]">
                Căn cứ SGK: {meta.source}. Quan sát trực quan mô hình và xác định các yếu tố xuất hiện trên hình vẽ trước khi dự đoán.
              </p>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-2 bg-[#087e7c] text-white rounded-lg font-bold text-xs hover:bg-[#066563] transition-colors shadow-sm"
              >
                Em đã quan sát xong, chuyển sang Dự đoán →
              </button>
            </div>
          )}

          {/* BƯỚC 2: DỰ ĐOÁN (PREDICT) */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <label className="font-bold text-[11px] text-[#152f35]">
                Dự đoán ban đầu của em:
              </label>
              <textarea
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="Em nghĩ rằng... vì..."
                rows={4}
                className="w-full p-2 border border-[#bed0cd] rounded-lg text-xs focus:outline-none focus:border-[#087e7c] resize-none"
              />

              {/* Socratic Semantic Quality Feedback */}
              {(() => {
                const feedback = checkSemanticQuality(prediction);
                if (!feedback) return null;
                return (
                  <div
                    className={`p-2 rounded-lg text-[10px] leading-relaxed border ${
                      feedback.type === "good"
                        ? "bg-[#edf6f3] border-[#a3e2cf] text-[#087e7c] font-medium"
                        : feedback.type === "short"
                        ? "bg-[#fefce8] border-[#fef08a] text-[#854d0e]"
                        : "bg-[#f8faf9] border-[#d9e4e2] text-gray-600"
                    }`}
                  >
                    {feedback.message}
                  </div>
                );
              })()}

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSavePrediction}
                  className="flex-1 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563] transition-colors"
                >
                  Lưu dự đoán
                </button>
                {onAskTutor && prediction.trim().length > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskTutor(
                        `Nhờ linh vật TES nhận xét câu dự đoán của em ở bài ${meta.title}: "${prediction.trim()}"`
                      )
                    }
                    className="px-2.5 py-1.5 bg-[#eef7f3] text-[#087e7c] border border-[#d9e4e2] rounded-lg font-bold text-[10px] hover:bg-[#e2f1ec] shrink-0"
                    title="Hỏi trợ lý nhận xét câu dự đoán"
                  >
                    🦉 Nhờ TES nhận xét
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BƯỚC 3: THAO TÁC (MANIPULATE) */}
          {currentStep === 2 && (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-[#eff8f4] border-l-4 border-[#087e7c] text-[11px]">
                <strong>Thao tác tương tác mô phỏng</strong>
                <p className="mt-1">
                  Kéo điểm màu vàng trên khung vẽ hoặc dùng thanh trượt ở cột bên phải để thử các giá trị khác nhau.
                </p>
              </div>
              <div className="text-center py-2 bg-[#f3f6f5] rounded-lg border border-[#d9e4e2]">
                <span className="text-lg font-bold text-[#087e7c] block">{manipulations}</span>
                <span className="text-[10px] text-[#63777c]">lượt thao tác đã ghi nhận</span>
              </div>
              <p className="text-[10px] text-gray-500 italic">
                💡 Lời khuyên: Hãy thử ít nhất 3 cấu hình khác nhau trước khi ghi nhận quan sát.
              </p>
            </div>
          )}

          {/* BƯỚC 4: KHÁM PHÁ & PHÁT HIỆN LỖI (ERROR DETECTION & MISCONCEPTION) */}
          {currentStep === 3 && (
            <div className="space-y-2.5">
              <button
                onClick={handleRecordObservation}
                className="w-full py-2 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563] transition-colors shadow-sm"
              >
                📌 Ghi cấu hình đang thấy ({observations.length} đã lưu)
              </button>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span>⚠️</span>
                  <span>Cảnh báo mã lỗi tư duy thường gặp:</span>
                </div>
                <p className="text-amber-800 text-[10px] leading-relaxed">
                  {moduleId === "linear_programming"
                    ? "Lỗi M1 & M2: Quên đổi chiều BPT khi nhân số âm; hoặc lấy nghiệm thập phân trong bài toán yêu cầu biến nguyên x, y ∈ ℕ*."
                    : moduleId === "spatial_geometry"
                    ? "Lỗi G1 & G2: Ngộ nhận 2 đường thẳng chéo nhau là cắt nhau; hoặc vẽ sai nét liền cho cạnh bị khuất."
                    : moduleId === "trigonometry"
                    ? "Lỗi T1: Nhầm dấu của cos và sin khi góc tù nằm ở góc phần tư thứ II."
                    : "Lỗi nhận thức: Không kiểm tra điều kiện cần và đủ của bài toán."}
                </p>
              </div>

              <div className="space-y-1 max-h-28 overflow-y-auto">
                {observations.map((obs, idx) => (
                  <div key={idx} className="p-1.5 bg-[#eef7f3] rounded border border-[#d9e4e2] text-[10px]">
                    <span className="font-mono text-[#087e7c] font-bold">[{obs.at}]</span> {obs.summary}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BƯỚC 5: KIỂM CHỨNG (VERIFY & VISUAL COUNTER-EXAMPLE) */}
          {currentStep === 4 && (
            <div className="space-y-2.5">
              {/* Nút bật Phản ví dụ trực quan */}
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-rose-900">
                    Phản ví dụ trực quan (Counter-Example)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCounterExampleActive((v) => !v);
                      showToast(!counterExampleActive ? "Đã ghim chấm đỏ phản ví dụ P(1; 0) trên đồ thị!" : "Đã ẩn chấm phản ví dụ.");
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      counterExampleActive
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
                    }`}
                  >
                    {counterExampleActive ? "Bật: Chấm đỏ P" : "Ghim chấm đỏ P"}
                  </button>
                </div>
                <p className="text-[10px] text-rose-800 leading-relaxed">
                  Thay vì chỉ báo đúng/sai, hệ thống ghim điểm <strong className="font-mono text-rose-700">P(1; 0)</strong> lên miền sai để bộc lộ mâu thuẫn: -1 + 2(0) = -1 &gt; 4 (Sai!).
                </p>
              </div>

              {/* Trắc nghiệm kiểm chứng toán học */}
              <div className="space-y-2 pt-1">
                <p className="font-bold text-[11px] text-[#152f35]">
                  {QUIZ_DATA[moduleId].question}
                </p>
                <div className="space-y-1.5">
                  {QUIZ_DATA[moduleId].options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                        quizAnswer === idx
                          ? "bg-[#eaf7f2] border-[#087e7c] text-[#087e7c] font-semibold"
                          : "bg-white border-[#bed0cd] text-[#152f35] hover:bg-[#f3f6f5]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="workbench-quiz"
                        checked={quizAnswer === idx}
                        onChange={() => setQuizAnswer(idx)}
                        className="mt-0.5 accent-[#087e7c]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleCheckQuiz}
                  className="w-full py-1.5 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563] transition-colors"
                >
                  Kiểm tra câu trả lời
                </button>
                {quizSubmitted && (
                  <div
                    className={`p-2 rounded-lg text-[10px] leading-relaxed ${
                      quizAnswer === QUIZ_DATA[moduleId].correctIdx
                        ? "bg-[#edf6f3] text-[#087e7c] font-medium"
                        : "bg-[#fff0ec] text-[#b23c48]"
                    }`}
                  >
                    {quizAnswer === QUIZ_DATA[moduleId].correctIdx
                      ? `✓ Đúng! ${QUIZ_DATA[moduleId].explanation}`
                      : `Chưa đúng. Gợi ý: ${QUIZ_DATA[moduleId].explanation}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BƯỚC 6: GIẢI THÍCH (SELF-EXPLANATION) */}
          {currentStep === 5 && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#eff8f4] border-l-4 border-[#087e7c] text-[11px]">
                <strong>Điều cần đúc kết</strong>
                <p className="mt-1 text-[#152f35]">{meta.goal}</p>
              </div>
              <label className="font-bold text-[11px] text-[#152f35]">
                Giải thích quy luật và điều kiện (Self-explanation):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Từ các trường hợp đã thử, em nhận thấy... Điều kiện là..."
                rows={4}
                className="w-full p-2 border border-[#bed0cd] rounded-lg text-xs focus:outline-none focus:border-[#087e7c] resize-none"
              />

              {/* Socratic Semantic Quality Feedback */}
              {(() => {
                const feedback = checkSemanticQuality(reason);
                if (!feedback) return null;
                return (
                  <div
                    className={`p-2 rounded-lg text-[10px] leading-relaxed border ${
                      feedback.type === "good"
                        ? "bg-[#edf6f3] border-[#a3e2cf] text-[#087e7c] font-medium"
                        : feedback.type === "short"
                        ? "bg-[#fefce8] border-[#fef08a] text-[#854d0e]"
                        : "bg-[#f8faf9] border-[#d9e4e2] text-gray-600"
                    }`}
                  >
                    {feedback.message}
                  </div>
                );
              })()}

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSaveReason}
                  className="flex-1 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563] transition-colors"
                >
                  Lưu giải thích
                </button>
                {onAskTutor && reason.trim().length > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskTutor(
                        `Nhờ linh vật TES nhận xét câu đúc kết quy luật của em ở bài ${meta.title}: "${reason.trim()}"`
                      )
                    }
                    className="px-2.5 py-1.5 bg-[#eef7f3] text-[#087e7c] border border-[#d9e4e2] rounded-lg font-bold text-[10px] hover:bg-[#e2f1ec] shrink-0"
                    title="Hỏi trợ lý nhận xét câu đúc kết"
                  >
                    🦉 Nhờ TES nhận xét
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BƯỚC 7: CHUYỂN GIAO (TRANSFER & ISOMORPHIC INTEGER GENERATOR) */}
          {currentStep === 6 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#152f35]">Bài toán chuyển giao:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const iso = generateIsomorphicIntegerProblem();
                      setActiveIntegerProblem(iso);
                      setTransferInput("");
                      setTransferVerification(null);
                      showToast(`🎲 Đã tạo bài toán thực tế mới: ${iso.contextTitle}`);
                    }}
                    className="px-2 py-1 rounded bg-[#eff8f4] hover:bg-[#d6f0e6] text-[#087e7c] border border-[#a3e2cf] font-bold text-[10px] flex items-center gap-1 transition-colors"
                    title="Sinh bài toán đồng cấu đỉnh nguyên ℤ²"
                  >
                    <span>🎲</span> Đỉnh nguyên ℤ²
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIntegerProblem(null);
                      handleNewProblem();
                    }}
                    className="px-2 py-1 rounded bg-[#f3f6f5] hover:bg-[#e2f1ec] text-[#087e7c] border border-[#d9e4e2] font-bold text-[10px] flex items-center gap-1 transition-colors"
                    title="Sinh tham số bài toán mới"
                  >
                    <span>🔄</span> Đổi số
                  </button>
                </div>
              </div>

              {activeIntegerProblem ? (
                <div className="p-2.5 rounded-lg bg-[#eff8f4] border border-[#a3e2cf] text-[11px] leading-relaxed text-[#152f35] space-y-1.5">
                  <div className="font-bold text-[#087e7c] flex items-center gap-1">
                    <span>🌾</span> {activeIntegerProblem.contextTitle}
                  </div>
                  <p>{activeIntegerProblem.story}</p>
                  <div className="p-1.5 bg-white/80 rounded border border-[#a3e2cf] text-[10px] font-mono text-gray-700">
                    Mục tiêu: {activeIntegerProblem.objective.label}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#f8faf9] border border-[#d9e4e2] text-[11px] leading-relaxed text-[#152f35]">
                  {currentProblem.prompt}
                </div>
              )}

              <div>
                <label className="block text-[10px] text-gray-500 mb-1 font-medium">
                  Nhập số nguyên, số thập phân hoặc phân số (ví dụ: 84, 13, 0.5):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={transferInput}
                    onChange={(e) => setTransferInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (activeIntegerProblem) {
                          const val = parseFloat(transferInput.trim());
                          const isOk = Math.abs(val - activeIntegerProblem.optimalValue) < 1e-4;
                          setTransferVerification({
                            correct: isOk,
                            enteredNum: val,
                            expectedNum: activeIntegerProblem.optimalValue,
                            message: isOk
                              ? `Chính xác! ${activeIntegerProblem.explanation}`
                              : `Chưa đúng. Giá trị tối ưu kỳ vọng là ${activeIntegerProblem.optimalValue}.`,
                          });
                        } else {
                          handleCheckTransfer();
                        }
                      }
                    }}
                    placeholder="Đáp số của em..."
                    className="flex-1 p-2 border border-[#bed0cd] rounded-lg text-xs font-mono focus:outline-none focus:border-[#087e7c]"
                  />
                  <button
                    onClick={() => {
                      if (activeIntegerProblem) {
                        const val = parseFloat(transferInput.trim());
                        const isOk = Math.abs(val - activeIntegerProblem.optimalValue) < 1e-4;
                        setTransferVerification({
                          correct: isOk,
                          enteredNum: val,
                          expectedNum: activeIntegerProblem.optimalValue,
                          message: isOk
                            ? `Chính xác! ${activeIntegerProblem.explanation}`
                            : `Chưa đúng. Giá trị tối ưu kỳ vọng là ${activeIntegerProblem.optimalValue}.`,
                        });
                      } else {
                        handleCheckTransfer();
                      }
                    }}
                    className="px-3 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold text-xs hover:bg-[#066563] transition-colors shrink-0"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>

              {/* Socratic Hints System (3 Levels) */}
              <div className="pt-2 border-t border-[#e2e8e7] space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Gợi ý Socratic:</span>
                  {hintLevel < 3 && (
                    <button
                      type="button"
                      onClick={() => setHintLevel((l) => Math.min(3, l + 1))}
                      className="text-[#087e7c] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>💡</span> Mở gợi ý cấp {hintLevel + 1}
                    </button>
                  )}
                </div>

                {hintLevel >= 1 && (
                  <div className="p-2 bg-[#fefce8] border border-[#fef08a] rounded text-[10px] text-[#854d0e] leading-relaxed">
                    <strong>Cấp 1 (Định hướng):</strong> {SOCRATIC_HINTS[moduleId]?.level1 || currentProblem.hint}
                  </div>
                )}
                {hintLevel >= 2 && (
                  <div className="p-2 bg-[#fff7ed] border border-[#fed7aa] rounded text-[10px] text-[#9a3412] leading-relaxed">
                    <strong>Cấp 2 (Cảnh báo sai lầm):</strong> {SOCRATIC_HINTS[moduleId]?.level2}
                  </div>
                )}
                {hintLevel >= 3 && (
                  <div className="p-2 bg-[#eff6ff] border border-[#bfdbfe] rounded text-[10px] text-[#1e40af] leading-relaxed">
                    <strong>Cấp 3 (Phương pháp & Lời giải):</strong> {SOCRATIC_HINTS[moduleId]?.level3 || currentProblem.hint}
                  </div>
                )}
              </div>

              {transferVerification && (
                <div
                  className={`p-2.5 rounded-lg text-[10px] leading-relaxed border ${
                    transferVerification.correct
                      ? "bg-[#edf6f3] border-[#a3e2cf] text-[#087e7c] font-medium"
                      : "bg-[#fff0ec] border-[#fed7cc] text-[#b23c48]"
                  }`}
                >
                  <div className="font-bold mb-0.5">
                    {transferVerification.correct ? "✓ MiniCAS: Đáp số chính xác" : "✗ MiniCAS: Chưa trùng khớp"}
                  </div>
                  <div>{transferVerification.message}</div>
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 8: RÈN LUYỆN ĐỘC LẬP (FADING & INDEPENDENT TEST MODE) */}
          {currentStep === 7 && (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span>🎯</span>
                  <span>Chế độ Đánh giá độc lập (Fading)</span>
                </div>
                <p className="text-amber-800 text-[10px] leading-relaxed">
                  Để đánh giá năng lực thực chất, mô hình tương tác và trợ lý AI đã được rút bỏ giàn giáo. Em hãy tự lập luận và điền các bước giải vào khung bán tự luận dưới đây:
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-0.5">
                    1. Đặt ẩn và điều kiện ràng buộc:
                  </label>
                  <input
                    type="text"
                    value={fadingAnswers.step1}
                    onChange={(e) => setFadingAnswers({ ...fadingAnswers, step1: e.target.value })}
                    placeholder="Ví dụ: Gọi x là số xe loại A (x ∈ ℕ*), y là..."
                    className="w-full p-1.5 border border-[#bed0cd] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-0.5">
                    2. Thiết lập hệ bất phương trình:
                  </label>
                  <input
                    type="text"
                    value={fadingAnswers.step2}
                    onChange={(e) => setFadingAnswers({ ...fadingAnswers, step2: e.target.value })}
                    placeholder="Ví dụ: 20x + 10y ≥ 140, 0.6x + 1.5y ≥ 9..."
                    className="w-full p-1.5 border border-[#bed0cd] rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-0.5">
                    3. Tọa độ các đỉnh của miền nghiệm:
                  </label>
                  <input
                    type="text"
                    value={fadingAnswers.step3}
                    onChange={(e) => setFadingAnswers({ ...fadingAnswers, step3: e.target.value })}
                    placeholder="Ví dụ: A(3; 8), B(7; 4), C(9; 2)..."
                    className="w-full p-1.5 border border-[#bed0cd] rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-700 block mb-0.5">
                    4. Biểu thức mục tiêu F(x, y) & Kết luận phương án:
                  </label>
                  <textarea
                    rows={2}
                    value={fadingAnswers.step4}
                    onChange={(e) => setFadingAnswers({ ...fadingAnswers, step4: e.target.value })}
                    placeholder="Ví dụ: F(x, y) = 4x + 3y. Đạt min tại (7; 4) với chi phí 40 triệu..."
                    className="w-full p-1.5 border border-[#bed0cd] rounded text-xs resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    let score = 0;
                    if (fadingAnswers.step1.trim().length > 5) score += 2.5;
                    if (fadingAnswers.step2.trim().length > 5) score += 2.5;
                    if (fadingAnswers.step3.trim().length > 5) score += 2.5;
                    if (fadingAnswers.step4.trim().length > 5) score += 2.5;

                    setFadingSubmitted(true);
                    setFadingScore({
                      score,
                      maxScore: 10,
                      feedback:
                        score >= 8
                          ? "Xuất sắc! Lập luận tự luận hoàn chỉnh và đáp ứng chuẩn chấm thi KHKT."
                          : score >= 5
                          ? "Tốt, em đã hoàn thành phần lớn các bước. Cần giải thích rõ hơn ở bước kết luận phương án."
                          : "Em hãy điền đầy đủ các bước lập luận để đạt điểm tối đa.",
                    });

                    // Lưu bằng chứng tự luận vào sổ học tập
                    const newRecord: EvidenceRecord = {
                      stepId: 8,
                      stepName: "Bước 8: Rèn luyện độc lập (Fading)",
                      completedAt: new Date().toLocaleTimeString("vi-VN"),
                      summary: `Hoàn thành bài kiểm tra độc lập: Điểm ${score}/10. Lời giải: ${fadingAnswers.step4.slice(0, 50)}...`,
                      data: { ...fadingAnswers, score },
                    };
                    setEvidenceHistory((prev) => [...prev, newRecord]);
                    showToast(`🎯 Đã chấm điểm tự luận: ${score}/10! Bằng chứng đã lưu vào sổ học tập.`);
                  }}
                  className="w-full py-2 bg-[#087e7c] text-white rounded-lg font-bold text-xs hover:bg-[#066563] transition-colors"
                >
                  Nộp bài tự luận độc lập & Chấm điểm
                </button>

                {fadingSubmitted && fadingScore && (
                  <div
                    className={`p-2.5 rounded-lg text-[10px] leading-relaxed border ${
                      fadingScore.score >= 8
                        ? "bg-[#edf6f3] border-[#a3e2cf] text-[#087e7c] font-medium"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="font-bold">
                      Kết quả đánh giá: {fadingScore.score} / {fadingScore.maxScore} điểm
                    </div>
                    <div>{fadingScore.feedback}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Socratic Helper Mascot Button */}
          {onAskTutor && (
            <div className="pt-2 border-t border-[#d9e4e2] mt-auto">
              <button
                onClick={() =>
                  onAskTutor(
                    `Linh vật giúp em ở Bước ${currentStep + 1} (${STEP_NAMES[currentStep]}): ${meta.title}`
                  )
                }
                className="w-full py-2 bg-[#f4f7f6] hover:bg-[#e2f1ec] text-[#087e7c] border border-[#d9e4e2] rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🦉</span> Hỏi trợ lý Socratic TES
              </button>
            </div>
          )}
        </aside>

        {/* CỘT 2: KHUNG MÔ PHỎNG & VẼ GEOGEBRA (SCENE-SIDE) */}
        <section className={`bg-white border border-[#d9e4e2] rounded-xl overflow-hidden flex-col shadow-sm ${
          isFullscreenScene ? "fixed inset-2 z-50 flex shadow-2xl" : activeMobileTab === "scene" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Thanh công cụ vẽ Geogebra & 3D (Scene Toolbar) */}
          <div className="bg-white border-b border-[#d9e4e2] p-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              {moduleId === "linear_programming" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setInvertFilling((v) => !v);
                      showToast(!invertFilling ? "Chế độ GeoGebra: Đã tô màu miền nghiệm." : "Chuẩn SGK KNTT: Gạch sọc phần sai, giữ trắng miền đúng.");
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all border ${
                      !invertFilling
                        ? "bg-[#087e7c] text-white border-[#087e7c]"
                        : "bg-white text-[#087e7c] border-[#bed0cd] hover:bg-gray-50"
                    }`}
                    title="Chuyển đổi chuẩn SGK KNTT (gạch sọc miền sai) và chuẩn GeoGebra (tô màu miền đúng)"
                  >
                    {!invertFilling ? "🌓 SGK KNTT: Gạch sai" : "🌓 GeoGebra: Tô đúng"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCounterExampleActive((v) => !v);
                      showToast(!counterExampleActive ? "Đã ghim điểm phản ví dụ đỏ P(1; 0)!" : "Đã ẩn điểm phản ví dụ.");
                    }}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all border ${
                      counterExampleActive
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
                    }`}
                    title="Ghim chấm đỏ phản ví dụ P(1; 0) bộc lộ mâu thuẫn"
                  >
                    🎯 Phản ví dụ đỏ P
                  </button>
                </>
              )}
              {moduleId === "spatial_geometry" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnfolded((v) => !v);
                      showToast(!isUnfolded ? "📂 Đã khai triển phẳng 4 mặt bên trên Oxy." : "Đã gấp lại thành khối chóp 3D.");
                    }}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all border ${
                      isUnfolded
                        ? "bg-[#087e7c] text-white border-[#087e7c]"
                        : "bg-white text-[#087e7c] border-[#bed0cd] hover:bg-gray-50"
                    }`}
                    title="Khai triển phẳng ↔ Gấp khối 3D"
                  >
                    📂 {isUnfolded ? "Gấp khối 3D" : "Khai triển phẳng"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCamera({ yaw: 0, pitch: 0, zoom: 1.15, panX: 0, panY: 0 });
                      showToast("Đã xoay trực giao: Bộc lộ rõ 2 đường chéo nhau ở 2 độ cao khác nhau!");
                    }}
                    className="px-2 py-1 rounded-lg font-bold text-[11px] bg-white text-gray-700 border border-[#bed0cd] hover:bg-gray-50"
                    title="Xoay trực giao để bộc lộ khoảng cách giữa hai đường chéo nhau"
                  >
                    📐 Xoay trực giao
                  </button>
                </>
              )}
              <button
                onClick={() => setToolMode("move")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  toolMode === "move"
                    ? "bg-[#dbf3e9] text-[#087e7c] border border-[#087e7c]"
                    : "bg-white text-[#63777c] border border-[#d9e4e2] hover:bg-gray-50"
                }`}
                title="Kéo điểm vàng hoặc kéo mặt phẳng"
              >
                📍 Kéo điểm
              </button>
              <button
                onClick={() => setToolMode("rotate")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  toolMode === "rotate"
                    ? "bg-[#dbf3e9] text-[#087e7c] border border-[#087e7c]"
                    : "bg-white text-[#63777c] border border-[#d9e4e2] hover:bg-gray-50"
                }`}
                title="Xoay góc nhìn 3D hoặc di chuyển hệ trục"
              >
                🔄 Xoay / dịch
              </button>
              <button
                onClick={() =>
                  setCamera((c) => ({ ...c, zoom: Math.min(3.5, c.zoom * 1.2) }))
                }
                className="px-2 py-1 bg-white border border-[#d9e4e2] rounded-lg font-bold text-[#63777c] hover:bg-gray-50"
                title="Phóng to"
              >
                ＋
              </button>
              <button
                onClick={() =>
                  setCamera((c) => ({ ...c, zoom: Math.max(0.4, c.zoom / 1.2) }))
                }
                className="px-2 py-1 bg-white border border-[#d9e4e2] rounded-lg font-bold text-[#63777c] hover:bg-gray-50"
                title="Thu nhỏ"
              >
                −
              </button>
              <button
                onClick={() =>
                  setCamera({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 })
                }
                className="px-2 py-1 bg-white border border-[#d9e4e2] rounded-lg text-[11px] text-[#63777c] hover:bg-gray-50"
                title="Về góc nhìn chuẩn"
              >
                Góc chuẩn
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSnapshot}
                className="px-2.5 py-1 bg-white border border-[#d9e4e2] rounded-lg text-[11px] font-semibold text-[#152f35] hover:bg-gray-50 flex items-center gap-1"
                title="Lưu ảnh mô hình dạng PNG"
              >
                <span>📷</span> Chụp hình
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenScene((v) => !v)}
                className="px-2.5 py-1 bg-white border border-[#d9e4e2] rounded-lg text-[11px] font-semibold text-[#152f35] hover:bg-gray-100 flex items-center gap-1"
                title={isFullscreenScene ? "Thu nhỏ mô phỏng" : "Phóng to toàn màn hình"}
              >
                <span>{isFullscreenScene ? "✕" : "⛶"}</span>
                <span>{isFullscreenScene ? "Thu nhỏ" : "Toàn màn hình"}</span>
              </button>
              <button
                onClick={() => setToolMode(toolMode === "ar" ? "move" : "ar")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  toolMode === "ar"
                    ? "bg-[#dc2626] text-white animate-pulse"
                    : "bg-[#087e7c] text-white hover:bg-[#066563]"
                }`}
                title="Xem mô hình 3D trên mặt bàn học thực tế"
              >
                <span>📱</span> {toolMode === "ar" ? "Thoát AR" : "AR trên bàn"}
              </button>
            </div>
          </div>

          {/* Khung Canvas hoặc Màn hình AR */}
          <div className="flex-1 relative flex items-center justify-center bg-[#edf3f2] overflow-hidden min-h-[360px]">
            {toolMode === "ar" ? (
              /* AR Classroom Simulation on Desk */
              <div className="w-full h-full p-4 flex flex-col items-center justify-between bg-gradient-to-b from-[#292524] to-[#1c1917] text-white">
                <div className="w-full flex justify-between items-center text-[11px]">
                  <span className="text-[#adf0d6] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    AR Classroom Mode · Không gian thực tế tăng cường
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">Mặt bàn: Đã cố định</span>
                </div>

                <div className="relative w-full max-w-md h-56 rounded-2xl bg-gradient-to-t from-[#451a03] via-[#78350f] to-[#1c1917] flex items-center justify-center border border-amber-900/60 shadow-inner overflow-hidden">
                  {/* Perspective Desk Grid */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                      transform: `perspective(350px) rotateX(${arTilt}deg)`,
                    }}
                  />
                  {/* AR Reticle */}
                  <div className="absolute w-40 h-20 rounded-[50%] border border-teal-400/60 border-dashed animate-spin pointer-events-none" />

                  {/* 3D Model Scaled */}
                  <div
                    className="relative z-10 flex flex-col items-center transition-transform"
                    style={{ transform: `scale(${arScale})` }}
                  >
                    <svg viewBox="0 0 160 140" className="w-36 h-32 drop-shadow-2xl">
                      <polygon
                        points="80,15 30,110 130,110"
                        fill="#14b8a6"
                        fillOpacity="0.65"
                        stroke="#5eead4"
                        strokeWidth="2"
                      />
                      <line
                        x1="80"
                        y1="15"
                        x2="80"
                        y2="110"
                        stroke="#f87171"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      <ellipse
                        cx="80"
                        cy="110"
                        rx="50"
                        ry="12"
                        fill="#0d9488"
                        fillOpacity="0.75"
                        stroke="#2dd4bf"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="text-[10px] font-bold text-amber-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      {meta.title} trên mặt bàn
                    </span>
                  </div>
                </div>

                {/* AR Adjusters */}
                <div className="w-full max-w-md flex items-center justify-between text-xs gap-4 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-300">Nghiêng bàn:</span>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={arTilt}
                      onChange={(e) => setArTilt(parseInt(e.target.value))}
                      className="w-20 accent-teal-400"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-300">Thu phóng:</span>
                    <button
                      onClick={() => setArScale((s) => Math.max(0.6, s - 0.1))}
                      className="px-2 bg-gray-800 rounded font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-teal-300">{(arScale * 100).toFixed(0)}%</span>
                    <button
                      onClick={() => setArScale((s) => Math.min(1.8, s + 0.1))}
                      className="px-2 bg-gray-800 rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : meta.is3D ? (
              <Stereometry3DCanvas
                foldPercent={foldPercent}
                onFoldPercentChange={(val) => {
                  setFoldPercent(val);
                  setIsUnfolded(val < 50);
                }}
                apexHeight={params.h || 2.6}
                onApexHeightChange={(h) => updateParam("h", h)}
                orthogonalView={orthogonalView}
                onToggleOrthogonalView={() => setOrthogonalView((v) => !v)}
              />
            ) : moduleId === "linear_programming" ? (
              <Interactive2DMathCanvas
                lines={boundaryLines}
                vertices={polygonVertices}
                objectiveCoeffs={{ a: params.u || 3, b: params.v || 2 }}
                objectiveValue={typeof params.F === "number" ? params.F : 24}
                onObjectiveValueChange={(val) => updateParam("F", val)}
                testPoint={{ x: params.x ?? 2, y: params.y ?? 3 }}
                onTestPointChange={(pt) => {
                  updateParam("x", pt.x);
                  updateParam("y", pt.y);
                }}
                isSgkMode={!invertFilling}
                onToggleSgkMode={() => setInvertFilling((v) => !v)}
                visualCounterExample={
                  counterExampleActive || currentStep === 3 || currentStep === 4
                    ? { x: 1, y: 0, text: "-1 + 2(0) = -1 > 4 (Sai!)" }
                    : null
                }
              />
            ) : (
              /* High-Performance Canvas Fallback for Venn / Parabola / Calculus */
              <canvas
                ref={canvasRef}
                width={700}
                height={450}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
              />
            )}
          </div>

          {/* Thanh chỉ số toán học thời gian thực (Live Metrics Bar) */}
          <div className="bg-white border-t border-[#d9e4e2] p-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            {metricsBadges.map((badge, idx) => (
              <span
                key={idx}
                className="bg-[#edf5f2] text-[#152f35] font-semibold px-2.5 py-1 rounded-lg border border-[#d9e4e2] text-[11px]"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* CỘT 3: BẢNG THAM SỐ & DỰNG HÌNH (CONTROLS-SIDE) */}
        <aside className="bg-white border border-[#d9e4e2] rounded-xl p-3.5 flex flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto text-xs text-[#152f35]">
          <div className="border-b border-[#d9e4e2] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087e7c]">
              BẢNG ĐIỀU KHIỂN & DỰNG HÌNH
            </span>
            <h3 className="text-xs font-bold mt-1 text-[#152f35]">Tham số mô hình</h3>
          </div>

          {/* Parameter Sliders with exact Number inputs */}
          <div className="space-y-3">
            {moduleId === "linear_programming" && (
              <>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Điểm thử M (x):</span>
                    <span className="font-mono text-[#087e7c]">{params.x}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-2"
                      max="7"
                      step="0.5"
                      value={params.x || 2}
                      onChange={(e) => updateParam("x", parseFloat(e.target.value))}
                      className="flex-1 accent-[#087e7c]"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={params.x || 2}
                      onChange={(e) => updateParam("x", parseFloat(e.target.value) || 0)}
                      className="w-14 p-1 border border-[#bed0cd] rounded text-right font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Điểm thử M (y):</span>
                    <span className="font-mono text-[#087e7c]">{params.y}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-2"
                      max="7"
                      step="0.5"
                      value={params.y || 3}
                      onChange={(e) => updateParam("y", parseFloat(e.target.value))}
                      className="flex-1 accent-[#087e7c]"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={params.y || 3}
                      onChange={(e) => updateParam("y", parseFloat(e.target.value) || 0)}
                      className="w-14 p-1 border border-[#bed0cd] rounded text-right font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Đường mức F = k:</span>
                    <span className="font-mono text-[#b87439]">{params.k}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="0.5"
                      value={params.k || 12}
                      onChange={(e) => updateParam("k", parseFloat(e.target.value))}
                      className="flex-1 accent-[#b87439]"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={params.k || 12}
                      onChange={(e) => updateParam("k", parseFloat(e.target.value) || 0)}
                      className="w-14 p-1 border border-[#bed0cd] rounded text-right font-mono text-xs"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={showIntegerPoints}
                    onChange={(e) => setShowIntegerPoints(e.target.checked)}
                    className="accent-[#087e7c]"
                  />
                  <span>Hiện lưới điểm nguyên (Lattice Points)</span>
                </label>

                <div className="pt-2 border-t border-[#d9e4e2] flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#152f35]">Hệ ràng buộc ({constraints.length}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConstraints(DEFAULT_CONSTRAINTS);
                      showToast("Đã khôi phục hệ ràng buộc chuẩn SGK!");
                    }}
                    className="text-[10px] text-[#087e7c] hover:underline font-bold"
                  >
                    Khôi phục hệ mẫu
                  </button>
                </div>
              </>
            )}

            {moduleId === "spatial_geometry" && (
              <>
                {/* Chọn loại khối đa diện 3D */}
                <div>
                  <span className="text-[10px] font-bold text-[#63777c] block mb-1">Kiểu khối 3D:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: "pyramid", label: "Chóp S" },
                        { id: "prism", label: "Lăng trụ" },
                        { id: "frustum", label: "Chóp cụt" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSolidType(t.id)}
                        className={`py-1 text-[10px] rounded font-bold border transition-colors ${
                          solidType === t.id
                            ? "bg-[#087e7c] text-white border-[#087e7c]"
                            : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-[#e2f1ec]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn trục kéo đỉnh */}
                <div>
                  <span className="text-[10px] font-bold text-[#63777c] block mb-1">Trục kéo đỉnh:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["x", "y", "z"] as const).map((ax) => (
                      <button
                        key={ax}
                        type="button"
                        onClick={() => setSelectedAxis(ax)}
                        className={`py-0.5 text-[10px] rounded font-mono font-bold border uppercase transition-colors ${
                          selectedAxis === ax
                            ? "bg-[#152f35] text-white border-[#152f35]"
                            : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-gray-100"
                        }`}
                      >
                        Trục {ax}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Chiều cao chóp h (SA):</span>
                    <span className="font-mono text-[#087e7c]">{params.h}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.2"
                      value={params.h || 3}
                      onChange={(e) => updateParam("h", parseFloat(e.target.value))}
                      className="flex-1 accent-[#087e7c]"
                    />
                    <input
                      type="number"
                      step="0.2"
                      value={params.h || 3}
                      onChange={(e) => updateParam("h", parseFloat(e.target.value) || 0)}
                      className="w-14 p-1 border border-[#bed0cd] rounded text-right font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Độ xiên đỉnh S (x):</span>
                    <span className="font-mono text-[#087e7c]">{params.x}</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={params.x || 0}
                    onChange={(e) => updateParam("x", parseFloat(e.target.value))}
                    className="w-full accent-[#087e7c]"
                  />
                </div>

                {/* 3D Camera Quick View Angles */}
                <div className="pt-2 border-t border-[#d9e4e2]">
                  <span className="text-[10px] font-bold text-[#63777c] block mb-1.5">
                    Góc nhìn nhanh 3D:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCamera({ yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0 })}
                      className="py-1 bg-[#f3f6f5] hover:bg-[#e2f1ec] rounded border border-[#d9e4e2] text-[10px] font-bold"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() =>
                        setCamera({ yaw: 0, pitch: 1.55, zoom: 1, panX: 0, panY: 0 })
                      }
                      className="py-1 bg-[#f3f6f5] hover:bg-[#e2f1ec] rounded border border-[#d9e4e2] text-[10px] font-bold"
                    >
                      Trên
                    </button>
                    <button
                      onClick={() =>
                        setCamera({ yaw: Math.PI / 2, pitch: 0, zoom: 1, panX: 0, panY: 0 })
                      }
                      className="py-1 bg-[#f3f6f5] hover:bg-[#e2f1ec] rounded border border-[#d9e4e2] text-[10px] font-bold"
                    >
                      Bên
                    </button>
                  </div>
                </div>
              </>
            )}

            {moduleId === "trigonometry" && (
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Góc quay θ (°):</span>
                  <span className="font-mono text-[#087e7c]">{params.t}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={params.t || 60}
                    onChange={(e) => updateParam("t", parseFloat(e.target.value))}
                    className="flex-1 accent-[#087e7c]"
                  />
                  <input
                    type="number"
                    step="5"
                    value={params.t || 60}
                    onChange={(e) => updateParam("t", parseFloat(e.target.value) || 0)}
                    className="w-14 p-1 border border-[#bed0cd] rounded text-right font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {moduleId === "functions" && (
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Tiếp điểm x₀:</span>
                  <span className="font-mono text-[#dc2626]">{params.x0}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={params.x0 || 0.5}
                  onChange={(e) => updateParam("x0", parseFloat(e.target.value))}
                  className="w-full accent-[#dc2626]"
                />
              </div>
            )}

            {moduleId === "calculus" && (
              <>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Số dải Riemann N:</span>
                    <span className="font-mono text-[#087e7c]">{params.n}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="24"
                    step="2"
                    value={params.n || 8}
                    onChange={(e) => updateParam("n", parseFloat(e.target.value))}
                    className="w-full accent-[#087e7c]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>Cận phải b:</span>
                    <span className="font-mono text-[#087e7c]">{params.b}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.2"
                    value={params.b || 3}
                    onChange={(e) => updateParam("b", parseFloat(e.target.value))}
                    className="w-full accent-[#087e7c]"
                  />
                </div>
              </>
            )}

            {moduleId === "probability" && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const next = Math.floor(Math.random() * 6) + 1;
                    updateParam("lastDice", next);
                    updateParam("rolls", (params.rolls || 30) + 1);
                    showToast(`🎲 Đã gieo ra mặt ${next}!`);
                  }}
                  className="w-full py-2 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563]"
                >
                  🎲 Gieo xúc xắc thực nghiệm
                </button>
              </div>
            )}

            {moduleId === "conics_and_solids" && (
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Góc cắt β (°):</span>
                  <span className="font-mono text-[#087e7c]">{params.beta}°</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="2"
                  value={params.beta || 55}
                  onChange={(e) => updateParam("beta", parseFloat(e.target.value))}
                  className="w-full accent-[#087e7c]"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-[#d9e4e2] space-y-1.5 mt-auto">
            <button
              onClick={handleRecordObservation}
              className="w-full py-1.5 bg-[#f3f6f5] hover:bg-[#e2f1ec] text-[#087e7c] border border-[#d9e4e2] rounded-lg font-bold text-[11px] flex items-center justify-center gap-1"
            >
              <span>📌</span> Ghi cấu hình quan sát
            </button>
          </div>
        </aside>
      </div>

      {/* 4. THANH ĐIỀU HƯỚNG DƯỚI (BOTTOM NAVIGATION) */}
      <div className="bg-white border-t border-[#d9e4e2] px-4 py-2 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="px-3 py-1.5 rounded-lg border border-[#d9e4e2] text-[#152f35] font-bold hover:bg-[#f3f6f5] disabled:opacity-40 transition-colors"
        >
          ← Bước trước
        </button>

        <span className="text-[11px] text-[#63777c] font-medium">
          Bước {currentStep + 1} / {STEP_NAMES.length} · {STEP_NAMES[currentStep]}
        </span>

        <button
          onClick={handleNextStep}
          className="px-4 py-1.5 rounded-lg bg-[#087e7c] text-white font-bold hover:bg-[#066563] transition-colors shadow-sm"
        >
          {currentStep === 7 ? "Hoàn thành trạm ✓" : "Bước tiếp →"}
        </button>
      </div>

      {/* 5. MODAL SỔ KHÁM PHÁ & LƯU VẾT HỌC TẬP (EVIDENCE MODAL) */}
      {evidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#08232999] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-[#d9e4e2] flex flex-col max-h-[85vh] text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#d9e4e2]">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h3 className="font-bold text-sm text-[#152f35]">
                  Sổ khám phá & Dấu vết học tập ({evidenceHistory.length})
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {evidenceHistory.length === 0 ? (
                <p className="text-center py-6 text-gray-400">
                  Chưa có bằng chứng nào. Hãy hoàn thành các bước trên mô phỏng để tự động lưu vết!
                </p>
              ) : (
                evidenceHistory.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#f3f6f5] border border-[#d9e4e2] rounded-xl space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold text-[#087e7c]">
                      <span>{rec.stepName}</span>
                      <span className="text-[10px] text-gray-400 font-mono font-normal">
                        {rec.completedAt}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{rec.summary}</p>
                  </div>
                ))
              )}
            </div>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportEvidenceJson}
              accept=".json"
              style={{ display: "none" }}
            />

            <div className="pt-3 border-t border-[#d9e4e2] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportEvidenceJson}
                  className="px-3 py-1.5 rounded-lg border border-[#d9e4e2] bg-[#f8faf9] text-[#152f35] font-bold text-[11px] hover:bg-[#e2f1ec] flex items-center gap-1 transition-colors"
                  title="Tải toàn bộ bằng chứng về máy dưới dạng JSON"
                >
                  <span>💾</span> Xuất JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-[#d9e4e2] bg-[#f8faf9] text-[#152f35] font-bold text-[11px] hover:bg-[#e2f1ec] flex items-center gap-1 transition-colors"
                  title="Nhập file JSON để khôi phục tiến trình"
                >
                  <span>📂</span> Nhập JSON
                </button>
              </div>

              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="px-4 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563]"
              >
                Đóng sổ khám phá
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 6. MODAL DANH MỤC 48 TRẠM HỌC TOÀN DIỆN */}
      <StationCatalogModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        currentStationId={stationId}
        onSelectStation={(st) => {
          if (onSelectStation) {
            onSelectStation(st);
          }
          showToast(`📚 Đã chuyển sang trạm ${st.id}: ${st.title}`);
        }}
      />

      {/* 7. MODAL XEM TRƯỚC VÀ IN PHIẾU HỌC TẬP A4 */}
      <WorksheetPrintModal
        isOpen={worksheetModalOpen}
        onClose={() => setWorksheetModalOpen(false)}
        station={{
          id: stationId || (meta.is3D ? "3D" : "2D"),
          title: meta.title,
          source: meta.source,
          goal: meta.goal,
          simulation: meta.simulation,
          is3D: meta.is3D,
        }}
        canvasSnapshotUrl={canvasSnapshotUrl}
        predictionText={prediction}
        reasonText={reason}
        observations={observations}
        quizQuestion={QUIZ_DATA[moduleId]}
        transferProblem={currentProblem}
        metricsSummary={metricsBadges}
      />
    </div>
  );
}
