# Publishing `basic-blog-convex-blog-cms`

Maintainer guide for the **npm package** [`basic-blog-convex-blog-cms`](https://www.npmjs.com/package/basic-blog-convex-blog-cms). Aligns with the [Convex component template](https://github.com/get-convex/templates/tree/main/template-component) and [Component authoring — Publishing](https://docs.convex.dev/components/authoring#publishing-to-npm).

**Versioning:** The first **stable** line on npm `latest` is **`0.1.0`**. Use **`npm version`** for subsequent releases (`patch` / `minor` / `major` as appropriate). Avoid jumping to `1.0.0` unless you intentionally signal a major API milestone.

## Automated release (recommended)

The repo includes [`.github/workflows/release.yml`](../../.github/workflows/release.yml). When you **push a git tag** whose name is `v` plus the exact `version` in this directory’s `package.json` (e.g. tag `v0.2.0` and `"version": "0.2.0"`), GitHub Actions will:

1. Install dependencies and run typecheck, lint, tests, and build.
2. Publish **`basic-blog-convex-blog-cms`** to the npm registry (`latest`).
3. Create a **GitHub Release** for that tag with auto-generated release notes.

### One-time setup: Trusted publishing (recommended — avoids `EOTP` and secrets)

npm can publish from this repo using **OpenID Connect** so CI never needs an OTP or a long-lived publish token. See [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers).

1. On [npmjs.com](https://www.npmjs.com/) open **`basic-blog-convex-blog-cms`** → **Settings** (or package admin) → **Trusted publishing** / **Publish with OIDC**.
2. Choose **GitHub Actions** and set:
   - **Repository:** `daocodotorg/basic-blog` (must match [`package.json`](./package.json) **`repository.url`**).
   - **Workflow filename:** `release.yml` (only the file name — the workflow lives in `.github/workflows/release.yml`).
3. Save. The next tag push will use short-lived credentials; you do **not** need **`NPM_TOKEN`** for publish.

The workflow uses **Node 22.14+** and **npm 11.5.1+** on the runner, as required by npm for OIDC.

### Fallback: `NPM_TOKEN` (only if you skip Trusted publishing)

If OIDC is **not** configured, add GitHub Actions secret **`NPM_TOKEN`** with a token that can publish **without** prompting for an authenticator code:

| Token kind | What to use |
|------------|-------------|
| **Classic** | Type **Automation** (not “Publish”). “Publish” + 2FA often yields **`EOTP`** in CI. |
| **Granular** | [Granular access token](https://docs.npmjs.com/about-access-tokens#creating-granular-access-tokens-on-the-website) with **Read and write** on **`basic-blog-convex-blog-cms`**. |

### If you still see `npm error code EOTP`

That means npm did **not** accept your token (wrong type, wrong account, or empty secret) **and** OIDC was not used. **Configure Trusted publishing** as above, or create a new **Automation** token while logged in as the npm user that **owns** the package, update **`NPM_TOKEN`**, and re-run the workflow.

The release job runs **`npm publish`** from `packages/convex-blog-cms` (not `pnpm publish`).

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