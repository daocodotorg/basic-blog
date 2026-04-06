"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { BlogPost } from "@basic-blog/convex-blog-cms/react";
import {
  resolvePrimaryImage,
} from "@basic-blog/convex-blog-cms/next";
import type { BlockDTO } from "@basic-blog/convex-blog-cms/react";

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
    twitterImageUrl?: string;
    featuredImageUrl?: string;
    noindex?: boolean;
    answerSummary?: string;
    keyTakeaways?: string[];
    faq?: Array<{ question: string; answer: string }>;
  };
  blocks: Array<{ order: number; block: BlockDTO }>;
};

export default function EditPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const data = useQuery(api.blog.getPostForAdmin, { slug }) as
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

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const blocks = useMemo(() => data?.blocks ?? [], [data]);

  useEffect(() => {
    if (data?.post) {
      setMetaTitle(data.post.metaTitle ?? data.post.title);
      setMetaDescription(data.post.metaDescription ?? "");
      setOgImageUrl(data.post.ogImageUrl ?? "");
    }
  }, [data]);

  const primary = useMemo(() => {
    if (!data?.post || !settings) {
      return null;
    }
    return resolvePrimaryImage(
      {
        slug: data.post.slug,
        title: data.post.title,
        status: data.post.status,
        publishedAt: data.post.publishedAt,
        authorName: data.post.authorName,
        excerpt: data.post.excerpt,
        metaTitle: data.post.metaTitle,
        metaDescription: data.post.metaDescription,
        canonicalPath: data.post.canonicalPath,
        ogImageUrl: data.post.ogImageUrl,
        twitterImageUrl: data.post.twitterImageUrl,
        featuredImageUrl: data.post.featuredImageUrl,
        noindex: data.post.noindex,
        answerSummary: data.post.answerSummary,
        keyTakeaways: data.post.keyTakeaways,
        faq: data.post.faq,
      },
      blocks,
      {
        siteName: settings.siteName,
        baseUrl: settings.baseUrl,
        defaultOgImageUrl: settings.defaultOgImageUrl,
        locale: settings.locale,
        defaultRobots: settings.defaultRobots,
      },
    );
  }, [data, blocks, settings]);

  async function addParagraph() {
    if (!data?.post || !paragraph.trim()) {
      return;
    }
    const next: Array<{ order: number; block: BlockDTO }> = [
      ...blocks.map((b, i) => ({ order: i, block: b.block })),
      { order: blocks.length, block: { type: "paragraph", text: paragraph } },
    ];
    await replaceBlocks({ postId: data.post._id, blocks: next });
    setParagraph("");
  }

  async function addImage() {
    if (!data?.post || !imageUrl.trim()) {
      return;
    }
    const next: Array<{ order: number; block: BlockDTO }> = [
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
    await replaceBlocks({ postId: data.post._id, blocks: next });
    setImageUrl("");
    setImageAlt("");
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
          Demo admin — requires <code className="font-mono">DEMO_ADMIN_MODE=true</code> on Convex.
        </div>
        <Link href="/admin" className="text-sm text-blue-600 underline">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">Edit: {data.post.slug}</h1>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white"
            onClick={() => publishPost({ postId: data.post._id })}
          >
            Publish
          </button>
          <button
            type="button"
            className="rounded bg-zinc-200 px-3 py-1.5 text-sm"
            onClick={() => unpublishPost({ postId: data.post._id })}
          >
            Unpublish
          </button>
          <button
            type="button"
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
            onClick={async () => {
              await deletePost({ postId: data.post._id });
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
            await updatePost({
              postId: data.post._id,
              patch: {
                metaTitle: metaTitle || undefined,
                metaDescription: metaDescription || undefined,
                ogImageUrl: ogImageUrl || undefined,
              },
            });
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
            OG image URL (optional override)
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
            />
          </label>
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
                {b.block.type}:{" "}
                {b.block.type === "paragraph" ? b.block.text.slice(0, 80) : "…"}
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
              Image block (HTTPS URL — upload via R2 separately, then paste public URL)
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
            <button
              type="button"
              className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
              onClick={() => addImage()}
            >
              Add image block
            </button>
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
        <div className="rounded border border-zinc-200 bg-white p-3">
          <BlogPost
            post={{
              slug: data.post.slug,
              title: data.post.title,
              status: data.post.status,
              publishedAt: data.post.publishedAt,
              authorName: data.post.authorName,
              excerpt: data.post.excerpt,
              metaTitle: metaTitle || data.post.metaTitle,
              metaDescription: metaDescription || data.post.metaDescription,
              canonicalPath: data.post.canonicalPath,
              ogImageUrl: ogImageUrl || data.post.ogImageUrl,
              twitterImageUrl: data.post.twitterImageUrl,
              featuredImageUrl: data.post.featuredImageUrl,
              noindex: data.post.noindex,
              answerSummary: data.post.answerSummary,
              keyTakeaways: data.post.keyTakeaways,
              faq: data.post.faq,
            }}
            blocks={blocks}
          />
        </div>
      </aside>
    </div>
  );
}
