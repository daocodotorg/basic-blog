import type { Metadata } from "next";
import type { BlockDTO, PostDTO, SiteSettingsDTO } from "../seo/types.js";
import { resolvePrimaryImage } from "../seo/resolvePrimaryImage.js";

function absoluteUrl(site: SiteSettingsDTO | null, path: string): string {
  const base = (site?.baseUrl ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function postToNextMetadata(input: {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
  site: SiteSettingsDTO | null;
  path: string;
}): Metadata {
  const { post, blocks, site, path } = input;
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const canonical = post.canonicalPath
    ? absoluteUrl(site, post.canonicalPath)
    : absoluteUrl(site, path);
  const img = resolvePrimaryImage(post, blocks, site);
  const robots = post.noindex ? { index: false, follow: true as const } : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: img
        ? [
            {
              url: img.url,
              alt: img.alt,
              width: img.width,
              height: img.height,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: img ? [img.url] : undefined,
    },
  };
}

export function siteSettingsToDefaultMetadata(
  site: SiteSettingsDTO | null,
): Metadata {
  if (!site) {
    return {};
  }
  return {
    metadataBase: new URL(site.baseUrl),
    title: { default: site.siteName, template: `%s | ${site.siteName}` },
    robots: site.defaultRobots,
  };
}
