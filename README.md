# Basic Blog — Convex blog CMS component

Source repository for **[basic-blog-convex-blog-cms](https://www.npmjs.com/package/basic-blog-convex-blog-cms)** on npm: a **Convex component** for a small headless blog/CMS (posts, blocks, site settings, uploads), a **bundled admin** served via the `**convex-blog-admin`** CLI, integration **docs**, and **examples** you can run from this tree.

## Documentation


| Doc                                                                      | Audience                                                                                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [docs/SETUP.md](docs/SETUP.md)                                           | **Integrators** — install package, register component, wire `makeBlogAdminAPI`, HTTP, optional Next.js                        |
| [docs/RENDERING.md](docs/RENDERING.md)                                   | **Integrators** — DTOs, queries, optional example UI (`examples/blog-ui`)                                                     |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md)                           | **Reference** — env vars, auth, component naming                                                                              |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | **npm** — exports, peers, `BLOG_CMS_COMPONENT_NAME`, [site settings](packages/convex-blog-cms/README.md#site-settings-global) |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                       | **Contributors** — tests, codegen order, PRs                                                                                  |


Convex component expectations are described in the official [Component authoring](https://docs.convex.dev/components/authoring) guide.

## Community

Questions and ideas about this component are welcome: open a [GitHub issue](https://github.com/daocodotorg/basic-blog/issues) or chat with the Convex community in the **[#components](https://discord.com/channels/1019350475847499846/1310320808782311555)** channel on Discord (linked from [Components Authoring](https://www.convex.dev/component-authoring)). Pull requests should follow [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Packages and examples

- `**[packages/convex-blog-cms](packages/convex-blog-cms)`** (`basic-blog-convex-blog-cms` on npm) — the **published** Convex component and client helpers.
  - Data: `siteSettings`, `posts`, `postBlocks`
  - Host wiring: `makeBlogAdminAPI` (re-export queries/mutations in your app’s `convex/`)
  - Entry points: `./convex.config`, root client, `./next`, `./test`, `./_generated/component`
  - Visitor-facing **React UI is not in the npm bundle**; copy from `examples/blog-ui` or use `examples/next-app`
  - SEO: `absoluteUrlFromSite`, `resolvePrimaryImage`, `derivePlainTextDescriptionFromBlocks`, JSON-LD (including FAQ graph when `post.faq` is set), RSS and sitemap XML builders (mounted on the host); post fields such as `**canonicalPath`**, `**noindex`**, `**answerSummary**`, `**keyTakeaways**`, `**faq**`, and site `**locale**` / `**defaultRobots**`
  - **Admin:** prebuilt SPA in `dist/admin-spa`, served by `npx blog-admin-serve` or `npx convex-blog-admin serve`; from this repo use `pnpm blog:admin` (optional `**BLOG_ADMIN_PORT`** when you omit `--port` on the wrapper)
- `**[packages/convex-blog-mcp](packages/convex-blog-mcp)**` — **MCP server** (stdio or HTTP) for `list_articles` / `create_article` / `update_article` against your Convex `blog` module. Private to the monorepo; see `[packages/convex-blog-mcp/README.md](packages/convex-blog-mcp/README.md)` (**[attach to Cursor, Claude Code, or Codex](packages/convex-blog-mcp/README.md#attach-to-cursor-claude-code-or-openai-codex)**).
[Deploy on Railway](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-mcp) **Railway:** import this repo, set the service **Root Directory** to `**packages/convex-blog-mcp`**, add `**CONVEX_URL`**, generate a domain — [step-by-step](packages/convex-blog-mcp/README.md#streamable-http-railway).
- `**[docs/reference/convex-host](docs/reference/convex-host)`** — **copy-paste** Convex snippets (`blog.ts`, `http.ts`, `schema.ts`, `convex.config.ts`) for your repo.
- `**[examples/convex-host](examples/convex-host)`** — **smallest runnable host** (Convex only). Use it to try the component and admin without Next.js.
- `**[examples/next-app](examples/next-app)`** — **Next.js App Router** demo: public blog pages, same Convex host patterns, embedded reference UI.
- `**[examples/blog-ui](examples/blog-ui)`** — **reference** React components for rendering DTOs (not published to npm).

## Quick start (try the admin UI)

1. Add the package and wire Convex as in [docs/SETUP.md](docs/SETUP.md) (component registration, `makeBlogAdminAPI` exporting `generateUploadUrl` with your other `blog` functions).
2. From the directory where the package is installed:

```bash
CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx blog-admin-serve
```

(`npx convex-blog-admin serve` is equivalent. In a checkout of this repo you can run `pnpm blog:admin` from the root instead.)

1. Open **[http://127.0.0.1:3847/admin](http://127.0.0.1:3847/admin)**.

Configure **[site settings](packages/convex-blog-cms/README.md#site-settings-global)** (site name, public base URL, default Open Graph image) in the admin under **Site settings**. They are stored in Convex and feed SEO helpers (canonical URLs, Next.js metadata defaults, RSS/sitemap). Your public app still uses `getPublicSiteSettings` (or the same DTO shape) when calling `postToNextMetadata` and related utilities.

Optional **demo token auth** (local only — same value in Convex and the CLI):

```bash
npx convex env set BLOG_ADMIN_API_KEY your-long-random-secret
CONVEX_URL="https://…" BLOG_ADMIN_API_KEY="your-long-random-secret" npx blog-admin-serve
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for all variables. The `[examples/blog-ui](examples/blog-ui)` folder is a **reference** for public post pages only. Full admin details: [packages/convex-blog-cms README — Start the admin panel](packages/convex-blog-cms/README.md#start-the-admin-panel).

### Convex file storage (uploads)

The bundled admin calls `blog.generateUploadUrl` from `makeBlogAdminAPI` (same admin auth as posts). The CMS stores `Id<"_storage">` on image blocks and SEO fields; `makeBlogAdminAPI` resolves public HTTPS URLs at read time for SEO and previews.

## HTTP routes (host)

Example RSS and sitemap handlers live in `[docs/reference/convex-host/convex/http.ts](docs/reference/convex-host/convex/http.ts)`:

- `GET /rss.xml`
- `GET /sitemap.xml`

## Scripts


| Command                                              | Description                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm test`                                          | Component and SEO unit tests for the CMS package                      |
| `pnpm --filter basic-blog-convex-blog-cms run build` | Build the npm package (TypeScript + bundled admin SPA)                |
| `pnpm dev:next`                                      | Dev server for `examples/next-app` (after Convex is configured there) |


## Monorepo development

```bash
pnpm install
pnpm dev   # Convex component codegen/watch + admin SPA (CMS package)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for codegen order and PR checks.