import { anyApi } from "convex/server";

/** Host must expose `blog` from `makeBlogAdminAPI` (includes `generateUploadUrl`; see package docs). */
export const api = anyApi;
