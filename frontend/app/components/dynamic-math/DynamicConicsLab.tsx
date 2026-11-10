"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SlidersHorizontal,
  Box,
  Compass,
  Share2,
} from "lucide-react";
import KatexMath from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";

type ConicSubTab = "coneCut" | "unfolding3d";
type ConicCode = "circle" | "ellipse" | "parabola" | "hyperbola";
const CONIC_CHALLENGES: { code: ConicCode; label: string }[] = [
  { code: "parabola", label: "Parabol" },
  { code: "ellipse", label: "Elip" },
  { code: "hyperbola", label: "Hypebol" },
  { code: "circle", label: "Đường tròn" },
];
const CONIC_PROGRESS_KEY = "mathstep:conic-challenges:v1";
const formatPlain = (value: number) => value.toFixed(2).replace(".", ",");

export default function DynamicConicsLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [activeTab, setActiveTab] = useState<ConicSubTab>("coneCut");
  const [challenge, setChallenge] = useState<ConicCode>("parabola");
  const [completedChallenges, setCompletedChallenges] = useState<ConicCode[]>([]);
  const [challengeFeedback, setChallengeFeedback] = useState<"correct" | "retry" | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONIC_PROGRESS_KEY) || "[]") as unknown;
      if (Array.isArray(saved)) setCompletedChallenges(saved.filter((value): value is ConicCode =>
        CONIC_CHALLENGES.some((item) => item.code === value)));
    } catch { /* Progress remains usable for this session. */ }
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (!query.has("beta") && !query.has("alpha")) return;
    const frame = window.requestAnimationFrame(() => {
      useDynamicMathStore.getState().setActiveModule("conics_and_solids");
      for (const [queryKey, paramKey, min, max] of [["beta", "coneBeta", 10, 90], ["alpha", "coneAlpha", 20, 45]] as const) {
        if (!query.has(queryKey)) continue;
        const value = Number(query.get(queryKey));
        if (Number.isInteger(value) && value >= min && value <= max) useDynamicMathStore.getState().setParamVal(paramKey, value);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Parameters from store
  const coneBeta = Math.round(params.coneBeta?.val ?? 55);
  const coneAlpha = Math.round(params.coneAlpha?.val ?? 30);
  const foldPercent = Math.round(params.foldPercent?.val ?? 100);
  const ellipseTheta = Math.round(params.ellipseTheta?.val ?? 45);

  // Conic classification based on beta vs alpha
  const conicType = useMemo(() => {
    if (coneBeta === 90) return { name: "Đường tròn (Circle)", ecc: 0, code: "circle" };
    if (coneBeta > coneAlpha) return { name: "Đường Elip (Ellipse)", ecc: 0.65, code: "ellipse" };
    if (coneBeta === coneAlpha) return { name: "Đường Parabol (Parabola)", ecc: 1.0, code: "parabola" };
    return { name: "Đường Hypebol 2 nhánh (Hyperbola)", ecc: 1.45, code: "hyperbola" };
  }, [coneBeta, coneAlpha]);
  useEffect(() => setChallengeFeedback(null), [coneBeta, coneAlpha]);
  const showClassification = challengeFeedback === "correct" && conicType.code === challenge;

  const checkChallenge = () => {
    if (conicType.code !== challenge) {
      setChallengeFeedback("retry");
      return;
    }
    setChallengeFeedback("correct");
    try {
      const AudioContextClass = window.AudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        for (const [index, frequency] of [660, 880].entries()) {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const start = audioContext.currentTime + index * 0.1;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
          oscillator.connect(gain).connect(audioContext.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.12);
        }
        window.setTimeout(() => { void audioContext.close(); }, 400);
      }
    } catch { /* Visual feedback remains available when audio is blocked. */ }
    const next = [...new Set([...completedChallenges, challenge])];
    setCompletedChallenges(next);
    try { localStorage.setItem(CONIC_PROGRESS_KEY, JSON.stringify(next)); } catch {}
  };

  const shareView = async () => {
    const url = new URL("/modules/conics_and_solids", window.location.origin);
    url.searchParams.set("beta", String(coneBeta));
    url.searchParams.set("alpha", String(coneAlpha));
    setShareUrl(url.toString());
    try { await navigator.clipboard.writeText(url.toString()); } catch { /* The visible link remains selectable. */ }
  };

  // Point M on 2D Ellipse
  const radTheta = (ellipseTheta * Math.PI) / 180;
  const a = 4.0;
  const b = 2.67;
  const c = Math.sqrt(Math.max(0, a * a - b * b)); // ~2.98
  const mX = a * Math.cos(radTheta);
  const mY = b * Math.sin(radTheta);
  const d1 = Math.hypot(mX - (-c), mY - 0);
  const d2 = Math.hypot(mX - c, mY - 0);

  // 3D Unfolding: Fold angle in radians
  const foldAngleRad = ((100 - foldPercent) / 100) * (Math.PI / 2.3);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Trực quan 3D Mặt nón cắt hoặc Khai triển phẳng đa diện */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Header Tab Switcher */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {activeTab === "coneCut"
                ? `Mặt phẳng cắt mặt nón tròn xoay (β = ${coneBeta}°, α = ${coneAlpha}°)`
                : `Sơ đồ khai triển hình chóp (Độ gập: ${foldPercent}%)`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              KNTT Chuyên đề 10 & 11
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("coneCut")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "coneCut" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Cắt mặt nón Conic</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unfolding3d")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                activeTab === "unfolding3d" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Sơ đồ khai triển</span>
            </button>
          </div>
        </div>

        {/* 1. KHUNG 3D MẶT NÓN CẮT CONIC */}
        {activeTab === "coneCut" ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] flex justify-center p-2">
            <svg viewBox="0 0 460 340" className="w-full max-w-[460px] h-auto select-none">
              {/* Trục đối xứng mặt nón */}
              <line x1="230" y1="20" x2="230" y2="320" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />

              {/* Nón trên (Đỉnh O tại 230, 170) */}
              <polygon points="230,170 130,40 330,40" fill="#ccfbf1" fillOpacity="0.4" stroke="#0d9488" strokeWidth="1.5" />
              <ellipse cx="230" cy="40" rx="100" ry="20" fill="#99f6e4" fillOpacity="0.5" stroke="#0d9488" strokeWidth="1.5" />

              {/* Nón dưới */}
              <polygon points="230,170 130,300 330,300" fill="#ccfbf1" fillOpacity="0.4" stroke="#0d9488" strokeWidth="1.5" />
              <ellipse cx="230" cy="300" rx="100" ry="20" fill="#99f6e4" fillOpacity="0.5" stroke="#0d9488" strokeWidth="1.5" />

              {/* Đỉnh nón O */}
              <circle cx="230" cy="170" r="4.5" fill="#1e293b" />
              <text x="238" y="174" fontSize="11" fill="#1e293b" fontWeight="bold">
                O (Đỉnh nón)
              </text>

              {/* Mặt phẳng cắt nghiêng góc coneBeta so với trục nón */}
              {(() => {
                const rad = (coneBeta * Math.PI) / 180;
                const len = 135;
                const dx = len * Math.sin(rad);
                const dy = len * Math.cos(rad);
                const cx = 230;
                const cy = 110; // Cắt ở tầng nón trên

                return (
                  <g style={showClassification ? { filter: "drop-shadow(0 0 5px #fbbf24)" } : undefined}>
                    {/* Mặt phẳng cắt (Đỏ) */}
                    <line
                      x1={cx - dx}
                      y1={cy + dy}
                      x2={cx + dx}
                      y2={cy - dy}
                      stroke="#dc2626"
                      strokeWidth="3.2"
                    />

                    {/* Tiết diện conic sinh ra */}
                    {coneBeta === 90 ? (
                      <circle cx={cx} cy={cy} r="36" fill="#fca5a5" fillOpacity="0.65" stroke="#b91c1c" strokeWidth="2.2" />
                    ) : coneBeta > coneAlpha ? (
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx="40"
                        ry={16 + (coneBeta - coneAlpha) * 0.45}
                        fill="#fca5a5"
                        fillOpacity="0.65"
                        stroke="#b91c1c"
                        strokeWidth="2.2"
                        transform={`rotate(${90 - coneBeta} ${cx} ${cy})`}
                      />
                    ) : coneBeta === coneAlpha ? (
                      <path
                        d={`M ${cx - 35} ${cy + 55} Q ${cx} ${cy - 10} ${cx + 35} ${cy + 55}`}
                        fill="none"
                        stroke="#b91c1c"
                        strokeWidth="2.8"
                      />
                    ) : (
                      <g fill="none" stroke="#b91c1c" strokeWidth="2.8">
                        <path d={`M ${cx - 55} ${cy - 36} Q ${cx - 10} ${cy - 10} ${cx - 55} ${cy + 36}`} />
                        <path d={`M ${cx + 55} ${cy - 36} Q ${cx + 10} ${cy - 10} ${cx + 55} ${cy + 36}`} />
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
        ) : (
          /* 2. KHUNG KHAI TRIỂN PHẲNG ĐA DIỆN 3D */
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfdfc] flex justify-center p-3">
            <svg viewBox="0 0 460 340" className="w-full max-w-[460px] h-auto select-none">
              {/* Đáy hình vuông tâm (230, 170) kích thước 100x100 */}
              <polygon
                points="180,120 280,120 280,220 180,220"
                fill="#ccfbf1"
                fillOpacity="0.7"
                stroke="#0f766e"
                strokeWidth="2"
              />
              <text x="230" y="174" fontSize="11" fill="#0f766e" textAnchor="middle" fontWeight="bold">
                Mặt Đáy
              </text>

              {/* 4 cánh tam giác mở ra xung quanh đáy theo foldAngleRad */}
              {(() => {
                const hSide = 85 * Math.cos(foldAngleRad);
                return (
                  <g>
                    {/* Cánh trên (Bắc) */}
                    <polygon
                      points={`180,120 280,120 230,${120 - hSide}`}
                      fill="#99f6e4"
                      fillOpacity="0.5"
                      stroke="#0d9488"
                      strokeWidth="1.8"
                    />
                    {/* Cánh dưới (Nam) */}
                    <polygon
                      points={`180,220 280,220 230,${220 + hSide}`}
                      fill="#99f6e4"
                      fillOpacity="0.5"
                      stroke="#0d9488"
                      strokeWidth="1.8"
                    />
                    {/* Cánh trái (Tây) */}
                    <polygon
                      points={`180,120 180,220 ${180 - hSide},170`}
                      fill="#99f6e4"
                      fillOpacity="0.5"
                      stroke="#0d9488"
                      strokeWidth="1.8"
                    />
                    {/* Cánh phải (Đông) */}
                    <polygon
                      points={`280,120 280,220 ${280 + hSide},170`}
                      fill="#99f6e4"
                      fillOpacity="0.5"
                      stroke="#0d9488"
                      strokeWidth="1.8"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>
        )}

        {/* Thanh trượt tham số góc beta hoặc độ gập foldPercent */}
        <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          {activeTab === "coneCut" ? (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                  <span>Góc nghiêng mặt phẳng cắt (β):</span>
                </span>
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  β = {coneBeta}°
                </span>
              </div>
              <input
                type="range"
                aria-label="Góc nghiêng mặt phẳng cắt β"
                min={10}
                max={90}
                step={1}
                value={coneBeta}
                onChange={(e) => setParamVal("coneBeta", parseInt(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10° (Hypebol β &lt; α)</span>
                <span>{coneAlpha}° (Parabol β = α)</span>
                <span>90° (Đường tròn β = 90°)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Góc thường dùng">
                {[20, 30, 45, 60, 90].map((angle) => <button key={angle} type="button"
                  onClick={() => { setParamVal("coneBeta", angle); setChallengeFeedback(null); }}
                  className={`min-h-8 rounded-lg border px-2.5 text-[11px] font-semibold ${coneBeta === angle ? "border-rose-500 bg-rose-100 text-rose-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
                  {angle}°
                </button>)}
                <button type="button" onClick={() => { setParamVal("coneBeta", coneAlpha); setChallengeFeedback(null); }}
                  className="min-h-8 rounded-lg border border-emerald-300 bg-white px-2.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50">
                  β = α ({coneAlpha}°)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Độ gập mô hình đa diện:</span>
                </span>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  {foldPercent}% {foldPercent === 100 ? "(Sơ đồ gấp)" : foldPercent === 0 ? "(Sơ đồ trải phẳng)" : ""}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={foldPercent}
                onChange={(e) => setParamVal("foldPercent", parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Trải phẳng ra mặt sàn)</span>
                <span className="text-blue-700 font-semibold">Kéo để quan sát gập các mặt thành khối 3D</span>
                <span>100% (Sơ đồ gấp)</span>
              </div>
            </>
          )}
        </div>
        {activeTab === "coneCut" && <div className="w-full mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <strong className="text-emerald-950">Nhiệm vụ: tạo thiết diện bằng cách chỉnh β</strong>
            <span className="text-emerald-800 font-semibold">{completedChallenges.length}/4 hoàn thành</span>
          </div>
          <div className="flex flex-wrap gap-1.5" aria-label="Chọn thiết diện cần tạo">
            {CONIC_CHALLENGES.map((item) => <button key={item.code} type="button"
              onClick={() => { setChallenge(item.code); setChallengeFeedback(null); }}
              className={`min-h-9 rounded-lg border px-3 font-semibold ${challenge === item.code ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-white text-emerald-900"}`}>
              {completedChallenges.includes(item.code) ? "✓ " : ""}{item.label}
            </button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={checkChallenge} className="min-h-9 rounded-lg bg-slate-900 px-3 font-bold text-white hover:bg-slate-700">Kiểm tra góc β</button>
            <button type="button" onClick={() => void shareView()} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 font-semibold text-emerald-900 hover:bg-emerald-100"><Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Chia sẻ góc</button>
            <span role="status" className={challengeFeedback === "correct" ? "font-semibold text-emerald-800" : "text-rose-800"}>
              {challengeFeedback === "correct" ? "Chính xác! Em đã tạo đúng thiết diện." : challengeFeedback === "retry" ? "Chưa đúng. Hãy so sánh β với α rồi thử lại." : "Chọn hình cần tạo, chỉnh β và tự kiểm tra."}
            </span>
          </div>
          {shareUrl && <input aria-label="Liên kết chia sẻ góc cắt" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="w-full rounded-lg border border-emerald-300 bg-white px-2 py-1.5 text-[10px] text-emerald-950" />}
        </div>}
      </div>

      {/* Cột phải: Khung 2D đồng bộ Conic & Định lý SGK */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Khung 2D đồng bộ đường Conic */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">
            Hình chiếu của thiết diện {showClassification ? `— ${conicType.name}` : "— em hãy dự đoán tên đường"}
          </span>

          <div className="relative w-full h-44 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
            <svg viewBox="0 0 260 160" className="w-full h-full select-none">
              {/* Trục Oxy */}
              <line x1="10" y1="80" x2="250" y2="80" stroke="#94a3b8" strokeWidth="1" />
              <line x1="130" y1="10" x2="130" y2="150" stroke="#94a3b8" strokeWidth="1" />

              {conicType.code === "circle" && <>
                <circle cx="130" cy="80" r="55" fill="#ccfbf1" fillOpacity="0.35" stroke="#0f766e" strokeWidth="2" />
                <circle cx="130" cy="80" r="3.5" fill="#1d4ed8" />
                <text x="137" y="76" fontSize="10" fill="#1d4ed8" fontWeight="bold">O</text>
              </>}
              {conicType.code === "parabola" && <>
                <line x1="20" y1="45" x2="240" y2="45" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="21" y="40" fontSize="9" fill="#7c3aed" fontWeight="bold">Đường chuẩn</text>
                <path d="M55 154 Q130 -34 205 154" fill="none" stroke="#0f766e" strokeWidth="2.5" />
                <circle cx="130" cy="75" r="3.5" fill="#2563eb" />
                <text x="137" y="77" fontSize="10" fill="#2563eb" fontWeight="bold">F</text>
              </>}
              {conicType.code === "hyperbola" && <>
                <path d="M28 14 C96 42 96 118 28 146 M232 14 C164 42 164 118 232 146" fill="none" stroke="#0f766e" strokeWidth="2.5" />
                <circle cx="52" cy="80" r="3.5" fill="#2563eb" />
                <text x="39" y="95" fontSize="9" fill="#2563eb" fontWeight="bold">F₁</text>
                <circle cx="208" cy="80" r="3.5" fill="#2563eb" />
                <text x="203" y="95" fontSize="9" fill="#2563eb" fontWeight="bold">F₂</text>
              </>}
              {conicType.code === "ellipse" && <>
                <ellipse cx="130" cy="80" rx="90" ry="60" fill="#ccfbf1" fillOpacity="0.4" stroke="#0f766e" strokeWidth="2" />
                <circle cx={130 - 67} cy="80" r="3.5" fill="#2563eb" />
                <text x={130 - 73} y="95" fontSize="9" fill="#2563eb" fontWeight="bold">F₁</text>
                <circle cx={130 + 67} cy="80" r="3.5" fill="#2563eb" />
                <text x={130 + 63} y="95" fontSize="9" fill="#2563eb" fontWeight="bold">F₂</text>
                {(() => {
                const mx = 130 + 90 * Math.cos(radTheta);
                const my = 80 - 60 * Math.sin(radTheta);
                return (
                  <g>
                    <line x1={130 - 67} y1="80" x2={mx} y2={my} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="2 2" />
                    <line x1={130 + 67} y1="80" x2={mx} y2={my} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="2 2" />
                    <circle cx={mx} cy={my} r="4.5" fill="#dc2626" />
                    <text x={mx + 6} y={my - 4} fontSize="9" fill="#dc2626" fontWeight="bold">
                      M
                    </text>
                  </g>
                );
                })()}
              </>}
            </svg>
          </div>

          {/* Đẳng thức định nghĩa MF1 + MF2 = 2a */}
          {conicType.code === "ellipse" && <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
            <span className="font-bold block">Định nghĩa Elip (SGK Toán 10):</span>
            <p className="font-mono text-[11px]">
              MF₁ + MF₂ = {formatPlain(d1)} + {formatPlain(d2)} ≈ <strong>{formatPlain(2 * a)}</strong> (Không đổi = 2a)
            </p>
          </div>}
        </div>

        {/* Phân loại Conic theo góc nghiêng beta */}
        <details className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 text-xs text-slate-600">
          <summary className="font-bold text-slate-800 cursor-pointer">Xem lại quy tắc phân loại sau khi tự thử</summary>
          <p>• <strong>β = 90°:</strong> Tiết diện là Đường tròn (Tâm sai e = 0).</p>
          <p>• <strong>β &gt; α:</strong> Tiết diện là Đường Elip kín (0 &lt; e &lt; 1).</p>
          <p>• <strong>β = α:</strong> Tiết diện là Đường Parabol (e = 1).</p>
          <p>• <strong>β &lt; α:</strong> Tiết diện là Đường Hypebol 2 nhánh (e &gt; 1).</p>
        </details>
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-sm">
          <strong className="text-slate-900">Công thức liên hệ với hình chiếu</strong>
          {showClassification ? <>
            <KatexMath display math={{
              circle: "x^2+y^2=R^2",
              ellipse: "\\frac{x^2}{16}+\\frac{y^2}{7{,}1289}=1",
              parabola: "x^2=4py,\\quad p>0",
              hyperbola: "\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1",
            }[conicType.code as ConicCode]} />
            {conicType.code === "ellipse" && <p>Điểm M đang ở khoảng ({formatPlain(mX)}; {formatPlain(mY)}). Tổng MF₁ + MF₂ = {formatPlain(d1 + d2)}.</p>}
            <p className="text-slate-500">Hình là sơ đồ minh họa; chỉ số của elip thuộc ví dụ 2D, không suy ra trực tiếp từ β.</p>
          </> : <p className="mt-1 text-slate-500">Tự tạo đúng thiết diện và bấm kiểm tra để mở công thức tương ứng.</p>}
        </div>
      </div>
    </div>
  );
}
