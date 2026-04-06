"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { withAdminApiKey } from "@/lib/adminApiKey";
import { BlogPost } from "@basic-blog/example-blog-ui";
import { resolvePrimaryImage } from "@basic-blog/convex-blog-cms/next";
import type { BlockDTO, PostDTO } from "@basic-blog/convex-blog-cms/next";
import type { BlockStored } from "@basic-blog/convex-blog-cms";

type AdminPostBundle = {
  post: {
    _id: string;
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
    ogImageStorageId?: string;
    twitterImageUrl?: string;
    twitterImageStorageId?: string;
    featuredImageUrl?: string;
    featuredImageStorageId?: string;
    noindex?: boolean;
    answerSummary?: string;
    keyTakeaways?: string[];
    faq?: Array<{ question: string; answer: string }>;
  };
  blocks: Array<{ order: number; block: BlockStored }>;
  hydratedPost: PostDTO;
  hydratedBlocks: Array<{ order: number; block: BlockDTO }>;
};

async function uploadFileToConvex(
  uploadUrl: string,
  file: File,
): Promise<string> {
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

export default function EditPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const data = useQuery(api.blog.getPostForAdmin, withAdminApiKey({ slug })) as
    | AdminPostBundle
    | null
    | undefined;
  const settings = useQuery(api.blog.getPublicSiteSettings, {}) as
    | {
        siteName: string;
        baseUrl: string;
        defaultOgImageUrl?: string;
        locale?: string;
        defaultRobots?: string;
      }
    | null
    | undefined;
  const updatePost = useMutation(api.blog.updatePost);
  const replaceBlocks = useMutation(api.blog.replacePostBlocks);
  const publishPost = useMutation(api.blog.publishPost);
  const unpublishPost = useMutation(api.blog.unpublishPost);
  const deletePost = useMutation(api.blog.deletePost);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);

  const imageFileRef = useRef<HTMLInputElement>(null);
  const ogFileRef = useRef<HTMLInputElement>(null);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [ogImageStorageId, setOgImageStorageId] = useState<Id<"_storage"> | null>(
    null,
  );
  const [paragraph, setParagraph] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);

  const blocks = useMemo(() => data?.blocks ?? [], [data]);
  const hydratedBlocks = useMemo(
    () => data?.hydratedBlocks ?? [],
    [data],
  );

  useEffect(() => {
    if (data?.post) {
      setMetaTitle(data.post.metaTitle ?? data.post.title);
      setMetaDescription(data.post.metaDescription ?? "");
      setOgImageUrl(data.post.ogImageUrl ?? "");
      setOgImageStorageId(
        (data.post.ogImageStorageId as Id<"_storage"> | undefined) ?? null,
      );
    }
  }, [data]);

  const previewPost = useMemo((): PostDTO | null => {
    if (!data?.hydratedPost) {
      return null;
    }
    const base = data.hydratedPost;
    const og =
      ogImageStorageId ? base.ogImageUrl
      : ogImageUrl.trim() !== "" ? ogImageUrl.trim()
      : base.ogImageUrl;
    return {
      ...base,
      metaTitle: metaTitle || base.metaTitle,
      metaDescription: metaDescription || base.metaDescription,
      ogImageUrl: og,
    };
  }, [
    data,
    metaTitle,
    metaDescription,
    ogImageUrl,
    ogImageStorageId,
  ]);

  const primary = useMemo(() => {
    if (!previewPost || !settings) {
      return null;
    }
    return resolvePrimaryImage(previewPost, hydratedBlocks, settings);
  }, [previewPost, hydratedBlocks, settings]);

  async function addParagraph() {
    if (!data?.post || !paragraph.trim()) {
      return;
    }
    const next: Array<{ order: number; block: BlockStored }> = [
      ...blocks.map((b, i) => ({ order: i, block: b.block })),
      { order: blocks.length, block: { type: "paragraph", text: paragraph } },
    ];
    await replaceBlocks(
      withAdminApiKey({ postId: data.post._id, blocks: next as never }),
    );
    setParagraph("");
  }

  async function addImageFromUrl() {
    if (!data?.post || !imageUrl.trim()) {
      return;
    }
    const next: Array<{ order: number; block: BlockStored }> = [
      ...blocks.map((b, i) => ({ order: i, block: b.block })),
      {
        order: blocks.length,
        block: {
          type: "image",
          url: imageUrl.trim(),
          alt: imageAlt.trim() || "Image",
        },
      },
    ];
    await replaceBlocks(
      withAdminApiKey({ postId: data.post._id, blocks: next as never }),
    );
    setImageUrl("");
    setImageAlt("");
  }

  async function addImageFromFile(file: File) {
    if (!data?.post || !file.size) {
      return;
    }
    setUploadBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = (await uploadFileToConvex(
        uploadUrl,
        file,
      )) as Id<"_storage">;
      const next: Array<{ order: number; block: BlockStored }> = [
        ...blocks.map((b, i) => ({ order: i, block: b.block })),
        {
          order: blocks.length,
          block: {
            type: "image",
            storageId: storageId,
            alt: imageAlt.trim() || "Image",
          },
        },
      ];
      await replaceBlocks(
        withAdminApiKey({ postId: data.post._id, blocks: next as never }),
      );
      setImageAlt("");
    } finally {
      setUploadBusy(false);
      if (imageFileRef.current) {
        imageFileRef.current.value = "";
      }
    }
  }

  async function onOgFile(file: File) {
    if (!data?.post || !file.size) {
      return;
    }
    setUploadBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = (await uploadFileToConvex(
        uploadUrl,
        file,
      )) as Id<"_storage">;
      setOgImageStorageId(storageId);
      setOgImageUrl("");
      await updatePost(
        withAdminApiKey({
          postId: data.post._id,
          patch: { ogImageStorageId: storageId },
        }),
      );
    } finally {
      setUploadBusy(false);
      if (ogFileRef.current) {
        ogFileRef.current.value = "";
      }
    }
  }

  if (data === undefined || settings === undefined) {
    return <p className="p-6 text-sm text-zinc-500">Loading…</p>;
  }
  if (data === null || !data.post) {
    return <p className="p-6 text-sm text-red-600">Post not found.</p>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div className="rounded border border-amber-400 bg-amber-50 p-3 text-xs text-amber-950">
          Demo admin — set <code className="font-mono">BLOG_ADMIN_API_KEY</code> (Convex) and{" "}
          <code className="font-mono">NEXT_PUBLIC_BLOG_ADMIN_API_KEY</code> (Next). Enable{" "}
          <code className="font-mono">DEMO_ADMIN_MODE</code> in Convex for file uploads.
        </div>
        <Link href="/admin" className="text-sm text-blue-600 underline">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">Edit: {data.post.slug}</h1>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white"
            onClick={() =>
              publishPost(withAdminApiKey({ postId: data.post._id }))
            }
          >
            Publish
          </button>
          <button
            type="button"
            className="rounded bg-zinc-200 px-3 py-1.5 text-sm"
            onClick={() =>
              unpublishPost(withAdminApiKey({ postId: data.post._id }))
            }
          >
            Unpublish
          </button>
          <button
            type="button"
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
            onClick={async () => {
              await deletePost(
                withAdminApiKey({ postId: data.post._id }),
              );
              window.location.href = "/admin";
            }}
          >
            Delete
          </button>
        </div>

        <form
          className="space-y-3 rounded border border-zinc-200 bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await updatePost(
              withAdminApiKey({
                postId: data.post._id,
                patch: {
                  metaTitle: metaTitle || undefined,
                  metaDescription: metaDescription || undefined,
                  ...(ogImageStorageId ?
                    { ogImageStorageId: ogImageStorageId as Id<"_storage"> }
                  : {
                      ogImageUrl:
                        ogImageUrl.trim() === "" ? "" : ogImageUrl.trim() || undefined,
                    }),
                },
              }),
            );
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Meta title
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Meta description
            <textarea
              className="rounded border border-zinc-300 px-2 py-1"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            OG image URL (optional — external HTTPS)
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={ogImageUrl}
              onChange={(e) => {
                setOgImageUrl(e.target.value);
                setOgImageStorageId(null);
              }}
              placeholder="https://…"
            />
          </label>
          {ogImageStorageId ? (
            <p className="text-xs text-zinc-600">
              Using uploaded OG image (Convex storage). Choose a file below to replace, or clear the URL field and save to switch to URL-only.
            </p>
          ) : null}
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
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-1 text-sm"
              disabled={uploadBusy}
              onClick={() => ogFileRef.current?.click()}
            >
              Upload OG image (Convex)
            </button>
          </div>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            Save metadata
          </button>
        </form>

        <div className="space-y-2 rounded border border-zinc-200 bg-white p-4">
          <h2 className="font-medium">Blocks</h2>
          <ul className="space-y-1 text-sm text-zinc-600">
            {blocks.map((b, i) => (
              <li key={i}>
                {b.block.type}
                {b.block.type === "paragraph" ? `: ${b.block.text.slice(0, 80)}` : null}
                {b.block.type === "heading" ? `: ${b.block.text.slice(0, 80)}` : null}
                {b.block.type === "image" ?
                  "storageId" in b.block ?
                    " (Convex storage)"
                  : `: ${b.block.url.slice(0, 60)}…`
                : null}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <textarea
              className="min-h-24 flex-1 rounded border border-zinc-300 px-2 py-1"
              placeholder="New paragraph text…"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
            />
            <button
              type="button"
              className="self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
              onClick={() => addParagraph()}
            >
              Add paragraph
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4">
            <p className="text-sm text-zinc-600">
              Image block: paste an external HTTPS URL, or upload to Convex storage (requires{" "}
              <code className="font-mono text-xs">DEMO_ADMIN_MODE</code>).
            </p>
            <input
              className="rounded border border-zinc-300 px-2 py-1 text-sm"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <input
              className="rounded border border-zinc-300 px-2 py-1 text-sm"
              placeholder="Alt text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
                onClick={() => addImageFromUrl()}
              >
                Add image (URL)
              </button>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    void addImageFromFile(f);
                  }
                }}
              />
              <button
                type="button"
                className="w-fit rounded border border-zinc-300 px-3 py-1.5 text-sm"
                disabled={uploadBusy}
                onClick={() => imageFileRef.current?.click()}
              >
                Upload image (Convex)
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-full flex-1 space-y-3 lg:max-w-md">
        <h2 className="text-sm font-semibold text-zinc-700">Live preview</h2>
        {primary ? (
          <div className="rounded border border-zinc-200 bg-white p-3 text-sm">
            <p className="text-xs font-medium text-zinc-500">Resolved social image</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primary.url}
              alt={primary.alt}
              className="mt-2 max-h-40 w-full rounded object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No primary image resolved.</p>
        )}
        {previewPost ? (
          <div className="rounded border border-zinc-200 bg-white p-3">
            <BlogPost post={previewPost} blocks={hydratedBlocks} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
