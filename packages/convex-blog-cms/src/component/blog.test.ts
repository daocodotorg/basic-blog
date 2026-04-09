import { describe, expect, test } from "vitest";
import { initConvexTest } from "../client/setup.test.js";
import { api } from "./_generated/api.js";

describe("blog component", () => {
  test("slug uniqueness on create", async () => {
    const t = initConvexTest();
    await t.mutation(api.blog.createPost, {
      slug: "hello",
      title: "Hello",
    });
    await expect(
      t.mutation(api.blog.createPost, {
        slug: "hello",
        title: "Dup",
      }),
    ).rejects.toThrow(/Slug already in use/);
  });

  test("publish and list published", async () => {
    const t = initConvexTest();
    const id = await t.mutation(api.blog.createPost, {
      slug: "a",
      title: "A",
    });
    await t.mutation(api.blog.publishPost, { postId: id });
    const list = await t.query(api.blog.listPublishedPosts, { limit: 10 });
    expect(list.some((p) => p.slug === "a")).toBe(true);
  });

  test("site settings upsert", async () => {
    const t = initConvexTest();
    await t.mutation(api.blog.upsertSiteSettings, {
      siteName: "Test",
      baseUrl: "https://example.com",
    });
    const s = await t.query(api.blog.getPublicSiteSettings, {});
    expect(s?.siteName).toBe("Test");
  });

  test("featured image focal point persists and clears with cover", async () => {
    const t = initConvexTest();
    const id = await t.mutation(api.blog.createPost, {
      slug: "focal",
      title: "Focal",
    });
    await t.mutation(api.blog.updatePost, {
      postId: id,
      patch: {
        featuredImageUrl: "https://example.com/cover.jpg",
        featuredImageFocalX: 22,
        featuredImageFocalY: 78,
      },
    });
    let admin = await t.query(api.blog.getPostForAdmin, { slug: "focal" });
    expect(admin?.post.featuredImageFocalX).toBe(22);
    expect(admin?.post.featuredImageFocalY).toBe(78);

    await t.mutation(api.blog.updatePost, {
      postId: id,
      patch: { featuredImageUrl: "" },
    });
    admin = await t.query(api.blog.getPostForAdmin, { slug: "focal" });
    expect(admin?.post.featuredImageFocalX).toBeUndefined();
    expect(admin?.post.featuredImageFocalY).toBeUndefined();
  });
});
