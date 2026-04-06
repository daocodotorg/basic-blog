import { ConvexProvider, ConvexReactClient } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type RemoteAdminConfig = {
  convexUrl: string;
  /** Same value as `NEXT_PUBLIC_BLOG_ADMIN_API_KEY` when using token auth. */
  adminApiKey?: string;
};

const ConfigCtx = createContext<RemoteAdminConfig | null>(null);

export function useAdminConfig(): RemoteAdminConfig {
  const c = useContext(ConfigCtx);
  if (!c) {
    throw new Error("useAdminConfig outside ConvexBlogAdminShell");
  }
  return c;
}

/** Attach optional `adminApiKey` for `makeBlogAdminAPI` token auth. */
export function useWrapAdminKey() {
  const { adminApiKey } = useAdminConfig();
  return useCallback(
    <T extends Record<string, unknown>>(args: T): T & { adminApiKey?: string } => {
      if (adminApiKey === undefined || adminApiKey === "") {
        return args;
      }
      return { ...args, adminApiKey };
    },
    [adminApiKey],
  );
}

export function ConvexBlogAdminShell({
  config,
  children,
}: {
  config: RemoteAdminConfig;
  children: ReactNode;
}) {
  const client = useMemo(
    () => new ConvexReactClient(config.convexUrl),
    [config.convexUrl],
  );
  return (
    <ConfigCtx.Provider value={config}>
      <ConvexProvider client={client}>
        <div className="dark min-h-screen bg-background text-foreground">{children}</div>
      </ConvexProvider>
    </ConfigCtx.Provider>
  );
}
