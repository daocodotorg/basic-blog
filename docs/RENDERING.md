# Rendering blog content (bring your own UI)

`@basic-blog/convex-blog-cms` focuses on **Convex data**, **hydrated DTOs**, and **SEO helpers**. It does **not** ship React components. You render posts using the same types everywhere: **`PostDTO`**, **`BlockDTO`**, **`SiteSettingsDTO`**, **`PrimaryImage`** (from `@basic-blog/convex-blog-cms/next`).

## Data flow

1. **Public queries** from `makeBlogAdminAPI` return **hydrated** URLs for Convex file storage (see package README). Use `getPublishedPostBySlug`, `listPublishedPosts`, `getPublicSiteSettings` for public pages.
2. Map **`blocks`** in `order` and switch on `block.type` (`paragraph`, `heading`, `image`, `video`, `link`).
3. For **Next.js** metadata / OG / sitemap, use `postToNextMetadata`, `resolvePrimaryImage`, `buildSitemapXml`, etc., from `@basic-blog/convex-blog-cms/next`.

## Optional reference UI (monorepo)

The repo includes **`examples/blog-ui`** (`@basic-blog/example-blog-ui`): presentational **`BlogPost`**, **`BlockRenderer`**, **`BlogList`**, and **`BlogThemeProvider`** with Tailwind-friendly class slots (`BlogUiTheme`). The **demo admin** (`apps/admin`) imports this package for the edit preview. You can copy the source into your app or keep a workspace dependency.

- Theme merge order: `defaultBlogTheme` → `BlogThemeProvider` → per-component `theme` prop.

## TanStack Router / Query

For SPAs, use `useQuery` from `convex/react` with the same API and DTOs. See **`examples/tanstack-display/`** for a minimal `PostView.sample.tsx` pattern.

## Migration from `@basic-blog/convex-blog-cms/react`

That export was removed. Import types from `@basic-blog/convex-blog-cms/next` and either copy components from `examples/blog-ui` or use `@basic-blog/example-blog-ui` inside this monorepo.
