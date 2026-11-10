"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  BookOpen,
  Activity,
  X,
} from "lucide-react";
import Geometry3DViewer from "./Geometry3DViewer";
import FreeGeometrySandbox from "./FreeGeometrySandbox";
import NaturalLanguageGeometryPanel from "./NaturalLanguageGeometryPanel";
import {
  GEOMETRY_PRESET_TEMPLATES,
  resolveGeometrySolid,
  ResolvedGeometryScene,
} from "../lib/geometrySolver";
import { ParsedGeometrySolid } from "../lib/geometryParserPrompt";

import { useDynamicMathStore, ModuleId } from "./dynamic-math/useDynamicMathStore";
import DynamicParameterDock from "./dynamic-math/DynamicParameterDock";
import DynamicLinearProgrammingLab from "./dynamic-math/DynamicLinearProgrammingLab";
import DynamicSpatialGeometryLab from "./dynamic-math/DynamicSpatialGeometryLab";
import DynamicTrigonometryLab from "./dynamic-math/DynamicTrigonometryLab";
import DynamicFunctionsLab from "./dynamic-math/DynamicFunctionsLab";
import DynamicCalculusLab from "./dynamic-math/DynamicCalculusLab";
import DynamicProbabilityLab from "./dynamic-math/DynamicProbabilityLab";
import DynamicConicsLab from "./dynamic-math/DynamicConicsLab";

interface MathGraphVisualizerProps {
  moduleId: ModuleId;
  onClose: () => void;
}

export default function MathGraphVisualizer({ moduleId, onClose }: MathGraphVisualizerProps) {
  const [activeTab, setActiveTab] = useState<ModuleId>(moduleId);
  const { setActiveModule } = useDynamicMathStore();

  // Sync active module with store when tab switches
  const handleTabChange = (mod: ModuleId) => {
    setActiveTab(mod);
    setActiveModule(mod);
  };

  useEffect(() => {
    setActiveModule(moduleId);
  }, [moduleId, setActiveModule]);

  // AI 3D Creative Sub-tab state (for Module 2 & Module 7)
  const [geoSubTab, setGeoSubTab] = useState<"standard" | "ai_parser" | "sandbox">("standard");
  const [parsedAiScene, setParsedAiScene] = useState<ResolvedGeometryScene>(() =>
    resolveGeometrySolid(GEOMETRY_PRESET_TEMPLATES[0].solid)
  );
  const [, setRawAiSolid] = useState<ParsedGeometrySolid>(
    GEOMETRY_PRESET_TEMPLATES[0].solid
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#fcfdfa] rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0a523d] to-[#0d7355] text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-white/10 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-300" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>Phòng mô phỏng Toán học tương tác</span>
                <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  SGK Kết nối tri thức
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100/80">
                Khảo sát tương tác thời gian thực (60fps) · Tự do thêm/bớt biến số & kéo thanh trượt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (7 Module SGK) */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-4 text-xs font-bold overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => handleTabChange("linear_programming")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "linear_programming"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M1: Tối ưu tuyến tính</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("spatial_geometry")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "spatial_geometry"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M2: Hình không gian</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("trigonometry")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "trigonometry"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M3: Lượng giác & Sóng</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("functions")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "functions"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M4: Hàm số & BBT 2 chiều</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("calculus")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "calculus"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M5: Giải tích & Khối xoay 3D</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("probability")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "probability"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M6: Xác suất & Bayes</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("conics_and_solids")}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "conics_and_solids"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>M7: Conic & Khai triển 3D</span>
          </button>
        </div>

        {/* Nội dung chính Lab tương tác */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: TUYẾN TÍNH (M1) */}
          {activeTab === "linear_programming" && <DynamicLinearProgrammingLab />}

          {/* TAB 2: HÌNH HỌC KHÔNG GIAN (M2) */}
          {activeTab === "spatial_geometry" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setGeoSubTab("standard")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      geoSubTab === "standard"
                        ? "bg-white text-emerald-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Mô hình Đa diện SGK (Dựng hình & Thiết diện)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoSubTab("ai_parser")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      geoSubTab === "ai_parser"
                        ? "bg-gradient-to-r from-[#087e7c] to-[#0f9488] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Box className="w-3.5 h-3.5 text-blue-200" />
                    <span>Dựng từ mô tả</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoSubTab("sandbox")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${geoSubTab === "sandbox" ? "bg-gradient-to-r from-[#087e7c] to-[#0f9488] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Tự chấm điểm, dựng hình</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline px-2 font-medium">
                  geometry3d &bull; Toán 11 KNTT
                </span>
              </div>

              {geoSubTab === "standard" ? (
                <DynamicSpatialGeometryLab />
              ) : geoSubTab === "sandbox" ? (
                <FreeGeometrySandbox />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-5 order-2 lg:order-1">
                    <NaturalLanguageGeometryPanel
                      onModelGenerated={(scene, raw) => {
                        setParsedAiScene(scene);
                        setRawAiSolid(raw);
                      }}
                    />
                  </div>
                  <div className="lg:col-span-7 order-1 lg:order-2 h-[520px]">
                    <Geometry3DViewer scene={parsedAiScene} className="h-full" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LƯỢNG GIÁC (M3) */}
          {activeTab === "trigonometry" && <DynamicTrigonometryLab />}

          {/* TAB 4: HÀM SỐ & BBT (M4) */}
          {activeTab === "functions" && <DynamicFunctionsLab />}

          {/* TAB 5: GIẢI TÍCH & KHỐI TRÒN XOAY (M5) */}
          {activeTab === "calculus" && <DynamicCalculusLab />}

          {/* TAB 6: XÁC SUẤT & BAYES (M6) */}
          {activeTab === "probability" && <DynamicProbabilityLab />}

          {/* TAB 7: CONIC & KHAI TRIỂN 3D (M7) */}
          {activeTab === "conics_and_solids" && <DynamicConicsLab />}

          {/* Hộp công cụ quản lý Sliders tham số chung (Dynamic Parameter Dock) */}
          <div className="pt-2 border-t border-slate-200">
            <DynamicParameterDock moduleId={activeTab} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-between items-center text-xs text-slate-500">
          <span>Hệ thống thí nghiệm MathSTEP Dynamic Engine &bull; Thiết kế theo chuẩn GDPT 2018</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0a523d] hover:bg-[#0d7355] text-white rounded-xl font-bold transition-colors shadow-xs"
          >
            Quay lại phòng học
          </button>
        </div>
      </div>
    </div>
  );
}
