"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import { getLessonDetailedContent } from "@/app/data/learningPathData";
import { MathFormattedText } from "@/app/components/KatexMath";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLab: (moduleId: string, lessonId: string) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onGoToLab,
}) => {
  const allLessons = useMemo(
    () => CORE_3_MODULES.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson, content: getLessonDetailedContent(lesson.id) }))),
    []
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(allLessons[0]?.lesson.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(true);
  const selected = allLessons.find((item) => item.lesson.id === selectedLessonId) || allLessons[0];
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const filteredLessons = allLessons.filter(({ module, lesson, content }) =>
    `${module.title} ${lesson.code} ${lesson.title} ${lesson.subtitle} ${content?.theory.coreConcept || ""} ${content?.theory.formulas.map((formula) => `${formula.formula} ${formula.meaning} ${formula.conditions || ""}`).join(" ") || ""}`
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(normalizedSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  if (!isOpen || !selected?.content) return null;
  const { module, lesson, content } = selected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label="Thư viện kiến thức Toán học">
      <div className="flex h-[94vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
        <aside className={`flex w-full max-w-[300px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 max-md:max-w-none ${mobileCatalogOpen ? "max-md:flex" : "max-md:hidden"}`}>
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><BookOpen className="h-5 w-5" /></span>
                <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Toàn bộ tài liệu</p><h2 className="text-sm font-black text-slate-900">Mục lục kiến thức</h2></div>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" aria-label="Đóng thư viện"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm bài hoặc công thức..." className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400" aria-label="Tìm trong thư viện kiến thức" />
            </label>
            <p className="mt-2 text-[10px] text-slate-500">{filteredLessons.length} / {allLessons.length} bài trong 3 chuyên đề</p>
          </div>

          <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-4" aria-label="Mục lục tài liệu">
            {CORE_3_MODULES.map((moduleItem) => {
              const moduleLessons = filteredLessons.filter((item) => item.module.id === moduleItem.id);
              if (!moduleLessons.length) return null;
              return (
                <section key={moduleItem.id}>
                  <h3 className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500">{moduleItem.title}</h3>
                  <div className="space-y-1">
                    {moduleLessons.map(({ lesson: item }) => (
                      <button key={item.id} type="button" onClick={() => { setSelectedLessonId(item.id); setMobileCatalogOpen(false); }} aria-current={selectedLessonId === item.id ? "page" : undefined} className={`w-full rounded-xl px-3 py-2.5 text-left transition ${selectedLessonId === item.id ? "bg-blue-700 text-white shadow-sm" : "text-slate-700 hover:bg-white hover:text-blue-800"}`}>
                        <span className={`block text-[9px] font-extrabold uppercase tracking-wide ${selectedLessonId === item.id ? "text-blue-100" : "text-slate-400"}`}>{item.code}</span>
                        <span className="mt-0.5 block text-xs font-bold leading-snug">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {filteredLessons.length === 0 && <p className="p-3 text-xs leading-relaxed text-slate-500">Không tìm thấy bài phù hợp. Thử tên chuyên đề, tên bài hoặc một từ khóa công thức.</p>}
          </nav>
        </aside>

        <main className={`min-w-0 flex-1 overflow-y-auto ${mobileCatalogOpen ? "max-md:hidden" : "max-md:block"}`}>
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileCatalogOpen(true)} className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Quay lại mục lục"><BookOpen className="h-4 w-4" /></button>
              <OptiMascot expression="happy" pose="reading" size={40} animate={false} />
              <div className="min-w-0"><p className="truncate text-[10px] font-extrabold uppercase tracking-wider text-blue-700">{module.code} · Toán {module.grade}</p><h1 className="truncate text-sm font-black text-slate-900 sm:text-base">{lesson.code}: {lesson.title}</h1></div>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng thư viện"><X className="h-4 w-4" /></button>
          </header>

          <article className="mx-auto max-w-4xl space-y-7 px-4 py-6 sm:px-7 sm:py-8">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <p className="text-xs font-extrabold text-blue-950">Em sẽ học được gì?</p>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-blue-950">
                {content.objectives.map((objective, index) => <li key={index} className="flex gap-2"><span className="font-black text-blue-600">{index + 1}.</span><MathFormattedText text={objective} /></li>)}
              </ul>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Lý thuyết cốt lõi</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm sm:p-5"><MathFormattedText text={content.theory.coreConcept} /></div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Công thức và cách dùng</h2>
              {content.theory.formulas.map((formula, index) => (
                <div key={`${formula.formula}-${index}`} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
                  <div className="overflow-x-auto rounded-xl bg-white px-3 py-4 text-center text-indigo-950"><MathFormattedText text={`$$${formula.formula}$$`} /></div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-700"><strong>Ý nghĩa:</strong> <MathFormattedText text={formula.meaning} /></p>
                  {formula.conditions && <p className="mt-1.5 text-xs leading-relaxed text-slate-600"><strong>Điều kiện áp dụng:</strong> <MathFormattedText text={formula.conditions} /></p>}
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Điều cần nhớ</h2>
              <ul className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 sm:p-5">
                {content.theory.notes.map((note, index) => <li key={index} className="flex gap-2"><span className="font-black">•</span><MathFormattedText text={note} /></li>)}
              </ul>
              <p className="rounded-xl bg-amber-100/70 px-4 py-3 text-xs leading-relaxed text-amber-950"><strong>Mẹo ghi nhớ:</strong> <MathFormattedText text={content.theory.miniTip} /></p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Ví dụ giải từng bước</h2>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-900">Đề bài</p>
                <div className="mt-2 text-sm leading-relaxed text-slate-800"><MathFormattedText text={content.workedExample.problemStatement} /></div>
                <ol className="mt-4 space-y-3">
                  {content.workedExample.steps.map((step) => (
                    <li key={step.stepNumber} className="rounded-xl border border-emerald-100 bg-white p-3 sm:p-4">
                      <h3 className="text-xs font-extrabold text-slate-900">Bước {step.stepNumber}: {step.title}</h3>
                      {step.mathExpression && <div className="my-2 overflow-x-auto rounded-lg bg-slate-50 px-2 py-3 text-center text-blue-950"><MathFormattedText text={`$$${step.mathExpression}$$`} /></div>}
                      <p className="text-xs leading-relaxed text-slate-700"><MathFormattedText text={step.explanation} /></p>
                      <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-500"><strong>Vì sao làm bước này?</strong> <MathFormattedText text={step.rationale} /></p>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 rounded-xl bg-emerald-100/70 p-3 text-xs leading-relaxed text-emerald-950"><strong>Kết luận:</strong> <MathFormattedText text={content.workedExample.conclusion} /></p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">Tự kiểm tra kiến thức</h2>
              {content.checkpoints.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-bold text-slate-900">Câu {index + 1}: <MathFormattedText text={question.question} /></p>
                  <ul className="mt-3 space-y-2 text-xs text-slate-700">{question.options.map((option) => <li key={option.id} className="flex gap-2"><span className="font-bold">{option.id}.</span><MathFormattedText text={option.text} /></li>)}</ul>
                  <details className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><summary className="cursor-pointer font-bold">Xem lời giải sau khi tự làm</summary><p className="mt-2 leading-relaxed"><MathFormattedText text={question.explanationCorrect} /></p></details>
                </div>
              ))}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <p className="text-xs text-slate-500">Thời lượng gợi ý: {content.estimatedMinutes} phút · Thưởng: {content.xpReward} XP</p>
              <button type="button" onClick={() => { onClose(); onGoToLab(module.id, lesson.id); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-800">
                Mở mô phỏng bài này <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};
