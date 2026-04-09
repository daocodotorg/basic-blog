import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { NextFunction, Request, Response } from "express";
import { createBlogConvexBridge } from "./convexBlog.js";
import { createBlogMcpServer } from "./createBlogMcpServer.js";
import { loadHttpEnv } from "./env.js";

function main() {
  const env = loadHttpEnv();
  const bridge = createBlogConvexBridge(env);

  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).type("text/plain").send("ok");
  });

  if (env.mcpBearerToken) {
    const token = env.mcpBearerToken;
    app.use("/mcp", (req: Request, res: Response, next: NextFunction) => {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${token}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      next();
    });
  }

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createBlogMcpServer(bridge);
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.delete("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.listen(env.port, "0.0.0.0", (err?: Error) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.error(
      `convex-blog-mcp HTTP listening on 0.0.0.0:${env.port} (MCP POST /mcp)`,
    );
  });
}

main();
