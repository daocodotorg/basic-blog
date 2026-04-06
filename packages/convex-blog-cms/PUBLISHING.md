# Publishing `basic-blog-convex-blog-cms`

Maintainer guide for the **npm package** [`basic-blog-convex-blog-cms`](https://www.npmjs.com/package/basic-blog-convex-blog-cms). Aligns with the [Convex component template](https://github.com/get-convex/templates/tree/main/template-component) and [Component authoring — Publishing](https://docs.convex.dev/components/authoring#publishing-to-npm).

**Versioning:** The first **stable** line on npm `latest` is **`0.1.0`**. Use **`npm version`** for subsequent releases (`patch` / `minor` / `major` as appropriate). Avoid jumping to `1.0.0` unless you intentionally signal a major API milestone.

## Automated release (recommended)

The repo includes [`.github/workflows/release.yml`](../../.github/workflows/release.yml). When you **push a git tag** whose name is `v` plus the exact `version` in this directory’s `package.json` (e.g. tag `v0.2.0` and `"version": "0.2.0"`), GitHub Actions will:

1. Install dependencies and run typecheck, lint, tests, and build.
2. Publish **`basic-blog-convex-blog-cms`** to the npm registry (`latest`).
3. Create a **GitHub Release** for that tag with auto-generated release notes.

### One-time setup: Trusted publishing (recommended — no OTP)

npm can publish from GitHub Actions using **OpenID Connect** so CI does not use a long-lived publish token or an authenticator code. See [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers).

1. **GitHub:** In **Settings → Secrets and variables → Actions**, **delete** any old secret named **`NPM_TOKEN`** if you added one earlier. A classic “Publish” token there often ends up in `~/.npmrc` and triggers **`EOTP`** when OIDC is not active yet.
2. **npmjs.com:** Open **`basic-blog-convex-blog-cms`** → **Publishing access** / **Trusted publishers** (wording varies) → **Connect GitHub Actions**.
3. Set exactly:
   - **Repository:** `daocodotorg/basic-blog` (must match [`package.json`](./package.json) **`repository.url`** — same GitHub repo).
   - **Workflow filename:** `release.yml` (filename only, case-sensitive; file is `.github/workflows/release.yml`).
4. Save on npm.

The workflow runs **`npx npm@11.6.0 publish`** (npm **11.5.1+** is required for OIDC) on **Node 22.14**. It clears **`~/.npmrc`** before publish so no stale token overrides OIDC.

### Fallback: secret `NPM_PUBLISH_TOKEN` (no Trusted publishing)

Only if you **do not** use Trusted publishing: add Actions secret **`NPM_PUBLISH_TOKEN`** (not `NPM_TOKEN`) whose value is:

| Token kind | What to use |
|------------|-------------|
| **Classic** | Type **Automation** only. **Never** use type **Publish** with an account that has 2FA — that produces **`EOTP`** in CI. |
| **Granular** | [Granular token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with **Read and write** on **`basic-blog-convex-blog-cms`**. |

If **`NPM_PUBLISH_TOKEN`** is unset, the workflow relies on **OIDC only** (Trusted publishing must be configured on npm).

### If you still see `npm error code EOTP`

- **Cause:** npm is using **password-style / Publish token** auth (or a bad token), not OIDC.
- **Fix:** Complete **Trusted publishing** on npm (steps above) and **remove** `NPM_TOKEN` / wrong secrets; **or** set **`NPM_PUBLISH_TOKEN`** to a new **Automation** (classic) or **granular publish** token for the npm user that **owns** the package.

The release job runs **`npm publish`** from `packages/convex-blog-cms` via **`npx npm@11.6.0`** (not `pnpm publish`).

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