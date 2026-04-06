import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWrapAdminKey } from "@/adminConfig";
import { api } from "@/convex/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSettings() {
  const wrap = useWrapAdminKey();
  const settings = useQuery(api.blog.getPublicSiteSettings, {}) as
    | {
        siteName: string;
        baseUrl: string;
        defaultOgImageUrl?: string;
      }
    | null
    | undefined;
  const upsertSettings = useMutation(api.blog.upsertSiteSettings);

  const [siteName, setSiteName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [defaultOg, setDefaultOg] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setBaseUrl(settings.baseUrl);
      setDefaultOg(settings.defaultOgImageUrl ?? "");
    }
  }, [settings]);

  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/admin">← Articles</Link>
        </Button>
        <h1 className="text-xl font-semibold">Site settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Global configuration for your blog.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaved(false);
          await upsertSettings(
            wrap({
              siteName,
              baseUrl,
              defaultOgImageUrl: defaultOg || undefined,
            }),
          );
          setSaved(true);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="siteName">Site name</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL (https://…)</Label>
          <Input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="bg-background font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultOg">Default OG image URL</Label>
          <Input
            id="defaultOg"
            value={defaultOg}
            onChange={(e) => setDefaultOg(e.target.value)}
            className="bg-background"
            placeholder="https://…"
          />
        </div>
        <Button type="submit" className="w-fit">
          Save settings
        </Button>
        {saved ? <p className="text-sm text-emerald-500">Saved.</p> : null}
      </form>
    </div>
  );
}
