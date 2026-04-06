# Example: Convex-only host

Smallest **runnable** integration of **`basic-blog-convex-blog-cms`**: register the component, spread **`makeBlogAdminAPI`** in [`convex/blog.ts`](./convex/blog.ts) (including **`blog.generateUploadUrl`** for the bundled admin), and optional RSS/sitemap routes in `convex/http.ts`. Same **admin auth** as post writes (`BLOG_ADMIN_API_KEY` and/or your **`auth`** callback).

## Setup

From the monorepo root:

```bash
pnpm install
cd examples/convex-host
npx convex dev
```

Link or create a Convex project when prompted. This pushes `blog.*` (including `generateUploadUrl`) to your deployment.

## Run the admin UI

From the **monorepo root** (easiest):

```bash
cd ../..
CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" pnpm blog:admin
```

Or from `packages/convex-blog-cms`: `pnpm blog:admin` with the same env. From any project that depends on this package: `npx blog-admin-serve` (or `npx convex-blog-admin serve`) with `CONVEX_URL` set to this host’s deployment.

## Copy into your own app

You can copy the `convex/` tree from this folder into your app (merge with your existing `convex/`). See [docs/SETUP.md](../../docs/SETUP.md).
