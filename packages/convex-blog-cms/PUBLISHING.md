# Publishing `basic-blog-convex-blog-cms`

Maintainer guide for the **npm package** [`basic-blog-convex-blog-cms`](https://www.npmjs.com/package/basic-blog-convex-blog-cms). Aligns with the [Convex component template](https://github.com/get-convex/templates/tree/main/template-component) and [Component authoring — Publishing](https://docs.convex.dev/components/authoring#publishing-to-npm).

**Versioning:** The first **stable** line on npm `latest` is **`0.1.0`**. Use **`npm version`** for subsequent releases (`patch` / `minor` / `major` as appropriate). Avoid jumping to `1.0.0` unless you intentionally signal a major API milestone.

## Automated release (recommended)

The repo includes [`.github/workflows/release.yml`](../../.github/workflows/release.yml). When you **push a git tag** whose name is `v` plus the exact `version` in this directory’s `package.json` (e.g. tag `v0.2.0` and `"version": "0.2.0"`), GitHub Actions will:

1. Install dependencies and run typecheck, lint, tests, and build.
2. Publish **`basic-blog-convex-blog-cms`** to the npm registry (`latest`).
3. Create a **GitHub Release** for that tag with auto-generated release notes.

**One-time setup:** In the GitHub repo → **Settings → Secrets and variables → Actions**, add **`NPM_TOKEN`**: create an [npm access token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with **publish** permission for this package (automation or granular token with write access).

**Release steps:**

1. On `main`, update `"version"` in [`package.json`](./package.json), commit, and push.
2. Tag and push (example for `0.2.0`):

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

The workflow fails fast if the tag does not match `package.json` (e.g. tag `v0.2.0` but package still says `0.1.0`).

## Manual publish (optional)

Use this if you prefer not to use CI or need to publish from your machine.

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
4. **Verify `files`**: `[package.json](./package.json)` publishes `dist` and `src` so consumers get source maps and the component tree. `npm run build` also runs **Vite** to produce `dist/admin-spa` (bundled admin UI for `convex-blog-admin serve`).

### Publish

From `packages/convex-blog-cms`:

```bash
npm publish
```

The package is **unscoped** (`basic-blog-convex-blog-cms`), so any npm user who is logged in can publish if the name is not already taken — no npm organization is required.

## Tags

- `latest` — stable releases.
- `alpha` / `beta` — optional prereleases: `npm version prerelease --preid alpha` then `npm publish --tag alpha`.

## After publishing

- **Automated workflow:** the tag you pushed is already the release; GitHub creates the Release for you.
- **Manual:** create a git tag that matches the published version (for example `v0.1.0` for npm `0.1.0`): `git tag v0.1.0` and push tags, or create a GitHub Release from that tag.
- Update the repo README or changelog if you maintain one.

## Repository metadata

Ensure `package.json` has `repository`, `homepage`, and `bugs` pointing at your real GitHub (or forge) URLs so npm and users can find the source.