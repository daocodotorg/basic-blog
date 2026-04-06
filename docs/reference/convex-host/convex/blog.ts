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
  /**
   * Runs only when `BLOG_ADMIN_API_KEY` is **unset** (token mode off). No-op = open admin (dev).
   * For production without a shared token, replace with Convex Auth (see package README).
   */
  auth: async () => {},
  /** Require `adminApiKey` on every admin call when `BLOG_ADMIN_API_KEY` is set (recommended for prod). */
  // strictAdminApiKey: true,
});
