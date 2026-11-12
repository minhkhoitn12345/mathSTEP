"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface SimulationLabHeaderProps {
  moduleLabel: string;
  title: string;
  subtitle: string;
  accent: "emerald" | "purple";
  onBack?: () => void;
  action?: ReactNode;
}

const accents = {
  emerald: { dot: "bg-emerald-600", label: "bg-emerald-100 text-emerald-800" },
  purple: { dot: "bg-purple-600", label: "bg-purple-100 text-purple-800" },
} as const;

export function SimulationLabHeader({ moduleLabel, title, subtitle, accent, onBack, action }: SimulationLabHeaderProps) {
  const colors = accents[accent];
  return (
    <header className="sticky top-12 z-30 -mx-3 -mt-3 border-b border-slate-200 bg-white px-3 py-2.5 shadow-xs sm:-mx-4 sm:-mt-4 sm:px-4 md:-mx-6 md:-mt-6 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {onBack && (
            <button type="button" onClick={onBack} className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
              <ArrowLeft className="h-3.5 w-3.5" />
              {"Trang ch\u1ee7"}
            </button>
          )}
          {onBack && <div className="hidden h-4 w-px shrink-0 bg-slate-200 sm:block" />}
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`} />
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${colors.label}`}>{moduleLabel}</span>
              <span className="text-[10px] font-medium text-slate-500">{"To\u00e1n 11 \u00b7 GDPT 2018"}</span>
            </div>
            <h1 className="truncate text-sm font-extrabold leading-tight text-slate-900 sm:text-base">{title}</h1>
            <p className="hidden">{subtitle}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
