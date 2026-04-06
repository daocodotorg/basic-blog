# `@basic-blog/convex-blog-cms`

A **Convex component** that provides a small blog/CMS backend (posts, ordered blocks, site settings) plus **client helpers** for wiring admin APIs, React UI, and Next.js SEO (metadata, JSON-LD, RSS, sitemap).

Designed to match [Convex component authoring](https://docs.convex.dev/components/authoring): isolated tables, validated functions, and npm entry points for `convex.config`, client factories, and tests.

## Install

```bash
npm install @basic-blog/convex-blog-cms convex
```

**Peer dependencies:** `convex` (^1.33.1), `react` (^18.3 || ^19). Optional: `next` (^14 || ^15 || ^16) for `./next` helpers.

## Register the component

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import blogCms from "@basic-blog/convex-blog-cms/convex.config.js";

const app = defineApp();
app.use(blogCms);
export default app;
```

The default component name is **`blogCms`**, so your generated API exposes `components.blogCms`. This matches:

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
    auth: async (ctx, operation) => {
      if (operation.type === "adminRead" || operation.type === "adminWrite") {
        // your auth
      }
    },
  });
```

Public read queries do not call `auth`. Admin operations do.

## Package exports

| Export path | Purpose |
|-------------|---------|
| `@basic-blog/convex-blog-cms` | `makeBlogAdminAPI`, types |
| `@basic-blog/convex-blog-cms/convex.config` | `defineComponent` default for `app.use()` |
| `@basic-blog/convex-blog-cms/react` | `BlogList`, `BlogPost`, `BlockRenderer` |
| `@basic-blog/convex-blog-cms/next` | `postToNextMetadata`, `resolvePrimaryImage`, RSS/sitemap builders |
| `@basic-blog/convex-blog-cms/test` | `convex-test` registration helper |
| `@basic-blog/convex-blog-cms/_generated/component` | `ComponentApi` type for `components.blogCms` |

## Development / codegen

Consumers run `npx convex dev` as usual. **Package maintainers** also run component codegen before build:

```bash
npx convex codegen --component-dir ./src/component
npm run build
```

See [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## Docs in this monorepo

- [Setup (integrators)](../../docs/SETUP.md)
- [Configuration reference](../../docs/CONFIGURATION.md)

## License

Apache-2.0 (see repository `LICENSE`).
