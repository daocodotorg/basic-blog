"use client";

import type { PostDTO } from "../seo/types.js";

export function BlogList(props: {
  posts: PostDTO[];
  hrefForSlug: (slug: string) => string;
}) {
  return (
    <ul className="convex-blog-list space-y-2">
      {props.posts.map((p) => (
        <li key={p.slug}>
          <a className="text-blue-600 underline" href={props.hrefForSlug(p.slug)}>
            {p.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
