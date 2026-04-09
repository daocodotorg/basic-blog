# Agent notes — basic-blog monorepo

## Scope

Monorepo for **`basic-blog-convex-blog-cms`** (npm package under `packages/convex-blog-cms/`), examples, and CI. Agents should prefer small, task-focused diffs and match existing patterns in touched files.

## npm release (automatic when version changes)

Publishing is **not** triggered by commits to `main` alone. The GitHub Action **Release** (`.github/workflows/release.yml`) runs only when a **version tag** is pushed:

- Tag pattern: `v*` (e.g. `v0.1.9`).
- The workflow checks that the tag **without** the leading `v` equals `packages/convex-blog-cms/package.json` → **`version`**. Mismatch fails the job.

### When to tag

After you (or a user) bump `packages/convex-blog-cms/package.json` **`version`** and that change is on **`main`** (merged / pushed), **finish the release by pushing the matching tag** so CI publishes to npm and creates a GitHub Release.

### Commands (agent should run these unless the user opts out)

Replace `X.Y.Z` with the exact `version` string from `packages/convex-blog-cms/package.json`. Use `main` (or the specific release commit SHA) as the tag target.

```bash
cd /path/to/basic-blog
git fetch origin
V="X.Y.Z"  # must match package.json, e.g. 0.1.9

# Remove a wrong or stale tag on the remote (safe if absent)
git push origin ":refs/tags/v${V}"

# Remove local tag if it exists so we can recreate
git tag -d "v${V}" 2>/dev/null || true

# Point the tag at the commit that contains the bumped package.json
git tag "v${V}" origin/main   # or: git tag "v${V}" <sha>

git push origin "v${V}"
```

Then confirm **Actions → Release** succeeded.

### Rules of thumb

1. **Never** invent a tag version that does not match `package.json`.
2. If the user asks to **re-run** a release for the same version, **delete the remote tag** and **recreate** it on the correct commit, then **push** again (re-pushing an identical tag does not retrigger `push` workflows on GitHub).
3. Trusted publishing / `NPM_PUBLISH_TOKEN` is configured on the repo; agents do not need to run `npm publish` locally for the canonical release.

## CI on every push

**CI** (`.github/workflows/ci.yml`) runs on pushes and PRs to `main`/`master`; it typechecks, lints, tests, and builds the CMS package. That is separate from the tag-based Release workflow.
