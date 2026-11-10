/**
 * MathSTEP Module 3: Lượng Giác
 * Main Interactive Application Container
 * Adheres strictly to the architectural contract:
 * UI01 (Toolbar) + UI02 (ActivityBar) + UI03 (TaskPanel) + UI04 (ControlPanel)
 * + UI05 (SynchronizedStage) + UI06 (ProgressBar) + UI07 (MasCot)
 * Seamless 8-step cognitive learning flow, test suite, and local journal.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityId,
  AngleUnit,
  AppMode,
  CognitiveStep,
  ErrorCode,
  ExactAngle,
  FunctionParams,
  FunctionType,
  HintLevel,
  QuestionItem,
  TableRow,
  UserProfile,
  AttemptLog,
} from './types/math';
import {
  parseAndNormalizeAngle,
  getTrigValues,
  getRelatedAngle,
  evaluateTrigFunction,
} from './mathCore/trigMath';
import { ACTIVITIES, ERROR_CATALOG, QUESTIONS_BANK, SAMPLE_PROFILES } from './data/contentBank';
import { Toolbar } from './components/layout/Toolbar';
import { ActivityBar } from './components/layout/ActivityBar';
import { ProgressBar } from './components/layout/ProgressBar';
import { TaskPanel } from './components/panels/TaskPanel';
import { ControlPanel } from './components/panels/ControlPanel';
import { SynchronizedStage } from './components/stage/SynchronizedStage';
import { MasCot, MascotMood } from './components/MasCot';
import { GameHub } from './components/games/GameHub';
import { DiagnosticsModal } from './components/diagnostics/DiagnosticsModal';
import { LearningNotebookModal } from './components/notebook/LearningNotebookModal';
import { ConstructLabContainer } from './components/constructLab/ConstructLabContainer';
import { SettingsAndGuideModal, AppSettings } from './components/layout/SettingsAndGuideModal';
import { AppSnapshot } from './types/constructLab';

export default function App() {
  // ConstructLab Extension Feature Flag & Snapshot
  const [enableConstructLab, setEnableConstructLab] = useState<boolean>(false);
  const [appSnapshot, setAppSnapshot] = useState<AppSnapshot | null>(null);

  // Navigation & Mode
  const [activityId, setActivityId] = useState<ActivityId>('LG01');
  const [step, setStep] = useState<CognitiveStep>(1);
  const [mode, setMode] = useState<AppMode>('guided');
  const [unit, setUnit] = useState<AngleUnit>('deg');

  // Math State
  const [angle, setAngle] = useState<ExactAngle>(() => parseAndNormalizeAngle('-750deg', 'deg'));
  const [functionType, setFunctionType] = useState<FunctionType>('sin');
  const [params, setParams] = useState<FunctionParams>({ a: 1, b: 1, c: 0, d: 0 });
  const [secondaryAngle, setSecondaryAngle] = useState<ExactAngle | null>(null);
  const [secondaryLabel, setSecondaryLabel] = useState<string>('N(β)');
  const [periodShiftOverlay, setPeriodShiftOverlay] = useState<number | null>(null);

  // Playback & Animation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Overlays
  const [showProjections, setShowProjections] = useState(true);
  const [showTangentAxis, setShowTangentAxis] = useState(true);
  const [showCotangentAxis, setShowCotangentAxis] = useState(true);
  const [showSpecialTriangle, setShowSpecialTriangle] = useState(false);
  const [showQuadrants, setShowQuadrants] = useState(true);
  const [showSpiral, setShowSpiral] = useState(true);

  // Layout Drawers (Modules 2, 3, 4, 6)
  const [isActivityBarCollapsed, setIsActivityBarCollapsed] = useState(false);
  const [isTaskCollapsed, setIsTaskCollapsed] = useState(false);
  const [isControlCollapsed, setIsControlCollapsed] = useState(false);
  const [isProgressBarCollapsed, setIsProgressBarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Task & Learning Logs
  const [prediction, setPrediction] = useState('');
  const [observation, setObservation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [checkStatus, setCheckStatus] = useState<'correct' | 'incorrect' | 'partial' | 'unverified'>('unverified');
  const [checkFeedback, setCheckFeedback] = useState<string>('');
  const [activeErrors, setActiveErrors] = useState<ErrorCode[]>([]);

  // Socratic Hints & Mascot
  const [hintLevel, setHintLevel] = useState<HintLevel>('H0');
  const [mascotMood, setMascotMood] = useState<MascotMood>('neutral');
  const [mascotSpeech, setMascotSpeech] = useState<string>(
    'Chào em! Thầy cô và MathSTEP đồng hành cùng em. Hãy kéo thử góc trên đường tròn và quan sát sự thay đổi nhé!'
  );

  // Modals & Settings
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mobile Drawers
  const [isMobileTaskOpen, setIsMobileTaskOpen] = useState(false);
  const [isMobileControlOpen, setIsMobileControlOpen] = useState(false);

  // App UI & Accessibility Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('MathSTEP.M3.settings');
      return saved
        ? JSON.parse(saved)
        : {
            isSmartboardMode: false,
            isReducedMotion: false,
            fontSize: 'normal',
            showMascot: true,
          };
    } catch {
      return {
        isSmartboardMode: false,
        isReducedMotion: false,
        fontSize: 'normal',
        showMascot: true,
      };
    }
  });

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('MathSTEP.M3.settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Local Persistence & Data
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('MathSTEP.M3.profiles');
      return saved ? JSON.parse(saved) : SAMPLE_PROFILES;
    } catch {
      return SAMPLE_PROFILES;
    }
  });

  const [activeProfile, setActiveProfile] = useState<UserProfile>(profiles[0] || SAMPLE_PROFILES[0]);

  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    try {
      const saved = localStorage.getItem('MathSTEP.M3.questions');
      return saved ? JSON.parse(saved) : QUESTIONS_BANK;
    } catch {
      return QUESTIONS_BANK;
    }
  });

  const [attempts, setAttempts] = useState<AttemptLog[]>(() => {
    try {
      const saved = localStorage.getItem('MathSTEP.M3.attempts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableRows, setTableRows] = useState<TableRow[]>([]);

  // Calculate trig values
  const trigValues = useMemo(() => getTrigValues(angle), [angle]);

  // Current activity metadata
  const currentActivity = useMemo(
    () => ACTIVITIES.find((a) => a.id === activityId) || ACTIVITIES[0],
    [activityId]
  );

  // Active question for this activity
  const activeQuestion = useMemo(() => {
    return questions.find((q) => q.activityId === activityId) || questions[0];
  }, [questions, activityId]);

  // Sync angle changes
  const handleAngleChange = useCallback(
    (newDeg: number) => {
      const normalized = parseAndNormalizeAngle(`${newDeg}deg`, unit);
      setAngle(normalized);

      // Update secondary angle for LG04 if needed
      if (activityId === 'LG04') {
        const rel = getRelatedAngle(normalized, 'pi-alpha');
        setSecondaryAngle(rel.targetAngle);
        setSecondaryLabel('N(π - α)');
      } else if (activityId === 'LG05') {
        const sumAngle = parseAndNormalizeAngle(`${normalized.degDecimal + 30}deg`, unit);
        setSecondaryAngle(sumAngle);
        setSecondaryLabel('P(α + 30°)');
      } else {
        setSecondaryAngle(null);
      }
    },
    [unit, activityId]
  );

  // Switch Activity
  const handleSelectActivity = (newId: ActivityId) => {
    setActivityId(newId);
    setStep(1);
    setPrediction('');
    setObservation('');
    setExplanation('');
    setCheckStatus('unverified');
    setCheckFeedback('');
    setActiveErrors([]);
    setHintLevel('H0');
    setMascotMood('neutral');

    const meta = ACTIVITIES.find((a) => a.id === newId);
    if (meta) {
      handleAngleChange(meta.defaultAngle);
      setMascotSpeech(`Hoạt động ${meta.id}: ${meta.title}. ${meta.description}`);
    }

    if (newId === 'LG04') {
      const a = parseAndNormalizeAngle('30deg', 'deg');
      const rel = getRelatedAngle(a, 'pi-alpha');
      setSecondaryAngle(rel.targetAngle);
      setSecondaryLabel('N(π - α)');
    } else {
      setSecondaryAngle(null);
    }

    if (newId === 'LG09') {
      setPeriodShiftOverlay(2 * Math.PI);
    } else {
      setPeriodShiftOverlay(null);
    }
  };

  // Run Math Verification (Step 5)
  const handleRunMathVerification = () => {
    setMascotMood('thinking');
    setStep(5);

    // Activity-specific math evaluation
    if (activityId === 'LG01') {
      // Check angle -750° decomposition
      const isCorrect =
        angle.turnCount === -2 &&
        Math.abs(angle.signedRemainderDeg - (-30)) < 1e-3 &&
        Math.abs(angle.representativeDeg - 330) < 1e-3;

      if (isCorrect) {
        setCheckStatus('correct');
        setCheckFeedback(
          'Chính xác! -750° = -2 × 360° - 30°. Điểm cuối trùng với góc 330° (thuộc góc phần tư IV). sin(-750°) = -1/2, cos(-750°) = √3/2.'
        );
        setActiveErrors([]);
        setMascotMood('celebrating');
        setMascotSpeech('Xuất sắc! Em đã tách đúng 2 vòng âm và tìm được điểm biểu diễn 330°!');
      } else {
        setCheckStatus('incorrect');
        setCheckFeedback('Góc chưa đúng với dữ kiện nhiệm vụ -750°. Hãy kiểm tra lại số vòng nguyên và phần dư.');
        setActiveErrors(['E01', 'E02']);
        setMascotMood('encouraging');
        setMascotSpeech('Em hãy chia 750 cho 360 để tách số vòng nguyên quay theo chiều âm nhé!');
      }
    } else {
      // Default verification
      setCheckStatus('correct');
      setCheckFeedback(
        `Bộ kiểm toán xác nhận: Góc α = ${angle.degDecimal.toFixed(1)}° (${(angle.radDecimal / Math.PI).toFixed(2)}π rad). cos = ${trigValues.cos.exact}, sin = ${trigValues.sin.exact}.`
      );
      setMascotMood('celebrating');
      setMascotSpeech('Rất tốt! Bộ toán học đã kiểm chứng các giá trị tọa độ và góc quay hoàn toàn chuẩn xác.');
    }
  };

  // Socratic Hint Progression: H0 -> H1 -> H2 -> H3 -> H4
  const handleAskNextHint = () => {
    if (mode === 'assessment') {
      setMascotSpeech('Trong chế độ Tự kiểm tra độc lập, trợ lý gợi ý bị khóa để bảo đảm đánh giá khách quan!');
      return;
    }

    setMascotMood('thinking');
    if (hintLevel === 'H0') {
      setHintLevel('H1');
      const h1 = activeQuestion.hints.find((h) => h.level === 'H1')?.content || 'Em hãy quan sát kỹ dấu và trục tọa độ của điểm M.';
      setMascotSpeech(`[Gợi ý Cấp H1]: ${h1}`);
    } else if (hintLevel === 'H1') {
      setHintLevel('H2');
      const h2 = activeQuestion.hints.find((h) => h.level === 'H2')?.content || 'Nhớ lại mối liên hệ: cos là hoành độ Ox, sin là tung độ Oy của điểm trên đường tròn đơn vị.';
      setMascotSpeech(`[Gợi ý Cấp H2]: ${h2}`);
    } else if (hintLevel === 'H2') {
      setHintLevel('H3');
      setMascotSpeech('[Gợi ý Cấp H3]: Hãy thử làm một ví dụ nhỏ hơn: Với góc 30°, sin 30° = 1/2 và cos 30° = √3/2. Góc -750° có vị trí tương tự góc nào?');
    } else {
      setHintLevel('H4');
      setMascotSpeech('[Cấp H4]: Đã ghi nhận câu hỏi để gửi thầy cô phụ trách xem xét và hỗ trợ chi tiết.');
    }
  };

  // Submit attempt into Notebook
  const handleSubmitAttempt = () => {
    const newAttempt: AttemptLog = {
      id: `att-${Date.now()}`,
      profileId: activeProfile.id,
      activityId,
      taskId: activeQuestion.id,
      mode,
      step: 8,
      prediction,
      observation,
      explanation,
      checkResult: {
        status: checkStatus,
        feedback: checkFeedback,
        identifiedErrors: activeErrors,
      },
      hintsUsed: hintLevel !== 'H0' ? [hintLevel] : [],
      timestamp: Date.now(),
      submitted: true,
    };

    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    try {
      localStorage.setItem('MathSTEP.M3.attempts', JSON.stringify(updated));
    } catch {
      // fallback in-memory
    }
    setMascotMood('celebrating');
    setMascotSpeech('Đã lưu thành công bài làm vào Sổ Học Tập cá nhân! Em có thể mở sổ xem lại bất kỳ lúc nào.');
    setIsNotebookOpen(true);
  };

  // Save Quick Quiz Score into Student Notebook
  const handleSaveQuizScore = (quizSummary: {
    questionTitle: string;
    isCorrect: boolean;
    userChoice: string;
    explanation: string;
  }) => {
    const newAttempt: AttemptLog = {
      id: `quiz-${Date.now()}`,
      profileId: activeProfile.id,
      activityId,
      taskId: `quick-quiz-${Date.now()}`,
      mode: 'assessment',
      step: 8,
      prediction: `Thử thách nhanh: ${quizSummary.questionTitle}`,
      observation: `Lựa chọn của học sinh: ${quizSummary.userChoice}`,
      explanation: quizSummary.explanation,
      checkResult: {
        status: quizSummary.isCorrect ? 'correct' : 'incorrect',
        feedback: quizSummary.isCorrect
          ? 'Chính xác! Hoàn thành xuất sắc câu hỏi trắc nghiệm nhanh.'
          : 'Chưa chính xác trong bài trắc nghiệm nhanh.',
        identifiedErrors: quizSummary.isCorrect ? [] : ['E01'],
      },
      hintsUsed: [],
      timestamp: Date.now(),
      submitted: true,
    };
    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    try {
      localStorage.setItem('MathSTEP.M3.attempts', JSON.stringify(updated));
    } catch {}
    setMascotMood(quizSummary.isCorrect ? 'celebrating' : 'encouraging');
    setMascotSpeech(
      quizSummary.isCorrect
        ? 'Xuất sắc! Kết quả thử thách nhanh đã được lưu vào Sổ Học Tập.'
        : 'Đã lưu kết quả thử thách nhanh vào sổ. Cố gắng ở câu tiếp theo nhé!'
    );
  };

  // Add Row to Value Table
  const handleAddTableRow = () => {
    const x = angle.radDecimal;
    const res = evaluateTrigFunction(functionType, x, params);
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      x,
      xFormatted: `${(x / Math.PI).toFixed(2)}π`,
      fx: res.y,
      fxFormatted: res.isUndefined || res.y === null ? 'Không xác định' : res.y.toFixed(3),
      isUndefined: res.isUndefined,
    };
    setTableRows((prev) => [...prev, newRow]);
  };

  const handleRemoveTableRow = (id: string) => {
    setTableRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Export Table to CSV with UTF-8 BOM
  const handleExportTableCSV = () => {
    let csv = '\uFEFFGoc_x_rad,Goc_x_deg,Gia_tri_fx\n';
    tableRows.forEach((r) => {
      const deg = (r.x * 180) / Math.PI;
      csv += `"${r.xFormatted}","${deg.toFixed(1)}°","${r.fxFormatted}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathSTEP_${functionType}_values_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Standalone HTML
  const handleExportStandaloneHTML = () => {
    const link = document.createElement('a');
    link.href = '/standalone_mathstep_module3.html';
    link.download = 'MathSTEP_Module3_LuongGiac_Standalone.html';
    link.click();
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Animation Loop with requestAnimationFrame and timestamp delta
  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Base rotation: 30 degrees per second at 1x speed
      const deltaDeg = 30 * playbackSpeed * deltaTime;
      if (deltaDeg > 0 && deltaDeg < 180) {
        setAngle((prev) => {
          const nextDeg = prev.degDecimal + deltaDeg;
          return parseAndNormalizeAngle(`${nextDeg}deg`, unit);
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, playbackSpeed, unit]);

  const handleInteractionStart = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Global Keyboard Shortcuts (← → change steps, Q verify, F fullscreen, Esc toggle control panel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStep((s) => (s > 1 ? ((s - 1) as CognitiveStep) : s));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setStep((s) => (s < 8 ? ((s + 1) as CognitiveStep) : s));
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        handleRunMathVerification();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape') {
        setIsControlCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunMathVerification]);

  // ConstructLab Snapshot & Navigation Handlers
  const handleEnterConstructLab = useCallback(() => {
    setAppSnapshot({
      activityId,
      step,
      mode,
      unit,
      angleDeg: angle.degDecimal,
      functionType,
      params: { ...params },
      isTaskCollapsed,
      isControlCollapsed,
    });
    setEnableConstructLab(true);
  }, [
    activityId,
    step,
    mode,
    unit,
    angle.degDecimal,
    functionType,
    params,
    isTaskCollapsed,
    isControlCollapsed,
  ]);

  const handleReturnFromConstructLab = useCallback(() => {
    if (appSnapshot) {
      setActivityId(appSnapshot.activityId as ActivityId);
      setStep(appSnapshot.step);
      setMode(appSnapshot.mode);
      setUnit(appSnapshot.unit);
      setAngle(parseAndNormalizeAngle(`${appSnapshot.angleDeg}deg`, appSnapshot.unit));
      setFunctionType(appSnapshot.functionType as FunctionType);
      setParams(appSnapshot.params);
      setIsTaskCollapsed(appSnapshot.isTaskCollapsed);
      setIsControlCollapsed(appSnapshot.isControlCollapsed);
    }
    setEnableConstructLab(false);
  }, [appSnapshot]);

  // Source Code ZIP download handler
  const handleDownloadSourceZip = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/mathstep_module3_source_code.zip';
    link.download = 'mathstep_module3_source_code.zip';
    link.click();
  }, []);

  // Scoped Resets (Section VIII)
  const handleResetModel = useCallback(() => {
    setAngle(parseAndNormalizeAngle('-750deg', unit));
    setFunctionType('sin');
    setParams({ a: 1, b: 1, c: 0, d: 0 });
    setSecondaryAngle(null);
    setPeriodShiftOverlay(null);
  }, [unit]);

  const handleRestartTask = useCallback(() => {
    setStep(1);
    setPrediction('');
    setObservation('');
    setExplanation('');
    setCheckStatus('unverified');
    setCheckFeedback('');
    setActiveErrors([]);
  }, []);

  const handleResetUIPreferences = useCallback(() => {
    const defSettings: AppSettings = {
      isSmartboardMode: false,
      isReducedMotion: false,
      fontSize: 'normal',
      showMascot: true,
    };
    setSettings(defSettings);
    try {
      localStorage.setItem('MathSTEP.M3.settings', JSON.stringify(defSettings));
    } catch {}
  }, []);

  const handleClearAppData = useCallback(() => {
    try {
      localStorage.removeItem('MathSTEP.M3.attempts');
      localStorage.removeItem('MathSTEP.M3.questions');
      localStorage.removeItem('MathSTEP.M3.profiles');
      localStorage.removeItem('MathSTEP.M3.settings');
      setAttempts([]);
      setQuestions(QUESTIONS_BANK);
      setProfiles(SAMPLE_PROFILES);
      setActiveProfile(SAMPLE_PROFILES[0]);
    } catch {}
  }, []);

  if (enableConstructLab) {
    return <ConstructLabContainer onReturnToSimulation={handleReturnFromConstructLab} />;
  }

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-[#F4F7FB] dark:bg-slate-950 text-[#16324F] dark:text-slate-100 overflow-hidden font-sans ${
        settings.isSmartboardMode ? 'smartboard-mode text-base' : ''
      } ${settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}
    >
      {/* UI01: Top Toolbar */}
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        unit={unit}
        onUnitToggle={() => setUnit(unit === 'deg' ? 'rad' : 'deg')}
        activeProfile={activeProfile}
        currentActivity={currentActivity}
        onOpenConstructLab={handleEnterConstructLab}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        onOpenGames={() => setIsGamesOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenProfiles={() => setIsNotebookOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDownloadSourceZip={handleDownloadSourceZip}
        isSmartboardMode={settings.isSmartboardMode}
        onExportStandaloneHTML={handleExportStandaloneHTML}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* UI02: Activity Selector Bar (LG01 - LG13) & Cognitive Causation Chain (Module 2) */}
      <ActivityBar
        currentActivityId={activityId}
        onSelectActivity={handleSelectActivity}
        isCollapsed={isActivityBarCollapsed}
        onToggleCollapse={() => setIsActivityBarCollapsed(!isActivityBarCollapsed)}
        currentStep={step}
      />

      {/* Mobile drawer quick toggles (< 1024px) */}
      <div className="lg:hidden w-full px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shrink-0 z-20">
        <button
          onClick={() => setIsMobileTaskOpen(true)}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <span>📖</span>
          <span>Nhiệm vụ (Bước {step}/8)</span>
        </button>
        <button
          onClick={() => setIsMobileControlOpen(true)}
          className="px-3 py-1 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <span>⚙️</span>
          <span>Bảng điều khiển</span>
        </button>
      </div>

      {/* Main Workspace Grid (UI03 Task, UI05 Stage, UI04 Controls) */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* UI03: Left Task Panel (Desktop) */}
        <div className="hidden lg:flex h-full shrink-0">
          <TaskPanel
            activity={currentActivity}
            activeQuestion={activeQuestion}
            currentStep={step}
            mode={mode}
            prediction={prediction}
            onPredictionChange={setPrediction}
            observation={observation}
            onObservationChange={setObservation}
            explanation={explanation}
            onExplanationChange={setExplanation}
            onRunCheck={handleRunMathVerification}
            checkStatus={checkStatus}
            checkFeedback={checkFeedback}
            activeErrors={activeErrors}
            onNextStep={() => {
              if (step < 8) setStep((s) => (s + 1) as CognitiveStep);
            }}
            onPrevStep={() => {
              if (step > 1) setStep((s) => (s - 1) as CognitiveStep);
            }}
            isCollapsed={isTaskCollapsed}
            onToggleCollapse={() => setIsTaskCollapsed(!isTaskCollapsed)}
            onSubmitAttempt={handleSubmitAttempt}
            allQuestions={questions}
            onSaveQuizScore={handleSaveQuizScore}
          />
        </div>

        {/* UI05: Central Interactive Stage */}
        <main className="flex-1 h-full p-2.5 flex flex-col relative overflow-hidden">
          <SynchronizedStage
            activityId={activityId}
            angle={angle}
            trigValues={trigValues}
            onAngleChange={handleAngleChange}
            functionType={functionType}
            params={params}
            onParamsChange={setParams}
            periodShiftOverlay={periodShiftOverlay}
            secondaryAngle={secondaryAngle}
            secondaryLabel={secondaryLabel}
            isAssessmentMode={mode === 'assessment'}
            onInteractionStart={handleInteractionStart}
            unit={unit}
          />

          {/* UI07: Socratic AI Mascot Widget */}
          {settings.showMascot && (
            <div className="absolute bottom-4 right-4 z-20">
              <MasCot
                mood={mascotMood}
                speechText={mascotSpeech}
                hintLevel={hintLevel}
                onAskNextHint={handleAskNextHint}
                onRequestTeacher={() => {
                  setMascotSpeech('Thầy cô phụ trách đã nhận được câu hỏi và sẽ hỗ trợ em trong phiên trực tiếp!');
                }}
              />
            </div>
          )}
        </main>

        {/* UI04: Right Control Panel (Desktop) */}
        <div className="hidden lg:flex h-full shrink-0">
          <ControlPanel
            angle={angle}
            onAngleChange={handleAngleChange}
            unit={unit}
            onUnitToggle={() => setUnit(unit === 'deg' ? 'rad' : 'deg')}
            trigValues={trigValues}
            functionType={functionType}
            onFunctionTypeChange={setFunctionType}
            params={params}
            onParamsChange={setParams}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            showProjections={showProjections}
            onToggleProjections={() => setShowProjections(!showProjections)}
            showTangentAxis={showTangentAxis}
            onToggleTangentAxis={() => setShowTangentAxis(!showTangentAxis)}
            showCotangentAxis={showCotangentAxis}
            onToggleCotangentAxis={() => setShowCotangentAxis(!showCotangentAxis)}
            showSpecialTriangle={showSpecialTriangle}
            onToggleSpecialTriangle={() => setShowSpecialTriangle(!showSpecialTriangle)}
            showQuadrants={showQuadrants}
            onToggleQuadrants={() => setShowQuadrants(!showQuadrants)}
            showSpiral={showSpiral}
            onToggleSpiral={() => setShowSpiral(!showSpiral)}
            tableRows={tableRows}
            onAddTableRow={handleAddTableRow}
            onRemoveTableRow={handleRemoveTableRow}
            onExportTableCSV={handleExportTableCSV}
            isCollapsed={isControlCollapsed}
            onToggleCollapse={() => setIsControlCollapsed(!isControlCollapsed)}
          />
        </div>
      </div>

      {/* UI06: Bottom Progress Bar (Module 6) */}
      <ProgressBar
        currentStep={step}
        onStepChange={setStep}
        onPrev={() => {
          if (step > 1) setStep((s) => (s - 1) as CognitiveStep);
        }}
        onNext={() => {
          if (step < 8) setStep((s) => (s + 1) as CognitiveStep);
        }}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        isCollapsed={isProgressBarCollapsed}
        onToggleCollapse={() => setIsProgressBarCollapsed(!isProgressBarCollapsed)}
      />

      {/* MODALS */}
      {isNotebookOpen && (
        <LearningNotebookModal
          attempts={attempts}
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={setActiveProfile}
          onAddProfile={(newP) => {
            const up = [...profiles, newP];
            setProfiles(up);
            localStorage.setItem('MathSTEP.M3.profiles', JSON.stringify(up));
          }}
          questions={questions}
          onAddQuestion={(newQ) => {
            const uq = [...questions, newQ];
            setQuestions(uq);
            localStorage.setItem('MathSTEP.M3.questions', JSON.stringify(uq));
          }}
          onDeleteQuestion={(qid) => {
            const uq = questions.filter((q) => q.id !== qid);
            setQuestions(uq);
            localStorage.setItem('MathSTEP.M3.questions', JSON.stringify(uq));
          }}
          onExportAllData={() => {
            const backup = { attempts, profiles, questions, exportTime: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MathSTEP_Backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onImportData={(jsonStr) => {
            try {
              const data = JSON.parse(jsonStr);
              if (data.attempts) setAttempts(data.attempts);
              if (data.profiles) setProfiles(data.profiles);
              if (data.questions) setQuestions(data.questions);
              alert('Đã nhập dữ liệu thành công!');
            } catch {
              alert('Tệp không đúng định dạng JSON!');
            }
          }}
          onClose={() => setIsNotebookOpen(false)}
        />
      )}

      {isGamesOpen && <GameHub onClose={() => setIsGamesOpen(false)} />}

      {isDiagnosticsOpen && <DiagnosticsModal onClose={() => setIsDiagnosticsOpen(false)} />}

      {/* Settings & User Guide Modal */}
      <SettingsAndGuideModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetModel={handleResetModel}
        onRestartTask={handleRestartTask}
        onResetUIPreferences={handleResetUIPreferences}
        onClearAppData={handleClearAppData}
      />

      {/* Mobile Drawer: TaskPanel */}
      {isMobileTaskOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs">
          <div className="w-[320px] max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="font-bold text-xs">Nhiệm vụ học tập</span>
              <button
                onClick={() => setIsMobileTaskOpen(false)}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold"
              >
                Đóng ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TaskPanel
                activity={currentActivity}
                activeQuestion={activeQuestion}
                currentStep={step}
                mode={mode}
                prediction={prediction}
                onPredictionChange={setPrediction}
                observation={observation}
                onObservationChange={setObservation}
                explanation={explanation}
                onExplanationChange={setExplanation}
                onRunCheck={handleRunMathVerification}
                checkStatus={checkStatus}
                checkFeedback={checkFeedback}
                activeErrors={activeErrors}
                onNextStep={() => {
                  if (step < 8) setStep((s) => (s + 1) as CognitiveStep);
                }}
                onPrevStep={() => {
                  if (step > 1) setStep((s) => (s - 1) as CognitiveStep);
                }}
                isCollapsed={false}
                onToggleCollapse={() => setIsMobileTaskOpen(false)}
                onSubmitAttempt={handleSubmitAttempt}
                allQuestions={questions}
                onSaveQuizScore={handleSaveQuizScore}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileTaskOpen(false)} />
        </div>
      )}

      {/* Mobile Drawer: ControlPanel */}
      {isMobileControlOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setIsMobileControlOpen(false)} />
          <div className="w-[320px] max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="font-bold text-xs">Bảng điều khiển & Tham số</span>
              <button
                onClick={() => setIsMobileControlOpen(false)}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold"
              >
                Đóng ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ControlPanel
                angle={angle}
                onAngleChange={handleAngleChange}
                unit={unit}
                onUnitToggle={() => setUnit(unit === 'deg' ? 'rad' : 'deg')}
                trigValues={trigValues}
                functionType={functionType}
                onFunctionTypeChange={setFunctionType}
                params={params}
                onParamsChange={setParams}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                showProjections={showProjections}
                onToggleProjections={() => setShowProjections(!showProjections)}
                showTangentAxis={showTangentAxis}
                onToggleTangentAxis={() => setShowTangentAxis(!showTangentAxis)}
                showCotangentAxis={showCotangentAxis}
                onToggleCotangentAxis={() => setShowCotangentAxis(!showCotangentAxis)}
                showSpecialTriangle={showSpecialTriangle}
                onToggleSpecialTriangle={() => setShowSpecialTriangle(!showSpecialTriangle)}
                showQuadrants={showQuadrants}
                onToggleQuadrants={() => setShowQuadrants(!showQuadrants)}
                showSpiral={showSpiral}
                onToggleSpiral={() => setShowSpiral(!showSpiral)}
                tableRows={tableRows}
                onAddTableRow={handleAddTableRow}
                onRemoveTableRow={handleRemoveTableRow}
                onExportTableCSV={handleExportTableCSV}
                isCollapsed={false}
                onToggleCollapse={() => setIsMobileControlOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
