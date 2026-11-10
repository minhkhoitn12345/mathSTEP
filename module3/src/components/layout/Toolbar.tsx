/**
 * MathSTEP Module 3: Lượng Giác
 * Top Navigation Toolbar (UI01)
 * Adheres strictly to the 3-Zone Top Bar Contract:
 * Zone 1: Single text wordmark "MathSTEP · Lượng Giác"
 * Zone 2: Navigation links / Modes / Utilities
 * Zone 3: Primary Action & Profile switcher
 */

import React from 'react';
import { ActivityMeta, AngleUnit, AppMode, UserProfile } from '../../types/math';

interface ToolbarProps {
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  unit: AngleUnit;
  onUnitToggle: () => void;
  activeProfile: UserProfile;
  currentActivity?: ActivityMeta;
  onOpenConstructLab?: () => void;
  onOpenNotebook: () => void;
  onOpenGames: () => void;
  onOpenDiagnostics: () => void;
  onOpenProfiles: () => void;
  onExportStandaloneHTML: () => void;
  onDownloadSourceZip?: () => void;
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
  activeProfile,
  currentActivity,
  onOpenConstructLab,
  onOpenNotebook,
  onOpenGames,
  onOpenDiagnostics,
  onOpenProfiles,
  onExportStandaloneHTML,
  onDownloadSourceZip,
  onOpenSettings,
  isSmartboardMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="w-full h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-40">
      {/* Zone 1: Brand Wordmark & Active Activity Formula preview */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2 group text-decoration-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            M3
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              MathSTEP · Lượng Giác
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:inline">
              THPT Chuyên Hoàng Lê Kha
            </span>
          </div>
        </a>

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
            title="Khám phá theo 8 bước và nhận gợi mở Socratic"
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
            <span>✨</span>
            <span>Tự kiến tạo</span>
          </button>
        )}

        <button
          onClick={onOpenGames}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>🎮</span>
          <span>Trò chơi (G01-G06)</span>
        </button>

        <button
          onClick={onOpenNotebook}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>📚</span>
          <span>Sổ học tập</span>
        </button>

        <button
          onClick={onOpenDiagnostics}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Kiểm thử tự động T01-T38, F01-F16"
        >
          <span>🩺</span>
          <span>Chẩn đoán</span>
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Cài đặt giao diện & Hướng dẫn sử dụng"
          >
            <span>⚙️</span>
            <span>Cài đặt</span>
          </button>
        )}
      </div>

      {/* Zone 3: Profile & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Profile indicator */}
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
          title="Đổi hồ sơ học sinh / giáo viên"
        >
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
            {activeProfile.name.charAt(0)}
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200 hidden sm:inline">
            {activeProfile.name}
          </span>
        </button>

        {/* Download Source Code ZIP */}
        {onDownloadSourceZip && (
          <button
            onClick={onDownloadSourceZip}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Tải gói mã nguồn hoàn chỉnh (ZIP) của toàn bộ dự án"
          >
            <span>📦</span>
            <span className="hidden xl:inline">Tải Mã Nguồn (ZIP)</span>
          </button>
        )}

        {/* Export Standalone index.html */}
        <button
          onClick={onExportStandaloneHTML}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          title="Tải tệp index.html tự chứa hoàn chỉnh để chạy offline trên máy tính hoặc điện thoại"
        >
          <span>📥</span>
          <span className="hidden sm:inline">Xuất index.html</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? '⤢' : '⤡'}
        </button>
      </div>
    </header>
  );
};
