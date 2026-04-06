# Basic Blog — Next-first Convex CMS (v1)

Monorepo with a publishable Convex **component** package and a **Next.js App Router** admin app.

## Documentation

| Doc | Audience |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | **Integrators** — install package, register component, wire `makeBlogAdminAPI`, HTTP, Next |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | **Reference** — env vars, auth, component naming |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | **npm** — exports, peers, `BLOG_CMS_COMPONENT_NAME` |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **Contributors** — tests, codegen order, PRs |

Convex component expectations are described in the official [Component authoring](https://docs.convex.dev/components/authoring) guide.

## Packages

- [`packages/convex-blog-cms`](packages/convex-blog-cms) — `@basic-blog/convex-blog-cms`
  - Convex tables: `siteSettings`, `posts`, `postBlocks`
  - `makeBlogAdminAPI` for host wiring
  - Exports: `./convex.config`, `./client`, `./react`, `./next`, `./test`
  - SEO helpers: `resolvePrimaryImage`, JSON-LD, RSS XML, sitemap + image sitemap

- [`apps/admin`](apps/admin) — demo CMS UI (App Router)

## Quick start (this repo)

```bash
pnpm install
cd apps/admin
# Create a Convex project and dev deployment, then:
pnpm exec convex dev
```

In another terminal:

```bash
cd apps/admin
cp .env.local.example .env.local
# Set NEXT_PUBLIC_CONVEX_URL from `pnpm exec convex dev` output
pnpm dev
```

Enable **demo admin** mutations/queries (insecure — local only):

```bash
pnpm exec convex env set DEMO_ADMIN_MODE true
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for all variables.

### Cloudflare R2 (optional uploads)

Configure R2 env vars per [`@convex-dev/r2`](https://www.convex.dev/components/cloudflare-r2). The admin app registers the R2 component in `apps/admin/convex/convex.config.ts` and exposes `generateUploadUrl` / `syncMetadata` in `convex/r2.ts`.

## HTTP routes (host)

`apps/admin/convex/http.ts` mounts:

- `GET /rss.xml`
- `GET /sitemap.xml`

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm test` | Component + SEO unit tests (package) |
| `pnpm --filter admin build` | Production build of admin |

## Regenerating Convex `_generated` (admin)

After changing `apps/admin/convex`, run `npx convex dev` once so Convex can regenerate `convex/_generated`. Stub files are committed so the repo typechecks without a deployment; replace them with generated output when linked to a project.
