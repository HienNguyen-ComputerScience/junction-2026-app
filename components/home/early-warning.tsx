import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SourceChip } from "@/components/source-chip";
import { Frame, FrameDescription, FrameHeader, FrameMeta, FramePanel, FrameTitle } from "@/components/ui/frame";
import type { County } from "@/lib/data";
import { FIRST_YEAR, formatPct, getTrend, GP_WAIT_ID, YEARS } from "@/lib/ranking";
import { formatAmount, worseningFastest } from "@/lib/what-if";

const LAST_YEAR = YEARS[YEARS.length - 1];

/**
 * Early warning: the areas whose share of non-urgent GP visits waiting over 7 days rose most
 * since the first year of the trend. Change in words, with no arrow and no colour. One source
 * chip for the panel; each row links to the area's pathway.
 */
export function EarlyWarning({ areas, sourceId }: { areas: County[]; sourceId: string }) {
  const list = worseningFastest(
    areas.map((county) => {
      const trend = getTrend(county.id, GP_WAIT_ID);
      return {
        id: county.id,
        name: county.name,
        first: trend[0]?.value?.value ?? null,
        latest: trend[trend.length - 1]?.value?.value ?? null,
      };
    }),
    "lower",
  );
  if (list.length === 0) return null;

  return (
    <Frame aria-labelledby="warning-heading">
      <FrameHeader>
        <FrameTitle id="warning-heading">
          Getting worse fastest, {FIRST_YEAR}–{LAST_YEAR}
        </FrameTitle>
        <FrameMeta>
          <SourceChip sourceId={sourceId} />
        </FrameMeta>
        <FrameDescription>
          The {list.length === 1 ? "area" : `${list.length} areas`} where the share of non-urgent GP
          visits waiting over 7 days rose most since {FIRST_YEAR}.
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="none" className="py-1">
        <ol>
          {list.map((row, index) => (
            <li key={row.id}>
              <Link
                href={`/county/${row.id}`}
                className={`group relative grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-2 pr-10 pl-4 transition-colors outline-none hover:bg-accent focus-visible:z-[1] focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:pl-5 ${index > 0 ? "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-foreground/[0.06] sm:before:inset-x-5" : ""}`}
              >
                <span className="text-[0.9375rem] font-medium text-foreground">{row.name}</span>
                <span className="col-start-1 type-caption text-muted-foreground sm:col-start-2 sm:row-start-1 sm:text-sm">
                  <span className="figure">{formatAmount(row.change)} pts</span> worse since {FIRST_YEAR}
                </span>
                <span className="col-start-2 row-span-2 row-start-1 text-right type-caption text-muted-foreground sm:col-start-3 sm:row-span-1 sm:text-sm">
                  <span className="figure">{formatPct(row.latest)}</span> in {LAST_YEAR}
                </span>
                <ChevronRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint transition-colors group-hover:text-foreground group-focus-visible:text-foreground sm:right-4"
                />
              </Link>
            </li>
          ))}
        </ol>
      </FramePanel>
    </Frame>
  );
}
