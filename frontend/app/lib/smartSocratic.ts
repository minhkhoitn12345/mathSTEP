/**
 * Smart Socratic Pedagogical Engine
 * Cung cấp phản hồi sư phạm gợi mở theo phương pháp Socratic chuẩn GDPT 2018.
 * Tự động phân tích câu hỏi học sinh, đánh giá câu trả lời tự luận và gợi ý câu hỏi đào sâu.
 */

export interface SocraticResponse {
  answer: string;
  intent: string;
  nextQuestion?: string;
  hintLevel?: number;
  mathValidation?: {
    status: "verified" | "neutral";
    result: boolean | number | null;
    explanation: string;
  };
}

export function generateSmartSocraticResponse(
  message: string,
  moduleId: string,
  stageId: string,
  hintLevel = 1
): SocraticResponse {
  const q = message.trim().toLowerCase();

  // 1. Phân tích trường hợp học sinh nhờ nhận xét câu trả lời tự luận (Dự đoán / Đúc kết)
  if (q.includes("nhận xét") || q.includes("dự đoán của em") || q.includes("đúc kết của em")) {
    const hasReason = /vì|do|bởi|khi|nếu|suy ra|tại|theo/.test(q);
    const isShort = q.length < 35;

    if (isShort && !hasReason) {
      return {
        answer: `Thầy/Cô thấy em đã nắm được một phần xu hướng. Tuy nhiên, trong toán học thực nghiệm, một dự đoán cần có **căn cứ suy luận**.\n\nEm hãy thử bổ sung: **Vì sao em lại nghĩ kết quả sẽ như vậy?** Em có thể đối chiếu với đồ thị hoặc công thức toán học để giải thích thêm nhé!`,
        intent: "diagnose",
        nextQuestion: "Làm sao dùng mô phỏng để kiểm tra dự đoán này?",
      };
    }

    if (hasReason) {
      return {
        answer: `Rất tốt! Em đã biết dùng lập luận toán học có căn cứ. Bây giờ, em hãy chuyển sang **Bước 3 (Thao tác mô phỏng)**: hãy kéo thử các thanh trượt tham số trên khung vẽ để quan sát xem hiện tượng thực tế có đúng như lập luận của em không nhé!`,
        intent: "reflect",
        nextQuestion: "Nếu tăng giá trị tham số lên gấp đôi thì sao?",
      };
    }
  }

  // 2. Phân tích theo từng Chuyên đề Toán học (Module)
  if (moduleId === "linear_programming") {
    if (q.includes("miền nghiệm") || q.includes("bất phương trình")) {
      return {
        answer: `Miền nghiệm của hệ bất phương trình bậc nhất hai ẩn là **phần mặt phẳng giao nhau** của tất cả các nửa mặt phẳng nghiệm thành phần.\n\n*Gợi mở:* Khi em kéo thử điểm $M(x, y)$ vào trong vùng đa giác màu xanh, hãy nhìn vào chỉ số: điểm đó có thỏa mãn đồng thời tất cả các bất phương trình không?`,
        intent: "explain",
        nextQuestion: "Tại sao điểm tối ưu luôn nằm ở các đỉnh của đa giác?",
      };
    }
    if (q.includes("tối ưu") || q.includes("gtln") || q.includes("gtnn") || q.includes("đường mức")) {
      return {
        answer: `Theo **Định lý cơ bản của Quy hoạch tuyến tính**, giá trị lớn nhất (GTLN) và nhỏ nhất (GTNN) của hàm mục tiêu $F(x, y) = ax + by$ trên một miền đa giác lồi luôn đạt tại **một trong các ĐỈNH** của đa giác đó.\n\nEm hãy quan sát đường mức $F(x, y) = k$: khi $k$ tăng dần, đường thẳng dịch chuyển song song và rời khỏi miền nghiệm tại đỉnh nào cuối cùng?`,
        intent: "hint",
        hintLevel,
        nextQuestion: "Làm sao tìm tọa độ chính xác của các đỉnh?",
      };
    }
  }

  if (moduleId === "spatial_geometry") {
    if (q.includes("hình bình hành") || q.includes("đỉnh d") || q.includes("tâm o") || q.includes("giả thiết")) {
      return {
        answer: `Quy tắc dựng hình chóp $S.ABCD$ đúng chuẩn GDPT 2018:\n- **Đáy hình bình hành tổng quát:** Tọa độ đỉnh $D$ xác định bởi $\\vec{AD} = \\vec{BC} \\iff D = A + C - B$. Tâm $O$ là trung điểm chung của $AC$ và $BD$.\n- **Cảnh báo lỗi nhận thức SG02:** Tuyệt đối không tự ý vẽ đáy thành hình chữ nhật hay hình vuông, và không tự thêm $SA \\perp (ABCD)$ nếu đề không cho!`,
        intent: "explain",
        nextQuestion: "Vì sao hình bình hành trong phép chiếu song song vẫn là hình bình hành?",
      };
    }
    if (q.includes("trung điểm") || q.includes("tỉ số") || q.includes("điểm n") || q.includes("2:1")) {
      return {
        answer: `Quy tắc điểm chia đoạn thẳng theo tỉ số:\n- $M$ là trung điểm $SA \\iff M = \\frac{S + A}{2}$.\n- Điểm $N$ chia cạnh $SB$ theo tỉ số $SN : NB = 2 : 1$ nghĩa là đoạn $SB$ chia làm 3 phần bằng nhau: $SN$ chiếm 2 phần, $NB$ chiếm 1 phần $\\implies \\vec{SN} = \\frac{2}{3}\\vec{SB}$. Điểm $N$ nằm **gần đỉnh B hơn đỉnh S** (Lỗi SG05).`,
        intent: "hint",
        nextQuestion: "Khi kéo đỉnh S dịch chuyển thì tọa độ điểm N có tự động cập nhật không?",
      };
    }
    if (q.includes("chéo nhau") || q.includes("cắt nhau") || q.includes("nét đứt") || q.includes("nét khuất") || q.includes("góc nhìn")) {
      return {
        answer: `Cảnh báo ảo ảnh thị giác SG16:\n- Hai đường thẳng $AB$ (thuộc đáy) và $SD$ (cạnh bên) là **hai đường thẳng chéo nhau** ($AB \\cap SD = \\emptyset$).\n- Trên hình chiếu phẳng 2D, hai đoạn thẳng có thể nhìn như cắt nhau, nhưng thực chất ở các độ sâu $z$ khác nhau. Em hãy xoay chuột 360° để kiểm chứng nhé!`,
        intent: "diagnose",
        nextQuestion: "Làm sao dùng định lý đường thẳng cắt mặt phẳng để chứng minh hai đường chéo nhau?",
      };
    }
    if (q.includes("thiết diện") || q.includes("mặt phẳng cắt") || q.includes("mpqr")) {
      return {
        answer: `Thiết diện song song với mặt phẳng đáy:\n- Mặt phẳng qua trung điểm $M$ song song với đáy $(ABCD)$ sẽ cắt các cạnh bên $SB, SC, SD$ lần lượt tại trung điểm $P, Q, R$.\n- Thiết diện $MPQR$ là hình bình hành đồng dạng với đáy theo tỉ số $k = 1/2$. Do đó diện tích thiết diện bằng $k^2 = (1/2)^2 = 1/4$ diện tích đáy $ABCD$.`,
        intent: "explain",
        nextQuestion: "Điểm N (tỉ số 2/3) có nằm trên mặt phẳng thiết diện MPQR không?",
      };
    }
    if (q.includes("trải phẳng") || q.includes("unfold") || q.includes("diện tích mặt") || q.includes("đường đi ngắn nhất")) {
      return {
        answer: `Kỹ thuật trải phẳng (Unfolding):\n- Trải các mặt bên $\\Delta SAB, \\Delta SBC, \\Delta SCD, \\Delta SDA$ quay quanh các cạnh đáy phẳng ra mặt đất $z = 0$.\n- **Bảo toàn hình học:** Đây là phép biến hình cứng, toàn bộ độ dài cạnh và số đo góc của từng tam giác được giữ nguyên 100% (không méo, không chồng lấn). Quỹ đạo ngắn nhất nối hai điểm trên khối chóp sẽ biến thành đoạn thẳng trên bản trải phẳng!`,
        intent: "hint",
        nextQuestion: "Diện tích toàn phần của khối chóp bằng tổng diện tích những mặt nào?",
      };
    }
  }

  if (moduleId === "trigonometry") {
    if (q.includes("chiều quay") || q.includes("góc âm") || q.includes("-765") || q.includes("vòng")) {
      return {
        answer: `Quy tắc góc lượng giác nhiều vòng:\n- **Chiều quay:** Ngược kim đồng hồ là chiều DƯƠNG (+), cùng kim đồng hồ là chiều ÂM (-).\n- Với góc $\\alpha = -765^\\circ$:\n  $$-765^\\circ = (-2) \\times 360^\\circ - 45^\\circ = (-3) \\times 360^\\circ + 315^\\circ$$\n- Nghĩa là quay theo chiều âm 2 vòng tròn rồi quay tiếp $-45^\\circ$. Điểm ngọn trùng với góc $315^\\circ = \\frac{7\\pi}{4}$, nằm ở **Góc phần tư IV**.`,
        intent: "explain",
        nextQuestion: "Hai góc lượng giác có cùng điểm biểu diễn thì số đo hơn kém nhau bao nhiêu?",
      };
    }
    if (q.includes("xét dấu") || q.includes("góc phần tư") || q.includes("sin") || q.includes("cos") || q.includes("tan") || q.includes("cot")) {
      return {
        answer: `Định nghĩa trên đường tròn đơn vị và thần chú xét dấu:\n- Hoành độ điểm ngọn là $\\cos \\alpha$, tung độ là $\\sin \\alpha$.\n- **Thần chú 4 góc phần tư:**\n  + Góc phần tư I: **Nhất CẢ** (tất cả đều dương).\n  + Góc phần tư II: **Nhì SIN** (chỉ sin dương).\n  + Góc phần tư III: **Tam TAN** (chỉ tan, cot dương).\n  + Góc phần tư IV: **Tứ COS** (chỉ cos dương).\n- Tại $\\alpha = -765^\\circ$ (góc phần tư IV): $\\cos > 0$ ($+\\frac{\\sqrt{2}}{2}$), $\\sin < 0$ ($-\\frac{\\sqrt{2}}{2}$), $\\tan = -1, \\cot = -1$.`,
        intent: "explain",
        nextQuestion: "Vì sao sin²α + cos²α luôn luôn bằng 1 với mọi góc α?",
      };
    }
    if (q.includes("cung liên kết") || q.includes("nhân đôi") || q.includes("công thức") || q.includes("sin(2a)")) {
      return {
        answer: `Hệ thống công thức lượng giác cốt lõi:\n- **Cung liên kết:** 'Cos đối, Sin bù, Phụ chéo, Hơn kém pi Tang'. Ví dụ: $\\sin(\\pi - \\alpha) = \\sin \\alpha$, $\\cos(-\\alpha) = \\cos \\alpha$.\n- **Công thức nhân đôi:** $\\sin(2\\alpha) = 2\\sin\\alpha\\cos\\alpha$.\n- **Cảnh báo lỗi E08:** Tuyệt đối KHÔNG phân phối $\\sin(a+b) = \\sin a + \\sin b$! Vì $\\sin$ là hàm số phi tuyến.`,
        intent: "hint",
        nextQuestion: "Nếu cos(α) = 0 thì sin(2α) bằng bao nhiêu?",
      };
    }
    if (q.includes("chu kỳ") || q.includes("đồ thị") || q.includes("sóng") || q.includes("biên độ")) {
      return {
        answer: `Mối liên hệ giữa đường tròn và đồ thị hàm số:\n- Khi điểm $M$ quay liên tục trên đường tròn đơn vị, tung độ $\\sin x$ vẽ nên đường cong sóng hình sin trên đồ thị.\n- Hàm số $y = \\sin x$ và $y = \\cos x$ có chu kỳ tuần hoàn cơ bản $T = 2\\pi$.\n- Với hàm tổng quát $y = a\\sin(bx + c) + d$: Biên độ là $|a|$, chu kỳ là $T = \\frac{2\\pi}{|b|}$, và tập giá trị là $[d - |a|; \\, d + |a|]$.`,
        intent: "explain",
        nextQuestion: "Chu kỳ của hàm số y = tan(x) bằng bao nhiêu?",
      };
    }
    if (q.includes("phương trình") || q.includes("lọc nghiệm") || q.includes("khoảng") || q.includes("nghiệm")) {
      return {
        answer: `Kỹ thuật giải phương trình $\\sin x = m$ và lọc nghiệm trên $[-\\pi; \\pi]$:\n- Điều kiện có nghiệm: $-1 \\le m \\le 1$.\n- Với $m = -\\frac{\\sqrt{2}}{2} = \\sin\\left(-\\frac{\\pi}{4}\\right)$:\n  + Họ 1: $x = -\\frac{\\pi}{4} + k2\\pi \\implies k = 0 \\implies x_1 = -\\frac{\\pi}{4}$.\n  + Họ 2: $x = \\pi - \\left(-\\frac{\\pi}{4}\\right) + k2\\pi = \\frac{5\\pi}{4} + k2\\pi \\implies k = -1 \\implies x_2 = -\\frac{3\\pi}{4}$.\n- Cả hai nghiệm $-\\frac{\\pi}{4}$ và $-\\frac{3\\pi}{4}$ đều nằm trong đoạn $[-\\pi; \\pi]$.`,
        intent: "hint",
        nextQuestion: "Đường thẳng y = -sqrt(2)/2 cắt đường tròn đơn vị tại mấy điểm?",
      };
    }
  }

  if (moduleId === "functions") {
    if (q.includes("cực trị") || q.includes("đạo hàm") || q.includes("tiếp tuyến")) {
      return {
        answer: `Mối liên hệ giữa đạo hàm $f'(x)$ và đồ thị:\n- **Ý nghĩa hình học:** $f'(x_0)$ là hệ số góc của tiếp tuyến tại điểm $M(x_0, y_0)$.\n- **Điều kiện cực trị:** $f'(x_0) = 0$ và $f'(x)$ phải **đổi dấu** khi đi qua $x_0$.\n\nEm hãy kéo thử tiếp điểm $x_0$ trên đồ thị để xem khi nào đường tiếp tuyến nằm ngang ($k = 0$) nhé!`,
        intent: "hint",
        nextQuestion: "Hàm số đồng biến khi đạo hàm mang dấu gì?",
      };
    }
  }

  if (moduleId === "calculus") {
    if (q.includes("tích phân") || q.includes("riemann") || q.includes("diện tích")) {
      return {
        answer: `Ý nghĩa trực quan của tích phân xác định $\\int_a^b f(x)dx$ là **diện tích hình phẳng** giới hạn bởi đường cong $y = f(x)$, trục $Ox$ và hai đường thẳng $x = a, x = b$.\n\nKhi ta chia đoạn $[a; b]$ thành $N$ dải chữ nhật Riemann nhỏ: khi $N$ càng lớn ($N \\to \\infty$), tổng diện tích các dải chữ nhật sẽ càng tiến sát đến giá trị tích phân chính xác!`,
        intent: "explain",
        nextQuestion: "Quay hình phẳng quanh trục Ox thì sinh ra khối gì?",
      };
    }
  }

  if (moduleId === "probability") {
    if (q.includes("xác suất") || q.includes("xúc xắc") || q.includes("bayes")) {
      return {
        answer: `Theo **Quy luật số lớn (Law of Large Numbers)**: khi số lần thực nghiệm gieo xúc xắc lặp lại đủ lớn, tần suất xuất hiện của một mặt sẽ hội tụ dần về xác suất lý thuyết là $\\frac{1}{6} \\approx 16{,}7\\%$.\n\nEm hãy bấm nút *"Gieo xúc xắc ngẫu nhiên"* nhiều lần trên bảng điều khiển để kiểm chứng quy luật này nhé!`,
        intent: "explain",
        nextQuestion: "Khi nào thì áp dụng công thức xác suất toàn phần?",
      };
    }
  }

  if (moduleId === "conics_and_solids") {
    if (q.includes("elip") || q.includes("parabol") || q.includes("hypebol") || q.includes("cắt nón")) {
      return {
        answer: `Ba đường Conic là giao tuyến của mặt phẳng cắt với mặt nón tròn xoay hai tầng:\n- Nếu góc nghiêng $\\beta > \\alpha$ (góc đường sinh): Giao tuyến là một **đường Elip** khép kín.\n- Nếu $\\beta = \\alpha$: Giao tuyến là một **đường Parabol** mở vô tận.\n- Nếu $\\beta < \\alpha$: Mặt phẳng cắt cả hai tầng nón tạo thành một **đường Hypebol** hai nhánh.`,
        intent: "explain",
        nextQuestion: "Khoảng cách từ điểm M trên Elip tới 2 tiêu điểm có tính chất gì?",
      };
    }
  }

  // 3. Xử lý các câu hỏi giao tiếp cơ bản (Chào hỏi, giới thiệu vai trò)
  if (/^(chào|hello|hi|xin chào|hey|alo|bạn là ai|giới thiệu|ai đó)/i.test(q)) {
    return {
      answer: `Chào em! Thầy là **Trợ lý gợi mở Socratic MathSTEP** — gia sư toán học tương tác đồng hành cùng em trong chương trình GDPT 2018.\n\nThầy có thể giúp em:\n1. Giải thích ý nghĩa hình học và bản chất các công thức Toán THPT (Lớp 10 - 12).\n2. Gợi ý từng bước tư duy thông qua các mô hình mô phỏng tương tác 2D & 3D.\n3. Nhận xét dự đoán và cùng em rút ra quy luật toán học.\n\nEm đang học trạm nào hoặc có chỗ nào cần thầy hỗ trợ gợi mở không?`,
      intent: "greet",
      nextQuestion: "Em muốn bắt đầu tìm hiểu trạm nào trước?",
    };
  }

  // 4. Xử lý khi học sinh cảm thấy khó, chưa biết bắt đầu
  if (/không hiểu|chưa hiểu|khó quá|không biết làm|bắt đầu từ đâu|làm sao|làm như thế nào/i.test(q)) {
    return {
      answer: `Đừng lo lắng nhé! Bất kỳ bài toán nào cũng có thể tháo gỡ từng bước theo tiến trình sau:\n\n1. **Xác định giả thiết & kết luận:** Đề bài đã cho những số liệu/hình vẽ nào, và yêu cầu chúng ta tìm đại lượng gì?\n2. **Quan sát trực quan:** Em hãy nhìn vào khung mô phỏng bên cạnh và thử di chuyển các điểm hoặc thanh trượt tham số.\n3. **Liên hệ công thức:** Yếu tố nào trên hình thay đổi khi em thao tác?\n\nEm hãy cho thầy biết bước đầu tiên: **Đề bài đang cho những dữ kiện gì** nhé!`,
      intent: "encourage",
      nextQuestion: "Dữ kiện đầu tiên của bài toán là gì?",
    };
  }

  // 5. Phản hồi chung gợi mở tư duy (Generic Socratic Scaffolding)
  const defaultResponses = [
    {
      answer: `Câu hỏi rất hay! Để trả lời được câu này, em hãy thử quan sát mô hình trực quan ở khung vẽ bên cạnh: khi em thay đổi tham số, yếu tố nào vẫn giữ nguyên và yếu tố nào biến đổi đồng thời?`,
      nextQuestion: "Thử kéo điểm điều khiển trên mô phỏng xem sao?",
    },
    {
      answer: `Trong phương pháp toán học thực nghiệm, việc đặt giả thuyết là bước quan trọng nhất. Em hãy viết suy nghĩ của mình vào ô **Dự đoán** ở Bước 2, rồi chúng ta sẽ cùng kiểm chứng bằng các phép đo trên mô hình nhé!`,
      nextQuestion: "Quy luật nào chi phối hiện tượng này?",
    },
    {
      answer: `Em hãy liên hệ với các định nghĩa và định lý cơ bản trong SGK: bài toán này có cấu trúc tương tự bài tập nào em từng gặp? Em hãy thử chia nhỏ bài toán thành 2 bước đơn giản hơn xem sao!`,
      nextQuestion: "Xem gợi ý cấp 1 về định lý liên quan",
    },
  ];

  const picked = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  return {
    answer: `${picked.answer}\n\n> 💡 *Mẹo:* Hiện em đang dùng bộ gợi mở nội bộ. Để trò chuyện với **AI Socratic thế hệ mới (Gemini/OpenAI)** phân tích sâu theo thời gian thực, em hãy mở **Cài đặt ⚙️** (góc trên bên phải) và dán API Key cá nhân miễn phí vào nhé!`,
    intent: "hint",
    hintLevel,
    nextQuestion: picked.nextQuestion,
  };
}
