import type { CSSProperties, ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { STAGE_LABELS } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { formatPct } from "@/lib/ranking";
import { formatAmount, type Better, type WhatIf } from "@/lib/what-if";

/** What one share counts, and which word an improvement takes. */
const UNIT: Record<Better, { word: string; subject: string }> = {
  lower: { word: "fewer", subject: "Non-urgent GP visits waiting over 7 days" },
  higher: { word: "more", subject: "Referrals processed within 3 days" },
};

const STAGE_IN_SENTENCE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * The what-if for an area's bottleneck stage, drawn: the area's bar (the bar rule of
 * measure-bar.tsx, so the solid red is already the gap to Finland), a bracket over the span
 * the arithmetic counts, labelled with the amount per 100, the Finland line, and the best
 * area's level as a second, dashed mark. One sentence names what the bar counts; the caption
 * says it is arithmetic, not a forecast. Server-rendered; the home picker shows one per area.
 */
export function WhatIfPanel({
  areaName,
  stage,
  better,
  value,
  status,
  finland,
  sourceId,
  year,
  result,
}: {
  areaName: string;
  stage: Stage;
  better: Better;
  /** The area's own share (null when nothing is published). */
  value: number | null;
  status: GapStatus;
  finland: number;
  sourceId: string;
  year: number;
  result: WhatIf;
}) {
  const unit = UNIT[better];

  let intro: ReactNode;
  let chart: ReactNode = null;
  if (result.kind === "no_data" || value === null) {
    intro = (
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        There is no published figure for {STAGE_IN_SENTENCE[stage]} in {areaName}, so there is no
        what-if here. The full pathway page shows what is published for this area.
      </p>
    );
  } else {
    const { toFinland, toBest } = result;
    // The span the arithmetic counts: to Finland's level when the area is worse than Finland,
    // otherwise to the best area's level. The best area is a second mark either way.
    const target = toFinland !== null ? finland : (toBest?.value ?? null);
    const amount = toFinland ?? toBest?.amount ?? null;
    const sentence =
      toFinland !== null ? (
        <>
          {unit.subject}: what if {areaName} reached Finland&apos;s level?
        </>
      ) : toBest ? (
        <>
          {unit.subject}: {areaName} is at or better than Finland&apos;s level. What if it reached
          the best area&apos;s?
        </>
      ) : (
        <>
          {areaName} is already at or better than Finland&apos;s level, and has the best published
          share of the areas with a figure.
        </>
      );
    intro = <p className="text-[0.9375rem] leading-relaxed text-pretty text-foreground">{sentence}</p>;
    chart = (
      <>
        <WhatIfBar
          value={value}
          status={status}
          finland={finland}
          target={target}
          amount={amount === null ? null : `${formatAmount(amount)}`}
          word={unit.word}
          best={toBest}
          showBestAmount={toFinland !== null}
        />
      </>
    );
  }

  return (
    // Wide: the heading, what the bar counts, the caption and the source on the left, the bar on
    // the right. No title strip: the small heading leads the left column.
    <FramePanel
      padding="none"
      className="grid h-full gap-x-10 gap-y-4 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center"
    >
      <div className="flex flex-col gap-2.5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">What if: {STAGE_LABELS[stage]}</h3>
        {intro}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 type-caption text-muted-foreground">
          <span>Arithmetic on the published shares, not a forecast of any single action.</span>
          <SourceChip sourceId={sourceId} year={year} />
        </p>
      </div>
      {chart}
    </FramePanel>
  );
}

/**
 * Where a label over a span of the bar sits, without measuring it: centred on the span when the
 * span is in the middle of the track (the box reaches the nearer end, as FinlandAxis does),
 * otherwise starting at the span's left end or ending at its right end, so it never runs past
 * the bar.
 */
function labelOver(lo: number, hi: number): CSSProperties {
  const centre = (lo + hi) / 2;
  if (centre < 30) return { left: `${lo}%`, right: 0, justifyContent: "flex-start" };
  if (centre > 70) return { left: 0, right: `${100 - hi}%`, justifyContent: "flex-end" };
  const reach = Math.min(centre, 100 - centre);
  return { left: `${centre - reach}%`, right: `${100 - centre - reach}%`, justifyContent: "center" };
}

function WhatIfBar({
  value,
  status,
  finland,
  target,
  amount,
  word,
  best,
  showBestAmount,
}: {
  value: number;
  status: GapStatus;
  finland: number;
  target: number | null;
  amount: string | null;
  word: string;
  best: { name: string; value: number; amount: number } | null;
  showBestAmount: boolean;
}) {
  const lo = target === null ? null : clamp(Math.min(value, target));
  const hi = target === null ? null : clamp(Math.max(value, target));
  const bestX = best ? clamp(best.value) : null;

  return (
    <figure className="flex flex-col gap-1.5">
      {lo !== null && hi !== null && amount !== null && (
        <div aria-hidden className="relative h-8">
          <span className="absolute inset-x-0 top-0 flex whitespace-nowrap" style={labelOver(lo, hi)}>
            <span className="text-[0.8125rem] leading-5 text-muted-foreground">
              <span className="numeral text-[1.125rem] text-foreground">{amount}</span> {word} of every 100
            </span>
          </span>
          {/* The bracket: a dimension line over exactly the span the amount counts. */}
          <span
            className="absolute bottom-0 h-2 border-x border-t border-foreground/60"
            style={{ left: `${lo}%`, width: `${hi - lo}%` }}
          />
        </div>
      )}
      <div aria-hidden className="relative h-4 rounded-[2px] bg-track">
        <BarFill value={value} finland={finland} status={status} />
        <FinlandTick finland={finland} />
        {bestX !== null && (
          <span
            className="absolute -inset-y-1.5 w-0 -translate-x-1/2 border-l-2 border-dotted border-foreground/80"
            style={{ left: `${bestX}%` }}
          />
        )}
      </div>
      <div aria-hidden className="relative h-4 type-note text-muted-foreground">
        <span
          className="absolute inset-y-0 flex font-medium whitespace-nowrap text-foreground"
          style={labelOver(clamp(finland), clamp(finland))}
        >
          Finland&apos;s level
        </span>
      </div>
      {best && bestX !== null && (
        <div aria-hidden className="relative h-4 type-note text-muted-foreground">
          <span
            className="absolute inset-y-0 flex items-center gap-1.5 whitespace-nowrap"
            style={bestX < 50 ? { left: `${bestX}%`, marginLeft: -1 } : { right: `${100 - bestX}%`, marginRight: -1 }}
          >
            <span className="h-3 w-0 border-l-2 border-dotted border-foreground/80" />
            <span>
              Best: {best.name} <span className="figure text-foreground">{formatPct(best.value)}</span>
              {showBestAmount && (
                <>
                  {" "}
                  · <span className="figure text-foreground">{formatAmount(best.amount)}</span> {word}
                </>
              )}
            </span>
          </span>
        </div>
      )}
      <figcaption className="sr-only">
        {amount !== null && `${amount} ${word} of every 100. `}
        {best &&
          `At ${best.name}'s level (${formatPct(best.value)}), ${formatAmount(best.amount)} ${word} of every 100.`}
      </figcaption>
    </figure>
  );
}
