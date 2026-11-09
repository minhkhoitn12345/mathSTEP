import React from "react";
import { Compass, Box, Activity, ArrowRight, CheckCircle } from "lucide-react";
import { CORE_3_MODULES, CoreModuleConfig } from "@/app/types/curriculum";

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
}

export const ModuleCards: React.FC<ModuleCardsProps> = ({ onSelectModule }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Section Title */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
              3 CHUYÊN ĐỀ NGHIÊN CỨU TRỌNG TÂM
            </span>
            <span className="text-xs text-slate-500 font-medium">Chuẩn GDPT 2018</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            3 Phòng Thí Nghiệm Toán Học Tương Tác
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Mỗi chuyên đề được thiết kế theo quy trình nhiều bước sư phạm từ cơ bản đến vận dụng, tích hợp mô phỏng đồ họa 2D/3D và Trợ lý Socratic AI đồng hành.
          </p>
        </div>
      </div>

      {/* 3 Main Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CORE_3_MODULES.map((mod: CoreModuleConfig, idx: number) => {
          const isBlue = mod.id === "linear_programming";
          const isEmerald = mod.id === "spatial_geometry";
          const isPurple = mod.id === "trigonometry";

          return (
            <div
              key={mod.id}
              className={`rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden bg-white ${
                isBlue
                  ? "border-blue-200 hover:border-blue-400"
                  : isEmerald
                  ? "border-emerald-200 hover:border-emerald-400"
                  : "border-purple-200 hover:border-purple-400"
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 ${
                  isBlue ? "bg-blue-600" : isEmerald ? "bg-emerald-600" : "bg-purple-600"
                }`}
              />

              <div>
                {/* Header Badge & Code */}
                <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                      isBlue
                        ? "bg-blue-100 text-blue-800"
                        : isEmerald
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {mod.code} · LỚP {mod.grade}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{mod.lessons.length} Bài học</span>
                  </div>
                </div>

                {/* Module Icon & Mascot Accent */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                      isBlue
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/25"
                        : isEmerald
                        ? "bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/25"
                        : "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/25"
                    }`}
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
                    <h3 className="font-black text-lg text-slate-900 leading-snug">
                      {mod.shortTitle}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Mã lỗi: {mod.standardCodes.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {mod.description}
                </p>

                {/* Progressive Lesson Steps Summary */}
                <div className="space-y-1.5 mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-700 block mb-1">
                    Lộ trình 5 bài học quy trình:
                  </span>
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-1.5 text-slate-600 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 shrink-0">{lesson.code}:</span>
                      <span className="truncate">{lesson.title.split(":")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enter Lab Button */}
              <button
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                  isBlue
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
                    : isEmerald
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                    : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25"
                }`}
              >
                <span>Vào phòng thí nghiệm {mod.code}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
