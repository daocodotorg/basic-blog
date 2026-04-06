"use client";

import type { PostDTO } from "basic-blog-convex-blog-cms/next";
import type { BlogUiTheme } from "./theme.js";
import { cn, useBlogTheme } from "./theme.js";

export function BlogList(props: {
  posts: PostDTO[];
  hrefForSlug: (slug: string) => string;
  theme?: Partial<BlogUiTheme>;
  className?: string;
}) {
  const t = useBlogTheme(props.theme);
  return (
    <ul className={cn(t.list, props.className)}>
      {props.posts.map((p) => (
        <li key={p.slug} className={t.listItem}>
          <a className={t.listLink} href={props.hrefForSlug(p.slug)}>
            {p.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
