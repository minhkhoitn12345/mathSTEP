/**
 * MathSTEP Module 3: Lượng Giác
 * Interactive Educational Games Hub (Section 8)
 * Houses G01 to G06:
 * - G01: Bắt đúng góc (Target Angle Hunter)
 * - G02: Ghép góc với giá trị (Angle & Value Pairing)
 * - G03: Chọn phép biến đổi (Transformation Selector)
 * - G04: Xây công thức (Formula Constructor)
 * - G05: Tìm lỗi lời giải (Error Detective in Proofs)
 * - G06: Săn nghiệm phương trình (Equation Root Hunter)
 */

import React, { useState } from 'react';

type GameId = 'G01' | 'G02' | 'G03' | 'G04' | 'G05' | 'G06';

interface GameHubProps {
  onClose: () => void;
  onNavigateToActivity?: (actId: string) => void;
}

export const GameHub: React.FC<GameHubProps> = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState<GameId>('G01');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  // G01 State
  const [g01Target] = useState(150);
  const [g01Input, setG01Input] = useState('');

  // G02 State (Pairing)
  const [g02SelectedAngle, setG02SelectedAngle] = useState<string | null>(null);
  const [g02SelectedVal, setG02SelectedVal] = useState<string | null>(null);

  // G03 State
  const [g03Choice, setG03Choice] = useState<string | null>(null);

  // G04 State
  const [g04SelectedTokens, setG04SelectedTokens] = useState<string[]>([]);

  // G05 State
  const [g05Choice, setG05Choice] = useState<number | null>(null);

  // G06 State
  const [g06SelectedRoots, setG06SelectedRoots] = useState<string[]>([]);

  const gamesMeta = [
    { id: 'G01', title: 'G01. Bắt đúng góc', desc: 'Đoán và đặt vị trí góc lượng giác trên đường tròn' },
    { id: 'G02', title: 'G02. Ghép góc & giá trị', desc: 'Nối góc đặc biệt với giá trị sin, cos, tan, cot chính xác' },
    { id: 'G03', title: 'G03. Chọn phép biến đổi', desc: 'Xác định phép đối xứng hoặc phép quay của các góc liên kết' },
    { id: 'G04', title: 'G04. Xây dựng công thức', desc: 'Ghép các mảnh ghép để tạo thành đẳng thức lượng giác chuẩn' },
    { id: 'G05', title: 'G05. Thám tử tìm lỗi sai', desc: 'Phát hiện bước sai lầm đầu tiên trong lời giải toán' },
    { id: 'G06', title: 'G06. Săn nghiệm phương trình', desc: 'Tìm đủ các nghiệm trong khoảng mà không bỏ sót hoặc đếm trùng' },
  ];

  // G01: Check angle
  const handleG01Check = () => {
    const val = parseFloat(g01Input);
    if (isNaN(val)) {
      setFeedback('Vui lòng nhập số đo góc!');
      return;
    }
    const diff = Math.abs(val - g01Target);
    if (diff < 2) {
      setScore((s) => s + 10);
      setFeedback('Chính xác tuyệt đối! Góc 150° nằm ở góc phần tư II, bù với 30°. (+10 điểm)');
    } else {
      setFeedback(`Chưa chính xác. Độ lệch ${diff.toFixed(1)}°. Góc 150° nằm ở góc phần tư II.`);
    }
  };

  // G02: Check Pair
  const g02Pairs = [
    { angle: 'sin(30°)', val: '1/2' },
    { angle: 'cos(45°)', val: '√2/2' },
    { angle: 'tan(90°)', val: 'Không xác định' },
    { angle: 'cos(180°)', val: '-1' },
    { angle: 'sin(270°)', val: '-1' },
  ];

  const handleG02CheckPair = (ang: string, v: string) => {
    const match = g02Pairs.find((p) => p.angle === ang && p.val === v);
    if (match) {
      setScore((s) => s + 10);
      setFeedback(`Rất tốt! ${ang} = ${v}. (+10 điểm)`);
      setG02SelectedAngle(null);
      setG02SelectedVal(null);
    } else {
      setFeedback(`Chưa đúng: ${ang} không bằng ${v}. Hãy thử lại!`);
    }
  };

  // G03 Check
  const handleG03Check = (choice: string) => {
    setG03Choice(choice);
    if (choice === 'Oy') {
      setScore((s) => s + 10);
      setFeedback('Chính xác! Điểm M(α) và N(π - α) đối xứng qua trục tung Oy: tung độ bằng nhau, hoành độ đổi dấu. (+10 điểm)');
    } else {
      setFeedback('Chưa đúng. Hai góc bù nhau có cùng tung độ (sin) và hoành độ (cos) đối nhau nên đối xứng qua Oy.');
    }
  };

  // G04 Check
  const handleG04Check = () => {
    const assembled = g04SelectedTokens.join(' ');
    const expected = 'cos α cos β - sin α sin β';
    if (assembled === expected) {
      setScore((s) => s + 10);
      setFeedback('Xuất sắc! Đã ghép đúng công thức cos(α+β) = cos α cos β - sin α sin β. (+10 điểm)');
    } else {
      setFeedback(`Chưa chính xác. Chuỗi ghép: "${assembled}". Hãy kiểm tra thứ tự và dấu trừ!`);
    }
  };

  // G05 Check
  const handleG05Check = (stepIdx: number) => {
    setG05Choice(stepIdx);
    if (stepIdx === 2) {
      setScore((s) => s + 10);
      setFeedback('Chính xác! Bước 2 sai lầm nghiêm trọng (mã lỗi E16): Chia hai vế cho sin x mà không xét điều kiện sin x = 0, làm mất họ nghiệm x = kπ! (+10 điểm)');
    } else {
      setFeedback('Chưa đúng. Hãy chú ý bước có phép biến đổi chia hai vế cho một biểu thức chứa ẩn.');
    }
  };

  // G06 Check
  const handleG06Check = () => {
    // Problem: sin x = -1/2 on [0; 2π). Roots: 7π/6 and 11π/6.
    const isExact =
      g06SelectedRoots.includes('7π/6') &&
      g06SelectedRoots.includes('11π/6') &&
      g06SelectedRoots.length === 2;
    if (isExact) {
      setScore((s) => s + 10);
      setFeedback('Tuyệt vời! Phương trình sin x = -1/2 có đúng 2 nghiệm trên [0; 2π) là 7π/6 (210°) và 11π/6 (330°). (+10 điểm)');
    } else {
      setFeedback('Chưa đủ hoặc thừa nghiệm! Hai vị trí có tung độ -1/2 nằm ở góc phần tư III và IV.');
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setFeedback(null);
    setG01Input('');
    setG02SelectedAngle(null);
    setG02SelectedVal(null);
    setG03Choice(null);
    setG04SelectedTokens([]);
    setG05Choice(null);
    setG06SelectedRoots([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Trò chơi và luyện tập lượng giác
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Điểm tích lũy: <span className="font-bold text-blue-600">{score}</span> · Vòng {round}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Chơi lại
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex overflow-x-auto p-2 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-1.5 text-xs">
          {gamesMeta.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveGame(g.id as GameId);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                activeGame === g.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* Game Area Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* G01: Bắt đúng góc */}
          {activeGame === 'G01' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
                <strong>Nhiệm vụ:</strong> Hệ thống yêu cầu xác định vị trí góc <strong>{g01Target}°</strong>. Nhập số đo góc hoặc dự đoán vị trí để săn điểm!
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={g01Input}
                  onChange={(e) => setG01Input(e.target.value)}
                  placeholder="Nhập số đo độ..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleG01Check}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          )}

          {/* G02: Ghép góc & Giá trị */}
          {activeGame === 'G02' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 text-xs">
                <strong>Nhiệm vụ:</strong> Chọn một thẻ góc bên trái và một thẻ giá trị tương ứng bên phải để tạo thành cặp ghép đúng.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500">Cột Góc Lượng Giác:</div>
                  {g02Pairs.map((p) => (
                    <button
                      key={p.angle}
                      onClick={() => {
                        setG02SelectedAngle(p.angle);
                        if (g02SelectedVal) handleG02CheckPair(p.angle, g02SelectedVal);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        g02SelectedAngle === p.angle
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 scale-102'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p.angle}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500">Cột Giá Trị Chuẩn:</div>
                  {['√2/2', '-1', '1/2', 'Không xác định', '0'].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setG02SelectedVal(val);
                        if (g02SelectedAngle) handleG02CheckPair(g02SelectedAngle, val);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        g02SelectedVal === val
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 scale-102'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* G03: Chọn phép biến đổi */}
          {activeGame === 'G03' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <strong>Nhiệm vụ:</strong> Điểm biểu diễn của góc <strong>π - α</strong> (góc bù) đối xứng với điểm biểu diễn của góc <strong>α</strong> qua yếu tố hình học nào?
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Ox', label: 'Trục hoành Ox' },
                  { id: 'Oy', label: 'Trục tung Oy (Đúng)' },
                  { id: 'O', label: 'Gốc tọa độ O' },
                  { id: 'diag', label: 'Đường phân giác y = x' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleG03Check(item.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                      g03Choice === item.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* G04: Xây dựng công thức */}
          {activeGame === 'G04' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                <strong>Nhiệm vụ:</strong> Xây dựng vế phải của công thức côsin tổng: <strong>cos(α + β) = ?</strong> bằng cách chọn các khối thẻ bên dưới theo thứ tự:
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm min-h-12 flex items-center gap-1.5 flex-wrap">
                {g04SelectedTokens.length === 0 ? (
                  <span className="text-slate-400 italic text-xs">Chạm các khối thẻ bên dưới để ghép vào đây...</span>
                ) : (
                  g04SelectedTokens.map((tk, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-bold text-xs">
                      {tk}
                    </span>
                  ))
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['cos α', 'cos β', '-', '+', 'sin α', 'sin β', '2'].map((token) => (
                  <button
                    key={token}
                    onClick={() => setG04SelectedTokens([...g04SelectedTokens, token])}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-mono font-bold"
                  >
                    {token}
                  </button>
                ))}
                <button
                  onClick={() => setG04SelectedTokens([])}
                  className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold"
                >
                  Xóa ghép
                </button>
                <button
                  onClick={handleG04Check}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}

          {/* G05: Thám tử tìm lỗi sai */}
          {activeGame === 'G05' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl border border-rose-200 dark:border-rose-800 text-xs">
                <strong>Nhiệm vụ:</strong> Tìm bước sai lầm đầu tiên trong lời giải giải phương trình sin 2x = sin x:
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { step: 1, text: 'Bước 1: Áp dụng công thức nhân đôi, phương trình tương đương: 2 sin x cos x = sin x' },
                  { step: 2, text: 'Bước 2: Chia cả hai vế cho sin x, ta được: 2 cos x = 1 ⇔ cos x = 1/2' },
                  { step: 3, text: 'Bước 3: Suy ra x = ±π/3 + k2π (k ∈ ℤ)' },
                  { step: 4, text: 'Bước 4: Kết luận tập nghiệm S = {±π/3 + k2π, k ∈ ℤ}' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => handleG05Check(s.step)}
                    className={`w-full p-3 rounded-xl border text-left transition-colors ${
                      g05Choice === s.step
                        ? s.step === 2
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 font-bold'
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* G06: Săn nghiệm phương trình */}
          {activeGame === 'G06' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
                <strong>Nhiệm vụ:</strong> Chọn tất cả các nghiệm của phương trình <strong>sin x = -1/2</strong> nằm trong nửa khoảng <strong>[0; 2π)</strong>:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['π/6', '5π/6', '7π/6', '11π/6', '-π/6', '3π/2'].map((root) => {
                  const isSelected = g06SelectedRoots.includes(root);
                  return (
                    <button
                      key={root}
                      onClick={() => {
                        if (isSelected) {
                          setG06SelectedRoots(g06SelectedRoots.filter((r) => r !== root));
                        } else {
                          setG06SelectedRoots([...g06SelectedRoots, root]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {root}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleG06Check}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Xác nhận các nghiệm đã chọn
              </button>
            </div>
          )}

          {/* Feedback banner */}
          {feedback && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
