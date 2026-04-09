"use client";

import type { BlockDTO } from "basic-blog-convex-blog-cms/next";
import ReactMarkdown from "react-markdown";
import type { BlogUiTheme } from "./theme.js";
import { cn, useBlogTheme } from "./theme.js";

export function BlockRenderer(props: {
  blocks: Array<{ order: number; block: BlockDTO }>;
  theme?: Partial<BlogUiTheme>;
  className?: string;
}) {
  const t = useBlogTheme(props.theme);
  const sorted = [...props.blocks].sort((a, b) => a.order - b.order);
  return (
    <div className={cn(t.blocks, props.className)}>
      {sorted.map((row, i) => (
        <Block key={i} block={row.block} theme={t} />
      ))}
    </div>
  );
}

function headingClass(level: number, t: BlogUiTheme): string {
  switch (Math.min(6, Math.max(1, level))) {
    case 1:
      return t.heading1;
    case 2:
      return t.heading2;
    case 3:
      return t.heading3;
    case 4:
      return t.heading4;
    case 5:
      return t.heading5;
    default:
      return t.heading6;
  }
}

function Heading(props: { level: number; text: string; theme: BlogUiTheme }) {
  const level = Math.min(6, Math.max(1, props.level));
  const className = headingClass(level, props.theme);
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

function Block(props: { block: BlockDTO; theme: BlogUiTheme }) {
  const b = props.block;
  const t = props.theme;
  switch (b.type) {
    case "paragraph":
      return (
        <div
          className={cn(
            t.paragraph,
            "[&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-600 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_li]:my-0.5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 last:[&_p]:mb-0 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-zinc-100 [&_pre]:p-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          )}
        >
          <ReactMarkdown>{b.text}</ReactMarkdown>
        </div>
      );
    case "heading":
      return <Heading level={b.level} text={b.text} theme={t} />;
    case "image":
      return (
        <figure className={t.imageFigure}>
          <img
            src={b.url}
            alt={b.alt}
            width={b.width}
            height={b.height}
            className={t.imageImg}
          />
        </figure>
      );
    case "video":
      return (
        <figure className={t.videoFigure}>
          <video
            src={b.url}
            poster={b.poster}
            controls
            className={t.videoTag}
          />
          {b.caption ? (
            <figcaption className={t.videoCaption}>{b.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "link":
      return (
        <p className={cn(t.linkParagraph)}>
          <a
            href={b.url}
            rel={b.rel ?? (b.nofollow ? "nofollow noopener noreferrer" : "noopener noreferrer")}
            className={t.link}
          >
            {b.title ?? b.url}
          </a>
        </p>
      );
    default:
      return null;
  }
}
