import { mutationGeneric, queryGeneric } from "convex/server";
import type { Auth } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";
import { blockValidator } from "../component/schema.js";
import {
  hydrateBlocksForDTO,
  hydratePostDTO,
  hydrateSiteSettingsDTO,
} from "../hydrateMedia.js";
import type { BlockStored, PostStored, SiteSettingsStored } from "../seo/storedTypes.js";

export {
  hydrateBlockDTO,
  hydrateBlocksForDTO,
  hydratePostDTO,
  hydrateSiteSettingsDTO,
  type StorageUrlResolver,
} from "../hydrateMedia.js";
export type {
  BlockStored,
  ImageBlockStored,
  PostStored,
  SiteSettingsStored,
} from "../seo/storedTypes.js";

/** Default `defineComponent` name; host `components` key is usually `blogCms`. */
export const BLOG_CMS_COMPONENT_NAME = "blogCms" as const;

export type BlogAdminAuthContext = {
  auth: Auth;
};

export type BlogAdminOperation =
  | { type: "adminRead" }
  | { type: "adminWrite" };

const optionalAdminApiKey = {
  adminApiKey: v.optional(v.string()),
};

function stripAdminApiKey<T extends Record<string, unknown>>(
  args: T & { adminApiKey?: string },
): Omit<T, "adminApiKey"> {
  const { adminApiKey: _omit, ...rest } = args;
  return rest as Omit<T, "adminApiKey">;
}

/**
 * Host app calls this with `components.blogCms` and an auth callback.
 * Public read queries are unauthenticated. Admin operations use `auth` and/or token checks.
 *
 * **Token auth (`adminApiKeySecret`):** If set (e.g. `process.env.BLOG_ADMIN_API_KEY`), clients may pass
 * `adminApiKey` matching that value. By default (`strictAdminApiKey` false), a **missing** client key still
 * allows access (local dev convenience). A **wrong non-empty** key is always rejected. Set
 * `strictAdminApiKey: true` to require `adminApiKey` whenever the secret is configured (recommended for
 * production). When the secret is set and the client key matches, `auth` is not run.
 *
 * **No secret:** `auth` runs for every admin operation (use Convex Auth, or a no-op for a fully open dev admin).
 */
export function makeBlogAdminAPI(
  component: ComponentApi,
  options: {
    auth: (
      ctx: BlogAdminAuthContext,
      operation: BlogAdminOperation,
    ) => Promise<void>;
    /** Server-side secret; clients pass the same value as `adminApiKey` on each admin call. */
    adminApiKeySecret?: string;
    /**
     * When `adminApiKeySecret` is set, require clients to pass matching `adminApiKey` on every admin call.
     * Default `false`: missing `adminApiKey` is still allowed (optional token). Set `true` in production when
     * using shared token auth.
     */
    strictAdminApiKey?: boolean;
  },
) {
  const { auth } = options;
  const useApiKey =
    options.adminApiKeySecret !== undefined &&
    options.adminApiKeySecret !== "";
  const strictAdminApiKey = options.strictAdminApiKey === true;

  async function enforceAdmin(
    ctx: BlogAdminAuthContext,
    operation: BlogAdminOperation,
    args: { adminApiKey?: string },
  ): Promise<void> {
    if (useApiKey) {
      const secret = options.adminApiKeySecret as string;
      const clientKey = args.adminApiKey;
      if (clientKey === secret) {
        return;
      }
      const missing = clientKey === undefined || clientKey === "";
      if (missing) {
        if (strictAdminApiKey) {
          throw new Error("Unauthorized");
        }
        return;
      }
      throw new Error("Unauthorized");
    }
    await auth(ctx, operation);
  }

  function storageResolver(ctx: {
    storage: { getUrl: (id: string) => Promise<string | null> };
  }) {
    return (id: string) => ctx.storage.getUrl(id);
  }

  return {
    getPublishedPostBySlug: queryGeneric({
      args: { slug: v.string() },
      handler: async (ctx, args) => {
        const raw = (await ctx.runQuery(
          component.blog.getPublishedPostBySlug,
          args,
        )) as {
          post: PostStored;
          blocks: Array<{ order: number; block: BlockStored }>;
        } | null;
        if (raw === null) {
          return null;
        }
        const getUrl = storageResolver(ctx);
        const post = await hydratePostDTO(getUrl, raw.post);
        const blocks = await hydrateBlocksForDTO(getUrl, raw.blocks);
        return { post, blocks };
      },
    }),

    listPublishedPosts: queryGeneric({
      args: { limit: v.optional(v.number()) },
      handler: async (ctx, args) => {
        const rows = (await ctx.runQuery(
          component.blog.listPublishedPosts,
          args,
        )) as Array<
          PostStored & { _id: string; _creationTime: number }
        >;
        const getUrl = storageResolver(ctx);
        return await Promise.all(
          rows.map(async (row) => {
            const hydrated = await hydratePostDTO(getUrl, row);
            return {
              ...hydrated,
              _id: row._id,
              _creationTime: row._creationTime,
            };
          }),
        );
      },
    }),

    getPublicSiteSettings: queryGeneric({
      args: {},
      handler: async (ctx) => {
        const raw = await ctx.runQuery(
          component.blog.getPublicSiteSettings,
          {},
        );
        return await hydrateSiteSettingsDTO(
          storageResolver(ctx),
          raw as SiteSettingsStored | null,
        );
      },
    }),

    getPostForAdmin: queryGeneric({
      args: { slug: v.string(), ...optionalAdminApiKey },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminRead" }, args);
        const raw = (await ctx.runQuery(
          component.blog.getPostForAdmin,
          stripAdminApiKey(args),
        )) as {
          post: PostStored & { _id: string; _creationTime: number };
          blocks: Array<{ order: number; block: BlockStored }>;
        } | null;
        if (raw === null) {
          return null;
        }
        const getUrl = storageResolver(ctx);
        const hydratedPost = await hydratePostDTO(getUrl, raw.post);
        const hydratedBlocks = await hydrateBlocksForDTO(getUrl, raw.blocks);
        return {
          post: raw.post,
          blocks: raw.blocks,
          hydratedPost,
          hydratedBlocks,
        };
      },
    }),

    listPostsForAdmin: queryGeneric({
      args: { limit: v.optional(v.number()), ...optionalAdminApiKey },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminRead" }, args);
        return await ctx.runQuery(
          component.blog.listPostsForAdmin,
          stripAdminApiKey(args),
        );
      },
    }),

    createPost: mutationGeneric({
      args: {
        slug: v.string(),
        title: v.string(),
        authorName: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        ...optionalAdminApiKey,
      },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.runMutation(
          component.blog.createPost,
          stripAdminApiKey(args),
        );
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
        }),
        ...optionalAdminApiKey,
      },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        const rest = stripAdminApiKey(args);
        return await ctx.runMutation(component.blog.updatePost, {
          postId: rest.postId as never,
          patch: rest.patch,
        });
      },
    }),

    publishPost: mutationGeneric({
      args: { postId: v.string(), ...optionalAdminApiKey },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.runMutation(component.blog.publishPost, {
          postId: stripAdminApiKey(args).postId as never,
        });
      },
    }),

    unpublishPost: mutationGeneric({
      args: { postId: v.string(), ...optionalAdminApiKey },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.runMutation(component.blog.unpublishPost, {
          postId: stripAdminApiKey(args).postId as never,
        });
      },
    }),

    deletePost: mutationGeneric({
      args: { postId: v.string(), ...optionalAdminApiKey },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.runMutation(component.blog.deletePost, {
          postId: stripAdminApiKey(args).postId as never,
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
        ...optionalAdminApiKey,
      },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        const rest = stripAdminApiKey(args);
        return await ctx.runMutation(component.blog.replacePostBlocks, {
          postId: rest.postId as never,
          blocks: rest.blocks as never,
        });
      },
    }),

    upsertSiteSettings: mutationGeneric({
      args: {
        siteName: v.string(),
        baseUrl: v.string(),
        defaultOgImageUrl: v.optional(v.string()),
        defaultOgImageStorageId: v.optional(v.id("_storage")),
        locale: v.optional(v.string()),
        defaultRobots: v.optional(v.string()),
        ...optionalAdminApiKey,
      },
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.runMutation(
          component.blog.upsertSiteSettings,
          stripAdminApiKey(args),
        );
      },
    }),

    /**
     * Short-lived URL for [Convex file storage](https://docs.convex.dev/file-storage) uploads.
     * Same auth as other admin writes (`adminApiKey` / `auth`). Client POSTs the file; response JSON includes `storageId`.
     */
    generateUploadUrl: mutationGeneric({
      args: { ...optionalAdminApiKey },
      returns: v.string(),
      handler: async (ctx, args) => {
        await enforceAdmin(ctx, { type: "adminWrite" }, args);
        return await ctx.storage.generateUploadUrl();
      },
    }),
  };
}
