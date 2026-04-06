import { makeBlogAdminAPI } from "basic-blog-convex-blog-cms";
import type { ComponentApi } from "basic-blog-convex-blog-cms/_generated/component";
import { components } from "./_generated/api.js";

/**
 * Same host API as [examples/convex-host](../../convex-host/convex/blog.ts).
 * Set `BLOG_ADMIN_API_KEY` in Convex for admin + image uploads; pass it to `convex-blog-admin serve`.
 *
 * `ComponentApi` assertion: checked-in `convex/_generated` uses `componentsGeneric()` until
 * `npx convex dev` replaces it with typed codegen.
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
  generateUploadUrl,
} = makeBlogAdminAPI(components.blogCms as unknown as ComponentApi, {
  adminApiKeySecret: process.env.BLOG_ADMIN_API_KEY,
  auth: async () => {},
});
