/**
 * MathSTEP Module 3: Lượng Giác
 * Module 2: Slide bar ngang (có nút ẩn/hiện)
 * Activity Navigation & Cognitive Causation Chain Bar (UI02)
 * Features:
 * 1. Horizontal scrollable track for LG01 through LG13
 * 2. Real-time pedagogical cognitive reasoning chain (Chuỗi nhận thức / Chuỗi nguyên nhân)
 * 3. Toggle button to collapse/expand (ẩn/hiện) for maximum viewport on Smartboards and projectors
 */

import React from 'react';
import { ActivityId, ActivityMeta, CognitiveStep } from '../../types/math';
import { ACTIVITIES } from '../../data/contentBank';

interface ActivityBarProps {
  currentActivityId: ActivityId;
  onSelectActivity: (id: ActivityId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentStep?: CognitiveStep;
}

// Cognitive reasoning chains corresponding to each activity's pedagogical causal progression
const ACTIVITY_COGNITIVE_CHAINS: Record<ActivityId, { chain: string[]; formula: string }> = {
  LG01: {
    chain: ['Tia đầu OA', 'Quay góc α (chiều +/-)', 'Điểm cuối M trên đường tròn', 'Tách chu kỳ k·360°', 'Vị trí tương đương'],
    formula: 'α = θ + k·360°',
  },
  LG02: {
    chain: ['Tọa độ M(x, y)', 'Trục hoành Ox (cos α)', 'Trục tung Oy (sin α)', 'Dấu 4 góc phần tư', 'Điểm trên trục tọa độ'],
    formula: 'M = (cos α; sin α)',
  },
  LG03: {
    chain: ['Góc đặc biệt 0°-90°', 'Tam giác vuông cân & đều', 'Tỉ số hình học', 'Quy tắc √k/2', 'Giá trị căn chính xác'],
    formula: 'sin²α + cos²α = 1',
  },
  LG04: {
    chain: ['Góc α ban đầu', 'Phép đối xứng qua Ox/Oy/gốc O', 'Phép quay góc 90°', 'Góc liên kết', 'Cos-đối Sin-bù Phụ-chéo'],
    formula: 'cos(-α)=cos α, sin(π-α)=sin α',
  },
  LG05: {
    chain: ['Góc tổng α+β', 'Phản ví dụ: sin(a+b) ≠ sin a + sin b', 'Phép quay hệ tọa độ', 'Công thức cộng', 'Công thức nhân đôi'],
    formula: 'sin(a+b) = sin a cos b + cos a sin b',
  },
  LG06: {
    chain: ['Hệ thức cộng cos & sin', 'Cộng & trừ hai vế', 'Triệt tiêu số hạng chéo', 'Rút nhân tử 1/2', 'Công thức tích thành tổng'],
    formula: 'cos a cos b = ½[cos(a-b) + cos(a+b)]',
  },
  LG07: {
    chain: ['Đặt u = a+b, v = a-b', 'Biến đổi hệ phương trình', 'Công thức tổng thành tích', 'Nhóm thừa số chung', 'Ứng dụng giải phương trình'],
    formula: 'cos u + cos v = 2 cos((u+v)/2) cos((u-v)/2)',
  },
  LG08: {
    chain: ['Góc quay liên tục x', 'Chiếu tung độ y = sin x', 'Trải phẳng trục số hoành', 'Dải giá trị [-1; 1]', 'Đường hình sin tuần hoàn'],
    formula: 'y = sin x, x ∈ ℝ',
  },
  LG09: {
    chain: ['Quay thêm 2π radian', 'Điểm M trở về vị trí cũ', 'f(x + 2π) = f(x)', 'Chu kỳ cơ bản T = 2π/|b|', 'Mẫu sóng lặp vô hạn'],
    formula: 'T = 2π / |b|',
  },
  LG10: {
    chain: ['Biên độ |a| (dãn dọc)', 'Tần số góc b (co dãn ngang)', 'Độ lệch pha -c/b', 'Độ nâng trục dao động d', 'Dạng tổng quát y = a·sin(bx+c)+d'],
    formula: 'y = A sin(ωt + φ) + d',
  },
  LG11: {
    chain: ['Trục tiếp tuyến x=1, y=1', 'Giao điểm tia OM kéo dài', 'Điểm gián đoạn cos x = 0', 'Tiệm cận đứng x = π/2 + kπ', 'Đồng biến tuần hoàn T = π'],
    formula: 'y = tan x, x ≠ π/2 + kπ',
  },
  LG12: {
    chain: ['Phương trình f(x) = m', 'Vẽ đường nằm ngang y = m', 'Xác định giao điểm', 'Nghiệm trong một chu kỳ', 'Họ nghiệm tuần hoàn k2π / kπ'],
    formula: 'sin x = m ⇒ x = α + k2π ∨ x = π - α + k2π',
  },
  LG13: {
    chain: ['Hiện tượng thực tế (Đu quay/Sóng âm)', 'Chu kỳ T & biên độ A', 'Xác định pha ban đầu φ', 'Mô hình hóa hàm lượng giác', 'Dự báo thời điểm cực trị'],
    formula: 'h(t) = R - R·cos(ωt) + h₀',
  },
};

export const ActivityBar: React.FC<ActivityBarProps> = ({
  currentActivityId,
  onSelectActivity,
  isCollapsed,
  onToggleCollapse,
}) => {
  const currentChain = ACTIVITY_COGNITIVE_CHAINS[currentActivityId] || ACTIVITY_COGNITIVE_CHAINS['LG01'];

  // Collapsed View (Slim trigger bar)
  if (isCollapsed) {
    return (
      <div className="w-full bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-1 flex items-center justify-between text-xs select-none shrink-0 transition-all">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
            {currentActivityId}
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[320px] sm:max-w-md">
            {ACTIVITIES.find((a) => a.id === currentActivityId)?.title}
          </span>
          <span className="hidden md:inline font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {currentChain.formula}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
          title="Hiện thanh công cụ Module 2 (Hoạt động & Chuỗi nhận thức)"
        >
          <span>▼</span>
          <span>Hiện thanh chuỗi hoạt động (Module 2)</span>
        </button>
      </div>
    );
  }

  // Expanded View
  return (
    <div className="w-full bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 select-none shrink-0 transition-all">
      {/* Upper Row: Activity Switchers (LG01 - LG13) */}
      <div className="px-3 py-1.5 flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-1">
            Mục lục hoạt động:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {ACTIVITIES.map((act: ActivityMeta) => {
              const isActive = act.id === currentActivityId;
              return (
                <button
                  key={act.id}
                  onClick={() => onSelectActivity(act.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs scale-102'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title={`${act.title} - ${act.targetCompetency}`}
                >
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded font-bold ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {act.id}
                  </span>
                  <span className="hidden xl:inline">{act.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hide Module 2 button */}
        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md text-xs hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1 font-medium"
          title="Thu gọn Module 2 để mở rộng vùng mô phỏng"
        >
          <span>Ẩn</span>
          <span>▲</span>
        </button>
      </div>

      {/* Lower Row: Pedagogical Cognitive Causality Chain */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none bg-blue-50/40 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-blue-700 dark:text-blue-300 shrink-0 flex items-center gap-1">
            <span>🔗</span>
            <span>Chuỗi nhận thức:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
            {currentChain.chain.map((stepNode, idx) => (
              <React.Fragment key={idx}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-2xs whitespace-nowrap">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold text-[9px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{stepNode}</span>
                </span>
                {idx < currentChain.chain.length - 1 && (
                  <span className="text-slate-400 text-[10px]">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Formula Anchor Badge */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">Công thức trọng tâm:</span>
          <span className="font-mono font-semibold text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md shadow-2xs">
            {currentChain.formula}
          </span>
        </div>
      </div>
    </div>
  );
};
