"use client";

import { useMemo, useState } from "react";
import KatexMath from "../KatexMath";

type ToolTab = "solutions" | "inequality" | "identities";
const C = 150;
const R = 82;
const point = (angle: number, radius = R) => ({ x: C + radius * Math.cos(angle), y: C - radius * Math.sin(angle) });
const arcPath = (start: number, end: number, radius = R) => {
  const steps = Math.max(2, Math.ceil(Math.abs(end - start) * 25));
  return Array.from({ length: steps + 1 }, (_, i) => point(start + ((end - start) * i) / steps, radius)).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
};

export default function TrigonometryPracticeTools() {
  const [tab, setTab] = useState<ToolTab>("solutions");
  const [level, setLevel] = useState(0.5);
  const [k, setK] = useState(0);
  const [angleA, setAngleA] = useState(35);
  const [angleB, setAngleB] = useState(70);
  const [identity, setIdentity] = useState<"cos-sum" | "sin-sum" | "double-sin">("cos-sum");
  const [inequalityFunction, setInequalityFunction] = useState<"sin" | "cos">("sin");

  const alpha = Math.asin(Math.max(-1, Math.min(1, level)));
  const roots = useMemo(() => [((alpha % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), ((Math.PI - alpha) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)], [alpha]);
  const va = (angleA * Math.PI) / 180;
  const vb = (angleB * Math.PI) / 180;
  const sides = identity === "cos-sum"
    ? [Math.cos(va + vb), Math.cos(va) * Math.cos(vb) - Math.sin(va) * Math.sin(vb)]
    : identity === "sin-sum"
      ? [Math.sin(va + vb), Math.sin(va) * Math.cos(vb) + Math.cos(va) * Math.sin(vb)]
      : [Math.sin(2 * va), 2 * Math.sin(va) * Math.cos(va)];
  const formula = identity === "cos-sum" ? "\\cos(a+b)=\\cos a\\cos b-\\sin a\\sin b" : identity === "sin-sum" ? "\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b" : "\\sin 2a=2\\sin a\\cos a";
  const pointA = point(roots[0]);
  const pointB = point(roots[1]);
  const beta = Math.acos(Math.max(-1, Math.min(1, level)));
  const positiveArcs = level < 1 ? (inequalityFunction === "sin" ? [[alpha, Math.PI - alpha]] : [[-beta, beta]]) : [];

  const tabs: [ToolTab, string][] = [["solutions", "Họ nghiệm"], ["inequality", "Bất phương trình"], ["identities", "Kiểm chứng công thức"]];
  return <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <header><h3 className="text-lg font-bold text-slate-900">Thực hành phương trình và công thức lượng giác</h3><p className="mt-1 text-sm text-slate-600">Thay đổi dữ kiện để quan sát nghiệm trên đường tròn hoặc đối chiếu hai vế.</p></header>
    <nav className="mt-3 flex flex-wrap gap-2" aria-label="Công cụ lượng giác">{tabs.map(([id, label]) => <button type="button" key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`min-h-10 rounded-lg px-3 text-sm font-bold ${tab === id ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}>{label}</button>)}</nav>

    {tab !== "identities" ? <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
      <svg viewBox="0 0 300 300" role="img" aria-label={tab === "solutions" ? "Các nghiệm trên đường tròn lượng giác" : "Cung nghiệm của bất phương trình lượng giác"} className="w-full max-w-[300px] rounded-xl bg-slate-50">
        <line x1="35" y1={C} x2="265" y2={C} stroke="#64748b" /><line x1={C} y1="35" x2={C} y2="265" stroke="#64748b" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="#334155" strokeWidth="2" />
        {tab === "inequality" && positiveArcs.map(([start, end]) => <path key={start} d={arcPath(start, end, R)} fill="none" stroke="#16a34a" strokeWidth="12" strokeLinecap="round" />)}
        {tab === "solutions" && <>
          <path d={`M${C},${C} L${pointA.x},${pointA.y} M${C},${C} L${pointB.x},${pointB.y}`} stroke="#0f766e" strokeWidth="2" />
          <circle cx={pointA.x} cy={pointA.y} r="7" fill="#dc2626"/><circle cx={pointB.x} cy={pointB.y} r="7" fill="#2563eb"/>
          <text x={pointA.x + 8} y={pointA.y - 6} fontSize="12" fill="#991b1b" fontWeight="700">M₁</text><text x={pointB.x + 8} y={pointB.y - 6} fontSize="12" fill="#1e40af" fontWeight="700">M₂</text>
        </>}
        {tab === "inequality" && <><line x1={inequalityFunction === "sin" ? 50 : C + R * level} y1={inequalityFunction === "sin" ? C - R * level : 50} x2={inequalityFunction === "sin" ? 250 : C + R * level} y2={inequalityFunction === "sin" ? C - R * level : 250} stroke="#ea580c" strokeDasharray="5 4"/><circle cx={pointA.x} cy={pointA.y} r="5" fill="#dc2626"/><circle cx={pointB.x} cy={pointB.y} r="5" fill="#dc2626"/></>}
        <text x="260" y={C - 6} fontSize="12" fill="#334155">cos x</text><text x={C + 6} y="42" fontSize="12" fill="#334155">sin x</text>
      </svg>
      <div className="space-y-3">
        {tab === "solutions" ? <>
          <div className="rounded-xl bg-slate-50 p-3"><KatexMath display math={`\\sin x = ${level.toFixed(2)}`} /><p className="text-sm text-slate-700">Hai điểm đỏ và xanh là hai vị trí nghiệm trong một vòng. Thay đổi k để cộng hoặc trừ số vòng quay, điểm biểu diễn không đổi.</p></div>
          <label className="block text-sm font-semibold">Số nguyên k = {k}<input aria-label="Số vòng quay k" className="mt-2 w-full accent-teal-700" type="range" min="-2" max="2" step="1" value={k} onChange={(e) => setK(Number(e.target.value))} /></label>
          <div className="grid gap-2 sm:grid-cols-2 text-sm"><p className="rounded-lg bg-red-50 p-2"><KatexMath math={`x_1 \\approx ${((roots[0] + 2 * Math.PI * k) * 180 / Math.PI).toFixed(1)}^\\circ`} /></p><p className="rounded-lg bg-blue-50 p-2"><KatexMath math={`x_2 \\approx ${((roots[1] + 2 * Math.PI * k) * 180 / Math.PI).toFixed(1)}^\\circ`} /></p></div>
          <KatexMath display math="x=\\arcsin(c)+2k\\pi \\quad\\text{hoặc}\\quad x=\\pi-\\arcsin(c)+2k\\pi,\ k\\in\\mathbb Z" />
        </> : <>
          <div className="rounded-xl bg-green-50 p-3"><div className="mb-2 flex gap-2"><button type="button" onClick={() => setInequalityFunction("sin")} className={`rounded px-2 py-1 text-xs font-bold ${inequalityFunction === "sin" ? "bg-emerald-800 text-white" : "bg-white text-slate-800"}`}>sin x</button><button type="button" onClick={() => setInequalityFunction("cos")} className={`rounded px-2 py-1 text-xs font-bold ${inequalityFunction === "cos" ? "bg-emerald-800 text-white" : "bg-white text-slate-800"}`}>cos x</button></div><KatexMath display math={`\\${inequalityFunction} x > ${level.toFixed(2)}`} /><p className="mt-2 text-sm text-slate-700">Cung xanh biểu diễn phần đường tròn thỏa bất phương trình trong một chu kỳ.</p></div>
          <label className="block text-sm font-semibold">Mức c = {level.toFixed(2)}<input aria-label="Mức c trong bất phương trình sin x lớn hơn c" className="mt-2 w-full accent-green-700" type="range" min="-1" max="1" step="0.01" value={level} onChange={(e) => setLevel(Number(e.target.value))} /></label>
          {level >= 1 ? <p className="text-sm font-semibold text-slate-700">Vô nghiệm vì giá trị hàm không vượt quá 1.</p> : <KatexMath display math={inequalityFunction === "sin" ? `\\arcsin(${level.toFixed(2)})+2k\\pi < x < \\pi-\\arcsin(${level.toFixed(2)})+2k\\pi,\\quad k\\in\\mathbb Z` : `-\\arccos(${level.toFixed(2)})+2k\\pi < x < \\arccos(${level.toFixed(2)})+2k\\pi,\\quad k\\in\\mathbb Z`} />}
          <p className="text-xs text-slate-500">Đường cam là mức {inequalityFunction} x = c; cung xanh biểu diễn miền nghiệm.</p>
        </>}
      </div>
    </div> : <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="space-y-3"><label className="block text-sm font-semibold">Chọn công thức<select className="mt-1 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3" value={identity} onChange={(e) => setIdentity(e.target.value as typeof identity)}><option value="cos-sum">Công thức côsin của tổng</option><option value="sin-sum">Công thức sin của tổng</option><option value="double-sin">Công thức sin góc đôi</option></select></label>
        {identity !== "double-sin" && <label className="block text-sm font-semibold">Góc b = {angleB}°<input className="mt-2 w-full accent-indigo-700" type="range" min="-360" max="360" value={angleB} onChange={(e) => setAngleB(Number(e.target.value))} /></label>}
        <label className="block text-sm font-semibold">Góc a = {angleA}°<input className="mt-2 w-full accent-indigo-700" type="range" min="-360" max="360" value={angleA} onChange={(e) => setAngleA(Number(e.target.value))} /></label></div>
      <div className="rounded-xl bg-indigo-50 p-4"><KatexMath display math={formula} /><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-lg bg-white p-3"><p className="text-xs font-semibold text-slate-600">Vế trái</p><strong className="text-lg">{sides[0].toFixed(6)}</strong></div><div className="rounded-lg bg-white p-3"><p className="text-xs font-semibold text-slate-600">Vế phải</p><strong className="text-lg">{sides[1].toFixed(6)}</strong></div></div><p className={`mt-3 text-sm font-bold ${Math.abs(sides[0] - sides[1]) < 1e-10 ? "text-emerald-800" : "text-red-800"}`}>{Math.abs(sides[0] - sides[1]) < 1e-10 ? "Hai vế bằng nhau với giá trị góc đang chọn." : "Hai vế chưa bằng nhau; hãy kiểm tra lại phép tính."}</p><p className="mt-1 text-xs text-slate-600">Đổi a và b để kiểm chứng thêm. Việc thử nhiều giá trị minh họa công thức, không thay cho chứng minh.</p></div>
    </div>}
  </section>;
}
