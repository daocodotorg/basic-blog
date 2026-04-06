import { makeBlogAdminAPI } from "basic-blog-convex-blog-cms";
import { components } from "./_generated/api.js";

/**
 * Simple token auth (demo): set the same secret in Convex (`BLOG_ADMIN_API_KEY`) and pass it
 * to `convex-blog-admin serve` (or `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` in a browser app). For
 * production, remove those env vars and implement `auth` with Convex Auth (see package README).
 */
export const {
  getPublishedPostBySlug,
  listPublishedPosts,
  getPublicSiteSettings,
  getPostForAdmin,
  listPostsForAdmin,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  replacePostBlocks,
  upsertSiteSettings,
} = makeBlogAdminAPI(components.blogCms, {
  adminApiKeySecret: process.env.BLOG_ADMIN_API_KEY,
  auth: async (_ctx, _op) => {
    throw new Error(
      "Admin API disabled. Set BLOG_ADMIN_API_KEY in Convex and the same value when running the admin UI, or replace this callback with real auth (see README).",
    );
  },
});
