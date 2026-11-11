import { Metadata } from "next";
import { CORE_3_MODULES } from "@/app/types/curriculum";
import LessonStudyClientPage from "./LessonStudyClientPage";

interface PageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export function generateStaticParams() {
  const params: { moduleId: string; lessonId: string }[] = [];
  CORE_3_MODULES.forEach((mod) => {
    mod.lessons.forEach((les) => {
      params.push({ moduleId: mod.id, lessonId: les.id });
    });
  });
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleId, lessonId } = await params;
  const mod = CORE_3_MODULES.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  if (!lesson || !mod) {
    return {
      title: "Bài học không tồn tại | MathSTEP VN",
      description: "Học liệu số & Phòng thí nghiệm Toán THPT Chuẩn GDPT 2018",
    };
  }

  return {
    title: `${lesson.code}: ${lesson.title} | ${mod.shortTitle} · MathSTEP VN`,
    description: `${lesson.description} - Chuẩn GDPT 2018 Toán ${mod.grade}`,
  };
}

export default async function LessonStudyDynamicPage({ params }: PageProps) {
  const { moduleId, lessonId } = await params;

  return <LessonStudyClientPage moduleId={moduleId} lessonId={lessonId} />;
}
