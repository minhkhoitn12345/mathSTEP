"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Save,
  Trash2,
  SlidersHorizontal,
  Settings,
  Download,
  GraduationCap,
} from "lucide-react";
import { downloadBackupFile } from "../lib/useStationStorage";

export interface CustomAiConfig {
  provider: "gemini";
  model: string;
  apiKey: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  grade: number;
  school: string;
  target: string;
}

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "profile" | "ai";
  currentSession: {
    authenticated: boolean;
    name: string | null;
    email: string | null;
    role?: string;
    email_verified?: boolean;
  } | null;
  onProfileUpdated?: (name: string) => void;
  onRoleUpdated?: (role: string) => void;
  onAiConfigUpdated?: (config: CustomAiConfig | null) => void;
}

const AI_MODEL_OPTIONS = [
    {
      id: "gemini-3-flash-preview",
      label: "Gemini 3 Flash",
      desc: "Thế hệ mới nhất từ Google, siêu nhanh, nhận diện câu hỏi Toán THPT cực nhạy.",
      isRecommended: true,
    },
    {
      id: "gemini-3.5-flash-lite",
      label: "Gemini 3.5 Flash Lite",
      desc: "Bản Flash Lite tối ưu tốc độ và độ trễ thấp.",
    },
    {
      id: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      desc: "Bản flash tiêu chuẩn ổn định.",
    },
    {
      id: "gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      desc: "Tư duy toán học và logic Socratic chuyên sâu, giải thích chặt chẽ.",
    },
];

export default function AccountSettingsModal({
  isOpen,
  onClose,
  initialTab = "profile",
  currentSession,
  onProfileUpdated,
  onRoleUpdated,
  onAiConfigUpdated,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "ai">(initialTab);

  // Profile Form States
  const [name, setName] = useState<string>(currentSession?.name || "");
  const [grade, setGrade] = useState<number>(10);
  const [school, setSchool] = useState<string>("");
  const [target, setTarget] = useState<string>("Nghiên cứu KHKT & GDPT 2018");
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileNotice, setProfileNotice] = useState<string>("");
  const [profileError, setProfileError] = useState<string>("");

  // Teacher Verification States
  const [teacherCode, setTeacherCode] = useState("");
  const [verifyingTeacher, setVerifyingTeacher] = useState(false);
  const [teacherVerifyMsg, setTeacherVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // AI Config Form States
  const provider = "gemini" as const;
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3-flash-preview");
  const [apiKey, setApiKey] = useState<string>("");
  const [savedApiKeyConfigured, setSavedApiKeyConfigured] = useState(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testingKey, setTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [aiSaving, setAiSaving] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string>("");

  // Nạp dữ liệu khi modal mở ra
  useEffect(() => {
    if (!isOpen) return;
    localStorage.removeItem("mathstep:custom_ai_config");
    localStorage.removeItem("mathstep:user_profile");
    setActiveTab(initialTab);

    // 1. Tải hồ sơ từ server / localStorage
    setName(currentSession?.name || "");
    if (currentSession?.authenticated) {
      void fetch("/api/account/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) {
            if (data.profile.name) setName(data.profile.name);
            if (data.profile.grade) setGrade(data.profile.grade);
            if (data.profile.school) setSchool(data.profile.school);
            if (data.profile.target) setTarget(data.profile.target);
          }
        })
        .catch(() => {});
    }

    // Chỉ đọc trạng thái đã lưu; tuyệt đối không lấy lại API key từ trình duyệt.
    if (currentSession?.authenticated) {
      void fetch("/api/account/api-key", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setSavedApiKeyConfigured(Boolean(data?.configured)))
        .catch(() => setSavedApiKeyConfigured(false));
    } else {
      setSavedApiKeyConfigured(false);
    }
  }, [isOpen, initialTab, currentSession]);

  // Lưu hồ sơ cá nhân
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice("");
    setProfileError("");

    try {
      const trimmedName = name.trim();
      const updatedProfile = { name: trimmedName, grade, school: school.trim(), target: target.trim() };
      if (currentSession?.authenticated) {
        const res = await fetch("/api/account/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.detail?.message || "Lỗi khi lưu hồ sơ lên server.");
        }
      }

      onProfileUpdated?.(trimmedName);
      setProfileNotice("Đã lưu thông tin hồ sơ học tập thành công!");
      setTimeout(() => setProfileNotice(""), 3500);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Xác thực quyền Giáo viên
  const handleVerifyTeacher = async () => {
    if (!teacherCode.trim()) {
      setTeacherVerifyMsg({ ok: false, text: "Vui lòng nhập Mã xác thực Sư phạm." });
      return;
    }
    setVerifyingTeacher(true);
    setTeacherVerifyMsg(null);
    try {
      const res = await fetch("/api/account/verify-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherCode: teacherCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail?.message || data?.message || "Mã xác thực không hợp lệ.");
      }
      setTeacherVerifyMsg({ ok: true, text: data.message || "Đã kích hoạt quyền Giáo viên thành công!" });
      onRoleUpdated?.("teacher");
    } catch (err: unknown) {
      setTeacherVerifyMsg({ ok: false, text: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xác thực." });
    } finally {
      setVerifyingTeacher(false);
    }
  };

  // Chuyển về góc nhìn Học sinh
  const handleSwitchToStudent = async () => {
    setVerifyingTeacher(true);
    setTeacherVerifyMsg(null);
    try {
      await fetch("/api/account/verify-teacher", { method: "DELETE" });
      setTeacherVerifyMsg({ ok: true, text: "Đã chuyển đổi thành công về góc nhìn Học sinh." });
      onRoleUpdated?.("student");
    } catch {
      setTeacherVerifyMsg({ ok: false, text: "Không thể chuyển đổi lúc này." });
    } finally {
      setVerifyingTeacher(false);
    }
  };

  // Kiểm tra kết nối API Key
  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: "Vui lòng nhập API Key để kiểm tra." });
      return;
    }
    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/account/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: selectedModel,
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, message: data.message || "Kết nối API Key thành công!" });
      } else {
        setTestResult({ ok: false, message: data?.detail?.message || "API Key không hợp lệ." });
      }
    } catch (err: unknown) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Kiểm tra thất bại." });
    } finally {
      setTestingKey(false);
    }
  };

  // Lưu cấu hình AI Key & Model
  const handleSaveAiConfig = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setTestResult({ ok: false, message: "Vui lòng nhập API key hoặc nhấn nút 'Về mặc định'." });
      return;
    }

    setAiSaving(true);
    setAiNotice("");

    try {
      if (!currentSession?.authenticated) throw new Error("Vui lòng đăng nhập để lưu API key an toàn vào tài khoản.");
      const res = await fetch("/api/account/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: trimmedKey }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail?.message || "Không lưu được API key vào tài khoản.");

      setSavedApiKeyConfigured(true);
      setApiKey("");
      // Keep it only in app memory for the current page session so the selected provider still works.
      onAiConfigUpdated?.({ provider, model: selectedModel, apiKey: trimmedKey });
      setAiNotice("API key đã được lưu an toàn vào tài khoản. Khóa không được lưu trong trình duyệt.");
      setTimeout(() => setAiNotice(""), 4000);
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Không lưu được API key." });
    } finally {
      setAiSaving(false);
    }
  };

  // Xóa API Key về mô hình mặc định
  const handleClearAiConfig = async () => {
    if (confirm("Em có muốn xóa API key cá nhân và quay về sử dụng mô hình trợ lý mặc định?")) {
      if (currentSession?.authenticated) {
        const res = await fetch("/api/account/api-key", { method: "DELETE" });
        if (!res.ok) {
          setTestResult({ ok: false, message: "Không xóa được API key khỏi tài khoản." });
          return;
        }
      }
      setSavedApiKeyConfigured(false);
      setApiKey("");
      setTestResult(null);
      onAiConfigUpdated?.(null);
      setAiNotice("Đã quay về mô hình trợ lý mặc định của hệ thống.");
      setTimeout(() => setAiNotice(""), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 text-slate-100 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Header */}
        <header className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cài đặt Hệ thống & Hồ sơ</h2>
              <p className="text-[11px] text-slate-400">
                Quản lý thông tin học tập và cấu hình mô hình trợ lý sư phạm Socratic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </header>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-4 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "ai"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cấu hình Trợ lý học tập</span>
            {apiKey.trim() && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã có API key" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Avatar + Email Info Box */}
              <div className="flex items-center gap-3.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                  {(name || currentSession?.email || "M").slice(0, 1).toUpperCase()}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm text-white font-bold truncate block">
                      {name || (currentSession?.role === "teacher" ? "Giáo viên MathSTEP" : "Học sinh MathSTEP")}
                    </strong>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      currentSession?.role === "teacher"
                        ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                        : currentSession?.role === "admin"
                        ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                        : "bg-blue-950/60 text-blue-300 border-blue-800/60"
                    }`}>
                      {currentSession?.role === "teacher" ? "👨‍🏫 Giáo viên THPT" : currentSession?.role === "admin" ? "⚡ Quản trị viên" : "🎓 Học sinh THPT"}
                    </span>
                    {currentSession?.authenticated && (
                      currentSession.email_verified !== false ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                          ✓ Đã xác thực email
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold text-[10px]">
                          ⚠️ Chưa xác thực email
                        </span>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentSession?.email || "Chưa đăng nhập (lưu cục bộ)"}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Họ và tên của em</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Khôi"
                  required
                  className="w-full p-2.5 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-950 text-white placeholder-slate-500"
                />
              </div>

              {/* Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Khối lớp THPT</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-950 text-white cursor-pointer"
                  >
                    <option value={10} className="bg-slate-900 text-white">Lớp 10 (Chương trình GDPT 2018)</option>
                    <option value={11} className="bg-slate-900 text-white">Lớp 11 (Chương trình GDPT 2018)</option>
                    <option value={12} className="bg-slate-900 text-white">Lớp 12 (Chương trình GDPT 2018)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Trường THPT</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Ví dụ: THPT Chuyên, THPT Chu Văn An..."
                    className="w-full p-2.5 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-950 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Learning Target */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Mục tiêu học tập ưu tiên</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-2.5 border border-slate-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-950 text-white cursor-pointer"
                >
                  <option value="Nghiên cứu KHKT & GDPT 2018" className="bg-slate-900 text-white">Nghiên cứu KHKT & Khám phá Sư phạm 2018</option>
                  <option value="Ôn thi Tốt nghiệp THPT" className="bg-slate-900 text-white">Ôn thi Tốt nghiệp THPT & Đại học</option>
                  <option value="Thi Đánh giá Năng lực (ĐHQG / ĐGTD)" className="bg-slate-900 text-white">Thi Đánh giá Năng lực (ĐHQG / ĐGTD Bách Khoa)</option>
                  <option value="Bồi dưỡng Học sinh giỏi Toán" className="bg-slate-900 text-white">Bồi dưỡng Học sinh giỏi Toán THPT</option>
                </select>
              </div>

              {/* Status alerts */}
              {profileNotice && (
                <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileNotice}</span>
                </div>
              )}
              {profileError && (
                <div className="p-2.5 bg-rose-950/50 border border-rose-500/40 text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? "Đang lưu thông tin..." : "Lưu thay đổi hồ sơ"}</span>
              </button>

              {/* Phân quyền Vai trò Sư phạm (Giáo viên / Học sinh) */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xác thực Quyền Giáo viên</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    currentSession?.role === "teacher"
                      ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                      : "bg-blue-950/60 text-blue-300 border-blue-800/60"
                  }`}>
                    {currentSession?.role === "teacher" ? "👨‍🏫 Giáo viên THPT" : "🎓 Học sinh THPT"}
                  </span>
                </div>

                {currentSession?.role === "teacher" ? (
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-200">
                    <p className="text-[11px] text-amber-300/90 leading-relaxed">
                      Tài khoản của thầy/cô đã được mở khóa toàn bộ phân hệ Giáo viên (Kế hoạch bài dạy 55 phút, Ma trận chẩn đoán ngộ nhận và Chế độ trình chiếu 1.5x trên lớp).
                    </p>
                    <button
                      type="button"
                      disabled={verifyingTeacher}
                      onClick={handleSwitchToStudent}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      {verifyingTeacher ? "Đang chuyển..." : "Chuyển sang góc nhìn Học sinh"}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Thầy/cô giảng dạy THPT có thể kích hoạt quyền Giáo viên bằng Mã định danh Sư phạm được cấp:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={teacherCode}
                        onChange={(e) => setTeacherCode(e.target.value)}
                        placeholder="Nhập mã giáo viên được cấp riêng"
                        disabled={verifyingTeacher}
                        className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={verifyingTeacher}
                        onClick={handleVerifyTeacher}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                      >
                        {verifyingTeacher ? "Kiểm tra..." : "Kích hoạt"}
                      </button>
                    </div>
                  </div>
                )}

                {teacherVerifyMsg && (
                  <div className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                    teacherVerifyMsg.ok
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  }`}>
                    {teacherVerifyMsg.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{teacherVerifyMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Data Backup & Export (Item 17 Audit) */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => downloadBackupFile()}
                  className="w-full py-2 px-3 border border-slate-700/80 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sao lưu tiến trình học tập (Tải file JSON)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AI ENGINE & API KEY */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Active Model Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  apiKey.trim()
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      apiKey.trim()
                        ? "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Model AI đang hoạt động:
                    </span>
                    <strong className="text-xs text-white">
                      {apiKey.trim() ? `${selectedModel} (${provider.toUpperCase()})` : "Mô hình Socratic TES tích hợp"}
                    </strong>
                  </div>
                </div>
                {apiKey.trim() ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[10px]">
                    ★ Model Cao Cấp
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                    Mặc định
                  </span>
                )}
              </div>

              {/* Provider Selection */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1.5">
                  1. Nhà cung cấp AI
                </label>
                <div className="rounded-xl border border-blue-500 bg-blue-950/40 p-2.5 text-blue-200">
                  <span className="block font-bold">Google Gemini</span>
                  <span className="block text-[10px] text-emerald-300 font-normal">Nhà cung cấp duy nhất cho Trợ lý học tập</span>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1.5">
                  2. Chọn phiên bản Model chuyên sâu
                </label>
                <div className="space-y-1.5">
                  {AI_MODEL_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        selectedModel === opt.id
                          ? "border-blue-500/90 bg-blue-950/30 text-white"
                          : "border-slate-800 bg-slate-950/40 hover:bg-slate-850 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ai_model"
                        value={opt.id}
                        checked={selectedModel === opt.id}
                        onChange={() => {
                          setSelectedModel(opt.id);
                          setTestResult(null);
                        }}
                        className="mt-0.5 accent-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-100">{opt.label}</strong>
                          {opt.isRecommended && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold text-[9px]">
                              Khuyên dùng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>3. Nhập {provider.toUpperCase()} API Key</span>
                  </label>
                  {provider === "gemini" && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Lấy key Gemini miễn phí</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder="Dán Google Gemini API key bắt đầu bằng AIzaSy..."
                    className="w-full p-2.5 pr-10 border border-slate-700/80 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 bg-slate-950 text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showApiKey ? "Ẩn key" : "Hiện key"}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Key được gửi qua HTTPS và lưu phía máy chủ trong Supabase Vault. Ứng dụng chỉ giữ key trong bộ nhớ phiên hiện tại, không ghi vào localStorage.</span>
                </div>
                {savedApiKeyConfigured && (
                  <p className="mt-1 text-[10px] text-emerald-300">Tài khoản hiện đã có API key được lưu. Nhập key mới để thay thế.</p>
                )}
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    testResult.ok
                      ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/50 border-rose-500/40 text-rose-300"
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Success Alert */}
              {aiNotice && (
                <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{aiNotice}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testingKey || !apiKey.trim()}
                  className="py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-200 font-medium text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {testingKey ? "Đang thử..." : "Kiểm tra kết nối"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAiConfig}
                  disabled={aiSaving || !apiKey.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{aiSaving ? "Đang kích hoạt..." : "Kích hoạt Model này"}</span>
                </button>

                {(apiKey.trim() || savedApiKeyConfigured) && (
                  <button
                    type="button"
                    onClick={handleClearAiConfig}
                    className="p-2.5 rounded-xl border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                    title="Xóa key và dùng mô hình mặc định"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
