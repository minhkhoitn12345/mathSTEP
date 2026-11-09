import { DetailedLessonContent } from "../types/learningPath";

export const DETAILED_LESSONS_CONTENT: Record<string, DetailedLessonContent> = {
  // =========================================================================
  // CHUYÊN ĐỀ 1: BẤT PHƯƠNG TRÌNH & QUY HOẠCH TUYẾN TÍNH (TOÁN 10)
  // =========================================================================

  "lp-lesson-1": {
    lessonId: "lp-lesson-1",
    moduleId: "linear_programming",
    order: 1,
    code: "BÀI 1",
    title: "Bất phương trình bậc nhất hai ẩn & Nửa mặt phẳng bờ (d)",
    subtitle: "Nhận diện cấu trúc đại số và bản chất vô số nghiệm lấp đầy trên Oxy",
    grade: 10,
    estimatedMinutes: 15,
    xpReward: 50,
    objectives: [
      "Nhận diện chính xác dạng tổng quát của bất phương trình bậc nhất hai ẩn $ax + by \\le c$ ($a^2 + b^2 > 0$).",
      "Hiểu rõ bản chất hình học: tập nghiệm không phải là một điểm đơn lẻ mà là cả một nửa mặt phẳng lấp đầy trên Oxy.",
      "Thực hiện thành thạo phép thử điểm $M(x_0; y_0)$ để kiểm tra tính thỏa mãn của nghiệm.",
    ],
    theory: {
      coreConcept:
        "Bất phương trình bậc nhất hai ẩn $x, y$ là biểu thức có dạng $ax + by < c$ (hoặc $\\le, >, \\ge$), trong đó $a, b, c$ là các số thực cho trước và $a, b$ không đồng thời bằng 0.",
      formulas: [
        {
          formula: "ax + by \\le c \\quad (\\text{hoặc } <, \\ge, >)",
          meaning: "Dạng tổng quát bất phương trình bậc nhất hai ẩn",
          conditions: "a^2 + b^2 > 0 \\text{ (ít nhất một trong hai hệ số } a, b \\text{ khác 0)}",
        },
      ],
      notes: [
        "Số mũ của cả $x$ và $y$ luôn luôn bằng 1, tuyệt đối không chứa số mũ bậc hai hoặc tích chéo $xy$.",
        "Mỗi nghiệm là một cặp số $(x_0; y_0)$. Tập hợp tất cả các cặp nghiệm trên mặt phẳng tọa độ Oxy tạo thành một nửa mặt phẳng có bờ là đường thẳng $d: ax + by = c$.",
      ],
      miniTip: "Mẹo nhớ: 'Phương trình là một sợi dây, Bất phương trình là cả một tấm thảm!'",
    },
    workedExample: {
      problemStatement: "Xét bất phương trình $2x - y \\le 4$. Kiểm tra xem các điểm $O(0; 0)$ và $A(3; 1)$ có thuộc miền nghiệm không?",
      steps: [
        {
          stepNumber: 1,
          title: "Xác định các hệ số đại số",
          mathExpression: "a = 2, \\, b = -1, \\, c = 4 \\implies a^2 + b^2 = 2^2 + (-1)^2 = 5 > 0",
          explanation: "Khẳng định đây là bất phương trình bậc nhất hai ẩn hợp lệ theo chuẩn SGK.",
          rationale: "Bước nhận dạng giúp loại trừ các trường hợp phương trình suy biến (khi cả $a = b = 0$).",
        },
        {
          stepNumber: 2,
          title: "Kiểm tra điểm gốc tọa độ O(0; 0)",
          mathExpression: "\\text{LHS} = 2(0) - (0) = 0 \\le 4 \\implies \\text{Mệnh đề ĐÚNG}",
          explanation: "Thay $x = 0, y = 0$ vào vế trái, ta được $0 \\le 4$. Đây là một khẳng định toán học chính xác.",
          rationale: "Điểm $O(0; 0)$ là điểm thử nghiệm thuận tiện nhất vì tính toán đại số đơn giản nhất.",
        },
        {
          stepNumber: 3,
          title: "Kiểm tra điểm A(3; 1)",
          mathExpression: "\\text{LHS} = 2(3) - (1) = 6 - 1 = 5 > 4 \\implies \\text{Mệnh đề SAI}",
          explanation: "Thay $x = 3, y = 1$ vào vế trái, giá trị 5 lớn hơn 4, vi phạm điều kiện $\\le 4$.",
          rationale: "Giúp học sinh thấy rõ ranh giới: một điểm nằm ngoài miền nghiệm sẽ cho kết quả mệnh đề sai.",
        },
      ],
      conclusion: "Điểm $O(0; 0)$ thuộc miền nghiệm của bất phương trình, còn điểm $A(3; 1)$ không thuộc miền nghiệm.",
    },
    checkpoints: [
      {
        id: "cp-lp1-1",
        question: "Biểu thức nào sau đây KHÔNG PHẢI là bất phương trình bậc nhất hai ẩn?",
        options: [
          { id: "A", text: "3x - 5y > 10", isCorrect: false },
          { id: "B", text: "2x + y^2 <= 4", isCorrect: true },
          { id: "C", text: "x - 4y >= 0", isCorrect: false },
          { id: "D", text: "-x + 2y < -3", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Biểu thức $2x + y^2 \\le 4$ chứa ẩn $y$ với số mũ bằng 2 (bậc hai), nên không phải bậc nhất hai ẩn.",
        explanationIncorrect: "Hãy nhìn kỹ số mũ của từng ẩn $x$ và $y$. BPT bậc nhất hai ẩn bắt buộc số mũ của cả hai ẩn phải bằng 1.",
        socraticHint: "Ẩn nào trong biểu thức có số mũ khác 1?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-lp1-1",
        question: "Cặp số nào sau đây là một nghiệm của bất phương trình $x + 2y \\le 3$?",
        options: [
          { id: "A", text: "(2; 1)", isCorrect: false },
          { id: "B", text: "(1; 1)", isCorrect: true },
          { id: "C", text: "(3; 2)", isCorrect: false },
          { id: "D", text: "(0; 2)", isCorrect: false },
        ],
        explanationCorrect: "Rất tốt! Thay $x = 1, y = 1$ vào vế trái: $1 + 2(1) = 3 \\le 3$ (Đúng, điểm nằm ngay trên bờ).",
        explanationIncorrect: "Thay tọa độ từng cặp $(x; y)$ vào vế trái $x + 2y$. Với $(2; 1)$, vế trái bằng $2 + 2(1) = 4 > 3$ (Sai).",
        errorTag: "M01",
      },
      {
        id: "rq-lp1-2",
        question: "Trên mặt phẳng tọa độ Oxy, tập hợp các điểm thỏa mãn $ax + by \\ge c$ ($a^2+b^2>0$) biểu diễn hình học là gì?",
        options: [
          { id: "A", text: "Một đường thẳng duy nhất", isCorrect: false },
          { id: "B", text: "Một đoạn thẳng hữu hạn", isCorrect: false },
          { id: "C", text: "Một nửa mặt phẳng có bờ là đường thẳng ax + by = c (kể cả bờ)", isCorrect: true },
          { id: "D", text: "Một hình tròn tâm O", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Dấu $\\ge$ có chứa dấu bằng nên miền nghiệm là nửa mặt phẳng bao gồm cả đường ranh giới bờ.",
        explanationIncorrect: "Phương trình $ax + by = c$ mới là đường thẳng; còn bất phương trình mở rộng ra toàn bộ nửa mặt phẳng lấp đầy một phía của đường thẳng đó.",
        errorTag: "M04",
      },
    ],
    simulationRef: {
      moduleId: "linear_programming",
      simulationType: "single_inequality",
      lessonIndex: 0,
      labName: "Mô phỏng 2D Oxy BPT Bậc Nhất",
      actionPrompt: "Mở mô phỏng để kéo thả điểm thử M và quan sát nửa mặt phẳng nghiệm đổi màu theo thời gian thực.",
    },
  },

  "lp-lesson-2": {
    lessonId: "lp-lesson-2",
    moduleId: "linear_programming",
    order: 2,
    code: "BÀI 2",
    title: "Quy trình 7 bước biểu diễn miền nghiệm chuẩn SGK",
    subtitle: "Thao tác vẽ đường bờ nét liền/đứt và gạch bỏ phần không thỏa mãn",
    grade: 10,
    estimatedMinutes: 18,
    xpReward: 60,
    objectives: [
      "Làm chủ 7 bước tuần tự biểu diễn miền nghiệm theo đúng quy ước sách giáo khoa mới GDPT 2018.",
      "Phân biệt chính xác quy ước vẽ đường bờ: Nét liền (khi có dấu $\\le, \\ge$) và Nét đứt (khi dấu ngặt $<, >$).",
      "Khắc phục triệt để bẫy sai lầm M08 khi đường bờ đi qua gốc tọa độ $O(0; 0)$.",
    ],
    theory: {
      coreConcept:
        "Quy trình 7 bước SGK gồm: (1) Nhận dạng hệ số $\\to$ (2) Xác định nét vẽ bờ liền/đứt $\\to$ (3) Tìm 2 điểm trên bờ $\\to$ (4) Vẽ đường bờ kéo dài $\\to$ (5) Chọn điểm thử nghiệm $\\to$ (6) Kiểm tra đúng/sai $\\to$ (7) Kết luận miền nghiệm (giữ trắng miền nghiệm, gạch bỏ miền sai).",
      formulas: [
        {
          formula: "d: ax + by = c",
          meaning: "Phương trình đường thẳng bờ chia đôi mặt phẳng Oxy",
          conditions: "Nét liền nếu dấu <= hoặc >=; Nét đứt nếu dấu < hoặc >",
        },
      ],
      notes: [
        "Nếu $c \\ne 0$, luôn ưu tiên chọn $O(0; 0)$ làm điểm thử nghiệm để tối ưu hóa thời gian tính toán.",
        "Nếu $c = 0$, đường thẳng đi qua chính gốc tọa độ $O$, BẮT BUỘC phải chọn điểm phụ nằm ngoài đường bờ như $M(1; 0)$ hoặc $M(0; 1)$ (Tránh bẫy M08).",
      ],
      miniTip: "Mẹo nhớ: 'Có bằng thì NÉT LIỀN, Không bằng thì NÉT ĐỨT; Thử O ra Đúng thì LẤY, ra Sai thì GẠCH!'",
    },
    workedExample: {
      problemStatement: "Biểu diễn miền nghiệm của bất phương trình $3x + 2y > 6$ trên mặt phẳng tọa độ Oxy.",
      steps: [
        {
          stepNumber: 1,
          title: "Xác định phương trình đường thẳng bờ và nét vẽ",
          mathExpression: "d: 3x + 2y = 6 \\quad (\\text{Vẽ bằng NÉT ĐỨT vì dấu } >)",
          explanation: "Bất phương trình dùng dấu ngặt '$>$' nên các điểm nằm trên bờ không thuộc nghiệm.",
          rationale: "Tránh lỗi vẽ nét liền làm mất điểm quy ước hình học.",
        },
        {
          stepNumber: 2,
          title: "Tìm 2 điểm phân biệt để vẽ bờ",
          mathExpression: "x = 0 \\implies y = 3 \\implies A(0; 3); \\quad y = 0 \\implies x = 2 \\implies B(2; 0)",
          explanation: "Chọn 2 giao điểm của đường thẳng với hai trục tọa độ để vẽ chuẩn xác nhất.",
          rationale: "Tìm giao điểm với trục giúp dựng hình nhanh và chuẩn xác tuyệt đối.",
        },
        {
          stepNumber: 3,
          title: "Thử điểm gốc tọa độ O(0; 0)",
          mathExpression: "3(0) + 2(0) = 0 > 6 \\implies \\text{Mệnh đề SAI}",
          explanation: "Vì $c = 6 \\ne 0$, ta chọn $O(0; 0)$. Thay vào vế trái ra 0, mà 0 không lớn hơn 6 nên sai.",
          rationale: "Mệnh đề sai chứng tỏ nửa mặt phẳng chứa gốc tọa độ không phải miền nghiệm.",
        },
        {
          stepNumber: 4,
          title: "Kết luận miền nghiệm",
          mathExpression: "\\text{Miền nghiệm là nửa mặt phẳng bờ } d \\text{ không chứa } O(0; 0), \\text{ không kể bờ } d.",
          explanation: "Gạch bỏ nửa mặt phẳng chứa điểm $O$, phần mặt phẳng còn lại (giữ trắng) là miền nghiệm.",
          rationale: "Tuân thủ nghiêm ngặt quy ước SGK Việt Nam: Giữ trắng miền nghiệm, gạch chéo phần loại bỏ.",
        },
      ],
      conclusion: "Miền nghiệm đã được biểu diễn hoàn chỉnh: Nét đứt, không chứa gốc tọa độ O.",
    },
    checkpoints: [
      {
        id: "cp-lp2-1",
        question: "Khi biểu diễn bất phương trình $2x - y \\ge 0$, tại sao KHÔNG ĐƯỢC chọn điểm O(0; 0) làm điểm thử?",
        options: [
          { id: "A", text: "Vì điểm O có tọa độ bằng 0 nên không tính được", isCorrect: false },
          { id: "B", text: "Vì đường thẳng bờ 2x - y = 0 đi qua chính gốc O, không phân biệt được 2 nửa mặt phẳng", isCorrect: true },
          { id: "C", text: "Vì bất phương trình có dấu >= nên không được thử", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Điểm thử phải nằm hẳn về một bên của đường thẳng bờ. Khi đường bờ đi qua O, điểm O nằm ngay trên ranh giới nên vô dụng trong việc phân chia hai nửa mặt phẳng (Bẫy M08).",
        explanationIncorrect: "Hãy thay tọa độ (0; 0) vào phương trình đường bờ: $2(0) - 0 = 0$, nghĩa là điểm O nằm trên đường thẳng!",
        socraticHint: "Điểm thử nghiệm có được phép nằm ngay trên đường ranh giới bờ không?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-lp2-1",
        question: "Biểu diễn miền nghiệm của $x - 3y < 0$. Điểm nào sau đây là điểm thử nghiệm hợp lệ?",
        options: [
          { id: "A", text: "O(0; 0)", isCorrect: false },
          { id: "B", text: "M(1; 0)", isCorrect: true },
          { id: "C", text: "N(3; 1)", isCorrect: false },
          { id: "D", text: "P(0; 0)", isCorrect: false },
        ],
        explanationCorrect: "Tuyệt vời! Điểm $M(1; 0)$ không thuộc đường thẳng $x - 3y = 0$ (vì $1 - 3(0) = 1 \\ne 0$) nên dùng làm điểm thử hoàn hảo.",
        explanationIncorrect: "Đường thẳng bờ $x - 3y = 0$ đi qua cả $O(0;0)$ và $N(3;1)$ ($3 - 3(1) = 0$). Phải chọn điểm không nằm trên bờ!",
        errorTag: "M08",
      },
      {
        id: "rq-lp2-2",
        question: "Trong quy ước SGK Toán 10 Việt Nam, phần mặt phẳng nào được gạch bỏ?",
        options: [
          { id: "A", text: "Phần mặt phẳng chứa các điểm không phải là nghiệm", isCorrect: true },
          { id: "B", text: "Phần mặt phẳng chứa các điểm là nghiệm", isCorrect: false },
          { id: "C", text: "Toàn bộ cả hai nửa mặt phẳng", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Quy ước SGK Việt Nam là 'Gạch bỏ miền không thỏa mãn, giữ trắng miền nghiệm'.",
        explanationIncorrect: "SGK Việt Nam quy ước giữ phần trắng sạch sẽ cho miền nghiệm, gạch sọc chéo phần bị loại.",
        errorTag: "M07",
      },
    ],
    simulationRef: {
      moduleId: "linear_programming",
      simulationType: "single_inequality",
      lessonIndex: 1,
      labName: "Wizard 7 Bước Biểu Diễn Miền Nghiệm",
      actionPrompt: "Mở mô phỏng để tự tay thực hiện lần lượt từng bước từ xác định nét vẽ đến gạch bỏ miền sai.",
    },
  },

  "lp-lesson-3": {
    lessonId: "lp-lesson-3",
    moduleId: "linear_programming",
    order: 3,
    code: "BÀI 3",
    title: "Hệ bất phương trình bậc nhất hai ẩn & Miền đa giác lồi",
    subtitle: "Giao các nửa mặt phẳng nghiệm và xác định tọa độ các đỉnh",
    grade: 10,
    estimatedMinutes: 20,
    xpReward: 70,
    objectives: [
      "Xác định miền nghiệm của một hệ bất phương trình gồm từ 2 đến 5 ràng buộc tuyến tính.",
      "Thực hiện phép giao hình học của các nửa mặt phẳng để hình thành miền đa giác lồi đóng.",
      "Tìm tọa độ các đỉnh của miền đa giác bằng cách giải các hệ phương trình bậc nhất hai ẩn tương ứng.",
    ],
    theory: {
      coreConcept:
        "Miền nghiệm của một hệ bất phương trình bậc nhất hai ẩn là giao của các miền nghiệm của từng bất phương trình trong hệ. Miền này thường có dạng một miền đa giác (tam giác, tứ giác, ngũ giác) bị chặn hoặc không bị chặn.",
      formulas: [
        {
          formula: "\\begin{cases} a_1 x + b_1 y \\le c_1 \\\\ a_2 x + b_2 y \\le c_2 \\\\ x \\ge 0, \\, y \\ge 0 \\end{cases}",
          meaning: "Hệ bất phương trình bậc nhất hai ẩn có ràng buộc không âm",
          conditions: "Tập nghiệm S = S_1 \\cap S_2 \\cap S_3 \\cap S_4",
        },
      ],
      notes: [
        "Mỗi điểm thuộc miền nghiệm của hệ bắt buộc phải thỏa mãn ĐỒNG THỜI tất cả các bất phương trình trong hệ.",
        "Tọa độ các đỉnh của miền đa giác là nghiệm của hệ hai phương trình đường thẳng bờ giao nhau. KHÔNG ĐƯỢC ước lượng bằng mắt!",
      ],
      miniTip: "Mẹo nhớ: 'Nghiệm của hệ là phần chung không bị gạch sau khi gạch bỏ miền sai của từng bất phương trình!'",
    },
    workedExample: {
      problemStatement: "Tìm miền nghiệm và tọa độ các đỉnh của hệ bất phương trình: $\\begin{cases} x + y \\le 4 \\\\ x \\ge 0 \\\\ y \\ge 0 \\end{cases}$",
      steps: [
        {
          stepNumber: 1,
          title: "Biểu diễn ràng buộc x >= 0 và y >= 0",
          mathExpression: "x \\ge 0 \\implies \\text{Gạch bên trái Oy}; \\quad y \\ge 0 \\implies \\text{Gạch phía dưới Ox}",
          explanation: "Ràng buộc này giới hạn miền nghiệm nằm trọn vẹn trong góc phần tư thứ nhất.",
          rationale: "Đây là các ràng buộc tự nhiên trong hầu hết bài toán thực tiễn.",
        },
        {
          stepNumber: 2,
          title: "Vẽ bờ d: x + y = 4 và xác định miền nghiệm",
          mathExpression: "d: x + y = 4 \\text{ đi qua } A(4; 0) \\text{ và } B(0; 4)",
          explanation: "Thử $O(0; 0)$: $0 + 0 = 0 \\le 4$ (Đúng). Do đó giữ lại nửa mặt phẳng chứa gốc O.",
          rationale: "Đường thẳng bờ cắt hai trục tạo thành tam giác vuông.",
        },
        {
          stepNumber: 3,
          title: "Xác định các đỉnh của miền nghiệm",
          mathExpression: "O(0; 0), \\quad A(4; 0), \\quad B(0; 4)",
          explanation: "Miền nghiệm là miền tam giác $OAB$ (kể cả biên của tam giác).",
          rationale: "Tìm tọa độ chính xác các đỉnh là tiền đề để giải bài toán tối ưu ở bài học tiếp theo.",
        },
      ],
      conclusion: "Miền nghiệm của hệ là tam giác OAB với ba đỉnh O(0; 0), A(4; 0), B(0; 4).",
    },
    checkpoints: [
      {
        id: "cp-lp3-1",
        question: "Nếu một điểm M thỏa mãn 2 trên 3 bất phương trình trong hệ thì điểm M có thuộc miền nghiệm của hệ không?",
        options: [
          { id: "A", text: "Có, vì thỏa mãn đa số", isCorrect: false },
          { id: "B", text: "Không, vì phải thỏa mãn đồng thời tất cả các bất phương trình trong hệ", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Miền nghiệm của hệ là phép giao tập hợp, đòi hỏi điểm phải thỏa mãn 100% tất cả các ràng buộc.",
        explanationIncorrect: "Hệ bất phương trình có dấu ngoặc nhọn đồng nghĩa với liên từ 'VÀ'. Thiếu một điều kiện là bị loại ngay.",
        socraticHint: "Dấu ngoặc nhọn trong hệ phương trình có nghĩa là gì?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-lp3-1",
        question: "Miền nghiệm của hệ $\\begin{cases} 2x - y \\le 2 \\\\ x + y \\le 4 \\\\ x \\ge 0, \\, y \\ge 0 \\end{cases}$ là một đa giác có bao nhiêu đỉnh?",
        options: [
          { id: "A", text: "3 đỉnh (Tam giác)", isCorrect: false },
          { id: "B", text: "4 đỉnh (Tứ giác)", isCorrect: true },
          { id: "C", text: "5 đỉnh (Ngũ giác)", isCorrect: false },
        ],
        explanationCorrect: "Xuất sắc! Các đỉnh gồm: $O(0; 0)$, $(1; 0)$, giao điểm $C(2; 2)$, và $(0; 4)$, tạo thành một tứ giác lồi.",
        explanationIncorrect: "Vẽ phác thảo: Đường $2x - y = 2$ cắt trục hoành tại $(1; 0)$, cắt $x + y = 4$ tại $(2; 2)$, tạo thành tứ giác 4 đỉnh.",
        errorTag: "M09",
      },
    ],
    simulationRef: {
      moduleId: "linear_programming",
      simulationType: "system_inequality",
      lessonIndex: 2,
      labName: "Phòng Thí Nghiệm Hệ BPT & Đa Giác Lồi",
      actionPrompt: "Mở mô phỏng để tự động tìm giao điểm các đỉnh và quan sát đa giác nghiệm lấp lánh.",
    },
  },

  "lp-lesson-4": {
    lessonId: "lp-lesson-4",
    moduleId: "linear_programming",
    order: 4,
    code: "BÀI 4",
    title: "Mô hình hóa thực tiễn: Bài toán Xưởng mộc tối ưu",
    subtitle: "Bài toán thực tiễn chuẩn SGK Kết nối tri thức (Trang 26-30)",
    grade: 10,
    estimatedMinutes: 22,
    xpReward: 80,
    objectives: [
      "Biết cách chuyển đổi ngôn ngữ thực tế (giờ công, vật liệu, tiền lãi) sang hệ bất phương trình toán học chuẩn mực.",
      "Thiết lập hàm mục tiêu $F(x, y) = ax + by$ biểu thị lợi nhuận cần tối đa hóa.",
      "Vận dụng định lý quy hoạch tuyến tính: Giá trị lớn nhất/nhỏ nhất luôn đạt tại một trong các đỉnh của miền đa giác lồi.",
    ],
    theory: {
      coreConcept:
        "Quy hoạch tuyến tính là phương pháp toán học tìm phương án tối ưu (lợi nhuận cao nhất hoặc chi phí thấp nhất) thỏa mãn các điều kiện ràng buộc tài nguyên. Với miền nghiệm là đa giác lồi $A_1A_2...A_n$, giá trị lớn nhất của $F(x, y)$ luôn đạt tại một trong các đỉnh $A_i$.",
      formulas: [
        {
          formula: "F(x, y) = ax + by \\implies \\max F(x, y) = \\max \\{F(A_1), F(A_2), \\dots, F(A_n)\\}",
          meaning: "Định lý giá trị cực trị trên miền đa giác lồi",
          conditions: "Miền nghiệm là đa giác lồi đóng bị chặn",
        },
      ],
      notes: [
        "Bước 1: Gọi ẩn $x, y$ kèm đơn vị và điều kiện thực tế ($x, y \\ge 0$, đôi khi $x, y \\in \\mathbb{N}$).",
        "Bước 2: Lập bảng phân tích số liệu để tránh sót ràng buộc.",
        "Bước 3: Vẽ miền đa giác nghiệm, tìm tọa độ chính xác các đỉnh.",
        "Bước 4: Lập bảng tính giá trị $F(x, y)$ tại từng đỉnh và kết luận bằng ngôn ngữ thực tế.",
      ],
      miniTip: "Mẹo nhớ: 'Tìm cực trị trên miền đa giác, chỉ cần thử tọa độ TẤT CẢ CÁC ĐỈNH!'",
    },
    workedExample: {
      problemStatement: "Một xưởng sản xuất 2 loại sản phẩm A và B. Để làm 1 sản phẩm A cần 2 giờ máy, lãi 40 nghìn. Làm 1 sản phẩm B cần 1 giờ máy, lãi 30 nghìn. Mỗi ngày máy hoạt động không quá 8 giờ và không thể làm quá 3 sản phẩm A. Tìm phương án tối đa hóa tiền lãi.",
      steps: [
        {
          stepNumber: 1,
          title: "Gọi ẩn và lập hệ ràng buộc",
          mathExpression: "\\begin{cases} 2x + y \\le 8 \\\\ 0 \\le x \\le 3 \\\\ y \\ge 0 \\end{cases}",
          explanation: "Gọi $x$ là số sản phẩm A, $y$ là số sản phẩm B. Hàm tiền lãi $F(x, y) = 40x + 30y$ (nghìn đồng).",
          rationale: "Mô hình hóa ngôn ngữ tự nhiên thành biểu thức đại số.",
        },
        {
          stepNumber: 2,
          title: "Xác định các đỉnh của miền nghiệm",
          mathExpression: "O(0; 0), \\quad A(3; 0), \\quad B(3; 2), \\quad C(0; 8)",
          explanation: "Giao điểm của $x = 3$ và $2x + y = 8$ cho đỉnh $B(3; 2)$.",
          rationale: "Các đỉnh là các điểm nút quyết định phương án tối ưu.",
        },
        {
          stepNumber: 3,
          title: "Tính giá trị hàm mục tiêu F tại 4 đỉnh",
          mathExpression: "F(O) = 0; \\quad F(A) = 120; \\quad F(B) = 40(3) + 30(2) = 180; \\quad F(C) = 240",
          explanation: "So sánh các giá trị: $F(C) = 240$ nghìn đồng là lớn nhất tại phương án $x = 0, y = 8$.",
          rationale: "Định lý đảm bảo không cần kiểm tra vô số điểm bên trong đa giác.",
        },
      ],
      conclusion: "Xưởng nên sản xuất 0 sản phẩm A và 8 sản phẩm B để đạt tiền lãi tối đa là 240 nghìn đồng.",
    },
    checkpoints: [
      {
        id: "cp-lp4-1",
        question: "Vì sao ta chỉ cần tính giá trị hàm mục tiêu F(x, y) tại các đỉnh của miền đa giác mà không cần tính ở các điểm nằm giữa?",
        options: [
          { id: "A", text: "Vì các điểm ở giữa luôn cho giá trị bằng 0", isCorrect: false },
          { id: "B", text: "Vì theo định lý toán học, hàm tuyến tính F(x, y) trên tập lồi luôn đạt giá trị cực trị tại các điểm biên cực biên (đỉnh)", isCorrect: true },
        ],
        explanationCorrect: "Hoàn toàn chính xác! Đường mức của hàm $F(x,y)$ là các đường thẳng song song, khi tịnh tiến sẽ quét qua miền đa giác và luôn rời khỏi miền tại một đỉnh cuối cùng.",
        explanationIncorrect: "Đây là định lý nền tảng của quy hoạch tuyến tính được phát minh bởi các nhà toán học giải thưởng Nobel.",
        socraticHint: "Đường mức di chuyển tiếp xúc với đa giác ở đâu đầu tiên và sau cùng?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-lp4-1",
        question: "Trong bài toán Xưởng mộc SGK Kết nối tri thức, hàm lợi nhuận đạt giá trị lớn nhất tại đỉnh nào?",
        options: [
          { id: "A", text: "Gốc tọa độ O(0; 0)", isCorrect: false },
          { id: "B", text: "Đỉnh B(8; 12) với lợi nhuận 10.200 nghìn đồng", isCorrect: true },
          { id: "C", text: "Đỉnh A(16; 0)", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Đỉnh $B(8; 12)$ tương ứng với sản xuất 8 bàn và 12 ghế, đem lại lợi nhuận cao nhất.",
        explanationIncorrect: "Kiểm tra số liệu SGK: Tại $B(8; 12)$, $F = 600(8) + 450(12) = 10.200$ nghìn đồng.",
        errorTag: "M14",
      },
    ],
    simulationRef: {
      moduleId: "linear_programming",
      simulationType: "optimization",
      lessonIndex: 3,
      labName: "Phòng Thí Nghiệm Tối Ưu Xưởng Mộc",
      actionPrompt: "Mở mô phỏng để quét đường mức F(x,y) trượt qua miền nghiệm và xem bảng so sánh giá trị tự động.",
    },
  },

  "lp-lesson-5": {
    lessonId: "lp-lesson-5",
    moduleId: "linear_programming",
    order: 5,
    code: "BÀI 5",
    title: "Luyện tập & Chẩn đoán lỗi nhận thức",
    subtitle: "Hệ thống bài tập chẩn đoán tự động và phản tư sai lầm M01-M17",
    grade: 10,
    estimatedMinutes: 20,
    xpReward: 90,
    objectives: [
      "Hệ thống hóa toàn bộ kiến thức chuyên đề Bất phương trình và Quy hoạch tuyến tính.",
      "Tự phát hiện và sửa chữa các lỗi sai kinh điển từ M01 đến M17 (lỗi đổi dấu, lỗi bờ qua O, lỗi đọc đề thiếu điều kiện tự nhiên).",
      "Rèn luyện tư duy phản biện và khả năng giải trình toán học mạch lạc.",
    ],
    theory: {
      coreConcept:
        "Chẩn đoán lỗi nhận thức (Misconception Diagnosis) giúp học sinh hiểu sâu bản chất toán học thông qua việc phân tích 'Tại sao cách làm này lại sai?'. Các lỗi phổ biến nhất gồm: Quên đổi chiều BPT khi nhân/chia số âm, vẽ nhầm nét liền thành nét đứt, và nhầm lẫn giữa điểm thuộc miền nghiệm với điểm nằm ngoài.",
      formulas: [
        {
          formula: "-2x \\le 4 \\iff x \\ge -2",
          meaning: "Quy tắc đảo chiều bất đẳng thức khi nhân/chia cho số âm",
          conditions: "Bắt buộc đổi chiều: <= thành >=, < thành >",
        },
      ],
      notes: [
        "Lỗi M05: Quên đảo chiều khi chia cho hệ số âm của biến.",
        "Lỗi M08: Chọn gốc O(0; 0) làm điểm thử khi đường thẳng có c = 0.",
        "Lỗi M12: Bài toán thực tế quên điều kiện số nguyên không âm $x, y \\in \\mathbb{N}$.",
      ],
      miniTip: "Mẹo nhớ: 'Chia cho số âm phải lật ngược dấu; Đường bờ qua O phải chọn điểm phụ!'",
    },
    workedExample: {
      problemStatement: "Tìm lỗi sai trong lời giải sau: 'Giải BPT $-3x + 6 \\le 0 \\iff -3x \\le -6 \\iff x \\le 2$'.",
      steps: [
        {
          stepNumber: 1,
          title: "Quan sát bước chuyển vế",
          mathExpression: "-3x + 6 \\le 0 \\iff -3x \\le -6",
          explanation: "Bước chuyển vế đổi dấu $+6$ thành $-6$ là hoàn toàn chính xác.",
          rationale: "Xác nhận phần đúng trước khi truy tìm chỗ sai.",
        },
        {
          stepNumber: 2,
          title: "Chẩn đoán bước chia cho -3",
          mathExpression: "-3x \\le -6 \\iff x \\ge \\frac{-6}{-3} \\iff x \\ge 2",
          explanation: "Người giải đã chia cả hai vế cho $-3$ (số âm) nhưng GIỮ NGUYÊN chiều $\\le$, dẫn đến kết quả sai $x \\le 2$.",
          rationale: "Đây chính là lỗi nhận thức cơ bản M05.",
        },
      ],
      conclusion: "Lời giải đúng phải là $x \\ge 2$ (đảo chiều bất đẳng thức khi chia cho số âm -3).",
    },
    checkpoints: [
      {
        id: "cp-lp5-1",
        question: "Khi nhân cả hai vế của bất đẳng thức $-x < 5$ với $-1$, kết quả đúng là gì?",
        options: [
          { id: "A", text: "x < -5", isCorrect: false },
          { id: "B", text: "x > -5", isCorrect: true },
          { id: "C", text: "x <= -5", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Nhân với số âm $-1$ bắt buộc phải đổi chiều từ '$<$' sang '$>$'.",
        explanationIncorrect: "Nhân hoặc chia cho số âm bắt buộc phải đảo chiều bất đẳng thức.",
        socraticHint: "Số âm làm đảo chiều trục số như thế nào?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-lp5-1",
        question: "Một bạn giải bài toán số người đi xe buýt và ra nghiệm $x = 3{,}5$. Lỗi nhận thức ở đây là gì?",
        options: [
          { id: "A", text: "Tính sai số học", isCorrect: false },
          { id: "B", text: "Lỗi M12: Quên điều kiện thực tế đối tượng 'người' phải là số nguyên dương", isCorrect: true },
          { id: "C", text: "Phương trình vô nghiệm", isCorrect: false },
        ],
        explanationCorrect: "Tuyệt vời! Đối tượng người, xe, sản phẩm nguyên chiếc bắt buộc phải có điều kiện $x \\in \\mathbb{N}^*$.",
        explanationIncorrect: "Trong toán thực tế, nghiệm phải có ý nghĩa vật lý thực tiễn.",
        errorTag: "M12",
      },
    ],
    simulationRef: {
      moduleId: "linear_programming",
      simulationType: "practice",
      lessonIndex: 4,
      labName: "Ngân Hàng Bài Tập Chẩn Đoán Lỗi M01-M17",
      actionPrompt: "Mở phòng thực hành để thử sức với các tình huống gài bẫy và nhận phản hồi gợi mở từ Socratic AI.",
    },
  },

  // =========================================================================
  // CHUYÊN ĐỀ 2: HÌNH HỌC KHÔNG GIAN 3D (TOÁN 11)
  // =========================================================================

  "sg-lesson-1": {
    lessonId: "sg-lesson-1",
    moduleId: "spatial_geometry",
    order: 1,
    code: "BÀI 1",
    title: "Đọc đề & Dựng hình chóp S.ABCD đúng giả thiết",
    subtitle: "Nhiệm vụ chuẩn SG-M2-01: Bảo toàn quan hệ hình bình hành không suy biến",
    grade: 11,
    estimatedMinutes: 18,
    xpReward: 60,
    objectives: [
      "Đọc đề bài chính xác và chuyển đổi giả thiết hình học thành các quan hệ đồng phẳng và không gian đúng đắn.",
      "Dựng hình chóp $S.ABCD$ với đáy là hình bình hành tổng quát, tránh lỗi tự ý vẽ thành hình chữ nhật hay hình vuông (Lỗi SG02).",
      "Xác định tâm đối xứng $O$ của đáy hình bình hành là giao điểm của hai đường chéo $AC$ và $BD$.",
    ],
    theory: {
      coreConcept:
        "Hình chóp $S.ABCD$ có đáy là hình bình hành yêu cầu 4 điểm $A, B, C, D$ cùng nằm trên một mặt phẳng, thỏa mãn $\\vec{AB} = \\vec{DC}$ và $S$ không thuộc mặt phẳng $(ABCD)$. Trong hình biểu diễn, hình bình hành được vẽ là hình bình hành, quan hệ song song và tỉ số đoạn thẳng trên đường thẳng song song được bảo toàn.",
      formulas: [
        {
          formula: "\\vec{AD} = \\vec{BC} \\iff D = A + C - B",
          meaning: "Ràng buộc đỉnh D để tứ giác ABCD là hình bình hành đồng phẳng",
          conditions: "Ba điểm A, B, C không thẳng hàng",
        },
        {
          formula: "O = \\frac{A + C}{2} = \\frac{B + D}{2}",
          meaning: "Tọa độ tâm đối xứng O là trung điểm chung của hai đường chéo",
        },
      ],
      notes: [
        "Không được tự thêm giả thiết: Đề cho đáy hình bình hành thì không được vẽ góc vuông đặc biệt (Lỗi SG02).",
        "Đỉnh $S$ không được vẽ nằm trên đường vuông góc đặc biệt từ tâm nếu đề không cho $S.ABCD$ là chóp đều.",
      ],
      miniTip: "Mẹo nhớ: 'Vẽ hình tổng quát trước, đặc biệt hóa sau; Song song phải giữ song song!'",
    },
    workedExample: {
      problemStatement: "Cho 3 điểm đáy $A(-2; -1{,}5; 0)$, $B(2; -1{,}5; 0)$, $C(3; 1{,}5; 0)$. Tìm tọa độ đỉnh D để ABCD là hình bình hành và tìm tâm O.",
      steps: [
        {
          stepNumber: 1,
          title: "Dùng quan hệ vectơ tìm đỉnh D",
          mathExpression: "\\vec{AB} = (4; 0; 0) \\implies \\vec{DC} = (4; 0; 0) \\implies D = C - \\vec{AB} = (-1; 1{,}5; 0)",
          explanation: "Tứ giác $ABCD$ là hình bình hành khi và chỉ khi $\\vec{AB} = \\vec{DC}$.",
          rationale: "Bảo toàn tính chất các cạnh đối song song và bằng nhau trong không gian.",
        },
        {
          stepNumber: 2,
          title: "Xác định tọa độ tâm O",
          mathExpression: "O = \\frac{A + C}{2} = \\left( \\frac{-2 + 3}{2}; \\, \\frac{-1{,}5 + 1{,}5}{2}; \\, 0 \\right) = (0{,}5; 0; 0)",
          explanation: "Hai đường chéo hình bình hành cắt nhau tại trung điểm của mỗi đường.",
          rationale: "Tâm $O$ là điểm mấu chốt để dựng các mặt phẳng phụ trợ và quan hệ song song sau này.",
        },
      ],
      conclusion: "Tọa độ đỉnh $D(-1; 1{,}5; 0)$ và tâm $O(0{,}5; 0; 0)$ hoàn toàn thỏa mãn giả thiết hình học không suy biến.",
    },
    checkpoints: [
      {
        id: "cp-sg1-1",
        question: "Phép chiếu song song bảo toàn tính chất nào sau đây?",
        options: [
          { id: "A", text: "Độ lớn của góc", isCorrect: false },
          { id: "B", text: "Quan hệ song song giữa hai đường thẳng", isCorrect: true },
          { id: "C", text: "Độ dài đoạn thẳng bất kỳ", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Phép chiếu song song bảo toàn tính song song và tỉ số của hai đoạn thẳng cùng phương.",
        explanationIncorrect: "Góc vuông trong không gian khi chiếu lên mặt phẳng vẽ thường biến thành góc nhọn hoặc góc tù.",
        socraticHint: "Khi nhìn nghiêng một cái bàn chữ nhật, góc vuông nhìn giống góc gì?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-sg1-1",
        question: "Học sinh A vẽ đáy hình bình hành thành hình chữ nhật với 4 góc vuông để 'dễ nhìn'. Lỗi nhận thức này được mã hóa là gì?",
        options: [
          { id: "A", text: "Lỗi SG01 (Sai đối tượng)", isCorrect: false },
          { id: "B", text: "Lỗi SG02 (Tự tiện thêm tính chất đặc biệt - vuông góc)", isCorrect: true },
          { id: "C", text: "Lỗi SG05 (Sai tỉ số)", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Lỗi SG02 là lỗi tư duy suy diễn sai khi tự ý áp đặt tính chất đặc biệt lên hình vẽ tổng quát.",
        explanationIncorrect: "Vẽ đáy thành hình chữ nhật sẽ dẫn đến các kết luận sai lầm về quan hệ vuông góc không có trong đề bài.",
        errorTag: "SG02",
      },
    ],
    simulationRef: {
      moduleId: "spatial_geometry",
      simulationType: "spatial_geometry",
      lessonIndex: 0,
      labName: "Phòng Thí Nghiệm 3D Chóp S.ABCD",
      actionPrompt: "Mở mô phỏng 3D để quan sát chóp S.ABCD, kéo đỉnh S và kiểm tra tính phẳng của đáy ABCD.",
    },
  },

  "sg-lesson-2": {
    lessonId: "sg-lesson-2",
    moduleId: "spatial_geometry",
    order: 2,
    code: "BÀI 2",
    title: "Dựng trung điểm M và Điểm chia đoạn N (Tỉ số 2:1)",
    subtitle: "Quan hệ phụ thuộc tọa độ và cập nhật tức thời khi kéo đỉnh S",
    grade: 11,
    estimatedMinutes: 20,
    xpReward: 70,
    objectives: [
      "Hiểu rõ định nghĩa điểm chia đoạn thẳng theo tỉ số cho trước trong không gian 3 chiều.",
      "Dựng chính xác trung điểm $M$ trên cạnh $SA$ và điểm $N$ trên cạnh $SB$ thỏa $SN : NB = 2 : 1$.",
      "Nhận diện tính chất phụ thuộc: Khi kéo đỉnh $S$ di chuyển, các điểm $M$ và $N$ tự động dịch chuyển tương ứng.",
    ],
    theory: {
      coreConcept:
        "Trong không gian, điểm $M$ là trung điểm của $SA$ khi $\\vec{SM} = \\frac{1}{2}\\vec{SA}$. Điểm $N$ thuộc đoạn $SB$ thỏa mãn $SN : NB = 2 : 1$ đồng nghĩa với đoạn $SN$ chiếm 2 phần, đoạn $NB$ chiếm 1 phần (tổng đoạn $SB$ là 3 phần), do đó $\\vec{SN} = \\frac{2}{3}\\vec{SB}$.",
      formulas: [
        {
          formula: "M = \\frac{S + A}{2}",
          meaning: "Tọa độ trung điểm M của đoạn thẳng SA",
        },
        {
          formula: "N = S + \\frac{2}{3}(B - S) = \\frac{1}{3}S + \\frac{2}{3}B",
          meaning: "Tọa độ điểm N chia đoạn SB theo tỉ số SN : NB = 2 : 1",
          conditions: "N nằm trong đoạn SB (gần B hơn gần S)",
        },
      ],
      notes: [
        "Lỗi SG04: Nhầm lẫn tỉ số $SN : NB = 2 : 1$ thành $SN = \\frac{1}{2} SB$ (nhầm tỉ số đoạn với tỉ số tổng).",
        "Lỗi SG05: Dựng điểm $N$ nằm ngoài đoạn thẳng $SB$ trên đường thẳng kéo dài.",
      ],
      miniTip: "Mẹo nhớ: 'Tỉ số 2:1 nghĩa là chia làm 3 phần bằng nhau: SN lấy 2 phần, NB lấy 1 phần!'",
    },
    workedExample: {
      problemStatement: "Cho đỉnh $S(0; 0; 4{,}5)$ và $B(1{,}8; -1{,}4; 0)$. Tìm tọa độ điểm N trên SB thỏa mãn $SN : NB = 2 : 1$.",
      steps: [
        {
          stepNumber: 1,
          title: "Phân tích tỉ số vectơ",
          mathExpression: "\\frac{SN}{NB} = \\frac{2}{1} \\implies SN = \\frac{2}{3} SB \\implies \\vec{SN} = \\frac{2}{3}\\vec{SB}",
          explanation: "Vì $N$ nằm giữa $S$ và $B$ nên vectơ $\\vec{SN}$ cùng hướng với vectơ $\\vec{SB}$.",
          rationale: "Chuyển đổi tỉ số độ dài hình học thành hệ thức vectơ chính xác.",
        },
        {
          stepNumber: 2,
          title: "Tính toán tọa độ điểm N",
          mathExpression: "N = S + \\frac{2}{3}(B - S) = (0; 0; 4{,}5) + \\frac{2}{3}(1{,}8; -1{,}4; -4{,}5) = (1{,}2; -0{,}93; 1{,}5)",
          explanation: "Thay tọa độ $S$ và $B$ vào công thức để tìm tọa độ $N$.",
          rationale: "Tọa độ hóa đảm bảo tính chính xác khi render đồ họa 3D.",
        },
      ],
      conclusion: "Điểm N có cao độ z = 1,5, nằm cách đỉnh S một khoảng bằng 2/3 độ dài cạnh bên SB.",
    },
    checkpoints: [
      {
        id: "cp-sg2-1",
        question: "Tỉ số SN : NB = 2 : 1 có nghĩa là điểm N nằm gần điểm nào hơn?",
        options: [
          { id: "A", text: "Nằm gần điểm S hơn", isCorrect: false },
          { id: "B", text: "Nằm gần điểm B hơn", isCorrect: true },
          { id: "C", text: "Nằm chính giữa S và B", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Đoạn $NB$ chỉ có 1 phần trong khi đoạn $SN$ dài tới 2 phần, nên $N$ gần $B$ hơn.",
        explanationIncorrect: "Khoảng cách $NB$ nhỏ hơn khoảng cách $SN$ ($1 < 2$).",
        socraticHint: "Đoạn nào ngắn hơn: SN hay NB?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-sg2-1",
        question: "Học sinh tính ra $N = S + \\frac{1}{2}(B - S)$. Lỗi nhận thức ở đây là gì?",
        options: [
          { id: "A", text: "Lỗi SG04: Nhầm lẫn tỉ số chia 2:1 thành trung điểm 1:1", isCorrect: true },
          { id: "B", text: "Lỗi SG01: Vẽ sai đối tượng", isCorrect: false },
        ],
        explanationCorrect: "Rất tốt! Tỉ số 2:1 cần chia làm 3 phần chứ không phải 2 phần.",
        explanationIncorrect: "Tỉ số $\\frac{1}{2}$ là trung điểm (tỉ số 1:1).",
        errorTag: "SG04",
      },
    ],
    simulationRef: {
      moduleId: "spatial_geometry",
      simulationType: "spatial_geometry",
      lessonIndex: 1,
      labName: "Mô Phỏng 3D Dựng Điểm M & N",
      actionPrompt: "Mở mô phỏng để quan sát vị trí điểm N thay đổi trên cạnh bên SB khi điều chỉnh thanh trượt tỉ số.",
    },
  },

  "sg-lesson-3": {
    lessonId: "sg-lesson-3",
    moduleId: "spatial_geometry",
    order: 3,
    code: "BÀI 3",
    title: "Khảo sát xoay 360° & Nét thấy - Nét khuất",
    subtitle: "Phân biệt quan sát góc nhìn với chứng minh bản chất toán học",
    grade: 11,
    estimatedMinutes: 20,
    xpReward: 70,
    objectives: [
      "Hiểu rõ quy ước nét thấy (Nét liền) và nét khuất (Nét đứt) trong hình học biểu diễn không gian.",
      "Nhận thức được nét khuất phụ thuộc vào góc nhìn của người quan sát, không phải thuộc tính bất biến của đoạn thẳng.",
      "Phát hiện phản ví dụ trực giác: Hai đường thẳng chéo nhau nhìn trên màn hình có thể giống như cắt nhau (Lỗi SG16).",
    ],
    theory: {
      coreConcept:
        "Trong không gian 3 chiều, các đoạn thẳng bị các mặt phẳng phía trước che khuất phải được vẽ bằng nét đứt. Khi ta xoay hình khối, các đoạn thẳng bị che có thể trở thành nét thấy và ngược lại. Hai đường thẳng không cùng nằm trong một mặt phẳng gọi là hai đường thẳng chéo nhau; hình chiếu của chúng có thể cắt nhau nhưng trong không gian chúng không có điểm chung.",
      formulas: [
        {
          formula: "AB \\cap SD = \\emptyset \\quad \\text{và} \\quad AB, SD \\text{ không đồng phẳng}",
          meaning: "Định nghĩa hai đường thẳng chéo nhau trong không gian",
        },
      ],
      notes: [
        "Lỗi SG08: Nhầm tưởng nét đứt là ký hiệu của quan hệ song song.",
        "Lỗi SG16: Nhìn thấy 2 đường chéo nhau cắt nhau trên màn chiếu 2D liền vội vàng kết luận chúng có giao điểm.",
      ],
      miniTip: "Mẹo nhớ: 'Nét đứt là do BỊ CHE; Hai đường cắt nhau trên màn hình chưa chắc cắt nhau ngoài đời!'",
    },
    workedExample: {
      problemStatement: "Xét hai đường thẳng $AB$ (nằm ở đáy) và $SD$ (cạnh bên chóp). Hãy chứng minh $AB$ và $SD$ chéo nhau mặc dù trên hình vẽ nghiêng chúng có điểm giao nhau.",
      steps: [
        {
          stepNumber: 1,
          title: "Xác định mặt phẳng chứa đường thứ nhất",
          mathExpression: "AB \\subset (ABCD)",
          explanation: "Đường thẳng $AB$ nằm trọn vẹn trong mặt phẳng đáy $(ABCD)$.",
          rationale: "Phương pháp chứng minh hai đường chéo nhau: Tìm mặt phẳng chứa đường này nhưng song song hoặc cắt đường kia tại điểm không thuộc đường này.",
        },
        {
          stepNumber: 2,
          title: "Khảo sát giao điểm của đường thứ hai với mặt phẳng",
          mathExpression: "SD \\cap (ABCD) = \\{D\\}",
          explanation: "Đường thẳng $SD$ cắt mặt phẳng đáy $(ABCD)$ tại duy nhất điểm $D$.",
          rationale: "Điểm $D$ là giao điểm duy nhất của $SD$ với mặt phẳng đáy.",
        },
        {
          stepNumber: 3,
          title: "Kiểm tra xem giao điểm D có thuộc đường thẳng thứ nhất không",
          mathExpression: "D \\notin AB \\quad (\\text{vì } ABCD \\text{ là hình bình hành})",
          explanation: "Vì $D$ không thuộc $AB$, suy ra $SD$ không thể đồng phẳng với $AB$.",
          rationale: "Định lý: Nếu đường thẳng $d$ cắt mặt phẳng $(P)$ tại điểm $A$ không thuộc $a \\subset (P)$ thì $a$ và $d$ chéo nhau.",
        },
      ],
      conclusion: "AB và SD là hai đường thẳng chéo nhau. Giao điểm nhìn thấy trên màn hình chỉ là ảo ảnh thị giác do phép chiếu phẳng.",
    },
    checkpoints: [
      {
        id: "cp-sg3-1",
        question: "Khi xoay khối chóp 3D sang một góc nhìn mới, tính chất nào sau đây THAY ĐỔI?",
        options: [
          { id: "A", text: "Độ dài thực tế của các cạnh", isCorrect: false },
          { id: "B", text: "Trạng thái thấy / khuất (nét liền / nét đứt) của một cạnh", isCorrect: true },
          { id: "C", text: "Thể tích của khối chóp", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Nét thấy hay khuất phụ thuộc hoàn toàn vào vị trí mắt của người quan sát so với các mặt chắn phía trước.",
        explanationIncorrect: "Kích thước hình học thực tế là bất biến; chỉ có góc nhìn và sự che khuất là thay đổi khi xoay.",
        socraticHint: "Khi em đi vòng ra sau lưng một tòa nhà, mặt trước của tòa nhà còn nhìn thấy được không?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-sg3-1",
        question: "Hai đường thẳng chéo nhau trong không gian có thể có bao nhiêu điểm chung?",
        options: [
          { id: "A", text: "0 điểm chung", isCorrect: true },
          { id: "B", text: "1 điểm chung", isCorrect: false },
          { id: "C", text: "Vô số điểm chung", isCorrect: false },
        ],
        explanationCorrect: "Rất chuẩn! Hai đường chéo nhau không cùng nằm trong một mặt phẳng nên không bao giờ có điểm chung.",
        explanationIncorrect: "Nếu có 1 điểm chung thì chúng đã cắt nhau (đồng phẳng), không còn là chéo nhau.",
        errorTag: "SG16",
      },
    ],
    simulationRef: {
      moduleId: "spatial_geometry",
      simulationType: "spatial_geometry",
      lessonIndex: 2,
      labName: "Phòng Thí Nghiệm Xoay 360° & Nét Khuất",
      actionPrompt: "Mở mô phỏng để xoay tự do khối chóp 3D bằng chuột và quan sát nét đứt tự động chuyển thành nét liền.",
    },
  },

  "sg-lesson-4": {
    lessonId: "sg-lesson-4",
    moduleId: "spatial_geometry",
    order: 4,
    code: "BÀI 4",
    title: "Mặt phẳng cắt & Thiết diện đa giác lồi",
    subtitle: "Mặt phẳng qua M song song đáy cắt hình chóp theo thiết diện MPQR",
    grade: 11,
    estimatedMinutes: 22,
    xpReward: 80,
    objectives: [
      "Nắm vững định nghĩa thiết diện của hình chóp bị cắt bởi một mặt phẳng.",
      "Vận dụng định lý giao tuyến của hai mặt phẳng song song để tìm các đoạn giao tuyến trên từng mặt bên.",
      "Dựng thành công thiết diện đa giác lồi $MPQR$ khép kín, phân biệt điểm nằm trên mặt với điểm nằm ngoài khối.",
    ],
    theory: {
      coreConcept:
        "Thiết diện của một hình chóp cắt bởi mặt phẳng $(\\alpha)$ là đa giác phẳng khép kín được giới hạn bởi các đoạn giao tuyến của $(\\alpha)$ với các mặt của hình chóp. Nếu $(\\alpha)$ song song với mặt phẳng đáy thì thiết diện thu được là một hình đồng dạng với đa giác đáy.",
      formulas: [
        {
          formula: "(\\alpha) \\parallel (ABCD) \\implies \\begin{cases} MP \\parallel AB \\\\ PQ \\parallel BC \\\\ QR \\parallel CD \\\\ RM \\parallel DA \\end{cases}",
          meaning: "Định lý giao tuyến song song với mặt phẳng đáy",
        },
      ],
      notes: [
        "Các đỉnh của thiết diện bắt buộc phải nằm trên các cạnh của hình chóp, không được lấy điểm nằm trên phần kéo dài ngoài cạnh (Lỗi SG10).",
        "Đa giác thiết diện phải khép kín hoàn toàn và có diện tích dương.",
      ],
      miniTip: "Mẹo nhớ: 'Mặt phẳng cắt song song đáy thì thiết diện sinh ra đồng dạng với đáy!'",
    },
    workedExample: {
      problemStatement: "Cho chóp $S.ABCD$ đáy hình bình hành. Mặt phẳng $(\\alpha)$ đi qua trung điểm $M$ của $SA$ và song song với đáy $(ABCD)$. Xác định hình dạng của thiết diện.",
      steps: [
        {
          stepNumber: 1,
          title: "Tìm giao tuyến với mặt (SAB)",
          mathExpression: "(\\alpha) \\cap (SAB) = MP \\parallel AB \\quad (P \\in SB)",
          explanation: "Vì $(\\alpha) \\parallel (ABCD)$ và $AB = (SAB) \\cap (ABCD)$ nên giao tuyến qua $M$ phải song song với $AB$. Vì $M$ là trung điểm $SA$ nên $P$ là trung điểm $SB$.",
          rationale: "Áp dụng định lý giao tuyến của hai mặt phẳng song song với mặt thứ ba.",
        },
        {
          stepNumber: 2,
          title: "Tìm giao tuyến với các mặt còn lại",
          mathExpression: "PQ \\parallel BC \\, (Q \\in SC), \\quad QR \\parallel CD \\, (R \\in SD), \\quad RM \\parallel DA",
          explanation: "Tương tự, $Q$ và $R$ lần lượt là trung điểm của $SC$ và $SD$.",
          rationale: "Khép kín chu trình giao tuyến quanh các mặt bên của hình chóp.",
        },
        {
          stepNumber: 3,
          title: "Kết luận hình dạng thiết diện",
          mathExpression: "MPQR \\text{ là hình bình hành có các cạnh bằng một nửa cạnh đáy}",
          explanation: "Vì $MP \\parallel QR$ và $PQ \\parallel RM$, tứ giác $MPQR$ là hình bình hành đồng dạng với đáy $ABCD$ theo tỉ số $1/2$.",
          rationale: "Đa giác khép kín có các cạnh tương ứng song song với đáy.",
        },
      ],
      conclusion: "Thiết diện tạo bởi mặt phẳng (alpha) và hình chóp là hình bình hành MPQR.",
    },
    checkpoints: [
      {
        id: "cp-sg4-1",
        question: "Thiết diện của một hình chóp cắt bởi một mặt phẳng có thể là một đường cong không?",
        options: [
          { id: "A", text: "Có thể, nếu mặt phẳng cắt xéo", isCorrect: false },
          { id: "B", text: "Không bao giờ, vì các mặt của hình chóp đều là các đa giác phẳng nên giao tuyến luôn là các đoạn thẳng", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Giao của hai mặt phẳng luôn là đường thẳng, do đó thiết diện của khối đa diện luôn luôn là đa giác phẳng.",
        explanationIncorrect: "Khối chóp chỉ có các mặt phẳng, không có mặt cong như hình nón.",
        socraticHint: "Giao của hai mặt phẳng phẳng là hình gì?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-sg4-1",
        question: "Khi mặt phẳng cắt đi qua trung điểm M của SA và song song đáy chóp, diện tích thiết diện bằng bao nhiêu lần diện tích đáy?",
        options: [
          { id: "A", text: "1/2 lần", isCorrect: false },
          { id: "B", text: "1/4 lần", isCorrect: true },
          { id: "C", text: "1/8 lần", isCorrect: false },
        ],
        explanationCorrect: "Rất xuất sắc! Tỉ số đồng dạng là $k = 1/2$, do đó tỉ số diện tích là $k^2 = (1/2)^2 = 1/4$.",
        explanationIncorrect: "Tỉ số diện tích của hai hình đồng dạng bằng BÌNH PHƯƠNG tỉ số đồng dạng.",
        errorTag: "SG11",
      },
    ],
    simulationRef: {
      moduleId: "spatial_geometry",
      simulationType: "spatial_geometry",
      lessonIndex: 3,
      labName: "Mô Phỏng 3D Mặt Phẳng Thiết Diện MPQR",
      actionPrompt: "Mở mô phỏng 3D để bật/tắt mặt phẳng cắt và quan sát đa giác thiết diện MPQR được tô màu nổi bật.",
    },
  },

  "sg-lesson-5": {
    lessonId: "sg-lesson-5",
    moduleId: "spatial_geometry",
    order: 5,
    code: "BÀI 5",
    title: "Trải phẳng (Unfolding), Tách-gộp hình & Thử thách chuyển giao",
    subtitle: "Bảo toàn kích thước từng mặt, kiểm tra không chồng lấn và hoàn thành các bài B-01 đến B-05",
    grade: 11,
    estimatedMinutes: 22,
    xpReward: 90,
    objectives: [
      "Hiểu rõ kỹ thuật trải phẳng (Unfolding): Trải các mặt bên của khối đa diện ra một mặt phẳng 2D duy nhất.",
      "Bảo toàn nguyên vẹn độ dài các cạnh và số đo các góc của từng mặt trong quá trình trải phẳng (chuyển động cứng).",
      "Ứng dụng trải phẳng để tìm đường đi ngắn nhất (quỹ đạo tối ưu) trên bề mặt khối đa diện.",
    ],
    theory: {
      coreConcept:
        "Trải phẳng (Unfolding) là thao tác cắt dọc theo một số cạnh của hình chóp và 'mở' các mặt bên xoay quanh cạnh đáy đặt lên cùng một mặt phẳng. Thao tác này biến bài toán tìm đường đi ngắn nhất trên mặt cong/mặt gãy khúc 3D thành bài toán đoạn thẳng nối hai điểm trên mặt phẳng 2D.",
      formulas: [
        {
          formula: "d_{\\min}(A, B) = \\text{Độ dài đoạn thẳng nối } A \\text{ và } B \\text{ trên bản trải phẳng}",
          meaning: "Nguyên lý đường trắc địa ngắn nhất qua bản trải",
        },
      ],
      notes: [
        "Lỗi SG13: Trải hình làm méo mó kích thước các mặt (vi phạm bảo toàn kích thước cứng).",
        "Lỗi SG14: Các mặt bên sau khi mở ra bị chồng lấn lên nhau do chọn cạnh cắt không hợp lý.",
      ],
      miniTip: "Mẹo nhớ: 'Muốn tìm đường đi ngắn nhất trên khối chóp, hãy trải phẳng các mặt ra một tờ giấy!'",
    },
    workedExample: {
      problemStatement: "Một chú kiến bò trên bề mặt hình chóp tứ giác đều từ đỉnh đáy A vòng qua các mặt bên rồi trở về đỉnh đối diện C. Làm thế nào tìm quãng đường ngắn nhất?",
      steps: [
        {
          stepNumber: 1,
          title: "Trải phẳng các mặt bên mà kiến đi qua",
          mathExpression: "\\Delta SAB, \\, \\Delta SBC \\text{ được mở ra cùng mặt phẳng}",
          explanation: "Cắt cạnh bên $SB$ và mở mặt $\\Delta SAB$ và $\\Delta SBC$ nằm liền kề nhau trên cùng một mặt phẳng 2D.",
          rationale: "Đưa các mặt gãy khúc trong không gian về một mặt phẳng duy nhất.",
        },
        {
          stepNumber: 2,
          title: "Nối đoạn thẳng giữa điểm đầu và điểm cuối",
          mathExpression: "AC_{\\text{trải}} = \\text{Đoạn thẳng nối điểm A với ảnh C trên mặt phẳng}",
          explanation: "Trong mặt phẳng, đường đi ngắn nhất giữa hai điểm luôn là đoạn thẳng nối hai điểm đó.",
          rationale: "Bất đẳng thức tam giác khẳng định đường thẳng là đường ngắn nhất.",
        },
      ],
      conclusion: "Độ dài đoạn thẳng trên bản trải phẳng chính là quãng đường ngắn nhất chú kiến cần bò.",
    },
    checkpoints: [
      {
        id: "cp-sg5-1",
        question: "Khi mở trải một tam giác bên của hình chóp ra mặt phẳng, góc giữa các cạnh của tam giác đó có thay đổi không?",
        options: [
          { id: "A", text: "Có thay đổi tùy vào góc mở", isCorrect: false },
          { id: "B", text: "Tuyệt đối không đổi vì đây là chuyển động cứng bảo toàn kích thước từng mặt", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Giống như mở nắp một chiếc hộp giấy, hình dạng và kích thước của mỗi mảnh bìa được giữ nguyên 100%.",
        explanationIncorrect: "Trải phẳng chỉ thay đổi góc nhị diện giữa hai mặt phẳng, kích thước từng mặt không hề biến dạng.",
        socraticHint: "Khi em giở một trang sách phẳng ra bàn, chữ và hình trên trang sách có bị méo không?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-sg5-1",
        question: "Ứng dụng thực tế lớn nhất của kỹ thuật trải hình không gian là gì?",
        options: [
          { id: "A", text: "Thiết kế bao bì giấy, gò hàn kim loại tấm và tìm đường đi tối ưu", isCorrect: true },
          { id: "B", text: "Đếm số đỉnh của khối chóp", isCorrect: false },
        ],
        explanationCorrect: "Rất chuẩn xác! Toàn bộ ngành công nghiệp bao bì và chế tạo máy đều dựa trên kỹ thuật trải hình phẳng.",
        explanationIncorrect: "Trải phẳng là công cụ ứng dụng thực tiễn then chốt trong kỹ thuật và kiến trúc.",
        errorTag: "SG15",
      },
    ],
    simulationRef: {
      moduleId: "spatial_geometry",
      simulationType: "spatial_geometry",
      lessonIndex: 4,
      labName: "Mô Phỏng Trải Phẳng Khối Đa Diện",
      actionPrompt: "Mở mô phỏng 3D để bấm nút trải phẳng các mặt bên mở dần từ góc 0 độ đến 90 độ.",
    },
  },

  // =========================================================================
  // CHUYÊN ĐỀ 3: LƯỢNG GIÁC TƯƠNG TÁC (TOÁN 11)
  // =========================================================================

  "trig-lesson-1": {
    lessonId: "trig-lesson-1",
    moduleId: "trigonometry",
    order: 1,
    code: "BÀI 1",
    title: "Góc lượng giác, Chiều quay & Điểm biểu diễn",
    subtitle: "Nhiệm vụ LG-MH01: Khảo sát góc âm và góc nhiều vòng alpha = -765 độ",
    grade: 11,
    estimatedMinutes: 18,
    xpReward: 60,
    objectives: [
      "Hiểu rõ quy ước chiều quay của góc lượng giác: Chiều dương là ngược chiều kim đồng hồ, chiều âm là cùng chiều kim đồng hồ.",
      "Biết cách phân tích một góc có số đo lớn (nhiều vòng quay) thành tổng các vòng tròn $k \\cdot 360^\\circ$ ($k \\cdot 2\\pi$) và góc dư.",
      "Xác định chính xác điểm ngọn biểu diễn của góc trên đường tròn lượng giác đơn vị.",
    ],
    theory: {
      coreConcept:
        "Đường tròn lượng giác là đường tròn định hướng tâm $O(0; 0)$, bán kính $R = 1$, có điểm gốc là $A(1; 0)$. Chiều dương là chiều ngược chiều kim đồng hồ. Một góc lượng giác $\\alpha$ bất kỳ luôn có thể viết dưới dạng $\\alpha = \\alpha_0 + k \\cdot 360^\\circ$ ($k \\in \\mathbb{Z}$, $0^\\circ \\le \\alpha_0 < 360^\\circ$).",
      formulas: [
        {
          formula: "\\alpha = \\alpha_0 + k \\cdot 360^\\circ \\quad (k \\in \\mathbb{Z})",
          meaning: "Công thức phân tích số vòng quay hoàn chỉnh của góc lượng giác",
        },
        {
          formula: "180^\\circ = \\pi \\text{ rad} \\implies 1^\\circ = \\frac{\\pi}{180} \\text{ rad}",
          meaning: "Quy tắc chuyển đổi đơn vị giữa Độ (Degree) và Radian",
        },
      ],
      notes: [
        "Hai góc lượng giác có số đo hơn kém nhau bội nguyên của $360^\\circ$ ($2\\pi$) có CÙNG một điểm biểu diễn trên đường tròn.",
        "Góc âm quay cùng chiều kim đồng hồ từ tia gốc $OA$.",
      ],
      miniTip: "Mẹo nhớ: 'Ngược kim đồng hồ là DƯƠNG (+), Thuận kim đồng hồ là ÂM (-); Cứ thêm 360 độ là về chỗ cũ!'",
    },
    workedExample: {
      problemStatement: "Cho góc lượng giác $\\alpha = -765^\\circ$. Hãy tách số vòng quay hoàn chỉnh, xác định góc đại diện dương và tìm điểm biểu diễn trên đường tròn.",
      steps: [
        {
          stepNumber: 1,
          title: "Tách số vòng quay 360 độ",
          mathExpression: "-765^\\circ = (-2) \\times 360^\\circ - 45^\\circ = (-3) \\times 360^\\circ + 315^\\circ",
          explanation: "Góc quay âm 2 vòng đầy đủ rồi quay tiếp thêm $-45^\\circ$, tương đương với góc dương $315^\\circ$ ($7\\pi/4$).",
          rationale: "Tách vòng giúp đưa góc lớn về góc cơ bản trong khoảng $[0; 360^\\circ)$.",
        },
        {
          stepNumber: 2,
          title: "Xác định góc phần tư của điểm ngọn",
          mathExpression: "270^\\circ < 315^\\circ < 360^\\circ \\implies \\text{Điểm M thuộc Góc Phần Tư IV}",
          explanation: "Vì $315^\\circ$ nằm giữa $270^\\circ$ và $360^\\circ$, điểm biểu diễn $M$ nằm ở góc phần tư thứ tư.",
          rationale: "Xác định góc phần tư là bước then chốt để xét dấu các giá trị sin, cos sau này.",
        },
      ],
      conclusion: "Góc -765 độ có cùng điểm biểu diễn với góc 315 độ (-45 độ), nằm ở góc phần tư thứ IV.",
    },
    checkpoints: [
      {
        id: "cp-trig1-1",
        question: "Góc quay cùng chiều kim đồng hồ mang dấu gì?",
        options: [
          { id: "A", text: "Dấu dương (+)", isCorrect: false },
          { id: "B", text: "Dấu âm (-)", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Quy ước quốc tế chuẩn: Cùng chiều kim đồng hồ là chiều âm.",
        explanationIncorrect: "Chiều dương lượng giác là chiều ngược chiều quay kim đồng hồ.",
        socraticHint: "Nhìn chiếc đồng hồ treo tường: kim đồng hồ quay theo chiều nào?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-trig1-1",
        question: "Góc $405^\\circ$ có cùng điểm biểu diễn trên đường tròn với góc nào?",
        options: [
          { id: "A", text: "45 độ", isCorrect: true },
          { id: "B", text: "135 độ", isCorrect: false },
          { id: "C", text: "-45 độ", isCorrect: false },
        ],
        explanationCorrect: "Rất tốt! $405^\\circ = 360^\\circ + 45^\\circ$, tức quay đúng 1 vòng rồi đi thêm $45^\\circ$.",
        explanationIncorrect: "Lấy $405 - 360 = 45^\\circ$.",
        errorTag: "E01",
      },
    ],
    simulationRef: {
      moduleId: "trigonometry",
      simulationType: "trigonometry",
      lessonIndex: 0,
      labName: "Mô Phỏng Đường Tròn Đơn Vị & Góc Quay",
      actionPrompt: "Mở mô phỏng để xoay điểm M góc -765 độ và quan sát vệt quay hình xoắn ốc trực quan.",
    },
  },

  "trig-lesson-2": {
    lessonId: "trig-lesson-2",
    moduleId: "trigonometry",
    order: 2,
    code: "BÀI 2",
    title: "Giá trị lượng giác & Xét dấu trên 4 góc phần tư",
    subtitle: "Nhiệm vụ LG-MH02: sin (tung độ), cos (hoành độ), tan, cot và điểm trên trục",
    grade: 11,
    estimatedMinutes: 20,
    xpReward: 70,
    objectives: [
      "Hiểu sâu bản chất định nghĩa: $\\cos \\alpha$ là hoành độ $x_M$, $\\sin \\alpha$ là tung độ $y_M$ của điểm ngọn trên đường tròn đơn vị.",
      "Nắm chắc bảng xét dấu của 4 giá trị lượng giác trên từng góc phần tư I, II, III, IV.",
      "Tính chính xác giá trị lượng giác tại các góc đặc biệt và hiểu rõ điều kiện xác định của $\\tan$ và $\\cot$.",
    ],
    theory: {
      coreConcept:
        "Với điểm ngọn $M(x_M; y_M)$ trên đường tròn lượng giác đơn vị: $\\cos \\alpha = x_M$, $\\sin \\alpha = y_M$, $\\tan \\alpha = \\frac{y_M}{x_M} = \\frac{\\sin \\alpha}{\\cos \\alpha}$ (khi $\\cos \\alpha \\ne 0$), $\\cot \\alpha = \\frac{x_M}{y_M} = \\frac{\\cos \\alpha}{\\sin \\alpha}$ (khi $\\sin \\alpha \\ne 0$). Vì bán kính $R = 1$ nên luôn có $-1 \\le \\sin \\alpha, \\cos \\alpha \\le 1$.",
      formulas: [
        {
          formula: "\\sin^2 \\alpha + \\cos^2 \\alpha = 1",
          meaning: "Hằng đẳng thức lượng giác cơ bản (Định lý Pythagoras trên đường tròn đơn vị)",
        },
        {
          formula: "1 + \\tan^2 \\alpha = \\frac{1}{\\cos^2 \\alpha} \\quad (\\alpha \\ne \\frac{\\pi}{2} + k\\pi)",
          meaning: "Mối liên hệ giữa tang và cosin",
        },
      ],
      notes: [
        "Quy tắc xét dấu: Góc phần tư I (Tất cả dương); Góc phần tư II (Chỉ Sin dương); Góc phần tư III (Chỉ Tan/Cot dương); Góc phần tư IV (Chỉ Cos dương).",
        "Lỗi E06: Quên rằng $\\tan 90^\\circ$ ($\\\pi/2$) không xác định vì mẫu số $\\cos 90^\\circ = 0$.",
      ],
      miniTip: "Mẹo nhớ câu thần chú xét dấu: 'Nhất CẢ, Nhì SIN, Tam TAN, Tứ COS'!",
    },
    workedExample: {
      problemStatement: "Tính các giá trị lượng giác của góc $\\alpha = -765^\\circ$.",
      steps: [
        {
          stepNumber: 1,
          title: "Đưa về góc đại diện",
          mathExpression: "\\alpha = -765^\\circ \\equiv -45^\\circ = -\\frac{\\pi}{4} \\quad (\\text{Góc phần tư IV})",
          explanation: "Vì $-765^\\circ = -2 \\times 360^\\circ - 45^\\circ$, giá trị lượng giác của $-765^\\circ$ bằng giá trị lượng giác của $-45^\\circ$.",
          rationale: "Tính tuần hoàn chu kỳ $2\\pi$ của sin và cos.",
        },
        {
          stepNumber: 2,
          title: "Tính cos và sin",
          mathExpression: "\\cos(-765^\\circ) = \\cos(-45^\\circ) = \\frac{\\sqrt{2}}{2} > 0; \\quad \\sin(-765^\\circ) = \\sin(-45^\\circ) = -\\frac{\\sqrt{2}}{2} < 0",
          explanation: "Ở góc phần tư IV, hoành độ dương nên $\\cos > 0$, tung độ âm nên $\\sin < 0$.",
          rationale: "Chiếu điểm $M$ xuống hai trục $Ox$ và $Oy$.",
        },
        {
          stepNumber: 3,
          title: "Tính tan và cot",
          mathExpression: "\\tan(-765^\\circ) = \\frac{\\sin}{\\cos} = -1; \\quad \\cot(-765^\\circ) = \\frac{\\cos}{\\sin} = -1",
          explanation: "Thương của một số âm và một số dương luôn mang dấu âm.",
          rationale: "Áp dụng định nghĩa tỉ số lượng giác.",
        },
      ],
      conclusion: "Tại góc -765 độ: cos = sqrt(2)/2, sin = -sqrt(2)/2, tan = -1, cot = -1.",
    },
    checkpoints: [
      {
        id: "cp-trig2-1",
        question: "Ở góc phần tư thứ II, giá trị lượng giác nào mang dấu DƯƠNG?",
        options: [
          { id: "A", text: "Chỉ có cos", isCorrect: false },
          { id: "B", text: "Chỉ có sin", isCorrect: true },
          { id: "C", text: "Cả sin và cos", isCorrect: false },
          { id: "D", text: "Chỉ có tan", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Thần chú 'Nhì SIN': Ở góc phần tư II, tung độ $y > 0$ nên $\\sin > 0$, còn hoành độ $x < 0$ nên $\\cos < 0$.",
        explanationIncorrect: "Góc phần tư II nằm ở phía trên bên trái: tung độ dương, hoành độ âm.",
        socraticHint: "Điểm ở góc phần tư II có tung độ nằm ở phía trên hay phía dưới trục hoành?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-trig2-1",
        question: "Giá trị của $\\sin^2(123^\\circ) + \\cos^2(123^\\circ)$ bằng bao nhiêu?",
        options: [
          { id: "A", text: "0", isCorrect: false },
          { id: "B", text: "1", isCorrect: true },
          { id: "C", text: "Không tính được nếu không bấm máy tính", isCorrect: false },
        ],
        explanationCorrect: "Xuất sắc! Với mọi góc $\\alpha$, ta luôn có hằng đẳng thức $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$.",
        explanationIncorrect: "Hằng đẳng thức $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$ đúng với BẤT KỲ góc nào.",
        errorTag: "E04",
      },
    ],
    simulationRef: {
      moduleId: "trigonometry",
      simulationType: "trigonometry",
      lessonIndex: 1,
      labName: "Khảo Sát Trục Giá Trị Sin, Cos, Tan, Cot",
      actionPrompt: "Mở mô phỏng để kéo điểm M và quan sát hình chiếu tự động nhảy giá trị cos trên Ox và sin trên Oy.",
    },
  },

  "trig-lesson-3": {
    lessonId: "trig-lesson-3",
    moduleId: "trigonometry",
    order: 3,
    code: "BÀI 3",
    title: "Cung liên kết & Hệ thống công thức lượng giác",
    subtitle: "Nhiệm vụ LG-MH03: Đối xứng, cung đối, bù, phụ, công thức nhân đôi & tích <-> tổng",
    grade: 11,
    estimatedMinutes: 22,
    xpReward: 80,
    objectives: [
      "Hiểu bản chất hình học của các cung liên kết: Cung đối (đối xứng qua Ox), cung bù (đối xứng qua Oy), cung phụ (đối xứng qua đường $y=x$).",
      "Ghi nhớ và áp dụng chính xác các công thức cộng, công thức nhân đôi $\\sin(2\\alpha), \\cos(2\\alpha)$.",
      "Tránh bẫy sai lầm phổ biến E08: Tự tiện phân phối $\\sin(a+b) = \\sin a + \\sin b$.",
    ],
    theory: {
      coreConcept:
        "Các cung liên kết phản ánh tính đối xứng hình học của đường tròn đơn vị: Cos-đối ($\\cos(-\\alpha) = \\cos \\alpha$), Sin-bù ($\\sin(\\pi - \\alpha) = \\sin \\alpha$), Phụ-chéo ($\\sin(\\pi/2 - \\alpha) = \\cos \\alpha$), Hơn-kém-pi-tan ($\\tan(\\alpha + \\pi) = \\tan \\alpha$). Công thức cộng: $\\cos(a-b) = \\cos a \\cos b + \\sin a \\sin b$, $\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b$.",
      formulas: [
        {
          formula: "\\sin(2\\alpha) = 2\\sin \\alpha \\cos \\alpha",
          meaning: "Công thức nhân đôi của Sin",
        },
        {
          formula: "\\cos(2\\alpha) = \\cos^2 \\alpha - \\sin^2 \\alpha = 2\\cos^2 \\alpha - 1 = 1 - 2\\sin^2 \\alpha",
          meaning: "3 dạng công thức nhân đôi của Cosin",
        },
      ],
      notes: [
        "Lỗi E08: Ngộ nhận $\\sin(a+b) = \\sin a + \\sin b$ hoặc $\\cos(2\\alpha) = 2\\cos \\alpha$. Lượng giác KHÔNG CÓ tính chất phân phối!",
      ],
      miniTip: "Mẹo nhớ câu thơ cung liên kết: 'Cos đối, Sin bù, Phụ chéo, Hơn kém pi Tang'!",
    },
    workedExample: {
      problemStatement: "Biết $\\sin \\alpha = -\\frac{\\sqrt{2}}{2}$ và $\\cos \\alpha = \\frac{\\sqrt{2}}{2}$ (tại $\\alpha = -765^\\circ$). Hãy tính $\\sin(2\\alpha)$ và $\\cos(2\\alpha)$.",
      steps: [
        {
          stepNumber: 1,
          title: "Áp dụng công thức nhân đôi sin",
          mathExpression: "\\sin(2\\alpha) = 2 \\sin \\alpha \\cos \\alpha = 2 \\left(-\\frac{\\sqrt{2}}{2}\\right) \\left(\\frac{\\sqrt{2}}{2}\\right) = -1",
          explanation: "Thay giá trị của $\\sin \\alpha$ và $\\cos \\alpha$ vào công thức.",
          rationale: "Công thức nhân đôi đưa góc bội $2\\alpha$ về tích các giá trị lượng giác góc $\\alpha$.",
        },
        {
          stepNumber: 2,
          title: "Áp dụng công thức nhân đôi cos",
          mathExpression: "\\cos(2\\alpha) = \\cos^2 \\alpha - \\sin^2 \\alpha = \\left(\\frac{\\sqrt{2}}{2}\\right)^2 - \\left(-\\frac{\\sqrt{2}}{2}\\right)^2 = \\frac{1}{2} - \\frac{1}{2} = 0",
          explanation: "Hai bình phương bằng nhau trừ nhau ra kết quả 0.",
          rationale: "Tại góc $2\\alpha = 2(-45^\\circ) = -90^\\circ$, điểm biểu diễn nằm tại $(0; -1)$ có hoành độ bằng 0.",
        },
      ],
      conclusion: "Kết quả: sin(2 alpha) = -1 và cos(2 alpha) = 0, hoàn toàn khớp với góc -90 độ trên trục tung.",
    },
    checkpoints: [
      {
        id: "cp-trig3-1",
        question: "Biểu thức $\\sin(a + b) = \\sin a + \\sin b$ là Đúng hay Sai?",
        options: [
          { id: "A", text: "Đúng theo tính chất phân phối", isCorrect: false },
          { id: "B", text: "Sai hoàn toàn, vì sin là hàm số phi tuyến, công thức đúng phải là sin a cos b + cos a sin b", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Lỗi E08 là một trong những lỗi kinh điển nhất của học sinh lớp 11 khi xem hàm lượng giác như phép nhân số học.",
        explanationIncorrect: "Hàm lượng giác không thể nhân phân phối như đại số thông thường.",
        socraticHint: "Thử với $a = 90^\\circ, b = 90^\\circ$: $\\sin(180^\\circ) = 0$, nhưng $\\sin 90^\\circ + \\sin 90^\\circ = 1 + 1 = 2$!",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-trig3-1",
        question: "Rút gọn biểu thức $\\cos(\\pi - \\alpha)$ theo quy tắc cung liên kết:",
        options: [
          { id: "A", text: "cos alpha", isCorrect: false },
          { id: "B", text: "-cos alpha", isCorrect: true },
          { id: "C", text: "sin alpha", isCorrect: false },
        ],
        explanationCorrect: "Rất chuẩn! 'Sin bù': Hai góc bù nhau có Sin bằng nhau, còn Cos mang dấu đối nhau.",
        explanationIncorrect: "Chỉ có Sin của hai góc bù nhau mới bằng nhau; Cosin mang dấu âm.",
        errorTag: "E07",
      },
    ],
    simulationRef: {
      moduleId: "trigonometry",
      simulationType: "trigonometry",
      lessonIndex: 2,
      labName: "Mô Phỏng Cung Liên Kết & Nhân Đôi",
      actionPrompt: "Mở mô phỏng để quan sát hai điểm đối xứng qua trục tung và kiểm chứng công thức sin bù.",
    },
  },

  "trig-lesson-4": {
    lessonId: "trig-lesson-4",
    moduleId: "trigonometry",
    order: 4,
    code: "BÀI 4",
    title: "Liên kết Đường tròn đơn vị với Đồ thị hàm số & Chu kỳ",
    subtitle: "Nhiệm vụ LG-MH04: Hoành độ tích lũy, chu kỳ T = 2pi và hình thành sóng",
    grade: 11,
    estimatedMinutes: 22,
    xpReward: 80,
    objectives: [
      "Hiểu rõ cơ chế hình thành đồ thị sóng hình sin từ chuyển động tròn đều trên đường tròn đơn vị.",
      "Nắm chắc khái niệm tính tuần hoàn và chu kỳ cơ bản: Hàm số $y = \\sin x$ và $y = \\cos x$ có chu kỳ $T = 2\\pi$.",
      "Khảo sát tác động của các tham số trong hàm số $y = a\\sin(bx + c) + d$ (biên độ, tần số, chu kỳ $T = 2\\pi/|b|$).",
    ],
    theory: {
      coreConcept:
        "Khi điểm $M$ quay liên tục trên đường tròn lượng giác với góc quay tích lũy $x$ (trên trục hoành $Ox$), tung độ $y_M = \\sin x$ sẽ vẽ nên một đường cong hình sin uốn lượn nhịp nhàng. Cứ sau mỗi chu kỳ $2\\pi$, đồ thị lặp lại nguyên vẹn hình dạng trước đó.",
      formulas: [
        {
          formula: "T = \\frac{2\\pi}{|b|}",
          meaning: "Chu kỳ tuần hoàn của hàm số y = a sin(bx + c) + d",
          conditions: "b \\ne 0",
        },
        {
          formula: "y \\in [d - |a|; \\, d + |a|]",
          meaning: "Tập giá trị của hàm số dao động điều hòa",
        },
      ],
      notes: [
        "Hoành độ trên đồ thị là góc quay tích lũy (không reset về 0 sau mỗi vòng quay).",
        "Lỗi E12: Nhầm lẫn giữa chu kỳ $T = 2\\pi$ của sin/cos với chu kỳ $T = \\pi$ của tan/cot.",
      ],
      miniTip: "Mẹo nhớ: 'Quay tròn sinh ra sóng; Sin và Cos chu kỳ 2 pi, Tan và Cot chu kỳ 1 pi!'",
    },
    workedExample: {
      problemStatement: "Tìm chu kỳ và giá trị lớn nhất, giá trị nhỏ nhất của hàm số $y = 3\\sin(2x) + 1$.",
      steps: [
        {
          stepNumber: 1,
          title: "Xác định chu kỳ T",
          mathExpression: "T = \\frac{2\\pi}{|b|} = \\frac{2\\pi}{2} = \\pi",
          explanation: "Hệ số $b = 2$ làm cho sóng co lại với tần số gấp đôi, chu kỳ giảm một nửa.",
          rationale: "Công thức chu kỳ của hàm lượng giác cơ bản.",
        },
        {
          stepNumber: 2,
          title: "Tìm giá trị lớn nhất và nhỏ nhất",
          mathExpression: "-1 \\le \\sin(2x) \\le 1 \\implies -3 \\le 3\\sin(2x) \\le 3 \\implies -2 \\le y \\le 4",
          explanation: "Giá trị lớn nhất là $y_{\\max} = 4$ khi $\\sin(2x) = 1$; giá trị nhỏ nhất là $y_{\\min} = -2$ khi $\\sin(2x) = -1$.",
          rationale: "Đánh giá biên độ từ tập giá trị cơ bản của hàm sin.",
        },
      ],
      conclusion: "Hàm số có chu kỳ T = pi, giá trị lớn nhất bằng 4 và nhỏ nhất bằng -2.",
    },
    checkpoints: [
      {
        id: "cp-trig4-1",
        question: "Chu kỳ tuần hoàn của hàm số y = cos(x) là bao nhiêu?",
        options: [
          { id: "A", text: "pi", isCorrect: false },
          { id: "B", text: "2 pi", isCorrect: true },
          { id: "C", text: "4 pi", isCorrect: false },
        ],
        explanationCorrect: "Chính xác! Cứ sau đúng một vòng quay $2\\pi$, giá trị cosin lặp lại như cũ.",
        explanationIncorrect: "Hàm số sin và cos có chu kỳ cơ bản là $2\\pi$.",
        socraticHint: "Một vòng tròn đầy đủ bằng bao nhiêu radian?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-trig4-1",
        question: "Khoảng cách giữa hai đỉnh sóng cao nhất liên tiếp của đồ thị $y = \\sin x$ bằng bao nhiêu?",
        options: [
          { id: "A", text: "pi", isCorrect: false },
          { id: "B", text: "2 pi", isCorrect: true },
          { id: "C", text: "pi / 2", isCorrect: false },
        ],
        explanationCorrect: "Rất chuẩn! Khoảng cách giữa hai đỉnh lặp lại chính là một chu kỳ sóng $T = 2\\pi$.",
        explanationIncorrect: "Hai đỉnh cao nhất lặp lại sau đúng một chu kỳ tuần hoàn.",
        errorTag: "E11",
      },
    ],
    simulationRef: {
      moduleId: "trigonometry",
      simulationType: "trigonometry",
      lessonIndex: 3,
      labName: "Mô Phỏng Chiếu Sóng Sin/Cos Thời Gian Thực",
      actionPrompt: "Mở mô phỏng để xem điểm M xoay trên đường tròn đồng thời phóng ra vệt sóng hình sin trên đồ thị bên cạnh.",
    },
  },

  "trig-lesson-5": {
    lessonId: "trig-lesson-5",
    moduleId: "trigonometry",
    order: 5,
    code: "BÀI 5",
    title: "Phương trình lượng giác cơ bản & Lọc nghiệm trong khoảng",
    subtitle: "Nhiệm vụ LG-MH05: Giải sin(x) = -sqrt(2)/2 trên khoảng [-pi; pi]",
    grade: 11,
    estimatedMinutes: 24,
    xpReward: 90,
    objectives: [
      "Giải thành thạo 4 dạng phương trình lượng giác cơ bản: $\\sin x = m$, $\\cos x = m$, $\\tan x = m$, $\\cot x = m$.",
      "Hiểu rõ điều kiện có nghiệm của $\\sin$ và $\\cos$ là $|m| \\le 1$.",
      "Làm chủ kỹ thuật lọc nghiệm thuộc đoạn/khoảng cho trước bằng bất phương trình kép ẩn $k \\in \\mathbb{Z}$.",
    ],
    theory: {
      coreConcept:
        "Phương trình $\\sin x = \\sin \\alpha$ có hai họ nghiệm: $x = \\alpha + k2\\pi$ hoặc $x = \\pi - \\alpha + k2\\pi$ ($k \\in \\mathbb{Z}$). Phương trình $\\cos x = \\cos \\alpha$ có hai họ nghiệm đối xứng: $x = \\pm \\alpha + k2\\pi$ ($k \\in \\mathbb{Z}$). Để tìm nghiệm trong đoạn $[a; b]$, ta kẹp từng họ nghiệm vào bất phương trình $a \\le x_k \\le b$ để tìm các giá trị nguyên $k$.",
      formulas: [
        {
          formula: "\\sin x = \\sin \\alpha \\iff \\begin{cases} x = \\alpha + k2\\pi \\\\ x = \\pi - \\alpha + k2\\pi \\end{cases} \\quad (k \\in \\mathbb{Z})",
          meaning: "Công thức nghiệm của phương trình Sin",
        },
        {
          formula: "\\cos x = \\cos \\alpha \\iff x = \\pm \\alpha + k2\\pi \\quad (k \\in \\mathbb{Z})",
          meaning: "Công thức nghiệm của phương trình Cosin",
        },
      ],
      notes: [
        "Nếu $|m| > 1$, phương trình $\\sin x = m$ hoặc $\\cos x = m$ VÔ NGHIỆM ngay lập tức.",
        "Lỗi E15: Quên họ nghiệm thứ hai ($x = \\pi - \\alpha + k2\\pi$ với Sin hoặc họ dấu trừ với Cos).",
        "Lỗi E16: Nhầm lẫn điều kiện đầu mút khi đề bài yêu cầu khoảng mở $(a; b)$ hay đoạn đóng $[a; b]$.",
      ],
      miniTip: "Mẹo nhớ: 'Sin thì một nghiệm, một bù; Cos thì cộng trừ đối xứng nhau!'",
    },
    workedExample: {
      problemStatement: "Giải phương trình $\\sin x = -\\frac{\\sqrt{2}}{2}$ và tìm tất cả các nghiệm thuộc khoảng $[-\\pi; \\pi]$.",
      steps: [
        {
          stepNumber: 1,
          title: "Xác định họ nghiệm tổng quát",
          mathExpression: "\\sin x = \\sin\\left(-\\frac{\\pi}{4}\\right) \\iff \\begin{cases} x = -\\frac{\\pi}{4} + k2\\pi \\\\ x = \\pi - \\left(-\\frac{\\pi}{4}\\right) + k2\\pi = \\frac{5\\pi}{4} + k2\\pi \\end{cases}",
          explanation: "Phương trình có 2 họ nghiệm tương ứng với hai điểm cắt trên đường tròn lượng giác.",
          rationale: "Công thức nghiệm chuẩn SGK GDPT 2018.",
        },
        {
          stepNumber: 2,
          title: "Lọc nghiệm trong đoạn [-pi; pi] cho họ nghiệm 1",
          mathExpression: "-\\pi \\le -\\frac{\\pi}{4} + k2\\pi \\le \\pi \\iff -\\frac{3}{4} \\le 2k \\le \\frac{5}{4} \\iff -0{,}375 \\le k \\le 0{,}625 \\implies k = 0",
          explanation: "Vì $k \\in \\mathbb{Z}$, ta chọn được nghiệm duy nhất $x_1 = -\\frac{\\pi}{4}$.",
          rationale: "Giải bất phương trình kép tìm số nguyên k.",
        },
        {
          stepNumber: 3,
          title: "Lọc nghiệm trong đoạn [-pi; pi] cho họ nghiệm 2",
          mathExpression: "-\\pi \\le \\frac{5\\pi}{4} + k2\\pi \\le \\pi \\iff -\\frac{9}{4} \\le 2k \\le -\\frac{1}{4} \\implies k = -1 \\implies x_2 = \\frac{5\\pi}{4} - 2\\pi = -\\frac{3\\pi}{4}",
          explanation: "Với $k = -1$, ta thu được nghiệm thứ hai $x_2 = -\\frac{3\\pi}{4}$.",
          rationale: "Kiểm tra đầy đủ cả hai họ nghiệm để không sót nghiệm.",
        },
      ],
      conclusion: "Phương trình có đúng hai nghiệm trong đoạn [-pi; pi] là x1 = -pi/4 và x2 = -3pi/4.",
    },
    checkpoints: [
      {
        id: "cp-trig5-1",
        question: "Phương trình $\\cos x = 1{,}5$ có bao nhiêu nghiệm?",
        options: [
          { id: "A", text: "Vô số nghiệm", isCorrect: false },
          { id: "B", text: "2 nghiệm", isCorrect: false },
          { id: "C", text: "0 nghiệm (Vô nghiệm vì 1,5 > 1)", isCorrect: true },
        ],
        explanationCorrect: "Chính xác! Hàm cosin chỉ nhận giá trị trong đoạn $[-1; 1]$. Giá trị 1,5 vượt ra ngoài bán kính đường tròn đơn vị.",
        explanationIncorrect: "$-1 \\le \\cos x \\le 1$. Không góc nào có cosin bằng 1,5.",
        socraticHint: "Bán kính đường tròn lượng giác bằng bao nhiêu?",
      },
    ],
    reviewQuiz: [
      {
        id: "rq-trig5-1",
        question: "Góc ban đầu $-765^\\circ$ có phải là một nghiệm của phương trình $\\sin x = -\\frac{\\sqrt{2}}{2}$ không?",
        options: [
          { id: "A", text: "Có, vì sin(-765 độ) = -sqrt(2)/2 (ứng với k = -1 ở họ nghiệm 1)", isCorrect: true },
          { id: "B", text: "Không, vì số đo góc quá lớn", isCorrect: false },
        ],
        explanationCorrect: "Rất xuất sắc! $-765^\\circ = -45^\\circ - 720^\\circ = -\\frac{\\pi}{4} - 2 \\times 2\\pi$ chính là nghiệm tổng quát với $k = -2$.",
        explanationIncorrect: "Góc lượng giác không giới hạn số vòng quay, $-765^\\circ$ hoàn toàn là nghiệm hợp lệ.",
        errorTag: "E15",
      },
    ],
    simulationRef: {
      moduleId: "trigonometry",
      simulationType: "trigonometry",
      lessonIndex: 4,
      labName: "Mô Phỏng Họ Nghiệm Trên Đường Tròn Đơn Vị",
      actionPrompt: "Mở mô phỏng để kẻ đường thẳng y = -sqrt(2)/2 cắt đường tròn tại 2 điểm nghiệm đối xứng.",
    },
  },
};

export function getLessonDetailedContent(lessonId: string): DetailedLessonContent | undefined {
  return DETAILED_LESSONS_CONTENT[lessonId];
}
