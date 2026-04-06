# Configuration reference

Single place for environment variables, Convex settings, and integration knobs. For a full walkthrough, see [SETUP.md](./SETUP.md).

## Convex (deployment)

Set with `npx convex env set NAME value` (or the Convex dashboard).

| Variable | Required | Purpose |
|----------|----------|---------|
| `DEMO_ADMIN_MODE` | For demo admin only | Set to `true` to allow `makeBlogAdminAPI` admin read/write paths used by the sample app. **Do not enable in production** without replacing auth. |
| `R2_TOKEN` | If using R2 | Cloudflare R2 API token ([R2 component](https://www.convex.dev/components/cloudflare-r2)). |
| `R2_ACCESS_KEY_ID` | If using R2 | R2 S3-compatible access key. |
| `R2_SECRET_ACCESS_KEY` | If using R2 | R2 secret. |
| `R2_ENDPOINT` | If using R2 | R2 endpoint URL. |
| `R2_BUCKET` | If using R2 | Bucket name. |

## Next.js (admin app)

Use `apps/admin/.env.local` (copy from [`apps/admin/.env.local.example`](../apps/admin/.env.local.example)).

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | HTTPS URL of your Convex deployment (from `pnpm exec convex dev`). |

## Host app: `makeBlogAdminAPI` auth

The package does **not** call `ctx.auth` inside the component. Your host [`convex/blog.ts`](../apps/admin/convex/blog.ts) must pass an `auth` callback:

- **`adminRead`** / **`adminWrite`**: enforce your rules (session, JWT, role, etc.).
- Public queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) are exported without admin auth.

Replace the demo `DEMO_ADMIN_MODE` check before shipping.

## Component instance name

The component is defined as `defineComponent("blogCms")` in [`packages/convex-blog-cms/src/component/convex.config.ts`](../packages/convex-blog-cms/src/component/convex.config.ts).

After `app.use(blogCms)` in the host [`convex/convex.config.ts`](../apps/admin/convex/convex.config.ts), Convex exposes **`components.blogCms`**. If you register the component with a custom name (see Convex `app.use` options), use that name in `makeBlogAdminAPI(components.yourName, …)`.

The package exports **`BLOG_CMS_COMPONENT_NAME`** (see package README) for documentation parity with the default string `"blogCms"`.

## HTTP routes (host)

RSS and sitemap are **not** inside the component. Mount routes in the host [`convex/http.ts`](../apps/admin/convex/http.ts). Paths in the sample app:

- `GET /rss.xml`
- `GET /sitemap.xml`

## SEO / URLs

- **Site settings** `baseUrl` should match your public site origin (used for canonical URLs, OG, sitemap `loc`).
- Post paths in the sample HTTP handlers use `/blog/{slug}`; adjust to match your Next.js routes if different.
