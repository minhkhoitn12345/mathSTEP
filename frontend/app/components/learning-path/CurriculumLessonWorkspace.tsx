"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Maximize2, RotateCcw, Volume2 } from "lucide-react";
import { MathFormattedText } from "@/app/components/KatexMath";
import SocraticChatDrawer, { type ChatMessage } from "@/app/components/SocraticChatDrawer";
import LessonSpatialViewport from "@/app/components/learning-path/LessonSpatialViewport";
import type { CurriculumLesson } from "@/app/data/lessons-registry";

type Props = {
  lesson: CurriculumLesson;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message?: string) => void;
  busy: boolean;
  error: string;
  onComplete: () => void;
};

export default function CurriculumLessonWorkspace({ lesson, messages, input, onInputChange, onSendMessage, busy, error, onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const step = lesson.steps[stepIndex];
  const numericTarget = typeof step.targetValue === "number" ? step.targetValue : Number(step.targetValue);
  const numericAnswer = Number(answer);
  const isNumeric = Number.isFinite(numericTarget);
  const correct = isNumeric
    ? Number.isFinite(numericAnswer) && Math.abs(numericAnswer - numericTarget) <= step.tolerance
    : answer.trim().toLocaleLowerCase() === String(step.targetValue).trim().toLocaleLowerCase();
  const currentSample = useMemo(() => lesson.sampleProblems.find((sample) => sample.id === sampleId), [lesson.sampleProblems, sampleId]);
  const moduleName = lesson.moduleId === "CD02" ? "Hình học không gian" : "Lượng giác";
  const displayCode = lesson.moduleId === "CD02" ? `Bài ${Number(lesson.id.split("-").at(-1))}` : lesson.code;
  const viewportTitle = lesson.moduleId === "CD02" ? "Hình chóp S.ABCD" : (lesson.sceneType.includes("wave") || lesson.sceneType.includes("tan-cot") || lesson.sceneType.includes("monotonicity") ? "Đồ thị hàm số lượng giác" : "Đường tròn lượng giác");
  const sceneParameter = answer.trim() ? Number(answer) : Number(currentSample?.presetParams.targetValue ?? step.sceneState.targetValue);
  const sceneRatio = Number.isFinite(sceneParameter) && sceneParameter >= 0.2 && sceneParameter <= 0.8 ? sceneParameter : 0.5;
  const trigAngle = answer.trim() && Number.isFinite(Number(answer)) ? Number(answer) : 15 * (stepIndex + 1);
  const validate = () => {
    if (correct) {
      setFeedback("Chính xác. Em có thể chuyển sang bước tiếp theo.");
      if (stepIndex === lesson.steps.length - 1) onComplete();
      else { setStepIndex((value) => value + 1); setAnswer(""); setHintLevel(0); }
    } else {
      setFeedback("Chưa đúng. Hãy đối chiếu đơn vị, công thức và gợi ý từng cấp.");
    }
  };

  return <main id="curriculum-workspace" className={`flex min-h-dvh flex-col gap-3 bg-slate-50 p-3 text-slate-800 sm:p-4 ${fullscreen ? "fixed inset-0 z-[100] overflow-auto" : ""}`}>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600"/><h1 className="truncate text-sm font-bold text-slate-900 sm:text-base"><MathFormattedText text={`${displayCode}: ${lesson.title}`}/></h1><span className="hidden rounded-full bg-sky-50 px-2.5 py-1 text-xs text-blue-700 sm:block">Bước {stepIndex + 1}/{lesson.steps.length}: {step.title}</span></div><button onClick={() => setFullscreen((v) => !v)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200" aria-label="Toàn màn hình"><Maximize2 size={17}/></button></div>
      <div className="mt-3 flex gap-2 overflow-x-auto">{lesson.steps.map((item,index)=><button key={item.stepNumber} onClick={()=>{if(index<=stepIndex){setStepIndex(index);setAnswer("");setFeedback("");}}} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${index===stepIndex?"bg-blue-600 text-white":index<stepIndex?"bg-emerald-50 text-emerald-700":"bg-slate-50 text-slate-400"}`}>{index+1}. {item.title}</button>)}</div>
    </section>
    <section className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3"><div className="min-w-0 flex-1"><span className="mr-2 rounded bg-blue-600 px-2 py-1 text-[9px] font-extrabold text-white">MATHSTEP</span><b className="text-sm">Bước {stepIndex+1}: {step.title}</b><p className="mt-1 text-xs text-slate-600"><MathFormattedText text={step.instruction}/></p>{hintLevel>0&&<p className="mt-1 text-xs text-blue-800"><b>Gợi ý cấp {hintLevel}:</b> <MathFormattedText text={step.hints[`level${hintLevel}` as "level1"|"level2"|"level3"]}/></p>}</div><button title="Nghe hướng dẫn" className="rounded-lg p-2 text-blue-700" onClick={()=>{if("speechSynthesis" in window)window.speechSynthesis.speak(new SpeechSynthesisUtterance(step.instruction));}}><Volume2 size={17}/></button><button className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700" onClick={()=>setHintLevel((v)=>v>=3?1:v+1)}>Gợi ý 3 cấp</button></section>
    <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
      <section className="flex min-h-[370px] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Bước {stepIndex+1} của {lesson.steps.length}</p><h2 className="mt-1 text-lg font-bold"><MathFormattedText text={step.title}/></h2><p className="mt-1 text-xs text-slate-500"><MathFormattedText text={step.subtitle || lesson.shortDesc}/></p>{step.formula&&<div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm"><MathFormattedText text={step.formula}/></div>}<div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3"><label className="text-xs font-semibold text-slate-700">Câu trả lời{step.unit?` (${step.unit})`:""}</label><div className="mt-2 flex items-center gap-2"><input value={answer} onChange={(e)=>setAnswer(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")validate();}} inputMode={isNumeric?"decimal":"text"} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder={isNumeric?"Nhập giá trị":"Nhập đáp án"}/>{isNumeric&&<span className="text-xs text-slate-500">±{step.tolerance}</span>}</div><p className="mt-2 text-[11px] text-slate-500"><MathFormattedText text={step.instruction}/></p></div><div className="mt-auto pt-3"><div aria-live="polite" className={`mb-2 min-h-4 text-xs ${feedback.startsWith("Chính xác")?"text-emerald-700":"text-amber-700"}`}><MathFormattedText text={feedback}/></div><button onClick={validate} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700">Kiểm tra & Tiếp tục <ArrowRight size={16}/></button></div></section>
      <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:col-span-5"><div className="flex items-center justify-between gap-2 px-1 pb-2"><div><h2 className="text-sm font-bold">{viewportTitle}</h2><p className="text-xs text-slate-500"><MathFormattedText text={currentSample?.expression ?? step.subtitle ?? step.title}/></p></div><div className="flex gap-1"><button onClick={()=>setZoom((v)=>Math.max(.65,v-.1))} className="rounded-lg border px-2 py-1 text-xs" aria-label="Thu nhỏ">−</button><button onClick={()=>setZoom((v)=>Math.min(1.6,v+.1))} className="rounded-lg border px-2 py-1 text-xs" aria-label="Phóng to">+</button><button onClick={()=>{setZoom(1);setRotation(0);}} className="rounded-lg border p-1.5" title="Reset góc nhìn"><RotateCcw size={14}/></button></div></div><div className="relative min-h-[340px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40">{lesson.moduleId==="CD02"?<LessonSpatialViewport ratio={sceneRatio} zoom={zoom}/>:<TrigDiagram sceneType={lesson.sceneType} angle={trigAngle+rotation} stepTitle={step.title} zoom={zoom}/>}<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] text-slate-600 shadow">{lesson.moduleId==="CD02"?"Kéo chuột để xoay khối hình; lăn để thu phóng":"Kéo thanh trượt đáp án để đối chiếu vị trí trên đường tròn"}</div></div></section>
      <div className="flex min-h-[440px] flex-col gap-3 lg:col-span-4"><section className="flex min-h-[250px] flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"><div className="mb-2 text-center"><h2 className="text-sm font-bold">Trợ lý Toán MathSTEP</h2><p className="mt-1 text-left text-xs text-slate-600"><MathFormattedText text={step.pedagogicalNote}/></p></div><div className="min-h-0 flex-1"><SocraticChatDrawer inline isOpen onClose={()=>undefined} messages={messages} busy={busy} error={error} input={input} onInputChange={onInputChange} onSendMessage={(message)=>onSendMessage(`[Bài ${lesson.code}: ${lesson.title}; bước ${step.stepNumber}: ${step.title}; mô hình ${lesson.sceneType}; trạng thái ${JSON.stringify(step.sceneState)}] ${message ?? "Gợi ý bước tiếp theo"}`)} moduleTitle={`${lesson.code}: ${lesson.title}`}/></div></section><section className="max-h-[240px] overflow-auto rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"><h2 className="mb-2 text-sm font-bold">Thử sức với {lesson.sampleProblems.length} bài tập mẫu</h2><div className="space-y-2">{lesson.sampleProblems.map((sample)=><button key={sample.id} onClick={()=>{setSampleId(sample.id);const first=lesson.steps[0];setStepIndex(0);setAnswer(String(first.targetValue));setFeedback(sample.solutionSummary||"");}} className={`w-full rounded-xl border p-2.5 text-left ${sampleId===sample.id?"border-blue-300 bg-blue-50":"border-slate-200 hover:bg-slate-50"}`}><div className="flex items-center justify-between"><b className="text-xs">{sample.label}</b><span className="text-[10px] text-blue-700">{sample.tag}</span></div><p className="mt-1 text-xs"><MathFormattedText text={sample.expression}/></p>{currentSample?.id===sample.id&&sample.solutionSummary&&<p className="mt-1 text-[11px] text-slate-600"><MathFormattedText text={sample.solutionSummary}/></p>}</button>)}</div></section></div>
    </div>
    <div className="sr-only">{moduleName}</div>
  </main>;
}

function TrigDiagram({ sceneType, angle, stepTitle, zoom }: { sceneType:string; angle:number; stepTitle:string; zoom:number }) {
  if (sceneType.includes("wave") || sceneType.includes("tan-cot") || sceneType.includes("monotonicity")) {
    const wave = Array.from({length:121},(_,i)=>{const px=20+i*2.16;const t=(i/120)*Math.PI*4+(angle*Math.PI/180);const value=sceneType.includes("tan-cot")?Math.max(-1.25,Math.min(1.25,Math.tan(t))):Math.sin(t);return `${i===0?"M":"L"}${px} ${150-value*88}`;}).join(" ");
    return <div className="flex h-full min-h-[330px] flex-col items-center justify-center gap-2 p-3"><p className="text-xs font-semibold text-violet-700">{sceneType} · {stepTitle}</p><svg viewBox="0 0 300 300" className="h-full max-h-[300px] w-full max-w-[460px]" style={{transform:`scale(${zoom})`}} role="img" aria-label="Đồ thị hàm lượng giác"><path d="M20 150H280 M150 25V275" stroke="#94a3b8"/><path d={wave} fill="none" stroke="#7c3aed" strokeWidth="3"/><text x="255" y="166" fontSize="12" fill="#475569">x</text><text x="156" y="35" fontSize="12" fill="#475569">y</text></svg><p className="text-xs text-slate-500">Dịch pha tham chiếu: {angle}°</p></div>;
  }
  const theta=(Math.PI/3)+(angle*Math.PI/180); const x=150+105*Math.cos(theta); const y=150-105*Math.sin(theta);
  return <div className="flex h-full min-h-[330px] flex-col items-center justify-center gap-2 p-3"><p className="text-xs font-semibold text-violet-700">{sceneType} · {stepTitle}</p><svg viewBox="0 0 300 300" className="h-full max-h-[300px] w-full max-w-[340px]" style={{transform:`scale(${zoom})`}} role="img" aria-label="Đường tròn lượng giác"><path d="M30 150H270 M150 30V270" stroke="#94a3b8"/><circle cx="150" cy="150" r="105" fill="white" stroke="#7c3aed" strokeWidth="2"/><path d={`M150 150L${x} ${y}`} stroke="#2563eb" strokeWidth="3"/><circle cx={x} cy={y} r="6" fill="#f97316"/><text x="220" y="166" fontSize="12" fill="#475569">cos α</text><text x="156" y="48" fontSize="12" fill="#475569">sin α</text><text x="154" y="145" fontSize="11" fill="#7c3aed">α</text></svg><p className="text-xs text-slate-500">Trạng thái góc {((60+angle)%360+360)%360}°</p></div>;
}
