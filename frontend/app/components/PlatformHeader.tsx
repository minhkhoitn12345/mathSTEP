"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Compass, GraduationCap, Settings, User, ChevronDown, LogOut, History, Sparkles, Trophy } from "lucide-react";
import { CustomAiConfig } from "./AccountSettingsModal";
import { OptiMascot } from "./optimath/mascot/OptiMascot";

export type SubsystemId = "student" | "teacher" | "research";
export type ViewMode = "home" | "lab";

interface SessionData {
  authenticated: boolean;
  name: string | null;
  email: string | null;
  role?: string;
  provider?: string;
}

interface PlatformHeaderProps {
  subsystem: SubsystemId;
  viewMode?: ViewMode;
  activeSection?: "stations" | "modules";
  onSelectSubsystem: (sub: SubsystemId, view?: ViewMode) => void;
  onNavigateHome?: () => void;
  onNavigateStations?: () => void;
  onNavigateModules?: () => void;
  session: SessionData | null;
  sessionLoading: boolean;
  customAiConfig: CustomAiConfig | null;
  onOpenAccountModal: (tab: "profile" | "ai") => void;
  onOpenChatHistory?: () => void;
  onOpenTeacherVerification?: () => void;
  onSwitchToStudentView?: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function PlatformHeader({
  subsystem,
  activeSection: _activeSection,
  onSelectSubsystem,
  onNavigateHome,
  onNavigateStations: _onNavigateStations,
  onNavigateModules: _onNavigateModules,
  session,
  sessionLoading,
  customAiConfig,
  onOpenAccountModal,
  onOpenChatHistory,
  onOpenTeacherVerification,
  onSwitchToStudentView,
  onOpenAuthModal,
  onLogout,
}: PlatformHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi nhấn ra ngoài hoặc nhấn phím Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
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
  const isTeacher = Boolean(
    session?.authenticated && (session.role === "teacher" || session.role === "admin")
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-13 bg-[#0B132B]/80 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between select-none">
        {/* Brand Logo & Name: Nhấn để quay lại section đầu tiên */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              onSelectSubsystem("student", "home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2.5 text-white no-underline group cursor-pointer"
          title="Quay lại đầu trang MathSTEP"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs group-hover:bg-blue-500 transition-colors">
            M
          </span>
          <div className="leading-tight">
            <strong className="font-sans text-xs tracking-wide font-bold block text-slate-100 group-hover:text-white transition-colors">
              MATHSTEP
            </strong>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
              Học liệu số Toán THPT
            </span>
          </div>
        </Link>
      </div>

      {/* THANH ĐIỀU HƯỚNG TỐI GIẢN (3 CHUYÊN ĐỀ MỚI THEO OPTIMATH LAB) */}
      <nav className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else onSelectSubsystem("student", "home");
          }}
          className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-white bg-white/10 font-semibold"
        >
          Trang chủ
        </button>

        <Link
          href="/optimath"
          className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>3 Chuyên đề Lab</span>
        </Link>

        {/* Tab: Cơ sở KHKT */}
        <button
          type="button"
          onClick={() => onSelectSubsystem("research", "home")}
          className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer ${
            subsystem === "research"
              ? "text-white bg-white/10 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
          }`}
        >
          Cơ sở KHKT
        </button>

        {/* Tab: Giáo viên */}
        {isTeacher && (
          <button
            type="button"
            onClick={() => onSelectSubsystem("teacher", "home")}
            className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer ${
              subsystem === "teacher"
                ? "text-amber-300 bg-amber-500/10 font-semibold"
                : "text-slate-400 hover:text-amber-300 hover:bg-white/[0.02]"
            }`}
          >
            Giáo viên
          </button>
        )}
        <Link
          href="/leaderboard"
          title="Bảng xếp hạng học tập"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10 hover:text-amber-100 sm:text-sm"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span>Bảng xếp hạng</span>
        </Link>
      </nav>

      {/* USER MENU & AUTH */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Nút truy cập nhanh Optimath Lab kèm Linh vật Opti */}
        <Link
          href="/optimath"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs active:scale-95 group"
          title="Mở phòng thí nghiệm Toán học tương tác OPTIMATH LAB"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <OptiMascot expression="happy" size={22} animate={false} />
          </div>
          <span className="hidden sm:inline font-bold tracking-tight">Optimath Lab</span>
          <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/30 text-blue-200 hidden md:inline">
            7 Bước
          </span>
        </Link>

        {sessionLoading ? (
          <span className="text-[10px] text-slate-500 font-mono">...</span>
        ) : session?.authenticated ? (
          <div className="relative" ref={userMenuRef}>
            {/* 1. NÚT KÍCH HOẠT (TRIGGER BUTTON TRÊN HEADER) */}
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs group"
              title="Tài khoản học tập (nhấn để mở menu)"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              {/* Avatar vòng tròn chữ cái đầu */}
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-blue-400/30 group-hover:ring-blue-400/60 transition-all">
                {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
              </span>

              {/* Tên người dùng (Responsive: ẩn trên mobile nhỏ, hiện từ sm+) */}
              <span className="text-xs font-semibold text-slate-200 max-w-[130px] truncate hidden sm:inline group-hover:text-white transition-colors">
                {session.name || session.email?.split("@")[0] || "Học viên"}
              </span>

              {/* Icon mũi tên xuống (ChevronDown) với animation xoay mượt mà */}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ease-out ${
                  userMenuOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {/* 2. CẤU TRÚC NỘI DUNG BÊN TRONG DROPDOWN MENU */}
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-[#0B132B] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 ease-out origin-top-right text-xs select-none backdrop-blur-md"
                role="menu"
              >
                {/* PHẦN HEADER MENU: Avatar lớn hơn, tên đầy đủ, email / vai trò */}
                <div className="px-3.5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-md ring-2 ring-blue-500/20">
                    {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate">
                      {session.name || "Học viên MathSTEP"}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {session.email || "Tài khoản học tập"}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-block ${
                          session.role === "teacher"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : session.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : session.role === "researcher"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {session.role === "teacher"
                          ? "Giáo viên"
                          : session.role === "admin"
                          ? "Quản trị viên"
                          : session.role === "researcher"
                          ? "Nghiên cứu KHKT"
                          : "Học sinh THPT"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Đường kẻ phân cách (Divider) */}
                <div className="my-1 border-t border-slate-800/80" />

                {/* DANH SÁCH CÁC MỤC CHỨC NĂNG */}
                <div className="px-1.5 py-0.5 space-y-0.5">
                  {/* Mục 1: Lịch sử trò chuyện */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenChatHistory?.();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                    role="menuitem"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-950/60 text-sky-400 border border-sky-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block text-slate-200 group-hover:text-white">
                        Lịch sử trò chuyện
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        Xem lại các đoạn chat Socratic AI
                      </span>
                    </div>
                  </button>

                  {/* Mục 2: Cài đặt */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAccountModal("ai");
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                    role="menuitem"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block text-slate-200 group-hover:text-white">
                        Cài đặt
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {customAiConfig?.model
                          ? `Model: ${customAiConfig.model.replace("gemini-", "")}`
                          : "Cấu hình API Key & Model AI"}
                      </span>
                    </div>
                  </button>

                  {/* Mục 3: Chuyển đổi vai trò Giáo viên / Học sinh */}
                  {session.role === "teacher" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSwitchToStudentView?.();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-blue-300 hover:text-white hover:bg-blue-950/40 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                      role="menuitem"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold block text-slate-200 group-hover:text-blue-300">
                          Góc nhìn Học sinh
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Trải nghiệm lộ trình học sinh
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenTeacherVerification?.();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-amber-300 hover:text-white hover:bg-amber-950/40 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                      role="menuitem"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold block text-slate-200 group-hover:text-amber-300">
                          Kích hoạt quyền Giáo viên
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Mở khóa Kế hoạch bài dạy & Ma trận
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Đường kẻ phân cách (Divider) */}
                <div className="my-1 border-t border-slate-800/80" />

                {/* MỤC HÀNH ĐỘNG: ĐĂNG XUẤT */}
                <div className="px-1.5 py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 active:bg-rose-950/60 transition-all duration-150 flex items-center gap-3 cursor-pointer group"
                    role="menuitem"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-950/50 text-rose-400 border border-rose-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <span className="font-semibold">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          </div>
        )}
      </div>
    </header>
    {/* Spacer giữ chỗ để nội dung trang không bị đẩy lùi lên dưới header cố định */}
    <div className="h-13 w-full shrink-0" aria-hidden="true" />
  </>
  );
}
