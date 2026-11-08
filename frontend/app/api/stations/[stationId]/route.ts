import { NextRequest, NextResponse } from "next/server";
import { getAllStations, getStationById } from "../../../lib/stationCatalogData";
import { CORE_7_MODULES } from "../../../lib/modulesCatalogData";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  if (!stationId) {
    return NextResponse.json(
      { status: "error", message: "Missing stationId parameter" },
      { status: 400 }
    );
  }

  const station = getStationById(stationId);
  if (!station) {
    return NextResponse.json(
      { status: "error", message: `Không tìm thấy trạm học toán "${stationId}" trong danh mục SGK.` },
      { status: 404 }
    );
  }

  const parentModule = CORE_7_MODULES.find((m) => m.id === station.moduleId);
  const allStations = getAllStations();
  const siblings = allStations.filter(
    (s) => s.moduleId === station.moduleId && s.id !== station.id
  );

  return NextResponse.json({
    status: "success",
    data: {
      station,
      parentModule: parentModule || null,
      siblings,
      stationUrl: `/stations/${station.id}`,
      moduleUrl: `/modules/${station.moduleId}`,
    },
  });
}
