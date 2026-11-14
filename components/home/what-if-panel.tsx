import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { FramePanel, FramePanelLabel } from "@/components/ui/frame";
import { STAGE_LABELS } from "@/lib/act";
import type { Stage } from "@/lib/data";
import { formatPct } from "@/lib/ranking";
import { formatAmount, type Better, type WhatIf } from "@/lib/what-if";

/** What one share counts, per 100, and which word an improvement takes. */
const UNIT: Record<Better, { word: string; rest: string }> = {
  lower: { word: "fewer", rest: "of every 100 non-urgent GP visits would wait more than 7 days" },
  higher: { word: "more", rest: "of every 100 referrals would be processed within 3 days" },
};

const STAGE_IN_SENTENCE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

const Fig = ({ children }: { children: ReactNode }) => (
  <span className="figure font-medium text-foreground">{children}</span>
);

/**
 * The what-if for an area's bottleneck stage: plain arithmetic on the published shares, with its
 * source in the label strip. The amount at Finland's level leads as a key figure; the best
 * area's level follows in one line. Server-rendered; the home picker shows one per area.
 */
export function WhatIfPanel({
  areaName,
  stage,
  better,
  finland,
  sourceId,
  year,
  result,
}: {
  areaName: string;
  stage: Stage;
  better: Better;
  finland: number;
  sourceId: string;
  year: number;
  result: WhatIf;
}) {
  const unit = UNIT[better];
  const finlandLevel = <Fig>{formatPct(finland)}</Fig>;

  let body: ReactNode;
  if (result.kind === "no_data") {
    body = (
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        There is no published figure for {STAGE_IN_SENTENCE[stage]} in {areaName}, so there is no
        what-if here.
      </p>
    );
  } else {
    const { toFinland, toBest } = result;
    // The lead clause, the key amount and the rest of the sentence: at Finland's level when the
    // area is worse than Finland, otherwise at the best area's level.
    const lead =
      toFinland !== null ? (
        <>If {areaName} reached Finland&apos;s level ({finlandLevel}),</>
      ) : toBest ? (
        <>
          {areaName} is already at or better than Finland&apos;s level ({finlandLevel}). At{" "}
          {toBest.name}&apos;s level (<Fig>{formatPct(toBest.value)}</Fig>),
        </>
      ) : (
        <>
          {areaName} is already at or better than Finland&apos;s level ({finlandLevel}), and has the
          best published share of the areas with a figure.
        </>
      );
    const amount = toFinland ?? toBest?.amount ?? null;
    body = (
      <>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {lead}
          {amount !== null && (
            <span className="mt-1 flex items-baseline gap-x-2">
              <span className="numeral shrink-0 text-[1.5rem] leading-none text-foreground">
                {formatAmount(amount)}
              </span>
              <span>
                {unit.word} {unit.rest}.
              </span>
            </span>
          )}
        </p>
        {toFinland !== null && toBest && (
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            At {toBest.name}&apos;s level (<Fig>{formatPct(toBest.value)}</Fig>), it would be{" "}
            <Fig>{formatAmount(toBest.amount)}</Fig> {unit.word}.
          </p>
        )}
      </>
    );
  }

  return (
    <FramePanel padding="none" className="flex h-full flex-col">
      <FramePanelLabel className="sm:px-5">
        <h3 className="font-sans type-caption font-medium text-muted-foreground">
          What if: {STAGE_LABELS[stage]}
        </h3>
        <SourceChip sourceId={sourceId} year={year} />
      </FramePanelLabel>
      <div className="flex flex-1 flex-col gap-2 px-4 py-2.5 sm:px-5">
        {body}
        <p className="mt-auto pt-1 type-caption text-muted-foreground">
          Arithmetic on the published shares, not a forecast of any single action.
        </p>
      </div>
    </FramePanel>
  );
}
