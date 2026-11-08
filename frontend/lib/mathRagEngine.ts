// RAG Engine (Retrieval-Augmented Generation) Toán Học Chuẩn SGK GDPT 2018
// Cung cấp bối cảnh tri thức toán học chính xác, thuật ngữ sư phạm và chẩn đoán ngộ nhận cho Socratic AI TES

import { STATION_CATALOG } from "../app/lib/stationCatalogData";
import { CORE_7_MODULES } from "../app/lib/modulesCatalogData";

export interface MathKnowledgeChunk {
  moduleId: string;
  stationId?: string;
  topic: string;
  grade: 10 | 11 | 12;
  coreConcepts: string[];
  sgkSource: string;
  keyFormulas: string[];
  commonMisconceptions: string[];
  socraticGuidance: string[];
}

export const MATH_KNOWLEDGE_BASE: MathKnowledgeChunk[] = [
  {
    moduleId: "spatial_geometry",
    stationId: "11.06",
    topic: "Hình chóp tứ giác đều S.ABCD: Cạnh thấy vs Cạnh khuất",
    grade: 11,
    sgkSource: "SGK Hình học 11 KNTT · Chương IV Bài 11 (Trang 78-83)",
    coreConcepts: [
      "Quy ước nét vẽ: Nét liền biểu diễn cạnh nhìn thấy, nét đứt biểu diễn cạnh bị che khuất.",
      "Đường cao của hình chóp đều: Đoạn thẳng nối đỉnh S với tâm H của đa giác đáy, SH vuông góc với (ABCD).",
      "Góc nhìn phối cảnh và phương chiếu: Khi xoay khối chóp trong không gian 3D, thuật toán Back-face Culling xác định mặt quay về phía người quan sát dựa vào tích vô hướng giữa vectơ pháp tuyến mặt phẳng và vectơ tia nhìn.",
      "Tọa độ hóa không gian: Chọn gốc O tại tâm H hoặc đỉnh A để giải tích hóa các đỉnh chóp.",
    ],
    keyFormulas: [
      "$SH \\perp (ABCD)$ tại tâm đáy $H$",
      "$V = \\frac{1}{3} S_{ABCD} \\cdot h$",
      "$\\vec{n} = (0;\\, 1;\\, 0)$ là vectơ pháp tuyến của mặt phẳng đáy $y = 0$",
      "Độ dài cạnh bên: $SA = \\sqrt{SH^2 + HA^2}$",
    ],
    commonMisconceptions: [
      "Học sinh nhầm lẫn đường cao hình chóp SH với trung đoạn kẻ từ S xuống cạnh đáy.",
      "Học sinh mặc định cạnh đáy nào nằm phía sau cũng luôn là nét đứt mà không nhận ra khi xoay 180 độ thì cạnh đó trở thành cạnh nhìn thấy.",
      "Nhầm điểm tỉ số N (SN/SB = 2/3) với trung điểm M (SM/SA = 1/2).",
    ],
    socraticGuidance: [
      "Hãy hướng dẫn học sinh xoay mô hình 3D từ từ và quan sát cạnh đáy CD: Khi nào nó chuyển từ nét đứt sang nét liền?",
      "Đặt câu hỏi: 'Nếu đường cao SH vuông góc với đáy, thì tam giác SHA là tam giác gì? Đoạn HA bằng bao nhiêu phần đường chéo AC?'",
      "Khuyến khích học sinh dùng định lý Pythagoras trong tam giác vuông SHA để tính độ dài cạnh bên SA.",
    ],
  },
  {
    moduleId: "linear_programming",
    stationId: "10.03",
    topic: "Hệ Bất Phương Trình Bậc Nhất Hai Ẩn & Bài Toán Tối Ưu Tuyến Tính",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 3 & 4 (Trang 22-31)",
    coreConcepts: [
      "Bất phương trình bậc nhất hai ẩn: ax + by <= c biểu diễn một nửa mặt phẳng có bờ là đường thẳng d: ax + by = c.",
      "Miền nghiệm của hệ bất phương trình: Giao của các nửa mặt phẳng, thường là miền đa giác lồi.",
      "Định lý giá trị tối ưu: Giá trị lớn nhất (hoặc nhỏ nhất) của hàm mục tiêu F(x, y) = ux + vy trên một miền đa giác đạt được tại một trong các đỉnh của đa giác đó.",
      "Tịnh tiến đường mức: Trượt họ đường thẳng d_k: ux + vy = k song song với nhau.",
    ],
    keyFormulas: [
      "Hàm mục tiêu: $F(x, y) = ax + by$",
      "Hệ điều kiện: $a_i x + b_i y \\le c_i$, $x \\ge 0$, $y \\ge 0$",
      "Đỉnh tối ưu $B(x^*, y^*)$ thỏa mãn $F(x^*, y^*) = \\max$",
    ],
    commonMisconceptions: [
      "Học sinh thử điểm M ngẫu nhiên rồi vội kết luận nghiệm tối ưu mà không kiểm tra tọa độ tại các đỉnh đa giác.",
      "Học sinh quên điều kiện điểm nguyên x, y thuộc N trong các bài toán kinh tế thực tế (như số bàn, số ghế xưởng mộc).",
      "Nhầm lẫn miền nghiệm bị gạch bỏ với miền nghiệm được giữ lại theo quy ước SGK.",
    ],
    socraticGuidance: [
      "Gợi mở: 'Đường mức F(x, y) = k khi tăng k sẽ dịch chuyển theo hướng nào? Đỉnh nào của miền nghiệm là điểm cuối cùng mà đường thẳng rời khỏi miền?'",
      "Nhắc nhở học sinh lập bảng so sánh giá trị F tại tất cả các đỉnh A, B, C, D của miền nghiệm.",
    ],
  },
  {
    moduleId: "trigonometry",
    stationId: "11.01",
    topic: "Đường Tròn Lượng Giác Đơn Vị & Đồ Thị Sóng Tuần Hoàn",
    grade: 11,
    sgkSource: "SGK Toán 11 KNTT · Chương I Bài 1 & 2 (Trang 5-20)",
    coreConcepts: [
      "Đường tròn lượng giác đơn vị bán kính R = 1, trục hoành là trục Cosin, trục tung là trục Sin.",
      "Mỗi góc lượng giác alpha tương ứng với một điểm M(cos alpha, sin alpha) trên đường tròn.",
      "Hàm số y = sin x tuần hoàn với chu kỳ 2pi; y = cos x tuần hoàn chu kỳ 2pi.",
      "Tia chiếu liên tục: Khi M quay quanh tâm O, hình chiếu của M lên trục Oy dao động điều hòa tạo nên đồ thị dạng hình sin.",
    ],
    keyFormulas: [
      "$\\sin^2 \\alpha + \\cos^2 \\alpha = 1$",
      "$\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$ $(\\alpha \\ne \\frac{\\pi}{2} + k\\pi)$",
      "$y = A \\sin(\\omega x + \\varphi) + d$",
    ],
    commonMisconceptions: [
      "Nhầm trục hoành là trục Sin, trục tung là trục Cos.",
      "Quên rằng sin(x + 2pi) = sin x và nhầm chu kỳ của hàm tang với hàm sin.",
    ],
    socraticGuidance: [
      "Gợi ý: 'Hãy nhìn vào tia gióng từ điểm M sang đồ thị bên phải: Khi M đi từ góc 0 đến pi/2, giá trị tung độ của M tăng hay giảm?'",
    ],
  },
  {
    moduleId: "functions",
    stationId: "12.01",
    topic: "Khảo Sát Sự Biến Thiên & Bảng Biến Thiên 2 Chiều",
    grade: 12,
    sgkSource: "SGK Toán 12 KNTT · Chương I Bài 1, 2, 3 (Trang 6-25)",
    coreConcepts: [
      "Dấu của đạo hàm f'(x) quyết định tính đơn điệu: f'(x) > 0 hàm đồng biến, f'(x) < 0 hàm nghịch biến.",
      "Điểm cực trị: Điểm tại đó đạo hàm đổi dấu từ dương sang âm (cực đại) hoặc từ âm sang dương (cực tiểu).",
      "Tiếp tuyến của đồ thị tại điểm M(x0, y0): y = f'(x0)(x - x0) + y0.",
      "Tương giao đồ thị: Số nghiệm của phương trình f(x) = m bằng số giao điểm của đồ thị y = f(x) và đường nằm ngang y = m.",
    ],
    keyFormulas: [
      "$y' = 3ax^2 + 2bx + c$ đối với hàm bậc ba",
      "Tiếp tuyến: $y = f'(x_0)(x - x_0) + f(x_0)$",
      "Điều kiện có 2 cực trị: $\\Delta' = b^2 - 3ac > 0$",
    ],
    commonMisconceptions: [
      "Đồng nhất giá trị cực đại với giá trị lớn nhất toàn cục của hàm số.",
      "Quên đổi dấu đạo hàm khi tìm nghiệm phân thức.",
    ],
    socraticGuidance: [
      "Hỏi: 'Khi đường thẳng y = m di chuyển từ dưới lên trên, tại những giá trị m nào thì nó cắt đồ thị tại đúng 3 điểm phân biệt?'",
    ],
  },
  {
    moduleId: "calculus",
    stationId: "12.08",
    topic: "Tổng Tích Phân Riemann & Thể Tích Khối Tròn Xoay",
    grade: 12,
    sgkSource: "SGK Toán 12 KNTT · Chương IV Bài 12 & 13 (Trang 18-28)",
    coreConcepts: [
      "Ý nghĩa hình học của tích phân: Diện tích hình thang cong giới hạn bởi đồ thị y = f(x), trục hoành và hai đường thẳng x = a, x = b.",
      "Xấp xỉ Riemann: Chia đoạn [a, b] thành n đoạn nhỏ, tính tổng diện tích n hình chữ nhật. Khi n tiến tới vô cùng, tổng này tiến đến tích phân xác định.",
      "Phương pháp đĩa tròn (Disk Method): Khối tròn xoay tạo thành khi quay hình thang cong quanh trục Ox có thể tích bằng tích phân pi * f(x)^2 dx.",
    ],
    keyFormulas: [
      "$S = \\int_a^b |f(x)|\\,dx$",
      "$V = \\pi \\int_a^b [f(x)]^2\\,dx$",
      "Tổng Riemann: $S_n = \\sum_{i=1}^n f(\\xi_i) \\Delta x$",
    ],
    commonMisconceptions: [
      "Quên nhân hệ số pi trong công thức thể tích khối tròn xoay.",
      "Không lấy trị tuyệt đối khi đồ thị nằm dưới trục Ox dẫn đến diện tích âm.",
    ],
    socraticGuidance: [
      "Gợi ý: 'Khi em tăng thanh trượt n từ 5 lên 50, phần khoảng trống sai số giữa các cột chữ nhật và đường cong thay đổi như thế nào?'",
    ],
  },
  {
    moduleId: "probability",
    stationId: "12.12",
    topic: "Xác Suất Có Điều Kiện, Sơ Đồ Cây & Công Thức Bayes",
    grade: 12,
    sgkSource: "SGK Toán 12 KNTT · Chương VI Bài 18 & 19 (Trang 70-85)",
    coreConcepts: [
      "Xác suất có điều kiện: P(A|B) = P(A và B) / P(B) với P(B) > 0.",
      "Công thức xác suất toàn phần: P(B) = sum P(A_i) * P(B|A_i).",
      "Công thức Bayes: Cập nhật xác suất tiền nghiệm sang xác suất hậu nghiệm sau khi biết biến cố B đã xảy ra.",
    ],
    keyFormulas: [
      "$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
      "$P(A_k|B) = \\frac{P(A_k) P(B|A_k)}{\\sum_{i=1}^n P(A_i) P(B|A_i)}$",
    ],
    commonMisconceptions: [
      "Học sinh đánh đồng P(A|B) và P(B|A) (Nghịch lý công tố viên).",
      "Nhầm lẫn giữa biến cố độc lập và biến cố xung khắc.",
    ],
    socraticGuidance: [
      "Hỏi: 'Biết rằng viên bi rút ra màu Đỏ, điều này làm tăng hay giảm khả năng viên bi đó đến từ Hộp 1? Hãy nhìn vào tỷ lệ bi đỏ của từng hộp trên sơ đồ cây.'",
    ],
  },
];

/**
 * RAG Retriever: Tìm kiếm và trích xuất ngữ cảnh kiến thức SGK phù hợp nhất
 */
export function retrieveMathKnowledge(
  moduleId: string,
  stationId?: string,
  stepNumber?: number,
  userQuery?: string
): string {
  // 1. Tìm chunk khớp chính xác nhất với moduleId hoặc stationId
  let matchedChunk = MATH_KNOWLEDGE_BASE.find(
    (chunk) => chunk.stationId === stationId || chunk.moduleId === moduleId
  );

  // Nếu không khớp chính xác, lấy chunk theo moduleId
  if (!matchedChunk) {
    matchedChunk = MATH_KNOWLEDGE_BASE.find((c) => c.moduleId === moduleId) || MATH_KNOWLEDGE_BASE[0];
  }

  // 2. Tìm thông tin từ STATION_CATALOG
  const stationInfo = STATION_CATALOG.find((s) => s.id === stationId);
  const moduleInfo = CORE_7_MODULES.find((m) => m.id === moduleId);

  // 3. Xây dựng tài liệu ngữ cảnh RAG hoàn chỉnh
  const stepNames = [
    "1. Nhìn thấy (Trực quan hóa)",
    "2. Dự đoán (Hình thành giả thuyết)",
    "3. Thao tác (Tương tác biến số)",
    "4. Khám phá (Chẩn đoán ngộ nhận)",
    "5. Kiểm chứng (Đối chiếu định lượng)",
    "6. Giải thích (Lập luận toán học)",
    "7. Chuyển giao (Vận dụng tương đồng)",
    "8. Rèn luyện độc lập (Khắc sâu kiến thức)",
  ];

  const currentStepDesc = typeof stepNumber === "number" && stepNumber >= 0 && stepNumber < stepNames.length
    ? stepNames[stepNumber]
    : "Khám phá tự do";

  const contextLines: string[] = [
    `CHỦ ĐỀ & BÀI HỌC: ${matchedChunk.topic}`,
    `NGUỒN HỌC LIỆU: ${matchedChunk.sgkSource}`,
    `MÔ PHỎNG & TRẠM HỌC: Trạm ${stationId || moduleInfo?.defaultStationId || "SGK"} - ${stationInfo?.title || matchedChunk.topic}`,
    `MỤC TIÊU SƯ PHẠM: ${stationInfo?.goal || moduleInfo?.goal || ""}`,
    `GIAI ĐOẠN NHẬN THỨC HIỆN TẠI: ${currentStepDesc}`,
    ...(userQuery && userQuery.trim() ? [`VẤN ĐỀ HỌC SINH ĐANG QUAN TÂM: ${userQuery.trim()}`] : []),
    `KHÁI NIỆM TOÁN HỌC CỐT LÕI:`,
    ...matchedChunk.coreConcepts.map((c) => `  - ${c}`),
    `CÔNG THỨC TOÁN HỌC CHUẨN:`,
    ...matchedChunk.keyFormulas.map((f) => `  - ${f}`),
    `BẪY NGỘ NHẬN THƯỜNG GẶP CỦA HỌC SINH (CẦN CHẨN ĐOÁN):`,
    ...matchedChunk.commonMisconceptions.map((m) => `  - [LỖI] ${m}`),
    `GỢI Ý CÂU HỎI SOCRATIC ĐỊNH HƯỚNG:`,
    ...matchedChunk.socraticGuidance.map((g) => `  - ${g}`),
  ];

  return contextLines.join("\n");
}
