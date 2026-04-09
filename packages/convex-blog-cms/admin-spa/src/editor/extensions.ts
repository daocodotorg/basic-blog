import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "@tiptap/markdown";
import type { Extensions } from "@tiptap/core";

/** Passed to `Markdown` and `MarkdownManager` so stored paragraph text round-trips lists, quotes, and code. */
export const blogMarkdownMarkedOptions = {
  gfm: true,
  breaks: true,
} as const;

/** Image with optional Convex storage id for round-trip to `postBlocks`. */
export const BlogImage = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      storageId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-storage-id"),
        renderHTML: (attrs) => {
          if (!attrs.storageId) {
            return {};
          }
          return { "data-storage-id": attrs.storageId as string };
        },
      },
    };
  },
}).configure({
  inline: false,
  allowBase64: true,
});

export function createBlogEditorExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      link: false,
      heading: { levels: [1, 2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
    }),
    BlogImage,
    Youtube.configure({
      nocookie: true,
      width: 640,
      height: 360,
      controls: true,
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
    }),
    Markdown.configure({
      markedOptions: { ...blogMarkdownMarkedOptions },
    }),
  ];
}
