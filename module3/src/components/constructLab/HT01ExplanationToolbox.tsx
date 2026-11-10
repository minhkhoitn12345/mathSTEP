/**
 * MathSTEP Module 3: Lượng Giác - Công cụ HT01: Hộp dụng cụ giải thích
 * Hệ thống thẻ lập luận đa tầng: Dữ kiện, Điều kiện, Định lý, Tính toán, Kết luận
 * Học sinh tự chọn và sắp xếp chuỗi thẻ suy luận, phân biệt quan sát trực quan với suy diễn toán học.
 */

import React, { useState } from 'react';
import { ExplanationCard } from '../../types/constructLab';

const DEFAULT_POOL: ExplanationCard[] = [
  {
    id: 'c1',
    type: 'given',
    title: 'Dữ kiện đề cho',
    content: 'sin(α) = 3/5, góc thuộc góc phần tư II (π/2 < α < π).',
    isObservationOnly: false,
  },
  {
    id: 'c2',
    type: 'condition',
    title: 'Điều kiện dấu tọa độ',
    content: 'Trong góc phần tư II, hoành độ điểm M âm (x_M < 0), tung độ dương (y_M > 0). Do đó cos(α) < 0.',
    isObservationOnly: false,
  },
  {
    id: 'c3',
    type: 'theorem',
    title: 'Căn cứ định lý cơ bản',
    content: 'Hệ thức cơ bản: sin²(α) + cos²(α) = 1 ⇒ cos(α) = -√(1 - sin²(α)).',
    isObservationOnly: false,
  },
  {
    id: 'c4',
    type: 'calculation',
    title: 'Các bước tính toán',
    content: 'cos(α) = -√(1 - 9/25) = -4/5; tan(α) = sin/cos = -3/4; cot(α) = -4/3.',
    isObservationOnly: false,
  },
  {
    id: 'c5',
    type: 'conclusion',
    title: 'Kết luận toán học',
    content: 'Điểm biểu diễn M(-4/5; 3/5) là duy nhất và cos(α) = -4/5 < 0 vì α thuộc góc phần tư II.',
    isObservationOnly: false,
  },
  {
    id: 'c6',
    type: 'prediction',
    title: 'Quan sát trực quan (Cần chứng minh)',
    content: 'Nhìn trên đồ thị thấy hai đường cắt nhau hoặc ước lượng khoảng cách bằng mắt.',
    isObservationOnly: true,
  },
];

export const HT01ExplanationToolbox: React.FC = () => {
  // Active chain built by student (starts with only given card to avoid leaking full solution)
  const [selectedCards, setSelectedCards] = useState<ExplanationCard[]>([DEFAULT_POOL[0]]);

  const [studentNote, setStudentNote] = useState<string>('');
  const [validationMsg, setValidationMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);

  // Add card to chain
  const handleAddCard = (card: ExplanationCard) => {
    if (selectedCards.some((c) => c.id === card.id)) return;
    setSelectedCards([...selectedCards, card]);
    setValidationMsg(null);
  };

  // Remove card from chain
  const handleRemoveCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c.id !== cardId));
    setValidationMsg(null);
  };

  // Move card up/down
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedCards.length) return;
    const updated = [...selectedCards];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setSelectedCards(updated);
    setValidationMsg(null);
  };

  // Validate reasoning chain
  const handleValidateReasoning = () => {
    const hasTheorems = selectedCards.some((c) => c.type === 'theorem' && !c.isObservationOnly);
    const hasConditions = selectedCards.some((c) => c.type === 'condition');
    const hasConclusions = selectedCards.some((c) => c.type === 'conclusion');

    if (hasTheorems && hasConditions && hasConclusions) {
      setValidationMsg({
        text: '✅ Chuỗi lập luận đạt chuẩn sư phạm! Em đã kết hợp chặt chẽ giữa hệ thức cơ bản sin²α + cos²α = 1 và dấu tọa độ trong góc phần tư II để kết luận duy nhất.',
        isSuccess: true,
      });
    } else {
      setValidationMsg({
        text: '⚠️ Chuỗi lập luận chưa đầy đủ: Cần đảm bảo có đủ thẻ [Căn cứ định lý cơ bản], [Điều kiện dấu tọa độ] và [Kết luận toán học] để không dựa vào cảm tính trực quan.',
        isSuccess: false,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* 1. Left: Student Built Chain */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🗂️</span>
              <span>Chuỗi lập luận của em (HT01)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kéo/chọn các thẻ lập luận bên phải vào đây theo thứ tự logic suy diễn
            </p>
          </div>
          <button
            onClick={handleValidateReasoning}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Kiểm tra chuỗi lập luận
          </button>
        </div>

        {/* Validation Result Badge */}
        {validationMsg && (
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              validationMsg.isSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
            }`}
          >
            {validationMsg.text}
          </div>
        )}

        {/* Selected Chain */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {selectedCards.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Chưa có thẻ nào trong chuỗi lập luận. Nhấn nút '+' bên phải để thêm thẻ vào chuỗi.
            </div>
          ) : (
            selectedCards.map((card, idx) => {
              const typeColor =
                card.type === 'given'
                  ? 'border-blue-300 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                  : card.type === 'condition'
                  ? 'border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                  : card.type === 'theorem'
                  ? 'border-purple-300 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'
                  : card.type === 'calculation'
                  ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : card.type === 'conclusion'
                  ? 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                  : 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

              return (
                <div
                  key={card.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${typeColor}`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs">{card.title}</span>
                      {card.isObservationOnly && (
                        <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded font-medium">
                          Chỉ là quan sát
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed pl-7">{card.content}</p>
                  </div>

                  {/* Move Up/Down & Remove */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleMoveCard(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-xs hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20"
                      title="Chuyển lên trước"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveCard(idx, 'down')}
                      disabled={idx === selectedCards.length - 1}
                      className="p-1 rounded-md text-xs hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20"
                      title="Chuyển xuống sau"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className="p-1 rounded-md text-xs text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                      title="Bỏ thẻ khỏi chuỗi"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Student Note Box */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Ghi chú giải thích bổ sung của em:
          </label>
          <textarea
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            placeholder="Ví dụ: Em áp dụng định lý Pythagoras trên đường tròn lượng giác và điều kiện góc phần tư II để kết luận cos α = -4/5..."
            className="mt-1 w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none h-20 outline-none"
          />
        </div>
      </div>

      {/* 2. Right: Card Palette */}
      <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>📦 Thư viện thẻ lập luận</span>
          <span className="text-xs font-mono font-normal text-slate-400">
            {DEFAULT_POOL.length} thẻ
          </span>
        </h4>
        <p className="text-xs text-slate-500">
          Bấm dấu <strong>+</strong> để thêm thẻ vào chuỗi lập luận của em:
        </p>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {DEFAULT_POOL.map((card) => {
            const isAdded = selectedCards.some((c) => c.id === card.id);
            return (
              <div
                key={card.id}
                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-all ${
                  isAdded
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 opacity-50'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{card.title}</span>
                  {!isAdded ? (
                    <button
                      onClick={() => handleAddCard(card)}
                      className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      title="Thêm thẻ này"
                    >
                      + Thêm
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-semibold">Đã thêm ✓</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {card.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
