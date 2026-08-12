import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getAllPosts } from "./content/posts";

const publicDir = join(process.cwd(), "public");

function read(path: string): string {
  return readFileSync(join(publicDir, path), "utf8");
}

describe("archivos públicos GEO (llms / ai)", () => {
  const posts = getAllPosts();

  it("llms.txt existe y referencia a llms-full.txt", () => {
    expect(existsSync(join(publicDir, "llms.txt"))).toBe(true);
    expect(read("llms.txt")).toContain("/llms-full.txt");
  });

  it("llms-full.txt incluye el slug y el título de cada post", () => {
    const content = read("llms-full.txt");
    for (const post of posts) {
      expect(content).toContain(post.slug);
      expect(content).toContain(post.title);
    }
  });

  it("ai.txt existe y referencia el sitemap", () => {
    expect(existsSync(join(publicDir, ".well-known", "ai.txt"))).toBe(true);
    expect(read(".well-known/ai.txt")).toContain("/sitemap.xml");
  });
});