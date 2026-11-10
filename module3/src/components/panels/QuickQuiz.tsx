/**
 * MathSTEP Module 3: Lượng Giác
 * Tính năng 'Thử thách nhanh' (Quick Quiz) trong TaskPanel
 * Tự động chọn câu hỏi ngẫu nhiên từ ngân hàng 65+ câu hỏi theo chủ đề hoặc toàn module,
 * chấm trắc nghiệm tức thì, giải thích sư phạm chi tiết và ghi nhận chuỗi thành tích.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ActivityId, QuestionItem } from '../../types/math';
import { QUESTIONS_BANK } from '../../data/contentBank';

interface QuickQuizProps {
  currentActivityId: ActivityId;
  allQuestions?: QuestionItem[];
  onSaveToNotebook?: (summary: {
    questionTitle: string;
    isCorrect: boolean;
    userChoice: string;
    explanation: string;
  }) => void;
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({
  currentActivityId,
  allQuestions = QUESTIONS_BANK,
  onSaveToNotebook,
}) => {
  // Quiz filter scope: 'current_activity' or 'all_topics'
  const [scope, setScope] = useState<'current_activity' | 'all_topics'>('current_activity');

  // Filter pool of questions that have options (multiple choice)
  const questionPool = useMemo(() => {
    const base = allQuestions.filter((q) => q.options && q.options.length > 0);
    if (scope === 'current_activity') {
      const filtered = base.filter((q) => q.activityId === currentActivityId);
      return filtered.length > 0 ? filtered : base;
    }
    return base;
  }, [allQuestions, scope, currentActivityId]);

  // Current question index in active pool
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentQ: QuestionItem = questionPool[currentIdx % questionPool.length] || questionPool[0];

  // User interactive state for current question
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Gamification stats
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);

  // Pick a new random question from pool
  const handleNextRandomQuestion = useCallback(() => {
    if (questionPool.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * questionPool.length);
    // ensure different question if more than 1 available
    if (nextIdx === currentIdx && questionPool.length > 1) {
      nextIdx = (nextIdx + 1) % questionPool.length;
    }
    setCurrentIdx(nextIdx);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setShowHint(false);
    setSavedSuccess(false);
  }, [questionPool.length, currentIdx]);

  // Handle option select with instant feedback
  const handleSelectOption = (optId: string) => {
    if (isSubmitted) return; // already answered
    setSelectedOptionId(optId);
    setIsSubmitted(true);
    setSavedSuccess(false);

    const chosen = currentQ.options?.find((o) => o.id === optId);
    const isCorrect = chosen?.isCorrect ?? false;

    setTotalAnswered((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  // Reset quiz session
  const handleResetSession = () => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setShowHint(false);
    setSavedSuccess(false);
    setTotalAnswered(0);
    setCorrectCount(0);
    setStreak(0);
  };

  // Log to student notebook
  const handleSaveAttempt = () => {
    if (!isSubmitted || !selectedOptionId) return;
    const chosen = currentQ.options?.find((o) => o.id === selectedOptionId);
    if (onSaveToNotebook && chosen) {
      onSaveToNotebook({
        questionTitle: currentQ.title,
        isCorrect: !!chosen.isCorrect,
        userChoice: chosen.label,
        explanation: chosen.explanation || currentQ.solution || '',
      });
      setSavedSuccess(true);
    }
  };

  if (!currentQ) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        Không tìm thấy câu hỏi trắc nghiệm nào trong ngân hàng.
      </div>
    );
  }

  const selectedOpt = currentQ.options?.find((o) => o.id === selectedOptionId);
  const correctOpt = currentQ.options?.find((o) => o.isCorrect);

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Header filter & Gamification scorecard */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 flex flex-col gap-2">
        {/* Scope selector */}
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-[11px] text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1">
            <span>⚡</span>
            <span>Phạm vi thử thách:</span>
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => {
                setScope('current_activity');
                setSelectedOptionId(null);
                setIsSubmitted(false);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                scope === 'current_activity'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {currentActivityId}
            </button>
            <button
              onClick={() => {
                setScope('all_topics');
                setSelectedOptionId(null);
                setIsSubmitted(false);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                scope === 'all_topics'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Toàn bộ (65+)
            </button>
          </div>
        </div>

        {/* Live Score & Streak */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200/50 dark:border-slate-700/60 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-300">
              Đúng:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </strong>
              /{totalAnswered}
            </span>
            {totalAnswered > 0 && (
              <span className="text-slate-400">
                ({Math.round((correctCount / totalAnswered) * 100)}%)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-amber-500">🔥 Chuỗi: {streak}</span>
            {bestStreak > 1 && (
              <span className="text-slate-400 font-normal text-[10px]">
                (Kỷ lục: {bestStreak})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
            {currentQ.activityId} · {currentQ.id}
          </span>
          <button
            onClick={handleNextRandomQuestion}
            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            title="Đổi câu hỏi trắc nghiệm ngẫu nhiên khác"
          >
            <span>🔄</span>
            <span>Đổi câu</span>
          </button>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
          {currentQ.title}
        </h4>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
          {currentQ.statement}
        </div>

        {/* Options List with Instant Feedback */}
        <div className="space-y-1.5 pt-1">
          {currentQ.options?.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isThisCorrect = !!opt.isCorrect;

            let btnStyle =
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200';

            if (isSubmitted) {
              if (isThisCorrect) {
                btnStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500';
              } else if (isSelected && !isThisCorrect) {
                btnStyle =
                  'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through ring-1 ring-rose-400';
              } else {
                btnStyle =
                  'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-semibold';
            }

            const prefixChar = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isSubmitted}
                className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all min-h-[44px] ${btnStyle}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isSubmitted && isThisCorrect
                      ? 'bg-emerald-600 text-white'
                      : isSubmitted && isSelected && !isThisCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isSubmitted && isThisCorrect
                    ? '✓'
                    : isSubmitted && isSelected && !isThisCorrect
                    ? '✕'
                    : prefixChar}
                </span>
                <span className="text-[11px] leading-relaxed flex-1">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Verification Feedback Panel */}
        {isSubmitted && selectedOpt && (
          <div
            className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
              selectedOpt.isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <span>{selectedOpt.isCorrect ? '🎉' : '💡'}</span>
                <span>
                  {selectedOpt.isCorrect
                    ? 'Chính xác hoàn toàn!'
                    : 'Chưa chính xác — Gợi ý phân tích:'}
                </span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  selectedOpt.isCorrect
                    ? 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    : 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                }`}
              >
                {selectedOpt.isCorrect ? '+10 Điểm' : 'Ôn lại căn cứ'}
              </span>
            </div>

            {/* Specific feedback for the chosen option */}
            <div className="text-[11px] leading-relaxed pl-1 border-l-2 border-current">
              <p>{selectedOpt.explanation}</p>
            </div>

            {/* If wrong, show the correct explanation */}
            {!selectedOpt.isCorrect && correctOpt && (
              <div className="text-[11px] text-slate-700 dark:text-slate-300 pt-1 border-t border-amber-200 dark:border-amber-800/60">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Đáp án chuẩn:
                </span>{' '}
                {correctOpt.label}
              </div>
            )}

            {/* Actions: Next question & Save to notebook */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-current/20">
              {onSaveToNotebook && (
                <button
                  onClick={handleSaveAttempt}
                  disabled={savedSuccess}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{savedSuccess ? '✓' : '📓'}</span>
                  <span>{savedSuccess ? 'Đã lưu vào sổ' : 'Lưu vào Sổ học tập'}</span>
                </button>
              )}

              <button
                onClick={handleNextRandomQuestion}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors ml-auto flex items-center gap-1"
              >
                <span>Câu tiếp theo</span>
                <span>▶</span>
              </button>
            </div>
          </div>
        )}

        {/* Optional Socratic Hints before answering */}
        {!isSubmitted && currentQ.hints && currentQ.hints.length > 0 && (
          <div className="pt-1">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>💡 Cần gợi ý giải bài?</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-slate-850 border border-blue-200/60 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span>Gợi ý Socratic:</span>
                  <button
                    onClick={() => setShowHint(false)}
                    className="text-slate-400 hover:text-slate-600 text-[10px]"
                  >
                    Thu gọn ✕
                  </button>
                </div>
                <p>{currentQ.hints[0].content}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session footer with reset option */}
      {totalAnswered > 0 && (
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Đã hoàn thành {totalAnswered} câu trắc nghiệm</span>
          <button
            onClick={handleResetSession}
            className="hover:text-rose-500 transition-colors text-[10px]"
          >
            Đặt lại phiên kiểm tra
          </button>
        </div>
      )}
    </div>
  );
};
