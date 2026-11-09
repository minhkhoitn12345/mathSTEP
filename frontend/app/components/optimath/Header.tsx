"use client";

import React, { useState, useRef, useEffect } from "react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import {
  Presentation,
  Compass,
  Box,
  Activity,
  Sparkles,
  User,
  ChevronDown,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  BookOpen,
} from "lucide-react";

export interface SessionData {
  authenticated: boolean;
  name: string | null;
  email: string | null;
  role?: string;
  provider?: string;
}

interface HeaderProps {
  currentModule: string;
  onSelectModule: (modId: string) => void;
  onOpenTeacherGuide: () => void;
  onToggleChatDrawer?: () => void;
  chatDrawerOpen?: boolean;
  session?: SessionData | null;
  sessionLoading?: boolean;
  onOpenAccountModal?: (tab: "profile" | "ai") => void;
  onOpenChatHistory?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  onOpenTeacherGuide,
  onToggleChatDrawer,
  chatDrawerOpen,
  session,
  sessionLoading = false,
  onOpenAccountModal,
  onOpenChatHistory,
  onOpenAuthModal,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  const isLab = currentModule !== "home" && currentModule !== "knowledge";

  return (
    <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md transition-all select-none shadow-xs">
      <div
        className={`max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 transition-all ${
          isLab ? "h-14 sm:h-15" : "h-16"
        }`}
      >
        {/* 1. BRAND LOGO */}
        <button
          type="button"
          onClick={() => {
            onSelectModule("home");
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          title="Về trang chủ MATHSTEP · OPTIMATH LAB"
        >
          <div
            className={`rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform ${
              isLab ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10"
            }`}
          >
            <svg viewBox="0 0 40 40" className={isLab ? "w-5 h-5" : "w-6 h-6"} fill="none">
              <path
                d="M 12 28 L 20 12 L 28 28 Z"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="3.2" fill="#FBBF24" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors ${
                  isLab ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                }`}
              >
                MATHSTEP
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 tracking-wider uppercase">
                3 CHUYÊN ĐỀ
              </span>
            </div>
            {!isLab && (
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                Học liệu số & Phòng thí nghiệm Toán học tương tác GDPT 2018
              </p>
            )}
          </div>
        </button>

        {/* 2. NAVIGATION DESKTOP: 3 CORE RESEARCH MODULES */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onSelectModule("home")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentModule === "home"
                ? "bg-slate-100 text-slate-900 font-bold"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            Trang chủ
          </button>

          {/* Chuyên đề 1: BPT & Tối ưu (Toán 10) */}
          <button
            type="button"
            onClick={() => onSelectModule("linear_programming")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === "linear_programming" ||
              currentModule === "lab" ||
              currentModule === "system" ||
              currentModule === "optimization" ||
              currentModule === "quiz"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "hover:bg-blue-50 text-blue-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>CĐ1: BPT & Tối Ưu</span>
            <span className="text-[9px] px-1 rounded bg-white/20">Lớp 10</span>
          </button>

          {/* Chuyên đề 2: Hình học không gian 3D (Toán 11) */}
          <button
            type="button"
            onClick={() => onSelectModule("spatial_geometry")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === "spatial_geometry"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "hover:bg-emerald-50 text-emerald-800"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>CĐ2: Không Gian 3D</span>
            <span className="text-[9px] px-1 rounded bg-white/20">Lớp 11</span>
          </button>

          {/* Chuyên đề 3: Lượng giác (Toán 11) */}
          <button
            type="button"
            onClick={() => onSelectModule("trigonometry")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === "trigonometry"
                ? "bg-purple-600 text-white font-bold shadow-xs"
                : "hover:bg-purple-50 text-purple-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CĐ3: Lượng Giác</span>
            <span className="text-[9px] px-1 rounded bg-white/20">Lớp 11</span>
          </button>

          {/* Sổ tay lý thuyết */}
          <button
            type="button"
            onClick={() => onSelectModule("knowledge")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentModule === "knowledge"
                ? "bg-slate-100 text-slate-900 font-bold"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            title="Sổ tay phương pháp luận & cơ sở khoa học"
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
            Lý thuyết
          </button>
        </nav>

        {/* 3. RIGHT CTAS & USER PROFILE */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Nút Kích hoạt Trợ lý Socratic AI */}
          {onToggleChatDrawer && (
            <button
              type="button"
              onClick={onToggleChatDrawer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                chatDrawerOpen
                  ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
                  : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border-blue-200"
              }`}
              title="Mở Trợ lý Opti Socratic AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Hỏi Socratic AI</span>
              <span className="sm:hidden">Socratic</span>
            </button>
          )}

          {/* Nút Chế độ giáo viên */}
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 text-purple-600" />
            <span>Giáo viên</span>
          </button>

          {/* Linh vật Opti mini indicator */}
          <div
            onClick={() => onSelectModule("linear_programming")}
            className="hidden md:flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 cursor-pointer transition-colors"
            title="Đồng hành cùng Opti"
          >
            <span className="text-[11px] font-bold text-slate-700">Opti</span>
            <OptiMascot expression="happy" size={26} animate={false} />
          </div>

          {/* User Account / Login */}
          {sessionLoading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : session?.authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                aria-expanded={userMenuOpen}
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {session.name || session.email?.split("@")[0] || "Học viên"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Account Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-800"
                  role="menu"
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">
                        {session.name || "Học viên MathSTEP"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {session.email}
                      </div>
                    </div>
                  </div>

                  <div className="px-1.5 py-1 space-y-0.5">
                    {onOpenChatHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenChatHistory();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>Lịch sử trò chuyện AI</span>
                      </button>
                    )}

                    {onOpenAccountModal && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAccountModal("ai");
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Cấu hình AI (Gemini Key)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAccountModal("profile");
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Hồ sơ cá nhân</span>
                        </button>
                      </>
                    )}

                    {onLogout && (
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => {
              onSelectModule("home");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              currentModule === "home" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Trang chủ
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("linear_programming");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              currentModule === "linear_programming" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Chuyên đề 1: BPT & Tối Ưu (Toán 10)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("spatial_geometry");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              currentModule === "spatial_geometry" ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Box className="w-4 h-4 text-emerald-600" />
            <span>Chuyên đề 2: Không Gian 3D (Toán 11)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("trigonometry");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              currentModule === "trigonometry" ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Chuyên đề 3: Lượng Giác (Toán 11)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("knowledge");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Sổ tay lý thuyết & phương pháp</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenTeacherGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100"
          >
            <Presentation className="w-4 h-4 text-purple-600" />
            <span>Hướng dẫn sư phạm giáo viên</span>
          </button>
        </div>
      )}
    </header>
  );
};
