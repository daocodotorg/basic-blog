# Contributing

## Prerequisites

- [pnpm](https://pnpm.io/) 8+
- Node 18+

## Clone and install

```bash
git clone <repository-url>
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

## Publishing (maintainers)

See [`packages/convex-blog-cms/PUBLISHING.md`](packages/convex-blog-cms/PUBLISHING.md).
