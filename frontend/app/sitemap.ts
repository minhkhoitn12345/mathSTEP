import type { MetadataRoute } from "next";
import { STATION_CATALOG } from "./lib/stationCatalogData";
import { CORE_7_MODULES } from "./lib/modulesCatalogData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mathstep-vn.vercel.app";
  const now = new Date();

  // Trang chủ
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/modules`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // 7 Modules cốt lõi
  for (const mod of CORE_7_MODULES) {
    routes.push({
      url: `${baseUrl}/modules/${mod.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  // 48 Trạm thực nghiệm
  for (const st of STATION_CATALOG) {
    routes.push({
      url: `${baseUrl}/stations/${st.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return routes;
}
