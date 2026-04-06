# Contributing

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Prerequisites

- [pnpm](https://pnpm.io/) 8+
- Node 18+

## Clone and install

```bash
git clone https://github.com/daocodotorg/basic-blog.git
cd basic-blog
pnpm install
```

## Checks before a PR

```bash
pnpm test
pnpm --filter basic-blog-convex-blog-cms run build
```

## Component package: codegen order

The Convex blog CMS lives in [`packages/convex-blog-cms`](packages/convex-blog-cms). When you change files under `src/component/`, follow the order from [Convex component authoring — Build process](https://docs.convex.dev/components/authoring#build-process):

1. **Component codegen** (from the package directory, with a Convex project / `CONVEX_DEPLOYMENT` available, or your usual workflow):

   ```bash
   cd packages/convex-blog-cms
   npx convex codegen --component-dir ./src/component
   ```

2. **Build the package**:

   ```bash
   pnpm run build
   ```

3. **Consuming app:** run `npx convex dev` in any project that uses the component so its `_generated` matches.

Avoid racing: codegen the component before publishing or before a consuming app picks up changes.

## Lint

```bash
cd packages/convex-blog-cms && pnpm run lint
```

## Pull requests

- Keep changes focused and described in the PR text.
- Update docs in [`docs/`](docs/) or [`packages/convex-blog-cms/README.md`](packages/convex-blog-cms/README.md) when behavior or configuration changes.

## GitHub repository settings (maintainers)

These steps are done in the GitHub UI for [daocodotorg/basic-blog](https://github.com/daocodotorg/basic-blog):

- **Security advisories**: enable private vulnerability reporting so reporters can use [SECURITY.md](SECURITY.md) as documented.
- **About**: set repository description and topics (for example `convex`, `blog`, `cms`, `component`) so the project is discoverable.
- **Branch protection** (optional): on `main`, require status checks to pass (e.g. the CI workflow) before merge.

## Publishing (maintainers)

See [`packages/convex-blog-cms/PUBLISHING.md`](packages/convex-blog-cms/PUBLISHING.md).
