"use client";

import React, { useState, useMemo } from "react";
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
      className="fixed inset-0 z-50 bg-[#08232999] backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border border-[#d9e4e2] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <header className="px-5 py-4 border-b border-[#d9e4e2] bg-[#f8faf9] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 id="catalog-modal-title" className="font-bold text-base text-[#152f35]">
                Danh mục 48 trạm học Toán THPT (GDPT 2018)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#e2f1ec] text-[#087e7c] font-bold text-[11px]">
                {filteredStations.length} / 48 trạm
              </span>
            </div>
            <p className="text-[11px] text-[#63777c] mt-0.5">
              Hệ thống mô phỏng 2D/3D & AR tương tác theo tiến trình 7 bước sư phạm
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg transition-colors"
            aria-label="Đóng danh mục"
          >
            ✕
          </button>
        </header>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border-b border-[#e2e8e7] space-y-3 shrink-0">
          {/* Input Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trạm theo mã (10.03, 11.06...), tên bài học, nguồn SGK, từ khóa (không dấu)..."
              className="w-full pl-9 pr-4 py-2 border border-[#d9e4e2] rounded-xl text-xs focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* Grade filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-500 mr-1">Khối lớp:</span>
              <button
                onClick={() => setGradeFilter(null)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  gradeFilter === null
                    ? "bg-[#087e7c] text-white border-[#087e7c]"
                    : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-[#e6eeec]"
                }`}
              >
                Tất cả (48)
              </button>
              {[10, 11, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    gradeFilter === g
                      ? "bg-[#087e7c] text-white border-[#087e7c]"
                      : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-[#e6eeec]"
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>

            {/* Dimension filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-500 mr-1">Không gian:</span>
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
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    dimensionFilter === dim.id
                      ? "bg-[#087e7c] text-white border-[#087e7c]"
                      : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-[#e6eeec]"
                  }`}
                >
                  {dim.label}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-500 mr-1">Mức ưu tiên:</span>
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
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    priorityFilter === p.id
                      ? "bg-[#087e7c] text-white border-[#087e7c]"
                      : "bg-[#f3f6f5] text-gray-700 border-[#d9e4e2] hover:bg-[#e6eeec]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8faf9]">
          {filteredStations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <span className="text-4xl mb-2">🔍</span>
              <p className="font-semibold text-gray-600 text-sm">
                Không tìm thấy trạm học nào phù hợp với bộ lọc.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Hãy thử đổi từ khóa tìm kiếm hoặc bỏ chọn các tiêu chí lọc.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setGradeFilter(null);
                  setDimensionFilter("all");
                  setPriorityFilter("all");
                }}
                className="mt-3 px-3 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold"
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
                        ? "bg-[#eff8f6] border-[#087e7c] shadow-md ring-1 ring-[#087e7c]"
                        : "bg-white border-[#d9e4e2] hover:border-[#087e7c] hover:shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Card Header badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#f3f6f5] text-[#152f35] border border-[#d9e4e2]">
                            {station.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              station.grade === 10
                                ? "bg-blue-100 text-blue-700"
                                : station.grade === 11
                                ? "bg-amber-100 text-amber-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            Lớp {station.grade}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                              station.priority === "A"
                                ? "bg-red-50 text-red-600 border-red-200 font-bold"
                                : station.priority === "B"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {station.priority === "A" ? "★ Ưu tiên A" : `Mức ${station.priority}`}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                            {station.is3D ? "🎲 3D" : "📐 2D"}
                          </span>
                        </div>
                      </div>

                      {/* Card Title & Source */}
                      <h3 className="font-bold text-xs text-[#152f35] leading-snug line-clamp-1">
                        {station.title}
                      </h3>
                      <div className="text-[10px] text-gray-400 font-mono mb-2">
                        {station.source}
                      </div>

                      {/* Simulation description */}
                      <div className="p-2 bg-[#f3f6f5] rounded-lg border border-[#e8efed] mb-2 space-y-1">
                        <div className="text-[10px] text-[#087e7c] font-bold">Mô phỏng:</div>
                        <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-2">
                          {station.simulation}
                        </p>
                      </div>

                      {/* Educational Goal */}
                      <div className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-2">
                        <strong className="text-gray-800">Mục tiêu:</strong> {station.goal}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        onSelectStation(station);
                        onClose();
                      }}
                      className={`w-full py-1.5 mt-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                        isSelected
                          ? "bg-[#087e7c] text-white hover:bg-[#066563]"
                          : "bg-[#e2f1ec] text-[#087e7c] hover:bg-[#087e7c] hover:text-white"
                      }`}
                    >
                      <span>{isSelected ? "Đang học trạm này" : "Khám phá trạm ↗"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="px-5 py-3 border-t border-[#d9e4e2] bg-[#f8faf9] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500">
            Dữ liệu xây dựng đồng bộ theo chương trình Giáo dục phổ thông 2018 (Toán 10, 11, 12).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#d9e4e2] text-gray-700 font-bold hover:bg-gray-100"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
