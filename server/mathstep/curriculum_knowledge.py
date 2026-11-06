"""Bộ dữ liệu và tri thức chuẩn hóa từ Sách giáo khoa (SGK), Sách bài tập (SBT)
và Chuyên đề học tập Toán THPT theo Chương trình GDPT 2018.
Bao gồm cả 3 bộ sách: Kết nối tri thức với cuộc sống, Cánh diều, Chân trời sáng tạo.
"""

from __future__ import annotations

from typing import Any


CURRICULUM_KNOWLEDGE: dict[str, dict[str, Any]] = {
    "linear_programming": {
        "title": "Bất phương trình, hệ bất phương trình bậc nhất hai ẩn & Bài toán quy hoạch tuyến tính (Toán 10 & Chuyên đề 10)",
        "textbook_sources": [
            "SGK Toán 10 (Tập 1) - Chương II: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn",
            "Chuyên đề học tập Toán 10 - Chuyên đề I: Hệ phương trình và bài toán quy hoạch tuyến tính",
            "SBT Toán 10 (Tập 1) - Các bài tập ứng dụng thực tiễn tối ưu hóa nguồn lực",
        ],
        "core_definitions": [
            {
                "term": "Bất phương trình bậc nhất hai ẩn",
                "definition": "Bất phương trình có dạng tổng quát ax + by < c (hoặc ≤ c, > c, ≥ c), trong đó a, b, c là các số thực đã cho và a, b không đồng thời bằng 0; x và y là các ẩn số.",
                "rule": "Nghiệm của bất phương trình là cặp số (x0; y0) sao cho khi thay x = x0, y = y0 thì mệnh đề nhận được là đúng.",
            },
            {
                "term": "Quy tắc biểu diễn miền nghiệm của ax + by ≤ c trên mặt phẳng Oxy",
                "steps": [
                    "Bước 1: Vẽ đường thẳng bờ d: ax + by = c trên mặt phẳng tọa độ Oxy. (Nếu có dấu '=' như ≤ hoặc ≥ thì vẽ NÉT LIỀN vì bờ d thuộc miền nghiệm; nếu dấu '<' hoặc '>' thì vẽ NÉT ĐỨT vì bờ d không thuộc miền nghiệm).",
                    "Bước 2: Lấy một điểm thử M(x0; y0) không thuộc d. Điểm thử thuận lợi nhất thường là gốc tọa độ O(0; 0) khi c ≠ 0.",
                    "Bước 3: Tính giá trị ax0 + by0 rồi so sánh với c. Nếu thỏa mãn thì nửa mặt phẳng chứa điểm M (kể cả bờ d) là miền nghiệm; nếu không thỏa mãn thì nửa mặt phẳng còn lại (không chứa M) là miền nghiệm.",
                ],
            },
            {
                "term": "Miền nghiệm của hệ bất phương trình bậc nhất hai ẩn",
                "definition": "Miền nghiệm của hệ là PHẦN GIAO của các miền nghiệm của từng bất phương trình trong hệ. Trên mặt phẳng tọa độ Oxy, phần giao này thường tạo thành một miền đa giác (tam giác, tứ giác...) hoặc một miền đa giác không bị chặn.",
            },
            {
                "term": "Định lý tối ưu trên miền đa giác (Bài toán quy hoạch tuyến tính)",
                "theorem": "Biểu thức F(x, y) = ax + by đạt giá trị lớn nhất (hoặc giá trị nhỏ nhất) trên một miền đa giác (bao gồm cả biên) tại một trong các ĐỈNH của đa giác đó.",
                "method_steps": [
                    "1. Gọi biến (thường là x, y), đặt điều kiện tự nhiên (ví dụ: x ≥ 0, y ≥ 0; nếu là sản phẩm rời rạc thì x, y nguyên).",
                    "2. Lập hệ bất phương trình biểu thị các ràng buộc về nguyên liệu, thời gian, nhân công, vốn...",
                    "3. Xác định miền nghiệm đa giác của hệ trên mặt phẳng Oxy và tìm tọa độ tất cả các đỉnh A, B, C... của đa giác.",
                    "4. Thiết lập hàm mục tiêu F(x, y) (lợi nhuận, doanh thu hoặc chi phí).",
                    "5. Tính giá trị F tại từng đỉnh: F(A), F(B), F(C)... So sánh các giá trị để kết luận điểm tối ưu (GTLN/GTNN) và diễn giải đáp số thực tế.",
                ],
            },
        ],
        "common_student_errors": [
            "M1 (Lập mô hình): Quên đặt điều kiện không âm (x ≥ 0, y ≥ 0) hoặc điều kiện nguyên cho các đại lượng thực tế.",
            "M2 (Đại số - Hình học): Nhầm lẫn giữa nửa mặt phẳng được chọn và nửa mặt phẳng bị gạch bỏ; vẽ đường biên sai nét (nét đứt thay vì nét liền hoặc ngược lại).",
            "M3 (Giao miền và tối ưu): Chỉ xét các điểm tùy tiện trong miền mà quên rằng điểm tối ưu luôn nằm tại các đỉnh; hoặc nhầm tọa độ giao điểm giữa các đường thẳng biên.",
        ],
    },
    "trigonometry": {
        "title": "Giá trị lượng giác của một góc & Đường tròn lượng giác (Toán 10 & Toán 11)",
        "textbook_sources": [
            "SGK Toán 10 (Tập 1) - Chương IV: Hệ thức lượng trong tam giác (Giá trị lượng giác từ 0° đến 180°)",
            "SGK Toán 11 (Tập 1) - Chương I: Hàm số lượng giác và phương trình lượng giác (Đường tròn lượng giác & công thức)",
            "SBT Toán 10, 11 - Các bài toán tính giá trị và chứng minh đẳng thức lượng giác",
        ],
        "core_definitions": [
            {
                "term": "Giá trị lượng giác trên nửa đường tròn đơn vị (Toán 10)",
                "definition": "Với mỗi góc α (0° ≤ α ≤ 180°), tương ứng với một điểm M(x0; y0) duy nhất trên nửa đường tròn đơn vị tâm O. Ta định nghĩa: sin α = y0 (tung độ), cos α = x0 (hoành độ), tan α = y0/x0 (x0 ≠ 0), cot α = x0/y0 (y0 ≠ 0).",
                "properties": [
                    "Góc nhọn (0° < α < 90°): sin α > 0, cos α > 0, tan α > 0, cot α > 0.",
                    "Góc tù (90° < α < 180°): sin α > 0, cos α < 0, tan α < 0, cot α < 0.",
                    "Góc đặc biệt: sin 0° = 0, cos 0° = 1; sin 90° = 1, cos 90° = 0; sin 180° = 0, cos 180° = -1.",
                ],
            },
            {
                "term": "Góc bù nhau và góc phụ nhau (Toán 10)",
                "rules": [
                    "Hai góc bù nhau (α và 180° - α): sin(180° - α) = sin α; cos(180° - α) = -cos α; tan(180° - α) = -tan α (α ≠ 90°); cot(180° - α) = -cot α (0° < α < 180°).",
                    "Hai góc phụ nhau (α và 90° - α): sin(90° - α) = cos α; cos(90° - α) = sin α; tan(90° - α) = cot α; cot(90° - α) = tan α.",
                ],
            },
            {
                "term": "Đường tròn lượng giác tổng quát & 4 góc phần tư (Toán 11)",
                "definition": "Đường tròn định hướng tâm O(0; 0), bán kính R = 1, lấy gốc A(1; 0). Chiều quay ngược chiều kim đồng hồ là chiều dương (+).",
                "quadrants": [
                    "Góc phần tư I (0 < α < π/2): cos > 0, sin > 0, tan > 0, cot > 0.",
                    "Góc phần tư II (π/2 < α < π): cos < 0, sin > 0, tan < 0, cot < 0.",
                    "Góc phần tư III (π < α < 3π/2): cos < 0, sin < 0, tan > 0, cot > 0.",
                    "Góc phần tư IV (3π/2 < α < 2π): cos > 0, sin < 0, tan < 0, cot < 0.",
                ],
            },
            {
                "term": "Các hệ thức lượng giác cơ bản",
                "identities": [
                    "sin²α + cos²α = 1 (với mọi α)",
                    "1 + tan²α = 1/cos²α (với α ≠ π/2 + kπ)",
                    "1 + cot²α = 1/sin²α (với α ≠ kπ)",
                    "tan α · cot α = 1 (với α ≠ kπ/2)",
                ],
            },
        ],
        "common_student_errors": [
            "Quên dấu âm của cos khi góc tù (90° < α ≤ 180°).",
            "Nhầm lẫn giữa trục sin (trục tung Oy đứng) và trục cos (trục hoành Ox nằm ngang).",
            "Quên điều kiện xác định của tan (cos ≠ 0) và cot (sin ≠ 0).",
        ],
    },
    "spatial_geometry": {
        "title": "Quan hệ song song và quan hệ vuông góc trong không gian (Toán 11)",
        "textbook_sources": [
            "SGK Toán 11 (Tập 1 & Tập 2) - Chương IV: Quan hệ song song và Quan hệ vuông góc trong không gian",
            "SBT Toán 11 - Các bài toán dựng hình, tìm giao tuyến và chứng minh vuông góc",
        ],
        "core_definitions": [
            {
                "term": "Quy tắc vẽ hình biểu diễn của hình không gian lên mặt phẳng (SGK Chuẩn)",
                "rules": [
                    "Đường nhìn thấy vẽ bằng NÉT LIỀN (-); đường bị che khuất vẽ bằng NÉT ĐỨT (---).",
                    "Hai đường thẳng song song trong không gian được biểu diễn bằng hai đường thẳng song song trên mặt phẳng.",
                    "Giữ nguyên tỉ số của hai đoạn thẳng cùng nằm trên một đường thẳng hoặc trên hai đường thẳng song song.",
                    "Hình biểu diễn của hình vuông, hình chữ nhật, hình thoi đều vẽ thành hình bình hành.",
                    "Hình biểu diễn của tam giác đều, tam giác vuông, tam giác cân nói chung đều là tam giác thường.",
                ],
            },
            {
                "term": "Đường thẳng vuông góc với mặt phẳng (d ⊥ (α))",
                "definition": "Đường thẳng d được gọi là vuông góc với mặt phẳng (α) nếu d vuông góc với MỌI đường thẳng a nằm trong (α).",
                "recognition_theorem": "Định lý nhận biết: Nếu đường thẳng d vuông góc với HAI ĐƯỜNG THẲNG CẮT NHAU a và b cùng nằm trong mặt phẳng (α) thì d ⊥ (α).",
                "consequence": "Hệ quả: Nếu d ⊥ (α) và a ⊂ (α) thì d ⊥ a (kể cả khi d và a chéo nhau hoặc không cắt nhau).",
            },
            {
                "term": "Góc giữa đường thẳng và mặt phẳng",
                "definition": "Góc giữa đường thẳng d và mặt phẳng (α) là góc giữa d và hình chiếu vuông góc d' của d lên (α).",
                "steps": [
                    "Bước 1: Tìm giao điểm O = d ∩ (α).",
                    "Bước 2: Lấy điểm A trên d (A ≠ O), dựng hình chiếu vuông góc H của A lên (α) (nghĩa là AH ⊥ (α) tại H).",
                    "Bước 3: Nối OH, góc cần tìm là góc AOH (góc nhọn).",
                ],
            },
        ],
        "common_student_errors": [
            "Kết luận hai đường thẳng vuông góc chỉ dựa vào mắt nhìn trên hình vẽ phẳng.",
            "Quên điều kiện hai đường thẳng trong mặt phẳng phải CẮT NHAU khi áp dụng định lý d ⊥ (α).",
            "Nhầm lẫn giữa các cạnh khuất (nét đứt) và cạnh nhìn thấy (nét liền) khi khối chóp thay đổi hướng nhìn.",
        ],
    },
    "functions": {
        "title": "Khảo sát sự biến thiên và vẽ đồ thị của hàm số (Toán 12)",
        "textbook_sources": [
            "SGK Toán 12 (Tập 1) - Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số",
            "SBT Toán 12 (Tập 1) - Khảo sát hàm đa thức bậc 3, hàm phân thức hữu tỉ, bài toán tương giao",
        ],
        "core_definitions": [
            {
                "term": "Tính đơn điệu của hàm số",
                "definition": "Hàm số y = f(x) đồng biến trên khoảng K nếu f'(x) ≥ 0 với mọi x ∈ K (dấu bằng chỉ xảy ra tại hữu hạn điểm); nghịch biến nếu f'(x) ≤ 0 với mọi x ∈ K.",
            },
            {
                "term": "Cực trị của hàm số",
                "definition": "Điểm x0 là điểm cực đại nếu f'(x) đổi dấu từ dương sang âm khi qua x0; là điểm cực tiểu nếu f'(x) đổi dấu từ âm sang dương khi qua x0.",
            },
            {
                "term": "Đường tiệm cận của đồ thị hàm số",
                "definition": "Đường thẳng x = x0 là tiệm cận đứng nếu lim(x -> x0) f(x) = ±∞. Đường thẳng y = y0 là tiệm cận ngang nếu lim(x -> ±∞) f(x) = y0.",
            },
            {
                "term": "Phương trình tiếp tuyến của đồ thị hàm số",
                "formula": "Phương trình tiếp tuyến tại điểm M(x0; f(x0)) là: y = f'(x0)(x - x0) + f(x0), với k = f'(x0) là hệ số góc của tiếp tuyến.",
            },
        ],
        "common_student_errors": [
            "Nhầm lẫn giữa điểm cực trị của hàm số (x_ct), điểm cực trị của đồ thị (M(x_ct; y_ct)) và giá trị cực trị (y_ct).",
            "Viết kết luận khoảng đồng biến, nghịch biến bằng kí hiệu hợp (∪) thay vì viết tách từng khoảng hoặc dùng từ 'và'.",
            "Nhầm dấu của đạo hàm f'(x) với dấu của giá trị hàm số f(x).",
        ],
    },
    "calculus": {
        "title": "Nguyên hàm, tích phân và ứng dụng hình học, vật lý (Toán 12)",
        "textbook_sources": [
            "SGK Toán 12 (Tập 2) - Chương IV: Nguyên hàm và tích phân",
            "SBT Toán 12 (Tập 2) - Tính diện tích hình phẳng và thể tích khối tròn xoay",
        ],
        "core_definitions": [
            {
                "term": "Khái niệm tích phân và ý nghĩa diện tích",
                "definition": "Cho hàm số f(x) liên tục trên đoạn [a; b]. Diện tích hình phẳng giới hạn bởi đồ thị y = f(x), trục hoành Ox và hai đường thẳng x = a, x = b là: S = ∫[a->b] |f(x)| dx.",
            },
            {
                "term": "Thể tích khối tròn xoay sinh bởi quay quanh trục Ox",
                "formula": "Thể tích khối tròn xoay tạo thành khi quay hình phẳng giới hạn bởi y = f(x), y = 0, x = a, x = b quanh Ox là: V = π ∫[a->b] [f(x)]² dx.",
            },
            {
                "term": "Ý nghĩa vật lý của đạo hàm và tích phân",
                "definition": "Vận tốc tức thời v(t) = s'(t) (đạo hàm của quãng đường). Quãng đường di chuyển s = ∫[t1->t2] |v(t)| dt. Độ dời x(t2) - x(t1) = ∫[t1->t2] v(t) dt.",
            },
        ],
        "common_student_errors": [
            "Quên dấu giá trị tuyệt đối khi tính diện tích dẫn đến kết quả diện tích mang giá trị âm.",
            "Quên nhân số π trong công thức tính thể tích khối tròn xoay V = π ∫ [f(x)]² dx.",
            "Nhầm lẫn giữa quãng đường đi được (tích phân của tốc độ |v(t)|) và độ dịch chuyển (tích phân của vận tốc v(t)).",
        ],
    },
    "probability": {
        "title": "Xác suất có điều kiện, quy tắc nhân, công thức Bayes & Sơ đồ cây (Toán 11 & 12)",
        "textbook_sources": [
            "SGK Toán 11 (Tập 2) - Chương IX: Các quy tắc tính xác suất",
            "SGK Toán 12 (Tập 2) - Chương VI: Xác suất có điều kiện và công thức Bayes",
        ],
        "core_definitions": [
            {
                "term": "Xác suất có điều kiện",
                "formula": "Xác suất của biến cố A khi biết biến cố B đã xảy ra là: P(A|B) = P(A ∩ B) / P(B), với P(B) > 0.",
            },
            {
                "term": "Công thức nhân xác suất và Biến cố độc lập",
                "formula": "P(A ∩ B) = P(B) · P(A|B). Hai biến cố A, B độc lập khi và chỉ khi P(A ∩ B) = P(A) · P(B).",
            },
            {
                "term": "Công thức xác suất toàn phần và công thức Bayes",
                "formula": "P(B) = P(A)P(B|A) + P(Ā)P(B|Ā). Công thức Bayes: P(A|B) = [P(A) · P(B|A)] / P(B).",
            },
            {
                "term": "Quy tắc dựng và tính xác suất trên sơ đồ cây",
                "rule": "Xác suất trên một đường đi từ gốc đến lá bằng TÍCH các xác suất trên các nhánh của đường đi đó. Xác suất của một biến cố bằng TỔNG các xác suất của các đường đi tương ứng.",
            },
        ],
        "common_student_errors": [
            "Nhầm lẫn giữa chọn có hoàn lại (xác suất giữ nguyên) và không hoàn lại (xác suất thay đổi sau mỗi bước rút).",
            "Nhầm lẫn giữa xác suất có điều kiện P(A|B) và xác suất giao P(A ∩ B).",
            "Đồng nhất khái niệm độc lập (P(AB) = P(A)P(B)) với khái niệm xung khắc (A ∩ B = ∅).",
        ],
    },
    "conics_and_solids": {
        "title": "Hình khối không gian và Các đường Conic (Toán 10, 11 & 12)",
        "textbook_sources": [
            "SGK Toán 10 (Tập 2) - Chương VII: Ba đường conic trong mặt phẳng toạ độ (Elip, Hypebol, Parabol)",
            "SGK Toán 11 & 12 - Khối chóp, khối lăng trụ, khối tròn xoay (nón, trụ, cầu)",
        ],
        "core_definitions": [
            {
                "term": "Nguyên lý mặt phẳng cắt mặt nón tròn xoay (Conic Sections)",
                "rules": [
                    "Nếu mặt phẳng cắt qua trục: tiết diện là hai đường sinh cắt nhau.",
                    "Nếu góc nghiêng mặt phẳng lớn hơn góc nghiêng đường sinh: tiết diện là Elip (e < 1); khi vuông góc trục là đường tròn.",
                    "Nếu mặt phẳng song song với một đường sinh: tiết diện là Parabol (e = 1).",
                    "Nếu góc nghiêng mặt phẳng nhỏ hơn góc nghiêng đường sinh: cắt cả hai phần của mặt nón tạo thành Hypebol (e > 1).",
                ],
            },
            {
                "term": "Phương trình chính tắc các đường Conic",
                "equations": [
                    "Elip: x²/a² + y²/b² = 1 (với a² = b² + c², c là tiêu cự, tâm sai e = c/a < 1). Định nghĩa: MF1 + MF2 = 2a.",
                    "Hypebol: x²/a² - y²/b² = 1 (với c² = a² + b², tâm sai e = c/a > 1). Định nghĩa: |MF1 - MF2| = 2a.",
                    "Parabol: y² = 2px (p > 0, tiêu điểm F(p/2; 0), đường chuẩn x = -p/2, tâm sai e = 1).",
                ],
            },
            {
                "term": "Thể tích và diện tích các khối tròn xoay",
                "formulas": [
                    "Khối nón: V = (1/3)π r² h; Diện tích xung quanh: Sxq = π r l (với l² = r² + h²).",
                    "Khối trụ: V = π r² h; Sxq = 2π r h.",
                    "Khối cầu: V = (4/3)π R³; Diện tích mặt cầu: S = 4π R².",
                ],
            },
        ],
        "common_student_errors": [
            "Nhầm lẫn hệ thức liên hệ a, b, c giữa Elip (a² = b² + c²) và Hypebol (c² = a² + b²).",
            "Nhầm lẫn giữa chiều cao h, bán kính đáy r và đường sinh l của hình nón tròn xoay.",
            "Nhầm lẫn giữa tiêu cự 2c và bán tiêu cự c trong các bài toán conic.",
        ],
    },
}


def get_curriculum_knowledge(module_id: str, query: str = "") -> dict[str, Any]:
    """Trích xuất kiến thức chuẩn SGK phù hợp với module và nội dung câu hỏi."""
    fallback_module = "linear_programming"
    selected = CURRICULUM_KNOWLEDGE.get(module_id, CURRICULUM_KNOWLEDGE[fallback_module])

    # Lọc ngắn gọn nếu query khớp các từ khóa cụ thể
    return {
        "title": selected["title"],
        "textbook_sources": selected["textbook_sources"],
        "core_definitions": selected["core_definitions"],
        "common_student_errors": selected["common_student_errors"],
    }
