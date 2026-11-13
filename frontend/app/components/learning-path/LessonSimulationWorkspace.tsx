"use client";

import LessonSpatialViewport from "./LessonSpatialViewport";
import SocraticChatDrawer, { ChatMessage } from "../SocraticChatDrawer";
import { MathFormattedText } from "../KatexMath";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  objectives: string[];
  ratio: number;
  onRatioChange: (value: number) => void;
  messages: ChatMessage[];
  busy: boolean;
  error: string;
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (customMessage?: string) => void;
  onComplete: () => void;
};

export default function LessonSimulationWorkspace({ title, objectives, ratio, onRatioChange, messages, busy, error, input, onInputChange, onSendMessage, onComplete }: Props) {
  const parallel = Math.abs(ratio - 0.5) < 0.005;
  const ratioLabel = ratio === 2 / 3 ? "2:1" : ratio === 0.5 ? "1:1" : `${(ratio / (1 - ratio)).toFixed(1)}:1`;
  return <div className="mx-auto grid h-[calc(100vh-120px)] min-h-[620px] w-full max-w-[1600px] grid-cols-1 gap-4 px-4 pb-4 lg:grid-cols-12">
    <div className="min-h-[420px] lg:col-span-8 lg:min-h-0"><LessonSpatialViewport ratio={ratio} /></div>
    <aside className="flex min-h-[620px] flex-col gap-3 lg:col-span-4 lg:min-h-0">
      <section className="shrink-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-teal-700">Mục tiêu bài học</p><h2 className="mt-1 text-sm font-extrabold text-slate-900">{title}</h2></div>
        <ul className="space-y-1 text-xs leading-relaxed text-slate-600">{objectives.slice(0, 2).map((objective, index) => <li key={index}>• <MathFormattedText text={objective} /></li>)}</ul>
        <label className="block text-xs font-bold text-slate-700">Tỉ số chia đoạn trên SB · SN:NB = {ratioLabel}
          <input aria-label="Điều chỉnh tỉ số SN trên NB" type="range" min="0.2" max="0.8" step="0.005" value={ratio} onChange={(event) => { const value = Number(event.target.value); onRatioChange(Math.abs(value - 2 / 3) < 0.012 ? 2 / 3 : Math.abs(value - 0.5) < 0.012 ? 0.5 : value); }} className="mt-2 w-full accent-amber-600" />
        </label>
        <div aria-live="polite" className={`rounded-xl border p-2.5 text-xs leading-relaxed ${parallel ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
          {parallel ? <><strong>MN ∥ AB.</strong> <MathFormattedText text="Vì $SM/SA = SN/SB = 1/2$." /></> : <><strong>MN chưa song song AB.</strong> <MathFormattedText text={`$SM/SA=1/2$, còn $SN/SB=${ratio.toFixed(2)}$.`} /></>}
        </div>
        <button type="button" onClick={onComplete} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-800">Hoàn thành mô phỏng <ArrowRight className="h-4 w-4" /></button>
      </section>
      <div className="min-h-[360px] flex-1"><SocraticChatDrawer inline isOpen onClose={() => undefined} messages={messages} busy={busy} error={error} input={input} onInputChange={onInputChange} onSendMessage={(message) => onSendMessage(message)} moduleTitle={title} quickPrompts={["Gợi ý bước tiếp theo", "Giải thích theo hình 3D", "Cho ví dụ tương tự"]} /></div>
    </aside>
  </div>;
}
