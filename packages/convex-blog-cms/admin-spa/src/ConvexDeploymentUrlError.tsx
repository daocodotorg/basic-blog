import type { ConvexUrlProblem } from "./convexUrlValidation";

export function ConvexDeploymentUrlError(props: {
  convexUrl: string;
  problem: Exclude<ConvexUrlProblem, null>;
}) {
  const isSite = props.problem.kind === "convex_site";
  return (
    <div className="bg-background text-foreground mx-auto max-w-lg p-6">
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <h1 className="text-lg font-semibold">
          {isSite ? "Wrong Convex URL for this admin" : "Invalid Convex URL"}
        </h1>
        {isSite ?
          <>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              You passed a URL that ends with <code className="bg-muted rounded px-1 font-mono text-xs">.convex.site</code>.
              That hostname is for{" "}
              <strong className="text-foreground">HTTP Actions</strong> only. The admin and{" "}
              <code className="bg-muted rounded px-1 font-mono text-xs">ConvexReactClient</code> need your{" "}
              <strong className="text-foreground">deployment</strong> URL, which ends with{" "}
              <code className="bg-muted rounded px-1 font-mono text-xs">.convex.cloud</code>.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              In the{" "}
              <a
                className="text-primary underline"
                href="https://dashboard.convex.dev"
                target="_blank"
                rel="noreferrer"
              >
                Convex dashboard
              </a>
              , open your project → <strong className="text-foreground">Settings</strong> → copy the deployment URL
              (format <code className="bg-muted rounded px-1 font-mono text-xs">https://….convex.cloud</code>), then set
              it as <code className="bg-muted rounded px-1 font-mono text-xs">CONVEX_URL</code> when running{" "}
              <code className="bg-muted rounded px-1 font-mono text-xs">convex-blog-admin serve</code>, or put it in{" "}
              <code className="bg-muted rounded px-1 font-mono text-xs">config.json</code> as{" "}
              <code className="bg-muted rounded px-1 font-mono text-xs">convexUrl</code>.
            </p>
          </>
        : <p className="text-muted-foreground mt-3 text-sm">{props.problem.message}</p>}
        <p className="text-muted-foreground mt-4 text-xs">
          Current value:{" "}
          <code className="bg-muted max-w-full break-all rounded px-1 py-0.5 font-mono text-[11px]">
            {props.convexUrl}
          </code>
        </p>
      </div>
    </div>
  );
}
