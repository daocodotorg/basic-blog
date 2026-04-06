"use client";

/**
 * TanStack Router / SPA sample — standalone block renderer (not the same as examples/blog-ui BlockRenderer).
 *
 * Sample: render hydrated blocks from basic-blog-convex-blog-cms (no package React UI).
 * Wire `useQuery(api.blog.getPublishedPostBySlug, { slug })` in your route component.
 */
import type { BlockDTO } from "basic-blog-convex-blog-cms/next";

export function PostView(props: {
  title: string;
  authorName?: string;
  blocks: Array<{ order: number; block: BlockDTO }>;
}) {
  const sorted = [...props.blocks].sort((a, b) => a.order - b.order);
  return (
    <article className="prose max-w-3xl">
      <header>
        <h1>{props.title}</h1>
        {props.authorName ? <p className="text-sm text-neutral-500">By {props.authorName}</p> : null}
      </header>
      <div className="space-y-4">
        {sorted.map((row, i) => (
          <Block key={i} block={row.block} />
        ))}
      </div>
    </article>
  );
}

function Heading(props: { level: number; text: string }) {
  const level = Math.min(6, Math.max(1, props.level));
  const className = "font-semibold";
  switch (level) {
    case 1:
      return <h1 className={className}>{props.text}</h1>;
    case 2:
      return <h2 className={className}>{props.text}</h2>;
    case 3:
      return <h3 className={className}>{props.text}</h3>;
    case 4:
      return <h4 className={className}>{props.text}</h4>;
    case 5:
      return <h5 className={className}>{props.text}</h5>;
    default:
      return <h6 className={className}>{props.text}</h6>;
  }
}

function Block(props: { block: BlockDTO }) {
  const b = props.block;
  switch (b.type) {
    case "paragraph":
      return <p className="whitespace-pre-wrap">{b.text}</p>;
    case "heading":
      return <Heading level={b.level} text={b.text} />;
    case "image":
      return (
        <figure>
          <img
            src={b.url}
            alt={b.alt}
            width={b.width}
            height={b.height}
            className="max-w-full rounded"
          />
        </figure>
      );
    case "video":
      return (
        <figure>
          <video src={b.url} poster={b.poster} controls className="max-w-full rounded" />
          {b.caption ? <figcaption className="text-sm text-neutral-500">{b.caption}</figcaption> : null}
        </figure>
      );
    case "link":
      return (
        <p>
          <a
            href={b.url}
            rel={b.rel ?? (b.nofollow ? "nofollow noopener noreferrer" : "noopener noreferrer")}
            className="text-blue-600 underline"
          >
            {b.title ?? b.url}
          </a>
        </p>
      );
    default:
      return null;
  }
}
