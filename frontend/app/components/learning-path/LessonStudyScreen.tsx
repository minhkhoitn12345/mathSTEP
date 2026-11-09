"use client";

import React, { useState, useMemo } from "react";
import { DetailedLessonContent, WorkedStep } from "../../types/learningPath";
import { MathFormattedText } from "../KatexMath";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
  RotateCcw,
  Compass,
  Box,
  Activity,
  Play,
  Send,
  X,
  ChevronRight,
} from "lucide-react";
import { OptiMascot } from "../optimath/mascot/OptiMascot";

interface LessonStudyScreenProps {
  content: DetailedLessonContent;
  onBackToRoadmap: () => void;
  onCompleteAndNext: (lessonId: string, scorePercentage: number, xpEarned: number) => void;
  onOpenSimulation: (moduleId: string, lessonId: string) => void;
  isCompleted?: boolean;
}

export function LessonStudyScreen({
  content,
  onBackToRoadmap,
  onCompleteAndNext,
  onOpenSimulation,
  isCompleted = false,
}: LessonStudyScreenProps) {
  // Checkpoint question state: checkpointId -> selectedOptionId
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, string>>({});
  const [showCheckpointHints, setShowCheckpointHints] = useState<Record<string, boolean>>({});

  // Review Quiz state: questionId -> selectedOptionId
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Optional Socratic AI Assistant Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: `Chào em! Thầy là **Trợ lý Socratic Opti**. Thầy đang cùng em học **${content.code}: ${content.title}**.\n\nNếu em gặp khó khăn ở công thức nào hay cần gợi ý giải bài tập tự luyện, hãy nhắn cho thầy nhé! Thầy sẽ đặt câu hỏi gợi mở để giúp em tự khám phá câu trả lời.`,
    },
  ]);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiBusy, setAiBusy] = useState<boolean>(false);

  // Quiz score calculation
  const quizScore = useMemo(() => {
    if (!content.reviewQuiz || content.reviewQuiz.length === 0) return 100;
    let correct = 0;
    content.reviewQuiz.forEach((q) => {
      const selected = quizAnswers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        correct++;
      }
    });
    return Math.round((correct / content.reviewQuiz.length) * 100);
  }, [content.reviewQuiz, quizAnswers]);

  // Handle checkpoint option selection
  const handleSelectCheckpointOption = (qId: string, optId: string) => {
    setCheckpointAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  // Handle review quiz option selection
  const handleSelectQuizOption = (qId: string, optId: string) => {
    if (quizSubmitted) return; // Prevent changing after submit
    setQuizAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  // Handle Socratic AI send message
  const handleSendAiMessage = async (textToSend?: string) => {
    const text = textToSend || aiInput.trim();
    if (!text || aiBusy) return;

    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", text }]);
    setAiBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[Bài học đang học: ${content.code} - ${content.title} (${content.moduleId})]\nCâu hỏi của học sinh: ${text}`,
          conversationId: `study-${content.lessonId}`,
          systemContext: `Bạn là Trợ lý Toán học Socratic Opti đồng hành cùng học sinh trong bài học: ${content.title}. Mục tiêu bài học: ${content.objectives.join("; ")}. Nguyên tắc: Trả lời bằng tiếng Việt thân thiện, gợi mở từng bước, không đưa lời giải trọn vẹn ngay, dùng câu hỏi dẫn dắt kiểu Socratic.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply || data.response || "Thầy đã nhận được câu hỏi của em!" },
        ]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Em hãy xem lại các điều kiện áp dụng trong phần Lý thuyết và thử liên hệ với giả thiết của bài toán xem sao nhé!",
          },
        ]);
      }
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Em hãy xem lại ví dụ mẫu tuần tự ở Bước 1 và Bước 2, để ý xem ta đã áp dụng công thức nào nhé!",
        },
      ]);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 1. TOP STICKY TOOLBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToRoadmap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="Quay lại danh sách lộ trình bài học"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lộ trình học</span>
              <span className="sm:hidden">Lộ trình</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800 shrink-0">
                  {content.code}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {content.title}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Top Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Nút Mở phòng mô phỏng bài này */}
            <button
              type="button"
              onClick={() => onOpenSimulation(content.moduleId, content.lessonId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Mở ngay phòng mô phỏng tương tác chuyên biệt cho bài này"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Mở mô phỏng</span>
            </button>

            {/* Nút Kích hoạt Trợ lý Socratic AI */}
            <button
              type="button"
              onClick={() => setAiDrawerOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-300 text-purple-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Hỏi trợ lý Socratic Opti"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Hỏi Socratic AI</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN LESSON STUDY WORKSPACE */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Banner tiêu đề bài học */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              {content.code} · TOÁN LỚP {content.grade}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              +{content.xpReward} XP Hoàn thành
            </span>
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Đã hoàn thành bài này
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {content.subtitle}
          </p>

          {/* Quick simulation banner */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
              <Play className="w-4 h-4 text-blue-600 shrink-0 fill-current" />
              <span>Bài học có phòng thí nghiệm: <strong>{content.simulationRef.labName}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => onOpenSimulation(content.moduleId, content.lessonId)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Vào mô phỏng</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* PHẦN 1: MỤC TIÊU BÀI HỌC */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Mục Tiêu Bài Học (Learning Objectives)
            </h2>
          </div>

          <div className="space-y-2.5 pt-1">
            {content.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <MathFormattedText text={obj} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHẦN 2: LÝ THUYẾT NGẮN GỌN (LITE THEORY) */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Lý Thuyết Cốt Lõi & Điều Kiện Áp Dụng
            </h2>
          </div>

          {/* Core Concept Text */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <MathFormattedText text={content.theory.coreConcept} />
          </div>

          {/* Formulas list */}
          {content.theory.formulas.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Công thức & Điều kiện toán học
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {content.theory.formulas.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5"
                  >
                    <div className="text-sm sm:text-base font-bold text-blue-900">
                      <MathFormattedText text={`$${item.formula}$`} />
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {item.meaning}
                    </div>
                    {item.conditions && (
                      <div className="text-[11px] text-amber-800 bg-amber-100/60 border border-amber-200/60 px-2 py-1 rounded-lg inline-block">
                        <strong>Điều kiện:</strong> <MathFormattedText text={item.conditions} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes list */}
          {content.theory.notes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lưu ý quan trọng
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {content.theory.notes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>
                      <MathFormattedText text={note} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mini Tip Box (Mẹo nhớ nhanh) */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs font-medium">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Mẹo nhớ nhanh (Cheat Sheet):</strong> {content.theory.miniTip}
            </div>
          </div>
        </section>

        {/* PHẦN 3: VÍ DỤ MINH HỌA TUẦN TỰ (WORKED EXAMPLE) */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Ví Dụ Minh Họa Tuần Tự Có Lý Giải (Worked Example)
            </h2>
          </div>

          {/* Problem Statement */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-xs sm:text-sm text-purple-950 font-medium leading-relaxed">
            <strong>Đề bài:</strong> <MathFormattedText text={content.workedExample.problemStatement} />
          </div>

          {/* Step-by-step reasoning cards */}
          <div className="space-y-3.5">
            {content.workedExample.steps.map((step: WorkedStep) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 relative"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {step.title}
                  </span>
                </div>

                {step.mathExpression && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs sm:text-sm text-blue-900">
                    <MathFormattedText text={`$$${step.mathExpression}$$`} />
                  </div>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">
                  <MathFormattedText text={step.explanation} />
                </p>

                {/* Sư phạm: Rationale */}
                <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1.5 rounded-xl flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lý giải sư phạm:</strong> {step.rationale}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            ✓ Kết luận: {content.workedExample.conclusion}
          </div>
        </section>

        {/* PHẦN 4: CÂU HỎI TỰ LUYỆN SAU MỖI PHẦN (CHECKPOINTS) */}
        {content.checkpoints.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Tự Luyện Kiểm Tra Nhanh (Checkpoints)
              </h2>
            </div>

            <div className="space-y-6">
              {content.checkpoints.map((cp) => {
                const selectedOpt = checkpointAnswers[cp.id];
                const isSelectedCorrect = cp.options.find((o) => o.id === selectedOpt)?.isCorrect;
                const showHint = showCheckpointHints[cp.id];

                return (
                  <div key={cp.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      <MathFormattedText text={cp.question} />
                    </p>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-2">
                      {cp.options.map((opt) => {
                        const isChosen = selectedOpt === opt.id;
                        let optStyle = "bg-white border-slate-200 text-slate-800 hover:border-blue-400";
                        if (isChosen) {
                          optStyle = opt.isCorrect
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500"
                            : "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-1 ring-rose-500";
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectCheckpointOption(cp.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                {opt.id}
                              </span>
                              <span>
                                <MathFormattedText text={opt.text} />
                              </span>
                            </div>
                            {isChosen && (
                              <span>
                                {opt.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-rose-600" />
                                )}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Socratic Hint Button */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setShowCheckpointHints((prev) => ({ ...prev, [cp.id]: !prev[cp.id] }))
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? "Ẩn gợi ý" : "Cần gợi ý Socratic?"}</span>
                      </button>
                    </div>

                    {/* Hint reveal */}
                    {showHint && (
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium">
                        💡 <strong>Gợi ý:</strong> {cp.socraticHint}
                      </div>
                    )}

                    {/* Result feedback */}
                    {selectedOpt && (
                      <div
                        className={`p-3 rounded-xl text-xs ${
                          isSelectedCorrect
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border border-rose-200 text-rose-900"
                        }`}
                      >
                        {isSelectedCorrect ? (
                          <>
                            <strong>Chính xác!</strong> {cp.explanationCorrect}
                          </>
                        ) : (
                          <>
                            <strong>Chưa chính xác:</strong> {cp.explanationIncorrect}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PHẦN 5: BÀI ÔN TẬP NGẮN CUỐI BÀI (MINI REVIEW QUIZ) */}
        {content.reviewQuiz.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Bài Ôn Tập Ngắn Cuối Bài (Review Quiz)
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {content.reviewQuiz.length} Câu hỏi kiểm tra
              </span>
            </div>

            <div className="space-y-5">
              {content.reviewQuiz.map((q, idx) => {
                const selectedOpt = quizAnswers[q.id];
                const correctOpt = q.options.find((o) => o.isCorrect);
                const isCorrect = selectedOpt === correctOpt?.id;

                return (
                  <div key={q.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      Câu {idx + 1}: <MathFormattedText text={q.question} />
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const isChosen = selectedOpt === opt.id;
                        let optStyle = "bg-white border-slate-200 text-slate-800 hover:border-amber-400";
                        if (quizSubmitted) {
                          if (opt.isCorrect) {
                            optStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500";
                          } else if (isChosen) {
                            optStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                          }
                        } else if (isChosen) {
                          optStyle = "bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-500";
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuizOption(q.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                {opt.id}
                              </span>
                              <span>
                                <MathFormattedText text={opt.text} />
                              </span>
                            </div>
                            {quizSubmitted && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback when submitted */}
                    {quizSubmitted && (
                      <div
                        className={`p-3 rounded-xl text-xs ${
                          isCorrect
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border border-rose-200 text-rose-900"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <strong>Giải thích:</strong> {q.explanationCorrect}
                          </>
                        ) : (
                          <>
                            <strong>Chưa đúng:</strong> {q.explanationIncorrect}
                            {q.errorTag && (
                              <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900">
                                Mã lỗi: {q.errorTag}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Action */}
            {!quizSubmitted ? (
              <button
                type="button"
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < content.reviewQuiz.length}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Nộp bài & Xem giải thích chi tiết</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="text-xs text-amber-950">
                  Điểm số ôn tập của em: <strong>{quizScore}%</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Làm lại bài ôn tập
                </button>
              </div>
            )}
          </section>
        )}

        {/* PHẦN 6 & 7: NÚT HOÀN THÀNH & MỞ PHÒNG MÔ PHỎNG */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>HOÀN TẤT BÀI HỌC</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              Em đã sẵn sàng hoàn thành bài này?
            </h3>
            <p className="text-xs text-blue-100 max-w-md">
              Nhấn hoàn thành để ghi nhận tiến độ học, nhận +{content.xpReward} XP và tự động mở bài học tiếp theo trong chuyên đề.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* Nút Mở phòng mô phỏng */}
            <button
              type="button"
              onClick={() => onOpenSimulation(content.moduleId, content.lessonId)}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Phòng mô phỏng</span>
            </button>

            {/* Nút Hoàn thành và Chuyển bài */}
            <button
              type="button"
              onClick={() => onCompleteAndNext(content.lessonId, quizScore, content.xpReward)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Hoàn thành & Bài tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* 3. OPTIONAL SOCRATIC AI DRAWER (EMBEDDED) */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* AI Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-[#0B132B] to-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <OptiMascot expression="happy" size={24} animate={false} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Trợ lý Socratic Opti</h4>
                <p className="text-[10px] text-slate-300">Hỗ trợ bài: {content.code}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAiDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Messages Scroll List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  <MathFormattedText text={msg.text} />
                </div>
              </div>
            ))}
            {aiBusy && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                <span>Opti đang suy ngẫm câu hỏi gợi mở...</span>
              </div>
            )}
          </div>

          {/* Socratic Quick Prompts */}
          <div className="p-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] bg-slate-50">
            <button
              type="button"
              onClick={() => handleSendAiMessage("Gợi ý cho em bước giải của Ví dụ mẫu?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shrink-0 cursor-pointer"
            >
              💡 Gợi ý ví dụ
            </button>
            <button
              type="button"
              onClick={() => handleSendAiMessage("Giải thích lại công thức cốt lõi bằng cách khác?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shrink-0 cursor-pointer"
            >
              📖 Giảng lại công thức
            </button>
            <button
              type="button"
              onClick={() => handleSendAiMessage("Em đang phân vân câu hỏi kiểm tra, thầy gợi ý giúp em nhé?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shrink-0 cursor-pointer"
            >
              ❓ Gợi ý câu hỏi
            </button>
          </div>

          {/* AI Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendAiMessage();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Hỏi Opti về bài học này..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={aiBusy || !aiInput.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
