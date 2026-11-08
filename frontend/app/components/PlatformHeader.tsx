"use client";

import React from "react";
import Link from "next/link";
import { Layers, Compass, GraduationCap, FileText, Cpu, User } from "lucide-react";
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
  return (
    <header className="h-12 border-b border-slate-800 bg-[#090D16]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          onClick={() => onSelectSubsystem("student", "home")}
          className="flex items-center gap-2 text-white no-underline group"
        >
          <span className="w-7 h-7 rounded-md bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs group-hover:bg-blue-500 transition-colors">
            M
          </span>
          <div className="leading-tight">
            <strong className="font-sans text-xs tracking-wider font-bold block text-white">MATHSTEP</strong>
            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">HỌC LIỆU TOÁN HỌC 3D</span>
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
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenAccountModal("profile")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 text-xs transition-colors cursor-pointer"
              title="Hồ sơ học sinh"
            >
              <span className="w-5 h-5 rounded bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-200 line-clamp-1 max-w-[100px] hidden sm:inline">
                {session.name || session.email?.split("@")[0] || "Học viên"}
              </span>
              {session.role && (
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase hidden md:inline-block ${
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
            </button>

            {/* Nút Cấu hình AI Model */}
            <button
              type="button"
              onClick={() => onOpenAccountModal("ai")}
              className="px-2 py-1 rounded-md text-[11px] font-mono border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Cấu hình Model AI (Gemini 2.5, GPT-4o, DeepSeek R1)"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">
                {customAiConfig?.model
                  ? customAiConfig.model.replace("gemini-", "").replace("gpt-", "").replace("deepseek-", "")
                  : "Cài AI"}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="text-[11px] text-slate-400 hover:text-rose-400 font-medium px-1.5 py-1 transition-colors cursor-pointer"
              title="Đăng xuất tài khoản"
            >
              Thoát
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenAccountModal("ai")}
              className="px-2 py-1 rounded-md text-[11px] font-mono border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Dùng API Key cá nhân (Gemini, OpenAI)"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Cài AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
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
