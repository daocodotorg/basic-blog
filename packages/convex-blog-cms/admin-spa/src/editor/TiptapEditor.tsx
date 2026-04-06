import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef } from "react";
import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { Bold, Film, ImagePlus, Italic, Link2, Redo2, Strikethrough, Undo2 } from "lucide-react";
import { createBlogEditorExtensions } from "./extensions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function TiptapEditor(props: {
  initialContent: JSONContent;
  placeholder?: string;
  className?: string;
  onUpdateJson: (json: JSONContent) => void;
  onReady?: (editor: Editor) => void;
  /** Upload image to Convex storage and insert (optional; header removed — use toolbar). */
  onBodyImageUpload?: (file: File) => void | Promise<void>;
  bodyImageUploadDisabled?: boolean;
}) {
  const {
    initialContent,
    placeholder: placeholderProp,
    className,
    onUpdateJson,
    onReady,
    onBodyImageUpload,
    bodyImageUploadDisabled,
  } = props;
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const placeholder = placeholderProp ?? "Start writing…";
  const extensions = useMemo(() => createBlogEditorExtensions(placeholder), [placeholder]);

  const editor = useEditor({
    extensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn("max-w-none text-[15px] leading-relaxed focus:outline-none min-h-[280px] px-3 py-3 text-foreground"),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onUpdateJson(ed.getJSON());
    },
  });

  useEffect(() => {
    if (editor && onReady) {
      onReady(editor);
    }
  }, [editor, onReady]);

  if (!editor) {
    return <div className="text-muted-foreground min-h-[280px] text-sm">Loading editor…</div>;
  }

  return (
    <div className={cn("tiptap-editor rounded-md border border-input bg-background", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const prev = window.prompt("Link URL");
            if (prev === null) {
              return;
            }
            if (prev === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: prev }).run();
          }}
          aria-label="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const url = window.prompt("Image URL (https://…)");
            if (!url?.trim()) {
              return;
            }
            editor.chain().focus().setImage({ src: url.trim(), alt: "" }).run();
          }}
          aria-label="Image from URL"
        >
          <span className="text-xs font-medium">IMG</span>
        </Button>
        {onBodyImageUpload ?
          <>
            <input
              ref={bodyImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  void Promise.resolve(onBodyImageUpload(f)).finally(() => {
                    if (bodyImageInputRef.current) {
                      bodyImageInputRef.current.value = "";
                    }
                  });
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={bodyImageUploadDisabled}
              onClick={() => bodyImageInputRef.current?.click()}
              aria-label="Upload image from device"
              title="Upload image from device (saved with your post)"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </>
        : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const url = window.prompt("YouTube URL");
            if (!url?.trim()) {
              return;
            }
            editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
          }}
          aria-label="YouTube"
        >
          <Film className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
