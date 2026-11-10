import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mathstep-vn.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/learn/"],
        disallow: ["/api/", "/auth/", "/leaderboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
