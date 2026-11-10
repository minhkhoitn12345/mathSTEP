"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, SessionData } from "@/app/components/optimath/Header";
import { Footer } from "@/app/components/optimath/Footer";
import { LessonStudyScreen } from "@/app/components/learning-path/LessonStudyScreen";
import { LessonTheoryScreen } from "@/app/components/learning-path/LessonTheoryScreen";
import { TeacherGuideModal } from "@/app/components/optimath/TeacherGuideModal";
import { KnowledgeBaseModal } from "@/app/components/optimath/KnowledgeBaseModal";
import AccountSettingsModal, { CustomAiConfig } from "@/app/components/AccountSettingsModal";
import ChatHistoryModal from "@/app/components/ChatHistoryModal";
import SocraticChatDrawer, { ChatMessage } from "@/app/components/SocraticChatDrawer";
import { generateSmartSocraticResponse } from "@/app/lib/smartSocratic";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import { getLessonDetailedContent } from "@/app/data/learningPathData";
import { SpatialGeometryLab } from "@/app/components/spatial-geometry/SpatialGeometryLab";
import { TrigonometryLab } from "@/app/components/trigonometry/TrigonometryLab";
import {
  hasCompletedLessonTheory,
  loadUserLearningProgress,
  markLessonTheoryCompleted,
  markLessonCompleted,
  setLastActiveLesson,
} from "@/app/lib/learningProgressStorage";
import { syncLeaderboardProgress } from "@/app/lib/leaderboardClient";
import { UserLearningProgress } from "@/app/types/learningPath";
import {
  ArrowLeft,
  Play,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface LessonStudyClientPageProps {
  moduleId: string;
  lessonId: string;
  stage?: "theory" | "practice";
}

export default function LessonStudyClientPage({
  moduleId,
  lessonId,
  stage = "theory",
}: LessonStudyClientPageProps) {
  const router = useRouter();

  // 1. Resolve Lesson and Parent Module
  const lessonContent = useMemo(() => {
    return getLessonDetailedContent(lessonId);
  }, [lessonId]);

  const parentModule = useMemo(() => {
    return CORE_3_MODULES.find((m) => m.id === moduleId);
  }, [moduleId]);

  // Check if valid match
  const isValidLesson = Boolean(
    lessonContent && parentModule && lessonContent.moduleId === moduleId
  );

  // 2. User Learning Progress
  const [userProgress, setUserProgress] = useState<UserLearningProgress>(() =>
    loadUserLearningProgress()
  );
  const [practiceAccessLessonId, setPracticeAccessLessonId] = useState<string | null>(null);
  const [simulationOpen, setSimulationOpen] = useState(false);

  useEffect(() => {
    if (!simulationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSimulationOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [simulationOpen]);

  useEffect(() => {
    if (stage !== "practice" || !isValidLesson) return;
    if (!hasCompletedLessonTheory(lessonId)) {
      router.replace(`/learn/${moduleId}/${lessonId}`);
      return;
    }
    setPracticeAccessLessonId(lessonId);
  }, [isValidLesson, lessonId, moduleId, router, stage]);

  // Sync active lesson on mount
  useEffect(() => {
    if (isValidLesson) {
      setLastActiveLesson(lessonId);
      setUserProgress(loadUserLearningProgress());
    }
  }, [isValidLesson, lessonId]);

  // 3. User session & auth state
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // 4. Modals state
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<"profile" | "ai">("ai");
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig | null>(null);

  // 5. Socratic Chat state
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");

  // Initialize Socratic welcome message for this lesson
  useEffect(() => {
    localStorage.removeItem("mathstep:custom_ai_config");
    localStorage.removeItem("mathstep:user_profile");
    setConversationId(`opti-${lessonId}-${Date.now()}`);
    if (lessonContent) {
      setChatMessages([
        {
          id: "opti-welcome-study",
          role: "assistant",
          content: `Xin chào em! Thầy là **Trợ lý Socratic Opti** đồng hành cùng em trong **${lessonContent.code}: ${lessonContent.title}** (${parentModule?.shortTitle || ""}).\n\nEm cần thầy gợi ý bước giải ví dụ, giải thích công thức hay làm rõ bài tập tự luyện nào?`,
        },
      ]);
    }
  }, [lessonContent, lessonId, parentModule]);

  // Check user session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setSession({
            authenticated: true,
            name: data.name,
            email: data.email,
            role: data.role,
            provider: data.provider,
          });
        } else {
          setSession({ authenticated: false, name: null, email: null });
        }
      }
    } catch {
      setSession({ authenticated: false, name: null, email: null });
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  // Complete and Next Lesson handler
  const handleCompleteAndNext = (
    lId: string,
    scorePercentage: number,
    xpEarned: number
  ) => {
    const updated = markLessonCompleted(lId, scorePercentage, xpEarned);
    setUserProgress(updated);
    if (session?.authenticated) void syncLeaderboardProgress(updated);

    // Find next lesson in the entire 15 lessons curriculum
    const allLessons = CORE_3_MODULES.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === lId);

    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      router.push(`/learn/${nextLesson.moduleId}/${nextLesson.id}`);
    } else {
      // Completed all 15 lessons -> Return to home catalog
      router.push("/");
    }
  };

  const handleRewardLesson = (lId: string, scorePercentage: number, xpEarned: number) => {
    const updated = markLessonCompleted(lId, scorePercentage, xpEarned);
    setUserProgress(updated);
    if (session?.authenticated) void syncLeaderboardProgress(updated);
  };

  // Open simulation lab handler
  const handleOpenSimulation = (modId: string, lId: string) => {
    if (modId === moduleId && lId === lessonId && (modId === "spatial_geometry" || modId === "trigonometry")) {
      setSimulationOpen(true);
      return;
    }
    const lessonUrl = stage === "practice" ? `/learn/${modId}/${lId}/practice` : `/learn/${modId}/${lId}`;
    router.push(`/?view=${modId}&lesson=${lId}&returnTo=${encodeURIComponent(lessonUrl)}`);
  };

  // Chat message send handler
  const handleSendMessage = async (customMessage?: string) => {
    const text = (customMessage || chatInput).trim();
    if (!text || chatBusy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatBusy(true);
    setChatError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId || `opti-${lessonId}`,
          message: text,
          learning_context: {
            module: moduleId,
            lesson_id: lessonId,
          },
          custom_ai: customAiConfig || undefined,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const fallbackAnswer = generateSmartSocraticResponse(text, moduleId, lessonId).answer;
        const reply =
          data.reply ||
          data.content ||
          data.message ||
          fallbackAnswer;
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: reply,
        };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        const fallback = generateSmartSocraticResponse(text, moduleId, lessonId).answer;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-fallback-${Date.now()}`,
            role: "assistant",
            content: fallback,
          },
        ]);
      }
    } catch {
      const fallback = generateSmartSocraticResponse(text, moduleId, lessonId).answer;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: fallback,
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  // If lesson is invalid (404 state)
  if (!isValidLesson || !lessonContent) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <Header
          currentModule="home"
          onSelectModule={(mod) => {
            if (mod === "home") router.push("/");
            else if (mod === "linear_programming" || mod === "spatial_geometry" || mod === "trigonometry") router.push(`/?focusModule=${mod}`);
            else router.push(`/?view=${mod}`);
          }}
          onOpenTeacherGuide={() => setIsTeacherModalOpen(true)}
          session={session}
          sessionLoading={sessionLoading}
        />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-slate-900">
                Không tìm thấy bài học
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bài học có mã <code className="text-blue-600 font-bold">{lessonId}</code> không
                tồn tại trong chuyên đề <code className="text-blue-600 font-bold">{moduleId}</code>{" "}
                hoặc đường dẫn đã được cập nhật.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Mục lục Bài học</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Khám phá 3 Chuyên đề chính:
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {CORE_3_MODULES.map((m) => (
                  <Link
                    key={m.id}
                    href={`/learn/${m.id}/${m.lessons[0].id}`}
                    className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    <span>{m.title}</span>
                    <span className="text-[10px] text-slate-400">5 bài →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Normal Study Screen Render
  const isCompleted = userProgress.completedLessonIds.includes(lessonId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* 1. Header with Full Auth & Tools */}
      <Header
        currentModule={moduleId}
        onSelectModule={(mod) => {
          if (mod === "home") router.push("/");
          else if (mod === "learning_path") router.push("/");
          else if (mod === "linear_programming" || mod === "spatial_geometry" || mod === "trigonometry") router.push(`/?focusModule=${mod}`);
          else router.push(`/?view=${mod}`);
        }}
        onOpenTeacherGuide={() => setIsTeacherModalOpen(true)}
        onToggleChatDrawer={() => setChatDrawerOpen((prev) => !prev)}
        chatDrawerOpen={chatDrawerOpen}
        session={session}
        sessionLoading={sessionLoading}
        onOpenAccountModal={(tab) => {
          setAccountModalTab(tab);
          setAccountModalOpen(true);
        }}
        onOpenChatHistory={() => setChatHistoryOpen(true)}
        onOpenAuthModal={() => router.push("/?auth=login")}
        onLogout={async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
            setSession({ authenticated: false, name: null, email: null });
          } catch {
            // ignore
          }
        }}
      />

      {/* 2. Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-20 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer shrink-0"
              title="Quay lại mục lục bài học"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Mục lục</span>
            </Link>

            <span className="text-slate-300">/</span>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                moduleId === "linear_programming"
                  ? "bg-blue-100 text-blue-800"
                  : moduleId === "spatial_geometry"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {parentModule?.code} · Lớp {parentModule?.grade}
            </span>

            <span className="text-slate-300 hidden sm:inline">/</span>

            <span className="font-extrabold text-slate-900 truncate hidden sm:inline">
              {lessonContent.code}: {lessonContent.title}
            </span>
          </div>

          {/* Quick Simulation Link & Socratic AI Button */}
          <div className="flex items-center gap-2 shrink-0">
            {stage === "practice" && (
            <button
              type="button"
              onClick={() => handleOpenSimulation(moduleId, lessonId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
              title="Mở phòng thí nghiệm mô phỏng cho bài học này"
            >
              <Play className="w-3 h-3 fill-current text-blue-600" />
              <span className="hidden xs:inline">Mở</span>
              <span>Mô phỏng</span>
            </button>
            )}

            <button
              type="button"
              onClick={() => setChatDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs cursor-pointer"
              title="Hỏi Trợ lý Socratic AI Opti"
            >
              <Sparkles className="w-3 h-3" />
              <span>Hỏi Opti AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage 1 is theory only; stage 2 is guided procedure and practice. */}
      <main className="flex-1 py-4 sm:py-6">
        {stage === "theory" ? (
          <LessonTheoryScreen
            key={`theory-${lessonId}`}
            content={lessonContent}
            onStartGuidedPractice={() => {
              markLessonTheoryCompleted(lessonId);
              router.push(`/learn/${moduleId}/${lessonId}/practice`);
            }}
          />
        ) : practiceAccessLessonId !== lessonId ? (
          <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm font-semibold text-slate-500" role="status">
            Đang mở phần lý thuyết trước khi luyện tập…
          </div>
        ) : (
          <LessonStudyScreen
            key={`practice-${lessonId}`}
            content={lessonContent}
            onBackToTheory={() => router.push(`/learn/${moduleId}/${lessonId}`)}
            onRewardLesson={handleRewardLesson}
            onCompleteAndNext={handleCompleteAndNext}
            onOpenSimulation={handleOpenSimulation}
            isCompleted={isCompleted}
          />
        )}
      </main>

      {simulationOpen && lessonContent && (
        <div className="fixed inset-0 z-[70] bg-slate-950/75 p-2 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label={`Mô phỏng bài ${lessonContent.title}`}>
          <section className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:rounded-3xl">
            <header className="z-10 flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
              <button type="button" onClick={() => setSimulationOpen(false)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100" aria-label="Quay lại bài học">
                <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Quay lại bài học</span><span className="sm:hidden">Quay lại</span>
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Mô phỏng gắn với bài học · {lessonContent.code}</p>
                <h2 className="truncate text-sm font-black text-slate-900 sm:text-base">{lessonContent.title}</h2>
                <p className="hidden truncate text-xs text-slate-500 sm:block">Hãy thao tác trên hình để kiểm chứng ý tưởng, rồi quay lại tiếp tục bước giải đang học.</p>
              </div>
              <button type="button" onClick={() => { setSimulationOpen(false); setChatDrawerOpen(true); }} className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-700">
                <Sparkles className="h-3.5 w-3.5" /><span className="hidden sm:inline">Hỏi Opti</span>
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {moduleId === "spatial_geometry" ? (
                <SpatialGeometryLab embedded initialLessonIndex={Math.max(0, (lessonContent.order || 1) - 1)} onBackToHome={() => setSimulationOpen(false)} onOpenSocraticDrawer={(context) => { setSimulationOpen(false); setChatDrawerOpen(true); if (context) setChatInput(context); }} />
              ) : moduleId === "trigonometry" ? (
                <TrigonometryLab embedded initialLessonIndex={Math.max(0, (lessonContent.order || 1) - 1)} onBackToHome={() => setSimulationOpen(false)} onOpenSocraticDrawer={(context) => { setSimulationOpen(false); setChatDrawerOpen(true); if (context) setChatInput(context); }} />
              ) : null}
            </div>
          </section>
        </div>
      )}

      {/* 4. Socratic Chat Drawer */}
      <SocraticChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        messages={chatMessages}
        input={chatInput}
        onInputChange={setChatInput}
        onSendMessage={handleSendMessage}
        busy={chatBusy}
        error={chatError}
        moduleTitle={`${parentModule?.shortTitle || ""}: ${lessonContent.code}`}
        stationId={lessonId}
      />

      {/* 5. Modals */}
      <TeacherGuideModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenTeacherLab={() => {
          setIsTeacherModalOpen(false);
          handleOpenSimulation(moduleId, lessonId);
        }}
      />

      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onGoToLab={(documentModuleId, documentLessonId) => {
          setIsKnowledgeModalOpen(false);
          handleOpenSimulation(documentModuleId, documentLessonId);
        }}
      />

      <AccountSettingsModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        initialTab={accountModalTab}
        currentSession={session}
        onProfileUpdated={(updatedName) => {
          setSession((prev) => (prev ? { ...prev, name: updatedName } : null));
        }}
        onRoleUpdated={(updatedRole) => {
          setSession((prev) => (prev ? { ...prev, role: updatedRole } : null));
        }}
        onAiConfigUpdated={(config) => {
          setCustomAiConfig(config);
        }}
      />

      <ChatHistoryModal
        isOpen={chatHistoryOpen}
        onClose={() => setChatHistoryOpen(false)}
      />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
