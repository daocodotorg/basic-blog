# `@basic-blog/convex-blog-cms`

A **Convex component** that provides a small blog/CMS backend (posts, ordered blocks, site settings) plus **client helpers** for wiring admin APIs and Next.js SEO (metadata, JSON-LD, RSS, sitemap). **Rendering is not included**—use hydrated DTOs from public queries and build your own UI, or copy the reference components from [`examples/blog-ui`](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui) in this monorepo.

Designed to match [Convex component authoring](https://docs.convex.dev/components/authoring): isolated tables, validated functions, and npm entry points for `convex.config`, client factories, and tests.

## Install

```bash
npm install @basic-blog/convex-blog-cms convex
```

**Peer dependencies:** `convex` (^1.33.1). Optional: `next` (^14 || ^15 || ^16) for `./next` helpers.

## Register the component

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import blogCms from "@basic-blog/convex-blog-cms/convex.config.js";

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
import { makeBlogAdminAPI } from "@basic-blog/convex-blog-cms";
import { components } from "./_generated/api.js";

export const { getPublishedPostBySlug, listPublishedPosts, /* ... */ } =
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

Public read queries do not call `auth`. Admin operations use `**adminApiKeySecret**` (if set) or `**auth**`.

## Configuration

### Environment variables (Convex)

Set with `npx convex env set NAME value` or the Convex dashboard.


| Variable                                                                           | When                                                                         | Purpose                                                                                                                                                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOG_ADMIN_API_KEY`                                                               | Optional simple token auth                                                   | If set, `makeBlogAdminAPI` requires every admin query/mutation to include `adminApiKey` matching this value. **Treat like a password**; prefer Convex Auth in production. |
| `DEMO_ADMIN_MODE` | Optional, demo uploads only | If `true`, the sample host can expose `generateUploadUrl` for [Convex file storage](https://docs.convex.dev/file-storage) uploads. **Do not enable in production** without real auth. Public reads resolve stored `Id<"_storage">` to HTTPS URLs in `makeBlogAdminAPI`. |


### Next.js / browser


| Variable                         | Required                               | Purpose                                                                                                                                                 |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`         | Yes for Convex React / `convex/nextjs` | Your deployment URL (from `npx convex dev`).                                                                                                            |
| `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` | Only with simple token auth            | Must match `BLOG_ADMIN_API_KEY` if you use that flow from a browser admin UI. **Exposed to the client** — dev/demo only; use Convex Auth in production. |


### `makeBlogAdminAPI` auth

The component does **not** call `ctx.auth` internally. Your host `convex/blog.ts` passes options to `makeBlogAdminAPI`:

- `**adminApiKeySecret`**: If set (e.g. `process.env.BLOG_ADMIN_API_KEY`), each admin function accepts an optional `adminApiKey` argument; when it equals the secret, the request is allowed and the `auth` callback is **not** run. Strip or avoid exposing this in production builds you ship to untrusted users.
- `**auth`**: When `adminApiKeySecret` is unset (or empty), this runs for every admin operation. Use `**adminRead**` / `**adminWrite**` to enforce Convex Auth, sessions, or roles.
- **Public** queries (`getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings`) never use these paths.

`makeBlogAdminAPI` resolves Convex file storage ids to HTTPS URLs on public reads. `getPublishedPostBySlug` / `listPublishedPosts` / `getPublicSiteSettings` return **hydrated** DTOs suitable for SEO helpers. `getPostForAdmin` returns raw `post` and `blocks` (including `storageId` fields where used) plus **`hydratedPost`** and **`hydratedBlocks`** for previews.

### Component instance name

The default registration name is `**blogCms`**, so generated code uses `components.blogCms` in `makeBlogAdminAPI(components.blogCms, …)`. If you register the component under a different name with `app.use`, pass that name instead. The package exports `BLOG_CMS_COMPONENT_NAME` (`"blogCms"`) to avoid typos.

### HTTP routes (RSS / sitemap)

RSS and sitemap live in the **host** app, not inside the component. Mount `httpAction` routes in your `convex/http.ts` (see the [sample http.ts](https://github.com/daocodotorg/basic-blog/blob/main/apps/admin/convex/http.ts) in this repo). Typical paths: `GET /rss.xml`, `GET /sitemap.xml`.

### SEO and URLs

- In **site settings**, set `**baseUrl`** to your public site origin (canonical URLs, Open Graph, sitemap `loc`).
- Match post URL paths in HTTP handlers to your real routes (e.g. `/blog/{slug}` in Next.js).

## Rendering (bring your own UI)

This package does **not** publish a React subpath. Import **`PostDTO`**, **`BlockDTO`**, and SEO helpers from **`@basic-blog/convex-blog-cms/next`** (or the root export for `makeBlogAdminAPI` and hydration helpers). See [docs/RENDERING.md](https://github.com/daocodotorg/basic-blog/blob/main/docs/RENDERING.md) and the monorepo [`examples/blog-ui`](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui) package for optional `BlogPost` / `BlockRenderer` / `BlogList` components you can copy or depend on via workspace.

### Migration from `@basic-blog/convex-blog-cms/react`

That export was removed. Replace imports with:

- Types: `@basic-blog/convex-blog-cms/next`
- Components: copy from [`examples/blog-ui`](https://github.com/daocodotorg/basic-blog/tree/main/examples/blog-ui) or depend on `@basic-blog/example-blog-ui` in this monorepo only (not published from the CMS package).

## Package exports


| Export path                                        | Purpose                                                                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@basic-blog/convex-blog-cms`                      | `makeBlogAdminAPI`, types, hydration helpers                                                                          |
| `@basic-blog/convex-blog-cms/convex.config`        | `defineComponent` default for `app.use()`                                                                             |
| `@basic-blog/convex-blog-cms/next`                 | `PostDTO` / `BlockDTO`, `postToNextMetadata`, `resolvePrimaryImage`, RSS/sitemap builders                             |
| `@basic-blog/convex-blog-cms/test`                 | `convex-test` registration helper                                                                                     |
| `@basic-blog/convex-blog-cms/_generated/component` | `ComponentApi` type for `components.blogCms`                                                                          |


## Development / codegen

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
pnpm --filter @basic-blog/convex-blog-cms run build
pnpm --filter @basic-blog/convex-blog-cms test
cd packages/convex-blog-cms && pnpm pack
```

Install the tarball in another project with `npm install /path/to/basic-blog-convex-blog-cms-0.1.0.tgz` (version from `package.json`). For release tagging and npm publish, see [PUBLISHING.md](./PUBLISHING.md).

## More in the repository

Longer copy-paste walkthroughs (Next.js routes, `fetchQuery`, metadata) and the same topics in standalone pages:

- [Setup](https://github.com/daocodotorg/basic-blog/blob/main/docs/SETUP.md)
- [Configuration (reference)](https://github.com/daocodotorg/basic-blog/blob/main/docs/CONFIGURATION.md) — mirrors the configuration section above with repo file links
- [Rendering](https://github.com/daocodotorg/basic-blog/blob/main/docs/RENDERING.md) — DTOs, queries, and optional example UI

## License

Apache-2.0 (see repository `LICENSE`).