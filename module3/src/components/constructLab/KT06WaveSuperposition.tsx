/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT06: Ghép sóng và tự biến đổi công thức
 * Chiều ngược 6: Phân tích cộng hai dao động điều hòa cùng tần số và biến đổi tích-tổng
 * Khắc phục IMG09: Không điền sẵn kết quả đích, giữ giá trị chính xác √2, phân biệt xấp xỉ 1.414.
 */

import React, { useState, useEffect } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';
import { verifyWaveSuperposition } from '../../mathCore/constructLabMath';

interface KT06Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

const AVAILABLE_CARDS_DEFAULT = [
  'Nhân và chia hệ số với √2: √2 * (1/√2 sin x + 1/√2 cos x)',
  'Thay 1/√2 = cos(π/4) và 1/√2 = sin(π/4)',
  'Áp dụng công thức cộng: sin(a+b) = sin a cos b + cos a sin b',
  'Nhân và chia hệ số với 2: 2 * (√3/2 sin x + 1/2 cos x)',
  'Áp dụng công thức tích thành tổng: cos a cos b = 1/2 [cos(a+b) + cos(a-b)]',
];

export const KT06WaveSuperposition: React.FC<KT06Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  // Probe x position on wave
  const [probeX, setProbeX] = useState<number>(Math.PI / 4);

  // Student inputs (Clean turn starts blank)
  const [studentAmp, setStudentAmp] = useState<string>('');
  const [studentPhaseStr, setStudentPhaseStr] = useState<string>('');
  const [studentFamily, setStudentFamily] = useState<'sin' | 'cos'>('sin');
  const [studentFormula, setStudentFormula] = useState<string>('');

  // Selected identity blocks (Starts empty for student to choose)
  const [chosenCards, setChosenCards] = useState<string[]>([]);

  // Verification state
  const [hasVerified, setHasVerified] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Reset state when task changes
  useEffect(() => {
    setStudentAmp('');
    setStudentPhaseStr('');
    setStudentFamily('sin');
    setStudentFormula('');
    setChosenCards([]);
    setHasVerified(false);
    setIsPassed(false);
    setFeedback('');
    setProbeX(Math.PI / 4);
  }, [task.id]);

  // Values at probe X
  const y1AtProbe = Math.sin(probeX);
  const y2AtProbe = Math.cos(probeX);
  const ySumAtProbe = y1AtProbe + y2AtProbe;

  const handleVerify = () => {
    setHasVerified(true);
    let aVal = parseFloat(studentAmp);
    if (studentFormula.includes('√2') || studentAmp.includes('√2')) {
      aVal = Math.SQRT2;
    } else if (isNaN(aVal)) {
      aVal = 0;
    }

    let cRad = 0;
    if (studentPhaseStr.includes('π/4') || studentFormula.includes('π/4')) cRad = Math.PI / 4;
    else if (studentPhaseStr.includes('π/6') || studentFormula.includes('π/6')) cRad = Math.PI / 6;

    const res = verifyWaveSuperposition(aVal, cRad, studentFamily);
    setIsPassed(res.passed);
    setFeedback(res.feedback);
    onLogRevision({ studentFormula, aVal, cRad }, res.feedback);
    if (res.passed) onTaskCompleted();
  };

  const handleToggleCard = (card: string) => {
    if (chosenCards.includes(card)) {
      setChosenCards(chosenCards.filter((c) => c !== card));
    } else {
      setChosenCards([...chosenCards, card]);
    }
  };

  // Dimensions
  const svgW = 440;
  const svgH = 220;
  const padX = 35;
  const padY = 25;
  const plotW = svgW - 2 * padX;
  const plotH = svgH - 2 * padY;

  const toSvgX = (x: number) => padX + (x / (2 * Math.PI)) * plotW;
  const toSvgY = (y: number) => padY + ((2.2 - y) / 4.4) * plotH;

  // Paths
  const steps = 120;
  const pathSin = Array.from({ length: steps + 1 })
    .map((_, i) => {
      const x = (i / steps) * 2 * Math.PI;
      const y = Math.sin(x);
      return `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`;
    })
    .join(' ');

  const pathCos = Array.from({ length: steps + 1 })
    .map((_, i) => {
      const x = (i / steps) * 2 * Math.PI;
      const y = Math.cos(x);
      return `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`;
    })
    .join(' ');

  const pathSum = Array.from({ length: steps + 1 })
    .map((_, i) => {
      const x = (i / steps) * 2 * Math.PI;
      const y = Math.sin(x) + Math.cos(x);
      return `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`;
    })
    .join(' ');

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left: Interactive Wave Graphs & Probe Slider */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
        <div className="w-full flex items-center justify-between border-b pb-2 mb-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">
            Cộng hai sóng dao động · y = y₁ + y₂
          </span>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="text-blue-600 flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> y₁ = sin x
            </span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" /> y₂ = cos x
            </span>
            <span className="text-purple-600 flex items-center gap-1">
              <span className="w-2.5 h-1 bg-purple-600 inline-block" /> y_tổng
            </span>
          </div>
        </div>

        {/* SVG Waves */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[220px]">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[460px] select-none">
            {/* Axes */}
            <line x1={padX} y1={toSvgY(0)} x2={svgW - padX} y2={toSvgY(0)} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={padX} y1={padY} x2={padX} y2={svgH - padY} stroke="#94A3B8" strokeWidth={1.5} />

            {/* Extrema Guidelines */}
            <line x1={padX} y1={toSvgY(Math.SQRT2)} x2={svgW - padX} y2={toSvgY(Math.SQRT2)} stroke="#CBD5E1" strokeDasharray="3,3" />
            <line x1={padX} y1={toSvgY(-Math.SQRT2)} x2={svgW - padX} y2={toSvgY(-Math.SQRT2)} stroke="#CBD5E1" strokeDasharray="3,3" />
            <text x={padX + 5} y={toSvgY(Math.SQRT2) - 4} fill="#8B5CF6" fontSize={9} fontWeight="bold">
              Biên độ cực đại = √2 ≈ 1.414
            </text>

            {/* Curves */}
            <path d={pathSin} fill="none" stroke="#2563EB" strokeWidth={1.5} strokeDasharray="4,2" />
            <path d={pathCos} fill="none" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4,2" />
            <path d={pathSum} fill="none" stroke="#8B5CF6" strokeWidth={2.5} />

            {/* Probe line */}
            <line
              x1={toSvgX(probeX)}
              y1={padY}
              x2={toSvgX(probeX)}
              y2={svgH - padY}
              stroke="#EA580C"
              strokeWidth={1.5}
            />
            {/* Probe points */}
            <circle cx={toSvgX(probeX)} cy={toSvgY(y1AtProbe)} r={4} fill="#2563EB" />
            <circle cx={toSvgX(probeX)} cy={toSvgY(y2AtProbe)} r={4} fill="#10B981" />
            <circle cx={toSvgX(probeX)} cy={toSvgY(ySumAtProbe)} r={6} fill="#8B5CF6" stroke="#FFF" strokeWidth={2} />
          </svg>
        </div>

        {/* Probe slider */}
        <div className="w-full flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Vị trí vạch đo x:
          </label>
          <input
            type="range"
            min="0"
            max={2 * Math.PI}
            step="0.05"
            value={probeX}
            onChange={(e) => setProbeX(parseFloat(e.target.value))}
            className="flex-1 accent-purple-600"
          />
          <span className="font-mono text-xs font-bold text-purple-700 w-28 text-right">
            y_tổng = {ySumAtProbe.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Right: Derivation & Card Selector Form */}
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

        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🌊</span>
              <span>Em thu gọn tổng sóng</span>
            </span>
          </div>

          {/* Amplitude & Phase */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Biên độ dao động</label>
              <input
                type="text"
                value={studentAmp}
                onChange={(e) => setStudentAmp(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg text-purple-600"
                placeholder="ví dụ: √2"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Độ lệch pha φ</label>
              <input
                type="text"
                value={studentPhaseStr}
                onChange={(e) => setStudentPhaseStr(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                placeholder="ví dụ: π/4"
              />
            </div>
          </div>

          {/* Formula String */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Biểu thức dạng thu gọn của em:
            </label>
            <input
              type="text"
              value={studentFormula}
              onChange={(e) => setStudentFormula(e.target.value)}
              className="mt-1 w-full p-2 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-purple-700 dark:text-purple-300"
              placeholder="ví dụ: √2 sin(x + π/4)"
            />
          </div>

          {/* Identity Blocks Checklist */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Chọn các bước lập luận định lý (Em chọn):
            </label>
            <div className="space-y-1.5">
              {AVAILABLE_CARDS_DEFAULT.map((card, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-[11px] cursor-pointer hover:bg-purple-50/40"
                >
                  <input
                    type="checkbox"
                    checked={chosenCards.includes(card)}
                    onChange={() => handleToggleCard(card)}
                    className="mt-0.5 rounded-sm accent-purple-600"
                  />
                  <span className="leading-tight">{card}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verify CTA */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm toán Đẳng thức Sóng</span>
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
              <span>{isPassed ? 'Thu gọn chính xác' : 'Gợi ý điều chỉnh'}</span>
            </div>
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
