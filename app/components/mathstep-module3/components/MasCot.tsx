/**
 * MathSTEP Module 3: Lượng Giác
 * Socratic AI Mascot: Chim Cú Thông Thái MathSTEP
 * Features expressive SVG avatar (neutral, thinking, encouraging, celebrating),
 * Socratic prompt bubble with pedagogical guidance (H0 - H4), and non-intrusive placement.
 */

import React, { useState } from 'react';
import { HintLevel, HintSpec } from '../types/math';

export type MascotMood = 'neutral' | 'thinking' | 'encouraging' | 'celebrating';

interface MasCotProps {
  mood?: MascotMood;
  speechText?: string;
  currentHint?: HintSpec | null;
  hintLevel?: HintLevel;
  onAskNextHint?: () => void;
  onRequestTeacher?: () => void;
  reducedMotion?: boolean;
}

export const MasCot: React.FC<MasCotProps> = ({
  mood = 'neutral',
  speechText,
  currentHint,
  hintLevel = 'H0',
  onAskNextHint,
  onRequestTeacher,
  reducedMotion = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // SVG Owl Colors
  const featherPrimary = '#1E293B'; // dark slate
  const featherBelly = '#F1F5F9'; // light cream
  const featherAccent = '#F59E0B'; // amber gold
  const beakColor = '#EA580C'; // vibrant orange
  const eyeColor = '#2563EB'; // sapphire blue pupil

  const renderEyes = () => {
    switch (mood) {
      case 'thinking':
        return (
          <>
            {/* Looking up-right */}
            <circle cx="36" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="64" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="39" cy="37" r="4.5" fill={eyeColor} />
            <circle cx="67" cy="37" r="4.5" fill={eyeColor} />
            <circle cx="41" cy="35" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="35" r="1.5" fill="#FFFFFF" />
            {/* Thinking eyebrow */}
            <path d="M 28 30 Q 36 33 44 28" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 56 28 Q 64 33 72 30" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'encouraging':
        return (
          <>
            {/* Big friendly round eyes */}
            <circle cx="36" cy="40" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="64" cy="40" r="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="36" cy="40" r="5.5" fill={eyeColor} />
            <circle cx="64" cy="40" r="5.5" fill={eyeColor} />
            <circle cx="38" cy="38" r="2" fill="#FFFFFF" />
            <circle cx="66" cy="38" r="2" fill="#FFFFFF" />
            {/* Soft encouraging brows */}
            <path d="M 27 28 Q 36 24 45 28" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 55 28 Q 64 24 73 28" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'celebrating':
        return (
          <>
            {/* Happy arch eyes (^_^) */}
            <path d="M 26 42 Q 36 32 46 42" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 54 42 Q 64 32 74 42" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Blushing cheeks */}
            <ellipse cx="25" cy="48" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="75" cy="48" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
          </>
        );
      case 'neutral':
      default:
        return (
          <>
            <circle cx="36" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="64" cy="40" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <circle cx="36" cy="40" r="4.5" fill={eyeColor} />
            <circle cx="64" cy="40" r="4.5" fill={eyeColor} />
            <circle cx="38" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="66" cy="38" r="1.5" fill="#FFFFFF" />
          </>
        );
    }
  };

  const displayText =
    currentHint?.content ||
    speechText ||
    'Chào em! Opti sẽ cùng em khám phá lượng giác. Hãy kéo điểm trên đường tròn và quan sát đồ thị thay đổi nhé!';

  return (
    <div className="relative flex items-end gap-3 pointer-events-auto select-none">
      {/* Minimized toggle button */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200"
          title="Mở trợ lý Opti"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
            🦉
          </div>
          <span>Gợi ý của Opti</span>
        </button>
      ) : (
        <>
          {/* Socratic Speech Bubble */}
          <div className="max-w-xs md:max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-xl text-sm relative">
            {/* Header info with quiet unboxed typography */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="text-amber-500">🦉</span>
                <span>Trợ lý học tập</span>
                {hintLevel !== 'H0' && (
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                    · Cấp {hintLevel}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title="Thu nhỏ trợ lý"
              >
                ✕
              </button>
            </div>

            {/* Bubble Content */}
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {currentHint && (
                <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  {currentHint.title}:
                </div>
              )}
              <p>{displayText}</p>
            </div>

            {/* Action buttons inside bubble */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
              {onAskNextHint && hintLevel !== 'H4' && (
                <button
                  onClick={onAskNextHint}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/70 rounded-lg transition-colors"
                >
                  Gợi ý thêm ({hintLevel === 'H0' ? 'H1' : hintLevel === 'H1' ? 'H2' : 'H3'})
                </button>
              )}
              {onRequestTeacher && (
                <button
                  onClick={onRequestTeacher}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Hỏi thầy cô (H4)
                </button>
              )}
            </div>

            {/* Triangle pointer */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45" />
          </div>

          {/* SVG Owl Avatar */}
          <div
            className={`w-16 h-20 shrink-0 cursor-pointer transform hover:scale-105 transition-transform ${
              reducedMotion ? '' : 'animate-bounce-subtle'
            }`}
            onClick={() => setIsMinimized(true)}
            title="Bấm để ẩn linh vật"
          >
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
              {/* Feet */}
              <ellipse cx="38" cy="112" rx="7" ry="3.5" fill={featherAccent} />
              <ellipse cx="62" cy="112" rx="7" ry="3.5" fill={featherAccent} />

              {/* Body */}
              <path
                d="M 20 60 C 20 30, 80 30, 80 60 C 80 95, 75 110, 50 110 C 25 110, 20 95, 20 60 Z"
                fill={featherPrimary}
              />

              {/* Belly */}
              <path
                d="M 30 65 C 30 50, 70 50, 70 65 C 70 95, 65 105, 50 105 C 35 105, 30 95, 30 65 Z"
                fill={featherBelly}
              />

              {/* Belly markings */}
              <path d="M 44 75 Q 50 80 56 75" stroke="#CBD5E1" strokeWidth="2" fill="none" />
              <path d="M 42 86 Q 50 91 58 86" stroke="#CBD5E1" strokeWidth="2" fill="none" />

              {/* Owl Ear Tufts */}
              <path d="M 22 35 L 14 14 L 35 24 Z" fill={featherPrimary} />
              <path d="M 78 35 L 86 14 L 65 24 Z" fill={featherPrimary} />
              <path d="M 23 30 L 18 19 L 32 25 Z" fill={featherAccent} />
              <path d="M 77 30 L 82 19 L 68 25 Z" fill={featherAccent} />

              {/* Eyes */}
              {renderEyes()}

              {/* Beak */}
              <path d="M 46 47 L 54 47 L 50 56 Z" fill={beakColor} />

              {/* Graduation Cap (academic symbol of MathSTEP) */}
              <path d="M 50 10 L 82 19 L 50 28 L 18 19 Z" fill="#0F172A" />
              <rect x="42" y="24" width="16" height="7" rx="2" fill="#1E293B" />
              <path d="M 70 22 L 76 34 L 79 33" stroke={featherAccent} strokeWidth="2" fill="none" />
              <circle cx="79" cy="34" r="2.5" fill={featherAccent} />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
