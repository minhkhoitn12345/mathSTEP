/**
 * MathSTEP Module 3: Lượng Giác
 * Right Control Panel (UI04)
 * Controls angle input (deg/rad), quick presets (-750°, 330°, 1110°, 25π/6),
 * step increments (±15°, ±30°, ±90°), animation playback & speed,
 * visual layer toggles, function parameters (a, b, c, d), and interactive (x, f(x)) value table.
 */

import React, { useState, useEffect } from 'react';
import { AngleUnit, ExactAngle, FunctionParams, FunctionType, TableRow, TrigValues } from '../../types/math';
import { parseAndNormalizeAngle } from '../../mathCore/trigMath';

interface ControlPanelProps {
  angle: ExactAngle;
  onAngleChange: (deg: number) => void;
  unit: AngleUnit;
  onUnitToggle: () => void;
  trigValues: TrigValues;
  functionType: FunctionType;
  onFunctionTypeChange: (fn: FunctionType) => void;
  params: FunctionParams;
  onParamsChange: (newParams: FunctionParams) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  // Overlays
  showProjections: boolean;
  onToggleProjections: () => void;
  showTangentAxis: boolean;
  onToggleTangentAxis: () => void;
  showCotangentAxis: boolean;
  onToggleCotangentAxis: () => void;
  showSpecialTriangle: boolean;
  onToggleSpecialTriangle: () => void;
  showQuadrants: boolean;
  onToggleQuadrants: () => void;
  showSpiral: boolean;
  onToggleSpiral: () => void;
  // Table
  tableRows: TableRow[];
  onAddTableRow: () => void;
  onRemoveTableRow: (id: string) => void;
  onExportTableCSV: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  angle,
  onAngleChange,
  unit,
  onUnitToggle,
  trigValues,
  functionType,
  onFunctionTypeChange,
  params,
  onParamsChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
  showProjections,
  onToggleProjections,
  showTangentAxis,
  onToggleTangentAxis,
  showCotangentAxis,
  onToggleCotangentAxis,
  showSpecialTriangle,
  onToggleSpecialTriangle,
  showQuadrants,
  onToggleQuadrants,
  showSpiral,
  onToggleSpiral,
  tableRows,
  onAddTableRow,
  onRemoveTableRow,
  onExportTableCSV,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [customAngleInput, setCustomAngleInput] = useState(
    unit === 'deg' ? angle.degDecimal.toString() : `${(angle.radDecimal / Math.PI).toFixed(2)}π`
  );

  // Sync custom input with angle changes if not focused
  useEffect(() => {
    setCustomAngleInput(
      unit === 'deg'
        ? Math.round(angle.degDecimal * 10) / 10 + ''
        : `${Math.round((angle.radDecimal / Math.PI) * 100) / 100}π`
    );
  }, [angle.degDecimal, angle.radDecimal, unit]);

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-1.5 bg-white/90 dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          title="Mở bảng điều khiển"
        >
          ⚙️
        </button>
        <span className="text-[11px] font-bold text-slate-500 [writing-mode:vertical-lr] rotate-180 mt-6 tracking-wide">
          Bảng điều khiển & Tham số
        </span>
      </div>
    );
  }

  const handleApplyAngle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAngleInput.trim()) return;
    try {
      const parsed = parseAndNormalizeAngle(customAngleInput, unit);
      onAngleChange(parsed.degDecimal);
    } catch {
      // safe fallback
    }
  };

  const presets = [
    { label: '-750° (Mẫu)', deg: -750 },
    { label: '330° (Đại diện)', deg: 330 },
    { label: '1110° (3 vòng)', deg: 1110 },
    { label: '25π/6 (750°)', deg: 750 },
    { label: '30° (π/6)', deg: 30 },
    { label: '45° (π/4)', deg: 45 },
    { label: '60° (π/3)', deg: 60 },
    { label: '90° (π/2)', deg: 90 },
    { label: '180° (π)', deg: 180 },
    { label: '225° (5π/4)', deg: 225 },
  ];

  return (
    <div className="w-[300px] lg:w-[320px] h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Bảng điều khiển</span>
          <span className="text-xs text-slate-400 font-mono">Control Deck</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          title="Thu gọn bảng"
        >
          ▶
        </button>
      </div>

      {/* Control Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* Section 1: Angle Input & Steppers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Góc quay α</span>
            <button
              onClick={onUnitToggle}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Đơn vị: {unit === 'deg' ? 'Độ (°)' : 'Radian (rad)'}
            </button>
          </div>

          <form onSubmit={handleApplyAngle} className="flex gap-2">
            <input
              type="text"
              value={customAngleInput}
              onChange={(e) => setCustomAngleInput(e.target.value)}
              placeholder={unit === 'deg' ? 'ví dụ: -750 hoặc 1110' : 'ví dụ: 1.57 hoặc 25pi/6'}
              className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Đặt
            </button>
          </form>

          {/* Steppers */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            {[-90, -30, -15, 15, 30, 90].map((step) => (
              <button
                key={step}
                onClick={() => onAngleChange(angle.degDecimal + step)}
                className="py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {step > 0 ? `+${step}°` : `${step}°`}
              </button>
            ))}
          </div>

          {/* Animation Play/Pause & Speed */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mt-2">
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{isPlaying ? '⏸ Tạm dừng' : '▶ Tự động quay'}</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === s
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Quick Presets */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Góc mẫu thường gặp</div>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  onAngleChange(p.deg);
                  setCustomAngleInput(p.deg.toString());
                }}
                className={`p-1.5 rounded-lg border text-left text-[11px] font-mono transition-colors ${
                  Math.abs(angle.degDecimal - p.deg) < 1e-3
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Visual Overlays */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Lớp phủ trực quan</div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showProjections}
                onChange={onToggleProjections}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Hình chiếu sin (cam) & cos (xanh)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTangentAxis}
                onChange={onToggleTangentAxis}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Trục tang x = 1 (tím)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCotangentAxis}
                onChange={onToggleCotangentAxis}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Trục côtang y = 1 (xanh lục)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSpecialTriangle}
                onChange={onToggleSpecialTriangle}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Tam giác vuông đặc biệt</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showQuadrants}
                onChange={onToggleQuadrants}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Bốn góc phần tư (+ / -)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSpiral}
                onChange={onToggleSpiral}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Đường xoắn ốc nhiều vòng</span>
            </label>
          </div>
        </div>

        {/* Section 4: Function Model Parameters y = a·f(bx+c) + d */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Tham số hàm số</span>
            <div className="flex gap-1">
              {(['sin', 'cos', 'tan', 'cot'] as FunctionType[]).map((fn) => (
                <button
                  key={fn}
                  onClick={() => onFunctionTypeChange(fn)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono uppercase ${
                    functionType === fn
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-slate-500 font-mono">Biên độ a: {params.a}</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={params.a}
                onChange={(e) => onParamsChange({ ...params, a: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-500 font-mono">Tần số b: {params.b}</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={params.b}
                onChange={(e) => onParamsChange({ ...params, b: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-500 font-mono">Pha c: {(params.c / Math.PI).toFixed(2)}π</label>
              <input
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={Math.PI / 6}
                value={params.c}
                onChange={(e) => onParamsChange({ ...params, c: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-500 font-mono">Độ dịch d: {params.d}</label>
              <input
                type="range"
                min="-2"
                max="4"
                step="0.5"
                value={params.d}
                onChange={(e) => onParamsChange({ ...params, d: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Value Table (x, f(x)) */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Bảng giá trị (x, f(x))</span>
            <div className="flex gap-1">
              <button
                onClick={onAddTableRow}
                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-semibold"
                title="Thêm điểm hiện tại vào bảng"
              >
                + Thêm x
              </button>
              <button
                onClick={onExportTableCSV}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
                title="Xuất CSV có BOM UTF-8"
              >
                CSV
              </button>
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-[11px] font-mono tabular-nums text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-1 px-2">x (rad)</th>
                  <th className="py-1 px-2">f(x)</th>
                  <th className="py-1 px-1 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-slate-400 font-sans italic">
                      Chưa có điểm nào. Bấm &quot;+ Thêm x&quot; để lưu.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => onAngleChange((row.x * 180) / Math.PI)}
                    >
                      <td className="py-1 px-2">{row.xFormatted}</td>
                      <td className="py-1 px-2 font-semibold text-blue-600 dark:text-blue-400">
                        {row.fxFormatted}
                      </td>
                      <td className="py-1 px-1 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTableRow(row.id);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
