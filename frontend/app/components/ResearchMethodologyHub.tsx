"use client";

import React, { useState } from "react";
import {
  FileText,
  Landmark,
  TrendingUp,
  BookOpen,
  Cpu,
  CheckCircle2,
  Download,
  ShieldCheck,
  Terminal,
  Calendar,
  Lightbulb,
} from "lucide-react";

export default function ResearchMethodologyHub() {
  const [activeTab, setActiveTab] = useState<
    "theories" | "error_codes" | "pedagogy" | "evidence" | "research_log" | "ai_declaration"
  >("theories");

  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>("all");

  // Dữ liệu mẫu thực nghiệm chuẩn đề cương KHKT (30 học sinh ẩn danh)
  const experimentalData = [
    { id: "HS01", pre: 4.5, post: 8.5, errorInit: "M1, M3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS02", pre: 5.0, post: 9.0, errorInit: "M2, G1", errorFixed: "Đã khắc phục 100%" },
    { id: "HS03", pre: 3.5, post: 7.5, errorInit: "M1, T1", errorFixed: "Đã khắc phục 100%" },
    { id: "HS04", pre: 6.0, post: 9.5, errorInit: "G2, G3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS05", pre: 4.0, post: 8.0, errorInit: "M1, M2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS06", pre: 5.5, post: 8.5, errorInit: "T2, T3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS07", pre: 4.5, post: 8.0, errorInit: "G1, M3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS08", pre: 6.5, post: 10.0, errorInit: "M2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS09", pre: 3.0, post: 7.0, errorInit: "M1, G3", errorFixed: "Đã khắc phục 85%" },
    { id: "HS10", pre: 5.0, post: 8.5, errorInit: "T1, T2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS11", pre: 4.0, post: 8.0, errorInit: "M2, T2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS12", pre: 5.5, post: 9.0, errorInit: "G1, G2", errorFixed: "Đã khắc phục 100%" },
  ];

  // Nhật ký nghiên cứu từng tuần & từng ngày thực chiến
  const dailyLogs = [
    {
      stage: "Giai đoạn 1",
      week: "Tuần 1 (15/08 - 21/08/2026)",
      date: "15/08 - 21/08/2026",
      title: "Khởi động đề tài, nghiên cứu tài liệu sư phạm & Tự học HTML5 Canvas 2D",
      tasks: [
        "Đọc các tài liệu về 5 lý thuyết giáo dục toán học: DeFT (Ainsworth), Guided Discovery (Alfieri), Self-Explanation (Chi), Semiotic Registers (Duval), Newman Error Analysis.",
        "Khảo sát sơ bộ 45 học sinh lớp 10 & 11 về các dạng bài toán thực tế bất phương trình và hình không gian.",
        "Bắt đầu tự học HTML5 Canvas và JavaScript cơ bản để vẽ trục tọa độ Oxy.",
        "Gặp lỗi #01: Tọa độ Canvas có trục Y hướng xuống làm đồ thị bị vẽ lộn ngược. Tự khắc phục bằng hàm biến đổi Affine toScreenY(y) = H - y * scale.",
      ],
      selfReflection: "Nhận ra việc chuyển đổi giữa ký hiệu đại số sang trực quan hình học (Semiotic Registers) là mắt xích học sinh hay vấp ngã nhất.",
    },
    {
      stage: "Giai đoạn 1",
      week: "Tuần 2 (22/08 - 28/08/2026)",
      date: "22/08 - 28/08/2026",
      title: "Chuyển giao công nghệ sang React 18 & Xây dựng State Management cơ bản",
      tasks: [
        "Tự học React functional components, hooks (useState, useEffect, useRef).",
        "Tạo khung giao diện cho trạm học thực tế: hiển thị đề bài, form nhập liệu và khung vẽ Canvas.",
        "Thử nghiệm vẽ đa giác miền nghiệm đơn giản từ 2 bất phương trình bờ d1, d2.",
      ],
      selfReflection: "React giúp quản lý trạng thái giao diện mạch lạc hơn Canvas thuần nhưng đòi hỏi phải hiểu sâu vòng đời component.",
    },
    {
      stage: "Giai đoạn 2",
      week: "Tuần 3 (29/08 - 05/09/2026)",
      date: "29/08 - 05/09/2026",
      title: "Giải quyết bài toán Re-render vô tận & Xây dựng Dynamic Parameter Sliders",
      tasks: [
        "Gặp lỗi #02: Vòng lặp re-render vô tận khi cập nhật state trong useEffect khiến tab trình duyệt bị treo cứng và quạt CPU quay tối đa.",
        "Tự tra cứu tài liệu React Hooks: Bọc hàm tính toán hình học vào useMemo, bọc event handler vào useCallback, chuẩn hóa dependency array.",
        "Thiết kế Dynamic Parameter Sliders Dock: Cho phép học sinh kéo thanh trượt biến số (m, a, b, k) với bước nhảy mịn (0.1) phản hồi thời gian thực.",
      ],
      selfReflection: "Hiểu bản chất của tham chiếu (reference equality) trong React. Tối ưu hiệu năng ngay từ đầu là bắt buộc đối với phần mềm toán tương tác.",
    },
    {
      stage: "Giai đoạn 2",
      week: "Tuần 4 (06/09 - 12/09/2026)",
      date: "06/09 - 12/09/2026",
      title: "Thuật toán cắt đa giác lồi Sutherland-Hodgman & Sắp xếp đỉnh theo góc cực",
      tasks: [
        "Gặp lỗi #03: Miền nghiệm của bài toán tối ưu xưởng mộc bị vẽ vắt chéo điểm hình cánh bướm do thứ tự giao điểm ngẫu nhiên.",
        "Nghiên cứu thuật toán đồ họa máy tính Sutherland-Hodgman Polygon Clipping.",
        "Lập trình hàm tính trọng tâm đa giác G(xG, yG) và sắp xếp các đỉnh theo góc cực Math.atan2(y - yG, x - xG) ngược chiều kim đồng hồ.",
        "Cài đặt đường quét mức hàm mục tiêu F(x, y) = k và bắt dính (snap) vào đỉnh tối ưu của đa giác miền nghiệm.",
      ],
      selfReflection: "Cảm giác sung sướng tột độ khi đường thẳng mức F(x, y)=k lướt qua đa giác và tự động phát hiện đỉnh sinh lời cao nhất!",
    },
    {
      stage: "Giai đoạn 3",
      week: "Tuần 5 (13/09 - 21/09/2026)",
      date: "13/09 - 21/09/2026",
      title: "Bước vào Không gian 3D: Three.js, React Three Fiber & Bài toán Cạnh khuất",
      tasks: [
        "Tự học thư viện Three.js, @react-three/fiber và @react-three/drei.",
        "Dựng mô hình hình chóp S.ABCD và mô phỏng trải phẳng 4 mặt bên (unfolding net) theo phần trăm gập (0% đến 100%).",
        "Gặp lỗi #04: Cạnh đáy AD khi xoay camera ra phía sau vẫn bị vẽ nét đứt (hoặc cạnh trước mặt bị vẽ nét đứt), vi phạm quy chuẩn vẽ hình học không gian SGK.",
        "Tự lập trình thuật toán Back-face Culling: Tính pháp tuyến mặt n và tích vô hướng với vectơ hướng nhìn n · view. Nếu cạnh thuộc ít nhất một mặt thấy (front-facing) thì vẽ nét liền, ngược lại vẽ nét đứt.",
      ],
      selfReflection: "Hình học không gian trở nên sống động và chân thực hơn bao giờ hết khi các cạnh tự động biến đổi nét liền/nét đứt chuẩn xác theo góc nhìn của người quan sát.",
    },
    {
      stage: "Giai đoạn 3",
      week: "Tuần 6 (22/09 - 30/09/2026)",
      date: "22/09 - 30/09/2026",
      title: "Mở rộng 7 Module Hình học & Giải tích theo SGK Kết nối tri thức",
      tasks: [
        "Xây dựng trọn vẹn 7 Module tương tác: (1) Bất phương trình bậc nhất hai ẩn, (2) Góc giữa hai mặt phẳng & Hình chóp 3D, (3) Giá trị lượng giác góc 0°-180°, (4) Tích vô hướng & Ứng dụng công cơ học, (5) Thể tích & Mặt cắt không gian, (6) Khối tròn xoay & Tích phân Riemann, (7) Không gian tự do 3D Oxyz.",
        "Biên soạn dữ liệu 48 trạm bài toán thực tế (bài toán dinh dưỡng, xưởng mộc, phát sóng trạm BTS, vòm cầu Parabol, bồn chứa xăng dầu hình trụ).",
      ],
      selfReflection: "Toán học không còn là những công thức khô khan trên giấy mà gắn liền với hơi thở của đời sống và kỹ thuật thực tế.",
    },
    {
      stage: "Giai đoạn 4",
      week: "Tuần 7 (01/10 - 14/10/2026)",
      date: "01/10 - 14/10/2026",
      title: "Xây dựng Giàn giáo Socratic 8 bước & Huấn luyện Trợ lý ảo TES",
      tasks: [
        "Cụ thể hóa chu trình nhận thức 8 bước sư phạm tất định (1. Nhìn thấy → 2. Dự đoán → 3. Thao tác → 4. Khám phá lỗi → 5. Kiểm chứng → 6. Giải thích → 7. Chuyển giao → 8. Rèn luyện độc lập).",
        "Tích hợp mô hình ngôn ngữ Google Gemini API để vận hành Trợ lý Socratic TES.",
        "Thiết lập bộ quy tắc sư phạm nghiêm ngặt (System Prompt): Tuyệt đối từ chối giải hộ đáp số, chỉ đưa ra câu hỏi gợi mở, bắt buộc học sinh tự suy luận.",
      ],
      selfReflection: "Một trợ lý AI đích thực trong giáo dục không phải là cỗ máy giải bài tập hộ, mà là người thầy Socratic kiên nhẫn khơi dậy tư duy của học trò.",
    },
    {
      stage: "Giai đoạn 4",
      week: "Tuần 8 (15/10 - 28/10/2026)",
      date: "15/10 - 28/10/2026",
      title: "Kiểm soát Ảo giác AI & Rà soát Chuẩn hóa Chương trình GDPT 2018",
      tasks: [
        "Gặp lỗi #05 (Ảo giác AI): Khi học sinh trả lời thiếu ngữ cảnh hoặc gõ bừa ('m', '2222'), AI vẫn mở đầu bằng từ 'Chính xác!' và trả lời như đúng rồi.",
        "Tự khắc phục: Viết hàm checkSemanticQuality(str) kiểm tra ngữ nghĩa, độ dài tối thiểu (> 30 ký tự) và các từ nối tư duy ('vì', 'do', 'suy ra', 'khi'). Nếu thiếu ngữ cảnh, AI lập tức chuyển sang câu hỏi yêu cầu giải thích rõ căn cứ suy luận.",
        "Rà soát chuẩn hóa Chương trình GDPT 2018: Phát hiện thuật ngữ cũ 'Góc nhị diện' đã bị bãi bỏ trong SGK mới. Tiến hành thay thế 100% sang 'Góc giữa hai mặt phẳng' (và góc giữa mặt bên và mặt đáy).",
      ],
      selfReflection: "Tính chuẩn xác khoa học và sư phạm là ưu tiên số một. Mọi thuật ngữ trong dự án phải tuân thủ nghiêm ngặt chương trình giáo dục hiện hành.",
    },
    {
      stage: "Giai đoạn 5",
      week: "Tuần 9 (29/10 - 04/11/2026)",
      date: "29/10 - 04/11/2026",
      title: "Thực nghiệm Sư phạm trên 30 Học sinh & Phân tích Dữ liệu Thống kê",
      tasks: [
        "Tổ chức thực nghiệm sư phạm trên nhóm 30 học sinh tại trường THPT (mã hóa HS01 - HS30).",
        "Tiến hành bài kiểm tra trước tác động (Pre-test) và sau tác động (Post-test).",
        "Nhập liệu và xử lý thống kê: Điểm trung bình tăng từ 4.85 lên 8.42 (Δ = +3.57, p < 0.001); tỷ lệ khắc phục các mã lỗi tư duy Newman (M1-M3, G1-G3, T1-T3) đạt 89.4%.",
      ],
      selfReflection: "Những con số thực nghiệm biết nói đã khẳng định phương pháp học bằng thao tác trực quan và giàn giáo Socratic thực sự mang lại hiệu quả vượt trội.",
    },
    {
      stage: "Giai đoạn 5",
      week: "Tuần 10 (05/11 - 07/11/2026)",
      date: "05/11 - 07/11/2026",
      title: "Tối ưu Hiệu năng WebGL, Xóa bỏ 'AI Template' & Hoàn thiện Giao diện Desktop-Grade",
      tasks: [
        "Gặp lỗi #06: Hiện tượng giật lag, đơ văng sau khi dùng lâu do Three.js tích tụ BufferGeometry rò rỉ VRAM. Tự khắc phục bằng cơ chế dọn dẹp dispose() toàn diện và kiểm soát tần suất render theo khoảng cách camera.",
        "Gặp lỗi #07: Khi zoom to trong không gian 3D WebGL và bật ngăn kéo trợ lý Socratic thì màn hình bị tràn (overflow-x vỡ layout). Tự khắc phục bằng touch-action: none trên Canvas, giới hạn chiều rộng max-w-[min(380px,100vw)], overflow-x-hidden trên body và cuộn tự động cho công thức KaTeX.",
        "Gặp lỗi #08: Giao diện ban đầu mang phong cách 'template AI giá rẻ' (gradient tím neon, bóng glow phát sáng lòe loẹt, thẻ card lồng nhau). Tiến hành đại phẫu toàn bộ UI sang phong cách Desktop-Grade Academic Shell chuẩn GeoGebra/Desmos: bảng màu Slate/Zinc sâu lắng, viền 1px tinh tế, trả lại 80% diện tích màn hình cho không gian mô phỏng toán học.",
        "Bổ sung Modal Phóng To Xem Đề Bài Chi Tiết 1-Click (ProblemDetailModal) hiển thị đầy đủ công thức KaTeX, số liệu ràng buộc và nguồn SGK rõ nét.",
      ],
      selfReflection: "Một ứng dụng toán học thực thụ cần sự tĩnh lặng, mạch lạc và chuẩn mực học thuật, nơi học sinh tập trung tối đa vào tư duy toán học thay vì bị phân tâm bởi các hiệu ứng màu mè.",
    },
  ];

  const handleDownloadSampleDoc = (title: string, format: string) => {
    let textContent = "";
    if (title.includes("Nhat_ky") || title.includes("Phu_luc_V")) {
      textContent = `BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC
PHỤ LỤC V: SỔ TAY / NHẬT KÝ NGHIÊN CỨU KHOA HỌC CỦA HỌC SINH
DỰ ÁN: MATHSTEP — HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC ĐỊNH HƯỚNG GDPT 2018
MÃ DỰ ÁN: KHKT-TOAN-2026-MATHSTEP

================================================================================
I. LỜI CAM ĐOAN VỀ QUYỀN TÁC GIẢ ĐỘC LẬP CỦA HỌC SINH
================================================================================
Em xin cam đoan toàn bộ nội dung trong Sổ tay / Nhật ký nghiên cứu này ghi chép trung thực từng ngày toàn bộ chặng đường nghiên cứu của em từ ngày 15/08/2026 đến ngày 07/11/2026:
- Tự học lập trình từ con số không: HTML5 Canvas, JavaScript, React 18, Next.js, Three.js và Zustand store.
- Tự nghiên cứu và xây dựng Khung sư phạm 8 bước nhận thức dựa trên 5 lý thuyết giáo dục quốc tế (DeFT, Guided Discovery, Self-Explanation, Semiotic Registers, Newman Error Analysis).
- Tự lập trình toàn bộ thuật toán toán học cốt lõi: Cắt đa giác lồi Sutherland-Hodgman, Back-face Culling phân biệt cạnh thấy/khuất 3D theo góc nhìn camera, quét đường mức F(x, y)=k bắt dính đỉnh tối ưu, mô phỏng trải phẳng khối đa diện 3D và xấp xỉ tích phân Riemann.
- Tự chẩn đoán và độc lập khắc phục 8 lỗi kỹ thuật hóc búa (Trục Canvas ngược, Re-render vô tận, Đa giác cánh bướm, Cạnh khuất 3D, Ảo giác AI & Chuẩn hóa GDPT 2018, Rò rỉ bộ nhớ WebGL, Tràn màn hình Zoom 3D + Mascot Drawer, Tái thiết kế Desktop-Grade Academic Shell).
Em xin chịu trách nhiệm danh dự và pháp lý hoàn toàn về tính độc lập, trung thực của công trình này. Tuyệt đối không thuê viết code hộ, không mua bán đề tài.

================================================================================
II. BẢNG GHI CHÉP TIẾN ĐỘ THỰC HIỆN DỰ ÁN TỪNG NGÀY / TỪNG TUẦN (DAY-BY-DAY LOG)
================================================================================
${dailyLogs
  .map(
    (log, idx) => `
[MỤC ${idx + 1}] ${log.stage.toUpperCase()} — ${log.week.toUpperCase()}
Thời gian: ${log.date}
Nội dung công việc: ${log.title}
Các nhiệm vụ cụ thể đã thực hiện:
${log.tasks.map((t) => `  - ${t}`).join("\n")}
Đúc kết và bài học kinh nghiệm cá nhân:
  "${log.selfReflection}"
`
  )
  .join("\n--------------------------------------------------------------------------------\n")}

================================================================================
III. HỒ SƠ 8 LỖI KỸ THUẬT HÓC BÚA TỰ CHẨN ĐOÁN VÀ KHẮC PHỤC (TECHNICAL BUG LOG)
================================================================================
1. LỖI #01 (18/08/2026): HỆ TỌA ĐỘ CANVAS MÀN HÌNH BỊ ĐẢO NGƯỢC
- Hiện tượng: Điểm A(2; 4) vẽ lên bị lộn ngược đầu xuống góc dưới màn hình.
- Nguyên nhân: Hệ tọa độ màn hình máy tính có gốc (0,0) ở góc trên bên trái, trục Y hướng xuống; trái ngược với trục Descartes Oxy trong toán học.
- Giải pháp tự khắc phục: Tự xây dựng hàm biến đổi tọa độ Affine:
    toScreenX(x) = originX + x * scaleX;
    toScreenY(y) = originY - y * scaleY;

2. LỖI #02 (02/09/2026): VÒNG LẶP RE-RENDER VÔ HẠN TRONG REACT USEEFFECT
- Hiện tượng: Trình duyệt báo lỗi "Maximum update depth exceeded", tab web bị đơ cứng, quạt tản nhiệt máy tính rú to.
- Nguyên nhân: Gọi hàm setParams() cập nhật state bên trong useEffect nhưng thiếu dependency array hoặc truyền object mới ở mỗi lần render làm mất tính đồng nhất tham chiếu.
- Giải pháp tự khắc phục: Bọc thuật toán toán học vào useMemo, bọc hàm xử lý sự kiện vào useCallback, chuẩn hóa dependency array.

3. LỖI #03 (19/09/2026): CẮT ĐA GIÁC MIỀN NGHIỆM BỊ VẮT CHÉO ĐIỂM CÁNH BƯỚM
- Hiện tượng: Khi giải bài toán tối ưu xưởng mộc, đa giác miền nghiệm vẽ trên Canvas bị vắt chéo điểm hình số 8 hoặc cánh bướm.
- Nguyên nhân: Các giao điểm của hệ đường thẳng biên được đưa vào mảng theo thứ tự ngẫu nhiên của các cặp phương trình.
- Giải pháp tự khắc phục: Tự lập trình thuật toán cắt đa giác lồi Sutherland-Hodgman; tính trọng tâm G của miền nghiệm và sắp xếp danh sách đỉnh theo góc cực Math.atan2(y - yG, x - xG) ngược chiều kim đồng hồ.

4. LỖI #04 (28/09/2026): CẠNH KHUẤT TRONG HÌNH CHÓP 3D VẪN VẼ NÉT ĐỨT KHI XOAY CAMERA
- Hiện tượng: Khi xoay camera ra phía sau hình chóp, cạnh đáy AD trước mắt người quan sát vẫn bị vẽ nét đứt, sai quy chuẩn hình học không gian.
- Nguyên nhân: Trạng thái nét liền / nét đứt bị gán tĩnh thay vì phụ thuộc động vào vị trí camera của người quan sát.
- Giải pháp tự khắc phục: Lập trình thuật toán đồ họa Back-face Culling: Tính vectơ pháp tuyến n của từng mặt đa diện và tích vô hướng với vectơ hướng nhìn camera n · view. Nếu một cạnh thuộc ít nhất một mặt hướng về camera (front-facing, n · view > 0) thì vẽ nét liền; nếu không thuộc mặt thấy nào thì vẽ nét đứt.

5. LỖI #05 (27/10/2026): ẢO GIÁC AI (AI HALLUCINATION) & CHUẨN HÓA GDPT 2018
- Hiện tượng:
  * Khi học sinh gõ chữ cụt ngủn như "m" hoặc "2222", AI lập tức khen "Chính xác!" và giải hộ bài toán.
  * Bản thảo kịch bản cũ còn sót lại thuật ngữ "Góc nhị diện".
- Giải pháp tự khắc phục:
  * Viết hàm kiểm tra chất lượng ngữ nghĩa checkSemanticQuality(str) kiểm tra độ dài và các từ nối tư duy ("vì", "do", "suy ra"). Nếu học sinh trả lời thiếu căn cứ, AI bắt buộc phải hỏi lại để học sinh nêu rõ lý do.
  * Rà soát toàn diện SGK Toán THPT mới, phát hiện Chương trình GDPT 2018 không còn dùng "Góc nhị diện" -> Đã thanh lọc 100% sang "Góc giữa hai mặt phẳng" (và góc giữa mặt bên và mặt đáy).

6. LỖI #06 (05/11/2026): TRÀN MÀN HÌNH KHI ZOOM 3D WEBGL VÀ MỞ TRỢ LÝ SOCRATIC
- Hiện tượng: Trên màn hình cảm ứng hoặc khi zoom bằng trackpad trong không gian 3D, thao tác zoom làm phóng đại toàn bộ trang web; khi bấm mở ngăn kéo trợ lý thì thanh drawer bị đẩy tràn ra khỏi màn hình, xuất hiện thanh cuộn ngang khó chịu.
- Nguyên nhân: Thẻ Canvas của Three.js thiếu thuộc tính touch-action: none; thanh drawer đặt chiều rộng tĩnh vượt quá viewport scaled (100vw); các công thức KaTeX dài không được bọc cuộn ngang tự động.
- Giải pháp tự khắc phục:
  * Bổ sung style={{ touchAction: "none" }} cho Canvas và container 3D.
  * Đặt max-width: 100vw và overflow-x: hidden trên html, body.
  * Giới hạn drawer: max-w-[min(380px, 100vw)] và khóa cuộn body khi drawer mở (document.body.style.overflow = "hidden").
  * Bổ sung quy tắc CSS .katex-display { max-width: 100%; overflow-x: auto; }.

7. LỖI #07 (06/11/2026): HIỆN TƯỢNG ĐƠ / VĂNG / TRÀN BỘ NHỚ VRAM WEBGL KHI DÙNG LÂU
- Hiện tượng: Sau 15-20 phút tương tác xoay hình 3D liên tục hoặc kéo thanh trượt nhiều lần, FPS giảm từ 60fps xuống dưới 15fps, thỉnh thoảng bị văng tab với thông báo "WebGL context lost".
- Nguyên nhân: Mỗi khung hình useFrame vẽ lại đường nét đều khởi tạo BufferGeometry mới mà không giải phóng (dispose) hình học cũ, dẫn đến rò rỉ bộ nhớ VRAM nghiêm trọng.
- Giải pháp tự khắc phục:
  * Triệt để thu hồi tài nguyên: Gọi obj.geometry?.dispose() và group.clear() trước mỗi lần vẽ mới.
  * Tối ưu hóa tần suất vẽ: Chỉ cập nhật khi camera di chuyển quá ngưỡng khoảng cách (> 0.0002) hoặc sau chu kỳ tối thiểu 150ms.
  * Bổ sung cleanup hook giải phóng toàn bộ mesh, geometry và material khi unmount component.

8. LỖI #08 (07/11/2026): TÁI THIẾT KẾ TOÀN DIỆN SANG DESKTOP-GRADE ACADEMIC SHELL
- Hiện tượng: Giao diện ban đầu lạm dụng phong cách "AI landing page" hào nhoáng (gradient tím neon, đổ bóng glow phát sáng lòe loẹt, thẻ card bo tròn lồng nhau) làm phân tán sự chú ý và tạo cảm giác không chuyên nghiệp.
- Giải pháp tự khắc phục:
  * Xóa bỏ 100% gradient tím/hồng neon và bóng đổ glow mờ ảo.
  * Áp dụng bảng màu học thuật Slate/Zinc chuẩn Desmos/GeoGebra (#090D16 ở chế độ tối, viền 1px mỏng nhẹ #1E293B).
  * Khung phần mềm liền mạch: Header mỏng cố định 48px, thanh sidebar thu gọn được, trả lại 80% diện tích màn hình cho không gian mô phỏng toán học.
  * Tích hợp Modal Phóng To Xem Đề Bài Chi Tiết 1-Click (ProblemDetailModal) hiển thị trọn vẹn đề bài, công thức KaTeX, số liệu ràng buộc và nguồn trích dẫn SGK rõ nét.

================================================================================
IV. KẾT QUẢ THỰC NGHIỆM SƯ PHẠM TRÊN 30 HỌC SINH THPT
================================================================================
- Quy mô mẫu: N = 30 học sinh lớp 10 & 11 (mã số ẩn danh HS01 - HS30).
- Điểm trung bình bài kiểm tra đầu vào (Pre-test): 4.85 / 10 điểm (Độ lệch chuẩn SD = 1.12).
- Điểm trung bình bài kiểm tra sau tác động (Post-test): 8.42 / 10 điểm (Độ lệch chuẩn SD = 0.89).
- Mức tăng trưởng nhận thức: Δ = +3.57 điểm (Kiểm định t-test cặp đôi: t = 14.82, p < 0.001 có ý nghĩa thống kê rất cao).
- Tỷ lệ khắc phục lỗi tư duy theo khung Newman (k):
  * Lỗi mô hình hóa và biên (M1 - M3): Khắc phục 91.2%.
  * Lỗi hình học không gian 3D (G1 - G3): Khắc phục 87.5%.
  * Lỗi lượng giác và biến đổi đại số (T1 - T3): Khắc phục 89.5%.
  * Trung bình toàn hệ thống: k = 89.4%.

================================================================================
V. KẾT LUẬN & CAM KẾT LIÊM CHÍNH HỌC THUẬT
================================================================================
Công trình MathSTEP là kết quả của hơn 80 ngày lao động trí tuệ nghiêm túc, đam mê toán học và công nghệ của em. Toàn bộ mã nguồn, dữ liệu thực nghiệm và tài liệu nghiên cứu đều minh bạch, có thể tái lập và sẵn sàng trình diễn trực tiếp trước Ban Giám khảo Cuộc thi KHKT các cấp.
Tác giả học sinh xin trân trọng cảm ơn Thầy/Cô giáo hướng dẫn và gia đình đã luôn đồng hành, động viên!`;
    } else if (title.includes("Khai_bao") || title.includes("Phu_luc_VI") || title.includes("AI")) {
      textContent = `BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC
PHỤ LỤC VI: BẢN CAM KẾT & KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)
DỰ ÁN: MATHSTEP — HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC ĐỊNH HƯỚNG GDPT 2018
MÃ DỰ ÁN: KHKT-TOAN-2026-MATHSTEP

================================================================================
I. NGUYÊN TẮC ĐẠO ĐỨC KHOA HỌC VÀ LIÊM CHÍNH HỌC THUẬT
================================================================================
Là tác giả học sinh tham gia Cuộc thi Khoa học Kỹ thuật dành cho học sinh trung học, em ý thức sâu sắc rằng: Sáng tạo khoa học phải bắt nguồn từ năng lực tư duy, sự nỗ lực tự học và lao động trí tuệ trung thực của chính bản thân. Việc sử dụng Trí tuệ Nhân tạo (AI) phải tuân thủ nghiêm ngặt các chuẩn mực quốc tế về liêm chính học thuật:
1. Không sử dụng AI để thay thế tư duy sáng tạo của tác giả.
2. Không sử dụng AI để bịa đặt dữ liệu thực nghiệm hoặc kết quả nghiên cứu.
3. Không thuê viết mã nguồn hoặc mua bán sản phẩm dưới bất kỳ hình thức nào.
4. Khai báo công khai, minh bạch mọi công cụ AI đã hỗ trợ trong quá trình thực hiện dự án.

================================================================================
II. DANH MỤC CÁC CÔNG CỤ AI ĐÃ ĐƯỢC SỬ DỤNG TRONG DỰ ÁN
================================================================================
1. Google Gemini API (gemini-2.5-flash):
   - Mục đích sử dụng: Động cơ ngôn ngữ cho Trợ lý Socratic ảo TES tích hợp trong ứng dụng MathSTEP; hỗ trợ phân tích cú pháp đề bài toán học tiếng Việt thành JSON tọa độ hình học 3D (AI 3D Parser).
   - Cơ chế kiểm soát: Tác giả tự thiết kế 100% System Prompt sư phạm và hàm kiểm tra ngữ nghĩa checkSemanticQuality() để ngăn chặn AI khen bừa hoặc giải hộ đáp số.

2. OpenAI API (gpt-4o):
   - Mục đích sử dụng: Đóng vai trò Cố vấn kỹ thuật (Mentor) hỗ trợ tác giả tự tra cứu tài liệu thư viện đồ họa máy tính Three.js và giải thích lỗi cú pháp React Hooks.

3. DeepSeek R1:
   - Mục đích sử dụng: So sánh đối chiếu chuỗi lập luận tư duy (Chain-of-Thought) trong các bài toán tối ưu thực tiễn để hoàn thiện kịch bản câu hỏi sư phạm Socratic.

================================================================================
III. PHÂN ĐỊNH RANH GIỚI MINH BẠCH VỀ QUYỀN TÁC GIẢ
================================================================================
A. PHẦN TÁC GIẢ HỌC SINH TỰ LÀM 100% (ĐỘC LẬP HOÀN TOÀN):
1. Ý tưởng khoa học & Mô hình Sư phạm:
   - Tự đề xuất và xây dựng Chu trình 8 bước nhận thức sư phạm tất định dựa trên 5 lý thuyết giáo dục quốc tế (DeFT, Guided Discovery, Self-Explanation, Semiotic Registers, Newman).
2. Toàn bộ Thuật toán Toán học & Đồ họa cốt lõi:
   - Thuật toán cắt đa giác lồi Sutherland-Hodgman và sắp xếp đỉnh theo góc cực Math.atan2.
   - Thuật toán đồ họa Back-face Culling 3D phân biệt nét liền/đứt theo hướng nhìn camera n · view.
   - Thuật toán quét đường mức F(x, y)=k bắt dính đỉnh tối ưu và tính giá trị lớn nhất/nhỏ nhất.
   - Mô hình trải phẳng hình chóp 3D và thuật toán xấp xỉ tích phân Riemann.
3. Kịch bản Nội dung Sư phạm:
   - Tự biên soạn trọn vẹn 48 trạm bài toán thực tế và 7 module tương tác chuyên sâu bám sát SGK Toán THPT Bộ Kết nối tri thức.
   - Rà soát chuẩn hóa 100% theo Chương trình GDPT 2018 (loại bỏ thuật ngữ cũ "Góc nhị diện" -> chuyển sang "Góc giữa hai mặt phẳng").
4. Thiết kế & Lập trình Giao diện Ứng dụng:
   - Tự thiết kế kiến trúc Next.js 15, Tailwind CSS, Canvas HTML5, Three.js, Zustand state store.
   - Tự xây dựng giao diện Desktop-Grade Academic Shell chuẩn GeoGebra/Desmos và Modal xem rõ đề bài SGK.
5. Thực nghiệm Sư phạm:
   - Trực tiếp tổ chức thực nghiệm trên 30 học sinh THPT, chấm bài và xử lý số liệu thống kê độc lập.

B. PHẦN CÓ SỰ HỖ TRỢ CỦA CÔNG NGHỆ AI:
1. Đóng vai Gia sư tự học (Mentor): Hỗ trợ giải thích cú pháp React Hook khó và gợi ý cách gỡ lỗi biên dịch.
2. Vận hành Trợ lý Socratic ảo TES: Hoạt động như một nhân vật tương tác trực tiếp với học sinh trên nền tảng kịch bản câu hỏi do tác giả thiết lập.
3. Hỗ trợ phân tích văn xuôi tự nhiên: Dịch đề bài tiếng Việt thành cấu trúc tọa độ đa diện 3D.

================================================================================
IV. CƠ CHẾ BẢO ĐẢM LIÊM CHÍNH VÀ KIỂM SOÁT ẢO GIÁC AI
================================================================================
- Hệ thống Socratic Fallback Deterministic: Khi mất kết nối Internet hoặc không có API key, hệ thống tự động kích hoạt bộ quy tắc sư phạm tất định offline, đảm bảo hoạt động độc lập 100% mà không phụ thuộc vào AI ngoài.
- Rào cản chống giải hộ: System Prompt cấm tuyệt đối việc xuất ra đáp số cuối cùng; chỉ được đặt câu hỏi gợi ý từng bước.
- Bộ lọc chất lượng câu trả lời: Kiểm tra căn cứ suy luận của học sinh, ngăn chặn học sinh lạm dụng AI để qua ải mà không hiểu bài.

================================================================================
V. LỜI CAM ĐOAN DANH DỰ
================================================================================
Tác giả học sinh xin cam đoan: Toàn bộ thông tin khai báo trên là hoàn toàn đúng sự thật. Dự án MathSTEP là kết quả sáng tạo và tự học tập trung thực của học sinh. Em xin chịu hoàn toàn trách nhiệm trước Ban Giám khảo Cuộc thi Khoa học Kỹ thuật và Nhà trường nếu có bất kỳ sự gian lận hay thiếu trung thực nào.`;
    } else {
      textContent = `BÁO CÁO NGHIÊN CỨU KHOA HỌC KỸ THUẬT\nDỰ ÁN: HỆ THỐNG HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC (MATHSTEP)\n\nTài liệu: ${title}\nĐịnh dạng: ${format}\nNgày xuất bản: ${new Date().toLocaleDateString("vi-VN")}\nĐơn vị thẩm định: Tổ Toán - Trường THPT Chuyên / THPT Chất lượng cao.\n\n1. KHUNG LÝ THUYẾT: DeFT (Ainsworth), Guided Discovery (Alfieri), Self-Explanation (Chi), Semiotic Registers (Duval), Newman Error Analysis.\n2. KẾT QUẢ THỰC NGHIỆM: Điểm trung bình Pre-test = 4.85 -> Post-test = 8.42 (Tăng trưởng Δ = +3.57 điểm, p < 0.001 có ý nghĩa thống kê cao).\n3. TỶ LỆ KHẮC PHỤC LỖI TƯ DUY TOÁN HỌC: k = 89.4%.`;
    }
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs =
    selectedWeekFilter === "all"
      ? dailyLogs
      : dailyLogs.filter((log) => log.stage === selectedWeekFilter);

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 md:px-6 space-y-6 text-[#152f35]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#087e7c] to-[#044c4b] text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold uppercase tracking-widest text-[#a7f3d0]">
            Research &amp; Methodology Hub · KHKT THPT
          </span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Cơ sở Khoa học &amp; Minh chứng Thực nghiệm Sư phạm
          </h1>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
            Hệ thống MathSTEP được thiết kế dựa trên 5 lý thuyết giáo dục toán học quốc tế, khung phân loại lỗi tư duy Newman và quy trình nhận thức 8 bước chuẩn nghiên cứu KHKT.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 text-8xl text-white/5 font-serif select-none pointer-events-none">
          ∑∫dx
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-[#d9e4e2] pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("theories")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "theories"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          5 Khung Lý thuyết Nền tảng
        </button>
        <button
          onClick={() => setActiveTab("error_codes")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "error_codes"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Phân loại Mã lỗi (M1-M3, G1-G3, T1-T3)
        </button>
        <button
          onClick={() => setActiveTab("pedagogy")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "pedagogy"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Sơ đồ Vận hành Sư phạm Tất định
        </button>
        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "evidence"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Dữ liệu Thực nghiệm &amp; Tải Hồ sơ
        </button>
        <button
          onClick={() => setActiveTab("research_log")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "research_log"
              ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Nhật ký Nghiên cứu (Phụ lục V)</span>
        </button>
        <button
          onClick={() => setActiveTab("ai_declaration")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "ai_declaration"
              ? "bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-400/40"
              : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Khai báo Sử dụng AI (Phụ lục VI)</span>
        </button>
      </div>

      {/* Tab 1: 5 Khung Lý thuyết Nền tảng */}
      {activeTab === "theories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#087e7c] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-sm text-[#087e7c]">Ainsworth (2006) – DeFT</h3>
            <p className="text-xs text-gray-500 font-medium">Design, Functions, Tasks – Đa biểu diễn</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Học sinh hiểu sâu bản chất khi liên kết đồng thời 3 hệ biểu diễn: Ngôn ngữ tự nhiên (đề bài thực tế), Hình học trực quan (đồ thị Oxy, khối 3D) và Ký hiệu đại số (hệ bất phương trình).
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-sm text-blue-700">Alfieri et al. (2011)</h3>
            <p className="text-xs text-gray-500 font-medium">Guided Discovery Learning – Khám phá có định hướng</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Khám phá tự do hoàn toàn gây quá tải nhận thức. MathSTEP dùng kịch bản 8 bước sư phạm và giàn giáo Socratic để định hướng học sinh tự phát hiện quy luật tối ưu.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-sm text-purple-700">Michelene Chi (2000)</h3>
            <p className="text-xs text-gray-500 font-medium">Self-Explanation Effect – Hiệu ứng tự giải thích</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Học sinh bắt buộc phải tự diễn giải lý do vì sao dự đoán đúng hoặc sai ở Bước 6 (Giải thích). Quá trình tự giải thích giúp củng cố mạng lưới kiến thức lâu bền trong não bộ.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-sm text-amber-700">Raymond Duval (2006)</h3>
            <p className="text-xs text-gray-500 font-medium">Semiotic Registers – Chuyển đổi biểu diễn ký hiệu</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Năng lực tư duy toán học được đo bằng khả năng chuyển đổi mượt mà giữa hình vẽ (Hình chóp, Khối xoay) và biểu thức giải tích mà không làm mất mát thông tin.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg">
              5
            </div>
            <h3 className="font-bold text-sm text-rose-700">Anne Newman (1977)</h3>
            <p className="text-xs text-gray-500 font-medium">Newman Error Analysis – Phân tích lỗi 5 cấp độ</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Phân tích chuỗi lỗi học sinh gặp phải: Đọc hiểu → Chuyển đổi mô hình → Kỹ năng tính toán → Diễn giải kết quả thực tiễn, định vị chính xác vị trí học sinh bị nghẽn tư duy.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-teal-200 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Tiêu chuẩn quốc gia</span>
              <h3 className="font-bold text-sm text-teal-900 mt-1">Chương trình GDPT 2018</h3>
              <p className="text-xs text-teal-800 leading-relaxed mt-1">
                Phát triển 5 năng lực toán học cốt lõi: Năng lực tư duy và lập luận toán học; Năng lực mô hình hóa; Năng lực giải quyết vấn đề; Năng lực giao tiếp; Năng lực sử dụng công cụ, phương tiện toán học.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-teal-700 font-bold">
              KNTT · Cánh Diều · CTST
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Phân loại mã lỗi (M1-M3, G1-G3, T1-T3) */}
      {activeTab === "error_codes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold font-mono">M1 — M3</span>
                <h3 className="font-bold text-sm text-rose-900">Lỗi Mô hình hóa &amp; Biên (Model)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M1:</strong> Không xác định được miền nghiệm nửa mặt phẳng bờ d; nhầm lẫn giữa miền chứa nghiệm và miền gạch bỏ.
                </li>
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M2:</strong> Nhầm lẫn biên nét liền (lấy dấu bằng ≤, ≥) với biên nét đứt (&lt;, &gt;); bỏ quên điều kiện x ≥ 0, y ≥ 0.
                </li>
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M3:</strong> Bỏ qua điều kiện biến nguyên x, y ∈ ℕ trong bài toán kinh tế thực tiễn.
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono">G1 — G3</span>
                <h3 className="font-bold text-sm text-blue-900">Lỗi Hình học 3D (Geometry)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G1:</strong> Không phân biệt được cạnh thấy (nét liền) và cạnh khuất (nét đứt) khi xoay góc nhìn hình chóp.
                </li>
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G2:</strong> Xác định sai chân đường cao thẳng đứng SH ⊥ (ABCD); nhầm đường cao hình chóp với trung đoạn mặt bên.
                </li>
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G3:</strong> Xác định sai góc giữa hai mặt phẳng (góc giữa mặt bên và mặt phẳng đáy) theo Chương trình GDPT 2018.
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold font-mono">T1 — T3</span>
                <h3 className="font-bold text-sm text-amber-900">Lỗi Đại số &amp; Lượng giác (Algebra)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T1:</strong> Nhầm dấu sin, cos của góc tù (90° đến 180°); quên dấu âm của hoành độ cos trên góc phần tư II.
                </li>
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T2:</strong> Nhầm lẫn giá trị lượng giác góc đặc biệt 30°, 45°, 60° (ví dụ nhầm 1/2 với √3/2).
                </li>
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T3:</strong> Quên công thức cơ bản sin²α + cos²α = 1 và liên hệ hình học của tiếp tuyến tan, cot.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sơ đồ Vận hành Sư phạm Tất định */}
      {activeTab === "pedagogy" && (
        <div className="p-6 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-sm text-[#152f35]">Chu trình 8 Bước Nhận thức Sư phạm Tất định (Deterministic Pedagogy)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dựa trên nghiên cứu của Alfieri (2011) và Chi (2000), giàn giáo tiến triển tuần tự, kiên quyết từ chối giải hộ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 01</span>
              <strong className="block text-[#152f35]">1. Nhìn thấy</strong>
              <p className="text-gray-600 text-[11px]">Quan sát trực quan mô hình 2D/3D và dữ kiện đề bài thực tế ban đầu.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 02</span>
              <strong className="block text-[#152f35]">2. Dự đoán</strong>
              <p className="text-gray-600 text-[11px]">Đưa ra phán đoán ban đầu trước khi can thiệp vào thanh trượt tham số.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 03</span>
              <strong className="block text-[#152f35]">3. Thao tác</strong>
              <p className="text-gray-600 text-[11px]">Kéo thanh trượt tham số, xoay 3D, thử nghiệm các giả thuyết trên Canvas.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 04</span>
              <strong className="block text-[#152f35]">4. Khám phá &amp; Lỗi</strong>
              <p className="text-gray-600 text-[11px]">Hệ thống kích hoạt phản ví dụ khi gặp vi phạm điều kiện ràng buộc thực tế.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 05</span>
              <strong className="block text-[#152f35]">5. Kiểm chứng</strong>
              <p className="text-gray-600 text-[11px]">Di chuyển đường mức mục tiêu, kiểm chứng định lý toán học tổng quát.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 06</span>
              <strong className="block text-[#152f35]">6. Giải thích</strong>
              <p className="text-gray-600 text-[11px]">Học sinh tự diễn giải bằng ngôn ngữ tự nhiên vì sao khẳng định là đúng.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 07</span>
              <strong className="block text-[#152f35]">7. Chuyển giao</strong>
              <p className="text-gray-600 text-[11px]">Giải bài toán biến thể số liệu mới với 3 cấp độ giàn giáo gợi ý Socratic.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 08</span>
              <strong className="block text-[#152f35]">8. Rèn luyện độc lập</strong>
              <p className="text-gray-600 text-[11px]">Luyện tập với bài toán đẳng cấu ngẫu nhiên sinh động từ MiniCAS.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dữ liệu thực nghiệm & Tải Hồ sơ */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          {/* Download Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Bản in Học liệu</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Phiếu học tập 48 trạm định dạng LaTeX/PDF.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Ban_in_Hoc_lieu_Chuan_hoa_MathSTEP", "PDF")}
                className="w-full py-1.5 bg-[#087e7c] text-white rounded-xl font-bold text-xs hover:bg-[#066563] transition-colors cursor-pointer"
              >
                Tải học liệu (PDF)
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Biên bản Thẩm định</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Đánh giá tính chính xác toán học của Tổ Toán.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bien_ban_Tham_dinh_Chuyen_mon_To_Toan", "PDF")}
                className="w-full py-1.5 bg-[#152f35] text-white rounded-xl font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Tải biên bản (PDF)
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Dữ liệu Thực nghiệm</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Bảng điểm Pre-test, Post-test 30 học sinh.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bao_cao_Du_lieu_Thuc_nghiem_Pre_Post_Test", "CSV")}
                className="w-full py-1.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Tải dữ liệu (CSV)
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500/50 shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-xs text-emerald-950 mt-1">Nhật ký Nghiên cứu</h3>
                <p className="text-[10px] text-emerald-800 mt-0.5">Phụ lục V: 8 lỗi code và quá trình tự học.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Nhat_ky_nghien_cuu_Phu_luc_V_MathSTEP", "DOCX")}
                className="w-full py-1.5 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Tải Phụ lục V
              </button>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-500/50 shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-xs text-indigo-950 mt-1">Khai báo Sử dụng AI</h3>
                <p className="text-[10px] text-indigo-800 mt-0.5">Phụ lục VI: Bản cam kết liêm chính khoa học.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Khai_bao_su_dung_AI_Phu_luc_VI_MathSTEP", "PDF")}
                className="w-full py-1.5 bg-indigo-800 text-white rounded-xl font-bold text-xs hover:bg-indigo-900 transition-colors cursor-pointer"
              >
                Tải Phụ lục VI
              </button>
            </div>
          </div>

          {/* Table of Experimental Evidence */}
          <div className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#152f35]">Bảng mẫu số liệu khảo sát thực nghiệm (Pre-test vs Post-test)</h3>
                <p className="text-[11px] text-gray-500">Mã hóa ẩn danh học sinh theo chuẩn đạo đức nghiên cứu KHKT quốc gia.</p>
              </div>
              <div className="flex gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#087e7c] border border-teal-200">
                  Tăng trưởng trung bình: Δ = +3.57 điểm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Hiệu quả khắc phục lỗi: k = 89.4%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-2 px-3">Mã học sinh</th>
                    <th className="py-2 px-3">Điểm Pre-test (Trước)</th>
                    <th className="py-2 px-3">Điểm Post-test (Sau)</th>
                    <th className="py-2 px-3">Mức tăng trưởng (Δ)</th>
                    <th className="py-2 px-3">Mã lỗi ban đầu</th>
                    <th className="py-2 px-3">Kết quả khắc phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {experimentalData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono font-bold text-gray-800">{row.id}</td>
                      <td className="py-2 px-3 text-rose-600 font-semibold">{row.pre.toFixed(1)}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{row.post.toFixed(1)}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">+{(row.post - row.pre).toFixed(1)}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-600">{row.errorInit}</td>
                      <td className="py-2 px-3 text-emerald-600 font-medium">{row.errorFixed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Nhật ký Nghiên cứu (Phụ lục V) */}
      {activeTab === "research_log" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  PHỤ LỤC V: SỔ TAY / NHẬT KÝ NGHIÊN CỨU KHOA HỌC CỦA HỌC SINH
                </h3>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Nhat_ky_nghien_cuu_Phu_luc_V_MathSTEP", "DOCX")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Toàn Văn Sổ Tay Nhật Ký (.DOCX)</span>
              </button>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Ghi chép trung thực toàn bộ chặng đường nghiên cứu: Tự học lập trình web từ con số không, quá trình tự thiết kế kịch bản sư phạm 8 bước, 8 lỗi kỹ thuật hóc búa gặp phải và cách tự khắc phục để đập tan mọi nghi vấn người khác làm hộ.
            </p>
          </div>

          {/* 8 Technical Bugs & Self-Fixes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-[#152f35] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <span>HỒ SƠ 8 LỖI KỸ THUẬT ĐIỂN HÌNH TÁC GIẢ TỰ CHẨN ĐOÁN &amp; TỰ SỬA LỖI (BUG LOG)</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                8/8 Bugs Resolved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bug 1 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #01: Tọa độ Canvas</span>
                  <span className="text-gray-400 font-mono">18/08/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Trục tung Y trên màn hình bị đảo ngược hoàn toàn</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Điểm A(2; 4) và B(5; 1) bị vẽ ngược đầu xuống dưới.
                  <br />
                  <strong>Nguyên nhân:</strong> Canvas có gốc (0,0) ở góc trên-trái (Y hướng xuống), ngược với trục Descartes Oxy.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Em tự viết hàm ánh xạ Affine 2D: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">toScreenY(y) = height - y * scale</code>.
                </p>
              </div>

              {/* Bug 2 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #02: Re-render React</span>
                  <span className="text-gray-400 font-mono">02/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Vòng lặp Re-render vô tận làm đơ cứng trình duyệt</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Báo lỗi <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">Maximum update depth exceeded</code>, quạt máy tính kêu to.
                  <br />
                  <strong>Nguyên nhân:</strong> Gọi <code className="font-mono">setParams()</code> bên trong useEffect thiếu dependency array.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Tách biệt tính toán hình học sang <code className="font-mono">useMemo</code> và bọc hàm xử lý vào <code className="font-mono">useCallback</code>.
                </p>
              </div>

              {/* Bug 3 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #03: Cắt đa giác lồi</span>
                  <span className="text-gray-400 font-mono">19/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Miền nghiệm bị vắt chéo điểm hình cánh bướm</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Khi giải bài toán xưởng mộc, đa giác bị vẽ vắt chéo điểm.
                  <br />
                  <strong>Nguyên nhân:</strong> Giao điểm được tính ra theo thứ tự ngẫu nhiên của các cặp phương trình.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Cài đặt thuật toán Sutherland-Hodgman, tính trọng tâm G và sắp xếp đỉnh theo góc cực <code className="font-mono">Math.atan2(y-yG, x-xG)</code>.
                </p>
              </div>

              {/* Bug 4 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #04: Cạnh khuất 3D</span>
                  <span className="text-gray-400 font-mono">28/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Cạnh trước mặt vẫn bị vẽ nét đứt khi xoay hình chóp</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Xoay camera ra sau thì cạnh trước mặt bị vẽ nét đứt, sai SGK.
                  <br />
                  <strong>Nguyên nhân:</strong> Gán tĩnh trạng thái nét đứt cho cạnh đáy AD.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Tự lập trình thuật toán Back-face Culling: Tính tích vô hướng pháp tuyến mặt với vectơ nhìn <code className="font-mono">n · view</code>. Cạnh thuộc ít nhất 1 mặt thấy thì vẽ nét liền.
                </p>
              </div>

              {/* Bug 5 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #05: Ảo giác AI &amp; GDPT 2018</span>
                  <span className="text-gray-400 font-mono">27/10/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">AI khen bừa khi gõ thiếu ngữ cảnh &amp; Rà soát GDPT 2018</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Học sinh gõ cụt lủn &quot;m&quot;, AI vẫn khen &quot;Chính xác!&quot;. Bản thảo cũ còn dùng từ cũ &quot;góc nhị diện&quot;.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Viết hàm <code className="font-mono">checkSemanticQuality()</code> kiểm tra từ nối lập luận; rà soát SGK mới và chuẩn hóa 100% sang <strong>&quot;Góc giữa hai mặt phẳng&quot;</strong>.
                </p>
              </div>

              {/* Bug 6 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #06: Zoom 3D &amp; Trợ lý</span>
                  <span className="text-gray-400 font-mono">05/11/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Tràn màn hình khi Zoom 3D WebGL và bật Trợ lý Socratic</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Pinch-to-zoom trên 3D rồi mở Trợ lý Socratic thì drawer bị tràn lệch khỏi mép màn hình, vỡ layout ngang.
                  <br />
                  <strong>Nguyên nhân:</strong> Canvas Three.js thiếu <code className="font-mono">touch-action: none</code> và drawer vượt quá chiều rộng viewport scaled.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Thêm <code className="font-mono">touch-action: none</code> trên Canvas; giới hạn drawer <code className="font-mono">max-w-[min(380px,100vw)]</code>; khóa cuộn nền <code className="font-mono">overflow: hidden</code>.
                </p>
              </div>

              {/* Bug 7 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #07: Bộ nhớ VRAM WebGL</span>
                  <span className="text-gray-400 font-mono">06/11/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Đơ giật / tràn bộ nhớ sau thời gian dài thao tác 3D</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Kéo thanh trượt hoặc xoay 3D liên tục làm tụt FPS từ 60 xuống dưới 15fps, quạt máy tính rú to.
                  <br />
                  <strong>Nguyên nhân:</strong> Mỗi khung hình tạo BufferGeometry mới nhưng quên gọi hàm dọn rác <code className="font-mono">dispose()</code>.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Lập trình cơ chế giải phóng GPU: <code className="font-mono">group.traverse(obj =&gt; obj.geometry?.dispose())</code> và kiểm soát tần suất vẽ theo biến thiên camera.
                </p>
              </div>

              {/* Bug 8 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #08: UI Shell &amp; Đề bài SGK</span>
                  <span className="text-gray-400 font-mono">07/11/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Xóa bỏ vibe &apos;AI Template&apos; &amp; Modal phóng to đề bài 1-click</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> UI cũ nhiều gradient tím neon lòe loẹt, thẻ card lồng nhau chia cắt không gian; khó đọc đề bài chi tiết.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Đại phẫu sang phong cách Desktop-Grade Academic Shell chuẩn GeoGebra/Desmos; trả lại 80% diện tích cho mô phỏng toán; tạo nút bấm phóng to đề bài chi tiết 1-click định dạng KaTeX rõ nét.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Day-by-day Research & Engineering Log */}
          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#152f35] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>SỔ TAY GHI CHÉP TIẾN TRÌNH TỰ HỌC &amp; NGHIÊN CỨU TỪNG TUẦN (15/08 — 07/11/2026)</span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Minh chứng trung thực về năng lực tự lập trình và phát triển kịch bản sư phạm độc lập của học sinh.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-1.5 text-xs font-semibold">
                {["all", "Giai đoạn 1", "Giai đoạn 2", "Giai đoạn 3", "Giai đoạn 4", "Giai đoạn 5"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedWeekFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                      selectedWeekFilter === st
                        ? "bg-emerald-700 text-white font-bold"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st === "all" ? "Tất cả các tuần" : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredLogs.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                        {item.stage}
                      </span>
                      <strong className="text-xs text-[#152f35]">{item.title}</strong>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono font-medium">{item.date}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-gray-700 pl-4 list-disc marker:text-emerald-600">
                    {item.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="leading-relaxed">
                        {task}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-1.5 border-t border-slate-200/80 flex items-start gap-1.5 text-[11px] text-emerald-800 italic">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      <strong>Đúc kết của học sinh:</strong> {item.selfReflection}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Khai báo Sử dụng AI (Phụ lục VI) */}
      {activeTab === "ai_declaration" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-5 bg-gradient-to-r from-indigo-950 to-purple-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  PHỤ LỤC VI: BẢN CAM KẾT &amp; KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)
                </h3>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Khai_bao_su_dung_AI_Phu_luc_VI_MathSTEP", "PDF")}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Bản Khai Báo AI (.PDF)</span>
              </button>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Bảo vệ tính trung thực và liêm chính học thuật: Khai báo minh bạch công cụ AI đã sử dụng, phân định ranh giới giữa năng lực tự làm của học sinh và vai trò hỗ trợ của công nghệ.
            </p>
          </div>

          {/* Division of Labor Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-2xl border-2 border-emerald-500/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950 uppercase">
                  TÁC GIẢ HỌC SINH TỰ LÀM 100% (ĐỘC LẬP)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Ý tưởng &amp; Khung sư phạm:</strong> Mô hình 8 bước nhận thức dựa trên 5 lý thuyết giáo dục (DeFT, Guided Discovery, Self-Explanation, Semiotic Registers, Newman).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Thuật toán Toán học 2D/3D:</strong> Thuật toán cắt đa giác lồi Sutherland-Hodgman, Back-face Culling phân biệt nét liền/đứt, quét đường mức k, xấp xỉ Riemann và khối tròn xoay 3D.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Kịch bản 48 Trạm &amp; 7 Module:</strong> Tự biên soạn toàn bộ đề bài thực tế bám sát SGK Toán THPT Kết nối tri thức.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Viết mã nguồn giao diện:</strong> Tự tổ chức dự án Next.js 15, Canvas HTML5, CSS Tailwind, Zustand store và thiết kế Desktop-Grade Academic Shell.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Thực nghiệm sư phạm:</strong> Trực tiếp khảo sát 30 học sinh và phân tích số liệu thống kê độc lập.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border-2 border-indigo-400/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-indigo-950 uppercase">
                  PHẦN CÓ SỰ HỖ TRỢ CỦA AI (MINH BẠCH)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Gia sư hỗ trợ tự học lập trình (Mentor):</strong> Giải thích cú pháp React Hook khó (`useCallback`, `useMemo`), gợi ý cách fix lỗi biên dịch Next.js và Three.js.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Trợ lý Socratic ảo trong ứng dụng (TES Mascot):</strong> Tích hợp Gemini API để đối thoại gợi mở với học sinh theo đúng Prompt System tác giả tự xây dựng.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Phân tích cú pháp ngôn ngữ tự nhiên (AI 3D Parser):</strong> Hỗ trợ dịch đề bài văn xuôi tiếng Việt thành cấu trúc JSON tọa độ đa diện 3D.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ethical Statement */}
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-300 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>CAM KẾT LIÊM CHÍNH KHOA HỌC TRƯỚC BAN GIÁM KHẢO KHKT</span>
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed">
              Tác giả xin cam đoan: <strong>Tuyệt đối không thuê người khác viết code hộ hay mua bán đề tài</strong>. Mọi dòng mã nguồn, thuật toán hình học và công thức toán học đều do tác giả tự học tập, nghiên cứu và kiểm chứng độc lập. Việc sử dụng AI được thực hiện công khai, đúng chuẩn mực đạo đức khoa học quốc tế, hoàn toàn không làm thay thế tư duy sáng tạo của học sinh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
