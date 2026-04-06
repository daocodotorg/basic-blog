import { useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Pencil, Plus, Search, Settings, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWrapAdminKey } from "@/adminConfig";
import { api } from "@/convex/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PostRow = {
  _id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  publishedAt?: number;
  excerpt?: string;
  _creationTime: number;
};

function formatShortDate(ts: number | undefined): string {
  if (ts === undefined) {
    return "";
  }
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PostListSidebar() {
  const wrap = useWrapAdminKey();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSlug = useMemo(() => {
    const m = location.pathname.match(/^\/admin\/edit\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [location.pathname]);

  const posts = useQuery(api.blog.listPostsForAdmin, wrap({ limit: 100 })) as PostRow[] | undefined;
  const createPost = useMutation(api.blog.createPost);
  const deletePost = useMutation(api.blog.deletePost);

  const [tab, setTab] = useState<"drafts" | "published">("drafts");
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("new-post");
  const [newTitle, setNewTitle] = useState("Untitled");
  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null);

  const filtered = useMemo(() => {
    if (!posts) {
      return [];
    }
    const byStatus = posts.filter((p) => (tab === "drafts" ? p.status === "draft" : p.status === "published"));
    if (!q.trim()) {
      return byStatus;
    }
    const needle = q.trim().toLowerCase();
    return byStatus.filter(
      (p) =>
        p.slug.toLowerCase().includes(needle) ||
        p.title.toLowerCase().includes(needle) ||
        (p.excerpt?.toLowerCase().includes(needle) ?? false),
    );
  }, [posts, tab, q]);

  async function onCreate() {
    await createPost(wrap({ slug: newSlug.trim(), title: newTitle.trim() || "Untitled" }));
    setNewOpen(false);
    navigate(`/admin/edit/${encodeURIComponent(newSlug.trim())}`);
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-[min(100%,380px)] shrink-0 flex-col border-r border-sidebar-border">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <h1 className="text-sm font-semibold tracking-tight">Articles</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/admin/settings" aria-label="Site settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="default" size="icon" className="h-8 w-8" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-background/80 border-sidebar-border h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "drafts" | "published")} className="flex min-h-0 flex-1 flex-col px-3">
        <TabsList className="bg-background/50 mb-2 grid w-full grid-cols-2">
          <TabsTrigger value="drafts" className="text-xs">
            Drafts
          </TabsTrigger>
          <TabsTrigger value="published" className="text-xs">
            Published
          </TabsTrigger>
        </TabsList>
        <TabsContent value="drafts" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <PostList
            posts={filtered}
            activeSlug={activeSlug}
            loading={posts === undefined}
            empty="No drafts yet."
            onDelete={(p) => setDeleteTarget(p)}
          />
        </TabsContent>
        <TabsContent value="published" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <PostList
            posts={filtered}
            activeSlug={activeSlug}
            loading={posts === undefined}
            empty="No published posts."
            onDelete={(p) => setDeleteTarget(p)}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New draft</DialogTitle>
            <DialogDescription>Create a new post. You can edit the slug before publishing.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nslug">Slug</Label>
              <Input
                id="nslug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ntitle">Title</Label>
              <Input id="ntitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onCreate()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This permanently removes “{deleteTarget?.title}” ({deleteTarget?.slug}). This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) {
                  return;
                }
                await deletePost(wrap({ postId: deleteTarget._id }));
                setDeleteTarget(null);
                if (activeSlug === deleteTarget.slug) {
                  navigate("/admin");
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function PostList(props: {
  posts: PostRow[];
  activeSlug: string | null;
  loading: boolean;
  empty: string;
  onDelete: (p: PostRow) => void;
}) {
  if (props.loading) {
    return <p className="text-muted-foreground px-1 py-4 text-sm">Loading…</p>;
  }
  if (props.posts.length === 0) {
    return <p className="text-muted-foreground px-1 py-4 text-sm">{props.empty}</p>;
  }
  return (
    <ScrollArea className="h-[calc(100vh-200px)] pr-2">
      <ul className="space-y-1 pb-4">
        {props.posts.map((p) => {
          const selected = props.activeSlug === p.slug;
          const snippet = (p.excerpt?.trim() || "").slice(0, 120) || "—";
          return (
            <li key={p._id}>
              <div
                className={cn(
                  "hover:bg-sidebar-accent/80 group flex rounded-md border border-transparent transition-colors",
                  selected && "border-sidebar-primary bg-sidebar-accent/60",
                )}
              >
                <Link
                  to={`/admin/edit/${encodeURIComponent(p.slug)}`}
                  className="min-w-0 flex-1 px-2.5 py-2 text-left"
                >
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0 font-medium",
                        p.status === "published" ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-300",
                      )}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span>{p.status === "published" ? formatShortDate(p.publishedAt) : formatShortDate(p._creationTime)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium leading-snug">{p.title || "(Untitled)"}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">{snippet}</p>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-60 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/edit/${encodeURIComponent(p.slug)}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => props.onDelete(p)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
