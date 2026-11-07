"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";

type FunctionType = "cubic" | "quadratic" | "rational";

export default function DynamicFunctionsLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [fnType, setFnType] = useState<FunctionType>("cubic");
  const [hoveredInterval, setHoveredInterval] = useState<number | null>(null);

  // Parameters from store
  const m = params.m?.val ?? 0;
  const a = params.coeffA?.val ?? 1;
  const b = params.coeffB?.val ?? -3;
  const x0 = params.x0?.val ?? 1.0;

  // Viewport setup (World Oxy)
  const xMin = -4;
  const xMax = 4;
  const yMin = -6;
  const yMax = 6;
  const svgWidth = 520;
  const svgHeight = 400;

  // Coordinate transforms
  const toScreenX = (wx: number) => ((wx - xMin) / (xMax - xMin)) * svgWidth;
  const toScreenY = (wy: number) => svgHeight - ((wy - yMin) / (yMax - yMin)) * svgHeight;

  // Evaluate function f(x)
  const evalF = (x: number): number => {
    if (fnType === "cubic") {
      // f(x) = a*x^3 + b*x
      return a * Math.pow(x, 3) + b * x;
    } else if (fnType === "quadratic") {
      // f(x) = a*x^2 + b*x
      return a * Math.pow(x, 2) + b * x;
    } else {
      // f(x) = (a*x + b) / (x - 1)
      if (Math.abs(x - 1) < 0.05) return NaN;
      return (a * x + b) / (x - 1);
    }
  };

  // Evaluate derivative f'(x)
  const evalFPrime = (x: number): number => {
    if (fnType === "cubic") {
      // f'(x) = 3*a*x^2 + b
      return 3 * a * Math.pow(x, 2) + b;
    } else if (fnType === "quadratic") {
      // f'(x) = 2*a*x + b
      return 2 * a * x + b;
    } else {
      // f(x) = (ax + b)/(x - 1) -> f'(x) = (-a - b)/(x - 1)^2
      if (Math.abs(x - 1) < 0.05) return NaN;
      return (-a - b) / Math.pow(x - 1, 2);
    }
  };

  // Critical points where f'(x) = 0
  const criticalPoints = useMemo(() => {
    const pts: { x: number; y: number; type: "max" | "min" | "inflection" }[] = [];
    if (fnType === "cubic") {
      // 3*a*x^2 + b = 0 -> x^2 = -b / (3*a)
      const val = -b / (3 * a);
      if (val > 0) {
        const x1 = -Math.sqrt(val);
        const x2 = Math.sqrt(val);
        const y1 = evalF(x1);
        const y2 = evalF(x2);
        if (a > 0) {
          pts.push({ x: x1, y: y1, type: "max" });
          pts.push({ x: x2, y: y2, type: "min" });
        } else {
          pts.push({ x: x1, y: y1, type: "min" });
          pts.push({ x: x2, y: y2, type: "max" });
        }
      }
    } else if (fnType === "quadratic") {
      // 2*a*x + b = 0 -> x = -b / (2*a)
      if (Math.abs(a) > 1e-4) {
        const xV = -b / (2 * a);
        pts.push({ x: xV, y: evalF(xV), type: a > 0 ? "min" : "max" });
      }
    }
    return pts.sort((p1, p2) => p1.x - p2.x);
  }, [fnType, a, b]);

  // Intersections of f(x) = m (Equation roots)
  const intersections = useMemo(() => {
    const roots: { x: number; y: number }[] = [];
    const step = 0.02;
    let prevDiff: number | null = null;
    let prevX: number = xMin;

    for (let x = xMin; x <= xMax; x += step) {
      const y = evalF(x);
      if (isNaN(y)) {
        prevDiff = null;
        continue;
      }
      const diff = y - m;
      if (prevDiff !== null && prevDiff * diff <= 0) {
        // Linear interpolation root approximation
        const rootX = prevX - prevDiff * ((x - prevX) / (diff - prevDiff));
        roots.push({ x: rootX, y: m });
      }
      prevDiff = diff;
      prevX = x;
    }
    return roots;
  }, [fnType, a, b, m]);

  // SVG Curve Path
  const curvePath = useMemo(() => {
    let d = "";
    const step = 0.02;
    let isDrawing = false;

    for (let x = xMin; x <= xMax; x += step) {
      const y = evalF(x);
      if (isNaN(y) || y < yMin - 3 || y > yMax + 3) {
        isDrawing = false;
        continue;
      }
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!isDrawing) {
        d += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        isDrawing = true;
      } else {
        d += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
      }
    }
    return d;
  }, [fnType, a, b]);

  // Tangent line at x0: y = f'(x0)*(x - x0) + f(x0)
  const tangentData = useMemo(() => {
    const y0 = evalF(x0);
    const slope = evalFPrime(x0);
    if (isNaN(y0) || isNaN(slope)) return null;

    const xLeft = xMin;
    const yLeft = slope * (xLeft - x0) + y0;
    const xRight = xMax;
    const yRight = slope * (xRight - x0) + y0;

    return {
      x0,
      y0,
      slope,
      p1: { x: xLeft, y: yLeft },
      p2: { x: xRight, y: yRight },
    };
  }, [fnType, a, b, x0]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Đồ thị hàm số & Đường thẳng quét y = m */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Header đồ thị */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {fnType === "cubic" && `y = ${a !== 1 ? a : ""}x³ ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x`}
              {fnType === "quadratic" && `y = ${a !== 1 ? a : ""}x² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x`}
              {fnType === "rational" && `y = (${a}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}) / (x - 1)`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {intersections.length} giao điểm với y = m
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setFnType("cubic");
                setParamVal("coeffA", 1);
                setParamVal("coeffB", -3);
              }}
              className={`px-2 py-0.5 rounded ${
                fnType === "cubic" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Bậc ba
            </button>
            <button
              type="button"
              onClick={() => {
                setFnType("quadratic");
                setParamVal("coeffA", 1);
                setParamVal("coeffB", -2);
              }}
              className={`px-2 py-0.5 rounded ${
                fnType === "quadratic" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Bậc hai
            </button>
            <button
              type="button"
              onClick={() => {
                setFnType("rational");
                setParamVal("coeffA", 2);
                setParamVal("coeffB", 1);
              }}
              className={`px-2 py-0.5 rounded ${
                fnType === "rational" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Phân thức
            </button>
          </div>
        </div>

        {/* SVG Canvas Oxy */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
            {/* Lưới tọa độ */}
            <defs>
              <pattern id="gridPatternFunc" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={svgWidth} height={svgHeight} fill="url(#gridPatternFunc)" />

            {/* Trục Oxy */}
            <line x1="0" y1={toScreenY(0)} x2={svgWidth} y2={toScreenY(0)} stroke="#64748b" strokeWidth="1.5" />
            <line x1={toScreenX(0)} y1="0" x2={toScreenX(0)} y2={svgHeight} stroke="#64748b" strokeWidth="1.5" />
            <text x={svgWidth - 14} y={toScreenY(0) + 14} fontSize="11" fill="#475569" fontWeight="bold">
              x
            </text>
            <text x={toScreenX(0) - 12} y="14" fontSize="11" fill="#475569" fontWeight="bold">
              y
            </text>
            <text x={toScreenX(0) - 12} y={toScreenY(0) + 14} fontSize="10" fill="#94a3b8">
              O
            </text>

            {/* Tiệm cận nếu là hàm phân thức */}
            {fnType === "rational" && (
              <>
                {/* TCĐ x = 1 */}
                <line
                  x1={toScreenX(1)}
                  y1="0"
                  x2={toScreenX(1)}
                  y2={svgHeight}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x={toScreenX(1) + 4} y="30" fontSize="10" fill="#ef4444" fontWeight="bold">
                  TCĐ x = 1
                </text>
                {/* TCN y = a */}
                <line
                  x1="0"
                  y1={toScreenY(a)}
                  x2={svgWidth}
                  y2={toScreenY(a)}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="10" y={toScreenY(a) - 6} fontSize="10" fill="#3b82f6" fontWeight="bold">
                  TCN y = {a}
                </text>
              </>
            )}

            {/* 1. Đồ thị hàm số f(x) */}
            <path
              d={curvePath}
              fill="none"
              stroke="#0f766e"
              strokeWidth="2.8"
              strokeLinecap="round"
              className={hoveredInterval !== null ? "filter drop-shadow-md" : ""}
            />

            {/* 2. Đường tiếp tuyến tại x0 */}
            {tangentData && (
              <g>
                <line
                  x1={toScreenX(tangentData.p1.x)}
                  y1={toScreenY(tangentData.p1.y)}
                  x2={toScreenX(tangentData.p2.x)}
                  y2={toScreenY(tangentData.p2.y)}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={toScreenX(tangentData.x0)}
                  cy={toScreenY(tangentData.y0)}
                  r="5"
                  fill="#087e7c"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={toScreenX(tangentData.x0) + 8}
                  y={toScreenY(tangentData.y0) - 8}
                  fontSize="11"
                  fill="#087e7c"
                  fontWeight="bold"
                >
                  M({formatVNFloat(tangentData.x0)}; {formatVNFloat(tangentData.y0)})
                </text>
              </g>
            )}

            {/* 3. Đường thẳng ngang y = m (Biện luận số nghiệm) */}
            <g>
              <line
                x1="0"
                y1={toScreenY(m)}
                x2={svgWidth}
                y2={toScreenY(m)}
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text
                x="14"
                y={toScreenY(m) - 6}
                fontSize="11"
                fill="#e11d48"
                fontWeight="bold"
              >
                d: y = {formatVNFloat(m)}
              </text>
            </g>

            {/* 4. Các điểm cực trị (Cực đại / Cực tiểu) */}
            {criticalPoints.map((cp, idx) => (
              <g key={`crit-${idx}`}>
                <circle
                  cx={toScreenX(cp.x)}
                  cy={toScreenY(cp.y)}
                  r="5.5"
                  fill={cp.type === "max" ? "#d97706" : "#2563eb"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={toScreenX(cp.x) + 7}
                  y={toScreenY(cp.y) - 7}
                  fontSize="10"
                  fill={cp.type === "max" ? "#b45309" : "#1e40af"}
                  fontWeight="bold"
                >
                  {cp.type === "max" ? "Cực đại" : "Cực tiểu"} ({formatVNFloat(cp.x)}; {formatVNFloat(cp.y)})
                </text>
              </g>
            ))}

            {/* 5. Các giao điểm với đường y = m */}
            {intersections.map((inter, idx) => (
              <g key={`inter-${idx}`}>
                <circle
                  cx={toScreenX(inter.x)}
                  cy={toScreenY(inter.y)}
                  r="6"
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={toScreenX(inter.x) - 10}
                  y={toScreenY(inter.y) + 16}
                  fontSize="10"
                  fill="#be123c"
                  fontWeight="bold"
                >
                  x_{idx + 1} = {formatVNFloat(inter.x)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Thanh trượt tham số m (Biện luận số nghiệm) */}
        <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
              <span>Biện luận số nghiệm: Kéo đường thẳng d: y = m chạy lên/xuống:</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              m = {formatVNFloat(m)}
            </span>
          </div>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={m}
            onChange={(e) => setParamVal("m", parseFloat(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>m = -5</span>
            <span className="text-rose-700 font-bold">
              {intersections.length === 0 && "Phương trình vô nghiệm"}
              {intersections.length === 1 && "Phương trình có 1 nghiệm duy nhất"}
              {intersections.length === 2 && "Phương trình có 2 nghiệm (có 1 nghiệm kép/tiếp xúc)"}
              {intersections.length === 3 && "Phương trình có 3 nghiệm phân biệt!"}
            </span>
            <span>m = 5</span>
          </div>
        </div>
      </div>

      {/* Cột phải: BẢNG BIẾN THIÊN 2 CHIỀU ĐỘNG (DYNAMIC VARIATION TABLE) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Bảng biến thiên động */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Bảng biến thiên 2 chiều động:</span>
            </span>
            <span className="text-[10px] text-slate-400">Rê chuột để phát sáng</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            {/* Hàng x */}
            <div className="grid grid-cols-5 bg-slate-100 font-mono font-bold text-center border-b border-slate-200 py-1.5 text-slate-700">
              <span className="font-sans">x</span>
              <span>-∞</span>
              <span>{criticalPoints[0] ? formatVNFloat(criticalPoints[0].x) : "0"}</span>
              <span>{criticalPoints[1] ? formatVNFloat(criticalPoints[1].x) : ""}</span>
              <span>+∞</span>
            </div>

            {/* Hàng f'(x) */}
            <div className="grid grid-cols-5 font-mono font-bold text-center border-b border-slate-200 py-1.5 text-slate-800 bg-white">
              <span className="font-sans font-semibold text-slate-500">{"f'(x)"}</span>
              <span className={a > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {a > 0 ? "+" : "-"}
              </span>
              <span className="text-slate-400">0</span>
              <span className={a > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                {criticalPoints.length > 1 ? (a > 0 ? "-" : "+") : ""}
              </span>
              <span className={a > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {a > 0 ? "+" : "-"}
              </span>
            </div>

            {/* Hàng f(x) với chiều mũi tên */}
            <div className="grid grid-cols-5 font-mono text-center py-3 text-slate-800 bg-slate-50/50 items-center">
              <span className="font-sans font-semibold text-slate-500">f(x)</span>
              <div
                onMouseEnter={() => setHoveredInterval(0)}
                onMouseLeave={() => setHoveredInterval(null)}
                className="flex flex-col items-center cursor-pointer hover:bg-emerald-100/50 p-1 rounded"
              >
                {a > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-[10px] text-slate-500">Đồng biến</span>
              </div>
              <div className="font-bold text-amber-700">
                {criticalPoints[0] ? formatVNFloat(criticalPoints[0].y) : ""}
              </div>
              <div
                onMouseEnter={() => setHoveredInterval(1)}
                onMouseLeave={() => setHoveredInterval(null)}
                className="flex flex-col items-center cursor-pointer hover:bg-rose-100/50 p-1 rounded"
              >
                {criticalPoints.length > 1 && (
                  <>
                    {a > 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="text-[10px] text-slate-500">Nghịch biến</span>
                  </>
                )}
              </div>
              <div
                onMouseEnter={() => setHoveredInterval(2)}
                onMouseLeave={() => setHoveredInterval(null)}
                className="flex flex-col items-center cursor-pointer hover:bg-emerald-100/50 p-1 rounded"
              >
                {a > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-[10px] text-slate-500">Đồng biến</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tinh chỉnh hệ số a, b */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <span className="font-bold text-slate-800 block">Điều chỉnh tham số hàm số:</span>

          {/* Hệ số a */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Hệ số a:</span>
              <span className="font-mono font-bold text-teal-800">{formatVNFloat(a)}</span>
            </div>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.2}
              value={a}
              onChange={(e) => setParamVal("coeffA", parseFloat(e.target.value) || 0.1)}
              className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>

          {/* Hệ số b */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Hệ số b:</span>
              <span className="font-mono font-bold text-slate-800">{formatVNFloat(b)}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={b}
              onChange={(e) => setParamVal("coeffB", parseFloat(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>

          {/* Hoành độ tiếp điểm x0 */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Tiếp điểm M(x₀):</span>
              <span className="font-mono font-bold text-rose-800">x₀ = {formatVNFloat(x0)}</span>
            </div>
            <input
              type="range"
              min={-2.5}
              max={2.5}
              step={0.1}
              value={x0}
              onChange={(e) => setParamVal("x0", parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
