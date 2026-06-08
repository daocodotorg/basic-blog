#!/usr/bin/env node
/**
 * CLI: serve the bundled admin UI from basic-blog-convex-blog-cms.
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const adminSpaRoot = join(pkgRoot, "dist", "admin-spa");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function printHelp() {
  console.log(`convex-blog-admin — Basic Blog CMS admin UI

  CONVEX_URL="https://….convex.cloud" npx convex-blog-admin serve [--port 3847]
  Optional: BLOG_ADMIN_API_KEY=… (same as Convex env) for token auth.
  Listen: BLOG_ADMIN_HOST (default 127.0.0.1; use 0.0.0.0 in containers / Railway).
  Port: --port, or BLOG_ADMIN_PORT, or PORT (e.g. Railway), else 3847.
  GET /health — plain 200 for load balancers.

  npx convex-blog-admin --help    Show this message

Host Convex must expose makeBlogAdminAPI as blog.* and uploads as media.* (see package README).
`);
}

function printVersion() {
  try {
    const meta = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
    console.log(meta.version ?? "");
  } catch {
    console.log("");
  }
}

function safeResolveUnder(root, relPath) {
  const resolved = normalize(join(root, relPath));
  const rootNorm = normalize(root + sep);
  if (!resolved.startsWith(rootNorm) && resolved !== normalize(root)) {
    return null;
  }
  return resolved;
}

function runServe(port, host) {
  const indexPath = join(adminSpaRoot, "index.html");
  if (!existsSync(indexPath)) {
    console.error(
      "Bundled admin UI not found.\nExpected:",
      indexPath,
      "\nReinstall the package or build from source: npm run build (in basic-blog-convex-blog-cms).",
    );
    process.exit(1);
  }

  const convexUrl =
    process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";
  const adminApiKey =
    process.env.BLOG_ADMIN_API_KEY || process.env.NEXT_PUBLIC_BLOG_ADMIN_API_KEY || undefined;

  if (!convexUrl) {
    console.error(
      "Set CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) to your Convex deployment URL, e.g.\n  CONVEX_URL=https://happy-animal-123.convex.cloud npx convex-blog-admin serve",
    );
    process.exit(1);
  }

  try {
    const host = new URL(convexUrl).hostname;
    if (host.endsWith(".convex.site")) {
      console.warn(
        "\nWarning: CONVEX_URL uses .convex.site (HTTP Actions). The admin needs your .convex.cloud deployment URL.\n" +
          "  Dashboard → Settings → copy the URL ending in .convex.cloud\n",
      );
    }
  } catch {
    // ignore invalid URL here; the SPA will show an error
  }

  const configPayload = JSON.stringify({
    convexUrl,
    ...(adminApiKey ? { adminApiKey } : {}),
  });

  const server = http.createServer((req, res) => {
    const host = req.headers.host ?? `127.0.0.1:${port}`;
    const url = new URL(req.url ?? "/", `http://${host}`);

    if (url.pathname === "/config.json") {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(configPayload);
      return;
    }

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("ok");
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }

    const rel = url.pathname.replace(/^\/+/, "") || "index.html";
    let filePath = safeResolveUnder(adminSpaRoot, rel);

    if (
      !filePath ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      filePath = join(adminSpaRoot, "index.html");
    }

    const ext = extname(filePath);
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(filePath).pipe(res);
  });

  server.listen(port, host, () => {
    console.log(`Blog CMS admin listening on ${host}:${port}`);
    if (host === "127.0.0.1" || host === "::1") {
      console.log(`Open http://127.0.0.1:${port}/admin`);
    } else {
      console.log(`Open /admin on your public URL (e.g. Railway domain, port ${port})`);
    }
    console.log(`CONVEX_URL=${convexUrl}`);
    if (adminApiKey) {
      console.log("BLOG_ADMIN_API_KEY is set (token auth).");
    }
  });
}

const argv = process.argv.slice(2);
if (argv[0] === "--help" || argv[0] === "-h") {
  printHelp();
  process.exit(0);
}

if (argv[0] === "--version" || argv[0] === "-V") {
  printVersion();
  process.exit(0);
}

if (argv[0] === "serve") {
  let port = null;
  const pi = argv.indexOf("--port");
  if (pi >= 0 && argv[pi + 1]) {
    port = Number.parseInt(argv[pi + 1], 10);
    if (Number.isNaN(port)) {
      console.error("Invalid --port");
      process.exit(1);
    }
  } else {
    const eqArg = argv.find((a) => a.startsWith("--port="));
    if (eqArg) {
      port = Number.parseInt(eqArg.split("=")[1], 10);
      if (Number.isNaN(port)) {
        console.error("Invalid --port");
        process.exit(1);
      }
    }
  }
  if (port === null) {
    const fromBlog = process.env.BLOG_ADMIN_PORT?.trim();
    const fromPlatform = process.env.PORT?.trim();
    if (fromBlog) {
      port = Number.parseInt(fromBlog, 10);
      if (Number.isNaN(port)) {
        console.error("Invalid BLOG_ADMIN_PORT");
        process.exit(1);
      }
    } else if (fromPlatform) {
      port = Number.parseInt(fromPlatform, 10);
      if (Number.isNaN(port)) {
        console.error("Invalid PORT");
        process.exit(1);
      }
    } else {
      port = 3847;
    }
  }
  const host = process.env.BLOG_ADMIN_HOST?.trim() || "127.0.0.1";
  runServe(port, host);
} else if (argv.length === 0) {
  printHelp();
  process.exit(0);
} else {
  printHelp();
  process.exit(1);
}
