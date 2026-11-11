/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT03: Nhìn đồ thị viết công thức
 * Chiều ngược 3: Từ đồ thị mục tiêu, phân tích đặc trưng toán học và suy ra công thức tương đương
 * Khắc phục IMG05: Không điền trước đáp án, đường ứng viên chỉ bật khi học sinh yêu cầu thử,
 * hiển thị rõ chu kỳ T và tần số b/ω.
 */

import React, { useState, useEffect } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';
import {
  parseHarmonicFormula,
  areHarmonicsEquivalent,
  evaluateHarmonic,
  HarmonicParameters,
} from '../../mathCore/constructLabMath';

interface KT03Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

export const KT03GraphToFormula: React.FC<KT03Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  // Target specs from task
  const targetA = (task.givenData.amplitude as number) || 2;
  const targetB = (task.givenData.frequency as number) || 2;
  const targetC = (task.givenData.phase as number) || 0;
  const targetD = (task.givenData.midline as number) || -1;
  const targetFamily = (task.givenData.family as 'sin' | 'cos') || 'cos';

  const targetHarmonic: HarmonicParameters = parseHarmonicFormula(
    targetFamily,
    targetA,
    targetB,
    targetC,
    targetD
  );

  // Student inputs (Clean turn starts blank)
  const [studentYMax, setStudentYMax] = useState<string>('');
  const [studentYMin, setStudentYMin] = useState<string>('');
  const [studentMidlineD, setStudentMidlineD] = useState<string>('');
  const [studentAmpA, setStudentAmpA] = useState<string>('');
  const [studentPeriodT, setStudentPeriodT] = useState<string>('');
  const [studentFamily, setStudentFamily] = useState<'sin' | 'cos'>('cos');
  const [studentPhaseC, setStudentPhaseC] = useState<string>('');
  const [studentFormulaStr, setStudentFormulaStr] = useState<string>('');

  // Candidate curve overlay (Default false until requested by student)
  const [showCandidateCurve, setShowCandidateCurve] = useState<boolean>(false);

  // Verification
  const [hasVerified, setHasVerified] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Reset state when switching tasks
  useEffect(() => {
    setStudentYMax('');
    setStudentYMin('');
    setStudentMidlineD('');
    setStudentAmpA('');
    setStudentPeriodT('');
    setStudentFamily(task.givenData.family === 'sin' ? 'sin' : 'cos');
    setStudentPhaseC('');
    setStudentFormulaStr('');
    setShowCandidateCurve(false);
    setHasVerified(false);
    setIsPassed(false);
    setFeedback('');
  }, [task.id]);

  // Handle Verify Action
  const handleVerify = () => {
    setHasVerified(true);

    const aVal = parseFloat(studentAmpA) || 0;
    const dVal = parseFloat(studentMidlineD) || 0;

    let bVal = 2;
    if (studentPeriodT.includes('π')) {
      const mult = parseFloat(studentPeriodT.replace('π', '')) || 1;
      const tVal = mult * Math.PI;
      bVal = (2 * Math.PI) / tVal;
    } else {
      const tVal = parseFloat(studentPeriodT) || (2 * Math.PI);
      bVal = (2 * Math.PI) / tVal;
    }

    let cRad = 0;
    if (studentPhaseC.includes('π/2')) cRad = Math.PI / 2;
    else if (studentPhaseC.includes('π')) cRad = Math.PI;
    else cRad = parseFloat(studentPhaseC) || 0;

    const studentHarmonic = parseHarmonicFormula(studentFamily, aVal, bVal, cRad, dVal);
    const equiv = areHarmonicsEquivalent(targetHarmonic, studentHarmonic);

    let msg = '';
    if (equiv) {
      msg = `Chính xác hoàn toàn! Em đã suy ra công thức tương đương chuẩn xác: y = ${aVal}${studentFamily}(${bVal.toFixed(
        0
      )}x ${cRad !== 0 ? '+ ' + studentPhaseC : ''}) ${dVal >= 0 ? '+ ' + dVal : dVal}. Đường giữa d = ${dVal}, biên độ A = ${aVal}, chu kỳ T = ${studentPeriodT}.`;
    } else {
      if (Math.abs(studentHarmonic.midline - targetHarmonic.midline) > 1e-4) {
        msg = `Chưa đúng đường giữa: d = (y_max + y_min) / 2 = (${task.givenData.max || 1} + (${task.givenData.min || -3}))/2 = ${targetHarmonic.midline}.`;
      } else if (Math.abs(studentHarmonic.amplitude - targetHarmonic.amplitude) > 1e-4) {
        msg = `Chưa đúng biên độ: |a| = (y_max - y_min) / 2 = ${targetHarmonic.amplitude}.`;
      } else if (Math.abs(studentHarmonic.angularFreq - targetHarmonic.angularFreq) > 1e-4) {
        msg = `Chưa đúng chu kỳ: Hai đỉnh cùng pha liên tiếp cách nhau T = ${(2 * Math.PI / targetHarmonic.angularFreq).toFixed(2)}, suy ra |b| = 2π/T = ${targetHarmonic.angularFreq}.`;
      } else {
        msg = `Sai lệch pha ban đầu: Dạng sóng của em chưa trùng pha với đồ thị mục tiêu tại các điểm cực trị.`;
      }
    }

    setIsPassed(equiv);
    setFeedback(msg);
    setShowCandidateCurve(true); // show candidate to visualize diff
    onLogRevision({ studentHarmonic, equiv }, msg);
    if (equiv) onTaskCompleted();
  };

  // Dimensions for Graph
  const svgW = 520;
  const svgH = 260;
  const padX = 40;
  const padY = 30;
  const plotW = svgW - 2 * padX;
  const plotH = svgH - 2 * padY;

  const xMin = -Math.PI;
  const xMax = Math.PI;
  const yMinDomain = -4;
  const yMaxDomain = 4;

  const toSvgX = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => padY + ((yMaxDomain - y) / (yMaxDomain - yMinDomain)) * plotH;

  // Sample Target curve points
  const targetPath = (() => {
    let d = '';
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluateHarmonic(targetHarmonic, x);
      const sx = toSvgX(x);
      const sy = toSvgY(y);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return d;
  })();

  // Sample Student Candidate curve
  const candidatePath = (() => {
    if (!showCandidateCurve) return '';
    const aVal = parseFloat(studentAmpA) || 0;
    const dVal = parseFloat(studentMidlineD) || 0;
    let bVal = 2;
    if (studentPeriodT.includes('π')) {
      const mult = parseFloat(studentPeriodT.replace('π', '')) || 1;
      bVal = (2 * Math.PI) / (mult * Math.PI);
    }
    let cRad = 0;
    if (studentPhaseC.includes('π/2')) cRad = Math.PI / 2;
    else if (studentPhaseC.includes('π')) cRad = Math.PI;

    let d = '';
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y =
        studentFamily === 'cos'
          ? aVal * Math.cos(bVal * x + cRad) + dVal
          : aVal * Math.sin(bVal * x + cRad) + dVal;
      const sx = toSvgX(x);
      const sy = toSvgY(y);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return d;
  })();

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left: Target Graph & Candidate Curve Viewer */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
        <div className="w-full flex items-center justify-between border-b pb-2 mb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Đồ thị hàm số mục tiêu (Đề cho)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-600 inline-block" />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Mục tiêu
            </span>
            {showCandidateCurve && (
              <>
                <span className="w-3 h-0.5 bg-rose-500 inline-block ml-2 border-t border-dashed" />
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Ứng viên em nhập
                </span>
              </>
            )}
          </div>
        </div>

        {/* SVG Plot */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[260px]">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[540px] select-none">
            {/* Grid & Axes */}
            <line x1={padX} y1={toSvgY(0)} x2={svgW - padX} y2={toSvgY(0)} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={toSvgX(0)} y1={padY} x2={toSvgX(0)} y2={svgH - padY} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={svgW - padX + 5} y={toSvgY(0) + 4} fill="#64748B" fontSize={11} fontWeight="bold">x</text>
            <text x={toSvgX(0) + 5} y={padY - 8} fill="#64748B" fontSize={11} fontWeight="bold">y</text>

            {/* Target Midline Line */}
            <line
              x1={padX}
              y1={toSvgY(targetHarmonic.midline)}
              x2={svgW - padX}
              y2={toSvgY(targetHarmonic.midline)}
              stroke="#CBD5E1"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <text x={padX + 5} y={toSvgY(targetHarmonic.midline) - 4} fill="#94A3B8" fontSize={9} fontStyle="italic">
              Đường giữa d = {targetHarmonic.midline}
            </text>

            {/* X-ticks */}
            {[-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI].map((val, i) => (
              <g key={i}>
                <line x1={toSvgX(val)} y1={toSvgY(0) - 3} x2={toSvgX(val)} y2={toSvgY(0) + 3} stroke="#64748B" />
                <text x={toSvgX(val)} y={toSvgY(0) + 14} fill="#64748B" fontSize={9} textAnchor="middle">
                  {val === 0 ? '0' : val === Math.PI ? 'π' : val === -Math.PI ? '-π' : val > 0 ? 'π/2' : '-π/2'}
                </text>
              </g>
            ))}

            {/* Target Curve */}
            <path d={targetPath} fill="none" stroke="#2563EB" strokeWidth={2.5} />

            {/* Candidate Curve */}
            {showCandidateCurve && candidatePath && (
              <path d={candidatePath} fill="none" stroke="#F43F5E" strokeWidth={2} strokeDasharray="5,4" />
            )}
          </svg>
        </div>

        {/* Toggle candidate curve */}
        <div className="flex items-center justify-between pt-2 border-t text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showCandidateCurve}
              onChange={(e) => setShowCandidateCurve(e.target.checked)}
              className="rounded-sm accent-rose-600"
            />
            <span>Hiển thị đường ứng viên của em lên mặt phẳng</span>
          </label>
        </div>
      </div>

      {/* Right: Parameter Identification Form (Em xác định) */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Task Box (Đề cho) */}
        <div className="bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 p-3.5 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            📌 Dữ kiện đề bài
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {task.statement}
          </p>
        </div>

        {/* Parameters Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>📐</span>
              <span>Em xác định tham số hàm số</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">y = a·trig(bx+c)+d</span>
          </div>

          {/* 1. Max, Min, Midline */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">y_max</label>
              <input
                type="text"
                value={studentYMax}
                onChange={(e) => setStudentYMax(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="ví dụ: 1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">y_min</label>
              <input
                type="text"
                value={studentYMin}
                onChange={(e) => setStudentYMin(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="ví dụ: -3"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Đường giữa d</label>
              <input
                type="text"
                value={studentMidlineD}
                onChange={(e) => setStudentMidlineD(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-blue-600"
                placeholder="(max+min)/2"
              />
            </div>
          </div>

          {/* 2. Amplitude A & Period T */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Biên độ |a|</label>
              <input
                type="text"
                value={studentAmpA}
                onChange={(e) => setStudentAmpA(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-purple-600"
                placeholder="(max-min)/2"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Chu kỳ T (|b|=2π/T)</label>
              <input
                type="text"
                value={studentPeriodT}
                onChange={(e) => setStudentPeriodT(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-emerald-600"
                placeholder="ví dụ: π hoặc 2π"
              />
            </div>
          </div>

          {/* 3. Family sin/cos & Phase c */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Dạng hàm sóng</label>
              <div className="mt-1 flex gap-1 font-mono font-bold text-xs">
                {(['cos', 'sin'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStudentFamily(f)}
                    className={`flex-1 py-1.5 rounded-lg border ${
                      studentFamily === f ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Pha ban đầu c (rad)</label>
              <input
                type="text"
                value={studentPhaseC}
                onChange={(e) => setStudentPhaseC(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="ví dụ: 0 hoặc π/2"
              />
            </div>
          </div>

          {/* 4. Full Formula String */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Công thức hoàn chỉnh của em:
            </label>
            <input
              type="text"
              value={studentFormulaStr}
              onChange={(e) => setStudentFormulaStr(e.target.value)}
              className="mt-1 w-full p-2 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-blue-700 dark:text-blue-300"
              placeholder="ví dụ: 2cos(2x) - 1 hoặc 2sin(2x + π/2) - 1"
            />
          </div>

          {/* Verify CTA */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm toán công thức</span>
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
              <span>{isPassed ? 'Công thức tương đương chính xác' : 'Gợi ý điều chỉnh'}</span>
            </div>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
