"use client";

import type { BlockDTO } from "../seo/types.js";

export function BlockRenderer(props: { blocks: Array<{ order: number; block: BlockDTO }> }) {
  const sorted = [...props.blocks].sort((a, b) => a.order - b.order);
  return (
    <div className="convex-blog-blocks space-y-4">
      {sorted.map((row, i) => (
        <Block key={i} block={row.block} />
      ))}
    </div>
  );
}

function Heading(props: { level: number; text: string }) {
  const level = Math.min(6, Math.max(1, props.level));
  const className = "convex-blog-heading font-semibold";
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
      return <p className="convex-blog-paragraph whitespace-pre-wrap">{b.text}</p>;
    case "heading":
      return <Heading level={b.level} text={b.text} />;
    case "image":
      return (
        <figure className="convex-blog-image">
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
        <figure className="convex-blog-video">
          <video
            src={b.url}
            poster={b.poster}
            controls
            className="max-w-full rounded"
          />
          {b.caption ? (
            <figcaption className="text-sm text-neutral-500">{b.caption}</figcaption>
          ) : null}
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
