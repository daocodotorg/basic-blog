import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBlogConvexBridge } from "./convexBlog.js";
import { createBlogMcpServer } from "./createBlogMcpServer.js";
import { loadStdioEnv } from "./env.js";

async function main() {
  const env = loadStdioEnv();
  const bridge = createBlogConvexBridge(env);
  const server = createBlogMcpServer(bridge);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
