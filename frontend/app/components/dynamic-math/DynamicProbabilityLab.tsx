"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  GitFork,
  BarChart3,
} from "lucide-react";
import { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";

type ProbSubTab = "urnTree" | "largeNumbers";

export default function DynamicProbabilityLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [activeTab, setActiveTab] = useState<ProbSubTab>("urnTree");

  // Marbles parameters from store
  const b1Red = Math.round(params.box1Red?.val ?? 4);
  const b1Blue = Math.round(params.box1Blue?.val ?? 6);
  const b2Red = Math.round(params.box2Red?.val ?? 5);
  const b2Blue = Math.round(params.box2Blue?.val ?? 3);

  // Dice simulation state
  const [diceCounts, setDiceCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]); // faces 1 to 6
  const [totalRolls, setTotalRolls] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Tree Diagram calculations:
  // Step 1: Pick Box 1 (prob = 0.5) or Box 2 (prob = 0.5)
  // Step 2: Draw Red or Blue
  const totalB1 = b1Red + b1Blue;
  const totalB2 = b2Red + b2Blue;

  const pB1 = 0.5;
  const pB2 = 0.5;

  const pRedGivenB1 = totalB1 > 0 ? b1Red / totalB1 : 0;
  const pBlueGivenB1 = totalB1 > 0 ? b1Blue / totalB1 : 0;

  const pRedGivenB2 = totalB2 > 0 ? b2Red / totalB2 : 0;
  const pBlueGivenB2 = totalB2 > 0 ? b2Blue / totalB2 : 0;

  // Law of Total Probability: P(Red) = P(B1)*P(Red|B1) + P(B2)*P(Red|B2)
  const pTotalRed = pB1 * pRedGivenB1 + pB2 * pRedGivenB2;
  const pTotalBlue = pB1 * pBlueGivenB1 + pB2 * pBlueGivenB2;

  // Bayes' Formula: P(B1 | Red) = (P(B1)*P(Red|B1)) / P(Red)
  const pBayesB1GivenRed = pTotalRed > 0 ? (pB1 * pRedGivenB1) / pTotalRed : 0;

  // Roll Dice simulation runner
  const handleRollDice = (times: number) => {
    setIsRolling(true);
    setTimeout(() => {
      const counts = [...diceCounts];
      for (let i = 0; i < times; i++) {
        const face = Math.floor(Math.random() * 6); // 0 to 5
        counts[face]++;
      }
      setDiceCounts(counts);
      setTotalRolls((prev) => prev + times);
      setIsRolling(false);
    }, 150);
  };

  const handleResetDice = () => {
    setDiceCounts([0, 0, 0, 0, 0, 0]);
    setTotalRolls(0);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Sơ đồ hình cây hoặc Biểu đồ Luật số lớn */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Header Tab Switcher */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {activeTab === "urnTree"
                ? "Sơ đồ cây xác suất toàn phần & Công thức Bayes"
                : `Thực nghiệm Luật số lớn (Đã tung: ${totalRolls} lần)`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              KNTT Bài 29-30
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("urnTree")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "urnTree" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sơ đồ cây Bayes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("largeNumbers")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "largeNumbers" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Luật số lớn</span>
            </button>
          </div>
        </div>

        {/* 1. SƠ ĐỒ CÂY XÁC SUẤT TOÀN PHẦN (SVG Tree Diagram) */}
        {activeTab === "urnTree" ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] p-2 flex justify-center">
            <svg viewBox="0 0 520 340" className="w-full h-auto select-none">
              {/* Gốc xuất phát */}
              <circle cx="50" cy="170" r="14" fill="#0f766e" />
              <text x="50" y="174" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                Bắt đầu
              </text>

              {/* Nhánh 1: Chọn Hộp 1 */}
              <line x1="64" y1="160" x2="190" y2="85" stroke="#0f766e" strokeWidth="2.2" />
              <rect x="110" y="105" width="46" height="18" rx="4" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1" />
              <text x="133" y="118" fontSize="10" fill="#0f766e" textAnchor="middle" fontWeight="bold">
                P = 0.5
              </text>

              <rect x="190" y="65" width="85" height="40" rx="8" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />
              <text x="232" y="82" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="bold">
                Hộp 1
              </text>
              <text x="232" y="96" fontSize="9" fill="#64748b" textAnchor="middle">
                ({b1Red}Đ, {b1Blue}X)
              </text>

              {/* Nhánh 2: Chọn Hộp 2 */}
              <line x1="64" y1="180" x2="190" y2="255" stroke="#0f766e" strokeWidth="2.2" />
              <rect x="110" y="215" width="46" height="18" rx="4" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1" />
              <text x="133" y="228" fontSize="10" fill="#0f766e" textAnchor="middle" fontWeight="bold">
                P = 0.5
              </text>

              <rect x="190" y="235" width="85" height="40" rx="8" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />
              <text x="232" y="252" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="bold">
                Hộp 2
              </text>
              <text x="232" y="266" fontSize="9" fill="#64748b" textAnchor="middle">
                ({b2Red}Đ, {b2Blue}X)
              </text>

              {/* Nhánh con từ Hộp 1 -> Bi Đỏ */}
              <line x1="275" y1="75" x2="390" y2="45" stroke="#dc2626" strokeWidth="2" />
              <rect x="315" y="42" width="55" height="18" rx="4" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
              <text x="342" y="55" fontSize="10" fill="#b91c1c" textAnchor="middle" fontWeight="bold">
                {b1Red}/{totalB1}
              </text>
              <circle cx="410" cy="45" r="14" fill="#ef4444" />
              <text x="410" y="49" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                Bi Đỏ
              </text>
              <text x="432" y="49" fontSize="10" fill="#b91c1c" fontWeight="bold">
                P = {(pB1 * pRedGivenB1).toFixed(3)}
              </text>

              {/* Nhánh con từ Hộp 1 -> Bi Xanh */}
              <line x1="275" y1="95" x2="390" y2="125" stroke="#2563eb" strokeWidth="2" />
              <rect x="315" y="112" width="55" height="18" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
              <text x="342" y="125" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="bold">
                {b1Blue}/{totalB1}
              </text>
              <circle cx="410" cy="125" r="14" fill="#3b82f6" />
              <text x="410" y="129" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                Bi Xanh
              </text>
              <text x="432" y="129" fontSize="10" fill="#1e40af" fontWeight="bold">
                P = {(pB1 * pBlueGivenB1).toFixed(3)}
              </text>

              {/* Nhánh con từ Hộp 2 -> Bi Đỏ */}
              <line x1="275" y1="245" x2="390" y2="215" stroke="#dc2626" strokeWidth="2" />
              <rect x="315" y="212" width="55" height="18" rx="4" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
              <text x="342" y="225" fontSize="10" fill="#b91c1c" textAnchor="middle" fontWeight="bold">
                {b2Red}/{totalB2}
              </text>
              <circle cx="410" cy="215" r="14" fill="#ef4444" />
              <text x="410" y="219" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                Bi Đỏ
              </text>
              <text x="432" y="219" fontSize="10" fill="#b91c1c" fontWeight="bold">
                P = {(pB2 * pRedGivenB2).toFixed(3)}
              </text>

              {/* Nhánh con từ Hộp 2 -> Bi Xanh */}
              <line x1="275" y1="265" x2="390" y2="295" stroke="#2563eb" strokeWidth="2" />
              <rect x="315" y="282" width="55" height="18" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
              <text x="342" y="295" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="bold">
                {b2Blue}/{totalB2}
              </text>
              <circle cx="410" cy="295" r="14" fill="#3b82f6" />
              <text x="410" y="299" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                Bi Xanh
              </text>
              <text x="432" y="299" fontSize="10" fill="#1e40af" fontWeight="bold">
                P = {(pB2 * pBlueGivenB2).toFixed(3)}
              </text>
            </svg>
          </div>
        ) : (
          /* 2. THỰC NGHIỆM LUẬT SỐ LỚN (ĐỔ XÚC XẮC) */
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] p-4 flex flex-col items-center">
            {/* Biểu đồ cột tần suất thực nghiệm */}
            <div className="w-full h-56 flex items-end justify-around gap-3 pt-6 border-b border-slate-200 px-4">
              {diceCounts.map((cnt, idx) => {
                const freq = totalRolls > 0 ? cnt / totalRolls : 0;
                const percent = (freq * 100).toFixed(1);
                const heightPx = Math.min(180, freq * 180 * 3.5); // scale
                const isClose = Math.abs(freq - 1 / 6) < 0.02;

                return (
                  <div key={`dice-bar-${idx}`} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      {totalRolls > 0 ? `${percent}%` : "0%"}
                    </span>
                    <div
                      style={{ height: `${Math.max(6, heightPx)}px` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isClose ? "bg-emerald-500 shadow-sm" : "bg-blue-500"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-800 font-mono">Mặt {idx + 1}</span>
                    <span className="text-[10px] text-slate-400">({cnt} lần)</span>
                  </div>
                );
              })}
            </div>

            {/* Đường xác suất lý thuyết P = 1/6 (16.67%) */}
            <div className="w-full flex justify-between items-center text-xs mt-3 px-2">
              <span className="text-slate-600 font-medium">
                Đường kỳ vọng lý thuyết: <strong className="text-rose-600 font-mono">P = 1/6 ≈ 16.67%</strong>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">
                {totalRolls >= 1000 ? "✓ Đã tiệm cận phân phối đều theo Luật Số Lớn!" : "Cần thêm lượt tung để tiệm cận"}
              </span>
            </div>

            {/* Bộ nút bấm mô phỏng nhanh */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleRollDice(10)}
                disabled={isRolling}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                + Tung 10 lần
              </button>
              <button
                type="button"
                onClick={() => handleRollDice(100)}
                disabled={isRolling}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                + Tung 100 lần
              </button>
              <button
                type="button"
                onClick={() => handleRollDice(1000)}
                disabled={isRolling}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                + Tung 1.000 lần
              </button>
              <button
                type="button"
                onClick={handleResetDice}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                title="Đặt lại thống kê"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cột phải: Tham số bi trong 2 Hộp & Kết quả Bayes */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Tùy chỉnh số bi Hộp 1 và Hộp 2 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <span className="font-bold text-slate-800 block">Số lượng bi trong 2 Hộp:</span>

          {/* Hộp 1 */}
          <div className="p-2.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2">
            <span className="font-bold text-teal-900 block">Hộp 1 (Tổng {totalB1} viên bi):</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-600 block">Bi Đỏ:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={b1Red}
                  onChange={(e) => setParamVal("box1Red", parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-red-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-600 block">Bi Xanh:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={b1Blue}
                  onChange={(e) => setParamVal("box1Blue", parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Hộp 2 */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block">Hộp 2 (Tổng {totalB2} viên bi):</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-600 block">Bi Đỏ:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={b2Red}
                  onChange={(e) => setParamVal("box2Red", parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-red-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-600 block">Bi Xanh:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={b2Blue}
                  onChange={(e) => setParamVal("box2Blue", parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kết quả Xác suất Toàn phần & Bayes SGK */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
          <span className="font-bold text-slate-800 block">Định lý Xác suất Toàn phần & Bayes:</span>

          <div className="space-y-1.5 font-mono">
            {/* P(Đỏ) */}
            <div className="p-2 bg-red-50/70 border border-red-200 rounded-xl">
              <span className="text-[10px] text-red-700 font-sans font-bold block">
                Xác suất toàn phần rút được Bi Đỏ:
              </span>
              <span className="text-sm font-extrabold text-red-950">
                P(Đỏ) = {formatVNFloat(pTotalRed)} ({(pTotalRed * 100).toFixed(1)}%)
              </span>
            </div>

            {/* P(Xanh) */}
            <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[10px] text-blue-700 font-sans font-bold block">
                Xác suất toàn phần rút được Bi Xanh:
              </span>
              <span className="text-sm font-extrabold text-blue-950">
                P(Xanh) = {formatVNFloat(pTotalBlue)} ({(pTotalBlue * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Công thức Bayes P(Hộp 1 | Đỏ) */}
            <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl">
              <span className="text-[10px] text-amber-800 font-sans font-bold block">
                Công thức Bayes: Biết bi rút ra màu Đỏ, xác suất từ Hộp 1:
              </span>
              <span className="text-sm font-extrabold text-amber-950">
                P(Hộp 1 | Đỏ) = {formatVNFloat(pBayesB1GivenRed)} ({(pBayesB1GivenRed * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
