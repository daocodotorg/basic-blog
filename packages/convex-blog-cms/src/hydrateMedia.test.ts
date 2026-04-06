import { describe, expect, test } from "vitest";
import { hydrateBlockDTO, hydratePostDTO } from "./hydrateMedia.js";
import type { PostStored } from "./seo/storedTypes.js";

describe("hydrateMedia", () => {
  test("hydrates post SEO fields from storage ids", async () => {
    const getUrl = async (id: string) =>
      id === "sid1" ? "https://cdn.example.com/og.png" : null;
    const post: PostStored = {
      slug: "a",
      title: "T",
      status: "published",
      ogImageStorageId: "sid1",
    };
    const out = await hydratePostDTO(getUrl, post);
    expect(out.ogImageUrl).toBe("https://cdn.example.com/og.png");
  });

  test("hydrates image block from storage id", async () => {
    const getUrl = async (id: string) =>
      id === "f1" ? "https://cdn.example.com/img.png" : null;
    const out = await hydrateBlockDTO(getUrl, {
      type: "image",
      storageId: "f1",
      alt: "A",
    });
    expect(out).toEqual({
      type: "image",
      url: "https://cdn.example.com/img.png",
      alt: "A",
      width: undefined,
      height: undefined,
    });
  });

  test("preserves external image URL", async () => {
    const getUrl = async () => null;
    const out = await hydrateBlockDTO(getUrl, {
      type: "image",
      url: "https://elsewhere.com/x.png",
      alt: "X",
    });
    expect(out).toEqual({
      type: "image",
      url: "https://elsewhere.com/x.png",
      alt: "X",
      width: undefined,
      height: undefined,
    });
  });
});
