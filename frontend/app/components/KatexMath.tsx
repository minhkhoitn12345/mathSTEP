"use client";

import React, { useMemo } from "react";
import katex from "katex";

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
  return s;
}

export function renderKatex(latex: string, displayMode = false): string {
  try {
    const cleaned = sanitizeLatex(latex);
    return katex.renderToString(cleaned, {
      throwOnError: false,
      displayMode,
    });
  } catch {
    return latex;
  }
}

export function formatVNNumber(num: number, digits = 2): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  const rounded = Number(num.toFixed(digits));
  return rounded.toFixed(digits).replace(".", "{,}");
}

export function formatVNFloat(num: number, digits = 2): string {
  return num.toFixed(digits).replace(".", "{,}");
}

interface KatexMathProps {
  math: string;
  display?: boolean;
  className?: string;
}

export default function KatexMath({ math, display = false, className = "" }: KatexMathProps) {
  const html = useMemo(() => renderKatex(math, display), [math, display]);
  return <span className={`inline-block ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
