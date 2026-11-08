"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import MathGraphVisualizer from "./components/MathGraphVisualizer";
import MathStepWorkbench from "./components/MathStepWorkbench";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherAccessGuard from "./components/TeacherAccessGuard";
import ResearchMethodologyHub from "./components/ResearchMethodologyHub";
import AccountSettingsModal, { CustomAiConfig } from "./components/AccountSettingsModal";
import ChatHistoryModal from "./components/ChatHistoryModal";
import PlatformHeader from "./components/PlatformHeader";
import SocraticChatDrawer from "./components/SocraticChatDrawer";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";
import { getAllStations, removeVietnameseAccents, StationItem } from "./lib/stationCatalogData";
import { CORE_7_MODULES } from "./lib/modulesCatalogData";
import {
  Search,
  FlaskConical,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ArrowRight,
  Activity,
  Mail,
  RotateCcw,
  AlertCircle,
  Calculator,
  RefreshCw,
} from "lucide-react";

export type SubsystemId = "student" | "teacher" | "research";
export type ViewMode = "home" | "lab";

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export type StageId = "observe" | "predict" | "manipulate" | "explore" | "verify" | "explain" | "transfer" | "apply";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  nextQuestion?: string;
  hintLevel?: number;
  validation?: { status: string; result: boolean | number | null; explanation: string } | null;
};

type Session = {
  authenticated: boolean;
  name: string | null;
  email: string | null;
  email_verified?: boolean;
  role?: string;
  provider?: string;
};

function StationCardArt({ is3D, stationId }: { grade?: number; is3D: boolean; stationId: string }) {
  // 1. Bài đường tròn lượng giác & góc quay alpha (Trạm 11.01, 11.02...) - Tuyệt đối không dùng Parabol
  const isTrig = stationId === "11.01" || stationId === "11.02" || stationId.startsWith("11.01");
  // 2. Bài bất phương trình & nửa mặt phẳng miền nghiệm (Trạm 10.01, 10.02, 10.03...)
  const isInequality = stationId === "10.01" || stationId === "10.02" || stationId === "10.03";

  if (isTrig) {
    return (
      <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
        <defs>
          <linearGradient id={`bg-trig-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0f172a" />
            <stop offset="1" stopColor="#070d19" />
          </linearGradient>
          <linearGradient id={`sector-trig-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="380" height="155" fill={`url(#bg-trig-${stationId})`} />
        {/* Lưới tọa độ mờ */}
        <g stroke="#1e293b" strokeWidth="0.8" opacity="0.6">
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
            <line key={`tx-${x}`} x1={x} y1={0} x2={x} y2={155} />
          ))}
          {[25, 55, 85, 115, 145].map((y) => (
            <line key={`ty-${y}`} x1={0} y1={y} x2={380} y2={y} />
          ))}
        </g>
        {/* Hệ trục tọa độ Oxy & Đường tròn lượng giác */}
        <g transform="translate(190, 78)">
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#475569" strokeWidth="1.2" />
          <line x1="0" y1="65" x2="0" y2="-65" stroke="#475569" strokeWidth="1.2" />
          <text x="112" y="-5" fill="#94a3b8" fontSize="10">x</text>
          <text x="6" y="-55" fill="#94a3b8" fontSize="10">y</text>
          <text x="-12" y="14" fill="#64748b" fontSize="9">O</text>

          {/* Đường tròn đơn vị R = 52 */}
          <circle cx="0" cy="0" r="52" fill="none" stroke="#38bdf8" strokeWidth="1.8" />

          {/* Cung góc alpha */}
          <path d="M0 0 L52 0 A52 52 0 0 0 36.7 -36.7 Z" fill={`url(#sector-trig-${stationId})`} />
          <path d="M18 0 A18 18 0 0 0 12.7 -12.7" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="21" y="-6" fill="#fbbf24" fontSize="10" fontWeight="bold">α</text>

          {/* Bán kính quay OM (góc 45 độ, R=52) */}
          <line x1="0" y1="0" x2="36.7" y2="-36.7" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="36.7" cy="-36.7" r="4.5" fill="#60a5fa" stroke="#ffffff" strokeWidth="1.5" />

          {/* Hình chiếu vuông góc lên Ox (cos α) và Oy (sin α) */}
          <line x1="36.7" y1="-36.7" x2="36.7" y2="0" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3,3" />
          <line x1="36.7" y1="-36.7" x2="0" y2="-36.7" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,3" />

          {/* Nhãn điểm M và giá trị lượng giác */}
          <circle cx="36.7" cy="0" r="2.5" fill="#f43f5e" />
          <circle cx="0" cy="-36.7" r="2.5" fill="#10b981" />
          <text x="44" y="-38" fill="#e2e8f0" fontSize="10" fontWeight="bold">M(cos α; sin α)</text>
          <text x="28" y="13" fill="#f87171" fontSize="8" fontFamily="monospace">cos α</text>
          <text x="-26" y="-33" fill="#34d399" fontSize="8" fontFamily="monospace">sin α</text>
        </g>
      </svg>
    );
  }

  if (isInequality) {
    return (
      <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
        <defs>
          <linearGradient id={`bg-ineq-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#06211d" />
            <stop offset="1" stopColor="#051513" />
          </linearGradient>
          <linearGradient id={`region-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="1" stopColor="#059669" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <rect width="380" height="155" fill={`url(#bg-ineq-${stationId})`} />
        {/* Lưới tọa độ */}
        <g stroke="#0f3d35" strokeWidth="0.8" opacity="0.6">
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
            <line key={`ix-${x}`} x1={x} y1={0} x2={x} y2={155} />
          ))}
          {[25, 55, 85, 115, 145].map((y) => (
            <line key={`iy-${y}`} x1={0} y1={y} x2={380} y2={y} />
          ))}
        </g>

        {/* Hệ trục tọa độ Oxy */}
        <line x1="40" y1="130" x2="350" y2="130" stroke="#34d399" strokeWidth="1.5" />
        <line x1="80" y1="145" x2="80" y2="15" stroke="#34d399" strokeWidth="1.5" />
        <text x="342" y="142" fill="#6ee7b7" fontSize="10" fontWeight="bold">x</text>
        <text x="68" y="24" fill="#6ee7b7" fontSize="10" fontWeight="bold">y</text>
        <text x="66" y="142" fill="#6ee7b7" fontSize="10">O</text>

        {/* Nửa mặt phẳng / miền nghiệm tô màu */}
        <polygon points="80,130 80,55 210,40 280,130" fill={`url(#region-${stationId})`} stroke="#10b981" strokeWidth="2" />

        {/* Đường thẳng bờ d: ax + by = c */}
        <line x1="50" y1="150" x2="310" y2="20" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5,4" />
        <text x="240" y="22" fill="#fbbf24" fontSize="9" fontWeight="bold">bờ d: ax + by = c</text>

        {/* Điểm nghiệm và nhãn miền nghiệm */}
        <circle cx="150" cy="85" r="4.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
        <text x="160" y="88" fill="#a7f3d0" fontSize="10" fontWeight="bold">Miền nghiệm ax + by ≤ c</text>

        {/* Điểm nguyên x, y */}
        <g fill="#6ee7b7" opacity="0.6">
          <circle cx="110" cy="110" r="2.5" />
          <circle cx="150" cy="110" r="2.5" />
          <circle cx="190" cy="110" r="2.5" />
          <circle cx="110" cy="85" r="2.5" />
          <circle cx="150" cy="60" r="2.5" />
        </g>
      </svg>
    );
  }

  if (is3D) {
    return (
      <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
        <defs>
          <linearGradient id={`bg-3d-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#081e28" />
            <stop offset="1" stopColor="#040e14" />
          </linearGradient>
          <linearGradient id={`grad-3d-${stationId}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="1" stopColor="#3b82f6" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect width="380" height="155" fill={`url(#bg-3d-${stationId})`} />
        {/* Lưới phối cảnh không gian */}
        <g stroke="#164e63" strokeWidth="0.8" opacity="0.4">
          <line x1="30" y1="125" x2="350" y2="125" />
          <line x1="60" y1="140" x2="320" y2="110" />
        </g>
        {/* Đáy hình chóp ABCD */}
        <polygon points="120,135 260,135 300,105 160,105" fill="#083344" stroke="#06b6d4" strokeWidth="1.5" />
        <line x1="160" y1="105" x2="120" y2="135" stroke="#22d3ee" strokeWidth="1.5" />
        <line x1="160" y1="105" x2="300" y2="105" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="4,4" />
        {/* Chiều cao SH nét đứt */}
        <line x1="210" y1="20" x2="210" y2="120" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="4,3" />
        <circle cx="210" cy="120" r="3" fill="#f43f5e" />
        <text x="215" y="75" fill="#fda4af" fontSize="9" fontWeight="bold">h = SH</text>
        {/* Cạnh bên hình chóp: SA, SB, SC thấy (nét liền), SD khuất (nét đứt) */}
        <line x1="210" y1="20" x2="120" y2="135" stroke="#38bdf8" strokeWidth="2" />
        <line x1="210" y1="20" x2="260" y2="135" stroke="#38bdf8" strokeWidth="2" />
        <line x1="210" y1="20" x2="300" y2="105" stroke="#38bdf8" strokeWidth="2" />
        <line x1="210" y1="20" x2="160" y2="105" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4,4" />
        {/* Đỉnh S */}
        <circle cx="210" cy="20" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
        <text x="210" y="14" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
      </svg>
    );
  }

  // 4. Mặc định 2D (Hàm số & đồ thị)
  return (
    <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-def-${stationId}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#0b0f19" />
        </linearGradient>
      </defs>
      <rect width="380" height="155" fill={`url(#bg-def-${stationId})`} />
      <g stroke="#334155" strokeWidth="0.8" opacity="0.4">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
          <line key={`dx-${x}`} x1={x} y1={0} x2={x} y2={155} />
        ))}
      </g>
      <line x1="40" y1="80" x2="340" y2="80" stroke="#64748b" strokeWidth="1.2" />
      <line x1="190" y1="140" x2="190" y2="15" stroke="#64748b" strokeWidth="1.2" />
      <path
        d="M60 130 C 130 130, 140 25, 190 25 C 240 25, 250 135, 320 30"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2.5"
      />
      <circle cx="150" cy="50" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="230" cy="110" r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

function ModuleCardArt({ moduleId }: { moduleId: ModuleId }) {
  switch (moduleId) {
    case "linear_programming":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="lp-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#0d3b38" />
              <stop offset="1" stopColor="#082226" />
            </linearGradient>
            <linearGradient id="poly-grad" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="1" stopColor="#059669" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#lp-bg)" />
          <g stroke="#1d4d48" strokeWidth="0.8" opacity="0.5">
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
              <line key={`x-${x}`} x1={x} y1={0} x2={x} y2={150} />
            ))}
            {[25, 55, 85, 115, 145].map((y) => (
              <line key={`y-${y}`} x1={0} y1={y} x2={380} y2={y} />
            ))}
          </g>
          <line x1="50" y1="130" x2="350" y2="130" stroke="#6ee7b7" strokeWidth="1.5" />
          <line x1="70" y1="140" x2="70" y2="15" stroke="#6ee7b7" strokeWidth="1.5" />
          <text x="340" y="142" fill="#6ee7b7" fontSize="10" fontWeight="bold">x</text>
          <text x="58" y="25" fill="#6ee7b7" fontSize="10" fontWeight="bold">y</text>
          <polygon points="70,130 70,55 190,40 270,130" fill="url(#poly-grad)" stroke="#34d399" strokeWidth="2" />
          <line x1="90" y1="140" x2="280" y2="20" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" />
          <text x="282" y="24" fill="#fbbf24" fontSize="9" fontWeight="bold">d_k: ux + vy = k</text>
          <circle cx="190" cy="40" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="190" cy="40" r="10" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" />
          <text x="200" y="38" fill="#a7f3d0" fontSize="11" fontWeight="bold">B(8; 12) Tối ưu</text>
          <g fill="#6ee7b7" opacity="0.6">
            <circle cx="110" cy="100" r="2" />
            <circle cx="150" cy="100" r="2" />
            <circle cx="190" cy="100" r="2" />
            <circle cx="150" cy="70" r="2" />
            <circle cx="110" cy="70" r="2" />
          </g>
        </svg>
      );

    case "spatial_geometry":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="geom-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#0a2533" />
              <stop offset="1" stopColor="#05141c" />
            </linearGradient>
            <linearGradient id="sect-grad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="1" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#geom-bg)" />
          <g stroke="#164e63" strokeWidth="0.8" opacity="0.4">
            <line x1="30" y1="125" x2="350" y2="125" />
            <line x1="60" y1="140" x2="320" y2="110" />
          </g>
          <polygon points="120,135 260,135 300,105 160,105" fill="#083344" stroke="#06b6d4" strokeWidth="1.5" />
          <line x1="160" y1="105" x2="120" y2="135" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="160" y1="105" x2="300" y2="105" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="4,4" />
          <line x1="210" y1="20" x2="210" y2="120" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="4,3" />
          <circle cx="210" cy="120" r="3" fill="#f43f5e" />
          <text x="215" y="75" fill="#fda4af" fontSize="9" fontWeight="bold">h = SH</text>
          <polygon points="175,70 240,65 255,95 190,100" fill="url(#sect-grad)" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="260" y="80" fill="#7dd3fc" fontSize="9" fontWeight="bold">Thiết diện (P)</text>
          <line x1="210" y1="20" x2="120" y2="135" stroke="#38bdf8" strokeWidth="2" />
          <line x1="210" y1="20" x2="260" y2="135" stroke="#38bdf8" strokeWidth="2" />
          <line x1="210" y1="20" x2="300" y2="105" stroke="#38bdf8" strokeWidth="2" />
          <line x1="210" y1="20" x2="160" y2="105" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4,4" />
          <circle cx="210" cy="20" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <text x="210" y="14" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
        </svg>
      );

    case "trigonometry":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="trig-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#1e1b4b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#trig-bg)" />
          <g transform="translate(100, 75)">
            <circle cx="0" cy="0" r="50" fill="#312e81" fillOpacity="0.3" stroke="#818cf8" strokeWidth="1.5" />
            <line x1="-65" y1="0" x2="65" y2="0" stroke="#6366f1" strokeWidth="1" />
            <line x1="0" y1="-65" x2="0" y2="65" stroke="#6366f1" strokeWidth="1" />
            <text x="58" y="-4" fill="#c7d2fe" fontSize="8">x</text>
            <text x="4" y="-56" fill="#c7d2fe" fontSize="8">y</text>
            <line x1="0" y1="0" x2="28.6" y2="-40.9" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="28.6" cy="-40.9" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="28.6" y1="-40.9" x2="28.6" y2="0" stroke="#ec4899" strokeWidth="1.2" strokeDasharray="3,3" />
            <line x1="28.6" y1="-40.9" x2="0" y2="-40.9" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="3,3" />
            <text x="32" y="-42" fill="#fde68a" fontSize="9" fontWeight="bold">M(cos α; sin α)</text>
          </g>
          <line x1="128.6" y1="34.1" x2="210" y2="34.1" stroke="#ec4899" strokeWidth="1.2" strokeDasharray="3,3" />
          <g transform="translate(210, 75)">
            <line x1="0" y1="0" x2="155" y2="0" stroke="#6366f1" strokeWidth="1" />
            <path
              d="M0 0 C 25 -50, 45 -50, 70 0 C 95 50, 115 50, 140 0"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
            <circle cx="21.5" cy="-40.9" r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            <text x="50" y="-45" fill="#e9d5ff" fontSize="9" fontWeight="bold">y = sin(x)</text>
          </g>
        </svg>
      );

    case "functions":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="func-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#311e08" />
              <stop offset="1" stopColor="#1a0f03" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#func-bg)" />
          <line x1="40" y1="80" x2="340" y2="80" stroke="#b45309" strokeWidth="1.2" />
          <line x1="180" y1="135" x2="180" y2="15" stroke="#b45309" strokeWidth="1.2" />
          <path
            d="M 60 135 C 100 135, 120 30, 145 35 C 170 40, 190 125, 215 125 C 240 125, 260 20, 300 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <line x1="50" y1="70" x2="330" y2="70" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4,4" />
          <text x="332" y="73" fill="#38bdf8" fontSize="9" fontWeight="bold">y = m</text>
          <circle cx="127" cy="70" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          <circle cx="180" cy="70" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          <circle cx="233" cy="70" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          <circle cx="145" cy="35" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          <text x="145" y="24" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">Cực đại (-1; 2)</text>
          <circle cx="215" cy="125" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          <text x="215" y="142" fill="#86efac" fontSize="8" fontWeight="bold" textAnchor="middle">Cực tiểu (1; -2)</text>
        </svg>
      );

    case "calculus":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="calc-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#06382b" />
              <stop offset="1" stopColor="#031e17" />
            </linearGradient>
            <linearGradient id="rect-grad" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="1" stopColor="#047857" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#calc-bg)" />
          <line x1="40" y1="120" x2="340" y2="120" stroke="#059669" strokeWidth="1.2" />
          <line x1="60" y1="135" x2="60" y2="15" stroke="#059669" strokeWidth="1.2" />
          {[
            { x: 80, w: 22, h: 25 },
            { x: 102, w: 22, h: 42 },
            { x: 124, w: 22, h: 62 },
            { x: 146, w: 22, h: 80 },
            { x: 168, w: 22, h: 92 },
            { x: 190, w: 22, h: 96 },
            { x: 212, w: 22, h: 88 },
          ].map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={120 - r.h}
              width={r.w}
              height={r.h}
              fill="url(#rect-grad)"
              stroke="#34d399"
              strokeWidth="0.8"
            />
          ))}
          <path
            d="M 60 120 Q 180 0, 260 120"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
          />
          <g transform="translate(300, 75)">
            <ellipse cx="0" cy="0" rx="35" ry="45" fill="#047857" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.5" />
            <ellipse cx="0" cy="0" rx="15" ry="45" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="3,3" />
            <text x="0" y="55" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">V = π ∫ f(x)² dx</text>
          </g>
          <text x="145" y="135" fill="#a7f3d0" fontSize="9" fontWeight="bold">Tổng Riemann: n dải, Δ → 0</text>
        </svg>
      );

    case "probability":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="prob-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#3b071e" />
              <stop offset="1" stopColor="#1e0410" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#prob-bg)" />
          <circle cx="50" cy="75" r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
          <text x="50" y="93" fill="#fecdd3" fontSize="8" fontWeight="bold" textAnchor="middle">Gốc Ω</text>
          <line x1="57" y1="75" x2="140" y2="40" stroke="#fb7185" strokeWidth="2" />
          <line x1="57" y1="75" x2="140" y2="110" stroke="#fb7185" strokeWidth="2" />
          <text x="90" y="50" fill="#fca5a5" fontSize="8" fontWeight="bold">P(H₁)=0.5</text>
          <text x="90" y="105" fill="#fca5a5" fontSize="8" fontWeight="bold">P(H₂)=0.5</text>
          <circle cx="140" cy="40" r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          <text x="140" y="28" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">Hộp 1</text>
          <circle cx="140" cy="110" r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          <text x="140" y="128" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">Hộp 2</text>
          <line x1="146" y1="40" x2="230" y2="20" stroke="#ef4444" strokeWidth="1.8" />
          <line x1="146" y1="40" x2="230" y2="55" stroke="#3b82f6" strokeWidth="1.8" />
          <circle cx="230" cy="20" r="5" fill="#ef4444" />
          <text x="238" y="23" fill="#fca5a5" fontSize="8" fontWeight="bold">Đỏ: 3/5</text>
          <circle cx="230" cy="55" r="5" fill="#3b82f6" />
          <text x="238" y="58" fill="#93c5fd" fontSize="8" fontWeight="bold">Xanh: 2/5</text>
          <line x1="146" y1="110" x2="230" y2="95" stroke="#ef4444" strokeWidth="1.8" />
          <line x1="146" y1="110" x2="230" y2="130" stroke="#3b82f6" strokeWidth="1.8" />
          <circle cx="230" cy="95" r="5" fill="#ef4444" />
          <text x="238" y="98" fill="#fca5a5" fontSize="8" fontWeight="bold">Đỏ: 2/6</text>
          <circle cx="230" cy="130" r="5" fill="#3b82f6" />
          <text x="238" y="133" fill="#93c5fd" fontSize="8" fontWeight="bold">Xanh: 4/6</text>
          <g transform="translate(300, 75)">
            <rect x="-25" y="-35" width="95" height="70" rx="8" fill="#881337" stroke="#f43f5e" strokeWidth="1" />
            <text x="22" y="-18" fill="#fecdd3" fontSize="8" fontWeight="bold" textAnchor="middle">CÔNG THỨC BAYES</text>
            <text x="22" y="2" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">P(H₁ | Đỏ)</text>
            <text x="22" y="20" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">9/14 ≈ 64.3%</text>
          </g>
        </svg>
      );

    case "conics_and_solids":
      return (
        <svg viewBox="0 0 380 150" className="w-full h-full block" aria-hidden="true">
          <defs>
            <linearGradient id="conic-bg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#2e1065" />
              <stop offset="1" stopColor="#170733" />
            </linearGradient>
            <linearGradient id="plane-grad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="380" height="150" fill="url(#conic-bg)" />
          <g transform="translate(110, 75)">
            <polygon points="0,0 -45,-60 45,-60" fill="#4c1d95" fillOpacity="0.4" stroke="#c084fc" strokeWidth="1.5" />
            <ellipse cx="0" cy="-60" rx="45" ry="12" fill="#581c87" fillOpacity="0.5" stroke="#a855f7" strokeWidth="1.2" />
            <polygon points="0,0 -45,60 45,60" fill="#4c1d95" fillOpacity="0.4" stroke="#c084fc" strokeWidth="1.5" />
            <ellipse cx="0" cy="60" rx="45" ry="12" fill="#581c87" fillOpacity="0.5" stroke="#a855f7" strokeWidth="1.2" />
            <polygon points="-55,-25 35,-55 55,-35 -35,-5" fill="url(#plane-grad)" stroke="#f472b6" strokeWidth="1.5" />
            <ellipse cx="-2" cy="-30" rx="28" ry="10" transform="rotate(-18 -2 -30)" fill="#ec4899" fillOpacity="0.5" stroke="#ffffff" strokeWidth="1.5" />
            <text x="35" y="-20" fill="#f472b6" fontSize="9" fontWeight="bold">Thiết diện: Elip (β &gt; α)</text>
          </g>
          <g transform="translate(280, 75)">
            <line x1="-65" y1="0" x2="65" y2="0" stroke="#7e22ce" strokeWidth="1" />
            <line x1="0" y1="-50" x2="0" y2="50" stroke="#7e22ce" strokeWidth="1" />
            <ellipse cx="0" cy="0" rx="55" ry="32" fill="none" stroke="#d8b4fe" strokeWidth="2" />
            <circle cx="-35" cy="0" r="3.5" fill="#f43f5e" />
            <text x="-35" y="12" fill="#fda4af" fontSize="8" fontWeight="bold" textAnchor="middle">F₁</text>
            <circle cx="35" cy="0" r="3.5" fill="#f43f5e" />
            <text x="35" y="12" fill="#fda4af" fontSize="8" fontWeight="bold" textAnchor="middle">F₂</text>
            <circle cx="20" cy="-30" r="4.5" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="-35" y1="0" x2="20" y2="-30" stroke="#facc15" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="35" y1="0" x2="20" y2="-30" stroke="#facc15" strokeWidth="1" strokeDasharray="2,2" />
            <text x="0" y="44" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle">MF₁ + MF₂ = 2a</text>
          </g>
        </svg>
      );

    default:
      return null;
  }
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStation = searchParams.get("station");
  const urlStep = searchParams.get("step");
  const urlTab = searchParams.get("tab");

  const initialStation = urlStation || "10.03";
  const matchedStation = useMemo(() => {
    const list = getAllStations();
    return list.find((s) => s.id === initialStation);
  }, [initialStation]);

  const initialModuleId: ModuleId = matchedStation ? matchedStation.moduleId : "linear_programming";
  const initialViewMode: ViewMode = urlStation ? "lab" : "home";
  const initialSubsystem: SubsystemId = urlTab === "teacher" ? "teacher" : urlTab === "research" ? "research" : "student";
  const initialStepNumber = urlStep ? Math.max(0, Math.min(7, parseInt(urlStep, 10) - 1)) : 0;

  const [subsystem, setSubsystem] = useState<SubsystemId>(initialSubsystem);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [moduleId, setModuleId] = useState<ModuleId>(initialModuleId);
  const [stationId, setStationId] = useState<string>(initialStation);
  const [currentStep, setCurrentStep] = useState<number>(initialStepNumber);

  // Đồng bộ trạng thái vào URL chuẩn mực (URL-Driven Clean Routing)
  const syncUrl = useCallback((newStationId: string | null, newStep: number | null, newTab: string | null, newModuleId?: string | null) => {
    if (typeof window === "undefined") return;
    if (newStationId) {
      const stepQuery = typeof newStep === "number" && newStep >= 1 ? `?step=${newStep}` : "";
      window.history.pushState(null, "", `/stations/${newStationId}${stepQuery}`);
    } else if (newModuleId) {
      const stepQuery = typeof newStep === "number" && newStep >= 1 ? `?step=${newStep}` : "";
      window.history.pushState(null, "", `/modules/${newModuleId}${stepQuery}`);
    } else if (newTab && newTab !== "catalog") {
      window.history.pushState(null, "", `/?tab=${newTab}`);
    } else {
      window.history.pushState(null, "", "/");
    }
  }, []);

  // Lắng nghe thay đổi searchParams khi người dùng nhấn Back/Forward
  useEffect(() => {
    const stationParam = searchParams.get("station");
    const stepParam = searchParams.get("step");
    const tabParam = searchParams.get("tab");

    if (stationParam) {
      setStationId(stationParam);
      const st = getAllStations().find((s) => s.id === stationParam);
      if (st) setModuleId(st.moduleId);
      setViewMode("lab");
      setSubsystem("student");
      if (stepParam) {
        const s = parseInt(stepParam, 10);
        if (!isNaN(s) && s >= 1 && s <= 8) {
          setCurrentStep(s - 1);
        }
      }
    } else if (tabParam === "teacher") {
      setSubsystem("teacher");
      setViewMode("home");
    } else if (tabParam === "research") {
      setSubsystem("research");
      setViewMode("home");
    } else if (tabParam === "catalog") {
      setSubsystem("student");
      setViewMode("home");
    }

    const authCode = searchParams.get("code");
    if (authCode) {
      // Tự động chuyển hướng hoàn tất đăng nhập Google OAuth
      window.location.replace(`/auth/callback${window.location.search}`);
      return;
    }

    const authErrorParam = searchParams.get("auth_error");
    const authConfirmedParam = searchParams.get("auth");
    if (authErrorParam === "google-disabled") {
      setLoginError("Đăng nhập Google chưa được kích hoạt trong cài đặt Supabase. Em có thể đăng nhập bằng email hoặc trải nghiệm thử.");
      setAuthModalOpen(true);
    } else if (authErrorParam) {
      setLoginError("Phiên đăng nhập chưa hoàn tất hoặc đã hết hạn. Vui lòng thử lại.");
      setAuthModalOpen(true);
    } else if (authConfirmedParam === "confirmed") {
      setLoginNotice("Email đã được xác nhận. Em có thể đăng nhập ngay.");
      setAuthModalOpen(true);
    }
  }, [searchParams]);
  const [stage] = useState<StageId>("explore");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);

  // Lock body overflow when tutor drawer is open to prevent screen overflow when zoomed
  useEffect(() => {
    if (tutorOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [tutorOpen]);

  // Catalog filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<"all" | "3d" | "2d">("all");

  // Core 7 Modules filtering state
  const [selectedModuleGrade, setSelectedModuleGrade] = useState<number>(0);
  const filteredCoreModules = useMemo(() => {
    if (selectedModuleGrade === 0) return CORE_7_MODULES;
    return CORE_7_MODULES.filter((m) => m.grade === selectedModuleGrade);
  }, [selectedModuleGrade]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Auth / session state
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "verify_email">("login");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Bộ đếm thời gian chờ gửi lại email xác thực
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // Math Captcha state chống spam bot
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(false);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/auth/captcha");
      if (res.ok) {
        const data = await res.json();
        const q = data.question || data.challenge?.question || "";
        const t = data.token || data.challenge?.token || "";
        setCaptchaQuestion(q);
        setCaptchaToken(t);
        setCaptchaAnswer("");
      }
    } catch (e) {
      console.error("[Math Captcha Error]:", e);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authModalOpen && (authMode === "login" || authMode === "signup")) {
      loadCaptcha();
    }
  }, [authModalOpen, authMode, loadCaptcha]);

  // User Profile & Custom AI Key Modal state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<"profile" | "ai">("profile");
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig | null>(null);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"stations" | "modules">("stations");

  const allStations = useMemo(() => getAllStations(), []);

  // Cuộn mượt mà quay lại section đầu trang (Hero Section) khi nhấn Logo
  const handleNavigateHome = useCallback(() => {
    setActiveSection("stations");
    if (subsystem !== "student" || viewMode !== "home") {
      setSubsystem("student");
      setViewMode("home");
      syncUrl(null, null, "student");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [subsystem, viewMode, syncUrl]);

  // Cuộn trang mượt mà tới danh mục trạm học
  const handleNavigateStations = useCallback(() => {
    setActiveSection("stations");
    if (subsystem !== "student" || viewMode !== "home") {
      setSubsystem("student");
      setViewMode("home");
      syncUrl(null, null, "student");
      setTimeout(() => {
        const el = document.getElementById("catalog-section");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      const el = document.getElementById("catalog-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [subsystem, viewMode, syncUrl]);

  // Cuộn trang mượt mà tới 7 module thí nghiệm động
  const handleNavigateModules = useCallback(() => {
    setActiveSection("modules");
    if (subsystem !== "student" || viewMode !== "home") {
      setSubsystem("student");
      setViewMode("home");
      syncUrl(null, null, "student");
      setTimeout(() => {
        const el = document.getElementById("modules-section");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      const el = document.getElementById("modules-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [subsystem, viewMode, syncUrl]);

  // Scroll spy để đổi trạng thái active giữa Trạm học và Module
  useEffect(() => {
    if (subsystem !== "student" || viewMode !== "home") return;

    const handleScroll = () => {
      const catalogEl = document.getElementById("catalog-section");
      const modulesEl = document.getElementById("modules-section");
      if (!catalogEl || !modulesEl) return;

      const catalogTop = catalogEl.getBoundingClientRect().top;
      const modulesTop = modulesEl.getBoundingClientRect().top;

      if (catalogTop <= 350) {
        setActiveSection("stations");
      } else if (modulesTop <= 350) {
        setActiveSection("modules");
      } else {
        setActiveSection("stations");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [subsystem, viewMode]);

  // Filter stations for the catalog view
  const filteredStations = useMemo(() => {
    const q = removeVietnameseAccents(searchQuery.trim().toLowerCase());
    return allStations.filter((st) => {
      if (selectedGrade !== 0 && st.grade !== selectedGrade) return false;
      if (selectedType === "3d" && !st.is3D) return false;
      if (selectedType === "2d" && st.is3D) return false;
      if (!q) return true;
      const hay = removeVietnameseAccents(`${st.id} ${st.title} ${st.source} ${st.goal} ${st.simulation}`).toLowerCase();
      return hay.includes(q);
    });
  }, [allStations, searchQuery, selectedGrade, selectedType]);

  // Session check on initial mount
  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (ignore) return;
        if (data && data.authenticated) {
          const userName = data.user?.name ?? data.name ?? null;
          const userEmail = data.user?.email ?? data.email ?? null;
          const userRole = data.role ?? data.user?.role ?? "student";
          setSession({
            authenticated: true,
            name: userName,
            email: userEmail,
            role: userRole,
            email_verified: Boolean(data.email_verified ?? true),
            provider: data.provider || "email",
          });
        } else {
          setSession({ authenticated: false, name: null, email: null, role: "guest" });
        }
      } catch {
        if (!ignore) {
          setSession({ authenticated: false, name: null, email: null });
        }
      } finally {
        if (!ignore) setSessionLoading(false);
      }
    }
    void checkSession();
    return () => { ignore = true; };
  }, []);

  // Nạp cấu hình Custom AI Key từ localStorage nếu có
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mathstep:custom_ai_config");
      if (stored) {
        const parsed = JSON.parse(stored) as CustomAiConfig;
        if (parsed?.apiKey) {
          setCustomAiConfig(parsed);
        }
      }
    } catch {}
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting from TES Mascot
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "intro-mascot",
          role: "assistant",
          content: "Chào em! Thầy/cô là **Trợ lý gợi mở Socratic**. Thầy/cô sẽ đồng hành cùng em qua các bước khám phá mô hình, đặt câu hỏi gợi ý và hỗ trợ em rèn luyện tư duy toán học chứ tuyệt đối **không giải hộ đáp số**. Em hãy thao tác trên mô hình và đặt câu hỏi bất cứ khi nào nhé!",
          intent: "general",
        },
      ]);
    }
  }, [messages.length]);

  const handleOpenStationInLab = (st: StationItem, stepNum = 1) => {
    router.push(`/stations/${st.id}${stepNum > 1 ? `?step=${stepNum}` : ""}`);
  };

  const handleSendTutorMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setBusy(true);
    setError("");

    try {
      const hasCustomKey = Boolean(customAiConfig?.apiKey && customAiConfig.apiKey.trim().length > 10);

      // GIỚI HẠN QUYỀN TRUY CẬP CHO KHÁCH (GUEST ACCESS CONTROL)
      // Cho phép học thử 5 câu hỏi/ngày. Sau 5 câu yêu cầu đăng ký và xác minh email.
      const todayStr = new Date().toISOString().slice(0, 10);
      const guestKey = `mathstep:guest_usage_${todayStr}`;
      const currentGuestUsage = typeof window !== "undefined" ? parseInt(localStorage.getItem(guestKey) || "0", 10) : 0;

      if (!session?.authenticated && !hasCustomKey && currentGuestUsage >= 5) {
        setPendingVerificationEmail("");
        setAuthMode("signup");
        setLoginNotice("Em đã hoàn thành 5 lượt tương tác học thử hôm nay. Hãy đăng ký tài khoản và xác minh email để mở khóa học tập không giới hạn cùng Trợ lý Socratic!");
        setAuthModalOpen(true);
        setBusy(false);
        return;
      }

      if (session?.authenticated || hasCustomKey) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: textToSend,
            mode: "guided_learning",
            learning_context: { module: moduleId, learning_stage: stage },
            hint_level: 1,
            custom_ai: hasCustomKey ? customAiConfig : undefined,
          }),
        });
        const data = await response.json();
        if (response.ok && data?.answer) {
          const reply: ChatMessage = {
            id: data.message_id || crypto.randomUUID(),
            role: "assistant",
            content: data.answer,
            intent: data.intent,
            nextQuestion: data.next_action?.payload?.question,
            hintLevel: data.hint_level,
          };
          setMessages((prev) => [...prev, reply]);
          if (data.conversation_id) setConversationId(String(data.conversation_id));
          return;
        }
      }

      // Offline / Socratic Fallback Engine
      const fallback = generateSmartSocraticResponse(textToSend, moduleId, stage, 1);
      const fallbackReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fallback.answer,
        intent: fallback.intent,
        nextQuestion: fallback.nextQuestion,
        hintLevel: fallback.hintLevel,
      };
      setMessages((prev) => [...prev, fallbackReply]);
      // Cập nhật số lượt học thử của khách
      if (!session?.authenticated && !hasCustomKey && typeof window !== "undefined") {
        const todayStr = new Date().toISOString().slice(0, 10);
        const guestKey = `mathstep:guest_usage_${todayStr}`;
        const cur = parseInt(localStorage.getItem(guestKey) || "0", 10);
        localStorage.setItem(guestKey, String(cur + 1));
      }
    } catch {
      const fallback = generateSmartSocraticResponse(textToSend, moduleId, stage, 1);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fallback.answer,
          intent: fallback.intent,
          nextQuestion: fallback.nextQuestion,
          hintLevel: fallback.hintLevel,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleAskTutorFromWorkbench = (promptText: string) => {
    setTutorOpen(true);
    void handleSendTutorMessage(promptText);
  };

  const handleResendVerificationEmail = async () => {
    if (resendCooldown > 0) return;
    const emailToResend = pendingVerificationEmail || loginEmail || session?.email;
    if (!emailToResend) {
      setLoginError("Không tìm thấy địa chỉ email để gửi lại.");
      return;
    }
    try {
      setLoginBusy(true);
      setLoginError("");
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToResend }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || "Chưa gửi lại được email.");
      setLoginNotice(`Đã gửi lại liên kết kích hoạt tới ${emailToResend}! Vui lòng kiểm tra hộp thư.`);
      setResendCooldown(60);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoginBusy(false);
    }
  };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginNotice("");
    setLoginBusy(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          name: authMode === "signup" ? displayName : undefined,
          captchaAnswer: captchaAnswer.trim(),
          captchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Tải lại captcha mới khi thất bại
        loadCaptcha();
        // Kiểm tra nếu lỗi do chưa xác nhận email
        if (data.detail?.code === "EMAIL_NOT_CONFIRMED" || data.detail?.message?.includes("xác nhận")) {
          setPendingVerificationEmail(loginEmail);
          setAuthMode("verify_email");
          setLoginNotice("Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc nhấn 'Gửi lại email xác thực'.");
          return;
        }
        throw new Error(data.detail?.message || "Đăng nhập không thành công.");
      }

      // Khi đăng ký thủ công: BẮT BUỘC yêu cầu xác thực email nếu backend yêu cầu
      if (authMode === "signup") {
        if (data.confirmation_required) {
          setPendingVerificationEmail(loginEmail);
          setAuthMode("verify_email");
          setLoginNotice("Đăng ký thành công! Chúng tôi đã gửi một liên kết xác thực tới email của bạn. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.");
          return;
        }
      }

      // Tải lại phiên người dùng mới nhất từ server
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json().catch(() => null);
      if (sessionData && sessionData.authenticated) {
        const userName = sessionData.user?.name ?? sessionData.name ?? displayName ?? null;
        const userEmail = sessionData.user?.email ?? sessionData.email ?? loginEmail ?? null;
        const userRole = sessionData.role ?? sessionData.user?.role ?? "student";
        setSession({
          authenticated: true,
          name: userName,
          email: userEmail,
          role: userRole,
          email_verified: Boolean(sessionData.email_verified ?? true),
          provider: sessionData.provider ?? "email",
        });
        setAuthModalOpen(false);
      } else {
        throw new Error("Không thể khởi tạo phiên làm việc.");
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setSession({ authenticated: false, name: null, email: null });
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden flex flex-col bg-[#0B0F17] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-white">
      {/* 1. TOP NAVIGATION BAR (PLATFORM HEADER COMPONENT) */}
      <PlatformHeader
        subsystem={subsystem}
        viewMode={viewMode}
        activeSection={activeSection}
        onSelectSubsystem={(sub, view = "home") => {
          setSubsystem(sub);
          setViewMode(view);
          if (view === "home") {
            syncUrl(null, null, sub === "student" ? null : sub);
          }
        }}
        onNavigateHome={handleNavigateHome}
        onNavigateStations={handleNavigateStations}
        onNavigateModules={handleNavigateModules}
        session={session}
        sessionLoading={sessionLoading}
        customAiConfig={customAiConfig}
        onOpenAccountModal={(tab) => {
          setAccountModalTab(tab);
          setAccountModalOpen(true);
        }}
        onOpenChatHistory={() => setChatHistoryOpen(true)}
        onOpenTeacherVerification={() => {
          setSubsystem("teacher");
        }}
        onSwitchToStudentView={async () => {
          try {
            await fetch("/api/account/verify-teacher", { method: "DELETE" });
          } catch {}
          setSession((prev) => (prev ? { ...prev, role: "student" } : null));
          setSubsystem("student");
          setViewMode("home");
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={() => void logout()}
      />

      {/* BANNER CẢNH BÁO XÁC THỰC EMAIL (KHI ĐĂNG KÝ THỦ CÔNG MÀ CHƯA XÁC MINH) */}
      {session?.authenticated && session.email_verified === false && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 text-amber-200 px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 max-w-3xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Tài khoản chưa xác thực email:</strong> Hãy kiểm tra hộp thư của bạn ({session.email}) và bấm vào liên kết xác nhận để mở khóa đầy đủ tính năng đồng bộ và AI nâng cao.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loginBusy || resendCooldown > 0}
              onClick={handleResendVerificationEmail}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-medium text-[11px] transition-colors cursor-pointer"
            >
              {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : "Gửi lại email xác thực"}
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col">
        {/* SUB-SYSTEM 1: STUDENT HOME PORTAL (CATALOG & HERO) */}
        {subsystem === "student" && viewMode === "home" && (
          <div className="flex-1 space-y-8 pb-12">
            {/* HERO BANNER - SCHOLARLY DESKTOP SHELL */}
            <section id="hero-section" className="bg-slate-950 text-slate-100 px-4 md:px-8 py-10 md:py-14 relative overflow-hidden border-b border-slate-800 scroll-mt-16">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 md:gap-12 items-center">
                <div className="space-y-4">
                  {/* 1. Eyebrow Badge Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Học liệu số Toán THPT · Lớp 10 - 12</span>
                  </div>

                  {/* 2. Main Heading */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.25] text-white">
                    Khám phá bản chất Toán học<br />
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent not-italic font-bold">
                      qua mô hình tương tác trực quan.
                    </span>
                  </h1>

                  {/* 3. Description */}
                  <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-sans">
                    Nền tảng mô phỏng hình học và giải tích không gian trực quan. Giúp người học tự thao tác, thay đổi tham số để hiểu sâu bản chất quy luật toán học thay vì ghi nhớ công thức máy móc.
                  </p>

                  {/* 4. Call To Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const firstStation = allStations[0];
                        if (firstStation) {
                          handleOpenStationInLab(firstStation, 1);
                        } else {
                          setViewMode("lab");
                          setSubsystem("student");
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-900/20 active:scale-[0.98]"
                    >
                      <span>Vào phòng thực hành</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("catalog-section");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-white/10 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Xem các trạm học</span>
                    </button>
                  </div>

                  {/* 5. Metrics / Social Proof */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-slate-800/80">
                    <div>
                      <div className="text-xl sm:text-2xl font-mono font-bold text-white">7</div>
                      <div className="text-xs text-slate-400 mt-0.5">Module GeoGebra động</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-mono font-bold text-white">48</div>
                      <div className="text-xs text-slate-400 mt-0.5">Trạm học tương tác</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-mono font-bold text-white">2D & 3D</div>
                      <div className="text-xs text-slate-400 mt-0.5">Mô hình trực quan</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-mono font-bold text-blue-400">Socratic AI</div>
                      <div className="text-xs text-slate-400 mt-0.5">Gợi mở tư duy</div>
                    </div>
                  </div>
                </div>

                {/* HERO GRAPHIC ART SVG */}
                <div className="relative border border-slate-800 rounded-xl bg-slate-900/60 p-5 flex items-center justify-center">
                  <div className="absolute right-3 top-3 bg-slate-950/90 border border-slate-800 px-2.5 py-0.5 rounded text-blue-400 text-[11px] font-mono">
                    Mặt cầu · Không gian Oxyz
                  </div>
                  <svg viewBox="0 0 450 300" className="w-full h-56" aria-hidden="true">
                    <g stroke="#3b82f6" fill="none" opacity="0.3">
                      <ellipse cx="225" cy="150" rx="180" ry="65" transform="rotate(-25 225 150)" />
                      <ellipse cx="225" cy="150" rx="150" ry="90" transform="rotate(38 225 150)" />
                      <path d="M35 230L415 250M70 270L385 60M210 280L210 30" strokeDasharray="5 5" />
                    </g>
                    <circle cx="225" cy="140" r="70" fill="#1e3a5f" opacity="0.4" stroke="#3b82f6" strokeWidth="1.5" />
                    <g fill="#60a5fa">
                      <circle cx="95" cy="165" r="4" />
                      <circle cx="355" cy="95" r="4" />
                      <circle cx="310" cy="225" r="3.5" />
                    </g>
                    <text x="30" y="280" fill="#64748b" fontSize="10" letterSpacing="1.5" fontFamily="monospace">
                      DỰ ĐOÁN · THAO TÁC · KIỂM CHỨNG
                    </text>
                  </svg>
                </div>
              </div>
            </section>

            {/* SECTION: 7 PHÒNG THÍ NGHIỆM TOÁN HỌC */}
            <section id="modules-section" className="max-w-6xl mx-auto px-4 md:px-8 space-y-4 pt-2 scroll-mt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Mô phỏng hình học &amp; giải tích tương tác
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
                    7 Phòng Thí Nghiệm Toán Học
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Trực quan hóa các khái niệm trừu tượng. Thay đổi tham số để quan sát hình vẽ và đồ thị biến thiên theo thời gian thực.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-md bg-slate-900 text-slate-300 text-xs border border-slate-800 flex items-center gap-1.5 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Chuẩn SGK mới (GDPT 2018)</span>
                  </span>
                </div>
              </div>

              {/* Module Filter Chips */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="flex flex-wrap gap-1 text-xs">
                  {[
                    { id: 0, label: "Tất cả (7)" },
                    { id: 10, label: "Lớp 10 (2)" },
                    { id: 11, label: "Lớp 11 (2)" },
                    { id: 12, label: "Lớp 12 (3)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedModuleGrade(g.id)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        selectedModuleGrade === g.id
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tiến trình 8 bước: Đề bài ↔ Thao tác ↔ Đúc kết quy luật</span>
                </div>
              </div>

              {/* Grid 7 Module Cards (3 cột trên Desktop, 1 cột trên Mobile) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCoreModules.map((mod) => (
                  <article
                    key={mod.id}
                    className="bg-slate-900/90 rounded-xl border border-slate-800/80 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group overflow-hidden shadow-lg hover:shadow-blue-500/5"
                  >
                    <div>
                      {/* Header thẻ: Tag khối lớp & không gian bên trái + Mã trạm nhỏ gọn bên phải */}
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/70 flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400 bg-blue-950/70 border border-blue-900/50 px-2 py-0.5 rounded text-[11px]">
                          {mod.tag}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px] font-medium">
                          {mod.stationCode}
                        </span>
                      </div>

                      {/* Màn hình/Ảnh preview mô phỏng toán học (giữ nguyên) */}
                      <Link
                        href={`/modules/${mod.id}?mode=dynamic`}
                        className="block h-36 relative overflow-hidden bg-slate-950 cursor-pointer"
                        title={`Xem mô phỏng ${mod.title}`}
                      >
                        <ModuleCardArt moduleId={mod.id} />
                      </Link>

                      {/* Card Content: Tên bài học & Mô tả hành động */}
                      <div className="p-4 space-y-2">
                        {/* Tên bài học: Chữ in đậm, nổi bật */}
                        <h3 className="text-white font-semibold text-base leading-snug group-hover:text-blue-400 transition-colors">
                          <Link href={`/modules/${mod.id}?mode=dynamic`}>
                            {mod.title}
                          </Link>
                        </h3>

                        {/* Mô tả hành động: Đúng 1 CÂU NGẮN GỌN (tối đa 2 dòng), viết trọn vẹn, TUYỆT ĐỐI KHÔNG để bị cắt cụt ba chấm (...) */}
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* Nút hành động: 1 nút duy nhất "Vào phòng thí nghiệm →" */}
                    <div className="p-4 pt-0">
                      <Link
                        href={`/modules/${mod.id}?mode=dynamic`}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
                        title={`Vào phòng thí nghiệm ${mod.title}`}
                      >
                        <span>Vào phòng thí nghiệm</span>
                        <span className="text-sm font-semibold transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 48 STATIONS CATALOG SECTION */}
            <section id="catalog-section" className="max-w-6xl mx-auto px-4 md:px-8 space-y-6 scroll-mt-16">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                    Thư Viện Trạm Học Toán THPT
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Khám phá 48 chuyên đề mô phỏng tương tác từ cơ bản đến nâng cao theo chương trình SGK mới.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800">
                  {filteredStations.length} trạm hiển thị
                </span>
              </div>

              {/* FILTERS & SEARCH BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                {/* Grade chips */}
                <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                  {[
                    { id: 0, label: "Tất cả (48)" },
                    { id: 10, label: "Lớp 10 (16)" },
                    { id: 11, label: "Lớp 11 (20)" },
                    { id: 12, label: "Lớp 12 (12)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGrade(g.id)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedGrade === g.id
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Search & Model Type */}
                <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm bài (ví dụ: quy hoạch tuyến tính, hình chóp, conic...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs flex items-center">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as "all" | "3d" | "2d")}
                    className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Mọi mô hình</option>
                    <option value="3d">Không gian 3D</option>
                    <option value="2d">Hình học phẳng 2D</option>
                  </select>
                </div>
              </div>

              {/* PHÂN VÙNG 1: CHUYÊN ĐỀ TRỌNG TÂM SGK MỚI */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 border-l-4 border-l-blue-500 rounded-r-xl rounded-l-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <h3 className="text-sm font-semibold text-slate-100 tracking-wide">
                        Chuyên đề trọng tâm SGK Mới
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Bộ trạm học cốt lõi tích hợp đầy đủ bài toán thực tế và mô hình mô phỏng tương tác.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-xs rounded-md shrink-0">
                    Khuyên dùng cho tự học
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStations.filter((st) => st.isValidated).map((st) => (
                    <article
                      key={st.id}
                      className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all duration-150 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Visual SVG Card Art */}
                        <Link href={`/stations/${st.id}`} className="block h-36 relative overflow-hidden bg-slate-950 cursor-pointer">
                          <StationCardArt grade={st.grade} is3D={st.is3D} stationId={st.id} />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="bg-slate-900/90 text-slate-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border border-slate-800 font-mono">
                              Trạm {st.id} · Lớp {st.grade}
                            </span>
                            <span className="bg-slate-900/80 text-blue-300 border border-slate-800 px-2 py-0.5 rounded-md text-[11px] font-medium">
                              {st.is3D ? "Không gian 3D" : "Mặt phẳng 2D"}
                            </span>
                          </div>
                        </Link>

                        {/* Card Content */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-blue-400">
                              {st.badge ? st.badge.replace("KHKT", "SGK") : "Chuyên đề trọng tâm"}
                            </span>
                          </div>

                          <h3 className="font-semibold text-sm text-slate-100 leading-snug group-hover:text-blue-400 transition-colors">
                            <Link href={`/stations/${st.id}`}>
                              {st.title}
                            </Link>
                          </h3>

                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                            {st.simulation}
                          </p>

                          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="truncate max-w-[190px]">{st.source}</span>
                            <span className="text-blue-400 font-medium">Khớp SGK</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <Link
                          href={`/stations/${st.id}`}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Vào trạm học</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* PHÂN VÙNG 2: CHUYÊN ĐỀ MỞ RỘNG (ĐANG CẬP NHẬT MÔ PHỎNG) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900/50 border border-slate-800 border-l-4 border-l-slate-700 rounded-r-xl rounded-l-md">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                      <span>Chuyên Đề Mở Rộng (Đang Cập Nhật Mô Phỏng)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Các chuyên đề bổ trợ theo phân phối chương trình SGK mới đang được bổ sung và cập nhật liên tục.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 font-medium text-xs rounded-md border border-slate-700 shrink-0">
                    Đang cập nhật
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 hover:opacity-95 transition-opacity">
                  {filteredStations.filter((st) => !st.isValidated).map((st) => (
                    <article
                      key={st.id}
                      className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Visual SVG Card Art */}
                        <div className="h-32 relative overflow-hidden bg-slate-950/80 grayscale opacity-70">
                          <StationCardArt grade={st.grade} is3D={st.is3D} stationId={st.id} />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="bg-slate-900/90 text-slate-300 px-2.5 py-0.5 rounded-md text-[10px] font-mono border border-slate-800">
                              Trạm {st.id} · Lớp {st.grade}
                            </span>
                            <span className="bg-slate-900/80 text-blue-300/80 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                              {st.is3D ? "Không gian 3D" : "Mặt phẳng 2D"}
                            </span>
                          </div>
                          <span className="absolute top-2.5 right-2.5 bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Đang cập nhật
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium text-slate-400">
                              Đang chuẩn hóa mô phỏng
                            </span>
                          </div>

                          <h3 className="font-semibold text-xs text-slate-300 line-clamp-1">
                            {st.title}
                          </h3>

                          <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                            {st.simulation}
                          </p>

                          <div className="text-[10px] text-slate-400 font-mono italic pt-1 border-t border-slate-800/60">
                            {st.source}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            alert("Chuyên đề này đang trong quá trình cập nhật mô phỏng tương tác. Bạn vui lòng trải nghiệm các trạm học trọng tâm phía trên!");
                          }}
                          className="w-full py-1.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-lg font-medium text-xs border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Đang cập nhật mô phỏng</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SUB-SYSTEM 1: STUDENT INTERACTIVE LAB VIEW (MathStepWorkbench) */}
        {subsystem === "student" && viewMode === "lab" && (
          <div className="flex-1 w-full h-[calc(100dvh-48px)] p-1.5 md:p-2 overflow-hidden bg-[#090D16]">
            <MathStepWorkbench
              moduleId={moduleId}
              stationId={stationId}
              initialStep={currentStep}
              userRole={session?.role || "guest"}
              onStepChange={(stepNum) => {
                setCurrentStep(stepNum - 1);
                syncUrl(stationId, stepNum, null);
              }}
              onBackToCatalog={() => {
                setViewMode("home");
                setSubsystem("student");
                syncUrl(null, null, "catalog");
              }}
              onAskTutor={handleAskTutorFromWorkbench}
              onSelectStation={(st) => {
                handleOpenStationInLab(st, 1);
              }}
            />
          </div>
        )}

        {/* SUB-SYSTEM 2: TEACHER DASHBOARD & ACCESS GUARD */}
        {subsystem === "teacher" && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F17] p-3 md:p-6 text-slate-100">
            {session?.role === "teacher" || session?.role === "admin" ? (
              <TeacherDashboard
                onLaunchStation={(stId) => {
                  const found = allStations.find((s) => s.id === stId);
                  if (found) {
                    setStationId(found.id);
                    setModuleId(found.moduleId);
                    setViewMode("lab");
                    setSubsystem("student");
                  }
                }}
                onOpenWorkbench={() => {
                  setViewMode("lab");
                  setSubsystem("student");
                }}
              />
            ) : (
              <TeacherAccessGuard
                currentRole={session?.role || "guest"}
                isAuthenticated={Boolean(session?.authenticated)}
                onBackToStudent={() => {
                  setSubsystem("student");
                  setViewMode("home");
                  syncUrl(null, null, null);
                }}
                onUpgradeSuccess={async () => {
                  try {
                    const res = await fetch("/api/auth/session");
                    const data = await res.json();
                    if (data && data.authenticated) {
                      setSession({
                        authenticated: true,
                        name: data.user?.name ?? data.name ?? null,
                        email: data.user?.email ?? data.email ?? null,
                        role: data.role || data.user?.role || "teacher",
                        email_verified: Boolean(data.email_verified ?? true),
                        provider: data.provider || "email",
                      });
                    }
                  } catch {}
                }}
                onRequireLogin={() => setAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* SUB-SYSTEM 3: RESEARCH & METHODOLOGY HUB */}
        {subsystem === "research" && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F17] p-3 md:p-6 text-slate-100">
            <ResearchMethodologyHub />
          </div>
        )}
      </main>

      {/* 3. NÚT TRỢ LÝ SƯ PHẠM SOCRATIC Ở GÓC DƯỚI BÊN PHẢI */}
      {!tutorOpen && (
        <button
          type="button"
          onClick={() => setTutorOpen(true)}
          className="fixed bottom-4 right-4 z-40 px-3.5 py-2 bg-slate-900/95 hover:bg-slate-850 text-slate-200 rounded-full shadow-xl border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
          title="Mở Trợ lý gợi mở Socratic"
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>Trợ lý Socratic</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* 4. SLIDE-OUT SOCRATIC AI TUTOR DRAWER */}
      <SocraticChatDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        messages={messages}
        busy={busy}
        error={error}
        input={input}
        onInputChange={setInput}
        onSendMessage={handleSendTutorMessage}
        sessionName={session?.name}
        stationId={stationId}
      />

      {/* 5. VISUALIZER MODAL */}
      {visualizerOpen && (
        <MathGraphVisualizer
          moduleId={moduleId}
          onClose={() => setVisualizerOpen(false)}
        />
      )}

      {/* 6. AUTH LOGIN / SIGNUP / EMAIL VERIFICATION MODAL */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
        >
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-4 text-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  MATHSTEP TÀI KHOẢN
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {authMode === "login"
                    ? "Đăng nhập tài khoản"
                    : authMode === "signup"
                    ? "Đăng ký tài khoản"
                    : "Xác thực hộp thư"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {authMode === "verify_email" ? (
              <div className="space-y-4 py-1 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-950/60 text-blue-400 border border-blue-800/80 flex items-center justify-center shadow-xs">
                  <Mail className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-base text-slate-100">
                    Yêu cầu Xác thực Email
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                    Một email chứa liên kết kích hoạt tài khoản đã được gửi đến:
                  </p>
                  <div className="font-mono font-bold text-xs text-blue-300 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800 inline-block max-w-full truncate">
                    {pendingVerificationEmail || loginEmail}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    Vui lòng mở hộp thư của bạn (kiểm tra cả thư mục <em>Spam / Thư rác</em>) và nhấn vào liên kết xác nhận để kích hoạt đầy đủ quyền truy cập.
                  </p>
                </div>

                {loginError && <p className="text-[11px] text-rose-400 font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">{loginError}</p>}
                {loginNotice && <p className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60">{loginNotice}</p>}

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={loginBusy || resendCooldown > 0}
                    onClick={handleResendVerificationEmail}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${loginBusy ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : "Gửi lại email xác thực"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setLoginError("");
                      setLoginNotice("Hãy đăng nhập sau khi em đã xác nhận qua liên kết trong email.");
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
                  >
                    Tôi đã xác thực xong → Đăng nhập
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={login} className="space-y-3 text-xs">
                  {authMode === "signup" && (
                    <div>
                      <label className="font-semibold block mb-1 text-slate-300">Họ và tên</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        placeholder="Nguyễn Văn A"
                        className="w-full p-2.5 border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  )}
                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="hocsinh@example.com"
                      className="w-full p-2.5 border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full p-2.5 pr-9 border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Math Captcha chống spam bot */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
                        <Calculator className="w-3.5 h-3.5 text-blue-400" />
                        <span>Captcha:</span>
                      </span>
                      <button
                        type="button"
                        onClick={loadCaptcha}
                        disabled={captchaLoading}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Đổi mã captcha khác"
                      >
                        <RefreshCw className={`w-3 h-3 ${captchaLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold text-xs text-blue-400 min-w-[90px] text-center select-none shadow-inner">
                        {captchaQuestion || (captchaLoading ? "..." : "12 + 15 = ?")}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Nhập đáp số"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        required
                        className="flex-1 p-2 border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 rounded-lg text-xs font-mono font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {loginError && <p className="text-[11px] text-rose-400 font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">{loginError}</p>}
                  {loginNotice && <p className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60">{loginNotice}</p>}

                  <button
                    type="submit"
                    disabled={loginBusy}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {loginBusy ? "Đang xử lý..." : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  </button>
                </form>

                {/* Phân cách HOẶC */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-2.5 text-slate-400 text-[11px] font-medium italic">
                      hoặc
                    </span>
                  </div>
                </div>

                {/* Nút Tiếp tục bằng Google */}
                <a
                  href="/api/auth/google"
                  className="w-full py-2.5 px-4 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-xs text-slate-200 bg-slate-950 hover:bg-slate-800 transition-all flex items-center justify-center gap-2.5 shadow-sm text-center"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Tiếp tục bằng Google</span>
                </a>

                <div className="pt-2 border-t border-slate-800 text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "signup" : "login");
                      setLoginError("");
                      setLoginNotice("");
                    }}
                    className="text-xs text-blue-400 font-semibold hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                  >
                    {authMode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                    >
                      Tiếp tục trải nghiệm mà không cần tài khoản
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 7. ACCOUNT & CUSTOM AI SETTINGS MODAL */}
      <AccountSettingsModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        initialTab={accountModalTab}
        currentSession={session}
        onProfileUpdated={(updatedName) => {
          setSession((prev) => (prev ? { ...prev, name: updatedName } : { authenticated: true, name: updatedName, email: null }));
        }}
        onRoleUpdated={(newRole) => {
          setSession((prev) => (prev ? { ...prev, role: newRole } : null));
        }}
        onAiConfigUpdated={(cfg) => {
          setCustomAiConfig(cfg);
        }}
      />

      {/* 8. CHAT HISTORY MODAL */}
      <ChatHistoryModal
        isOpen={chatHistoryOpen}
        onClose={() => setChatHistoryOpen(false)}
        session={session}
      />

      {/* 9. PRIVACY POLICY & TERMS MODAL */}
      {termsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setTermsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-semibold text-white text-base">Chính sách bảo mật & Điều khoản Sử dụng</h3>
              </div>
              <button 
                onClick={() => setTermsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-sm leading-relaxed text-slate-300">
              <section>
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">1.</span> Tuân thủ Chuẩn GDPT 2018
                </h4>
                <p className="text-slate-400 text-xs">
                  Nền tảng MathSTEP được xây dựng chuyên biệt nhằm phục vụ học sinh và giáo viên THPT (lớp 10, 11, 12). Mọi nội dung bài toán, trạm tương tác mô phỏng 2D/3D và phân tích phương pháp đều bám sát định hướng phát triển năng lực của Chương trình Giáo dục Phổ thông 2018.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-emerald-400">2.</span> Bảo vệ quyền riêng tư & dữ liệu người học
                </h4>
                <p className="text-slate-400 text-xs">
                  Hệ thống cam kết tuyệt đối <strong>không thương mại hóa hoặc chuyển giao</strong> thông tin học sinh, nhật ký hỏi đáp hay tiến độ bài tập cho bất kỳ bên thứ ba nào. Mật khẩu người dùng được bảo vệ bằng cơ chế băm mật mã chuẩn ngành.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-amber-400">3.</span> Bảo mật Khóa API cá nhân (BYOK)
                </h4>
                <p className="text-slate-400 text-xs">
                  Khi người dùng cấu hình khóa API riêng (Gemini / OpenAI / DeepSeek), khóa chỉ được lưu an toàn trong thiết bị cục bộ hoặc vault phiên được mã hóa, chỉ dùng để gọi trực tiếp các mô hình AI phục vụ học tập theo lệnh của người dùng.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-purple-400">4.</span> Quyền tự chủ dữ liệu & Sao lưu độc lập
                </h4>
                <p className="text-slate-400 text-xs">
                  Học sinh và giáo viên có toàn quyền kiểm soát dữ liệu: tra cứu lịch sử hội thoại, xóa dữ liệu đã lưu hoặc tải về toàn bộ tiến trình học tập dưới dạng tệp tin JSON độc lập bất cứ lúc nào trong bảng Cài đặt tài khoản.
                </p>
              </section>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setTermsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Tôi đã hiểu và Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-6 px-4 md:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center font-mono">
              m
            </span>
            <span className="text-slate-200 font-semibold">MathSTEP</span>
            <span className="text-slate-400">· Học bằng thao tác, hiểu bằng lập luận</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Chương trình GDPT 2018</span>
            <span>Toán 10 - 11 - 12</span>
            <span>Bộ SGK Kết nối tri thức</span>
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="text-slate-400 hover:text-blue-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Chính sách bảo mật & Điều khoản
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#082329] flex flex-col items-center justify-center text-teal-400 gap-3">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide">Đang nạp dữ liệu trạm học MathSTEP...</span>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
