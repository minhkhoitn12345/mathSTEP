/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT02: Em tự dựng đồ thị
 * Chiều ngược 2: Từ bảng giá trị và phép biến đổi tự dựng nên đồ thị hàm số
 */

import React, { useState } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';

interface KT02Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

interface TablePoint {
  xRad: number;
  xLabel: string;
  y: number;
}

export const KT02BuildGraph: React.FC<KT02Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  const funcType = (task.givenData.func as 'sin' | 'cos' | 'tan') || 'sin';

  // Student Plotted Points in Value Table
  const [points, setPoints] = useState<TablePoint[]>([
    { xRad: 0, xLabel: '0', y: 0 },
    { xRad: Math.PI / 2, xLabel: 'π/2', y: 1 },
    { xRad: Math.PI, xLabel: 'π', y: 0 },
  ]);

  // Transform Selections
  const [symmetry, setSymmetry] = useState<'none' | 'origin' | 'y_axis'>('none');
  const [periodShift, setPeriodShift] = useState<number>(0);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // New row input
  const [inputX, setInputX] = useState<string>('3π/2');
  const [inputY, setInputY] = useState<string>('-1');

  // Verification state
  const [hasVerified, setHasVerified] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isPassed, setIsPassed] = useState(false);

  // Add point
  const handleAddPoint = () => {
    let rad = 0;
    if (inputX.includes('π')) {
      const mult = parseFloat(inputX.replace('π', '').replace('/', '')) || 1;
      rad = mult * Math.PI;
    } else {
      rad = parseFloat(inputX) || 0;
    }
    const yVal = parseFloat(inputY) || 0;
    setPoints([...points, { xRad: rad, xLabel: inputX, y: yVal }]);
  };

  // Remove point
  const handleRemovePoint = (idx: number) => {
    setPoints(points.filter((_, i) => i !== idx));
  };

  // Verify
  const handleVerify = () => {
    setHasVerified(true);
    let passed = false;
    let msg = '';

    if (funcType === 'sin') {
      const correctSymmetry = symmetry === 'origin';
      const hasKeyPoints = points.length >= 3;
      passed = correctSymmetry && hasKeyPoints;
      msg = passed
        ? 'Chính xác! Đồ thị y = sin x là hàm số lẻ, nhận gốc tọa độ O làm tâm đối xứng: sin(-x) = -sin(x). Sau đó mở rộng theo chu kỳ T = 2π.'
        : 'Chưa đạt: Hàm sin x là hàm số lẻ nên phải chọn phép đối xứng qua gốc tọa độ O (thay vì đối xứng qua trục Oy).';
    } else if (funcType === 'cos') {
      const correctSymmetry = symmetry === 'y_axis';
      passed = correctSymmetry;
      msg = passed
        ? 'Chính xác! Đồ thị y = cos x là hàm số chẵn, nhận trục tung Oy làm trục đối xứng: cos(-x) = cos(x).'
        : 'Chưa đạt: Hàm cos x là hàm chẵn nên phải chọn phép đối xứng qua trục tung Oy.';
    } else {
      passed = true;
      msg = 'Đã hoàn thành khảo sát và dựng nhánh đồ thị!';
    }

    setIsPassed(passed);
    setFeedback(msg);
    setShowComparison(true);
    onLogRevision({ points, symmetry, periodShift }, msg);
    if (passed) onTaskCompleted();
  };

  // Stage dimensions
  const width = 500;
  const height = 260;
  const originX = width / 2;
  const originY = height / 2;
  const scaleX = 55; // pixels per radian
  const scaleY = 70; // pixels per unit

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Visual Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sân dựng đồ thị hàm số · Lớp tự kiến tạo
          </div>
          <div className="flex items-center gap-2">
            {hasVerified && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  showComparison
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {showComparison ? 'Ẩn lớp đối chứng' : 'Hiện lớp đối chứng'}
              </button>
            )}
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              y = {funcType}(x)
            </span>
          </div>
        </div>

        {/* Coordinate Grid SVG */}
        <div className="w-full h-64 flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
            {/* Grid lines */}
            <line x1={20} y1={originY} x2={width - 20} y2={originY} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={originX} y1={height - 20} x2={originX} y2={20} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={width - 18} y={originY + 4} fill="#64748B" fontSize={11} fontWeight="bold">x</text>
            <text x={originX + 6} y={18} fill="#64748B" fontSize={11} fontWeight="bold">y</text>

            {/* Radian tick marks on x axis */}
            {[-2, -1, 1, 2].map((m) => {
              const xPos = originX + m * Math.PI * scaleX;
              return (
                <g key={m}>
                  <line x1={xPos} y1={originY - 4} x2={xPos} y2={originY + 4} stroke="#94A3B8" strokeWidth={1.5} />
                  <text x={xPos} y={originY + 16} fill="#64748B" fontSize={10} textAnchor="middle">
                    {m === 1 ? 'π' : m === -1 ? '-π' : `${m}π`}
                  </text>
                </g>
              );
            })}

            {/* Reference curve (when toggled after verification) */}
            {showComparison && (
              <path
                d={Array.from({ length: 120 }, (_, i) => {
                  const xVal = -2 * Math.PI + (i / 119) * 4 * Math.PI;
                  let yVal = 0;
                  if (funcType === 'sin') yVal = Math.sin(xVal);
                  else if (funcType === 'cos') yVal = Math.cos(xVal);
                  else yVal = Math.tan(xVal);
                  const px = originX + xVal * scaleX;
                  const py = originY - yVal * scaleY;
                  return `${i === 0 ? 'M' : 'L'} ${px} ${Math.max(10, Math.min(height - 10, py))}`;
                }).join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="4,4"
                opacity={0.8}
              />
            )}

            {/* Student Plotted Points */}
            {points.map((pt, i) => {
              const px = originX + pt.xRad * scaleX;
              const py = originY - pt.y * scaleY;
              return (
                <g key={i}>
                  <circle cx={px} cy={py} r={6} fill="#EA580C" stroke="#FFFFFF" strokeWidth={2} />
                  <text x={px + 8} y={py - 6} fill="#EA580C" fontSize={10} fontWeight="bold">
                    ({pt.xLabel}; {pt.y})
                  </text>
                </g>
              );
            })}

            {/* Symmetry Reflected Points */}
            {symmetry === 'origin' &&
              points.map((pt, i) => {
                const px = originX - pt.xRad * scaleX;
                const py = originY + pt.y * scaleY;
                return (
                  <circle key={`sym-${i}`} cx={px} cy={py} r={5} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={1.5} />
                );
              })}
            {symmetry === 'y_axis' &&
              points.map((pt, i) => {
                const px = originX - pt.xRad * scaleX;
                const py = originY - pt.y * scaleY;
                return (
                  <circle key={`sym-${i}`} cx={px} cy={py} r={5} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={1.5} />
                );
              })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span>Điểm em đặt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>Điểm qua phép đối xứng</span>
          </div>
          {showComparison && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-600"></span>
              <span>Đường chuẩn toán học</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Table & Transformations */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Value Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>📊 Bảng giá trị (x; f(x))</span>
            <span className="text-xs text-slate-400 font-normal">{points.length} điểm</span>
          </div>

          <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2">x</th>
                  <th className="p-2">f(x)</th>
                  <th className="p-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {points.map((pt, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60 font-mono">
                    <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{pt.xLabel}</td>
                    <td className="p-2 text-orange-600 font-bold">{pt.y}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleRemovePoint(i)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              placeholder="x (ví dụ: π/4)"
              className="w-1/2 p-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <input
              type="text"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              placeholder="y (ví dụ: 0.707)"
              className="w-1/3 p-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <button
              onClick={handleAddPoint}
              className="p-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
            >
              +
            </button>
          </div>

          {/* Symmetry selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Chọn phép đối xứng để mở rộng sang [-π, 0]:
            </label>
            <div className="mt-1 grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setSymmetry('origin')}
                className={`p-2 rounded-lg border font-medium transition-colors ${
                  symmetry === 'origin'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Đối xứng qua gốc O (Hàm lẻ)
              </button>
              <button
                onClick={() => setSymmetry('y_axis')}
                className={`p-2 rounded-lg border font-medium transition-colors ${
                  symmetry === 'y_axis'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Đối xứng qua trục Oy (Hàm chẵn)
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm chứng Phép Dựng Đồ Thị</span>
          </button>
        </div>

        {/* Feedback box */}
        {hasVerified && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span>{isPassed ? '✅' : '⚠️'}</span>
              <span>{isPassed ? 'Dựng đồ thị đạt chuẩn' : 'Chưa đúng phép biến đổi'}</span>
            </div>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
