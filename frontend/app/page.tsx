"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import MathGraphVisualizer from "./components/MathGraphVisualizer";
import MathStepWorkbench from "./components/MathStepWorkbench";
import TeacherDashboard from "./components/TeacherDashboard";
import ResearchMethodologyHub from "./components/ResearchMethodologyHub";
import AccountSettingsModal, { CustomAiConfig } from "./components/AccountSettingsModal";
import PlatformHeader from "./components/PlatformHeader";
import SocraticChatDrawer from "./components/SocraticChatDrawer";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";
import { getAllStations, removeVietnameseAccents, StationItem } from "./lib/stationCatalogData";
import { CORE_7_MODULES } from "./lib/modulesCatalogData";
import {
  Layers,
  Search,
  FlaskConical,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  SlidersHorizontal,
  CheckCircle2,
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

function StationCardArt({ grade, is3D, stationId }: { grade: number; is3D: boolean; stationId: string }) {
  const bgGrad = grade === 10 ? "#d5ede4" : grade === 11 ? "#d9e6f3" : "#e9e6d6";
  return (
    <svg viewBox="0 0 380 155" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${stationId}`} x2="1" y2="1">
          <stop stopColor={bgGrad} />
          <stop offset="1" stopColor="#f4f8f5" />
        </linearGradient>
      </defs>
      <rect width="380" height="155" fill={`url(#bg-${stationId})`} />
      <g stroke="#87aaa3" strokeWidth="1" opacity="0.22">
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={155} />
        ))}
        {[25, 55, 85, 115, 145].map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={380} y2={y} />
        ))}
      </g>
      {is3D ? (
        <g transform="translate(190, 80)">
          <path d="M-62 24L-4 55L65 24L5 -9Z" fill="#5bafa1" opacity="0.6" />
          <path d="M-62 24L0 -62L-4 55Z" fill="#16827d" opacity="0.75" />
          <path d="M-4 55L0 -62L65 24Z" fill="#95d8c0" opacity="0.85" />
          <path
            d="M0 -62L-62 24L-4 55L65 24Z M0 -62L-4 55"
            stroke="#12565d"
            fill="none"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g fill="none" stroke="#5d7e7f">
          <path d="M50 120H330M115 140V20" strokeWidth="1.5" />
          <path d="M65 35Q180 230 310 25" stroke="#087e7c" strokeWidth="3.5" />
          <path d="M80 125L300 35" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="225" cy="80" r="5" fill="#087e7c" />
        </g>
      )}
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

  const allStations = useMemo(() => getAllStations(), []);

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
          setSession({
            authenticated: true,
            name: userName,
            email: userEmail,
            email_verified: Boolean(data.email_verified ?? true),
            provider: data.provider || "email",
          });
        } else {
          setSession({ authenticated: false, name: null, email: null });
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
        setSession({
          authenticated: true,
          name: userName,
          email: userEmail,
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
        onSelectSubsystem={(sub, view = "home") => {
          setSubsystem(sub);
          setViewMode(view);
          if (view === "home") {
            syncUrl(null, null, sub === "student" ? null : sub);
          }
        }}
        session={session}
        sessionLoading={sessionLoading}
        customAiConfig={customAiConfig}
        onOpenAccountModal={(tab) => {
          setAccountModalTab(tab);
          setAccountModalOpen(true);
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
            <section className="bg-slate-950 text-slate-100 px-4 md:px-8 py-10 md:py-14 relative overflow-hidden border-b border-slate-800">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
                <div className="space-y-3.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 block">
                    Phòng học tương tác · Toán THPT Lớp 10 — 12
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.2] text-slate-100">
                    Chạm vào mô hình.<br />
                    <span className="italic font-serif text-blue-400 font-normal">Tự tìm ra quy luật.</span>
                  </h1>
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl font-sans">
                    Kéo một điểm. Xoay một góc nhìn. Thử một giả thuyết. Khám phá toán học bằng chính những điều em quan sát, kiểm chứng và tự đúc kết quy luật.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        const el = document.getElementById("modules-section");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                      <span>7 Module Thí Nghiệm Động ↓</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("catalog-section");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-200 font-medium text-xs border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>48 Trạm chuyên đề ↓</span>
                    </button>
                  </div>

                  {/* STATS ROW */}
                  <div className="flex items-center gap-6 pt-3 border-t border-slate-800/80">
                    <div>
                      <strong className="text-xl font-mono font-bold text-blue-400 block">7</strong>
                      <small className="text-[11px] text-slate-400 font-sans">module GeoGebra động</small>
                    </div>
                    <div>
                      <strong className="text-xl font-mono font-bold text-slate-100 block">48</strong>
                      <small className="text-[11px] text-slate-400 font-sans">trạm học tương tác</small>
                    </div>
                    <div>
                      <strong className="text-xl font-mono font-bold text-emerald-400 block">2D + 3D</strong>
                      <small className="text-[11px] text-slate-400 font-sans">mô phỏng 60fps</small>
                    </div>
                    <div>
                      <strong className="text-xl font-mono font-bold text-slate-100 block">Socratic</strong>
                      <small className="text-[11px] text-slate-400 font-sans">phương pháp gợi mở</small>
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

            {/* SECTION: 7 MODULE THÍ NGHIỆM TOÁN HỌC ĐỘNG (GEOGEBRA & DESMOS ENGINE) */}
            <section id="modules-section" className="max-w-6xl mx-auto px-4 md:px-8 space-y-4 pt-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Mô phỏng hình học &amp; giải tích tương tác
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
                    7 Phòng Thí Nghiệm Toán Học Tương Tác
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Mỗi module là một không gian tương tác bám sát chương trình GDPT 2018. Học sinh trực tiếp thao tác trên các tham số động, quan sát quỹ tích và kiểm chứng định lý theo tiến trình khám phá.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-md bg-slate-900 text-slate-300 text-xs border border-slate-800 flex items-center gap-1.5 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>7 Module chuẩn SGK</span>
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
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
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

              {/* Grid 7 Module Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoreModules.map((mod) => (
                  <article
                    key={mod.id}
                    className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all duration-150 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Visual SVG Card Art */}
                      <Link href={`/modules/${mod.id}`} className="block h-36 relative overflow-hidden bg-slate-950 cursor-pointer">
                        <ModuleCardArt moduleId={mod.id} />
                        {/* Clean minimal Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="bg-slate-900/90 text-slate-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border border-slate-800">
                            Lớp {mod.grade}
                          </span>
                          <span className="bg-slate-900/80 text-blue-300 border border-slate-800 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            {mod.is3D ? "Không gian 3D" : "Mặt phẳng 2D"}
                          </span>
                        </div>
                      </Link>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-400">
                            {mod.tag}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm text-slate-100 leading-snug group-hover:text-blue-400 transition-colors">
                          <Link href={`/modules/${mod.id}`}>
                            {mod.title}
                          </Link>
                        </h3>

                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {mod.goal}
                        </p>

                        {/* Feature Highlights */}
                        <ul className="space-y-1 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300">
                          {mod.features.slice(0, 3).map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="truncate max-w-[170px]">{mod.source}</span>
                          <span className="text-blue-400 font-bold">Trạm {mod.defaultStationId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0">
                      <Link
                        href={`/modules/${mod.id}`}
                        className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-blue-500"
                      >
                        <span>Vào phòng thực hành Module {mod.moduleNumber}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 48 STATIONS CATALOG SECTION */}
            <section id="catalog-section" className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block">
                    CHỌN MỘT ĐIỀU EM MUỐN HIỂU
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mt-1">
                    Mỗi trạm, một hành trình khám phá mới.
                  </h2>
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

              {/* PHÂN VÙNG 1: CÁC TRẠM NGHIÊN CỨU TRỌNG TÂM (ĐÃ THẨM ĐỊNH TOÁN HỌC 100%) */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-slate-900/90 border border-slate-800 border-l-4 border-l-blue-500 rounded-r-xl rounded-l-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                        CHUYÊN ĐỀ NGHIÊN CỨU TRỌNG TÂM (ĐÃ THẨM ĐỊNH TOÁN HỌC & SƯ PHẠM 100%)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phục vụ báo cáo dự thi KHKT: Đầy đủ bối cảnh đề bài thực tế, ma trận số liệu và bảng điều khiển đồng bộ 100% với Canvas.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-xs rounded-md shrink-0">
                    5 Trạm Cốt Lõi Hoàn Hảo
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
                              {st.id} · Lớp {st.grade}
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
                              {st.badge || "Trọng tâm KHKT"}
                            </span>
                            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                              ✓ Đã kiểm chứng 100%
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
                          className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-blue-500"
                        >
                          <span>Vào phòng thực hành chuẩn</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* PHÂN VÙNG 2: KHUNG KIẾN TRÚC MỞ RỘNG (ĐANG HOÀN THIỆN THEO ĐỀ CƯƠNG) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-slate-900/50 border border-slate-800 border-l-4 border-l-slate-700 rounded-r-xl rounded-l-md">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                      <span>KHUNG KIẾN TRÚC MỞ RỘNG (LỘ TRÌNH ĐỀ CƯƠNG DÀI HẠN)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Nhóm tác giả cam kết liêm chính khoa học: Chỉ mở công khai các trạm đã được thẩm định toán học 100%. Các trạm dưới đây đang trong lộ trình chuẩn hóa dữ liệu thực nghiệm sư phạm.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-medium text-[11px] rounded-md border border-slate-700 shrink-0">
                    Lộ trình mở rộng
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
                            <span className="bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono border border-slate-800">
                              {st.id} · Lớp {st.grade}
                            </span>
                          </div>
                          <span className="absolute top-2.5 right-2.5 bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            Lộ trình mở rộng
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium text-slate-400">
                              Đang chuẩn hóa dữ liệu
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
                            alert("Trạm này đang trong giai đoạn chuẩn hóa dữ liệu thực nghiệm sư phạm theo lộ trình dài hạn của đề cương. Nhóm nghiên cứu chỉ mở công khai các trạm đã được kiểm chứng tính đúng toán học 100%. Kính mời thầy cô và các bạn trải nghiệm 5 Trạm Trọng tâm phía trên!");
                          }}
                          className="w-full py-1.5 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-lg font-medium text-xs border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Đang hoàn thiện theo đề cương</span>
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

        {/* SUB-SYSTEM 2: TEACHER DASHBOARD & PRESENTATION */}
        {subsystem === "teacher" && (
          <div className="flex-1 overflow-y-auto bg-[#0B0F17] p-3 md:p-6 text-slate-100">
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
          <div className="bg-[#fdfbf7] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#e8e2d8] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e8e2d8]">
              <div>
                <span className="text-[10px] font-bold text-[#c25e3e] uppercase tracking-wider font-sans">
                  MATHSTEP TÀI KHOẢN
                </span>
                <h3 className="text-base font-serif font-bold text-[#102026]">
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
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            {authMode === "verify_email" ? (
              <div className="space-y-4 py-1 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf2ee] text-[#c25e3e] border border-[#f5dacf] flex items-center justify-center shadow-xs">
                  <Mail className="w-7 h-7 text-[#c25e3e]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-base text-[#102026]">
                    Yêu cầu Xác thực Email
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                    Một email chứa liên kết kích hoạt tài khoản đã được gửi đến:
                  </p>
                  <div className="font-mono font-bold text-xs text-[#102026] bg-[#f2ece2] py-1.5 px-3 rounded-lg border border-[#ded5c7] inline-block max-w-full truncate">
                    {pendingVerificationEmail || loginEmail}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                    Vui lòng mở hộp thư của bạn (kiểm tra cả thư mục <em>Spam / Thư rác / Quảng cáo</em>) và nhấn vào liên kết xác nhận để kích hoạt đầy đủ quyền truy cập.
                  </p>
                </div>

                {loginError && <p className="text-[11px] text-red-600 font-medium">{loginError}</p>}
                {loginNotice && <p className="text-[11px] text-emerald-700 font-medium">{loginNotice}</p>}

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={loginBusy || resendCooldown > 0}
                    onClick={handleResendVerificationEmail}
                    className="w-full py-2.5 bg-[#c25e3e] hover:bg-[#a94c2d] disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                    className="w-full py-2 bg-white hover:bg-[#f6f2ea] text-[#102026] rounded-xl font-bold text-xs border border-[#e8e2d8] transition-colors cursor-pointer"
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
                      <label className="font-bold block mb-1 text-[#102026]">Họ và tên</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full p-2 border border-[#d8d0c2] bg-white text-[#102026] text-slate-900 placeholder:text-gray-400 rounded-lg text-xs outline-none focus:border-[#c25e3e]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="font-bold block mb-1 text-[#102026]">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full p-2 border border-[#d8d0c2] bg-white text-[#102026] text-slate-900 placeholder:text-gray-400 rounded-lg text-xs outline-none focus:border-[#c25e3e]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1 text-[#102026]">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full p-2 pr-9 border border-[#d8d0c2] bg-white text-[#102026] text-slate-900 placeholder:text-gray-400 rounded-lg text-xs outline-none focus:border-[#c25e3e]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Math Captcha chống spam bot */}
                  <div className="p-2.5 bg-[#f6f2ea] rounded-xl border border-[#e8e2d8] space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#52483e]">
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <Calculator className="w-3.5 h-3.5 text-[#c25e3e]" />
                        <span>Captcha:</span>
                      </span>
                      <button
                        type="button"
                        onClick={loadCaptcha}
                        disabled={captchaLoading}
                        className="p-1 hover:bg-[#e8e2d8] rounded text-gray-500 hover:text-black transition-colors cursor-pointer"
                        title="Đổi mã captcha khác"
                      >
                        <RefreshCw className={`w-3 h-3 ${captchaLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-white border border-[#d8d0c2] rounded-lg font-mono font-bold text-xs text-[#c25e3e] min-w-[90px] text-center select-none shadow-xs">
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
                        className="flex-1 p-2 border border-[#d8d0c2] bg-white text-[#102026] text-slate-900 placeholder:text-gray-400 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#c25e3e]"
                      />
                    </div>
                  </div>

                  {loginError && <p className="text-[11px] text-red-600 font-medium">{loginError}</p>}
                  {loginNotice && <p className="text-[11px] text-emerald-700 font-medium">{loginNotice}</p>}

                  <button
                    type="submit"
                    disabled={loginBusy}
                    className="w-full py-2.5 bg-[#c25e3e] hover:bg-[#a94c2d] text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {loginBusy ? "Đang xử lý..." : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  </button>
                </form>

                {/* Phân cách HOẶC */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e8e2d8]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#fdfbf7] px-2.5 text-gray-400 text-[11px] font-medium font-serif italic">
                      hoặc
                    </span>
                  </div>
                </div>

                {/* Nút Tiếp tục bằng Google */}
                <a
                  href="/api/auth/google"
                  className="w-full py-2.5 px-4 border border-[#d8d0c2] hover:border-gray-400 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2.5 shadow-xs text-center"
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

                <div className="pt-2 border-t border-[#e8e2d8] text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "signup" : "login");
                      setLoginError("");
                      setLoginNotice("");
                    }}
                    className="text-xs text-[#c25e3e] font-bold hover:underline cursor-pointer"
                  >
                    {authMode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(false)}
                      className="text-[11px] text-gray-500 hover:text-black cursor-pointer"
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
        onAiConfigUpdated={(cfg) => {
          setCustomAiConfig(cfg);
        }}
      />

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
