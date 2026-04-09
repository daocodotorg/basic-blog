import type { PostDTO } from "../seo/types.js";

type FocalPick = Pick<PostDTO, "featuredImageFocalX" | "featuredImageFocalY">;

export type FeaturedCoverImageStyle = {
  objectFit: "cover";
  objectPosition?: string;
};

/**
 * Inline styles for a featured image shown with `object-fit: cover`.
 * Uses `featuredImageFocalX` / `featuredImageFocalY` (0–100) when set; otherwise browser default centering.
 */
export function featuredImageCoverStyle(post: FocalPick): FeaturedCoverImageStyle {
  const x = post.featuredImageFocalX;
  const y = post.featuredImageFocalY;
  if (x == null && y == null) {
    return { objectFit: "cover" };
  }
  const px = x ?? 50;
  const py = y ?? 50;
  return {
    objectFit: "cover",
    objectPosition: `${px}% ${py}%`,
  };
}
