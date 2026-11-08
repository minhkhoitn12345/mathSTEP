"use client";

import React, { useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { GraduationCap, ArrowRight, X } from "lucide-react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  nextQuestion?: string;
  hintLevel?: number;
  validation?: { status: string; result: boolean | number | null; explanation: string } | null;
};

export function normalizeMathDelimiters(content: string): string {
  if (!content) return "";
  let text = content;
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expr: string) => `\n$$\n${expr.trim()}\n$$\n`);
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`);
  text = text.replace(
    /(?<!\$)\s*(\\begin\{(cases|aligned|matrix|pmatrix|bmatrix)\}[\s\S]+?\\end\{\2\})\s*(?!\$)/g,
    (_match, block: string) => `\n$$\n${block.trim()}\n$$\n`
  );
  text = text.replace(/(?<!\$)\$\s+([^\$\n]+?)\s+\$(?!\$)/g, "$$$1$$");

  // ĐẢM BẢO KHOẢNG TRẮNG XUNG QUANH CÔNG THỨC LATEX KHÔNG BỊ DÍNH VÀO TỪ TIẾNG VIỆT (UNICODE TOÀN DIỆN):
  text = text.replace(/([\p{L}\p{N}])\$(?!\$)/gu, "$1 $");
  text = text.replace(/(\$[^\$\n]+?\$)([\p{L}\p{N}])/gu, "$1 $2");

  // Xử lý các ký hiệu toán bên trong khối $...$ và $$...$$ một cách an toàn
  text = text.replace(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g, (mathBlock) => {
    let m = mathBlock;
    m = m.replace(/([A-Za-z0-9])\s*\\left\(/g, "$1\\,\\left(");
    m = m.replace(/([A-Za-z0-9])\s*\(/g, "$1\\,(");
    m = m.replace(/([A-Za-z0-9\)])\s*\\perp\s*([A-Za-z0-9\(])/g, "$1\\,\\perp\\,$2");
    m = m.replace(/(\d+),(\d+)/g, "$1{,}$2");
    return m;
  });

  return text;
}

export function MathMessage({ content }: { content: string }) {
  const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);
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
  onSendMessage: (customMessage?: string) => void;
  sessionName?: string | null;
  moduleTitle?: string;
  stationId?: string;
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
}: SocraticChatDrawerProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="w-full sm:w-[420px] md:w-[460px] bg-slate-950 border-l border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                <span>Trợ lý gợi mở Socratic</span>
                {stationId && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-mono text-[10px]">
                    {stationId}
                  </span>
                )}
              </h3>
              {moduleTitle && (
                <p className="text-[10.5px] text-slate-400 truncate">{moduleTitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer text-xs"
            title="Đóng trợ lý"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950">
          {messages.map((item) => (
            <article
              key={item.id}
              className={`flex gap-2.5 ${item.role === "assistant" ? "items-start" : "items-start justify-end"}`}
            >
              {item.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-blue-900/60 text-blue-300 border border-blue-700/60 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="max-w-[85%] space-y-1 text-xs min-w-0">
                <div
                  className={`p-2.5 rounded-lg leading-relaxed text-xs break-words ${
                    item.role === "assistant"
                      ? "bg-slate-900 text-slate-200 border border-slate-800"
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
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Phương pháp Socratic · GDPT 2018</span>
            <button
              type="button"
              onClick={() => {
                onSendMessage("Em muốn tự suy nghĩ và thử tiếp mà không cần thêm gợi ý.");
              }}
              className="text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3 h-3 text-blue-400" />
              <span>Em tự làm tiếp</span>
            </button>
          </div>

          {error && <div className="text-[10px] text-rose-400">{error}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
            className="flex gap-1.5"
          >
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Nhập suy nghĩ, quan sát hoặc câu hỏi của em..."
              rows={2}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none min-w-0"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
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
