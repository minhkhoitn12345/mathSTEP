/**
 * MathSTEP Module 3: Lượng Giác
 * Left Task Panel (UI03)
 * Implements:
 * 1. The 8-step cognitive learning flow:
 *    1. Nhìn thấy → 2. Dự đoán → 3. Chạm, thao tác → 4. Khám phá & nhận diện lỗi
 *    → 5. Kiểm chứng → 6. Giải thích → 7. Bài chuyển giao → 8. Vận dụng, rèn luyện.
 * 2. 'Thử thách nhanh' (Quick Quiz):
 *    Sinh bài trắc nghiệm ngẫu nhiên từ ngân hàng 65+ câu hỏi với phản hồi tức thì và ghi nhận chuỗi thành tích.
 */

import React, { useState } from 'react';
import { ActivityMeta, AppMode, CognitiveStep, ErrorCode, QuestionItem } from '../../types/math';
import { QuickQuiz } from './QuickQuiz';

interface TaskPanelProps {
  activity: ActivityMeta;
  activeQuestion: QuestionItem;
  currentStep: CognitiveStep;
  mode: AppMode;
  prediction: string;
  onPredictionChange: (text: string) => void;
  observation: string;
  onObservationChange: (text: string) => void;
  explanation: string;
  onExplanationChange: (text: string) => void;
  onRunCheck: () => void;
  checkStatus?: 'correct' | 'incorrect' | 'partial' | 'unverified';
  checkFeedback?: string;
  activeErrors?: ErrorCode[];
  onNextStep: () => void;
  onPrevStep: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSubmitAttempt: () => void;
  allQuestions?: QuestionItem[];
  onSaveQuizScore?: (summary: {
    questionTitle: string;
    isCorrect: boolean;
    userChoice: string;
    explanation: string;
  }) => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  activity,
  activeQuestion,
  currentStep,
  mode,
  prediction,
  onPredictionChange,
  observation,
  onObservationChange,
  explanation,
  onExplanationChange,
  onRunCheck,
  checkStatus = 'unverified',
  checkFeedback,
  activeErrors = [],
  onNextStep,
  onPrevStep,
  isCollapsed,
  onToggleCollapse,
  onSubmitAttempt,
  allQuestions,
  onSaveQuizScore,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<'steps' | 'quiz'>('steps');

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 px-1.5 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          title="Mở bảng nhiệm vụ"
        >
          📖
        </button>
        <span className="text-[11px] font-bold text-slate-500 [writing-mode:vertical-lr] rotate-180 mt-6 tracking-wide">
          Bảng nhiệm vụ (Bước {currentStep}/8)
        </span>
      </div>
    );
  }

  const stepTitles = [
    '1. Nhìn thấy',
    '2. Dự đoán',
    '3. Chạm & thao tác',
    '4. Khám phá & nhận diện lỗi',
    '5. Kiểm chứng',
    '6. Giải thích căn cứ',
    '7. Bài chuyển giao',
    '8. Vận dụng & lưu sổ',
  ];

  return (
    <div className="w-[300px] lg:w-[320px] h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Nhiệm vụ học tập</span>
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
            {activity.id}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          title="Thu gọn bảng"
        >
          ◀
        </button>
      </div>

      {/* Dual Tabs: 8 Bước học tập vs Thử thách nhanh (Quick Quiz) */}
      <div className="px-3 pt-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/40 dark:bg-slate-850">
        <button
          onClick={() => setPanelTab('steps')}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            panelTab === 'steps'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>📖</span>
          <span>8 Bước học tập</span>
        </button>
        <button
          onClick={() => setPanelTab('quiz')}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all relative ${
            panelTab === 'quiz'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          <span>⚡</span>
          <span>Thử thách nhanh</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </button>
      </div>

      {/* TAB 1: QUICK QUIZ */}
      {panelTab === 'quiz' ? (
        <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
          <QuickQuiz
            currentActivityId={activity.id}
            allQuestions={allQuestions}
            onSaveToNotebook={onSaveQuizScore}
          />
        </div>
      ) : (
        /* TAB 2: 8 COGNITIVE STEPS FLOW */
        <>
          {/* Step Indicator strip */}
          <div className="px-3 py-2 bg-blue-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              {stepTitles[currentStep - 1]}
            </span>
            <span className="font-mono text-slate-500">Bước {currentStep}/8</span>
          </div>

          {/* Step Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs leading-relaxed">
            {/* Step 1: Nhìn thấy */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {activeQuestion.title}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
                  {activeQuestion.statement}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Yêu cầu: Đọc kỹ đề bài, xác định đối tượng cần tìm và chuẩn bị đưa ra dự đoán ở bước 2.
                </div>
              </div>
            )}

            {/* Step 2: Dự đoán */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Ghi nhận dự đoán ban đầu (trước khi mở mô hình kiểm chứng)
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Theo em, kết quả hoặc hướng giải quyết bài toán này sẽ như thế nào?
                </p>
                <textarea
                  value={prediction}
                  onChange={(e) => onPredictionChange(e.target.value)}
                  placeholder="Nhập dự đoán của em tại đây (ví dụ: điểm cuối rơi vào góc phần tư IV, số vòng quay nguyên là -2...)"
                  className="w-full h-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  💡 Dự đoán giúp phát hiện hiểu lầm trực giác trước khi thực hiện thao tác kiểm tra.
                </div>
              </div>
            )}

            {/* Step 3: Chạm & Thao tác */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Tương tác trực quan trên đường tròn / đồ thị
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Hãy kéo điểm cuối M trên đường tròn hoặc điều chỉnh tham số góc ở Bảng điều khiển để đưa góc về đúng giá trị đề bài ({activity.defaultAngle}°).
                </p>
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300">
                  Thao tác cần làm: Quan sát quỹ đạo quay và vị trí dừng lại của tia cuối OM.
                </div>
              </div>
            )}

            {/* Step 4: Khám phá & Nhận diện lỗi */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Ghi nhận quan sát & Kiểm tra cạm bẫy ngộ nhận
                </div>
                <textarea
                  value={observation}
                  onChange={(e) => onObservationChange(e.target.value)}
                  placeholder="Ghi nhận hiện tượng em quan sát thấy từ mô hình..."
                  className="w-full h-20 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
                {activity.suggestedErrors.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300">
                    <span className="font-bold">Cảnh báo lỗi thường gặp:</span> Mã sai lầm {activity.suggestedErrors.join(', ')}. Hãy cẩn thận khi kết luận số đo và vị trí!
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Kiểm chứng */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Kiểm toán toán học & Xác minh tự động
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Bấm nút bên dưới để bộ thẩm định kiểm tra tính chính xác của góc và giá trị lượng giác em đang thiết lập.
                </p>
                <button
                  onClick={onRunCheck}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-xs"
                >
                  Kiểm chứng kết quả
                </button>
                {checkStatus !== 'unverified' && (
                  <div
                    className={`p-3 rounded-xl border ${
                      checkStatus === 'correct'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      {checkStatus === 'correct' ? '✓ Kết quả chính xác' : '✗ Chưa đúng hoàn toàn'}
                    </div>
                    <div>{checkFeedback}</div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Giải thích căn cứ */}
            {currentStep === 6 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Giải thích căn cứ định lý và công thức
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Hãy trình bày lập luận toán học vì sao kết quả trên là đúng:
                </p>
                <textarea
                  value={explanation}
                  onChange={(e) => onExplanationChange(e.target.value)}
                  placeholder="Trình bày công thức tách góc, dấu tọa độ hoặc hệ thức cơ bản..."
                  className="w-full h-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            )}

            {/* Step 7: Bài chuyển giao */}
            {currentStep === 7 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Thử thách chuyển giao tương tự
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Áp dụng kiến thức vừa học để dự đoán điểm biểu diễn của góc 1110° hoặc 25π/6.
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-700 dark:text-slate-300">
                  <p className="font-semibold mb-1">Gợi ý bài tập tương tự:</p>
                  <p>1110° = 3 × 360° + 30° → Điểm cuối trùng với góc 30° (góc phần tư I).</p>
                </div>
              </div>
            )}

            {/* Step 8: Vận dụng & Lưu sổ */}
            {currentStep === 8 && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Hoàn thành chuỗi nhận thức & Lưu sổ học tập
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Chúc mừng em đã hoàn thành 8 bước học tập của chuyên đề này. Toàn bộ dự đoán ban đầu, quan sát, giải thích và bản sửa lỗi sẽ được lưu vào Sổ Học Tập cá nhân.
                </p>
                <button
                  onClick={onSubmitAttempt}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>💾</span>
                  <span>Lưu vào Sổ Học Tập</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
            <button
              onClick={onPrevStep}
              disabled={currentStep === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors text-xs"
            >
              Trang trước
            </button>
            <button
              onClick={onNextStep}
              disabled={currentStep === 8}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs shadow-xs"
            >
              Bước tiếp theo ➔
            </button>
          </div>
        </>
      )}
    </div>
  );
};
