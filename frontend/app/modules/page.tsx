import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Box } from "lucide-react";
import { CORE_7_MODULES } from "../lib/modulesCatalogData";
import { getAllStations } from "../lib/stationCatalogData";

export const metadata = {
  title: "7 Module Thí Nghiệm Toán Học Động GeoGebra & 48 Trạm SGK · MathSTEP",
  description: "Khám phá 7 Module toán học cốt lõi từ Lớp 10 đến Lớp 12 bộ sách Kết nối tri thức.",
};

export default function ModulesCatalogPage() {
  const allStations = getAllStations();

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              M
            </span>
            <span className="font-bold text-sm tracking-tight text-slate-100">MathSTEP Modules</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          7 Module Cốt Lõi · 48 Trạm Thực Nghiệm SGK
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Banner giới thiệu */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Thí Nghiệm Toán Học Động GeoGebra & Desmos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Khám phá 7 Module Toán Học THPT (GDPT 2018)
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Mỗi module là một phòng thí nghiệm động chuyên sâu, cho phép học sinh tự do kéo thanh trượt biến số,
            thao tác đa diện 3D và đồ thị giải tích thời gian thực, đồng hành cùng Trợ lý Socratic AI TES.
          </p>
        </div>

        {/* Grid 7 Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_7_MODULES.map((mod) => {
            const stationCount = allStations.filter((s) => s.moduleId === mod.id).length;
            return (
              <div
                key={mod.id}
                className="group bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col p-5 space-y-4 shadow-xl"
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                        MODULE {mod.moduleNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase">
                        Lớp {mod.grade}
                      </span>
                      {mod.is3D && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          <span>3D</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors pt-1">
                      {mod.title}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {mod.goal}
                </p>

                {/* Features list */}
                <div className="pt-2 border-t border-slate-900 space-y-1.5 flex-1">
                  <div className="text-[11px] font-semibold text-slate-300">Tính năng nổi bật:</div>
                  {mod.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="text-blue-400 font-bold shrink-0">•</span>
                      <span className="line-clamp-2">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {stationCount} Trạm SGK
                  </span>
                  <Link
                    href={`/modules/${mod.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Vào phòng Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
