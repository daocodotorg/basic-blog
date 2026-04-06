"use client";

import { createContext, useContext, type ReactNode } from "react";

/** ClassName slots for drop-in blog UI. Override any key via `BlogThemeProvider` or per-component `theme` prop. */
export type BlogUiTheme = {
  article: string;
  header: string;
  title: string;
  meta: string;
  blocks: string;
  paragraph: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  heading5: string;
  heading6: string;
  imageFigure: string;
  imageImg: string;
  videoFigure: string;
  videoTag: string;
  videoCaption: string;
  linkParagraph: string;
  link: string;
  list: string;
  listItem: string;
  listLink: string;
};

export const defaultBlogTheme: BlogUiTheme = {
  article: "convex-blog-post prose max-w-3xl",
  header: "",
  title: "text-3xl font-bold",
  meta: "text-sm text-neutral-500",
  blocks: "convex-blog-blocks space-y-4",
  paragraph: "convex-blog-paragraph whitespace-pre-wrap",
  heading1: "convex-blog-heading font-semibold",
  heading2: "convex-blog-heading font-semibold",
  heading3: "convex-blog-heading font-semibold",
  heading4: "convex-blog-heading font-semibold",
  heading5: "convex-blog-heading font-semibold",
  heading6: "convex-blog-heading font-semibold",
  imageFigure: "convex-blog-image",
  imageImg: "max-w-full rounded",
  videoFigure: "convex-blog-video",
  videoTag: "max-w-full rounded",
  videoCaption: "text-sm text-neutral-500",
  linkParagraph: "",
  link: "text-blue-600 underline",
  list: "convex-blog-list space-y-2",
  listItem: "",
  listLink: "text-blue-600 underline",
};

export function cn(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ").trim();
}

function mergeBlogTheme(
  base: BlogUiTheme,
  ...overrides: Array<Partial<BlogUiTheme> | undefined>
): BlogUiTheme {
  let out: BlogUiTheme = { ...base };
  for (const o of overrides) {
    if (!o) {
      continue;
    }
    out = { ...out, ...o };
  }
  return out;
}

const BlogThemeContext = createContext<Partial<BlogUiTheme> | null>(null);

export function BlogThemeProvider(props: {
  theme: Partial<BlogUiTheme>;
  children: ReactNode;
}) {
  return (
    <BlogThemeContext.Provider value={props.theme}>
      {props.children}
    </BlogThemeContext.Provider>
  );
}

/**
 * Merges `defaultBlogTheme` with optional provider overrides and optional per-call / per-component overrides.
 */
export function useBlogTheme(override?: Partial<BlogUiTheme>): BlogUiTheme {
  const ctx = useContext(BlogThemeContext);
  return mergeBlogTheme(defaultBlogTheme, ctx ?? undefined, override);
}
