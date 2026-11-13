"use client";

import { useMemo, useState } from "react";
import { Maximize2, Volume2, Lightbulb, X, ArrowRight, ChevronDown, CheckCircle2, Sparkles } from "lucide-react";
import type { DetailedLessonContent } from "@/app/types/learningPath";
import type { ChatMessage } from "@/app/components/SocraticChatDrawer";
import { MathFormattedText } from "@/app/components/KatexMath";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import SocraticChatDrawer from "@/app/components/SocraticChatDrawer";

type Props = {
  content: DetailedLessonContent;
  panel: React.ReactNode;
  stage: string;
  onAdvance: () => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message?: string) => void;
  busy: boolean;
  error: string;
  ratio?: number;
  onRatioChange?: (value: number) => void;
};

const stageTitles = ["Mô phỏng", "Câu hỏi gợi mở", "Bài kiểm tra"];

export default function GuidedLessonWorkspace({ content, panel, stage, onAdvance, messages, input, onInputChange, onSendMessage, busy, error, ratio, onRatioChange }: Props) {
  const [hintLevel, setHintLevel] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [localStep, setLocalStep] = useState(0);
  const steps = content.workedExample.steps;
  const step = steps[Math.min(localStep, Math.max(0, steps.length - 1))];
  const hintText = useMemo(() => [
    content.theory.miniTip,
    content.theory.formulas[0]?.formula ?? content.theory.coreConcept,
    step?.explanation ?? content.workedExample.conclusion,
  ][Math.max(0, hintLevel - 1)] ?? "", [content, hintLevel, step]);
  const activeStepNumber = stage === "questions" ? 2 : stage === "test" ? 3 : 1;
  const currentTitle = stageTitles[activeStepNumber - 1];
  const spatialRatioMatches = ratio !== undefined && Math.abs(ratio - 0.5) < 0.005;
  const advance = () => {
    if (steps.length > 1 && localStep < steps.length - 1) setLocalStep((value) => value + 1);
    else onAdvance();
  };
  const toggleFullscreen = async () => {
    const target = document.getElementById("guided-lesson-workspace");
    try {
      if (!document.fullscreenElement && target) { await target.requestFullscreen(); setFullscreen(true); }
      else { await document.exitFullscreen(); setFullscreen(false); }
    } catch { setFullscreen(false); }
  };

  return <div id="guided-lesson-workspace" className={`flex h-[calc(100dvh-12px)] min-h-[610px] flex-col gap-2.5 overflow-hidden bg-slate-50 px-3 pb-3 text-slate-800 sm:px-4 ${fullscreen ? "fixed inset-0 z-[100] h-dvh bg-slate-50" : ""}`}>
    <section className="shrink-0 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
          <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base"><MathFormattedText text={`${content.code}: ${content.title}`} /></h1>
          <span className="hidden shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:inline">Bước {activeStepNumber}/3: {currentTitle}</span>
        </div>
        <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Maximize2 size={17}/></button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5" aria-label="Các bước bài học">
        {stageTitles.map((title, index) => <span key={title} className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${index + 1 === activeStepNumber ? "bg-blue-600 text-white" : index + 1 < activeStepNumber ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>{index + 1}. {title}</span>)}
      </div>
    </section>

    {bannerOpen && <section className="relative flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 sm:px-4">
      <div className="hidden shrink-0 sm:block"><OptiMascot size={40} animate={false}/></div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white">MATHSTEP</span><b className="truncate text-xs text-slate-800">Bước {activeStepNumber}: {currentTitle}</b></div><p className="mt-0.5 truncate text-xs text-slate-600"><MathFormattedText text={stage === "simulation" || stage === "simulation_opened" ? (step?.explanation ?? content.subtitle) : content.subtitle}/></p>{hintOpen && hintText && <p className="mt-1 line-clamp-2 text-xs font-medium text-blue-800"><MathFormattedText text={`Gợi ý cấp ${hintLevel}: ${hintText}`}/></p>}</div>
      <button type="button" onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(content.subtitle)); }} title="Nghe hướng dẫn" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-blue-700 hover:bg-white"><Volume2 size={16}/></button>
      <div className="relative shrink-0"><button type="button" onClick={() => { setHintLevel((value) => value >= 3 ? 1 : value + 1); setHintOpen(true); }} className="flex h-8 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 text-[11px] font-bold text-blue-700"><Lightbulb size={14}/> Gợi ý 3 cấp <ChevronDown size={13}/></button></div>
      <button type="button" onClick={() => setBannerOpen(false)} aria-label="Thu gọn hướng dẫn" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white"><X size={15}/></button>
    </section>}

    <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-12 lg:overflow-hidden">
      <article className="flex min-h-[330px] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-3 lg:min-h-0">
        <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Bước {activeStepNumber} của 3</p><h2 className="mt-1 text-base font-bold text-slate-900"><MathFormattedText text={step?.title ?? currentTitle}/></h2><p className="mt-1 text-xs leading-relaxed text-slate-500"><MathFormattedText text={content.subtitle}/></p></div><span className="rounded-xl bg-blue-50 px-2.5 py-1.5 text-sm font-extrabold text-blue-700">{String(localStep + 1).padStart(2,"0")}</span></div>
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700"><MathFormattedText text={step?.explanation ?? content.objectives[0] ?? content.theory.coreConcept}/></div>
        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Nhiệm vụ hiện tại</p><p className="text-xs leading-relaxed text-slate-700"><MathFormattedText text={step?.mathExpression ?? content.workedExample.problemStatement}/></p></div>
        {content.simulationRef.simulationType === "spatial_geometry" && ratio !== undefined && onRatioChange && <label className="mt-3 block rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs font-semibold text-slate-700"><MathFormattedText text={`Tỉ số $SN/SB$ = ${ratio.toFixed(2)}`}/>
          <input aria-label="Điều chỉnh vị trí điểm N trên SB" type="range" min="0.2" max="0.8" step="0.005" value={ratio} onChange={(event) => onRatioChange(Number(event.target.value))} className="mt-2 w-full accent-blue-600"/>
        </label>}
        <div className="mt-3 flex-1 overflow-auto rounded-xl border border-slate-200/70 bg-white p-3 text-xs"><p className="font-bold text-slate-700">Mục tiêu bài học</p><ul className="mt-1.5 space-y-1.5">{content.objectives.slice(0,3).map((objective, index) => <li key={index} className="flex gap-1.5 text-slate-600"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-blue-600"/><MathFormattedText text={objective}/></li>)}</ul></div>
        <div className="mt-3 flex items-center justify-between gap-2"><span aria-live="polite" className={`text-[10px] font-semibold ${content.simulationRef.simulationType === "spatial_geometry" ? spatialRatioMatches ? "text-emerald-700" : "text-amber-700" : "text-emerald-700"}`}>{content.simulationRef.simulationType === "spatial_geometry" ? spatialRatioMatches ? "MN ∥ AB khi SN/SB = 1/2" : "MN chưa song song AB" : "● Đang thực hành"}</span><button type="button" onClick={advance} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">{steps.length > 1 && localStep < steps.length - 1 ? "Bước tiếp theo" : "Kiểm tra & Tiếp tục"}<ArrowRight size={14}/></button></div>
      </article>

      <article className="flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:col-span-5 lg:min-h-0">
        <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2"><div><h2 className="text-sm font-bold text-slate-900">{content.simulationRef.labName}</h2><p className="text-[10px] text-slate-500">Mô hình tương tác của bài học</p></div><div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold text-slate-500"><span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">Mô phỏng</span><span className="px-2 py-1">Dữ liệu</span></div></div>
        <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 [&>div]:!h-full [&>div]:!min-h-0 [&_canvas]:!h-full">{panel}<div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[10px] font-medium text-slate-600 shadow-sm">Kéo điểm hoặc thao tác mô hình để kiểm tra</div></div>
      </article>

      <aside className="flex min-h-[620px] flex-col gap-3 lg:col-span-4 lg:min-h-0">
        <section className="flex min-h-[350px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"><div className="flex shrink-0 items-center justify-center gap-2 pb-2 text-center"><OptiMascot size={44} animate={false}/><div className="text-left"><h2 className="text-sm font-bold text-slate-900">Trợ lý Toán MathSTEP</h2><p className="text-[10px] text-slate-500">Gợi ý theo nội dung bài học</p></div></div><div className="mb-2 rounded-xl border border-blue-200 bg-blue-50/40 p-2.5 text-xs text-slate-700"><b className="block text-blue-800">Gợi ý sư phạm</b><MathFormattedText text={step?.rationale ?? content.theory.miniTip}/></div><div className="min-h-0 flex-1"><SocraticChatDrawer inline isOpen onClose={() => undefined} messages={messages} busy={busy} error={error} input={input} onInputChange={onInputChange} onSendMessage={(message) => onSendMessage(message)} moduleTitle={`${content.code}: ${content.title}`} quickPrompts={["Gợi ý bước tiếp theo", "Giải thích theo hình", "Cho ví dụ tương tự"]}/></div></section>
        <section className="shrink-0 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"><div className="flex items-center gap-2 text-xs font-bold text-slate-800"><Sparkles size={15} className="text-blue-600"/>Thử sức với {Math.min(2, steps.length)} bài tập mẫu</div><div className="mt-2 grid grid-cols-2 gap-2">{steps.slice(0,2).map((item,index)=><button type="button" key={item.stepNumber} onClick={()=>{setExampleIndex(index);setLocalStep(index);if(content.simulationRef.simulationType === "spatial_geometry" && onRatioChange) onRatioChange(index===0 ? 2/3 : 0.5);}} className={`rounded-xl border p-2 text-left ${exampleIndex===index?"border-blue-300 bg-blue-50":"border-slate-200 bg-white hover:bg-slate-50"}`}><span className="block text-[10px] font-bold text-blue-700">Ví dụ {index===0?"A":"B"}</span><span className="mt-1 line-clamp-2 block text-[10px] text-slate-600"><MathFormattedText text={item.mathExpression ?? item.title}/></span><span className="mt-1 block text-[9px] text-slate-400">{index===0?"SGK Chuẩn":"Luyện tập"}</span></button>)}</div></section>
      </aside>
    </section>
  </div>;
}
