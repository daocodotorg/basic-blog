import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogList } from "@/components/blog-ui";

/** Avoid prerender at `next build` when `NEXT_PUBLIC_CONVEX_URL` is unset; requires Convex at runtime. */
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await fetchQuery(api.blog.listPublishedPosts, { limit: 50 });
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Blog</h1>
      <BlogList posts={posts} hrefForSlug={(slug) => `/blog/${encodeURIComponent(slug)}`} />
    </main>
  );
}
