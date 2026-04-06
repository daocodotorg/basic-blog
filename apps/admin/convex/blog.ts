import { makeBlogAdminAPI } from "@basic-blog/convex-blog-cms";
import { components } from "./_generated/api.js";

/**
 * Demo-only: set `DEMO_ADMIN_MODE=true` in Convex env to enable admin mutations/queries.
 * Do not use in production.
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
  auth: async (_ctx, op) => {
    if (process.env.DEMO_ADMIN_MODE === "true") {
      return;
    }
    if (op.type === "adminRead" || op.type === "adminWrite") {
      throw new Error(
        "Admin API disabled. For local demo: `npx convex env set DEMO_ADMIN_MODE true`",
      );
    }
  },
});
