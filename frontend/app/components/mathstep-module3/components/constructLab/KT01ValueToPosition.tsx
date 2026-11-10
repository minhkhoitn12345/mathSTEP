/**
 * MathSTEP Module 3: Lượng Giác - Trạm KT01: Biết giá trị tìm vị trí
 * Chiều ngược 1: Từ giá trị lượng giác tìm vị trí và các khả năng của góc
 * Tuân thủ 4 lớp dữ liệu: Không điền trước đáp án, nhãn Đề cho vs Em xác định rõ ràng,
 * khắc phục va chạm nhãn SVG (IMG03).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ConstructLabTask, AssistanceLevel } from '../../types/constructLab';
import { solvePositionsFromTrigValue } from '../../mathCore/constructLabMath';

interface KT01Props {
  task: ConstructLabTask;
  assistanceLevel: AssistanceLevel;
  onLogRevision: (state: any, feedback: string) => void;
  onTaskCompleted: () => void;
}

export const KT01ValueToPosition: React.FC<KT01Props> = ({
  task,
  assistanceLevel,
  onLogRevision,
  onTaskCompleted,
}) => {
  const givenFunc = (task.givenData.func as 'sin' | 'cos' | 'tan') || 'sin';
  const defaultM = typeof task.givenData.m === 'number' ? task.givenData.m : 0.6;

  // Student Interactive Inputs (Fresh turn starts blank without prefilled answers)
  const [mValue, setMValue] = useState<number>(defaultM);
  const [predictedPointsCount, setPredictedPointsCount] = useState<string>('');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [studentCosSign, setStudentCosSign] = useState<'+' | '-' | '±' | '0' | ''>('');
  const [studentCosVal, setStudentCosVal] = useState<string>('');
  const [studentTanVal, setStudentTanVal] = useState<string>('');
  const [studentCotVal, setStudentCotVal] = useState<string>('');
  const [studentReasoning, setStudentReasoning] = useState<string>('');

  // Verification state
  const [hasVerified, setHasVerified] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    passed: boolean;
    feedback: string;
    criteriaPassed: string[];
  } | null>(null);

  // Reset inputs when switching tasks
  useEffect(() => {
    setMValue(typeof task.givenData.m === 'number' ? task.givenData.m : 0.6);
    setPredictedPointsCount('');
    setSelectedPointIndex(null);
    setStudentCosSign('');
    setStudentCosVal('');
    setStudentTanVal('');
    setStudentCotVal('');
    setStudentReasoning('');
    setHasVerified(false);
    setCheckResult(null);
  }, [task.id, task.givenData.m]);

  // Exact math resolution
  const mathResult = useMemo(() => {
    return solvePositionsFromTrigValue(givenFunc, mValue);
  }, [givenFunc, mValue]);

  // Handle Verify Action
  const handleVerify = () => {
    setHasVerified(true);
    let passed = false;
    const criteria: string[] = [];

    if (task.id === 'KT01_TASK01') {
      // sin = 3/5 in QII
      const isCountCorrect = predictedPointsCount === '2';
      const isSignCorrect = studentCosSign === '-';
      const isCosValCorrect =
        studentCosVal.includes('-4/5') ||
        studentCosVal.includes('-0.8') ||
        studentCosVal.includes('-4 / 5');

      if (isCountCorrect) criteria.push('Xác định đúng 2 điểm cắt trên đường tròn');
      if (isSignCorrect) criteria.push('Nhận định đúng dấu hoành độ âm trong góc phần tư II');
      if (isCosValCorrect) criteria.push('Tính đúng cos α = -4/5');

      passed = isCountCorrect && isSignCorrect && isCosValCorrect;

      const feedback = passed
        ? 'Chính xác xuất sắc! Em đã vẽ đường mức y = 3/5, tìm được 2 giao điểm, chọn đúng điểm M thuộc góc phần tư II với hoành độ âm cos α = -4/5, từ đó suy ra tan α = -3/4 và cot α = -4/3.'
        : 'Chưa hoàn toàn chính xác. Hãy chú ý: đường y = 3/5 cắt đường tròn tại 2 điểm (một ở góc phần tư I, một ở góc phần tư II). Do đề bài cho π/2 < α < π nên hoành độ cos α phải mang dấu âm (-4/5).';

      setCheckResult({ passed, feedback, criteriaPassed: criteria });
      onLogRevision({ mValue, predictedPointsCount, selectedPointIndex, studentCosVal }, feedback);
      if (passed) onTaskCompleted();
    } else if (task.id === 'KT01_TASK02') {
      // Missing domain
      const isMulti =
        studentCosSign === '±' ||
        studentCosVal.includes('±') ||
        (studentCosVal.includes('4/5') && studentCosVal.includes('-4/5'));
      passed = isMulti && predictedPointsCount === '2';
      const feedback = passed
        ? 'Rất xuất sắc! Em đã nhận diện trường hợp thiếu miền góc: phải có cả 2 khả năng cos α = ±4/5 và tan α = ±3/4.'
        : 'Chú ý: Khi đề bài không giới hạn góc phần tư, trên đường tròn có 2 điểm khả dĩ ứng với tung độ 3/5. Em cần nêu cả hai trường hợp cos α = ±4/5.';
      setCheckResult({ passed, feedback, criteriaPassed: ['Đầy đủ 2 trường hợp dấu'] });
      onLogRevision({ mValue, studentCosVal }, feedback);
      if (passed) onTaskCompleted();
    } else if (task.id === 'KT01_TASK03') {
      // cos α = -1 and sin α = 1.5
      passed = predictedPointsCount === '1' || predictedPointsCount === '0';
      const feedback =
        'Chính xác! cos α = -1 có đúng 1 điểm duy nhất (-1; 0) trên trục hoành. Trong khi đó sin α = 1.5 vô nghiệm vì |m| > 1.';
      setCheckResult({ passed: true, feedback, criteriaPassed: ['Phân biệt điểm trên trục và tập rỗng'] });
      if (passed) onTaskCompleted();
    } else {
      // General check
      passed = mathResult.pointsOnCircle.length > 0;
      setCheckResult({
        passed,
        feedback: 'Đã kiểm tra biểu diễn hình học thành công!',
        criteriaPassed: ['Đã xác định vị trí trên đường tròn'],
      });
      if (passed) onTaskCompleted();
    }
  };

  // Unit circle SVG dimensions
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const r = 130;

  // Level line coordinate
  const levelLineY = cy - r * mValue;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left: Interactive Canvas & Visual Stage */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-between shadow-xs">
        <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mặt phẳng lượng giác · Dựng mức giá trị
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Đề cho:</span>
            <span className="text-xs font-mono bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold border border-blue-200 dark:border-blue-800/60">
              {givenFunc}(α) = {task.givenData.mStr || mValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* SVG Unit Circle with Anti-collision Label Layout */}
        <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full select-none">
            {/* Coordinate axes */}
            <line x1={20} y1={cy} x2={size - 20} y2={cy} stroke="#94A3B8" strokeWidth={1.5} />
            <line x1={cx} y1={size - 20} x2={cx} y2={20} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={size - 18} y={cy + 4} fill="#64748B" fontSize={11} fontWeight="bold">x</text>
            <text x={cx + 6} y={18} fill="#64748B" fontSize={11} fontWeight="bold">y</text>
            <text x={cx - 14} y={cy + 16} fill="#94A3B8" fontSize={11}>O</text>

            {/* Quadrant labels */}
            <text x={cx + r * 0.55} y={cy - r * 0.55} fill="#CBD5E1" fontSize={22} fontWeight="bold" textAnchor="middle">I</text>
            <text x={cx - r * 0.55} y={cy - r * 0.55} fill="#CBD5E1" fontSize={22} fontWeight="bold" textAnchor="middle">II</text>
            <text x={cx - r * 0.55} y={cy + r * 0.65} fill="#CBD5E1" fontSize={22} fontWeight="bold" textAnchor="middle">III</text>
            <text x={cx + r * 0.55} y={cy + r * 0.65} fill="#CBD5E1" fontSize={22} fontWeight="bold" textAnchor="middle">IV</text>

            {/* Main unit circle */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748B" strokeWidth={2} />

            {/* Domain Highlight: QII */}
            {task.givenData.domainStr?.includes('II') && (
              <path
                d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx - r} ${cy}`}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.7}
              />
            )}

            {/* Level line y = m (or x = m) */}
            {Math.abs(mValue) <= 1 && (
              <line
                x1={20}
                y1={levelLineY}
                x2={size - 20}
                y2={levelLineY}
                stroke="#EA580C"
                strokeWidth={2}
                strokeDasharray="4,3"
              />
            )}

            {/* Level line label: Placed cleanly near right margin to prevent collision with M2 */}
            {Math.abs(mValue) <= 1 && (
              <g>
                <rect
                  x={size - 85}
                  y={levelLineY - 18}
                  width={68}
                  height={16}
                  rx={4}
                  fill="#FFF7ED"
                  stroke="#FDBA74"
                  strokeWidth={1}
                />
                <text
                  x={size - 51}
                  y={levelLineY - 6}
                  fill="#C2410C"
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  y = {task.givenData.mStr || mValue.toFixed(2)}
                </text>
              </g>
            )}

            {/* Candidate points on circle with non-colliding labels */}
            {mathResult.pointsOnCircle.map((pt, idx) => {
              const px = cx + r * pt.x;
              const py = cy - r * pt.y;
              const isSelected = selectedPointIndex === idx;

              // Collision-free label positioning
              const labelX = pt.x < 0 ? px - 10 : px + 10;
              const labelY = py - 14;
              const textAnchor = pt.x < 0 ? 'end' : 'start';

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => setSelectedPointIndex(idx)}
                >
                  {/* Projection dashed lines */}
                  <line x1={px} y1={py} x2={px} y2={cy} stroke="#2563EB" strokeWidth={1.5} strokeDasharray="3,3" />
                  <line x1={px} y1={py} x2={cx} y2={py} stroke="#EA580C" strokeWidth={1.5} strokeDasharray="3,3" />

                  {/* Ray from O to M */}
                  <line x1={cx} y1={cy} x2={px} y2={py} stroke="#334155" strokeWidth={2} />

                  {/* Point circle */}
                  <circle
                    cx={px}
                    cy={py}
                    r={isSelected ? 9 : 7}
                    fill={pt.x < 0 ? '#2563EB' : '#10B981'}
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    className="transition-all hover:scale-125"
                  />

                  {/* Point label badge with clean background to avoid line clashes */}
                  <rect
                    x={pt.x < 0 ? labelX - 60 : labelX - 4}
                    y={labelY - 11}
                    width={64}
                    height={15}
                    rx={3}
                    fill="#FFFFFF"
                    fillOpacity={0.9}
                    stroke="#CBD5E1"
                    strokeWidth={0.5}
                  />
                  <text
                    x={pt.x < 0 ? labelX - 6 : labelX}
                    y={labelY}
                    fill="#0F172A"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor={textAnchor}
                  >
                    M{idx + 1} ({pt.x < 0 ? 'Q II' : 'Q I'})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Level Line adjustment slider */}
        <div className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Mức m =
          </label>
          <input
            type="range"
            min="-1.5"
            max="1.5"
            step="0.05"
            value={mValue}
            onChange={(e) => {
              setMValue(parseFloat(e.target.value));
              setHasVerified(false);
            }}
            className="flex-1 accent-orange-600"
          />
          <span className="font-mono text-xs font-bold w-12 text-right">
            {mValue.toFixed(2)}
          </span>
          <button
            onClick={() => {
              setMValue(defaultM);
              setHasVerified(false);
            }}
            className="text-[11px] px-2 py-1 bg-white dark:bg-slate-700 border rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Đặt lại mức m theo đề"
          >
            Về đề
          </button>
        </div>
      </div>

      {/* Right: Student Argumentation Form (Em xác định) */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Task Statement Box (Đề cho) */}
        <div className="bg-blue-50/70 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-slate-700 p-3.5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              📌 Dữ kiện đề bài (Đề cho)
            </span>
            <span className="text-[10px] font-mono text-slate-500">{task.id}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
            {task.statement}
          </p>
        </div>

        {/* Student Form (Em xác định) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>✏️</span>
              <span>Em xác định & lập luận</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400">
              Chưa nhập đáp án
            </span>
          </div>

          {/* 1. Predict number of positions */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              1. Dự đoán số giao điểm của đường y = {mValue.toFixed(2)} với đường tròn:
            </label>
            <select
              value={predictedPointsCount}
              onChange={(e) => setPredictedPointsCount(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="">-- Em hãy chọn số giao điểm --</option>
              <option value="2">2 điểm đối xứng qua trục tung</option>
              <option value="1">1 điểm tiếp xúc (ở đỉnh)</option>
              <option value="0">0 điểm (|m| &gt; 1)</option>
            </select>
          </div>

          {/* 2. Choose quadrant and sign of cos */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              2. Dấu của hoành độ cos α ({task.givenData.domainStr || 'toàn miền'}):
            </label>
            <div className="mt-1 grid grid-cols-4 gap-1.5 text-xs font-bold font-mono">
              {(['-', '+', '±', '0'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStudentCosSign(s)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    studentCosSign === s
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Enter exact values */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">cos α</label>
              <input
                type="text"
                value={studentCosVal}
                onChange={(e) => setStudentCosVal(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600"
                placeholder="ví dụ: -4/5"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">tan α</label>
              <input
                type="text"
                value={studentTanVal}
                onChange={(e) => setStudentTanVal(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-purple-600"
                placeholder="ví dụ: -3/4"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">cot α</label>
              <input
                type="text"
                value={studentCotVal}
                onChange={(e) => setStudentCotVal(e.target.value)}
                className="mt-1 w-full p-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600"
                placeholder="ví dụ: -4/3"
              />
            </div>
          </div>

          {/* 4. Student Free Explanation */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              3. Lập luận căn cứ toán học của em:
            </label>
            <textarea
              rows={3}
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              className="mt-1 w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs leading-relaxed outline-none"
              placeholder="Trình bày căn cứ: ví dụ cos α < 0 vì α thuộc góc phần tư II, dùng hệ thức sin²α + cos²α = 1..."
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Kiểm chứng Toán học</span>
          </button>
        </div>

        {/* Verification feedback box */}
        {hasVerified && checkResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
              checkResult.passed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1.5">
              <span>{checkResult.passed ? '✅' : '⚠️'}</span>
              <span>{checkResult.passed ? 'Kiểm chứng đạt yêu cầu' : 'Gợi ý hoàn thiện'}</span>
            </div>
            <p>{checkResult.feedback}</p>
            {checkResult.criteriaPassed.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc list-inside text-[11px] text-emerald-700 dark:text-emerald-300">
                {checkResult.criteriaPassed.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
