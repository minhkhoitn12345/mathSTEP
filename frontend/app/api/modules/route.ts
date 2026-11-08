import { NextResponse } from "next/server";
import { getAllModules } from "../../lib/modulesCatalogData";
import { getAllStations } from "../../lib/stationCatalogData";

export async function GET() {
  const modules = getAllModules();
  const allStations = getAllStations();

  const enriched = modules.map((mod) => {
    const stationsInModule = allStations.filter((st) => st.moduleId === mod.id);
    return {
      id: mod.id,
      moduleNumber: mod.moduleNumber,
      title: mod.title,
      grade: mod.grade,
      is3D: mod.is3D,
      source: mod.source,
      tag: mod.tag,
      goal: mod.goal,
      features: mod.features,
      defaultStationId: mod.defaultStationId,
      stationCount: stationsInModule.length,
      aliases: mod.slugAliases,
      url: `/modules/${mod.id}`,
    };
  });

  return NextResponse.json({
    status: "success",
    totalModules: enriched.length,
    data: enriched,
  });
}
