import { NextRequest, NextResponse } from "next/server";
import { resolveModuleOrStation } from "../../../lib/modulesCatalogData";
import { getAllStations } from "../../../lib/stationCatalogData";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params;
  if (!moduleId) {
    return NextResponse.json(
      { status: "error", message: "Missing moduleId parameter" },
      { status: 400 }
    );
  }

  const resolved = resolveModuleOrStation(moduleId);
  const allStations = getAllStations();
  const relatedStations = allStations.filter((s) => s.moduleId === resolved.module.id);

  return NextResponse.json({
    status: "success",
    requestedSlug: moduleId,
    matchedBy: resolved.matchedBy,
    data: {
      id: resolved.module.id,
      moduleNumber: resolved.module.moduleNumber,
      title: resolved.module.title,
      grade: resolved.module.grade,
      is3D: resolved.module.is3D,
      source: resolved.module.source,
      tag: resolved.module.tag,
      goal: resolved.module.goal,
      features: resolved.module.features,
      defaultStationId: resolved.module.defaultStationId,
      currentStation: resolved.station,
      stations: relatedStations,
      aliases: resolved.module.slugAliases,
      url: `/modules/${resolved.module.id}`,
    },
  });
}
