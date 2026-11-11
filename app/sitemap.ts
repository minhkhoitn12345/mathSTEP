import type { MetadataRoute } from "next";
import { CORE_3_MODULES } from "./types/curriculum";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mathstep-vn.vercel.app";
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...CORE_3_MODULES.flatMap((module) => module.lessons.map((lesson) => ({
      url: `${baseUrl}/learn/${module.id}/${lesson.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))),
  ];
}
