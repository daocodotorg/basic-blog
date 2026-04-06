# Configuration reference

Single place for environment variables, Convex settings, and integration knobs. For a full walkthrough, see [SETUP.md](./SETUP.md).

## Convex (deployment)

Set with `npx convex env set NAME value` (or the Convex dashboard).

| Variable | Required | Purpose |
|----------|----------|---------|
| `BLOG_ADMIN_API_KEY` | Optional | If set, admin API calls must include matching `adminApiKey` (see package README). **Not for production** as primary security; use Convex Auth. |
| `DEMO_ADMIN_MODE` | Optional | Set to `true` to allow the sample host’s `media.generateUploadUrl` (Convex file storage uploads). **Do not enable in production** without replacing with proper auth. |

## Bundled admin (`convex-blog-admin serve`)

Set in the shell when you run the CLI (or via a tool like [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)):

| Variable | Required | Purpose |
|----------|----------|---------|
| `CONVEX_URL` | Yes | HTTPS URL of your Convex deployment (same as you would use for `NEXT_PUBLIC_CONVEX_URL` in a web app). |
| `BLOG_ADMIN_API_KEY` | With token auth | Must match Convex `BLOG_ADMIN_API_KEY` so the browser can pass `adminApiKey` on admin calls. |

## Next.js or other browser apps

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes for Convex React / `convex/nextjs` | Your deployment URL (from `npx convex dev`). |
| `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` | With simple token auth from the browser | Must match `BLOG_ADMIN_API_KEY` when using that flow. **Exposed to the client** — dev/demo only; use Convex Auth in production. |

## Host app: `makeBlogAdminAPI` auth

The package does **not** call `ctx.auth` inside the component. Your host [`convex/blog.ts`](./reference/convex-host/convex/blog.ts) configures `makeBlogAdminAPI` with either:

- **`adminApiKeySecret`** (e.g. `process.env.BLOG_ADMIN_API_KEY`): admin calls include `adminApiKey` matching this value; `auth` is not used when the key matches.
- **`auth`**: when `adminApiKeySecret` is unset, use **`adminRead`** / **`adminWrite`** to enforce Convex Auth, sessions, or roles.

Public queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) never use these paths.

Replace token auth with real `auth` before shipping to production.

## Component instance name

The component is defined as `defineComponent("blogCms")` in [`packages/convex-blog-cms/src/component/convex.config.ts`](../packages/convex-blog-cms/src/component/convex.config.ts).

After `app.use(blogCms)` in the host [`convex/convex.config.ts`](./reference/convex-host/convex/convex.config.ts), Convex exposes **`components.blogCms`**. If you register the component with a custom name (see Convex `app.use` options), use that name in `makeBlogAdminAPI(components.yourName, …)`.

The package exports **`BLOG_CMS_COMPONENT_NAME`** (see package README) for documentation parity with the default string `"blogCms"`.

## HTTP routes (host)

RSS and sitemap are **not** inside the component. Mount routes in the host [`convex/http.ts`](./reference/convex-host/convex/http.ts). Paths in the reference sample:

- `GET /rss.xml`
- `GET /sitemap.xml`

## SEO / URLs

- **Site settings** `baseUrl` should match your public site origin (used for canonical URLs, OG, sitemap `loc`).
- Post paths in the sample HTTP handlers use `/blog/{slug}`; adjust to match your real routes if different.
