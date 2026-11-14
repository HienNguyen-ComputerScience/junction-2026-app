import Link from "next/link";
import { useId, type CSSProperties, type MouseEvent } from "react";
import { cn } from "cn";

import { StatusBadge } from "@/components/ui/status-badge";
import type { GapStatus } from "@/lib/data";

import {
  ALAND_PATH,
  FINLAND_PATHS,
  FINLAND_VIEWBOX,
  LABEL_SIDE,
  SMALL_AREA_IDS,
  type AreaShape,
} from "./finland-paths";

/**
 * Map of Finland's 22 areas (21 wellbeing services counties and the City of Helsinki), filled
 * by data status. Presentational and server-rendered: no client JavaScript, hover and focus
 * are CSS only. Boundaries: Statistics Finland, CC BY 4.0 (see finland-paths.ts). The borders
 * between areas are drawn in the panel colour, so the map belongs on a panel (`bg-card`).
 *
 * Give the figure a height through `className` (200px to 420px, e.g. `h-80`) and room for the
 * one-line Åland note under it (about 18px, e.g. `mb-5`); the map takes
 * its width from that height (0.574 of it). Each highlighted area adds a label column beside
 * the map, about 115px wide, on the side where its leader crosses less land.
 *
 * Åland is part of Finland but not one of the app's 22 areas: it is drawn as a neutral
 * outline (a hairline and a faint ground, its two largest islands), with no link and no
 * status, so the country keeps its shape and nothing suggests a value that does not exist.
 *
 * Status is never colour alone: every area's link is named "Name: 85.4%, Worse than Finland's level"
 * (shown as a tooltip too), and highlighted areas carry a text label. The page's own legend
 * names the colours.
 *
 * Picker mode (`onSelect`): a plain click on an area selects it instead of following its link
 * (a modified click still opens the link), and `selectedId` gets an accent outline inside the
 * area and `aria-current`. The component imports nothing from the snapshot at runtime (the
 * status label comes with each area), so it can render inside a client component.
 */

export type FinlandMapArea = {
  /** Area id from data/counties.json, e.g. "vantaa-kerava". */
  id: string;
  name: string;
  /** Where the area links to. Used as given. */
  href: string;
  status: GapStatus;
  /** The status in words, STATUS_LABEL[status] from lib/ranking. */
  statusLabel: string;
  /** The value as shown elsewhere on the page, e.g. "85.4%". null when there is no value. */
  valueLabel: string | null;
};

type Props = {
  areas: FinlandMapArea[];
  /** Area ids that get a leader line and a label (name and value) beside the map. */
  highlight?: string[];
  /** Accessible summary of the figure. */
  label?: string;
  className?: string;
  /** Picker mode: the selected area, drawn with an accent outline. */
  selectedId?: string;
  /** Picker mode: called instead of following the link on a plain click. */
  onSelect?: (id: string) => void;
};

// The fills of the bars, at the strength of the bars: an area that is worse than Finland is the
// solid red of a bar's gap, an area at or better is the slate of a bar. The map's key and the
// bars' key are therefore one key, with identical swatches. Hover and keyboard focus lift the
// fill a step towards white.
const AREA_FILL: Record<GapStatus, string> = {
  red: "fill-status-red group-hover:[fill:color-mix(in_oklch,var(--status-red),white_18%)] group-focus-visible:[fill:color-mix(in_oklch,var(--status-red),white_18%)]",
  amber:
    "fill-status-amber-bar group-hover:[fill:color-mix(in_oklch,var(--status-amber-bar),white_18%)] group-focus-visible:[fill:color-mix(in_oklch,var(--status-amber-bar),white_18%)]",
  no_data:
    "[fill:var(--hatch)] group-hover:[fill:var(--hatch-lift)] group-focus-visible:[fill:var(--hatch-lift)]",
};

// The selected area keeps exactly its status fill (red, slate or the hatch): the 2px cyan
// outline drawn over it is what marks it as picked, so its status stays readable.
const SELECTED_FILL: Record<GapStatus, string> = {
  red: "fill-status-red",
  amber: "fill-status-amber-bar",
  no_data: "[fill:var(--hatch)]",
};

// An area of a few pixels (Helsinki, Vantaa and Kerava) would lose most of itself to a border.
// It is drawn after its neighbours instead, with a thinner hairline, so it stays one solid
// mark that can be found.
const SMALL_AREA: Record<GapStatus, string> = {
  red: AREA_FILL.red,
  amber: AREA_FILL.amber,
  no_data: "fill-status-grey/60 group-hover:fill-status-grey group-focus-visible:fill-status-grey",
};

// Labels are HTML, so their type stays 12px at every map size. Each is two 16px lines on a
// 36px pitch, and its leader meets the middle of the first line, the area's name.
const LABEL_PITCH = 36;
const LABEL_ABOVE = 8;
const LABEL_BELOW = 24;
// Labels whose anchors are closer than their own height, at the smallest supported map height,
// are stacked as one block centred on their anchors.
const MIN_MAP_HEIGHT = 200;

type Side = "left" | "right";

type Placed = {
  area: FinlandMapArea;
  shape: AreaShape;
  side: Side;
  /** CSS length: the middle of the label's first line, measured from the top of the map. */
  y: string;
};

/**
 * Where each highlighted label sits. Positions are CSS expressions, because the map's height
 * is only known to the browser: a block of n labels is centred on the mean of its anchors (a
 * percentage of the height), kept inside the figure, and its labels are spaced in pixels.
 */
function placeLabels(items: { area: FinlandMapArea; shape: AreaShape }[]): Placed[] {
  const unitsPerPx = FINLAND_VIEWBOX.height / MIN_MAP_HEIGHT;
  const placed: Placed[] = [];

  for (const side of ["left", "right"] as const) {
    const onSide = items
      .filter((item) => (LABEL_SIDE[item.area.id] ?? "right") === side)
      .sort((a, b) => a.shape.cy - b.shape.cy);

    let blocks = onSide.map((item) => [item]);
    const centre = (block: typeof onSide) =>
      block.reduce((sum, item) => sum + item.shape.cy, 0) / block.length;

    // Merge neighbouring blocks until none would overlap at the smallest map height.
    for (let i = 0; i < blocks.length - 1;) {
      const a = blocks[i];
      const b = blocks[i + 1];
      const needed = ((a.length + b.length) * LABEL_PITCH * unitsPerPx) / 2;
      if (centre(b) - centre(a) < needed) {
        blocks = [...blocks.slice(0, i), [...a, ...b], ...blocks.slice(i + 2)];
        i = Math.max(0, i - 1);
      } else {
        i++;
      }
    }

    for (const block of blocks) {
      const spread = ((block.length - 1) * LABEL_PITCH) / 2;
      const middle = ((centre(block) / FINLAND_VIEWBOX.height) * 100).toFixed(2);
      block.forEach((item, index) => {
        const offset = (index - (block.length - 1) / 2) * LABEL_PITCH;
        placed.push({
          ...item,
          side,
          y: `calc(clamp(${spread + LABEL_ABOVE}px, ${middle}%, 100% - ${spread + LABEL_BELOW}px) + ${offset}px)`,
        });
      });
    }
  }
  return placed;
}

export function FinlandMap({
  areas,
  highlight = [],
  label = `Map of Finland's ${areas.length} areas by non-urgent GP visits waiting over 7 days`,
  className,
  selectedId,
  onSelect,
}: Props) {
  const uid = useId();
  // In picker mode the selected area's figure is shown beside the map, so its label is the name only.
  const picker = onSelect !== undefined;
  const pathId = (id: string) => `${uid}-p-${id}`;
  const clipId = (id: string) => `${uid}-c-${id}`;
  const hatchId = `${uid}-hatch`;
  const hatchLiftId = `${uid}-hatch-lift`;

  // North to south: the order the areas are drawn in and the order the links take focus in.
  // The small areas come last (they are on the south coast anyway), so no neighbour is drawn
  // over their outline.
  const drawn = areas
    .flatMap((area) => {
      const shape = FINLAND_PATHS[area.id];
      return shape ? [{ area, shape, small: SMALL_AREA_IDS.includes(area.id) }] : [];
    })
    .sort((a, b) => Number(a.small) - Number(b.small) || a.shape.cy - b.shape.cy);

  const labels = placeLabels(drawn.filter(({ area }) => highlight.includes(area.id)));
  const leftLabels = labels.filter((item) => item.side === "left");
  const rightLabels = labels.filter((item) => item.side === "right");

  const { width, height } = FINLAND_VIEWBOX;
  const hatchVars = {
    "--hatch": `url(#${hatchId})`,
    "--hatch-lift": `url(#${hatchLiftId})`,
  } as CSSProperties;

  return (
    // No role="img" here: it would hide the 22 links inside from assistive technology. A
    // figure with a name keeps the summary and the links.
    <figure aria-label={label} className={cn("flex items-stretch justify-center", className)}>
      <LabelColumn side="left" labels={leftLabels} nameOnly={picker} />

      <div className="relative h-full shrink-0" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 size-full"
          style={hatchVars}
        >
          <defs>
            <HatchPattern id={hatchId} ground="fill-status-grey-soft" />
            <HatchPattern id={hatchLiftId} ground="fill-status-grey-border" />
            {drawn.map(({ area, shape }) => (
              <g key={area.id}>
                <path id={pathId(area.id)} d={shape.d} vectorEffect="non-scaling-stroke" />
                {/* Each area is clipped to its own outline, so its border and its focus ring
                    are drawn inside it and a neighbour drawn later never covers them. */}
                <clipPath id={clipId(area.id)}>
                  <use href={`#${pathId(area.id)}`} />
                </clipPath>
              </g>
            ))}
          </defs>

          {/* Åland: a neutral outline, not a data area (see the file comment). */}
          <path
            d={ALAND_PATH}
            vectorEffect="non-scaling-stroke"
            strokeWidth={1}
            className="stroke-foreground/25 [fill:var(--hatch)]"
          >
            <title>Åland: not one of the 22 areas in this data</title>
          </path>

          {drawn.map(({ area, small }) => {
            const name = area.valueLabel
              ? `${area.name}: ${area.valueLabel}, ${area.statusLabel}`
              : `${area.name}: ${area.statusLabel}`;
            const selected = area.id === selectedId;
            const select = onSelect
              ? (event: MouseEvent<HTMLAnchorElement>) => {
                  // A modified or middle click keeps the link's own behaviour (a new tab).
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onSelect(area.id);
                }
              : undefined;
            return (
              <Link
                key={area.id}
                href={area.href}
                aria-label={name}
                aria-current={selected ? "true" : undefined}
                data-status={area.status}
                data-area={area.id}
                onClick={select}
                className="group outline-none"
              >
                <title>{name}</title>
                {/* The stroke is the page colour, half of it on each side of a border after
                    clipping: neighbours read as separate tiles with a 1px line between them.
                    On keyboard focus it becomes a 2px ring inside the area. */}
                <use
                  href={`#${pathId(area.id)}`}
                  clipPath={small ? undefined : `url(#${clipId(area.id)})`}
                  strokeWidth={small ? 0.75 : 1}
                  className={cn(
                    "transition-colors group-focus-visible:stroke-ring group-focus-visible:[stroke-width:4px]",
                    // Selected: lighter fill; its accent outline is drawn on top, after the loop.
                    // While one area is selected the others step back a little.
                    "stroke-card",
                    selectedId !== undefined && !selected && "opacity-[0.72] group-hover:opacity-100 group-focus-visible:opacity-100",
                    selected ? SELECTED_FILL[area.status] : small ? SMALL_AREA[area.status] : AREA_FILL[area.status],
                  )}
                />
              </Link>
            );
          })}
          {/* The selected area's outline: 2px accent, drawn over every neighbour so none covers it. */}
          {selectedId !== undefined && FINLAND_PATHS[selectedId] && (
            <use
              href={`#${pathId(selectedId)}`}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              className="pointer-events-none stroke-brand"
            />
          )}
        </svg>

        {labels.map((item) => (
          <Leader key={item.area.id} item={item} ring={picker} />
        ))}

      </div>

      <LabelColumn side="right" labels={rightLabels} nameOnly={picker} />
    </figure>
  );
}

/** The hatch of "no public data", the same mark as the empty bar track (`bg-hatch`). */
function HatchPattern({ id, ground }: { id: string; ground: string }) {
  return (
    <pattern
      id={id}
      width={14}
      height={14}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width={14} height={14} className={ground} />
      <line x1={0} y1={0} x2={0} y2={14} strokeWidth={3} className="stroke-status-grey" />
    </pattern>
  );
}

/**
 * The leader of one label: a 1px line from the label's edge of the map to above or below the
 * area's anchor, a short drop to the anchor, and a square mark on it. HTML, so the line stays
 * 1px and meets a label that is positioned in pixels.
 */
function Leader({ item, ring }: { item: Placed; ring: boolean }) {
  const x = `${((item.shape.cx / FINLAND_VIEWBOX.width) * 100).toFixed(2)}%`;
  const y = `${((item.shape.cy / FINLAND_VIEWBOX.height) * 100).toFixed(2)}%`;
  const line = "pointer-events-none absolute bg-foreground/70";
  // The selected ring is 14px (2px stroke, no fill). Each line is cut by a circular hole of the
  // ring's radius around the ring's centre, so it ends exactly on the ring's outer edge. A
  // vertical drop has the centre at its anchored end; the horizontal line only has it at its
  // start when the label sits level with the anchor, so its hole shrinks as the label moves off it.
  const RING_R = 7;
  const hole = (at: string, radius: string): CSSProperties | undefined =>
    ring
      ? (() => {
          const image = `radial-gradient(circle at ${at}, transparent calc(${radius} - 0.5px), #000 ${radius})`;
          return { maskImage: image, WebkitMaskImage: image };
        })()
      : undefined;
  const levelRadius = `max(0px, ${RING_R}px - abs(calc(${item.y} - ${y})))`;
  return (
    <span aria-hidden>
      <span
        className={cn(line, "h-px -translate-y-1/2")}
        style={{
          ...(item.side === "right"
            ? { top: item.y, left: x, right: -4 }
            : { top: item.y, right: `calc(100% - ${x})`, left: -4 }),
          ...hole(item.side === "right" ? "0 50%" : "100% 50%", levelRadius),
        }}
      />
      {/* The drop: only one of the two has a height, whichever way the label is displaced. */}
      <span
        className={cn(line, "w-px -translate-x-1/2")}
        style={{
          left: x,
          top: y,
          height: `max(0px, calc(${item.y} - ${y}))`,
          ...hole("50% 0", `${RING_R}px`),
        }}
      />
      <span
        className={cn(line, "w-px -translate-x-1/2")}
        style={{
          left: x,
          top: item.y,
          height: `max(0px, calc(${y} - ${item.y}))`,
          ...hole("50% 100%", `${RING_R}px`),
        }}
      />
      <span
        className={
          ring
            ? "pointer-events-none absolute size-3.5 -translate-1/2 rounded-full border-2 border-brand"
            : "pointer-events-none absolute size-1 -translate-1/2 bg-foreground outline-1 outline-card"
        }
        style={{ left: x, top: y }}
      />
    </span>
  );
}

/**
 * The labels of one side, in a column that takes its width from them. Decorative for
 * assistive technology: the same name, value and status are the accessible name of the link.
 */
function LabelColumn({ side, labels, nameOnly }: { side: Side; labels: Placed[]; nameOnly: boolean }) {
  if (labels.length === 0) return null;
  return (
    <div
      aria-hidden
      className={cn("grid shrink-0 grid-rows-[minmax(0,1fr)]", side === "right" ? "pl-2" : "pr-2")}
    >
      {labels.map(({ area, y }) => (
        <span
          key={area.id}
          className={cn(
            "relative col-start-1 row-start-1 -mt-2 flex h-8 flex-col self-start whitespace-nowrap",
            side === "left" && "items-end",
          )}
          style={{ top: y }}
        >
          <span className="type-caption leading-4 font-medium text-foreground">{area.name}</span>
          {!nameOnly && (
            <StatusBadge status={area.status} variant="quiet" className="h-4 leading-4">
              <span className="figure">{area.valueLabel ?? area.statusLabel}</span>
            </StatusBadge>
          )}
        </span>
      ))}
    </div>
  );
}
