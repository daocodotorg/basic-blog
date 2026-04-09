function required(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export type BlogMcpEnv = {
  convexUrl: string;
  /** Convex module path (file under convex/ without extension), e.g. blog for convex/blog.ts */
  blogModule: string;
  adminApiKey?: string;
  /** If set, require Authorization: Bearer <token> on /mcp */
  mcpBearerToken?: string;
  port: number;
};

export function loadHttpEnv(): BlogMcpEnv {
  const convexUrl = required("CONVEX_URL");
  const blogModule = process.env.CONVEX_BLOG_MODULE?.trim() || "blog";
  const adminApiKey = process.env.BLOG_ADMIN_API_KEY?.trim() || undefined;
  const mcpBearerToken = process.env.MCP_BEARER_TOKEN?.trim() || undefined;
  const portRaw = process.env.PORT ?? "3000";
  const port = Number(portRaw);
  if (!Number.isFinite(port) || port < 1) {
    throw new Error(`Invalid PORT: ${portRaw}`);
  }
  return { convexUrl, blogModule, adminApiKey, mcpBearerToken, port };
}

export function loadStdioEnv(): Omit<BlogMcpEnv, "port" | "mcpBearerToken"> {
  const convexUrl = required("CONVEX_URL");
  const blogModule = process.env.CONVEX_BLOG_MODULE?.trim() || "blog";
  const adminApiKey = process.env.BLOG_ADMIN_API_KEY?.trim() || undefined;
  return { convexUrl, blogModule, adminApiKey };
}
