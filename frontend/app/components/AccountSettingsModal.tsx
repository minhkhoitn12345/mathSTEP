"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Save,
  Trash2,
  Cpu,
} from "lucide-react";

export interface CustomAiConfig {
  provider: "gemini" | "openai" | "deepseek";
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
  currentSession: { authenticated: boolean; name: string | null; email: string | null; email_verified?: boolean } | null;
  onProfileUpdated?: (name: string) => void;
  onAiConfigUpdated?: (config: CustomAiConfig | null) => void;
}

const AI_MODEL_OPTIONS: Record<
  "gemini" | "openai" | "deepseek",
  { id: string; label: string; desc: string; isRecommended?: boolean }[]
> = {
  gemini: [
    {
      id: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      desc: "Siêu nhanh, nhận diện câu hỏi Toán THPT cực nhạy, độ trễ thấp.",
      isRecommended: true,
    },
    {
      id: "gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      desc: "Tư duy toán học và logic Socratic chuyên sâu, giải thích chặt chẽ.",
    },
    {
      id: "gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
      desc: "Bản flash thế hệ trước, ổn định và nhẹ nhàng.",
    },
  ],
  openai: [
    {
      id: "gpt-4o-mini",
      label: "GPT-4o mini",
      desc: "Nhẹ, thông minh, tối ưu chi phí và phản hồi nhanh.",
      isRecommended: true,
    },
    {
      id: "gpt-4o",
      label: "GPT-4o",
      desc: "Mô hình đa nhiệm đầu bảng của OpenAI, khả năng lý luận cao cấp.",
    },
  ],
  deepseek: [
    {
      id: "deepseek-chat",
      label: "DeepSeek V3 (Chat)",
      desc: "Tốc độ phản hồi vượt trội, xử lý ngôn ngữ tiếng Việt tự nhiên.",
    },
    {
      id: "deepseek-reasoner",
      label: "DeepSeek R1 (Reasoner)",
      desc: "Chuyên gia suy luận toán học sâu với chuỗi suy nghĩ CoT bài bản.",
      isRecommended: true,
    },
  ],
};

export default function AccountSettingsModal({
  isOpen,
  onClose,
  initialTab = "profile",
  currentSession,
  onProfileUpdated,
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

  // AI Config Form States
  const [provider, setProvider] = useState<"gemini" | "openai" | "deepseek">("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testingKey, setTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [aiSaving, setAiSaving] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string>("");

  // Nạp dữ liệu khi modal mở ra
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);

    // 1. Tải hồ sơ từ server / localStorage
    setName(currentSession?.name || "");
    const localProfile = localStorage.getItem("mathstep:user_profile");
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.school) setSchool(parsed.school);
        if (parsed.target) setTarget(parsed.target);
      } catch {}
    }

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

    // 2. Tải cấu hình AI từ localStorage
    const localAi = localStorage.getItem("mathstep:custom_ai_config");
    if (localAi) {
      try {
        const parsed: CustomAiConfig = JSON.parse(localAi);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.model) setSelectedModel(parsed.model);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
      } catch {}
    }
  }, [isOpen, initialTab, currentSession]);

  // Tự động chọn model đề xuất khi chuyển provider
  const handleSelectProvider = (p: "gemini" | "openai" | "deepseek") => {
    setProvider(p);
    const rec = AI_MODEL_OPTIONS[p].find((m) => m.isRecommended) || AI_MODEL_OPTIONS[p][0];
    setSelectedModel(rec.id);
    setTestResult(null);
  };

  // Lưu hồ sơ cá nhân
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice("");
    setProfileError("");

    try {
      const trimmedName = name.trim();
      const updatedProfile = { name: trimmedName, grade, school: school.trim(), target: target.trim() };
      localStorage.setItem("mathstep:user_profile", JSON.stringify(updatedProfile));

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
      const config: CustomAiConfig = {
        provider,
        model: selectedModel,
        apiKey: trimmedKey,
      };

      localStorage.setItem("mathstep:custom_ai_config", JSON.stringify(config));
      onAiConfigUpdated?.(config);

      setAiNotice(`Đã kích hoạt thành công mô hình ${selectedModel}! Trợ lý TES sẽ dùng mô hình này.`);
      setTimeout(() => setAiNotice(""), 4000);
    } finally {
      setAiSaving(false);
    }
  };

  // Xóa API Key về mô hình mặc định
  const handleClearAiConfig = () => {
    if (confirm("Em có muốn xóa API key cá nhân và quay về sử dụng mô hình Socratic TES mặc định?")) {
      localStorage.removeItem("mathstep:custom_ai_config");
      setApiKey("");
      setTestResult(null);
      onAiConfigUpdated?.(null);
      setAiNotice("Đã quay về mô hình Socratic TES mặc định.");
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
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#d9e4e2] flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Header */}
        <header className="px-5 py-4 border-b border-[#e5ebe4] bg-[#f8faf9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e2f1ec] text-[#087e7c] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#152f35]">Cài đặt Tài khoản & Model AI</h2>
              <p className="text-[11px] text-gray-500">
                Tùy chỉnh thông tin học sinh và tích hợp API Key để dùng các model AI cao cấp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </header>

        {/* Tab navigation */}
        <div className="flex border-b border-[#e5ebe4] bg-white px-5 gap-4 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "profile"
                ? "border-[#087e7c] text-[#087e7c]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "ai"
                ? "border-[#087e7c] text-[#087e7c]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Model AI & API Key</span>
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
              <div className="flex items-center gap-3.5 p-3 bg-[#f8faf9] rounded-xl border border-[#e2e8e7]">
                <div className="w-12 h-12 rounded-full bg-[#087e7c] text-[#adf0d6] font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                  {(name || currentSession?.email || "M").slice(0, 1).toUpperCase()}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-[#152f35] truncate block">
                      {name || "Học sinh MathSTEP"}
                    </strong>
                    {currentSession?.authenticated && (
                      currentSession.email_verified !== false ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ Đã xác thực email
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          ⚠️ Chưa xác thực email
                        </span>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {currentSession?.email || "Chưa đăng nhập (lưu cục bộ)"}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="font-bold text-[#152f35] block mb-1">Họ và tên của em</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Khôi"
                  required
                  className="w-full p-2.5 border border-[#bed0cd] rounded-xl text-xs focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
                />
              </div>

              {/* Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#152f35] block mb-1">Khối lớp THPT</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bed0cd] rounded-xl text-xs focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
                  >
                    <option value={10}>Lớp 10 (Chương trình GDPT 2018)</option>
                    <option value={11}>Lớp 11 (Chương trình GDPT 2018)</option>
                    <option value={12}>Lớp 12 (Chương trình GDPT 2018)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#152f35] block mb-1">Trường THPT</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Ví dụ: THPT Chuyên, THPT Chu Văn An..."
                    className="w-full p-2.5 border border-[#bed0cd] rounded-xl text-xs focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
                  />
                </div>
              </div>

              {/* Learning Target */}
              <div>
                <label className="font-bold text-[#152f35] block mb-1">Mục tiêu học tập ưu tiên</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-2.5 border border-[#bed0cd] rounded-xl text-xs focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
                >
                  <option value="Nghiên cứu KHKT & GDPT 2018">Nghiên cứu KHKT & Khám phá Sư phạm 2018</option>
                  <option value="Ôn thi Tốt nghiệp THPT">Ôn thi Tốt nghiệp THPT & Đại học</option>
                  <option value="Thi Đánh giá Năng lực (ĐHQG / ĐGTD)">Thi Đánh giá Năng lực (ĐHQG / ĐGTD Bách Khoa)</option>
                  <option value="Bồi dưỡng Học sinh giỏi Toán">Bồi dưỡng Học sinh giỏi Toán THPT</option>
                </select>
              </div>

              {/* Status alerts */}
              {profileNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileNotice}</span>
                </div>
              )}
              {profileError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 bg-[#087e7c] hover:bg-[#066563] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? "Đang lưu thông tin..." : "Lưu thay đổi hồ sơ"}</span>
              </button>
            </form>
          )}

          {/* TAB 2: AI ENGINE & API KEY */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Active Model Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  apiKey.trim()
                    ? "bg-amber-50/80 border-amber-300 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      apiKey.trim() ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Model AI đang hoạt động:
                    </span>
                    <strong className="text-xs">
                      {apiKey.trim() ? `${selectedModel} (${provider.toUpperCase()})` : "Mô hình Socratic TES tích hợp"}
                    </strong>
                  </div>
                </div>
                {apiKey.trim() ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                    ★ Model Cao Cấp
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    Mặc định
                  </span>
                )}
              </div>

              {/* Provider Selection */}
              <div>
                <label className="font-bold text-[#152f35] block mb-1.5">
                  1. Chọn Nhà cung cấp AI (Provider)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectProvider("gemini")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      provider === "gemini"
                        ? "border-[#087e7c] bg-[#eef8f5] text-[#087e7c] ring-1 ring-[#087e7c]"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Google Gemini
                    <span className="block text-[10px] text-emerald-600 font-normal">Miễn phí key</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProvider("openai")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      provider === "openai"
                        ? "border-[#087e7c] bg-[#eef8f5] text-[#087e7c] ring-1 ring-[#087e7c]"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    OpenAI
                    <span className="block text-[10px] text-gray-500 font-normal">GPT-4o / mini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProvider("deepseek")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      provider === "deepseek"
                        ? "border-[#087e7c] bg-[#eef8f5] text-[#087e7c] ring-1 ring-[#087e7c]"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    DeepSeek
                    <span className="block text-[10px] text-blue-600 font-normal">R1 Toán học</span>
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="font-bold text-[#152f35] block mb-1.5">
                  2. Chọn phiên bản Model chuyên sâu
                </label>
                <div className="space-y-1.5">
                  {AI_MODEL_OPTIONS[provider].map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        selectedModel === opt.id
                          ? "border-[#087e7c] bg-[#f8faf9]"
                          : "border-gray-200 hover:bg-gray-50"
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
                        className="mt-0.5 accent-[#087e7c]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-[#152f35]">{opt.label}</strong>
                          {opt.isRecommended && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                              Khuyên dùng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#152f35] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-gray-500" />
                    <span>3. Nhập {provider.toUpperCase()} API Key</span>
                  </label>
                  {provider === "gemini" && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#087e7c] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Lấy key Gemini miễn phí</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {provider === "openai" && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#087e7c] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Lấy key OpenAI</span>
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
                    placeholder={
                      provider === "gemini"
                        ? "Dán API Key bắt đầu bằng AIzaSy..."
                        : provider === "openai"
                        ? "Dán API Key sk-..."
                        : "Dán DeepSeek API Key..."
                    }
                    className="w-full p-2.5 pr-10 border border-[#bed0cd] rounded-xl text-xs font-mono focus:outline-none focus:border-[#087e7c] bg-[#fbfcfb]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                    title={showApiKey ? "Ẩn key" : "Hiện key"}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key được lưu bảo mật trong trình duyệt, chỉ dùng để gọi AI trong phiên học của em.</span>
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    testResult.ok
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Success Alert */}
              {aiNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{aiNotice}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testingKey || !apiKey.trim()}
                  className="py-2.5 px-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors disabled:opacity-40"
                >
                  {testingKey ? "Đang thử..." : "Kiểm tra kết nối"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAiConfig}
                  disabled={aiSaving || !apiKey.trim()}
                  className="flex-1 py-2.5 bg-[#087e7c] hover:bg-[#066563] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  <span>{aiSaving ? "Đang kích hoạt..." : "Kích hoạt Model này"}</span>
                </button>

                {apiKey.trim() && (
                  <button
                    type="button"
                    onClick={handleClearAiConfig}
                    className="p-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 transition-colors"
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
