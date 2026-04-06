import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import type { Extensions } from "@tiptap/core";

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
      bulletList: false,
      orderedList: false,
      listItem: false,
      listKeymap: false,
      blockquote: false,
      codeBlock: false,
      code: false,
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
  ];
}
