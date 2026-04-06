import type { BlockDTO } from "./types.js";

/** Typical max length for meta descriptions in search snippets. */
const META_DESC_MAX = 160;

/**
 * Builds a plain-text description from block content when `metaDescription` and `excerpt` are unset.
 * Skips non-text blocks (images, bare video URLs). Paragraphs may contain markdown inline markers.
 */
export function derivePlainTextDescriptionFromBlocks(
  blocks: Array<{ order: number; block: BlockDTO }>,
): string | undefined {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const parts: string[] = [];
  for (const { block } of sorted) {
    if (block.type === "paragraph") {
      const t = block.text.trim();
      if (t) {
        parts.push(t);
      }
    } else if (block.type === "heading") {
      const t = block.text.trim();
      if (t) {
        parts.push(t);
      }
    } else if (block.type === "video" && block.caption?.trim()) {
      parts.push(block.caption.trim());
    } else if (block.type === "link" && block.title?.trim()) {
      parts.push(block.title.trim());
    }
  }
  const combined = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!combined) {
    return undefined;
  }
  if (combined.length <= META_DESC_MAX) {
    return combined;
  }
  const slice = combined.slice(0, META_DESC_MAX);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}
