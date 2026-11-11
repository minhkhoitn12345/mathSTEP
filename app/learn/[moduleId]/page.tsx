import { redirect } from "next/navigation";
import { CORE_3_MODULES } from "@/app/types/curriculum";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export function generateStaticParams() {
  return CORE_3_MODULES.map((mod) => ({ moduleId: mod.id }));
}

export default async function ModuleLearnIndexPage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = CORE_3_MODULES.find((m) => m.id === moduleId);

  if (mod && mod.lessons.length > 0) {
    redirect(`/learn/${mod.id}/${mod.lessons[0].id}`);
  }

  redirect("/");
}
