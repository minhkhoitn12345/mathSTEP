"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Layers, Compass, GraduationCap, FileText, Settings, User, ChevronDown, LogOut } from "lucide-react";
import { CustomAiConfig } from "./AccountSettingsModal";

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
  viewMode: ViewMode;
  onSelectSubsystem: (sub: SubsystemId, view?: ViewMode) => void;
  session: SessionData | null;
  sessionLoading: boolean;
  customAiConfig: CustomAiConfig | null;
  onOpenAccountModal: (tab: "profile" | "ai") => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function PlatformHeader({
  subsystem,
  viewMode,
  onSelectSubsystem,
  session,
  sessionLoading,
  customAiConfig,
  onOpenAccountModal,
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
  return (
    <header className="h-13 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          onClick={() => onSelectSubsystem("student", "home")}
          className="flex items-center gap-2.5 text-white no-underline group"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs group-hover:bg-blue-500 transition-colors">
            M
          </span>
          <div className="leading-tight">
            <strong className="font-sans text-xs tracking-wide font-bold block text-slate-100 group-hover:text-white transition-colors">MATHSTEP</strong>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Học liệu số Toán THPT</span>
          </div>
        </Link>
      </div>

      {/* 3 PHÂN HỆ CHÍNH KHKT NAVIGATION TABS (SEGMENTED CONTROL) */}
      <nav className="flex items-center bg-slate-900 p-0.5 rounded-md border border-slate-800 h-8">
        <button
          type="button"
          onClick={() => onSelectSubsystem("student", "home")}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            subsystem === "student" && viewMode === "home"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">48 Trạm học</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSubsystem("student", "lab")}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            subsystem === "student" && viewMode === "lab"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Phòng thực hành</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSubsystem("teacher", "home")}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            subsystem === "teacher"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Giáo viên</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSubsystem("research", "home")}
          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            subsystem === "research"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Cơ sở KHKT</span>
        </button>
      </nav>

      {/* USER MENU & AUTH */}
      <div className="flex items-center gap-1.5">
        {sessionLoading ? (
          <span className="text-[10px] text-slate-500 font-mono">...</span>
        ) : session?.authenticated ? (
          <div className="relative" ref={userMenuRef}>
            {/* Nút bấm vào Tên người dùng */}
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 text-xs transition-colors cursor-pointer group"
              title="Tài khoản học tập (nhấn để mở Cài đặt & Đăng xuất)"
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                {session.name || session.email?.split("@")[0] || "Học viên"}
              </span>
              {session.role && (
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase hidden sm:inline-block ${
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
                    ? "GV"
                    : session.role === "admin"
                    ? "Admin"
                    : session.role === "researcher"
                    ? "NCKH"
                    : "HS"}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-150 ${
                  userMenuOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {/* Menu thả xuống khi nhấn vào tên */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                {/* Thông tin tài khoản */}
                <div className="px-3.5 py-2.5 border-b border-slate-800/80 mb-1 bg-slate-950/40">
                  <div className="font-bold text-slate-100 truncate text-xs">
                    {session.name || "Học viên MathSTEP"}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {session.email || "Tài khoản học tập"}
                  </div>
                </div>

                {/* Nút 1: Cài đặt */}
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAccountModal("ai");
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold block text-slate-200">Cài đặt</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {customAiConfig?.model
                        ? `AI: ${customAiConfig.model.replace("gemini-", "").replace("gpt-", "").replace("deepseek-", "")}`
                        : "Hồ sơ & Cấu hình AI"}
                    </span>
                  </div>
                </button>

                {/* Phân cách */}
                <div className="my-1 border-t border-slate-800" />

                {/* Nút 2: Đăng xuất */}
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold">Đăng xuất</span>
                </button>
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
  );
}
