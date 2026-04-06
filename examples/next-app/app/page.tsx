import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">basic-blog Next.js example</h1>
      <p className="mt-3 text-neutral-600">
        Public blog routes use Convex <code className="rounded bg-neutral-100 px-1">fetchQuery</code>{" "}
        and the copied reference UI under{" "}
        <code className="rounded bg-neutral-100 px-1">components/blog-ui</code>. Create posts with the
        bundled admin pointed at the same deployment.
      </p>
      <p className="mt-6">
        <Link className="text-blue-600 underline" href="/blog">
          View blog
        </Link>
      </p>
    </main>
  );
}
