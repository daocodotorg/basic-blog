import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Ordered body block for a post (stored in `postBlocks`). */
export const blockValidator = v.union(
  v.object({
    type: v.literal("paragraph"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("heading"),
    level: v.number(),
    text: v.string(),
  }),
  /** External image (HTTPS URL). */
  v.object({
    type: v.literal("image"),
    url: v.string(),
    alt: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  }),
  /** Convex file storage — URL resolved at read time in the host app. */
  v.object({
    type: v.literal("image"),
    storageId: v.id("_storage"),
    alt: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  }),
  v.object({
    type: v.literal("video"),
    url: v.string(),
    poster: v.optional(v.string()),
    caption: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("link"),
    url: v.string(),
    title: v.optional(v.string()),
    rel: v.optional(v.string()),
    nofollow: v.optional(v.boolean()),
  }),
);

export default defineSchema({
  siteSettings: defineTable({
    key: v.literal("default"),
    siteName: v.string(),
    baseUrl: v.string(),
    defaultOgImageUrl: v.optional(v.string()),
    defaultOgImageStorageId: v.optional(v.id("_storage")),
    locale: v.optional(v.string()),
    defaultRobots: v.optional(v.string()),
  }).index("by_key", ["key"]),

  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
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
  })
    .index("by_slug", ["slug"])
    .index("by_status_publishedAt", ["status", "publishedAt"]),

  postBlocks: defineTable({
    postId: v.id("posts"),
    order: v.number(),
    block: blockValidator,
  }).index("by_post_order", ["postId", "order"]),
});
