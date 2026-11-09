"use client";

import React, { useMemo } from "react";
import { CORE_3_MODULES, CoreModuleConfig, LessonUnit } from "../../types/curriculum";
import { UserLearningProgress, LessonStatus } from "../../types/learningPath";
import { getLessonStatus } from "../../lib/learningProgressStorage";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Compass,
  Box,
  Activity,
  Flame,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { OptiMascot } from "../optimath/mascot/OptiMascot";

interface LearningPathRoadmapProps {
  progress: UserLearningProgress;
  onSelectLesson: (lessonId: string) => void;
  onOpenSimulation: (moduleId: string, lessonId: string) => void;
  onBackToHome: () => void;
}

export function LearningPathRoadmap({
  progress,
  onSelectLesson,
  onOpenSimulation,
  onBackToHome,
}: LearningPathRoadmapProps) {
  // Calculate overall stats
  const totalLessons = 15;
  const completedCount = progress.completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Find last active lesson info
  const lastActiveLesson = useMemo(() => {
    for (const mod of CORE_3_MODULES) {
      const found = mod.lessons.find((l) => l.id === progress.lastActiveLessonId);
      if (found) return { lesson: found, module: mod };
    }
    return { lesson: CORE_3_MODULES[0].lessons[0], module: CORE_3_MODULES[0] };
  }, [progress.lastActiveLessonId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header Banner: Gamified & Engaging */}
      <div className="bg-gradient-to-b from-[#0B132B] via-slate-900 to-[#0B132B] text-white pt-6 pb-10 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Breadcrumb & Back */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>← Về trang chủ & Mô phỏng</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                CHƯƠNG TRÌNH GDPT 2018
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>LUỒNG HỌC TẬP TỪNG BƯỚC (BITE-SIZED TRACK)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Lộ Trình Làm Chủ 3 Chuyên Đề
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Học lý thuyết cô đọng, xem ví dụ phân tích từng bước, trả lời câu hỏi tự luyện và kết nối trực tiếp với phòng mô phỏng tương ứng.
              </p>
            </div>

            {/* Quick Stats Widget */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-3xl backdrop-blur-md shrink-0 shadow-lg">
              <div className="text-center px-2 border-r border-white/10">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-lg sm:text-xl">
                  <Flame className="w-5 h-5 fill-current" />
                  <span>{progress.streakDays}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Ngày liên tiếp</div>
              </div>

              <div className="text-center px-2 border-r border-white/10">
                <div className="flex items-center justify-center gap-1 text-purple-400 font-black text-lg sm:text-xl">
                  <Sparkles className="w-5 h-5" />
                  <span>{progress.earnedXp}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Điểm XP</div>
              </div>

              <div className="text-center px-2">
                <div className="text-emerald-400 font-black text-lg sm:text-xl">
                  {completedCount}/{totalLessons}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Bài hoàn thành</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300">Tiến độ tổng thể: {completedCount}/{totalLessons} bài học</span>
              <span className="text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
          </div>

          {/* Resume Last Active Lesson Card */}
          {lastActiveLesson && (
            <div className="mt-6 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border border-blue-400/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                    TIẾP TỤC BÀI ĐANG HỌC
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {lastActiveLesson.module.code} · {lastActiveLesson.lesson.code}: {lastActiveLesson.lesson.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectLesson(lastActiveLesson.lesson.id)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Học tiếp ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Roadmap Modules Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 relative z-20 space-y-8">
        {CORE_3_MODULES.map((mod: CoreModuleConfig) => {
          const isBlue = mod.id === "linear_programming";
          const isEmerald = mod.id === "spatial_geometry";
          const isPurple = mod.id === "trigonometry";

          // Calculate module completed count
          const modCompleted = mod.lessons.filter((l) =>
            progress.completedLessonIds.includes(l.id)
          ).length;
          const modPercent = Math.round((modCompleted / mod.lessons.length) * 100);

          const themeBorder = isBlue
            ? "border-blue-200"
            : isEmerald
            ? "border-emerald-200"
            : "border-purple-200";

          const themeHeaderBg = isBlue
            ? "from-blue-600 to-indigo-600"
            : isEmerald
            ? "from-emerald-600 to-teal-600"
            : "from-purple-600 to-indigo-600";

          const themeBadge = isBlue
            ? "bg-blue-100 text-blue-800"
            : isEmerald
            ? "bg-emerald-100 text-emerald-800"
            : "bg-purple-100 text-purple-800";

          return (
            <div
              key={mod.id}
              className={`bg-white rounded-3xl border ${themeBorder} shadow-sm overflow-hidden`}
            >
              {/* Module Header Bar */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${themeHeaderBg} text-white flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {isBlue ? (
                      <Compass className="w-6 h-6" />
                    ) : isEmerald ? (
                      <Box className="w-6 h-6" />
                    ) : (
                      <Activity className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${themeBadge}`}>
                        {mod.code} · TOÁN {mod.grade}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {modCompleted}/{mod.lessons.length} Bài đã xong
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {mod.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                {/* Module Progress Mini Bar */}
                <div className="w-full sm:w-48 text-right">
                  <div className="text-xs font-bold text-slate-700 mb-1">
                    {modPercent}% Hoàn thành
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isBlue ? "bg-blue-600" : isEmerald ? "bg-emerald-600" : "bg-purple-600"
                      }`}
                      style={{ width: `${modPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Lesson Items Roadmap List */}
              <div className="divide-y divide-slate-100">
                {mod.lessons.map((lesson: LessonUnit, index: number) => {
                  const status: LessonStatus = getLessonStatus(lesson.id, progress);
                  const isCompleted = status === "completed";
                  const isInProgress = status === "in_progress";

                  return (
                    <div
                      key={lesson.id}
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                        isInProgress
                          ? "bg-blue-50/40"
                          : isCompleted
                          ? "bg-slate-50/50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Left: Step Index & Lesson Meta */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Status Icon Indicator */}
                        <div className="pt-0.5 shrink-0">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/30">
                              {index + 1}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-md">
                              {lesson.code}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Độ khó: {lesson.difficulty}
                            </span>
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                Đã hoàn thành (+50 XP)
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 animate-pulse">
                                Đang học dở
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {lesson.description}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Khoảng 15 - 20 phút
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {lesson.steps.length} Bước lý thuyết & Ví dụ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        {/* Nút Mở phòng mô phỏng tương ứng */}
                        <button
                          type="button"
                          onClick={() => onOpenSimulation(mod.id, lesson.id)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          title="Mở phòng thí nghiệm mô phỏng trực quan tương ứng với bài này"
                        >
                          <Play className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">Mô phỏng</span>
                        </button>

                        {/* Nút Vào học bài này */}
                        <button
                          type="button"
                          onClick={() => onSelectLesson(lesson.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isCompleted
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : isInProgress
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                              : "bg-slate-900 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ôn tập lại</span>
                            </>
                          ) : isInProgress ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Học tiếp</span>
                            </>
                          ) : (
                            <>
                              <span>Học bài này</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
