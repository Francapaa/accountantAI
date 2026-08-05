import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const url = siteConfig.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
