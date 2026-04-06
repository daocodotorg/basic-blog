import { mutation } from "./_generated/server.js";
import { v } from "convex/values";

/**
 * Convex file storage upload URL. Client POSTs the file body; response JSON includes `storageId`.
 * Gated like the previous demo (enable `DEMO_ADMIN_MODE` or replace with real auth).
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    if (process.env.DEMO_ADMIN_MODE !== "true") {
      throw new Error("Uploads disabled unless DEMO_ADMIN_MODE is enabled");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
