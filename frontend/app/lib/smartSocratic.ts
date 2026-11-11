import { DETAILED_LESSONS_CONTENT } from "@/app/data/learningPathData";

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
        nextQuestion: "Nếu miền phương án là đa giác lồi bị chặn, vì sao có thể tìm giá trị tối ưu bằng cách xét các đỉnh?",
      };
    }
    if (q.includes("tối ưu") || q.includes("gtln") || q.includes("gtnn") || q.includes("đường mức")) {
      return {
        answer: `Với miền phương án là đa giác lồi bị chặn, giá trị lớn nhất hoặc nhỏ nhất của hàm mục tiêu tuyến tính đạt tại ít nhất một đỉnh. Ta tính hàm mục tiêu tại từng đỉnh rồi so sánh. Nếu miền không bị chặn, cần kiểm tra riêng xem giá trị cực trị có tồn tại hay không.\n\nEm hãy tìm các đỉnh thỏa mãn toàn bộ hệ rồi tính giá trị hàm mục tiêu tại từng đỉnh.`,
        intent: "hint",
        hintLevel,
        nextQuestion: "Làm sao tìm tọa độ chính xác của các đỉnh?",
      };
    }
  }

  if (moduleId === "spatial_geometry") {
    if (q.includes("hình bình hành") || q.includes("đỉnh d") || q.includes("tâm o") || q.includes("giả thiết")) {
      return {
        answer: `Với hình chóp $S.ABCD$ có đáy là hình bình hành, ta có $\\vec{AD} = \\vec{BC}$, nên $D = A + C - B$ khi dùng tọa độ. Hai đường chéo $AC$ và $BD$ cắt nhau tại trung điểm chung $O$.\n\nHình vẽ chỉ minh họa giả thiết: không mặc định đáy là hình chữ nhật hoặc hình vuông, cũng không kết luận $SA \\perp (ABCD)$ nếu đề bài chưa cho.`,
        intent: "explain",
        nextQuestion: "Vì sao hình bình hành trong phép chiếu song song vẫn là hình bình hành?",
      };
    }
    if (q.includes("trung điểm") || q.includes("tỉ số") || q.includes("điểm n") || q.includes("2:1")) {
      return {
        answer: `Quy tắc điểm chia đoạn thẳng theo tỉ số:\n- $M$ là trung điểm $SA \\iff M = \\frac{S + A}{2}$.\n- Nếu $SN : NB = 2 : 1$, đoạn $SB$ được chia thành 3 phần bằng nhau: $SN$ gồm 2 phần, $NB$ gồm 1 phần. Do đó $\\vec{SN} = \\frac{2}{3}\\vec{SB}$ và $N$ nằm gần $B$ hơn $S$.`,
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
        answer: `Khi trải các mặt của hình chóp ra một mặt phẳng, mỗi mặt giữ nguyên độ dài các cạnh và số đo các góc. Nếu hai điểm nằm trên các mặt đã trải và đường thẳng nối chúng nằm trên phần hình trải, đoạn thẳng đó biểu diễn đường đi ngắn nhất trên các mặt tương ứng.`,
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
    if (q.includes("xét dấu") || q.includes("góc phần tư") || /\b(sin|cos|tan|cot)\b/.test(q)) {
      return {
        answer: `Trên đường tròn lượng giác đơn vị, hoành độ điểm biểu diễn là $\\cos \\alpha$, tung độ là $\\sin \\alpha$.\n\nDấu các giá trị lượng giác theo góc phần tư:\n- I: sin, cos, tan và cot đều dương.\n- II: sin dương; cos, tan và cot âm.\n- III: tan và cot dương; sin và cos âm.\n- IV: cos dương; sin, tan và cot âm.\n\nVới $\\alpha=-765^\\circ$, góc cùng điểm biểu diễn là $-45^\\circ$ (hoặc $315^\\circ$), nên $\\cos \\alpha=\\frac{\\sqrt2}{2}$, $\\sin \\alpha=-\\frac{\\sqrt2}{2}$ và $\\tan \\alpha=\\cot \\alpha=-1$.`,
        intent: "explain",
        nextQuestion: "Vì sao sin²α + cos²α luôn luôn bằng 1 với mọi góc α?",
      };
    }
    if (q.includes("cung liên kết") || q.includes("nhân đôi") || q.includes("công thức") || q.includes("sin(2a)")) {
      return {
        answer: `Một số công thức cần nhớ:\n- $\\sin(\\pi-\\alpha)=\\sin\\alpha$ và $\\cos(-\\alpha)=\\cos\\alpha$.\n- $\\sin(2\\alpha)=2\\sin\\alpha\\cos\\alpha$.\n- Không được tách $\\sin(a+b)$ thành $\\sin a+\\sin b$. Công thức cộng đúng là $\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b$.`,
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
        answer: `Em hãy so sánh góc cắt $\\beta$ với góc nửa đỉnh $\\alpha$ trên mô hình. Nếu hai góc bằng nhau, mặt phẳng sẽ song song với đường sinh; theo em khi ấy giao tuyến có dạng gì?`,
        intent: "guided_socratic",
        nextQuestion: "Em đang thấy β lớn hơn, nhỏ hơn hay bằng α?",
      };
    }
  }

  // 3. Xử lý các câu hỏi giao tiếp cơ bản (Chào hỏi, giới thiệu vai trò)
  if (/^(chào|hello|hi|xin chào|hey|alo|bạn là ai|giới thiệu|ai đó)/i.test(q)) {
    return {
      answer: `Chào em! Thầy là trợ lý Toán MathSTEP. Thầy có thể giải thích công thức, gợi ý từng bước và cùng em kiểm tra cách làm. Em đang học phần nào?`,
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

  // Khi không khớp nội dung bài học, không bịa câu trả lời chung chung.
  const scopeByModule: Record<string, { title: string; examples: string }> = {
    linear_programming: {
      title: "bất phương trình bậc nhất hai ẩn và quy hoạch tuyến tính",
      examples: "miền nghiệm, hệ bất phương trình hoặc tìm giá trị lớn nhất/nhỏ nhất",
    },
    spatial_geometry: {
      title: "hình học không gian",
      examples: "hình chóp, quan hệ song song/chéo nhau, thiết diện hoặc trải hình",
    },
    trigonometry: {
      title: "lượng giác",
      examples: "đường tròn lượng giác, công thức, đồ thị hoặc phương trình lượng giác",
    },
  };
  const moduleScope = scopeByModule[moduleId];
  const activeLesson = DETAILED_LESSONS_CONTENT[stageId];
  const currentScope = moduleScope
    ? {
        ...moduleScope,
        title: activeLesson?.moduleId === moduleId
          ? `${moduleScope.title} — bài “${activeLesson.title}”`
          : moduleScope.title,
      }
    : undefined;
  if (!currentScope) {
    return {
      answer: "Câu hỏi này nằm ngoài phạm vi hỗ trợ hiện tại của MathSTEP. MathSTEP hỗ trợ ba chuyên đề: bất phương trình và quy hoạch tuyến tính, hình học không gian, lượng giác. Em muốn hỏi phần nào trong một trong ba chuyên đề đó?",
      intent: "out_of_scope",
    };
  }

  return {
    answer: `Câu hỏi này nằm ngoài phạm vi bài học hiện tại của MathSTEP. MathSTEP đang hỗ trợ em về ${currentScope.title}, chẳng hạn như ${currentScope.examples}. Em muốn hỏi phần nào trong bài này?`,
    intent: "out_of_scope",
  };
}
