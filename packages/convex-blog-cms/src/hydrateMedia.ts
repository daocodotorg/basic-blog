import type { BlockDTO, PostDTO, SiteSettingsDTO } from "./seo/types.js";
import type { BlockStored, PostStored, SiteSettingsStored } from "./seo/storedTypes.js";

/** Matches `ctx.storage.getUrl` from a Convex query/mutation context. */
export type StorageUrlResolver = (
  storageId: string,
) => Promise<string | null>;

/**
 * Resolves Convex `_storage` ids to HTTPS URLs for SEO and rendering.
 * Call from the host Convex deployment (has access to `ctx.storage.getUrl`).
 */
export async function hydratePostDTO(
  getUrl: StorageUrlResolver,
  post: PostStored,
): Promise<PostDTO> {
  const pick = async (
    url: string | undefined,
    storageId: string | undefined,
  ): Promise<string | undefined> => {
    if (storageId) {
      const resolved = await getUrl(storageId);
      return resolved ?? undefined;
    }
    return url;
  };

  return {
    slug: post.slug,
    title: post.title,
    status: post.status,
    publishedAt: post.publishedAt,
    authorName: post.authorName,
    excerpt: post.excerpt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalPath: post.canonicalPath,
    ogImageUrl: await pick(post.ogImageUrl, post.ogImageStorageId),
    twitterImageUrl: await pick(
      post.twitterImageUrl,
      post.twitterImageStorageId,
    ),
    featuredImageUrl: await pick(
      post.featuredImageUrl,
      post.featuredImageStorageId,
    ),
    featuredImageFocalX: post.featuredImageFocalX,
    featuredImageFocalY: post.featuredImageFocalY,
    noindex: post.noindex,
    answerSummary: post.answerSummary,
    keyTakeaways: post.keyTakeaways,
    faq: post.faq,
  };
}

export async function hydrateSiteSettingsDTO(
  getUrl: StorageUrlResolver,
  site: SiteSettingsStored | null,
): Promise<SiteSettingsDTO | null> {
  if (!site) {
    return null;
  }
  let defaultOgImageUrl = site.defaultOgImageUrl;
  if (site.defaultOgImageStorageId) {
    const resolved = await getUrl(site.defaultOgImageStorageId as string);
    if (resolved) {
      defaultOgImageUrl = resolved;
    }
  }
  return {
    siteName: site.siteName,
    baseUrl: site.baseUrl,
    defaultOgImageUrl,
    locale: site.locale,
    defaultRobots: site.defaultRobots,
  };
}

export async function hydrateBlockDTO(
  getUrl: StorageUrlResolver,
  block: BlockStored,
): Promise<BlockDTO> {
  if (block.type !== "image") {
    return block;
  }
  if ("storageId" in block) {
    const url = await getUrl(block.storageId);
    return {
      type: "image",
      url: url ?? "",
      alt: block.alt,
      width: block.width,
      height: block.height,
    };
  }
  return {
    type: "image",
    url: block.url,
    alt: block.alt,
    width: block.width,
    height: block.height,
  };
}

export async function hydrateBlocksForDTO(
  getUrl: StorageUrlResolver,
  blocks: Array<{ order: number; block: BlockStored }>,
): Promise<Array<{ order: number; block: BlockDTO }>> {
  const out: Array<{ order: number; block: BlockDTO }> = [];
  for (const row of blocks) {
    out.push({
      order: row.order,
      block: await hydrateBlockDTO(getUrl, row.block),
    });
  }
  return out;
}
