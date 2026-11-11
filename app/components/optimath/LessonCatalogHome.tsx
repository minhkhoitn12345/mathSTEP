"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import {
  loadUserLearningProgress,
  getLessonStatus,
} from "@/app/lib/learningProgressStorage";
import type { UserLearningProgress, LessonStatus } from "@/app/types/learningPath";
import LessonPathTracks from "./LessonPathTracks";

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

interface LessonCatalogHomeProps {
  onOpenTeacherGuide?: () => void;
  onOpenKnowledgeBase?: () => void;
  focusModuleId?: "linear_programming" | "spatial_geometry" | "trigonometry" | null;
  onModuleFocusHandled?: () => void;
}

export const LessonCatalogHome: React.FC<LessonCatalogHomeProps> = ({
  onOpenTeacherGuide,
  onOpenKnowledgeBase,
  focusModuleId = null,
  onModuleFocusHandled,
}) => {
  // 1. Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<"all" | 10 | 11>("all");
  const [selectedModule, setSelectedModule] = useState<
    "all" | "linear_programming" | "spatial_geometry" | "trigonometry"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | LessonStatus>("all");

  // 2. User Learning Progress from localStorage
  const [userProgress, setUserProgress] = useState<UserLearningProgress>(() =>
    loadUserLearningProgress()
  );

  useEffect(() => {
    // Refresh progress on mount or focus
    const refresh = () => setUserProgress(loadUserLearningProgress());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  useEffect(() => {
    if (!focusModuleId) return;
    setSearchQuery("");
    setSelectedGrade("all");
    setSelectedStatus("all");
    setSelectedModule(focusModuleId);
  }, [focusModuleId]);

  // Flatten every lesson across the three modules.
  const allLessonsWithModule = useMemo(() => {
    return CORE_3_MODULES.flatMap((mod) =>
      mod.lessons.map((lesson) => ({
        ...lesson,
        parentModule: mod,
        status: getLessonStatus(lesson.id, userProgress),
        score: userProgress.quizScores[lesson.id],
      }))
    );
  }, [userProgress]);

  // 4. Filtering Logic
  const filteredLessons = useMemo(() => {
    const query = normalizeSearchText(searchQuery.trim());

    return allLessonsWithModule.filter((item) => {
      // Grade filter
      if (selectedGrade !== "all" && item.grade !== selectedGrade) {
        return false;
      }

      // Module filter
      if (selectedModule !== "all" && item.moduleId !== selectedModule) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // Text search match
      if (query) {
        const titleMatch = normalizeSearchText(item.title).includes(query);
        const subtitleMatch = normalizeSearchText(item.subtitle).includes(query);
        const descMatch = normalizeSearchText(item.description).includes(query);
        const codeMatch = normalizeSearchText(item.code).includes(query);
        const moduleTitleMatch = normalizeSearchText(item.parentModule.title).includes(query);
        const moduleShortMatch = normalizeSearchText(item.parentModule.shortTitle).includes(query);
        const moduleCodeMatch = normalizeSearchText(item.parentModule.code).includes(query);
        const gradeMatch =
          normalizeSearchText(`lớp ${item.grade}`).includes(query) || `${item.grade}` === query;
        const diffMatch = normalizeSearchText(item.difficulty).includes(query);

        return (
          titleMatch ||
          subtitleMatch ||
          descMatch ||
          codeMatch ||
          moduleTitleMatch ||
          moduleShortMatch ||
          moduleCodeMatch ||
          gradeMatch ||
          diffMatch
        );
      }

      return true;
    });
  }, [allLessonsWithModule, searchQuery, selectedGrade, selectedModule, selectedStatus]);

  useEffect(() => {
    if (!focusModuleId || selectedModule !== focusModuleId || filteredLessons.length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`${focusModuleId}-section`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      onModuleFocusHandled?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusModuleId, selectedModule, filteredLessons.length, onModuleFocusHandled]);

  // Active filters count
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedGrade !== "all" ||
    selectedModule !== "all" ||
    selectedStatus !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGrade("all");
    setSelectedModule("all");
    setSelectedStatus("all");
  };

  // Progress stats
  const totalLessons = CORE_3_MODULES.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedCount = CORE_3_MODULES.flatMap((module) => module.lessons)
    .filter((lesson) => userProgress.completedLessonIds.includes(lesson.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const resumeLesson = allLessonsWithModule.find((lesson) =>
    lesson.id === userProgress.lastActiveLessonId && lesson.status !== "completed"
  ) ?? allLessonsWithModule.find((lesson) => lesson.status !== "completed");

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* =========================================================================
          1. HERO & BANNER MỤC LỤC BÀI HỌC
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-slate-900 to-[#1C2541] text-white p-5 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>MỤC LỤC BÀI HỌC & LỘ TRÌNH GDPT 2018</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Khám Phá 3 Chuyên Đề Trọng Điểm Toán THPT
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Lộ trình gồm <strong>{totalLessons} bài học</strong> theo ba chuyên đề. Mỗi bài có nội dung
              học riêng và đường dẫn ổn định; em có thể mở mô phỏng tương ứng bất cứ lúc nào.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {resumeLesson && (
                <Link
                  href={`/learn/${resumeLesson.moduleId}/${resumeLesson.id}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  title={`${resumeLesson.code}: ${resumeLesson.title}`}
                >
                  {resumeLesson.status === "in_progress" ? "Học tiếp" : "Bắt đầu bài tiếp theo"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              {onOpenTeacherGuide && (
                <button
                  type="button"
                  onClick={onOpenTeacherGuide}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sư phạm & Khung GDPT</span>
                </button>
              )}
              {onOpenKnowledgeBase && (
                <button
                  type="button"
                  onClick={onOpenKnowledgeBase}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tra cứu công thức cốt lõi</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Progress Dashboard */}
          <div className="w-full lg:w-72 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shrink-0 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tiến độ của em
              </span>
              <span className="text-emerald-400 font-black">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-slate-400">Đã xong</div>
                <div className="font-extrabold text-white text-xs">{completedCount}/{totalLessons}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-slate-400">Điểm XP</div>
                <div className="font-extrabold text-purple-300 text-xs">
                  {userProgress.earnedXp}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <div className="text-slate-400">Streak</div>
                <div className="font-extrabold text-amber-300 text-xs flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-current" />
                  {userProgress.streakDays}d
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. Ô TÌM KIẾM & BỘ LỌC TƯƠNG TÁC (SEARCH & FILTER HUB)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên bài học (vd: Nửa mặt phẳng, 3D, Lượng giác), mã bài, lớp..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Lọc theo:
            </span>

            {/* Grade Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedGrade("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedGrade === "all"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả lớp
              </button>
              <button
                type="button"
                onClick={() => setSelectedGrade(10)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedGrade === 10
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lớp 10 (CĐ1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGrade(11)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedGrade === 11
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lớp 11 (CĐ2, CĐ3)
              </button>
            </div>

            {/* Module Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedModule("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedModule === "all"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3 Chuyên đề
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule("linear_programming")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedModule === "linear_programming"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                CĐ1: BPT
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule("spatial_geometry")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedModule === "spatial_geometry"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                CĐ2: 3D
              </button>
              <button
                type="button"
                onClick={() => setSelectedModule("trigonometry")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedModule === "trigonometry"
                    ? "bg-purple-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                CĐ3: Lượng giác
              </button>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "all"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả trạng thái
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("completed")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "completed"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đã xong
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("in_progress")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "in_progress"
                    ? "bg-amber-500 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đang học
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("not_started")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === "not_started"
                    ? "bg-slate-700 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Chưa học
              </button>
            </div>
          </div>

          {/* Reset Filters CTA & Result Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị <strong>{filteredLessons.length}</strong> / {totalLessons} bài học
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. KẾT QUẢ MỤC LỤC BÀI HỌC (LESSON CATALOG LIST / GRID)
          ========================================================================= */}
      {filteredLessons.length === 0 ? (
        /* Trạng thái không tìm thấy kết quả */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Không tìm thấy bài học nào phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Không có bài học nào khớp với từ khóa{" "}
              {searchQuery ? <code className="text-blue-600 font-bold">&quot;{searchQuery}&quot;</code> : ""}{" "}
              và các tiêu chí bộ lọc đã chọn.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa từ khóa & Hiển thị lại tất cả bài học</span>
          </button>
        </div>
      ) : (
        <LessonPathTracks
          modules={CORE_3_MODULES}
          lessons={filteredLessons}
          progress={userProgress}
        />
      )}
    </section>
  );
};
