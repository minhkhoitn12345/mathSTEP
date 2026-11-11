"use client";

import React, { useState, useEffect, useCallback, Suspense, FormEvent, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Header, SessionData } from "./components/optimath/Header";
import { LessonCatalogHome } from "./components/optimath/LessonCatalogHome";
import { Footer } from "./components/optimath/Footer";
import { OptiMascot } from "./components/optimath/mascot/OptiMascot";
import SocraticChatDrawer, { ChatMessage } from "./components/SocraticChatDrawer";
import AccountSettingsModal, { CustomAiConfig } from "./components/AccountSettingsModal";
import ChatHistoryModal from "./components/ChatHistoryModal";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";
import { LearningMode } from "./types/math";
import { CORE_3_MODULES } from "./types/curriculum";
import {
  loadUserLearningProgress,
  markLessonCompleted,
  setLastActiveLesson,
} from "./lib/learningProgressStorage";
import { recordLessonCompletion } from "./lib/leaderboardClient";
import { useCloudLearningProgress } from "./lib/useCloudLearningProgress";
import { getLessonDetailedContent } from "./data/learningPathData";
import { UserLearningProgress } from "./types/learningPath";
import { Sparkles, Mail, Lock, User, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

function ViewLoading() {
  return <div role="status" className="mx-auto my-12 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-sm">Đang mở nội dung học tập…</div>;
}

const SingleInequalityLab = dynamic(() => import("./components/optimath/SingleInequalityLab").then(m => m.SingleInequalityLab), { loading: ViewLoading });
const SystemInequalityLab = dynamic(() => import("./components/optimath/SystemInequalityLab/SystemInequalityLab").then(m => m.SystemInequalityLab), { loading: ViewLoading });
const OptimizationLab = dynamic(() => import("./components/optimath/OptimizationLab/OptimizationLab").then(m => m.OptimizationLab), { loading: ViewLoading });
const PracticeLab = dynamic(() => import("./components/optimath/PracticeLab/PracticeLab").then(m => m.PracticeLab), { loading: ViewLoading });
const SpatialGeometryLab = dynamic(() => import("./components/spatial-geometry/SpatialGeometryLab").then(m => m.SpatialGeometryLab), { loading: ViewLoading });
const TrigonometryLab = dynamic(() => import("./components/trigonometry/TrigonometryLab").then(m => m.TrigonometryLab), { loading: ViewLoading });
const KnowledgeBaseModal = dynamic(() => import("./components/optimath/KnowledgeBaseModal").then(m => m.KnowledgeBaseModal));
const TeacherGuideModal = dynamic(() => import("./components/optimath/TeacherGuideModal").then(m => m.TeacherGuideModal));
const LearningPathRoadmap = dynamic(() => import("./components/learning-path/LearningPathRoadmap").then(m => m.LearningPathRoadmap), { loading: ViewLoading });
const LessonStudyScreen = dynamic(() => import("./components/learning-path/LessonStudyScreen").then(m => m.LessonStudyScreen), { loading: ViewLoading });

type ActiveView =
  | "home"
  | "learning_path"
  | "lesson_study"
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "lab"
  | "system"
  | "optimization"
  | "quiz";

function MathStepMainContent() {
  const searchParams = useSearchParams();

  // 1. Navigation state
  const [currentView, setCurrentView] = useState<ActiveView>("home");
  const [activeLessonId, setActiveLessonId] = useState<string>("lp-lesson-1");
  const [selectedStudyLessonId] = useState<string>("lp-lesson-1");
  const [returnToUrl, setReturnToUrl] = useState<string | null>(null);
  const [pendingModuleFocus, setPendingModuleFocus] = useState<"linear_programming" | "spatial_geometry" | "trigonometry" | null>(null);
  const [userProgress, setUserProgress] = useState<UserLearningProgress>(() =>
    loadUserLearningProgress()
  );
  const [learningMode, setLearningMode] = useState<LearningMode>("guided");
  const [lpSubTab, setLpSubTab] = useState<"single" | "system" | "optimization" | "practice">("single");

  // 2. Modals state
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // 3. User session & auth state
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const canAccessTeacherDashboard = Boolean(
    session?.authenticated && (session.role === "teacher" || session.role === "admin")
  );
  useCloudLearningProgress(sessionLoading ? undefined : session?.userId ?? null, userProgress, setUserProgress);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "verify_email">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaLoadError, setCaptchaLoadError] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  // 4. Custom AI & Account Modals
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<"profile" | "ai">("ai");
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig | null>(null);

  // 5. Socratic AI Chat state
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "opti-welcome-1",
      role: "assistant",
      content:
        "Xin chào em! Thầy là **Trợ lý Toán MathSTEP**, đồng hành cùng em trong ba chuyên đề theo chương trình GDPT 2018.\n\nEm đang học bất phương trình và tối ưu, hình học không gian hay lượng giác? Cần gợi ý bước nào, em cứ hỏi thầy nhé!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");

  // Check URL parameters for view routing
  useEffect(() => {
    const authError = searchParams.get("auth_error");
    const authAction = searchParams.get("auth");
    if (authError) {
      setAuthModalOpen(true);
      setAuthMode("login");
      setLoginError(
        authError === "google-disabled"
          ? "Đăng nhập Google chưa được bật trong cấu hình Supabase. Em có thể dùng email hoặc thử lại sau."
          : "Chưa kết nối được dịch vụ đăng nhập Google. Em có thể dùng email hoặc thử lại sau."
      );
    } else if (authAction === "login" || authAction === "signup") {
      setAuthMode(authAction);
      setAuthModalOpen(true);
    }
    if (authError || authAction === "login" || authAction === "signup") {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("auth_error");
      currentUrl.searchParams.delete("auth");
      window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    }

    const viewParam = searchParams.get("view");
    const lessonParam = searchParams.get("lesson");
    const returnToParam = searchParams.get("returnTo");
    const focusModuleParam = searchParams.get("focusModule");

    if (focusModuleParam === "linear_programming" || focusModuleParam === "spatial_geometry" || focusModuleParam === "trigonometry") {
      setCurrentView("home");
      setPendingModuleFocus(focusModuleParam);
    }

    if (returnToParam) {
      setReturnToUrl(decodeURIComponent(returnToParam));
    }

    if ((viewParam === "spatial_geometry" || viewParam === "trigonometry") && !returnToParam) {
      const requestedModule = CORE_3_MODULES.find((module) => module.id === viewParam);
      const requestedLesson = requestedModule?.lessons.find((lesson) => lesson.id === lessonParam);
      const firstLesson = requestedModule?.lessons[0];
      if (requestedModule && (requestedLesson || firstLesson)) {
        window.location.replace(`/learn/${requestedModule.id}/${requestedLesson?.id ?? firstLesson?.id}`);
        return;
      }
    }

    if (viewParam === "learning_path" || viewParam === "study") {
      if (lessonParam) {
        const lessonModule = CORE_3_MODULES.find((module) =>
          module.lessons.some((lesson) => lesson.id === lessonParam)
        );
        const lesson = lessonModule?.lessons.find((item) => item.id === lessonParam);
        if (lessonModule && lesson) {
          window.location.replace(`/learn/${lessonModule.id}/${lesson.id}`);
        } else {
          setCurrentView("learning_path");
        }
      } else {
        setCurrentView("learning_path");
      }
    } else if (
      viewParam === "linear_programming" ||
      viewParam === "spatial_geometry" ||
      viewParam === "trigonometry" ||
      viewParam === "lab" ||
      viewParam === "system" ||
      viewParam === "optimization" ||
      viewParam === "quiz"
    ) {
      if (lessonParam) {
        setActiveLessonId(lessonParam);
        if (lessonParam === "lp-lesson-3") setLpSubTab("system");
        else if (lessonParam === "lp-lesson-4") setLpSubTab("optimization");
        else if (lessonParam === "lp-lesson-5") setLpSubTab("practice");
        else if (lessonParam === "lp-lesson-1" || lessonParam === "lp-lesson-2") setLpSubTab("single");
      }
      setCurrentView(viewParam as ActiveView);
    }
  }, [searchParams]);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaLoadError("");
    setCaptchaToken("");
    setCaptchaQuestion("");
    setCaptchaAnswer("");

    try {
      const response = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data?.ok || typeof data.question !== "string" || typeof data.token !== "string") {
        throw new Error(data?.error || "Chưa tải được câu hỏi xác thực.");
      }
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
    } catch (error) {
      setCaptchaLoadError(error instanceof Error ? error.message : "Chưa tải được câu hỏi xác thực.");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authModalOpen || authMode === "verify_email") return;
    void loadCaptcha();
  }, [authModalOpen, authMode, loadCaptcha]);

  // Check user session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setSession({
            authenticated: true,
            userId: data.user?.id ?? null,
            name: data.name,
            email: data.email,
            role: data.role,
            provider: data.provider,
          });
        } else {
          setSession({ authenticated: false, name: null, email: null });
        }
      } else {
        setSession({ authenticated: false, name: null, email: null });
      }
    } catch {
      setSession({ authenticated: false, name: null, email: null });
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem("mathstep:custom_ai_config");
    localStorage.removeItem("mathstep:user_profile");
    void checkSession();
    setConversationId(`opti-${Date.now()}`);

  }, [checkSession]);

  // Handle module selection
  const handleSelectModule = (modId: string) => {
    if (modId === "home") {
      setReturnToUrl(null);
      setCurrentView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "learning_path") {
      setCurrentView("learning_path");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "linear_programming" || modId === "spatial_geometry" || modId === "trigonometry" || modId === "lab") {
      setReturnToUrl(null);
      setCurrentView("home");
      setPendingModuleFocus(modId === "lab" ? "linear_programming" : modId);
    } else if (modId === "system") {
      setReturnToUrl(null);
      setCurrentView("linear_programming");
      setLpSubTab("system");
      setActiveLessonId("lp-lesson-3");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "optimization") {
      setReturnToUrl(null);
      setCurrentView("linear_programming");
      setLpSubTab("optimization");
      setActiveLessonId("lp-lesson-4");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "quiz") {
      setReturnToUrl(null);
      setCurrentView("linear_programming");
      setLpSubTab("practice");
      setActiveLessonId("lp-lesson-5");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "knowledge") {
      setIsKnowledgeModalOpen(true);
    }
  };

  // Chọn bài học trong Lộ trình học (Bite-sized Track)
  const handleSelectStudyLesson = (lessonId: string) => {
    const lessonModule = CORE_3_MODULES.find((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId)
    );
    if (!lessonModule) return;
    setLastActiveLesson(lessonId);
    window.location.assign(`/learn/${lessonModule.id}/${lessonId}`);
  };

  // Hoàn thành bài học và chuyển tiếp
  const handleCompleteAndNext = (
    lessonId: string,
    scorePercentage: number,
    xpEarned: number
  ) => {
    const updated = markLessonCompleted(lessonId, scorePercentage, xpEarned);
    setUserProgress(updated);
    if (session?.authenticated) void recordLessonCompletion(lessonId);

    // Tìm bài học tiếp theo trong toàn bộ 15 bài
    const allLessons = CORE_3_MODULES.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setLastActiveLesson(nextLesson.id);
      window.location.assign(`/learn/${nextLesson.moduleId}/${nextLesson.id}`);
    } else {
      // Đã xong bài cuối cùng, quay lại Lộ trình
      window.location.assign("/");
    }
  };

  const handleRewardLesson = (lessonId: string, scorePercentage: number, xpEarned: number) => {
    const updated = markLessonCompleted(lessonId, scorePercentage, xpEarned);
    setUserProgress(updated);
    if (session?.authenticated) void recordLessonCompletion(lessonId);
  };

  // Mở thẳng đúng một mô phỏng tương ứng của bài học được chọn
  const handleOpenLesson = (
    moduleId: string,
    lessonId: string,
    customReturnTo?: string
  ) => {
    setActiveLessonId(lessonId);
    if (customReturnTo) {
      setReturnToUrl(customReturnTo);
    } else {
      setReturnToUrl(`/learn/${moduleId}/${lessonId}`);
    }
    if (moduleId === "linear_programming") {
      setCurrentView("linear_programming");
      if (lessonId === "lp-lesson-1") {
        setLpSubTab("single");
        setLearningMode("practice");
      } else if (lessonId === "lp-lesson-2") {
        setLpSubTab("single");
        setLearningMode("guided");
      } else if (lessonId === "lp-lesson-3") {
        setLpSubTab("system");
      } else if (lessonId === "lp-lesson-4") {
        setLpSubTab("optimization");
      } else if (lessonId === "lp-lesson-5") {
        setLpSubTab("practice");
      }
    } else if (moduleId === "spatial_geometry") {
      setCurrentView("spatial_geometry");
    } else if (moduleId === "trigonometry") {
      setCurrentView("trigonometry");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sgLessonIndex = useMemo(() => {
    const idx = CORE_3_MODULES[1]?.lessons.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [activeLessonId]);

  const trigLessonIndex = useMemo(() => {
    const idx = CORE_3_MODULES[2]?.lessons.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [activeLessonId]);

  const currentLpLesson = useMemo(() => {
    return (
      CORE_3_MODULES[0]?.lessons.find((l) => l.id === activeLessonId) ||
      CORE_3_MODULES[0]?.lessons[0]
    );
  }, [activeLessonId]);

  const handleOpenTeacherGuide = () => {
    if (!canAccessTeacherDashboard) return;
    setIsTeacherModalOpen(true);
  };

  const handleLaunchTeacherLab = () => {
    setIsTeacherModalOpen(false);
    if (!canAccessTeacherDashboard) return;
    setLearningMode("teacher");
    setCurrentView("linear_programming");
    setLpSubTab("single");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToLabFromModal = () => {
    setIsKnowledgeModalOpen(false);
    setLearningMode("guided");
    setCurrentView("linear_programming");
    setLpSubTab("single");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth actions
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginNotice(null);
    if (!captchaToken || !captchaAnswer.trim()) {
      setLoginError("Hãy tải và trả lời câu hỏi xác thực trước khi tiếp tục.");
      return;
    }
    setLoginBusy(true);

    try {
      const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        authMode === "signup"
          ? { email: loginEmail, password: loginPassword, name: loginName, captchaAnswer, captchaToken }
          : { email: loginEmail, password: loginPassword, captchaAnswer, captchaToken };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail?.message || data?.error || "Có lỗi xảy ra trong quá trình xác thực.");
      }

      if (data.email_verification_required || data.confirmation_required) {
        setPendingVerificationEmail(loginEmail);
        setAuthMode("verify_email");
        return;
      }

      await checkSession();
      setAuthModalOpen(false);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoginBusy(false);
      void loadCaptcha();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ authenticated: false, name: null, email: null });
    } catch {}
  };

  // Socratic AI Chat message sender
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || chatInput).trim();
    if (!textToSend || chatBusy) return;

    setChatError("");
    setChatInput("");
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgId, role: "user", content: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatBusy(true);

    // Context from current active module
    const moduleContextMap: Record<string, { module: string; topic: string }> = {
      home: {
        module: "linear_programming",
        topic: "Tổng quan 3 Chuyên đề MathSTEP: 1. BPT & Tối ưu, 2. Không gian 3D, 3. Lượng giác",
      },
      linear_programming: {
        module: "linear_programming",
        topic: "Chuyên đề 1: Bất phương trình & Quy hoạch tuyến tính (Toán 10, Bài toán xưởng mộc, M01-M17)",
      },
      spatial_geometry: {
        module: "spatial_geometry",
        topic: "Chuyên đề 2: Dựng hình & Quan hệ Hình học không gian 3D (Toán 11, SG-M2-01, chóp S.ABCD, SG01-SG16)",
      },
      trigonometry: {
        module: "trigonometry",
        topic: "Chuyên đề 3: Khảo sát quan hệ lượng giác tương tác (Toán 11, LG-MH01-MH05, α = −765°, E01-E16)",
      },
    };

    const curContext = moduleContextMap[currentView] || moduleContextMap.linear_programming;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: textToSend,
          mode: "guided_learning",
          learning_context: {
            module: curContext.module,
            topic: curContext.topic,
            currentView,
            learning_stage: "explore",
          },
          hint_level: 1,
          custom_ai: customAiConfig || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botReply: ChatMessage = {
          id: `opti-${Date.now()}`,
          role: "assistant",
          content: data.reply || data.content || data.answer || "Em đã làm rất tốt!",
          intent: data.intent,
          nextQuestion: data.next_question,
          hintLevel: data.hint_level,
          validation: data.validation,
        };
        setChatMessages((prev) => [...prev, botReply]);
      } else {
        // Offline / Socratic Fallback Engine
        const fallback = generateSmartSocraticResponse(textToSend, curContext.module, "explore", 1);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `opti-fallback-${Date.now()}`,
            role: "assistant",
            content: fallback.answer,
            intent: fallback.intent,
            nextQuestion: fallback.nextQuestion,
            hintLevel: fallback.hintLevel,
          },
        ]);
      }
    } catch {
      const fallback = generateSmartSocraticResponse(textToSend, curContext.module, "explore", 1);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `opti-err-${Date.now()}`,
          role: "assistant",
          content: fallback.answer,
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* 1. APP HEADER */}
      <Header
        currentModule={currentView}
        onSelectModule={handleSelectModule}
        onOpenTeacherGuide={handleOpenTeacherGuide}
        onToggleChatDrawer={() => setChatDrawerOpen((prev) => !prev)}
        chatDrawerOpen={chatDrawerOpen}
        session={session}
        sessionLoading={sessionLoading}
        onOpenAccountModal={(tab) => {
          setAccountModalTab(tab);
          setAccountModalOpen(true);
        }}
        onOpenChatHistory={() => setChatHistoryOpen(true)}
        onOpenAuthModal={() => {
          setAuthMode("login");
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className={`flex-1 transition-[margin] duration-200 ${chatDrawerOpen ? "xl:mr-[420px]" : ""}`}>
        {currentView === "home" ? (
          <LessonCatalogHome
            onOpenTeacherGuide={canAccessTeacherDashboard ? handleOpenTeacherGuide : undefined}
            onOpenKnowledgeBase={() => setIsKnowledgeModalOpen(true)}
            focusModuleId={pendingModuleFocus}
            onModuleFocusHandled={() => setPendingModuleFocus(null)}
          />
        ) : currentView === "learning_path" ? (
          /* =========================================================================
             LUỒNG HỌC TẬP RIÊNG: LỘ TRÌNH 3 CHUYÊN ĐỀ (15 BÀI HỌC BITE-SIZED)
             ========================================================================= */
          <LearningPathRoadmap
            progress={userProgress}
            onSelectLesson={handleSelectStudyLesson}
            onOpenSimulation={handleOpenLesson}
            onBackToHome={() => setCurrentView("home")}
          />
        ) : currentView === "lesson_study" ? (
          /* =========================================================================
             MÀN HÌNH BÀI HỌC CHI TIẾT (7 PHẦN CHUẨN GDPT 2018)
             ========================================================================= */
          (() => {
            const content = getLessonDetailedContent(selectedStudyLessonId);
            if (!content) {
              return (
                <div className="max-w-xl mx-auto py-16 text-center space-y-4">
                  <p className="text-sm text-slate-600">Đang tải nội dung bài học...</p>
                  <button
                    type="button"
                    onClick={() => setCurrentView("learning_path")}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Về lộ trình học
                  </button>
                </div>
              );
            }
            return (
              <LessonStudyScreen
                content={content}
                onBackToRoadmap={() => setCurrentView("learning_path")}
                onRewardLesson={handleRewardLesson}
                onCompleteAndNext={handleCompleteAndNext}
                onOpenSimulation={handleOpenLesson}
                isCompleted={userProgress.completedLessonIds.includes(selectedStudyLessonId)}
                showTheorySections
              />
            );
          })()
        ) : currentView === "spatial_geometry" ? (
          /* =========================================================================
             MODULE 2: HÌNH HỌC KHÔNG GIAN 3D (CHUYÊN ĐỀ 2)
             ========================================================================= */
          <div className="space-y-4">
            {returnToUrl && (
              <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
                <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl shadow-md border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Phòng Thí Nghiệm Hình Học Không Gian 3D</p>
                      <p className="text-[10px] text-emerald-200">
                        Em đang thao tác mô phỏng 3D tương tác. Khi đã nắm chắc, hãy bấm quay lại bài học để tiếp tục.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={returnToUrl}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    ← Quay lại bài học
                  </Link>
                </div>
              </div>
            )}
            <SpatialGeometryLab
              initialLessonIndex={sgLessonIndex}
              customAiConfig={customAiConfig}
              onBackToHome={() => setCurrentView("home")}
              onOpenSocraticDrawer={(contextMsg) => {
                setChatDrawerOpen(true);
                if (contextMsg) {
                  void handleSendMessage(contextMsg);
                }
              }}
            />
          </div>
        ) : currentView === "trigonometry" ? (
          /* =========================================================================
             MODULE 3: LƯỢNG GIÁC TƯƠNG TÁC (CHUYÊN ĐỀ 3)
             ========================================================================= */
          <div className="space-y-4">
            {returnToUrl && (
              <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
                <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl shadow-md border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Phòng Thí Nghiệm Lượng Giác Tương Tác</p>
                      <p className="text-[10px] text-purple-200">
                        Em đang khám phá vòng tròn lượng giác và đồ thị sóng sin/cos. Bấm nút để quay lại bài học.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={returnToUrl}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-purple-800 hover:bg-purple-50 font-black text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    ← Quay lại bài học
                  </Link>
                </div>
              </div>
            )}
            <TrigonometryLab
              initialLessonIndex={trigLessonIndex}
              onBackToHome={() => setCurrentView("home")}
              onOpenSocraticDrawer={(contextMsg) => {
                setChatDrawerOpen(true);
                if (contextMsg) {
                  void handleSendMessage(contextMsg);
                }
              }}
            />
          </div>
        ) : (
          /* =========================================================================
             MODULE 1: BẤT PHƯƠNG TRÌNH & QUY HOẠCH TUYẾN TÍNH (CHUYÊN ĐỀ 1)
             MỞ ĐÚNG MỘT MÔ PHỎNG THEO BÀI ĐƯỢC CHỌN
             ========================================================================= */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
            {returnToUrl && (
              <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl shadow-md border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Phòng Thí Nghiệm Bất Phương Trình & Tối Ưu</p>
                    <p className="text-[10px] text-blue-200">
                      Em đang thực hành mô phỏng nửa mặt phẳng bờ (d) & miền đa giác lồi. Bấm nút để quay lại bài học.
                    </p>
                  </div>
                </div>
                <Link
                  href={returnToUrl}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  ← Quay lại bài học
                </Link>
              </div>
            )}
            {/* Thanh điều hướng bài học tinh gọn & nút quay lại trang chủ */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("home")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Quay lại danh sách bài học trang chủ"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trang chủ</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                    CĐ1 · {currentLpLesson.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900 hidden sm:inline">
                    {currentLpLesson.title}
                  </span>
                </div>
              </div>

              {/* Lựa chọn 5 bài học của Chuyên đề 1: Chuyển thẳng sang mô phỏng bài đó */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                {CORE_3_MODULES[0].lessons.map((les) => (
                  <button
                    key={les.id}
                    type="button"
                    onClick={() => handleOpenLesson("linear_programming", les.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeLessonId === les.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                    title={les.title}
                  >
                    {les.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Tab Contents: Mở đúng một mô phỏng tương ứng */}
            {lpSubTab === "single" ? (
              <SingleInequalityLab
                initialLearningMode={learningMode}
                onBackToHome={() => setCurrentView("home")}
              />
            ) : lpSubTab === "system" ? (
              <SystemInequalityLab
                initialLearningMode={learningMode}
                onBackToHome={() => setCurrentView("home")}
              />
            ) : lpSubTab === "optimization" ? (
              <OptimizationLab
                initialLearningMode={learningMode}
                onBackToHome={() => setCurrentView("home")}
              />
            ) : (
              <PracticeLab
                initialLearningMode={learningMode}
                canAccessTeacherDashboard={canAccessTeacherDashboard}
                onBackToHome={() => setCurrentView("home")}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <Footer />

      {/* 4. FLOATING SOCRATIC AI ASSISTANT BUTTON */}
      <button
        type="button"
        onClick={() => setChatDrawerOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 select-none group"
        title="Mở trợ lý học Toán MathSTEP"
      >
        <div className="shrink-0 -my-1">
          <OptiMascot expression="wink" size={26} animate={false} />
        </div>
        <span className="font-extrabold tracking-tight">Hỏi MathSTEP</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* 5. SOCRATIC AI CHAT DRAWER */}
      <SocraticChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        messages={chatMessages}
        busy={chatBusy}
        error={chatError}
        input={chatInput}
        onInputChange={setChatInput}
        onSendMessage={handleSendMessage}
        sessionName={session?.name}
        moduleTitle={
          currentView === "spatial_geometry"
            ? "Chuyên đề 2: Hình học không gian 3D (SG01-SG16)"
            : currentView === "trigonometry"
            ? "Chuyên đề 3: Lượng giác tương tác (E01-E16)"
            : "Chuyên đề 1: BPT & Tối ưu (M01-M17)"
        }
        quickPrompts={currentView === "trigonometry"
          ? ["Em nên quan sát gì trên đường tròn?", "Nếu tăng góc, đồ thị thay đổi thế nào?", "Gợi ý kiểm tra dấu sin và cos."]
          : currentView === "spatial_geometry"
          ? ["Em nên xác định mặt phẳng nào trước?", "Gợi ý tìm nét thấy và nét khuất.", "Làm sao kiểm tra hai đường song song?"]
          : ["Em nên thử điểm nào?", "Gợi ý xác định miền nghiệm.", "Vì sao cần kiểm tra các đỉnh?"]}
      />

      {/* 6. MODALS */}
      {isKnowledgeModalOpen && <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onGoToLab={handleGoToLabFromModal}
      />}

      {isTeacherModalOpen && canAccessTeacherDashboard && <TeacherGuideModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenTeacherLab={handleLaunchTeacherLab}
      />}

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

      {/* 7. AUTH LOGIN / SIGNUP MODAL */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                  MATHSTEP TÀI KHOẢN
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {authMode === "login"
                    ? "Đăng nhập tài khoản"
                    : authMode === "signup"
                    ? "Đăng ký tài khoản"
                    : "Xác thực hộp thư"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {authMode === "verify_email" ? (
              <div className="space-y-4 py-2 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-slate-900">Yêu cầu xác nhận Email</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Một email kích hoạt đã được gửi tới địa chỉ:
                  </p>
                  <div className="font-mono font-bold text-xs text-blue-700 bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100 inline-block">
                    {pendingVerificationEmail || loginEmail}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Vui lòng bấm vào liên kết trong email để hoàn tất kích hoạt tài khoản.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Đã xác nhận? Đăng nhập ngay
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginNotice && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>{loginNotice}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={googleBusy || loginBusy}
                  onClick={() => {
                    setLoginError(null);
                    setGoogleBusy(true);
                    window.location.assign("/api/auth/google");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  {googleBusy ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 font-black text-blue-600">G</span>
                  )}
                  Tiếp tục với Google
                </button>
                <div className="relative py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <span className="relative z-10 bg-white px-2">Hoặc dùng email</span>
                  <span className="absolute inset-x-0 top-1/2 border-t border-slate-100" />
                </div>

                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="hocsinh@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="auth-captcha-answer" className="text-xs font-bold text-slate-800">
                      Xác thực chống spam
                    </label>
                    <button
                      type="button"
                      onClick={() => void loadCaptcha()}
                      disabled={captchaLoading}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${captchaLoading ? "animate-spin" : ""}`} />
                      Đổi câu hỏi
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span aria-live="polite" className="min-w-20 rounded-lg border border-amber-200 bg-white px-3 py-2 text-center font-mono text-sm font-black text-amber-950">
                      {captchaLoading ? "…" : captchaQuestion || "—"}
                    </span>
                    <span aria-hidden="true" className="text-xs text-slate-500">=</span>
                    <input
                      id="auth-captcha-answer"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      required
                      value={captchaAnswer}
                      onChange={(event) => setCaptchaAnswer(event.target.value)}
                      placeholder="Đáp án"
                      disabled={captchaLoading || !captchaToken}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                    Tính nhanh phép toán để xác nhận em không phải chương trình tự động.
                  </p>
                  {captchaLoadError && (
                    <p role="alert" className="mt-2 text-[11px] font-semibold text-rose-700">{captchaLoadError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginBusy || googleBusy || captchaLoading || !captchaToken || !captchaAnswer.trim()}
                  className="w-full py-2.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginBusy ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authMode === "signup" ? (
                    "Tạo tài khoản"
                  ) : (
                    "Đăng nhập"
                  )}
                </button>

                <div className="text-center pt-2 border-t border-slate-100">
                  {authMode === "signup" ? (
                    <p className="text-xs text-slate-600">
                      Đã có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setLoginError(null);
                        }}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Đăng nhập
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Chưa có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setLoginError(null);
                        }}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Đăng ký ngay
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-600">Đang khởi tạo MATHSTEP 3 Chuyên đề...</p>
          </div>
        </div>
      }
    >
      <MathStepMainContent />
    </Suspense>
  );
}
