import type { BlockDTO, PostDTO } from "basic-blog-convex-blog-cms/next";
import ReactMarkdown from "react-markdown";

function sortedBlocks(blocks: Array<{ order: number; block: BlockDTO }>) {
  return [...blocks].sort((a, b) => a.order - b.order);
}

function Heading({ level, text }: { level: number; text: string }) {
  const L = Math.min(6, Math.max(1, level));
  const className = "text-foreground mb-2 font-semibold";
  switch (L) {
    case 1:
      return <h1 className={className}>{text}</h1>;
    case 2:
      return <h2 className={className}>{text}</h2>;
    case 3:
      return <h3 className={className}>{text}</h3>;
    case 4:
      return <h4 className={className}>{text}</h4>;
    case 5:
      return <h5 className={className}>{text}</h5>;
    default:
      return <h6 className={className}>{text}</h6>;
  }
}

function BlockView({ block }: { block: BlockDTO }) {
  switch (block.type) {
    case "paragraph":
      return (
        <div className="text-foreground mb-3 text-[15px] leading-relaxed [&_a]:text-primary [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_p]:mb-2 last:[&_p]:mb-0">
          <ReactMarkdown>{block.text}</ReactMarkdown>
        </div>
      );
    case "heading":
      return <Heading level={block.level} text={block.text} />;
    case "image":
      return (
        <figure className="mb-3">
          <img
            src={block.url}
            alt={block.alt}
            width={block.width}
            height={block.height}
            className="max-h-64 w-full rounded object-cover"
          />
        </figure>
      );
    case "video":
      return (
        <figure className="mb-3">
          <video
            src={block.url}
            poster={block.poster}
            controls
            className="w-full max-w-full rounded"
          />
          {block.caption ? (
            <figcaption className="text-muted-foreground mt-1 text-xs">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "link":
      return (
        <p className="mb-3">
          <a
            href={block.url}
            className="text-primary underline"
            rel={
              block.rel ?? (block.nofollow ? "nofollow noopener noreferrer" : "noopener noreferrer")
            }
          >
            {block.title ?? block.url}
          </a>
        </p>
      );
    default:
      return null;
  }
}

export function AdminPostPreview(props: {
  post: PostDTO;
  blocks: Array<{ order: number; block: BlockDTO }>;
}) {
  const rows = sortedBlocks(props.blocks);
  return (
    <article className="text-sm">
      <header className="border-border mb-4 border-b pb-3">
        <h1 className="text-foreground text-xl font-semibold">{props.post.title}</h1>
        {props.post.authorName ? (
          <p className="text-muted-foreground mt-1">By {props.post.authorName}</p>
        ) : null}
      </header>
      <div className="space-y-1">
        {rows.map((row, i) => (
          <BlockView key={i} block={row.block} />
        ))}
      </div>
    </article>
  );
}
