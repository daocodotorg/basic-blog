import { describe, expect, test } from "vitest";
import { absoluteUrlFromSite, normalizeBaseUrl } from "./absoluteUrl.js";
import type { SiteSettingsDTO } from "./types.js";

describe("normalizeBaseUrl", () => {
  test("strips trailing slash", () => {
    expect(normalizeBaseUrl("https://example.com/")).toBe("https://example.com");
  });

  test("empty stays empty", () => {
    expect(normalizeBaseUrl("")).toBe("");
  });
});

describe("absoluteUrlFromSite", () => {
  const site: SiteSettingsDTO = {
    siteName: "S",
    baseUrl: "https://example.com/",
  };

  test("joins path with site base", () => {
    expect(absoluteUrlFromSite(site, "/blog/a")).toBe("https://example.com/blog/a");
    expect(absoluteUrlFromSite(site, "blog/a")).toBe("https://example.com/blog/a");
  });

  test("uses fallback when site base missing", () => {
    expect(
      absoluteUrlFromSite(null, "/blog", "https://fallback.dev"),
    ).toBe("https://fallback.dev/blog");
  });

  test("prefers site over fallback", () => {
    expect(
      absoluteUrlFromSite(site, "/x", "https://ignored.com"),
    ).toBe("https://example.com/x");
  });

  test("empty site and no fallback yields path-only", () => {
    expect(absoluteUrlFromSite(null, "/blog")).toBe("/blog");
  });
});
