import { X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PostListSidebar } from "./PostListSidebar";

const BANNER_KEY = "convex-blog-admin-hide-auth-banner";

export function AdminShell() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(BANNER_KEY) === "1";
    } catch {
      return false;
    }
  });

  return (
    <div className="bg-background flex h-screen min-h-0 flex-col overflow-hidden">
      {!hidden ? (
        <div className="border-amber-500/35 bg-amber-500/20 text-amber-50 flex shrink-0 items-start gap-2 border-b px-3 py-2 text-xs leading-relaxed">
          <p className="min-w-0 flex-1">
            <strong className="text-amber-100">Optional token auth.</strong> For extra protection, set{" "}
            <code className="rounded bg-black/45 px-1 font-mono text-amber-100">BLOG_ADMIN_API_KEY</code> in Convex and pass the same value when running{" "}
            <code className="rounded bg-black/45 px-1 font-mono text-amber-100">convex-blog-admin serve</code> (or{" "}
            <code className="rounded bg-black/45 px-1 font-mono text-amber-100">NEXT_PUBLIC_BLOG_ADMIN_API_KEY</code> in a browser app). The admin works
            without it for local dev; enable <code className="rounded bg-black/45 px-1 font-mono text-amber-100">strictAdminApiKey</code> on the host when you
            want to require the token. Prefer Convex Auth for production sites.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-amber-100 hover:bg-amber-500/25 hover:text-amber-50"
            aria-label="Dismiss"
            onClick={() => {
              localStorage.setItem(BANNER_KEY, "1");
              setHidden(true);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1">
        <PostListSidebar />
        <div className="bg-background min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
