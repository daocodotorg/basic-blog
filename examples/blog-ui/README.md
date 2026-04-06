# `@basic-blog/example-blog-ui`

Reference **React** UI for blog DTOs from `@basic-blog/convex-blog-cms`. This package is **for the monorepo** (and copy-paste); it is **not** published as part of `@basic-blog/convex-blog-cms`.

## Contents

- **`BlogPost`** — article shell + title + `BlockRenderer`
- **`BlockRenderer`** — maps `BlockDTO` to paragraphs, headings, images, video, links
- **`BlogList`** — simple list of posts with `hrefForSlug`
- **`BlogThemeProvider`**, **`useBlogTheme`**, **`defaultBlogTheme`**, **`BlogUiTheme`** — className slots (Tailwind-friendly defaults)

Types (`PostDTO`, `BlockDTO`) are re-exported from `@basic-blog/convex-blog-cms/next`.

## Usage (Next.js App Router)

```tsx
import { BlogPost } from "@basic-blog/example-blog-ui";
import type { PostDTO, BlockDTO } from "@basic-blog/convex-blog-cms/next";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// After loading post + blocks from getPublishedPostBySlug (hydrated):
<BlogPost post={post} blocks={blocks} />
```

Wire Convex queries in your host (`makeBlogAdminAPI`) first; see [docs/SETUP.md](../../docs/SETUP.md).

## Build

```bash
pnpm --filter @basic-blog/example-blog-ui build
```
