"use client";

import type { BlockDTO, PostDTO } from "basic-blog-convex-blog-cms/next";
import type { BlogUiTheme } from "./theme.js";
import { BlockRenderer } from "./BlockRenderer.js";
import { cn, useBlogTheme } from "./theme.js";

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
      {props.post.answerSummary?.trim() ? (
        <p className={t.lead}>{props.post.answerSummary.trim()}</p>
      ) : null}
      {props.post.keyTakeaways && props.post.keyTakeaways.length > 0 ? (
        <section className={t.takeawaysSection} aria-labelledby="key-takeaways-heading">
          <h2 id="key-takeaways-heading" className={t.takeawaysHeading}>
            Key takeaways
          </h2>
          <ul className={t.takeawaysList}>
            {props.post.keyTakeaways.map((item, i) => (
              <li key={i} className={t.takeawaysListItem}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <BlockRenderer blocks={props.blocks} theme={props.theme} />
    </article>
  );
}
