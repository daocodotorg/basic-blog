# Configuration reference

Single place for environment variables, Convex settings, and integration knobs. For a full walkthrough, see [SETUP.md](./SETUP.md).

## Convex (deployment)

Set with `npx convex env set NAME value` (or the Convex dashboard).

| Variable | Required | Purpose |
|----------|----------|---------|
| `BLOG_ADMIN_API_KEY` | Optional | If set, admin API calls must include matching `adminApiKey` (see package README). Same value as `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` in the sample Next app for token auth. **Not for production** as primary security; use Convex Auth. |
| `DEMO_ADMIN_MODE` | Optional | Set to `true` to allow the sample app’s `media.generateUploadUrl` (Convex file storage uploads). **Do not enable in production** without replacing with proper auth. |

## Next.js (admin app)

Use `apps/admin/.env.local` (copy from [`apps/admin/.env.local.example`](../apps/admin/.env.local.example)).

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | HTTPS URL of your Convex deployment (from `pnpm exec convex dev`). |
| `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` | With token auth | Must match `BLOG_ADMIN_API_KEY` when using the sample admin’s simple token flow. Exposed to the browser. |

## Host app: `makeBlogAdminAPI` auth

The package does **not** call `ctx.auth` inside the component. Your host [`convex/blog.ts`](../apps/admin/convex/blog.ts) configures `makeBlogAdminAPI` with either:

- **`adminApiKeySecret`** (e.g. `process.env.BLOG_ADMIN_API_KEY`): admin calls include `adminApiKey` matching this value; `auth` is not used when the key matches.
- **`auth`**: when `adminApiKeySecret` is unset, use **`adminRead`** / **`adminWrite`** to enforce Convex Auth, sessions, or roles.

Public queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) never use these paths.

Replace token auth with real `auth` before shipping to production.

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
