import { describe, expect, test } from "vitest";
import { buildArticleJsonLd, buildBlogIndexJsonLd } from "./jsonld.js";
import type { PostDTO, SiteSettingsDTO } from "./types.js";

const site: SiteSettingsDTO = {
  siteName: "My Site",
  baseUrl: "https://example.com",
};

describe("buildArticleJsonLd", () => {
  test("includes publisher and abstract when answerSummary set", () => {
    const post: PostDTO = {
      slug: "a",
      title: "T",
      status: "published",
      publishedAt: 1_700_000_000_000,
      answerSummary: "Short lead for AI and crawlers.",
    };
    const ld = buildArticleJsonLd({
      post,
      site,
      primaryImage: null,
      path: "/blog/a",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.publisher).toEqual({
      "@type": "Organization",
      name: "My Site",
      url: "https://example.com",
    });
    expect(ld.abstract).toBe("Short lead for AI and crawlers.");
    expect(ld.description).toBe("Short lead for AI and crawlers.");
  });

  test("uses canonicalPath for url", () => {
    const post: PostDTO = {
      slug: "a",
      title: "T",
      status: "published",
      canonicalPath: "/blog/alias",
    };
    const ld = buildArticleJsonLd({
      post,
      site,
      primaryImage: null,
      path: "/blog/a",
    }) as Record<string, unknown>;
    expect(ld.url).toBe("https://example.com/blog/alias");
  });

  test("FAQ graph sets FAQPage url", () => {
    const post: PostDTO = {
      slug: "a",
      title: "T",
      status: "published",
      faq: [{ question: "Q?", answer: "A." }],
    };
    const ld = buildArticleJsonLd({
      post,
      site,
      primaryImage: null,
      path: "/blog/a",
    }) as { "@graph": Array<Record<string, unknown>> };
    const faq = ld["@graph"][1];
    expect(faq?.["@type"]).toBe("FAQPage");
    expect(faq?.url).toBe("https://example.com/blog/a");
  });

  test("fallbackBaseUrl when site base empty", () => {
    const post: PostDTO = { slug: "a", title: "T", status: "published" };
    const ld = buildArticleJsonLd({
      post,
      site: { siteName: "S", baseUrl: "" },
      primaryImage: null,
      path: "/blog/a",
      fallbackBaseUrl: "https://env.example",
    }) as Record<string, unknown>;
    expect(ld.url).toBe("https://env.example/blog/a");
  });
});

describe("buildBlogIndexJsonLd", () => {
  test("CollectionPage and ItemList with positions", () => {
    const items = [
      {
        post: {
          slug: "a",
          title: "First",
          status: "published" as const,
          publishedAt: 1_700_000_000_000,
        },
        path: "/blog/a",
      },
      {
        post: { slug: "b", title: "Second", status: "published" as const },
        path: "/blog/b",
      },
    ];
    const ld = buildBlogIndexJsonLd({
      site,
      indexPath: "/blog",
      name: "Blog",
      description: "Posts",
      items,
    }) as { "@graph": Array<Record<string, unknown>> };
    const [page, list] = ld["@graph"];
    expect(page["@type"]).toBe("CollectionPage");
    expect(page.url).toBe("https://example.com/blog");
    expect(page.mainEntity).toEqual({ "@id": "https://example.com/blog#itemlist" });

    const elements = list.itemListElement as Array<Record<string, unknown>>;
    expect(elements[0]?.position).toBe(1);
    expect(elements[0]?.url).toBe("https://example.com/blog/a");
    expect(elements[0]?.name).toBe("First");
    expect(elements[0]?.datePublished).toBe(new Date(1_700_000_000_000).toISOString());
    expect(elements[1]?.position).toBe(2);
    expect(elements[1]?.datePublished).toBeUndefined();
  });

  test("optional webSiteId and organizationId", () => {
    const ld = buildBlogIndexJsonLd({
      site,
      indexPath: "/blog",
      name: "Blog",
      items: [],
      webSiteId: "https://example.com/#website",
      organizationId: "https://example.com/#org",
    }) as { "@graph": Array<Record<string, unknown>> };
    const page = ld["@graph"][0] as Record<string, unknown>;
    expect(page.isPartOf).toEqual({ "@id": "https://example.com/#website" });
    expect(page.publisher).toEqual({ "@id": "https://example.com/#org" });
  });
});
