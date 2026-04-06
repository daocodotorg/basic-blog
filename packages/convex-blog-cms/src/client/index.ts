import { mutationGeneric, queryGeneric } from "convex/server";
import type { Auth } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";
import { blockValidator } from "../component/schema.js";

/** Default `defineComponent` name; host `components` key is usually `blogCms`. */
export const BLOG_CMS_COMPONENT_NAME = "blogCms" as const;

export type BlogAdminAuthContext = {
  auth: Auth;
};

export type BlogAdminOperation =
  | { type: "adminRead" }
  | { type: "adminWrite" };

/**
 * Host app calls this with `components.blogCms` and an auth callback.
 * Public read queries are unauthenticated. Admin operations use `auth`.
 */
export function makeBlogAdminAPI(
  component: ComponentApi,
  options: {
    auth: (
      ctx: BlogAdminAuthContext,
      operation: BlogAdminOperation,
    ) => Promise<void>;
  },
) {
  const { auth } = options;

  return {
    getPublishedPostBySlug: queryGeneric({
      args: { slug: v.string() },
      handler: async (ctx, args) => {
        return await ctx.runQuery(component.blog.getPublishedPostBySlug, args);
      },
    }),

    listPublishedPosts: queryGeneric({
      args: { limit: v.optional(v.number()) },
      handler: async (ctx, args) => {
        return await ctx.runQuery(component.blog.listPublishedPosts, args);
      },
    }),

    getPublicSiteSettings: queryGeneric({
      args: {},
      handler: async (ctx) => {
        return await ctx.runQuery(component.blog.getPublicSiteSettings, {});
      },
    }),

    getPostForAdmin: queryGeneric({
      args: { slug: v.string() },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminRead" });
        return await ctx.runQuery(component.blog.getPostForAdmin, args);
      },
    }),

    listPostsForAdmin: queryGeneric({
      args: { limit: v.optional(v.number()) },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminRead" });
        return await ctx.runQuery(component.blog.listPostsForAdmin, args);
      },
    }),

    createPost: mutationGeneric({
      args: {
        slug: v.string(),
        title: v.string(),
        authorName: v.optional(v.string()),
        excerpt: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.createPost, args);
      },
    }),

    updatePost: mutationGeneric({
      args: {
        postId: v.string(),
        patch: v.object({
          slug: v.optional(v.string()),
          title: v.optional(v.string()),
          status: v.optional(
            v.union(v.literal("draft"), v.literal("published")),
          ),
          publishedAt: v.optional(v.number()),
          authorName: v.optional(v.string()),
          excerpt: v.optional(v.string()),
          metaTitle: v.optional(v.string()),
          metaDescription: v.optional(v.string()),
          canonicalPath: v.optional(v.string()),
          ogImageUrl: v.optional(v.string()),
          twitterImageUrl: v.optional(v.string()),
          featuredImageUrl: v.optional(v.string()),
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
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.updatePost, {
          postId: args.postId as never,
          patch: args.patch,
        });
      },
    }),

    publishPost: mutationGeneric({
      args: { postId: v.string() },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.publishPost, {
          postId: args.postId as never,
        });
      },
    }),

    unpublishPost: mutationGeneric({
      args: { postId: v.string() },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.unpublishPost, {
          postId: args.postId as never,
        });
      },
    }),

    deletePost: mutationGeneric({
      args: { postId: v.string() },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.deletePost, {
          postId: args.postId as never,
        });
      },
    }),

    replacePostBlocks: mutationGeneric({
      args: {
        postId: v.string(),
        blocks: v.array(
          v.object({
            order: v.number(),
            block: blockValidator,
          }),
        ),
      },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.replacePostBlocks, {
          postId: args.postId as never,
          blocks: args.blocks as never,
        });
      },
    }),

    upsertSiteSettings: mutationGeneric({
      args: {
        siteName: v.string(),
        baseUrl: v.string(),
        defaultOgImageUrl: v.optional(v.string()),
        locale: v.optional(v.string()),
        defaultRobots: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        await auth(ctx, { type: "adminWrite" });
        return await ctx.runMutation(component.blog.upsertSiteSettings, args);
      },
    }),
  };
}
