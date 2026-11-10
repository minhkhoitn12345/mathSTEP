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
  stationCode: string;
  description: string;
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
    tag: "Lớp 10 · 2D",
    stationCode: "Trạm 10.03",
    description: "Tô màu miền nghiệm đa giác lồi và trượt đường mức để tìm giá trị tối ưu lớn nhất, nhỏ nhất.",
    goal: "Tô màu miền nghiệm đa giác lồi và trượt đường mức để tìm giá trị tối ưu lớn nhất, nhỏ nhất.",
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
    title: "Hình Học Không Gian & Thiết Diện Đa Diện",
    source: "SGK Hình Học 11 KNTT · Bài 10, 11, 12 (Trang 70-88)",
    tag: "Lớp 11 · 3D",
    stationCode: "Trạm 11.06",
    description: "Xoay khối chóp 360°, tự động nhận diện nét khuất và quan sát mặt phẳng cắt thiết diện.",
    goal: "Xoay khối chóp 360°, tự động nhận diện nét khuất và quan sát mặt phẳng cắt thiết diện.",
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
    title: "Đường Tròn Đơn Vị & Đồ Thị Lượng Giác",
    source: "SGK Toán 11 KNTT · Bài 1 & 2 (Trang 5-20)",
    tag: "Lớp 11 · 2D",
    stationCode: "Trạm 11.01",
    description: "Kéo điểm quay trên đường tròn để thấy sự hình thành liên tục của đồ thị hàm số sin và cos.",
    goal: "Kéo điểm quay trên đường tròn để thấy sự hình thành liên tục của đồ thị hàm số sin và cos.",
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
    title: "Khảo Sát Hàm Số & Bảng Biến Thiên Động",
    source: "SGK Toán 12 KNTT · Chương 1 Bài 1, 2, 3 (Trang 6-25)",
    tag: "Lớp 12 · 2D",
    stationCode: "Trạm 12.01",
    description: "Điều chỉnh hệ số a, b, c, d để quan sát cực trị và sự biến thiên đồng bộ với đồ thị.",
    goal: "Điều chỉnh hệ số a, b, c, d để quan sát cực trị và sự biến thiên đồng bộ với đồ thị.",
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
    title: "Ứng Dụng Tích Phân & Khối Tròn Xoay 3D",
    source: "SGK Toán 12 KNTT · Chương 4 Bài 12 & 13 (Trang 18-28)",
    tag: "Lớp 12 · 3D",
    stationCode: "Trạm 12.08",
    description: "Mô phỏng chia nhỏ diện tích hình phẳng và xoay đồ thị quanh trục Ox tạo khối tròn xoay.",
    goal: "Mô phỏng chia nhỏ diện tích hình phẳng và xoay đồ thị quanh trục Ox tạo khối tròn xoay.",
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
    title: "Sơ Đồ Cây & Công Thức Xác Suất Bayes",
    source: "SGK Toán 12 KNTT · Chương 6 Bài 18 & 19 (Trang 70-85)",
    tag: "Lớp 12 · 2D",
    stationCode: "Trạm 12.12",
    description: "Mô phỏng bài toán rút bi thực tế, tự động tính xác suất toàn phần và xác suất có điều kiện.",
    goal: "Mô phỏng bài toán rút bi thực tế, tự động tính xác suất toàn phần và xác suất có điều kiện.",
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
    defaultStationId: "11.08",
    grade: 10,
    is3D: false,
    title: "Thiết diện mặt nón và sơ đồ khai triển",
    source: "Toán 10 Chuyên Đề Conic & Toán 11 KNTT Bài 12 (Trang 48-88)",
    tag: "Lớp 10 - 11 · Sơ đồ 2D",
    stationCode: "Trạm 11.08",
    description: "Thay đổi góc nghiêng mặt phẳng cắt để tạo đường Elip, Parabol, Hypebol và quan sát mô hình trải phẳng đa diện.",
    goal: "Thay đổi góc nghiêng mặt phẳng cắt để tạo đường Elip, Parabol, Hypebol và quan sát mô hình trải phẳng đa diện.",
    features: [
      "Sơ đồ 2D minh họa mặt nón kép và góc cắt β (10°–90°)",
      "Thử thách phân loại đường tròn, elip, parabol, hypebol theo α và β",
      "Hình chiếu 2D tương ứng; ví dụ elip có hai tiêu điểm F₁, F₂ và MF₁ + MF₂ = 2a",
      "Sơ đồ khai triển và gấp hình chóp với thanh trượt từ 0% đến 100%",
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
