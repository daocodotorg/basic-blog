/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    blog: {
      getPublishedPostBySlug: FunctionReference<
        "query",
        "internal",
        { slug: string },
        unknown,
        Name
      >;
      listPublishedPosts: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        unknown,
        Name
      >;
      getPublicSiteSettings: FunctionReference<
        "query",
        "internal",
        Record<string, never>,
        unknown,
        Name
      >;
      getPostForAdmin: FunctionReference<
        "query",
        "internal",
        { slug: string },
        unknown,
        Name
      >;
      listPostsForAdmin: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        unknown,
        Name
      >;
      createPost: FunctionReference<
        "mutation",
        "internal",
        {
          slug: string;
          title: string;
          authorName?: string;
          excerpt?: string;
        },
        string,
        Name
      >;
      updatePost: FunctionReference<
        "mutation",
        "internal",
        {
          postId: string;
          patch: Record<string, unknown>;
        },
        null,
        Name
      >;
      publishPost: FunctionReference<
        "mutation",
        "internal",
        { postId: string },
        null,
        Name
      >;
      unpublishPost: FunctionReference<
        "mutation",
        "internal",
        { postId: string },
        null,
        Name
      >;
      deletePost: FunctionReference<
        "mutation",
        "internal",
        { postId: string },
        null,
        Name
      >;
      replacePostBlocks: FunctionReference<
        "mutation",
        "internal",
        {
          postId: string;
          blocks: Array<{ order: number; block: unknown }>;
        },
        null,
        Name
      >;
      upsertSiteSettings: FunctionReference<
        "mutation",
        "internal",
        {
          siteName: string;
          baseUrl: string;
          defaultOgImageUrl?: string;
          locale?: string;
          defaultRobots?: string;
        },
        string,
        Name
      >;
    };
  };
