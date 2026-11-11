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
      className={`bg-slate-900 rounded-lg border border-slate-800 p-3 flex flex-col gap-2.5 text-slate-200 ${className}`}
    >
      {/* Header Dock */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            Hộp tham số động
          </span>
        </div>
        <button
          type="button"
          onClick={() => resetModuleParams(moduleId)}
          title="Khôi phục thông số bài mẫu SGK ban đầu"
          className="text-[10.5px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
        >
          <RotateCcw className="w-3 h-3" />
          <span>SGK chuẩn</span>
        </button>
      </div>

      {/* Danh sách Sliders tham số */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {paramList.map((p) => (
          <div
            key={p.id}
            className={`p-2 rounded-md border text-xs space-y-1.5 ${
              p.isCustom
                ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium text-slate-300 truncate" title={p.label}>
                <span className="font-mono italic font-bold text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded mr-1">
                  {p.name}
                </span>
                <span className="text-slate-300">{p.label}</span>
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step={p.step}
                  min={p.min}
                  max={p.max}
                  value={p.val}
                  onChange={(e) => setParamVal(p.id, parseFloat(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono tabular-nums text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                />
                {p.unit && <span className="text-[10px] text-slate-500 font-mono">{p.unit}</span>}
                {p.isCustom && (
                  <button
                    type="button"
                    onClick={() => removeParam(p.id)}
                    className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                    title="Xóa biến số này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Slider mượt mà chuẩn Desmos */}
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={p.val}
              onChange={(e) => setParamVal(p.id, parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1 bg-slate-800 rounded appearance-none"
            />
            <div className="flex justify-between text-[9.5px] text-slate-500 font-mono tabular-nums">
              <span>{p.min}</span>
              <span className="text-blue-400 font-bold">{p.val}</span>
              <span>{p.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer: Thêm biến số mới */}
      {isAdding ? (
        <form
          onSubmit={handleAddParam}
          className="p-2.5 rounded-md border border-dashed border-slate-700 bg-slate-950/80 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between font-bold text-slate-200">
            <span>Tạo biến số mới:</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block">Ký hiệu biến:</label>
              <input
                type="text"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder="m, k, a..."
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Giá trị ban đầu:</label>
              <input
                type="number"
                value={newVarVal}
                step={newVarStep}
                onChange={(e) => setNewVarVal(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono tabular-nums text-slate-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[9px] text-slate-400 block">Tối thiểu (Min):</label>
              <input
                type="number"
                value={newVarMin}
                onChange={(e) => setNewVarMin(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block">Tối đa (Max):</label>
              <input
                type="number"
                value={newVarMax}
                onChange={(e) => setNewVarMax(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block">Bước (Step):</label>
              <input
                type="number"
                value={newVarStep}
                step="0.05"
                onChange={(e) => setNewVarStep(parseFloat(e.target.value) || 0.1)}
                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 rounded text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs flex items-center gap-1 shadow-sm"
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
          className="w-full py-1.5 px-3 border border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-400 hover:text-blue-300 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Thêm biến số tự do</span>
        </button>
      )}

      {/* Nút hành động Lưu / Chụp ảnh */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        {onSnapshot && (
          <button
            type="button"
            onClick={onSnapshot}
            className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span>Chụp ảnh</span>
          </button>
        )}
        {onRecordObservation && (
          <button
            type="button"
            onClick={() => {
              const summary = paramList.map((p) => `${p.name}=${p.val}`).join(", ");
              onRecordObservation(`Ghi nhận thông số: ${summary}`);
            }}
            className="flex-1 py-1 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ghi sổ</span>
          </button>
        )}
      </div>
    </div>
  );
}
