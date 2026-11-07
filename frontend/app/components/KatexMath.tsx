"use client";

import React, { useMemo } from "react";
import katex from "katex";

export function renderKatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
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
