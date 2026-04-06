import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConvexBlogAdminShell, type RemoteAdminConfig } from "@/adminConfig";
import { ConvexDeploymentUrlError } from "@/ConvexDeploymentUrlError";
import { describeConvexUrlProblem } from "@/convexUrlValidation";
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
      <div className="bg-background text-foreground min-h-screen p-6">
        <div className="border-border bg-card text-card-foreground mx-auto max-w-lg rounded-lg border p-6 text-sm shadow-sm">
          <p className="text-destructive font-medium">Could not load admin config</p>
          <p className="mt-2 text-foreground">{err}</p>
          <p className="text-muted-foreground mt-4">
            For <code className="bg-muted rounded px-1 font-mono text-xs text-foreground">convex-blog-admin serve</code>, set{" "}
            <code className="bg-muted rounded px-1 font-mono text-xs text-foreground">CONVEX_URL</code>. For Vite dev, set{" "}
            <code className="bg-muted rounded px-1 font-mono text-xs text-foreground">VITE_CONVEX_URL</code> in{" "}
            <code className="bg-muted rounded px-1 font-mono text-xs text-foreground">admin-spa/.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!config?.convexUrl) {
    return (
      <div className="bg-background text-muted-foreground min-h-screen p-8 text-sm">Loading admin…</div>
    );
  }

  const urlProblem = describeConvexUrlProblem(config.convexUrl);
  if (urlProblem) {
    return <ConvexDeploymentUrlError convexUrl={config.convexUrl} problem={urlProblem} />;
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
