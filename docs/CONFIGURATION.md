# Configuration reference

Environment variables, Convex settings, and integration options for **`basic-blog-convex-blog-cms`**. For a full walkthrough, see [SETUP.md](./SETUP.md).

## Convex (deployment)

Set with `npx convex env set NAME value` (or the Convex dashboard).

| Variable | Required | Purpose |
|----------|----------|---------|
| `BLOG_ADMIN_API_KEY` | Optional | If set, clients may pass matching `adminApiKey`. Missing key is allowed unless the host sets `strictAdminApiKey: true` in `makeBlogAdminAPI`. **Not for production** as sole security; use Convex Auth. |

Image uploads use `blog.generateUploadUrl` from `makeBlogAdminAPI` (same auth as other admin writes). No extra Convex env var is required for uploads.

## Bundled admin (`blog-admin-serve` / `convex-blog-admin serve`)

Prefer **`npx blog-admin-serve`**: it accepts the same URL env vars as a typical web app and runs the bundled `convex-blog-admin serve` from the installed package.

Set in the shell when you run the CLI (or via a tool like [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)):

| Variable | Required | Purpose |
|----------|----------|---------|
| `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL` | Yes | HTTPS deployment URL (`.convex.cloud`). Set at least one. Both **`blog-admin-serve`** and **`convex-blog-admin serve`** read either variable. |
| `BLOG_ADMIN_PORT` | Optional | Default port when **`blog-admin-serve`** is used without `--port` (underlying CLI default remains **3847**). |
| `BLOG_ADMIN_API_KEY` | Optional | If you use token auth, must match Convex `BLOG_ADMIN_API_KEY` when passing `adminApiKey` from the CLI. Omit for open local admin unless the host uses `strictAdminApiKey`. |

If the URL ends in **`.convex.site`**, **`blog-admin-serve`** rewrites it to **`.convex.cloud`** (HTTP Actions host vs JS client URL) and prints a warning.

## Next.js or other browser apps

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes for Convex React / `convex/nextjs` | Your deployment URL (from `npx convex dev`). |
| `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` | With simple token auth from the browser | Must match `BLOG_ADMIN_API_KEY` when using that flow. **Exposed to the client** — dev/demo only; use Convex Auth in production. |

## Host app: `makeBlogAdminAPI` auth

The package does **not** call `ctx.auth` inside the component. Your host [`convex/blog.ts`](./reference/convex-host/convex/blog.ts) configures `makeBlogAdminAPI` with:

- **`adminApiKeySecret`** (e.g. `process.env.BLOG_ADMIN_API_KEY`): when the client sends matching `adminApiKey`, that request is allowed without calling `auth`. If the secret is set but the client omits `adminApiKey`, access is still allowed by default; set **`strictAdminApiKey: true`** to require the token whenever the secret is configured.
- **`auth`**: when `adminApiKeySecret` is unset, runs for every admin operation — use Convex Auth, sessions, or a no-op for an open dev admin.

Public queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) never use these paths.

Replace token-only or open admin with real `auth` before shipping a public production site.

## Component instance name

The component is defined as `defineComponent("blogCms")` in [`packages/convex-blog-cms/src/component/convex.config.ts`](../packages/convex-blog-cms/src/component/convex.config.ts).

After `app.use(blogCms)` in the host [`convex/convex.config.ts`](./reference/convex-host/convex/convex.config.ts), Convex exposes **`components.blogCms`**. If you register the component with a custom name (see Convex `app.use` options), use that name in `makeBlogAdminAPI(components.yourName, …)`.

The package exports **`BLOG_CMS_COMPONENT_NAME`** (see package README) for documentation parity with the default string `"blogCms"`.

## HTTP routes (host)

RSS and sitemap are **not** inside the component. Mount routes in the host [`convex/http.ts`](./reference/convex-host/convex/http.ts). Paths in the reference sample:

- `GET /rss.xml`
- `GET /sitemap.xml`

## SEO / URLs

Global **site settings** (site name, base URL, default OG image) are stored in Convex and edited in the bundled admin (**Site settings**). They drive canonical URLs, default Next.js metadata, RSS/sitemap output, and OG fallbacks. See the package README section [Site settings (global)](https://github.com/daocodotorg/basic-blog/blob/main/packages/convex-blog-cms/README.md#site-settings-global) for field meanings and how **`getPublicSiteSettings`** feeds **`postToNextMetadata`** and related helpers.

- **`baseUrl`** must match your production public origin (scheme + host, no path).
- Post paths in the sample HTTP handlers use `/blog/{slug}`; keep that aligned with your real routes and with how you call SEO builders.
