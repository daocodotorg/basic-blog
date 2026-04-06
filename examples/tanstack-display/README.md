# TanStack Router / Query + Convex blog DTOs

This folder is a **reference**, not a runnable app. Use the same **`PostDTO`** / **`BlockDTO`** types from `@basic-blog/convex-blog-cms/next` and Convex **`useQuery`** (`convex/react`) to load `getPublishedPostBySlug` (or your host’s public query).

See **`PostView.sample.tsx`** for a minimal block switch you can paste into a TanStack Router route or any React SPA with Convex.

For list pages, use `listPublishedPosts` and render links with your router’s `Link` + `href` builder.
