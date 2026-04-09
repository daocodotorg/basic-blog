import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  buildArticleJsonLd,
  postToNextMetadata,
  resolvePrimaryImage,
} from "basic-blog-convex-blog-cms/next";
import { BlogPost } from "@/components/blog-ui";

/** Avoid prerender at `next build` when `NEXT_PUBLIC_CONVEX_URL` is unset; requires Convex at runtime. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function fallbackBase(): string | undefined {
  const b = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  return b || undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await fetchQuery(api.blog.getPublishedPostBySlug, {
    slug: decoded,
  });
  if (!data) {
    return { title: "Not found" };
  }
  const site = await fetchQuery(api.blog.getPublicSiteSettings, {});
  return postToNextMetadata({
    post: data.post,
    blocks: data.blocks,
    site,
    path: `/blog/${decoded}`,
    fallbackBaseUrl: fallbackBase(),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const data = await fetchQuery(api.blog.getPublishedPostBySlug, {
    slug: decoded,
  });
  if (!data) {
    notFound();
  }
  const site = await fetchQuery(api.blog.getPublicSiteSettings, {});
  const primaryImage = resolvePrimaryImage(data.post, data.blocks, site);
  const jsonLd = buildArticleJsonLd({
    post: data.post,
    site,
    primaryImage,
    path: `/blog/${decoded}`,
    blocks: data.blocks,
    fallbackBaseUrl: fallbackBase(),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl p-6">
        <BlogPost post={data.post} blocks={data.blocks} />
      </main>
    </>
  );
}
