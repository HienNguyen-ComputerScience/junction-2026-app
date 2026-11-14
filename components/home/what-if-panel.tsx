import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { STAGE_LABELS, getBottleneck } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { bestForStage, betterFor } from "@/lib/main-reason";
import { formatPct } from "@/lib/ranking";
import { formatAmount, whatIf, type Better, type WhatIf } from "@/lib/what-if";

/** Which word an improvement takes, and the headline's tail: what the 100 are and what happens to them. */
const UNIT: Record<Better, { word: string; tail: string }> = {
  lower: { word: "fewer", tail: "of every 100 non-urgent GP visits would wait over 7 days" },
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
 * measure-bar.tsx, so the solid red is already the gap to Finland) with the Finland and the
 * area's own value labelled above it. The headline states the condition ("If <area> matched
 * Finland's level: ...") and says what the bar counts; the caption says it is arithmetic, not a
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
    // otherwise to the best area's level.
    const amount = toFinland ?? toBest?.amount ?? null;
    // The headline states the condition first: whose level the area is set to.
    const condition =
      toFinland !== null
        ? `If ${areaName} matched Finland's level:`
        : `If ${areaName} matched the best area's level (${toBest?.name ?? ""}):`;
    intro =
      amount !== null ? (
        <>
          <p className="type-heading text-pretty text-foreground">
            <span className="font-normal text-muted-foreground">{condition}</span>{" "}
            <span className="numeral text-[1.5rem] leading-none">{formatAmount(amount)}</span> {unit.word} {unit.tail}
          </p>
          {toFinland === null && toBest && (
            <p className="type-caption text-muted-foreground">
              {areaName} is already at or better than Finland&apos;s level, so the span is to the best area&apos;s
              level.
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
        amount={amount === null ? null : formatAmount(amount)}
        word={unit.word}
        best={toBest}
        bestIsTarget={toFinland === null}
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
 * The bar of the what-if. Both marker labels are above the bar, each in two lines (name, then
 * value) at its own marker: the label of the left marker ends at it, the label of the right
 * marker starts at it, so the two never meet. The best area is only an unlabelled, muted tick,
 * and only when the headline says the span is to its level.
 */
function WhatIfBar({
  areaName,
  value,
  status,
  finland,
  amount,
  word,
  best,
  bestIsTarget,
}: {
  areaName: string;
  value: number;
  status: GapStatus;
  finland: number;
  amount: string | null;
  word: string;
  best: { name: string; value: number; amount: number } | null;
  bestIsTarget: boolean;
}) {
  const marks = [
    { x: clamp(finland), name: "Finland", figure: formatPct(finland) },
    { x: clamp(value), name: areaName, figure: formatPct(value) },
  ].sort((a, b) => a.x - b.x);

  return (
    <figure className="flex flex-col pr-16">
      {/* Above the bar: Finland's value and the area's own. */}
      <div aria-hidden className="relative h-10 type-note text-muted-foreground">
        {marks.map((mark, i) => (
          <span
            key={mark.name}
            className="absolute bottom-2 flex flex-col leading-4 whitespace-nowrap"
            style={
              i === 0
                ? { right: `${100 - mark.x}%`, paddingRight: 6, alignItems: "flex-end" }
                : { left: `${mark.x}%`, paddingLeft: 6, alignItems: "flex-start" }
            }
          >
            <span>{mark.name}</span>
            <span className="figure font-medium text-foreground">{mark.figure}</span>
          </span>
        ))}
      </div>
      <div aria-hidden className="relative h-2 rounded-[2px] bg-track">
        <BarFill value={value} finland={finland} status={status} />
        <FinlandTick finland={finland} />
        {best && bestIsTarget && <FinlandTick finland={best.value} className="bg-foreground/35" />}
      </div>
      <figcaption className="sr-only">
        {amount !== null && `${amount} ${word} of every 100. `}
        {best &&
          `At ${best.name}'s level (${formatPct(best.value)}), ${formatAmount(best.amount)} ${word} of every 100.`}
      </figcaption>
    </figure>
  );
}
