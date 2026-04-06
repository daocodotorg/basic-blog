/* eslint-disable */
/**
 * Checked-in stub — `npx convex dev` regenerates this directory for your deployment.
 */
import type * as blog from "../blog.js";
import type {
  ApiFromModules,
  AnyComponents,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  blog: typeof blog;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
export declare const components: AnyComponents;
