# Basic Blog — Convex blog & CMS component

Open-source monorepo for **[basic-blog-convex-blog-cms](https://www.npmjs.com/package/basic-blog-convex-blog-cms)** on npm: a **[Convex component](https://docs.convex.dev/components)** for a small headless blog/CMS (posts, blocks, site settings, uploads), a **bundled admin** served via the `blog-admin-serve` / `convex-blog-admin` CLIs, **integration docs**, **runnable demos**, and an optional **MCP server** for agents and automation.

[![npm](https://img.shields.io/npm/v/basic-blog-convex-blog-cms)](https://www.npmjs.com/package/basic-blog-convex-blog-cms)
[![License](https://img.shields.io/github/license/daocodotorg/basic-blog)](LICENSE)

## What’s in this repository

| Piece | Description |
| ----- | ----------- |
| **Published npm package** | [`packages/convex-blog-cms`](packages/convex-blog-cms) — component tables and API, `makeBlogAdminAPI` host wiring, optional Next.js / RSS / sitemap / JSON-LD helpers |
| **Demo apps** | [`examples/convex-host`](examples/convex-host) — smallest runnable Convex host; [`examples/next-app`](examples/next-app) — Next.js App Router with public blog pages |
| **Reference UI** | [`examples/blog-ui`](examples/blog-ui) — React examples for rendering public DTOs (not published to npm) |
| **MCP server** | [`packages/convex-blog-mcp`](packages/convex-blog-mcp) — MCP tools `list_articles`, `create_article`, `update_article` against your deployed blog module (source-only in this repo; see that README for Cursor, Claude Code, Codex, and Railway) |
| **Copy-paste host snippets** | [`docs/reference/convex-host`](docs/reference/convex-host) — `blog.ts`, `http.ts`, `schema.ts`, `convex.config.ts` |

Visitor-facing **React UI is not part of the npm bundle**; copy from `examples/blog-ui` or follow `examples/next-app`.

### MCP server: deploy to Railway (one click)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-mcp)

Import this repo, set the service **Root Directory** to `packages/convex-blog-mcp`, add **`CONVEX_URL`**, then **Networking → Generate Domain**. Full walkthrough: [Streamable HTTP (Railway)](packages/convex-blog-mcp/README.md#streamable-http-railway) in [`packages/convex-blog-mcp/README.md`](packages/convex-blog-mcp/README.md) (same button appears there).

### Bundled admin UI: deploy to Railway (one click)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-admin)

Add a **second** service (or a separate Railway project), set **Root Directory** to **`packages/convex-blog-cms`**, add **`CONVEX_URL`**, generate a domain, then open **`/admin`**. Step-by-step: [Deploy the admin on Railway](packages/convex-blog-cms/README.md#deploy-the-admin-on-railway) in [`packages/convex-blog-cms/README.md`](packages/convex-blog-cms/README.md).

## Convex Components: authoring & directory

This project follows **[Authoring Components](https://docs.convex.dev/components/authoring)** and matches the expectations summarized on **[Components Authoring](https://www.convex.dev/component-authoring)**:

- **npm package** — [`basic-blog-convex-blog-cms`](https://www.npmjs.com/package/basic-blog-convex-blog-cms)
- **Demo apps** — run [`examples/convex-host`](examples/convex-host) or [`examples/next-app`](examples/next-app) from a clone (see each folder’s README)
- **Patterns** — packaged `convex.config`, isolated component data model, `ComponentApi`, and a `./test` entry for `convex-test` (details in [`packages/convex-blog-cms/README.md`](packages/convex-blog-cms/README.md))

To suggest inclusion in the **[Convex Components directory](https://www.convex.dev/components)**, use **[Submit your component](https://www.convex.dev/components/submit)**. For design and packaging questions, see the docs above and the **[#components](https://discord.com/channels/1019350475847499846/1310320808782311555)** channel on Discord (linked from the authoring page).

## Documentation

| Doc | Audience |
| --- | -------- |
| [docs/SETUP.md](docs/SETUP.md) | **Integrators** — install the package, register the component, wire `makeBlogAdminAPI`, HTTP actions, optional Next.js |
| [docs/RENDERING.md](docs/RENDERING.md) | **Integrators** — DTOs, queries, optional example UI (`examples/blog-ui`) |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | **Reference** — environment variables, auth, component naming |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | **npm consumers** — exports, peers, `BLOG_CMS_COMPONENT_NAME`, [site settings](packages/convex-blog-cms/README.md#site-settings-global), [admin on Railway](packages/convex-blog-cms/README.md#deploy-the-admin-on-railway) ([`Dockerfile.admin`](packages/convex-blog-cms/Dockerfile.admin)) |
| [packages/convex-blog-mcp/README.md](packages/convex-blog-mcp/README.md) | **Agents / ops** — MCP transports, env vars, Docker, Railway |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **Contributors** — tests, codegen order, PRs |

## Quick start (try the admin UI)

1. Add the package and wire Convex as in [docs/SETUP.md](docs/SETUP.md) (component registration, `makeBlogAdminAPI` exporting `generateUploadUrl` with your other `blog` functions).
2. From the directory where the package is installed:

   ```bash
   CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx blog-admin-serve
   ```

   (`npx convex-blog-admin serve` is equivalent. In a checkout of this repo you can run `pnpm blog:admin` from the root.)

3. Open **[http://127.0.0.1:3847/admin](http://127.0.0.1:3847/admin)**.

Configure **[site settings](packages/convex-blog-cms/README.md#site-settings-global)** (site name, public base URL, default Open Graph image) in the admin under **Site settings**. They live in Convex and feed SEO helpers (canonical URLs, Next.js metadata defaults, RSS/sitemap). Your public app should still use `getPublicSiteSettings` (or the same DTO shape) with `postToNextMetadata` and related utilities.

Optional **demo token auth** (local only — same value in Convex and the CLI):

```bash
npx convex env set BLOG_ADMIN_API_KEY your-long-random-secret
CONVEX_URL="https://…" BLOG_ADMIN_API_KEY="your-long-random-secret" npx blog-admin-serve
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for all variables. The [`examples/blog-ui`](examples/blog-ui) folder is a **reference** for public post pages only. Full admin details: [packages/convex-blog-cms README — Start the admin panel](packages/convex-blog-cms/README.md#start-the-admin-panel).

### Convex file storage (uploads)

The bundled admin calls `blog.generateUploadUrl` from `makeBlogAdminAPI` (same admin auth as posts). The CMS stores `Id<"_storage">` on image blocks and SEO fields; `makeBlogAdminAPI` resolves public HTTPS URLs at read time for SEO and previews.

## HTTP routes (host)

Example RSS and sitemap handlers live in [`docs/reference/convex-host/convex/http.ts`](docs/reference/convex-host/convex/http.ts):

- `GET /rss.xml`
- `GET /sitemap.xml`

## Packages and examples (detail)

- **[`packages/convex-blog-cms`](packages/convex-blog-cms)** (`basic-blog-convex-blog-cms` on npm) — the **published** Convex component and client helpers.
  - Data: `siteSettings`, `posts`, `postBlocks`
  - Host wiring: `makeBlogAdminAPI` (re-export queries/mutations in your app’s `convex/`)
  - Entry points: `./convex.config`, root client, `./next`, `./test`, `./_generated/component`
  - SEO: `absoluteUrlFromSite`, `resolvePrimaryImage`, `derivePlainTextDescriptionFromBlocks`, JSON-LD (including FAQ graph when `post.faq` is set), RSS and sitemap XML builders (mounted on the host); post fields such as `canonicalPath`, `noindex`, `answerSummary`, `keyTakeaways`, `faq`, and site `locale` / `defaultRobots`
  - **Admin:** prebuilt SPA in `dist/admin-spa`, served by `npx blog-admin-serve` or `npx convex-blog-admin serve`; from this repo use `pnpm blog:admin` (optional `BLOG_ADMIN_PORT` / `PORT` when you omit `--port`). **[Deploy on Railway](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-admin)** with Root Directory **`packages/convex-blog-cms`** — [walkthrough](packages/convex-blog-cms/README.md#deploy-the-admin-on-railway).
- **[`packages/convex-blog-mcp`](packages/convex-blog-mcp)** — MCP server (stdio or HTTP) for agents; not published to npm. See [packages/convex-blog-mcp/README.md](packages/convex-blog-mcp/README.md) for attaching to Cursor, Claude Code, or Codex, and for **[Deploy on Railway](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-mcp)** (set service **Root Directory** to `packages/convex-blog-mcp`, add `CONVEX_URL`, generate a domain — [step-by-step](packages/convex-blog-mcp/README.md#streamable-http-railway)).
- **[`docs/reference/convex-host`](docs/reference/convex-host)** — copy-paste Convex snippets (`blog.ts`, `http.ts`, `schema.ts`, `convex.config.ts`) for your repo.
- **[`examples/convex-host`](examples/convex-host)** — smallest runnable host (Convex only).
- **[`examples/next-app`](examples/next-app)** — Next.js App Router demo: public blog pages, same Convex host patterns, embedded reference UI.
- **[`examples/blog-ui`](examples/blog-ui)** — reference React components for rendering DTOs (not published to npm).

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm test` | Component and SEO unit tests for the CMS package |
| `pnpm --filter basic-blog-convex-blog-cms run build` | Build the npm package (TypeScript + bundled admin SPA) |
| `pnpm dev:next` | Dev server for `examples/next-app` (after Convex is configured there) |

## Monorepo development

```bash
pnpm install
pnpm dev   # Convex component codegen/watch + admin SPA (CMS package)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for codegen order and PR checks.

## Community, license, and contributing

- **Issues and ideas:** [GitHub Issues](https://github.com/daocodotorg/basic-blog/issues)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **License:** [Apache-2.0](LICENSE)
