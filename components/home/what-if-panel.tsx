import type { CSSProperties, ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { STATUS_INK } from "@/components/ui/status-badge";
import { STAGE_LABELS, getBottleneck } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { bestForStage, betterFor } from "@/lib/main-reason";
import { formatPct } from "@/lib/ranking";
import { formatAmount, whatIf, type Better, type WhatIf } from "@/lib/what-if";

/** Which word an improvement takes, and the headline's tail: what the 100 are and what happens to them. */
const UNIT: Record<Better, { word: string; tail: string }> = {
  lower: { word: "fewer", tail: "of every 100 visits would wait over 7 days" },
  higher: { word: "more", tail: "of every 100 referrals would be processed within 3 days" },
};

const STAGE_IN_SENTENCE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * The what-if for an area's bottleneck step, computed from the snapshot: the one call the act
 * page makes. Nothing is drawn for an area with no step in focus.
 */
export function WhatIfForArea({ countyId, areaName }: { countyId: string; areaName: string }) {
  const gap = getBottleneck(countyId).focus[0];
  if (!gap) return null;
  const better = betterFor(gap.indicator_id);
  return (
    <WhatIfPanel
      areaName={areaName}
      stage={gap.stage}
      better={better}
      value={gap.value}
      status={gap.status}
      finland={gap.national_value}
      sourceId={gap.source_id}
      year={gap.year}
      result={whatIf({
        areaId: countyId,
        value: gap.value,
        finland: gap.national_value,
        better,
        best: bestForStage(gap.stage),
      })}
    />
  );
}

/**
 * The what-if for an area's bottleneck stage, drawn: the area's bar (the bar rule of
 * measure-bar.tsx, so the solid red is already the gap to Finland), the Finland and best-area
 * ticks labelled above it, the area's own value at the end of its segment and the gap labelled
 * under it. One headline says what the bar counts; the caption says it is arithmetic, not a
 * forecast. Server-rendered.
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
    intro =
      amount !== null ? (
        <>
          <p className="type-heading text-pretty text-foreground">
            <span className="numeral text-[1.5rem] leading-none">{formatAmount(amount)}</span> {unit.word} {unit.tail}
          </p>
          {toFinland === null && toBest && (
            <p className="type-caption text-muted-foreground">
              Already at or better than Finland&apos;s level: the span is to the best area&apos;s level.
            </p>
          )}
        </>
      ) : (
        <p className="text-[0.9375rem] leading-relaxed text-pretty text-foreground">
          {areaName} is already at or better than Finland&apos;s level, and has the best published share of the areas
          with a figure.
        </p>
      );
    chart = (
      <WhatIfBar
        areaName={areaName}
        value={value}
        status={status}
        finland={finland}
        target={target}
        amount={amount === null ? null : formatAmount(amount)}
        word={unit.word}
        best={toBest}
      />
    );
  }

  return (
    // Wide: the heading and the headline on the left, the bar on the right; the one-line caption
    // and the source under both.
    <FramePanel
      padding="none"
      className="grid gap-x-10 gap-y-4 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">What if: {STAGE_LABELS[stage]}</h3>
        {intro}
      </div>
      {chart}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 type-caption text-muted-foreground md:col-span-2">
        <span>Arithmetic on the published shares, not a forecast of any single action.</span>
        <SourceChip sourceId={sourceId} year={year} />
      </p>
    </FramePanel>
  );
}

/**
 * Where a label over a span of the bar sits, without measuring it: centred on the span when the
 * span is in the middle of the track (the box reaches the nearer end), otherwise starting at the
 * span's left end or ending at its right end, so it never runs past the bar.
 */
function labelOver(lo: number, hi: number): CSSProperties {
  const centre = (lo + hi) / 2;
  if (centre < 30) return { left: `${lo}%`, right: 0, justifyContent: "flex-start" };
  if (centre > 70) return { left: 0, right: `${100 - hi}%`, justifyContent: "flex-end" };
  const reach = Math.min(centre, 100 - centre);
  return { left: `${centre - reach}%`, right: `${100 - centre - reach}%`, justifyContent: "center" };
}

function WhatIfBar({
  areaName,
  value,
  status,
  finland,
  target,
  amount,
  word,
  best,
}: {
  areaName: string;
  value: number;
  status: GapStatus;
  finland: number;
  target: number | null;
  amount: string | null;
  word: string;
  best: { name: string; value: number; amount: number } | null;
}) {
  const lo = target === null ? null : clamp(Math.min(value, target));
  const hi = target === null ? null : clamp(Math.max(value, target));
  const valueX = clamp(value);

  // The two ticks share one style. The left one is labelled to its left, the right one to its
  // right, so the labels never meet. The track keeps room on the right for the last label.
  const ticks: { x: number; label: ReactNode }[] = [
    {
      x: clamp(finland),
      label: (
        <span className="whitespace-nowrap">
          Finland <span className="figure text-foreground">{formatPct(finland)}</span>
        </span>
      ),
    },
  ];
  if (best) {
    ticks.push({
      x: clamp(best.value),
      label: (
        <span className="flex flex-col leading-4 whitespace-nowrap">
          <span>
            Best <span className="figure text-foreground">{formatPct(best.value)}</span>
          </span>
          <span>{best.name}</span>
        </span>
      ),
    });
  }
  ticks.sort((a, b) => a.x - b.x);

  return (
    <figure className="flex flex-col pr-16">
      {/* Above the bar: Finland's value and the best area's. */}
      <div aria-hidden className="relative h-10 type-note text-muted-foreground">
        {ticks.map((tick, i) => (
          <span
            key={i}
            className={`absolute bottom-2 flex ${i === 0 && ticks.length > 1 ? "justify-end text-right" : ""}`}
            style={
              i === 0 && ticks.length > 1
                ? { right: `${100 - tick.x}%`, paddingRight: 6 }
                : { left: `${tick.x}%`, paddingLeft: 6 }
            }
          >
            {tick.label}
          </span>
        ))}
      </div>
      <div aria-hidden className="relative h-2 rounded-[2px] bg-track">
        <BarFill value={value} finland={finland} status={status} />
        {ticks.map((tick, i) => (
          <FinlandTick key={i} finland={tick.x} />
        ))}
      </div>
      {/* Under the bar: the gap, then the area's own value at the end of its segment. */}
      <div aria-hidden className="relative mt-1.5 h-4 type-note">
        {lo !== null && hi !== null && amount !== null && (
          <span
            className={`absolute inset-y-0 flex font-medium whitespace-nowrap ${status === "red" ? STATUS_INK.red : "text-foreground"}`}
            style={labelOver(lo, hi)}
          >
            <span className="figure">{amount}</span>&nbsp;points
          </span>
        )}
      </div>
      <div aria-hidden className="relative h-4 type-note text-muted-foreground">
        <span
          className="absolute inset-y-0 flex whitespace-nowrap"
          style={valueX >= 35 ? { right: `${100 - valueX}%` } : { left: `${valueX}%` }}
        >
          {areaName} <span className="ml-1 figure text-foreground">{formatPct(value)}</span>
        </span>
      </div>
      <figcaption className="sr-only">
        {amount !== null && `${amount} ${word} of every 100. `}
        {best &&
          `At ${best.name}'s level (${formatPct(best.value)}), ${formatAmount(best.amount)} ${word} of every 100.`}
      </figcaption>
    </figure>
  );
}
