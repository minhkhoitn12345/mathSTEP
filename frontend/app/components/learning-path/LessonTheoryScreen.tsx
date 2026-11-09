"use client";

import { ArrowRight, BookOpenCheck, CheckCircle2, Lightbulb } from "lucide-react";
import type { DetailedLessonContent } from "@/app/types/learningPath";
import KatexMath, { MathFormattedText } from "../KatexMath";
import { LEARNER_FRIENDLY_EXPLANATIONS } from "@/app/data/learnerFriendlyExplanations";

interface LessonTheoryScreenProps {
  content: DetailedLessonContent;
  onStartGuidedPractice: () => void;
}

export function LessonTheoryScreen({ content, onStartGuidedPractice }: LessonTheoryScreenProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-6 py-7 text-white sm:px-8 sm:py-9">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold">
              {content.code} · Toán {content.grade}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100">
              {content.estimatedMinutes} phút đọc và học
            </span>
          </div>
          <h1 className="max-w-3xl text-2xl font-black leading-tight sm:text-3xl"><MathFormattedText text={content.title} /></h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100"><MathFormattedText text={content.subtitle} /></p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-blue-50">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            Chặng 1 · Nắm lý thuyết trước khi vào quy trình giải
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          <section aria-labelledby="lesson-objectives" className="space-y-3">
            <h2 id="lesson-objectives" className="text-sm font-black uppercase tracking-wide text-slate-500">
              Học xong bài này, em sẽ có thể
            </h2>
            <ul className="space-y-2.5">
              {content.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <MathFormattedText text={objective} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="lesson-theory" className="space-y-4 border-t border-slate-100 pt-5">
            <div>
              <h2 id="lesson-theory" className="text-lg font-black text-slate-900">Hiểu ý chính trước</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Mình đọc ý nghĩa bằng lời trước, rồi dùng công thức để tính và kiểm tra.</p>
              {LEARNER_FRIENDLY_EXPLANATIONS[content.lessonId] && (
                <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
                  <strong className="mb-1 block text-indigo-800">Nói dễ hiểu</strong>
                  <MathFormattedText text={LEARNER_FRIENDLY_EXPLANATIONS[content.lessonId]} />
                </div>
              )}
              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-slate-700">
                <strong className="mb-1 block text-blue-900">Mô tả chính xác</strong>
                <MathFormattedText text={content.theory.coreConcept} />
              </div>
            </div>

            {content.theory.formulas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Công thức và cách hiểu</h3>
                {content.theory.formulas.map((item, index) => (
                  <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <KatexMath math={item.formula} display className="text-base font-bold text-blue-900" />
                    <p className="mt-2 text-sm leading-relaxed text-slate-700"><strong className="text-blue-800">Nói dễ hiểu:</strong> <MathFormattedText text={item.meaning} /></p>
                    {item.conditions && (
                      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                        <strong>Dùng công thức này khi:</strong> <MathFormattedText text={item.conditions} />
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            {content.theory.notes.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Điểm dễ nhầm</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
                  {content.theory.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <MathFormattedText text={note} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div><strong>Mẹo ghi nhớ:</strong> <MathFormattedText text={content.theory.miniTip} /></div>
            </div>
          </section>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
            Em hãy thử nói lại ý chính theo cách của mình. Sau đó, mình cùng xem một ví dụ mẫu, làm từng bước và so sánh với lời giải.
          </div>

          <button
            type="button"
            onClick={onStartGuidedPractice}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Mình đã nắm ý chính · Bắt đầu luyện từng bước
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}
