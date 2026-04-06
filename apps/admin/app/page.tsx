import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Basic Blog (Convex)</h1>
      <p className="text-zinc-600">
        Publishable package: <code className="font-mono">@basic-blog/convex-blog-cms</code>
      </p>
      <Link
        className="inline-flex w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        href="/admin"
      >
        Open demo admin
      </Link>
    </main>
  );
}
