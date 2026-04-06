/**
 * Must match `BLOG_ADMIN_API_KEY` in Convex when using simple token auth in the sample app.
 * Exposed to the browser — use only for local/demo; production should use Convex Auth and omit this.
 */
export function withAdminApiKey<T extends Record<string, unknown>>(
  args: T,
): T & { adminApiKey?: string } {
  const key = process.env.NEXT_PUBLIC_BLOG_ADMIN_API_KEY;
  if (key === undefined || key === "") {
    return args;
  }
  return { ...args, adminApiKey: key };
}
