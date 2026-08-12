import { describe, expect, it } from "vitest";

import { getAllPosts, getPost } from "./posts";

const URL_RE = /^https?:\/\//i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9-]+$/;

describe("blog posts", () => {
  const posts = getAllPosts();
  const slugs = posts.map((post) => post.slug);

  it("publica al menos 5 artículos", () => {
    expect(posts.length).toBeGreaterThanOrEqual(5);
  });

  it("tiene slugs únicos y en formato kebab-case", () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG_RE);
    }
  });

  it("completa los campos requeridos", () => {
    for (const post of posts) {
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.excerpt.length).toBeGreaterThan(0);
      expect(post.author.length).toBeGreaterThan(0);
      expect(post.authorPosition.length).toBeGreaterThan(0);
      expect(post.datePublished).toMatch(DATE_RE);
      expect(post.dateModified).toMatch(DATE_RE);
      expect(post.readingTime).toMatch(/^\d+ min$/);
      expect(post.sections.length).toBeGreaterThan(0);
    }
  });

  it("nunca modifica antes de publicar", () => {
    for (const post of posts) {
      expect(post.dateModified >= post.datePublished).toBe(true);
    }
  });

  it("usa URLs http(s) en las fuentes", () => {
    for (const post of posts) {
      for (const source of post.sources ?? []) {
        expect(source.label.length).toBeGreaterThan(0);
        expect(source.url).toMatch(URL_RE);
      }
    }
  });

  it("relatedSlugs apuntan a posts existentes y no se auto-referencian", () => {
    for (const post of posts) {
      for (const relatedSlug of post.relatedSlugs ?? []) {
        expect(relatedSlug).not.toBe(post.slug);
        expect(getPost(relatedSlug)).toBeDefined();
      }
    }
  });
});