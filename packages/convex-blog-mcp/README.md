# convex-blog-mcp

[MCP](https://modelcontextprotocol.io) server for apps using [`basic-blog-convex-blog-cms`](https://www.npmjs.com/package/basic-blog-convex-blog-cms): **list**, **create**, and **update** blog posts (Convex `posts` table) via your deployed Convex functions (`listPostsForAdmin`, `createPost`, `updatePost`). Convex calls use [`ConvexHttpClient`](https://docs.convex.dev/quickstart/nodejs) and [`anyApi`](https://docs.convex.dev/client/javascript#using-convex-without-generated-convex_generatedapijs) (no host `convex/_generated` copy required).

Transports:

- **stdio** — default **Dockerfile**; local agents (Cursor, Claude Code, Codex) with `docker run -i` or a local `node dist/stdioServer.js` after `pnpm build`.
- **Streamable HTTP** — `Dockerfile.http`, `POST /mcp` (e.g. [Railway](https://docs.railway.com/)).

## Attach to Cursor, Claude Code, or OpenAI Codex

All three clients speak MCP over **stdio** (start a process on your machine) or **HTTP** (URL to a deployed server). Use **stdio + Docker** if you want the same image everywhere; use **HTTP** if you already deployed this package to Railway (or similar) and prefer not to run Docker locally.

Official references: [Cursor MCP](https://docs.cursor.com/context/mcp), [Claude Code MCP](https://code.claude.com/docs/en/mcp), [OpenAI Codex MCP](https://developers.openai.com/codex/mcp).

### Build the stdio image (Docker)

From the **repository root** (adjust the path if your clone lives elsewhere):

```bash
docker build -t convex-blog-mcp -f packages/convex-blog-mcp/Dockerfile packages/convex-blog-mcp
```

### Cursor

1. Open **Cursor Settings → MCP** (or **Features → MCP**, depending on version) and use **Add server**, **Edit config**, or open the JSON file directly.
2. Put configuration in **user** scope or **project** scope:
   - **User (global):** `~/.cursor/mcp.json` on macOS/Linux, `%USERPROFILE%\.cursor\mcp.json` on Windows.
   - **Project:** `.cursor/mcp.json` at the repo root (good for sharing structure; keep secrets out of git—use env vars).

**Example — Docker stdio** (`mcpServers` shape matches [Cursor’s MCP docs](https://docs.cursor.com/context/mcp)):

```json
{
  "mcpServers": {
    "convex-blog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "CONVEX_URL",
        "-e",
        "BLOG_ADMIN_API_KEY",
        "convex-blog-mcp"
      ],
      "env": {
        "CONVEX_URL": "https://YOUR_DEPLOYMENT.convex.cloud",
        "BLOG_ADMIN_API_KEY": "your-secret"
      }
    }
  }
}
```

Omit `BLOG_ADMIN_API_KEY` from `env` if your Convex host does not use the shared admin token. Restart MCP or Cursor after saving.

**Example — local Node (monorepo checkout):** run `pnpm --filter @basic-blog/convex-blog-mcp run build` first, then point `cwd` at `packages/convex-blog-mcp` and start `node dist/stdioServer.js`:

```json
{
  "mcpServers": {
    "convex-blog": {
      "command": "node",
      "args": ["dist/stdioServer.js"],
      "cwd": "/ABSOLUTE/PATH/TO/basic-blog/packages/convex-blog-mcp",
      "env": {
        "CONVEX_URL": "https://YOUR_DEPLOYMENT.convex.cloud",
        "BLOG_ADMIN_API_KEY": "your-secret"
      }
    }
  }
}
```

**Example — remote HTTP** (deployed `Dockerfile.http`; set `MCP_BEARER_TOKEN` on the server and match the header name your host expects):

```json
{
  "mcpServers": {
    "convex-blog": {
      "url": "https://YOUR_DOMAIN/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_BEARER_TOKEN"
      }
    }
  }
}
```

Exact keys for HTTP transport (`url` vs `serverUrl`, `headers` shape) follow your Cursor build—if something fails to connect, check **Cursor Settings → MCP** for the live schema hint or the docs link above.

### Claude Code

Use the **`claude mcp`** CLI ([docs](https://code.claude.com/docs/en/mcp)). Options (`--transport`, `--env`, `--scope`, `--header`) must appear **before** the server name; a **`--`** separates the server name from the command that starts the MCP process.

**Stdio + Docker (local scope, default — stored under your project entry in `~/.claude.json`):**

```bash
claude mcp add --transport stdio \
  --env CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" \
  --env BLOG_ADMIN_API_KEY="your-secret" \
  convex-blog -- \
  docker run -i --rm -e CONVEX_URL -e BLOG_ADMIN_API_KEY convex-blog-mcp
```

Omit `BLOG_ADMIN_API_KEY` lines if unused. For a server available in **every** project: add `--scope user`. To commit a shared definition for the team: add `--scope project` (writes **`.mcp.json`** in the repo root; prefer `${CONVEX_URL}` / `${BLOG_ADMIN_API_KEY}` expansion in that file instead of literals—see Claude’s **Environment variable expansion** in the same doc).

**HTTP + Bearer** (after you deploy Streamable HTTP):

```bash
claude mcp add --transport http convex-blog https://YOUR_DOMAIN/mcp \
  --header "Authorization: Bearer YOUR_MCP_BEARER_TOKEN"
```

Manage and inspect: `claude mcp list`, `claude mcp get convex-blog`, `claude mcp remove convex-blog`. Inside Claude Code, **`/mcp`** shows connection status.

**Windows (native, not WSL):** local servers started with `npx` sometimes need a `cmd /c` wrapper; Docker-based commands above usually work as-is. See the [Claude Code MCP](https://code.claude.com/docs/en/mcp) note on Windows.

### OpenAI Codex (CLI and IDE extension)

Codex reads **`~/.codex/config.toml`** (or **`.codex/config.toml`** inside a trusted project). CLI and IDE extension share this file ([docs](https://developers.openai.com/codex/mcp)).

**CLI — stdio + Docker:**

```bash
codex mcp add convex-blog \
  --env CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" \
  --env BLOG_ADMIN_API_KEY="your-secret" -- \
  docker run -i --rm -e CONVEX_URL -e BLOG_ADMIN_API_KEY convex-blog-mcp
```

**Streamable HTTP** — add a block to **`~/.codex/config.toml`** (or merge with what `codex mcp add` created; run `codex mcp --help` for your CLI version):

```toml
[mcp_servers.convex-blog]
url = "https://YOUR_DOMAIN/mcp"
bearer_token_env_var = "CONVEX_BLOG_MCP_TOKEN"
```

Export **`CONVEX_BLOG_MCP_TOKEN`** in your environment to match **`MCP_BEARER_TOKEN`** on the server (omit `bearer_token_env_var` if you did not enable a bearer token on the HTTP server).

**Manual `config.toml` — stdio + Docker:**

```toml
[mcp_servers.convex-blog]
command = "docker"
args = ["run", "-i", "--rm", "-e", "CONVEX_URL", "-e", "BLOG_ADMIN_API_KEY", "convex-blog-mcp"]

[mcp_servers.convex-blog.env]
CONVEX_URL = "https://YOUR_DEPLOYMENT.convex.cloud"
BLOG_ADMIN_API_KEY = "your-secret"
```

In the Codex TUI, **`/mcp`** lists active servers. Use `codex mcp --help` for add/remove/list commands.

## Convex host setup

Your Convex project must export the blog admin API from a module (commonly `convex/blog.ts`) as in the [package setup docs](https://github.com/daocodotorg/basic-blog/blob/main/docs/SETUP.md). The default Convex module path is `blog` (i.e. `convex/blog.ts`).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVEX_URL` | Yes | Deployment URL (e.g. from Convex dashboard). |
| `BLOG_ADMIN_API_KEY` | No | Passed as `adminApiKey` on each admin call; must match `BLOG_ADMIN_API_KEY` on the Convex deployment when using shared-token auth. |
| `CONVEX_BLOG_MODULE` | No | Convex module name without extension (default `blog`). |
| `PORT` | HTTP only | Listen port ([`Dockerfile.http`](Dockerfile.http); Railway sets this automatically). |
| `MCP_BEARER_TOKEN` | No | If set, clients must send `Authorization: Bearer <token>` on `/mcp` (HTTP only). |

Treat `BLOG_ADMIN_API_KEY` as a secret. For production token auth, set **`strictAdminApiKey: true`** in [`makeBlogAdminAPI`](https://github.com/daocodotorg/basic-blog/blob/main/packages/convex-blog-cms/src/client/index.ts) on the host.

## Docker (stdio, default Dockerfile)

Build the image as in [**Build the stdio image (Docker)**](#build-the-stdio-image-docker) (from the repo root), or from anywhere:

```bash
docker build -t convex-blog-mcp /path/to/basic-blog/packages/convex-blog-mcp
```

Run with **`-i`** so the MCP host can attach to stdin/stdout:

```bash
docker run -i --rm \
  -e CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud" \
  -e BLOG_ADMIN_API_KEY="your-secret" \
  convex-blog-mcp
```

Cursor / Claude Code / Codex normally start this for you via the configs in [**Attach to Cursor, Claude Code, or OpenAI Codex**](#attach-to-cursor-claude-code-or-openai-codex).

## Local stdio (without Docker)

From the monorepo root:

```bash
export CONVEX_URL="https://YOUR_DEPLOYMENT.convex.cloud"
export BLOG_ADMIN_API_KEY="..."   # optional
pnpm --filter @basic-blog/convex-blog-mcp run build
pnpm --filter @basic-blog/convex-blog-mcp run start:stdio
```

## Streamable HTTP (Railway)

[`Dockerfile.http`](Dockerfile.http) runs [`src/httpServer.ts`](src/httpServer.ts) with `GET /health` and `POST /mcp`. [`railway.toml`](railway.toml) points at that Dockerfile.

### Deploy on Railway (one click)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/github?utm_medium=integration&utm_source=github&utm_campaign=basic-blog-convex-blog-mcp)

1. Click the button, sign in to Railway, and connect **GitHub** when prompted.
2. Import **[`daocodotorg/basic-blog`](https://github.com/daocodotorg/basic-blog)** (or your fork of this monorepo).
3. For the **convex-blog-mcp** service, set **Root Directory** to **`packages/convex-blog-mcp`** if Railway does not already (Railway sometimes [auto-stages monorepo packages](https://docs.railway.com/deployments/monorepo#automatic-import-for-javascript-monorepos); confirm this service builds with **`Dockerfile.http`** via `railway.toml`).
4. Under **Variables**, add **`CONVEX_URL`** (required). Add **`BLOG_ADMIN_API_KEY`** and/or **`MCP_BEARER_TOKEN`** if you use them on the Convex host / HTTP server.
5. **Settings → Networking → Generate Domain** (or your own custom domain). The MCP URL is **`https://<your-domain>/mcp`**.

**True one-click via a published template:** if this repo (or your org) publishes a [Railway template](https://docs.railway.com/deploy/create), replace the button link with `https://railway.com/new/template/<TEMPLATE_ID>?utm_medium=integration&utm_source=github&utm_campaign=convex-blog-mcp` ([sharing docs](https://docs.railway.com/guides/publish-and-share)). To create that template: **Templates → New Template** → add a service from this GitHub repo → Root Directory **`packages/convex-blog-mcp`** → required variables as above → **Create Template** → copy the template URL from the template page.

### HTTP client notes

Use your public base URL and path `/mcp`. If `MCP_BEARER_TOKEN` is set, configure your client to send the `Authorization` header.

## Tools

| Tool | Convex function |
|------|-----------------|
| `list_articles` | `listPostsForAdmin` (optional `limit`, max 200) |
| `create_article` | `createPost` |
| `update_article` | `updatePost` |

## Security

A public Railway URL exposes `/mcp` to the internet. Set **`MCP_BEARER_TOKEN`** and restrict who receives the token.
