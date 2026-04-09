import type { BlockStored } from "basic-blog-convex-blog-cms";
import type { JSONContent } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { blogMarkdownMarkedOptions, createBlogEditorExtensions } from "./extensions";

let markdownManager: MarkdownManager | null = null;

function getMarkdownManager(): MarkdownManager {
  if (!markdownManager) {
    markdownManager = new MarkdownManager({
      extensions: createBlogEditorExtensions(""),
      markedOptions: { ...blogMarkdownMarkedOptions },
    });
  }
  return markdownManager;
}

function textContentJson(node: JSONContent | undefined): string {
  if (!node) {
    return "";
  }
  if (node.type === "text") {
    return node.text ?? "";
  }
  if (node.content) {
    return node.content.map(textContentJson).join("");
  }
  return "";
}

function isLinkOnlyParagraph(node: JSONContent): boolean {
  if (node.type !== "paragraph" || !node.content?.length) {
    return false;
  }
  const parts = node.content.filter((c) => c.type !== "hardBreak");
  if (parts.length !== 1 || parts[0].type !== "text") {
    return false;
  }
  const t = parts[0];
  const marks = t.marks ?? [];
  const link = marks.find((m) => m.type === "link");
  if (!link?.attrs?.href) {
    return false;
  }
  const rest = marks.filter((m) => m.type !== "link");
  if (rest.length > 0) {
    return false;
  }
  return (t.text ?? "").trim().length > 0;
}

function linkFromLinkOnlyParagraph(node: JSONContent): { url: string; title?: string } {
  const t = node.content![0];
  const href = (t.marks ?? []).find((m) => m.type === "link")?.attrs?.href as string;
  const text = (t.text ?? "").trim();
  return { url: href, title: text !== href ? text : undefined };
}

function serializeTopLevelNode(node: JSONContent): string {
  return getMarkdownManager().serialize({ type: "doc", content: [node] }).trimEnd();
}

export function docJsonToBlocks(doc: JSONContent | undefined): Array<{ order: number; block: BlockStored }> {
  if (!doc || doc.type !== "doc" || !doc.content?.length) {
    return [];
  }
  const out: Array<{ order: number; block: BlockStored }> = [];
  let order = 0;
  for (const node of doc.content) {
    const blocks = topLevelNodeToBlocks(node);
    for (const block of blocks) {
      out.push({ order: order++, block });
    }
  }
  return out;
}

function topLevelNodeToBlocks(node: JSONContent): BlockStored[] {
  switch (node.type) {
    case "paragraph": {
      if (isLinkOnlyParagraph(node)) {
        const { url, title } = linkFromLinkOnlyParagraph(node);
        return [{ type: "link", url, title }];
      }
      const md = serializeTopLevelNode(node);
      return [{ type: "paragraph", text: md.length > 0 ? md : "\u00a0" }];
    }
    case "heading": {
      const level = Math.min(6, Math.max(1, (node.attrs?.level as number) ?? 2));
      return [{ type: "heading", level, text: textContentJson(node) }];
    }
    case "image": {
      const alt = (node.attrs?.alt as string) ?? "";
      const storageId = node.attrs?.storageId as string | null | undefined;
      const src = node.attrs?.src as string | null | undefined;
      if (storageId) {
        return [{ type: "image", storageId, alt }];
      }
      if (src) {
        return [{ type: "image", url: src, alt }];
      }
      return [];
    }
    case "youtube": {
      const src = node.attrs?.src as string | undefined;
      if (src) {
        return [{ type: "video", url: src }];
      }
      return [];
    }
    case "horizontalRule":
      return [{ type: "paragraph", text: "---" }];
    default: {
      const md = serializeTopLevelNode(node);
      if (!md) {
        return [];
      }
      return [{ type: "paragraph", text: md }];
    }
  }
}

/**
 * Build TipTap document JSON from stored blocks. Resolves Convex image storage ids to URLs for the editor.
 */
export function blocksToDocJson(
  rows: Array<{ order: number; block: BlockStored }>,
  resolveStorageUrl: (id: string) => string | null,
): JSONContent {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const content: JSONContent[] = [];
  const mgr = getMarkdownManager();

  for (const { block } of sorted) {
    switch (block.type) {
      case "paragraph": {
        const raw = block.text.trim() ? block.text : "\u00a0";
        if (raw === "\u00a0") {
          content.push({ type: "paragraph" });
          break;
        }
        const parsed = mgr.parse(raw);
        const nodes = parsed.content ?? [];
        if (nodes.length === 0) {
          content.push({
            type: "paragraph",
            content: [{ type: "text", text: block.text }],
          });
        } else {
          for (const n of nodes) {
            content.push(n);
          }
        }
        break;
      }
      case "heading": {
        const level = Math.min(6, Math.max(1, block.level)) as 1 | 2 | 3 | 4 | 5 | 6;
        content.push({
          type: "heading",
          attrs: { level },
          content: [{ type: "text", text: block.text }],
        });
        break;
      }
      case "image": {
        if ("storageId" in block && block.storageId) {
          const url = resolveStorageUrl(block.storageId) ?? "";
          content.push({
            type: "image",
            attrs: { src: url, alt: block.alt, storageId: block.storageId },
          });
        } else {
          content.push({
            type: "image",
            attrs: { src: block.url, alt: block.alt },
          });
        }
        break;
      }
      case "video":
        content.push({
          type: "youtube",
          attrs: { src: block.url },
        });
        break;
      case "link":
        content.push({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: block.title ?? block.url,
              marks: [{ type: "link", attrs: { href: block.url } }],
            },
          ],
        });
        break;
      default:
        break;
    }
  }

  if (content.length === 0) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  return { type: "doc", content };
}
