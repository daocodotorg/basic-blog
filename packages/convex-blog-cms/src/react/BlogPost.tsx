"use client";

import type { BlockDTO, PostDTO } from "../seo/types.js";
import { BlockRenderer } from "./BlockRenderer.js";

export function BlogPost(props: {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
}) {
  return (
    <article className="convex-blog-post prose max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold">{props.post.title}</h1>
        {props.post.authorName ? (
          <p className="text-sm text-neutral-500">By {props.post.authorName}</p>
        ) : null}
      </header>
      <BlockRenderer blocks={props.blocks} />
    </article>
  );
}
