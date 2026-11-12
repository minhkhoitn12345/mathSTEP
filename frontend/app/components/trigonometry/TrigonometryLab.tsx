"use client";

import { TRIG_GUIDED_INDICES, TRIG_GUIDED_STEPS } from "@/app/data/trigonometryLessons";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  Compass,
  Activity,
  Copy,
  Magnet,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import { MathFormattedText } from "@/app/components/KatexMath";
import { SimulationLabHeader } from "@/app/components/SimulationLabHeader";

interface TrigonometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
  initialLessonIndex?: number;
  embedded?: boolean;
}

type TrigonometryMode = "circle" | "addition" | "wave";
type LinkedArc = "opposite" | "supplementary" | "complementary" | "oppositeHalfTurn";

const LINKED_ARCS: { id: LinkedArc; title: string; formula: string; color: string }[] = [
  { id: "opposite", title: "Cung đối", formula: "-\\alpha", color: "#db2777" },
  { id: "supplementary", title: "Cung bù", formula: "\\pi-\\alpha", color: "#0891b2" },
  { id: "complementary", title: "Cung phụ", formula: "\\frac{\\pi}{2}-\\alpha", color: "#ea580c" },
  { id: "oppositeHalfTurn", title: "Hơn kém \\pi", formula: "\\pi+\\alpha", color: "#4f46e5" },
];

async function copySvgToClipboard(svg: SVGSVGElement | null): Promise<string> {
  if (!svg || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("Trình duyệt chưa hỗ trợ chép hình. Hãy dùng trình duyệt hiện đại và kết nối an toàn.");
  }
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "1600");
  clone.setAttribute("height", "900");
  const source = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(source);
  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Không thể dựng ảnh để sao chép.")); });
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không thể tạo ảnh PNG.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Không thể tạo ảnh PNG.")), "image/png"));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "Đã chép hình vào bộ nhớ tạm. Có thể dán vào Word.";
  } finally {
    URL.revokeObjectURL(url);
  }
}

function AdditionFormulaProof({ examMode }: { examMode: boolean }) {
  const [alpha, setAlpha] = useState(30);
  const [beta, setBeta] = useState(25);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const a = alpha * Math.PI / 180;
  const b = beta * Math.PI / 180;
  const scale = 235;
  const ox = 62;
  const oy = 326;
  const verticalA = Math.sin(a) * Math.cos(b) * scale;
  const verticalB = Math.cos(a) * Math.sin(b) * scale;
  const horizontalPositive = Math.cos(a) * Math.cos(b) * scale;
  const horizontalNegative = Math.sin(a) * Math.sin(b) * scale;
  const px = ox + horizontalPositive - horizontalNegative;
  const py = oy - verticalA - verticalB;
  return <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold text-slate-900">Công thức cộng qua hình học</h2><p className="text-xs text-slate-500">Hai góc vuông tạo góc tổng α + β trên đường tròn đơn vị.</p></div><button type="button" onClick={() => { void copySvgToClipboard(svgRef.current).then(setCopyMessage).catch(error => setCopyMessage(error instanceof Error ? error.message : "Không thể chép hình.")); }} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white"><Copy size={14}/> Chép hình vào Word</button></div>
      <svg ref={svgRef} viewBox="0 0 640 390" role="img" aria-label={`Chứng minh công thức cộng với góc ${alpha} và ${beta} độ`} className={`h-auto max-h-[62vh] w-full rounded-xl border border-slate-200 ${examMode ? "bg-white" : "bg-slate-50"}`}>
        <defs><marker id="addition-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill={examMode ? "#111827" : "#475569"}/></marker></defs>
        <line x1="30" y1={oy} x2="610" y2={oy} stroke={examMode ? "#111827" : "#94a3b8"} strokeWidth="1.5" markerEnd="url(#addition-arrow)"/>
        <line x1={ox} y1="26" x2={ox} y2="365" stroke={examMode ? "#111827" : "#94a3b8"} strokeWidth="1.5" markerEnd="url(#addition-arrow)"/>
        <line x1={ox} y1={oy} x2={px} y2={oy} stroke="#64748b" strokeWidth="1" strokeDasharray="5 5"/>
        <line x1={px} y1={oy} x2={px} y2={py} stroke="#64748b" strokeWidth="1" strokeDasharray="5 5"/>
        <line x1={ox} y1={oy} x2={px} y2={py} stroke={examMode ? "#111827" : "#7c3aed"} strokeWidth="3"/>
        <circle cx={ox} cy={oy} r="4" fill="#0f172a"/><circle cx={px} cy={py} r="5" fill="#0f172a"/>
        <text x={ox-18} y={oy+22} fontSize="14" fontWeight="700" fill="#0f172a">O</text><text x={px+8} y={py-8} fontSize="14" fontWeight="700" fill="#0f172a">P</text>
        <line x1={px} y1={oy} x2={px} y2={oy-verticalA} stroke={examMode ? "#111827" : "#0284c7"} strokeWidth="7"/><line x1={px} y1={oy-verticalA} x2={px} y2={py} stroke={examMode ? "#111827" : "#ea580c"} strokeWidth="7"/>
        <line x1={ox} y1={oy+18} x2={ox+horizontalPositive} y2={oy+18} stroke={examMode ? "#111827" : "#0284c7"} strokeWidth="5"/><line x1={ox+horizontalPositive} y1={oy+18} x2={px} y2={oy+18} stroke={examMode ? "#111827" : "#ea580c"} strokeWidth="5" strokeDasharray="7 4"/>
        <text x={px+12} y={oy-verticalA/2} fontSize="11" fill="#0369a1">sin α cos β</text><text x={px+12} y={oy-verticalA-verticalB/2} fontSize="11" fill="#c2410c">cos α sin β</text>
        <text x={ox+horizontalPositive/2-22} y={oy+36} fontSize="11" fill="#0369a1">cos α cos β</text><text x={ox+horizontalPositive-horizontalNegative/2-22} y={oy+51} fontSize="11" fill="#c2410c">− sin α sin β</text>
        <text x={ox+scale+8} y={py+20} fontSize="11" fill="#475569">cạnh huyền = 1</text>
        <text x="500" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">α = {alpha}° · β = {beta}°</text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-5 rounded bg-sky-600"/>Thành phần thứ nhất</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-5 rounded bg-orange-600"/>Thành phần thứ hai</span></div>
      {copyMessage && <p role="status" className="mt-2 text-xs text-teal-700">{copyMessage}</p>}
    </div>
    <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-bold">Điều chỉnh góc</h3>
      <AngleControl label="α" value={alpha} min={10} max={45} onChange={setAlpha}/><AngleControl label="β" value={beta} min={10} max={40} onChange={setBeta}/>
      <div className="space-y-3 rounded-xl bg-slate-50 p-3 text-sm"><MathFormattedText text={`$\\sin(${alpha}^\\circ+${beta}^\\circ)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta=${(Math.sin(a+b)).toFixed(3)}$`}/><MathFormattedText text={`$\\cos(${alpha}^\\circ+${beta}^\\circ)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta=${(Math.cos(a+b)).toFixed(3)}$`}/><MathFormattedText text={`$\\sin\\alpha\\cos\\beta=${(Math.sin(a)*Math.cos(b)).toFixed(3)},\\quad \\cos\\alpha\\sin\\beta=${(Math.cos(a)*Math.sin(b)).toFixed(3)}$`}/><MathFormattedText text={`$\\cos\\alpha\\cos\\beta=${(Math.cos(a)*Math.cos(b)).toFixed(3)},\\quad \\sin\\alpha\\sin\\beta=${(Math.sin(a)*Math.sin(b)).toFixed(3)}$`}/></div>
      <p className="text-xs leading-5 text-slate-600">Cạnh đứng được cộng theo hai đoạn màu. Cạnh ngang là cạnh kề của góc tổng, bằng hiệu hai hình chiếu màu.</p>
    </aside>
  </section>;
}

function AngleControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="block rounded-xl border border-slate-200 p-3 text-xs"><span className="mb-1 flex justify-between"><strong>Góc {label}</strong><output className="font-bold text-purple-700">{value}°</output></span><input aria-label={`Góc ${label}`} className="w-full accent-purple-700" type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))}/></label>;
}

function WaveExplorer({ angleDeg, setAngleDeg, amplitude, setAmplitude, frequency, setFrequency, phase, setPhase, examMode }: {
  angleDeg: number; setAngleDeg: (value: number) => void; amplitude: number; setAmplitude: (value: number) => void;
  frequency: number; setFrequency: (value: number) => void; phase: number; setPhase: (value: number) => void; examMode: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const angle = angleDeg * Math.PI / 180;
  const cx = 155, cy = 190, radius = 90, graphLeft = 340, graphRight = 880, graphScaleY = 65;
  const xMin = angle - 2 * Math.PI, xMax = angle + 2 * Math.PI;
  const graphX = (x: number) => graphLeft + (x - xMin) / (xMax - xMin) * (graphRight - graphLeft);
  const graphY = (x: number) => cy - amplitude * Math.sin(frequency * x + phase) * graphScaleY;
  const pointX = graphX(angle);
  const pointY = graphY(angle);
  const path = Array.from({ length: 481 }, (_, index) => {
    const x = xMin + (index / 480) * (xMax - xMin);
    return `${index === 0 ? "M" : "L"} ${graphX(x).toFixed(2)} ${graphY(x).toFixed(2)}`;
  }).join(" ");
  const ticks = Array.from({ length: 5 }, (_, index) => xMin + index * Math.PI);
  const period = 2 * Math.PI / frequency;
  return <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold text-slate-900">Đường tròn và đồ thị sóng</h2><p className="text-xs text-slate-500">Điểm trên đường tròn liên hệ với điểm trên đồ thị.</p></div><button type="button" onClick={() => { void copySvgToClipboard(svgRef.current).then(setCopyMessage).catch(error => setCopyMessage(error instanceof Error ? error.message : "Không thể chép hình.")); }} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white"><Copy size={14}/> Chép hình vào Word</button></div>
    <svg ref={svgRef} viewBox="0 0 900 380" role="img" aria-label="Đường tròn lượng giác và đồ thị y bằng A sin omega x cộng phi" className={`h-auto max-h-[62vh] w-full rounded-xl border border-slate-200 ${examMode ? "bg-white" : "bg-slate-950"}`}>
      <defs><marker id="wave-axis-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill={examMode ? "#111827" : "#94a3b8"}/></marker></defs>
      <line x1={graphLeft-35} y1="20" x2={graphLeft-35} y2="350" stroke={examMode ? "#111827" : "#334155"} strokeWidth="1"/>
      <text x={cx} y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill={examMode ? "#111827" : "#e2e8f0"}>Đường tròn R = 1</text>
      <text x={(graphLeft+graphRight)/2} y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill={examMode ? "#111827" : "#e2e8f0"}>y = A sin(ωx + φ)</text>
      <line x1={cx-radius-20} y1={cy} x2={cx+radius+24} y2={cy} stroke={examMode ? "#111827" : "#64748b"} strokeWidth="1.3" markerEnd="url(#wave-axis-arrow)"/>
      <line x1={cx} y1={cy+radius+20} x2={cx} y2={cy-radius-25} stroke={examMode ? "#111827" : "#64748b"} strokeWidth="1.3" markerEnd="url(#wave-axis-arrow)"/>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={examMode ? "#111827" : "#a78bfa"} strokeWidth="2"/>
      <line x1={cx} y1={cy} x2={cx+radius*Math.cos(angle)} y2={cy-radius*Math.sin(angle)} stroke={examMode ? "#111827" : "#c4b5fd"} strokeWidth="2.5"/>
      <circle cx={cx+radius*Math.cos(angle)} cy={cy-radius*Math.sin(angle)} r="5" fill={examMode ? "#111827" : "#f59e0b"}/>
      <text x={cx+radius*Math.cos(angle)+7} y={cy-radius*Math.sin(angle)-8} fontSize="12" fontWeight="700" fill={examMode ? "#111827" : "#fbbf24"}>M</text>
      <line x1={graphLeft} y1={cy} x2={graphRight} y2={cy} stroke={examMode ? "#111827" : "#64748b"} strokeWidth="1.3" markerEnd="url(#wave-axis-arrow)"/>
      {[-2,-1,1,2].map(value=><line key={`wg${value}`} x1={graphLeft} y1={cy-value*graphScaleY} x2={graphRight} y2={cy-value*graphScaleY} stroke={examMode ? "#cbd5e1" : "#334155"} strokeDasharray="3 5"/>)}
      {ticks.map((tick,index)=><g key={`xt${index}`}><line x1={graphX(tick)} y1="50" x2={graphX(tick)} y2="340" stroke={examMode ? "#cbd5e1" : "#334155"} strokeDasharray="3 5"/><text x={graphX(tick)} y={cy+18} textAnchor="middle" fontSize="10" fill={examMode ? "#111827" : "#cbd5e1"}>{index===0?"α−2π":index===1?"α−π":index===2?"α":index===3?"α+π":"α+2π"}</text></g>)}
      <path d={path} fill="none" stroke={examMode ? "#111827" : "#a78bfa"} strokeWidth="3"/>
      <line x1={cx+radius*Math.cos(angle)} y1={cy-radius*Math.sin(angle)} x2={graphLeft} y2={cy-radius*Math.sin(angle)} stroke={examMode ? "#111827" : "#fbbf24"} strokeWidth="1.5" strokeDasharray="5 4"/>
      <line x1={pointX} y1={cy-radius*Math.sin(angle)} x2={pointX} y2={pointY} stroke={examMode ? "#111827" : "#fbbf24"} strokeWidth="1.5" strokeDasharray="4 4"/>
      <line x1={pointX} y1={50} x2={pointX} y2={340} stroke={examMode ? "#111827" : "#f59e0b"} strokeWidth="1" strokeDasharray="3 5" opacity=".6"/>
      <circle cx={pointX} cy={pointY} r="5.5" fill={examMode ? "#111827" : "#f59e0b"} stroke={examMode ? "#fff" : "#fff"} strokeWidth="1.5"/>
      <text x={pointX+8} y={pointY-9} fontSize="11" fontWeight="700" fill={examMode ? "#111827" : "#fbbf24"}>P(α)</text>
    </svg>
    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <AngleControl label="α" value={angleDeg} min={-360} max={360} onChange={setAngleDeg}/>
      <ParameterControl label="Biên độ A" value={amplitude} min={0.5} max={2.5} step={0.1} onChange={setAmplitude}/>
      <ParameterControl label="Tần số góc ω" value={frequency} min={0.5} max={3} step={0.1} onChange={setFrequency}/>
      <ParameterControl label="Pha ban đầu φ (rad)" value={phase} min={-Math.PI} max={Math.PI} step={0.1} onChange={setPhase}/>
    </div>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-slate-50 p-3 text-sm"><MathFormattedText text={`$y=${amplitude.toFixed(1)}\\sin(${frequency.toFixed(1)}x${phase<0?"":"+"}${phase.toFixed(1)})$`}/><MathFormattedText text={`$T=\\frac{2\\pi}{\\omega}=${period.toFixed(2)}$`}/><MathFormattedText text={`$-A\\leq y\\leq A,\\quad A=${amplitude.toFixed(1)}$`}/></div>
    {copyMessage && <p role="status" className="mt-2 text-xs text-teal-700">{copyMessage}</p>}
  </section>;
}

function ParameterControl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="block rounded-xl border border-slate-200 p-3 text-xs"><span className="mb-1 flex justify-between gap-2"><strong>{label}</strong><output className="font-bold tabular-nums text-purple-700">{value.toFixed(1)}</output></span><input aria-label={label} className="w-full accent-purple-700" type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))}/></label>;
}

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
  const [mode, setMode] = useState<TrigonometryMode>("circle");
  const [examMode, setExamMode] = useState(false);
  const [magneticSnap, setMagneticSnap] = useState(true);
  const [linkedArcs, setLinkedArcs] = useState<LinkedArc[]>(["supplementary"]);
  const [copyNotice, setCopyNotice] = useState("");

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
  const draggingPointerId = useRef<number | null>(null);

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

  const specialAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const snapAngle = (degrees: number) => {
    if (!magneticSnap) return degrees;
    const candidates = specialAngles.flatMap(angle => [-3, -2, -1, 0, 1, 2, 3].map(turn => angle + turn * 360));
    const nearest = candidates.reduce((best, value) => Math.abs(value - degrees) < Math.abs(best - degrees) ? value : best, candidates[0]);
    return Math.abs(nearest - degrees) <= 4 ? nearest : degrees;
  };
  const linkedPoint = (arc: LinkedArc) => {
    const rad = arc === "opposite" ? -angleRad : arc === "supplementary" ? Math.PI - angleRad : arc === "complementary" ? Math.PI / 2 - angleRad : Math.PI + angleRad;
    return { x: cX + cR * Math.cos(rad), y: cY - cR * Math.sin(rad), sin: Math.sin(rad), cos: Math.cos(rad) };
  };

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
    draggingPointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleCirclePointerMove(e);
  };

  const handleCirclePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingPointerId.current !== e.pointerId) return;
    const svg = circleSvgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const local = point.matrixTransform(matrix.inverse());
    const dx = local.x - cX;
    const dy = cY - local.y;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setAngleDeg(snapAngle(deg));
  };

  const handleCirclePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingPointerId.current !== e.pointerId) return;
    draggingPointerId.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

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
  const graphValue = useCallback((x: number) => {
    if (waveMode === "tan") return Math.tan(x);
    if (waveMode === "cot") return Math.cos(x) / Math.sin(x);
    if (guidedLessonIndex === 3) {
      return waveMode === "sin"
        ? ampA * Math.sin(freqB * x + phaseC) + shiftD
        : ampA * Math.cos(freqB * x + phaseC) + shiftD;
    }
    return waveMode === "sin" ? Math.sin(x) : Math.cos(x);
  }, [waveMode, guidedLessonIndex, ampA, freqB, phaseC, shiftD]);
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
  const currentGuidedSteps = TRIG_GUIDED_STEPS[selectedLessonIndex] ?? TRIG_GUIDED_STEPS[0];
  const currentGuidedQuestion = currentGuidedSteps[guidedStep];

  return (
    <div className={`trig-workspace w-full ${examMode ? "trig-exam-mode bg-white" : ""} ${embedded ? "mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 space-y-4" : `min-h-screen ${examMode ? "bg-white" : "bg-slate-50"} px-3 pb-6 sm:px-4 md:px-6`}`}>
      {examMode && <style>{`.trig-exam-mode svg{background:#fff!important}.trig-exam-mode svg [stroke]:not([stroke="none"]){stroke:#111827!important}.trig-exam-mode svg [fill]:not([fill="none"]):not([fill="#fff"]):not([fill="#FFF"]):not([fill="#ffffff"]):not([fill="#FFFFFF"]){fill:#111827!important}.trig-exam-mode svg text{fill:#111827!important}`}</style>}
      {!embedded && <SimulationLabHeader
        moduleLabel={"CHUY\u00caN \u0110\u1ec0 3"}
        title={"L\u01b0\u1ee3ng gi\u00e1c"}
        subtitle={"\u0110\u01b0\u1eddng tr\u00f2n, \u0111\u1ed3 th\u1ecb v\u00e0 ph\u01b0\u01a1ng tr\u00ecnh l\u01b0\u1ee3ng gi\u00e1c"}
        accent="purple"
        onBack={onBackToHome}
        action={onOpenSocraticDrawer && (
          <button type="button" onClick={() => onOpenSocraticDrawer(`Em \u0111ang t\u00ecm hi\u1ec3u ${currentLesson.code}: ${currentLesson.title} thu\u1ed9c Chuy\u00ean \u0111\u1ec1 3 L\u01b0\u1ee3ng gi\u00e1c. Tr\u1ee3 l\u00fd MathSTEP h\u01b0\u1edbng d\u1eabn em v\u1edbi \u1ea1!`)} className="flex min-h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:from-purple-700 hover:to-indigo-700">
            <OptiMascot expression="happy" size={20} animate={false} />
            <span>{"H\u1ecfi MathSTEP"}</span>
          </button>
        )}
      />}

      <div className="mx-auto w-full max-w-7xl space-y-4 pt-2 sm:pt-3">
      <nav className="sticky top-[104px] z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur" aria-label="Chế độ mô phỏng lượng giác">
        <div className="flex flex-wrap gap-1">{([ ["circle", "Đường tròn"], ["addition", "Công thức cộng"], ["wave", "Đồ thị sóng"] ] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${mode === id ? "bg-purple-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</div>
        <button type="button" onClick={() => setExamMode(value => !value)} aria-pressed={examMode} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${examMode ? "bg-black text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{examMode ? "Đề thi · nét đen" : "Bài giảng · màu"}</button>
      </nav>
      {mode === "addition" ? <AdditionFormulaProof examMode={examMode}/> : mode === "wave" ? <WaveExplorer angleDeg={angleDeg} setAngleDeg={setAngleDeg} amplitude={ampA} setAmplitude={setAmpA} frequency={freqB} setFrequency={setFreqB} phase={phaseC} setPhase={setPhaseC} examMode={examMode}/> : <>
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
          </button>
        ))}
      </div>}

      {embedded && (
        <div className="flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm">
          <span className="mt-0.5 rounded-lg bg-purple-700 px-2 py-1 text-[10px] font-black text-white">QUAN SÁT</span>
          <div className="min-w-0 flex-1"><p className="truncate font-bold text-purple-950"><MathFormattedText text={currentLesson.title} /></p><p className="mt-0.5 text-xs text-purple-900">Thay đổi góc hoặc tham số để quan sát.</p></div>
        </div>
      )}

      {/* Lesson layout: guided steps on the left, visuals on the right. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:col-span-4" aria-label="Các bước giải">
          <section className="rounded-3xl border border-purple-200 bg-white p-5 shadow-sm space-y-4" aria-labelledby="trig-seven-step-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-700">Làm cùng mô phỏng</p>
                <h2 id="trig-seven-step-title" className="mt-1 text-base font-black text-slate-900">Giải từng bước cùng mô phỏng</h2>
                <p className="mt-1 text-xs text-slate-600">Mỗi câu hỏi gắn với hình hoặc đồ thị. Chọn đáp án, đọc giải thích rồi mới chuyển bước.</p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-900">{currentGuidedQuestion ? `Bước ${guidedStep + 1} / ${currentGuidedSteps.length}` : "Đã hoàn thành"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Tiến độ mô phỏng" aria-valuemin={0} aria-valuemax={currentGuidedSteps.length} aria-valuenow={guidedStep}>
              <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${(guidedStep / currentGuidedSteps.length) * 100}%` }} />
            </div>
            {currentGuidedQuestion ? (
              <>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                  <p className="text-xs font-extrabold text-purple-800">{currentGuidedQuestion.title}</p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900"><MathFormattedText text={currentGuidedQuestion.prompt} /></p>
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
                    <strong>Chưa đúng.</strong> Trên hình, α nằm ở {activeQuadrant}. Hãy xét dấu sin α theo tung độ và cos α theo hoành độ của M trước khi chọn lại. <MathFormattedText text={currentGuidedQuestion.hint} />
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
                    <button type="button" onClick={() => { setGuidedStep((step) => step + 1); setGuidedChoice(null); setGuidedResultShown(false); }} className="min-h-11 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-800">{guidedStep === currentGuidedSteps.length - 1 ? `Hoàn thành ${currentGuidedSteps.length} câu` : "Sang câu tiếp theo"}</button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-950" role="status">
                Em đã hoàn thành các câu hỏi của bài này. Hãy thay đổi mô hình để tự kiểm tra lại kết luận.
                <button type="button" onClick={() => { setGuidedStep(0); setGuidedChoice(null); setGuidedResultShown(false); }} className="ml-2 underline">Làm lại</button>
              </div>
            )}
          </section>
        </aside>
        <div className="min-w-0 space-y-4 lg:col-span-8">
        {/* Left Column: Interactive Unit Circle (6 cols) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center">
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
              <button type="button" onClick={() => { void copySvgToClipboard(circleSvgRef.current).then(setCopyNotice).catch(error => setCopyNotice(error instanceof Error ? error.message : "Không thể chép hình.")); }} className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-teal-700 px-2 text-[11px] font-bold text-white" title="Chép hình vào Word"><Copy size={13}/> Word</button>
            </div>
          </div>

          {/* SVG Unit Circle Canvas */}
          <div className="w-full flex justify-center py-2 select-none relative">
            <svg
              ref={circleSvgRef}
              viewBox={`0 0 ${cSvgW} ${cSvgH}`}
              className="w-full max-w-[480px] h-auto cursor-crosshair touch-none"
              onPointerDown={handleCirclePointerDown}
              onPointerMove={handleCirclePointerMove}
              onPointerUp={handleCirclePointerUp}
              onPointerCancel={handleCirclePointerUp}
            >
              {/* Coordinate grid */}
              {[-0.5, 0.5].map(value => <g key={`grid-${value}`} opacity=".55"><line x1={cX + value*cR} y1={cY-cR} x2={cX + value*cR} y2={cY+cR} stroke="#CBD5E1" strokeWidth=".8" strokeDasharray="2 4"/><line x1={cX-cR} y1={cY-value*cR} x2={cX+cR} y2={cY-value*cR} stroke="#CBD5E1" strokeWidth=".8" strokeDasharray="2 4"/></g>)}
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
              {(mode === "circle" || guidedLessonIndex === 1 || waveMode === "tan" || waveMode === "cot") && (
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

              {linkedArcs.map(arc => {
                const linked = linkedPoint(arc);
                const color = LINKED_ARCS.find(item => item.id === arc)?.color ?? "#334155";
                return <g key={`linked-${arc}`}><line x1={mScreenX} y1={mScreenY} x2={linked.x} y2={linked.y} stroke={color} strokeWidth="1.3" strokeDasharray="4 3"/><line x1={linked.x} y1={linked.y} x2={linked.x} y2={cY} stroke={color} strokeWidth="1.1" strokeDasharray="3 3"/><line x1={linked.x} y1={linked.y} x2={cX} y2={linked.y} stroke={color} strokeWidth="1.1" strokeDasharray="3 3"/><circle cx={linked.x} cy={linked.y} r="5" fill={color} stroke="white" strokeWidth="1.5"/><text x={linked.x+7} y={linked.y-7} fill={color} fontSize="10" fontWeight="700">M′</text></g>;
              })}

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

          <div className="w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-slate-800">Cung liên kết</strong><label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"><input type="checkbox" checked={magneticSnap} onChange={event => setMagneticSnap(event.target.checked)} className="accent-purple-700"/><Magnet size={14}/> Hút góc đặc biệt</label></div>
            <div className="flex flex-wrap gap-1.5">{LINKED_ARCS.map(arc => <button key={arc.id} type="button" onClick={() => setLinkedArcs(current => current.includes(arc.id) ? current.filter(value => value !== arc.id) : [...current, arc.id])} aria-pressed={linkedArcs.includes(arc.id)} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold ${linkedArcs.includes(arc.id) ? "border-purple-300 bg-white text-purple-900" : "border-slate-200 bg-white text-slate-600"}`}><i className="h-2 w-2 rounded-full" style={{backgroundColor:arc.color}}/>{arc.title}<MathFormattedText text={`$${arc.formula}$`}/></button>)}</div>
            {linkedArcs.length > 0 && <div className="grid gap-1 border-t border-slate-200 pt-2 sm:grid-cols-2">{linkedArcs.map(arcId => { const arc = LINKED_ARCS.find(item => item.id === arcId)!; const linked = linkedPoint(arcId); return <p key={`value-${arcId}`} className="text-[11px] text-slate-700"><MathFormattedText text={`$\\sin(${arc.formula})=${linked.sin.toFixed(3)},\\quad \\cos(${arc.formula})=${linked.cos.toFixed(3)}$`}/></p>; })}</div>}
          </div>
          {copyNotice && <p role="status" className="w-full text-xs text-teal-700">{copyNotice}</p>}

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
              onChange={(e) => setAngleDeg(snapAngle(parseInt(e.target.value, 10)))}
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
              <svg viewBox={`0 0 ${waveSvgW} ${waveSvgH}`} className="block h-auto max-h-[360px] w-full" role="img" aria-label={`Đồ thị hàm số ${waveMode}, đang xem quanh góc ${angleDeg} độ`}>
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
                {guidedStep >= currentGuidedSteps.length && <div className="p-2 rounded-xl bg-white border border-rose-200 text-[11px] space-y-1">
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
                </div>}
              </div>
            )}

            {/* Lesson 0 & general insight */}
            {guidedLessonIndex === 0 && guidedStep >= currentGuidedSteps.length && (
              <div className="text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <strong>Đối chiếu Task LG-MH01:</strong> Góc α = -765° tách thành <code>(-2) × 360° - 45°</code>, tương ứng với quay 2 vòng theo chiều âm và đi tiếp -45° (trùng điểm biểu diễn góc 315° = 7π/4 ở góc phần tư IV).
              </div>
            )}
          </div>

        </div>
      </div>
      </>}
      </div>
    </div>
  );
}
