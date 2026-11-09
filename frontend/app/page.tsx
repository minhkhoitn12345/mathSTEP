"use client";

import React, { useState, useEffect, useCallback, Suspense, FormEvent, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header, SessionData } from "./components/optimath/Header";
import { Hero } from "./components/optimath/Hero";
import { ModuleCards } from "./components/optimath/ModuleCards";
import { SingleInequalityLab } from "./components/optimath/SingleInequalityLab";
import { SystemInequalityLab } from "./components/optimath/SystemInequalityLab/SystemInequalityLab";
import { OptimizationLab } from "./components/optimath/OptimizationLab/OptimizationLab";
import { PracticeLab } from "./components/optimath/PracticeLab/PracticeLab";
import { SpatialGeometryLab } from "./components/spatial-geometry/SpatialGeometryLab";
import { TrigonometryLab } from "./components/trigonometry/TrigonometryLab";
import { KnowledgeBaseModal } from "./components/optimath/KnowledgeBaseModal";
import { TeacherGuideModal } from "./components/optimath/TeacherGuideModal";
import { Footer } from "./components/optimath/Footer";
import { OptiMascot } from "./components/optimath/mascot/OptiMascot";
import SocraticChatDrawer, { ChatMessage } from "./components/SocraticChatDrawer";
import AccountSettingsModal, { CustomAiConfig } from "./components/AccountSettingsModal";
import ChatHistoryModal from "./components/ChatHistoryModal";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";
import { LearningMode } from "./types/math";
import { CORE_3_MODULES } from "./types/curriculum";
import { Sparkles, Mail, Lock, User, AlertCircle, RefreshCw, Compass, Layers, Target, Award, ArrowLeft } from "lucide-react";

type ActiveView =
  | "home"
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "lab"
  | "system"
  | "optimization"
  | "quiz";

function OptimathMainContent() {
  const searchParams = useSearchParams();

  // 1. Navigation state
  const [currentView, setCurrentView] = useState<ActiveView>("home");
  const [activeLessonId, setActiveLessonId] = useState<string>("lp-lesson-1");
  const [learningMode, setLearningMode] = useState<LearningMode>("guided");
  const [lpSubTab, setLpSubTab] = useState<"single" | "system" | "optimization" | "practice">("single");

  // 2. Modals state
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // 3. User session & auth state
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "verify_email">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");

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
        "Xin chào em! Thầy là **Trợ lý Socratic Opti** đồng hành cùng em trong hệ thống học liệu số **MATHSTEP** (3 Chuyên đề chuẩn GDPT 2018).\n\nEm đang khám phá Chuyên đề nào (1. BPT & Tối ưu, 2. Không gian 3D, hay 3. Lượng giác)? Cần thầy gợi ý bước nào cứ chia sẻ cùng thầy nhé!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");

  // Check URL parameters for view routing
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (
      viewParam === "linear_programming" ||
      viewParam === "spatial_geometry" ||
      viewParam === "trigonometry" ||
      viewParam === "lab" ||
      viewParam === "system" ||
      viewParam === "optimization" ||
      viewParam === "quiz"
    ) {
      setCurrentView(viewParam as ActiveView);
    }
  }, [searchParams]);

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
    void checkSession();
    setConversationId(`opti-${Date.now()}`);

    // Load custom AI key if configured
    fetch("/api/account/api-key")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.configured) {
          setCustomAiConfig({
            provider: "gemini",
            model: data.model || "gemini-2.5-flash",
            apiKey: data.apiKeyMasked || "",
          });
        }
      })
      .catch(() => {});
  }, [checkSession]);

  // Handle module selection
  const handleSelectModule = (modId: string) => {
    if (modId === "home") {
      setCurrentView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "linear_programming" || modId === "lab") {
      setCurrentView("linear_programming");
      setLpSubTab("single");
      setActiveLessonId("lp-lesson-1");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "spatial_geometry") {
      setCurrentView("spatial_geometry");
      setActiveLessonId("sg-lesson-1");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "trigonometry") {
      setCurrentView("trigonometry");
      setActiveLessonId("trig-lesson-1");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "system") {
      setCurrentView("linear_programming");
      setLpSubTab("system");
      setActiveLessonId("lp-lesson-3");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "optimization") {
      setCurrentView("linear_programming");
      setLpSubTab("optimization");
      setActiveLessonId("lp-lesson-4");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "quiz") {
      setCurrentView("linear_programming");
      setLpSubTab("practice");
      setActiveLessonId("lp-lesson-5");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "knowledge") {
      setIsKnowledgeModalOpen(true);
    }
  };

  // Mở thẳng đúng một mô phỏng tương ứng của bài học được chọn
  const handleOpenLesson = (moduleId: string, lessonId: string) => {
    setActiveLessonId(lessonId);
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

  const handleStartExplore = () => {
    setLearningMode("guided");
    setCurrentView("linear_programming");
    setLpSubTab("single");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenTeacherGuide = () => {
    setIsTeacherModalOpen(true);
  };

  const handleLaunchTeacherLab = () => {
    setIsTeacherModalOpen(false);
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
    setLoginBusy(true);

    try {
      const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        authMode === "signup"
          ? { email: loginEmail, password: loginPassword, name: loginName }
          : { email: loginEmail, password: loginPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra trong quá trình xác thực.");
      }

      if (data.email_verification_required) {
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
        topic: "Chuyên đề 3: Khảo sát quan hệ Lượng giác tương tác (Toán 11, LG-MH01-MH05, alpha = -765 deg, E01-E16)",
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
      <main className="flex-1">
        {currentView === "home" ? (
          <>
            {/* Hero Section */}
            <Hero onStartExplore={handleStartExplore} onOpenTeacherGuide={handleOpenTeacherGuide} />

            {/* 3 Core Research Modules Cards with direct lesson simulation openers */}
            <ModuleCards
              onSelectModule={handleSelectModule}
              onSelectLesson={handleOpenLesson}
            />
          </>
        ) : currentView === "spatial_geometry" ? (
          /* =========================================================================
             MODULE 2: HÌNH HỌC KHÔNG GIAN 3D (CHUYÊN ĐỀ 2)
             ========================================================================= */
          <SpatialGeometryLab
            initialLessonIndex={sgLessonIndex}
            onBackToHome={() => setCurrentView("home")}
            onOpenSocraticDrawer={(contextMsg) => {
              setChatDrawerOpen(true);
              if (contextMsg) {
                void handleSendMessage(contextMsg);
              }
            }}
          />
        ) : currentView === "trigonometry" ? (
          /* =========================================================================
             MODULE 3: LƯỢNG GIÁC TƯƠNG TÁC (CHUYÊN ĐỀ 3)
             ========================================================================= */
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
        ) : (
          /* =========================================================================
             MODULE 1: BẤT PHƯƠNG TRÌNH & QUY HOẠCH TUYẾN TÍNH (CHUYÊN ĐỀ 1)
             MỞ ĐÚNG MỘT MÔ PHỎNG THEO BÀI ĐƯỢC CHỌN
             ========================================================================= */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
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
        title="Nhấn để mở Trợ lý Opti Socratic AI"
      >
        <div className="shrink-0 -my-1">
          <OptiMascot expression="wink" size={26} animate={false} />
        </div>
        <span className="font-extrabold tracking-tight">Hỏi Opti Socratic</span>
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
      />

      {/* 6. MODALS */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onGoToLab={handleGoToLabFromModal}
      />

      <TeacherGuideModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenTeacherLab={handleLaunchTeacherLab}
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

                <button
                  type="submit"
                  disabled={loginBusy}
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
      <OptimathMainContent />
    </Suspense>
  );
}
