# Convex host reference (copy into your app)

These files mirror a minimal **Convex host** for `basic-blog-convex-blog-cms`: component registration, `makeBlogAdminAPI` (including `generateUploadUrl` for file storage), and RSS/sitemap HTTP routes.

Copy the `convex/` tree into your project (merge with your existing `convex/`). You must run `npx convex dev` so `_generated/` exists. Adjust paths and env vars per [SETUP.md](../SETUP.md).

For a **runnable** copy of this tree in the monorepo (same files, ready to link to a Convex project), see [examples/convex-host](../../examples/convex-host).
