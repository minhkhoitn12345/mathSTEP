"use client";

import dynamic from "next/dynamic";

const GeometryLibrary = dynamic(
  () => import("./GeometryLibrary").then(module => module.GeometryLibrary),
  { ssr: false, loading: () => <main className="grid min-h-screen place-items-center bg-[#f5f8f7] text-sm font-semibold text-slate-600">Đang mở thư viện hình học…</main> },
);

export function GeometryLibraryPageClient() {
  return <GeometryLibrary />;
}
