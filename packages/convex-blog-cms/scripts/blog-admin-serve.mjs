#!/usr/bin/env node
/**
 * Runs the bundled Basic Blog CMS admin SPA (`basic-blog-convex-blog-cms` → `convex-blog-admin serve`).
 *
 * - Normalizes `.convex.site` → `.convex.cloud` for the Convex JS client.
 * - Invokes the CLI from the installed package (no `npx` fetch; matches lockfile version).
 * - Optional `BLOG_ADMIN_PORT` or `PORT` when `--port` is not passed (CLI default 3847 if neither set).
 *
 * Usage:
 *   pnpm blog:admin
 *   pnpm blog:admin -- --port 4000
 *   BLOG_ADMIN_PORT=4000 pnpm blog:admin
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rawArgs = process.argv.slice(2);
const pkgScriptsDir = dirname(fileURLToPath(import.meta.url));
const convexPkgRoot = join(pkgScriptsDir, "..");

function readCmsVersion() {
  try {
    const meta = JSON.parse(readFileSync(join(convexPkgRoot, "package.json"), "utf8"));
    return meta.version ?? "";
  } catch {
    return "";
  }
}

const cmsVersion = readCmsVersion();

function printHelp() {
  console.log(`blog-admin-serve — Basic Blog CMS admin UI launcher

  CONVEX_URL="https://….convex.cloud" npx blog-admin-serve [--port 3847]
  Optional: BLOG_ADMIN_API_KEY=… (same as Convex env) for token auth.
  Listen: BLOG_ADMIN_HOST (default 127.0.0.1; use 0.0.0.0 in containers / Railway).
  Port: --port, or BLOG_ADMIN_PORT, or PORT (e.g. Railway), else 3847.

  npx blog-admin-serve --help       Show this message
  npx blog-admin-serve --version    Show package version

This launcher delegates to convex-blog-admin serve after normalizing Convex URL settings.
`);
}

if (rawArgs[0] === "--help" || rawArgs[0] === "-h") {
  printHelp();
  process.exit(0);
}

if (rawArgs[0] === "--version" || rawArgs[0] === "-v" || rawArgs[0] === "-V") {
  console.log(cmsVersion);
  process.exit(0);
}

let url =
  process.env.CONVEX_URL?.trim() ||
  process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ||
 "";

if (url.endsWith(".convex.site")) {
  const normalized = url.replace(/\.convex\.site$/i, ".convex.cloud");
  console.warn(
    "[blog-admin-serve] Using .convex.cloud for the admin client (was .convex.site — HTTP Actions only).\n" +
      `  ${url}\n  → ${normalized}\n`,
  );
  url = normalized;
}

if (!url) {
  console.error(
    "Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL to your deployment, e.g.\n" +
      "  https://qualified-pigeon-865.convex.cloud",
  );
  process.exit(1);
}

process.env.CONVEX_URL = url;

const require = createRequire(import.meta.url);
let cmsPkgRoot;
try {
  const pkgJsonPath = require.resolve("basic-blog-convex-blog-cms/package.json");
  cmsPkgRoot = dirname(pkgJsonPath);
} catch {
  console.error(
    "[blog-admin-serve] Missing dependency basic-blog-convex-blog-cms. From the monorepo root run: pnpm install",
  );
  process.exit(1);
}

const cliPath = join(cmsPkgRoot, "bin", "convex-blog-admin.mjs");
const userArgs = rawArgs[0] === "serve" ? rawArgs.slice(1) : rawArgs;
const serveArgs = ["serve"];

const hasPort =
  userArgs.includes("--port") ||
  userArgs.some((a) => a.startsWith("--port="));
if (!hasPort) {
  const fromBlog = process.env.BLOG_ADMIN_PORT?.trim();
  const fromPlatform = process.env.PORT?.trim();
  const fromEnv = fromBlog || fromPlatform;
  if (fromEnv) {
    serveArgs.push("--port", fromEnv);
  }
}
serveArgs.push(...userArgs);

if (cmsVersion) {
  console.log(
    `[blog-admin-serve] basic-blog-convex-blog-cms@${cmsVersion} — opening admin after listen…`,
  );
}

const child = spawn(process.execPath, [cliPath, ...serveArgs], {
  cwd: convexPkgRoot,
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
