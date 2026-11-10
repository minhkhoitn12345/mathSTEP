"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  GraduationCap,
  Key,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { ParsedGeometrySolid } from "../lib/geometryParserPrompt";
import { GEOMETRY_PRESET_TEMPLATES, resolveGeometrySolid, ResolvedGeometryScene } from "../lib/geometrySolver";

interface NaturalLanguageGeometryPanelProps {
  onModelGenerated: (scene: ResolvedGeometryScene, rawSolid: ParsedGeometrySolid) => void;
  onAskTutor?: (prompt: string) => void;
  className?: string;
}

export default function NaturalLanguageGeometryPanel({
  onModelGenerated,
  onAskTutor,
  className = "",
}: NaturalLanguageGeometryPanelProps) {
  // 1. Quản lý Đề bài tự nhiên
  const [prompt, setPrompt] = useState<string>(GEOMETRY_PRESET_TEMPLATES[0].prompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 2. User API Key Drawer State
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState<boolean>(false);
  const provider = "gemini";
  const [apiKey, setApiKey] = useState<string>("");
  const [isUsingProjectKey, setIsUsingProjectKey] = useState<boolean>(true);
  const [keyTesting, setKeyTesting] = useState<boolean>(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    localStorage.removeItem("mathstep:custom_ai_config");
  }, []);

  // API key chỉ được giữ trong trạng thái trang hiện tại.
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setIsUsingProjectKey(true);
      try {
        localStorage.removeItem("mathstep:custom_ai_config");
      } catch {}
      setSuccessNotice("Đã chuyển sang dùng Key thử nghiệm của dự án.");
      setTimeout(() => setSuccessNotice(null), 3000);
      return;
    }

    setIsUsingProjectKey(false);
    setSuccessNotice(`Đã giữ khóa ${provider.toUpperCase()} trong phiên hiện tại; khóa sẽ bị xóa khi đóng trang.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Nút: "Dùng Key thử nghiệm của dự án"
  const handleUseProjectKey = () => {
    setIsUsingProjectKey(true);
    setApiKey("");
    try {
      localStorage.removeItem("mathstep:custom_ai_config");
    } catch {}
    setKeyTestStatus(null);
    setSuccessNotice("Đã kích hoạt Key thử nghiệm của dự án MathSTEP.");
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Kiểm tra kết nối API Key
  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setKeyTestStatus({ ok: false, message: "Vui lòng nhập API Key để kiểm tra." });
      return;
    }
    setKeyTesting(true);
    setKeyTestStatus(null);
    try {
      const res = await fetch("/api/account/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: "gemini-2.5-flash",
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setKeyTestStatus({ ok: true, message: data.message || "Kết nối API Key thành công!" });
      } else {
        setKeyTestStatus({ ok: false, message: data.error?.message || "Khóa không hợp lệ." });
      }
    } catch {
      setKeyTestStatus({ ok: false, message: "Không thể kết nối đến máy chủ kiểm tra." });
    } finally {
      setKeyTesting(false);
    }
  };

  // Chọn Đề mẫu (1-Click Prompt Template)
  const handleSelectTemplate = (templateId: string) => {
    const t = GEOMETRY_PRESET_TEMPLATES.find((tpl) => tpl.id === templateId);
    if (!t) return;
    setPrompt(t.prompt);
    setErrorMessage(null);
    // Tự động giải quyết hình mẫu ngay lập tức
    const resolved = resolveGeometrySolid(t.solid);
    onModelGenerated(resolved, t.solid);
  };

  // DỰNG MÔ HÌNH 3D NGAY (Gửi yêu cầu phân tích LLM)
  const handleGenerate3D = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Vui lòng nhập đề bài toán hình học.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    // Kiểm tra xem có trùng khớp mẫu có sẵn không để hiển thị tức thì
    const matchedPreset = GEOMETRY_PRESET_TEMPLATES.find(
      (tpl) => tpl.prompt.trim().toLowerCase() === prompt.trim().toLowerCase()
    );
    if (matchedPreset) {
      setTimeout(() => {
        const resolved = resolveGeometrySolid(matchedPreset.solid);
        onModelGenerated(resolved, matchedPreset.solid);
        setIsLoading(false);
      }, 350);
      return;
    }

    try {
      const customAi = isUsingProjectKey || !apiKey.trim()
        ? undefined
        : {
            provider,
            model: "gemini-2.5-flash",
            apiKey: apiKey.trim(),
          };

      const res = await fetch("/api/geometry-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          custom_ai: customAi,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.solid) {
        throw new Error(data.error?.message || "Không thể phân tích đề bài.");
      }

      const rawSolid: ParsedGeometrySolid = data.solid;
      const resolved = resolveGeometrySolid(rawSolid);
      onModelGenerated(resolved, rawSolid);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo mô hình 3D.";
      setErrorMessage(msg);
      // Fallback tự động sang mẫu tương ứng
      const fallback = GEOMETRY_PRESET_TEMPLATES[0];
      const resolved = resolveGeometrySolid(fallback.solid);
      onModelGenerated(resolved, fallback.solid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm ${className}`}>
      {/* 1. Header Khay cài đặt API Key */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsKeyDrawerOpen((v) => !v)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-100/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Cấu hình API Key (Tùy chọn)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isUsingProjectKey
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isUsingProjectKey ? "Đang dùng Key dự án" : `Key ${provider.toUpperCase()} cá nhân`}
            </span>
          </div>
          {isKeyDrawerOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isKeyDrawerOpen && (
          <div className="p-3.5 pt-2 border-t border-slate-200 bg-white space-y-3 text-xs">
            <p className="font-medium text-slate-700">Google Gemini API</p>

            <div className="space-y-1">
              <label htmlFor="geometry-gemini-key" className="block font-medium text-slate-700">Khóa Gemini cá nhân</label>
              <input
                id="geometry-gemini-key"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsUsingProjectKey(false);
                }}
                placeholder="Dán khóa AI Studio (AIzaSy...)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-500">
                Khóa chỉ được giữ trong phiên trang này và gửi tới máy chủ MathSTEP qua HTTPS khi em dùng AI.
              </p>
            </div>

            {keyTestStatus && (
              <div
                className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  keyTestStatus.ok
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {keyTestStatus.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{keyTestStatus.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Lưu khóa này
                </button>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={keyTesting}
                  className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors disabled:opacity-50"
                >
                  {keyTesting ? "Đang thử…" : "Kiểm tra kết nối"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleUseProjectKey}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
              >
                Dùng Key thử nghiệm của dự án
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Thư viện Đề mẫu chuẩn hóa (1-Click Prompt Templates) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            Thư viện đề mẫu SGK (1-Click Dựng hình):
          </span>
          <span className="text-[10px] text-slate-500">Bấm để nạp đề</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {GEOMETRY_PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tpl.id)}
              className="text-left px-2.5 py-2 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 text-[11px] transition-all flex items-center justify-between group"
            >
              <span className="font-medium truncate pr-1">{tpl.name}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Textarea Đề bài Tự nhiên */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="geo-prompt-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Đề bài hình học tiếng Việt:
          </label>
          <button
            type="button"
            onClick={() => setPrompt("")}
            className="text-[10px] text-slate-400 hover:text-slate-600"
          >
            Xóa nội dung
          </button>
        </div>

        <div className="relative">
          <textarea
            id="geo-prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập đề bài tiếng Việt (VD: Cho hình chóp S.ABCD có đáy ABCD là hình bình hành tâm O. SA vuông góc với đáy. M là trung điểm SC, N chia SB theo tỉ số 2:1...)"
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/40 resize-y"
          />
        </div>
      </div>

      {/* Thông báo lỗi / thành công */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 4. Nút bấm hành động: DỰNG MÔ HÌNH 3D NGAY */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleGenerate3D}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#087e7c] to-[#0f9488] hover:from-[#076a68] hover:to-[#0d8276] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Đang tính toán tọa độ không gian 3D…</span>
            </>
          ) : (
            <>
              <Box className="w-4 h-4 text-blue-200" />
              <span>Dựng mô hình 3D</span>
            </>
          )}
        </button>
      </div>

      {onAskTutor && (
        <button
          type="button"
          onClick={() => onAskTutor(`Em muốn cùng trợ lý giải quyết bài toán hình không gian này từng bước: "${prompt}"`)}
          className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>Hỏi trợ lý Socratic về bài toán này</span>
        </button>
      )}
    </div>
  );
}
