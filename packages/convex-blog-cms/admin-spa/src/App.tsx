import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConvexBlogAdminShell, type RemoteAdminConfig } from "@/adminConfig";
import { AdminEmpty } from "@/pages/AdminEmpty";
import { AdminSettings } from "@/pages/AdminSettings";
import { AdminShell } from "@/pages/AdminShell";
import { PostEditor } from "@/pages/PostEditor";

function loadDevConfig(): RemoteAdminConfig | null {
  const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (import.meta.env.DEV && url) {
    return {
      convexUrl: url,
      adminApiKey: (import.meta.env.VITE_BLOG_ADMIN_API_KEY as string | undefined) || undefined,
    };
  }
  return null;
}

export function App() {
  const [config, setConfig] = useState<RemoteAdminConfig | null>(() => loadDevConfig());
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      return;
    }
    fetch("config.json")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`);
        }
        return r.json() as Promise<RemoteAdminConfig>;
      })
      .then((c) => {
        if (!c.convexUrl) {
          throw new Error("config.json must include convexUrl");
        }
        setConfig(c);
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [config]);

  if (err) {
    return (
      <div className="mx-auto max-w-lg p-6 text-sm text-red-700">
        <p className="font-medium">Could not load admin config</p>
        <p className="mt-2">{err}</p>
        <p className="mt-4 text-zinc-600">
          For <code className="rounded bg-zinc-100 px-1">convex-blog-admin serve</code>, set{" "}
          <code className="rounded bg-zinc-100 px-1">CONVEX_URL</code>. For Vite dev, set{" "}
          <code className="rounded bg-zinc-100 px-1">VITE_CONVEX_URL</code> in{" "}
          <code className="rounded bg-zinc-100 px-1">admin-spa/.env.local</code>.
        </p>
      </div>
    );
  }

  if (!config?.convexUrl) {
    return <div className="text-muted-foreground p-8 text-sm">Loading admin…</div>;
  }

  return (
    <BrowserRouter>
      <ConvexBlogAdminShell config={config}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminEmpty />} />
            <Route path="/admin/edit/:slug" element={<PostEditor />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </ConvexBlogAdminShell>
    </BrowserRouter>
  );
}
