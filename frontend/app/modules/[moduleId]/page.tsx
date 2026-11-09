import { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveModuleOrStation, CORE_7_MODULES } from "../../lib/modulesCatalogData";
import { getStationById } from "../../lib/stationCatalogData";
import { CORE_3_MODULES } from "../../types/curriculum";
import ModuleLabWorkbenchClient from "../../components/ModuleLabWorkbenchClient";

interface PageProps {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ step?: string; station?: string; mode?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { moduleId } = await params;
  const { station } = await searchParams;
  const resolved = resolveModuleOrStation(moduleId);
  const preparedModule = CORE_3_MODULES.find((module) => module.id === resolved.module.id);
  if (!station && preparedModule && preparedModule.id !== "linear_programming") {
    redirect(`/learn/${preparedModule.id}/${preparedModule.lessons[0].id}`);
  }
  const activeStation = station ? getStationById(station) || resolved.station : resolved.station;

  return {
    title: `${activeStation.id}: ${activeStation.title} | ${resolved.module.title} · MathSTEP`,
    description: `Phòng thực nghiệm toán học tương tác GeoGebra/Desmos chuẩn GDPT 2018: ${resolved.module.goal}`,
  };
}

export default async function ModuleDynamicPage({ params, searchParams }: PageProps) {
  const { moduleId } = await params;
  const { step, station, mode } = await searchParams;

  const resolved = resolveModuleOrStation(moduleId);
  const activeStation = station ? getStationById(station) || resolved.station : resolved.station;
  const stepNumber = step ? Math.max(0, Math.min(7, parseInt(step, 10) - 1)) : 0;
  // Vào trực tiếp phòng Module -> Mặc định kích hoạt Chế độ Thí nghiệm động GeoGebra
  const initialMode = mode === "sgk" ? "sgk" : "dynamic";

  return (
    <ModuleLabWorkbenchClient
      module={resolved.module}
      initialStation={activeStation}
      initialStep={stepNumber}
      initialMode={initialMode}
    />
  );
}

// Cho phép Next.js pre-render trước các slug module thông dụng
export function generateStaticParams() {
  const slugs: { moduleId: string }[] = [];
  CORE_7_MODULES.forEach((m) => {
    slugs.push({ moduleId: m.id });
    slugs.push({ moduleId: m.moduleNumber });
    m.slugAliases.forEach((alias) => {
      slugs.push({ moduleId: alias });
    });
  });
  return slugs;
}
