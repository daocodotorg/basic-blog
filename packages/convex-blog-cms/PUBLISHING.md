# Publishing `@basic-blog/convex-blog-cms`

This follows the same ideas as the [Convex component template](https://github.com/get-convex/templates/tree/main/template-component) and [Component authoring — Publishing](https://docs.convex.dev/components/authoring#publishing-to-npm).

## Before you publish

1. **Login to npm** (one-time):
  ```bash
   npm whoami || npm login
  ```
2. **Version** the package (from `packages/convex-blog-cms`):
  ```bash
   npm version patch   # or minor / major
  ```
3. **Build and test**:
  ```bash
   npm run build:clean
   npm test
  ```
   If you have `CONVEX_DEPLOYMENT` set, `build:codegen` can regenerate `src/component/_generated`. Otherwise ensure generated files are committed or produced by your CI.
4. **Verify `files`**: `[package.json](./package.json)` publishes `dist` and `src` so consumers get source maps and the component tree.

## Publish

From `packages/convex-blog-cms`:

```bash
npm publish --access public
```

Scoped packages (`@basic-blog/...`) require `--access public` on first publish unless your org defaults to public.

## Tags

- `latest` — stable releases.
- `alpha` / `beta` — optional prereleases: `npm version prerelease --preid alpha` then `npm publish --tag alpha`.

## After publishing

- Tag the git release to match the npm version.
- Update the repo README or changelog if you maintain one.

## Repository metadata

Ensure `package.json` has `repository`, `homepage`, and `bugs` pointing at your real GitHub (or forge) URLs so npm and users can find the source.