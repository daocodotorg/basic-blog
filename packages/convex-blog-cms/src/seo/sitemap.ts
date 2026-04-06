import type { PostDTO, PrimaryImage, SiteSettingsDTO } from "./types.js";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  image?: PrimaryImage | null;
};

export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod
        ? `    <lastmod>${escapeXml(e.lastmod)}</lastmod>\n`
        : "";
      const imageBlock =
        e.image?.url ?
          `    <image:image>
      <image:loc>${escapeXml(e.image.url)}</image:loc>
      <image:title>${escapeXml(e.image.alt)}</image:title>
    </image:image>\n`
        : "";
      return `  <url>
    <loc>${escapeXml(e.loc)}</loc>
${lastmod}${imageBlock}  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

export function postsToSitemapEntries(input: {
  site: SiteSettingsDTO;
  posts: Array<{
    post: PostDTO;
    path: string;
    primaryImage: PrimaryImage | null;
  }>;
}): SitemapUrlEntry[] {
  const base = input.site.baseUrl.replace(/\/$/, "");
  return input.posts.map(({ post, path, primaryImage }) => {
    const loc = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const lastmod = post.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 10)
      : undefined;
    return {
      loc,
      lastmod,
      image: primaryImage,
    };
  });
}
