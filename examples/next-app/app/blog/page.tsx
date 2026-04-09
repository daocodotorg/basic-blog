import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogList } from "@/components/blog-ui";
import {
  blogIndexToNextMetadata,
  buildBlogIndexJsonLd,
} from "basic-blog-convex-blog-cms/next";

/** Avoid prerender at `next build` when `NEXT_PUBLIC_CONVEX_URL` is unset; requires Convex at runtime. */
export const dynamic = "force-dynamic";

const BLOG_PATH = "/blog";

function fallbackBase(): string | undefined {
  const b = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  return b || undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchQuery(api.blog.getPublicSiteSettings, {});
  const title = site ? `Blog | ${site.siteName}` : "Blog";
  return blogIndexToNextMetadata({
    site,
    path: BLOG_PATH,
    title,
    description: site ? `Articles from ${site.siteName}` : undefined,
    fallbackBaseUrl: fallbackBase(),
  });
}

export default async function BlogIndexPage() {
  const [posts, site] = await Promise.all([
    fetchQuery(api.blog.listPublishedPosts, { limit: 50 }),
    fetchQuery(api.blog.getPublicSiteSettings, {}),
  ]);

  const jsonLd = buildBlogIndexJsonLd({
    site,
    indexPath: BLOG_PATH,
    name: site ? `Blog | ${site.siteName}` : "Blog",
    description: site ? `Articles from ${site.siteName}` : undefined,
    items: posts.map((p) => ({
      post: p,
      path: `${BLOG_PATH}/${encodeURIComponent(p.slug)}`,
    })),
    fallbackBaseUrl: fallbackBase(),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-semibold">Blog</h1>
        <BlogList
          posts={posts}
          hrefForSlug={(slug) => `${BLOG_PATH}/${encodeURIComponent(slug)}`}
        />
      </main>
    </>
  );
}
