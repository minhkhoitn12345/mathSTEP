"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import {
  Presentation,
  Compass,
  Box,
  Activity,
  User,
  ChevronDown,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  BookOpen,
  Search,
  Trophy,
} from "lucide-react";

export interface SessionData {
  authenticated: boolean;
  userId?: string | null;
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
  // Dropdown states for Desktop
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const [docsMenuOpen, setDocsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mobile drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSimExpanded, setMobileSimExpanded] = useState(true);

  // Dropdown refs for click-outside detection
  const simMenuRef = useRef<HTMLDivElement>(null);
  const docsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (simMenuRef.current && !simMenuRef.current.contains(target)) {
        setSimMenuOpen(false);
      }
      if (docsMenuRef.current && !docsMenuRef.current.contains(target)) {
        setDocsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSimMenuOpen(false);
        setDocsMenuOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Check if current view is a simulation lab
  const isSimActive = [
    "linear_programming",
    "spatial_geometry",
    "trigonometry",
    "lab",
    "system",
    "optimization",
    "quiz",
  ].includes(currentModule);

  // Check if user has teacher role
  const canAccessTeacher = session?.role === "teacher" || session?.role === "admin";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full h-14 bg-[#0B132B]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between select-none shadow-md transition-all">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* 1. BRAND LOGO: MathSTEP */}
        <button
          type="button"
          onClick={() => {
            onSelectModule("home");
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
          title="Về mục lục tìm kiếm bài học"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
            M
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <strong className="font-sans text-xs tracking-wide font-bold block text-slate-100 group-hover:text-blue-400 transition-colors">
                MathSTEP
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

        {/* 2. DESKTOP NAVIGATION: Bài học | Mô phỏng ▾ | Tài liệu ▾ */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300">
          {/* Menu 1: Bài học (Về mục lục tìm kiếm ở trang chủ) */}
          <button
            type="button"
            onClick={() => onSelectModule("home")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentModule === "home" || currentModule === "learning_path" || currentModule === "lesson_study"
                ? "bg-white/10 text-white font-semibold shadow-inner"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
            title="Mục lục bài học & Tìm kiếm"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Bài học</span>
          </button>

          {/* Menu 2: Mô phỏng ▾ (Gom 3 chuyên đề hiện có thành menu con) */}
          <div className="relative" ref={simMenuRef}>
            <button
              type="button"
              onClick={() => {
                setSimMenuOpen((prev) => !prev);
                setDocsMenuOpen(false);
                setUserMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSimActive
                  ? "bg-blue-600/90 text-white font-semibold shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              aria-expanded={simMenuOpen}
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Mô phỏng</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  simMenuOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {simMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0B132B] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-200 backdrop-blur-xl">
                <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Phòng thí nghiệm thực hành
                </div>

                {/* CĐ1 */}
                <button
                  type="button"
                  onClick={() => {
                    setSimMenuOpen(false);
                    onSelectModule("linear_programming");
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <Compass className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-100 group-hover:text-blue-300 truncate">
                      CĐ1: BPT & Tối Ưu Tuyến Tính
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Quét đường mức, xưởng mộc & đa giác nghiệm
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0">
                    Toán 10
                  </span>
                </button>

                {/* CĐ2 */}
                <button
                  type="button"
                  onClick={() => {
                    setSimMenuOpen(false);
                    onSelectModule("spatial_geometry");
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <Box className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-100 group-hover:text-emerald-300 truncate">
                      CĐ2: Hình Học Không Gian 3D
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Chóp S.ABCD, nét khuất, thiết diện & trải phẳng
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    Toán 11
                  </span>
                </button>

                {/* CĐ3 */}
                <button
                  type="button"
                  onClick={() => {
                    setSimMenuOpen(false);
                    onSelectModule("trigonometry");
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-100 group-hover:text-purple-300 truncate">
                      CĐ3: Lượng Giác Tương Tác
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Vòng tròn đơn vị, cung liên kết & sóng sin/cos
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
                    Toán 11
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Menu 3: Tài liệu ▾ (Cơ sở KHKT và Hướng dẫn giáo viên) */}
          <div className="relative" ref={docsMenuRef}>
            <button
              type="button"
              onClick={() => {
                setDocsMenuOpen((prev) => !prev);
                setSimMenuOpen(false);
                setUserMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentModule === "knowledge"
                  ? "bg-white/10 text-white font-semibold shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              aria-expanded={docsMenuOpen}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Tài liệu</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  docsMenuOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {docsMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0B132B] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-200 backdrop-blur-xl">
                {/* Cơ sở KHKT */}
                <button
                  type="button"
                  onClick={() => {
                    setDocsMenuOpen(false);
                    onSelectModule("knowledge");
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <span className="p-2 rounded-xl bg-slate-500/10 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-blue-300">
                      Cơ sở KHKT & Sổ tay lý thuyết
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Phương pháp luận & Nghiên cứu sư phạm
                    </div>
                  </div>
                </button>

                {/* Hướng dẫn giáo viên (chỉ hiện khi phù hợp) */}
                {canAccessTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setDocsMenuOpen(false);
                      onOpenTeacherGuide();
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-amber-500/10 flex items-center gap-3 transition-colors cursor-pointer group text-amber-300 border-t border-white/5"
                  >
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                      <Presentation className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-amber-300 group-hover:text-amber-200 flex items-center gap-1.5">
                        <span>Hướng dẫn giáo viên</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-extrabold uppercase">
                          Sư phạm
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400/80">
                        Kế hoạch bài dạy & Chuẩn GDPT 2018
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* 3. RIGHT SECTION: Nút Hỏi Opti & Tài khoản */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/leaderboard"
            title="Bảng xếp hạng học tập"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-400/15 sm:px-3"
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            <span className="hidden text-xs font-bold md:inline">Xếp hạng</span>
          </Link>
          {/* Nút Hỏi Opti rõ ràng */}
          {onToggleChatDrawer && (
            <button
              type="button"
              onClick={onToggleChatDrawer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                chatDrawerOpen
                  ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                  : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white border-blue-500/30 hover:border-blue-400"
              }`}
              title="Mở trợ lý học tập Opti"
            >
              <OptiMascot expression="happy" size={20} animate={false} />
              <span className="font-bold">Hỏi Opti</span>
            </button>
          )}

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
                  {session.name || session.email?.split("@")[0] || "Tài khoản"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-blue-400" : ""
                  }`}
                />
              </button>

              {/* Account Dropdown Menu */}
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

      {/* 4. MOBILE NAVIGATION DRAWER: Tìm bài → Mô phỏng → Tài liệu → Giáo viên (nếu có quyền) → Tài khoản */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 right-0 border-b border-white/10 bg-[#0B132B] px-4 py-3 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-150 text-slate-200">
          {/* Mục 1: Tìm bài */}
          <button
            type="button"
            onClick={() => {
              onSelectModule("home");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              currentModule === "home" ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span>Tìm bài (Mục lục bài học)</span>
          </button>

          {/* Mục 2: Mô phỏng (mở rộng hiển thị 3 chuyên đề) */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSimExpanded((prev) => !prev)}
              className="w-full text-left px-3 py-2.5 text-xs font-bold flex items-center justify-between text-blue-300 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Mô phỏng thực hành</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${
                  mobileSimExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileSimExpanded && (
              <div className="px-2 pb-2 pt-1 space-y-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onSelectModule("linear_programming");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    currentModule === "linear_programming"
                      ? "bg-blue-600/40 text-blue-300 font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">CĐ1: BPT & Tối Ưu</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">Lớp 10</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectModule("spatial_geometry");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    currentModule === "spatial_geometry"
                      ? "bg-emerald-600/40 text-emerald-300 font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Box className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">CĐ2: Không Gian 3D</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">Lớp 11</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectModule("trigonometry");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    currentModule === "trigonometry"
                      ? "bg-purple-600/40 text-purple-300 font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">CĐ3: Lượng Giác</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">Lớp 11</span>
                </button>
              </div>
            )}
          </div>

          {/* Mục 3: Tài liệu */}
          <button
            type="button"
            onClick={() => {
              onSelectModule("knowledge");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:bg-white/5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Tài liệu: Cơ sở KHKT & Sổ tay</span>
          </button>

          {/* Mục 4: Giáo viên (chỉ hiện khi có quyền) */}
          {canAccessTeacher && (
            <button
              type="button"
              onClick={() => {
                onOpenTeacherGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>Hướng dẫn sư phạm giáo viên</span>
            </button>
          )}

          {/* Mục 5: Tài khoản */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            {session?.authenticated ? (
              <>
                <div className="px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    {(session.name || session.email || "M").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate text-slate-200 font-semibold">{session.name || session.email}</span>
                </div>
                {onOpenChatHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChatHistory();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lịch sử trò chuyện AI</span>
                  </button>
                )}
                {onOpenAccountModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAccountModal("ai");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cấu hình AI (Gemini Key)</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Đăng xuất</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAuthModal?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập tài khoản</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
