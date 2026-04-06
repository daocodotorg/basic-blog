/** Serializable post row from Convex (component boundary uses string ids). */
export type PostDTO = {
  slug: string;
  title: string;
  status: "draft" | "published";
  publishedAt?: number;
  authorName?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  featuredImageUrl?: string;
  noindex?: boolean;
  answerSummary?: string;
  keyTakeaways?: string[];
  faq?: Array<{ question: string; answer: string }>;
};

export type SiteSettingsDTO = {
  siteName: string;
  baseUrl: string;
  defaultOgImageUrl?: string;
  locale?: string;
  defaultRobots?: string;
};

export type BlockDTO =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | {
      type: "image";
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }
  | {
      type: "video";
      url: string;
      poster?: string;
      caption?: string;
    }
  | {
      type: "link";
      url: string;
      title?: string;
      rel?: string;
      nofollow?: boolean;
    };

export type PrimaryImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};
