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
    if (q.includes("vuông góc") || q.includes("sa vuông góc")) {
      return {
        answer: `Định lý trọng tâm: **Nếu một đường thẳng vuông góc với mặt phẳng thì nó vuông góc với mọi đường thẳng nằm trong mặt phẳng đó** ($d \\perp (P) \\Rightarrow d \\perp a, \\forall a \\subset (P)$).\n\nVì $SA \\perp (ABCD)$ nên $SA$ vuông góc với cả $AB, AD, AC, BD$. Em hãy xoay hình 3D sang **Góc nhìn Trước** hoặc **Góc nhìn Trên** để thấy rõ góc $90^\\circ$ nhé!`,
        intent: "explain",
        nextQuestion: "Làm sao chứng minh tam giác SBC vuông?",
      };
    }
    if (q.includes("thể tích") || q.includes("chiều cao")) {
      return {
        answer: `Thể tích khối chóp tính bằng: $$V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$$\nTrong đó $h$ là độ dài đoạn vuông góc kẻ từ đỉnh $S$ xuống mặt phẳng đáy. Khi em tăng chiều cao $h$ từ $3$ lên $6$, thể tích $V$ sẽ thay đổi thế nào?`,
        intent: "hint",
        nextQuestion: "Thiết diện cắt song song với đáy tạo ra hình gì?",
      };
    }
  }

  if (moduleId === "trigonometry") {
    if (q.includes("sin") || q.includes("cos") || q.includes("đường tròn")) {
      return {
        answer: `Trên đường tròn lượng giác đơn vị ($R = 1$):\n- **Hoành độ** của điểm biểu diễn $M$ chính là $\\cos \\theta$.\n- **Tung độ** của điểm $M$ chính là $\\sin \\theta$.\n\nKhi góc $\\theta$ chuyển từ góc nhọn ($0^\\circ - 90^\\circ$) sang góc tù ($90^\\circ - 180^\\circ$), hoành độ điểm $M$ nằm ở phần âm hay dương của trục $Ox$? Từ đó em suy ra dấu của $\\cos \\theta$ nhé!`,
        intent: "explain",
        nextQuestion: "Vì sao sin²θ + cos²θ luôn bằng 1?",
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
        answer: `Theo **Quy luật số lớn (Law of Large Numbers)**: khi số lần thực nghiệm gieo xúc xắc lặp lại đủ lớn, tần suất xuất hiện của một mặt sẽ hội tụ dần về xác suất lý thuyết là $\\frac{1}{6} \\approx 16.7\\%$.\n\nEm hãy bấm nút *"🎲 Gieo xúc xắc"* nhiều lần trên bảng điều khiển để kiểm chứng quy luật này nhé!`,
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

  // 3. Phản hồi chung gợi mở tư duy (Generic Socratic Scaffolding)
  const defaultResponses = [
    {
      answer: `Câu hỏi rất hay! Để trả lời được câu này, em hãy thử quan sát đồ thị trực quan ở khung vẽ bên cạnh: khi thay đổi tham số, yếu tố nào vẫn giữ nguyên và yếu tố nào thay đổi?`,
      nextQuestion: "Thử kéo điểm vàng trên mô phỏng xem sao?",
    },
    {
      answer: `Trong toán học thực nghiệm, việc đặt giả thuyết là bước quan trọng nhất. Em hãy viết suy nghĩ của mình vào ô **Dự đoán** ở Bước 2, rồi chúng ta sẽ cùng kiểm chứng bằng các phép đo trên mô hình nhé!`,
      nextQuestion: "Quy luật nào chi phối hiện tượng này?",
    },
    {
      answer: `Em hãy liên hệ với các định lý trong SGK: bài toán này liên quan trực tiếp đến định nghĩa và tính chất cơ bản. Em có muốn xem gợi ý từng bước (Cấp 1 $\\to$ Cấp 2 $\\to$ Cấp 3) không?`,
      nextQuestion: "Xem gợi ý cấp 1 về định lý liên quan",
    },
  ];

  const picked = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  return {
    answer: picked.answer,
    intent: "hint",
    hintLevel,
    nextQuestion: picked.nextQuestion,
  };
}
