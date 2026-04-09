import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import type { MutationCtx, QueryCtx } from "./_generated/server.js";
import schema, { blockValidator } from "./schema.js";

const postDoc = schema.tables.posts.validator.extend({
  _id: v.id("posts"),
  _creationTime: v.number(),
});

const siteDoc = schema.tables.siteSettings.validator.extend({
  _id: v.id("siteSettings"),
  _creationTime: v.number(),
});

const publishedPostPayload = v.object({
  post: postDoc,
  blocks: v.array(
    v.object({
      order: v.number(),
      block: blockValidator,
    }),
  ),
});

async function requireUniqueSlug(
  ctx: Pick<QueryCtx | MutationCtx, "db">,
  slug: string,
  excludePostId?: string,
) {
  const existing = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing && existing._id !== excludePostId) {
    throw new Error(`Slug already in use: ${slug}`);
  }
}

export const getPublishedPostBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), publishedPostPayload),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!post || post.status !== "published") {
      return null;
    }
    const rows = await ctx.db
      .query("postBlocks")
      .withIndex("by_post_order", (q) => q.eq("postId", post._id))
      .collect();
    rows.sort((a, b) => a.order - b.order);
    return {
      post,
      blocks: rows.map((r) => ({ order: r.order, block: r.block })),
    };
  },
});

export const listPublishedPosts = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(postDoc),
  handler: async (ctx, args) => {
    const cap = Math.min(args.limit ?? 50, 100);
    return await ctx.db
      .query("posts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(cap);
  },
});

export const getPublicSiteSettings = query({
  args: {},
  returns: v.union(v.null(), siteDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const getPostForAdmin = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), publishedPostPayload),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!post) {
      return null;
    }
    const rows = await ctx.db
      .query("postBlocks")
      .withIndex("by_post_order", (q) => q.eq("postId", post._id))
      .collect();
    rows.sort((a, b) => a.order - b.order);
    return {
      post,
      blocks: rows.map((r) => ({ order: r.order, block: r.block })),
    };
  },
});

export const listPostsForAdmin = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(postDoc),
  handler: async (ctx, args) => {
    const cap = Math.min(args.limit ?? 100, 200);
    return await ctx.db.query("posts").order("desc").take(cap);
  },
});

export const createPost = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    authorName: v.optional(v.string()),
    excerpt: v.optional(v.string()),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    await requireUniqueSlug(ctx, args.slug);
    return await ctx.db.insert("posts", {
      slug: args.slug,
      title: args.title,
      status: "draft",
      authorName: args.authorName,
      excerpt: args.excerpt,
    });
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    patch: v.object({
      slug: v.optional(v.string()),
      title: v.optional(v.string()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
      publishedAt: v.optional(v.number()),
      authorName: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      canonicalPath: v.optional(v.string()),
      ogImageUrl: v.optional(v.string()),
      ogImageStorageId: v.optional(v.id("_storage")),
      twitterImageUrl: v.optional(v.string()),
      twitterImageStorageId: v.optional(v.id("_storage")),
      featuredImageUrl: v.optional(v.string()),
      featuredImageStorageId: v.optional(v.id("_storage")),
      featuredImageFocalX: v.optional(v.number()),
      featuredImageFocalY: v.optional(v.number()),
      noindex: v.optional(v.boolean()),
      answerSummary: v.optional(v.string()),
      keyTakeaways: v.optional(v.array(v.string())),
      faq: v.optional(
        v.array(
          v.object({
            question: v.string(),
            answer: v.string(),
          }),
        ),
      ),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("posts", args.postId);
    if (!existing) {
      throw new Error("Post not found");
    }
    if (args.patch.slug !== undefined && args.patch.slug !== existing.slug) {
      await requireUniqueSlug(ctx, args.patch.slug, args.postId);
    }
    const patch = { ...args.patch };
    const clearingFeaturedUrl = args.patch.featuredImageUrl === "";
    const resolveImagePair = (
      urlKey: "ogImageUrl" | "twitterImageUrl" | "featuredImageUrl",
      sidKey:
        | "ogImageStorageId"
        | "twitterImageStorageId"
        | "featuredImageStorageId",
    ) => {
      const sid = patch[sidKey];
      const u = patch[urlKey];
      if (sid !== undefined) {
        patch[urlKey] = undefined;
        return;
      }
      if (u === "") {
        patch[urlKey] = undefined;
        patch[sidKey] = undefined;
      } else if (u !== undefined && u !== "") {
        patch[sidKey] = undefined;
      }
    };
    resolveImagePair("ogImageUrl", "ogImageStorageId");
    resolveImagePair("twitterImageUrl", "twitterImageStorageId");
    resolveImagePair("featuredImageUrl", "featuredImageStorageId");
    if (clearingFeaturedUrl) {
      patch.featuredImageFocalX = undefined;
      patch.featuredImageFocalY = undefined;
    }
    const clampFocal = (n: number | undefined) => {
      if (typeof n !== "number" || Number.isNaN(n)) {
        return n;
      }
      return Math.min(100, Math.max(0, n));
    };
    if (patch.featuredImageFocalX !== undefined) {
      patch.featuredImageFocalX = clampFocal(patch.featuredImageFocalX);
    }
    if (patch.featuredImageFocalY !== undefined) {
      patch.featuredImageFocalY = clampFocal(patch.featuredImageFocalY);
    }
    await ctx.db.patch("posts", args.postId, patch);
    return null;
  },
});

export const publishPost = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get("posts", args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    await ctx.db.patch("posts", args.postId, {
      status: "published",
      publishedAt: Date.now(),
    });
    return null;
  },
});

export const unpublishPost = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("posts", args.postId, {
      status: "draft",
    });
    return null;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query("postBlocks")
      .withIndex("by_post_order", (q) => q.eq("postId", args.postId))
      .collect();
    for (const b of blocks) {
      await ctx.db.delete("postBlocks", b._id);
    }
    await ctx.db.delete("posts", args.postId);
    return null;
  },
});

export const replacePostBlocks = mutation({
  args: {
    postId: v.id("posts"),
    blocks: v.array(
      v.object({
        order: v.number(),
        block: blockValidator,
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get("posts", args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const existing = await ctx.db
      .query("postBlocks")
      .withIndex("by_post_order", (q) => q.eq("postId", args.postId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete("postBlocks", row._id);
    }
    for (const row of args.blocks) {
      await ctx.db.insert("postBlocks", {
        postId: args.postId,
        order: row.order,
        block: row.block,
      });
    }
    return null;
  },
});

export const upsertSiteSettings = mutation({
  args: {
    siteName: v.string(),
    baseUrl: v.string(),
    defaultOgImageUrl: v.optional(v.string()),
    defaultOgImageStorageId: v.optional(v.id("_storage")),
    locale: v.optional(v.string()),
    defaultRobots: v.optional(v.string()),
  },
  returns: v.id("siteSettings"),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
    const defaultOgImageUrl =
      args.defaultOgImageUrl !== undefined && args.defaultOgImageUrl !== "" ?
        args.defaultOgImageUrl
      : undefined;
    const defaultOgImageStorageId =
      args.defaultOgImageStorageId !== undefined ?
        args.defaultOgImageStorageId
      : undefined;
    const payload = {
      siteName: args.siteName,
      baseUrl: args.baseUrl,
      defaultOgImageUrl,
      defaultOgImageStorageId:
        defaultOgImageUrl !== undefined ? undefined : defaultOgImageStorageId,
      locale: args.locale,
      defaultRobots: args.defaultRobots,
    };
    if (row) {
      await ctx.db.patch("siteSettings", row._id, payload);
      return row._id;
    }
    return await ctx.db.insert("siteSettings", {
      key: "default",
      ...payload,
    });
  },
});
