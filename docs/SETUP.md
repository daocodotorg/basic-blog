# Setup: install the Convex blog CMS component

This guide is for **integrators** adding `@basic-blog/convex-blog-cms` to an existing Convex + (optionally) Next.js app. It mirrors [Convex component authoring](https://docs.convex.dev/components/authoring) expectations: install the package, register the component, re-export the host API, and mount HTTP.

## Prerequisites

- Node 18+
- A Convex project (`npx convex dev` configured)
- `convex` peer dependency (see package README)

## 1. Install

```bash
npm install @basic-blog/convex-blog-cms convex
# or
pnpm add @basic-blog/convex-blog-cms convex
```

## 2. Register the component

In your app’s `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import blogCms from "@basic-blog/convex-blog-cms/convex.config.js";

const app = defineApp();
app.use(blogCms);
export default app;
```

Optional: add [`@convex-dev/r2`](https://www.convex.dev/components/cloudflare-r2) the same way if you want uploads (see [CONFIGURATION.md](./CONFIGURATION.md)).

## 3. Expose the host API

Create `convex/blog.ts` (or split files) and wire **`makeBlogAdminAPI`**:

```ts
import { makeBlogAdminAPI } from "@basic-blog/convex-blog-cms";
import { components } from "./_generated/api.js";

export const {
  getPublishedPostBySlug,
  listPublishedPosts,
  getPublicSiteSettings,
  getPostForAdmin,
  listPostsForAdmin,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  replacePostBlocks,
  upsertSiteSettings,
} = makeBlogAdminAPI(components.blogCms, {
  auth: async (ctx, operation) => {
    // Enforce auth for adminRead / adminWrite only
    if (operation.type === "adminRead" || operation.type === "adminWrite") {
      // e.g. require Convex Auth identity
      // const id = await ctx.auth.getUserIdentity();
      // if (!id) throw new Error("Unauthorized");
    }
  },
});
```

Run `npx convex dev` so `_generated` includes `components.blogCms`.

## 4. Mount RSS / sitemap (optional)

Copy the pattern from [`apps/admin/convex/http.ts`](../apps/admin/convex/http.ts): `httpActionGeneric` handlers that call your public queries and use helpers from `@basic-blog/convex-blog-cms/next` (`buildRssXml`, `buildSitemapXml`, etc.).

## 5. Next.js client (optional)

- Set `NEXT_PUBLIC_CONVEX_URL` to your deployment URL.
- Wrap the app with `ConvexProvider` from `convex/react`.
- Import UI from `@basic-blog/convex-blog-cms/react` and SEO helpers from `@basic-blog/convex-blog-cms/next` (see [package README](../packages/convex-blog-cms/README.md)).

## 6. Build order (library developers)

When changing the **component** source under `src/component`, follow Convex’s recommended order:

1. `npx convex codegen --component-dir ./path/to/component`
2. `npm run build` (or `tsc`) for the package
3. `npx convex dev` in the consuming app

See [CONTRIBUTING.md](../CONTRIBUTING.md) in this repo.

## Architecture

```mermaid
flowchart LR
  subgraph host [Host Convex app]
    BlogTs[convex/blog.ts]
    HttpTs[convex/http.ts]
    Gen[_generated api]
  end
  subgraph pkg ["@basic-blog/convex-blog-cms"]
    MakeAPI[makeBlogAdminAPI]
    Comp[Component blogCms]
  end
  BlogTs --> MakeAPI
  MakeAPI --> Gen
  Gen --> Comp
  HttpTs --> Gen
  Comp --> Db[(Component tables)]
```

## See also

- [CONFIGURATION.md](./CONFIGURATION.md) — all env vars and knobs
- [packages/convex-blog-cms/README.md](../packages/convex-blog-cms/README.md) — npm exports and peers
