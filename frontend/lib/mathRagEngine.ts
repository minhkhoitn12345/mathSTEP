// RAG Engine (Retrieval-Augmented Generation) Toán Học Chuẩn GDPT 2018 & 3 Chuyên Đề Nghiên Cứu KHKT MathSTEP
// Module 1: Bất phương trình & Quy hoạch tuyến tính (Toán 10 - Đề cương KHKT Chú Chum & SGK KNTT/CTST/Cánh Diều)
// Module 2: Dựng hình và khảo sát quan hệ Hình học không gian 3D (Toán 11 - Chuyên đề 2, Task SG-M2-01, SG01-SG16)
// Module 3: Khảo sát các quan hệ Lượng giác tương tác (Toán 11 - Chuyên đề 3, Task LG-MH01-MH05, E01-E16)

export interface MathKnowledgeChunk {
  moduleId: "linear_programming" | "spatial_geometry" | "trigonometry";
  lessonId: string;
  topic: string;
  grade: 10 | 11;
  sgkSource: string;
  coreConcepts: string[];
  keyFormulas: string[];
  commonMisconceptions: string[];
  socraticGuidance: string[];
  pedagogicalLayer?: string;
  newmanLevel?: string;
  evaluationStandards?: string[];
}

export const MATH_KNOWLEDGE_BASE: MathKnowledgeChunk[] = [
  // =========================================================================
  // CHUYÊN ĐỀ 1: BẤT PHƯƠNG TRÌNH & QUY HOẠCH TUYẾN TÍNH (TOÁN 10)
  // =========================================================================
  {
    moduleId: "linear_programming",
    lessonId: "lp-lesson-1",
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
    lessonId: "lp-lesson-2",
    topic: "Bài 2: Quy Trình 7 Bước Biểu Diễn Miền Nghiệm Chuẩn SGK",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 1 (Trang 24-25); Đề cương KHKT",
    pedagogicalLayer: "Duval: Phép chuyển đổi biểu đạt (Conversion) Đại số -> Hình học Oxy",
    newmanLevel: "Tầng 4 (Kỹ năng thực hiện): Vẽ bờ và gạch nửa mặt phẳng",
    evaluationStandards: [
      "Thông hiểu (Mức 2): Thực hiện đúng 7 bước SGK, phân biệt nét liền (<=, >=) và nét đứt (<, >).",
      "Kỹ năng: Chọn điểm thử M0 không thuộc bờ d. Tuyệt đối KHÔNG chọn O(0,0) khi c = 0.",
      "Quy ước SGK: Gạch bỏ phần không thỏa mãn, phần không bị gạch (giữ trắng) là miền nghiệm.",
    ],
    coreConcepts: [
      "Bước 1: Nhận diện hệ số a, b, c và toán tử [op].",
      "Bước 2: Xác định kiểu nét vẽ đường bờ: Nét liền (<=, >=) hoặc Nét đứt (<, >).",
      "Bước 3: Xác định 2 điểm cắt trục A(c/a, 0) và B(0, c/b).",
      "Bước 4: Vẽ đường thẳng bờ d kéo dài vô hạn về hai phía.",
      "Bước 5: Chọn điểm thử M0(x0, y0) KHÔNG THUỘC đường thẳng d (nếu c != 0 chọn O(0,0); nếu c = 0 chọn P(1,0) hoặc Q(0,1)).",
      "Bước 6: Tính LHS và so sánh với RHS để kết luận nửa mặt phẳng nghiệm.",
      "Bước 7: Kết luận sư phạm tường minh, chỉ rõ lấy biên hay không lấy biên.",
    ],
    keyFormulas: [
      "Đường thẳng bờ: $d: ax + by = c$",
      "Giao điểm trục: $A(\\frac{c}{a}; 0)$, $B(0; \\frac{c}{b})$",
      "Quy ước: Gạch phần sai, giữ trắng miền đúng.",
    ],
    commonMisconceptions: [
      "[M06] Vẽ đoạn thẳng hữu hạn cụt thay vì đường thẳng kéo dài, làm mặt phẳng không bị chia cắt rõ ràng.",
      "[M07] Áp dụng mẹo truyền miệng 'lớn phải nhỏ trái' gây sai lầm khi hệ số a < 0.",
      "[M08] Chọn điểm thử O(0,0) khi đường bờ d đi qua gốc tọa độ (c = 0), dẫn đến 0 = 0 vô nghĩa.",
    ],
    socraticGuidance: [
      "Câu hỏi định vị (M08): 'Đường thẳng 7x - 2y = 0 có đi qua O(0,0) không? Một điểm nằm ngay trên đường ranh giới có thể đại diện cho nửa mặt phẳng bên này hay bên kia không? Hãy chọn P(1, 0) để thử.'",
      "Câu hỏi phản ví dụ (M07): 'Với BPT -x + 2y > 4, em thử lấy M(1, 0) ở bên phải thay vào xem mệnh đề đúng hay sai? Vậy mẹo lớn phải có luôn đúng không?'",
    ],
  },
  {
    moduleId: "linear_programming",
    lessonId: "lp-lesson-3",
    topic: "Bài 3: Hệ Bất Phương Trình Bậc Nhất Hai Ẩn & Miền Đa Giác Lồi",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 2 (Trang 26-28)",
    pedagogicalLayer: "Duval: Chuyển đổi giao các nửa mặt phẳng thành đa giác lồi đóng",
    newmanLevel: "Tầng 4 (Kỹ năng thực hiện) & Tầng 5 (Trình bày)",
    evaluationStandards: [
      "Thông hiểu (Mức 2): Xác định miền nghiệm là giao của các nửa mặt phẳng.",
      "Vận dụng (Mức 3): Tìm tọa độ các đỉnh của miền đa giác bằng cách giải hệ phương trình hai đường thẳng cắt nhau.",
    ],
    coreConcepts: [
      "Nghiệm của hệ là cặp số (x0; y0) thỏa mãn đồng thời TẤT CẢ các bất phương trình trong hệ.",
      "Miền nghiệm của hệ là phần giao của các miền nghiệm thành phần, thường là một miền đa giác lồi.",
      "Tọa độ đỉnh đa giác phải được tính bằng giải hệ 2 phương trình bậc nhất hai ẩn, KHÔNG được ước lượng bằng mắt.",
    ],
    keyFormulas: [
      "Hệ: $\\begin{cases} a_1 x + b_1 y \\le c_1 \\\\ a_2 x + b_2 y \\le c_2 \\\\ x \\ge 0, y \\ge 0 \\end{cases}$",
      "Tọa độ đỉnh: Nghiệm của $\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$",
    ],
    commonMisconceptions: [
      "[M02] Nhầm lẫn giữa phép giao và phép hợp: Chỉ kiểm tra 1 BPT thỏa mãn đã vội kết luận là nghiệm của cả hệ.",
      "[M10] Rối hình khi giao nhiều miền: Gạch nét quá dày làm mất dấu miền trắng.",
      "[M16] Ước lượng tọa độ đỉnh bằng mắt thường thay vì giải hệ phương trình đại số.",
    ],
    socraticGuidance: [
      "Câu hỏi logic (M02): 'Điểm A có thỏa mãn BPT thứ hai không? Nghiệm của hệ đòi hỏi thỏa mãn MỘT BPT hay TẤT CẢ các BPT?'",
      "Câu hỏi kiểm chứng (M16): 'Đỉnh B là giao điểm của hai đường bờ nào? Để tìm tọa độ chính xác tuyệt đối không bị sai số nét vẽ, em cần giải hệ phương trình nào?'",
    ],
  },
  {
    moduleId: "linear_programming",
    lessonId: "lp-lesson-4",
    topic: "Bài 4: Mô Hình Hóa & Bài Toán Tối Ưu Xưởng Mộc (SGK Trang 26-30)",
    grade: 10,
    sgkSource: "SGK Toán 10 KNTT · Chương II Bài 2 (Trang 26-30); Đề cương KHKT",
    pedagogicalLayer: "Duval: Chuyển đổi Ngôn ngữ tự nhiên -> Hệ đại số -> Miền đa giác -> Cực trị",
    newmanLevel: "Tầng 2 (Hiểu đề) -> Tầng 3 (Chuyển hóa) -> Tầng 5 (Kết luận)",
    evaluationStandards: [
      "Vận dụng (Mức 3): Thiết lập đúng hệ BPT ràng buộc từ tình huống thực tiễn, đồng nhất đơn vị.",
      "Vận dụng cao (Mức 4): Vận dụng định lý cực trị trên miền đa giác lồi để tìm max/min của F(x,y) = ax + by.",
      "Nhìn lại (Looking back - Polya): Kiểm tra lại điều kiện nguyên x, y in N và 3 phương diện suy ngẫm.",
    ],
    coreConcepts: [
      "Bài toán xưởng mộc: x (bàn), y (ghế). Điều kiện: x, y in N, x >= 0, y >= 0.",
      "Giờ lắp ráp: 1,5x + y <= 24 (hay 3x + 2y <= 48). Giờ hoàn thiện: x + 2y <= 32. Thị trường: y <= 3,5x (hay 7x - 2y >= 0).",
      "Hàm tiền lãi: F(x, y) = 600x + 450y (nghìn đồng).",
      "Miền nghiệm là tứ giác lồi OABC với O(0,0), A(4,14), B(8,12), C(16,0).",
      "Định lý cực trị: Giá trị lớn nhất/nhỏ nhất của F(x, y) luôn đạt tại một trong các đỉnh của miền đa giác.",
      "F(O)=0, F(A)=8.700, F(B)=10.200, F(C)=9.600 -> Max F đạt tại B(8, 12) = 10.200 nghìn đồng (10.200.000 đồng).",
    ],
    keyFormulas: [
      "$\\max F(x, y) = 600x + 450y$",
      "Hệ ràng buộc: $\\begin{cases} 3x + 2y \\le 48 \\\\ x + 2y \\le 32 \\\\ 7x - 2y \\ge 0 \\\\ x, y \\ge 0, x, y \\in \\mathbb{N} \\end{cases}$",
    ],
    commonMisconceptions: [
      "[M11] Dịch sai cụm từ định lượng: 'không vượt quá' phải dùng <= nhưng lại viết > hoặc <.",
      "[M12] Ghép các đại lượng khác bản chất (không đồng nhất đơn vị): Cộng thời gian với tiền bạc.",
      "[M13] Quên điều kiện thực tế: Quên x >= 0, y >= 0 hoặc x, y in N (số bàn ghế không thể là số âm hoặc phân số).",
      "[M14] Đưa hàm mục tiêu F(x,y) vào chung hệ BPT để vẽ đường bờ.",
    ],
    socraticGuidance: [
      "Câu hỏi đồng nhất (M12): 'Con số 24 ở vế phải có đơn vị là gì (giờ)? Vậy các số hạng ở vế trái phải có đơn vị là gì? Có thể lấy giờ cộng với tiền được không?'",
      "Câu hỏi điều kiện (M13): 'Số lượng bàn ghế xuất xưởng có thể là số âm hoặc số thập phân như 2,5 chiếc không?'",
      "Câu hỏi Looking Back (Polya): 'Nếu tiền lãi một chiếc bàn thay đổi thì miền tứ giác OABC có thay đổi không? Tại sao?'",
    ],
  },

  // =========================================================================
  // CHUYÊN ĐỀ 2: HÌNH HỌC KHÔNG GIAN 3D (TOÁN 11)
  // =========================================================================
  {
    moduleId: "spatial_geometry",
    lessonId: "sg-lesson-1",
    topic: "Chuyên Đề 2: Dựng Hình & Khảo Sát Quan Hệ Không Gian 3D (SG-M2-01)",
    grade: 11,
    sgkSource: "SGK Toán 11 KNTT · Chương IV Quan hệ song song trong không gian; Đề cương Chuyên đề 2",
    pedagogicalLayer: "Duval: Phép chuyển đổi biểu đạt Ngôn ngữ hình học -> Không gian 3D -> Hình chiếu 2D",
    newmanLevel: "Tầng 1 (Đọc giả thiết) -> Tầng 3 (Chuyển hóa ràng buộc) -> Tầng 4 (Thao tác dựng hình)",
    evaluationStandards: [
      "Nhận biết (Mức 1): Nhận diện đúng đối tượng điểm, đường thẳng, mặt phẳng và điều kiện xác định duy nhất.",
      "Thông hiểu (Mức 2): Chuyển đúng giả thiết thành tọa độ và ràng buộc phụ thuộc (trung điểm, tỉ số chia đoạn).",
      "Vận dụng (Mức 3): Khảo sát 360°, phân biệt nét thấy/nét khuất, xác định thiết diện đa giác lồi và trải phẳng không chồng lấn.",
    ],
    coreConcepts: [
      "Nhiệm vụ trọng tâm SG-M2-01: Cho hình chóp S.ABCD, đáy ABCD là hình bình hành tâm O. Điểm M là trung điểm SA. Điểm N thuộc đoạn SB và SN : NB = 2 : 1.",
      "Nguyên tắc dựng hình đúng giả thiết: Bảo toàn các quan hệ đã cho; KHÔNG tự biến hình chóp tổng quát thành hình chóp đều, không tự thêm vuông góc khi đề không cho (SG02).",
      "Quan sát không thay cho chứng minh: Xoay hình giúp phát hiện dự đoán, nhưng kết luận phải dựa trên căn cứ toán học (SG07, SG08).",
      "Nét thấy và nét khuất: Nét đứt phụ thuộc góc nhìn và sự che khuất của bề mặt, không phải thuộc tính cố định của cạnh (SG16).",
      "Mặt phẳng cắt & Thiết diện: Giao tuyến của mặt phẳng cắt qua M song song đáy tạo thành thiết diện lồi MPQR.",
      "Trải phẳng (Unfolding): Bảo toàn kích thước và diện tích từng mặt, không có phần trong chồng lấn (SG12, SG13).",
    ],
    keyFormulas: [
      "Tâm đáy: $O = \\frac{A + C}{2} = \\frac{B + D}{2}$",
      "Trung điểm: $M = \\frac{S + A}{2}$",
      "Tỉ số chia đoạn: $N = S + \\frac{2}{3}(B - S)$ (với $SN:NB = 2:1$)",
      "Thiết diện qua M song song đáy: $MPQR$ với $P, Q, R$ là trung điểm $SB, SC, SD$.",
    ],
    commonMisconceptions: [
      "[SG01] Bỏ sót điều kiện của đề bài: Quên dựng tâm O hoặc quên điều kiện trung điểm.",
      "[SG02] Tự thêm tính chất không được cho: Mặc định đáy là hình chữ nhật hoặc SA vuông góc với đáy.",
      "[SG04] Đặt điểm sai đối tượng: Đặt M nằm ngoài đoạn SA (thuộc đường thẳng nhưng không thuộc đoạn).",
      "[SG05] Xác định sai tỉ số chia đoạn: Nhầm SN:NB = 2:1 thành 1:2 (làm N nằm gần S hơn B).",
      "[SG07] Nhầm giao nhau trên ảnh với giao nhau trong không gian: Coi hai đường chéo nhau AB và SD là cắt nhau.",
      "[SG10] Giữ điểm ngoài cạnh làm đỉnh thiết diện: Lấy giao điểm trên phần kéo dài ngoài khối đa diện.",
      "[SG16] Hiểu sai nét thấy và nét khuất: Coi nét đứt là ký hiệu cố định hoặc ký hiệu song song.",
    ],
    socraticGuidance: [
      "Câu hỏi làm rõ (SG02): 'Đề bài cho đáy là hình bình hành, đề có cho góc vuông nào không? Nếu em dựng SA vuông góc đáy thì có đại diện cho mọi hình chóp thỏa đề không?'",
      "Câu hỏi tỉ số (SG05): 'Theo tỉ số SN:NB = 2:1, đoạn SN dài gấp mấy lần đoạn NB? Vậy điểm N phải nằm gần đỉnh S hơn hay gần B hơn?'",
      "Câu hỏi phản ví dụ (SG07): 'Hai đường thẳng AB và SD có cùng nằm trong một mặt phẳng nào không? Hãy xoay mô hình 3D sang góc nhìn khác: điểm giao nhau trên màn hình có còn trùng nhau không?'",
      "Câu hỏi thiết diện (SG10): 'Đỉnh của thiết diện bắt buộc phải nằm trên cạnh của khối đa diện hay được nằm trên phần kéo dài bên ngoài khối?'",
    ],
  },

  // =========================================================================
  // CHUYÊN ĐỀ 3: LƯỢNG GIÁC TƯƠNG TÁC (TOÁN 11)
  // =========================================================================
  {
    moduleId: "trigonometry",
    lessonId: "trig-lesson-1",
    topic: "Chuyên Đề 3: Khảo Sát Các Quan Hệ Lượng Giác Tương Tác (LG-MH01 - LG-MH05)",
    grade: 11,
    sgkSource: "SGK Toán 11 KNTT · Chương I Hàm số lượng giác và Phương trình lượng giác; Đề cương Chuyên đề 3",
    pedagogicalLayer: "Duval: Chuyển đổi biểu đạt Góc quay -> Điểm trên đường tròn đơn vị -> Đồ thị sóng -> Nghiệm",
    newmanLevel: "Tầng 1 (Đọc đơn vị) -> Tầng 3 (Biến đổi công thức) -> Tầng 4 (Kỹ năng vẽ đồ thị)",
    evaluationStandards: [
      "Nhận biết (Mức 1): Nhận diện đúng chiều quay (chiều dương ngược chiều kim đồng hồ), đơn vị độ và radian.",
      "Thông hiểu (Mức 2): Xác định đúng tọa độ điểm M(cos α; sin α), xét dấu trên bốn góc phần tư, phân biệt giá trị bằng 0 và không xác định.",
      "Vận dụng (Mức 3): Áp dụng cung liên kết, công thức nhân đôi, liên kết chu kỳ sóng T = 2pi và giải phương trình trên khoảng [a; b].",
    ],
    coreConcepts: [
      "Nhiệm vụ LG-MH01: Góc α = −765° = (−2) × 360° − 45°. Góc đại diện dương là 315° (7π/4), điểm cuối thuộc góc phần tư IV.",
      "Nhiệm vụ LG-MH02: Tọa độ điểm biểu diễn M(sqrt(2)/2; -sqrt(2)/2). sin = -sqrt(2)/2, cos = sqrt(2)/2, tan = -1, cot = -1.",
      "Phân biệt bằng 0 và không xác định: Tại pi/2, cot = 0 nhưng tan không xác định do mẫu cos = 0 (E06). Điểm trên trục không thuộc góc phần tư nào (E05).",
      "Nhiệm vụ LG-MH03: Công thức nhân đôi sin(2α) = 2 sin α cos α = −1. Kết quả khớp với điểm biểu diễn góc −1530° = −90°.",
      "Nhiệm vụ LG-MH04: Liên kết đường tròn và đồ thị. Góc -765 độ và 315 độ có cùng tung độ trên đường tròn nhưng hoành độ trên đồ thị cách nhau 6pi (3 chu kỳ).",
      "Nhiệm vụ LG-MH05: Giải phương trình sin(x) = -sqrt(2)/2 trên [-pi; pi]. Nghiệm tổng quát: x = -pi/4 + k2pi hoặc x = -3pi/4 + k2pi. Trong [-pi; pi] có đúng 2 nghiệm: x1 = -pi/4, x2 = -3pi/4.",
    ],
    keyFormulas: [
      "Đổi đơn vị: $180^\\circ = \\pi \\text{ rad}$, $\\alpha \\text{ rad} = \\alpha \\cdot \\frac{180^\\circ}{\\pi}$",
      "Tọa độ trên đường tròn đơn vị: $M(\\cos \\alpha; \\sin \\alpha)$",
      "Hệ thức cơ bản: $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$, $\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$",
      "Công thức nhân đôi: $\\sin 2\\alpha = 2\\sin \\alpha \\cos \\alpha$, $\\cos 2\\alpha = \\cos^2 \\alpha - \\sin^2 \\alpha$",
      "Chu kỳ hàm số: $y = \\sin x$ có chu kỳ cơ bản $T = 2\\pi$, $y = \\tan x$ có chu kỳ $T = \\pi$",
    ],
    commonMisconceptions: [
      "[E01] Chọn chiều quay không phù hợp với dấu của góc: Quay góc âm theo chiều ngược kim đồng hồ.",
      "[E02] Coi hai góc có cùng điểm biểu diễn là bằng nhau về số đo (nhầm -765 độ bằng 315 độ).",
      "[E03] Sử dụng lẫn lộn đơn vị độ và radian trong cùng một biểu thức.",
      "[E04] Đổi vai trò sin và cos: Lấy cos là tung độ, sin là hoành độ.",
      "[E05] Gán điểm nằm trên trục tọa độ vào một góc phần tư.",
      "[E06] Coi giá trị không xác định của tan/cot là bằng 0.",
      "[E08] Dùng công thức ngộ nhận sin(a + b) = sin a + sin b.",
      "[E10] Quên dấu âm trong công thức hiệu hai cosin: cos a - cos b = -2*sin((a+b)/2)*sin((a-b)/2).",
      "[E12] Nhầm một chu kỳ với chu kỳ cơ bản: Coi 4pi là chu kỳ cơ bản của sin x.",
      "[E15] Thiếu nghiệm, đếm trùng hoặc bỏ sót nghiệm tại đầu mút khoảng xét.",
      "[E16] Chia cho sin x khi giải phương trình mà không xét trường hợp sin x = 0 dẫn đến mất nghiệm.",
    ],
    socraticGuidance: [
      "Câu hỏi chiều quay (E01): 'Dấu âm của góc quy định chiều quay cùng chiều hay ngược chiều kim đồng hồ?'",
      "Câu hỏi số đo (E02): 'Góc -765 độ và góc 315 độ có cùng vị trí điểm cuối, nhưng số vòng quay của chúng có giống nhau không?'",
      "Câu hỏi mẫu số (E06): 'Tại góc pi/2 (90 độ), cosin bằng bao nhiêu? Trong biểu thức tan = sin/cos, mẫu số bằng 0 thì phép chia có xác định không?'",
      "Câu hỏi biến đổi (E16): 'Trước khi chia cả hai vế cho sin x, em đã kiểm tra trường hợp sin x = 0 chưa? Nếu sin x = 0 thì phương trình ban đầu có thỏa mãn không?'",
    ],
  },
];

// Hàm tìm kiếm tri thức RAG theo ngữ cảnh module và câu hỏi học sinh
export function queryMathRagKnowledge(query: string, moduleId?: string): MathKnowledgeChunk[] {
  const normalizedQuery = query.toLowerCase();

  return MATH_KNOWLEDGE_BASE.filter((chunk) => {
    if (moduleId && chunk.moduleId !== moduleId) {
      return false;
    }

    const matchTopic = chunk.topic.toLowerCase().includes(normalizedQuery);
    const matchConcepts = chunk.coreConcepts.some((c) => c.toLowerCase().includes(normalizedQuery));
    const matchErrors = chunk.commonMisconceptions.some((m) => m.toLowerCase().includes(normalizedQuery));

    return matchTopic || matchConcepts || matchErrors || Boolean(moduleId);
  });
}

// Hàm rút trích văn bản tri thức RAG đưa vào prompt phòng thủ Socratic AI
export function retrieveMathKnowledge(
  moduleId?: string,
  stationId?: string,
  learningStage?: number,
  userQuery?: string
): string {
  const chunks = queryMathRagKnowledge(userQuery || "", moduleId);
  if (!chunks || chunks.length === 0) {
    return "Không tìm thấy trích đoạn tri thức riêng biệt; hãy tuân thủ nguyên tắc sư phạm gợi mở Socratic 3 tầng chuẩn GDPT 2018.";
  }

  const selected = chunks.slice(0, 2);
  return selected
    .map(
      (c) =>
        `[TRI THỨC SGK CHUẨN - ${c.topic}]\n` +
        `- Nguồn học liệu: ${c.sgkSource}\n` +
        `- Khái niệm cốt lõi: ${c.coreConcepts.join("; ")}\n` +
        `- Công thức toán học: ${c.keyFormulas.join("; ")}\n` +
        `- Sai lầm thường gặp: ${c.commonMisconceptions.join("; ")}\n` +
        `- Định hướng gợi mở Socratic: ${c.socraticGuidance.join("; ")}`
    )
    .join("\n\n");
}
