import { derivePlainTextDescriptionFromBlocks } from "./deriveDescriptionFromBlocks.js";
import type { BlockDTO, PostDTO, PrimaryImage, SiteSettingsDTO } from "./types.js";

function absoluteUrl(site: SiteSettingsDTO | null, path: string): string {
  const base = (site?.baseUrl ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
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
}): Record<string, unknown> {
  const { post, site, primaryImage, path, blocks } = input;
  const url = absoluteUrl(site, path);
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
    (blocks ? derivePlainTextDescriptionFromBlocks(blocks) : undefined);

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
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
    image,
  };

  if (post.faq && post.faq.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        article,
        {
          "@type": "FAQPage",
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

  return article;
}

export function buildWebSiteJsonLd(site: SiteSettingsDTO): Record<string, unknown> {
  const base = site.baseUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.siteName,
    url: base,
  };
}
