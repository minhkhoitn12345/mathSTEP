"use client";

import React, { useState, useMemo, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, Target, SlidersHorizontal, CheckCircle2, Compass, Layers } from "lucide-react";
import { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";
import { SingleInequalityLab } from "@/app/components/optimath/SingleInequalityLab";
import { SystemInequalityLab } from "@/app/components/optimath/SystemInequalityLab/SystemInequalityLab";
import { OptimizationLab } from "@/app/components/optimath/OptimizationLab/OptimizationLab";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";

export interface LinearConstraint {
  id: string;
  a: number;
  b: number;
  c: number;
  op: "<=" | "<" | ">=" | ">";
  label?: string;
  color: string;
  enabled: boolean;
}

const DEFAULT_CONSTRAINTS: LinearConstraint[] = [
  { id: "c1", a: 1, b: 1, c: 6, op: "<=", label: "x + y ≤ 6 (Thời gian)", color: "#2563eb", enabled: true },
  { id: "c2", a: 2, b: -1, c: 4, op: "<=", label: "2x - y ≤ 4 (Nguyên liệu)", color: "#dc2626", enabled: true },
  { id: "c3", a: 1, b: 0, c: 0, op: ">=", label: "x ≥ 0", color: "#059669", enabled: true },
  { id: "c4", a: 0, b: 1, c: 0, op: ">=", label: "y ≥ 0", color: "#d97706", enabled: true },
];

export default function DynamicLinearProgrammingLab() {
  const { params, setParamVal } = useDynamicMathStore();
  const [labTab, setLabTab] = useState<"quick" | "single_7step" | "system_7step" | "optimization_7step">("quick");

  // Constraints state
  const [constraints, setConstraints] = useState<LinearConstraint[]>(DEFAULT_CONSTRAINTS);
  const [isAddingConstraint, setIsAddingConstraint] = useState(false);
  const [newA, setNewA] = useState(1);
  const [newB, setNewB] = useState(2);
  const [newC, setNewC] = useState(8);
  const [newOp, setNewOp] = useState<"<=" | ">=">("<=");

  // Mode: Integer points lattice
  const [lockInteger, setLockInteger] = useState(false);

  // Dragging test point M(x0, y0)
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 2, y: 2 });
  const [isDraggingM, setIsDraggingM] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Objective function coeffs from store or defaults
  const u = params.u?.val ?? 3;
  const v = params.v?.val ?? 2;
  const k = params.k?.val ?? 12;

  // View bounds for Oxy (World space)
  const xMin = -1;
  const xMax = 9;
  const yMin = -1;
  const yMax = 8;
  const svgWidth = 520;
  const svgHeight = 440;

  // Coordinates transform: World -> Screen
  const toScreenX = (wx: number) => ((wx - xMin) / (xMax - xMin)) * svgWidth;
  const toScreenY = (wy: number) => svgHeight - ((wy - yMin) / (yMax - yMin)) * svgHeight;
  const toWorldX = (sx: number) => xMin + (sx / svgWidth) * (xMax - xMin);
  const toWorldY = (sy: number) => yMin + ((svgHeight - sy) / svgHeight) * (yMax - yMin);

  // Intersection solver between 2 lines: a1*x + b1*y = c1 and a2*x + b2*y = c2
  const intersectLines = (
    l1: { a: number; b: number; c: number },
    l2: { a: number; b: number; c: number }
  ): { x: number; y: number } | null => {
    const det = l1.a * l2.b - l2.a * l1.b;
    if (Math.abs(det) < 1e-6) return null;
    const x = (l1.c * l2.b - l2.c * l1.b) / det;
    const y = (l1.a * l2.c - l2.a * l1.c) / det;
    return { x, y };
  };

  // Check if a point satisfies a constraint
  const satisfies = (pt: { x: number; y: number }, c: LinearConstraint) => {
    const val = c.a * pt.x + c.b * pt.y;
    if (c.op === "<=") return val <= c.c + 1e-5;
    if (c.op === "<") return val < c.c - 1e-5;
    if (c.op === ">=") return val >= c.c - 1e-5;
    return val > c.c + 1e-5;
  };

  // Compute all polygon vertices of the feasible region (Sutherland-Hodgman / Half-plane intersection)
  const activeConstraints = useMemo(() => constraints.filter((c) => c.enabled), [constraints]);

  const { polygonVertices, optimalVertex, integerFeasiblePoints } = useMemo(() => {
    // Collect all candidate intersection points from active constraints + bounding box
    const lines = [
      ...activeConstraints,
      { a: 1, b: 0, c: xMin - 1, op: ">=" as const },
      { a: 1, b: 0, c: xMax + 1, op: "<=" as const },
      { a: 0, b: 1, c: yMin - 1, op: ">=" as const },
      { a: 0, b: 1, c: yMax + 1, op: "<=" as const },
    ];

    const candidates: { x: number; y: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const pt = intersectLines(lines[i], lines[j]);
        if (pt && pt.x >= xMin - 0.5 && pt.x <= xMax + 0.5 && pt.y >= yMin - 0.5 && pt.y <= yMax + 0.5) {
          // Verify satisfies all active constraints
          const valid = activeConstraints.every((c) => satisfies(pt, c));
          if (valid) {
            // Deduplicate
            const exists = candidates.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 1e-3);
            if (!exists) {
              candidates.push(pt);
            }
          }
        }
      }
    }

    // Sort vertices counter-clockwise around their centroid
    let sorted: { x: number; y: number; fVal: number; name: string }[] = [];
    if (candidates.length >= 3) {
      const cx = candidates.reduce((s, p) => s + p.x, 0) / candidates.length;
      const cy = candidates.reduce((s, p) => s + p.y, 0) / candidates.length;
      sorted = [...candidates]
        .sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx))
        .map((p, idx) => ({
          ...p,
          fVal: u * p.x + v * p.y,
          name: String.fromCharCode(65 + idx), // A, B, C, D...
        }));
    }

    // Find optimal vertex (max F)
    let opt: (typeof sorted)[0] | null = null;
    if (sorted.length > 0) {
      opt = sorted.reduce((best, cur) => (cur.fVal > best.fVal ? cur : best), sorted[0]);
    }

    // Integer points inside region
    const intPts: { x: number; y: number; fVal: number }[] = [];
    if (lockInteger) {
      for (let ix = Math.max(0, Math.ceil(xMin)); ix <= Math.floor(xMax); ix++) {
        for (let iy = Math.max(0, Math.ceil(yMin)); iy <= Math.floor(yMax); iy++) {
          const pt = { x: ix, y: iy };
          if (activeConstraints.every((c) => satisfies(pt, c))) {
            intPts.push({ x: ix, y: iy, fVal: u * ix + v * iy });
          }
        }
      }
    }

    return {
      polygonVertices: sorted,
      optimalVertex: opt,
      integerFeasiblePoints: intPts,
    };
  }, [activeConstraints, u, v, lockInteger, xMin, xMax, yMin, yMax]);

  // Handle pointer drag on test point M
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const wx = toWorldX(sx);
    const wy = toWorldY(sy);
    // If clicked near test point or canvas, drag it
    setTestPoint({
      x: Math.round(wx * 10) / 10,
      y: Math.round(wy * 10) / 10,
    });
    setIsDraggingM(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingM) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    let wx = Math.max(xMin, Math.min(xMax, toWorldX(sx)));
    let wy = Math.max(yMin, Math.min(yMax, toWorldY(sy)));
    if (lockInteger) {
      wx = Math.round(wx);
      wy = Math.round(wy);
    } else {
      wx = Math.round(wx * 10) / 10;
      wy = Math.round(wy * 10) / 10;
    }
    setTestPoint({ x: wx, y: wy });
  };

  const handlePointerUp = () => setIsDraggingM(false);

  // Test point feasibility
  const testPointFeasible = activeConstraints.every((c) => satisfies(testPoint, c));
  const testPointF = u * testPoint.x + v * testPoint.y;

  // Add constraint handler
  const handleAddConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `c_${Date.now()}`;
    setConstraints((prev) => [
      ...prev,
      {
        id: newId,
        a: newA,
        b: newB,
        c: newC,
        op: newOp,
        label: `${newA}x + ${newB}y ${newOp === "<=" ? "≤" : "≥"} ${newC}`,
        color: "#8b5cf6",
        enabled: true,
      },
    ]);
    setIsAddingConstraint(false);
  };

  // SVG Polygon path string
  const polygonPointsStr = polygonVertices
    .map((p) => `${toScreenX(p.x)},${toScreenY(p.y)}`)
    .join(" ");

  if (labTab === "single_7step") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <OptiMascot expression="happy" size={24} animate={false} />
            <span className="font-bold text-white">Phòng thí nghiệm 1 Bất phương trình (Chuẩn SGK)</span>
          </div>
          <button
            onClick={() => setLabTab("quick")}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          >
            ← Trở lại Mô hình Oxy
          </button>
        </div>
        <SingleInequalityLab onBackToHome={() => setLabTab("quick")} />
      </div>
    );
  }

  if (labTab === "system_7step") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <OptiMascot expression="happy" size={24} animate={false} />
            <span className="font-bold text-white">Phòng thí nghiệm Hệ Bất phương trình (Đa giác & Giao điểm)</span>
          </div>
          <button
            onClick={() => setLabTab("quick")}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          >
            ← Trở lại Mô hình Oxy
          </button>
        </div>
        <SystemInequalityLab onBackToHome={() => setLabTab("quick")} />
      </div>
    );
  }

  if (labTab === "optimization_7step") {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <OptiMascot expression="cheering" size={24} animate={false} />
            <span className="font-bold text-white">Mô hình hóa & Tối ưu hóa Tuyến tính (Quy hoạch tuyến tính)</span>
          </div>
          <button
            onClick={() => setLabTab("quick")}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          >
            ← Trở lại Mô hình Oxy
          </button>
        </div>
        <OptimizationLab onBackToHome={() => setLabTab("quick")} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Thanh chuyển chế độ phòng học Optimath */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <OptiMascot expression="happy" size={28} animate={false} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Phòng Thí Nghiệm Optimath</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Native 60fps
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Chọn phân hệ thực hành chuyên sâu theo chuẩn SGK GDPT 2018
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setLabTab("quick")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              labTab === "quick"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Mô hình 2D Tự do
          </button>
          <button
            onClick={() => setLabTab("single_7step")}
            className="px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>1 BPT (7 Bước)</span>
          </button>
          <button
            onClick={() => setLabTab("system_7step")}
            className="px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Hệ BPT (Đa giác)</span>
          </button>
          <button
            onClick={() => setLabTab("optimization_7step")}
            className="px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Tối Ưu Tuyến Tính</span>
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Khung Canvas GeoGebra 2D tương tác */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Thanh công cụ phụ trợ trên đồ thị */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Mặt phẳng Oxy · Miền nghiệm đa giác lồi</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {polygonVertices.length} đỉnh
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={lockInteger}
                onChange={(e) => setLockInteger(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>Khóa lưới điểm nguyên (x, y ∈ ℕ)</span>
            </label>

            {optimalVertex && (
              <button
                type="button"
                onClick={() => setParamVal("k", optimalVertex.fVal)}
                className="text-[10.5px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
                title="Bắt dính đường mức k vào đỉnh tối ưu F_max"
              >
                Hít dính k = {formatVNFloat(optimalVertex.fVal)}
              </button>
            )}
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#f8faf9]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Lưới tọa độ Oxy */}
            <defs>
              <pattern id="gridPatternLP" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
              </pattern>
              {/* Pattern gạch chéo chuẩn SGK cho miền nghiệm */}
              <pattern id="sgkHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width={svgWidth} height={svgHeight} fill="url(#gridPatternLP)" />

            {/* Trục tọa độ Ox, Oy */}
            <line x1="0" y1={toScreenY(0)} x2={svgWidth} y2={toScreenY(0)} stroke="#64748b" strokeWidth="1.6" />
            <line x1={toScreenX(0)} y1="0" x2={toScreenX(0)} y2={svgHeight} stroke="#64748b" strokeWidth="1.6" />
            {/* Mũi tên Ox, Oy */}
            <polygon
              points={`${svgWidth - 6},${toScreenY(0) - 3} ${svgWidth},${toScreenY(0)} ${svgWidth - 6},${toScreenY(0) + 3}`}
              fill="#64748b"
            />
            <polygon
              points={`${toScreenX(0) - 3},6 ${toScreenX(0)},0 ${toScreenX(0) + 3},6`}
              fill="#64748b"
            />
            <text x={svgWidth - 14} y={toScreenY(0) + 14} fontSize="11" fill="#475569" fontWeight="bold">
              x
            </text>
            <text x={toScreenX(0) - 14} y="14" fontSize="11" fill="#475569" fontWeight="bold">
              y
            </text>
            <text x={toScreenX(0) - 12} y={toScreenY(0) + 14} fontSize="10" fill="#94a3b8">
              O
            </text>

            {/* Vạch chia tọa độ số nguyên */}
            {Array.from({ length: 10 }, (_, i) => i).map((n) => (
              <g key={`ticks-${n}`}>
                {n !== 0 && (
                  <>
                    <line
                      x1={toScreenX(n)}
                      y1={toScreenY(0) - 3}
                      x2={toScreenX(n)}
                      y2={toScreenY(0) + 3}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <text
                      x={toScreenX(n)}
                      y={toScreenY(0) + 12}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                    >
                      {n}
                    </text>
                    <line
                      x1={toScreenX(0) - 3}
                      y1={toScreenY(n)}
                      x2={toScreenX(0) + 3}
                      y2={toScreenY(n)}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <text
                      x={toScreenX(0) - 8}
                      y={toScreenY(n) + 3}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="end"
                    >
                      {n}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* 1. Đa giác Miền Nghiệm Hợp Lệ (Feasible Polygon) */}
            {polygonVertices.length >= 3 && (
              <polygon
                points={polygonPointsStr}
                fill="url(#sgkHatch)"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            )}

            {/* 2. Các đường biên giới hạn (Boundary lines) */}
            {activeConstraints.map((c) => {
              // Draw line: a*x + b*y = c
              // If b != 0: y = (c - a*x)/b
              let p1 = { x: xMin, y: 0 };
              let p2 = { x: xMax, y: 0 };
              if (Math.abs(c.b) > 1e-4) {
                p1 = { x: xMin, y: (c.c - c.a * xMin) / c.b };
                p2 = { x: xMax, y: (c.c - c.a * xMax) / c.b };
              } else if (Math.abs(c.a) > 1e-4) {
                p1 = { x: c.c / c.a, y: yMin };
                p2 = { x: c.c / c.a, y: yMax };
              }

              const isDashed = c.op === "<" || c.op === ">";

              return (
                <g key={c.id}>
                  <line
                    x1={toScreenX(p1.x)}
                    y1={toScreenY(p1.y)}
                    x2={toScreenX(p2.x)}
                    y2={toScreenY(p2.y)}
                    stroke={c.color}
                    strokeWidth="1.8"
                    strokeDasharray={isDashed ? "4 3" : undefined}
                    strokeOpacity="0.85"
                  />
                </g>
              );
            })}

            {/* 3. Đường mức F = ux + vy = k (Parallel Level Line) */}
            {(() => {
              let p1 = { x: xMin, y: 0 };
              let p2 = { x: xMax, y: 0 };
              if (Math.abs(v) > 1e-4) {
                p1 = { x: xMin, y: (k - u * xMin) / v };
                p2 = { x: xMax, y: (k - u * xMax) / v };
              } else if (Math.abs(u) > 1e-4) {
                p1 = { x: k / u, y: yMin };
                p2 = { x: k / u, y: yMax };
              }

              return (
                <g>
                  {/* Đường mức quét qua */}
                  <line
                    x1={toScreenX(p1.x)}
                    y1={toScreenY(p1.y)}
                    x2={toScreenX(p2.x)}
                    y2={toScreenY(p2.y)}
                    stroke="#e11d48"
                    strokeWidth="2.8"
                    strokeDasharray="6 4"
                  />
                  <text
                    x={toScreenX((p1.x + p2.x) / 2) + 8}
                    y={toScreenY((p1.y + p2.y) / 2) - 8}
                    fontSize="11"
                    fill="#be123c"
                    fontWeight="bold"
                    className="select-none"
                  >
                    d_k: {u}x + {v}y = {formatVNFloat(k)}
                  </text>
                </g>
              );
            })()}

            {/* 4. Lưới điểm nguyên khả thi nếu bật lockInteger */}
            {lockInteger &&
              integerFeasiblePoints.map((ip) => (
                <circle
                  key={`int-${ip.x}-${ip.y}`}
                  cx={toScreenX(ip.x)}
                  cy={toScreenY(ip.y)}
                  r="3.5"
                  fill="#047857"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              ))}

            {/* 5. Các đỉnh đa giác miền nghiệm (Vertices A, B, C...) */}
            {polygonVertices.map((vPt) => {
              const isOpt = optimalVertex?.name === vPt.name;
              return (
                <g key={`v-${vPt.name}`}>
                  <circle
                    cx={toScreenX(vPt.x)}
                    cy={toScreenY(vPt.y)}
                    r={isOpt ? 6 : 4.5}
                    fill={isOpt ? "#d97706" : "#2563eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={toScreenX(vPt.x) + 7}
                    y={toScreenY(vPt.y) - 7}
                    fontSize="11"
                    fill={isOpt ? "#b45309" : "#1e40af"}
                    fontWeight="bold"
                  >
                    {vPt.name}({formatVNFloat(vPt.x)}; {formatVNFloat(vPt.y)})
                  </text>
                </g>
              );
            })}

            {/* 6. Điểm thử nghiệm M tự do kéo thả (Free Test Point) */}
            <g className="cursor-grab active:cursor-grabbing">
              <circle
                cx={toScreenX(testPoint.x)}
                cy={toScreenY(testPoint.y)}
                r="7"
                fill={testPointFeasible ? "#10b981" : "#ef4444"}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="filter drop-shadow-sm transition-transform"
              />
              <text
                x={toScreenX(testPoint.x) + 10}
                y={toScreenY(testPoint.y) + 4}
                fontSize="11"
                fill={testPointFeasible ? "#047857" : "#b91c1c"}
                fontWeight="bold"
              >
                M({formatVNFloat(testPoint.x)}; {formatVNFloat(testPoint.y)})
              </text>
            </g>
          </svg>
        </div>

        {/* Thanh trượt đường mức k tương tác thời gian thực */}
        <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
              <span>Thanh trượt đường mức k (Tịnh tiến song song):</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              k = {formatVNFloat(k)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={35}
            step={0.2}
            value={k}
            onChange={(e) => setParamVal("k", parseFloat(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>k = 0</span>
            <span className="text-slate-500">Kéo k tăng dần để đường mức d_k quét qua miền đa giác</span>
            <span>k = 35</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Quản lý Bất phương trình & Bảng phân tích Đỉnh */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Danh sách Bất phương trình (Hệ BPT) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Hệ Bất phương trình ({constraints.length}):</span>
            <button
              type="button"
              onClick={() => setIsAddingConstraint((v) => !v)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm BPT</span>
            </button>
          </div>

          {/* Form thêm bpt */}
          {isAddingConstraint && (
            <form onSubmit={handleAddConstraint} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <span className="font-bold text-emerald-900 block">Thêm dạng a·x + b·y ≤ c:</span>
              <div className="grid grid-cols-4 gap-1.5 font-mono">
                <div>
                  <label className="text-[9px] text-slate-500">Hệ số a</label>
                  <input
                    type="number"
                    value={newA}
                    onChange={(e) => setNewA(parseFloat(e.target.value) || 0)}
                    className="w-full p-1 bg-white border rounded text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500">Hệ số b</label>
                  <input
                    type="number"
                    value={newB}
                    onChange={(e) => setNewB(parseFloat(e.target.value) || 0)}
                    className="w-full p-1 bg-white border rounded text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500">Dấu</label>
                  <select
                    value={newOp}
                    onChange={(e) => setNewOp(e.target.value as "<=" | ">=")}
                    className="w-full p-1 bg-white border rounded text-center text-xs font-bold font-sans"
                  >
                    <option value="<=">≤</option>
                    <option value=">=">≥</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500">Giới hạn c</label>
                  <input
                    type="number"
                    value={newC}
                    onChange={(e) => setNewC(parseFloat(e.target.value) || 0)}
                    className="w-full p-1 bg-white border rounded text-center"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingConstraint(false)}
                  className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  Thêm vào hệ
                </button>
              </div>
            </form>
          )}

          {/* Danh sách các BPT */}
          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
            {constraints.map((c) => (
              <div
                key={c.id}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  c.enabled ? "bg-slate-50 border-slate-200" : "bg-slate-100/60 border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setConstraints((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, enabled: !item.enabled } : item))
                      )
                    }
                    className="text-slate-500 hover:text-slate-800"
                    title={c.enabled ? "Tắt BPT này" : "Bật BPT này"}
                  >
                    {c.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <span className="font-mono font-medium">
                    {c.a}x {c.b >= 0 ? `+ ${c.b}` : `- ${Math.abs(c.b)}`}y {c.op === "<=" ? "≤" : "≥"} {c.c}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {constraints.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setConstraints((prev) => prev.filter((item) => item.id !== c.id))}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="Xóa BPT"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng phân tích Giá trị F(x, y) tại các Đỉnh (Định lý Quy hoạch tuyến tính SGK) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Giá trị F = {u}x + {v}y tại các đỉnh:</span>
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-1.5 pl-2.5">Đỉnh</th>
                  <th className="p-1.5">Tọa độ (x; y)</th>
                  <th className="p-1.5 text-right pr-2.5">F(x, y)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {polygonVertices.map((vPt) => {
                  const isOpt = optimalVertex?.name === vPt.name;
                  return (
                    <tr
                      key={vPt.name}
                      className={isOpt ? "bg-amber-50 font-bold text-amber-900" : "text-slate-700 hover:bg-slate-50"}
                    >
                      <td className="p-1.5 pl-2.5 font-sans font-bold flex items-center gap-1">
                        <span>{vPt.name}</span>
                        {isOpt && <Target className="w-3 h-3 text-amber-600 inline" />}
                      </td>
                      <td className="p-1.5">
                        ({formatVNFloat(vPt.x)}; {formatVNFloat(vPt.y)})
                      </td>
                      <td className="p-1.5 text-right pr-2.5 font-bold">
                        {formatVNFloat(vPt.fVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {optimalVertex && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Phương án tối ưu lớn nhất:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Đạt giá trị <strong className="font-mono text-amber-800">F_max = {formatVNFloat(optimalVertex.fVal)}</strong> tại đỉnh{" "}
                <strong>{optimalVertex.name}({formatVNFloat(optimalVertex.x)}; {formatVNFloat(optimalVertex.y)})</strong>.
              </p>
            </div>
          )}

          {/* Kiểm tra điểm thử M */}
          <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between items-center">
            <span>
              Điểm M({formatVNFloat(testPoint.x)}; {formatVNFloat(testPoint.y)}):
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                testPointFeasible ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {testPointFeasible ? `Thuộc nghiệm (F = ${formatVNFloat(testPointF)})` : "Không thuộc nghiệm"}
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
