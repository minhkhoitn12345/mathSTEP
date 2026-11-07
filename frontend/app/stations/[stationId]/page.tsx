import { redirect } from "next/navigation";

export default async function StationPage({
  params,
  searchParams,
}: {
  params: Promise<{ stationId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { stationId } = await params;
  const { step } = await searchParams;
  const stepParam = step ? `&step=${encodeURIComponent(step)}` : "&step=1";
  redirect(`/?station=${encodeURIComponent(stationId)}${stepParam}`);
}
