import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/config/site";
import { getAllPosts } from "@/lib/content/posts";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — IA y normativa contable para estudios de Argentina",
  description:
    "Artículos sobre IA generativa, RAG y normativa de ARCA/AFIP para contadores y estudios contables de Argentina. Guías, comparaciones y buenas prácticas verificables.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/blog",
    siteName: siteConfig.name,
    title: "Blog | AccountantAI",
    description:
      "IA, RAG y normativa ARCA/AFIP para estudios contables de Argentina.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    url: `${siteConfig.url}/blog`,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${siteConfig.url}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
    ],
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-bold">
            {siteConfig.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Blog de {siteConfig.name}
        </h1>
        <p className="mt-3 text-muted-foreground">
          IA generativa, RAG y normativa ARCA/AFIP para estudios contables.
        </p>
        {posts.map((post) => (
          <article key={post.slug} className="mt-10 border-t border-border/60 pt-8">
            <p className="text-xs text-muted-foreground">
              {post.datePublished} · {post.readingTime}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-2 px-0",
              )}
            >
              Leer artículo
            </Link>
          </article>
        ))}
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}