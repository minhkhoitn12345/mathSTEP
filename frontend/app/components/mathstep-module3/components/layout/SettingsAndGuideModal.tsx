/**
 * MathSTEP Module 3: Lượng Giác
 * Hộp thoại Hướng dẫn sử dụng, Cài đặt hiển thị & Đặt lại có phạm vi (Section VIII)
 */

import React, { useState } from 'react';

export interface AppSettings {
  isSmartboardMode: boolean; // Large touch targets (56-64px), larger text
  isReducedMotion: boolean;  // Suppress all spinning/wobble animations
  fontSize: 'normal' | 'large';
  showMascot: boolean;
}

interface SettingsAndGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetModel: () => void;
  onRestartTask: () => void;
  onResetUIPreferences: () => void;
  onClearAppData: () => void;
}

export const SettingsAndGuideModal: React.FC<SettingsAndGuideModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetModel,
  onRestartTask,
  onResetUIPreferences,
  onClearAppData,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'settings' | 'reset'>('guide');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      tabIndex={-1}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cài đặt và hướng dẫn sử dụng
              </h3>
              <p className="text-xs text-slate-500">
                Phòng thí nghiệm lượng giác · Dành cho học sinh và giáo viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            📖 Hướng dẫn sử dụng
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            🎛️ Cài đặt & Bảng thông minh
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'reset'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            🔄 Đặt lại có phạm vi
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-300 space-y-4">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 leading-relaxed">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1.5 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Quy trình sư phạm 8 bước nhận thức</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-blue-800 dark:text-blue-300">
                  <li><strong>Nhìn thấy:</strong> Quan sát hiện tượng hình học hoặc đồ thị mẫu.</li>
                  <li><strong>Dự đoán:</strong> Ghi nhận phỏng đoán ban đầu trước khi tính toán.</li>
                  <li><strong>Thao tác:</strong> Kéo điểm M trên đường tròn hoặc bấm phím mũi tên.</li>
                  <li><strong>Khám phá & nhận diện lỗi:</strong> So sánh kết quả thực tế với trực giác.</li>
                  <li><strong>Kiểm chứng:</strong> Nhấn "Kiểm chứng Toán học" để đối chiếu định lý.</li>
                  <li><strong>Giải thích:</strong> Tự nêu căn cứ định nghĩa/định lý toán học.</li>
                  <li><strong>Bài chuyển giao:</strong> Áp dụng sang bài toán mới cùng bản chất.</li>
                  <li><strong>Vận dụng & lưu sổ:</strong> Ghi nhận phiên học vào Sổ học tập.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                  ⌨️ Phím tắt & Thao tác nhanh
                </h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border">
                    <strong className="text-slate-900 dark:text-slate-100">Phím ← / →:</strong> Quay góc ±1°
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border">
                    <strong className="text-slate-900 dark:text-slate-100">Phím Shift + ← / →:</strong> Quay góc ±15°
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border">
                    <strong className="text-slate-900 dark:text-slate-100">Phím Space:</strong> Bật / Tắt tự động quay
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border">
                    <strong className="text-slate-900 dark:text-slate-100">Phím Esc:</strong> Đóng các hộp thoại
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm mb-1.5 flex items-center gap-2">
                  <span>✨</span>
                  <span>Khu vực "Tự kiến tạo" (ConstructLab)</span>
                </h4>
                <p className="text-[11.5px] text-purple-800 dark:text-purple-300">
                  Chuyển từ quan sát sang học sinh <strong>tự làm trước — giải thích — rồi kiểm chứng</strong>. Bấm nút <strong>✨ Tự kiến tạo</strong> trên thanh công cụ để trải nghiệm 6 trạm bài toán ngược (KT01–KT06) và 3 công cụ hỗ trợ (HT01–HT03). Bấm <strong>◀ Về mô phỏng hiện tại</strong> bất kỳ lúc nào để khôi phục nguyên vẹn trạng thái trước đó.
                </p>
              </div>

              <div className="text-[11px] text-slate-500">
                <strong>🌐 Khả năng ngoại tuyến:</strong> Ứng dụng chạy hoàn toàn trong trình duyệt cục bộ của máy, lưu dữ liệu vào bộ nhớ máy tính mà không gửi ra mạng bên ngoài. Nút "Xuất index.html" trên thanh công cụ cho phép tải bản đơn file chạy mọi lúc không cần Internet.
              </div>
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Smartboard Mode */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    🖥️ Chế độ Bảng Tương Tác (Smartboard Mode)
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Tăng kích thước nút bấm (56–64px), chữ lớn và độ tương phản cao để chạm bằng ngón tay hoặc bút viết bảng.
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ isSmartboardMode: !settings.isSmartboardMode })}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    settings.isSmartboardMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {settings.isSmartboardMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    ⏸️ Giảm chuyển động (Reduced Motion)
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Tắt hiệu ứng chuyển động rung lắc/nhấp nháy để phù hợp trình chiếu trong lớp học và giảm phân tâm.
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ isReducedMotion: !settings.isReducedMotion })}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    settings.isReducedMotion
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {settings.isReducedMotion ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                </button>
              </div>

              {/* Font size */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    🔍 Cỡ chữ giao diện
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Phóng to chữ hiển thị cho học sinh ngồi xa bảng quan sát rõ ràng.
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdateSettings({ fontSize: 'normal' })}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs border ${
                      settings.fontSize === 'normal'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Chuẩn (14px)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ fontSize: 'large' })}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs border ${
                      settings.fontSize === 'large'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Lớn (16px)
                  </button>
                </div>
              </div>

              {/* Mascot Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    🦉 Trợ lý học tập MathSTEP
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Hiển thị linh vật thông thái đồng hành và gợi ý sư phạm gián tiếp 5 cấp độ (H0–H4).
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showMascot: !settings.showMascot })}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    settings.showMascot
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {settings.showMascot ? 'HIỆN' : 'ẨN'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCOPED RESETS */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    🎯 Đặt lại mô hình hiện tại
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Trả góc quay, dạng hàm số và các tham số về giá trị mặc định ban đầu của bài học này mà KHÔNG xóa nhật ký học tập.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onResetModel();
                    alert('Đã đặt lại mô hình bài học về giá trị ban đầu.');
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Đặt lại mô hình
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    📝 Làm lại nhiệm vụ (Bước 1/8)
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Xóa dự đoán nháp và lời giải thích của bài hiện tại để làm lại từ đầu.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onRestartTask();
                    alert('Đã xóa dữ liệu nháp hiện tại, bắt đầu lại Bước 1.');
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Làm lại bài
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                    🎨 Khôi phục cài đặt hiển thị
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    Trả cỡ chữ, chế độ bảng tương tác và hiệu ứng chuyển động về cấu hình chuẩn.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onResetUIPreferences();
                    alert('Đã khôi phục cài đặt hiển thị về mặc định.');
                  }}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Khôi phục
                </button>
              </div>

              {/* Advanced Data Clear with Explicit Confirmation */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl space-y-2">
                <strong className="text-sm text-red-900 dark:text-red-200 block">
                  ⚠️ Quản trị nâng cao: Xóa dữ liệu học tập cục bộ
                </strong>
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  Thao tác này chỉ xóa các khóa dữ liệu trong phạm vi <code>MathSTEP.M3.*</code> trên máy này. Khuyến nghị bạn hãy dùng nút <strong>Xuất Sổ học tập JSON</strong> trước khi xóa.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={(e) => setConfirmDeleteText(e.target.value)}
                    placeholder="Gõ XOA để xác nhận"
                    className="p-2 text-xs font-mono font-bold uppercase bg-white dark:bg-slate-800 border border-red-300 rounded-xl outline-none"
                  />
                  <button
                    disabled={confirmDeleteText.trim() !== 'XOA'}
                    onClick={() => {
                      onClearAppData();
                      setDeleteMsg('Đã xóa dữ liệu cục bộ trong phạm vi MathSTEP.M3 thành công!');
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                </div>
                {deleteMsg && (
                  <div className="text-xs font-semibold text-red-700 dark:text-red-300 pt-1">
                    {deleteMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
