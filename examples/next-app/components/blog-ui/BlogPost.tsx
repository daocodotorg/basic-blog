"use client";

import type { BlockDTO, PostDTO } from "basic-blog-convex-blog-cms/next";
import type { BlogUiTheme } from "./theme";
import { BlockRenderer } from "./BlockRenderer";
import { cn, useBlogTheme } from "./theme";

export function BlogPost(props: {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
  theme?: Partial<BlogUiTheme>;
  className?: string;
}) {
  const t = useBlogTheme(props.theme);
  return (
    <article className={cn(t.article, props.className)}>
      <header className={t.header}>
        <h1 className={t.title}>{props.post.title}</h1>
        {props.post.authorName ? (
          <p className={t.meta}>By {props.post.authorName}</p>
        ) : null}
      </header>
      <BlockRenderer blocks={props.blocks} theme={props.theme} />
    </article>
  );
}
