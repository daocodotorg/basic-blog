"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Set <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
        <code className="font-mono">.env.local</code> (from{" "}
        <code className="font-mono">npx convex dev</code>).
      </div>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
