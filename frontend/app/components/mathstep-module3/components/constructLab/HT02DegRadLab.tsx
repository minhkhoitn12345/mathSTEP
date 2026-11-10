/**
 * MathSTEP Module 3: Lượng Giác - Công cụ HT02: Phòng thực hành DEG / RAD
 * Tránh bẫy nhầm lẫn đơn vị đo góc, góc chính arcsin và ký hiệu nghịch đảo
 * Tuân thủ nghiêm ngặt quy tắc phân biệt biểu thức chính xác vs số xấp xỉ (Section 11.4)
 */

import React, { useState } from 'react';

export const HT02DegRadLab: React.FC = () => {
  const [inputVal, setInputVal] = useState<string>('30');
  const [calcFunc, setCalcFunc] = useState<'sin' | 'cos' | 'tan'>('sin');

  // Arcsin demo
  const [mValue, setMValue] = useState<string>('0.58');

  const numVal = parseFloat(inputVal) || 0;
  const mNum = parseFloat(mValue) || 0;

  // DEG calculation
  const degRad = (numVal * Math.PI) / 180;
  let degResult = 0;
  if (calcFunc === 'sin') degResult = Math.sin(degRad);
  else if (calcFunc === 'cos') degResult = Math.cos(degRad);
  else degResult = Math.tan(degRad);

  // RAD calculation (numVal interpreted as radians)
  let radResult = 0;
  if (calcFunc === 'sin') radResult = Math.sin(numVal);
  else if (calcFunc === 'cos') radResult = Math.cos(numVal);
  else radResult = Math.tan(numVal);

  // Arcsin calculations
  const hasRealSolution = Math.abs(mNum) <= 1;
  const arcRad = hasRealSolution ? Math.asin(mNum) : NaN;
  const arcDeg = hasRealSolution ? (arcRad * 180) / Math.PI : NaN;

  // Exact radian formatting helper
  const getExactRadLabel = (deg: number): string => {
    if (deg === 30) return 'π/6 rad (chính xác)';
    if (deg === 45) return 'π/4 rad (chính xác)';
    if (deg === 60) return 'π/3 rad (chính xác)';
    if (deg === 90) return 'π/2 rad (chính xác)';
    if (deg === 180) return 'π rad (chính xác)';
    if (deg === 360) return '2π rad (chính xác)';
    return `≈ ${(degRad / Math.PI).toFixed(3)}π rad`;
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* 1. DEG vs RAD Pitfall Card */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-xs">
        <div className="border-b pb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📐</span>
            <span>Bẫy nhầm lẫn đơn vị: Độ (DEG) vs Radian (RAD)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Thí nghiệm với số {numVal}: {numVal} độ hoàn toàn khác {numVal} radian!
          </p>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Nhập giá trị số đo:
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="mt-1 w-full p-2 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Hàm lượng giác:
            </label>
            <div className="mt-1 flex gap-1 font-mono font-bold text-xs">
              {(['sin', 'cos', 'tan'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setCalcFunc(f)}
                  className={`px-3 py-2 rounded-xl border ${
                    calcFunc === f ? 'bg-blue-600 text-white' : 'bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 rounded-xl">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              Chế độ Độ (DEG)
            </span>
            <div className="text-lg font-mono font-extrabold text-blue-900 dark:text-blue-200 mt-1">
              {calcFunc}({numVal}°) = {degResult.toFixed(4)}
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-300 mt-1 font-medium">
              Góc {numVal}° = {getExactRadLabel(numVal)}
            </p>
          </div>

          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
              Chế độ Radian (RAD)
            </span>
            <div className="text-lg font-mono font-extrabold text-red-900 dark:text-red-200 mt-1">
              {calcFunc}({numVal} rad) = {radResult.toFixed(8)}
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-300 mt-1">
              {numVal} rad tương đương ≈ {((numVal * 180) / Math.PI).toFixed(1)}° (gần {(numVal / (2 * Math.PI)).toFixed(2)} vòng quay!)
            </p>
          </div>
        </div>

        {/* Visual Callout */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>⚠️ Lời khuyên khi làm bài:</strong> Trước khi ấn máy tính cầm tay, luôn kiểm tra góc trên màn hình đang hiện chữ <strong>D</strong> (Degree) hay chữ <strong>R</strong> (Radian). Ví dụ: sin(30°) = 1/2 = 0.5, nhưng sin(30 rad) ≈ -0.98803162!
        </div>
      </div>

      {/* 2. Arcsin vs Inverse Pitfall Card */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
        <div className="border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🎯</span>
            <span>Góc chính arcsin & Họ nghiệm</span>
          </h4>
          <p className="text-xs text-slate-500">
            Phân biệt góc chính máy tính trả về với họ nghiệm đầy đủ trên ℝ
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Giải sin(x) = m với m =
          </label>
          <input
            type="text"
            value={mValue}
            onChange={(e) => setMValue(e.target.value)}
            className="mt-1 w-full p-2 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-purple-600"
            placeholder="0.58"
          />
        </div>

        {hasRealSolution ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500">Góc chính α₀ = arcsin({mNum}):</span>
              <div className="font-bold text-purple-700 text-sm mt-0.5">
                α₀ ≈ {arcRad.toFixed(6)} rad (≈ {arcDeg.toFixed(2)}°)
              </div>
            </div>
            <div className="pt-2 border-t text-[11px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              <strong>Họ nghiệm chính xác trên ℝ (k ∈ ℤ):</strong>
              <ul className="list-disc list-inside mt-1 font-mono text-blue-600 dark:text-blue-400 space-y-0.5">
                <li>x = α₀ + k2π</li>
                <li>x = π - α₀ + k2π</li>
              </ul>
              <div className="mt-2 text-[10px] text-slate-500">
                Giá trị xấp xỉ: x ≈ {arcRad.toFixed(3)} + k2π hoặc x ≈ {(Math.PI - arcRad).toFixed(3)} + k2π (chỉ dùng dấu ≈, không dùng dấu =).
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200">
            <strong>Vô nghiệm trên ℝ:</strong> Do |m| = {Math.abs(mNum)} &gt; 1, phương trình sin(x) = {mNum} không có góc thực. Máy tính trả về Math ERROR.
          </div>
        )}

        {/* Warning card for sin^-1 vs 1/sin */}
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl text-xs text-red-900 dark:text-red-200 leading-relaxed">
          <strong>❌ Cực kỳ tránh nhầm lẫn:</strong> Ký hiệu <code>sin⁻¹(x)</code> trên máy tính là hàm ngược <strong>arcsin(x)</strong> (tìm một góc lượng giác), hoàn toàn KHÔNG PHẢI là phép nghịch đảo <code>1/sin(x)</code>!
        </div>
      </div>
    </div>
  );
};
