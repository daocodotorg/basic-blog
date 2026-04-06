# Example: reference blog UI (not published to npm)

**React** components for rendering **`PostDTO` / `BlockDTO`** from **`basic-blog-convex-blog-cms`**. Use this tree to **learn** or **copy** into your app; the **`@basic-blog/example-blog-ui`** workspace package is **private** and does **not** ship on npm (unlike **`basic-blog-convex-blog-cms`**).

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
