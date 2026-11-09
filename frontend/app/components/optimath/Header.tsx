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
    <header className="sticky top-0 left-0 right-0 z-50 w-full h-14 bg-[#0B132B]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between select-none shadow-md transition-all">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* 1. BRAND LOGO & TITLE: Chuẩn phong cách MathSTEP · OPTIMATH LAB */}
        <button
          type="button"
          onClick={() => {
            onSelectModule("home");
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
          title="Về trang chủ MATHSTEP · OPTIMATH LAB"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
            M
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <strong className="font-sans text-xs tracking-wide font-bold block text-slate-100 group-hover:text-blue-400 transition-colors">
                MATHSTEP
              </strong>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 tracking-wider uppercase">
                OPTIMATH
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
              Học liệu số & Phòng thí nghiệm Toán THPT
            </span>
          </div>
        </button>

        {/* 2. NAVIGATION DESKTOP: 3 CHUYÊN ĐỀ MỚI (LOẠI BỎ HOÀN TOÀN TRẠM HỌC VÀ MODULE CŨ) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={() => onSelectModule("home")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentModule === "home"
                ? "bg-white/10 text-white font-semibold shadow-inner"
                : "text-slate-300 hover:text-white hover:bg-white/5"
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
                ? "bg-blue-600/90 text-white font-semibold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>CĐ1: BPT & Tối Ưu</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-300">Lớp 10</span>
          </button>

          {/* Chuyên đề 2: Hình học không gian 3D (Toán 11) */}
          <button
            type="button"
            onClick={() => onSelectModule("spatial_geometry")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === "spatial_geometry"
                ? "bg-emerald-600/90 text-white font-semibold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>CĐ2: Không Gian 3D</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-300">Lớp 11</span>
          </button>

          {/* Chuyên đề 3: Lượng giác (Toán 11) */}
          <button
            type="button"
            onClick={() => onSelectModule("trigonometry")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentModule === "trigonometry"
                ? "bg-purple-600/90 text-white font-semibold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>CĐ3: Lượng Giác</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-300">Lớp 11</span>
          </button>

          {/* Cơ sở KHKT */}
          <button
            type="button"
            onClick={() => onSelectModule("knowledge")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentModule === "knowledge"
                ? "bg-white/10 text-white font-semibold shadow-inner"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            title="Sổ tay phương pháp luận & cơ sở khoa học"
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            Cơ sở KHKT
          </button>

          {/* Dành cho Giáo viên */}
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Hướng dẫn sư phạm giáo viên"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-400" />
            <span>Giáo viên</span>
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
                  ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                  : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white border-blue-500/30 hover:border-blue-400"
              }`}
              title="Mở Trợ lý Socratic Opti"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">Hỏi Socratic AI</span>
              <span className="sm:hidden">Socratic</span>
            </button>
          )}

          {/* Linh vật Opti mini indicator */}
          <div
            onClick={() => onSelectModule("linear_programming")}
            className="hidden md:flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
            title="Đồng hành cùng Opti"
          >
            <span className="text-[11px] font-bold text-slate-300">Opti</span>
            <OptiMascot expression="happy" size={24} animate={false} />
          </div>

          {/* User Account / Login */}
          {sessionLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session?.authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                aria-expanded={userMenuOpen}
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate hidden sm:inline text-slate-200 font-medium">
                  {session.name || session.email?.split("@")[0] || "Học viên"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-blue-400" : ""
                  }`}
                />
              </button>

              {/* Account Dropdown Menu (Dark Frosted Glass Theme) */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B132B] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-200 backdrop-blur-xl"
                  role="menu"
                >
                  <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-100 truncate">
                        {session.name || "Học viên MathSTEP"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
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
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Hồ sơ cá nhân</span>
                        </button>
                      </>
                    )}

                    {onLogout && (
                      <div className="pt-1 mt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER (DARK THEMED) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 right-0 border-b border-white/10 bg-[#0B132B] px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150 text-slate-200">
          <button
            type="button"
            onClick={() => {
              onSelectModule("home");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              currentModule === "home" ? "bg-white/10 text-white font-bold" : "text-slate-300 hover:bg-white/5"
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
              currentModule === "linear_programming" ? "bg-blue-600/30 text-blue-300 font-bold" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Chuyên đề 1: BPT & Tối Ưu (Toán 10)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("spatial_geometry");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              currentModule === "spatial_geometry" ? "bg-emerald-600/30 text-emerald-300 font-bold" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Box className="w-4 h-4 text-emerald-400" />
            <span>Chuyên đề 2: Không Gian 3D (Toán 11)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("trigonometry");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              currentModule === "trigonometry" ? "bg-purple-600/30 text-purple-300 font-bold" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Chuyên đề 3: Lượng Giác (Toán 11)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectModule("knowledge");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-slate-300 hover:bg-white/5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Cơ sở KHKT & Sổ tay lý thuyết</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenTeacherGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
          >
            <Presentation className="w-4 h-4 text-amber-400" />
            <span>Hướng dẫn sư phạm giáo viên</span>
          </button>
        </div>
      )}
    </header>
  );
};
