import { describe, expect, test } from "vitest";
import { resolvePrimaryImage } from "./resolvePrimaryImage.js";
import type { PostDTO, SiteSettingsDTO } from "./types.js";

describe("resolvePrimaryImage", () => {
  const site: SiteSettingsDTO = {
    siteName: "S",
    baseUrl: "https://example.com",
    defaultOgImageUrl: "https://example.com/default.png",
  };

  test("prefers explicit og image", () => {
    const post: PostDTO = {
      slug: "a",
      title: "T",
      status: "published",
      ogImageUrl: "https://example.com/og.png",
    };
    const img = resolvePrimaryImage(post, [], site);
    expect(img?.url).toBe("https://example.com/og.png");
  });

  test("uses first image block", () => {
    const post: PostDTO = { slug: "a", title: "T", status: "published" };
    const img = resolvePrimaryImage(
      post,
      [
        {
          order: 0,
          block: {
            type: "image",
            url: "https://example.com/body.png",
            alt: "x",
          },
        },
      ],
      site,
    );
    expect(img?.url).toBe("https://example.com/body.png");
  });

  test("falls back to site default", () => {
    const post: PostDTO = { slug: "a", title: "T", status: "published" };
    const img = resolvePrimaryImage(post, [], site);
    expect(img?.url).toBe("https://example.com/default.png");
  });
});
