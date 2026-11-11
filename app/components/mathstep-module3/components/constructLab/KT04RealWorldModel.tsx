/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT04: Nối tình huống với mô hình và đồ thị
 * Chiều ngược 4: Từ chuyển động thực tiễn (Đu quay, con lắc, thủy triều) thiết lập mô hình hàm số
 * Khắc phục IMG07: Không điền trước các kết quả cần tìm, kiểm tra nghiêm ngặt điều kiện ban đầu t=0.
 */

import React, { useState, useEffect } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';
import {
  verifyFerrisWheelModel,
  FerrisWheelCheckResult,
} from '../../mathCore/constructLabMath';

interface KT04Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

export const KT04RealWorldModel: React.FC<KT04Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  // Task physical specs
  const R = (task.givenData.radius as number) || 75;
  const H0 = (task.givenData.centerHeight as number) || 90;
  const T = (task.givenData.periodMinutes as number) || 30;

  // Student Inputs (Fresh turn starts blank)
  const [studentMidlineD, setStudentMidlineD] = useState<string>('');
  const [studentAmpA, setStudentAmpA] = useState<string>('');
  const [studentPeriodT, setStudentPeriodT] = useState<string>('');
  const [studentFamily, setStudentFamily] = useState<'cos' | 'sin'>('cos');
  const [studentSignA, setStudentSignA] = useState<'-' | '+'>('-');
  const [studentOmegaStr, setStudentOmegaStr] = useState<string>('');
  const [studentFormula, setStudentFormula] = useState<string>('');

  // Physical Assumptions checked by student
  const [assumptions, setAssumptions] = useState<{ [key: string]: boolean }>({
    constantSpeed: false,
    idealCircle: false,
    groundReference: false,
  });

  // Verification Results
  const [hasVerified, setHasVerified] = useState(false);
  const [checkResult, setCheckResult] = useState<FerrisWheelCheckResult | null>(null);

  // Time probe for interactive animation
  const [timeT, setTimeT] = useState<number>(0);

  // Reset state when switching tasks
  useEffect(() => {
    setStudentMidlineD('');
    setStudentAmpA('');
    setStudentPeriodT('');
    setStudentFamily('cos');
    setStudentSignA('-');
    setStudentOmegaStr('');
    setStudentFormula('');
    setAssumptions({
      constantSpeed: false,
      idealCircle: false,
      groundReference: false,
    });
    setHasVerified(false);
    setCheckResult(null);
    setTimeT(0);
  }, [task.id]);

  // Handle Verify Action
  const handleVerify = () => {
    setHasVerified(true);
    const dVal = parseFloat(studentMidlineD) || 0;
    const aMag = parseFloat(studentAmpA) || 0;
    const aSigned = studentSignA === '-' ? -aMag : aMag;
    const bVal = Math.PI / 15; // PI/15 rad/min

    const res = verifyFerrisWheelModel(aSigned, bVal, 0, dVal, studentFamily);
    setCheckResult(res);

    onLogRevision({ studentFormula, res }, res.modelErrorDesc || 'Kiểm chứng mô hình thành công!');
    if (res.allPassed) onTaskCompleted();
  };

  // Height at current time slider based on actual physics
  const calcCurrentHeight = () => {
    // Physical reference: h(t) = H0 - R*cos(2pi*t/T)
    return H0 - R * Math.cos((2 * Math.PI * timeT) / T);
  };

  // Student's predicted height at current time
  const calcStudentHeight = () => {
    const d = parseFloat(studentMidlineD);
    const a = parseFloat(studentAmpA);
    if (isNaN(d) || isNaN(a)) return null;
    const aSigned = studentSignA === '-' ? -a : a;
    const omega = Math.PI / 15;
    return studentFamily === 'cos'
      ? d + aSigned * Math.cos(omega * timeT)
      : d + aSigned * Math.sin(omega * timeT);
  };

  const currPhysicalH = calcCurrentHeight();
  const currStudentH = calcStudentHeight();

  // SVG parameters
  const svgW = 420;
  const svgH = 260;
  const centerX = 140;
  const groundY = 240;
  const scale = 1.1; // scale pixels per meter
  const centerY = groundY - H0 * scale;
  const radiusPx = R * scale;

  // Cabin position
  const angleRad = -Math.PI / 2 + (2 * Math.PI * timeT) / T; // starts at bottom
  const cabinX = centerX + radiusPx * Math.cos(angleRad);
  const cabinY = centerY + radiusPx * Math.sin(angleRad);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left: Physical Wheel & Interactive Animation */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
        <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mô hình động học đu quay · Chiều cao h(t)
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">t = {timeT} phút:</span>
            <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
              h_thực = {currPhysicalH.toFixed(1)} m
            </span>
            {currStudentH !== null && (
              <span className="font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                h_em = {currStudentH.toFixed(1)} m
              </span>
            )}
          </div>
        </div>

        {/* SVG Ferris Wheel Simulation */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[260px]">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[440px] select-none">
            {/* Ground Line */}
            <line x1={10} y1={groundY} x2={svgW - 10} y2={groundY} stroke="#64748B" strokeWidth={2.5} />
            <text x={20} y={groundY + 14} fill="#64748B" fontSize={10} fontWeight="bold">Mặt đất (h = 0m)</text>

            {/* Support Tower Structure */}
            <line x1={centerX} y1={centerY} x2={centerX - 55} y2={groundY} stroke="#94A3B8" strokeWidth={2} />
            <line x1={centerX} y1={centerY} x2={centerX + 55} y2={groundY} stroke="#94A3B8" strokeWidth={2} />

            {/* Wheel Outer Rim */}
            <circle cx={centerX} cy={centerY} r={radiusPx} fill="none" stroke="#CBD5E1" strokeWidth={2.5} />

            {/* Wheel Hub Center */}
            <circle cx={centerX} cy={centerY} r={6} fill="#2563EB" />
            <text x={centerX + 10} y={centerY - 4} fill="#2563EB" fontSize={10} fontWeight="bold">
              Tâm (h = {H0}m)
            </text>

            {/* Center Midline Guide */}
            <line x1={20} y1={centerY} x2={svgW - 20} y2={centerY} stroke="#94A3B8" strokeWidth={1} strokeDasharray="3,3" />

            {/* Spoke to Cabin */}
            <line x1={centerX} y1={centerY} x2={cabinX} y2={cabinY} stroke="#334155" strokeWidth={2} />

            {/* Cabin */}
            <circle cx={cabinX} cy={cabinY} r={8} fill="#EA580C" stroke="#FFFFFF" strokeWidth={2} />

            {/* Projection dashed line to height axis */}
            <line x1={cabinX} y1={cabinY} x2={svgW - 50} y2={cabinY} stroke="#EA580C" strokeWidth={1.5} strokeDasharray="3,3" />

            {/* Height Bar on Right */}
            <line x1={svgW - 50} y1={groundY - 165 * scale} x2={svgW - 50} y2={groundY} stroke="#94A3B8" strokeWidth={2} />
            <circle cx={svgW - 50} cy={cabinY} r={4} fill="#EA580C" />
            <text x={svgW - 42} y={cabinY + 4} fill="#EA580C" fontSize={11} fontWeight="bold">
              {currPhysicalH.toFixed(1)}m
            </text>
          </svg>
        </div>

        {/* Time Slider */}
        <div className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Thời gian t (phút):
          </label>
          <input
            type="range"
            min="0"
            max={T}
            step="0.5"
            value={timeT}
            onChange={(e) => setTimeT(parseFloat(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="font-mono font-bold w-14 text-right">
            {timeT.toFixed(1)} / {T}p
          </span>
        </div>
      </div>

      {/* Right: Mathematical Modeling Form (Em xác định) */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Task Box (Đề cho) */}
        <div className="bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 p-3.5 space-y-1.5 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            📌 Dữ kiện đề bài
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {task.statement}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🎡</span>
              <span>Em thiết lập hàm số h(t)</span>
            </span>
            <span className="text-[10px] text-slate-400">h(t) = d + A·trig(ωt)</span>
          </div>

          {/* 1. Midline d & Amplitude A */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Độ cao tâm d (m)</label>
              <input
                type="text"
                value={studentMidlineD}
                onChange={(e) => setStudentMidlineD(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-blue-600"
                placeholder="ví dụ: 90"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Bán kính / Biên độ A (m)</label>
              <input
                type="text"
                value={studentAmpA}
                onChange={(e) => setStudentAmpA(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-purple-600"
                placeholder="ví dụ: 75"
              />
            </div>
          </div>

          {/* 2. Chu kỳ T & Tần số góc omega */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Chu kỳ T (phút)</label>
              <input
                type="text"
                value={studentPeriodT}
                onChange={(e) => setStudentPeriodT(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="ví dụ: 30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Dạng hàm & Dấu A</label>
              <div className="mt-1 flex gap-1 text-xs font-mono font-bold">
                <button
                  onClick={() => setStudentSignA(studentSignA === '-' ? '+' : '-')}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-blue-700"
                  title="Đổi dấu trước A (- khi khởi hành từ đáy)"
                >
                  Dấu: {studentSignA}
                </button>
                <button
                  onClick={() => setStudentFamily(studentFamily === 'cos' ? 'sin' : 'cos')}
                  className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 text-blue-700 rounded-lg"
                >
                  {studentFamily}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Full Formula String */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Công thức hàm số em đề xuất:
            </label>
            <input
              type="text"
              value={studentFormula}
              onChange={(e) => setStudentFormula(e.target.value)}
              className="mt-1 w-full p-2 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-blue-700 dark:text-blue-300"
              placeholder="ví dụ: 90 - 75cos(πt/15)"
            />
          </div>

          {/* 4. Physical Assumptions Checklist */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Giả thiết mô hình hóa (Em chọn):
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={assumptions.constantSpeed}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, constantSpeed: e.target.checked })
                }
                className="rounded-sm accent-blue-600"
              />
              <span>Đu quay chuyển động tròn đều (tốc độ góc không đổi)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={assumptions.groundReference}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, groundReference: e.target.checked })
                }
                className="rounded-sm accent-blue-600"
              />
              <span>Gốc thời gian t = 0 chọn khi khách lên cabin ở điểm thấp nhất</span>
            </label>
          </div>

          {/* Verify CTA */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm chứng Mô hình Vật lý</span>
          </button>
        </div>

        {/* Verification feedback */}
        {hasVerified && checkResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              checkResult.allPassed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1.5">
              <span>{checkResult.allPassed ? '✅' : '⚠️'}</span>
              <span>
                {checkResult.allPassed
                  ? 'Mô hình khớp toàn bộ 5 mốc kiểm chứng'
                  : 'Phát hiện sai lệch mô hình'}
              </span>
            </div>
            {checkResult.modelErrorDesc && <p>{checkResult.modelErrorDesc}</p>}
            <div className="mt-2 space-y-1 font-mono text-[11px]">
              {checkResult.checkpoints.map((cp, idx) => (
                <div key={idx} className="flex justify-between border-b border-black/5 pb-0.5">
                  <span>Mốc t = {cp.t}p:</span>
                  <span className={cp.passed ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    Em tính: {cp.modelH.toFixed(1)}m | Đề: {cp.expectedH}m {cp.passed ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
