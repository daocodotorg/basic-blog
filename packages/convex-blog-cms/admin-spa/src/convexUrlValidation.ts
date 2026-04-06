/**
 * ConvexReactClient only accepts deployment URLs (`*.convex.cloud`).
 * `*.convex.site` is for HTTP Actions — using it here throws at runtime.
 */
export type ConvexUrlProblem =
  | { kind: "convex_site" }
  | { kind: "invalid"; message: string }
  | null;

export function describeConvexUrlProblem(convexUrl: string): ConvexUrlProblem {
  const trimmed = convexUrl.trim();
  if (!trimmed) {
    return { kind: "invalid", message: "URL is empty." };
  }
  let host: string;
  try {
    host = new URL(trimmed).hostname;
  } catch {
    return { kind: "invalid", message: "Not a valid URL. It should look like https://your-deployment.convex.cloud" };
  }
  if (host.endsWith(".convex.site")) {
    return { kind: "convex_site" };
  }
  return null;
}
