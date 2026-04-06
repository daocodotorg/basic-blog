import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PostListSidebar } from "./PostListSidebar";

const BANNER_KEY = "convex-blog-admin-hide-auth-banner";

export function AdminShell() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(BANNER_KEY) === "1");
  }, []);

  return (
    <div className="bg-background flex h-screen min-h-0 flex-col overflow-hidden">
      {!hidden ? (
        <div className="border-border bg-amber-500/10 text-amber-100/90 flex shrink-0 items-start gap-2 border-b px-3 py-2 text-xs leading-relaxed">
          <p className="min-w-0 flex-1">
            <strong>Demo-style token auth.</strong> Set <code className="rounded bg-black/30 px-1 font-mono">BLOG_ADMIN_API_KEY</code> in
            Convex and pass <code className="rounded bg-black/30 px-1 font-mono">CONVEX_URL</code> +{" "}
            <code className="rounded bg-black/30 px-1 font-mono">BLOG_ADMIN_API_KEY</code> (or{" "}
            <code className="rounded bg-black/30 px-1 font-mono">NEXT_PUBLIC_BLOG_ADMIN_API_KEY</code>) when running{" "}
            <code className="rounded bg-black/30 px-1 font-mono">convex-blog-admin serve</code>. Prefer Convex Auth in production.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-amber-200 hover:bg-amber-500/20 hover:text-amber-50"
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
