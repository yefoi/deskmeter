import type { MetadataRoute } from "next";
import { sitioPublico } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  const base = sitioPublico();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
