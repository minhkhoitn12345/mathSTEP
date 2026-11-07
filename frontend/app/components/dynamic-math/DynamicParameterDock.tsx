"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  RotateCcw,
  Camera,
  BookOpen,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useDynamicMathStore, DynamicParam, ModuleId } from "./useDynamicMathStore";

interface DynamicParameterDockProps {
  moduleId: ModuleId;
  onSnapshot?: () => void;
  onRecordObservation?: (summary: string) => void;
  className?: string;
}

export default function DynamicParameterDock({
  moduleId,
  onSnapshot,
  onRecordObservation,
  className = "",
}: DynamicParameterDockProps) {
  const { params, setParamVal, addCustomParam, removeParam, resetModuleParams } =
    useDynamicMathStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newVarName, setNewVarName] = useState("m");
  const [newVarLabel, setNewVarLabel] = useState("Hệ số tự do m");
  const [newVarVal, setNewVarVal] = useState(1);
  const [newVarMin, setNewVarMin] = useState(-10);
  const [newVarMax, setNewVarMax] = useState(10);
  const [newVarStep, setNewVarStep] = useState(0.5);

  const handleAddParam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName.trim()) return;
    addCustomParam({
      name: newVarName.trim(),
      label: newVarLabel.trim() || newVarName.trim(),
      val: newVarVal,
      min: newVarMin,
      max: newVarMax,
      step: newVarStep,
    });
    setIsAdding(false);
    setNewVarName("k");
    setNewVarLabel("Tham số k");
  };

  const paramList: DynamicParam[] = Object.values(params);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3.5 ${className}`}
    >
      {/* Header Dock */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">
            Hộp công cụ Tham số Động (GeoGebra Style)
          </span>
        </div>
        <button
          type="button"
          onClick={() => resetModuleParams(moduleId)}
          title="Khôi phục thông số bài mẫu SGK ban đầu"
          className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-emerald-50"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Bài mẫu SGK</span>
        </button>
      </div>

      {/* Danh sách Sliders tham số */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {paramList.map((p) => (
          <div
            key={p.id}
            className={`p-2.5 rounded-xl border transition-all ${
              p.isCustom
                ? "bg-amber-50/50 border-amber-200"
                : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 truncate" title={p.label}>
                <span className="font-mono text-emerald-700 bg-emerald-100/60 px-1 rounded mr-1">
                  {p.name}
                </span>
                {p.label}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step={p.step}
                  min={p.min}
                  max={p.max}
                  value={p.val}
                  onChange={(e) => setParamVal(p.id, parseFloat(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-right font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                {p.unit && <span className="text-[10px] text-slate-400">{p.unit}</span>}
                {p.isCustom && (
                  <button
                    type="button"
                    onClick={() => removeParam(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Xóa biến số này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Slider mượt mà */}
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={p.val}
              onChange={(e) => setParamVal(p.id, parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
              <span>{p.min}</span>
              <span className="text-emerald-700 font-semibold">{p.val}</span>
              <span>{p.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer: Thêm biến số mới */}
      {isAdding ? (
        <form
          onSubmit={handleAddParam}
          className="p-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between font-bold text-emerald-900">
            <span>Tạo biến số mới:</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block">Ký hiệu biến:</label>
              <input
                type="text"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder="m, k, a..."
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">Giá trị ban đầu:</label>
              <input
                type="number"
                value={newVarVal}
                step={newVarStep}
                onChange={(e) => setNewVarVal(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[9px] text-slate-500 block">Tối thiểu (Min):</label>
              <input
                type="number"
                value={newVarMin}
                onChange={(e) => setNewVarMin(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block">Tối đa (Max):</label>
              <input
                type="number"
                value={newVarMax}
                onChange={(e) => setNewVarMax(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block">Bước (Step):</label>
              <input
                type="number"
                value={newVarStep}
                step="0.05"
                onChange={(e) => setNewVarStep(parseFloat(e.target.value) || 0.1)}
                className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3 h-3" />
              <span>Tạo biến</span>
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Thêm biến số tự do</span>
        </button>
      )}

      {/* Nút hành động Lưu / Chụp ảnh */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        {onSnapshot && (
          <button
            type="button"
            onClick={onSnapshot}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Chụp ảnh thí nghiệm</span>
          </button>
        )}
        {onRecordObservation && (
          <button
            type="button"
            onClick={() => {
              const summary = paramList.map((p) => `${p.name}=${p.val}`).join(", ");
              onRecordObservation(`Ghi nhận thông số: ${summary}`);
            }}
            className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ghi sổ khám phá</span>
          </button>
        )}
      </div>
    </div>
  );
}
