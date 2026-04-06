# Basic Blog — Next-first Convex CMS (v1)

Monorepo with a publishable Convex **component** package and a **Next.js App Router** admin app.

## Documentation

| Doc | Audience |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | **Integrators** — install package, register component, wire `makeBlogAdminAPI`, HTTP, Next |
| [docs/RENDERING.md](docs/RENDERING.md) | **Integrators** — DTOs, queries, optional example UI (`examples/blog-ui`) |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | **Reference** — env vars, auth, component naming |
| [packages/convex-blog-cms/README.md](packages/convex-blog-cms/README.md) | **npm** — exports, peers, `BLOG_CMS_COMPONENT_NAME` |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **Contributors** — tests, codegen order, PRs |

Convex component expectations are described in the official [Component authoring](https://docs.convex.dev/components/authoring) guide.

## Packages

- [`packages/convex-blog-cms`](packages/convex-blog-cms) — `@basic-blog/convex-blog-cms`
  - Convex tables: `siteSettings`, `posts`, `postBlocks`
  - `makeBlogAdminAPI` for host wiring
  - Exports: `./convex.config`, `./client`, `./next`, `./test` (no React UI in the package; see `examples/blog-ui`)
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

Enable **demo admin** with a shared secret (insecure if exposed — local only). Use the same value in Convex and Next:

```bash
pnpm exec convex env set BLOG_ADMIN_API_KEY your-long-random-secret
# In apps/admin/.env.local:
# NEXT_PUBLIC_BLOG_ADMIN_API_KEY=your-long-random-secret
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for all variables.

### Convex file storage (optional uploads)

Set `DEMO_ADMIN_MODE=true` in Convex (demo only) to enable `convex/media.ts` `generateUploadUrl`. The admin editor uploads images to Convex storage; the CMS stores `Id<"_storage">` on image blocks and SEO fields, and `makeBlogAdminAPI` resolves public HTTPS URLs at read time for SEO and previews.

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
