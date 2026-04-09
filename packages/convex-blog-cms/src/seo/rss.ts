import { absoluteUrlFromSite, normalizeBaseUrl } from "./absoluteUrl.js";
import type { PostDTO, SiteSettingsDTO } from "./types.js";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildRssXml(input: {
  site: SiteSettingsDTO;
  items: Array<{ post: PostDTO; path: string }>;
}): string {
  const base = normalizeBaseUrl(input.site.baseUrl.trim());
  const itemsXml = input.items
    .map(({ post, path }) => {
      const link = absoluteUrlFromSite(input.site, path);
      const pub = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : "";
      const title = escapeXml(post.metaTitle ?? post.title);
      const desc = escapeXml(post.metaDescription ?? post.excerpt ?? "");
      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(input.site.siteName)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(input.site.siteName)}</description>
    <language>${escapeXml(input.site.locale ?? "en")}</language>
    <generator>convex-blog-cms</generator>
${itemsXml}
  </channel>
</rss>`;
}
