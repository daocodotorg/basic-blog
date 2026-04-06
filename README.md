# Basic Blog — Convex CMS component (v1)

Monorepo with a publishable Convex **component** package (`basic-blog-convex-blog-cms`), a **bundled admin UI** served by `convex-blog-admin serve`, and **reference** docs and examples.

## Documentation

| Doc | Audience |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | **Integrators** — install package, register component, wire `makeBlogAdminAPI`, HTTP, optional Next.js |
| [docs/RENDERING.md](docs/RENDERING.md) | **Integrators** — DTOs, queries, optional example UI (`examples/blog-ui`) |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | **Reference** — env vars, auth, component naming |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | **npm** — exports, peers, `BLOG_CMS_COMPONENT_NAME`, [site settings](packages/convex-blog-cms/README.md#site-settings-global) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **Contributors** — tests, codegen order, PRs |

Convex component expectations are described in the official [Component authoring](https://docs.convex.dev/components/authoring) guide.

## Packages

- [`packages/convex-blog-cms`](packages/convex-blog-cms) — `basic-blog-convex-blog-cms`
  - Convex tables: `siteSettings`, `posts`, `postBlocks`
  - `makeBlogAdminAPI` for host wiring
  - Exports: `./convex.config`, `./client`, `./next`, `./test` (no React blog UI in the package; see `examples/blog-ui`)
  - SEO helpers: `resolvePrimaryImage`, JSON-LD, RSS XML, sitemap + image sitemap
  - CLI `convex-blog-admin` serves the bundled admin SPA from `dist/admin-spa`

- [`docs/reference/convex-host`](docs/reference/convex-host) — copy-paste **sample** Convex host files (`blog.ts`, `http.ts`, `schema.ts`, `convex.config.ts`) for integration.

- [`examples/convex-host`](examples/convex-host) — **runnable** minimal host; run `npx convex dev` there after `pnpm install`. `makeBlogAdminAPI` exposes `blog.generateUploadUrl` for the bundled admin (same auth as saving posts).

## Quick start (try the admin UI)

1. Add the package and wire Convex as in [docs/SETUP.md](docs/SETUP.md) (component registration, `makeBlogAdminAPI` exporting `generateUploadUrl` with your other `blog` functions).

2. From the directory where the package is installed:

```bash
CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx convex-blog-admin serve
```

3. Open **http://127.0.0.1:3847/admin**.

Configure **[site settings](packages/convex-blog-cms/README.md#site-settings-global)** (site name, public base URL, default Open Graph image) in the admin under **Site settings**. They are stored in Convex and feed SEO helpers (canonical URLs, Next.js metadata defaults, RSS/sitemap). Your public app still uses `getPublicSiteSettings` (or the same DTO shape) when calling `postToNextMetadata` and related utilities.

Optional **demo token auth** (local only — same value in Convex and the CLI):

```bash
npx convex env set BLOG_ADMIN_API_KEY your-long-random-secret
CONVEX_URL="https://…" BLOG_ADMIN_API_KEY="your-long-random-secret" npx convex-blog-admin serve
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for all variables. The [`examples/blog-ui`](examples/blog-ui) folder is a **reference** for public post pages only. Full admin details: [packages/convex-blog-cms README — Start the admin panel](packages/convex-blog-cms/README.md#start-the-admin-panel).

### Convex file storage (uploads)

The bundled admin calls `blog.generateUploadUrl` from `makeBlogAdminAPI` (same admin auth as posts). The CMS stores `Id<"_storage">` on image blocks and SEO fields; `makeBlogAdminAPI` resolves public HTTPS URLs at read time for SEO and previews.

## HTTP routes (host)

Example RSS and sitemap handlers live in [`docs/reference/convex-host/convex/http.ts`](docs/reference/convex-host/convex/http.ts):

- `GET /rss.xml`
- `GET /sitemap.xml`

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm test` | Component + SEO unit tests (package) |
| `pnpm --filter basic-blog-convex-blog-cms run build` | Build the CMS package (includes admin SPA) |

## Monorepo development

```bash
pnpm install
pnpm dev   # runs basic-blog-convex-blog-cms dev (component + admin SPA)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for codegen order and PR checks.
