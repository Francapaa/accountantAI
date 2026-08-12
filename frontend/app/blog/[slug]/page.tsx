import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { getAllPosts, getPost, type BlogPost } from "@/lib/content/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "Artículo no encontrado" };
  }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: `/blog/${post.slug}`,
      siteName: siteConfig.name,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "es-AR",
    author: {
      "@type": "Organization",
      name: post.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteConfig.url}/blog/${post.slug}`,
      },
    ],
  };

  const relatedPosts = (post.relatedSlugs ?? [])
    .map((relatedSlug) => getPost(relatedSlug))
    .filter((related): related is BlogPost => Boolean(related));

  const faqJsonLd =
    post.faq && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-bold">
            {siteConfig.name}
          </Link>
          <Link
            href="/blog"
            className="ml-6 text-sm text-muted-foreground hover:text-foreground"
          >
            Blog
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {post.datePublished} · {post.readingTime} · {post.author}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="mt-10 space-y-10">
          {post.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="font-heading text-2xl font-semibold">
                  {section.heading}
                </h2>
              )}
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph, j) => (
                  <p key={j} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.table && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="border-b-2 border-border bg-muted/40 px-4 py-3 text-left font-semibold text-foreground"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, r) => (
                        <tr key={r} className="border-b border-border/60">
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className="px-4 py-3 align-top text-muted-foreground"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
        {post.faq && post.faq.length > 0 && (
          <section className="mt-12 border-t border-border/60 pt-8">
            <h2 className="font-heading text-xl font-semibold">
              Preguntas frecuentes de este artículo
            </h2>
            <dl className="mt-4 space-y-6">
              {post.faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-medium text-foreground">{item.question}</dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {post.sources && post.sources.length > 0 && (
          <section className="mt-12 border-t border-border/60 pt-8">
            <h2 className="font-heading text-xl font-semibold">Fuentes</h2>
            <ul className="mt-3 space-y-2">
              {post.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        {relatedPosts.length > 0 && (
          <section className="mt-12 border-t border-border/60 pt-8">
            <h2 className="font-heading text-xl font-semibold">
              Artículos relacionados
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
                >
                  <h3 className="font-medium text-foreground">{related.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </div>
  );
}