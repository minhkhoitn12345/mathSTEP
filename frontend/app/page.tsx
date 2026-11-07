"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import MathGraphVisualizer from "./components/MathGraphVisualizer";
import MathStepWorkbench from "./components/MathStepWorkbench";
import TeacherDashboard from "./components/TeacherDashboard";
import ResearchMethodologyHub from "./components/ResearchMethodologyHub";
import AccountSettingsModal, { CustomAiConfig } from "./components/AccountSettingsModal";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";
import { getAllStations, removeVietnameseAccents, StationItem } from "./lib/stationCatalogData";
import {
  Layers,
  Compass,
  GraduationCap,
  FileText,
  Search,
  FlaskConical,
  Lock,
  Bot,
  Sparkles,
  Eye,
  EyeOff,
  Cpu,
} from "lucide-react";

export type SubsystemId = "student" | "teacher" | "research";
export type ViewMode = "home" | "lab";

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export type StageId = "observe" | "predict" | "manipulate" | "explore" | "verify" | "explain" | "transfer" | "apply";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  nextQuestion?: string;
  hintLevel?: number;
  validation?: { status: string; result: boolean | number | null; explanation: string } | null;
};

type Session = { authenticated: boolean; name: string | null; email: string | null };

function normalizeMathDelimiters(content: string): string {
  if (!content) return "";
  let text = content;
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expr: string) => `$$\n${expr.trim()}\n$$`);
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`);
  text = text.replace(/(?<!\$)\s*(\\begin\{(cases|aligned|matrix|pmatrix|bmatrix)\}[\s\S]+?\\end\{\2\})\s*(?!\$)/g, (_match, block: string) => {
    return `\n$$\n${block.trim()}\n$$\n`;
  });
  text = text.replace(/(?<!\$)\$\s+([^\$\n]+?)\s+\$(?!\$)/g, "$$$1$$");
  return text;
}

function MathMessage({ content }: { content: string }) {
  const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
    >
      {normalized}
    </ReactMarkdown>
  );
}


function StationCardArt({ grade, is3D, stationId }: { grade: number; is3D: boolean; stationId: string }) {
  const bgGrad = grade === 10 ? "#d5ede4" : grade === 11 ? "#d9e6f3" : "#e9e6d6";
  return (
    <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${stationId}`} x2="1" y2="1">
          <stop stopColor={bgGrad} />
          <stop offset="1" stopColor="#f4f8f5" />
        </linearGradient>
      </defs>
      <rect width="380" height="155" fill={`url(#bg-${stationId})`} />
      <g stroke="#87aaa3" strokeWidth="1" opacity="0.22">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={155} />
        ))}
        {[25, 55, 85, 115, 145].map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={380} y2={y} />
        ))}
      </g>
      {is3D ? (
        <g transform="translate(190, 80)">
          <path d="M-62 24L-4 55L65 24L5 -9Z" fill="#5bafa1" opacity="0.6" />
          <path d="M-62 24L0 -62L-4 55Z" fill="#16827d" opacity="0.75" />
          <path d="M-4 55L0 -62L65 24Z" fill="#95d8c0" opacity="0.85" />
          <path
            d="M0 -62L-62 24L-4 55L65 24Z M0 -62L-4 55"
            stroke="#12565d"
            fill="none"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g fill="none" stroke="#5d7e7f">
          <path d="M50 120H330M115 140V20" strokeWidth="1.5" />
          <path d="M65 35Q180 230 310 25" stroke="#087e7c" strokeWidth="3.5" />
          <path d="M80 125L300 35" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="225" cy="80" r="5" fill="#087e7c" />
        </g>
      )}
    </svg>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const urlStation = searchParams.get("station");
  const urlStep = searchParams.get("step");
  const urlTab = searchParams.get("tab");

  const initialStation = urlStation || "10.03";
  const matchedStation = useMemo(() => {
    const list = getAllStations();
    return list.find((s) => s.id === initialStation);
  }, [initialStation]);

  const initialModuleId: ModuleId = matchedStation ? matchedStation.moduleId : "linear_programming";
  const initialViewMode: ViewMode = urlStation ? "lab" : "home";
  const initialSubsystem: SubsystemId = urlTab === "teacher" ? "teacher" : urlTab === "research" ? "research" : "student";
  const initialStepNumber = urlStep ? Math.max(0, Math.min(7, parseInt(urlStep, 10) - 1)) : 0;

  const [subsystem, setSubsystem] = useState<SubsystemId>(initialSubsystem);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [moduleId, setModuleId] = useState<ModuleId>(initialModuleId);
  const [stationId, setStationId] = useState<string>(initialStation);
  const [currentStep, setCurrentStep] = useState<number>(initialStepNumber);

  // Đồng bộ trạng thái vào URL search params (URL-Driven Routing)
  const syncUrl = useCallback((newStationId: string | null, newStep: number | null, newTab: string | null) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (newStationId) {
      params.set("station", newStationId);
      if (typeof newStep === "number" && newStep >= 1) {
        params.set("step", newStep.toString());
      }
    } else if (newTab && newTab !== "catalog") {
      params.set("tab", newTab);
    }
    const queryString = params.toString();
    const newUrl = queryString ? "/?" + queryString : "/";
    window.history.replaceState(null, "", newUrl);
  }, []);

  // Lắng nghe thay đổi searchParams khi người dùng nhấn Back/Forward
  useEffect(() => {
    const stationParam = searchParams.get("station");
    const stepParam = searchParams.get("step");
    const tabParam = searchParams.get("tab");

    if (stationParam) {
      setStationId(stationParam);
      const st = getAllStations().find((s) => s.id === stationParam);
      if (st) setModuleId(st.moduleId);
      setViewMode("lab");
      setSubsystem("student");
      if (stepParam) {
        const s = parseInt(stepParam, 10);
        if (!isNaN(s) && s >= 1 && s <= 8) {
          setCurrentStep(s - 1);
        }
      }
    } else if (tabParam === "teacher") {
      setSubsystem("teacher");
      setViewMode("home");
    } else if (tabParam === "research") {
      setSubsystem("research");
      setViewMode("home");
    } else {
      setSubsystem("student");
      setViewMode("home");
    }

    const authErrorParam = searchParams.get("auth_error");
    const authConfirmedParam = searchParams.get("auth");
    if (authErrorParam === "google-disabled") {
      setLoginError("Đăng nhập Google chưa được kích hoạt trong cài đặt Supabase. Em có thể đăng nhập bằng email hoặc trải nghiệm thử.");
      setAuthModalOpen(true);
    } else if (authErrorParam) {
      setLoginError("Phiên đăng nhập chưa hoàn tất hoặc đã hết hạn. Vui lòng thử lại.");
      setAuthModalOpen(true);
    } else if (authConfirmedParam === "confirmed") {
      setLoginNotice("Email đã được xác nhận. Em có thể đăng nhập ngay.");
      setAuthModalOpen(true);
    }
  }, [searchParams]);
  const [stage] = useState<StageId>("explore");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);

  // Catalog filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<"all" | "3d" | "2d">("all");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Auth / session state
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // User Profile & Custom AI Key Modal state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<"profile" | "ai">("profile");
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig | null>(null);

  const allStations = useMemo(() => getAllStations(), []);

  // Filter stations for the catalog view
  const filteredStations = useMemo(() => {
    const q = removeVietnameseAccents(searchQuery.trim().toLowerCase());
    return allStations.filter((st) => {
      if (selectedGrade !== 0 && st.grade !== selectedGrade) return false;
      if (selectedType === "3d" && !st.is3D) return false;
      if (selectedType === "2d" && st.is3D) return false;
      if (!q) return true;
      const hay = removeVietnameseAccents(`${st.id} ${st.title} ${st.source} ${st.goal} ${st.simulation}`).toLowerCase();
      return hay.includes(q);
    });
  }, [allStations, searchQuery, selectedGrade, selectedType]);

  // Session check on initial mount
  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (ignore) return;
        if (data && data.authenticated) {
          const userName = data.user?.name ?? data.name ?? null;
          const userEmail = data.user?.email ?? data.email ?? null;
          setSession({ authenticated: true, name: userName, email: userEmail });
        } else {
          setSession({ authenticated: false, name: null, email: null });
        }
      } catch {
        if (!ignore) {
          setSession({ authenticated: false, name: null, email: null });
        }
      } finally {
        if (!ignore) setSessionLoading(false);
      }
    }
    void checkSession();
    return () => { ignore = true; };
  }, []);

  // Nạp cấu hình Custom AI Key từ localStorage nếu có
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mathstep:custom_ai_config");
      if (stored) {
        const parsed = JSON.parse(stored) as CustomAiConfig;
        if (parsed?.apiKey) {
          setCustomAiConfig(parsed);
        }
      }
    } catch {}
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting from TES Mascot
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "intro-mascot",
          role: "assistant",
          content: "Chào em! Thầy là **Trợ lý Socratic TES**. Thầy sẽ đồng hành cùng em qua các bước khám phá mô hình, đặt câu hỏi gợi mở và kiểm tra lập luận của em chứ tuyệt đối **không giải hộ đáp số**. Em hãy thao tác mô phỏng và hỏi thầy bất cứ khi nào cần định hướng nhé!",
          intent: "general",
        },
      ]);
    }
  }, [messages.length]);

  const handleOpenStationInLab = (st: StationItem, stepNum = 1) => {
    setStationId(st.id);
    setModuleId(st.moduleId);
    setViewMode("lab");
    setSubsystem("student");
    setCurrentStep(stepNum - 1);
    syncUrl(st.id, stepNum, null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendTutorMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setBusy(true);
    setError("");

    try {
      const hasCustomKey = Boolean(customAiConfig?.apiKey && customAiConfig.apiKey.trim().length > 10);
      if (session?.authenticated || hasCustomKey) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: textToSend,
            mode: "guided_learning",
            learning_context: { module: moduleId, learning_stage: stage },
            hint_level: 1,
            custom_ai: hasCustomKey ? customAiConfig : undefined,
          }),
        });
        const data = await response.json();
        if (response.ok && data?.answer) {
          const reply: ChatMessage = {
            id: data.message_id || crypto.randomUUID(),
            role: "assistant",
            content: data.answer,
            intent: data.intent,
            nextQuestion: data.next_action?.payload?.question,
            hintLevel: data.hint_level,
          };
          setMessages((prev) => [...prev, reply]);
          if (data.conversation_id) setConversationId(String(data.conversation_id));
          return;
        }
      }

      // Offline / Socratic Fallback Engine
      const fallback = generateSmartSocraticResponse(textToSend, moduleId, stage, 1);
      const fallbackReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fallback.answer,
        intent: fallback.intent,
        nextQuestion: fallback.nextQuestion,
        hintLevel: fallback.hintLevel,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } catch {
      const fallback = generateSmartSocraticResponse(textToSend, moduleId, stage, 1);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fallback.answer,
          intent: fallback.intent,
          nextQuestion: fallback.nextQuestion,
          hintLevel: fallback.hintLevel,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleAskTutorFromWorkbench = (promptText: string) => {
    setTutorOpen(true);
    void handleSendTutorMessage(promptText);
  };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginNotice("");
    setLoginBusy(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          name: authMode === "signup" ? displayName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || "Đăng nhập không thành công.");
      // Tải lại phiên người dùng mới nhất từ server
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json().catch(() => null);
      if (sessionData && sessionData.authenticated) {
        const userName = sessionData.user?.name ?? sessionData.name ?? displayName ?? null;
        const userEmail = sessionData.user?.email ?? sessionData.email ?? loginEmail ?? null;
        setSession({ authenticated: true, name: userName, email: userEmail });
      } else {
        setSession({ authenticated: true, name: displayName || loginEmail, email: loginEmail });
      }
      setAuthModalOpen(false);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setSession({ authenticated: false, name: null, email: null });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6f5] text-[#152f35] font-sans">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0b2329] text-white border-b border-[#284048] px-4 md:px-8 h-16 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => {
              setViewMode("home");
              setSubsystem("student");
            }}
            className="flex items-center gap-2 text-white no-underline group"
          >
            <span className="w-8 h-8 rounded-xl bg-[#087e7c] text-[#adf0d6] font-black text-lg flex items-center justify-center border border-[#16827d] group-hover:scale-105 transition-transform">
              m
            </span>
            <div className="leading-tight">
              <strong className="text-sm tracking-wider font-extrabold block">MATHSTEP</strong>
              <span className="text-[10px] text-gray-300 tracking-widest hidden sm:inline">HỌC LIỆU 3D TOÁN THPT</span>
            </div>
          </Link>
        </div>

        {/* 3 PHÂN HỆ CHÍNH KHKT NAVIGATION TABS */}
        <nav className="flex items-center gap-1 bg-[#133d41] p-1 rounded-2xl border border-[#2a595f]">
          <button
            type="button"
            onClick={() => {
              setSubsystem("student");
              setViewMode("home");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              subsystem === "student" && viewMode === "home"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline">48 Trạm học</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubsystem("student");
              setViewMode("lab");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              subsystem === "student" && viewMode === "lab"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">Phòng thực hành</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubsystem("teacher");
              setViewMode("home");
              syncUrl(null, null, "teacher");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              subsystem === "teacher"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Giáo viên</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubsystem("research");
              setViewMode("home");
              syncUrl(null, null, "research");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              subsystem === "research"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Cơ sở KHKT</span>
          </button>
        </nav>

        {/* USER MENU & AUTH */}
        <div className="flex items-center gap-2">
          {sessionLoading ? (
            <span className="text-[10px] text-gray-400">...</span>
          ) : session?.authenticated ? (
            <div className="flex items-center gap-2 bg-[#133d41] py-1 px-2.5 rounded-xl border border-[#2a595f] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setAccountModalTab("profile");
                  setAccountModalOpen(true);
                }}
                className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
                title="Xem và chỉnh sửa hồ sơ học sinh (Họ tên, Khối lớp, Trường, Mục tiêu)"
              >
                <span className="w-7 h-7 rounded-full bg-[#087e7c] text-[#adf0d6] font-black text-xs flex items-center justify-center shadow-xs">
                  {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                </span>
                <div className="flex flex-col text-left leading-tight hidden sm:flex">
                  <span className="text-xs font-bold text-white line-clamp-1 max-w-[130px]">
                    {session.name || session.email?.split("@")[0] || "Học viên"}
                  </span>
                  <span className="text-[9px] text-[#adf0d6] font-medium flex items-center gap-1">
                    <span>Hồ sơ & Lớp</span>
                  </span>
                </div>
              </button>

              {/* Nút Cấu hình AI Model */}
              <button
                type="button"
                onClick={() => {
                  setAccountModalTab("ai");
                  setAccountModalOpen(true);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                  customAiConfig?.apiKey
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-white/10 text-gray-300 border-white/15 hover:bg-white/20 hover:text-white"
                }`}
                title="Cấu hình Model AI & API Key riêng (Gemini 2.5, GPT-4o, DeepSeek R1)"
              >
                <Cpu className="w-3 h-3 text-[#adf0d6]" />
                <span className="hidden md:inline">
                  {customAiConfig?.model
                    ? customAiConfig.model.replace("gemini-", "").replace("gpt-", "").replace("deepseek-", "")
                    : "Cài AI"}
                </span>
              </button>

              <button
                onClick={() => void logout()}
                className="text-[11px] text-gray-300 hover:text-rose-300 font-medium underline ml-1"
                title="Đăng xuất tài khoản"
              >
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAccountModalTab("ai");
                  setAccountModalOpen(true);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  customAiConfig?.apiKey
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-white/10 hover:bg-white/20 text-gray-200 border-white/20"
                }`}
                title="Cấu hình API Key riêng (Gemini 2.5, GPT-4o, DeepSeek R1)"
              >
                <Cpu className="w-3.5 h-3.5 text-[#adf0d6]" />
                <span className="hidden sm:inline">
                  {customAiConfig?.model ? customAiConfig.model : "Nhập API Key"}
                </span>
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col">
        {/* SUB-SYSTEM 1: STUDENT HOME PORTAL (CATALOG & HERO) */}
        {subsystem === "student" && viewMode === "home" && (
          <div className="flex-1 space-y-8 pb-12">
            {/* HERO BANNER MATCHING index (2).html */}
            <section className="bg-gradient-to-b from-[#0b2329] to-[#081a1f] text-[#eff8f5] px-4 md:px-8 py-12 md:py-16 relative overflow-hidden border-b border-[#284048]">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#adf0d6] block">
                    Phòng học tương tác · Toán THPT Lớp 10 — 12
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    Chạm vào mô hình.<br />
                    <span className="text-[#adf0d6]">Tự tìm ra quy luật.</span>
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl">
                    Kéo một điểm. Xoay một góc nhìn. Thử một giả thuyết. Khám phá toán học bằng chính những điều em quan sát, kiểm chứng và tự đúc kết quy luật.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById("catalog-section");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 rounded-2xl bg-[#adf0d6] hover:bg-[#86efc3] text-[#0b2329] font-black text-xs md:text-sm shadow-lg transition-transform active:scale-95"
                    >
                      Chọn trạm khám phá ↓
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("lab");
                        setSubsystem("student");
                      }}
                      className="px-4 py-3 rounded-2xl bg-[#133d41] hover:bg-[#1a4f54] text-white font-bold text-xs md:text-sm border border-[#2a595f] transition-all"
                    >
                      Vào học trạm ({stationId}) →
                    </button>
                    <button
                      onClick={() => setVisualizerOpen(true)}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 transition-all"
                    >
                      Mô hình Oxy & 3D
                    </button>
                  </div>

                  {/* STATS ROW */}
                  <div className="flex items-center gap-8 pt-4 border-t border-[#1d3d43]">
                    <div>
                      <strong className="text-2xl font-black text-white block">48</strong>
                      <small className="text-xs text-gray-400">trạm học tương tác</small>
                    </div>
                    <div>
                      <strong className="text-2xl font-black text-[#adf0d6] block">2D + 3D</strong>
                      <small className="text-xs text-gray-400">thấy và kiểm chứng</small>
                    </div>
                    <div>
                      <strong className="text-2xl font-black text-amber-300 block">TES</strong>
                      <small className="text-xs text-gray-400">trợ lý Socratic</small>
                    </div>
                  </div>
                </div>

                {/* HERO GRAPHIC ART SVG */}
                <div className="relative border border-[#345258] rounded-3xl bg-radial from-[#1d5053] to-transparent p-6 flex items-center justify-center shadow-2xl">
                  <div className="absolute right-4 top-4 bg-[#133d41] border border-[#54817b] px-3 py-1 rounded-xl text-[#adf0d6] text-xs font-bold">
                    Mặt cầu · Không gian Oxyz
                  </div>
                  <svg viewBox="0 0 450 300" className="w-full h-64" aria-hidden="true">
                    <defs>
                      <radialGradient id="hero-orb" cx="30%" cy="25%">
                        <stop stopColor="#ccffe2" />
                        <stop offset="0.5" stopColor="#3daba1" />
                        <stop offset="1" stopColor="#143841" />
                      </radialGradient>
                    </defs>
                    <g stroke="#8dcbb9" fill="none" opacity="0.45">
                      <ellipse cx="225" cy="150" rx="180" ry="65" transform="rotate(-25 225 150)" />
                      <ellipse cx="225" cy="150" rx="150" ry="90" transform="rotate(38 225 150)" />
                      <path d="M35 230L415 250M70 270L385 60M210 280L210 30" strokeDasharray="5 5" />
                    </g>
                    <circle cx="225" cy="140" r="75" fill="url(#hero-orb)" />
                    <g fill="#c4ffe7">
                      <circle cx="95" cy="165" r="4" />
                      <circle cx="355" cy="95" r="4" />
                      <circle cx="310" cy="225" r="3.5" />
                    </g>
                    <text x="30" y="280" fill="#92c3b8" fontSize="11" letterSpacing="2" fontWeight="bold">
                      DỰ ĐOÁN · THAO TÁC · KIỂM CHỨNG
                    </text>
                  </svg>
                </div>
              </div>
            </section>

            {/* 48 STATIONS CATALOG SECTION */}
            <section id="catalog-section" className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d9e4e2] pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#087e7c] block">
                    CHỌN MỘT ĐIỀU EM MUỐN HIỂU
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-[#152f35] mt-1">
                    Mỗi trạm, một hành trình khám phá mới.
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#eef6f3] text-[#087e7c] text-xs font-bold border border-[#d9e4e2]">
                  {filteredStations.length} trạm hiển thị
                </span>
              </div>

              {/* FILTERS & SEARCH BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#d9e4e2] shadow-sm">
                {/* Grade chips */}
                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {[
                    { id: 0, label: "Tất cả (48)" },
                    { id: 10, label: "Lớp 10 (16)" },
                    { id: 11, label: "Lớp 11 (20)" },
                    { id: 12, label: "Lớp 12 (12)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGrade(g.id)}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        selectedGrade === g.id
                          ? "bg-[#087e7c] text-white shadow-xs"
                          : "bg-[#f8faf9] text-gray-700 hover:bg-[#edf6f3] border border-[#d9e4e2]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Search & Model Type */}
                <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm bài (ví dụ: quy hoạch tuyến tính, hình chóp, conic...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-[#f8faf9] border border-[#bed0cd] rounded-xl text-xs focus:outline-none focus:border-[#087e7c]"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs flex items-center">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as "all" | "3d" | "2d")}
                    className="p-1.5 bg-[#f8faf9] border border-[#bed0cd] rounded-xl text-xs font-medium focus:outline-none focus:border-[#087e7c]"
                  >
                    <option value="all">Mọi mô hình</option>
                    <option value="3d">Không gian 3D</option>
                    <option value="2d">Hình học phẳng 2D</option>
                  </select>
                </div>
              </div>

              {/* PHÂN VÙNG 1: CÁC TRẠM NGHIÊN CỨU TRỌNG TÂM (ĐÃ THẨM ĐỊNH TOÁN HỌC 100%) */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3.5 bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-l-4 border-emerald-600 rounded-r-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-sm font-extrabold text-[#152f35] uppercase tracking-wide">
                        CHUYÊN ĐỀ NGHIÊN CỨU TRỌNG TÂM (ĐÃ THẨM ĐỊNH TOÁN HỌC & SƯ PHẠM 100%)
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Phục vụ báo cáo dự thi KHKT: Đầy đủ bối cảnh đề bài thực tế, ma trận số liệu và bảng điều khiển đồng bộ 100% với Canvas.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-300 shrink-0">
                    5 Trạm Cốt Lõi Hoàn Hảo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStations.filter((st) => st.isValidated).map((st) => (
                    <article
                      key={st.id}
                      className="bg-white rounded-2xl border-2 border-emerald-500/60 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Visual SVG Card Art */}
                        <div className="h-36 relative overflow-hidden bg-[#eef7f3]">
                          <StationCardArt grade={st.grade} is3D={st.is3D} stationId={st.id} />
                          <span className="absolute top-2.5 left-2.5 bg-emerald-800 text-white px-2 py-0.5 rounded-lg text-[10px] font-black font-mono shadow-xs border border-emerald-600">
                            {st.id} · LỚP {st.grade}
                          </span>
                          <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            {st.is3D ? "KHÔNG GIAN 3D" : "HÌNH HỌC 2D"}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-extrabold text-emerald-700 uppercase tracking-wider">
                              {st.badge || "Trọng tâm KHKT"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Đã kiểm chứng 100%
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-[#152f35] line-clamp-2 leading-snug">
                            {st.title}
                          </h3>

                          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                            {st.simulation}
                          </p>

                          <div className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-100 flex items-center justify-between">
                            <span>{st.source}</span>
                            <span className="text-emerald-700 font-bold">Khớp SGK</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleOpenStationInLab(st)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#087e7c] to-[#0d9488] hover:from-[#066563] hover:to-[#0f766e] text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Vào phòng thực hành chuẩn</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* PHÂN VÙNG 2: KHUNG KIẾN TRÚC MỞ RỘNG (ĐANG HOÀN THIỆN THEO ĐỀ CƯƠNG) */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl">
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-amber-600 inline mr-1" />
                      <span>KHUNG KIẾN TRÚC MỞ RỘNG (LỘ TRÌNH ĐỀ CƯƠNG DÀI HẠN)</span>
                    </h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Nhóm tác giả cam kết liêm chính khoa học: Chỉ mở công khai các trạm đã được thẩm định toán học 100%. Các trạm dưới đây đang trong lộ trình chuẩn hóa dữ liệu thực nghiệm sư phạm.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-bold text-[11px] rounded-full shrink-0">
                    Lộ trình mở rộng
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-75 hover:opacity-100 transition-opacity">
                  {filteredStations.filter((st) => !st.isValidated).map((st) => (
                    <article
                      key={st.id}
                      className="bg-white rounded-2xl border border-dashed border-gray-300 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Visual SVG Card Art */}
                        <div className="h-32 relative overflow-hidden bg-gray-50 grayscale opacity-80">
                          <StationCardArt grade={st.grade} is3D={st.is3D} stationId={st.id} />
                          <span className="absolute top-2.5 left-2.5 bg-gray-700 text-white px-2 py-0.5 rounded-lg text-[10px] font-mono">
                            {st.id} · LỚP {st.grade}
                          </span>
                          <span className="absolute top-2.5 right-2.5 bg-amber-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            Lộ trình mở rộng
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-amber-800">
                              Đang chuẩn hóa dữ liệu
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-gray-700 line-clamp-1">
                            {st.title}
                          </h3>

                          <p className="text-gray-400 text-[11px] line-clamp-2">
                            {st.simulation}
                          </p>

                          <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-100">
                            {st.source}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            alert("Trạm này đang trong giai đoạn chuẩn hóa dữ liệu thực nghiệm sư phạm theo lộ trình dài hạn của đề cương. Nhóm nghiên cứu chỉ mở công khai các trạm đã được kiểm chứng tính đúng toán học 100%. Kính mời thầy cô và các bạn trải nghiệm 5 Trạm Trọng tâm phía trên!");
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /><span>Đang hoàn thiện theo đề cương</span></span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SUB-SYSTEM 1: STUDENT INTERACTIVE LAB VIEW (MathStepWorkbench) */}
        {subsystem === "student" && viewMode === "lab" && (
          <div className="flex-1 w-full h-[calc(100vh-64px)] p-2 md:p-3 overflow-hidden">
            <MathStepWorkbench
              moduleId={moduleId}
              stationId={stationId}
              initialStep={currentStep}
              onStepChange={(stepNum) => {
                setCurrentStep(stepNum - 1);
                syncUrl(stationId, stepNum, null);
              }}
              onBackToCatalog={() => {
                setViewMode("home");
                setSubsystem("student");
                syncUrl(null, null, "catalog");
              }}
              onAskTutor={handleAskTutorFromWorkbench}
              onSelectStation={(st) => {
                handleOpenStationInLab(st, 1);
              }}
            />
          </div>
        )}

        {/* SUB-SYSTEM 2: TEACHER DASHBOARD & PRESENTATION */}
        {subsystem === "teacher" && (
          <div className="flex-1 overflow-y-auto bg-[#f8faf9] p-3 md:p-6">
            <TeacherDashboard
              onLaunchStation={(stId) => {
                const found = allStations.find((s) => s.id === stId);
                if (found) {
                  setStationId(found.id);
                  setModuleId(found.moduleId);
                  setViewMode("lab");
                  setSubsystem("student");
                }
              }}
              onOpenWorkbench={() => {
                setViewMode("lab");
                setSubsystem("student");
              }}
            />
          </div>
        )}

        {/* SUB-SYSTEM 3: RESEARCH & METHODOLOGY HUB */}
        {subsystem === "research" && (
          <div className="flex-1 overflow-y-auto bg-[#f8faf9] p-3 md:p-6">
            <ResearchMethodologyHub />
          </div>
        )}
      </main>

      {/* 3. FLOATING SOCRATIC TUTOR BUTTON ON BOTTOM RIGHT */}
      {!tutorOpen && (
        <button
          type="button"
          onClick={() => setTutorOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#087e7c] hover:bg-[#066563] text-white rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border-2 border-white/40"
          title="Mở Trợ lý gợi mở Socratic TES"
        >
          <Bot className="w-5 h-5 text-white" />
          <span className="font-extrabold tracking-wide">Trợ lý TES</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}

      {/* 4. SLIDE-OUT SOCRATIC AI TUTOR DRAWER (NO SQUASHING OF LAB WORKSPACE) */}
      {tutorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setTutorOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#d9e4e2] animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#e5ebe4] bg-[#f8faf9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#eff8f4] text-[#087e7c] border border-[#a3e2cf] flex items-center justify-center text-xl shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-sm text-[#152f35]">Trợ lý Socratic TES</strong>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Linh vật gợi mở · Tuyệt đối không cho đáp án trực tiếp
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab("ai");
                    setAccountModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#087e7c] font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Cấu hình Model AI & API Key riêng (Gemini, OpenAI, DeepSeek)"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#087e7c]" />
                  <span className="max-w-[120px] truncate">
                    {customAiConfig?.model || "Cấu hình AI"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTutorOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white border border-[#d9e4e2] text-gray-500 hover:text-black hover:bg-gray-50 flex items-center justify-center font-bold text-sm"
                  title="Đóng trợ lý"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Banner trạng thái Model AI đang kích hoạt */}
            {customAiConfig?.apiKey && (
              <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">
                    Model: <strong>{customAiConfig.model}</strong> ({customAiConfig.provider.toUpperCase()})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab("ai");
                    setAccountModalOpen(true);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 underline font-semibold text-[10px] shrink-0 ml-2"
                >
                  Đổi model
                </button>
              </div>
            )}

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((item) => (
                <article
                  key={item.id}
                  className={`flex gap-2.5 ${item.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.role === "assistant"
                        ? "bg-[#eff8f4] text-[#087e7c] border border-[#a3e2cf]"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : (session?.name || "E").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="max-w-[85%] space-y-1 text-xs">
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        item.role === "assistant"
                          ? "bg-[#f8faf9] text-[#152f35] border border-[#d9e4e2]"
                          : "bg-[#087e7c] text-white"
                      }`}
                    >
                      <MathMessage content={item.content} />
                    </div>
                    {item.nextQuestion && (
                      <button
                        onClick={() => void handleSendTutorMessage(item.nextQuestion)}
                        className="text-[10px] text-[#087e7c] hover:underline font-bold flex items-center gap-1 pl-1"
                      >
                        <span>↳</span>
                        <span>{item.nextQuestion}</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Bot className="w-3.5 h-3.5 text-[#087e7c]" />
                  <span className="italic">TES đang phân tích lập luận của em...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-[#e5ebe4] bg-[#fbfcf8] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Trợ lý sư phạm GDPT 2018</span>
                <button
                  type="button"
                  onClick={() => {
                    void handleSendTutorMessage("Em muốn tự suy nghĩ và thử tiếp mà không cần thêm gợi ý.");
                  }}
                  className="text-[#087e7c] hover:underline font-bold flex items-center gap-1"
                >
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#087e7c]" /><span>Em muốn tự thử tiếp</span></span>
                </button>
              </div>

              {error && <div className="text-[10px] text-red-600">{error}</div>}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendTutorMessage();
                }}
                className="flex gap-1.5"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendTutorMessage();
                    }
                  }}
                  placeholder="Hỏi trợ lý TES (Enter để gửi)..."
                  rows={2}
                  className="flex-1 border border-[#bed0cd] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#087e7c] resize-none"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="px-3 py-1.5 bg-[#087e7c] text-white rounded-xl font-bold text-xs hover:bg-[#066563] disabled:opacity-40 transition-colors"
                >
                  ↑
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* 5. VISUALIZER MODAL */}
      {visualizerOpen && (
        <MathGraphVisualizer
          moduleId={moduleId}
          onClose={() => setVisualizerOpen(false)}
        />
      )}

      {/* 6. AUTH LOGIN / SIGNUP MODAL */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#d9e4e2] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="text-[10px] font-bold text-[#087e7c] uppercase tracking-wider">
                  MATHSTEP TÀI KHOẢN
                </span>
                <h3 className="text-base font-bold text-[#152f35]">
                  {authMode === "login" ? "Đăng nhập tài khoản" : "Đăng ký tài khoản"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={login} className="space-y-3 text-xs">
              {authMode === "signup" && (
                <div>
                  <label className="font-bold block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full p-2 border border-[#bed0cd] rounded-lg text-xs"
                  />
                </div>
              )}
              <div>
                <label className="font-bold block mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full p-2 border border-[#bed0cd] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full p-2 pr-9 border border-[#bed0cd] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {loginError && <p className="text-[10px] text-red-600 font-medium">{loginError}</p>}
              {loginNotice && <p className="text-[10px] text-emerald-600 font-medium">{loginNotice}</p>}

              <button
                type="submit"
                disabled={loginBusy}
                className="w-full py-2 bg-[#087e7c] text-white font-bold rounded-xl hover:bg-[#066563] transition-colors disabled:opacity-50"
              >
                {loginBusy ? "Đang xử lý..." : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>

            {/* Phân cách HOẶC */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2.5 text-gray-400 text-[11px] font-medium">
                  hoặc
                </span>
              </div>
            </div>

            {/* Nút Tiếp tục bằng Google */}
            <a
              href="/api/auth/google"
              className="w-full py-2.5 px-4 border border-gray-300 hover:border-gray-400 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2.5 shadow-xs text-center"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục bằng Google</span>
            </a>

            <div className="pt-2 border-t text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setLoginError("");
                  setLoginNotice("");
                }}
                className="text-xs text-[#087e7c] font-bold hover:underline"
              >
                {authMode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="text-[11px] text-gray-500 hover:text-black"
                >
                  Tiếp tục trải nghiệm mà không cần tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ACCOUNT & CUSTOM AI SETTINGS MODAL */}
      <AccountSettingsModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        initialTab={accountModalTab}
        currentSession={session}
        onProfileUpdated={(updatedName) => {
          setSession((prev) => (prev ? { ...prev, name: updatedName } : { authenticated: true, name: updatedName, email: null }));
        }}
        onAiConfigUpdated={(cfg) => {
          setCustomAiConfig(cfg);
        }}
      />

      {/* FOOTER */}
      <footer className="bg-[#0b2329] text-gray-400 text-xs py-6 px-4 md:px-8 border-t border-[#284048] mt-auto">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#087e7c] text-white font-bold text-[10px] flex items-center justify-center">
              m
            </span>
            <span className="text-white font-bold">MathSTEP</span>
            <span>· Học bằng thao tác, hiểu bằng lập luận</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Chương trình GDPT 2018</span>
            <span>Toán 10 - 11 - 12</span>
            <span>Bộ SGK Kết nối tri thức</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#082329] flex flex-col items-center justify-center text-teal-400 gap-3">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide">Đang nạp dữ liệu trạm học MathSTEP...</span>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
