"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export default function AdminPage() {
  const settings = useQuery(api.blog.getPublicSiteSettings, {}) as
    | {
        siteName: string;
        baseUrl: string;
        defaultOgImageUrl?: string;
      }
    | null
    | undefined;
  const posts = useQuery(api.blog.listPostsForAdmin, { limit: 100 }) as
    | Array<{ _id: string; slug: string; status: string }>
    | undefined;
  const upsertSettings = useMutation(api.blog.upsertSiteSettings);

  const [siteName, setSiteName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [defaultOg, setDefaultOg] = useState("");

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setBaseUrl(settings.baseUrl);
      setDefaultOg(settings.defaultOgImageUrl ?? "");
    }
  }, [settings]);

  const [slug, setSlug] = useState("hello-world");
  const [title, setTitle] = useState("Hello world");
  const createPost = useMutation(api.blog.createPost);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div className="rounded border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Demo-only admin.</strong> Enable Convex admin API with{" "}
        <code className="font-mono">npx convex env set DEMO_ADMIN_MODE true</code>.
        Do not use in production.
      </div>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Site settings</h2>
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await upsertSettings({
              siteName,
              baseUrl,
              defaultOgImageUrl: defaultOg || undefined,
            });
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Site name
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Base URL (https://…)
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Default OG image URL
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={defaultOg}
              onChange={(e) => setDefaultOg(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            Save settings
          </button>
        </form>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Create draft post</h2>
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await createPost({ slug, title });
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Slug
            <input
              className="rounded border border-zinc-300 px-2 py-1 font-mono"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Title
            <input
              className="rounded border border-zinc-300 px-2 py-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            Create
          </button>
        </form>
      </section>

      <section className="rounded border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Posts</h2>
        {posts === undefined ? (
          <p className="mt-2 text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {posts.map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm">{p.slug}</span>
                <span className="text-sm text-zinc-600">{p.status}</span>
                <Link
                  className="text-sm text-blue-600 underline"
                  href={`/admin/edit/${encodeURIComponent(p.slug)}`}
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
