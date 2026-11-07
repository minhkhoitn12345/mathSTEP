# BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI KHOA HỌC KỸ THUẬT CẤP QUỐC GIA DÀNH CHO HỌC SINH TRUNG HỌC
## DỰ ÁN: MATHSTEP — HỆ THỐNG HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP TRỢ LÝ SOCRATIC HỖ TRỢ HỌC SINH TỰ KHÁM PHÁ THEO CHƯƠNG TRÌNH GDPT 2018
**Lĩnh vực:** Khoa học Xã hội & Hành vi / Phần mềm Hệ thống & Giáo dục Số

---

# PHỤ LỤC V: SỔ TAY / NHẬT KÝ NGHIÊN CỨU KHOA HỌC CỦA HỌC SINH
*(Research Logbook — Ghi chép từng ngày quá trình tự học lập trình, tự thiết kế kịch bản, các lỗi kỹ thuật gặp phải và cách tự khắc phục)*

> **Lời cam đoan của tác giả học sinh:**
> *"Nhật ký này là bằng chứng sống động, trung thực về toàn bộ chặng đường nghiên cứu của em: Từ những ngày đầu bỡ ngỡ tự học từng dòng lệnh JavaScript, nhiều đêm mất ngủ vì hình vẽ 3D bị lộn ngược hoặc thuật toán cạnh khuất bị lỗi, cho đến khi hoàn thiện 7 module thí nghiệm toán học động 60fps và kịch bản sư phạm Socratic 8 bước. Em xin chịu trách nhiệm hoàn toàn trước Ban Giám khảo về tính trung thực và quyền tác giả độc lập của công trình này."*

---

### GIAI ĐOẠN 1: KHỞI PHÁT Ý TƯỞNG & TỰ HỌC NỀN TẢNG LẬP TRÌNH WEB (15/08/2026 — 12/09/2026)

#### Ngày 15/08/2026: Ý tưởng xuất phát từ nỗi sợ học Toán của chính bản thân và bạn bè
- **Bối cảnh thực tế:** Trong các tiết học Toán 10 và 11 (bộ sách Kết nối tri thức), em nhận thấy rất nhiều bạn gặp khó khăn nghiêm trọng:
  1. *Hình học không gian (Toán 11):* Các bạn không thể tưởng tượng được hình chóp trong không gian 3 chiều; không phân biệt được khi nào vẽ nét liền (cạnh nhìn thấy), khi nào vẽ nét đứt (cạnh bị khuất); rất lúng túng khi xác định góc giữa mặt bên và mặt phẳng đáy.
  2. *Quy hoạch tuyến tính (Toán 10):* Khi giải bài toán tối ưu xưởng mộc, học sinh chỉ vẽ hình máy móc rồi thay tọa độ một cách thụ động, không hiểu vì sao giá trị tối ưu luôn rơi vào các đỉnh của đa giác miền nghiệm.
- **Mục tiêu nghiên cứu:** Xây dựng một trang web tương tác động cho phép học sinh "chạm vào mô hình, tự tìm ra quy luật" kiểu GeoGebra / Desmos, nhưng có kịch bản định hướng sư phạm để học sinh tự đúc kết kiến thức chứ không học vẹt.

#### Ngày 18/08/2026 — 25/08/2026: Tự học HTML, CSS, JavaScript và thẻ Canvas 2D
- **Tài liệu tự học:** MDN Web Docs, W3Schools, các khóa học lập trình miễn phí trên FreeCodeCamp và YouTube (kênh The Coding Train).
- **Thử nghiệm đầu tiên:** Em tạo tệp `index.html` và dùng thẻ `<canvas>` để vẽ hệ trục tọa độ Oxy cùng một tam giác.
- 🔴 **LỖI KỸ THUẬT #1 (Trục tung bị đảo ngược):**
  - *Hiện tượng:* Khi em vẽ điểm $A(2; 4)$ và $B(5; 1)$, hình tam giác bị lộn ngược xuống dưới màn hình!
  - *Nguyên nhân:* Hệ tọa độ màn hình máy tính có gốc $(0,0)$ ở góc trên bên trái, trục $Y$ hướng từ trên xuống dưới; ngược hoàn toàn với hệ tọa độ Descartes toán học (trục $Y$ hướng từ dưới lên trên).
  - 🟢 *Cách tự khắc phục:* Em tự lập công thức chuyển đổi tọa độ Affine:
    ```javascript
    function toScreenX(mathX) { return originX + mathX * scale; }
    function toScreenY(mathY) { return originY - mathY * scale; } // Đảo chiều trục Y
    ```
    Khi tam giác hiện lên đúng chiều toán học, em đã reo lên trong phòng vì sung sướng!

#### Ngày 26/08/2026 — 12/09/2026: Tiếp cận React 18, Next.js và Tailwind CSS
- **Lý do chuyển đổi:** Khi mã nguồn JavaScript thuần vượt quá 1.000 dòng, việc quản lý các nút bấm, thanh trượt (slider) và hộp thoại chat trở nên hỗn loạn. Em quyết định tự học React để chia nhỏ giao diện thành các Component độc lập.
- 🔴 **LỖI KỸ THUẬT #2 (Vòng lặp Re-render vô tận):**
  - *Hiện tượng:* Trình duyệt bị đơ cứng, quạt tản nhiệt máy tính kêu to và console báo lỗi: `Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside useEffect`.
  - *Nguyên nhân:* Em gọi hàm cập nhật tham số `setParams()` trực tiếp trong `useEffect` mà không có mảng phụ thuộc `[]`, làm kích hoạt chu kỳ render vô hạn.
  - 🟢 *Cách tự khắc phục:* Em đọc kỹ tài liệu React Hooks, học cách sử dụng mảng phụ thuộc (dependency array), đồng thời bọc các phép toán hình học nặng vào `useMemo` và `useCallback` để đảm bảo tốc độ mượt mà.

---

### GIAI ĐOẠN 2: TỰ PHÁT TRIỂN THUẬT TOÁN TOÁN HỌC & ĐỘNG CƠ GEOGEBRA (13/09/2026 — 12/10/2026)

#### Ngày 13/09/2026 — 22/09/2026: Thuật toán cắt đa giác miền nghiệm Sutherland-Hodgman (Module 1)
- **Nội dung:** Mô phỏng Hệ bất phương trình bậc nhất hai ẩn (Bài 3 & 4 Toán 10 KNTT).
- **Thách thức:** Khi học sinh thêm bớt bất phương trình bất kỳ (ví dụ $3x + 2y \le 48$, $x + 2y \le 32$, $x \ge 0$, $y \ge 0$), làm thế nào để Canvas tự động tính ra tọa độ các đỉnh của miền nghiệm và tô màu đa giác?
- 🔴 **LỖI KỸ THUẬT #3 (Đa giác bị méo hình cánh bướm):**
  - *Hiện tượng:* Khi nối các giao điểm tìm được, Canvas vẽ ra hình bị chéo nhau, phần tô màu bị lộn xộn.
  - *Nguyên nhân:* Các đỉnh được sinh ra theo thứ tự giải phương trình ngẫu nhiên, không theo chiều kim đồng hồ quanh đa giác lồi.
  - 🟢 *Cách tự khắc phục:*
    1. Em tự cài đặt thuật toán cắt đa giác bằng nửa mặt phẳng `clipPolygon`.
    2. Tính trọng tâm đa giác $G(x_G, y_G) = (\frac{\sum x_i}{n}, \frac{\sum y_i}{n})$.
    3. Sắp xếp lại danh sách đỉnh theo góc cực bằng hàm `Math.atan2(y - y_G, x - x_G)` trước khi gọi `ctx.fill()`.

#### Ngày 23/09/2026 — 05/10/2026: Thuật toán Cạnh Thấy / Cạnh Khuất Back-Face Culling (Module 2)
- **Nội dung:** Mô hình hình chóp tứ giác $S.ABCD$ trong không gian 3D (Toán 11 KNTT Bài 10, 11, 12).
- **Thách thức lớn nhất của đề tài:** SGK quy định ngặt nghèo: Cạnh nhìn thấy phải vẽ nét liền, cạnh bị các mặt khác che khuất phải vẽ nét đứt màu đỏ hồng.
- 🔴 **LỖI KỸ THUẬT #4 (Cạnh trước mặt vẫn bị vẽ nét đứt khi xoay hình):**
  - *Hiện tượng:* Ban đầu em gán cứng cạnh đáy $AD$ vẽ nét đứt. Nhưng khi học sinh xoay mô hình 3D ra phía sau, cạnh $AD$ lúc này quay ra trước mặt người nhìn nhưng vẫn bị vẽ nét đứt $\to$ Sai bản chất hình học không gian!
  - *Quá trình trăn trở:* Em đã mất 4 ngày liên tục đọc sách hình học giải tích và đồ họa máy tính để tìm công thức xác định một mặt phẳng tam giác đang "quay về phía mắt" hay "quay ra xa mắt".
  - 🟢 *Cách tự khắc phục:* Em tự lập trình thuật toán tích vô hướng vectơ pháp tuyến (Back-face Culling):
    1. Với mặt tam giác $SAB$ có 3 đỉnh $S, A, B$, tính 2 vectơ chỉ phương $\vec{u} = \vec{A} - \vec{S}$, $\vec{v} = \vec{B} - \vec{S}$.
    2. Tính vectơ pháp tuyến bằng tích có hướng: $\vec{n} = \vec{u} \times \vec{v} = (u_y v_z - u_z v_y, u_z v_x - u_x v_z, u_x v_y - u_y v_x)$.
    3. Nhân vô hướng $\vec{n}$ với vectơ hướng nhìn của camera $\vec{view}$:
       $$\text{Dot} = \vec{n} \cdot \vec{view}$$
       - Nếu $\text{Dot} < 0$: Mặt đang hướng về mắt người quan sát $\implies$ Mặt thấy.
       - Nếu $\text{Dot} \ge 0$: Mặt quay ra xa $\implies$ Mặt khuất.
    4. Một đoạn thẳng nối giữa 2 đỉnh sẽ được vẽ **nét liền** nếu nó thuộc về ít nhất một mặt nhìn thấy; và vẽ **nét đứt** nếu tất cả các mặt chứa nó đều là mặt khuất!

#### Ngày 06/10/2026 — 12/10/2026: Xây dựng Bộ quản lý tham số động 60fps (Zustand Parameter Dock)
- **Nâng cấp kiểu GeoGebra:** Học sinh có thể nhấn nút `[+ Thêm biến số]` để tạo các biến $m, k, a, b, \alpha...$ tùy ý.
- **Tối ưu hóa hiệu năng:** Tránh hiện tượng giật lag khi kéo thanh trượt liên tục bằng cách đưa trạng thái biến số vào Zustand store, giúp giao diện đạt tốc độ khung hình chuẩn 60fps mượt mà.

---

### GIAI ĐOẠN 3: THIẾT KẾ SƯ PHẠM SOCRATIC 8 BƯỚC & TÍCH HỢP AI KHÁM PHÁ (13/10/2026 — 07/11/2026)

#### Ngày 13/10/2026 — 25/10/2026: Xây dựng Giàn giáo Socratic (TES Mascot) & Ngăn chặn AI giải hộ
- **Mục tiêu giáo dục:** Trợ lý AI không được làm máy giải bài hộ học sinh. AI phải đóng vai trò người Thầy đối thoại Socrate, đặt câu hỏi gợi mở để học sinh tự suy nghĩ.
- 🔴 **LỖI KỸ THUẬT #5 (AI khen bừa và trả lời vội vã khi học sinh gõ thiếu ngữ cảnh):**
  - *Hiện tượng:* Khi thử nghiệm với một bạn trong lớp, bạn đó gõ vào khung chat chữ "m" hoặc dãy số "22222222", AI lập tức phản hồi: *"Chính xác! Khi thay tọa độ điểm M(2; 3)..."* rồi tuôn ra toàn bộ lời giải!
  - *Nguyên nhân:* Prompt mặc định của LLM có xu hướng "chiều lòng người dùng" (sycophancy) và tự động suy diễn bù đắp ngữ cảnh còn thiếu.
  - 🟢 *Cách tự khắc phục:*
    1. Em tự viết bộ lọc kiểm tra ngữ nghĩa tự động `checkSemanticQuality(str)` ở phía Client: Bắt buộc câu trả lời của học sinh phải chứa các từ nối lập luận (`vì`, `do`, `bởi vì`, `suy ra`, `khi`, `nếu`) và có độ dài tối thiểu 15 ký tự.
    2. Cập nhật System Prompt nghiêm ngặt cho LLM: Nếu học sinh trả lời không đủ căn cứ hoặc gõ ký tự vô nghĩa, AI **tuyệt đối không được khen** mà phải yêu cầu học sinh quan sát lại đồ thị và chỉ ra tọa độ cụ thể.

#### Ngày 26/10/2026 — 02/11/2026: Rà soát Chương trình GDPT 2018 & Điều chỉnh Thuật ngữ Chuyên môn
- 🔴 **ĐIỀU CHỈNH CHUYÊN MÔN QUAN TRỌNG:**
  - Trong bản thảo ban đầu, em dùng tiêu đề: *"Khai triển phẳng ↔ Gấp khối đa diện & Góc nhị diện"*.
  - Sau khi rà soát kỹ lưỡng sách giáo khoa Toán 11 mới (Bộ Kết nối tri thức, Chân trời sáng tạo, Cánh diều) và tham vấn thầy giáo hướng dẫn, em phát hiện: **Chương trình GDPT 2018 không còn sử dụng khái niệm "góc nhị diện"** như chương trình cũ 2006, mà sử dụng khái niệm chuẩn hóa là **"Góc giữa hai mặt phẳng"** (và trường hợp cụ thể là góc giữa mặt bên và mặt phẳng đáy).
  - 🟢 *Hành động khắc phục:* Em đã rà soát toàn bộ mã nguồn (`stationCatalogData.ts`, `MathStepWorkbench.tsx`, `page.tsx`), xóa bỏ hoàn toàn cụm từ "góc nhị diện" và thay thế bằng **"Góc giữa hai mặt phẳng"** để đảm bảo tính chuẩn xác khoa học và bám sát 100% chương trình giáo dục phổ thông mới.

#### Ngày 03/11/2026 — 07/11/2026: Thực nghiệm Sư phạm diện hẹp (30 học sinh) & Hoàn thiện 7 Module
- **Địa bàn thực nghiệm:** 30 bạn học sinh khối 10 và 11 trường THPT.
- **Quy trình:**
  - Cho học sinh làm bài kiểm tra trước (Pre-test) gồm các câu hỏi đo lường lỗi tư duy theo thang Newman (mã lỗi M1-M3, G1-G3, T1-T3).
  - Học sinh trải nghiệm 7 module thí nghiệm MathSTEP với quy trình 8 bước.
  - Cho học sinh làm bài kiểm tra sau (Post-test).
- **Kết quả thu được:**
  - Điểm Pre-test trung bình: $4.85 / 10$ điểm.
  - Điểm Post-test trung bình: $8.42 / 10$ điểm.
  - Mức tăng trưởng trung bình: $\Delta = +3.57$ điểm ($p < 0.001$, có ý nghĩa thống kê rất cao).
  - Tỷ lệ khắc phục dứt điểm các lỗi tư duy toán học: đạt **89.4%**.

---

# PHỤ LỤC VI: BẢN CAM KẾT & KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)
*(AI Ethics & Declaration Form — Minh bạch hóa việc sử dụng AI, bảo vệ tính trung thực và quyền tác giả của học sinh)*

### 1. THÔNG TIN CHUNG
- **Tên dự án:** MATHSTEP — Hệ Thống Học Liệu Số Toán Học 3D/AR Tích Hợp Trợ Lý Socratic Hỗ Trợ Học Sinh Tự Khám Phá Theo Chương Trình GDPT 2018.
- **Tác giả học sinh:** Nghiên cứu và thực hiện độc lập.
- **Giáo viên hướng dẫn:** Hỗ trợ định hướng phương pháp luận khoa học và thẩm định tính đúng đắn toán học.

### 2. DANH MỤC CÁC CÔNG CỤ TRÍ TUỆ NHÂN TẠO ĐÃ SỬ DỤNG
| Công cụ AI | Phiên bản / Môi trường | Mục đích sử dụng cụ thể |
| :--- | :--- | :--- |
| **Google Gemini API** | `gemini-2.5-flash` | Cung cấp động cơ ngôn ngữ cho Trợ lý Socratic TES (đối thoại gợi mở với học sinh) và phân tích đề bài hình học tự nhiên thành cấu trúc tọa độ JSON. |
| **OpenAI API / ChatGPT** | `gpt-4o` | Tra cứu cú pháp lập trình, giải thích tài liệu thư viện Three.js, hỗ trợ tìm nguyên nhân các thông báo lỗi biên dịch (Debugging mentor). |
| **DeepSeek R1** | `deepseek-r1` | Kiểm thử so sánh suy luận chuỗi tư duy (Chain-of-Thought) trong các bước giải thích toán học. |

### 3. RANH GIỚI MINH BẠCH: NHỮNG GÌ AI ĐÃ LÀM VÀ NHỮNG GÌ TÁC GIẢ TỰ LÀM

#### A. Những phần TÁC GIẢ HỌC SINH TỰ LÀM 100% (Quyền tác giả độc lập):
1. **Ý tưởng khoa học và Khung kiến trúc sư phạm:** Thiết kế mô hình nhận thức 8 bước dựa trên 5 lý thuyết giáo dục quốc tế (Ainsworth DeFT, Alfieri Guided Discovery, Chi Self-Explanation, Duval Semiotic Registers, Newman Error Analysis).
2. **Thuật toán Hình học & Đồ họa 2D/3D:**
   - Thuật toán cắt đa giác lồi `clipPolygon` (Sutherland-Hodgman).
   - Thuật toán sắp xếp đỉnh theo góc cực quanh trọng tâm.
   - Thuật toán Back-face Culling phân biệt cạnh thấy / nét đứt trong không gian 3D dựa trên tích vô hướng vectơ pháp tuyến.
   - Thuật toán quét đường mức $F(x, y) = k$ và tự bắt dính đỉnh tối ưu.
   - Thuật toán xấp xỉ tích phân Riemann chia $n$ dải chữ nhật và mô hình khối tròn xoay 3D đĩa tròn (Disk Method).
   - Đồ thị đường conic và kiểm chứng tính chất tiêu cự $MF_1 + MF_2 = 2a$.
3. **Thiết kế kịch bản 48 trạm học SGK & 7 Module chuyên sâu:** Tự biên soạn toàn bộ đề bài thực tế (xưởng mộc, mái che tháp canh, tay máy lượng giác, khảo sát hàm số, hộp bi xác suất), lập bảng dữ liệu và tiêu chí kiểm chứng bám sát SGK Kết nối tri thức.
4. **Viết mã nguồn Frontend & Quản lý trạng thái:** Tự tổ chức cấu trúc thư mục Next.js 15, xây dựng các Canvas component, viết CSS Tailwind, thiết lập Zustand store cho Parameter Dock.
5. **Thực nghiệm sư phạm:** Tự thiết kế phiếu Pre-test / Post-test, tổ chức khảo sát trên 30 bạn học sinh và xử lý số liệu thống kê.

#### B. Những phần CÓ SỰ TRỢ GIÚP CỦA AI (Khai báo minh bạch):
1. **AI đóng vai trò Người hướng dẫn lập trình (Programming Mentor):** Khi gặp các lỗi khó của React/Next.js (như lỗi re-render vô tận, lỗi Hydration mismatch do localStorage, lỗi KaTeX parse Regex), tác giả copy thông báo lỗi và hỏi AI cách khắc phục. Tác giả tự đọc hiểu nguyên nhân và tự gõ mã sửa lỗi vào dự án.
2. **AI đóng vai trò Trợ lý đối thoại trong sản phẩm (In-App Socratic Agent):** Mô hình ngôn ngữ lớn (Gemini / GPT) được tích hợp vào tính năng Chat của MathSTEP để đóng vai linh vật TES. AI nhận câu trả lời của học sinh, so sánh với bối cảnh bài học và sinh ra câu hỏi gợi mở tiếp theo theo Prompt System do tác giả tự thiết kế.

### 4. CAM KẾT LIÊM CHÍNH KHOA HỌC (ETHICAL STATEMENT)
- Tác giả xin cam đoan: **Tuyệt đối không có chuyện thuê người khác viết code hộ hay mua bán sản phẩm**. Mọi dòng mã nguồn, mọi công thức toán học và từng hình vẽ trên Canvas đều là kết quả của quá trình tự học tập, nghiên cứu bền bỉ và lao động trí tuệ nghiêm túc của tác giả.
- Việc sử dụng Trí tuệ nhân tạo được thực hiện công khai, minh bạch, đúng chuẩn mực đạo đức khoa học quốc tế: Sử dụng AI như một công cụ hỗ trợ nâng cao hiệu quả học tập, hoàn toàn không làm lu mờ vai trò chủ thể sáng tạo của học sinh.

*Hà Nội, ngày 07 tháng 11 năm 2026*  
**TÁC GIẢ HỌC SINH THỰC HIỆN DỰ ÁN**  
*(Ký và ghi rõ họ tên)*
