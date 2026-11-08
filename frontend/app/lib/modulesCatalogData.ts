// Danh mục 7 Module Cốt Lõi MathSTEP (Chuẩn KNTT & GDPT 2018)
// Cung cấp Single Source of Truth cho Dynamic Routes & API Backend

import { getAllStations, getStationById, StationItem } from "./stationCatalogData";

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export interface CoreModuleCard {
  id: ModuleId;
  moduleNumber: string;
  defaultStationId: string;
  grade: 10 | 11 | 12;
  is3D: boolean;
  title: string;
  source: string;
  tag: string;
  goal: string;
  features: string[];
  borderHover: string;
  slugAliases: string[];
}

export const CORE_7_MODULES: CoreModuleCard[] = [
  {
    id: "linear_programming",
    moduleNumber: "01",
    defaultStationId: "10.03",
    grade: 10,
    is3D: false,
    title: "Hệ Bất Phương Trình & Quy Hoạch Tuyến Tính",
    source: "SGK Toán 10 KNTT · Bài 3 & 4 (Trang 22-31)",
    tag: "Toán 10 · 2D Oxy · GeoGebra LP",
    goal: "Khám phá miền nghiệm đa giác lồi, trượt đường mức F(x, y) = ux + vy song song, tự động bắt dính đỉnh tối ưu và lưới điểm nguyên x, y ∈ ℕ.",
    features: [
      "Tính đa giác miền nghiệm tự động bằng thuật toán Convex Hull & Clipping",
      "Thanh trượt đường mức k tịnh tiến song song, tự bắt dính đỉnh tối ưu B(8; 12)",
      "Chế độ khóa điểm nguyên x, y ∈ ℕ cho bài toán tối ưu xưởng mộc thực tế",
      "Hộp công cụ [+ Thêm bất phương trình] tự do tùy biến tham số a, b, c",
    ],
    borderHover: "hover:border-emerald-500",
    slugAliases: ["1", "01", "module1", "module01", "module-1", "module-01", "lp", "linear-programming"],
  },
  {
    id: "spatial_geometry",
    moduleNumber: "02",
    defaultStationId: "11.06",
    grade: 11,
    is3D: true,
    title: "Hình Học Không Gian 3D & Dựng Hình Đa Diện",
    source: "SGK Hình Học 11 KNTT · Bài 10, 11, 12 (Trang 70-88)",
    tag: "Toán 11 · 3D Không Gian · AI 3D Parser",
    goal: "Dựng hình chóp tứ giác, kéo đỉnh S điều chỉnh chiều cao h và độ nghiêng, xoay 360°, thuật toán tự phân biệt cạnh thấy / khuất, mặt phẳng cắt thiết diện (P).",
    features: [
      "Kéo đỉnh S tự do thay đổi chiều cao h (1.2m - 4.5m) và độ nghiêng tâm đáy",
      "Thuật toán Back-face Culling tự động hiển thị nét liền (thấy) / nét đứt (khuất)",
      "Mặt phẳng cắt thiết diện (P) trượt mượt mà qua các cạnh của khối đa diện",
      "Tích hợp AI Natural Language to 3D Geometry Parser dựng hình từ đề bài tự nhiên",
    ],
    borderHover: "hover:border-cyan-500",
    slugAliases: ["2", "02", "module2", "module02", "module-2", "module-02", "3d", "spatial", "geometry", "module12"],
  },
  {
    id: "trigonometry",
    moduleNumber: "03",
    defaultStationId: "11.01",
    grade: 11,
    is3D: false,
    title: "Lượng Giác & Đường Tròn Đơn Vị Động (Split-View)",
    source: "SGK Toán 11 KNTT · Bài 1 & 2 (Trang 5-20)",
    tag: "Toán 11 · 2D Split-View · Sóng thời gian thực",
    goal: "Đồng bộ kép: Điểm M quay trên đường tròn đơn vị R=1 gióng tia chiếu liên tục sang đồ thị sóng sin/cos; khảo sát họ sóng y = A sin(ωx + φ) + d.",
    features: [
      "Đồng bộ thời gian thực giữa điểm quay M trên đường tròn R=1 và sóng đồ thị",
      "Tia chiếu gióng trực tiếp từ hình chiếu Ox, Oy sang đồ thị hàm số",
      "Thanh trượt biên độ A, tần số góc ω, pha ban đầu φ, dịch trục d",
      "Thẻ giá trị trực tiếp sin, cos, tan, cot kèm kiểm chứng Pythagoras sin² + cos² = 1",
    ],
    borderHover: "hover:border-indigo-500",
    slugAliases: ["3", "03", "module3", "module03", "module-3", "module-03", "trig", "trigonometric"],
  },
  {
    id: "functions",
    moduleNumber: "04",
    defaultStationId: "12.01",
    grade: 12,
    is3D: false,
    title: "Khảo Sát Hàm Số & Bảng Biến Thiên 2 Chiều Động",
    source: "SGK Toán 12 KNTT · Chương 1 Bài 1, 2, 3 (Trang 6-25)",
    tag: "Toán 12 · Giải Tích 2D · BBT 2 chiều",
    goal: "Khảo sát hàm bậc 3, bậc 4, phân thức với thanh trượt hệ số a, b, c, d; tương tác 2 chiều giữa đồ thị và bảng biến thiên; đường thẳng y = m đếm số nghiệm.",
    features: [
      "Hỗ trợ 3 dạng hàm chuẩn: Bậc ba, trùng phương và phân thức bậc nhất/bậc nhất",
      "Bảng biến thiên 2 chiều tương tác: Hover dòng nào sáng đồ thị vùng đó",
      "Thanh trượt đường thẳng y = m tự động đếm số nghiệm và hiện tọa độ giao điểm",
      "Tiếp tuyến động tại tiếp điểm M(x₀, y₀) với hệ số góc k = f'(x₀)",
    ],
    borderHover: "hover:border-amber-500",
    slugAliases: ["4", "04", "module4", "module04", "module-4", "module-04", "function", "ham-so"],
  },
  {
    id: "calculus",
    moduleNumber: "05",
    defaultStationId: "12.08",
    grade: 12,
    is3D: true,
    title: "Tích Phân Riemann & Khối Tròn Xoay 3D (Disk Method)",
    source: "SGK Toán 12 KNTT · Chương 4 Bài 12 & 13 (Trang 18-28)",
    tag: "Toán 12 · 2D + 3D · Tổng Riemann & Khối xoay",
    goal: "Xấp xỉ diện tích hình phẳng bằng n dải chữ nhật Riemann (n=2...100, Δ → 0); quay lát cắt quanh Ox với góc θ=0°...360° tạo khối tròn xoay 3D.",
    features: [
      "Thanh trượt n dải chữ nhật (2 đến 100): Trực quan hóa sai số diện tích tiến về 0",
      "Tùy chọn quy tắc xấp xỉ: Điểm đầu trái (Left), trung điểm (Midpoint), điểm đầu phải (Right)",
      "Mô hình khối tròn xoay 3D với thanh trượt góc quay θ từ 0° đến 360°",
      "Lát cắt đĩa tròn (Disk Method) hiển thị từng phân tố vi phân thể tích dV = π f(x)² dx",
    ],
    borderHover: "hover:border-emerald-500",
    slugAliases: ["5", "05", "module5", "module05", "module-5", "module-05", "riemann", "integral", "tich-phan"],
  },
  {
    id: "probability",
    moduleNumber: "06",
    defaultStationId: "12.12",
    grade: 12,
    is3D: false,
    title: "Xác Suất Hộp Bi, Sơ Đồ Cây & Công Thức Bayes",
    source: "SGK Toán 12 KNTT · Chương 6 Bài 18 & 19 (Trang 70-85)",
    tag: "Toán 12 · Xác Suất · Bayes & Cây 2 tầng",
    goal: "Mô phỏng 2 hộp bi (Đỏ / Xanh) với sơ đồ cây 2 tầng động; tính xác suất toàn phần và xác suất hậu nghiệm Bayes P(Hộp 1 | Đỏ); mô phỏng gieo xúc xắc luật số lớn.",
    features: [
      "Thanh trượt số bi đỏ, bi xanh trong 2 hộp với cập nhật trực tiếp xác suất phân nhánh",
      "Sơ đồ cây động 2 tầng tự động tính tích xác suất từng nhánh",
      "Công thức Bayes tính xác suất hậu nghiệm P(Hộp 1 | Đỏ) với phân tích tử và mẫu",
      "Chế độ mô phỏng thực nghiệm gieo xúc xắc 1000 lần kiểm chứng Quy luật số lớn",
    ],
    borderHover: "hover:border-rose-500",
    slugAliases: ["6", "06", "module6", "module06", "module-6", "module-06", "prob", "bayes", "xac-suat"],
  },
  {
    id: "conics_and_solids",
    moduleNumber: "07",
    defaultStationId: "11.07",
    grade: 10,
    is3D: true,
    title: "Cắt Mặt Nón Conic & Khai Triển Khối Đa Diện",
    source: "Toán 10 Chuyên Đề Conic & Toán 11 KNTT Bài 12 (Trang 48-88)",
    tag: "Toán 10-11 · 3D Conic · Khai triển đa diện",
    goal: "Mặt nón đôi 3D cắt bởi mặt phẳng nghiêng góc β (Elip, Parabol, Hypebol); kiểm chứng tính chất tiêu điểm MF₁ + MF₂ = 2a; thanh trượt gấp/mở đa diện 100% → 0%.",
    features: [
      "Mô hình 3D mặt nón tròn xoay hai tầng với thanh trượt góc nghiêng mặt phẳng cắt β (10° - 90°)",
      "Tự động nhận diện thiết diện: Đường tròn, Elip, Parabol hay Hypebol kèm định lý Dandelin",
      "Đồ thị 2D chính tắc với tiêu điểm F₁, F₂ và kiểm chứng tổng khoảng cách MF₁ + MF₂ = 2a",
      "Mô hình khai triển phẳng ↔ gấp khối đa diện với thanh trượt gập mượt mà từ 0% đến 100%",
    ],
    borderHover: "hover:border-fuchsia-500",
    slugAliases: ["7", "07", "module7", "module07", "module-7", "module-07", "conic", "conics", "solids"],
  },
];

export function getAllModules(): CoreModuleCard[] {
  return CORE_7_MODULES;
}

export function getModuleById(id: string): CoreModuleCard | undefined {
  const norm = id.trim().toLowerCase();
  return CORE_7_MODULES.find(
    (m) =>
      m.id.toLowerCase() === norm ||
      m.moduleNumber === norm ||
      m.slugAliases.some((alias) => alias.toLowerCase() === norm)
  );
}

export interface ResolvedRouteTarget {
  module: CoreModuleCard;
  station: StationItem;
  matchedBy: "module_id" | "module_alias" | "station_id";
}

/**
 * Phân giải đường dẫn linh hoạt (Dynamic Route Resolver):
 * Chấp nhận:
 * - Module id: "spatial_geometry", "linear_programming"
 * - Module alias: "module01", "module12", "module-02", "3d", "lp"
 * - Station id: "11.06", "10.03", "12.01", "12.08"
 */
export function resolveModuleOrStation(rawSlug: string): ResolvedRouteTarget {
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

  // 1. Kiểm tra xem có trùng với mã Station (VD: "11.06", "10.03")
  const directStation = getStationById(rawSlug) || getStationById(slug);
  if (directStation) {
    const parentModule = CORE_7_MODULES.find((m) => m.id === directStation.moduleId) || CORE_7_MODULES[1];
    return {
      module: parentModule,
      station: directStation,
      matchedBy: "station_id",
    };
  }

  // 2. Kiểm tra xem có trùng với Module id hoặc alias
  const matchedModule = getModuleById(slug);
  if (matchedModule) {
    const defaultStation = getStationById(matchedModule.defaultStationId) || getAllStations()[0];
    return {
      module: matchedModule,
      station: defaultStation,
      matchedBy: matchedModule.id === slug ? "module_id" : "module_alias",
    };
  }

  // 3. Fallback mặc định về Module 02 (Hình học không gian 3D - trạm 11.06)
  const fallbackModule = CORE_7_MODULES[1];
  const fallbackStation = getStationById(fallbackModule.defaultStationId) || getAllStations()[0];
  return {
    module: fallbackModule,
    station: fallbackStation,
    matchedBy: "module_alias",
  };
}
