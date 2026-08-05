import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteConfig.url.replace(/\/$/, "");

  return [
    {
      url: `${url}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
