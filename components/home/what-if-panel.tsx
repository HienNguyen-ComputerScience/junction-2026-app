import { cn } from "cn";
import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { FramePanel } from "@/components/ui/frame";
import { BarFill, FinlandTick } from "@/components/ui/measure-bar";
import { STAGE_LABELS } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { formatPct } from "@/lib/ranking";
import { formatAmount, type Better, type WhatIf } from "@/lib/what-if";

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
 * The what-if for an area's bottleneck stage, drawn: the area's bar (the bar rule of
 * measure-bar.tsx, so the solid red is already the gap to Finland), a bracket over the span
 * the arithmetic counts, labelled with the amount per 100, the Finland line, and the best
 * area's level as a second, dashed mark. One sentence names what the bar counts; the caption
 * says it is arithmetic, not a forecast. Server-rendered; the home picker shows one per area.
 */
export function WhatIfPanel({
  areaName,
  bare = false,
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
  /** A row inside another panel (the home "what to do first" card) instead of a panel of its own. */
  bare?: boolean;
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
    const question =
      toFinland !== null ? (
        <>If {areaName} reached Finland&apos;s level.</>
      ) : toBest ? (
        <>
          {areaName} is at or better than Finland&apos;s level. If it reached the best area&apos;s level.
        </>
      ) : null;
    intro =
      amount !== null ? (
        <>
          <p className="type-heading text-pretty text-foreground">
            <span className="numeral text-[1.5rem] leading-none">{formatAmount(amount)}</span> {unit.word} {unit.tail}
          </p>
          {question && <p className="type-caption text-muted-foreground">{question}</p>}
        </>
      ) : (
        <p className="text-[0.9375rem] leading-relaxed text-pretty text-foreground">
          {areaName} is already at or better than Finland&apos;s level, and has the best published share of the areas
          with a figure.
        </p>
      );
    chart = (
      <>
        <WhatIfBar
          value={value}
          status={status}
          finland={finland}
          target={target}
          amount={amount === null ? null : formatAmount(amount)}
          word={unit.word}
          best={toBest}
        />
      </>
    );
  }

  const body = (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">What if: {STAGE_LABELS[stage]}</h3>
        {intro}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 type-caption text-muted-foreground">
          <span>Arithmetic on the published shares, not a forecast of any single action.</span>
          <SourceChip sourceId={sourceId} year={year} />
        </p>
      </div>
      {chart}
    </>
  );

  // The sentence and its caption on top, the bar across the full width under them, so its marks
  // have room to be labelled on one line.
  const layout = "flex flex-col gap-5 px-5 py-5 sm:px-6";
  return bare ? (
    <div className={layout}>{body}</div>
  ) : (
    <FramePanel padding="none" className={layout}>
      {body}
    </FramePanel>
  );
}

/** One label under the bar: where its mark is (0-100) and its text. */
type MarkLabel = { key: string; x: number; text: string; figure?: string; dotted?: boolean };

/** Assumed width of the bar on a desktop row, for spacing the labels without measuring them. */
const BAR_PX = 680;
/** About one character of 12px Geist, in px. */
const CHAR_PX = 6.6;

/**
 * Places the labels of the marks on one line: each centred on its mark, kept inside the bar,
 * then pushed apart left to right and pulled back from the right end, so none overlaps. Widths
 * are estimated from the text length against BAR_PX; returns each label's left edge in %.
 */
function placeOnOneLine(labels: { x: number; chars: number }[]): number[] {
  const gap = (12 / BAR_PX) * 100;
  const items = labels
    .map((label, index) => {
      const w = ((label.chars * CHAR_PX + 14) / BAR_PX) * 100;
      return { index, w, left: Math.min(Math.max(label.x - w / 2, 0), 100 - w) };
    })
    .sort((a, b) => a.left + a.w / 2 - (b.left + b.w / 2));
  for (let i = 1; i < items.length; i++) {
    items[i].left = Math.max(items[i].left, items[i - 1].left + items[i - 1].w + gap);
  }
  const last = items[items.length - 1];
  if (last && last.left + last.w > 100) last.left = 100 - last.w;
  for (let i = items.length - 2; i >= 0; i--) {
    items[i].left = Math.min(items[i].left, items[i + 1].left - gap - items[i].w);
  }
  const out: number[] = [];
  for (const item of items) out[item.index] = Math.max(0, item.left);
  return out;
}

function WhatIfBar({
  value,
  status,
  finland,
  target,
  amount,
  word,
  best,
}: {
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
  const bestX = best ? clamp(best.value) : null;
  const valueX = clamp(value);

  const marks: MarkLabel[] = [
    { key: "now", x: valueX, text: "Now" },
    { key: "finland", x: clamp(finland), text: "Finland", figure: formatPct(finland) },
    ...(best && bestX !== null
      ? [{ key: "best", x: bestX, text: `Best: ${best.name}`, figure: formatPct(best.value), dotted: true }]
      : []),
  ];
  const lefts = placeOnOneLine(
    marks.map((mark) => ({ x: mark.x, chars: mark.text.length + (mark.figure ? mark.figure.length + 1 : 0) + (mark.dotted ? 2 : 0) })),
  );

  return (
    <figure className="flex flex-col gap-1">
      <div aria-hidden className="relative mt-2 h-4 rounded-[2px] bg-track">
        {/* The bracket: a dimension line over exactly the span the amount counts. */}
        {lo !== null && hi !== null && amount !== null && (
          <span
            className="absolute -top-2 h-1.5 border-x border-t border-foreground/60"
            style={{ left: `${lo}%`, width: `${hi - lo}%` }}
          />
        )}
        <BarFill value={value} finland={finland} status={status} />
        <FinlandTick finland={finland} />
        {bestX !== null && (
          <span
            className="absolute -inset-y-1.5 w-0 -translate-x-1/2 border-l-2 border-dotted border-foreground/80"
            style={{ left: `${bestX}%` }}
          />
        )}
      </div>
      {/* Desktop: every mark is named under the bar, on one baseline, each with a short tick up
          to its mark. */}
      <div aria-hidden className="relative h-8 type-note text-muted-foreground max-sm:hidden">
        {marks.map((mark) => (
          <span key={mark.key} className="absolute top-0 h-2 w-px bg-foreground/50" style={{ left: `${mark.x}%` }} />
        ))}
        {marks.map((mark, i) => (
          <span
            key={mark.key}
            className={cn(
              "absolute top-3 flex items-baseline gap-1 whitespace-nowrap",
              mark.key === "finland" && "font-medium",
            )}
            style={{ left: `${lefts[i]}%` }}
          >
            {mark.dotted && <span className="h-2.5 w-0 self-center border-l-2 border-dotted border-foreground/80" />}
            <span>{mark.text}</span>
            {mark.figure && <span className="figure text-foreground">{mark.figure}</span>}
          </span>
        ))}
      </div>
      {/* Phone: the bar is too short for one line; the labels stack under it. */}
      <div aria-hidden className="flex flex-col gap-1 pt-1 type-note text-muted-foreground sm:hidden">
        {marks.map((mark) => (
          <span key={mark.key} className="flex items-center gap-1.5">
            {mark.dotted && <span className="h-3 w-0 border-l-2 border-dotted border-foreground/80" />}
            <span>{mark.text}</span>
            {mark.figure && <span className="figure text-foreground">{mark.figure}</span>}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {amount !== null && `${amount} ${word} of every 100. `}
        {best &&
          `At ${best.name}'s level (${formatPct(best.value)}), ${formatAmount(best.amount)} ${word} of every 100.`}
      </figcaption>
    </figure>
  );
}
