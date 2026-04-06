# Example: Next.js + Convex blog CMS

**Runnable** [**Next.js 16**](https://nextjs.org/) (App Router) demo for **`basic-blog-convex-blog-cms`**:

- Same Convex **`blog.*` surface** as [`examples/convex-host`](../convex-host): `makeBlogAdminAPI`, RSS/sitemap `http` routes, uploads for the admin.
- Public pages use **`fetchQuery`** from `convex/nextjs` (see [docs/SETUP.md](../../docs/SETUP.md) for production patterns).
- Blog UI is a vendored copy of [`examples/blog-ui`](../blog-ui) under [`components/blog-ui`](./components/blog-ui) (`BlogPost`, `BlockRenderer`, `BlogList`).

## Prerequisites

- Monorepo dependencies installed from the repo root: `pnpm install`
- Node 18+

## 1. Convex backend

From this directory:

```bash
cd examples/next-app
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_CONVEX_URL to your deployment (shown after `npx convex dev` links a project)
npx convex dev
```

Leave `convex dev` running, or deploy as you normally would. This generates `convex/_generated/` (gitignored).

## 2. Next.js frontend

In a second terminal:

```bash
cd examples/next-app
pnpm dev
```

Open [http://localhost:3000/blog](http://localhost:3000/blog). Until you publish posts and configure **site settings** in the admin, the list may be empty or RSS/sitemap may return 404 — that is expected.

### Checked-in `convex/_generated` stub

This example ships minimal [`convex/_generated/api.js`](./convex/_generated/api.js) / [`api.d.ts`](./convex/_generated/api.d.ts) so TypeScript and `pnpm dev` work **before** you link a Convex project. After `npx convex dev`, Convex will replace these files with deployment-specific codegen. [`convex/blog.ts`](./convex/blog.ts) uses a narrow type assertion for `components.blogCms` until then.

### Production build

`pnpm build:next` runs `next build` without requiring a live Convex URL at build time: blog routes use `dynamic = "force-dynamic"` so they are not statically prerendered. You still need `NEXT_PUBLIC_CONVEX_URL` at **runtime** when those routes are hit.

## 3. Create posts (bundled admin)

Use the same deployment URL as in `.env.local`:

```bash
cd ../../packages/convex-blog-cms
CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" pnpm exec convex-blog-admin serve
```

See [examples/convex-host/README.md](../convex-host/README.md) for `BLOG_ADMIN_API_KEY` if you use token auth.

## Layout

| Path | Role |
|------|------|
| [`app/blog/page.tsx`](./app/blog/page.tsx) | Post list — `listPublishedPosts` + `BlogList` |
| [`app/blog/[slug]/page.tsx`](./app/blog/[slug]/page.tsx) | Single post + `generateMetadata` via `postToNextMetadata` + `BlogPost` |
| [`convex/blog.ts`](./convex/blog.ts) | `makeBlogAdminAPI` exports |
| [`convex/http.ts`](./convex/http.ts) | `/rss.xml`, `/sitemap.xml` |

RSS and sitemap URLs use the **Convex HTTP actions** base URL (site URL + Convex path), not `localhost:3000` — see the package README.
