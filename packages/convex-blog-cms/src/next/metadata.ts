import type { Metadata } from "next";
import { absoluteUrlFromSite } from "../seo/absoluteUrl.js";
import { derivePlainTextDescriptionFromBlocks } from "../seo/deriveDescriptionFromBlocks.js";
import type { BlockDTO, PostDTO, SiteSettingsDTO } from "../seo/types.js";
import { resolvePrimaryImage } from "../seo/resolvePrimaryImage.js";

/** Next.js `metadataBase` must be a valid URL; invalid `site.baseUrl` should not throw at render time. */
function metadataBaseFromSiteUrl(baseUrl: string): URL | undefined {
  try {
    return new URL(baseUrl);
  } catch {
    return undefined;
  }
}

export function postToNextMetadata(input: {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
  site: SiteSettingsDTO | null;
  path: string;
  /** Used when `site.baseUrl` is empty (e.g. align with `NEXT_PUBLIC_BASE_URL`). */
  fallbackBaseUrl?: string;
}): Metadata {
  const { post, blocks, site, path, fallbackBaseUrl } = input;
  const title = post.metaTitle ?? post.title;
  const description =
    post.metaDescription ??
    post.excerpt ??
    derivePlainTextDescriptionFromBlocks(blocks) ??
    undefined;
  const pathForCanonical = post.canonicalPath ?? path;
  const canonical = absoluteUrlFromSite(site, pathForCanonical, fallbackBaseUrl);
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

export function blogIndexToNextMetadata(input: {
  site: SiteSettingsDTO | null;
  path: string;
  title: string;
  description?: string;
  fallbackBaseUrl?: string;
}): Metadata {
  const { site, path, title, description, fallbackBaseUrl } = input;
  const canonical = absoluteUrlFromSite(site, path, fallbackBaseUrl);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function siteSettingsToDefaultMetadata(
  site: SiteSettingsDTO | null,
): Metadata {
  if (!site) {
    return {};
  }
  const metadataBase = metadataBaseFromSiteUrl(site.baseUrl);
  return {
    ...(metadataBase ? { metadataBase } : {}),
    title: { default: site.siteName, template: `%s | ${site.siteName}` },
    robots: site.defaultRobots,
  };
}
