/**
 * MathSTEP Module 3: Lượng Giác
 * Module 6: Slide bar ngang (có nút ẩn/hiện)
 * Bottom Step Progression & Cognitive Flow Bar (UI06)
 * Features:
 * 1. Step Navigation (< Bước trước, Bước tiếp >)
 * 2. 8 Cognitive Steps with visual completion and active states
 * 3. Pedagogical keyboard shortcuts caption (← → đổi bước, Q kiểm tra, F toàn màn hình, Esc bảng điều khiển)
 * 4. Toggle collapse/expand (ẩn/hiện) for immersive smartboard and projector experience
 */

import React from 'react';
import { CognitiveStep } from '../../types/math';

interface ProgressBarProps {
  currentStep: CognitiveStep;
  onStepChange: (step: CognitiveStep) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenNotebook: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onStepChange,
  onPrev,
  onNext,
  onOpenNotebook,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const steps: { step: CognitiveStep; name: string; short: string }[] = [
    { step: 1, name: 'Nhìn thấy', short: 'Đề bài' },
    { step: 2, name: 'Dự đoán', short: 'Dự đoán' },
    { step: 3, name: 'Chạm & thao tác', short: 'Thao tác' },
    { step: 4, name: 'Khám phá & nhận diện lỗi', short: 'Khám phá' },
    { step: 5, name: 'Kiểm chứng', short: 'Kiểm chứng' },
    { step: 6, name: 'Giải thích căn cứ', short: 'Giải thích' },
    { step: 7, name: 'Bài chuyển giao', short: 'Chuyển giao' },
    { step: 8, name: 'Vận dụng & rèn luyện', short: 'Vận dụng' },
  ];

  // Collapsed View: Compact Floating Button at bottom
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center py-1 bg-transparent pointer-events-none select-none shrink-0 z-30">
        <button
          onClick={onToggleCollapse}
          className="pointer-events-auto px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:scale-105 transition-all flex items-center gap-2"
          title="Hiện thanh điều hướng Module 6"
        >
          <span>▲</span>
          <span>Hiện thanh tiến trình (Module 6) · Bước {currentStep}/8: {steps[currentStep - 1].name}</span>
        </button>
      </div>
    );
  }

  // Expanded View
  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-col gap-1 select-none shrink-0 z-30 transition-all">
      {/* Top Row: Navigation Controls & 8 Steps */}
      <div className="flex items-center justify-between gap-3">
        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={currentStep === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors whitespace-nowrap shadow-2xs"
        >
          ◀ Bước trước
        </button>

        {/* 8 Steps Track */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {steps.map((s) => {
            const isActive = s.step === currentStep;
            const isDone = s.step < currentStep;
            return (
              <button
                key={s.step}
                onClick={() => onStepChange(s.step)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : s.step}
                </span>
                <span className="hidden md:inline">{s.name}</span>
                <span className="inline md:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <div className="flex sm:hidden items-center gap-1 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
          Bước {currentStep}/8: {steps[currentStep - 1].short}
        </div>

        {/* Next button, Notebook shortcut & Collapse toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotebook}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:flex items-center gap-1"
            title="Mở sổ học tập cá nhân"
          >
            <span>📓</span> Sổ học tập
          </button>
          <button
            onClick={onNext}
            disabled={currentStep === 8}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs whitespace-nowrap"
          >
            Bước tiếp theo ▶
          </button>

          {/* Toggle Module 6 Collapse */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              title="Thu gọn Module 6"
            >
              ▼
            </button>
          )}
        </div>
      </div>

      {/* Bottom Hint Row: Keyboard shortcuts & pedagogical status */}
      <div className="hidden md:flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800/60 font-mono">
        <div className="flex items-center gap-3">
          <span>Bước {currentStep}/8: {steps[currentStep - 1].name}</span>
          <span>•</span>
          <span>← → đổi bước</span>
          <span>•</span>
          <span>Q kiểm tra</span>
          <span>•</span>
          <span>F toàn màn hình</span>
          <span>•</span>
          <span>Esc mở/đóng bảng điều khiển</span>
        </div>
        <div>
          MathSTEP GDPT 2018 · THPT Chuyên Hoàng Lê Kha
        </div>
      </div>
    </div>
  );
};
