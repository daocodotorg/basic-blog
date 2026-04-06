# Example Convex host

Minimal runnable **Convex host** for `basic-blog-convex-blog-cms`. [`convex/blog.ts`](./convex/blog.ts) spreads **`makeBlogAdminAPI`**, which exposes **`generateUploadUrl`** on `blog` so the bundled admin can upload images—same auth as saving posts (`BLOG_ADMIN_API_KEY` / `auth`).

## Setup

From the monorepo root:

```bash
pnpm install
cd examples/convex-host
npx convex dev
```

Link or create a Convex project when prompted. This pushes `blog.*` (including `generateUploadUrl`) to your deployment.

## Run the admin UI

Point `convex-blog-admin` at the same deployment URL:

```bash
cd ../../packages/convex-blog-cms
CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" pnpm exec convex-blog-admin serve
```

Or from any project that has `basic-blog-convex-blog-cms` installed, with `CONVEX_URL` set to this host’s deployment.

## Copy into your own app

You can copy the `convex/` tree from this folder into your app (merge with your existing `convex/`). See [docs/SETUP.md](../../docs/SETUP.md).
