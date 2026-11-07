"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  BarChart2,
  Box,
  Calculator,
} from "lucide-react";
import { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";

type RiemannType = "left" | "right" | "midpoint" | "trapezoid";
type SubLabTab = "riemann" | "revolution3d";

export default function DynamicCalculusLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [activeTab, setActiveTab] = useState<SubLabTab>("riemann");
  const [riemannMethod, setRiemannMethod] = useState<RiemannType>("midpoint");
  const [showDisks, setShowDisks] = useState<boolean>(true);

  // Parameters from store
  const n = Math.round(params.riemannN?.val ?? 10);
  const a = params.boundA?.val ?? 0;
  const b = params.boundB?.val ?? 3;
  const thetaRev = params.thetaRev?.val ?? 360;

  // Function to integrate: f(x) = -0.3*x^2 + 1.2*x + 1 (positive on [0, 3.5])
  const f = (x: number): number => {
    return -0.25 * x * x + x + 1.2;
  };

  // Antiderivative F(x) = -0.25/3 * x^3 + 0.5 * x^2 + 1.2 * x
  const exactIntegral = useMemo(() => {
    const F = (x: number) => (-0.25 / 3) * Math.pow(x, 3) + 0.5 * Math.pow(x, 2) + 1.2 * x;
    return F(b) - F(a);
  }, [a, b]);

  // Exact Volume of Revolution: V = pi * integral(f(x)^2 dx)
  // f(x)^2 = (-0.25*x^2 + x + 1.2)^2 = 0.0625*x^4 - 0.5*x^3 + 0.4*x^2 + 2.4*x + 1.44
  const exactVolume = useMemo(() => {
    const antiG = (x: number) =>
      (0.0625 / 5) * Math.pow(x, 5) -
      (0.5 / 4) * Math.pow(x, 4) +
      (0.4 / 3) * Math.pow(x, 3) +
      1.2 * Math.pow(x, 2) +
      1.44 * x;
    return Math.PI * (antiG(b) - antiG(a));
  }, [a, b]);

  // Viewport setup (Oxy)
  const xMin = -1;
  const xMax = 5;
  const yMin = -0.5;
  const yMax = 4;
  const svgWidth = 520;
  const svgHeight = 360;

  const toScreenX = (wx: number) => ((wx - xMin) / (xMax - xMin)) * svgWidth;
  const toScreenY = (wy: number) => svgHeight - ((wy - yMin) / (yMax - yMin)) * svgHeight;

  // Riemann Rectangles data
  const { rectangles, approxSum } = useMemo(() => {
    const rects: { x: number; width: number; height: number; area: number }[] = [];
    const dx = (b - a) / n;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      const xLeft = a + i * dx;
      const xRight = a + (i + 1) * dx;
      let evalX = xLeft;
      if (riemannMethod === "right") evalX = xRight;
      else if (riemannMethod === "midpoint") evalX = (xLeft + xRight) / 2;

      const hVal = f(evalX);
      const area = hVal * dx;
      sum += area;

      rects.push({
        x: xLeft,
        width: dx,
        height: hVal,
        area,
      });
    }

    return { rectangles: rects, approxSum: sum };
  }, [a, b, n, riemannMethod]);

  // Absolute Error
  const absError = Math.abs(approxSum - exactIntegral);

  // SVG Curve path
  const curvePath = useMemo(() => {
    let d = "";
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = f(x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      d += `${x === xMin ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }
    return d;
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Khung mô phỏng Riemann hoặc Khối tròn xoay 3D */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Header Tab Switcher */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {activeTab === "riemann"
                ? `Tổng Riemann n = ${n} hình chữ nhật: S ≈ ${formatVNFloat(approxSum)}`
                : `Thể tích tròn xoay quay quanh Ox (θ = ${thetaRev}°)`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
              KNTT Bài 15-16
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("riemann")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "riemann" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Tổng Riemann</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("revolution3d")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "revolution3d" ? "bg-white text-rose-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Khối tròn xoay 3D</span>
            </button>
          </div>
        </div>

        {/* 1. MÔ PHỎNG TỔNG RIEMANN 2D */}
        {activeTab === "riemann" ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
              {/* Lưới tọa độ */}
              <defs>
                <pattern id="gridPatternCalc" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={svgWidth} height={svgHeight} fill="url(#gridPatternCalc)" />

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

              {/* Cột hình chữ nhật Riemann */}
              {rectangles.map((r, idx) => {
                const sx = toScreenX(r.x);
                const sy = toScreenY(r.height);
                const sWidth = toScreenX(r.x + r.width) - sx;
                const sHeight = toScreenY(0) - sy;

                return (
                  <rect
                    key={`riemann-rect-${idx}`}
                    x={sx}
                    y={sy}
                    width={sWidth}
                    height={Math.max(0, sHeight)}
                    fill="#14b8a6"
                    fillOpacity="0.4"
                    stroke="#0f766e"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Đường cong hàm số f(x) */}
              <path d={curvePath} fill="none" stroke="#dc2626" strokeWidth="2.6" />

              {/* Cận a và b */}
              <line
                x1={toScreenX(a)}
                y1={toScreenY(0)}
                x2={toScreenX(a)}
                y2={toScreenY(f(a))}
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
              <text x={toScreenX(a) - 4} y={toScreenY(0) + 16} fontSize="11" fill="#2563eb" fontWeight="bold">
                a = {formatVNFloat(a)}
              </text>

              <line
                x1={toScreenX(b)}
                y1={toScreenY(0)}
                x2={toScreenX(b)}
                y2={toScreenY(f(b))}
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
              <text x={toScreenX(b) - 4} y={toScreenY(0) + 16} fontSize="11" fill="#2563eb" fontWeight="bold">
                b = {formatVNFloat(b)}
              </text>
            </svg>
          </div>
        ) : (
          /* 2. MÔ PHỎNG THỂ TÍCH TRÒN XOAY 3D / PHỐI CẢNH */
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-[#f8fafc] to-[#edf3f2]">
            <svg viewBox="0 0 520 360" className="w-full h-auto select-none">
              {/* Trục Ox nằm ngang, trục Oy đứng, trục Oz phối cảnh */}
              <line x1="40" y1="180" x2="480" y2="180" stroke="#64748b" strokeWidth="1.5" />
              <text x="490" y="184" fontSize="11" fill="#475569" fontWeight="bold">
                x (Trục quay)
              </text>

              {/* Lát đĩa mỏng (Disk method) */}
              {showDisks &&
                Array.from({ length: 12 }, (_, i) => a + (i + 0.5) * ((b - a) / 12)).map((xSlice, idx) => {
                  const radius = f(xSlice);
                  const screenX = 80 + xSlice * 75;
                  const screenR = radius * 28 * (thetaRev / 360);

                  return (
                    <g key={`disk-${idx}`} opacity="0.6">
                      <ellipse
                        cx={screenX}
                        cy="180"
                        rx="10"
                        ry={screenR}
                        fill="#fda4af"
                        stroke="#e11d48"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

              {/* Đường biên trên y = f(x) */}
              {(() => {
                let dTop = "";
                let dBottom = "";
                for (let x = a; x <= b; x += 0.1) {
                  const y = f(x);
                  const sx = 80 + x * 75;
                  const syTop = 180 - y * 28 * (thetaRev / 360);
                  const syBottom = 180 + y * 28 * (thetaRev / 360);
                  dTop += `${x === a ? "M" : "L"} ${sx} ${syTop} `;
                  dBottom += `${x === a ? "M" : "L"} ${sx} ${syBottom} `;
                }
                return (
                  <>
                    <path d={dTop} fill="none" stroke="#e11d48" strokeWidth="2.5" />
                    <path d={dBottom} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="3 3" />
                  </>
                );
              })()}

              {/* Đáy đĩa tròn xoay tại cận b */}
              <ellipse
                cx={80 + b * 75}
                cy="180"
                rx="14"
                ry={f(b) * 28 * (thetaRev / 360)}
                fill="#f43f5e"
                fillOpacity="0.4"
                stroke="#e11d48"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {/* Thanh trượt tham số n hoặc góc quay theta */}
        <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          {activeTab === "riemann" ? (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                  <span>Số hình chữ nhật n (Kéo để thấy tổng Riemann mịn dần):</span>
                </span>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                  n = {n} cột
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={100}
                step={1}
                value={n}
                onChange={(e) => setParamVal("riemannN", parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>n = 2 (Thô)</span>
                <span className="text-teal-800 font-semibold">
                  Sai số: Δ = {formatVNFloat(absError)} (Giảm dần về 0 khi n → ∞)
                </span>
                <span>n = 100 (Mịn chuẩn tích phân)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                  <span>Góc quay tròn xoay quanh Ox (θ):</span>
                </span>
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  θ = {thetaRev}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={10}
                value={thetaRev}
                onChange={(e) => setParamVal("thetaRev", parseInt(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0° (Miền phẳng 2D)</span>
                <span className="text-rose-700 font-semibold">Kéo góc θ quét khối tròn xoay 3D</span>
                <span>360° (Khối kín hoàn toàn)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cột phải: Phương pháp tính & So sánh Giải tích SGK */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Chọn quy tắc tính Riemann */}
        {activeTab === "riemann" ? (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">Chọn quy tắc lấy mẫu Riemann:</span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setRiemannMethod("left")}
                className={`p-1.5 rounded-lg border font-bold text-center ${
                  riemannMethod === "left"
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                Cận trái
              </button>
              <button
                type="button"
                onClick={() => setRiemannMethod("midpoint")}
                className={`p-1.5 rounded-lg border font-bold text-center ${
                  riemannMethod === "midpoint"
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                Trung điểm
              </button>
              <button
                type="button"
                onClick={() => setRiemannMethod("right")}
                className={`p-1.5 rounded-lg border font-bold text-center ${
                  riemannMethod === "right"
                    ? "bg-teal-50 border-teal-500 text-teal-800"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                Cận phải
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">Tùy chọn mô hình tròn xoay:</span>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showDisks}
                onChange={(e) => setShowDisks(e.target.checked)}
                className="accent-rose-600 rounded"
              />
              <span>Hiển thị các lát đĩa mỏng (Disk method)</span>
            </label>
          </div>
        )}

        {/* Bảng đối chiếu Tích phân chính xác vs Xấp xỉ */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Đối chiếu kết quả Giải tích (SGK Toán 12):</span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
              <span className="text-slate-600 font-sans">Tích phân chính xác ∫ f(x)dx:</span>
              <strong className="text-emerald-700 text-sm">{formatVNFloat(exactIntegral)}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
              <span className="text-slate-600 font-sans">Tổng Riemann (n = {n}):</span>
              <strong className="text-teal-800 text-sm">{formatVNFloat(approxSum)}</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg flex justify-between">
              <span className="text-slate-600 font-sans">Sai số tuyệt đối Δ:</span>
              <strong className="text-rose-700">{formatVNFloat(absError)}</strong>
            </div>
            <div className="p-2 bg-rose-50/60 border border-rose-200 rounded-lg flex justify-between text-rose-900">
              <span className="font-sans font-bold">Thể tích tròn xoay V:</span>
              <strong className="text-sm">≈ {formatVNFloat(exactVolume)} đvtt</strong>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
            <strong>Bản chất tích phân:</strong> Khi chia đoạn [a, b] thành n khoảng vô cùng bé (n → ∞), tổng diện tích các cột hình chữ nhật hội tụ về giá trị diện tích hình thang cong giới hạn bởi đồ thị f(x).
          </div>
        </div>
      </div>
    </div>
  );
}
