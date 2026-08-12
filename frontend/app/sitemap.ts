import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { getAllPosts } from "@/lib/content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteConfig.url.replace(/\/$/, "");

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${url}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${url}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: `${url}/acerca`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${url}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${url}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${url}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}