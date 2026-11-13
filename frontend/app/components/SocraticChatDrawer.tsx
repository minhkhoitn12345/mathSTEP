"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import { GraduationCap, ArrowRight, X, ImagePlus } from "lucide-react";
import { OptiMascot } from "./optimath/mascot/OptiMascot";
import { normalizeMathDelimiters } from "./KatexMath";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  nextQuestion?: string;
  hintLevel?: number;
  validation?: { status: string; result: boolean | number | null; explanation: string } | null;
};

export function MathMessage({ content }: { content: string }) {
  const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);
  const hasBrokenMath = (normalized.match(/(?<!\\)\$/g)?.length ?? 0) % 2 !== 0;
  let invalidLatex = hasBrokenMath;
  if (!invalidLatex) {
    for (const match of normalized.matchAll(/(?<!\\)\$\$([\s\S]+?)\$\$|(?<!\\)\$([^\n$]+?)\$/g)) {
      try { katex.renderToString(match[1] ?? match[2], { throwOnError: true }); } catch { invalidLatex = true; break; }
    }
  }
  if (invalidLatex) return <div className="whitespace-pre-wrap break-words">{normalized.replace(/\$\$?/g, "").replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)").replace(/\\sqrt\{([^{}]+)\}/g, "√($1)").replace(/\\(pi|alpha|beta|theta)/g, (_, name: string) => ({ pi: "π", alpha: "α", beta: "β", theta: "θ" }[name] ?? name))}</div>;
  return (
    <div className="overflow-x-auto max-w-full break-words">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

interface SocraticChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  busy: boolean;
  error?: string;
  input: string;
  onInputChange: (val: string) => void;
  onSendMessage: (customMessage?: string, imageDataUrl?: string) => void;
  sessionName?: string | null;
  moduleTitle?: string;
  stationId?: string;
  quickPrompts?: string[];
  inline?: boolean;
}

export default function SocraticChatDrawer({
  isOpen,
  onClose,
  messages,
  busy,
  error,
  input,
  onInputChange,
  onSendMessage,
  sessionName,
  moduleTitle,
  stationId,
  quickPrompts = [],
  inline = false,
}: SocraticChatDrawerProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const acceptImage = (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 4_000_000) {
      setImageError("Chọn ảnh PNG, JPG hoặc WebP dưới 4 MB.");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setImageDataUrl(reader.result); };
    reader.readAsDataURL(file);
  };
  const send = () => { onSendMessage(undefined, imageDataUrl ?? undefined); setImageDataUrl(null); };

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={inline ? "h-full min-h-0" : "fixed inset-0 z-50 pointer-events-none flex justify-end items-end xl:items-stretch"}>
      <aside aria-label="Trợ lý học Toán MathSTEP" className={inline ? "pointer-events-auto h-full min-h-[300px] w-full rounded-2xl border border-slate-200 bg-white flex flex-col shadow-sm" : "pointer-events-auto w-full sm:w-[420px] xl:w-[420px] bg-slate-950 border border-slate-800 flex flex-col h-[min(60dvh,620px)] xl:h-full shadow-2xl rounded-t-2xl xl:rounded-none animate-in slide-in-from-right duration-200"}>
        {/* Header */}
        <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${inline ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/90"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0">
              <OptiMascot expression={busy ? "thinking" : "happy"} size={36} animate={true} />
            </div>
            <div className="min-w-0">
              <h3 className={`text-xs font-bold flex items-center gap-1.5 truncate ${inline ? "text-slate-900" : "text-slate-100"}`}>
                <span>Trợ lý Toán MathSTEP</span>
                {stationId && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-mono text-[10px]">
                    {stationId}
                  </span>
                )}
              </h3>
              {moduleTitle && (
                <p className={`text-[10.5px] truncate ${inline ? "text-slate-500" : "text-slate-400"}`}>{moduleTitle}</p>
              )}
            </div>
          </div>
          {!inline && <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer text-xs"
            title="Đóng trợ lý"
          >
            <X className="w-4 h-4" />
          </button>}
        </div>

        {/* Message stream */}
        <div className={`flex-1 p-3.5 overflow-y-auto space-y-3 ${inline ? "bg-white" : "bg-slate-950"}`}>
          {messages.map((item) => (
            <article
              key={item.id}
              className={`flex gap-2.5 ${item.role === "assistant" ? "items-start" : "items-start justify-end"}`}
            >
              {item.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-700/50 flex items-center justify-center shrink-0 mt-0.5 shadow-xs overflow-hidden p-0.5">
                  <OptiMascot expression="happy" size={24} animate={false} />
                </div>
              )}
              <div className="max-w-[85%] space-y-1 text-xs min-w-0">
                <div
                  className={`p-2.5 rounded-lg leading-relaxed text-xs break-words ${
                    item.role === "assistant"
                      ? inline ? "bg-slate-50 text-slate-700 border border-slate-200" : "bg-slate-900 text-slate-200 border border-slate-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <MathMessage content={item.content} />
                </div>
                {item.nextQuestion && (
                  <button
                    onClick={() => onSendMessage(item.nextQuestion)}
                    className="text-[10.5px] text-blue-400 hover:underline flex items-center gap-1 pl-1 text-left cursor-pointer"
                  >
                    <span>↳</span>
                    <span className="line-clamp-2">{item.nextQuestion}</span>
                  </button>
                )}
              </div>
              {item.role === "user" && (
                <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {(sessionName || "E").slice(0, 1).toUpperCase()}
                </div>
              )}
            </article>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="italic">Trợ lý đang suy nghĩ câu hỏi gợi ý...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className={`p-3 border-t shrink-0 space-y-2 ${inline ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
          {quickPrompts.length > 0 && <div className="flex flex-wrap gap-1.5" aria-label="Câu hỏi gợi ý">
            {quickPrompts.slice(0, 3).map((prompt) => <button key={prompt} type="button" onClick={() => onSendMessage(prompt)}
              disabled={busy} className={`min-h-8 rounded-lg border px-2.5 text-left text-[10px] font-medium disabled:opacity-50 ${inline ? "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100" : "border-blue-700/60 bg-blue-950/60 text-blue-100 hover:bg-blue-900"}`}>
              {prompt}
            </button>)}
          </div>}
          <div className={`flex items-center justify-between text-[10px] ${inline ? "text-slate-500" : "text-slate-400"}`}>
            <span>Phương pháp Socratic · GDPT 2018</span>
            <button
              type="button"
              onClick={() => {
                onSendMessage("Em muốn tự suy nghĩ và thử tiếp mà không cần thêm gợi ý.");
              }}
            className={`hover:underline font-medium flex items-center gap-1 cursor-pointer ${inline ? "text-blue-700" : "text-blue-400"}`}
            >
              <ArrowRight className="w-3 h-3 text-blue-400" />
              <span>Em tự làm tiếp</span>
            </button>
          </div>

          {error && <div className="text-[10px] text-rose-400">{error}</div>}
          {imageError && <div className="text-[10px] text-rose-400">{imageError}</div>}
          {imageDataUrl && <div className="flex items-center gap-2"><Image unoptimized src={imageDataUrl} width={56} height={56} alt="Ảnh bài toán chuẩn bị gửi" className="h-14 w-14 rounded object-cover" /><span className="text-xs text-slate-300">Đã đính kèm ảnh bài toán</span><button type="button" onClick={() => setImageDataUrl(null)} aria-label="Bỏ ảnh" className="text-slate-300"><X className="h-4 w-4" /></button></div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-1.5"
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) acceptImage(file); event.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Tải ảnh bài toán" title="Tải ảnh bài toán" className={`rounded-lg border px-2 ${inline ? "border-slate-200 text-slate-600" : "border-slate-700 text-slate-200"}`}><ImagePlus className="h-4 w-4" /></button>
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onPaste={(event) => { const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/")); if (file) { event.preventDefault(); acceptImage(file); } }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Nhập suy nghĩ, quan sát hoặc câu hỏi của em..."
              rows={2}
              className={`flex-1 border rounded-lg p-2 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none min-w-0 ${inline ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"}`}
            />
            <button
              type="submit"
              disabled={busy || (!input.trim() && !imageDataUrl)}
              className="px-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Gửi
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
