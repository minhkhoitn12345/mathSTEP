import React from "react";
import { Compass, Box, Activity, Play, ArrowRight } from "lucide-react";
import { CORE_3_MODULES, CoreModuleConfig, LessonUnit } from "@/app/types/curriculum";

export interface ModuleData {
  id: string;
  number?: number;
  title: string;
  subtitle?: string;
  description: string;
  badgeLabel?: string;
  badgeBg?: string;
  badgeText?: string;
}

interface ModuleCardsProps {
  onSelectModule: (modId: string) => void;
  onSelectLesson?: (moduleId: string, lessonId: string) => void;
}

export const ModuleCards: React.FC<ModuleCardsProps> = ({
  onSelectModule,
  onSelectLesson,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Header bar: Minimalist & Clean */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
              3 CHUYÊN ĐỀ MÔ PHỎNG
            </span>
            <span className="text-xs text-slate-500 font-medium">Toán THPT · Chuẩn GDPT 2018</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Chọn bài học để vào thẳng mô phỏng
          </h2>
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Mỗi bài học tương ứng với <strong>1 mô phỏng chuyên biệt</strong>
        </div>
      </div>

      {/* 3 Main Module Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {CORE_3_MODULES.map((mod: CoreModuleConfig) => {
          const isBlue = mod.id === "linear_programming";
          const isEmerald = mod.id === "spatial_geometry";

          const accentColor = isBlue
            ? "border-blue-200 hover:border-blue-400"
            : isEmerald
            ? "border-emerald-200 hover:border-emerald-400"
            : "border-purple-200 hover:border-purple-400";

          const headerGradient = isBlue
            ? "from-blue-600 to-indigo-600"
            : isEmerald
            ? "from-emerald-600 to-teal-600"
            : "from-purple-600 to-indigo-600";

          const badgeBg = isBlue
            ? "bg-blue-100 text-blue-800"
            : isEmerald
            ? "bg-emerald-100 text-emerald-800"
            : "bg-purple-100 text-purple-800";

          const lessonHoverBg = isBlue
            ? "hover:bg-blue-50/80 hover:border-blue-300 group-hover:text-blue-700"
            : isEmerald
            ? "hover:bg-emerald-50/80 hover:border-emerald-300 group-hover:text-emerald-700"
            : "hover:bg-purple-50/80 hover:border-purple-300 group-hover:text-purple-700";

          const playBtnBg = isBlue
            ? "bg-blue-600 text-white group-hover:bg-blue-700"
            : isEmerald
            ? "bg-emerald-600 text-white group-hover:bg-emerald-700"
            : "bg-purple-600 text-white group-hover:bg-purple-700";

          return (
            <div
              key={mod.id}
              className={`rounded-3xl p-5 border bg-white shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${accentColor}`}
            >
              {/* Top: Module Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${badgeBg}`}>
                    {mod.code} · LỚP {mod.grade}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {mod.lessons.length} Bài mô phỏng
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${headerGradient} text-white flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {isBlue ? (
                      <Compass className="w-5 h-5" />
                    ) : isEmerald ? (
                      <Box className="w-5 h-5" />
                    ) : (
                      <Activity className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {mod.shortTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                {/* List of 5 Clickable Lessons: Nhấn vào từng bài -> Mở đúng mô phỏng đó */}
                <div className="space-y-2 mt-4 mb-4">
                  {mod.lessons.map((lesson: LessonUnit) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        if (onSelectLesson) {
                          onSelectLesson(mod.id, lesson.id);
                        } else {
                          onSelectModule(mod.id);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 transition-all flex items-center justify-between gap-2.5 group cursor-pointer active:scale-[0.99] shadow-2xs ${lessonHoverBg}`}
                      title={`Mở mô phỏng cho ${lesson.code}: ${lesson.title}`}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white border border-slate-200 text-slate-700 shrink-0 shadow-2xs group-hover:border-transparent">
                          {lesson.code}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-inherit">
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {lesson.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Play Button Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-all ${playBtnBg}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action: Mở toàn bộ Lab */}
              <button
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem toàn bộ phòng thí nghiệm {mod.code}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
