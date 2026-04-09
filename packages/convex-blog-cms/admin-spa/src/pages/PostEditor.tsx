import type { BlockStored } from "basic-blog-convex-blog-cms";
import {
  featuredImageCoverStyle,
  resolvePrimaryImage,
} from "basic-blog-convex-blog-cms/next";
import type { BlockDTO, PostDTO } from "basic-blog-convex-blog-cms/next";
import { useMutation, useQuery } from "convex/react";
import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import type { Id } from "convex/values";
import {
  ChevronDown,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWrapAdminKey } from "@/adminConfig";
import { AdminPostPreview } from "@/components/AdminPostPreview";
import {
  FeaturedCoverEditor,
  type CoverPreviewAspect,
} from "@/components/FeaturedCoverEditor";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/api";
import { blocksToDocJson, docJsonToBlocks } from "@/editor/blocksAdapter";
import { TiptapEditor } from "@/editor/TiptapEditor";

type AdminBundle = {
  post: {
    _id: string;
    _creationTime?: number;
    slug: string;
    title: string;
    status: "draft" | "published";
    publishedAt?: number;
    authorName?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string;
    ogImageStorageId?: string;
    featuredImageUrl?: string;
    featuredImageStorageId?: string;
    featuredImageFocalX?: number;
    featuredImageFocalY?: number;
  };
  blocks: Array<{ order: number; block: BlockStored }>;
  hydratedPost: PostDTO;
  hydratedBlocks: Array<{ order: number; block: BlockDTO }>;
};

async function uploadFileToConvex(uploadUrl: string, file: File): Promise<string> {
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  const json = (await res.json()) as { storageId: string };
  return json.storageId;
}

function makeResolver(
  raw: Array<{ order: number; block: BlockStored }>,
  hydrated: Array<{ order: number; block: BlockDTO }>,
): (id: string) => string | null {
  const map = new Map<string, string>();
  const sortedR = [...raw].sort((a, b) => a.order - b.order);
  const sortedH = [...hydrated].sort((a, b) => a.order - b.order);
  for (let i = 0; i < sortedR.length; i++) {
    const rb = sortedR[i]!.block;
    const hb = sortedH[i]?.block;
    if (rb.type === "image" && hb?.type === "image" && "storageId" in rb && rb.storageId) {
      map.set(rb.storageId, hb.url);
    }
  }
  return (id) => map.get(id) ?? null;
}

function hydrateBlocksForPreview(
  rows: Array<{ order: number; block: BlockStored }>,
  resolveStorageUrl: (id: string) => string | null,
): Array<{ order: number; block: BlockDTO }> {
  return rows.map(({ order, block }) => {
    if (block.type !== "image") {
      return { order, block: block as BlockDTO };
    }
    if ("storageId" in block && block.storageId) {
      const url = resolveStorageUrl(block.storageId) ?? "";
      return {
        order,
        block: {
          type: "image",
          url,
          alt: block.alt,
          width: block.width,
          height: block.height,
        },
      };
    }
    return {
      order,
      block: {
        type: "image",
        url: block.url,
        alt: block.alt,
        width: block.width,
        height: block.height,
      },
    };
  });
}

function wordCountFromDoc(doc: JSONContent | null): number {
  if (!doc?.content) {
    return 0;
  }
  const blocks = docJsonToBlocks(doc);
  let n = 0;
  for (const { block } of blocks) {
    if (block.type === "paragraph" || block.type === "heading") {
      n += block.text.split(/\s+/).filter(Boolean).length;
    }
  }
  return n;
}

/** `datetime-local` value in the browser's local timezone (no seconds in the control). */
function msToDatetimeLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDatetimeLocalMs(value: string): number | null {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

export function PostEditor() {
  const wrap = useWrapAdminKey();
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const slug = decodeURIComponent(params.slug ?? "");

  const data = useQuery(api.blog.getPostForAdmin, wrap({ slug })) as AdminBundle | null | undefined;
  const settings = useQuery(api.blog.getPublicSiteSettings, {}) as
    | {
        siteName: string;
        baseUrl: string;
        defaultOgImageUrl?: string;
      }
    | null
    | undefined;

  const updatePost = useMutation(api.blog.updatePost);
  const replaceBlocks = useMutation(api.blog.replacePostBlocks);
  const publishPost = useMutation(api.blog.publishPost);
  const unpublishPost = useMutation(api.blog.unpublishPost);
  const deletePost = useMutation(api.blog.deletePost);
  const generateUploadUrl = useMutation(api.blog.generateUploadUrl);

  const editorRef = useRef<Editor | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoteSig = useRef<string>("");

  const [docJson, setDocJson] = useState<JSONContent | null>(null);
  const [title, setTitle] = useState("");
  const [slugEdit, setSlugEdit] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [ogImageStorageId, setOgImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [featuredUrl, setFeaturedUrl] = useState("");
  const [featuredStorageId, setFeaturedStorageId] = useState<Id<"_storage"> | null>(null);
  const [featuredFocalX, setFeaturedFocalX] = useState(50);
  const [featuredFocalY, setFeaturedFocalY] = useState(50);
  const [coverPreviewAspect, setCoverPreviewAspect] = useState<CoverPreviewAspect>("16:9");
  /** For published posts: `datetime-local` string; drafts leave empty. */
  const [publishedAtInput, setPublishedAtInput] = useState("");

  const [preview, setPreview] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  /** Which image field is uploading (for scoped spinners). */
  const [uploadTarget, setUploadTarget] = useState<null | "featured" | "og" | "body">(null);

  const ogFileRef = useRef<HTMLInputElement>(null);
  const featFileRef = useRef<HTMLInputElement>(null);

  const initialized = useRef(false);

  useEffect(() => {
    initialized.current = false;
    lastRemoteSig.current = "";
  }, [slug]);

  useEffect(() => {
    if (!data?.post || !data.blocks) {
      return;
    }
    const sig = JSON.stringify({
      id: data.post._id,
      blocks: data.blocks.map((r) => r.block),
    });
    if (initialized.current && sig === lastRemoteSig.current) {
      return;
    }
    lastRemoteSig.current = sig;
    initialized.current = true;

    const resolver = makeResolver(data.blocks, data.hydratedBlocks);
    setDocJson(blocksToDocJson(data.blocks, resolver));
    setTitle(data.post.title);
    setSlugEdit(data.post.slug);
    setAuthorName(data.post.authorName ?? "");
    setExcerpt(data.post.excerpt ?? "");
    setMetaTitle(data.post.metaTitle ?? data.post.title);
    setMetaDescription(data.post.metaDescription ?? "");
    setOgImageUrl(data.post.ogImageUrl ?? "");
    setOgImageStorageId((data.post.ogImageStorageId as Id<"_storage"> | undefined) ?? null);
    setFeaturedUrl(data.post.featuredImageUrl ?? "");
    setFeaturedStorageId((data.post.featuredImageStorageId as Id<"_storage"> | undefined) ?? null);
    setFeaturedFocalX(data.post.featuredImageFocalX ?? 50);
    setFeaturedFocalY(data.post.featuredImageFocalY ?? 50);
  }, [data]);

  // Sync publication date field from the server when the loaded post or its stored timestamp changes
  // (e.g. after Publish). Narrow deps avoid resetting local edits when unrelated fields refresh.
  useEffect(() => {
    if (!data?.post) {
      return;
    }
    if (data.post.status === "published") {
      const ms = data.post.publishedAt ?? Date.now();
      setPublishedAtInput(msToDatetimeLocal(ms));
    } else {
      setPublishedAtInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on identity / status / stored publishedAt
  }, [data?.post?._id, data?.post?.status, data?.post?.publishedAt]);

  const previewPost = useMemo((): PostDTO | null => {
    if (!data?.hydratedPost) {
      return null;
    }
    const base = data.hydratedPost;
    const og =
      ogImageStorageId ? base.ogImageUrl
      : ogImageUrl.trim() !== "" ? ogImageUrl.trim()
      : base.ogImageUrl;
    const featured =
      featuredStorageId ? base.featuredImageUrl
      : featuredUrl.trim() !== "" ? featuredUrl.trim()
      : base.featuredImageUrl;
    const publishedAt =
      base.status === "published" ?
        parseDatetimeLocalMs(publishedAtInput) ?? base.publishedAt
      : base.publishedAt;
    return {
      ...base,
      title,
      authorName: authorName || undefined,
      excerpt: excerpt || undefined,
      metaTitle: metaTitle || base.metaTitle,
      metaDescription: metaDescription || base.metaDescription,
      ogImageUrl: og,
      featuredImageUrl: featured,
      featuredImageFocalX: featuredFocalX,
      featuredImageFocalY: featuredFocalY,
      publishedAt,
    };
  }, [
    data,
    title,
    authorName,
    excerpt,
    metaTitle,
    metaDescription,
    ogImageUrl,
    ogImageStorageId,
    featuredUrl,
    featuredStorageId,
    featuredFocalX,
    featuredFocalY,
    publishedAtInput,
  ]);

  const hydratedForPreview = useMemo(() => {
    if (!data?.hydratedBlocks || !data.blocks) {
      return [];
    }
    if (!docJson) {
      return data.hydratedBlocks;
    }
    const resolver = makeResolver(data.blocks, data.hydratedBlocks);
    const rows = docJsonToBlocks(docJson);
    return hydrateBlocksForPreview(rows, resolver);
  }, [data?.hydratedBlocks, data?.blocks, docJson]);

  const primary = useMemo(() => {
    if (!previewPost || !settings) {
      return null;
    }
    return resolvePrimaryImage(previewPost, hydratedForPreview, settings);
  }, [previewPost, hydratedForPreview, settings]);

  const coverPreviewUrl = useMemo(() => {
    const u = previewPost?.featuredImageUrl?.trim();
    return u ? u : null;
  }, [previewPost?.featuredImageUrl]);

  const ogPreviewUrl = useMemo(() => {
    const u = previewPost?.ogImageUrl?.trim();
    return u ? u : null;
  }, [previewPost?.ogImageUrl]);

  const clearFeaturedCover = useCallback(async () => {
    if (!data?.post) {
      return;
    }
    setFeaturedUrl("");
    setFeaturedStorageId(null);
    setFeaturedFocalX(50);
    setFeaturedFocalY(50);
    setSaveState("saving");
    setErrorMsg(null);
    try {
      await updatePost(
        wrap({
          postId: data.post._id,
          patch: { featuredImageUrl: "" } as never,
        }),
      );
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : String(e));
    }
  }, [data?.post, updatePost, wrap]);

  const clearOgImage = useCallback(async () => {
    if (!data?.post) {
      return;
    }
    setOgImageUrl("");
    setOgImageStorageId(null);
    setSaveState("saving");
    setErrorMsg(null);
    try {
      await updatePost(
        wrap({
          postId: data.post._id,
          patch: { ogImageUrl: "" } as never,
        }),
      );
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : String(e));
    }
  }, [data?.post, updatePost, wrap]);

  const buildMetaPatch = useCallback((): Record<string, unknown> => {
    if (!data?.post) {
      return {};
    }
    const patch: Record<string, unknown> = {
      title: title || undefined,
      authorName: authorName || undefined,
      excerpt: excerpt || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    };
    if (slugEdit.trim() !== data.post.slug) {
      patch.slug = slugEdit.trim();
    }
    if (ogImageStorageId) {
      patch.ogImageStorageId = ogImageStorageId;
    } else {
      patch.ogImageUrl = ogImageUrl.trim() === "" ? "" : ogImageUrl.trim() || undefined;
    }
    if (featuredStorageId) {
      patch.featuredImageStorageId = featuredStorageId;
    } else {
      patch.featuredImageUrl = featuredUrl.trim() === "" ? "" : featuredUrl.trim() || undefined;
    }
    const hasFeaturedImage =
      featuredStorageId != null ||
      featuredUrl.trim() !== "" ||
      Boolean(data.post.featuredImageStorageId) ||
      Boolean(data.post.featuredImageUrl?.trim());
    if (hasFeaturedImage) {
      patch.featuredImageFocalX = featuredFocalX;
      patch.featuredImageFocalY = featuredFocalY;
    }
    if (data.post.status === "published") {
      const ms = parseDatetimeLocalMs(publishedAtInput);
      if (ms != null && ms !== data.post.publishedAt) {
        patch.publishedAt = ms;
      }
    }
    return patch;
  }, [
    data?.post,
    title,
    slugEdit,
    authorName,
    excerpt,
    metaTitle,
    metaDescription,
    ogImageUrl,
    ogImageStorageId,
    featuredUrl,
    featuredStorageId,
    featuredFocalX,
    featuredFocalY,
    publishedAtInput,
  ]);

  const saveDraftNow = useCallback(async () => {
    if (!data?.post || docJson === null) {
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (metaTimer.current) {
      clearTimeout(metaTimer.current);
      metaTimer.current = null;
    }
    setSaveState("saving");
    setErrorMsg(null);
    try {
      const patch = buildMetaPatch();
      await updatePost(
        wrap({
          postId: data.post._id,
          patch: patch as never,
        }),
      );
      if (patch.slug && typeof patch.slug === "string" && patch.slug !== slug) {
        navigate(`/admin/edit/${encodeURIComponent(patch.slug)}`, { replace: true });
      }
      const rows = docJsonToBlocks(docJson).map((r, i) => ({ ...r, order: i }));
      await replaceBlocks(
        wrap({
          postId: data.post._id,
          blocks: rows as never,
        }),
      );
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : String(e));
    }
  }, [data?.post, docJson, buildMetaPatch, updatePost, replaceBlocks, wrap, navigate, slug]);

  const scheduleSaveBlocks = useCallback(
    (json: JSONContent) => {
      if (!data?.post) {
        return;
      }
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(async () => {
        setSaveState("saving");
        setErrorMsg(null);
        try {
          const rows = docJsonToBlocks(json).map((r, i) => ({ ...r, order: i }));
          await replaceBlocks(
            wrap({
              postId: data.post._id,
              blocks: rows as never,
            }),
          );
          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 1500);
        } catch (e) {
          setSaveState("error");
          setErrorMsg(e instanceof Error ? e.message : String(e));
        }
      }, 900);
    },
    [data?.post, replaceBlocks, wrap],
  );

  const scheduleSaveMeta = useCallback(() => {
    if (!data?.post) {
      return;
    }
    if (metaTimer.current) {
      clearTimeout(metaTimer.current);
    }
    metaTimer.current = setTimeout(async () => {
      setSaveState("saving");
      setErrorMsg(null);
      try {
        const patch = buildMetaPatch();
        await updatePost(
          wrap({
            postId: data.post._id,
            patch: patch as never,
          }),
        );
        if (patch.slug && typeof patch.slug === "string" && patch.slug !== slug) {
          navigate(`/admin/edit/${encodeURIComponent(patch.slug)}`, { replace: true });
        }
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch (e) {
        setSaveState("error");
        setErrorMsg(e instanceof Error ? e.message : String(e));
      }
    }, 600);
  }, [data?.post, buildMetaPatch, updatePost, wrap, navigate, slug]);

  async function onOgFile(file: File) {
    if (!data?.post || !file.size) {
      return;
    }
    setUploadBusy(true);
    setUploadTarget("og");
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = (await uploadFileToConvex(uploadUrl, file)) as Id<"_storage">;
      setOgImageStorageId(storageId);
      setOgImageUrl("");
      await updatePost(
        wrap({
          postId: data.post._id,
          patch: { ogImageStorageId: storageId },
        }),
      );
    } finally {
      setUploadBusy(false);
      setUploadTarget(null);
      if (ogFileRef.current) {
        ogFileRef.current.value = "";
      }
    }
  }

  async function onFeaturedFile(file: File) {
    if (!data?.post || !file.size) {
      return;
    }
    setUploadBusy(true);
    setUploadTarget("featured");
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = (await uploadFileToConvex(uploadUrl, file)) as Id<"_storage">;
      setFeaturedStorageId(storageId);
      setFeaturedUrl("");
      setFeaturedFocalX(50);
      setFeaturedFocalY(50);
      await updatePost(
        wrap({
          postId: data.post._id,
          patch: {
            featuredImageStorageId: storageId,
            featuredImageFocalX: 50,
            featuredImageFocalY: 50,
          },
        }),
      );
    } finally {
      setUploadBusy(false);
      setUploadTarget(null);
      if (featFileRef.current) {
        featFileRef.current.value = "";
      }
    }
  }

  async function onBodyImageFile(file: File) {
    if (!data?.post || !file.size || !editorRef.current) {
      return;
    }
    setUploadBusy(true);
    setUploadTarget("body");
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = await uploadFileToConvex(uploadUrl, file);
      const blob = URL.createObjectURL(file);
      editorRef.current.chain().focus().insertContent({
        type: "image",
        attrs: { src: blob, alt: file.name || "Image", storageId },
      }).run();
      const json = editorRef.current.getJSON();
      const rows = docJsonToBlocks(json).map((r, i) => ({ ...r, order: i }));
      await replaceBlocks(
        wrap({
          postId: data.post._id,
          blocks: rows as never,
        }),
      );
    } finally {
      setUploadBusy(false);
      setUploadTarget(null);
    }
  }

  if (data === undefined || settings === undefined || docJson === null) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 p-8 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (data === null || !data.post) {
    return (
      <div className="text-destructive flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <p className="text-sm font-medium">Post not found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">Back to articles</Link>
        </Button>
      </div>
    );
  }

  const words = wordCountFromDoc(docJson);
  const publishedDisplayMs =
    data.post.status === "published" ?
      parseDatetimeLocalMs(publishedAtInput) ?? data.post.publishedAt
    : undefined;
  const statusLabel =
    data.post.status === "published" ?
      `Published${publishedDisplayMs != null ? ` · ${new Date(publishedDisplayMs).toLocaleString()}` : ""}`
    : `Draft${data.post._creationTime ? ` · ${new Date(data.post._creationTime).toLocaleString()}` : ""}`;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b px-4 py-3 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{statusLabel}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">{words} words</span>
            <span className="text-muted-foreground hidden sm:inline text-[11px]">
              · Auto-saves; Save syncs draft now
            </span>
            {saveState === "saving" ?
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </span>
            : saveState === "saved" ?
              <span className="text-xs text-emerald-500">Saved</span>
            : saveState === "error" ?
              <span className="text-destructive text-xs">{errorMsg ?? "Error"}</span>
            : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={preview ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPreview((p) => !p)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={uploadBusy || preview}
            onClick={() => void saveDraftNow()}
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save
          </Button>
          {data.post.status === "draft" ?
            <Button size="sm" onClick={() => publishPost(wrap({ postId: data.post._id }))}>
              Publish
            </Button>
          : <Button variant="secondary" size="sm" onClick={() => unpublishPost(wrap({ postId: data.post._id }))}>
              Unpublish
            </Button>}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {!preview ?
          <>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-title">Title</Label>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  The main headline on the post page and in listings. Also used as the default browser tab title and search
                  snippet unless you set overrides under SEO & metadata.
                </p>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    scheduleSaveMeta();
                  }}
                  className="border-none bg-transparent px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
                  placeholder="Title"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    The last part of the post URL (for example <span className="font-mono">my-post</span> →{" "}
                    <span className="font-mono">/blog/my-post</span>).
                  </p>
                  <Input
                    id="slug"
                    value={slugEdit}
                    onChange={(e) => {
                      setSlugEdit(e.target.value);
                      scheduleSaveMeta();
                    }}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="author">Author</Label>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Shown as the byline on the post. Optional.
                  </p>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      scheduleSaveMeta();
                    }}
                  />
                </div>
              </div>
              {data.post.status === "published" ?
                <div className="space-y-1.5">
                  <Label htmlFor="published-at">Publication date</Label>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Used for RSS, sitemap, structured data, and post ordering. Shown in your local timezone; stored as a
                    timestamp.
                  </p>
                  <Input
                    id="published-at"
                    type="datetime-local"
                    value={publishedAtInput}
                    onChange={(e) => {
                      setPublishedAtInput(e.target.value);
                      scheduleSaveMeta();
                    }}
                    className="font-mono text-sm max-w-md"
                  />
                </div>
              : <div className="space-y-1.5">
                  <Label>Created</Label>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Draft posts are not public. After you publish, you can set the publication date.
                  </p>
                  <p className="text-foreground text-sm">
                    {data.post._creationTime ?
                      new Date(data.post._creationTime).toLocaleString()
                    : "—"}
                  </p>
                </div>
              }
              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  A short summary for article cards, RSS, and link previews. If you leave this empty, the site can fall back
                  to your meta description or an auto-generated snippet from the body.
                </p>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    scheduleSaveMeta();
                  }}
                  rows={2}
                  className="resize-none"
                  placeholder="Optional teaser text for cards and feeds"
                />
              </div>

              <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Cover image</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      Used on article cards and social previews. Set the visible crop for 16:9 and 5:4 layouts below.
                    </p>
                  </div>
                  {coverPreviewUrl ?
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 shrink-0"
                      disabled={uploadBusy}
                      onClick={() => void clearFeaturedCover()}
                    >
                      Remove cover
                    </Button>
                  : null}
                </div>

                <FeaturedCoverEditor
                  imageUrl={coverPreviewUrl}
                  aspect={coverPreviewAspect}
                  onAspectChange={setCoverPreviewAspect}
                  focalX={featuredFocalX}
                  focalY={featuredFocalY}
                  onFocalChange={(x, y) => {
                    setFeaturedFocalX(x);
                    setFeaturedFocalY(y);
                  }}
                  onFocalCommit={() => scheduleSaveMeta()}
                  disabled={uploadBusy}
                  showSpinner={uploadBusy && uploadTarget === "featured"}
                />

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="featured-url">Image link</Label>
                    <Input
                      id="featured-url"
                      value={featuredUrl}
                      onChange={(e) => {
                        setFeaturedUrl(e.target.value);
                        setFeaturedStorageId(null);
                        scheduleSaveMeta();
                      }}
                      placeholder="https://…"
                      className="font-mono text-sm"
                    />
                    <p className="text-muted-foreground text-[11px]">Paste a URL to use a picture already hosted online.</p>
                  </div>

                  <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="text-muted-foreground text-xs font-medium">Or upload from your device</span>
                    <input
                      ref={featFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void onFeaturedFile(f);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={uploadBusy}
                      onClick={() => featFileRef.current?.click()}
                    >
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      Choose image file
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Uploads use Convex file storage and attach to this post when the upload completes. The editor
                    auto-saves; use <span className="font-medium text-foreground/80">Save</span> in the header to sync
                    title and body right away.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <TiptapEditor
                key={data.post._id}
                initialContent={docJson}
                onUpdateJson={(json) => {
                  setDocJson(json);
                  scheduleSaveBlocks(json);
                }}
                onReady={(ed) => {
                  editorRef.current = ed;
                }}
                onBodyImageUpload={(file) => void onBodyImageFile(file)}
                bodyImageUploadDisabled={uploadBusy}
              />
            </div>

            <Collapsible className="mt-8">
              <CollapsibleTrigger className="text-muted-foreground flex items-center gap-1 text-sm font-medium hover:text-foreground">
                <ChevronDown className="h-4 w-4" />
                SEO & metadata
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Search and social cards use your meta fields when set. Otherwise the post title, excerpt, and cover / first
                  in-post image are used automatically (see site default OG image in settings).
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      scheduleSaveMeta();
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="metaDesc">Meta description</Label>
                  <Textarea
                    id="metaDesc"
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      scheduleSaveMeta();
                    }}
                    rows={3}
                    placeholder="Leave blank to use excerpt or an auto summary from post content."
                  />
                </div>
                <div className="space-y-3 rounded-md border border-border/80 bg-muted/20 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Label htmlFor="og-image-url" className="text-sm font-medium">
                        Open Graph image
                      </Label>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Optional. If empty, the cover image or first in-post image is used for link previews.
                      </p>
                    </div>
                    {ogPreviewUrl ?
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-8 shrink-0"
                        disabled={uploadBusy}
                        onClick={() => void clearOgImage()}
                      >
                        Remove OG image
                      </Button>
                    : null}
                  </div>

                  <div className="bg-muted/30 relative aspect-[5/2] max-h-36 w-full max-w-md overflow-hidden rounded-md border border-border">
                    {uploadBusy && uploadTarget === "og" ?
                      <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center">
                        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                      </div>
                    : null}
                    {ogPreviewUrl ?
                      <img src={ogPreviewUrl} alt="" className="h-full w-full object-cover" />
                    : <div className="text-muted-foreground flex h-full min-h-[5rem] flex-col items-center justify-center gap-1 px-3 text-center">
                        <ImageIcon className="h-7 w-7 opacity-35" aria-hidden />
                        <span className="text-[11px]">No custom OG image</span>
                      </div>
                    }
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      id="og-image-url"
                      value={ogImageUrl}
                      onChange={(e) => {
                        setOgImageUrl(e.target.value);
                        setOgImageStorageId(null);
                        scheduleSaveMeta();
                      }}
                      placeholder="https://…"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={ogFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void onOgFile(f);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={uploadBusy}
                      onClick={() => ogFileRef.current?.click()}
                    >
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      Upload OG image
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Uploads use <code className="rounded bg-muted px-1 font-mono">blog.generateUploadUrl</code> from{" "}
                  <code className="rounded bg-muted px-1 font-mono">makeBlogAdminAPI</code> (same auth as saving posts).
                </p>
              </CollapsibleContent>
            </Collapsible>
          </>
        : <PreviewPane post={previewPost} blocks={hydratedForPreview} primary={primary} />}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              This removes the post and all blocks. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deletePost(wrap({ postId: data.post._id }));
                setDeleteOpen(false);
                navigate("/admin");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewPane(props: {
  post: PostDTO | null;
  blocks: Array<{ order: number; block: BlockDTO }>;
  primary: { url: string; alt: string } | null;
}) {
  if (!props.post) {
    return null;
  }
  const featuredTrim = props.post.featuredImageUrl?.trim();
  const primaryIsFeatured =
    props.primary != null &&
    Boolean(featuredTrim) &&
    props.primary.url === featuredTrim;
  return (
    <div className="space-y-4">
      {props.primary ?
        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={props.primary.url}
            alt={props.primary.alt}
            className="max-h-56 w-full object-cover"
            style={primaryIsFeatured ? featuredImageCoverStyle(props.post) : { objectFit: "cover" }}
          />
        </div>
      : null}
      <div className="bg-card rounded-lg border border-border p-4">
        <AdminPostPreview post={props.post} blocks={props.blocks} />
      </div>
    </div>
  );
}
