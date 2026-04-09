import { absoluteUrlFromSite, normalizeBaseUrl } from "./absoluteUrl.js";
import { derivePlainTextDescriptionFromBlocks } from "./deriveDescriptionFromBlocks.js";
import type { BlockDTO, PostDTO, PrimaryImage, SiteSettingsDTO } from "./types.js";

function articleUrl(
  post: PostDTO,
  site: SiteSettingsDTO | null,
  path: string,
  fallbackBaseUrl: string | undefined,
): string {
  const pathForUrl = post.canonicalPath ?? path;
  return absoluteUrlFromSite(site, pathForUrl, fallbackBaseUrl);
}

/**
 * BlogPosting JSON-LD; merges FAQ only when `post.faq` is non-empty.
 */
export function buildArticleJsonLd(input: {
  post: PostDTO;
  site: SiteSettingsDTO | null;
  primaryImage: PrimaryImage | null;
  path: string;
  /** When set, used to derive `description` when meta and excerpt are empty. */
  blocks?: Array<{ order: number; block: BlockDTO }>;
  /** Used when `site.baseUrl` is empty (e.g. align with `NEXT_PUBLIC_BASE_URL`). */
  fallbackBaseUrl?: string;
}): Record<string, unknown> {
  const { post, site, primaryImage, path, blocks, fallbackBaseUrl } = input;
  const url = articleUrl(post, site, path, fallbackBaseUrl);
  const image =
    primaryImage !== null
      ? primaryImage.width && primaryImage.height
        ? {
            "@type": "ImageObject",
            url: primaryImage.url,
            width: primaryImage.width,
            height: primaryImage.height,
            caption: primaryImage.alt,
          }
        : primaryImage.url
      : undefined;

  const description =
    post.metaDescription ??
    post.excerpt ??
    post.answerSummary ??
    (blocks ? derivePlainTextDescriptionFromBlocks(blocks) : undefined);

  const siteBase = site?.baseUrl?.trim() ? normalizeBaseUrl(site.baseUrl.trim()) : "";
  const publisher =
    site && siteBase
      ? {
          "@type": "Organization",
          name: site.siteName,
          url: siteBase,
        }
      : undefined;

  const articleBody: Record<string, unknown> = {
    "@type": "BlogPosting",
    headline: post.metaTitle ?? post.title,
    description,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
    url,
    mainEntityOfPage: url,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : undefined,
    publisher,
    image,
  };

  if (post.answerSummary?.trim()) {
    articleBody.abstract = post.answerSummary.trim();
  }

  if (post.faq && post.faq.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        articleBody,
        {
          "@type": "FAQPage",
          url,
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        },
      ],
    };
  }

  return {
    "@context": "https://schema.org",
    ...articleBody,
  };
}

export function buildWebSiteJsonLd(site: SiteSettingsDTO): Record<string, unknown> {
  const base = normalizeBaseUrl(site.baseUrl.trim());
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.siteName,
    url: base,
  };
}

export function buildBlogIndexJsonLd(input: {
  site: SiteSettingsDTO | null;
  indexPath: string;
  name: string;
  description?: string;
  items: Array<{ post: PostDTO; path: string }>;
  fallbackBaseUrl?: string;
  /** Stable `@id` for cross-linking with a homepage WebSite node. */
  webSiteId?: string;
  organizationId?: string;
}): Record<string, unknown> {
  const {
    site,
    indexPath,
    name,
    description,
    items,
    fallbackBaseUrl,
    webSiteId,
    organizationId,
  } = input;

  const indexUrl = absoluteUrlFromSite(site, indexPath, fallbackBaseUrl);
  const itemListId = `${indexUrl}#itemlist`;
  const pageId = `${indexUrl}#webpage`;

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": pageId,
    url: indexUrl,
    name,
    ...(description ? { description } : {}),
    mainEntity: { "@id": itemListId },
  };

  if (webSiteId) {
    collectionPage.isPartOf = { "@id": webSiteId };
  }
  if (organizationId) {
    collectionPage.publisher = { "@id": organizationId };
  }

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": itemListId,
    itemListElement: items.map(({ post, path: itemPath }, i) => {
      const itemUrl = absoluteUrlFromSite(site, itemPath, fallbackBaseUrl);
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        url: itemUrl,
        name: post.metaTitle ?? post.title,
      };
      if (post.publishedAt) {
        entry.datePublished = new Date(post.publishedAt).toISOString();
      }
      return entry;
    }),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [collectionPage, itemList],
  };
}
