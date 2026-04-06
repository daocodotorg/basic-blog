import type { PostDTO, SiteSettingsDTO } from "./types.js";

/**
 * Post row as stored in the component DB (may include Convex `_storage` ids for SEO images).
 */
export type PostStored = PostDTO & {
  ogImageStorageId?: string;
  twitterImageStorageId?: string;
  featuredImageStorageId?: string;
};

/**
 * Site settings row as stored (optional default OG image storage id).
 */
export type SiteSettingsStored = SiteSettingsDTO & {
  defaultOgImageStorageId?: string;
};

export type ImageBlockStored =
  | {
      type: "image";
      url: string;
      alt: string;
      width?: number;
      height?: number;
    }
  | {
      type: "image";
      storageId: string;
      alt: string;
      width?: number;
      height?: number;
    };

export type BlockStored =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | ImageBlockStored
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
