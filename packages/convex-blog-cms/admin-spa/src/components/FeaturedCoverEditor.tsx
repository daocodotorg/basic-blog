import { Image as ImageIcon, Loader2, Move } from "lucide-react";
import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CoverPreviewAspect = "16:9" | "5:4";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function FeaturedCoverEditor(props: {
  imageUrl: string | null;
  aspect: CoverPreviewAspect;
  onAspectChange: (a: CoverPreviewAspect) => void;
  focalX: number;
  focalY: number;
  onFocalChange: (x: number, y: number) => void;
  onFocalCommit: () => void;
  disabled?: boolean;
  showSpinner?: boolean;
  className?: string;
}) {
  const {
    imageUrl,
    aspect,
    onAspectChange,
    focalX,
    focalY,
    onFocalChange,
    onFocalCommit,
    disabled,
    showSpinner,
    className,
  } = props;

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; fx: number; fy: number } | null>(null);

  const aspectClass = aspect === "16:9" ? "aspect-video" : "aspect-[5/4]";

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!imageUrl || disabled) {
        return;
      }
      dragRef.current = {
        px: e.clientX,
        py: e.clientY,
        fx: focalX,
        fy: focalY,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [imageUrl, disabled, focalX, focalY],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      const el = frameRef.current;
      if (!d || !el) {
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 8 || h < 8) {
        return;
      }
      const dx = e.clientX - d.px;
      const dy = e.clientY - d.py;
      const k = 140;
      const nx = clamp(d.fx - (dx / w) * k, 0, 100);
      const ny = clamp(d.fy - (dy / h) * k, 0, 100);
      onFocalChange(nx, ny);
    },
    [onFocalChange],
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) {
        return;
      }
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      onFocalCommit();
    },
    [onFocalCommit],
  );

  const resetCenter = useCallback(() => {
    onFocalChange(50, 50);
    onFocalCommit();
  }, [onFocalChange, onFocalCommit]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">Preview crop</span>
        <div className="bg-muted/60 flex rounded-md p-0.5">
          {(["16:9", "5:4"] as const).map((a) => (
            <Button
              key={a}
              type="button"
              variant={aspect === a ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => onAspectChange(a)}
            >
              {a}
            </Button>
          ))}
        </div>
        {imageUrl ?
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={disabled}
            onClick={resetCenter}
          >
            Center
          </Button>
        : null}
      </div>

      <div
        ref={frameRef}
        className={cn(
          "bg-muted/30 relative w-full max-h-64 overflow-hidden rounded-md border border-border",
          aspectClass,
          imageUrl && !disabled ? "cursor-grab active:cursor-grabbing touch-none" : "",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {showSpinner ?
          <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        : null}
        {imageUrl ?
          <>
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="pointer-events-none h-full w-full select-none object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
            <div
              className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/25"
              aria-hidden
            />
            <div className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/55 px-2 py-1 text-[10px] font-medium text-white/95">
              <Move className="h-3 w-3 opacity-90" aria-hidden />
              Drag to reposition
            </div>
          </>
        : <div className="text-muted-foreground flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 px-4 text-center">
            <ImageIcon className="h-9 w-9 opacity-35" aria-hidden />
            <span className="text-xs">No cover image yet</span>
          </div>
        }
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        The frame matches a wide ({aspect}) card crop. Drag inside the preview to choose what stays visible when the site
        uses <span className="font-mono text-foreground/80">object-fit: cover</span> — same as{" "}
        <code className="rounded bg-muted px-1 font-mono">featuredImageCoverStyle</code> on the public site.
      </p>
    </div>
  );
}
