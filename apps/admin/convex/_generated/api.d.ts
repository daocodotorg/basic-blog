/* eslint-disable */
import type * as blog from "../blog.js";
import type * as media from "../media.js";
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type { ComponentApi as BlogCmsComponentApi } from "@basic-blog/convex-blog-cms/_generated/component.js";

declare const fullApi: ApiFromModules<{
  blog: typeof blog;
  media: typeof media;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  blogCms: BlogCmsComponentApi<"blogCms">;
};
