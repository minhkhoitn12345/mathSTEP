"use client";

import React, { useState, useRef, useMemo } from "react";
import { Activity, Compass, Pause, Play } from "lucide-react";
import { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";
import TrigonometryPracticeTools from "./TrigonometryPracticeTools";

export default function DynamicTrigonometryLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [waveMode, setWaveMode] = useState<"sin" | "cos">("sin");
  const [isGeneralWave, setIsGeneralWave] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [angleUnit, setAngleUnit] = useState<"degree" | "radian">("degree");
  const [showTanCot, setShowTanCot] = useState(true);

  // Angle theta in degrees from store (can be > 360 or < 0)
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const current = useDynamicMathStore.getState().params.theta?.val ?? 60;
      setParamVal("theta", current + 2);
    }, 40);
    return () => window.clearInterval(timer);
  }, [isPlaying, setParamVal]);

  const thetaDeg = params.theta?.val ?? 60;
  const amp = params.amp?.val ?? 1.5;
  const omega = params.omega?.val ?? 1.0;
  const phiDeg = params.phi?.val ?? 0;
  const shiftY = params.shiftY?.val ?? 0;

  const circleSvgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingM, setIsDraggingM] = useState(false);

  // Radian conversions
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  // Values on Unit Circle
  const cosVal = Math.cos(thetaRad);
  const sinVal = Math.sin(thetaRad);
  const tanVal = Math.abs(cosVal) > 1e-4 ? sinVal / cosVal : null;
  const cotVal = Math.abs(sinVal) > 1e-4 ? cosVal / sinVal : null;

  // Period T
  const period = Math.abs(omega) > 1e-4 ? (2 * Math.PI) / Math.abs(omega) : 0;

  // Unit circle center and radius in Left SVG
  const cX = 170;
  const cY = 170;
  const cR = 110;

  // Screen coords of M on Circle
  const mScreenX = cX + cR * cosVal;
  const mScreenY = cY - cR * sinVal;
  const spiralPath = useMemo(() => {
    if (Math.abs(thetaDeg) < 360) return "";
    const end = (thetaDeg * Math.PI) / 180;
    const steps = Math.max(2, Math.ceil(Math.abs(end) * 8));
    return Array.from({ length: steps + 1 }, (_, index) => {
      const angle = (end * index) / steps;
      const radius = cR + (Math.abs(angle) / (2 * Math.PI)) * 11;
      const x = cX + radius * Math.cos(angle);
      const y = cY - radius * Math.sin(angle);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [thetaDeg]);

  // Drag handler for Point M on Circle
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
    setParamVal("theta", Math.round(deg));
  };

  const handleCirclePointerUp = () => setIsDraggingM(false);

  // Right SVG Dimensions: Wave Plot
  const waveSvgWidth = 380;
  const waveSvgHeight = 340;
  const waveOriginX = 40;
  const waveOriginY = 170;
  const waveScaleX = 45; // 45px per radian
  const waveScaleY = 55; // 55px per unit

  // Generate SVG path for wave curve
  const wavePath = useMemo(() => {
    let d = "";
    const startX = 0;
    const endX = 7.0; // from 0 to ~2.2*PI radians
    const step = 0.05;

    for (let x = startX; x <= endX; x += step) {
      let y = 0;
      if (isGeneralWave) {
        y = amp * Math.sin(omega * x + phiRad) + shiftY;
      } else {
        y = waveMode === "sin" ? Math.sin(x) : Math.cos(x);
      }
      const sx = waveOriginX + x * waveScaleX;
      const sy = waveOriginY - y * waveScaleY;
      d += `${x === startX ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
    }
    return d;
  }, [waveMode, isGeneralWave, amp, omega, phiRad, shiftY]);

  // Current synchronized point on the wave graph for thetaRad (modulo 2pi for display)
  const normThetaRad = ((thetaRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const currentWaveVal = isGeneralWave
    ? amp * Math.sin(omega * normThetaRad + phiRad) + shiftY
    : waveMode === "sin"
    ? sinVal
    : cosVal;
  const wavePointScreenX = waveOriginX + normThetaRad * waveScaleX;
  const wavePointScreenY = waveOriginY - currentWaveVal * waveScaleY;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Khung đôi Split-View: Tròn Lượng Giác & Đồ Thị Sóng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* NỬA TRÁI: ĐƯỜNG TRÒN LƯỢNG GIÁC R = 1 */}
        <div className="lg:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Đường tròn đơn vị (R = 1)</span>
            </span>
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              α = {Math.round(thetaDeg)}° ({(thetaRad).toFixed(2)} rad)
            </span>
          </div>

          <div className="mb-2 flex w-full flex-wrap gap-2"><button type="button" onClick={() => setIsPlaying((playing) => !playing)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{isPlaying ? "\u0054\u1ea1m d\u1eebng" : "Cho \u0111i\u1ec3m M chuy\u1ec3n \u0111\u1ed9ng"}</button><button type="button" onClick={() => setAngleUnit((unit) => unit === "degree" ? "radian" : "degree")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800">{angleUnit === "degree" ? "Hi\u1ec7n theo radian" : "Hi\u1ec7n theo \u0111\u1ed9"}</button></div>
          <button type="button" onClick={() => setShowTanCot((value) => !value)} className="mb-2 self-start rounded-lg border border-violet-300 px-3 py-2 text-xs font-bold text-violet-900">{showTanCot ? "?n" : "Hi?n"} hai ti?p tuy?n tan, cot</button>
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] flex justify-center p-2">
            <svg
              ref={circleSvgRef}
              viewBox="0 0 340 340"
              className="w-full max-w-[340px] h-auto cursor-crosshair select-none touch-none"
              onPointerDown={handleCirclePointerDown}
              onPointerMove={handleCirclePointerMove}
              onPointerUp={handleCirclePointerUp}
            >
              {/* Trục Oxy */}
              <line x1="20" y1={cY} x2="320" y2={cY} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={cX} y1="320" x2={cX} y2="20" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="325" y={cY + 4} fontSize="11" fill="#64748b" fontWeight="bold">
                cos
              </text>
              <text x={cX - 4} y="14" fontSize="11" fill="#64748b" fontWeight="bold">
                sin
              </text>
              <text x={cX - 12} y={cY + 14} fontSize="10" fill="#94a3b8">
                O
              </text>

              {/* Đường tròn đơn vị */}
              <circle cx={cX} cy={cY} r={cR} fill="none" stroke="#0d9488" strokeWidth="2.2" />
              {spiralPath && <><path d={spiralPath} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8"/><text x="12" y="328" fontSize="10" fill="#92400e" fontWeight="700">Số vòng quay k = {Math.trunc(thetaDeg / 360)}; điểm M lặp lại sau mỗi 2π</text></>}
              {showTanCot && <g fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="5 4"><line x1={cX + cR} y1="25" x2={cX + cR} y2="315"/><line x1="25" y1={cY - cR} x2="315" y2={cY - cR}/></g>}
              {showTanCot && Math.abs(cosVal) > 0.02 && <line x1={cX} y1={cY} x2={cX+cR} y2={cY-cR*tanVal!} stroke="#7c3aed" strokeWidth="2.5"/>}
              {showTanCot && Math.abs(sinVal) > 0.02 && <line x1={cX} y1={cY} x2={cX+cR*cotVal!} y2={cY-cR} stroke="#db2777" strokeWidth="2.5"/>}
              {showTanCot && <g fill="#5b21b6" fontSize="10" fontWeight="700"><text x={cX+cR+4} y="35">x=1 (tan)</text><text x="22" y={cY-cR-5}>y=1 (cot)</text>{Math.abs(cosVal)<=0.02 && <text x="190" y="42">tan α không xác định</text>}{Math.abs(sinVal)<=0.02 && <text x="30" y="65">cot α không xác định</text>}</g>}

              {/* Bán kính qua điểm M */}
              <line x1={cX} y1={cY} x2={mScreenX} y2={mScreenY} stroke="#0f766e" strokeWidth="2" />

              {/* Đường dóng hình chiếu vuông góc lên trục cos và trục sin */}
              {/* Hình chiếu lên Ox (cos) */}
              <line
                x1={mScreenX}
                y1={mScreenY}
                x2={mScreenX}
                y2={cY}
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line x1={cX} y1={cY} x2={mScreenX} y2={cY} stroke="#2563eb" strokeWidth="3" />

              {/* Hình chiếu lên Oy (sin) */}
              <line
                x1={mScreenX}
                y1={mScreenY}
                x2={cX}
                y2={mScreenY}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line x1={cX} y1={cY} x2={cX} y2={mScreenY} stroke="#dc2626" strokeWidth="3" />

              {/* Cung đo góc α */}
              <path
                d={`M ${cX + 28} ${cY} A 28 28 0 ${thetaDeg % 360 > 180 ? 1 : 0} 0 ${
                  cX + 28 * Math.cos(thetaRad)
                } ${cY - 28 * Math.sin(thetaRad)}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
              />

              {/* Điểm ngọn M kéo thả tự do */}
              <circle
                cx={mScreenX}
                cy={mScreenY}
                r="7"
                fill="#0d9488"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="filter drop-shadow cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
              />
              <text
                x={mScreenX + 8}
                y={mScreenY - 8}
                fontSize="12"
                fill="#0f766e"
                fontWeight="bold"
              >
                M
              </text>
            </svg>
          </div>

          {/* Bảng giá trị Lượng giác 4 hàm chuẩn SGK */}
          <div className="w-full grid grid-cols-2 gap-2 mt-2.5 text-xs font-mono">
            <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-blue-700 font-sans font-bold block text-[10px]">Hoành độ (cos α):</span>
              <span className="text-sm font-extrabold text-blue-950">{formatVNFloat(cosVal)}</span>
            </div>
            <div className="p-2 bg-red-50/70 border border-red-200 rounded-xl">
              <span className="text-red-700 font-sans font-bold block text-[10px]">Tung độ (sin α):</span>
              <span className="text-sm font-extrabold text-red-950">{formatVNFloat(sinVal)}</span>
            </div>
            <div className="p-2 bg-purple-50/70 border border-purple-200 rounded-xl">
              <span className="text-purple-700 font-sans font-bold block text-[10px]">tan α = sin/cos:</span>
              <span className="text-sm font-extrabold text-purple-950">
                {tanVal !== null ? formatVNFloat(tanVal) : "Không XĐ"}
              </span>
            </div>
            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-emerald-700 font-sans font-bold block text-[10px]">cot α = cos/sin:</span>
              <span className="text-sm font-extrabold text-emerald-950">
                {cotVal !== null ? formatVNFloat(cotVal) : "Không XĐ"}
              </span>
            </div>
          </div>
        </div>

        {/* NỬA PHẢI: ĐỒ THỊ SÓNG ĐỒNG BỘ 100% */}
        <div className="lg:col-span-7 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-bold text-slate-800">
                {isGeneralWave
                  ? `Sóng tổng quát: y = ${amp}·sin(${omega}x + ${phiDeg}°) ${shiftY !== 0 ? `+ ${shiftY}` : ""}`
                  : `Đồ thị hàm số y = ${waveMode}(x)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setWaveMode("sin");
                    setIsGeneralWave(false);
                  }}
                  className={`px-2 py-0.5 rounded ${
                    !isGeneralWave && waveMode === "sin" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  sin(x)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWaveMode("cos");
                    setIsGeneralWave(false);
                  }}
                  className={`px-2 py-0.5 rounded ${
                    !isGeneralWave && waveMode === "cos" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  cos(x)
                </button>
                <button
                  type="button"
                  onClick={() => setIsGeneralWave(true)}
                  className={`px-2 py-0.5 rounded ${
                    isGeneralWave ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Khảo sát sóng A·sin(ωx+φ)
                </button>
              </div>
            </div>
          </div>

          {/* SVG Wave Graph */}
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] flex justify-center p-2">
            <svg
              viewBox={`0 0 ${waveSvgWidth} ${waveSvgHeight}`}
              className="w-full max-w-[420px] h-auto select-none"
            >
              {/* Lưới tọa độ */}
              <defs>
                <pattern id="gridPatternWave" width="45" height="55" patternUnits="userSpaceOnUse">
                  <path d="M 45 0 L 0 0 0 55" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={waveSvgWidth} height={waveSvgHeight} fill="url(#gridPatternWave)" />

              {/* Trục hoành Ox và Trục tung Oy */}
              <line x1={waveOriginX} y1="20" x2={waveOriginX} y2={waveSvgHeight - 20} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="20" y1={waveOriginY} x2={waveSvgWidth - 20} y2={waveOriginY} stroke="#94a3b8" strokeWidth="1.5" />
              <text x={waveSvgWidth - 16} y={waveOriginY + 14} fontSize="11" fill="#64748b" fontWeight="bold">
                x
              </text>
              <text x={waveOriginX - 12} y="18" fontSize="11" fill="#64748b" fontWeight="bold">
                y
              </text>

              {/* Các mốc tọa độ đặc biệt: π/2, π, 3π/2, 2π */}
              {[
                { rad: Math.PI / 2, label: "π/2" },
                { rad: Math.PI, label: "π" },
                { rad: (3 * Math.PI) / 2, label: "3π/2" },
                { rad: 2 * Math.PI, label: "2π" },
              ].map((tick) => {
                const sx = waveOriginX + tick.rad * waveScaleX;
                return (
                  <g key={`tick-${tick.label}`}>
                    <line x1={sx} y1={waveOriginY - 4} x2={sx} y2={waveOriginY + 4} stroke="#94a3b8" strokeWidth="1" />
                    <text x={sx} y={waveOriginY + 16} fontSize="10" fill="#64748b" textAnchor="middle">
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* Đường cong đồ thị sóng y = sin/cos */}
              <path
                d={wavePath}
                fill="none"
                stroke={waveMode === "sin" || isGeneralWave ? "#e11d48" : "#2563eb"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* ĐƯỜNG DÓNG NGANG TƯƠNG TÁC ĐỒNG BỘ TỪ M SANG ĐỒ THỊ */}
              <line
                x1={waveOriginX}
                y1={wavePointScreenY}
                x2={wavePointScreenX}
                y2={wavePointScreenY}
                stroke="#0d9488"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <line
                x1={wavePointScreenX}
                y1={waveOriginY}
                x2={wavePointScreenX}
                y2={wavePointScreenY}
                stroke="#0d9488"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />

              {/* Điểm P tương ứng trên đồ thị */}
              <circle
                cx={wavePointScreenX}
                cy={wavePointScreenY}
                r="6"
                fill="#0d9488"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={wavePointScreenX + 8}
                y={wavePointScreenY - 8}
                fontSize="11"
                fill="#0f766e"
                fontWeight="bold"
              >
                P({formatVNFloat(normThetaRad)}; {formatVNFloat(currentWaveVal)})
              </text>
            </svg>
          </div>

          {/* Khảo sát tham số sóng A, omega, phi, d */}
          {isGeneralWave && (
            <div className="w-full mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Tham số sóng: y = A·sin(ωx + φ) + d</span>
                <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Chu kỳ T = {formatVNFloat(period)} s
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>Biên độ A:</span>
                    <strong className="font-mono">{formatVNFloat(amp)}</strong>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    value={amp}
                    onChange={(e) => setParamVal("amp", parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>Tần số góc ω:</span>
                    <strong className="font-mono">{formatVNFloat(omega)} rad/s</strong>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={omega}
                    onChange={(e) => setParamVal("omega", parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>Pha ban đầu φ:</span>
                    <strong className="font-mono">{phiDeg}°</strong>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={15}
                    value={phiDeg}
                    onChange={(e) => setParamVal("phi", parseFloat(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>Độ dời trục d:</span>
                    <strong className="font-mono">{formatVNFloat(shiftY)}</strong>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={shiftY}
                    onChange={(e) => setParamVal("shiftY", parseFloat(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <TrigonometryPracticeTools />
    </div>
  );
}
