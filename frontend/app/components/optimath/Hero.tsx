import React from 'react';
import { OptiMascot } from '@/app/components/optimath/mascot/OptiMascot';
import { Sparkles, Compass, Box, Activity, GraduationCap, ArrowRight } from 'lucide-react';

interface HeroProps {
  onStartExplore: () => void;
  onOpenTeacherGuide: () => void;
  onOpenLearningPath?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartExplore: _onStartExplore,
  onOpenTeacherGuide: _onOpenTeacherGuide,
  onOpenLearningPath,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B132B] to-slate-900 text-white pt-6 pb-8 sm:pt-8 sm:pb-10 border-b border-white/10 select-none">
      {/* Background Subtle Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Punchy title & minimal text */}
          <div className="flex-1 text-center md:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>MATHSTEP · HỌC TOÁN THPT THEO CHƯƠNG TRÌNH GDPT 2018</span>
            </div>

            {/* Slogan */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-2">
              Khám Phá Trực Quan – <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Làm Chủ Mô Phỏng Toán Học
              </span>
            </h1>

            {/* Subtitle - Tối giản chữ, tập trung hành động */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed mb-4">
              Chọn một bài học để bắt đầu phần lý thuyết, luyện tập từng bước hoặc mở mô phỏng tương tác.
            </p>

            {/* 3 Quick Visual Pills + Callout to Learning Track */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                CĐ1: BPT & Tối Ưu Oxy
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                CĐ2: Hình Học Không Gian 3D
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                CĐ3: Lượng Giác Tương Tác
              </span>
            </div>

            {/* Fast Track Button to Learning Roadmap */}
            {onOpenLearningPath && (
              <div className="flex justify-center md:justify-start pt-1">
                <button
                  type="button"
                  onClick={onOpenLearningPath}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 group"
                >
                  <GraduationCap className="w-4 h-4 text-white" />
                  <span>Vào Lộ Trình Học Tập Từng Bước (15 Bài)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Friendly mascot compact banner */}
          <div className="shrink-0 flex items-center gap-3 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
              <OptiMascot expression="happy" pose="waving" size={72} />
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-bold text-blue-300">Trợ lý học tập MathSTEP</div>
              <p className="text-[11px] text-slate-300 max-w-[180px] leading-snug mt-0.5">
                "Chào em! Chọn bài học bên dưới hoặc vào Lộ trình học nhé!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
