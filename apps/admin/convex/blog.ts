import { makeBlogAdminAPI } from "@basic-blog/convex-blog-cms";
import { components } from "./_generated/api.js";

/**
 * Simple token auth (demo): set the same secret in Convex (`BLOG_ADMIN_API_KEY`) and in Next
 * (`NEXT_PUBLIC_BLOG_ADMIN_API_KEY`). For production, remove those env vars and implement `auth`
 * with Convex Auth or similar (see package README).
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
      "Admin API disabled. Set BLOG_ADMIN_API_KEY in Convex and NEXT_PUBLIC_BLOG_ADMIN_API_KEY in .env.local, or replace this callback with real auth (see README).",
    );
  },
});
