import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { CORE_7_MODULES } from "../lib/modulesCatalogData";

export const metadata = {
  title: "7 Phòng Thí Nghiệm Toán Học THPT · MathSTEP",
  description: "Khám phá 7 Phòng thí nghiệm toán học cốt lõi từ Lớp 10 đến Lớp 12 chuẩn SGK mới GDPT 2018.",
};

export default function ModulesCatalogPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>Chuẩn SGK mới (GDPT 2018)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            7 Phòng Thí Nghiệm Toán Học
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Trực quan hóa các khái niệm trừu tượng. Thay đổi tham số để quan sát hình vẽ và đồ thị biến thiên theo thời gian thực.
          </p>
        </div>

        {/* Grid 7 Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_7_MODULES.map((mod) => (
            <article
              key={mod.id}
              className="group bg-slate-950 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div>
                {/* Header card: Tag khối lớp & không gian bên trái + Mã trạm nhỏ gọn bên phải */}
                <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-400 bg-blue-950/70 border border-blue-900/50 px-2 py-0.5 rounded text-[11px]">
                    {mod.tag}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] font-medium">
                    {mod.stationCode}
                  </span>
                </div>

                {/* Card Content: Tên bài học & Mô tả hành động */}
                <div className="p-5 space-y-2">
                  <h2 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                    <Link href={`/modules/${mod.id}?mode=dynamic`}>
                      {mod.title}
                    </Link>
                  </h2>

                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Action button */}
              <div className="p-5 pt-0">
                <Link
                  href={`/modules/${mod.id}?mode=dynamic`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <span>Vào phòng thí nghiệm</span>
                  <span className="text-sm font-semibold transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
