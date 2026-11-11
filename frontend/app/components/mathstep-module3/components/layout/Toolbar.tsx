/**
 * MathSTEP Module 3: Lượng Giác
 * Top Navigation Toolbar (UI01)
 * Adheres strictly to the 3-Zone Top Bar Contract:
 * Zone 1: Single text wordmark "MathSTEP · Lượng Giác"
 * Zone 2: Navigation links / Modes / Utilities
 * Zone 3: Primary Action & Profile switcher
 */

import React from 'react';
import Link from 'next/link';
import { BookOpen, Gamepad2, Maximize, Minimize, Settings, Sparkles, Stethoscope } from 'lucide-react';
import { ActivityMeta, AngleUnit, AppMode } from '../../types/math';

interface ToolbarProps {
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  unit: AngleUnit;
  onUnitToggle: () => void;
  currentActivity?: ActivityMeta;
  onOpenConstructLab?: () => void;
  onOpenNotebook: () => void;
  onOpenGames: () => void;
  onOpenDiagnostics: () => void;
  onOpenSettings?: () => void;
  isSmartboardMode?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  unit,
  onUnitToggle,
  currentActivity,
  onOpenConstructLab,
  onOpenNotebook,
  onOpenGames,
  onOpenDiagnostics,
  onOpenSettings,
  isSmartboardMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="relative z-40 flex h-14 w-full shrink-0 select-none items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:gap-4 sm:px-4">
      {/* Zone 1: Brand Wordmark & Active Activity Formula preview */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/?focusModule=trigonometry" title="Quay lại danh mục lượng giác" className="flex items-center gap-2 group text-decoration-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            M3
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-base">
              MathSTEP
            </span>
            <span className="-mt-0.5 hidden whitespace-nowrap text-[10px] text-slate-400 sm:inline">
              Lượng giác · Toán 11
            </span>
          </div>
        </Link>

        {/* Current Activity & Formula Badge (Pedagogical Zone from Diagram) */}
        {currentActivity && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {currentActivity.title}
            </span>
            <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60 shadow-2xs">
              {currentActivity.formulaAnchor}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Trực quan 2D/3D</span>
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Middle Nav Controls */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Mode selector: Trình diễn / Học có hướng dẫn / Tự kiểm tra độc lập */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => onModeChange('presentation')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              mode === 'presentation'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Mở toàn bộ công cụ & lời giải cho giáo viên giảng bài"
          >
            Trình diễn
          </button>
          <button
            onClick={() => onModeChange('guided')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              mode === 'guided'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Khám phá theo 8 bước với câu hỏi gợi mở"
          >
            Học có hướng dẫn
          </button>
          <button
            onClick={() => onModeChange('assessment')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              mode === 'assessment'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Đánh giá độc lập: Khóa gợi ý và phản hồi đúng/sai trước khi nộp"
          >
            Tự kiểm tra
          </button>
        </div>

        {/* Deg / Rad toggle */}
        <button
          onClick={onUnitToggle}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 transition-colors whitespace-nowrap"
          title="Chuyển đổi đơn vị giữa Độ (°) và Radian (rad)"
        >
          {unit === 'deg' ? 'Độ (°)' : 'Radian (π)'}
        </button>

        {/* Quick Hub Links */}
        {onOpenConstructLab && (
          <button
            onClick={onOpenConstructLab}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1.5 whitespace-nowrap border border-purple-200 dark:border-purple-800"
            title="Tự kiến tạo — Tự làm trước, giải thích, rồi kiểm chứng"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tự kiến tạo</span>
          </button>
        )}

        <button
          onClick={onOpenGames}
          type="button"
          aria-label="Mở trò chơi lượng giác"
          title="Mở trò chơi lượng giác"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
        >
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xl:inline">Trò chơi</span>
        </button>

        <button
          onClick={onOpenNotebook}
          type="button"
          aria-label="Mở sổ học tập"
          title="Mở sổ học tập"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xl:inline">Sổ học tập</span>
        </button>

        <button
          onClick={onOpenDiagnostics}
          type="button"
          aria-label="Mở công cụ chẩn đoán"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
          title="Kiểm thử tự động T01-T38, F01-F16"
        >
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xl:inline">Chẩn đoán</span>
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            type="button"
            aria-label="Mở cài đặt và hướng dẫn"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
            title="Cài đặt giao diện & Hướng dẫn sử dụng"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Cài đặt</span>
          </button>
        )}
      </div>

      {/* Compact actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenConstructLab && (
          <button
            type="button"
            onClick={onOpenConstructLab}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-800 transition hover:bg-purple-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-700 md:hidden"
            title="Mở 6 trạm tự kiến tạo"
            aria-label="Mở 6 trạm tự kiến tạo"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <details className="relative lg:hidden">
          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" aria-label="Mở thêm công cụ" title="Thêm công cụ">
            ···
          </summary>
          <div className="absolute right-0 top-11 z-50 grid min-w-52 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <button type="button" onClick={onOpenGames} className="rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Trò chơi lượng giác</button>
            <button type="button" onClick={onOpenNotebook} className="rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Sổ học tập</button>
            <button type="button" onClick={onOpenDiagnostics} className="rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Công cụ chẩn đoán</button>
            {onOpenSettings && <button type="button" onClick={onOpenSettings} className="rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cài đặt và hướng dẫn</button>}
          </div>
        </details>
        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          type="button"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
};
