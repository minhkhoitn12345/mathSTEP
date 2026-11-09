"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, Box, Check, CheckCircle2, Clock, Compass } from "lucide-react";
import type { CoreModuleConfig } from "@/app/types/curriculum";
import type { LessonStatus, UserLearningProgress } from "@/app/types/learningPath";
import { getLessonStatus } from "@/app/lib/learningProgressStorage";
import { MathFormattedText } from "../KatexMath";

interface LessonWithProgress {
  id: string;
  moduleId: string;
  code: string;
  title: string;
  subtitle: string;
  difficulty: string;
  grade: number;
  parentModule: CoreModuleConfig;
  status: LessonStatus;
  score?: number;
}

interface LessonPathTracksProps {
  modules: CoreModuleConfig[];
  lessons: LessonWithProgress[];
  progress: UserLearningProgress;
}

const moduleTheme = {
  linear_programming: {
    icon: Compass,
    iconWrap: "bg-blue-600 text-white shadow-blue-200",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    progress: "bg-blue-500",
    node: "border-blue-300 text-blue-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
    activeNode: "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100",
    completedNode: "bg-blue-600 border-blue-600 text-white",
    connector: "bg-blue-100",
    action: "text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
    cardHover: "hover:border-blue-200",
  },
  spatial_geometry: {
    icon: Box,
    iconWrap: "bg-emerald-600 text-white shadow-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    progress: "bg-emerald-500",
    node: "border-emerald-300 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    activeNode: "bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100",
    completedNode: "bg-emerald-600 border-emerald-600 text-white",
    connector: "bg-emerald-100",
    action: "text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
    cardHover: "hover:border-emerald-200",
  },
  trigonometry: {
    icon: Activity,
    iconWrap: "bg-purple-600 text-white shadow-purple-200",
    badge: "bg-purple-50 text-purple-700 border-purple-100",
    progress: "bg-purple-500",
    node: "border-purple-300 text-purple-700 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
    activeNode: "bg-purple-600 border-purple-600 text-white ring-4 ring-purple-100",
    completedNode: "bg-purple-600 border-purple-600 text-white",
    connector: "bg-purple-100",
    action: "text-purple-700 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white",
    cardHover: "hover:border-purple-200",
  },
} as const;

function statusLabel(status: LessonStatus) {
  if (status === "completed") return "Đã hoàn thành";
  if (status === "in_progress") return "Đang học";
  return "Bắt đầu học";
}

export default function LessonPathTracks({
  modules,
  lessons,
  progress,
}: LessonPathTracksProps) {
  const visibleModules = modules
    .map((module) => ({
      module,
      lessons: lessons.filter((lesson) => lesson.moduleId === module.id),
    }))
    .filter((item) => item.lessons.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {visibleModules.map(({ module, lessons: moduleLessons }) => {
        const theme = moduleTheme[module.id];
        const Icon = theme.icon;
        const completed = module.lessons.filter(
          (lesson) => getLessonStatus(lesson.id, progress) === "completed"
        ).length;
        const percent = Math.round((completed / module.lessons.length) * 100);

        return (
          <section
            key={module.id}
            aria-labelledby={`${module.id}-heading`}
            className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-colors ${theme.cardHover}`}
          >
            <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md ${theme.iconWrap}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${theme.badge}`}>
                      {module.code} · TOÁN {module.grade}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {moduleLessons.length} {moduleLessons.length === 1 ? "bài" : "bài học"}
                    </span>
                  </div>
                  <h2 id={`${module.id}-heading`} className="text-base font-black leading-snug text-slate-900 sm:text-lg">
                    {module.shortTitle}
                  </h2>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:line-clamp-1">
                    {module.subtitle}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-44 sm:shrink-0">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Tiến độ chuyên đề</span>
                  <span>{completed}/{module.lessons.length}</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`Tiến độ ${module.shortTitle}`}
                  aria-valuemin={0}
                  aria-valuemax={module.lessons.length}
                  aria-valuenow={completed}
                >
                  <div className={`h-full rounded-full transition-all duration-500 ${theme.progress}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            </header>

            <ol className="px-4 py-5 sm:px-7 sm:py-6">
              {moduleLessons.map((lesson, index) => {
                const status = getLessonStatus(lesson.id, progress);
                const isLast = index === moduleLessons.length - 1;
                const nodeClass = status === "completed"
                  ? theme.completedNode
                  : status === "in_progress"
                  ? theme.activeNode
                  : theme.node;
                const StatusIcon = status === "completed" ? Check : status === "in_progress" ? Clock : BookOpen;

                return (
                  <li key={lesson.id} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 sm:grid-cols-[52px_minmax(0,1fr)] sm:gap-4">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[19px] top-11 bottom-0 w-1 rounded-full sm:left-[23px] sm:top-12 ${theme.connector}`}
                      />
                    )}

                    <div className="relative z-10 flex justify-center pt-1">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white transition-all sm:h-11 sm:w-11 ${nodeClass} ${status === "in_progress" ? "bg-white" : ""}`}>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${status === "in_progress" ? theme.activeNode : status === "completed" ? theme.completedNode : ""}`}>
                          {status === "in_progress" ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                          ) : (
                            <StatusIcon className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                      </span>
                    </div>

                    <Link
                      href={`/learn/${module.id}/${lesson.id}`}
                      className={`group relative mb-3.5 flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:mb-4 sm:p-4 ${status === "in_progress" ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50 shadow-sm" : "border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm"}`}
                      aria-label={`${statusLabel(status)}: ${lesson.title}`}
                    >
                      <div className="relative z-10 pointer-events-none min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{lesson.code}</span>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="text-[10px] font-semibold text-slate-500">{lesson.difficulty}</span>
                          <span className={`ml-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${status === "completed" ? "bg-emerald-100 text-emerald-800" : status === "in_progress" ? "bg-amber-100 text-amber-800" : "bg-white text-slate-500"}`}>
                            {statusLabel(status)}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 sm:text-[15px]">
                          <MathFormattedText text={lesson.title} />
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          <MathFormattedText text={lesson.subtitle} />
                        </p>
                      </div>

                      <div className="relative z-10 flex shrink-0 items-center gap-2">
                        <span className={`hidden items-center gap-1 rounded-xl px-3 py-2 text-xs font-extrabold transition-colors sm:inline-flex ${theme.action}`}>
                          {status === "completed" ? "Ôn lại" : status === "in_progress" ? "Học tiếp" : "Vào học"}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 sm:hidden" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
