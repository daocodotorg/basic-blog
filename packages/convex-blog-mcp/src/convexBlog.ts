import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

/** Blog admin Convex module API shape (e.g. anyApi.blog from convex/blog.ts). */
type BlogAdminModuleApi = {
  listPostsForAdmin: (typeof anyApi)["blog"]["listPostsForAdmin"];
  createPost: (typeof anyApi)["blog"]["createPost"];
  updatePost: (typeof anyApi)["blog"]["updatePost"];
};

function blogAdminModule(moduleName: string): BlogAdminModuleApi {
  const mod = (anyApi as unknown as Record<string, unknown>)[moduleName];
  if (typeof mod !== "object" || mod === null) {
    throw new Error(
      `Invalid CONVEX_BLOG_MODULE "${moduleName}": not a module on anyApi`,
    );
  }
  const m = mod as Record<string, unknown>;
  if (!m.listPostsForAdmin || !m.createPost || !m.updatePost) {
    throw new Error(
      `Invalid CONVEX_BLOG_MODULE "${moduleName}": expected listPostsForAdmin, createPost, updatePost`,
    );
  }
  return mod as BlogAdminModuleApi;
}

export type AdminArgs = { adminApiKey?: string };

export function createBlogConvexBridge(env: {
  convexUrl: string;
  blogModule: string;
  adminApiKey?: string;
}) {
  const client = new ConvexHttpClient(env.convexUrl);
  const api = blogAdminModule(env.blogModule);

  function withAdmin<T extends Record<string, unknown>>(args: T): T & AdminArgs {
    if (env.adminApiKey === undefined) {
      return args;
    }
    return { ...args, adminApiKey: env.adminApiKey };
  }

  return {
    async listPosts(limit?: number) {
      return await client.query(
        api.listPostsForAdmin,
        withAdmin({ limit }),
      );
    },
    async createPost(args: {
      slug: string;
      title: string;
      authorName?: string;
      excerpt?: string;
    }) {
      return await client.mutation(api.createPost, withAdmin(args));
    },
    async updatePost(postId: string, patch: Record<string, unknown>) {
      return await client.mutation(
        api.updatePost,
        withAdmin({ postId, patch }),
      );
    },
  };
}

export type BlogConvexBridge = ReturnType<typeof createBlogConvexBridge>;
