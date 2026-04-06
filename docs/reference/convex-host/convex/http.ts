import { httpRouter } from "convex/server";
import { httpActionGeneric } from "convex/server";
import {
  buildRssXml,
  buildSitemapXml,
  postsToSitemapEntries,
  resolvePrimaryImage,
} from "basic-blog-convex-blog-cms/next";
import type {
  BlockDTO,
  PostDTO,
  SiteSettingsDTO,
} from "basic-blog-convex-blog-cms/next";
import { api } from "./_generated/api.js";

const http = httpRouter();

type PublishedBundle = {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
};

http.route({
  path: "/rss.xml",
  method: "GET",
  handler: httpActionGeneric(async (ctx) => {
    const site = (await ctx.runQuery(api.blog.getPublicSiteSettings, {})) as
      | SiteSettingsDTO
      | null;
    if (!site) {
      return new Response("Site not configured", { status: 404 });
    }
    const posts = (await ctx.runQuery(api.blog.listPublishedPosts, {
      limit: 50,
    })) as PostDTO[];
    const items: Array<{ post: PostDTO; path: string }> = [];
    for (const p of posts) {
      const full = (await ctx.runQuery(api.blog.getPublishedPostBySlug, {
        slug: p.slug,
      })) as PublishedBundle | null;
      if (!full) {
        continue;
      }
      items.push({
        post: full.post,
        path: `/blog/${p.slug}`,
      });
    }
    const xml = buildRssXml({ site, items });
    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }),
});

http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpActionGeneric(async (ctx) => {
    const site = (await ctx.runQuery(api.blog.getPublicSiteSettings, {})) as
      | SiteSettingsDTO
      | null;
    if (!site) {
      return new Response("Site not configured", { status: 404 });
    }
    const posts = (await ctx.runQuery(api.blog.listPublishedPosts, {
      limit: 100,
    })) as PostDTO[];
    const entries: Array<{
      post: PostDTO;
      path: string;
      primaryImage: ReturnType<typeof resolvePrimaryImage>;
    }> = [];
    for (const p of posts) {
      const full = (await ctx.runQuery(api.blog.getPublishedPostBySlug, {
        slug: p.slug,
      })) as PublishedBundle | null;
      if (!full) {
        continue;
      }
      const primary = resolvePrimaryImage(full.post, full.blocks, site);
      entries.push({
        post: full.post,
        path: `/blog/${p.slug}`,
        primaryImage: primary,
      });
    }
    const sitemapEntries = postsToSitemapEntries({
      site,
      posts: entries,
    });
    const xml = buildSitemapXml(sitemapEntries);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }),
});

export default http;
