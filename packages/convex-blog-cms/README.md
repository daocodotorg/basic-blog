# `basic-blog-convex-blog-cms`

**Published npm package:** headless **blog and CMS** on **Convex**—isolated component tables (`posts`, `postBlocks`, `siteSettings`), validated queries and mutations, **Convex file storage** for images, and a **bundled TipTap admin** you run with **`npx blog-admin-serve`** (recommended) or **`npx convex-blog-admin serve`**.

Also ships **TypeScript helpers** to mount a host API (`makeBlogAdminAPI`) and, optionally, **Next.js** metadata, **RSS**, **sitemap**, and **JSON-LD**. **Public site rendering is your app’s job:** use hydrated DTOs from public queries and your own React (or see the [reference UI](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui) and [Next.js example](https://github.com/daocodotorg/basic-blog/tree/main/examples/next-app) in the repo).

Follows [Convex component authoring](https://docs.convex.dev/components/authoring): `convex.config`, `ComponentApi`, and a `./test` entry for `convex-test`.

## Install

```bash
npm install basic-blog-convex-blog-cms convex
```

**Peer dependencies:** `convex` (^1.33.1). Optional: `next` (^14 || ^15 || ^16) for `./next` helpers.

## Demo (this repository)

To run the **minimal Convex host** that exercises this component from a checkout of [basic-blog](https://github.com/daocodotorg/basic-blog):

1. From the monorepo root: `pnpm install`
2. `cd examples/convex-host` and run `npx convex dev` (link or create a Convex project when prompted).
3. From the monorepo root: `CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" pnpm blog:admin`. Or from `packages/convex-blog-cms`: `pnpm blog:admin`. From any project that depends on this package: `npx blog-admin-serve` or `npx convex-blog-admin serve`.

Open **http://127.0.0.1:3847/admin**. See [examples/convex-host/README.md](https://github.com/daocodotorg/basic-blog/blob/main/examples/convex-host/README.md) for details.

## Start the admin panel

This package ships a **pre-built admin UI** and two CLIs: **`blog-admin-serve`** (wrapper: reads `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL`, normalizes `.convex.site` → `.convex.cloud`, runs the pinned `convex-blog-admin`) and **`convex-blog-admin`** (underlying `serve` command). You do **not** need to scaffold a Next.js app for the default workflow: you wire Convex once, then run one command and open a local URL in the browser.

### Prerequisites


| You need                                              | Why                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basic-blog-convex-blog-cms` installed                | Supplies `blog-admin-serve`, `convex-blog-admin`, and the static UI under `dist/admin-spa`.                                                                                                                                                                                  |
| Component + `**makeBlogAdminAPI`** in your Convex app | The admin talks to your deployment using `**blog.***` queries/mutations (e.g. `convex/blog.ts`), including `**blog.generateUploadUrl**` for image uploads. See **Register the component** and **Host API: `makeBlogAdminAPI`** below, and the full [Setup guide](https://github.com/daocodotorg/basic-blog/blob/main/docs/SETUP.md). |
| Your Convex **deployment URL**                        | Use **`CONVEX_URL`** or **`NEXT_PUBLIC_CONVEX_URL`** (wrapper accepts either). Must be the **`.convex.cloud`** deployment URL for the JS client; if you only have a **`.convex.site`** HTTP Actions URL, `blog-admin-serve` rewrites it to `.convex.cloud` and warns.        |


### Steps (bundled UI — recommended)

1. **Install** in the project that contains your Convex backend (or any project where you will run the CLI):
  ```bash
   npm install basic-blog-convex-blog-cms
  ```
2. **Implement and deploy** the host Convex API (`convex/convex.config.ts`, `convex/blog.ts` exporting everything from `makeBlogAdminAPI`, including `generateUploadUrl`) so functions are available on the deployment you will target. Follow [Setup](https://github.com/daocodotorg/basic-blog/blob/main/docs/SETUP.md) if you have not done this yet.
3. **Start the admin** from that project’s directory (so `node_modules` resolves). Prefer the wrapper (same env vars as a Next.js app, no extra `serve` token):
  ```bash
   CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx blog-admin-serve
  ```
  Equivalent low-level command:
  ```bash
   CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx convex-blog-admin serve
  ```
4. **Open** the UI in your browser:
  **[http://127.0.0.1:3847/admin](http://127.0.0.1:3847/admin)**
  - Default listen address: **127.0.0.1**, default port: **3847**.
  - Another port: `npx blog-admin-serve --port 3001` (or `npx convex-blog-admin serve --port 3001`).
  - Optional: **`BLOG_ADMIN_PORT`** if you omit `--port` (wrapper only).

**Token auth (optional, demo-style):** If you set `BLOG_ADMIN_API_KEY` in Convex (`npx convex env set …`), pass the same value when serving so the browser can call admin APIs:

```bash
CONVEX_URL="https://…" BLOG_ADMIN_API_KEY="your-secret" npx blog-admin-serve
```

**npm script (optional):** add to your app’s `package.json`:

```json
{
  "scripts": {
    "cms:admin": "blog-admin-serve"
  }
}
```

Then run `CONVEX_URL="https://…" npm run cms:admin`, or load env vars from a file (e.g. `[dotenv-cli](https://www.npmjs.com/package/dotenv-cli)`).

**What’s happening:** `npx blog-admin-serve` runs a small launcher that sets `CONVEX_URL` and spawns `convex-blog-admin serve` from the **same installed package** (no extra `npx` fetch). The `serve` command serves the built files in `**node_modules/basic-blog-convex-blog-cms/dist/admin-spa**` and exposes `**GET /config.json**` using `CONVEX_URL` (and optional `BLOG_ADMIN_API_KEY`) so the UI connects to **your** deployment. Nothing is copied into your repo.

## Register the component

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import blogCms from "basic-blog-convex-blog-cms/convex.config.js";

const app = defineApp();
app.use(blogCms);
export default app;
```

The default component name is `**blogCms**`, so your generated API exposes `components.blogCms`. This matches:

```ts
export const BLOG_CMS_COMPONENT_NAME = "blogCms" as const;
```

Import `BLOG_CMS_COMPONENT_NAME` from this package if you want to avoid typos in docs or tooling (the runtime registration still uses `defineComponent("blogCms")` in the published component).

## Host API: `makeBlogAdminAPI`

```ts
import { makeBlogAdminAPI } from "basic-blog-convex-blog-cms";
import { components } from "./_generated/api.js";

export const { getPublishedPostBySlug, listPublishedPosts, generateUploadUrl, /* ... */ } =
  makeBlogAdminAPI(components.blogCms, {
    // Optional: shared secret checked on the server; clients pass `adminApiKey` on each admin call.
    // adminApiKeySecret: process.env.BLOG_ADMIN_API_KEY,
    auth: async (ctx, operation) => {
      if (operation.type === "adminRead" || operation.type === "adminWrite") {
        // your auth (e.g. Convex Auth) — skipped when adminApiKeySecret is set and key matches
      }
    },
  });
```

Public read queries do not call `auth`. Admin operations use `**adminApiKeySecret**` (if set; optionally strict) or `**auth**`.

## Configuration

### Environment variables (Convex)

Set with `npx convex env set NAME value` or the Convex dashboard.


| Variable             | When                        | Purpose                                                                                                                                                                                                                                                                 |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOG_ADMIN_API_KEY` | Optional simple token auth  | If set, clients may pass matching `adminApiKey`. Missing key is allowed unless you pass `strictAdminApiKey: true` to `makeBlogAdminAPI`. **Treat like a password** when you rely on it; prefer Convex Auth for production.                                            |

`blog.generateUploadUrl` (from `makeBlogAdminAPI`) handles [file storage](https://docs.convex.dev/file-storage) uploads with the same admin auth as other writes; no separate env var for uploads.


### Next.js / browser


| Variable                         | Required                               | Purpose                                                                                                                                                 |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`         | Yes for Convex React / `convex/nextjs` | Your deployment URL (from `npx convex dev`).                                                                                                            |
| `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` | Only with simple token auth            | Must match `BLOG_ADMIN_API_KEY` if you use that flow from a browser admin UI. **Exposed to the client** — dev/demo only; use Convex Auth in production. |


### `makeBlogAdminAPI` auth

The component does **not** call `ctx.auth` internally. Your host `convex/blog.ts` passes options to `makeBlogAdminAPI`:

- `**adminApiKeySecret`**: If set (e.g. `process.env.BLOG_ADMIN_API_KEY`), clients may pass `adminApiKey` matching the secret; the `auth` callback is **not** run when the key matches. If the secret is set but the client omits `adminApiKey`, access is still allowed by default; set `**strictAdminApiKey: true**` to require the token whenever the secret is configured.
- `**auth`**: When `adminApiKeySecret` is unset (or empty), this runs for every admin operation. Use `**adminRead`** / `**adminWrite**` to enforce Convex Auth, sessions, or roles (or a no-op for an open dev admin).
- **Public** queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) never use these paths.

`makeBlogAdminAPI` resolves Convex file storage ids to HTTPS URLs on public reads. `getPublishedPostBySlug` / `listPublishedPosts` / `getPublicSiteSettings` return **hydrated** DTOs suitable for SEO helpers. `getPostForAdmin` returns raw `post` and `blocks` (including `storageId` fields where used) plus `**hydratedPost`** and `**hydratedBlocks`** for previews.

### Component instance name

The default registration name is `**blogCms`**, so generated code uses `components.blogCms` in `makeBlogAdminAPI(components.blogCms, …)`. If you register the component under a different name with `app.use`, pass that name instead. The package exports `BLOG_CMS_COMPONENT_NAME` (`"blogCms"`) to avoid typos.

### HTTP routes (RSS / sitemap)

RSS and sitemap live in the **host** app, not inside the component. Mount `httpAction` routes in your `convex/http.ts` (see the [reference http.ts](https://github.com/daocodotorg/basic-blog/blob/main/docs/reference/convex-host/convex/http.ts) in this repo). Typical paths: `GET /rss.xml`, `GET /sitemap.xml`.

### Site settings (global)

The component stores a single **`siteSettings`** row (key `default`) edited from the bundled admin at **Site settings** (`/admin/settings`). Values are the canonical place for **public-site identity and URL base** used across SEO helpers; they live in Convex so you can change branding or the public origin **without redeploying** the host app.

| Field | Purpose |
|-------|---------|
| **Site name** | Default site title and `title.template` for Next.js via `siteSettingsToDefaultMetadata` (`%s \| {siteName}`). |
| **Base URL** (`https://…`, no trailing slash required) | Origin for absolute canonical URLs, Open Graph `url`, JSON-LD, RSS links, and sitemap `loc`. Should match the URL visitors use in production. |
| **Default OG image URL** | Fallback when a post has no OG/featured image and no inline image applies—used by `resolvePrimaryImage` and thus `postToNextMetadata` / social previews. Optional HTTPS URL. |

**Consuming settings in your app:** use the public query **`getPublicSiteSettings`** from `makeBlogAdminAPI` (returns a hydrated **`SiteSettingsDTO`**). Pass that object into:

- **`postToNextMetadata`** and **`siteSettingsToDefaultMetadata`** (`basic-blog-convex-blog-cms/next`)
- **`buildRssXml`**, **`postsToSitemapEntries`** + **`buildSitemapXml`** (URLs plus optional image metadata in one sitemap), **`buildArticleJsonLd`**, **`buildWebSiteJsonLd`**, as shown in the [reference `http.ts`](https://github.com/daocodotorg/basic-blog/blob/main/docs/reference/convex-host/convex/http.ts)

Your visitor-facing routes (e.g. Next.js `app/blog/[slug]`) should combine **post + blocks + site** from Convex so metadata and absolute links stay consistent with the CMS.

### SEO and URLs (routing)

- Set **`baseUrl`** in site settings to your real public origin (see table above).
- Match post URL paths in HTTP handlers and in your framework to the same pattern (e.g. `/blog/{slug}` in Next.js and in sitemap/RSS builders).

## Rendering (bring your own UI)

For **visitor-facing** pages, this package does **not** ship a bundled blog layout. Import **PostDTO**, **BlockDTO**, and SEO helpers from **basic-blog-convex-blog-cms/next** (or the root export for `makeBlogAdminAPI` and hydration helpers). See [docs/RENDERING.md](https://github.com/daocodotorg/basic-blog/blob/main/docs/RENDERING.md). For example **BlogPost** / **BlockRenderer** implementations, see [examples/blog-ui](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui) in the repo (reference only — not an npm package).

### Migration from `basic-blog-convex-blog-cms/react`

That export was removed. Replace imports with:

- Types: `basic-blog-convex-blog-cms/next`
- Components: copy or adapt from `[examples/blog-ui](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui)` (reference implementation in the repo, not published).

## Package exports


| Export path                                       | Purpose                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `basic-blog-convex-blog-cms`                      | `makeBlogAdminAPI`, types, hydration helpers                                              |
| `basic-blog-convex-blog-cms/convex.config`        | `defineComponent` default for `app.use()`                                                 |
| `basic-blog-convex-blog-cms/next`                 | `PostDTO` / `BlockDTO`, `postToNextMetadata`, `resolvePrimaryImage`, RSS/sitemap builders |
| `basic-blog-convex-blog-cms/test`                 | `convex-test` registration helper                                                         |
| `basic-blog-convex-blog-cms/_generated/component` | `ComponentApi` type for `components.blogCms`                                              |


## Development / codegen

The bundled admin SPA served by `convex-blog-admin serve` is built from `admin-spa/` (`npm run build` runs `vite build` after `tsc`).

Consumers run `npx convex dev` as usual. **Package maintainers** also run component codegen before build:

```bash
npx convex codegen --component-dir ./src/component
npm run build
```

See [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## Test the package before publishing

From the monorepo root (or after cloning):

```bash
pnpm install
pnpm --filter basic-blog-convex-blog-cms run build
pnpm --filter basic-blog-convex-blog-cms test
cd packages/convex-blog-cms && pnpm pack
```

Install the tarball in another project with `npm install /path/to/basic-blog-convex-blog-cms-0.1.0.tgz` (version from `package.json`). For release tagging and npm publish, see [PUBLISHING.md](./PUBLISHING.md).

## More in the repository

Longer copy-paste walkthroughs (Next.js routes, `fetchQuery`, metadata) and the same topics in standalone pages:

- [Setup](https://github.com/daocodotorg/basic-blog/blob/main/docs/SETUP.md)
- [Configuration (reference)](https://github.com/daocodotorg/basic-blog/blob/main/docs/CONFIGURATION.md) — mirrors the configuration section above with repo file links
- [Rendering](https://github.com/daocodotorg/basic-blog/blob/main/docs/RENDERING.md) — DTOs, queries, and optional example UI

## License

Apache-2.0 (see repository `LICENSE`). Bundled third-party code in `dist/admin-spa` is summarized in [`NOTICE`](./NOTICE).