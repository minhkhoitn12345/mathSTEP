import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStationById, getAllStations } from "../../lib/stationCatalogData";
import { CORE_7_MODULES } from "../../lib/modulesCatalogData";
import ModuleLabWorkbenchClient from "../../components/ModuleLabWorkbenchClient";

interface PageProps {
  params: Promise<{ stationId: string }>;
  searchParams: Promise<{ step?: string; mode?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { stationId } = await params;
  const station = getStationById(stationId);
  if (!station) {
    return { title: "Trạm học không tồn tại · MathSTEP" };
  }
  const parentModule = CORE_7_MODULES.find((m) => m.id === station.moduleId);

  return {
    title: `Trạm ${station.id}: ${station.title} · ${parentModule?.title || "MathSTEP"}`,
    description: `Trạm thực hành toán học ${station.source}: ${station.goal}`,
  };
}

export default async function StationDirectPage({ params, searchParams }: PageProps) {
  const { stationId } = await params;
  const { step, mode } = await searchParams;

  const station = getStationById(stationId);
  if (!station) {
    notFound();
  }

  const parentModule = CORE_7_MODULES.find((m) => m.id === station.moduleId) || CORE_7_MODULES[1];
  const stepNumber = step ? Math.max(0, Math.min(7, parseInt(step, 10) - 1)) : 0;
  const labMode = mode === "dynamic" ? "dynamic" : "sgk";

  return (
    <ModuleLabWorkbenchClient
      module={parentModule}
      initialStation={station}
      initialStep={stepNumber}
      initialMode={labMode}
    />
  );
}

// Pre-render tất cả 48 trạm SGK
export function generateStaticParams() {
  const all = getAllStations();
  return all.map((st) => ({
    stationId: st.id,
  }));
}
