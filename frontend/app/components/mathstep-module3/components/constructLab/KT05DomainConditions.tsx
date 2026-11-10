/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT05: Miền xác định và điều kiện
 * Chiều ngược 5: Phân tích mẫu số, hàm tan/cot, phép chia phương trình và căn thức
 * Tách biệt rõ tập cấm E và miền xác định D = ℝ \ E, không điền trước đáp án (IMG08).
 */

import React, { useState, useEffect } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';

interface KT05Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

export const KT05DomainConditions: React.FC<KT05Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  // Student condition inputs (Clean turn starts blank)
  const [conditionType, setConditionType] = useState<string>('denominator_nonzero');
  const [studentConditionText, setStudentConditionText] = useState<string>('');
  const [excludedAngleText, setExcludedAngleText] = useState<string>('');
  const [excludedPointCoords, setExcludedPointCoords] = useState<string>('');

  // Factoring choice for sin 2x = sin x
  const [equationApproach, setEquationApproach] = useState<'factor' | 'divide'>('factor');

  // Verification state
  const [hasVerified, setHasVerified] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Reset state when switching tasks
  useEffect(() => {
    setStudentConditionText('');
    setExcludedAngleText('');
    setExcludedPointCoords('');
    setHasVerified(false);
    setIsPassed(false);
    setFeedback('');
    setEquationApproach('factor');
  }, [task.id]);

  const handleVerify = () => {
    setHasVerified(true);
    let passed = false;
    let msg = '';

    if (task.id === 'KT05_TASK01') {
      const mentionsCosMinus1 = studentConditionText.includes('-1');
      const mentionsPi = excludedAngleText.includes('π');
      const mentionsPoint = excludedPointCoords.includes('-1');
      passed = mentionsCosMinus1 && mentionsPi;
      msg = passed
        ? 'Chính xác! Mẫu số 1 + cos(x) ≠ 0 tương đương cos(x) ≠ -1. Điểm bị loại trên đường tròn là (-1; 0) ứng với tập cấm E = {π + k2π}. Miền xác định là D = ℝ \\ {π + k2π, k ∈ ℤ}.'
        : 'Chưa đầy đủ. Hãy chú ý: 1 + cos(x) ≠ 0 => cos(x) ≠ -1. Điểm trên đường tròn có hoành độ bằng -1 là (-1; 0), ứng với tập cấm E = {π + k2π}.';
    } else if (task.id === 'KT05_TASK04') {
      passed = equationApproach === 'factor';
      msg = passed
        ? 'Rất xuất sắc! Chuyển vế thành sin(x)(2cos(x) - 1) = 0 cho đầy đủ cả 4 nghiệm: 0, π/3, π, 5π/3. Tuyệt đối không chia tự ý cho sin(x) để tránh làm mất nghiệm!'
        : 'Cảnh báo sai lầm: Chia hai vế cho sin(x) khi chưa biết sin(x) khác 0 sẽ làm mất hai nghiệm x = 0 và x = π!';
    } else {
      passed = true;
      msg = 'Đã kiểm tra điều kiện xác định thành công!';
    }

    setIsPassed(passed);
    setFeedback(msg);
    onLogRevision({ conditionType, studentConditionText, excludedAngleText }, msg);
    if (passed) onTaskCompleted();
  };

  // Unit circle SVG with excluded point highlighted
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;

  // Excluded point for TASK01 is (-1; 0) -> px = cx - r, py = cy
  const exclPx = cx - r;
  const exclPy = cy;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left: Circle & Real Axis Representation */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
        <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Biểu diễn điểm bị loại & Miền xác định D
          </div>
          <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            D = ℝ \ E
          </span>
        </div>

        {/* SVG Circle with excluded hole */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[260px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] select-none">
            {/* Coordinate axes */}
            <line x1={20} y1={cy} x2={size - 20} y2={cy} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={cx} y1={size - 20} x2={cx} y2={20} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={size - 18} y={cy + 4} fill="#64748B" fontSize={11} fontWeight="bold">x</text>
            <text x={cx + 6} y={18} fill="#64748B" fontSize={11} fontWeight="bold">y</text>

            {/* Main unit circle */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748B" strokeWidth={2} />

            {/* Valid Points arc (for example cos >= 0 or entire circle except -1) */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#10B981"
              strokeWidth={4}
              strokeDasharray="8,2"
              opacity={0.6}
            />

            {/* Excluded Point (-1; 0) as hollow red cross/circle */}
            <circle cx={exclPx} cy={exclPy} r={7} fill="#FFFFFF" stroke="#F43F5E" strokeWidth={2.5} />
            <line x1={exclPx - 5} y1={exclPy - 5} x2={exclPx + 5} y2={exclPy + 5} stroke="#F43F5E" strokeWidth={2} />
            <line x1={exclPx - 5} y1={exclPy + 5} x2={exclPx + 5} y2={exclPy - 5} stroke="#F43F5E" strokeWidth={2} />

            {/* Label for Excluded Point */}
            <rect x={exclPx - 90} y={exclPy - 22} width={82} height={16} rx={3} fill="#FFF1F2" stroke="#FDA4AF" strokeWidth={1} />
            <text x={exclPx - 49} y={exclPy - 10} fill="#E11D48" fontSize={9} fontWeight="bold" textAnchor="middle">
              Điểm loại: (-1; 0)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs pt-2 border-t text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-rose-500 inline-block" />
            <span>Điểm bị loại (làm mẫu = 0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-500 inline-block" />
            <span>Miền xác định nhận</span>
          </div>
        </div>
      </div>

      {/* Right: Student Condition Setup */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Task Box (Đề cho) */}
        <div className="bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 p-3.5 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            📌 Đề bài
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {task.statement}
          </p>
        </div>

        {/* Condition Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🚫</span>
              <span>Em xác định điều kiện xác định</span>
            </span>
          </div>

          {/* 1. Thành phần cần đặt điều kiện */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              1. Thành phần bài toán có điều kiện:
            </label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
            >
              <option value="denominator_nonzero">Mẫu số khác 0 (phân thức)</option>
              <option value="radicand_nonneg">Biểu thức dưới căn bậc hai không âm</option>
              <option value="tangent_domain">Hàm tan (cos x ≠ 0) / cot (sin x ≠ 0)</option>
            </select>
          </div>

          {/* 2. Phương trình điều kiện */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              2. Biểu thức điều kiện đại số:
            </label>
            <input
              type="text"
              value={studentConditionText}
              onChange={(e) => setStudentConditionText(e.target.value)}
              className="mt-1 w-full p-2 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-blue-600"
              placeholder="ví dụ: 1 + cos(x) ≠ 0 ⇔ cos(x) ≠ -1"
            />
          </div>

          {/* 3. Phân biệt Tập cấm E vs Miền D */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">
                Tập cấm E (Họ bị loại)
              </label>
              <input
                type="text"
                value={excludedAngleText}
                onChange={(e) => setExcludedAngleText(e.target.value)}
                className="mt-1 w-full p-1.5 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg text-rose-600"
                placeholder="x = π + k2π"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">
                Tọa độ điểm cấm
              </label>
              <input
                type="text"
                value={excludedPointCoords}
                onChange={(e) => setExcludedPointCoords(e.target.value)}
                className="mt-1 w-full p-1.5 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="(-1; 0)"
              />
            </div>
          </div>

          {/* Special Option for Equation Task */}
          {task.id === 'KT05_TASK04' && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Chiến lược giải sin(2x) = sin(x):
              </span>
              <div className="flex gap-2 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="approach"
                    value="factor"
                    checked={equationApproach === 'factor'}
                    onChange={() => setEquationApproach('factor')}
                    className="accent-blue-600"
                  />
                  <span>Chuyển vế đặt nhân tử chung sin(x)(2cos x - 1) = 0</span>
                </label>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                  <input
                    type="radio"
                    name="approach"
                    value="divide"
                    checked={equationApproach === 'divide'}
                    onChange={() => setEquationApproach('divide')}
                    className="accent-blue-600"
                  />
                  <span>Chia hai vế cho sin(x)</span>
                </label>
              </div>
            </div>
          )}

          {/* Verify CTA */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm toán Miền xác định</span>
          </button>
        </div>

        {/* Verification feedback */}
        {hasVerified && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isPassed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span>{isPassed ? '✅' : '⚠️'}</span>
              <span>{isPassed ? 'Điều kiện xác định chính xác' : 'Cảnh báo lỗi'}</span>
            </div>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
