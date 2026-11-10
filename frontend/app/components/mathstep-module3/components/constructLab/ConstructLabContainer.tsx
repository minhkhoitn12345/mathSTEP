/**
 * MathSTEP Module 3: Lượng Giác - Không gian "Tự kiến tạo" (ConstructLab)
 * "Tự làm trước — giải thích — rồi kiểm chứng"
 * 6 Trạm hoạt động (KT01 - KT06) & 3 Công cụ hỗ trợ (HT01 - HT03)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StationId,
  ToolId,
  ConstructLabTab,
  AssistanceLevel,
  ConstructLabTask,
  ConstructLabAttemptRecord,
} from '../../types/constructLab';
import { CognitiveStep } from '../../types/math';
import { CONSTRUCT_TASKS } from '../../data/constructLabData';
import { KT01ValueToPosition } from './KT01ValueToPosition';
import { KT02BuildGraph } from './KT02BuildGraph';
import { KT03GraphToFormula } from './KT03GraphToFormula';
import { KT04RealWorldModel } from './KT04RealWorldModel';
import { KT05DomainConditions } from './KT05DomainConditions';
import { KT06WaveSuperposition } from './KT06WaveSuperposition';
import { HT01ExplanationToolbox } from './HT01ExplanationToolbox';
import { HT02DegRadLab } from './HT02DegRadLab';
import { HT03RevisionJournal } from './HT03RevisionJournal';
import { ConstructLabDiagnosticsModal } from './ConstructLabDiagnosticsModal';
import { MasCot, MascotMood } from '../MasCot';

interface ConstructLabContainerProps {
  onReturnToSimulation: () => void;
}

export const ConstructLabContainer: React.FC<ConstructLabContainerProps> = ({
  onReturnToSimulation,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<ConstructLabTab>('KT01');
  const [assistanceLevel, setAssistanceLevel] = useState<AssistanceLevel>('scaffolded');
  const [currentStep, setCurrentStep] = useState<CognitiveStep>(1);

  // Diagnostics Modal
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Mascot state
  const [mascotMood, setMascotMood] = useState<MascotMood>('neutral');
  const [mascotSpeech, setMascotSpeech] = useState<string>(
    'Chào em! Tại không gian "Tự kiến tạo", em hãy tự dựng hình, suy luận căn cứ trước rồi mới ấn kiểm chứng nhé!'
  );
  const [hintIndex, setHintIndex] = useState<number>(0);

  // Station tasks list
  const stationTasks = useMemo(() => {
    if (activeTab.startsWith('KT')) {
      return CONSTRUCT_TASKS.filter((t) => t.stationId === activeTab);
    }
    return [];
  }, [activeTab]);

  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);
  const currentTask: ConstructLabTask | undefined = stationTasks[selectedTaskIndex] || stationTasks[0];

  // Update mascot when task changes
  useEffect(() => {
    if (currentTask) {
      setHintIndex(0);
      setMascotSpeech(currentTask.socraticHints.H0);
    }
  }, [currentTask]);

  // Clean unmount lifecycle: reset any local state
  useEffect(() => {
    return () => {
      // Cleanup hooks or timers if any
    };
  }, []);

  const handleNextHint = () => {
    if (!currentTask) return;
    const hints = [
      currentTask.socraticHints.H0,
      currentTask.socraticHints.H1,
      currentTask.socraticHints.H2,
      currentTask.socraticHints.H3,
      currentTask.socraticHints.H4,
    ];
    const nextIdx = Math.min(hintIndex + 1, 4);
    setHintIndex(nextIdx);
    setMascotSpeech(hints[nextIdx]);
    setMascotMood('thinking');
  };

  // Log revision to isolated localStorage namespace
  const handleLogRevision = (constructionState: any, feedbackMsg: string) => {
    if (!currentTask) return;
    try {
      const key = 'mathstep.m3.constructLab.v1.attempts';
      const existingStr = localStorage.getItem(key);
      const existing: ConstructLabAttemptRecord[] = existingStr ? JSON.parse(existingStr) : [];

      const newRec: ConstructLabAttemptRecord = {
        schemaVersion: '1.0',
        id: `att_${Date.now()}`,
        taskId: currentTask.id,
        taskVersion: currentTask.version,
        stationId: currentTask.stationId,
        mode: 'guided',
        assistanceLevel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prediction: '',
        construction: { [currentTask.stationId.toLowerCase()]: constructionState },
        explanationCards: [],
        studentFreeExplanation: '',
        checks: {
          status: 'correct',
          feedback: feedbackMsg,
          criteriaPassed: [],
          criteriaFailed: [],
          timestamp: new Date().toISOString(),
        },
        assistanceLog: {
          hintsOpened: hintIndex,
          revealedAnswer: false,
          scaffoldingUsed: assistanceLevel === 'scaffolded',
        },
        revisions: [
          {
            revisionId: 1,
            timestamp: new Date().toISOString(),
            construction: { [currentTask.stationId.toLowerCase()]: constructionState },
            feedback: feedbackMsg,
          },
        ],
        status: assistanceLevel === 'scaffolded' ? 'completed_with_support' : 'mastered_independent',
      };

      existing.unshift(newRec);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // localstorage full or blocked
    }
  };

  const handleTaskCompleted = () => {
    setMascotMood('celebrating');
    setMascotSpeech('Xuất sắc lắm! Em đã hoàn thành kiểm chứng cho nhiệm vụ này. Em có thể sang bài tiếp theo!');
  };

  const stepsTitle: string[] = [
    '1. Nhìn thấy',
    '2. Dự đoán',
    '3. Thao tác',
    '4. Khám phá lỗi',
    '5. Kiểm chứng',
    '6. Giải thích',
    '7. Chuyển giao',
    '8. Vận dụng',
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F7FB] dark:bg-slate-950 text-[#16324F] dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar for ConstructLab */}
      <header className="h-14 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            KT
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                Tự kiến tạo
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                6 trạm khám phá
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline">
              Tự làm trước — giải thích — rồi kiểm chứng
            </span>
          </div>
        </div>

        {/* Assistance Level Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setAssistanceLevel('scaffolded')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              assistanceLevel === 'scaffolded'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Có giàn đỡ
          </button>
          <button
            onClick={() => setAssistanceLevel('independent')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              assistanceLevel === 'independent'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tự làm
          </button>
          <button
            onClick={() => setAssistanceLevel('assessment')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              assistanceLevel === 'assessment'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tự kiểm tra
          </button>
        </div>

        {/* Diagnostics & Return Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Chạy 20 ca toán học N01-N20 và 10 ca kiểm tra hồi quy O01-O10"
          >
            <span>🩺</span>
            <span className="hidden md:inline">Chẩn đoán N01-N20</span>
          </button>

          <button
            onClick={onReturnToSimulation}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>◀</span>
            <span>Về mô phỏng hiện tại</span>
          </button>
        </div>
      </header>

      {/* Stations Navigation Bar (KT01 - KT06, HT01 - HT03) */}
      <div className="h-11 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
        {[
          { id: 'KT01', label: 'KT01: Giá trị → Vị trí' },
          { id: 'KT02', label: 'KT02: Tự dựng đồ thị' },
          { id: 'KT03', label: 'KT03: Đồ thị → Công thức' },
          { id: 'KT04', label: 'KT04: Tình huống thực tế' },
          { id: 'KT05', label: 'KT05: Miền xác định' },
          { id: 'KT06', label: 'KT06: Ghép sóng' },
          { id: 'HT01', label: 'HT01: Hộp giải thích' },
          { id: 'HT02', label: 'HT02: DEG / RAD' },
          { id: 'HT03', label: 'HT03: Sổ tự sửa' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ConstructLabTab);
              setSelectedTaskIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Selector Banner (If on KT station) */}
      {stationTasks.length > 0 && currentTask && (
        <div className="h-10 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="font-bold text-slate-500 whitespace-nowrap">Chọn nhiệm vụ:</span>
            {stationTasks.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setSelectedTaskIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  idx === selectedTaskIndex
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Bài {idx + 1}: {t.title}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-sm">
            {currentTask.curriculumSource}
          </span>
        </div>
      )}

      {/* Main Interactive Stage Body */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'KT01' && currentTask && (
          <KT01ValueToPosition
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'KT02' && currentTask && (
          <KT02BuildGraph
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'KT03' && currentTask && (
          <KT03GraphToFormula
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'KT04' && currentTask && (
          <KT04RealWorldModel
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'KT05' && currentTask && (
          <KT05DomainConditions
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'KT06' && currentTask && (
          <KT06WaveSuperposition
            task={currentTask}
            assistanceLevel={assistanceLevel}
            onLogRevision={handleLogRevision}
            onTaskCompleted={handleTaskCompleted}
          />
        )}
        {activeTab === 'HT01' && <HT01ExplanationToolbox />}
        {activeTab === 'HT02' && <HT02DegRadLab />}
        {activeTab === 'HT03' && <HT03RevisionJournal />}

        {/* Mascot Widget */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <MasCot
            mood={mascotMood}
            speechText={mascotSpeech}
            hintLevel={`H${hintIndex}` as any}
            onAskNextHint={handleNextHint}
            onRequestTeacher={() => {
              setMascotSpeech('Thầy cô đã nhận được yêu cầu hỗ trợ cho bài tập tự kiến tạo này!');
            }}
          />
        </div>
      </main>

      {/* Footer 8-Step Cognitive Progress Bar */}
      <footer className="h-11 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-2 shrink-0 select-none text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {stepsTitle.map((title, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep((i + 1) as CognitiveStep)}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] whitespace-nowrap transition-colors ${
                currentStep === i + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1) as CognitiveStep)}
            disabled={currentStep === 1}
            className="px-2.5 py-1 rounded-lg border bg-slate-50 disabled:opacity-40"
          >
            ◀
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.min(8, s + 1) as CognitiveStep)}
            disabled={currentStep === 8}
            className="px-2.5 py-1 rounded-lg border bg-purple-600 text-white disabled:opacity-40"
          >
            ▶
          </button>
        </div>
      </footer>

      {/* Diagnostics Modal */}
      <ConstructLabDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
};
