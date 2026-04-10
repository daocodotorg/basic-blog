# Basic Blog — Convex blog & CMS component

Open-source monorepo around **[basic-blog-convex-blog-cms](https://www.npmjs.com/package/basic-blog-convex-blog-cms)** on npm: a **[Convex component](https://docs.convex.dev/components)** for a small headless blog (posts, blocks, site settings, uploads), a **bundled admin** (`blog-admin-serve`), **integration docs**, **examples**, and an optional **MCP server** for agents.

[npm](https://www.npmjs.com/package/basic-blog-convex-blog-cms)
[License](LICENSE)

---

## Repository map


| Area                  | Path                                                                                     | What it is                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Published package** | `[packages/convex-blog-cms](packages/convex-blog-cms)`                                   | Convex component (schema, queries, mutations), `makeBlogAdminAPI`, Next.js / RSS / sitemap / JSON-LD helpers                                                       |
| **Bundled admin UI**  | `[packages/convex-blog-cms](packages/convex-blog-cms)` (same package)                    | TipTap CMS SPA in `dist/admin-spa`; `blog-admin-serve` / `convex-blog-admin serve`; `[Dockerfile.admin](packages/convex-blog-cms/Dockerfile.admin)` for containers |
| **MCP server**        | `[packages/convex-blog-mcp](packages/convex-blog-mcp)`                                   | HTTP or stdio MCP for `list_articles`, `create_article`, `update_article` (not on npm)                                                                             |
| **Host snippets**     | `[docs/reference/convex-host](docs/reference/convex-host)`                               | Copy-paste `blog.ts`, `http.ts`, `schema.ts`, `convex.config.ts`                                                                                                   |
| **Demos**             | `[examples/convex-host](examples/convex-host)`, `[examples/next-app](examples/next-app)` | Minimal Convex host · Next.js App Router + public blog                                                                                                             |
| **Reference UI**      | `[examples/blog-ui](examples/blog-ui)`                                                   | React for **public** post/list DTOs (not in the npm bundle)                                                                                                        |
| **TanStack sample**   | `[examples/tanstack-display](examples/tanstack-display)`                                 | Minimal SPA pattern with public queries                                                                                                                            |


Visitor-facing React is **your app** (or copy from `examples/blog-ui` / follow `examples/next-app`). The npm package does not ship public page components.

---

## Run the admin locally

1. Install the package and wire Convex: [docs/SETUP.md](docs/SETUP.md) (component, `makeBlogAdminAPI`, including `generateUploadUrl`).
2. From the project that has the dependency:
  ```bash
   CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" npx blog-admin-serve
  ```
   Same as `npx convex-blog-admin serve`. In this repo: `pnpm blog:admin` from the root.
3. Open **[http://127.0.0.1:3847/admin](http://127.0.0.1:3847/admin)**.

**Optional token auth** (same secret in Convex and env):

```bash
npx convex env set BLOG_ADMIN_API_KEY your-long-random-secret
CONVEX_URL="https://…" BLOG_ADMIN_API_KEY="…" npx blog-admin-serve
```

**Site settings** (name, public URL, default OG image): set in the admin or via API — see [Site settings](packages/convex-blog-cms/README.md#site-settings-global). Env reference: [docs/CONFIGURATION.md](docs/CONFIGURATION.md). Admin deep dive: [Start the admin panel](packages/convex-blog-cms/README.md#start-the-admin-panel).

**Uploads:** the admin uses `blog.generateUploadUrl` from `makeBlogAdminAPI`. Images are stored as `Id<"_storage">`; public URLs are resolved at read time for SEO and previews.

---

## Deploy on Railway

[![Deploy on Railway](https://img.shields.io/badge/Deploy%20on-Railway-13102c?style=for-the-badge%26logo=railway%26logoColor=white)](https://railway.com/deploy/convex-basic-blog?referralCode=z9Eeq9%26utm_medium=integration%26utm_source=template%26utm_campaign=generic)

One Railway template provisions **admin UI** and **MCP HTTP** in one project.

1. Set **`CONVEX_URL`** on each service (and optional **`BLOG_ADMIN_API_KEY`** / MCP bearer token if you use them).
2. **Networking → Generate domain** for each service you expose.
3. Open **`/admin`** for the CMS; point MCP clients at your MCP service URL.

**Details:** [Admin on Railway](packages/convex-blog-cms/README.md#deploy-the-admin-on-railway) · [MCP Streamable HTTP / Railway](packages/convex-blog-mcp/README.md#streamable-http-railway)

**Deploy one service only** (import this repo on Railway): MCP → Root Directory **`packages/convex-blog-mcp`** · Admin → **`packages/convex-blog-cms`**

---

## Documentation


| Doc                                                                      | For                                                                         |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [docs/SETUP.md](docs/SETUP.md)                                           | Install, register the component, `makeBlogAdminAPI`, HTTP, optional Next.js |
| [docs/RENDERING.md](docs/RENDERING.md)                                   | DTOs, public queries, `examples/blog-ui`                                    |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md)                           | Env vars, auth, component naming                                            |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | Package exports, peers, site settings, admin & Docker                       |
| [packages/convex-blog-mcp/README.md](packages/convex-blog-mcp/README.md) | Cursor / Claude / Codex, Docker, HTTP MCP                                   |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                       | Tests, codegen, PRs                                                         |


---

## HTTP routes (host)

Example RSS and sitemap handlers: `[docs/reference/convex-host/convex/http.ts](docs/reference/convex-host/convex/http.ts)`

- `GET /rss.xml`
- `GET /sitemap.xml`

---

## Package and example details

`**[packages/convex-blog-cms](packages/convex-blog-cms)**` (`basic-blog-convex-blog-cms` on npm) — `siteSettings`, `posts`, `postBlocks`; `makeBlogAdminAPI`; `./next` SEO helpers; bundled admin SPA under `dist/admin-spa`. Full field and API list: [package README](packages/convex-blog-cms/README.md).

`**[packages/convex-blog-mcp](packages/convex-blog-mcp)**` — not published; stdio or Streamable HTTP. See [its README](packages/convex-blog-mcp/README.md).

**Examples** — `[examples/convex-host](examples/convex-host)` (smallest host), `[examples/next-app](examples/next-app)` (Next.js + public pages), `[examples/blog-ui](examples/blog-ui)` (presentational components), `[examples/tanstack-display](examples/tanstack-display)` (SPA-oriented sample).

---

## Scripts (monorepo)


| Command                                              | Description                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm test`                                          | CMS package unit tests                                            |
| `pnpm --filter basic-blog-convex-blog-cms run build` | TypeScript + admin SPA build                                      |
| `pnpm dev:next`                                      | `examples/next-app` dev server (after Convex is configured there) |


```bash
pnpm install
pnpm dev   # Convex codegen/watch + admin SPA (CMS package)
```

---

## Community and license

- **Issues:** [GitHub Issues](https://github.com/daocodotorg/basic-blog/issues)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **License:** [Apache-2.0](LICENSE)

