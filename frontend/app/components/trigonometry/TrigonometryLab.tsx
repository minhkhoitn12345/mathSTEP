"use client";

import React, { useState, useMemo, useRef } from "react";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  Compass,
  ArrowLeft,
  HelpCircle,
  Activity,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";

interface TrigonometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
}

export function TrigonometryLab({ onBackToHome, onOpenSocraticDrawer }: TrigonometryLabProps) {
  const moduleConfig = CORE_3_MODULES[2]; // Module 3
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const currentLesson: LessonUnit = moduleConfig.lessons[selectedLessonIndex] || moduleConfig.lessons[0];

  // Core angle in degrees (Defaults to -765° from Task LG-MH01)
  const [angleDeg, setAngleDeg] = useState<number>(-765);
  const [waveMode, setWaveMode] = useState<"sin" | "cos">("sin");
  const [showSpecialAngles, setShowSpecialAngles] = useState<boolean>(true);
  const [showProjections, setShowProjections] = useState<boolean>(true);

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
  // Normalized representative angle in [0, 360)
  const repAngleDeg = ((angleDeg % 360) + 360) % 360;
  const repAngleRad = (repAngleDeg * Math.PI) / 180;

  // Number of complete turns k
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

  // Quadrant detection
  const getQuadrant = () => {
    if (Math.abs(sinVal) < 1e-4 || Math.abs(cosVal) < 1e-4) return "Nằm trên trục tọa độ";
    if (cosVal > 0 && sinVal > 0) return "Góc phần tư I";
    if (cosVal < 0 && sinVal > 0) return "Góc phần tư II";
    if (cosVal < 0 && sinVal < 0) return "Góc phần tư III";
    return "Góc phần tư IV";
  };

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
    const dy = -(e.clientY - rect.top - cY); // Upwards positive
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
  const waveScaleY = 65; // px per unit

  // Generate SVG path for wave curve y = sin x or y = cos x
  const wavePath = useMemo(() => {
    let d = "";
    const startX = 0;
    const endX = 7.0; // from 0 to ~2.2*PI radians
    const step = 0.05;

    for (let x = startX; x <= endX; x += step) {
      const y = waveMode === "sin" ? Math.sin(x) : Math.cos(x);
      const sx = waveOriginX + x * waveScaleX;
      const sy = waveOriginY - y * waveScaleY;
      d += `${x === startX ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }
    return d;
  }, [waveMode, waveOriginY]);

  // Synchronized point on the wave graph
  const curWaveY = waveMode === "sin" ? sinVal : cosVal;
  const curWaveScreenX = waveOriginX + repAngleRad * waveScaleX;
  const curWaveScreenY = waveOriginY - curWaveY * waveScaleY;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
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
                `Em đang tìm hiểu ${currentLesson.title} thuộc Chuyên đề 3 Lượng giác. Thầy Opti hướng dẫn giúp em với ạ!`
              )
            }
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <OptiMascot expression="happy" size={20} animate={false} />
            <span>Hỏi Opti về lượng giác</span>
          </button>
        )}
      </div>

      {/* 2. PROGRESSIVE LESSON SELECTOR TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {moduleConfig.lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => {
              setSelectedLessonIndex(idx);
              if (idx === 0) setAngleDeg(-765);
              if (idx === 3) setWaveMode("sin");
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
      </div>

      {/* 3. SPLIT WORKBENCH: UNIT CIRCLE (LEFT) + WAVE GRAPH (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Unit Circle (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Đường tròn lượng giác đơn vị Oxy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAngleDeg(-765)}
                className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] transition-colors"
                title="Khảo sát bài toán mẫu -765°"
              >
                Góc mẫu -765°
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

          {/* SVG Unit Circle */}
          <div className="w-full flex justify-center py-2 select-none">
            <svg
              ref={circleSvgRef}
              viewBox={`0 0 ${cSvgW} ${cSvgH}`}
              className="w-full max-w-[320px] h-auto cursor-crosshair"
              onPointerDown={handleCirclePointerDown}
              onPointerMove={handleCirclePointerMove}
              onPointerUp={handleCirclePointerUp}
              onPointerLeave={handleCirclePointerUp}
            >
              {/* Axes */}
              <line x1="20" y1={cY} x2={cSvgW - 20} y2={cY} stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1={cX} y1="20" x2={cX} y2={cSvgH - 20} stroke="#CBD5E1" strokeWidth="1.5" />
              {/* Axis labels */}
              <text x={cSvgW - 15} y={cY - 6} fill="#64748B" fontSize="11" fontWeight="bold">
                cos
              </text>
              <text x={cX + 6} y="15" fill="#64748B" fontSize="11" fontWeight="bold">
                sin
              </text>

              {/* Unit Circle */}
              <circle cx={cX} cy={cY} r={cR} fill="none" stroke="#8B5CF6" strokeWidth="2" />

              {/* Radius OA (Tia đầu Ox) */}
              <line x1={cX} y1={cY} x2={cX + cR} y2={cY} stroke="#3B82F6" strokeWidth="2.5" />
              <text x={cX + cR + 6} y={cY + 4} fill="#2563EB" fontSize="12" fontWeight="bold">
                A (1,0)
              </text>

              {/* Radius OM (Tia cuối) */}
              <line x1={cX} y1={cY} x2={mScreenX} y2={mScreenY} stroke="#7C3AED" strokeWidth="2.5" />

              {/* Projections onto Cos and Sin Axes */}
              {showProjections && (
                <>
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
                </>
              )}

              {/* Terminal Point M */}
              <circle cx={mScreenX} cy={mScreenY} r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <text x={mScreenX + 8} y={mScreenY - 6} fill="#D97706" fontSize="12" fontWeight="bold">
                M (cos, sin)
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
              <span className="text-[10px] text-slate-500 block">tan α & cot α</span>
              <span className="font-mono font-black text-xs text-amber-700">
                {tanVal !== null ? tanVal.toFixed(2) : "Không XĐ"}
              </span>
            </div>
          </div>

          {/* Quick Angle Slider */}
          <div className="w-full pt-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Trượt thay đổi góc α:</span>
              <span className="font-mono font-bold text-purple-700">{angleDeg}°</span>
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
        </div>

        {/* Right Column: Synchronized Wave Graph & Pedagogical Step Instructions (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Wave Plot Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800">
                  Đồ thị hàm số tuần hoàn (Chu kỳ T = 2π)
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
                  y = sin(x)
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
                  y = cos(x)
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
              </svg>
            </div>

            {/* Insight Note */}
            <div className="text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
              <strong>Đối chiếu Task LG-MH04:</strong> Góc α = -765° và α = 315° có cùng tung độ trên đường tròn đơn vị, nhưng trên đồ thị sóng hoành độ của chúng cách nhau đúng 6π (3 chu kỳ hoàn chỉnh).
            </div>
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
