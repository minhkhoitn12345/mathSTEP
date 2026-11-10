"use client";

import { TRIG_ACTIVITIES, TRIG_GUIDED_INDICES } from "@/app/data/trigonometryLessons";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  Compass,
  ArrowLeft,
  HelpCircle,
  Activity,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import { MathFormattedText } from "@/app/components/KatexMath";

interface TrigonometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
  initialLessonIndex?: number;
  embedded?: boolean;
}

type GuidedQuestion = { title: string; prompt: string; choices: string[]; answer: number; explanation: string };

const GUIDED_STEPS: GuidedQuestion[][] = [
  [
    { title: "Quy ước chiều quay", prompt: "Trên đường tròn lượng giác, góc âm được tạo bởi chiều quay nào?", choices: ["Ngược chiều kim đồng hồ", "Cùng chiều kim đồng hồ", "Không xác định chiều quay"], answer: 1, explanation: "Chiều dương ngược chiều kim đồng hồ; vì vậy góc âm quay cùng chiều kim đồng hồ." },
    { title: "Tách số vòng", prompt: "Góc $-765^\\circ$ gồm bao nhiêu vòng âm trọn vẹn và phần góc còn lại?", choices: ["$-2$ vòng và $-45^\\circ$", "$-1$ vòng và $-405^\\circ$", "$-3$ vòng và $315^\\circ$"], answer: 0, explanation: "$-765^\\circ = -2\\cdot360^\\circ-45^\\circ$. Phần quay còn lại sau hai vòng là $-45^\\circ$." },
    { title: "Tìm góc cùng điểm cuối", prompt: "Góc trong khoảng $[0^\\circ;360^\\circ)$ có cùng điểm cuối với $-765^\\circ$ là góc nào?", choices: ["$45^\\circ$", "$225^\\circ$", "$315^\\circ$"], answer: 2, explanation: "$-765^\\circ+3\\cdot360^\\circ=315^\\circ$. Hai góc sai khác một bội của $360^\\circ$ nên cùng điểm cuối." },
    { title: "Xác định góc phần tư", prompt: "Điểm cuối ứng với $315^\\circ$ thuộc góc phần tư nào?", choices: ["I", "III", "IV"], answer: 2, explanation: "$315^\\circ$ nằm giữa $270^\\circ$ và $360^\\circ$, nên điểm cuối thuộc góc phần tư IV." },
    { title: "Đọc tọa độ điểm", prompt: "Ở góc phần tư IV, dấu của hoành độ $\\cos\\alpha$ và tung độ $\\sin\\alpha$ lần lượt là gì?", choices: ["Dương, âm", "Âm, dương", "Âm, âm"], answer: 0, explanation: "Trên đường tròn đơn vị, $M(\\cos\\alpha;\\sin\\alpha)$. Góc phần tư IV có hoành độ dương và tung độ âm." },
    { title: "Đổi sang radian", prompt: "Đổi $-765^\\circ$ sang radian được kết quả nào?", choices: ["$-17\\pi/4$", "$-15\\pi/4$", "$17\\pi/4$"], answer: 0, explanation: "$-765^\\circ\\cdot\\pi/180^\\circ=-17\\pi/4$ rad." },
    { title: "Kết luận về điểm cuối", prompt: "Hai góc có cùng điểm biểu diễn trên đường tròn lượng giác thì luôn có số đo bằng nhau không?", choices: ["Có, vì cùng một điểm", "Không; hiệu hai góc là một bội của $2\\pi$ rad", "Không; tổng hai góc luôn bằng $2\\pi$ rad"], answer: 1, explanation: "Các góc cùng điểm cuối có dạng $\\alpha+2k\\pi$ (hay $\\alpha+360^\\circ k$), với $k\\in\\mathbb Z$. Số đo có thể khác nhau." },
  ],
  [
    { title: "Đọc tọa độ trên đường tròn", prompt: "Với điểm $M$ trên đường tròn đơn vị, $\\cos\\alpha$ là tọa độ nào của $M$?", choices: ["Hoành độ", "Tung độ", "Độ dài bán kính"], answer: 0, explanation: "$M(\\cos\\alpha;\\sin\\alpha)$: cos ứng với hoành độ, sin ứng với tung độ." },
    { title: "Liên hệ tung độ", prompt: "$\\sin\\alpha$ được đọc trên trục nào của hình?", choices: ["Trục hoành", "Trục tung", "Đường thẳng tiếp tuyến $x=1$"], answer: 1, explanation: "$\\sin\\alpha$ là tung độ của điểm $M$, nên được đọc theo phương trục tung." },
    { title: "Tính tan", prompt: "Khi $\\cos\\alpha\\ne0$, công thức xác định $\\tan\\alpha$ là gì?", choices: ["$\\sin\\alpha/\\cos\\alpha$", "$\\cos\\alpha/\\sin\\alpha$", "$\\sin\\alpha+\\cos\\alpha$"], answer: 0, explanation: "$\\tan\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}$ khi $\\cos\\alpha\\ne0$. Trên hình, đây là tung độ giao điểm của đường thẳng $OM$ với tiếp tuyến $x=1$." },
    { title: "Tính cot", prompt: "Khi $\\sin\\alpha\\ne0$, công thức xác định $\\cot\\alpha$ là gì?", choices: ["$\\sin\\alpha/\\cos\\alpha$", "$\\cos\\alpha/\\sin\\alpha$", "$1/(\\sin\\alpha+\\cos\\alpha)$"], answer: 1, explanation: "$\\cot\\alpha=\\frac{\\cos\\alpha}{\\sin\\alpha}$ khi $\\sin\\alpha\\ne0$. Trên hình, đọc hoành độ giao điểm đường thẳng $OM$ với tiếp tuyến $y=1$." },
    { title: "Nhận biết tan không xác định", prompt: "Tại góc $90^\\circ$, vì sao $\\tan\\alpha$ không xác định?", choices: ["Vì $\\cos90^\\circ=0$ ở mẫu", "Vì $\\sin90^\\circ=0$ ở mẫu", "Vì cả sin và cos đều bằng 0"], answer: 0, explanation: "$\\tan\\alpha=\\sin\\alpha/\\cos\\alpha$. Tại $90^\\circ$, cos bằng 0 nên phép chia không thực hiện được." },
    { title: "Nhận biết cot không xác định", prompt: "Tại góc $0^\\circ$, vì sao $\\cot\\alpha$ không xác định?", choices: ["Vì $\\cos0^\\circ=0$", "Vì $\\sin0^\\circ=0$ ở mẫu", "Vì $\\cot0^\\circ=0$"], answer: 1, explanation: "$\\cot\\alpha=\\cos\\alpha/\\sin\\alpha$. Tại $0^\\circ$, sin bằng 0; cot không xác định, không phải bằng 0." },
    { title: "Phân biệt giá trị 0", prompt: "Tại $90^\\circ$, cặp giá trị $(\\tan\\alpha;\\cot\\alpha)$ là gì?", choices: ["$(\\text{không xác định};0)$", "$(0;\\text{không xác định})$", "$(1;1)$"], answer: 0, explanation: "Tại $90^\\circ$, tan không xác định vì cos bằng 0; cot bằng 0 vì cos bằng 0 còn sin bằng 1." },
  ],
  [
    { title: "Cung bù", prompt: "Hai điểm ứng với $\\alpha$ và $\\pi-\\alpha$ đối xứng nhau qua trục nào?", choices: ["Trục hoành", "Trục tung", "Gốc tọa độ"], answer: 1, explanation: "Phép đối xứng qua trục tung đổi dấu hoành độ, giữ nguyên tung độ: cos đổi dấu, sin giữ nguyên." },
    { title: "Cung đối", prompt: "Khi thay $\\alpha$ bằng $-\\alpha$, tọa độ nào đổi dấu?", choices: ["Hoành độ cos", "Tung độ sin", "Cả hai tọa độ"], answer: 1, explanation: "Hai điểm đối xứng qua trục hoành có cùng hoành độ và tung độ đối nhau: cos chẵn, sin lẻ." },
    { title: "Nhận diện công thức sai", prompt: "Đẳng thức nào sau đây không đúng với mọi $a,b$?", choices: ["$\\sin(a+b)=\\sin a+\\sin b$", "$\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b$", "$\\cos(2a)=\\cos^2a-\\sin^2a$"], answer: 0, explanation: "Sin của tổng không bằng tổng các sin. Công thức đúng là $\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b$." },
    { title: "Chọn công thức nhân đôi", prompt: "Công thức nhân đôi đúng của sin là gì?", choices: ["$\\sin2a=2\\sin a\\cos a$", "$\\sin2a=\\sin^2a+\\cos^2a$", "$\\sin2a=2\\sin a$"], answer: 0, explanation: "Từ công thức cộng, $\\sin(a+a)=\\sin a\\cos a+\\cos a\\sin a=2\\sin a\\cos a$." },
    { title: "Dự đoán dấu", prompt: "Với góc đang xét ở góc phần tư IV, dấu của $\\sin\\alpha\\cos\\alpha$ là gì?", choices: ["Dương", "Âm", "Bằng 0"], answer: 1, explanation: "Góc phần tư IV có sin âm và cos dương nên tích sin cos âm." },
    { title: "Đối chiếu trên hình", prompt: "Điểm ứng với $2\\alpha$ trên đường tròn được tính từ tọa độ $M(\\cos\\alpha;\\sin\\alpha)$ bằng công thức nào?", choices: ["$(\\cos^2\\alpha-\\sin^2\\alpha;2\\sin\\alpha\\cos\\alpha)$", "$(2\\cos\\alpha;2\\sin\\alpha)$", "$(\\sin\\alpha;\\cos\\alpha)$"], answer: 0, explanation: "Tọa độ điểm góc $2\\alpha$ là $(\\cos2\\alpha;\\sin2\\alpha)$, dùng hai công thức nhân đôi để tính." },
    { title: "Rút ra kết luận", prompt: "Vì sao hình học đường tròn giúp kiểm tra công thức lượng giác?", choices: ["Vì cùng một điểm $2\\alpha$ cho cả tọa độ tính theo công thức và tọa độ đọc trên hình", "Vì mọi góc đều có sin bằng cos", "Vì hình vẽ thay thế được lập luận"], answer: 0, explanation: "Hình giúp đối chiếu dự đoán với tọa độ, nhưng kết luận tổng quát vẫn cần dựa vào định nghĩa và phép biến đổi đại số." },
  ],
  [
    { title: "Đọc giá trị theo thời gian", prompt: "Khi điểm $M$ quay đều trên đường tròn đơn vị, tung độ của $M$ tạo ra đồ thị nào?", choices: ["$y=\\sin x$", "$y=\\tan x$", "$y=x^2$"], answer: 0, explanation: "Tung độ của điểm trên đường tròn là $\\sin x$. Khi góc tăng đều, giá trị này tạo thành đồ thị hình sin." },
    { title: "Nhận ra tính tuần hoàn", prompt: "Sau khi góc tăng thêm $2\\pi$, điểm trên đường tròn và giá trị sin thay đổi thế nào?", choices: ["Trở về vị trí cũ, giá trị lặp lại", "Điểm dừng lại ở $2\\pi$", "Giá trị tăng thêm 1"], answer: 0, explanation: "Quay thêm một vòng $2\\pi$ đưa điểm về vị trí cũ, nên $\\sin(x+2\\pi)=\\sin x$." },
    { title: "Tìm chu kỳ cơ bản", prompt: "Khoảng cách theo trục hoành giữa hai đỉnh liên tiếp của $y=\\sin x$ là bao nhiêu?", choices: ["$\\pi$", "$2\\pi$", "$4\\pi$"], answer: 1, explanation: "Hai đỉnh liên tiếp cách nhau đúng một vòng quay, tức $2\\pi$. Đây là chu kỳ cơ bản của sin và cos." },
    { title: "Đọc biên độ", prompt: "Với $y=a\\sin(bx+c)+d$, độ lệch lớn nhất so với đường trung bình $y=d$ bằng gì?", choices: ["$|a|$", "$|b|$", "$|c|$"], answer: 0, explanation: "Biên độ là $|a|$; đồ thị nằm trong đoạn $[d-|a|;d+|a|]$." },
    { title: "Tìm chu kỳ sau biến đổi", prompt: "Với $y=a\\sin(bx+c)+d$, chu kỳ là công thức nào khi $b\\ne0$?", choices: ["$2\\pi/|b|$", "$2\\pi|b|$", "$|a|+|d|$"], answer: 0, explanation: "Hệ số $b$ làm co giãn theo phương ngang, nên chu kỳ mới là $T=2\\pi/|b|$." },
    { title: "Đọc dịch chuyển", prompt: "Trong $y=a\\sin(bx+c)+d$, tham số $d$ làm đồ thị thay đổi thế nào?", choices: ["Tịnh tiến lên hoặc xuống", "Thay đổi chu kỳ", "Đổi sin thành cos"], answer: 0, explanation: "$d$ tịnh tiến đồ thị theo phương thẳng đứng; đường trung bình trở thành $y=d$." },
    { title: "Hiểu miền kéo dài", prompt: "Vì sao đồ thị sin/cos không có điểm kết thúc ở hai mép khung mô phỏng?", choices: ["Hàm số xác định với mọi số thực và các chu kỳ tiếp tục lặp", "Đồ thị chỉ có nghĩa trong khung đang thấy", "Sau $2\\pi$ hàm số không xác định"], answer: 0, explanation: "Miền xác định của sin và cos là $\\mathbb R$. Khung chỉ là cửa sổ quan sát; đồ thị tiếp tục tuần hoàn về cả hai phía." },
  ],
  [
    { title: "Đọc đường thẳng ngang", prompt: "Phương trình $\\sin x=m$ được biểu diễn trên đồ thị bằng giao điểm với đường nào?", choices: ["$y=m$", "$x=m$", "$y=x+m$"], answer: 0, explanation: "Ta tìm giao điểm của đồ thị $y=\\sin x$ với đường thẳng ngang $y=m$." },
    { title: "Kiểm tra miền giá trị", prompt: "Để $\\sin x=m$ có nghiệm thực, m phải thỏa điều kiện nào?", choices: ["$m\\ge1$", "$-1\\le m\\le1$", "$m\\ne0$"], answer: 1, explanation: "Giá trị của sin luôn thuộc $[-1;1]$, nên ngoài đoạn này phương trình vô nghiệm." },
    { title: "Đếm giao điểm", prompt: "Khi $-1<m<1$, một đường thẳng $y=m$ cắt đồ thị sin trong mỗi chu kỳ như thế nào?", choices: ["Hai giao điểm", "Một giao điểm", "Không có giao điểm"], answer: 0, explanation: "Trong một chu kỳ, đường thẳng ngang ở giữa hai giá trị cực trị cắt đồ thị sin tại hai điểm." },
    { title: "Đọc nghiệm trên đường tròn", prompt: "Trên đường tròn đơn vị, phương trình $\\sin x=m$ tương ứng với điều kiện nào?", choices: ["Tung độ điểm biểu diễn bằng m", "Hoành độ điểm biểu diễn bằng m", "Bán kính bằng m"], answer: 0, explanation: "Sin là tung độ, nên nghiệm là các góc có điểm biểu diễn nằm trên đường thẳng ngang $y=m$." },
    { title: "Viết họ nghiệm", prompt: "Vì sao nghiệm của phương trình lượng giác cơ bản thường có thêm $2k\\pi$?", choices: ["Vì sin lặp lại sau mỗi chu kỳ $2\\pi$", "Vì góc chỉ được phép lớn hơn $2\\pi$", "Vì $k$ là hệ số của sin"], answer: 0, explanation: "Mỗi nghiệm trong một chu kỳ sinh ra cả họ nghiệm bằng cách cộng $2k\\pi$, với $k\\in\\mathbb Z$." },
    { title: "Lọc nghiệm", prompt: "Khi đề yêu cầu nghiệm trong $[-\\pi;\\pi]$, cần làm gì sau khi tìm họ nghiệm?", choices: ["Chọn các nghiệm thuộc đoạn đã cho, kể cả hai đầu mút", "Chỉ giữ nghiệm dương", "Bỏ tất cả nghiệm có chứa k"], answer: 0, explanation: "Thay các giá trị nguyên k phù hợp vào họ nghiệm rồi giữ đúng những giá trị thuộc đoạn, lưu ý hai đầu mút đều được lấy." },
    { title: "Kết luận từ hình", prompt: "Mỗi giao điểm của $y=\\sin x$ và $y=m$ cho biết điều gì?", choices: ["Một nghiệm x của phương trình $\\sin x=m$", "Một nghiệm y của phương trình", "Một điểm không thuộc đồ thị"], answer: 0, explanation: "Hoành độ của mỗi giao điểm chính là một nghiệm x. Sau đó mới lọc theo khoảng đề bài yêu cầu." },
  ],
];

export function TrigonometryLab({
  onBackToHome,
  onOpenSocraticDrawer,
  initialLessonIndex = 0,
  embedded = false,
}: TrigonometryLabProps) {
  const moduleConfig = CORE_3_MODULES[2]; // Module 3
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(initialLessonIndex);

  React.useEffect(() => {
    if (typeof initialLessonIndex === "number" && initialLessonIndex >= 0) {
      setSelectedLessonIndex(initialLessonIndex);
    }
  }, [initialLessonIndex]);

  const currentLesson: LessonUnit = moduleConfig.lessons[selectedLessonIndex] || moduleConfig.lessons[0];
  const guidedLessonIndex = TRIG_GUIDED_INDICES[selectedLessonIndex] ?? 0;

  // Core angle in degrees (Defaults to -765° from Task LG-MH01)
  const [angleDeg, setAngleDeg] = useState<number>(-765);
  const [waveMode, setWaveMode] = useState<"sin" | "cos" | "tan" | "cot">("sin");
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedChoice, setGuidedChoice] = useState<number | null>(null);
  const [guidedResultShown, setGuidedResultShown] = useState(false);

  // Lesson 3: Reflection toggles
  const [showSupplementary, setShowSupplementary] = useState<boolean>(true); // Cung bù (pi - x)
  const [showOpposite, setShowOpposite] = useState<boolean>(false); // Cung đối (-x)
  const [showDoubleAngle, setShowDoubleAngle] = useState<boolean>(true); // 2a

  // Lesson 4: Wave transformation parameters: y = a * sin(b * x + c) + d
  const [ampA, setAmpA] = useState<number>(1.0);
  const [freqB, setFreqB] = useState<number>(1.0);
  const [phaseC, setPhaseC] = useState<number>(0);
  const [shiftD, setShiftD] = useState<number>(0);

  // Lesson 5: Equation parameter m for sin(x) = m on [-pi, pi]
  const [eqM, setEqM] = useState<number>(-Math.SQRT1_2); // -sqrt(2)/2 ~ -0.7071

  // SVG Unit Circle dimensions
  const cSvgW = 340;
  const cSvgH = 340;
  const cX = cSvgW / 2;
  const cY = cSvgH / 2;
  const cR = 115;
  const circleSvgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingM, setIsDraggingM] = useState(false);

  // Angle math & properties
  const angleRad = (angleDeg * Math.PI) / 180;
  const repAngleDeg = ((angleDeg % 360) + 360) % 360;
  const _repAngleRad = (repAngleDeg * Math.PI) / 180;

  // Complete turns k
  const _completeTurns = Math.floor(Math.abs(angleDeg) / 360) * (angleDeg < 0 ? -1 : 1);

  // Values on Unit Circle
  const cosVal = Math.cos(angleRad);
  const sinVal = Math.sin(angleRad);
  const tanVal = Math.abs(cosVal) > 1e-4 ? sinVal / cosVal : null;
  const cotVal = Math.abs(sinVal) > 1e-4 ? cosVal / sinVal : null;

  // Screen coords of M on Circle
  const mScreenX = cX + cR * cosVal;
  const mScreenY = cY - cR * sinVal;

  // Supplementary point M' (pi - a): cos' = -cos, sin' = sin
  const suppCos = -cosVal;
  const suppSin = sinVal;
  const suppScreenX = cX + cR * suppCos;
  const suppScreenY = cY - cR * suppSin;

  // Opposite point M'' (-a): cos'' = cos, sin'' = -sin
  const oppCos = cosVal;
  const oppSin = -sinVal;
  const oppScreenX = cX + cR * oppCos;
  const oppScreenY = cY - cR * oppSin;

  // Double angle: 2a
  const sin2a = 2 * sinVal * cosVal;
  const cos2a = cosVal * cosVal - sinVal * sinVal;
  const doubleScreenX = cX + cR * cos2a;
  const doubleScreenY = cY - cR * sin2a;

  // Tangent and Cotangent projection screen coords
  const tanScreenY = tanVal !== null ? cY - cR * tanVal : null;
  const cotScreenX = cotVal !== null ? cX + cR * cotVal : null;

  // Quadrant detection
  const getQuadrant = () => {
    if (Math.abs(sinVal) < 1e-4 || Math.abs(cosVal) < 1e-4) return "Trục tọa độ";
    if (cosVal > 0 && sinVal > 0) return "Góc phần tư I";
    if (cosVal < 0 && sinVal > 0) return "Góc phần tư II";
    if (cosVal < 0 && sinVal < 0) return "Góc phần tư III";
    return "Góc phần tư IV";
  };
  const activeQuadrant = getQuadrant();

  // Spiral Path for Lesson 1: Angle Multi-Turn Visualization
  const spiralPath = useMemo(() => {
    if (selectedLessonIndex !== 0) return "";
    let d = "";
    const isNegative = angleDeg < 0;
    const totalRad = Math.abs(angleRad);
    const stepRad = 0.08;
    const initialR = 25;
    const maxR = cR - 10;
    const deltaR = (maxR - initialR) / Math.max(1, totalRad);

    let first = true;
    for (let theta = 0; theta <= totalRad; theta += stepRad) {
      const curR = initialR + deltaR * theta;
      const curAngle = isNegative ? -theta : theta;
      const px = cX + curR * Math.cos(curAngle);
      const py = cY - curR * Math.sin(curAngle);
      if (first) {
        d += `M ${px.toFixed(1)} ${py.toFixed(1)} `;
        first = false;
      } else {
        d += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
      }
    }
    return d;
  }, [selectedLessonIndex, angleDeg, angleRad, cX, cY, cR]);

  // Drag handler for Point M on Unit Circle
  const handleCirclePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDraggingM(true);
    handleCirclePointerMove(e);
  };

  const handleCirclePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingM && e.buttons !== 1) return;
    const rect = circleSvgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - rect.left - cX;
    const dy = -(e.clientY - rect.top - cY);
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setAngleDeg(Math.round(deg));
  };

  const handleCirclePointerUp = () => setIsDraggingM(false);

  // Right SVG Dimensions: Dynamic Wave Curve
  const waveSvgW = 620;
  const waveSvgH = 340;
  const waveOriginX = waveSvgW / 2 - angleRad * 34;
  const waveOriginY = waveSvgH / 2;
  const waveScaleX = 34; // px per radian
  const waveScaleY = 42; // px per unit

  // Keep the current angle in view while showing several repeated periods on both sides.
  // For tan/cot, split paths at vertical asymptotes instead of joining across the jump.
  const graphXMin = -waveOriginX / waveScaleX;
  const graphXMax = (waveSvgW - 10 - waveOriginX) / waveScaleX;
  const graphValue = (x: number) => {
    if (waveMode === "tan") return Math.tan(x);
    if (waveMode === "cot") return Math.cos(x) / Math.sin(x);
    if (guidedLessonIndex === 3) {
      return waveMode === "sin"
        ? ampA * Math.sin(freqB * x + phaseC) + shiftD
        : ampA * Math.cos(freqB * x + phaseC) + shiftD;
    }
    return waveMode === "sin" ? Math.sin(x) : Math.cos(x);
  };
  const wavePaths = useMemo(() => {
    const paths: string[] = [];
    let current = "";
    const step = 0.025;
    for (let x = graphXMin; x <= graphXMax + step; x += step) {
      const y = graphValue(x);
      if (!Number.isFinite(y) || Math.abs(y) > 3.25) {
        if (current) paths.push(current);
        current = "";
        continue;
      }
      const sx = waveOriginX + x * waveScaleX;
      const sy = waveOriginY - y * waveScaleY;
      current += `${current ? "L" : "M"} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }
    if (current) paths.push(current);
    return paths;
  }, [graphXMin, graphXMax, waveOriginX, waveOriginY, waveScaleX, waveScaleY, graphValue]);

  // Synchronized point on the wave graph
  const curWaveY = graphValue(angleRad);
  const curWaveScreenX = waveOriginX + angleRad * waveScaleX;
  const curWaveScreenY = Number.isFinite(curWaveY) && Math.abs(curWaveY) <= 3.25
    ? waveOriginY - curWaveY * waveScaleY
    : null;
  const leftCurveY = graphValue(graphXMin + 0.12);
  const rightCurveY = graphValue(graphXMax - 0.12);
  const curveColor = waveMode === "tan" ? "#FDBA74" : waveMode === "cot" ? "#C4B5FD" : "#A78BFA";
  const graphPiTicks = Array.from({ length: Math.floor(graphXMax / Math.PI) - Math.ceil(graphXMin / Math.PI) + 1 }, (_, index) => Math.ceil(graphXMin / Math.PI) + index);
  const graphAsymptotes = waveMode === "tan" || waveMode === "cot"
    ? Array.from({ length: 8 }, (_, index) => {
        const k = Math.floor(graphXMin / Math.PI) - 2 + index;
        return waveMode === "tan" ? Math.PI / 2 + k * Math.PI : k * Math.PI;
      }).filter((x) => x >= graphXMin && x <= graphXMax)
    : [];

  React.useEffect(() => {
    setGuidedStep(0);
    setGuidedChoice(null);
    setGuidedResultShown(false);
    setWaveMode(guidedLessonIndex === 1 ? "tan" : "sin");
  }, [selectedLessonIndex, guidedLessonIndex]);

  // Lesson 5 Equation Solving: sin(x) = eqM on [-pi; pi]
  const eqRoots = useMemo(() => {
    if (Math.abs(eqM) > 1) return [];
    const alpha = Math.asin(eqM); // in [-pi/2; pi/2]
    // Two roots in [-pi; pi]:
    // Root 1: alpha
    // Root 2: if alpha >= 0: pi - alpha; if alpha < 0: -pi - alpha
    const r1 = alpha;
    const r2 = alpha >= 0 ? Math.PI - alpha : -Math.PI - alpha;
    return [
      { rad: r1, deg: (r1 * 180) / Math.PI, name: "x1" },
      { rad: r2, deg: (r2 * 180) / Math.PI, name: "x2" },
    ].sort((a, b) => a.rad - b.rad);
  }, [eqM]);

  // Horizontal line y = eqM on wave canvas
  const eqLineWaveY = waveOriginY - eqM * waveScaleY;
  // Horizontal line y = eqM on unit circle
  const eqCircleScreenY = cY - cR * eqM;
  const eqCircleIntersectX1 = cX + cR * Math.sqrt(Math.max(0, 1 - eqM * eqM));
  const eqCircleIntersectX2 = cX - cR * Math.sqrt(Math.max(0, 1 - eqM * eqM));
  const currentGuidedSteps = GUIDED_STEPS[guidedLessonIndex] ?? GUIDED_STEPS[0];
  const currentGuidedQuestion = currentGuidedSteps[guidedStep];

  return (
    <div className={`w-full mx-auto px-3 sm:px-6 ${embedded ? "py-3 sm:py-4 space-y-4" : "py-4 sm:py-6 space-y-6"}`}>
      {/* 1. TOP HEADER & BREADCRUMB */}
      {!embedded && <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-purple-600 transition-colors cursor-pointer shadow-xs"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase tracking-wider">
                CHUYÊN ĐỀ 3
              </span>
              <span className="text-xs text-slate-500 font-medium">Toán 11 · GDPT 2018</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Khảo Sát Các Quan Hệ Lượng Giác Tương Tác
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/modules/trigonometry/lab?activity=${TRIG_ACTIVITIES[selectedLessonIndex] ?? "LG01"}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-purple-200 bg-white px-3.5 py-2 text-xs font-extrabold text-purple-800 shadow-sm transition hover:border-purple-400 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-700">
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>Phòng thí nghiệm chuyên sâu</span>
            <span aria-hidden="true">↗</span>
          </Link>
          {onOpenSocraticDrawer && (
            <button
              type="button"
              onClick={() =>
                onOpenSocraticDrawer(
                  `Em đang tìm hiểu ${currentLesson.code}: ${currentLesson.title} thuộc Chuyên đề 3 Lượng giác. Thầy Opti hướng dẫn giúp em với ạ!`
                )
              }
              className="flex min-h-10 items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700"
            >
              <OptiMascot expression="happy" size={20} animate={false} />
              <span>Hỏi Opti</span>
            </button>
          )}
        </div>
      </div>}

      {/* 2. PROGRESSIVE LESSON SELECTOR TABS */}
      {!embedded && <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {moduleConfig.lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => {
              setSelectedLessonIndex(idx);
              if (idx === 0) setAngleDeg(-765);
              if (idx === 1) setAngleDeg(-765);
              if (idx === 2) setAngleDeg(-765);
              if (idx === 3) setWaveMode("sin");
              if (idx === 4) {
                setAngleDeg(-45);
                setEqM(-Math.SQRT1_2);
              }
            }}
            className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedLessonIndex === idx
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                  selectedLessonIndex === idx ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {lesson.code}
              </span>
              <span
                className={`text-[9px] font-semibold ${
                  selectedLessonIndex === idx ? "text-purple-100" : "text-slate-400"
                }`}
              >
                {lesson.difficulty}
              </span>
            </div>
            <div className="font-bold text-xs truncate">{lesson.title.split(":")[0]}</div>
            <div
              className={`text-[10px] truncate ${
                selectedLessonIndex === idx ? "text-purple-100" : "text-slate-500"
              }`}
            >
              {lesson.subtitle}
            </div>
          </button>
        ))}
      </div>}

      {embedded && (
        <div className="flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm">
          <span className="mt-0.5 rounded-lg bg-purple-700 px-2 py-1 text-[10px] font-black text-white">QUAN SÁT</span>
          <div className="min-w-0 flex-1"><p className="font-bold text-purple-950"><MathFormattedText text={currentLesson.title} /></p><p className="mt-0.5 text-xs leading-relaxed text-purple-900"><MathFormattedText text={`${currentLesson.steps[0]?.instruction || currentLesson.description} Thử thay đổi góc hoặc tham số bên dưới để xem đại lượng trên hình thay đổi như thế nào.`} /></p><Link href={`/modules/trigonometry/lab?activity=${TRIG_ACTIVITIES[selectedLessonIndex] ?? "LG01"}`} className="mt-2 inline-flex text-xs font-bold text-purple-800 underline decoration-purple-300 underline-offset-2 hover:text-purple-950">Mở phòng thí nghiệm chuyên sâu ↗</Link></div>
        </div>
      )}

      {/* 3. SPLIT WORKBENCH: UNIT CIRCLE (LEFT) + WAVE GRAPH (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Unit Circle (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">
                {currentLesson.code}: {currentLesson.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAngleDeg(-765)}
                className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] transition-colors"
                title="Khảo sát bài toán mẫu -765°"
              >
                Góc -765°
              </button>
              <button
                type="button"
                onClick={() => setAngleDeg(45)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
              >
                45°
              </button>
              <button type="button" onClick={() => setAngleDeg(90)} className="px-2 py-1 rounded-lg bg-orange-50 text-orange-800 hover:bg-orange-100 font-semibold text-[11px] transition-colors" title="Kiểm tra tan không xác định tại 90 độ">90°</button>
              <button type="button" onClick={() => setAngleDeg(0)} className="px-2 py-1 rounded-lg bg-violet-50 text-violet-800 hover:bg-violet-100 font-semibold text-[11px] transition-colors" title="Kiểm tra cot không xác định tại 0 độ">0°</button>
            </div>
          </div>

          {/* SVG Unit Circle Canvas */}
          <div className="w-full flex justify-center py-2 select-none relative">
            <svg
              ref={circleSvgRef}
              viewBox={`0 0 ${cSvgW} ${cSvgH}`}
              className="w-full max-w-[320px] h-auto cursor-crosshair"
              onPointerDown={handleCirclePointerDown}
              onPointerMove={handleCirclePointerMove}
              onPointerUp={handleCirclePointerUp}
              onPointerLeave={handleCirclePointerUp}
            >
              {/* Axes Ox and Oy */}
              <line x1="20" y1={cY} x2={cSvgW - 20} y2={cY} stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1={cX} y1="20" x2={cX} y2={cSvgH - 20} stroke="#CBD5E1" strokeWidth="1.5" />
              {/* Axis labels */}
              <text x={cSvgW - 15} y={cY - 6} fill="#64748B" fontSize="11" fontWeight="bold">
                cos
              </text>
              <text x={cX + 6} y="15" fill="#64748B" fontSize="11" fontWeight="bold">
                sin
              </text>

              {/* Unit Circle (R = 1) */}
              <circle cx={cX} cy={cY} r={cR} fill="none" stroke="#8B5CF6" strokeWidth="2" />

              {/* LESSON 1: Archimedean Spiral Arc showing multi-turn rotation */}
              {guidedLessonIndex === 0 && spiralPath && (
                <path
                  d={spiralPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
              )}

              {/* Radius OA (Tia đầu Ox) */}
              <line x1={cX} y1={cY} x2={cX + cR} y2={cY} stroke="#3B82F6" strokeWidth="2.5" />
              <text x={cX + cR + 6} y={cY + 4} fill="#2563EB" fontSize="11" fontWeight="bold">
                A(1,0)
              </text>

              {/* Radius OM (Tia cuối của góc alpha) */}
              <line x1={cX} y1={cY} x2={mScreenX} y2={mScreenY} stroke="#7C3AED" strokeWidth="2.5" />

              {/* Projections onto Cos and Sin Axes */}
              <line
                x1={mScreenX}
                y1={mScreenY}
                x2={mScreenX}
                y2={cY}
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <line
                x1={mScreenX}
                y1={mScreenY}
                x2={cX}
                y2={mScreenY}
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              {/* Cos segment on Ox */}
              <line x1={cX} y1={cY} x2={mScreenX} y2={cY} stroke="#EF4444" strokeWidth="3" />
              {/* Sin segment on Oy */}
              <line x1={cX} y1={cY} x2={cX} y2={mScreenY} stroke="#10B981" strokeWidth="3" />

              {/* LESSON 2: Tangent Axis x = 1 and Cotangent Axis y = 1 */}
              {(guidedLessonIndex === 1 || waveMode === "tan" || waveMode === "cot") && (
                <>
                  {/* Axis Tan x = 1 */}
                  <line
                    x1={cX + cR}
                    y1={cY - 120}
                    x2={cX + cR}
                    y2={cY + 120}
                    stroke="#F97316"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {tanScreenY !== null && <line x1={cX} y1={cY} x2={cX + cR} y2={tanScreenY} stroke="#F97316" strokeWidth="2.4" />}
                  <text x={cX + cR + 4} y={cY - 110} fill="#EA580C" fontSize="10" fontWeight="bold">
                    x = 1 · tiếp tuyến tại (1; 0)
                  </text>
                  {tanScreenY !== null && (
                    <>
                      <line x1={cX + cR} y1={cY} x2={cX + cR} y2={tanScreenY} stroke="#FDBA74" strokeWidth="2" />
                      <circle cx={cX + cR} cy={tanScreenY} r="5" fill="#F97316" stroke="white" strokeWidth="1.5" />
                    </>
                  )}

                  {/* Axis Cot y = 1 */}
                  <line
                    x1={cX - 120}
                    y1={cY - cR}
                    x2={cX + 120}
                    y2={cY - cR}
                    stroke="#A855F7"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {cotScreenX !== null && <line x1={cX} y1={cY} x2={cotScreenX} y2={cY - cR} stroke="#A855F7" strokeWidth="2.4" />}
                  <text x={cX + 80} y={cY - cR - 4} fill="#9333EA" fontSize="10" fontWeight="bold">
                    y = 1 · tiếp tuyến tại (0; 1)
                  </text>
                  {cotScreenX !== null && (
                    <>
                      <line x1={cX} y1={cY - cR} x2={cotScreenX} y2={cY - cR} stroke="#D8B4FE" strokeWidth="2" />
                      <circle cx={cotScreenX} cy={cY - cR} r="5" fill="#A855F7" stroke="white" strokeWidth="1.5" />
                    </>
                  )}
                </>
              )}

              {/* LESSON 3: Reflections: M' (Cung bù) and M'' (Cung đối) */}
              {guidedLessonIndex === 2 && (
                <>
                  {/* Supplementary M' (pi - a) */}
                  {showSupplementary && (
                    <>
                      <circle cx={suppScreenX} cy={suppScreenY} r="5" fill="#06B6D4" stroke="#FFF" strokeWidth="1.5" />
                      <line x1={mScreenX} y1={mScreenY} x2={suppScreenX} y2={suppScreenY} stroke="#06B6D4" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={suppScreenX - 20} y={suppScreenY - 6} fill="#0891B2" fontSize="11" fontWeight="bold">
                        M&apos;(π-α)
                      </text>
                    </>
                  )}

                  {/* Opposite M'' (-a) */}
                  {showOpposite && (
                    <>
                      <circle cx={oppScreenX} cy={oppScreenY} r="5" fill="#EC4899" stroke="#FFF" strokeWidth="1.5" />
                      <line x1={mScreenX} y1={mScreenY} x2={oppScreenX} y2={oppScreenY} stroke="#EC4899" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={oppScreenX + 8} y={oppScreenY + 14} fill="#DB2777" fontSize="11" fontWeight="bold">
                        M&apos;&apos;(-α)
                      </text>
                    </>
                  )}

                  {/* Double Angle Point M_2a */}
                  {showDoubleAngle && (
                    <>
                      <circle cx={doubleScreenX} cy={doubleScreenY} r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                      <text x={doubleScreenX + 8} y={doubleScreenY + 12} fill="#DC2626" fontSize="11" fontWeight="bold">
                        2α
                      </text>
                    </>
                  )}
                </>
              )}

              {/* LESSON 5: Cutting line y = eqM on Unit Circle */}
              {guidedLessonIndex === 4 && (
                <>
                  <line
                    x1="20"
                    y1={eqCircleScreenY}
                    x2={cSvgW - 20}
                    y2={eqCircleScreenY}
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  {Math.abs(eqM) <= 1 && (
                    <>
                      <circle cx={eqCircleIntersectX1} cy={eqCircleScreenY} r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx={eqCircleIntersectX2} cy={eqCircleScreenY} r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                      <text x={eqCircleIntersectX1 + 8} y={eqCircleScreenY - 4} fill="#EF4444" fontSize="10" fontWeight="bold">
                        x1
                      </text>
                      <text x={eqCircleIntersectX2 - 20} y={eqCircleScreenY - 4} fill="#EF4444" fontSize="10" fontWeight="bold">
                        x2
                      </text>
                    </>
                  )}
                </>
              )}

              {/* Terminal Point M */}
              <circle cx={mScreenX} cy={mScreenY} r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <text x={mScreenX + 8} y={mScreenY - 6} fill="#D97706" fontSize="12" fontWeight="bold">
                M
              </text>
            </svg>
          </div>

          {(guidedLessonIndex === 1 || waveMode === "tan" || waveMode === "cot") && (
            <div className="w-full rounded-2xl border border-orange-200 bg-orange-50/70 p-3 text-xs leading-relaxed text-slate-700">
              <p><strong className="text-orange-900">Đọc tan trên hình:</strong> Đường thẳng OM cắt tiếp tuyến x = 1 tại điểm có tung độ bằng tan α = sin α / cos α. Đường màu cam biểu diễn giá trị tan α.</p>
              <p className="mt-1"><strong className="text-purple-900">Đọc cot trên hình:</strong> Đường thẳng OM cắt tiếp tuyến y = 1 tại điểm có hoành độ bằng cot α = cos α / sin α. Đường màu tím biểu diễn giá trị cot α.</p>
              <p className="mt-1 text-slate-600">Tan α không xác định khi cos α = 0; cot α không xác định khi sin α = 0. Nếu giao điểm nằm ngoài khung đường tròn, hãy xem giá trị ở bảng và nhánh đồ thị bên cạnh.</p>
            </div>
          )}

          {/* Value Summary Box */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-200">
              <span className="text-[10px] text-slate-500 block">Số đo góc α</span>
              <span className="font-mono font-black text-xs text-purple-700">
                {angleDeg}° ({(angleRad / Math.PI).toFixed(2)}π)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] text-slate-500 block">sin α (Tung độ)</span>
              <span className="font-mono font-black text-xs text-emerald-700">
                {sinVal.toFixed(3)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-200">
              <span className="text-[10px] text-slate-500 block">cos α (Hoành độ)</span>
              <span className="font-mono font-black text-xs text-rose-700">
                {cosVal.toFixed(3)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] text-slate-500 block">tan & cot</span>
              <span className="font-mono font-black text-xs text-amber-700">
                {tanVal !== null ? tanVal.toFixed(2) : "K.XĐ"} / {cotVal !== null ? cotVal.toFixed(2) : "K.XĐ"}
              </span>
            </div>
          </div>

          {/* Quick Angle Slider */}
          <div className="w-full pt-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Trượt thay đổi góc α:</span>
              <span className="font-mono font-bold text-purple-700">{angleDeg}° ({getQuadrant()})</span>
            </div>
            <input
              type="range"
              min="-1080"
              max="1080"
              step="5"
              value={angleDeg}
              onChange={(e) => setAngleDeg(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Lesson 2: 4-Quadrant Signs Table */}
          {guidedLessonIndex === 1 && (
            <div className="w-full mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Bảng xét dấu 4 góc phần tư (&quot;Nhất CẢ, Nhì SIN, Tam TAN, Tứ COS&quot;):</span>
                <span className="text-[10px] text-purple-700 font-bold px-1.5 py-0.5 rounded bg-purple-100">
                  Hiện tại: {activeQuadrant}
                </span>
              </div>
              <div className="grid grid-cols-5 text-center text-[11px] border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="p-1.5 font-bold bg-slate-100 text-slate-600">Hàm</div>
                <div className={`p-1.5 font-bold ${activeQuadrant === "Góc phần tư I" ? "bg-amber-100 text-amber-900" : "bg-slate-50"}`}>I</div>
                <div className={`p-1.5 font-bold ${activeQuadrant === "Góc phần tư II" ? "bg-amber-100 text-amber-900" : "bg-slate-50"}`}>II</div>
                <div className={`p-1.5 font-bold ${activeQuadrant === "Góc phần tư III" ? "bg-amber-100 text-amber-900" : "bg-slate-50"}`}>III</div>
                <div className={`p-1.5 font-bold ${activeQuadrant === "Góc phần tư IV" ? "bg-amber-100 text-amber-900" : "bg-slate-50"}`}>IV</div>

                <div className="p-1 font-semibold text-emerald-700 border-t border-slate-100">sin</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư I" ? "bg-amber-50" : ""}`}>+</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư II" ? "bg-amber-50" : ""}`}>+</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư III" ? "bg-amber-50" : ""}`}>-</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư IV" ? "bg-amber-50" : ""}`}>-</div>

                <div className="p-1 font-semibold text-rose-700 border-t border-slate-100">cos</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư I" ? "bg-amber-50" : ""}`}>+</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư II" ? "bg-amber-50" : ""}`}>-</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư III" ? "bg-amber-50" : ""}`}>-</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư IV" ? "bg-amber-50" : ""}`}>+</div>

                <div className="p-1 font-semibold text-amber-700 border-t border-slate-100">tan/cot</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư I" ? "bg-amber-50" : ""}`}>+</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư II" ? "bg-amber-50" : ""}`}>-</div>
                <div className={`p-1 font-bold text-emerald-600 border-t border-slate-100 ${activeQuadrant === "Góc phần tư III" ? "bg-amber-50" : ""}`}>+</div>
                <div className={`p-1 font-bold text-rose-500 border-t border-slate-100 ${activeQuadrant === "Góc phần tư IV" ? "bg-amber-50" : ""}`}>-</div>
              </div>
            </div>
          )}

          {/* Lesson 3: Reflection Toggles and Double Angle */}
          {guidedLessonIndex === 2 && (
            <div className="w-full mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Khảo sát cung liên kết & Công thức nhân đôi:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplementary((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    showSupplementary ? "bg-cyan-600 text-white" : "bg-white border text-slate-700"
                  }`}
                >
                  Cung bù: M&apos;(π - α) [Sin bằng nhau]
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpposite((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    showOpposite ? "bg-pink-600 text-white" : "bg-white border text-slate-700"
                  }`}
                >
                  Cung đối: M&apos;&apos;(-α) [Cos bằng nhau]
                </button>
                <button
                  type="button"
                  onClick={() => setShowDoubleAngle((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    showDoubleAngle ? "bg-rose-600 text-white" : "bg-white border text-slate-700"
                  }`}
                >
                  Nhân đôi: 2α
                </button>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                <div>
                  <strong>sin(2α):</strong> 2 · ({sinVal.toFixed(3)}) · ({cosVal.toFixed(3)}) = <strong>{sin2a.toFixed(3)}</strong>
                </div>
                <div>
                  <strong>cos(2α):</strong> ({cosVal.toFixed(3)})² - ({sinVal.toFixed(3)})² = <strong>{cos2a.toFixed(3)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Wave Graph & Step-by-Step Instructions (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Wave Plot Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col items-start justify-between gap-3 pb-2 border-b border-slate-100 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800">
                  {guidedLessonIndex === 3 && (waveMode === "sin" || waveMode === "cos")
                    ? `y = ${ampA !== 1 ? ampA + "·" : ""}${waveMode}(${freqB !== 1 ? freqB + "·" : ""}x${phaseC !== 0 ? (phaseC > 0 ? " + " + phaseC.toFixed(1) : " − " + Math.abs(phaseC).toFixed(1)) : ""})${shiftD !== 0 ? (shiftD > 0 ? " + " + shiftD : " − " + Math.abs(shiftD)) : ""}`
                    : `Đồ thị y = ${waveMode}(x) · chu kỳ ${waveMode === "tan" || waveMode === "cot" ? "π" : "2π"}`}
                </h3>
              </div>
              <div className="grid w-full grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto" role="group" aria-label="Chọn hàm số để xem đồ thị">
                {(["sin", "cos", "tan", "cot"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setWaveMode(mode)} aria-pressed={waveMode === mode} className={`min-h-9 rounded-lg px-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-700 ${waveMode === mode ? "bg-purple-700 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Wave Canvas */}
            <div className="w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2 select-none">
              <svg viewBox={`0 0 ${waveSvgW} ${waveSvgH}`} className="block h-auto max-h-[280px] w-full" role="img" aria-label={`Đồ thị hàm số ${waveMode}, đang xem quanh góc ${angleDeg} độ`}>
                <defs>
                  <marker id="trigAxisArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto-start-reverse"><path d="M0,0 L7,3.5 L0,7 Z" fill="#94A3B8" /></marker>
                  <marker id="trigCurveArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={curveColor} /></marker>
                </defs>
                {[ -2, -1, 1, 2 ].map((unit) => <line key={`y-grid-${unit}`} x1="10" x2={waveSvgW - 10} y1={waveOriginY - unit * waveScaleY} y2={waveOriginY - unit * waveScaleY} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 5" />)}
                {graphPiTicks.map((multiple) => {
                  const x = waveOriginX + multiple * Math.PI * waveScaleX;
                  const label = multiple === 0 ? "0" : multiple === 1 ? "π" : multiple === -1 ? "−π" : `${multiple}π`;
                  return <g key={`pi-tick-${multiple}`}><line x1={x} x2={x} y1="18" y2={waveSvgH - 25} stroke={multiple === 0 ? "#475569" : "#243247"} strokeWidth="0.8" strokeDasharray={multiple === 0 ? undefined : "3 5"} /><text x={x} y={waveOriginY + 17} fill="#CBD5E1" fontSize="11" textAnchor="middle">{label}</text></g>;
                })}
                <line x1="12" y1={waveOriginY} x2={waveSvgW - 12} y2={waveOriginY} stroke="#94A3B8" strokeWidth="1.4" markerStart="url(#trigAxisArrow)" markerEnd="url(#trigAxisArrow)" />
                <line x1={waveOriginX} y1="18" x2={waveOriginX} y2={waveSvgH - 25} stroke="#64748B" strokeWidth="1" />
                {graphAsymptotes.map((x) => { const sx = waveOriginX + x * waveScaleX; return <line key={`asymptote-${x.toFixed(3)}`} x1={sx} x2={sx} y1="18" y2={waveSvgH - 25} stroke="#FB7185" strokeWidth="1.4" strokeDasharray="6 5" opacity="0.9" />; })}
                {wavePaths.map((path, index) => <path key={`graph-branch-${index}`} d={path} fill="none" stroke={curveColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
                {Number.isFinite(leftCurveY) && Math.abs(leftCurveY) <= 3.1 && <line x1={waveOriginX + (graphXMin + 0.12) * waveScaleX} y1={waveOriginY - leftCurveY * waveScaleY} x2={waveOriginX + (graphXMin + 0.02) * waveScaleX} y2={waveOriginY - graphValue(graphXMin + 0.02) * waveScaleY} stroke={curveColor} strokeWidth="2.4" markerEnd="url(#trigCurveArrow)" />}
                {Number.isFinite(rightCurveY) && Math.abs(rightCurveY) <= 3.1 && <line x1={waveOriginX + (graphXMax - 0.12) * waveScaleX} y1={waveOriginY - rightCurveY * waveScaleY} x2={waveOriginX + (graphXMax - 0.02) * waveScaleX} y2={waveOriginY - graphValue(graphXMax - 0.02) * waveScaleY} stroke={curveColor} strokeWidth="2.4" markerEnd="url(#trigCurveArrow)" />}
                <line x1={curWaveScreenX} y1="18" x2={curWaveScreenX} y2={waveSvgH - 25} stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.75" />
                {curWaveScreenY !== null && <><line x1={curWaveScreenX} y1={waveOriginY} x2={curWaveScreenX} y2={curWaveScreenY} stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 3" /><circle cx={curWaveScreenX} cy={curWaveScreenY} r="5.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" /></>}

                {/* LESSON 5: Horizontal line y = eqM cutting the wave */}
                {guidedLessonIndex === 4 && (
                  <>
                    <line
                      x1="10"
                      y1={eqLineWaveY}
                      x2={waveSvgW - 10}
                      y2={eqLineWaveY}
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                    <text x={waveSvgW - 20} y={eqLineWaveY - 4} fill="#F87171" fontSize="9" fontWeight="bold" textAnchor="end">
                      y = {eqM.toFixed(2)}
                    </text>
                  </>
                )}
                <text x="18" y="18" fill="#CBD5E1" fontSize="10">← đồ thị còn tiếp</text>
                <text x={waveSvgW - 18} y="18" fill="#CBD5E1" fontSize="10" textAnchor="end">đồ thị còn tiếp →</text>
              </svg>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]">
              <span className="font-semibold text-slate-700">Trục ngang là góc α, trục dọc là giá trị {waveMode}(α). Khung chỉ là một phần; hai mũi tên cho biết đồ thị còn tiếp tục vô hạn.</span>
              {(waveMode === "tan" || waveMode === "cot") && <span className="inline-flex items-center gap-2 font-bold text-rose-800"><span className="h-0 w-7 border-t-2 border-dashed border-rose-500" />Tiệm cận đứng: {waveMode === "tan" ? "α = π/2 + kπ" : "α = kπ"}; nhánh đồ thị tiến gần nhưng không cắt tiệm cận</span>}
              <span className="rounded-lg bg-purple-100 px-2 py-1 font-bold text-purple-900">Chu kỳ: {waveMode === "tan" || waveMode === "cot" ? "π" : guidedLessonIndex === 3 ? (2 * Math.PI / freqB).toFixed(2) + " rad" : "2π"}</span>
              {curWaveScreenY === null && <span className="font-bold text-rose-700">Tại góc này, {waveMode} không xác định hoặc nằm ngoài khung tung độ.</span>}
            </div>

            {/* LESSON 4: Sliders for Amplitude, Frequency, Phase, Shift */}
            {guidedLessonIndex === 3 && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Biên độ (a):</span>
                    <span className="font-mono font-bold text-purple-700">{ampA.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={ampA}
                    onChange={(e) => setAmpA(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Tần số (b):</span>
                    <span className="font-mono font-bold text-purple-700">{freqB.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={freqB}
                    onChange={(e) => setFreqB(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Độ lệch pha (c):</span>
                    <span className="font-mono font-bold text-purple-700">{(phaseC / Math.PI).toFixed(2)}π</span>
                  </div>
                  <input
                    type="range"
                    min={-Math.PI}
                    max={Math.PI}
                    step="0.1"
                    value={phaseC}
                    onChange={(e) => setPhaseC(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Tịnh tiến đứng (d):</span>
                    <span className="font-mono font-bold text-purple-700">{shiftD.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1.5"
                    max="1.5"
                    step="0.1"
                    value={shiftD}
                    onChange={(e) => setShiftD(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div className="col-span-2 p-2 rounded-xl bg-purple-50 text-[11px] text-purple-800 flex justify-between">
                  <span>Chu kỳ: <strong>T = 2π / |b| = {( (2 * Math.PI) / freqB ).toFixed(2)} rad</strong></span>
                  <span>Tập giá trị: <strong>[{(shiftD - ampA).toFixed(1)}; {(shiftD + ampA).toFixed(1)}]</strong></span>
                </div>
              </div>
            )}

            {/* LESSON 5: Equation Solving Controls for sin(x) = m on [-pi; pi] */}
            {guidedLessonIndex === 4 && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-rose-900 font-bold">
                  <span>Giải phương trình: sin(x) = {eqM.toFixed(3)} trên [-π; π]</span>
                  <button
                    type="button"
                    onClick={() => setEqM(-Math.SQRT1_2)}
                    className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-bold"
                  >
                    Chuẩn SGK: -√2/2
                  </button>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={eqM}
                  onChange={(e) => setEqM(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="p-2 rounded-xl bg-white border border-rose-200 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800">Các nghiệm thuộc đoạn [-π; π]:</div>
                  {eqRoots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {eqRoots.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-mono font-bold">
                          {r.name} = {(r.rad / Math.PI).toFixed(3)}π ({r.deg.toFixed(1)}°)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-rose-600 font-bold">Vô nghiệm (vì |m| &gt; 1)</span>
                  )}
                  <p className="text-slate-500 text-[10px] pt-1">
                    Với m = -√2/2, hai nghiệm là x1 = -π/4 (-45°) và x2 = -3π/4 (-135°).
                  </p>
                </div>
              </div>
            )}

            {/* Lesson 0 & general insight */}
            {guidedLessonIndex === 0 && (
              <div className="text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <strong>Đối chiếu Task LG-MH01:</strong> Góc α = -765° tách thành <code>(-2) × 360° - 45°</code>, tương ứng với quay 2 vòng theo chiều âm và đi tiếp -45° (trùng điểm biểu diễn góc 315° = 7π/4 ở góc phần tư IV).
              </div>
            )}
          </div>

          <section className="rounded-3xl border border-purple-200 bg-white p-5 shadow-sm space-y-4" aria-labelledby="trig-seven-step-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-700">Làm cùng mô phỏng</p>
                <h2 id="trig-seven-step-title" className="mt-1 text-base font-black text-slate-900">Khám phá theo 7 bước</h2>
                <p className="mt-1 text-xs text-slate-600">Mỗi câu hỏi gắn với hình hoặc đồ thị. Chọn đáp án, đọc giải thích rồi mới chuyển bước.</p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-900">{currentGuidedQuestion ? `Bước ${guidedStep + 1} / 7` : "Đã xong 7 bước"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Tiến độ 7 bước" aria-valuemin={0} aria-valuemax={7} aria-valuenow={guidedStep}>
              <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${(guidedStep / 7) * 100}%` }} />
            </div>
            {currentGuidedQuestion ? (
              <>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                  <p className="text-xs font-extrabold text-purple-800">{currentGuidedQuestion.title}</p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900"><MathFormattedText text={currentGuidedQuestion.prompt} /></p>
                  {guidedLessonIndex === 1 && guidedStep >= 2 && guidedStep <= 5 && <p className="mt-2 text-[11px] text-slate-600"><MathFormattedText text="Quan sát giao điểm của đường thẳng $OM$ với hai tiếp tuyến màu cam $x=1$ và màu tím $y=1$." /></p>}
                  {guidedLessonIndex === 1 && guidedStep === 4 && <p className="mt-1 text-[11px] font-semibold text-orange-800"><MathFormattedText text="Chọn góc $90^\\circ$ để thấy đường thẳng $OM$ song song với tiếp tuyến $x=1$." /></p>}
                  {guidedLessonIndex === 1 && guidedStep === 5 && <p className="mt-1 text-[11px] font-semibold text-violet-800"><MathFormattedText text="Chọn góc $0^\\circ$ để thấy đường thẳng $OM$ song song với tiếp tuyến $y=1$." /></p>}
                  {guidedLessonIndex === 0 && <p className="mt-2 text-[11px] text-slate-600">Bài mẫu đang xét góc −765°. Nếu đã đổi góc, chọn lại nút −765° phía trên để đối chiếu đúng cấu hình.</p>}
                  {guidedLessonIndex === 3 && <p className="mt-2 text-[11px] text-slate-600">Kéo góc α ở hình tròn. Điểm màu vàng trên đồ thị sẽ theo góc; hai mũi tên ở hai đầu nhắc rằng đường cong còn tiếp tục.</p>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentGuidedQuestion.choices.map((choice, index) => (
                    <button key={`${guidedStep}-${choice}`} type="button" disabled={guidedResultShown} onClick={() => setGuidedChoice(index)} aria-pressed={guidedChoice === index} className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-xs leading-relaxed transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-700 disabled:cursor-default ${guidedChoice === index ? "border-purple-600 bg-purple-50 ring-1 ring-purple-500" : "border-slate-200 bg-white hover:border-purple-300"}`}>
                      <MathFormattedText text={choice} />
                    </button>
                  ))}
                </div>
                {guidedResultShown && guidedChoice !== currentGuidedQuestion.answer && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950" role="status">
                    <strong>Chưa đúng.</strong> <MathFormattedText text={currentGuidedQuestion.explanation} />
                    <button type="button" onClick={() => { setGuidedChoice(null); setGuidedResultShown(false); }} className="ml-2 font-bold underline">Thử lại</button>
                  </div>
                )}
                {guidedResultShown && guidedChoice === currentGuidedQuestion.answer && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-950" role="status">
                    <strong>Đúng rồi.</strong> <MathFormattedText text={currentGuidedQuestion.explanation} />
                  </div>
                )}
                <div className="flex justify-end">
                  {!guidedResultShown ? (
                    <button type="button" disabled={guidedChoice === null} onClick={() => setGuidedResultShown(true)} className="min-h-11 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40">Kiểm tra câu trả lời</button>
                  ) : guidedChoice === currentGuidedQuestion.answer ? (
                    <button type="button" onClick={() => { setGuidedStep((step) => step + 1); setGuidedChoice(null); setGuidedResultShown(false); }} className="min-h-11 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-800">{guidedStep === 6 ? "Hoàn thành 7 bước" : "Sang bước tiếp theo"}</button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-950" role="status">
                Em đã hoàn thành đủ 7 bước của bài này. Hãy kéo góc hoặc chọn hàm khác để tự kiểm tra lại các nhận xét.
                <button type="button" onClick={() => { setGuidedStep(0); setGuidedChoice(null); setGuidedResultShown(false); }} className="ml-2 underline">Làm lại</button>
              </div>
            )}
          </section>

          {/* Current Lesson Guide Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-100 text-purple-800">
                {currentLesson.code}
              </span>
              <h2 className="font-bold text-sm text-slate-900"><MathFormattedText text={currentLesson.title} /></h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed"><MathFormattedText text={currentLesson.description} /></p>

            {/* Steps in this lesson */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {currentLesson.steps.map((st) => (
                <div key={st.stepNumber} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {st.stepNumber}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800">{st.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7"><MathFormattedText text={st.instruction} /></p>

                  {/* Socratic Questions */}
                  {st.socraticQuestions && st.socraticQuestions.length > 0 && (
                    <div className="mt-2 pl-7 pt-1.5 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold text-purple-800 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3 h-3 text-purple-600" />
                        <span>Câu hỏi Socratic gợi mở:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                        {st.socraticQuestions.map((q, qIdx) => (
                          <li key={qIdx} className="leading-snug">
                            <MathFormattedText text={q} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
