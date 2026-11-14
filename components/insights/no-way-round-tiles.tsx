"use client";

import { cn } from "cn";

import { useStoryStep } from "@/components/motion";

/** 0 other areas, 1 longer GP wait than Finland, 2 and few other routes, 3 and in every test. */
export type TileLevel = 0 | 1 | 2 | 3;

/**
 * Each level a clear step on the palette: cream, mint, sage with a Forest Ink edge, then slate
 * with the same edge. Never the Forest Ink fill: that is the primary button, and a tile is not
 * one. The edge (2px on every box, so nothing shifts) keeps levels 2 and 3 apart from level 1
 * even when a print drops the fills; the dots carry the level without colour.
 */
const FILL: Record<TileLevel, string> = {
  0: "border-border-mist bg-cream-paper text-charcoal",
  1: "border-forest-ink/25 bg-mint-veil text-charcoal",
  2: "border-forest-ink bg-sage-mist text-forest-ink font-semibold",
  3: "border-forest-ink bg-slate-hush text-forest-ink font-semibold",
};

const SAYS: Record<TileLevel, string> = {
  0: "",
  1: "longer GP wait than Finland overall",
  2: "longer GP wait and few private or work-health doctor visits instead",
  3: "longer GP wait and few private or work-health doctor visits instead, in all six tests",
};

/** One to three dots: the level as a shape, so the picture never depends on colour alone. */
function Dots({ level }: { level: TileLevel }) {
  if (level === 0) return null;
  return (
    <span aria-hidden className="flex shrink-0 gap-0.5">
      {Array.from({ length: level }, (_, i) => (
        <span key={i} className="size-2 rounded-full bg-current" />
      ))}
    </span>
  );
}

/**
 * The picture that holds still while the "no way round" story scrolls past: the 22 areas as
 * boxes. Step 0 all plain; step 1 the longer GP waits; step 2 those with few other routes too;
 * step 3 the two that hold under every cut-off. The final state (server, phone, reduced motion,
 * print) shows every level at once, each with its own fill and number of dots.
 */
export function NoWayRoundTiles({
  areas,
  counts = false,
}: {
  areas: { id: string; name: string; level: TileLevel }[];
  /** Start each legend line with how many areas reach that level (counted from `areas`). */
  counts?: boolean;
}) {
  const step = useStoryStep();
  const shown = (level: TileLevel): TileLevel => {
    if (step === null) return level;
    return level >= step ? (Math.min(level, step) as TileLevel) : 0;
  };
  return (
    <div className="flex flex-col gap-4">
      {/* The key comes first, so it is on screen before the boxes it explains. Without counts it only repeats each box's own screen-reader text; with counts it adds facts, so it is read. */}
      <ul aria-hidden={counts ? undefined : true} aria-label={counts ? "Legend" : undefined} className="flex flex-col gap-1.5 text-base">
        {([1, 2, 3] as const).map((level) => (
          <li key={level} className="flex items-center gap-2.5">
            <span className={cn("inline-flex h-6 w-10 items-center justify-center rounded-sm border-2", FILL[level])}>
              <Dots level={level} />
            </span>
            {counts ? <span className="figure min-w-[2ch] text-right font-semibold">{areas.filter((a) => a.level >= level).length}</span> : null}
            {level === 1 ? "Longer GP wait than Finland overall" : level === 2 ? "… and few private or work-health doctor visits instead" : "… true in every one of the six tests we ran"}
          </li>
        ))}
      </ul>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {areas.map((a) => {
          const level = shown(a.level);
          return (
            <li
              key={a.id}
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 rounded-sm border-2 px-2.5 py-1.5 text-base leading-tight transition-colors duration-(--motion-rise) ease-(--motion-ease)",
                FILL[level],
              )}
            >
              <span className="min-w-0">
                {a.name}
                {SAYS[a.level] ? <span className="sr-only">: {SAYS[a.level]}</span> : null}
              </span>
              <Dots level={level} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
