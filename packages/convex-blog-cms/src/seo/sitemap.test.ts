import { describe, expect, test } from "vitest";
import { buildSitemapXml, postsToSitemapEntries } from "./sitemap.js";
import type { PostDTO, SiteSettingsDTO } from "./types.js";

describe("sitemap", () => {
  test("buildSitemapXml includes image namespace", () => {
    const xml = buildSitemapXml([
      {
        loc: "https://example.com/blog/a",
        lastmod: "2026-01-01",
        image: { url: "https://example.com/a.png", alt: "A" },
      },
    ]);
    expect(xml).toContain("image:image");
    expect(xml).toContain("https://example.com/a.png");
  });

  test("postsToSitemapEntries maps posts", () => {
    const site: SiteSettingsDTO = {
      siteName: "S",
      baseUrl: "https://example.com",
    };
    const post: PostDTO = {
      slug: "a",
      title: "A",
      status: "published",
      publishedAt: Date.now(),
    };
    const entries = postsToSitemapEntries({
      site,
      posts: [
        {
          post,
          path: "/blog/a",
          primaryImage: { url: "https://example.com/x.png", alt: "x" },
        },
      ],
    });
    expect(entries[0]?.loc).toBe("https://example.com/blog/a");
  });

  test("normalizes trailing slash on baseUrl", () => {
    const site: SiteSettingsDTO = {
      siteName: "S",
      baseUrl: "https://example.com/",
    };
    const post: PostDTO = {
      slug: "a",
      title: "A",
      status: "published",
    };
    const entries = postsToSitemapEntries({
      site,
      posts: [{ post, path: "/blog/a", primaryImage: null }],
    });
    expect(entries[0]?.loc).toBe("https://example.com/blog/a");
  });
});
