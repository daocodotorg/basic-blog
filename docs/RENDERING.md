# Rendering blog content (bring your own UI)

`basic-blog-convex-blog-cms` focuses on **Convex data**, **hydrated DTOs**, and **SEO helpers**. It does **not** ship React components. You render posts using the same types everywhere: **`PostDTO`**, **`BlockDTO`**, **`SiteSettingsDTO`**, **`PrimaryImage`** (from `basic-blog-convex-blog-cms/next`).

## Data flow

1. **Public queries** from `makeBlogAdminAPI` return **hydrated** URLs for Convex file storage (see package README). Use `getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings` for public pages. Configure global **site settings** (name, base URL, default OG image) in the admin or via `upsertSiteSettings`; see [Site settings (global)](https://github.com/daocodotorg/basic-blog/blob/main/packages/convex-blog-cms/README.md#site-settings-global).
2. Map **`blocks`** in `order` and switch on `block.type` (`paragraph`, `heading`, `image`, `video`, `link`).
3. For **Next.js** metadata / OG / sitemap, use `postToNextMetadata`, `resolvePrimaryImage`, `buildSitemapXml`, etc., from `basic-blog-convex-blog-cms/next`.

## Optional reference UI (monorepo)

The **`examples/blog-ui`** folder in this repo is a **reference implementation** (presentational **`BlogPost`**, **`BlockRenderer`**, **`BlogList`**, **`BlogThemeProvider`** with Tailwind-friendly `BlogUiTheme`). It is **not** published to npm — copy or adapt it into your app. For a **full Next.js App Router** sample that embeds this UI, see **`examples/next-app`**. The **bundled admin UI** (`convex-blog-admin serve`) includes its own editor preview; use `examples/blog-ui` when you build **public** post pages.

- Theme merge order: `defaultBlogTheme` → `BlogThemeProvider` → per-component `theme` prop.

## TanStack Router / Query

For SPAs, use `useQuery` from `convex/react` with the same API and DTOs. See **`examples/tanstack-display/`** for a minimal `PostView.sample.tsx` pattern.

## Migration from `basic-blog-convex-blog-cms/react`

That export was removed. Import types from `basic-blog-convex-blog-cms/next` and copy or adapt components from [`examples/blog-ui`](../examples/blog-ui) (reference source in the repo, not an npm package).
