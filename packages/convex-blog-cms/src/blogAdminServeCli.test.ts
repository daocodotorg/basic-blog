// @vitest-environment node

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import packageJson from "../package.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const blogAdminServePath = join(pkgRoot, "scripts", "blog-admin-serve.mjs");
const convexBlogAdminPath = join(pkgRoot, "bin", "convex-blog-admin.mjs");

function runCli(cliPath: string, args: string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: pkgRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      CONVEX_URL: "",
      NEXT_PUBLIC_CONVEX_URL: "",
    },
  });
}

describe("blog-admin-serve CLI", () => {
  test("prints help without requiring CONVEX_URL", () => {
    const result = runCli(blogAdminServePath, ["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("convex-blog-admin");
    expect(result.stderr).not.toContain("Set CONVEX_URL");
  });

  test("prints version without requiring CONVEX_URL", () => {
    const result = runCli(blogAdminServePath, ["--version"]);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(packageJson.version);
    expect(result.stderr).not.toContain("Set CONVEX_URL");
  });
});

describe("convex-blog-admin CLI", () => {
  test("prints version without starting the server", () => {
    const result = runCli(convexBlogAdminPath, ["--version"]);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(packageJson.version);
    expect(result.stderr).not.toContain("Set CONVEX_URL");
  });
});
