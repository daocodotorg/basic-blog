import type { BlockDTO, PostDTO, PrimaryImage, SiteSettingsDTO } from "./types.js";

/**
 * Single precedence for OG, Twitter, JSON-LD, and sitemap image selection.
 */
export function resolvePrimaryImage(
  post: PostDTO,
  blocks: Array<{ order: number; block: BlockDTO }>,
  site: SiteSettingsDTO | null,
): PrimaryImage | null {
  const explicit =
    post.ogImageUrl ??
    post.twitterImageUrl ??
    post.featuredImageUrl;
  if (explicit) {
    return {
      url: explicit,
      alt: post.metaTitle ?? post.title,
    };
  }
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  for (const row of sorted) {
    if (row.block.type === "image" && row.block.url) {
      return {
        url: row.block.url,
        alt: row.block.alt,
        width: row.block.width,
        height: row.block.height,
      };
    }
  }
  if (site?.defaultOgImageUrl) {
    return { url: site.defaultOgImageUrl, alt: site.siteName };
  }
  return null;
}
