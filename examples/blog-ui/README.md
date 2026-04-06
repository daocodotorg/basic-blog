# `examples/blog-ui` — reference UI (not on npm)

Reference **React** components for rendering blog DTOs from `basic-blog-convex-blog-cms`. This directory is for **learning and copy-paste** — it is **`private`** to the monorepo and **not** published as a package.

## Contents

- **`BlogPost`** — article shell + title + `BlockRenderer`
- **`BlockRenderer`** — maps `BlockDTO` to paragraphs, headings, images, video, links
- **`BlogList`** — simple list of posts with `hrefForSlug`
- **`BlogThemeProvider`**, **`useBlogTheme`**, **`defaultBlogTheme`**, **`BlogUiTheme`** — className slots (Tailwind-friendly defaults)

Types (`PostDTO`, `BlockDTO`) come from `basic-blog-convex-blog-cms/next`.

## Usage

Copy the `src/` files into your app or use them as a sketch, then wire Convex queries via `makeBlogAdminAPI` (see [docs/SETUP.md](../docs/SETUP.md)).

The **bundled admin UI** does **not** depend on this folder — it ships its own editor preview inside the SPA.

## Build (monorepo)

```bash
pnpm --filter @basic-blog/example-blog-ui build
```
