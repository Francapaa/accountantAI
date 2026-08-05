import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const url = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/home", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/auth/", "/home", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/auth/", "/home", "/api/"],
      },
      // AI crawlers: el contenido público está disponible para indexación y citas
      { userAgent: "GPTBot", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
      { userAgent: "Bytespider", allow: "/", disallow: ["/auth/", "/home", "/api/"] },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url.replace(/^https?:\/\//, ""),
  };
}