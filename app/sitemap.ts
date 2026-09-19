import type { MetadataRoute } from "next";
import { sitioPublico } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = sitioPublico();
  const ultima = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: ultima,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          es: `${base}/`,
          en: `${base}/en`,
          "x-default": `${base}/`,
        },
      },
    },
    {
      url: `${base}/metodologia`,
      lastModified: ultima,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          es: `${base}/metodologia`,
          en: `${base}/en/methodology`,
          "x-default": `${base}/metodologia`,
        },
      },
    },
    {
      url: `${base}/en`,
      lastModified: ultima,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          es: `${base}/`,
          en: `${base}/en`,
          "x-default": `${base}/`,
        },
      },
    },
    {
      url: `${base}/en/methodology`,
      lastModified: ultima,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          es: `${base}/metodologia`,
          en: `${base}/en/methodology`,
          "x-default": `${base}/metodologia`,
        },
      },
    },
  ];
}
