import type { Metadata } from "next";
import { GeometryLibraryPageClient } from "@/app/components/spatial-geometry/GeometryLibraryPageClient";

export const metadata: Metadata = {
  title: "Thư viện hình học không gian | MathSTEP",
  description: "Thư viện mô hình hình học không gian 3D có thể xoay, quan sát và dùng trong bài học MathSTEP.",
};

export default function GeometryLibraryPage() {
  return <GeometryLibraryPageClient />;
}
