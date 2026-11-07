"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { verifyAnswer } from "../lib/miniCas";
import StationCatalogModal from "./StationCatalogModal";
import WorksheetPrintModal from "./WorksheetPrintModal";
import { StationItem, getStationById } from "../lib/stationCatalogData";
import { loadStationState, saveStationState, clearStationState, ActivityLogEntry } from "../lib/useStationStorage";
import { generateIsomorphicIntegerProblem, IntegerProblem } from "../lib/integerVertexGenerator";
import Interactive2DMathCanvas, { BoundaryLine, PolygonVertex } from "./Interactive2DMathCanvas";
import Stereometry3DCanvas from "./Stereometry3DCanvas";
import NaturalLanguageGeometryPanel from "./NaturalLanguageGeometryPanel";
import Geometry3DViewer from "./Geometry3DViewer";
import {
  resolveGeometrySolid,
  GEOMETRY_PRESET_TEMPLATES,
  ResolvedGeometryScene,
} from "../lib/geometrySolver";
import { ParsedGeometrySolid } from "../lib/geometryParserPrompt";
import TrigonometricCircleCanvas, { SPECIAL_ANGLES } from "./TrigonometricCircleCanvas";
import DynamicLinearProgrammingLab from "./dynamic-math/DynamicLinearProgrammingLab";
import DynamicSpatialGeometryLab from "./dynamic-math/DynamicSpatialGeometryLab";
import DynamicTrigonometryLab from "./dynamic-math/DynamicTrigonometryLab";
import DynamicFunctionsLab from "./dynamic-math/DynamicFunctionsLab";
import DynamicCalculusLab from "./dynamic-math/DynamicCalculusLab";
import DynamicProbabilityLab from "./dynamic-math/DynamicProbabilityLab";
import DynamicConicsLab from "./dynamic-math/DynamicConicsLab";
import DynamicParameterDock from "./dynamic-math/DynamicParameterDock";
import KatexMath, { formatVNFloat } from "./KatexMath";
import {
  MoreVertical,
  RotateCcw,
  Activity,
  SlidersHorizontal,
  Calculator,
  Compass,
  GraduationCap,
  FileText,
  Camera,
  Printer,
  Share2,
  BookOpen,
  Target,
  Lightbulb,
  BookmarkCheck,
  AlertTriangle,
  RefreshCw,
  Building,
  Bot,
  Search,
  Lock,
  Download,
  Upload,
  Sparkles,
  Wand2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

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
  initialStep?: number;
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

// Bối cảnh bài toán thực tế chuẩn SGK Kết nối tri thức cho từng trạm cốt lõi
export interface RealWorldProblem {
  title: string;
  source: string;
  context: string;
  objectiveText: string;
  matrixHeaders: string[];
  matrixRows: Array<{ label: string; col1: string; col2: string; limit: string }>;
  optimalSummary: string;
}

const REAL_WORLD_PROBLEMS: Record<string, RealWorldProblem> = {
  "10.03": {
    title: "TỐI ƯU HÓA LỢI NHUẬN XƯỞNG MỘC",
    source: "SGK Toán 10 KNTT Bài 4, Trang 26-29",
    context: "Một xưởng mộc sản xuất x chiếc bàn và y chiếc ghế (x, y ∈ ℕ). Khâu lắp ráp có tối đa 24 giờ công (mỗi bàn cần 1.5h, mỗi ghế cần 1h => 3x + 2y ≤ 48). Khâu hoàn thiện có tối đa 32 giờ công (mỗi bàn cần 1h, mỗi ghế cần 2h => x + 2y ≤ 32). Mỗi chiếc bàn mang lại tiền lãi 600 nghìn đồng, mỗi chiếc ghế mang lại tiền lãi 450 nghìn đồng.",
    objectiveText: "Xác định kế hoạch sản xuất (x; y) để tổng tiền lãi F(x; y) = 600x + 450y đạt giá trị lớn nhất.",
    matrixHeaders: ["Công đoạn", "1 Bàn (x)", "1 Ghế (y)", "Quỹ thời gian tối đa"],
    matrixRows: [
      { label: "Khâu Lắp ráp", col1: "1.5 giờ", col2: "1.0 giờ", limit: "24 giờ (3x + 2y ≤ 48)" },
      { label: "Khâu Hoàn thiện", col1: "1.0 giờ", col2: "2.0 giờ", limit: "32 giờ (x + 2y ≤ 32)" },
      { label: "Lợi nhuận", col1: "600.000 đ", col2: "450.000 đ", limit: "F = 600x + 450y (nghìn đồng)" },
    ],
    optimalSummary: "Phương án tối ưu: Đỉnh B(8; 12) => Sản xuất 8 bàn và 12 ghế => Lợi nhuận cực đại 10.200.000 đ.",
  },
  "10.02": {
    title: "BẤT PHƯƠNG TRÌNH & NỬA MẶT PHẲNG BỜ d",
    source: "SGK Toán 10 KNTT Bài 3, Trang 22-25",
    context: "Một nhân viên giao hàng có tổng trọng lượng hàng x và y không vượt quá 6 kg theo quy định an toàn: 2x + y ≤ 6. Cần xác định các tổ hợp (x; y) hợp lệ và gạch bỏ phần vi phạm trên mặt phẳng tọa độ.",
    objectiveText: "Lấy điểm thử O(0; 0) để nhận biết nửa mặt phẳng chứa nghiệm và quy ước gạch miền loại.",
    matrixHeaders: ["Thông số", "Quy định", "Ý nghĩa hình học"],
    matrixRows: [
      { label: "Đường biên d", col1: "2x + y = 6", col2: "Bờ phân chia 2 nửa mặt phẳng", limit: "Nét liền (lấy bờ)" },
      { label: "Điểm thử O(0; 0)", col1: "2(0) + 0 = 0 ≤ 6", col2: "Mệnh đề ĐÚNG", limit: "Nửa mặt phẳng chứa O là nghiệm" },
    ],
    optimalSummary: "Gạch bỏ nửa mặt phẳng không chứa gốc O(0; 0); giữ trắng miền nghiệm.",
  },
  "11.06": {
    title: "THIẾT KẾ MÁI CHE THÁP CANH S.ABCD",
    source: "SGK Hình học 11 KNTT Bài 11, Trang 78-83",
    context: "Thiết kế mô hình mái che sân trường hình chóp tứ giác đều S.ABCD. Đáy ABCD là hình vuông cạnh a = 3 m. Chiều cao thẳng đứng SH = h thay đổi từ 1.5 m đến 4.0 m để tối ưu khả năng thoát nước mưa và diện tích bạt che.",
    objectiveText: "Quan sát phối cảnh 3D; phân biệt quy ước cạnh thấy (nét liền) và cạnh khuất (nét đứt) khi xoay mô hình.",
    matrixHeaders: ["Bộ phận", "Kích thước", "Quy ước biểu diễn"],
    matrixRows: [
      { label: "Đáy ABCD", col1: "3.0 m x 3.0 m", col2: "Hình vuông nằm ngang", limit: "Các cạnh nhìn thấy hoặc khuất" },
      { label: "Chiều cao SH", col1: "1.5 - 4.0 m", col2: "SH ⊥ (ABCD)", limit: "Nét đứt màu đỏ hồng (cạnh khuất)" },
      { label: "Thể tích V", col1: "V = (1/3) a² h", col2: "Dung tích không gian mái", limit: "Tự động tính theo thời gian thực" },
    ],
    optimalSummary: "Thuật toán Back-face Culling tự động chuyển nét đứt cho các cạnh khuất khi xoay camera.",
  },
  "11.07": {
    title: "KHAI TRIỂN PHẲNG ↔ GẤP KHỐI ĐA DIỆN",
    source: "SGK Hình học 11 KNTT Bài 12, Trang 84-88",
    context: "Kỹ thuật cắt may bạt che và gấp khối đa diện: 4 mặt tam giác bên SAB, SBC, SCD, SDA của hình chóp được xoay bản lề quanh 4 cạnh đáy để trải phẳng hoàn toàn trên mặt đất.",
    objectiveText: "Quan sát góc giữa mặt bên và mặt đáy khi kéo thanh trượt từ 100% về 0%.",
    matrixHeaders: ["Trạng thái", "Thao tác", "Mục tiêu sư phạm"],
    matrixRows: [
      { label: "Gấp khối 100%", col1: "Khối chóp 3D", col2: "4 đỉnh S chụm tại đỉnh chung", limit: "Quan sát hình học không gian" },
      { label: "Khai triển 0%", col1: "Bản vẽ phẳng 2D", col2: "4 đỉnh S trải ra 4 hướng", limit: "Tính diện tích toàn phần chính xác" },
    ],
    optimalSummary: "Liên kết trực quan giữa bản vẽ kỹ thuật 2D và mô hình vật lý 3D trong không gian.",
  },
  "11.01": {
    title: "CHUYỂN ĐỘNG TRÒN ĐỀU & ĐƯỜNG TRÒN LƯỢNG GIÁC",
    source: "SGK Toán 11 KNTT Bài 1, Trang 5-16",
    context: "Mô phỏng vị trí của tay máy tự động hoặc vệ tinh viễn thông chuyển động tròn đều trên đường tròn lượng giác đơn vị bán kính R = 1. Góc quay α thay đổi liên tục từ 0° đến 360°.",
    objectiveText: "Liên hệ trực quan tọa độ điểm M(cos α; sin α) với các giá trị lượng giác.",
    matrixHeaders: ["Đại lượng", "Giá trị hình học", "Ý nghĩa"],
    matrixRows: [
      { label: "Hoành độ Ox", col1: "cos α", col2: "Đoạn hình chiếu trên trục hoành", limit: "Mang dấu âm ở góc phần tư II, III" },
      { label: "Tung độ Oy", col1: "sin α", col2: "Đoạn hình chiếu trên trục tung", limit: "Mang dấu dương ở góc phần tư I, II" },
    ],
    optimalSummary: "Bản chất hình học của lượng giác: Tọa độ điểm ngọn của cung trên đường tròn đơn vị.",
  },
  "12.01": {
    title: "KHẢO SÁT BIẾN THIÊN HÀM SỐ & TỐI ƯU HÓA CHI PHÍ",
    source: "SGK Toán 12 KNTT Chương 1 Bài 1 & 2, Trang 5-20",
    context: "Khảo sát hàm bậc ba y = ax³ + bx² + cx + d và hàm phân thức y = (ax + b)/(cx + d). Khám phá mối liên hệ giữa dấu đạo hàm f'(x) với tính đồng biến, nghịch biến, xác định tọa độ các điểm cực trị, phương trình tiếp tuyến tại tiếp điểm M và số giao điểm với đường thẳng y = m.",
    objectiveText: "Kéo các tham số a, b, c, d và m để quan sát bảng biến thiên 2 chiều biến đổi đồng bộ theo thời gian thực và đếm số nghiệm.",
    matrixHeaders: ["Đại lượng", "Công thức / Giá trị", "Ý nghĩa hình học"],
    matrixRows: [
      { label: "Đạo hàm f'(x)", col1: "f'(x) = 3ax² + 2bx + c", col2: "Dấu f'(x) quyết định đồng biến / nghịch biến", limit: "f'(x) = 0 cho hoành độ cực trị" },
      { label: "Đường thẳng y = m", col1: "y = m (đường song song Ox)", col2: "Tương giao đồ thị tìm số nghiệm", limit: "Tự động đổi màu điểm giao" },
      { label: "Bảng biến thiên", col1: "2 chiều tương tác", col2: "Hover dòng nào sáng đồ thị vùng đó", limit: "Cực đại, cực tiểu, vô cực" },
    ],
    optimalSummary: "Bảng biến thiên động 2 chiều liên kết trực tiếp với hình dạng đồ thị và phương trình f'(x) = 0.",
  },
  "12.08": {
    title: "TÍCH PHÂN RIEMANN & THỂ TÍCH KHỐI TRÒN XOAY 3D",
    source: "SGK Toán 12 KNTT Chương 4 Bài 12 & 13, Trang 18-28",
    context: "Bài toán xấp xỉ diện tích hình phẳng giới hạn bởi đường cong y = f(x) trên đoạn [a, b] bằng tổng tích phân Riemann với n dải chữ nhật (n chạy từ 2 đến 100). Sau đó quay hình phẳng này quanh trục hoành Ox với góc quay θ từ 0° đến 360° để tạo khối tròn xoay 3D và tính thể tích theo phương pháp lát cắt đĩa tròn (Disk Method).",
    objectiveText: "Kéo số dải n để quan sát sai số Δ tiến về 0, và kéo góc quay θ để quan sát thể tích khối tròn xoay 3D hình thành.",
    matrixHeaders: ["Thành phần", "Công thức vi phân", "Ý nghĩa trực quan"],
    matrixRows: [
      { label: "Tổng Riemann", col1: "S_n = Σ f(x_i) Δx", col2: "Xấp xỉ tổng diện tích n dải chữ nhật", limit: "n càng lớn, sai số càng nhỏ" },
      { label: "Tích phân xác định", col1: "∫[a→b] f(x) dx", col2: "Giới hạn diện tích chính xác", limit: "Tô màu miền diện tích" },
      { label: "Khối tròn xoay 3D", col1: "V = π ∫[a→b] f(x)² dx", col2: "Quay lát cắt đĩa quanh Ox (0° - 360°)", limit: "Dựng mesh 3D chiếu sáng" },
    ],
    optimalSummary: "Diện tích chính xác là giới hạn của tổng Riemann khi n → ∞; thể tích là tích phân các lát cắt tròn.",
  },
  "12.12": {
    title: "XÁC SUẤT CÓ ĐIỀU KIỆN, SƠ ĐỒ CÂY & CÔNG THỨC BAYES",
    source: "SGK Toán 12 KNTT Chương 6 Bài 18 & 19, Trang 70-85",
    context: "Thực nghiệm mô hình 2 hộp bi (hoặc xét nghiệm y tế chẩn đoán xác suất). Hộp 1 có R1 bi đỏ và B1 bi xanh; Hộp 2 có R2 bi đỏ và B2 bi xanh. Chọn ngẫu nhiên một hộp với xác suất p1 và p2, sau đó rút 1 viên bi. Tính xác suất để rút được bi đỏ P(Đỏ) và tính xác suất hậu nghiệm P(Hộp 1 | Đỏ) bằng công thức Bayes.",
    objectiveText: "Thay đổi số bi đỏ/xanh ở 2 hộp bằng thanh trượt để quan sát sơ đồ cây 2 tầng cập nhật tức thời xác suất toàn phần và xác suất Bayes.",
    matrixHeaders: ["Đại lượng", "Công thức xác suất", "Giá trị tính toán"],
    matrixRows: [
      { label: "Xác suất toàn phần", col1: "P(Đỏ) = P(H1)·P(Đ|H1) + P(H2)·P(Đ|H2)", col2: "Tổng xác suất của 2 nhánh dẫn tới bi đỏ", limit: "Cập nhật thời gian thực" },
      { label: "Công thức Bayes", col1: "P(H1|Đỏ) = [P(H1)·P(Đ|H1)] / P(Đỏ)", col2: "Xác suất hậu nghiệm khi biết trước kết quả", limit: "Tỉ số nhánh 1 trên tổng" },
      { label: "Luật số lớn", col1: "Gieo xúc xắc N lần", col2: "Tần suất thực nghiệm tiến dần về 1/6", limit: "Biểu đồ đường hội tụ" },
    ],
    optimalSummary: "Công thức Bayes suy ngược nguyên nhân từ kết quả quan sát; sơ đồ cây trực quan hóa các nhánh biến cố.",
  },
  linear_programming: {
    title: "TỐI ƯU HÓA LỢI NHUẬN XƯỞNG MỘC",
    source: "SGK Toán 10 KNTT Bài 4, Trang 26-29",
    context: "Một xưởng mộc sản xuất x chiếc bàn và y chiếc ghế (x, y ∈ ℕ). Khâu lắp ráp có tối đa 24 giờ công (mỗi bàn cần 1.5h, mỗi ghế cần 1h => 3x + 2y ≤ 48). Khâu hoàn thiện có tối đa 32 giờ công (mỗi bàn cần 1h, mỗi ghế cần 2h => x + 2y ≤ 32). Mỗi chiếc bàn mang lại tiền lãi 600 nghìn đồng, mỗi chiếc ghế mang lại tiền lãi 450 nghìn đồng.",
    objectiveText: "Xác định kế hoạch sản xuất (x; y) để tổng tiền lãi F(x; y) = 600x + 450y đạt giá trị lớn nhất.",
    matrixHeaders: ["Công đoạn", "1 Bàn (x)", "1 Ghế (y)", "Quỹ thời gian tối đa"],
    matrixRows: [
      { label: "Khâu Lắp ráp", col1: "1.5 giờ", col2: "1.0 giờ", limit: "24 giờ (3x + 2y ≤ 48)" },
      { label: "Khâu Hoàn thiện", col1: "1.0 giờ", col2: "2.0 giờ", limit: "32 giờ (x + 2y ≤ 32)" },
      { label: "Lợi nhuận", col1: "600.000 đ", col2: "450.000 đ", limit: "F = 600x + 450y (nghìn đồng)" },
    ],
    optimalSummary: "Phương án tối ưu: Đỉnh B(8; 12) => Sản xuất 8 bàn và 12 ghế => Lợi nhuận cực đại 10.200.000 đ.",
  },
  spatial_geometry: {
    title: "THIẾT KẾ MÁI CHE THÁP CANH S.ABCD",
    source: "SGK Hình học 11 KNTT Bài 11, Trang 78-83",
    context: "Thiết kế mô hình mái che sân trường hình chóp tứ giác đều S.ABCD. Đáy ABCD là hình vuông cạnh a = 3 m. Chiều cao thẳng đứng SH = h thay đổi từ 1.5 m đến 4.0 m để tối ưu khả năng thoát nước mưa và diện tích bạt che.",
    objectiveText: "Quan sát phối cảnh 3D; phân biệt quy ước cạnh thấy (nét liền) và cạnh khuất (nét đứt) khi xoay mô hình.",
    matrixHeaders: ["Bộ phận", "Kích thước", "Quy ước biểu diễn"],
    matrixRows: [
      { label: "Đáy ABCD", col1: "3.0 m x 3.0 m", col2: "Hình vuông nằm ngang", limit: "Các cạnh nhìn thấy hoặc khuất" },
      { label: "Chiều cao SH", col1: "1.5 - 4.0 m", col2: "SH ⊥ (ABCD)", limit: "Nét đứt màu đỏ hồng (cạnh khuất)" },
      { label: "Thể tích V", col1: "V = (1/3) a² h", col2: "Dung tích không gian mái", limit: "Tự động tính theo thời gian thực" },
    ],
    optimalSummary: "Thuật toán Back-face Culling tự động chuyển nét đứt cho các cạnh khuất khi xoay camera.",
  },
  trigonometry: {
    title: "CHUYỂN ĐỘNG TRÒN ĐỀU & ĐƯỜNG TRÒN LƯỢNG GIÁC",
    source: "SGK Toán 11 KNTT Bài 1, Trang 5-16",
    context: "Mô phỏng vị trí của tay máy tự động hoặc vệ tinh viễn thông chuyển động tròn đều trên đường tròn lượng giác đơn vị bán kính R = 1. Góc quay α thay đổi liên tục từ 0° đến 360°.",
    objectiveText: "Liên hệ trực quan tọa độ điểm M(cos α; sin α) với các giá trị lượng giác.",
    matrixHeaders: ["Đại lượng", "Giá trị hình học", "Ý nghĩa"],
    matrixRows: [
      { label: "Hoành độ Ox", col1: "cos α", col2: "Đoạn hình chiếu trên trục hoành", limit: "Mang dấu âm ở góc phần tư II, III" },
      { label: "Tung độ Oy", col1: "sin α", col2: "Đoạn hình chiếu trên trục tung", limit: "Mang dấu dương ở góc phần tư I, II" },
    ],
    optimalSummary: "Bản chất hình học của lượng giác: Tọa độ điểm ngọn của cung trên đường tròn đơn vị.",
  },
  functions: {
    title: "KHẢO SÁT BIẾN THIÊN HÀM SỐ & TỐI ƯU HÓA CHI PHÍ",
    source: "SGK Toán 12 KNTT Chương 1 Bài 1 & 2, Trang 5-20",
    context: "Khảo sát hàm bậc ba y = ax³ + bx² + cx + d và hàm phân thức y = (ax + b)/(cx + d). Khám phá mối liên hệ giữa dấu đạo hàm f'(x) với tính đồng biến, nghịch biến, xác định tọa độ các điểm cực trị, phương trình tiếp tuyến tại tiếp điểm M và số giao điểm với đường thẳng y = m.",
    objectiveText: "Kéo các tham số a, b, c, d và m để quan sát bảng biến thiên 2 chiều biến đổi đồng bộ theo thời gian thực và đếm số nghiệm.",
    matrixHeaders: ["Đại lượng", "Công thức / Giá trị", "Ý nghĩa hình học"],
    matrixRows: [
      { label: "Đạo hàm f'(x)", col1: "f'(x) = 3ax² + 2bx + c", col2: "Dấu f'(x) quyết định đồng biến / nghịch biến", limit: "f'(x) = 0 cho hoành độ cực trị" },
      { label: "Đường thẳng y = m", col1: "y = m (đường song song Ox)", col2: "Tương giao đồ thị tìm số nghiệm", limit: "Tự động đổi màu điểm giao" },
      { label: "Bảng biến thiên", col1: "2 chiều tương tác", col2: "Hover dòng nào sáng đồ thị vùng đó", limit: "Cực đại, cực tiểu, vô cực" },
    ],
    optimalSummary: "Bảng biến thiên động 2 chiều liên kết trực tiếp với hình dạng đồ thị và phương trình f'(x) = 0.",
  },
  calculus: {
    title: "TÍCH PHÂN RIEMANN & THỂ TÍCH KHỐI TRÒN XOAY 3D",
    source: "SGK Toán 12 KNTT Chương 4 Bài 12 & 13, Trang 18-28",
    context: "Bài toán xấp xỉ diện tích hình phẳng giới hạn bởi đường cong y = f(x) trên đoạn [a, b] bằng tổng tích phân Riemann với n dải chữ nhật (n chạy từ 2 đến 100). Sau đó quay hình phẳng này quanh trục hoành Ox với góc quay θ từ 0° đến 360° để tạo khối tròn xoay 3D và tính thể tích theo phương pháp lát cắt đĩa tròn (Disk Method).",
    objectiveText: "Kéo số dải n để quan sát sai số Δ tiến về 0, và kéo góc quay θ để quan sát thể tích khối tròn xoay 3D hình thành.",
    matrixHeaders: ["Thành phần", "Công thức vi phân", "Ý nghĩa trực quan"],
    matrixRows: [
      { label: "Tổng Riemann", col1: "S_n = Σ f(x_i) Δx", col2: "Xấp xỉ tổng diện tích n dải chữ nhật", limit: "n càng lớn, sai số càng nhỏ" },
      { label: "Tích phân xác định", col1: "∫[a→b] f(x) dx", col2: "Giới hạn diện tích chính xác", limit: "Tô màu miền diện tích" },
      { label: "Khối tròn xoay 3D", col1: "V = π ∫[a→b] f(x)² dx", col2: "Quay lát cắt đĩa quanh Ox (0° - 360°)", limit: "Dựng mesh 3D chiếu sáng" },
    ],
    optimalSummary: "Diện tích chính xác là giới hạn của tổng Riemann khi n → ∞; thể tích là tích phân các lát cắt tròn.",
  },
  probability: {
    title: "XÁC SUẤT CÓ ĐIỀU KIỆN, SƠ ĐỒ CÂY & CÔNG THỨC BAYES",
    source: "SGK Toán 12 KNTT Chương 6 Bài 18 & 19, Trang 70-85",
    context: "Thực nghiệm mô hình 2 hộp bi (hoặc xét nghiệm y tế chẩn đoán xác suất). Hộp 1 có R1 bi đỏ và B1 bi xanh; Hộp 2 có R2 bi đỏ và B2 bi xanh. Chọn ngẫu nhiên một hộp với xác suất p1 và p2, sau đó rút 1 viên bi. Tính xác suất để rút được bi đỏ P(Đỏ) và tính xác suất hậu nghiệm P(Hộp 1 | Đỏ) bằng công thức Bayes.",
    objectiveText: "Thay đổi số bi đỏ/xanh ở 2 hộp bằng thanh trượt để quan sát sơ đồ cây 2 tầng cập nhật tức thời xác suất toàn phần và xác suất Bayes.",
    matrixHeaders: ["Đại lượng", "Công thức xác suất", "Giá trị tính toán"],
    matrixRows: [
      { label: "Xác suất toàn phần", col1: "P(Đỏ) = P(H1)·P(Đ|H1) + P(H2)·P(Đ|H2)", col2: "Tổng xác suất của 2 nhánh dẫn tới bi đỏ", limit: "Cập nhật thời gian thực" },
      { label: "Công thức Bayes", col1: "P(H1|Đỏ) = [P(H1)·P(Đ|H1)] / P(Đỏ)", col2: "Xác suất hậu nghiệm khi biết trước kết quả", limit: "Tỉ số nhánh 1 trên tổng" },
      { label: "Luật số lớn", col1: "Gieo xúc xắc N lần", col2: "Tần suất thực nghiệm tiến dần về 1/6", limit: "Biểu đồ đường hội tụ" },
    ],
    optimalSummary: "Công thức Bayes suy ngược nguyên nhân từ kết quả quan sát; sơ đồ cây trực quan hóa các nhánh biến cố.",
  },
  conics_and_solids: {
    title: "KHAI TRIỂN PHẲNG ↔ GẤP KHỐI ĐA DIỆN & CẮT NÓN CONIC",
    source: "SGK Hình học 11 KNTT Bài 12 & Toán 10 Chuyên đề Conic",
    context: "Kỹ thuật cắt may bạt che và gấp khối đa diện: 4 mặt tam giác bên SAB, SBC, SCD, SDA của hình chóp được xoay bản lề quanh 4 cạnh đáy để trải phẳng hoàn toàn trên mặt đất. Đồng thời mô phỏng giao tuyến cắt mặt nón tròn xoay hai tầng sinh ra ba đường conic chuẩn (Elip, Parabol, Hypebol).",
    objectiveText: "Quan sát góc giữa mặt bên và mặt phẳng đáy khi kéo thanh trượt từ 100% về 0% và kiểm chứng tính chất tiêu cự MF₁ + MF₂ = 2a.",
    matrixHeaders: ["Trạng thái", "Thao tác", "Mục tiêu sư phạm"],
    matrixRows: [
      { label: "Gấp khối 100%", col1: "Khối chóp 3D", col2: "4 đỉnh S chụm tại đỉnh chung", limit: "Quan sát hình học không gian" },
      { label: "Khai triển 0%", col1: "Bản vẽ phẳng 2D", col2: "4 đỉnh S trải ra 4 hướng", limit: "Tính diện tích toàn phần chính xác" },
      { label: "Mặt nón Conic", col1: "Cắt mặt nón góc β", col2: "Sinh Elip, Parabol, Hypebol", limit: "Định lý Dandelin" },
    ],
    optimalSummary: "Liên kết trực quan giữa bản vẽ kỹ thuật 2D và mô hình vật lý 3D trong không gian.",
  },
};

const DEFAULT_CONSTRAINTS: Constraint[] = [
  { a: 1, b: 0, c: 0, op: ">=" }, // x >= 0 (Số lượng bàn x >= 0)
  { a: 0, b: 1, c: 0, op: ">=" }, // y >= 0 (Số lượng ghế y >= 0)
  { a: 3, b: 2, c: 48, op: "<=" }, // Khâu lắp ráp: 1.5x + y <= 24 <=> 3x + 2y <= 48
  { a: 1, b: 2, c: 32, op: "<=" }, // Khâu hoàn thiện: x + 2y <= 32
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
    prompt: "Cho hệ x ≥ 0, y ≥ 0, x + 2y ≤ 8, x + y ≤ 5. Tìm giá trị lớn nhất của F(x, y) = 3x + 2y:",
    answer: 15,
    hint: "So sánh giá trị tại 4 đỉnh: O(0;0)->0, A(0;4)->8, B(2;3)->12, C(5;0)->15. GTLN là 15 tại đỉnh C(5;0).",
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
      const vA = v * 4;
      const vB = u * 2 + v * 3;
      const vC = u * 5;
      const maxVal = Math.max(v0, vA, vB, vC);
      return {
        prompt: `Cho hệ x ≥ 0, y ≥ 0, x + 2y ≤ 8, x + y ≤ 5. Tìm giá trị lớn nhất của F(x, y) = ${u}x + ${v}y:`,
        answer: maxVal,
        hint: `Tính giá trị tại 4 đỉnh: O(0;0)->0, A(0;4)->${vA}, B(2;3)->${vB}, C(5;0)->${vC}. GTLN là ${maxVal}.`,
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

  const rawVertices: [number, number][] = [];
  for (let i = 0; i < cs.length; i++) {
    for (let j = i + 1; j < cs.length; j++) {
      const a = canonicalConstraint(cs[i]);
      const b = canonicalConstraint(cs[j]);
      const det = a.a * b.b - a.b * b.a;
      if (Math.abs(det) < 1e-9) continue;
      const x = (a.c * b.b - a.b * b.c) / det;
      const y = (a.a * b.c - a.c * b.a) / det;
      if (cs.every((r) => satisfies(r, x, y, 1e-4))) {
        if (!rawVertices.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-4)) {
          rawVertices.push([parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
        }
      }
    }
  }

  // Sắp xếp các đỉnh theo chiều ngược kim đồng hồ quanh tâm để vẽ đa giác lồi không bị cắt chéo
  let vertices = rawVertices;
  if (rawVertices.length >= 3) {
    const cx = rawVertices.reduce((sum, p) => sum + p[0], 0) / rawVertices.length;
    const cy = rawVertices.reduce((sum, p) => sum + p[1], 0) / rawVertices.length;
    vertices = [...rawVertices].sort((p1, p2) => {
      const a1 = Math.atan2(p1[1] - cy, p1[0] - cx);
      const a2 = Math.atan2(p2[1] - cy, p2[0] - cx);
      return a1 - a2;
    });
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
      return { x: 8, y: 12, u: 3, v: 2, F: 48, k: 48 };
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
      message: "Câu trả lời còn ngắn. Hãy thêm từ 'vì...' để câu trả lời có tính chứng minh toán học nhé!",
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
  initialStep = 0,
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

  // Bài toán thực tế / Đề bài tương ứng với trạm học (đảm bảo luôn có đề đầy đủ cho tất cả 48 trạm)
  const activeProblem = useMemo<RealWorldProblem>(() => {
    if (stationId && REAL_WORLD_PROBLEMS[stationId]) {
      return REAL_WORLD_PROBLEMS[stationId];
    }
    if (moduleId && REAL_WORLD_PROBLEMS[moduleId]) {
      return REAL_WORLD_PROBLEMS[moduleId];
    }
    return {
      title: currentStation?.title || meta.title || "BÀI TOÁN KHÁM PHÁ TOÁN HỌC",
      source: currentStation?.source || meta.source || "SGK Toán THPT · Bộ Kết nối tri thức",
      context:
        currentStation?.simulation ||
        meta.simulation ||
        "Quan sát và thao tác trên mô hình tương tác để kiểm chứng tính chất hình học và đại số.",
      objectiveText:
        currentStation?.goal ||
        meta.goal ||
        "Xác định quy luật toán học và phương án tối ưu của bài toán.",
      matrixHeaders: ["Thông số", "Thao tác", "Quy tắc"],
      matrixRows: [
        {
          label: "Mục tiêu bài toán",
          col1: "Quan sát mô hình",
          col2: "Biến đổi tham số",
          limit: currentStation?.source || meta.source || "SGK",
        },
      ],
      optimalSummary: currentStation?.goal || meta.goal,
    };
  }, [stationId, currentStation, meta, moduleId]);

  // --- Step Progression State ---
  const [currentStep, setCurrentStep] = useState<number>(typeof initialStep === "number" && initialStep >= 0 && initialStep <= 7 ? initialStep : 0);
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

  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  const recordActivity = useCallback(
    (entry: { type: ActivityLogEntry["type"]; details: string }) => {
      const newEntry: ActivityLogEntry = {
        timestamp: new Date().toLocaleTimeString("vi-VN"),
        type: entry.type,
        details: entry.details,
      };
      setActivityLogs((prev) => {
        const next = [newEntry, ...prev].slice(0, 50);
        const key = stationId || moduleId;
        if (key) {
          saveStationState(key, { activityLogs: next });
        }
        return next;
      });
    },
    [stationId, moduleId]
  );

  const [evidenceModalOpen, setEvidenceModalOpen] = useState<boolean>(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"task" | "scene" | "controls">("scene");
  const [isFullscreenScene, setIsFullscreenScene] = useState<boolean>(false);
  const [worksheetModalOpen, setWorksheetModalOpen] = useState<boolean>(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const [canvasSnapshotUrl, setCanvasSnapshotUrl] = useState<string | null>(null);

  // --- Two Side Panels Toggle State ---
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);


  const [hintLevel, setHintLevel] = useState<number>(0);
  const [dynamicProblem, setDynamicProblem] = useState<{ prompt: string; answer: number | string; hint: string } | null>(null);
  const [transferVerification, setTransferVerification] = useState<{ correct: boolean; enteredNum: number; expectedNum: number; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Interactive Canvas & Camera State ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [toolMode] = useState<GeoToolMode>("move");
  const [camera, setCamera] = useState({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });
  // const [selectedAxis] = useState<"x" | "y" | "z">("x");

  // --- Math Simulation Parameters (Synchronized Sliders & Number inputs) ---
  const [params, setParams] = useState<Record<string, number>>(() => getDefaultParams(moduleId));

  // --- Mode: Bài học SGK (8 bước) vs Phòng Lab Động GeoGebra ---
  const [labMode, setLabMode] = useState<"sgk" | "dynamic">("sgk");

  // --- Natural Language to 3D Geometry Parser (Tự do / Sáng tạo Module 2 & Module 7) ---
  const [aiCreativeMode, setAiCreativeMode] = useState<boolean>(false);
  const [parsedAiScene, setParsedAiScene] = useState<ResolvedGeometryScene>(() =>
    resolveGeometrySolid(GEOMETRY_PRESET_TEMPLATES[0].solid)
  );
  const [, setRawAiSolid] = useState<ParsedGeometrySolid>(
    GEOMETRY_PRESET_TEMPLATES[0].solid
  );

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
  const [showIntegerPoints] = useState<boolean>(true);
  // const [solidType] = useState<"pyramid" | "prism" | "frustum">("pyramid");

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
  // const [arTilt] = useState<number>(35);
  // const [arScale] = useState<number>(1.0);

  // Reset parameters when moduleId or stationId changes, and load cached data
  useEffect(() => {
    setManipulations(0);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setTransferInput("");
    setTransferVerification(null);
    setHintLevel(0);
    setDynamicProblem(null);
    setCamera({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });

    const key = stationId || moduleId;
    const saved = loadStationState(key);

    if (saved) {
      if (saved.params && Object.keys(saved.params).length > 0) {
        setParams(saved.params);
      } else {
        setParams(getDefaultParams(moduleId));
      }

      if (typeof initialStep === "number" && initialStep >= 0 && initialStep <= 7) {
        setCurrentStep(initialStep);
      } else if (typeof saved.currentStep === "number" && saved.currentStep >= 0 && saved.currentStep <= 7) {
        setCurrentStep(saved.currentStep);
      } else {
        setCurrentStep(0);
      }

      setPrediction(saved.prediction || "");
      setReason(saved.reason || "");
      setObservations(
        Array.isArray(saved.observations)
          ? saved.observations.map((o) => ({
              at: o.at,
              summary: o.summary,
              params: o.params || {},
            }))
          : []
      );
      setEvidenceHistory(Array.isArray(saved.evidenceHistory) ? saved.evidenceHistory : []);
      if (typeof saved.quizAnswer === "number") setQuizAnswer(saved.quizAnswer);
      if (typeof saved.quizSubmitted === "boolean") setQuizSubmitted(saved.quizSubmitted);
      if (saved.transferInput) setTransferInput(saved.transferInput);
      if (saved.activityLogs && Array.isArray(saved.activityLogs)) {
        setActivityLogs(saved.activityLogs);
      }

      showToast("Đã khôi phục phiên học tập trước đó của bạn.");
    } else {
      setParams(getDefaultParams(moduleId));
      if (typeof initialStep === "number" && initialStep >= 0 && initialStep <= 7) {
        setCurrentStep(initialStep);
      } else {
        setCurrentStep(0);
      }
      setPrediction("");
      setReason("");
      setObservations([]);
      setEvidenceHistory([]);
      setQuizAnswer(null);
      setQuizSubmitted(false);
      setTransferInput("");
    }
  }, [moduleId, stationId, initialStep, showToast]);

  // Đồng bộ bước ra ngoài để cập nhật query URL
  useEffect(() => {
    onStepChange?.(currentStep + 1, STEP_NAMES[currentStep]);
  }, [currentStep, onStepChange]);

  // Persist offline progress automatically
  useEffect(() => {
    const key = stationId || moduleId;
    if (!key) return;
    saveStationState(key, {
      currentStep,
      params,
      prediction,
      reason,
      observations,
      evidenceHistory,
      quizAnswer,
      quizSubmitted,
      transferInput,
      activityLogs,
      moduleId,
    });
  }, [moduleId, stationId, currentStep, params, prediction, reason, observations, evidenceHistory, quizAnswer, quizSubmitted, transferInput, activityLogs]);

  // Handler Làm lại bài này từ đầu (Reset Progress)
  const handleResetProgress = () => {
    const key = stationId || moduleId;
    if (typeof window !== "undefined") {
      const ok = window.confirm("Em có chắc chắn muốn làm lại bài này từ đầu? Toàn bộ câu trả lời và thông số đã lưu sẽ được thiết lập lại.");
      if (!ok) return;
    }
    clearStationState(key);
    setParams(getDefaultParams(moduleId));
    setPrediction("");
    setReason("");
    setObservations([]);
    setEvidenceHistory([]);
    setActivityLogs([]);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setTransferInput("");
    setTransferVerification(null);
    setCurrentStep(0);
    onStepChange?.(1, STEP_NAMES[0]);
    showToast("Đã làm mới phiên học tập từ đầu.");
  };

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
        showToast("Đã khôi phục cảnh mô phỏng từ liên kết chia sẻ!");
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
            ctx.fillText("Bản khai triển phẳng 2D: 4 mặt bên mở xòe trên mặt phẳng đáy", 15, 25);
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
            ctx.fillText("Phản ví dụ trực quan:", bx + 8, by + 16);
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
          // Thematic: Bàn thực nghiệm Matte Slate Tabletop (#1e293b)
          ctx.save();
          ctx.fillStyle = "#1e293b"; // Matte Slate Tabletop
          ctx.fillRect(0, 0, W, H);

          // Khung viền nỉ bàn thực nghiệm
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 3;
          ctx.strokeRect(12, 12, W - 24, H - 24);

          // Tiêu đề bàn thực nghiệm
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#38bdf8";
          ctx.fillText("BÀN THỰC NGHIỆM XÁC SUẤT: PHÂN BỐ TẦN SUẤT XÚC XẮC 6 MẶT", 24, 34);

          // Dice frequency bars
          const counts = [4, 5, 6, 5, 4, params.rolls ? Math.floor(params.rolls / 6) + 2 : 7];
          const total = counts.reduce((a, b) => a + b, 0);
          ctx.font = "bold 11px 'JetBrains Mono', monospace";
          for (let i = 0; i < 6; i++) {
            const freq = counts[i] / total;
            const barH = freq * 180;
            const bx = O[0] - 120 + i * 40;
            const by = O[1] - barH;
            ctx.fillStyle = i === 5 ? "#10b981" : "#0284c7";
            ctx.fillRect(bx, by, 30, barH);
            ctx.fillStyle = "#f1f5f9";
            ctx.fillText(`${i + 1}`, bx + 10, O[1] + 16);
            ctx.fillStyle = i === 5 ? "#34d399" : "#38bdf8";
            ctx.fillText(`${(freq * 100).toFixed(0)}%`, bx + 2, by - 6);
          }
          ctx.restore();
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
    recordActivity({
      type: "prediction",
      details: `Dự đoán: "${prediction.trim()}"`,
    });
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
    recordActivity({
      type: "param_change",
      details: `Ghi nhận số liệu: ${obs.summary}`,
    });
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
    recordActivity({
      type: "self_explain",
      details: `Tự giải thích: "${reason.trim()}"`,
    });
    showToast("✓ Đã lưu vết giải thích quy luật toán học!");
  };

  const handleCheckQuiz = () => {
    if (quizAnswer === null) {
      showToast("Hãy chọn một phương án trả lời.");
      return;
    }
    setQuizSubmitted(true);
    const isCorrect = quizAnswer === QUIZ_DATA[moduleId].correctIdx;
    recordActivity({
      type: "independent_quiz",
      details: isCorrect
        ? `Rèn luyện độc lập: Đúng đáp án [${quizAnswer + 1}]`
        : `Rèn luyện độc lập: Chọn sai phương án [${quizAnswer + 1}]`,
    });
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
    recordActivity({
      type: "self_explain",
      details: result.correct
        ? `MiniCAS kiểm chứng đúng: ${transferInput.trim()}`
        : `MiniCAS phát hiện chưa đúng: ${transferInput.trim()}`,
    });
    if (result.correct) {
      const record: EvidenceRecord = {
        stepId: 7,
        stepName: "Vận dụng thực tế",
        completedAt: new Date().toLocaleTimeString("vi-VN"),
        summary: `Đáp số đúng: ${transferInput.trim()} (kết quả kiểm định MiniCAS: ${result.enteredNum}).`,
        data: { input: transferInput.trim(), expected: currentProblem.answer },
      };
      setEvidenceHistory((prev) => [record, ...prev]);
      showToast("MiniCAS đã kiểm chứng đáp số của em là chính xác!");
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
    showToast("Đã sinh bài toán tham số mới! Hãy thử sức nào.");
  };

  const handleShareScene = () => {
    try {
      const state = { moduleId, stationId, params, constraints, camera, currentStep };
      const hashStr = encodeURIComponent(btoa(JSON.stringify(state)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#scene=${hashStr}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast("Đã sao chép liên kết chia sẻ cảnh vào bộ nhớ tạm!");
        }).catch(() => {
          window.location.hash = `scene=${hashStr}`;
          showToast("Đã cập nhật liên kết chia sẻ với cảnh hiện tại!");
        });
      } else {
        window.location.hash = `scene=${hashStr}`;
        showToast("Đã cập nhật liên kết chia sẻ với cảnh hiện tại!");
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
    showToast("Đã xuất file JSON dữ liệu học tập!");
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
        showToast("Đã nạp thành công dữ liệu học tập từ file JSON!");
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
      showToast("Chúc mừng em đã hoàn thành toàn bộ 8 bước chu trình nhận thức!");
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
    showToast("Đã chụp và tải ảnh mô hình về máy.");
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f6f5] border border-[#d9e4e2] rounded-2xl overflow-hidden shadow-sm font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#087e7c] text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in z-50">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
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
              title="Quay lại danh mục trạm học"
            >
              <span>←</span>
              <span>Danh mục trạm</span>
            </button>
          )}
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

        <div className="flex items-center gap-2 relative">
          {/* Nút Ẩn/Hiện Cột Đề bài & Nhiệm vụ bên Trái */}
          <button
            type="button"
            onClick={() => {
              setShowLeftPanel((v) => {
                const next = !v;
                showToast(next ? "Đã mở Cột Đề bài & Nhiệm vụ." : "Đã ẩn Cột Đề bài (Mở rộng Canvas).");
                return next;
              });
            }}
            title={showLeftPanel ? "Thu gọn Cột Đề bài & Nhiệm vụ để mở rộng khung vẽ" : "Mở Cột Đề bài & Nhiệm vụ để đọc đề"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold hidden lg:flex items-center gap-1.5 shadow-xs transition-all ${
              showLeftPanel
                ? "bg-white border-[#d9e4e2] text-slate-700 hover:bg-slate-50"
                : "bg-teal-600 text-white border-teal-700 hover:bg-teal-700 shadow-md animate-pulse"
            }`}
          >
            {showLeftPanel ? (
              <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5 text-white" />
            )}
            <span>{showLeftPanel ? "Ẩn cột đề bài" : "Mở cột đề bài (Đọc đề)"}</span>
          </button>

          {/* Nút Ẩn/Hiện Thanh Điều khiển bên Phải */}
          <button
            type="button"
            onClick={() => {
              setShowRightPanel((v) => {
                const next = !v;
                showToast(next ? "Đã mở thanh Điều khiển bên phải." : "Đã ẩn thanh Điều khiển (Mở rộng Canvas).");
                return next;
              });
            }}
            title={showRightPanel ? "Ẩn thanh Điều khiển (Phải) để mở rộng tối đa khung vẽ" : "Hiện thanh Điều khiển (Phải)"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold hidden lg:flex items-center gap-1.5 shadow-xs transition-all ${
              showRightPanel
                ? "bg-white border-[#d9e4e2] text-slate-700 hover:bg-slate-50"
                : "bg-teal-600 text-white border-teal-700 hover:bg-teal-700 shadow-md"
            }`}
          >
            {showRightPanel ? (
              <PanelRightClose className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 text-white" />
            )}
            <span>{showRightPanel ? "Ẩn điều khiển" : "Hiện điều khiển"}</span>
          </button>

          {/* Nút Làm lại bài này từ đầu (Reset Progress) */}
          <button
            type="button"
            onClick={handleResetProgress}
            title="Làm lại bài này từ đầu (Xóa câu trả lời và số liệu đã lưu)"
            className="px-2.5 py-1.5 rounded-xl border border-[#d9e4e2] bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Làm lại từ đầu</span>
          </button>

          {/* Nút gạt Header: [Chế độ Trình chiếu (GV)] ↔ [Chế độ Thực hành (HS)] */}
          <button
            type="button"
            onClick={() => {
              setIsTeacherMode((prev) => {
                const next = !prev;
                if (next) {
                  setShowLeftPanel(false);
                  setShowRightPanel(false);
                  showToast("Đã bật Chế độ Trình chiếu (GV): Phóng to 1.5x, toàn màn hình Canvas, thanh công cụ giảng dạy.");
                } else {
                  setShowLeftPanel(true);
                  setShowRightPanel(true);
                  showToast("Đã chuyển sang Chế độ Thực hành (HS): 8 bước nhận thức chuẩn, thử nghiệm và khám phá.");
                }
                return next;
              });
            }}
            title={isTeacherMode ? "Đang ở Chế độ Giáo viên. Nhấp để chuyển về Chế độ Học sinh" : "Đang ở Chế độ Học sinh. Nhấp để chuyển sang Chế độ Giáo viên"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              isTeacherMode
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/40"
                : "bg-white border-[#d9e4e2] text-slate-700 hover:bg-slate-50"
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${isTeacherMode ? "text-slate-950" : "text-amber-600"}`} />
            <span>{isTeacherMode ? "Chế độ Trình chiếu (GV)" : "Chế độ Thực hành (HS)"}</span>
          </button>

          {/* 3-Dots More Options Menu */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen((v) => !v)}
              className="p-1.5 rounded-xl border border-[#d9e4e2] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all"
              title="Tùy chọn bổ trợ & Công cụ giáo viên"
            >
              <MoreVertical className="w-4 h-4 text-slate-600" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 z-50 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setIsTeacherMode((v) => !v);
                    setMoreMenuOpen(false);
                    showToast(!isTeacherMode ? "Đã bật Chế độ Giáo viên: Tự do chọn bước trình chiếu." : "Đã chuyển về Chế độ Học sinh.");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-[#152f35]"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium">Chế độ dạy học</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isTeacherMode ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isTeacherMode ? "BẬT" : "TẮT"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleSnapshot();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-[#152f35]"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chụp ảnh khung làm việc</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenWorksheet();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-[#152f35]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu học tập A4</span>
                </button>

                <button
                  onClick={() => {
                    handleShareScene();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-[#152f35]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Sao chép liên kết chia sẻ</span>
                </button>

                <button
                  onClick={() => {
                    setEvidenceModalOpen(true);
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-[#152f35]"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sổ khám phá (bằng chứng)</span>
                  </span>
                  <span className="font-bold text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                    {evidenceHistory.length}
                  </span>
                </button>

                <div className="h-[1px] bg-slate-100 my-0.5" />

                <button
                  onClick={() => {
                    setCamera({ yaw: -0.65, pitch: 0.45, zoom: 1, panX: 0, panY: 0 });
                    setMoreMenuOpen(false);
                    showToast("Đã khôi phục góc nhìn chuẩn ban đầu.");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                >
                  <span>⟲</span>
                  <span>Khôi phục góc nhìn chuẩn</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THANH LỘ TRÌNH 7 BƯỚC SƯ PHẠM (STEPBAR) */}
      <div className="bg-white border-b border-[#d9e4e2] px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {isTeacherMode && (
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-bold shrink-0">
            <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Tự do chuyển bước
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
          <Compass className="w-3.5 h-3.5 inline mr-1" /> Mô phỏng
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
          <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Đề bài & Nhiệm vụ (B{currentStep + 1})
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
          <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" /> Điều khiển
        </button>
      </div>

      {/* 3. KHÔNG GIAN 3 CỘT: NHIỆM VỤ (TRÁI) | MÔ PHỎNG & CANVAS (GIỮA) | ĐIỀU KHIỂN DỰNG HÌNH (PHẢI) */}
      <div
        className={`flex-1 grid grid-cols-1 gap-3 p-3 overflow-y-auto transition-all duration-300 ${
          showLeftPanel && showRightPanel
            ? "lg:grid-cols-[280px_minmax(320px,1fr)_290px]"
            : showLeftPanel && !showRightPanel
            ? "lg:grid-cols-[280px_minmax(320px,1fr)]"
            : !showLeftPanel && showRightPanel
            ? "lg:grid-cols-[minmax(320px,1fr)_290px]"
            : "lg:grid-cols-[1fr]"
        }`}
      >
        {/* CỘT 1: NHIỆM VỤ SƯ PHẠM (TASK-SIDE) */}
        {showLeftPanel && (
          <aside className={`bg-white border border-[#d9e4e2] rounded-xl p-3.5 flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto text-xs text-[#152f35] ${
            activeMobileTab === "task" ? "flex" : "hidden lg:flex"
          }`}>
            {/* Header thanh Nhiệm vụ với nút đóng/thu gọn */}
            <div className="flex items-center justify-between pb-1.5 border-b border-[#e5ebe4]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087e7c] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#087e7c]" />
                <span>Nhiệm vụ & Tiến trình</span>
              </span>
              <button
                type="button"
                onClick={() => setShowLeftPanel(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors hidden lg:flex items-center"
                title="Ẩn thanh nhiệm vụ (Trái) để mở rộng đồ thị"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. MODULE ĐỀ BÀI & BỐI CẢNH THỰC TẾ (PROBLEM STATEMENT CARD - LUÔN HIỂN THỊ ĐẦY ĐỦ 100%) */}
            {(() => {
              const prob = activeProblem;
              return (
                <div className="bg-gradient-to-br from-[#0c2e35] via-[#082329] to-[#06181d] text-white rounded-xl border border-teal-500/30 shadow-md overflow-hidden transition-all duration-200">
                  {/* Header Card với nhãn Đề bài chuẩn mực */}
                  <div className="p-2.5 bg-teal-950/80 border-b border-teal-500/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wide truncate">
                        {prob.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 bg-teal-900/90 border border-teal-400/40 rounded text-[9px] text-teal-200 font-medium">
                        {prob.source.split("Bài")[0]?.trim() || "SGK KNTT"}
                      </span>
                    </div>
                  </div>

                  {/* Nội dung chi tiết của đề bài (Luôn luôn mở 100%) */}
                  <div className="p-3 space-y-2.5 text-xs">
                    {/* Bối cảnh đề bài */}
                    <p className="text-[11px] text-slate-100 leading-relaxed font-normal break-words">
                      {prob.context}
                    </p>

                    {/* Mục tiêu / Câu hỏi trọng tâm */}
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-teal-500/30 text-[11px] font-semibold text-amber-300 flex items-start gap-1.5 break-words">
                      <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{prob.objectiveText}</span>
                    </div>

                    {/* Danh sách thông số kỹ thuật / Bảng ma trận không bị tràn viền */}
                    {prob.matrixRows && prob.matrixRows.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Thông số & Ràng buộc:</span>
                          <span className="text-[9px] text-gray-400 lowercase font-normal">{prob.source}</span>
                        </div>
                        <div className="space-y-1.5">
                          {prob.matrixRows.map((r, i) => (
                            <div
                              key={i}
                              className="p-2 bg-slate-900/60 rounded-lg border border-teal-900/60 hover:border-teal-700/60 transition-colors text-[10px] space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap font-bold text-slate-200">
                                <span>{r.label}</span>
                                {r.limit && (
                                  <span className="font-mono text-amber-300 text-[9.5px] bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-600/40 break-words">
                                    {r.limit}
                                  </span>
                                )}
                              </div>
                              {r.col1 && r.col2 && (
                                <div className="flex items-center justify-between text-teal-300 font-mono text-[9.5px] pt-1 border-t border-teal-900/40">
                                  <span>{prob.matrixHeaders[1] || "Thông số 1"}: <strong className="text-white">{r.col1}</strong></span>
                                  <span>{prob.matrixHeaders[2] || "Thông số 2"}: <strong className="text-white">{r.col2}</strong></span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          <div className="border-b border-[#d9e4e2] pb-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087e7c]">
              TIẾN TRÌNH 8 BƯỚC SƯ PHẠM · BƯỚC {currentStep + 1}
            </span>
            <h3 className="text-xs font-bold mt-1 text-[#152f35]">{STEP_NAMES[currentStep]}</h3>
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
                    <Bot className="w-3.5 h-3.5 inline mr-1 text-[#087e7c]" /> Nhờ TES nhận xét
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
                <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-slate-500" /><span>Lời khuyên: Hãy thử ít nhất 3 cấu hình khác nhau trước khi ghi nhận quan sát.</span></span>
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
                <BookmarkCheck className="w-3.5 h-3.5 inline mr-1" /> Ghi cấu hình đang thấy ({observations.length} đã lưu)
              </button>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline mr-1" />
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
                    <Bot className="w-3.5 h-3.5 inline mr-1 text-[#087e7c]" /> Nhờ TES nhận xét
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
                      showToast(`Đã tạo bài toán thực tế mới: ${iso.contextTitle}`);
                    }}
                    className="px-2 py-1 rounded bg-[#eff8f4] hover:bg-[#d6f0e6] text-[#087e7c] border border-[#a3e2cf] font-bold text-[10px] flex items-center gap-1 transition-colors"
                    title="Sinh bài toán đồng cấu đỉnh nguyên ℤ²"
                  >
                    <Calculator className="w-3.5 h-3.5 inline mr-1" /> Đỉnh nguyên ℤ²
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
                    <RefreshCw className="w-3 h-3 inline mr-1" /> Đổi số
                  </button>
                </div>
              </div>

              {activeIntegerProblem ? (
                <div className="p-2.5 rounded-lg bg-[#eff8f4] border border-[#a3e2cf] text-[11px] leading-relaxed text-[#152f35] space-y-1.5">
                  <div className="font-bold text-[#087e7c] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 inline mr-1 text-slate-600" /> {activeIntegerProblem.contextTitle}
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
                      <Lightbulb className="w-3 h-3 inline mr-1 text-amber-600" /> Mở gợi ý cấp {hintLevel + 1}
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
                  <Target className="w-3.5 h-3.5 inline mr-1 text-[#087e7c]" />
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
                    showToast(`Đã chấm điểm tự luận: ${score}/10! Bằng chứng đã lưu vào sổ học tập.`);
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
                <Bot className="w-4 h-4 text-emerald-700" /> <span>Hỏi trợ lý Socratic TES</span>
              </button>
            </div>
          )}
        </aside>
        )}

        {/* CỘT 2: KHUNG MÔ PHỎNG & CANVAS (SCENE-SIDE) - CHIẾM 100% CHIỀU CAO, THOÁNG ĐÃNG NHƯ DESMOS */}
        <section className={`bg-white border border-[#d9e4e2] rounded-xl overflow-hidden flex flex-col shadow-sm relative ${
          isFullscreenScene ? "fixed inset-2 z-50 flex shadow-2xl" : activeMobileTab === "scene" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Header trên của Canvas: Luôn hiển thị Đề bài tóm tắt và nút công cụ toàn màn hình */}
          <div className="bg-[#f0f7f5] border-b border-[#d9e4e2] px-3.5 py-1.5 flex items-center justify-between gap-3 text-xs shrink-0 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-[#e2f1ec] text-[#087e7c] shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#152f35] text-xs truncate">
                    {activeProblem.title}
                  </span>
                  <span className="hidden sm:inline-block text-[9.5px] text-[#087e7c] font-medium bg-[#eef7f3] px-2 py-0.5 rounded-full border border-[#a3e2cf] shrink-0">
                    {activeProblem.source.split("Bài")[0]?.trim() || "SGK"}
                  </span>
                </div>
                <p className="text-[11px] text-[#4b6368] truncate" title={activeProblem.objectiveText}>
                  <strong className="text-[#087e7c]">Mục tiêu:</strong> {activeProblem.objectiveText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!showLeftPanel && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLeftPanel(true);
                    showToast("Đã mở Cột Đề bài & Nhiệm vụ.");
                  }}
                  className="px-2.5 py-1 bg-[#087e7c] hover:bg-[#066563] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  title="Mở toàn văn đề bài chi tiết bên cột trái"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="hidden sm:inline">Mở đề chi tiết</span>
                </button>
              )}
              <div className="flex items-center bg-[#e2ecea] p-0.5 rounded-lg border border-[#c4dad6]">
                <button
                  type="button"
                  onClick={() => {
                    setLabMode("sgk");
                    setAiCreativeMode(false);
                    showToast("Đã chuyển sang Bài học SGK (8 bước).");
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 ${
                    labMode === "sgk" && !aiCreativeMode
                      ? "bg-white text-[#087e7c] shadow-xs"
                      : "text-[#536d73] hover:text-[#152f35]"
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="hidden sm:inline">Bài học SGK</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLabMode("dynamic");
                    setAiCreativeMode(false);
                    showToast("Đã chuyển sang Phòng Lab Động GeoGebra 60fps.");
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 ${
                    labMode === "dynamic"
                      ? "bg-gradient-to-r from-[#087e7c] to-[#0f9488] text-white shadow-xs"
                      : "text-[#536d73] hover:text-[#152f35]"
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-emerald-300" />
                  <span>Lab Động GeoGebra</span>
                </button>
                {meta.is3D && (
                  <button
                    type="button"
                    onClick={() => {
                      setLabMode("sgk");
                      setAiCreativeMode(true);
                      showToast("Đã chuyển sang Tự do / Sáng tạo (AI Dựng hình 3D).");
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 ${
                      aiCreativeMode
                        ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xs"
                        : "text-[#536d73] hover:text-[#152f35]"
                    }`}
                  >
                    <Wand2 className="w-3 h-3 text-amber-300" />
                    <span className="hidden md:inline">AI Dựng hình</span>
                  </button>
                )}
              </div>
              {meta.is3D && (
                <button
                  type="button"
                  onClick={() => setIsFullscreenScene((v) => !v)}
                  className="px-2 py-1 bg-white border border-[#d9e4e2] rounded-lg text-[11px] font-semibold text-[#152f35] hover:bg-gray-100 flex items-center gap-1"
                >
                  <span>{isFullscreenScene ? "✕" : "⛶"}</span>
                  <span className="hidden sm:inline">{isFullscreenScene ? "Thu nhỏ" : "Toàn màn hình"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Nút nổi mở lại Cột Đề bài & Nhiệm vụ (khi đang bị ẩn trên màn hình lớn) */}
          {!showLeftPanel && (
            <button
              type="button"
              onClick={() => {
                setShowLeftPanel(true);
                showToast("Đã mở Cột Đề bài & Nhiệm vụ.");
              }}
              className="hidden lg:flex absolute left-3 top-14 z-30 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 rounded-xl shadow-lg text-xs font-bold items-center gap-1.5 transition-all hover:scale-105"
              title="Mở Cột Đề bài & Nhiệm vụ (Trái) để đọc đề chi tiết"
            >
              <PanelLeftOpen className="w-4 h-4 text-white" />
              <span>📖 Đọc đề bài (B{currentStep + 1})</span>
            </button>
          )}

          {/* Nút nổi mở lại Thanh Phải (khi đang bị ẩn trên màn hình lớn) */}
          {!showRightPanel && (
            <button
              type="button"
              onClick={() => {
                setShowRightPanel(true);
                showToast("Đã hiện thanh Điều khiển bên phải.");
              }}
              className="hidden lg:flex absolute right-3 top-14 z-30 px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-[#087e7c] border border-[#a3e2cf] rounded-xl shadow-md text-xs font-bold items-center gap-1.5 transition-all hover:scale-105"
              title="Hiện thanh Điều khiển & Kết quả (Phải)"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span>Điều khiển</span>
            </button>
          )}

          {/* Khung Canvas giải phóng toàn bộ chiều cao từ trên xuống dưới */}
          <div className="flex-1 relative flex items-center justify-center bg-[#edf3f2] overflow-hidden min-h-[480px] h-full">
            {labMode === "dynamic" ? (
              moduleId === "linear_programming" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicLinearProgrammingLab />
                </div>
              ) : moduleId === "spatial_geometry" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicSpatialGeometryLab />
                </div>
              ) : moduleId === "trigonometry" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicTrigonometryLab />
                </div>
              ) : moduleId === "functions" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicFunctionsLab />
                </div>
              ) : moduleId === "calculus" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicCalculusLab />
                </div>
              ) : moduleId === "probability" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicProbabilityLab />
                </div>
              ) : moduleId === "conics_and_solids" ? (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                  <DynamicConicsLab />
                </div>
              ) : (
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
              )
            ) : meta.is3D ? (
              aiCreativeMode ? (
                <Geometry3DViewer
                  scene={parsedAiScene}
                  onAskTutor={onAskTutor}
                  className="w-full h-full min-h-[500px]"
                />
              ) : (
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
                  isTeacherMode={isTeacherMode}
                  onVertexManipulated={(log) => {
                    recordActivity({
                      type: "vertex_drag",
                      details: `Kéo đỉnh ${log.vertex} đến (${formatVNFloat(log.newPos.x)}; ${formatVNFloat(log.newPos.y)}; ${formatVNFloat(log.newPos.z)})`,
                    });
                  }}
                />
              )
            ) : moduleId === "linear_programming" ? (
              <Interactive2DMathCanvas
                lines={boundaryLines}
                vertices={polygonVertices}
                objectiveCoeffs={{ a: params.u || 3, b: params.v || 2 }}
                objectiveValue={typeof params.F === "number" ? params.F : 48}
                testPoint={{ x: params.x ?? 8, y: params.y ?? 12 }}
                onTestPointChange={(pt) => {
                  updateParam("x", pt.x);
                  updateParam("y", pt.y);
                }}
                isSgkMode={!invertFilling}
                onToggleSgkMode={() => setInvertFilling((v) => !v)}
                hideTestPoint={currentStep < 2}
                hideObjectiveLine={currentStep < 4}
                visualCounterExample={
                  counterExampleActive && currentStep >= 3
                    ? { x: 14, y: 10, text: "3(14) + 2(10) = 62 > 48h (Vi phạm lắp ráp!)" }
                    : null
                }
              />
            ) : moduleId === "trigonometry" ? (
              <TrigonometricCircleCanvas
                angleDeg={typeof params.t === "number" ? params.t : 60}
                onAngleChange={(deg) => updateParam("t", deg)}
              />
            ) : moduleId === "functions" ? (
              <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                <DynamicFunctionsLab />
              </div>
            ) : moduleId === "calculus" ? (
              <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                <DynamicCalculusLab />
              </div>
            ) : moduleId === "probability" ? (
              <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                <DynamicProbabilityLab />
              </div>
            ) : moduleId === "conics_and_solids" ? (
              <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
                <DynamicConicsLab />
              </div>
            ) : (
              /* High-Performance Canvas Fallback */
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
        </section>

        {/* CỘT 3: KẾT QUẢ & ĐIỀU KHIỂN (CONTROLS & RESULTS) */}
        {showRightPanel && (
          <aside className={`bg-white border border-[#d9e4e2] rounded-xl p-3.5 flex flex-col gap-3.5 max-h-[calc(100vh-220px)] overflow-y-auto text-xs text-[#152f35] ${
            activeMobileTab === "controls" ? "flex" : "hidden lg:flex"
          }`}>
            {/* Header thanh Điều khiển với nút đóng/thu gọn */}
            <div className="flex items-center justify-between pb-1.5 border-b border-[#e5ebe4]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#087e7c] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#087e7c]" />
                <span>Bảng điều khiển & Kết quả</span>
              </span>
              <button
                type="button"
                onClick={() => setShowRightPanel(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors hidden lg:flex items-center"
                title="Ẩn thanh điều khiển (Phải) để mở rộng đồ thị"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PHẦN 1: NỬA TRÊN - THẺ KẾT QUẢ TRỰC TIẾP (LIVE RESULTS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#d9e4e2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#087e7c] flex items-center gap-1">
                  <Activity className="w-4 h-4 text-[#087e7c]" /> <span>THẺ KẾT QUẢ TRỰC TIẾP</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Bước {currentStep + 1}/8</span>
              </div>

            {moduleId === "linear_programming" ? (
              // Progressive Disclosure cho Bài toán xưởng mộc
              currentStep < 2 ? (
                // Bước 1 & 2: Chưa lộ đáp án, tập trung quan sát & dự đoán
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Search className="w-3.5 h-3.5 text-slate-600" />
                    <span>Nhiệm vụ {STEP_NAMES[currentStep]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Em hãy đọc kỹ đề bài xưởng mộc ở Cột trái, quan sát miền đa giác trên đồ thị Oxy và điền dự đoán của em vào câu hỏi trước khi sang bước Thao tác.
                  </p>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] space-y-1 font-mono text-slate-700">
                    <div>• Giới hạn lắp ráp: 3x + 2y ≤ 48 giờ</div>
                    <div>• Giới hạn hoàn thiện: x + 2y ≤ 32 giờ</div>
                    <div>• Mục tiêu lợi nhuận: F = 600x + 450y</div>
                  </div>
                </div>
              ) : (
                // Bước 3 trở đi: Hiển thị kết quả điểm thử, công suất xưởng và thẻ lợi nhuận
                (() => {
                  const xVal = params.x ?? 8;
                  const yVal = params.y ?? 12;
                  const usedLapRap = 3 * xVal + 2 * yVal;
                  const okLapRap = usedLapRap <= 48;
                  const usedHoanThien = 1 * xVal + 2 * yVal;
                  const okHoanThien = usedHoanThien <= 32;
                  const isFeasible = okLapRap && okHoanThien && xVal >= 0 && yVal >= 0;
                  const isOptimal = xVal === 8 && yVal === 12;
                  const totalProfitThousand = 600 * xVal + 450 * yVal;

                  return (
                    <div className="space-y-2.5">
                      {/* Trạng thái điểm thử M(x; y) */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isFeasible ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold">{isFeasible ? "✓" : "!"}</span>
                          <div>
                            <div className="font-bold text-xs">Phương án M({xVal}; {yVal})</div>
                            <div className="text-[10px] font-medium opacity-80">
                              {isFeasible ? "Thuộc miền nghiệm khả thi" : "Vi phạm giờ công của công nhân!"}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFeasible ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                        }`}>
                          {isFeasible ? "HỢP LỆ" : "BỊ LOẠI"}
                        </span>
                      </div>

                      {/* Đồng hồ công suất 2 khâu sản xuất */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
                        <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wide">
                          Quỹ giờ công 2 khâu xưởng:
                        </span>
                        {/* Khâu Lắp ráp */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-600">Lắp ráp (3x+2y ≤ 48h):</span>
                            <span className={`font-mono font-bold ${okLapRap ? "text-emerald-700" : "text-rose-600"}`}>
                              {usedLapRap} / 48 giờ {okLapRap ? "✓" : "✗ QUÁ TẢI"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${okLapRap ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.min(100, Math.round((usedLapRap / 48) * 100))}%` }}
                            />
                          </div>
                        </div>
                        {/* Khâu Hoàn thiện */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-600">Hoàn thiện (x+2y ≤ 32h):</span>
                            <span className={`font-mono font-bold ${okHoanThien ? "text-emerald-700" : "text-rose-600"}`}>
                              {usedHoanThien} / 32 giờ {okHoanThien ? "✓" : "✗ QUÁ TẢI"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${okHoanThien ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.min(100, Math.round((usedHoanThien / 32) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Thẻ KPI Lợi nhuận thời gian thực */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        isOptimal
                          ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400 shadow-md ring-1 ring-amber-400"
                          : isFeasible
                          ? "bg-emerald-50/70 border-emerald-300"
                          : "bg-rose-50/70 border-rose-300"
                      }`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Tiền lãi F(x; y):</span>
                          {currentStep >= 4 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOptimal ? "bg-amber-500 text-white animate-pulse" : isFeasible ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}>
                              {isOptimal ? "★ TỐI ƯU GTLN" : isFeasible ? "✓ KHẢ THI" : "✗ VI PHẠM"}
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-extrabold font-mono text-slate-900">
                          {(totalProfitThousand * 1000).toLocaleString("vi-VN")} đ
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          {isOptimal && currentStep >= 4
                            ? "★ Đạt cực đại tại B(8; 12): 8 bàn & 12 ghế khai thác 100% công suất 48h và 32h!"
                            : isFeasible
                            ? `Phương án khả thi (${xVal} bàn, ${yVal} ghế). Kéo thanh trượt để khảo sát tiền lãi.`
                            : "Phương án này vượt quá thời gian làm việc của công nhân xưởng."}
                        </p>
                      </div>

                      {/* Ở Bước 6: Bảng so sánh 4 đỉnh đa giác */}
                      {currentStep >= 5 && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-700 block">
                            So sánh 4 đỉnh đa giác miền nghiệm:
                          </span>
                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                            <div className="p-1 bg-white rounded border border-slate-200">O(0; 0) → 0 đ</div>
                            <div className="p-1 bg-white rounded border border-slate-200">A(0; 16) → 7,2 tr</div>
                            <div className="p-1 bg-amber-100/80 rounded border border-amber-300 font-bold text-amber-900">
                              B(8; 12) → 10,2 tr ★
                            </div>
                            <div className="p-1 bg-white rounded border border-slate-200">C(16; 0) → 9,6 tr</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )
            ) : moduleId === "spatial_geometry" ? (
              (() => {
                const hVal = params.h || 2.6;
                const aVal = 3.0;
                const baseArea = aVal * aVal;
                const volume = (1 / 3) * baseArea * hVal;
                const diagonal = aVal * Math.SQRT2;
                const halfDiag = diagonal / 2;
                const edgeLength = Math.sqrt(hVal * hVal + halfDiag * halfDiag);
                const slantAngle = (Math.atan2(hVal, halfDiag) * 180) / Math.PI;

                return (
                  <div className="space-y-2.5">
                    {/* Thẻ quan hệ hình học không gian 11 */}
                    <div className="p-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-300 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-teal-900">Hình chóp đều S.ABCD:</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                          SGK TOÁN 11
                        </span>
                      </div>
                      <div className="text-[11px] text-teal-800 space-y-0.5 font-medium">
                        <div>• Đường cao: <KatexMath math="SH \perp (ABCD)" /></div>
                        <div>• Mặt phẳng đáy: <KatexMath math="(ABCD): y = 0" /></div>
                        <div>• Vectơ pháp tuyến: <KatexMath math="\vec{n} = (0;\, 1;\, 0)" /></div>
                      </div>
                    </div>

                    {/* Thẻ số liệu đo đạc chuẩn KaTeX làm tròn tối đa 2 chữ số thập phân */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wide">
                        Số liệu hình học giải tích:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Chiều cao:</div>
                          <KatexMath math={`h = ${formatVNFloat(hVal)}\\text{ m}`} className="font-bold text-teal-800" />
                        </div>
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Cạnh đáy:</div>
                          <KatexMath math={`a = ${formatVNFloat(aVal)}\\text{ m}`} className="font-bold text-teal-800" />
                        </div>
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Diện tích đáy:</div>
                          <KatexMath math={`S_{đáy} = ${formatVNFloat(baseArea)}\\text{ m}^2`} className="font-bold text-cyan-800" />
                        </div>
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Thể tích:</div>
                          <KatexMath math={`V = ${formatVNFloat(volume)}\\text{ m}^3`} className="font-bold text-amber-800" />
                        </div>
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Cạnh bên:</div>
                          <KatexMath math={`SA \approx ${formatVNFloat(edgeLength)}\\text{ m}`} className="font-bold text-slate-800" />
                        </div>
                        <div className="p-1.5 bg-white rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">Góc cạnh bên:</div>
                          <KatexMath math={`\\varphi \approx ${formatVNFloat(slantAngle)}^\\circ`} className="font-bold text-purple-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : moduleId === "trigonometry" ? (
              (() => {
                const angle = ((((params.t ?? 60) % 360) + 360) % 360);
                const roundedAngle = Math.round(angle);
                const special = SPECIAL_ANGLES[roundedAngle];
                const rad = (angle * Math.PI) / 180;
                const cosVal = special ? special.cosVal : Math.cos(rad);
                const sinVal = special ? special.sinVal : Math.sin(rad);
                const cosLatex = special ? special.cosLatex : formatVNFloat(cosVal);
                const sinLatex = special ? special.sinLatex : formatVNFloat(sinVal);
                const tanLatex = special
                  ? special.tanLatex
                  : Math.abs(cosVal) < 1e-4
                  ? "\\text{không xác định}"
                  : formatVNFloat(sinVal / cosVal);
                const cotLatex = special
                  ? special.cotLatex
                  : Math.abs(sinVal) < 1e-4
                  ? "\\text{không xác định}"
                  : formatVNFloat(cosVal / sinVal);

                let quadName = "Góc phần tư I";
                let quadRule = "\\cos \\alpha > 0,\\; \\sin \\alpha > 0";
                if (angle > 90 && angle < 180) {
                  quadName = "Góc phần tư II";
                  quadRule = "\\cos \\alpha < 0,\\; \\sin \\alpha > 0";
                } else if (angle > 180 && angle < 270) {
                  quadName = "Góc phần tư III";
                  quadRule = "\\cos \\alpha < 0,\\; \\sin \\alpha < 0";
                } else if (angle > 270 && angle < 360) {
                  quadName = "Góc phần tư IV";
                  quadRule = "\\cos \\alpha > 0,\\; \\sin \\alpha < 0";
                } else if (angle === 0 || angle === 360) {
                  quadName = "Tia Ox (+)";
                  quadRule = "\\cos 0^\\circ = 1,\\; \\sin 0^\\circ = 0";
                } else if (angle === 90) {
                  quadName = "Tia Oy (+)";
                  quadRule = "\\cos 90^\\circ = 0,\\; \\sin 90^\\circ = 1";
                } else if (angle === 180) {
                  quadName = "Tia Ox (-)";
                  quadRule = "\\cos 180^\\circ = -1,\\; \\sin 180^\\circ = 0";
                } else if (angle === 270) {
                  quadName = "Tia Oy (-)";
                  quadRule = "\\cos 270^\\circ = 0,\\; \\sin 270^\\circ = -1";
                }

                return (
                  <div className="space-y-2.5">
                    {/* Thẻ định nghĩa chuẩn SGK Toán 11 KNTT */}
                    <div className="p-2.5 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-300 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-sky-950">Đường tròn lượng giác Oxy:</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                          SGK TOÁN 11 KNTT
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-900 space-y-0.5 font-medium">
                        <div>• Tâm <KatexMath math="O(0;\, 0)" />, Bán kính <KatexMath math="R = 1" />, Gốc <KatexMath math="A(1;\, 0)" /></div>
                        <div>• <strong className="text-sky-700">Trục Ox (Trục Cosin):</strong> <KatexMath math="x_M = \overline{OH} = \cos \alpha" /></div>
                        <div>• <strong className="text-rose-700">Trục Oy (Trục Sin):</strong> <KatexMath math="y_M = \overline{OK} = \sin \alpha" /></div>
                      </div>
                    </div>

                    {/* Vị trí góc phần tư & quy tắc dấu */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Vị trí góc:</span>
                        <span className="font-bold text-slate-800">{quadName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Dấu lượng giác:</span>
                        <KatexMath math={quadRule} className="font-bold text-teal-800 text-xs" />
                      </div>
                    </div>

                    {/* 4 Giá trị lượng giác thời gian thực */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-2 bg-sky-50/80 border border-sky-300 rounded-xl">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700">
                          <span className="w-2 h-2 rounded-full bg-sky-500 shadow-sm" />
                          <span>cos α (Hoành độ):</span>
                        </div>
                        <div className="pt-0.5">
                          <KatexMath math={`\\cos ${Math.round(angle)}^\\circ = ${cosLatex}`} className="font-bold text-sky-900 text-xs" />
                        </div>
                      </div>

                      <div className="p-2 bg-rose-50/80 border border-rose-300 rounded-xl">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                          <span>sin α (Tung độ):</span>
                        </div>
                        <div className="pt-0.5">
                          <KatexMath math={`\\sin ${Math.round(angle)}^\\circ = ${sinLatex}`} className="font-bold text-rose-900 text-xs" />
                        </div>
                      </div>

                      <div className="p-2 bg-emerald-50/80 border border-emerald-300 rounded-xl">
                        <div className="text-[10px] font-bold text-emerald-700">
                          tan α (Tiếp tuyến x=1):
                        </div>
                        <div className="pt-0.5">
                          <KatexMath math={`\\tan ${Math.round(angle)}^\\circ = ${tanLatex}`} className="font-bold text-emerald-900 text-xs" />
                        </div>
                      </div>

                      <div className="p-2 bg-indigo-50/80 border border-indigo-300 rounded-xl">
                        <div className="text-[10px] font-bold text-indigo-700">
                          cot α (Tiếp tuyến y=1):
                        </div>
                        <div className="pt-0.5">
                          <KatexMath math={`\\cot ${Math.round(angle)}^\\circ = ${cotLatex}`} className="font-bold text-indigo-900 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Kiểm chứng Pythagoras sin² + cos² = 1 */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Hệ thức cơ bản:</span>
                      <KatexMath math="\\sin^2 \\alpha + \\cos^2 \\alpha = 1" className="font-bold text-slate-800" />
                    </div>
                  </div>
                );
              })()
            ) : (
              // Các module khác
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-semibold text-xs text-slate-700">Trạng thái: Đang tương tác</span>
              </div>
            )}
          </div>

          {/* PHẦN 2: NỬA DƯỚI - BẢNG ĐIỀU KHIỂN THANH TRƯỢT (INTERACTIVE CONTROLS) */}
          <div className="space-y-3 pt-2 border-t border-[#d9e4e2] mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#087e7c] flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4 text-[#087e7c]" /> <span>BẢNG ĐIỀU KHIỂN</span>
              </span>
              {moduleId === "linear_programming" && currentStep >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    updateParam("x", 8);
                    updateParam("y", 12);
                    updateParam("F", 48);
                    showToast("Đã khôi phục phương án tối ưu chuẩn SGK B(8; 12)!");
                  }}
                  className="text-[10px] text-[#087e7c] hover:underline font-bold"
                >
                  Về chuẩn B(8; 12)
                </button>
              )}
            </div>

            {moduleId === "linear_programming" ? (
              currentStep < 2 ? (
                // Bước 1 & 2: Ẩn thanh trượt
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1.5 text-slate-500">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div className="font-bold text-xs text-slate-700">Thanh điều khiển đang tạm ẩn</div>
                  <p className="text-[10px] leading-relaxed">
                    Hoàn thành câu hỏi dự đoán ở Cột trái, sau đó bấm <strong>Bước 3: Thao tác</strong> để mở thanh trượt!
                  </p>
                </div>
              ) : (
                // Bước 3 trở đi: Hiển thị thanh trượt x, y (và F ở bước 5)
                <div className="space-y-2.5">
                  {/* Thanh trượt Số lượng bàn x */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Số lượng bàn (x):</span>
                      <span className="font-mono text-teal-800 text-xs font-extrabold bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                        {params.x ?? 8} chiếc
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="1"
                      value={params.x ?? 8}
                      onChange={(e) => updateParam("x", parseInt(e.target.value, 10))}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>0</span>
                      <span className="font-bold text-teal-700">8 (tối ưu)</span>
                      <span>16 (tối đa)</span>
                    </div>
                  </div>

                  {/* Thanh trượt Số lượng ghế y */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Số lượng ghế (y):</span>
                      <span className="font-mono text-teal-800 text-xs font-extrabold bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                        {params.y ?? 12} chiếc
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="1"
                      value={params.y ?? 12}
                      onChange={(e) => updateParam("y", parseInt(e.target.value, 10))}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>0</span>
                      <span className="font-bold text-teal-700">12 (tối ưu)</span>
                      <span>16 (tối đa)</span>
                    </div>
                  </div>

                  {/* Bước 4: Nút kích hoạt phản ví dụ */}
                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCounterExampleActive((v) => !v);
                        showToast(!counterExampleActive ? "Đã ghim phản ví dụ vi phạm P(14; 10)!" : "Đã ẩn phản ví dụ.");
                      }}
                      className={`w-full py-1.5 rounded-lg font-bold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                        counterExampleActive
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 inline mr-1 text-[#087e7c]" />
                      <span>{counterExampleActive ? "Ẩn phản ví dụ P" : "Thử điểm phản ví dụ P(14; 10)"}</span>
                    </button>
                  )}

                  {/* Bước 5 trở đi: Thanh trượt đường mức lợi nhuận d_F */}
                  {currentStep >= 4 && (
                    <div className="p-2 bg-amber-50/60 border border-amber-300/80 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                        <span>Đường mức d_F:</span>
                        <span className="font-mono text-amber-800 font-bold">
                          {((params.F ?? 48) * 150 * 1000).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="68"
                        step="1"
                        value={params.F ?? 48}
                        onChange={(e) => updateParam("F", parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[9px] text-amber-700/70 font-mono">
                        <span>0 đ</span>
                        <span className="font-bold text-amber-900">F_max = 10.200.000 đ</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Các module 3D / lượng giác */
              <div className="space-y-2">
                {meta.is3D && aiCreativeMode && (
                  <NaturalLanguageGeometryPanel
                    onModelGenerated={(scene, raw) => {
                      setParsedAiScene(scene);
                      setRawAiSolid(raw);
                      showToast("Đã cập nhật mô hình 3D thành công!");
                    }}
                    onAskTutor={onAskTutor}
                  />
                )}
                {moduleId === "spatial_geometry" && !aiCreativeMode && (
                  <div className="space-y-2.5">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1">
                          <span>Chiều cao:</span>
                          <KatexMath math={`h = SH = ${formatVNFloat(params.h || 2.6)}`} />
                        </span>
                        <span className="font-mono text-teal-800 text-xs font-extrabold bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                          {formatVNFloat(params.h || 2.6)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.2"
                        max="4.5"
                        step="0.1"
                        value={params.h || 2.6}
                        onChange={(e) => updateParam("h", parseFloat(e.target.value))}
                        className="w-full accent-teal-600"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>1,2 m</span>
                        <span className="font-bold text-teal-700">2,6 m (chuẩn)</span>
                        <span>4,5 m</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1">
                          <span>Gấp khối <KatexMath math="\leftrightarrow" /> Khai triển:</span>
                        </span>
                        <span className="font-mono text-cyan-800 text-xs font-extrabold bg-cyan-100/70 px-2 py-0.5 rounded border border-cyan-300">
                          {foldPercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={foldPercent}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFoldPercent(val);
                          setIsUnfolded(val < 50);
                        }}
                        className="w-full accent-cyan-600"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>0% (Phẳng)</span>
                        <span className="font-bold text-cyan-700">100% (Khối 3D)</span>
                      </div>
                    </div>
                  </div>
                )}
                {moduleId === "trigonometry" && (
                  <div className="space-y-3">
                    {/* Header thông số góc và nút tinh chỉnh nhanh */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <span>Góc quay:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-teal-800 text-xs font-extrabold bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                            {Math.round(params.t || 60)}°
                          </span>
                          <button
                            type="button"
                            onClick={() => updateParam("t", 60)}
                            className="text-[10px] text-teal-700 hover:underline font-bold"
                          >
                            Về 60°
                          </button>
                        </div>
                      </div>

                      {/* Thanh trượt góc quay α */}
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={params.t ?? 60}
                        onChange={(e) => updateParam("t", parseFloat(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer"
                      />

                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>0° (Trục Ox)</span>
                        <span>90° (Oy)</span>
                        <span>180° (-Ox)</span>
                        <span>270° (-Oy)</span>
                        <span>360°</span>
                      </div>

                      {/* Nút bấm tinh chỉnh ±1° và ±15° */}
                      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateParam("t", (((params.t ?? 60) - 15 + 360) % 360))}
                          className="py-1 px-1.5 bg-white hover:bg-slate-100 rounded border border-slate-200 text-[10px] font-mono text-slate-700 font-bold transition-colors"
                        >
                          -15°
                        </button>
                        <button
                          type="button"
                          onClick={() => updateParam("t", (((params.t ?? 60) - 1 + 360) % 360))}
                          className="py-1 px-1.5 bg-white hover:bg-slate-100 rounded border border-slate-200 text-[10px] font-mono text-slate-700 font-bold transition-colors"
                        >
                          -1°
                        </button>
                        <button
                          type="button"
                          onClick={() => updateParam("t", (((params.t ?? 60) + 1) % 360))}
                          className="py-1 px-1.5 bg-white hover:bg-slate-100 rounded border border-slate-200 text-[10px] font-mono text-slate-700 font-bold transition-colors"
                        >
                          +1°
                        </button>
                        <button
                          type="button"
                          onClick={() => updateParam("t", (((params.t ?? 60) + 15) % 360))}
                          className="py-1 px-1.5 bg-white hover:bg-slate-100 rounded border border-slate-200 text-[10px] font-mono text-slate-700 font-bold transition-colors"
                        >
                          +15°
                        </button>
                      </div>
                    </div>

                    {/* Lưới chọn nhanh các góc đặc biệt SGK Toán 11 */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wide">
                        Góc đặc biệt SGK (Nam châm hút):
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { deg: 0, label: "0°" },
                          { deg: 30, label: "30° (π/6)" },
                          { deg: 45, label: "45° (π/4)" },
                          { deg: 60, label: "60° (π/3)" },
                          { deg: 90, label: "90° (π/2)" },
                          { deg: 120, label: "120° (2π/3)" },
                          { deg: 135, label: "135° (3π/4)" },
                          { deg: 150, label: "150° (5π/6)" },
                          { deg: 180, label: "180° (π)" },
                          { deg: 210, label: "210° (7π/6)" },
                          { deg: 225, label: "225° (5π/4)" },
                          { deg: 240, label: "240° (4π/3)" },
                          { deg: 270, label: "270° (3π/2)" },
                          { deg: 300, label: "300° (5π/3)" },
                          { deg: 315, label: "315° (7π/4)" },
                          { deg: 330, label: "330° (11π/6)" },
                          { deg: 360, label: "360° (2π)" },
                        ].map((item) => {
                          const isActive = Math.round(params.t ?? 60) === item.deg;
                          return (
                            <button
                              key={item.deg}
                              type="button"
                              onClick={() => updateParam("t", item.deg)}
                              className={`py-1 px-1.5 text-[9px] rounded font-mono font-medium transition-all ${
                                isActive
                                  ? "bg-teal-600 text-white font-bold shadow-sm ring-1 ring-teal-500"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {/* Hộp công cụ quản lý Tham số Động (GeoGebra Parameter Dock) */}
                {(labMode === "dynamic" ||
                  moduleId === "functions" ||
                  moduleId === "calculus" ||
                  moduleId === "probability" ||
                  moduleId === "conics_and_solids") && (
                  <DynamicParameterDock
                    moduleId={moduleId}
                    onRecordObservation={(summary) =>
                      recordActivity({ type: "param_change", details: summary })
                    }
                  />
                )}
              </div>
            )}
          </div>
        </aside>
        )}
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
                <BookOpen className="w-4 h-4 text-slate-600" />
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
                  <Download className="w-3.5 h-3.5 inline mr-1" /> Xuất JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-[#d9e4e2] bg-[#f8faf9] text-[#152f35] font-bold text-[11px] hover:bg-[#e2f1ec] flex items-center gap-1 transition-colors"
                  title="Nhập file JSON để khôi phục tiến trình"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" /> Nhập JSON
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
          showToast(`Đã chuyển sang trạm ${st.id}: ${st.title}`);
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
