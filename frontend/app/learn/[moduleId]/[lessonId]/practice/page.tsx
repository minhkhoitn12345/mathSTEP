import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import { getLessonDetailedContent } from "@/app/data/learningPathData";

interface PageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export function generateStaticParams() {
  return CORE_3_MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({ moduleId: module.id, lessonId: lesson.id }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleId, lessonId } = await params;
  const targetModule = CORE_3_MODULES.find((item) => item.id === moduleId);
  const lesson = targetModule?.lessons.find((item) => item.id === lessonId);

  return {
    title: lesson && targetModule
      ? `Hướng dẫn từng bước: ${lesson.title} | ${targetModule.shortTitle}`
      : "Bài luyện tập không tồn tại | MathSTEP VN",
    description: lesson
      ? `Luyện bài ${lesson.code} theo từng bước, có gợi ý và lời giải.`
      : "Không tìm thấy bài luyện tập này.",
  };
}

export default async function GuidedLessonPage({ params }: PageProps) {
  const { moduleId, lessonId } = await params;
  const content = getLessonDetailedContent(lessonId);

  if (!content || content.moduleId !== moduleId) notFound();

  redirect(`/learn/${moduleId}/${lessonId}`);
}
