"use client";

import React, { useMemo } from "react";
import katex from "katex";

// Tự động chuẩn hóa khoảng trắng quanh công thức LaTeX để chống dính chữ tiếng Việt
export function normalizeMathDelimiters(content: string): string {
  if (!content) return "";
  let text = content;
  // Chuẩn hóa \[ ... \] thành $$ ... $$
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expr: string) => `\n$$\n${expr.trim()}\n$$\n`);
  // Chuẩn hóa \( ... \) thành $ ... $
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`);
  // Chuẩn hóa \begin{...} \end{...}
  text = text.replace(
    /(?<!\$)\s*(\\begin\{(cases|aligned|matrix|pmatrix|bmatrix)\}[\s\S]+?\\end\{\2\})\s*(?!\$)/g,
    (_match, block: string) => `\n$$\n${block.trim()}\n$$\n`
  );
  text = text.replace(/(?<!\$)\$\s+([^\$\n]+?)\s+\$(?!\$)/g, "$$$1$$");

  // ĐẢM BẢO KHOẢNG TRẮNG XUNG QUANH CÔNG THỨC LATEX KHÔNG BỊ DÍNH VÀO TỪ TIẾNG VIỆT (UNICODE FULL COVERAGE)
  // Thêm khoảng trắng trước $ nếu có ký tự chữ cái/chữ số tiếng Việt đứng trước
  text = text.replace(/([\p{L}\p{N}])\$(?!\$)/gu, "$1 $");
  // Thêm khoảng trắng sau $ nếu có ký tự chữ cái/chữ số tiếng Việt đứng sau
  text = text.replace(/(\$[^\$\n]+?\$)([\p{L}\p{N}])/gu, "$1 $2");

  // Xử lý an toàn các ký hiệu toán bên trong khối $...$ và $$...$$
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

export function sanitizeLatex(raw: string): string {
  if (!raw) return "";
  let s = raw;
  // Sửa lỗi thoát ký tự JavaScript: \v biến thành vertical tab (\x0B) trước arphi
  s = s.replace(/\x0B+arphi/g, "\\varphi");
  s = s.replace(/\x0B+/g, "\\");
  // Sửa lỗi arphi approx
  s = s.replace(/\barphi\b/g, "\\varphi");
  // Sửa lỗi mất dấu gạch chéo trước approx (\a bị nuốt thành a)
  s = s.replace(/S\s*A\s*approx/g, "SA \\approx ");
  s = s.replace(/SAapprox/g, "SA \\approx ");
  s = s.replace(/([^\\])\bapprox\b/g, "$1\\approx");
  if (s.startsWith("approx")) s = "\\" + s;
  // Sửa lỗi số liệu và đơn vị mét: 3{,}00 m hoặc 3,00 m -> 3,00\text{ m}
  s = s.replace(/(\d+(?:(?:\{,\}|,)\d+)?)\s*m\b/g, "$1\\text{ m}");
  s = s.replace(/(\d+(?:(?:\{,\}|,)\d+)?)\s*m\^2/g, "$1\\text{ m}^2");
  s = s.replace(/(\d+(?:(?:\{,\}|,)\d+)?)\s*m\^3/g, "$1\\text{ m}^3");
  // Tự động thêm khoảng trắng LaTeX giữa biến/tên điểm và dấu mở ngoặc (VD: N( -> N\,()
  s = s.replace(/([A-Za-z0-9])\s*\\left\(/g, "$1\\,\\left(");
  s = s.replace(/([A-Za-z0-9])\s*\(/g, "$1\\,(");
  // Đảm bảo quan hệ vuông góc \perp có khoảng cách thoáng tự nhiên (VD: SH \perp (ABCD) -> SH\,\perp\,(ABCD))
  s = s.replace(/([A-Za-z0-9\)])\s*\\perp\s*([A-Za-z0-9\(])/g, "$1\\,\\perp\\,$2");
  s = s.replace(/([^\s])\\perp([^\s])/g, "$1 \\perp $2");
  return s;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderKatex(latex: string, displayMode = false): string {
  try {
    const cleaned = sanitizeLatex(latex);
    return katex.renderToString(cleaned, {
      throwOnError: false,
      strict: "ignore",
      displayMode,
    });
  } catch {
    return `<span class="katex-error font-mono text-xs">${escapeHtml(latex)}</span>`;
  }
}

export function formatVNNumber(num: number, digits = 2): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  const rounded = Number(num.toFixed(digits));
  return rounded.toFixed(digits).replace(".", ",");
}

export function formatVNFloat(num: number, digits = 2): string {
  return num.toFixed(digits).replace(".", ",");
}

export function formatVNFloatLatex(num: number, digits = 2): string {
  return num.toFixed(digits).replace(".", "{,}");
}

interface KatexMathProps {
  math: string;
  display?: boolean;
  className?: string;
}

export default function KatexMath({ math, display = false, className = "" }: KatexMathProps) {
  const html = useMemo(() => renderKatex(math, display), [math, display]);
  return (
    <span
      className={`${display ? "my-2 block w-full max-w-full overflow-x-auto py-1 text-center" : "math-inline inline-block align-baseline mx-0.5 leading-normal"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MathFormattedText({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;
  // Chuẩn hóa khoảng trắng quanh ký hiệu $ trước khi phân tách để chữ không bị dính sát vào công thức
  const normalized = normalizeMathDelimiters(text);
  // Keep multiline expressions together (for example, systems and cases in a single $...$ pair).
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$(?!\$)[\s\S]+?\$(?!\$))/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          return <KatexMath key={i} math={math} display={true} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          const isBlockExpression = /\\begin\{(?:cases|aligned|matrix|pmatrix|bmatrix)\}/.test(math);
          return <KatexMath key={i} math={math} display={isBlockExpression} />;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
