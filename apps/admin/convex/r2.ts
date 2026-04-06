import { R2 } from "@convex-dev/r2";
import { query } from "./_generated/server.js";
import { v } from "convex/values";
import { components } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r2 = new R2(components.r2 as any);

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async () => {
    if (process.env.DEMO_ADMIN_MODE !== "true") {
      throw new Error("Uploads disabled unless DEMO_ADMIN_MODE is enabled");
    }
  },
  onUpload: async () => {},
});

export const publicUrlForKey = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await r2.getUrl(args.key, { expiresIn: 60 * 60 * 24 * 7 });
  },
});
