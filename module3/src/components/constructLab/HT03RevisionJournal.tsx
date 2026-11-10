/**
 * MathSTEP Module 3: Lượng Giác - Công cụ HT03: Sổ tự sửa và kiểm tra lại
 * Quản lý lịch sử tự sửa, hàng chờ ôn tập giãn cách và nhập xuất JSON độc lập
 */

import React, { useState, useEffect } from 'react';
import { ConstructLabAttemptRecord, ReviewQueueItem } from '../../types/constructLab';

export const HT03RevisionJournal: React.FC = () => {
  const [records, setRecords] = useState<ConstructLabAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mathstep.m3.constructLab.v1.attempts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('mathstep.m3.constructLab.v1.reviewQueue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(
      {
        schemaVersion: '1.0',
        exportedAt: new Date().toISOString(),
        attempts: records,
        reviewQueue,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constructLab_journal_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON with validation
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.schemaVersion === '1.0' && Array.isArray(parsed.attempts)) {
          // Non-destructive merge
          const existingIds = new Set(records.map((r) => r.id));
          const newRecords = parsed.attempts.filter((r: any) => !existingIds.has(r.id));
          const merged = [...records, ...newRecords];
          setRecords(merged);
          localStorage.setItem('mathstep.m3.constructLab.v1.attempts', JSON.stringify(merged));
          setImportStatus(`✅ Đã nhập thêm ${newRecords.length} bản ghi thành công!`);
        } else {
          setImportStatus('❌ Tệp JSON không đúng cấu trúc schema v1.0 của Tự kiến tạo.');
        }
      } catch (err) {
        setImportStatus('❌ Lỗi định dạng tệp JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Stats
  const total = records.length;
  const mastered = records.filter((r) => r.status === 'mastered_independent').length;
  const withSupport = records.filter((r) => r.status === 'completed_with_support').length;
  const needsReview = reviewQueue.length;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
      {/* Records History List */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📓</span>
              <span>Sổ tay tiến trình & Lịch sử tự sửa (HT03)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi lần sửa bài tạo một revision mới, giữ nguyên minh chứng bản đầu để theo dõi sự tiến bộ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Xuất JSON</span>
            </button>
            <label className="px-2.5 py-1.5 rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
              <span>📤</span>
              <span>Nhập JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-slate-50 border text-xs">
            {importStatus}
          </div>
        )}

        {/* History items */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có phiên tự làm bài nào được lưu. Hãy trải nghiệm các trạm KT01 - KT06!
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 font-mono">{rec.stationId}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{rec.taskId}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(rec.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Phản hồi: {rec.checks.feedback}
                </div>
                {rec.revisions && rec.revisions.length > 0 && (
                  <div className="text-[11px] text-purple-600 font-semibold">
                    Đã trải qua {rec.revisions.length} lần tự sửa và hoàn thiện
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Queue & Spaced Repetition Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        {/* Statistics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            📊 Thống kê năng lực tự kiến tạo
          </h4>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200">
              <span className="text-slate-500 block text-[10px]">Tổng lượt làm</span>
              <strong className="text-blue-700 text-base">{total}</strong>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px]">Tự làm đạt chuẩn</span>
              <strong className="text-emerald-700 text-base">{mastered}</strong>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200">
              <span className="text-slate-500 block text-[10px]">Đạt có giàn đỡ</span>
              <strong className="text-purple-700 text-base">{withSupport}</strong>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
              <span className="text-slate-500 block text-[10px]">Cần ôn lại</span>
              <strong className="text-amber-700 text-base">{needsReview}</strong>
            </div>
          </div>
        </div>

        {/* Retry Queue List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>⏱️ Hàng chờ ôn tập định kỳ</span>
            <span className="text-xs text-slate-400 font-normal">{reviewQueue.length} bài</span>
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reviewQueue.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                Hiện không có bài nào trong hàng chờ ôn tập.
              </div>
            ) : (
              reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 rounded-xl text-xs flex items-center justify-between"
                >
                  <div>
                    <strong className="text-amber-900 dark:text-amber-200 block">{item.taskTitle}</strong>
                    <span className="text-[10px] text-amber-700">{item.reason}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md">
                    Phiên tới
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
