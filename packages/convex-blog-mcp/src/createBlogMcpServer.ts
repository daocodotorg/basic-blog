import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import type { BlogConvexBridge } from "./convexBlog.js";

const patchSchema = z
  .object({
    slug: z.string().optional(),
    title: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    publishedAt: z.number().optional(),
    authorName: z.string().optional(),
    excerpt: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalPath: z.string().optional(),
    ogImageUrl: z.string().optional(),
    twitterImageUrl: z.string().optional(),
    featuredImageUrl: z.string().optional(),
    featuredImageFocalX: z.number().optional(),
    featuredImageFocalY: z.number().optional(),
    noindex: z.boolean().optional(),
    answerSummary: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
  })
  .passthrough();

function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function toolError(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

export function createBlogMcpServer(bridge: BlogConvexBridge) {
  const server = new McpServer({
    name: "convex-blog-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "list_articles",
    {
      description:
        "List blog posts (Convex posts) for admin, newest first. Maps to listPostsForAdmin.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Max posts to return (default 100, max 200)."),
      },
    },
    async ({ limit }) => {
      try {
        const rows = await bridge.listPosts(limit);
        return jsonResult(rows);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return toolError(`list_articles failed: ${msg}`);
      }
    },
  );

  server.registerTool(
    "create_article",
    {
      description:
        "Create a draft blog post (Convex post) with slug and title. Maps to createPost.",
      inputSchema: {
        slug: z.string().describe("URL slug; must be unique."),
        title: z.string(),
        authorName: z.string().optional(),
        excerpt: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const id = await bridge.createPost(args);
        return jsonResult({ postId: id });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return toolError(`create_article failed: ${msg}`);
      }
    },
  );

  server.registerTool(
    "update_article",
    {
      description:
        "Update a blog post (Convex post) by id. Maps to updatePost. Only include fields to change.",
      inputSchema: {
        postId: z
          .string()
          .describe("Convex posts document id (e.g. from list_articles)."),
        patch: patchSchema.describe("Partial post fields to update."),
      },
    },
    async ({ postId, patch }) => {
      try {
        await bridge.updatePost(postId, patch as Record<string, unknown>);
        return jsonResult({ ok: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return toolError(`update_article failed: ${msg}`);
      }
    },
  );

  return server;
}
