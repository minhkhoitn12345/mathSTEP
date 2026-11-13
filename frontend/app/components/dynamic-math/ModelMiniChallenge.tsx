"use client";

import { useEffect, useState } from "react";
import KatexMath from "../KatexMath";

type Props = {
  title: string;
  instruction: string;
  value: number;
  target: number;
  epsilon: number;
  sliderExplanation: string;
  question: string;
  answers: { label: string; correct: boolean }[];
  answerExplanation: string;
  onIncorrectAnswer?: (answerIndex: number) => void;
};

export default function ModelMiniChallenge({ title, instruction, value, target, epsilon, sliderExplanation, question, answers, answerExplanation, onIncorrectAnswer }: Props) {
  const [sliderResult, setSliderResult] = useState<"correct" | "retry" | null>(null);
  const [answerResult, setAnswerResult] = useState<"correct" | "retry" | null>(null);
  useEffect(() => setSliderResult(null), [value]);
  return <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950 space-y-3" aria-label="Thử thách nhanh">
    <h3 className="font-bold">Thử thách nhanh · {title}</h3>
    <div><p>1. {instruction}</p><button type="button" onClick={() => setSliderResult(Math.abs(value - target) < epsilon ? "correct" : "retry")} className="mt-2 rounded-lg bg-emerald-800 px-3 py-2 font-semibold text-white">Kiểm tra mô hình</button>{sliderResult && <p role="status" className="mt-1">{sliderResult === "correct" ? "Chính xác! " : "Chưa đúng, hãy chỉnh thanh trượt rồi thử lại. "}{sliderResult === "correct" && <KatexMath math={sliderExplanation} />}</p>}</div>
    <div><p>2. {question}</p><div className="mt-2 flex flex-wrap gap-2">{answers.map((answer, index) => <button key={answer.label} type="button" onClick={() => { setAnswerResult(answer.correct ? "correct" : "retry"); if (!answer.correct) onIncorrectAnswer?.(index); }} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 font-semibold">{answer.label}</button>)}</div>{answerResult && <p role="status" className="mt-1">{answerResult === "correct" ? "Đúng! " : "Chưa đúng, hãy quan sát góc đang hiển thị. "}<KatexMath math={answerExplanation} /></p>}</div>
  </section>;
}
