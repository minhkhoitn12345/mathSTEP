"use client";

import React, { useState } from "react";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Box,
  Eye,
  EyeOff,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";

interface SpatialGeometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
}

export function SpatialGeometryLab({ onBackToHome, onOpenSocraticDrawer }: SpatialGeometryLabProps) {
  const moduleConfig = CORE_3_MODULES[1]; // Module 2
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const currentLesson: LessonUnit = moduleConfig.lessons[selectedLessonIndex] || moduleConfig.lessons[0];

  // 3D Parameters according to Task SG-M2-01
  // Base A(-2, -1.5, 0), B(2, -1.5, 0), C(3, 1.5, 0), D(-1, 1.5, 0) (Parallelogram)
  // Apex S(0, 0, 4)
  const [apexX, setApexX] = useState(0);
  const [apexY, setApexY] = useState(0);
  const [apexZ, setApexZ] = useState(4.5);
  const [ratioN, setRatioN] = useState<number>(2 / 3); // 2:1 ratio (2/3 of SB)

  // 3D Interaction View Controls
  const [rotX, setRotX] = useState<number>(24);
  const [rotY, setRotY] = useState<number>(-38);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles for visual explorations
  const [showSectionPlane, setShowSectionPlane] = useState<boolean>(true);
  const [showCenterO, setShowCenterO] = useState<boolean>(true);
  const [showPointsMN, setShowPointsMN] = useState<boolean>(true);
  const [isUnfolded, setIsUnfolded] = useState<boolean>(false); // Trải phẳng
  const [unfoldAngle, setUnfoldAngle] = useState<number>(0); // 0 (closed) to 90 (flat)
  const [transparentMode, setTransparentMode] = useState<boolean>(false);

  // SVG viewport dimensions
  const svgW = 540;
  const svgH = 460;
  const originX = svgW / 2;
  const originY = svgH / 2 + 30;
  const scale = 42 * zoom;

  // Parallelogram base points
  const baseA = [-2.2, -1.4, 0] as [number, number, number];
  const baseB = [1.8, -1.4, 0] as [number, number, number];
  const baseC = [2.6, 1.4, 0] as [number, number, number];
  const baseD = [-1.4, 1.4, 0] as [number, number, number];

  // Center O = midpoint of AC and BD
  const centerO = [
    (baseA[0] + baseC[0]) / 2,
    (baseA[1] + baseC[1]) / 2,
    0,
  ] as [number, number, number];

  // Apex S
  const apexS = [apexX, apexY, apexZ] as [number, number, number];

  // Midpoint M of SA: M = (S + A) / 2
  const pointM = [
    (apexS[0] + baseA[0]) / 2,
    (apexS[1] + baseA[1]) / 2,
    (apexS[2] + baseA[2]) / 2,
  ] as [number, number, number];

  // Point N on SB with SN:NB = 2:1 => N = S + (2/3)*(B - S)
  const pointN = [
    apexS[0] + ratioN * (baseB[0] - apexS[0]),
    apexS[1] + ratioN * (baseB[1] - apexS[1]),
    apexS[2] + ratioN * (baseB[2] - apexS[2]),
  ] as [number, number, number];

  // Section plane parallel to base passing through M:
  // Cuts SB at P, SC at Q, SD at R (all midpoints)
  const pointP = [(apexS[0] + baseB[0]) / 2, (apexS[1] + baseB[1]) / 2, (apexS[2] + baseB[2]) / 2] as [number, number, number];
  const pointQ = [(apexS[0] + baseC[0]) / 2, (apexS[1] + baseC[1]) / 2, (apexS[2] + baseC[2]) / 2] as [number, number, number];
  const pointR = [(apexS[0] + baseD[0]) / 2, (apexS[1] + baseD[1]) / 2, (apexS[2] + baseD[2]) / 2] as [number, number, number];

  // 3D Projection math: Rotate around X and Y axes
  const project3D = (coord: [number, number, number]): { x: number; y: number; zDepth: number } => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const [x, y, z] = coord;
    // Rotate around Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const y1 = y;
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate around X
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Screen projection (Isometric)
    const sx = originX + x2 * scale;
    const sy = originY - y2 * scale;
    return { x: sx, y: sy, zDepth: z2 };
  };

  // Screen projected coordinates
  const pS = project3D(apexS);
  const pA = project3D(baseA);
  const pB = project3D(baseB);
  const pC = project3D(baseC);
  const pD = project3D(baseD);
  const pO = project3D(centerO);
  const pM = project3D(pointM);
  const pN = project3D(pointN);
  const pP = project3D(pointP);
  const pQ = project3D(pointQ);
  const pR = project3D(pointR);

  // Hidden edge deduction based on viewing angle
  const isHiddenEdge = (name1: string, name2: string) => {
    if (transparentMode) return false;
    // In classic SGK view, DA and CD/AB depending on azimuth
    const normalizedRotY = ((rotY % 360) + 360) % 360;
    if (normalizedRotY >= 0 && normalizedRotY < 180) {
      if ((name1 === "A" && name2 === "D") || (name1 === "D" && name2 === "A")) return true;
      if ((name1 === "S" && name2 === "A") || (name1 === "A" && name2 === "S")) return true;
      if ((name1 === "A" && name2 === "B") || (name1 === "B" && name2 === "A")) return true;
    }
    return false;
  };

  // Drag handlers for mouse/touch 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRotating) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => prev + dx * 0.6);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.6)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => setIsRotating(false);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer shadow-xs"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                CHUYÊN ĐỀ 2
              </span>
              <span className="text-xs text-slate-500 font-medium">Toán 11 · GDPT 2018</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dựng Hình & Khảo Sát Quan Hệ Không Gian 3D
            </h1>
          </div>
        </div>

        {/* Action: Hỏi Socratic AI */}
        {onOpenSocraticDrawer && (
          <button
            type="button"
            onClick={() =>
              onOpenSocraticDrawer(
                `Em đang thực hành ${currentLesson.title} thuộc Chuyên đề 2 Hình học không gian. Thầy Opti hướng dẫn giúp em với ạ!`
              )
            }
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <OptiMascot expression="thinking" size={20} animate={false} />
            <span>Hỏi Opti về hình này</span>
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
              if (idx === 3) setShowSectionPlane(true);
              if (idx === 4) setIsUnfolded(true);
            }}
            className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedLessonIndex === idx
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25"
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
                  selectedLessonIndex === idx ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {lesson.difficulty}
              </span>
            </div>
            <div className="font-bold text-xs truncate">{lesson.title.split(":")[0]}</div>
            <div
              className={`text-[10px] truncate ${
                selectedLessonIndex === idx ? "text-emerald-100" : "text-slate-500"
              }`}
            >
              {lesson.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* 3. MAIN WORKBENCH: 3D CANVAS & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 3D SVG Projection Screen (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center">
          {/* Canvas Toolbar Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">
                Mô hình 3D: Chóp S.ABCD (Nhiệm vụ SG-M2-01)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setRotX(24);
                  setRotY(-38);
                  setZoom(1.0);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Đặt lại góc nhìn chuẩn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTransparentMode((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                  transparentMode ? "bg-emerald-100 text-emerald-800 font-bold" : "hover:bg-slate-100"
                }`}
                title="Bật/Tắt chế độ trong suốt"
              >
                {transparentMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive SVG Projection */}
          <div
            className="w-full relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl my-3 cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400/80 bg-slate-900/60 px-2 py-0.5 rounded-md border border-emerald-500/20 pointer-events-none">
              Góc nhìn: X={rotX.toFixed(0)}°, Y={rotY.toFixed(0)}° (Kéo chuột xoay 360°)
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-[360px] sm:h-[420px]"
            >
              <defs>
                <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Parallelogram Base Surface ABCD */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                fill="url(#baseGrad)"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("A", "D") ? "4,4" : undefined}
              />

              {/* Diagonal lines AC and BD meeting at center O */}
              {showCenterO && (
                <>
                  <line
                    x1={pA.x}
                    y1={pA.y}
                    x2={pC.x}
                    y2={pC.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={pB.x}
                    y1={pB.y}
                    x2={pD.x}
                    y2={pD.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                </>
              )}

              {/* Section Plane (P) passing through M parallel to base: MPQR */}
              {showSectionPlane && selectedLessonIndex >= 3 && (
                <polygon
                  points={`${pM.x},${pM.y} ${pP.x},${pP.y} ${pQ.x},${pQ.y} ${pR.x},${pR.y}`}
                  fill="url(#planeGrad)"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
              )}

              {/* Lateral Edges from Apex S to Base */}
              {/* SA */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pA.x}
                y2={pA.y}
                stroke="#E2E8F0"
                strokeWidth={isHiddenEdge("S", "A") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "A") ? "4,4" : undefined}
              />
              {/* SB */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pB.x}
                y2={pB.y}
                stroke="#E2E8F0"
                strokeWidth={isHiddenEdge("S", "B") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "B") ? "4,4" : undefined}
              />
              {/* SC */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pC.x}
                y2={pC.y}
                stroke="#E2E8F0"
                strokeWidth={isHiddenEdge("S", "C") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "C") ? "4,4" : undefined}
              />
              {/* SD */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pD.x}
                y2={pD.y}
                stroke="#E2E8F0"
                strokeWidth={isHiddenEdge("S", "D") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "D") ? "4,4" : undefined}
              />

              {/* Base edges */}
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pB.x}
                y2={pB.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("A", "B") ? "4,4" : undefined}
              />
              <line
                x1={pB.x}
                y1={pB.y}
                x2={pC.x}
                y2={pC.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("B", "C") ? "4,4" : undefined}
              />
              <line
                x1={pC.x}
                y1={pC.y}
                x2={pD.x}
                y2={pD.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("C", "D") ? "4,4" : undefined}
              />
              <line
                x1={pD.x}
                y1={pD.y}
                x2={pA.x}
                y2={pA.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("D", "A") ? "4,4" : undefined}
              />

              {/* Point Markers & Labels */}
              {/* S */}
              <circle cx={pS.x} cy={pS.y} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={pS.x} y={pS.y - 8} fill="#FCA5A5" fontSize="13" fontWeight="bold" textAnchor="middle">
                S
              </text>

              {/* A */}
              <circle cx={pA.x} cy={pA.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pA.x - 10} y={pA.y + 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                A
              </text>

              {/* B */}
              <circle cx={pB.x} cy={pB.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pB.x + 8} y={pB.y + 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                B
              </text>

              {/* C */}
              <circle cx={pC.x} cy={pC.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pC.x + 8} y={pC.y} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                C
              </text>

              {/* D */}
              <circle cx={pD.x} cy={pD.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pD.x - 12} y={pD.y - 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                D
              </text>

              {/* Center O */}
              {showCenterO && (
                <>
                  <circle cx={pO.x} cy={pO.y} r="3.5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1" />
                  <text x={pO.x} y={pO.y + 12} fill="#FDE68A" fontSize="11" fontWeight="bold" textAnchor="middle">
                    O
                  </text>
                </>
              )}

              {/* Midpoint M on SA */}
              {showPointsMN && selectedLessonIndex >= 1 && (
                <>
                  <circle cx={pM.x} cy={pM.y} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={pM.x - 14} y={pM.y - 2} fill="#6EE7B7" fontSize="12" fontWeight="bold">
                    M (1/2)
                  </text>
                </>
              )}

              {/* Point N on SB (SN:NB = 2:1) */}
              {showPointsMN && selectedLessonIndex >= 1 && (
                <>
                  <circle cx={pN.x} cy={pN.y} r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={pN.x + 8} y={pN.y} fill="#FCD34D" fontSize="12" fontWeight="bold">
                    N (2/3)
                  </text>
                </>
              )}

              {/* Section Points P, Q, R */}
              {showSectionPlane && selectedLessonIndex >= 3 && (
                <>
                  <circle cx={pP.x} cy={pP.y} r="3.5" fill="#34D399" />
                  <circle cx={pQ.x} cy={pQ.y} r="3.5" fill="#34D399" />
                  <circle cx={pR.x} cy={pR.y} r="3.5" fill="#34D399" />
                </>
              )}
            </svg>
          </div>

          {/* Quick Sliders below 3D canvas */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Chiều cao S (z):</span>
                <span className="font-mono font-bold text-emerald-700">{apexZ.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="7.0"
                step="0.2"
                value={apexZ}
                onChange={(e) => setApexZ(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Lệch đỉnh S (x):</span>
                <span className="font-mono font-bold text-emerald-700">{apexX.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.2"
                value={apexX}
                onChange={(e) => setApexX(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Thu phóng (Zoom):</span>
                <span className="font-mono font-bold text-emerald-700">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Pedagogical Instructions & Diagnostic Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Current Lesson Guide */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800">
                {currentLesson.code}
              </span>
              <h2 className="font-bold text-sm text-slate-900">{currentLesson.title}</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{currentLesson.description}</p>

            {/* Steps in this lesson */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {currentLesson.steps.map((st) => (
                <div key={st.stepNumber} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {st.stepNumber}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800">{st.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7">{st.instruction}</p>

                  {/* Socratic Questions */}
                  {st.socraticQuestions && st.socraticQuestions.length > 0 && (
                    <div className="mt-2 pl-7 pt-1.5 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3 h-3 text-emerald-600" />
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

          {/* Diagnostic Box: SG01 - SG16 Misconception Checks */}
          <div className="bg-emerald-50/60 rounded-3xl p-4 sm:p-5 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs">Chẩn đoán sai lầm thường gặp ({currentLesson.errorCodes.join(", ")})</h3>
            </div>
            <div className="text-[11px] text-emerald-800 leading-relaxed space-y-1.5">
              <p>
                <strong>Quy tắc đối chiếu:</strong> Khi kéo đỉnh S làm thay đổi cấu hình, trung điểm M và điểm chia đoạn N luôn được cập nhật chính xác theo quan hệ phụ thuộc.
              </p>
              <div className="p-2 rounded-xl bg-white/80 border border-emerald-200 text-slate-700">
                <span className="font-bold text-emerald-900">[SG07] Cảnh báo giao trên ảnh:</span> Hai đường thẳng AB và SD chéo nhau trong không gian nhưng có thể cắt nhau trên hình chiếu ở một số góc nhìn. Hãy xoay 360° để kiểm chứng!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
