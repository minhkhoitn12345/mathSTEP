import type { LessonUnit } from "../types/curriculum";
import type { DetailedLessonContent } from "../types/learningPath";

type Topic = {
  title: string; concept: string; formula: string; meaning: string;
  example: string; solution: string; question: string; correct: string; wrong: string;
  errors: string[]; activity: string; labIndex: number;
};

const topics: Topic[] = [
  { title: "Góc có hướng, đơn vị đo và nhiều vòng quay", concept: "Góc dương quay ngược chiều kim đồng hồ, góc âm quay cùng chiều. Các góc hơn kém nhau một bội của 2π có cùng điểm cuối nhưng khác số đo.", formula: "180^\\circ=\\pi\\,\\mathrm{rad};\\quad \\alpha=\\beta+2k\\pi", meaning: "Đổi đơn vị và xác định góc cùng điểm cuối, k là số nguyên.", example: "Tìm góc cùng điểm cuối với −765° trong [0°; 360°).", solution: "−765° + 3·360° = 315°, thuộc góc phần tư IV.", question: "Góc −765° cùng điểm cuối với góc nào?", correct: "315°", wrong: "45°", errors: ["E01", "E02", "E03"], activity: "LG01", labIndex: 0 },
  { title: "Giá trị lượng giác và điểm trên trục tọa độ", concept: "Trên đường tròn đơn vị, M(cos α; sin α). Tan α = sin α / cos α khi cos α ≠ 0; cot α = cos α / sin α khi sin α ≠ 0. Điểm trên trục không thuộc góc phần tư nào.", formula: "M(\\cos\\alpha;\\sin\\alpha),\\quad \\tan\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}", meaning: "Đọc tọa độ và kiểm tra mẫu số trước khi tính.", example: "Tính các giá trị tại α = π/2.", solution: "M(0; 1), sin α = 1, cos α = 0, tan α không xác định và cot α = 0.", question: "Tại α = π/2, tan α bằng bao nhiêu?", correct: "Không xác định", wrong: "0", errors: ["E04", "E05", "E06"], activity: "LG02", labIndex: 1 },
  { title: "Căn cứ hình học của các giá trị đặc biệt", concept: "Dựng tam giác vuông cân để suy ra góc 45°; chia đôi tam giác đều để suy ra góc 30° và 60°. Sau đó dùng tính đối xứng trên đường tròn để xác định dấu.", formula: "\\sin30^\\circ=\\frac12,\\quad\\cos30^\\circ=\\frac{\\sqrt3}{2},\\quad\\sin45^\\circ=\\cos45^\\circ=\\frac{\\sqrt2}{2}", meaning: "Các giá trị đặc biệt xuất phát từ độ dài cạnh tam giác vuông.", example: "Tính cos 60° và tan 45°.", solution: "cos 60° = 1/2 và tan 45° = 1.", question: "cos 60° bằng bao nhiêu?", correct: "1/2", wrong: "√3/2", errors: ["E04"], activity: "LG02", labIndex: 1 },
  { title: "Cung liên kết và đối xứng hình học", concept: "Xác định vị trí hai điểm biểu diễn bằng đối xứng qua trục hoành, trục tung hoặc gốc tọa độ, rồi đọc sin và cos theo tọa độ.", formula: "\\sin(\\pi-\\alpha)=\\sin\\alpha,\\quad\\cos(\\pi-\\alpha)=-\\cos\\alpha", meaning: "Hai điểm ứng với α và π−α đối xứng qua trục tung.", example: "Tính sin 150° và cos 150° từ góc 30°.", solution: "sin 150° = 1/2; cos 150° = −√3/2.", question: "cos(π−α) bằng gì?", correct: "−cos α", wrong: "cos α", errors: ["E07"], activity: "LG04", labIndex: 2 },
  { title: "Công thức cộng, trừ, nhân đôi và hạ bậc", concept: "Công thức cộng không phải phép phân phối. Từ công thức cộng, đặt hai góc bằng nhau để được công thức nhân đôi; biến đổi cos 2α để hạ bậc.", formula: "\\cos(a+b)=\\cos a\\cos b-\\sin a\\sin b;\\quad\\sin2a=2\\sin a\\cos a", meaning: "Công thức cộng và công thức nhân đôi cơ bản.", example: "Tính cos 75° bằng 45° + 30°.", solution: "cos 75° = (√6−√2)/4.", question: "sin 2a bằng gì?", correct: "2 sin a cos a", wrong: "2 sin a", errors: ["E08"], activity: "LG04", labIndex: 2 },
  { title: "Biến đổi tích thành tổng", concept: "Cộng hoặc trừ hai công thức cos(a±b), sin(a±b) để biến tích lượng giác thành tổng. Giữ đúng hệ số 1/2 và dấu của hiệu.", formula: "\\cos a\\cos b=\\frac{\\cos(a+b)+\\cos(a-b)}{2}", meaning: "Công thức tích cos thành tổng.", example: "Biến đổi cos 3x cos x.", solution: "cos 3x cos x = [cos 4x + cos 2x]/2.", question: "Hệ số đứng trước [cos(a+b)+cos(a−b)] là gì?", correct: "1/2", wrong: "2", errors: ["E09"], activity: "LG04", labIndex: 2 },
  { title: "Biến đổi tổng thành tích", concept: "Đặt u=(a+b)/2, v=(a−b)/2 rồi dùng công thức cộng với a=u+v, b=u−v. Đặc biệt chú ý dấu âm của cos a−cos b.", formula: "\\cos a-\\cos b=-2\\sin\\frac{a+b}{2}\\sin\\frac{a-b}{2}", meaning: "Công thức hiệu hai cosin thành tích.", example: "Biến đổi cos 3x − cos x.", solution: "cos 3x − cos x = −2 sin 2x sin x.", question: "Dấu trước 2 trong công thức cos a−cos b là gì?", correct: "Dấu âm", wrong: "Dấu dương", errors: ["E09", "E10"], activity: "LG04", labIndex: 2 },
  { title: "Hàm số sin, cos và tính tuần hoàn", concept: "Sin là hàm lẻ, cos là hàm chẵn; cả hai xác định trên ℝ, nhận giá trị trong [−1;1] và có chu kỳ cơ bản 2π. Muốn xét chẵn lẻ phải kiểm tra miền xác định đối xứng qua 0.", formula: "\\sin(x+2\\pi)=\\sin x,\\quad\\cos(x+2\\pi)=\\cos x", meaning: "Tính tuần hoàn của sin và cos.", example: "Tìm chu kỳ cơ bản của y=sin(2x).", solution: "T = 2π/|2| = π.", question: "Chu kỳ cơ bản của sin x là gì?", correct: "2π", wrong: "π", errors: ["E11", "E12", "E13"], activity: "LG08", labIndex: 3 },
  { title: "Hàm số tan, cot và mô hình điều hòa", concept: "Tan và cot có chu kỳ cơ bản π. Tan không xác định khi cos x=0; cot không xác định khi sin x=0. Với y=A sin(ωx+φ)+d, biên độ là |A|, đường giữa y=d.", formula: "T_{\\tan}=T_{\\cot}=\\pi;\\quad T_{\\sin(\\omega x)}=\\frac{2\\pi}{|\\omega|}", meaning: "Chu kỳ cơ bản và điều kiện xác định.", example: "Tìm biên độ và chu kỳ của y=−3sin(2x)+1.", solution: "Biên độ 3, chu kỳ π, đường giữa y=1, tập giá trị [−2;4].", question: "Biên độ của −3sin(2x)+1 là gì?", correct: "3", wrong: "−3", errors: ["E06", "E12", "E14"], activity: "LG08", labIndex: 3 },
  { title: "Tính biến thiên và đồ thị lượng giác", concept: "Trên mỗi khoảng xác định, tan tăng còn cot giảm. Đồ thị sin và cos kéo dài vô hạn theo chu kỳ; đồ thị tan và cot gồm các nhánh ngăn bởi tiệm cận đứng.", formula: "\\tan x\\text{ tăng trên }(-\\pi/2+k\\pi;\\pi/2+k\\pi)", meaning: "Mỗi nhánh của đồ thị tang tăng nghiêm ngặt.", example: "Xác định tiệm cận đứng của y=tan x.", solution: "x=π/2+kπ với k∈ℤ.", question: "tan x biến thiên thế nào trên từng khoảng xác định?", correct: "Đồng biến", wrong: "Nghịch biến", errors: ["E11", "E12"], activity: "LG08", labIndex: 3 },
  { title: "Phương trình sin và cos cơ bản", concept: "Sin x=m hoặc cos x=m chỉ có nghiệm khi |m|≤1. Từ một góc α thỏa phương trình, viết đủ các họ nghiệm rồi xét trường hợp hai họ trùng nhau.", formula: "\\sin x=\\sin\\alpha\\iff x=\\alpha+2k\\pi\\;\\text{ hoặc }\\;x=\\pi-\\alpha+2k\\pi", meaning: "Hai họ nghiệm của phương trình sin, k∈ℤ.", example: "Giải sin x=1/2.", solution: "x=π/6+2kπ hoặc x=5π/6+2kπ, k∈ℤ.", question: "sin x=3/2 có bao nhiêu nghiệm?", correct: "Vô nghiệm", wrong: "Hai họ nghiệm", errors: ["E15"], activity: "LG11", labIndex: 4 },
  { title: "Phương trình tan, cot và lọc nghiệm", concept: "Tan x=m và cot x=m có một họ nghiệm với chu kỳ π. Trước khi chia hoặc rút gọn phải xét điều kiện xác định và các trường hợp nhân tử bằng 0.", formula: "\\tan x=\\tan\\alpha\\iff x=\\alpha+k\\pi;\\quad\\cot x=\\cot\\alpha\\iff x=\\alpha+k\\pi", meaning: "Nghiệm tổng quát với k∈ℤ và điều kiện xác định tương ứng.", example: "Giải tan x=1 trên [0;2π).", solution: "x=π/4+kπ; lọc trên [0;2π) được π/4 và 5π/4.", question: "tan x=1 có chu kỳ nghiệm nào?", correct: "π", wrong: "2π", errors: ["E15", "E16"], activity: "LG11", labIndex: 4 },
  { title: "Vận dụng thực tiễn và mô hình hóa", concept: "Mô hình tuần hoàn cần xác định mốc thời gian, vị trí đầu, chiều chuyển động, biên độ, đường giữa và chu kỳ. Các tham số phải mang đơn vị đo phù hợp với tình huống.", formula: "h(t)=d-R\\cos\\left(\\frac{2\\pi}{T}t\\right)", meaning: "Độ cao của khách bắt đầu ở đáy đu quay bán kính R, tâm cao d, chu kỳ T.", example: "Đu quay có R=10 m, d=12 m, T=20 phút. Tính độ cao lúc lên và sau 10 phút.", solution: "h(0)=2 m và h(10)=22 m.", question: "Sau nửa chu kỳ, khách bắt đầu ở đáy đến đâu?", correct: "Đỉnh cao nhất", wrong: "Trở lại đáy", errors: ["E14", "E15"], activity: "LG08", labIndex: 3 },
];

const additionalFormulas: Record<number, { formula: string; meaning: string; conditions?: string }[]> = {
  1: [{ formula: "\\cot\\alpha=\\frac{\\cos\\alpha}{\\sin\\alpha}", meaning: "Côtang là tỉ số hoành độ trên tung độ.", conditions: "sin α khác 0." }],
  3: [
    { formula: "\\sin(-a)=-\\sin a,\\quad\\cos(-a)=\\cos a", meaning: "Hai điểm đối xứng qua trục hoành." },
    { formula: "\\sin(\\pi+a)=-\\sin a,\\quad\\cos(\\pi+a)=-\\cos a", meaning: "Hai điểm đối xứng qua gốc tọa độ." },
    { formula: "\\sin(\\frac\\pi2-a)=\\cos a,\\quad\\cos(\\frac\\pi2-a)=\\sin a", meaning: "Hai giá trị đổi vai trò ở hai góc phụ nhau." },
  ],
  4: [
    { formula: "\\sin(a\\pm b)=\\sin a\\cos b\\pm\\cos a\\sin b", meaning: "Công thức cộng và trừ của sin." },
    { formula: "\\cos(a-b)=\\cos a\\cos b+\\sin a\\sin b", meaning: "Công thức hiệu của cos." },
    { formula: "\\cos2a=\\cos^2a-\\sin^2a=1-2\\sin^2a=2\\cos^2a-1", meaning: "Ba dạng của công thức nhân đôi cos." },
    { formula: "\\sin^2a=\\frac{1-\\cos2a}{2},\\quad\\cos^2a=\\frac{1+\\cos2a}{2}", meaning: "Công thức hạ bậc." },
  ],
  5: [
    { formula: "\\sin a\\sin b=\\frac{\\cos(a-b)-\\cos(a+b)}2", meaning: "Biến tích sin thành hiệu cos." },
    { formula: "\\sin a\\cos b=\\frac{\\sin(a+b)+\\sin(a-b)}2", meaning: "Biến tích sin cos thành tổng sin." },
  ],
  6: [
    { formula: "\\cos a+\\cos b=2\\cos\\frac{a+b}2\\cos\\frac{a-b}2", meaning: "Tổng hai cos thành tích." },
    { formula: "\\sin a+\\sin b=2\\sin\\frac{a+b}2\\cos\\frac{a-b}2", meaning: "Tổng hai sin thành tích." },
    { formula: "\\sin a-\\sin b=2\\cos\\frac{a+b}2\\sin\\frac{a-b}2", meaning: "Hiệu hai sin thành tích." },
  ],
  8: [{ formula: "D_{\\tan}=\\mathbb R\\setminus\\{\\frac\\pi2+k\\pi\\},\\quad D_{\\cot}=\\mathbb R\\setminus\\{k\\pi\\}", meaning: "Các điểm không xác định tạo tiệm cận đứng.", conditions: "k là số nguyên." }],
  10: [{ formula: "\\cos x=\\cos a\\iff x=\\pm a+2k\\pi", meaning: "Hai họ nghiệm của phương trình cos; ở biên có thể trùng họ.", conditions: "k là số nguyên." }],
  11: [{ formula: "\\cos x=0\\Rightarrow\\tan x\\text{ không xác định};\\quad\\sin x=0\\Rightarrow\\cot x\\text{ không xác định}", meaning: "Không chia hai vế cho biểu thức có thể bằng 0." }],
};

const errorGuidance: Record<string, string> = {
  E01: "Góc âm quay cùng chiều kim đồng hồ; góc dương quay ngược chiều.",
  E02: "Hai góc cùng điểm cuối có thể khác nhau một số nguyên vòng quay.",
  E03: "Đổi độ sang radian phải nhân với π/180.",
  E04: "Cos là hoành độ, sin là tung độ của điểm trên đường tròn đơn vị.",
  E05: "Điểm nằm trên trục không thuộc góc phần tư nào.",
  E06: "Mẫu số bằng 0 làm tan hoặc cot không xác định, không phải bằng 0.",
  E07: "Xác định trục đối xứng rồi mới kết luận dấu của giá trị lượng giác.",
  E08: "Không phân phối sin hoặc cos qua phép cộng; dùng đúng công thức cộng.",
  E09: "Công thức tích và tổng luôn cần kiểm tra hệ số 2 hoặc 1/2.",
  E10: "Hiệu cos a − cos b có dấu âm ở đầu công thức.",
  E11: "Một cặp điểm trùng không đủ chứng minh cả hàm tuần hoàn.",
  E12: "Phân biệt một chu kỳ với chu kỳ dương nhỏ nhất.",
  E13: "Muốn xét chẵn lẻ, tập xác định phải đối xứng qua gốc 0.",
  E14: "Biên độ là |A|; tập giá trị còn phụ thuộc đường giữa.",
  E15: "Lọc nghiệm phải kiểm tra đầu mút và các họ nghiệm trùng nhau.",
  E16: "Trước khi chia cho sin hoặc cos, phải xét trường hợp chúng bằng 0.",
};

export const TRIG_LESSONS: LessonUnit[] = topics.map((t, i) => ({
  id: `trig-lesson-${i + 1}`, moduleId: "trigonometry", order: i + 1,
  code: `LG${String(i + 1).padStart(2, "0")}`, title: t.title,
  subtitle: `Chủ đề LG${String(i + 1).padStart(2, "0")} · ${t.meaning}`,
  description: t.concept, grade: 11,
  difficulty: i < 4 ? "Cơ bản" : i < 10 ? "Thông hiểu" : "Vận dụng",
  errorCodes: t.errors,
  steps: [
    { stepNumber: 1, title: "Đọc nhiệm vụ", instruction: t.example, coreConcepts: [t.concept], socraticQuestions: ["Đề bài cho biết những gì?"] },
    { stepNumber: 2, title: "Quan sát mô hình", instruction: `Quan sát ${t.activity} và xác định các đại lượng liên quan.`, coreConcepts: [t.meaning], socraticQuestions: ["Em nhận ra yếu tố nào thay đổi trên hình?"] },
    { stepNumber: 3, title: "Đưa ra dự đoán", instruction: "Ghi dự đoán của em trước khi kéo góc hoặc đổi tham số.", coreConcepts: [t.meaning], socraticQuestions: [t.question] },
    { stepNumber: 4, title: "Thao tác tương tác", instruction: "Thay đổi góc hoặc tham số trong mô phỏng và theo dõi kết quả.", coreConcepts: [t.concept], socraticQuestions: ["Kết quả có thay đổi như dự đoán không?"] },
    { stepNumber: 5, title: "Ghi nhận quan sát", instruction: "Ghi lại một trường hợp đúng và một trường hợp cần kiểm tra thêm.", coreConcepts: [t.meaning], socraticQuestions: ["Các giá trị nào giữ nguyên?"] },
    { stepNumber: 6, title: "Giải thích bằng toán học", instruction: t.concept, coreConcepts: [t.meaning], keyFormulas: [t.formula], socraticQuestions: ["Công thức nào giải thích điều em thấy?"] },
    { stepNumber: 7, title: "Kiểm chứng", instruction: `Tự giải ${t.example} rồi mới đối chiếu kết quả.`, coreConcepts: [t.meaning], socraticQuestions: [t.question] },
    { stepNumber: 8, title: "Tổng kết", instruction: `Kết luận sau khi kiểm chứng: ${t.solution}`, coreConcepts: [t.meaning], socraticQuestions: ["Em sẽ kiểm tra điều kiện nào khi gặp bài tương tự?"] },
  ],
}));

export const TRIG_DETAILS: Record<string, DetailedLessonContent> = Object.fromEntries(topics.map((t, i) => {
  const lesson = TRIG_LESSONS[i];
  const item: DetailedLessonContent = {
    lessonId: lesson.id, moduleId: "trigonometry", order: lesson.order, code: lesson.code,
    title: t.title, subtitle: t.meaning, grade: 11, estimatedMinutes: 20, xpReward: [60, 70, 80, 80, 90][i] ?? 60,
    objectives: [t.concept, `Giải thích và vận dụng: ${t.meaning}`],
    theory: { coreConcept: t.concept, formulas: [{ formula: t.formula, meaning: t.meaning }, ...(additionalFormulas[i] ?? [])], notes: t.errors.map(code => errorGuidance[code]), miniTip: t.meaning },
    workedExample: { problemStatement: t.example, steps: [{ stepNumber: 1, title: "Lập luận từ kiến thức vừa học", explanation: t.solution, rationale: t.concept }], conclusion: t.solution },
    checkpoints: [{ id: `cp-trig-${i + 1}`, question: t.question, options: [{ id: "A", text: t.correct, isCorrect: true }, { id: "B", text: t.wrong, isCorrect: false }], explanationCorrect: t.solution, explanationIncorrect: t.concept, socraticHint: t.meaning }],
    reviewQuiz: [{ id: `rq-trig-${i + 1}`, level: "basic", question: t.question, options: [{ id: "A", text: t.correct, isCorrect: true }, { id: "B", text: t.wrong, isCorrect: false }], explanationCorrect: t.solution, explanationIncorrect: t.concept, errorTag: t.errors[0] }],
    simulationRef: { moduleId: "trigonometry", simulationType: "trigonometry", lessonIndex: t.labIndex, labName: `Mô phỏng ${t.activity}`, actionPrompt: `Khám phá ${t.title.toLowerCase()} trên mô phỏng và trả lời câu hỏi gợi mở.` },
  };
  return [lesson.id, item];
}));

export const TRIG_ACTIVITIES = topics.map(t => t.activity);
export const TRIG_GUIDED_INDICES = topics.map(t => t.labIndex);

export const TRIG_GUIDED_STEPS = topics.map((t, i) => {
  const other = topics[(i + 3) % topics.length];
  const questions = [
    { title: "1. Dự đoán", prompt: t.question, choices: [t.wrong, t.correct], answer: 1, hint: t.meaning, explanation: t.solution },
    { title: "2. Chọn căn cứ", prompt: `Kiến thức nào giúp em giải bài: ${t.example}`, choices: [other.concept, t.concept], answer: 1, hint: `Hãy đọc lại phần lý thuyết của ${TRIG_LESSONS[i].code}.`, explanation: t.concept },
    { title: "3. Chọn công thức", prompt: "Công thức nào phù hợp với chủ đề đang học?", choices: [`$${topics[(i + 1) % topics.length].formula}$`, `$${t.formula}$`], answer: 1, hint: t.meaning, explanation: t.meaning },
    { title: "4. Thao tác và quan sát", prompt: `Sau khi thao tác trên mô phỏng, kết quả của bài toán “${t.example}” là gì?`, choices: [t.wrong, t.solution], answer: 1, hint: `Quan sát mô hình, rồi dùng công thức vừa chọn. ${t.meaning}`, explanation: t.solution },
    { title: "5. Giải thích và tổng kết", prompt: "Nhận xét nào giải thích đúng kết quả vừa quan sát?", choices: [other.concept, t.concept], answer: 1, hint: `Đối chiếu kết quả với ${TRIG_LESSONS[i].code} trong phần lý thuyết.`, explanation: t.concept },
  ];
  return questions.map((question, step) => (i + step) % 2 === 0
    ? question
    : { ...question, choices: [question.choices[1], question.choices[0]], answer: 0 });
});
