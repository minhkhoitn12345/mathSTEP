// RAG Engine (Retrieval-Augmented Generation) Toán Học Chuẩn SGK GDPT 2018 & Đề Cương KHKT MathSTEP
// Tích hợp: 
// 1. Lý luận sư phạm: Raymond Duval (Hệ thống biểu đạt), Newman (5 tầng lỗi), Polya (4 bước & 3 hướng nhìn lại), Paul & Elder (Socratic)
// 2. Ma trận 17 mã lỗi nhận thức (M01 - M17) & 10 mã lỗi thực nghiệm (E01 - E10)
// 3. Yêu cầu cần đạt 4 mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) chuẩn Bộ GD&ĐT (Thông tư 32/2018)
// 4. Cẩm nang 5 Bài học cốt lõi (Module 1 - 5) của OPTIMATH LAB

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
  pedagogicalLayer?: string;
  newmanLevel?: string;
  evaluationStandards?: string[];
}

export const MATH_KNOWLEDGE_BASE: MathKnowledgeChunk[] = [
  // =========================================================================
  // TOÁN 10 - CHƯƠNG II: BẤT PHƯƠNG TRÌNH & HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN
  // =========================================================================
  {
    moduleId: "linear_programming",
    stationId: "10.01",
    topic: "Bài 1: Bất Phương Trình Bậc Nhất Hai Ẩn & Đại Số Nghiệm",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 1 (Trang 22-26); CTST & Cánh Diều",
    pedagogicalLayer: "Duval: Phép biến đổi nội tại (Treatment) & Chuyển đổi đại số -> cặp số",
    newmanLevel: "Tầng 1 (Đọc đề) & Tầng 2 (Hiểu đề) & Tầng 4 (Kỹ năng tính)",
    evaluationStandards: [
      "Nhận biết (Mức 1): Nhận dạng đúng dạng chuẩn ax + by [op] c với a^2 + b^2 > 0.",
      "Thông hiểu (Mức 2): Kiểm tra tính đúng/sai của mệnh đề khi thay tọa độ cặp số (x0; y0) vào vế trái LHS.",
      "Vận dụng (Mức 3): Nhận thức được tính chất 'vô số nghiệm' của BPT bậc nhất hai ẩn thay vì một giá trị đơn lẻ.",
    ],
    coreConcepts: [
      "Dạng tổng quát: ax + by < c (hoặc <=, >, >=) với a, b không đồng thời bằng 0 (a^2 + b^2 > 0).",
      "Khái niệm nghiệm: Mỗi cặp số (x0; y0) thỏa mãn a*x0 + b*y0 [op] c được gọi là một nghiệm của bất phương trình.",
      "Tập nghiệm là một miền vô số nghiệm: Khác với phương trình bậc nhất hai ẩn có tập nghiệm là một đường thẳng, tập nghiệm của BPT lấp đầy một nửa mặt phẳng.",
    ],
    keyFormulas: [
      "$ax + by \\le c$",
      "$LHS = a \\cdot x_0 + b \\cdot y_0$",
      "Điều kiện tồn tại: $a^2 + b^2 > 0$",
    ],
    commonMisconceptions: [
      "[M01] Đồng nhất bất phương trình với phương trình: Rút y = (c - ax)/b rồi kết luận nghiệm chỉ là các điểm trên đường thẳng.",
      "[M05] Sai sót trong phép tính đại số với số âm: Quên dấu ngoặc khi thay x0 âm hoặc quên đổi chiều BPT khi chia số âm.",
    ],
    socraticGuidance: [
      "Câu hỏi phản ví dụ (M01): 'Em hãy thử lấy một điểm KHÔNG nằm trên đường thẳng d, ví dụ O(0; 0), thay vào BPT xem có thỏa mãn không? Vậy nghiệm chỉ là đường thẳng hay cả một vùng mặt phẳng?'",
      "Câu hỏi làm rõ (M05): 'Khi thay số âm vào vế trái, em đã viết dấu ngoặc đơn a*(x0) chưa? Tích của hệ số âm với số âm mang dấu gì?'",
    ],
  },

  {
    moduleId: "linear_programming",
    stationId: "10.02",
    topic: "Bài 2: Biểu Diễn Hình Học Miền Nghiệm & Quy Trình 7 Bước SGK",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 1 (Trang 26-28); Quy chuẩn GDPT 2018",
    pedagogicalLayer: "Duval: Phép chuyển đổi biểu đạt (Conversion) Đại số <-> Hình học Oxy",
    newmanLevel: "Tầng 4 (Process Skills - Kỹ năng vẽ bờ & Gạch miền)",
    evaluationStandards: [
      "Thông hiểu (Mức 2): Vẽ chính xác đường thẳng bờ d: ax + by = c kéo dài hai phía; phân biệt nét liền (<=, >=) và nét đứt (<, >).",
      "Thông hiểu (Mức 2): Chọn điểm thử M0 không thuộc d (ưu tiên O(0;0) nếu c != 0; chọn P(1;0) nếu c = 0).",
      "Quy ước SGK Việt Nam: Gạch bỏ phần mặt phẳng không phải là miền nghiệm, phần giữ trắng là miền nghiệm.",
    ],
    coreConcepts: [
      "Đường thẳng bờ d: ax + by = c chia mặt phẳng tọa độ Oxy thành hai nửa mặt phẳng đối nhau.",
      "Quy tắc nét vẽ bờ: Có dấu bằng (<=, >=) vẽ NÉT LIỀN (lấy cả bờ); Dấu ngặt (<, >) vẽ NÉT ĐỨT (không lấy bờ).",
      "Nguyên tắc điểm thử: Điểm M0 bắt buộc KHÔNG ĐƯỢC NẰM TRÊN BỜ (ax0 + by0 != c).",
      "Khi c = 0: Đường bờ đi qua gốc tọa độ O(0; 0), TUYỆT ĐỐI KHÔNG DÙNG O(0;0) LÀM ĐIỂM THỬ; phải dùng P(1; 0) hoặc Q(0; 1).",
    ],
    keyFormulas: [
      "Đường bờ: $d: ax + by = c$",
      "Giao trục tọa độ: $A(0;\\, \\frac{c}{b})$, $B(\\frac{c}{a};\\, 0)$",
      "Quy tắc gạch: $M_0$ thỏa mãn $\\rightarrow$ gạch nửa KHÔNG chứa $M_0$; $M_0$ sai $\\rightarrow$ gạch nửa CHỨA $M_0$.",
    ],
    commonMisconceptions: [
      "[M03] Xác định nhầm vị trí điểm trên hai trục: Chấm điểm (0; 3) lên trục Ox và (2; 0) lên trục Oy.",
      "[M04] Vẽ đoạn thẳng ngắn cụt giữa 2 trục thay vì đường thẳng vô hạn chia đôi mặt phẳng.",
      "[M06] Lúng túng với BPT khuyết ẩn như x >= 0, y <= 3 (không biết vẽ đường thẳng song song trục).",
      "[M07] Nhớ mẹo vẹt 'lớn lấy phải, nhỏ lấy trái' dẫn đến sai khi hệ số a mang dấu âm.",
      "[M08] Chọn điểm thử O(0;0) ngay cả khi đường thẳng bờ đi qua gốc tọa độ (c = 0).",
      "[M09] Nhầm lẫn quy ước gạch bỏ: Điểm thử đúng lại đi gạch luôn miền chứa điểm thử.",
      "[M10] Quên quy tắc nét đứt khi BPT mang dấu ngặt (<, >).",
    ],
    socraticGuidance: [
      "Phản ví dụ điểm thử trên bờ (M08): 'Điểm O(0;0) đang nằm ở đâu so với đường thẳng 2x - y = 0? Một điểm nằm ngay trên ranh giới có thể đại diện cho nửa bên này hay nửa bên kia không?'",
      "Phản ví dụ mẹo vẹt (M07): 'Với BPT -x + 2y > 4, em thử lấy điểm M(5; 0) ở bên phải thay vào xem mệnh đề nhận được là đúng hay sai? Vì sao lại ngược lại?'",
      "Nhắc nhở nét vẽ (M10): 'Bất phương trình có lấy các điểm nằm đúng trên bờ không? Nếu không lấy thì quy ước SGK dùng nét gì?'",
    ],
  },

  {
    moduleId: "linear_programming",
    stationId: "10.03",
    topic: "Bài 3: Hệ Bất Phương Trình Bậc Nhất Hai Ẩn & Miền Đa Giác Lồi",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 2 (Trang 28-31); Bản đặc tả Bộ GD&ĐT",
    pedagogicalLayer: "Duval: Phép giao nhiều nửa mặt phẳng & Xác định tập lồi đa giác",
    newmanLevel: "Tầng 4 (Process Skills) - Lọc đỉnh khả thi & Giải hệ tọa độ",
    evaluationStandards: [
      "Thông hiểu (Mức 2): Biểu diễn lần lượt từng nửa mặt phẳng và xác định miền giao không bị gạch bỏ.",
      "Thông hiểu (Mức 2): Giải đúng hệ phương trình từng cặp đường bờ để tìm tọa độ các đỉnh (Vertices) thay vì ước lượng bằng mắt.",
      "Vận dụng (Mức 3): Nhận diện miền đa giác đóng bị chặn, miền mở hoặc miền rỗng.",
    ],
    coreConcepts: [
      "Miền nghiệm của hệ BPT là phần giao của các miền nghiệm của từng BPT trong hệ.",
      "Miền nghiệm thường là một miền đa giác lồi (tam giác, tứ giác, ngũ giác) hoặc miền không bị chặn.",
      "Tọa độ các đỉnh của miền đa giác là giao điểm của các cặp đường thẳng bờ thỏa mãn đồng thời tất cả BPT còn lại.",
      "Quy ước SGK: Gạch lần lượt các miền không thỏa mãn của từng BPT; phần trắng còn lại duy nhất chính là miền đa giác nghiệm.",
    ],
    keyFormulas: [
      "Hệ: $\\begin{cases} a_1 x + b_1 y \\le c_1 \\\\ a_2 x + b_2 y \\le c_2 \\\\ x \\ge 0,\\, y \\ge 0 \\end{cases}$",
      "Giao điểm đỉnh $I(x, y)$: nghiệm của hệ $\\begin{cases} a_i x + b_i y = c_i \\\\ a_j x + b_j y = c_j \\end{cases}$",
    ],
    commonMisconceptions: [
      "[M02] Nhầm lẫn phép giao với phép hợp: Thử điểm chỉ thỏa 1 BPT đã kết luận thuộc miền nghiệm của hệ.",
      "[M11] Gạch quá dày và cùng hướng làm đen toàn bộ mặt phẳng, mất dấu miền đa giác trắng.",
      "[M16] Ước lượng tọa độ đỉnh bằng mắt thường từ hình vẽ tay dẫn đến sai số (đặc biệt đỉnh phân số).",
      "[M17] Bối rối khi phần mềm GeoGebra tô màu miền nghiệm ngược với cách gạch bỏ trong SGK.",
    ],
    socraticGuidance: [
      "Kiểm tra tính thỏa mãn đồng thời (M02): 'Để một điểm thuộc nghiệm của HỆ, nó cần thỏa mãn một vài BPT hay TẤT CẢ các BPT trong hệ?'",
      "Khắc phục sai số hình vẽ (M16): 'Đỉnh B là giao của 2 đường bờ nào? Để tìm tọa độ chính xác tuyệt đối mà nét vẽ tay không làm sai lệch, em cần giải hệ phương trình nào?'",
      "Định hướng gạch hình (M11): 'Hãy gạch các đường nghiêng thưa và đổi góc nghiêng cho từng BPT để phần trắng lộ rõ nhất nhé!'",
    ],
  },

  {
    moduleId: "linear_programming",
    stationId: "10.04",
    topic: "Bài 4: Mô Hình Hóa & Tối Ưu Hóa Tuyến Tính Thực Tiễn (Bài Toán Xưởng Mộc)",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 2 (Trang 30-33); Đề cương KHKT MathSTEP",
    pedagogicalLayer: "Newman: Đọc đề (R) -> Hiểu đề (C) -> Chuyển hóa (T) -> Thực hiện (P) -> Kết luận (E)",
    newmanLevel: "Tầng 3 (Chuyển hóa) & Tầng 5 (Kết luận thực tế)",
    evaluationStandards: [
      "Vận dụng (Mức 3): Gọi ẩn x, y kèm đơn vị và điều kiện thực tế (x >= 0, y >= 0, x, y thuộc N).",
      "Vận dụng (Mức 3): Kiểm soát tính đồng nhất đơn vị hai vế, lập đúng hệ BPT ràng buộc tài nguyên.",
      "Vận dụng (Mức 3): Lập bảng tính giá trị F(x, y) = ax + by tại tất cả các đỉnh và kết luận phương án tối ưu.",
      "Vận dụng cao (Mức 4): Xử lý bài toán khi thay đổi tham số hoặc bài toán tối ưu suy biến.",
    ],
    coreConcepts: [
      "Định lý giá trị tối ưu: Biểu thức F(x, y) = ax + by đạt giá trị lớn nhất (hoặc nhỏ nhất) tại ít nhất một đỉnh của miền đa giác lồi bị chặn.",
      "Nguyên tắc đồng nhất đơn vị: Các số hạng trong một vế và hai vế của một BPT phải có cùng bản chất đại lượng và cùng đơn vị đo.",
      "Quy trình 4 giai đoạn Polya: (1) Lập mô hình -> (2) Biểu diễn miền đa giác -> (3) Tính F tại các đỉnh -> (4) Nhìn lại 3 phương diện (đối chiếu điều kiện nguyên, tối ưu trình bày, mở rộng khi thay đổi giá bán).",
    ],
    keyFormulas: [
      "Hàm mục tiêu: $F(x, y) = ax + by$ (lợi nhuận hoặc chi phí)",
      "Định lý cực trị miền đa giác: $F_{\\max} = \\max\\{F(O), F(A), F(B), F(C)\\}$",
      "Ví dụ chuẩn: Xưởng mộc bàn ghế: $3x + 2y \\le 48$, $x + 2y \\le 32$, $7x - 2y \\ge 0$, $x, y \\ge 0$",
      "Đỉnh tối ưu: $B(8; 12) \\rightarrow F_{\\max} = 600(8) + 450(12) = 10.200$ (nghìn đồng)",
    ],
    commonMisconceptions: [
      "[M12] Dịch sai chiều dấu: 'không quá / tối đa C' (<= C) lại viết thành (>= C); 'ít nhất / tối thiểu' lại viết (<=).",
      "[M13] Ghép nhầm các đại lượng khác bản chất: cộng protein với lipit rồi so sánh với tổng protein.",
      "[M14] Quên điều kiện thực tế x >= 0, y >= 0 hoặc quên x, y thuộc N (sản phẩm nguyên chiếc).",
      "[M15] Đưa luôn biểu thức tiền lãi F = ax + by vào trong hệ BPT để vẽ đường bờ ngay từ đầu.",
    ],
    socraticGuidance: [
      "Kiểm tra đơn vị hai vế (M13): 'Con số ở vế phải có đơn vị là gì? Vế trái của em cộng hai số hạng có cùng đơn vị đó chưa?'",
      "Kiểm tra ngữ nghĩa giới hạn (M12): 'Cụm từ \"không quá 8 giờ\" nghĩa là đúng bằng 8 giờ có được chấp nhận không? Lớn hơn 8 giờ có được phép không?'",
      "Phân biệt vai trò của F (M15): 'Biểu thức tiền lãi F đã có con số giới hạn cố định chưa, hay là đại lượng ta cần tìm giá trị lớn nhất ở bước cuối cùng?'",
      "Nhìn lại Polya Phương diện 3: 'Nếu tiền lãi một chiếc bàn đổi thành 300k và ghế đổi thành 600k, miền tứ giác OABC có đổi không? Ta chỉ cần tính lại bước nào?'",
    ],
  },

  {
    moduleId: "linear_programming",
    stationId: "10.05",
    topic: "Bài 5: Chẩn Đoán 10 Mã Lỗi E01–E10 & Sư Phạm Phản Hồi 3 Tầng",
    grade: 10,
    sgkSource: "Khung Newman Error Analysis & Đề cương KHKT MathSTEP",
    pedagogicalLayer: "Paul & Elder: Socratic Questioning 3 Tầng (Orientation -> Rule -> Correction)",
    newmanLevel: "Toàn diện 5 tầng lỗi Newman (Reading -> Comprehension -> Transformation -> Process -> Encoding)",
    evaluationStandards: [
      "Nhận diện chính xác 10 mã lỗi E01–E10 dựa trên thao tác hoặc câu trả lời của học sinh.",
      "Tầng 1: Đặt câu hỏi định hướng kích thích học sinh tự phát hiện mâu thuẫn.",
      "Tầng 2: Gợi ý phương pháp và quy tắc SGK.",
      "Tầng 3: Hướng dẫn sửa chữa chi tiết và sinh bài tập tương đương (Near-transfer).",
    ],
    coreConcepts: [
      "E01: Thay tọa độ sai (nhầm hoành/tung hoặc tính sai dấu).",
      "E02: Nhầm dấu bất phương trình (nhầm nét đứt/liền hoặc nhầm chiều chia số âm).",
      "E03: Chọn sai điểm trên đường biên khi vẽ bờ.",
      "E04: Chọn điểm thử nằm ngay trên đường biên (đặc biệt khi c = 0).",
      "E05: Chọn sai nửa mặt phẳng nghiệm sau khi thử điểm.",
      "E06: Tính sai tọa độ giao điểm hai đường bờ.",
      "E07: Chọn điểm không thỏa mãn toàn bộ hệ.",
      "E08: Lập sai ràng buộc thực tế (dịch sai từ ngữ, sai đơn vị).",
      "E09: Xác định sai hàm mục tiêu hoặc nhầm MAX với MIN.",
      "E10: Kết luận tối ưu sai (bỏ sót đỉnh phân số, tự ý làm tròn nghiệm nguyên).",
    ],
    keyFormulas: [
      "Bộ mã phân loại: E01 -> E10",
      "Tiến trình phản hồi 3 tầng: $H_1$ (Orientation) -> $H_2$ (Rule) -> $H_3$ (Correction)",
    ],
    commonMisconceptions: [
      "Học sinh lặp lại lỗi cũ nếu giáo viên cung cấp ngay đáp án thay vì dùng câu hỏi gợi mở Socratic.",
      "Tự ý làm tròn nghiệm tối ưu phân số mà không kiểm tra lại tính khả thi của điểm nguyên lân cận.",
    ],
    socraticGuidance: [
      "Gợi ý 3 tầng mẫu (E04): H1: 'Điểm thử em chọn có vị trí như thế nào với đường bờ?' -> H2: 'Quy tắc SGK: Điểm thử bắt buộc KHÔNG ĐƯỢC thuộc bờ' -> H3: 'Vì bờ qua O(0,0), hãy chọn P(1, 0) để thử.'",
    ],
  },

  // =========================================================================
  // CÁC CHUYÊN ĐỀ LỚP 11 & 12 ĐÃ CHUẨN HÓA
  // =========================================================================
  {
    moduleId: "spatial_geometry",
    stationId: "11.06",
    topic: "Hình chóp tứ giác đều S.ABCD: Cạnh thấy vs Cạnh khuất",
    grade: 11,
    sgkSource: "SGK Hình học 11 KNTT · Chương IV Bài 11 (Trang 78-83)",
    coreConcepts: [
      "Quy ước nét vẽ: Nét liền biểu diễn cạnh nhìn thấy, nét đứt biểu diễn cạnh bị che khuất.",
      "Đường cao của hình chóp đều: Đoạn thẳng nối đỉnh S với tâm H của đa giác đáy, SH vuông góc với (ABCD).",
      "Tọa độ hóa không gian: Chọn gốc O tại tâm H hoặc đỉnh A để giải tích hóa các đỉnh chóp.",
    ],
    keyFormulas: [
      "$SH \\perp (ABCD)$ tại tâm đáy $H$",
      "$V = \\frac{1}{3} S_{ABCD} \\cdot h$",
      "Độ dài cạnh bên: $SA = \\sqrt{SH^2 + HA^2}$",
    ],
    commonMisconceptions: [
      "Học sinh nhầm lẫn đường cao hình chóp SH với trung đoạn kẻ từ S xuống cạnh đáy.",
      "Học sinh mặc định cạnh đáy nào nằm phía sau cũng luôn là nét đứt mà không nhận ra khi xoay 180 độ thì cạnh đó trở thành cạnh nhìn thấy.",
    ],
    socraticGuidance: [
      "Hãy hướng dẫn học sinh xoay mô hình 3D từ từ và quan sát cạnh đáy CD: Khi nào nó chuyển từ nét đứt sang nét liền?",
      "Đặt câu hỏi: 'Nếu đường cao SH vuông góc với đáy, thì tam giác SHA là tam giác gì? Đoạn HA bằng bao nhiêu phần đường chéo AC?'",
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
    ],
    keyFormulas: [
      "$\\sin^2 \\alpha + \\cos^2 \\alpha = 1$",
      "$\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$ $(\\alpha \\ne \\frac{\\pi}{2} + k\\pi)$",
      "$y = A \\sin(\\omega x + \\varphi) + d$",
    ],
    commonMisconceptions: [
      "Nhầm trục hoành là trục Sin, trục tung là trục Cos.",
      "Quên rằng sin(x + 2pi) = sin x.",
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
    ],
    keyFormulas: [
      "$y' = 3ax^2 + 2bx + c$ đối với hàm bậc ba",
      "Tiếp tuyến: $y = f'(x_0)(x - x_0) + f(x_0)$",
    ],
    commonMisconceptions: [
      "Đồng nhất giá trị cực đại với giá trị lớn nhất toàn cục của hàm số.",
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
      "Xấp xỉ Riemann: Chia đoạn [a, b] thành n đoạn nhỏ, tính tổng diện tích n hình chữ nhật.",
    ],
    keyFormulas: [
      "$S = \\int_a^b |f(x)|\\,dx$",
      "$V = \\pi \\int_a^b [f(x)]^2\\,dx$",
    ],
    commonMisconceptions: [
      "Quên nhân hệ số pi trong công thức thể tích khối tròn xoay.",
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
      "Công thức Bayes: Cập nhật xác suất sau khi biết biến cố B đã xảy ra.",
    ],
    keyFormulas: [
      "$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$",
      "$P(A_k|B) = \\frac{P(A_k) P(B|A_k)}{\\sum_{i=1}^n P(A_i) P(B|A_i)}$",
    ],
    commonMisconceptions: [
      "Học sinh đánh đồng P(A|B) và P(B|A) (Nghịch lý công tố viên).",
    ],
    socraticGuidance: [
      "Hỏi: 'Biết rằng viên bi rút ra màu Đỏ, điều này làm tăng hay giảm khả năng viên bi đó đến từ Hộp 1?'",
    ],
  },
];

/**
 * RAG Retriever: Tìm kiếm và trích xuất ngữ cảnh kiến thức SGK & Sư phạm phù hợp nhất
 */
export function retrieveMathKnowledge(
  moduleId: string,
  stationId?: string,
  stepNumber?: number,
  userQuery?: string
): string {
  // 1. Tìm chunk khớp chính xác nhất với stationId hoặc moduleId
  let matchedChunk = MATH_KNOWLEDGE_BASE.find(
    (chunk) => (stationId && chunk.stationId === stationId) || chunk.moduleId === moduleId
  );

  // Nếu không khớp chính xác, fallback theo moduleId
  if (!matchedChunk) {
    matchedChunk = MATH_KNOWLEDGE_BASE.find((c) => c.moduleId === moduleId) || MATH_KNOWLEDGE_BASE[0];
  }

  // 2. Tìm thông tin từ STATION_CATALOG
  const stationInfo = STATION_CATALOG.find((s) => s.id === stationId);
  const moduleInfo = CORE_7_MODULES.find((m) => m.id === moduleId);

  // 3. Tiến trình 8 bước nhận thức của MathSTEP
  const stepNames = [
    "1. Nhìn thấy (Trực quan hóa hình ảnh)",
    "2. Dự đoán (Hình thành phán đoán ban đầu)",
    "3. Thao tác (Tương tác trực tiếp trên mô hình)",
    "4. Khám phá (Chẩn đoán ngộ nhận & Bắt lỗi)",
    "5. Kiểm chứng (Đối chiếu định lượng & Đại số)",
    "6. Giải thích (Lập luận bán cấu trúc)",
    "7. Chuyển giao (Vận dụng tương đồng)",
    "8. Rèn luyện độc lập (Khắc sâu kiến thức)",
  ];

  const currentStepDesc = typeof stepNumber === "number" && stepNumber >= 0 && stepNumber < stepNames.length
    ? stepNames[stepNumber]
    : "Khám phá tự do";

  const contextLines: string[] = [
    `CHỦ ĐỀ & BÀI HỌC: ${matchedChunk.topic}`,
    `NGUỒN HỌC LIỆU SGK: ${matchedChunk.sgkSource}`,
    `TRẠM HỌC HIỆN TẠI: Trạm ${stationId || moduleInfo?.defaultStationId || "SGK"} - ${stationInfo?.title || matchedChunk.topic}`,
    `TIẾN TRÌNH NHẬN THỨC 8 BƯỚC: ${currentStepDesc}`,
    ...(matchedChunk.pedagogicalLayer ? [`NỀN TẢNG SƯ PHẠM (DUVAL/POLYA/NEWMAN): ${matchedChunk.pedagogicalLayer}`] : []),
    ...(matchedChunk.newmanLevel ? [`TẦNG LỖI NEWMAN TIÊU ĐIỂM: ${matchedChunk.newmanLevel}`] : []),
    ...(matchedChunk.evaluationStandards && matchedChunk.evaluationStandards.length > 0 ? [
      `CHUẨN ĐÁNH GIÁ GDPT 2018 (BỘ GD&ĐT):`,
      ...matchedChunk.evaluationStandards.map((s) => `  * ${s}`),
    ] : []),
    ...(userQuery && userQuery.trim() ? [`VẤN ĐỀ HỌC SINH ĐANG HỎI: ${userQuery.trim()}`] : []),
    `KHÁI NIỆM TOÁN HỌC CỐT LÕI:`,
    ...matchedChunk.coreConcepts.map((c) => `  - ${c}`),
    `CÔNG THỨC TOÁN HỌC CHUẨN SGK:`,
    ...matchedChunk.keyFormulas.map((f) => `  - ${f}`),
    `MA TRẬN LỖI NHẬN THỨC CẦN CHẨN ĐOÁN (M01-M17 & E01-E10):`,
    ...matchedChunk.commonMisconceptions.map((m) => `  - ${m}`),
    `KỊCH BẢN CÂU HỎI GỢI MỞ SOCRATIC (PAUL & ELDER - TUYỆT ĐỐI KHÔNG DÙNG CÂU HỎI CÓ/KHÔNG):`,
    ...matchedChunk.socraticGuidance.map((g) => `  - ${g}`),
  ];

  return contextLines.join("\n");
}
