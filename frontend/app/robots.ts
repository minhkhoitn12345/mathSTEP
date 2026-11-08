import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mathstep-vn.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/modules/", "/stations/"],
        disallow: ["/api/", "/auth/callback"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
