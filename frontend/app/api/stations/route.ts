import { NextRequest, NextResponse } from "next/server";
import { filterStations, getAllStations } from "../../lib/stationCatalogData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const gradeParam = searchParams.get("grade");
  const gradeFilter = gradeParam ? parseInt(gradeParam, 10) : null;
  const dimensionParam = searchParams.get("dimension") as "all" | "2d" | "3d" | null;
  const dimensionFilter = dimensionParam && ["2d", "3d", "all"].includes(dimensionParam) ? dimensionParam : "all";
  const priorityParam = searchParams.get("priority") as "all" | "A" | "B" | "C" | null;
  const priorityFilter = priorityParam && ["A", "B", "C", "all"].includes(priorityParam) ? priorityParam : "all";
  const moduleId = searchParams.get("moduleId");

  const catalog = getAllStations();
  let results = filterStations(catalog, q, gradeFilter, dimensionFilter, priorityFilter);

  if (moduleId) {
    results = results.filter((st) => st.moduleId === moduleId);
  }

  const mapped = results.map((st) => ({
    ...st,
    url: `/stations/${st.id}`,
    moduleUrl: `/modules/${st.moduleId}`,
  }));

  return NextResponse.json({
    status: "success",
    total: mapped.length,
    data: mapped,
  });
}
