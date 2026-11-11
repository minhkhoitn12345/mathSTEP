"use client";

import React, { useState, useMemo } from "react";
import { Layers, Search } from "lucide-react";
import {
  STATION_CATALOG,
  StationItem,
  filterStations,
} from "../lib/stationCatalogData";

interface StationCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (station: StationItem) => void;
  currentStationId?: string;
}

export default function StationCatalogModal({
  isOpen,
  onClose,
  onSelectStation,
  currentStationId,
}: StationCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [dimensionFilter, setDimensionFilter] = useState<"all" | "2d" | "3d">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "A" | "B" | "C">("all");

  const filteredStations = useMemo(() => {
    return filterStations(
      STATION_CATALOG,
      searchQuery,
      gradeFilter,
      dimensionFilter,
      priorityFilter
    );
  }, [searchQuery, gradeFilter, dimensionFilter, priorityFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-xs text-slate-200">
        {/* Modal Header */}
        <header className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h2 id="catalog-modal-title" className="font-bold text-base text-slate-100">
                Danh mục 48 trạm học Toán THPT (GDPT 2018)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[11px]">
                {filteredStations.length} / 48 trạm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hệ thống mô phỏng 2D/3D & AR tương tác theo tiến trình 7 bước sư phạm
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 font-bold text-base transition-colors cursor-pointer"
            aria-label="Đóng danh mục"
          >
            ✕
          </button>
        </header>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 shrink-0">
          {/* Input Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400"><Search className="w-4 h-4" /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trạm theo mã (10.03, 11.06...), tên bài học, nguồn SGK, từ khóa (không dấu)..."
              className="w-full pl-9 pr-4 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-950/80 text-slate-100 placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* Grade filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 mr-1">Khối lớp:</span>
              <button
                onClick={() => setGradeFilter(null)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                  gradeFilter === null
                    ? "bg-blue-600 text-white border-blue-500 font-semibold"
                    : "bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                Tất cả (48)
              </button>
              {[10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    gradeFilter === g
                      ? "bg-blue-600 text-white border-blue-500 font-semibold"
                      : "bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>

            {/* Dimension filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 mr-1">Không gian:</span>
              {(
                [
                  { id: "all", label: "Tất cả" },
                  { id: "2d", label: "2D phẳng" },
                  { id: "3d", label: "3D không gian" },
                ] as const
              ).map((dim) => (
                <button
                  key={dim.id}
                  onClick={() => setDimensionFilter(dim.id)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    dimensionFilter === dim.id
                      ? "bg-blue-600 text-white border-blue-500 font-semibold"
                      : "bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {dim.label}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 mr-1">Mức ưu tiên:</span>
              {(
                [
                  { id: "all", label: "Tất cả" },
                  { id: "A", label: "★ Ưu tiên A" },
                  { id: "B", label: "Ưu tiên B" },
                  { id: "C", label: "Ưu tiên C" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriorityFilter(p.id)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    priorityFilter === p.id
                      ? "bg-blue-600 text-white border-blue-500 font-semibold"
                      : "bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/60">
          {filteredStations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Search className="w-8 h-8 mb-2 text-slate-600" />
              <p className="font-semibold text-slate-300 text-sm">
                Không tìm thấy trạm học nào phù hợp với bộ lọc.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hãy thử đổi từ khóa tìm kiếm hoặc bỏ chọn các tiêu chí lọc.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setGradeFilter(null);
                  setDimensionFilter("all");
                  setPriorityFilter("all");
                }}
                className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStations.map((station) => {
                const isSelected = currentStationId === station.id;
                return (
                  <div
                    key={station.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? "bg-blue-950/20 border-blue-500 shadow-md ring-1 ring-blue-500"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      {/* Card Header badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {station.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              station.grade === 10
                                ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                                : station.grade === 11
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                                : "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                            }`}
                          >
                            Lớp {station.grade}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                              station.priority === "A"
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold"
                                : station.priority === "B"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {station.priority === "A" ? "★ Ưu tiên A" : `Mức ${station.priority}`}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {station.is3D ? "3D" : "2D"}
                          </span>
                        </div>
                      </div>

                      {/* Card Title & Source */}
                      <h3 className="font-bold text-xs text-slate-100 leading-snug line-clamp-1">
                        {station.title}
                      </h3>
                      <div className="text-[10px] text-slate-500 font-mono mb-2">
                        {station.source}
                      </div>

                      {/* Simulation description */}
                      <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 mb-2 space-y-1">
                        <div className="text-[10px] text-blue-400 font-semibold">Mô phỏng:</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                          {station.simulation}
                        </p>
                      </div>

                      {/* Educational Goal */}
                      <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                        <strong className="text-slate-300 font-medium">Mục tiêu:</strong> {station.goal}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      disabled={!station.isValidated}
                      onClick={() => {
                        if (!station.isValidated) {
                          alert(
                            "Trạm này đang trong giai đoạn chuẩn hóa dữ liệu thực nghiệm sư phạm theo đề cương dài hạn. Nhóm nghiên cứu chỉ mở công khai các trạm đã được kiểm chứng 100%!"
                          );
                          return;
                        }
                        onSelectStation(station);
                        onClose();
                      }}
                      className={`w-full py-1.5 mt-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        !station.isValidated
                          ? "bg-slate-950/40 text-slate-600 cursor-not-allowed border border-slate-800"
                          : isSelected
                          ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xs"
                          : "bg-slate-800 text-blue-300 hover:bg-slate-750 border border-slate-700"
                      }`}
                    >
                      <span>
                        {!station.isValidated
                          ? "Đang chuẩn hóa (Khóa)"
                          : isSelected
                          ? "Đang học trạm này"
                          : "Khám phá trạm ↗"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Dữ liệu xây dựng đồng bộ theo chương trình Giáo dục phổ thông 2018 (Toán 10, 11, 12).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-750 cursor-pointer"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
