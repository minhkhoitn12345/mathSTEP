"use client";

import React, { useState, useMemo, useRef } from "react";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  Compass,
  ArrowLeft,
  HelpCircle,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";

interface TrigonometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
  initialLessonIndex?: number;
  embedded?: boolean;
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

  // Core angle in degrees (Defaults to -765° from Task LG-MH01)
  const [angleDeg, setAngleDeg] = useState<number>(-765);
  const [waveMode, setWaveMode] = useState<"sin" | "cos">("sin");
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad">("deg");

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
  const repAngleRad = (repAngleDeg * Math.PI) / 180;

  // Complete turns k
  const completeTurns = Math.floor(Math.abs(angleDeg) / 360) * (angleDeg < 0 ? -1 : 1);
  const remainingDeg = angleDeg - completeTurns * 360;

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
  const doubleAngleRad = 2 * angleRad;
  const sin2a = 2 * sinVal * cosVal;
  const cos2a = cosVal * cosVal - sinVal * sinVal;
  const doubleScreenX = cX + cR * cos2a;
  const doubleScreenY = cY - cR * sin2a;

  // Tangent and Cotangent projection screen coords
  const tanScreenY = tanVal !== null ? cY - cR * Math.max(-2.5, Math.min(2.5, tanVal)) : null;
  const cotScreenX = cotVal !== null ? cX + cR * Math.max(-2.5, Math.min(2.5, cotVal)) : null;

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
  const waveSvgW = 420;
  const waveSvgH = 340;
  const waveOriginX = 40;
  const waveOriginY = waveSvgH / 2;
  const waveScaleX = 50; // px per radian
  const waveScaleY = 55; // px per unit

  // Generate SVG path for wave curve y = a * sin(b * x + c) + d
  const wavePath = useMemo(() => {
    let d = "";
    const startX = 0;
    const endX = 7.0; // from 0 to ~2.2*PI radians
    const step = 0.04;

    for (let x = startX; x <= endX; x += step) {
      let y = 0;
      if (selectedLessonIndex === 3) {
        // Full transformation
        y =
          waveMode === "sin"
            ? ampA * Math.sin(freqB * x + phaseC) + shiftD
            : ampA * Math.cos(freqB * x + phaseC) + shiftD;
      } else {
        y = waveMode === "sin" ? Math.sin(x) : Math.cos(x);
      }

      const sx = waveOriginX + x * waveScaleX;
      const sy = waveOriginY - y * waveScaleY;
      d += `${x === startX ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }
    return d;
  }, [selectedLessonIndex, waveMode, ampA, freqB, phaseC, shiftD, waveOriginX, waveOriginY]);

  // Synchronized point on the wave graph
  const curWaveY =
    selectedLessonIndex === 3
      ? waveMode === "sin"
        ? ampA * Math.sin(freqB * repAngleRad + phaseC) + shiftD
        : ampA * Math.cos(freqB * repAngleRad + phaseC) + shiftD
      : waveMode === "sin"
      ? sinVal
      : cosVal;

  const curWaveScreenX = waveOriginX + repAngleRad * waveScaleX;
  const curWaveScreenY = waveOriginY - curWaveY * waveScaleY;

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

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 ${embedded ? "py-3 sm:py-4 space-y-4" : "py-4 sm:py-6 space-y-6"}`}>
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

        {/* Action: Hỏi Socratic AI */}
        {onOpenSocraticDrawer && (
          <button
            type="button"
            onClick={() =>
              onOpenSocraticDrawer(
                `Em đang tìm hiểu ${currentLesson.code}: ${currentLesson.title} thuộc Chuyên đề 3 Lượng giác. Thầy Opti hướng dẫn giúp em với ạ!`
              )
            }
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <OptiMascot expression="happy" size={20} animate={false} />
            <span>Hỏi Opti về lượng giác</span>
          </button>
        )}
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
          <div><p className="font-bold text-purple-950">{currentLesson.title}</p><p className="mt-0.5 text-xs leading-relaxed text-purple-900">{currentLesson.steps[0]?.instruction || currentLesson.description} Thử thay đổi góc hoặc tham số bên dưới để xem đại lượng trên hình thay đổi như thế nào.</p></div>
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
                {selectedLessonIndex === 0 && "Bài 1: Góc lượng giác α & Vệt quay xoắn ốc"}
                {selectedLessonIndex === 1 && "Bài 2: Giá trị Sin, Cos & 4 góc phần tư"}
                {selectedLessonIndex === 2 && "Bài 3: Cung liên kết đối xứng & Nhân đôi"}
                {selectedLessonIndex === 3 && "Bài 4: Chuyển động tròn sinh ra sóng"}
                {selectedLessonIndex === 4 && "Bài 5: Nghiệm sin(x) = m trên đường tròn"}
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
              {selectedLessonIndex === 0 && spiralPath && (
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
              {selectedLessonIndex === 1 && (
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
                  <text x={cX + cR + 4} y={cY - 110} fill="#EA580C" fontSize="10" fontWeight="bold">
                    Trục Tan
                  </text>
                  {tanScreenY !== null && (
                    <circle cx={cX + cR} cy={tanScreenY} r="3.5" fill="#F97316" />
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
                  <text x={cX + 80} y={cY - cR - 4} fill="#9333EA" fontSize="10" fontWeight="bold">
                    Trục Cot
                  </text>
                  {cotScreenX !== null && (
                    <circle cx={cotScreenX} cy={cY - cR} r="3.5" fill="#A855F7" />
                  )}
                </>
              )}

              {/* LESSON 3: Reflections: M' (Cung bù) and M'' (Cung đối) */}
              {selectedLessonIndex === 2 && (
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
              {selectedLessonIndex === 4 && (
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
          {selectedLessonIndex === 1 && (
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
          {selectedLessonIndex === 2 && (
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
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800">
                  {selectedLessonIndex === 3
                    ? `Đồ thị y = ${ampA !== 1 ? ampA + "·" : ""}${waveMode}(${freqB !== 1 ? freqB + "·" : ""}x${phaseC !== 0 ? (phaseC > 0 ? " + " + phaseC.toFixed(1) : " - " + Math.abs(phaseC).toFixed(1)) : ""})${shiftD !== 0 ? (shiftD > 0 ? " + " + shiftD : " - " + Math.abs(shiftD)) : ""}`
                    : `Đồ thị hàm số tuần hoàn y = ${waveMode}(x) (T = 2π)`}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWaveMode("sin")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    waveMode === "sin"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  sin(x)
                </button>
                <button
                  type="button"
                  onClick={() => setWaveMode("cos")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    waveMode === "cos"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  cos(x)
                </button>
              </div>
            </div>

            {/* SVG Wave Canvas */}
            <div className="w-full overflow-hidden bg-slate-900 rounded-2xl p-2 select-none">
              <svg viewBox={`0 0 ${waveSvgW} ${waveSvgH}`} className="w-full h-[180px]">
                {/* Center X Axis */}
                <line x1={waveOriginX} y1={waveOriginY} x2={waveSvgW - 10} y2={waveOriginY} stroke="#475569" strokeWidth="1" />
                <line x1={waveOriginX} y1="20" x2={waveOriginX} y2={waveSvgH - 20} stroke="#475569" strokeWidth="1" />

                {/* Grid ticks: 0, pi, 2pi */}
                <text x={waveOriginX + Math.PI * waveScaleX} y={waveOriginY + 14} fill="#94A3B8" fontSize="10" textAnchor="middle">
                  π
                </text>
                <text x={waveOriginX + 2 * Math.PI * waveScaleX} y={waveOriginY + 14} fill="#94A3B8" fontSize="10" textAnchor="middle">
                  2π
                </text>

                {/* Wave Curve */}
                <path d={wavePath} fill="none" stroke="#A78BFA" strokeWidth="2.5" />

                {/* Synchronized Point on Wave Curve */}
                <circle cx={curWaveScreenX} cy={curWaveScreenY} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                <line
                  x1={curWaveScreenX}
                  y1={waveOriginY}
                  x2={curWaveScreenX}
                  y2={curWaveScreenY}
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* LESSON 5: Horizontal line y = eqM cutting the wave */}
                {selectedLessonIndex === 4 && (
                  <>
                    <line
                      x1={waveOriginX}
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
              </svg>
            </div>

            {/* LESSON 4: Sliders for Amplitude, Frequency, Phase, Shift */}
            {selectedLessonIndex === 3 && (
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
            {selectedLessonIndex === 4 && (
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
            {selectedLessonIndex === 0 && (
              <div className="text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <strong>Đối chiếu Task LG-MH01:</strong> Góc α = -765° tách thành <code>(-2) × 360° - 45°</code>, tương ứng với quay 2 vòng theo chiều âm và đi tiếp -45° (trùng điểm biểu diễn góc 315° = 7π/4 ở góc phần tư IV).
              </div>
            )}
          </div>

          {/* Current Lesson Guide Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-100 text-purple-800">
                {currentLesson.code}
              </span>
              <h2 className="font-bold text-sm text-slate-900">{currentLesson.title}</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{currentLesson.description}</p>

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
                  <p className="text-[11px] text-slate-600 pl-7">{st.instruction}</p>

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
                            {q}
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
