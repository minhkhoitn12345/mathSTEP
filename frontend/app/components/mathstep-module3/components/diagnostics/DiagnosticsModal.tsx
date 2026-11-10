/**
 * MathSTEP Module 3: Lượng Giác
 * Diagnostics & Test Suite Runner Modal
 * Executes:
 * - T01 to T38 (Mathematical accuracy - 38 tests)
 * - F01 to F16 (Functional & Integration checks - 16 tests)
 * - SYNC01 to SYNC20 (Synchronization, Sliding Viewport, & Point P Tracking - 20 tests)
 * - N01 to N20 & O01 to O10 (ConstructLab Reverse Reasoning & Station Tests - 30 tests)
 * Total: 104 automated tests with real-time diffs, execution times, and JSON export.
 */

import React, { useState, useEffect } from 'react';
import { runAllTestCases } from '../../mathCore/testCases';
import { runSyncTrigTests } from '../../mathCore/syncTrigTests';
import { runConstructLabTests } from '../../mathCore/constructLabTests';

export interface UnifiedTestItem {
  id: string;
  suite: 'core_math' | 'core_functional' | 'sync' | 'construct_lab';
  title: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
  durationMs?: number;
}

interface DiagnosticsModalProps {
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ onClose }) => {
  const [results, setResults] = useState<UnifiedTestItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'sync' | 'math' | 'functional' | 'construct' | 'failed'>('all');
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const items: UnifiedTestItem[] = [];

      // 1. Core tests (T01 - T38 and F01 - F16)
      const core = runAllTestCases();
      core.forEach((c) => {
        items.push({
          id: c.id,
          suite: c.category === 'math' ? 'core_math' : 'core_functional',
          title: c.title,
          passed: c.passed,
          expected: c.expected,
          actual: c.actual,
          details: c.notes,
          durationMs: c.durationMs,
        });
      });

      // 2. Sync tests (SYNC01 - SYNC20)
      const sync = runSyncTrigTests();
      sync.results.forEach((s) => {
        items.push({
          id: s.id,
          suite: 'sync',
          title: s.name,
          passed: s.passed,
          expected: s.expected,
          actual: s.actual,
          details: s.details,
          durationMs: 1,
        });
      });

      // 3. ConstructLab tests (N01 - N20, O01 - O10)
      const construct = runConstructLabTests();
      construct.results.forEach((cl) => {
        items.push({
          id: cl.id,
          suite: 'construct_lab',
          title: cl.name,
          passed: cl.passed,
          expected: cl.expected,
          actual: cl.actual,
          details: cl.details,
          durationMs: 1,
        });
      });

      setResults(items);
      setIsRunning(false);
    }, 50);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  const filtered = results.filter((r) => {
    if (filter === 'sync') return r.suite === 'sync';
    if (filter === 'math') return r.suite === 'core_math';
    if (filter === 'functional') return r.suite === 'core_functional';
    if (filter === 'construct') return r.suite === 'construct_lab';
    if (filter === 'failed') return !r.passed;
    return true;
  });

  const exportReport = () => {
    const reportData = {
      project: 'MathSTEP Module 3 Lượng Giác - Comprehensive Verification',
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: passedCount,
        failed: failedCount,
        passRate: `${((passedCount / total) * 100).toFixed(1)}%`,
        suites: {
          coreMath: results.filter((r) => r.suite === 'core_math').length,
          coreFunctional: results.filter((r) => r.suite === 'core_functional').length,
          sync: results.filter((r) => r.suite === 'sync').length,
          constructLab: results.filter((r) => r.suite === 'construct_lab').length,
        },
      },
      testResults: results,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathSTEP_M3_Full_Diagnostics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Chẩn Đoán Toàn Bộ Hệ Thống & Kiểm Thử Tự Động ({total} Ca)
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Tổng cộng: {total} ca · Đạt: <span className="text-emerald-600 font-bold">{passedCount}</span> · Không đạt: <span className="text-rose-600 font-bold">{failedCount}</span>
                {failedCount === 0 && <span className="ml-2 text-emerald-600 font-bold">🎉 100% HOÀN HẢO</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              {isRunning ? 'Đang chạy...' : '⚡ Chạy lại toàn bộ'}
            </button>
            <button
              onClick={exportReport}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Xuất Báo Cáo JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({total})
          </button>
          <button
            onClick={() => setFilter('sync')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'sync'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Đồng bộ M & P (20)
          </button>
          <button
            onClick={() => setFilter('math')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'math'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Toán học T01-T38 (38)
          </button>
          <button
            onClick={() => setFilter('functional')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'functional'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Chức năng F01-F16 (16)
          </button>
          <button
            onClick={() => setFilter('construct')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'construct'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tự kiến tạo N01-N30 (30)
          </button>
          {failedCount > 0 && (
            <button
              onClick={() => setFilter('failed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950'
              }`}
            >
              Lỗi ({failedCount})
            </button>
          )}
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map((tc) => (
            <div
              key={tc.id}
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-colors ${
                tc.passed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      tc.passed
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {tc.id}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{tc.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tc.durationMs !== undefined && (
                    <span className="font-mono text-[10px] text-slate-400">{tc.durationMs}ms</span>
                  )}
                  <span
                    className={`font-bold ${
                      tc.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tc.passed ? '✓ ĐẠT' : '✗ CHƯA ĐẠT'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-500">Kỳ vọng:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{tc.expected}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Thực tế:</span>{' '}
                  <span
                    className={`font-mono ${
                      tc.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300 font-bold'
                    }`}
                  >
                    {tc.actual}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
