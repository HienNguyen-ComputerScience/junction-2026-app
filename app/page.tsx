import type { CSSProperties } from "react";

import { AskBox } from "@/components/exa/ask-box";
import { RankingList } from "@/components/ranking/ranking-list";
import { SourceChip } from "@/components/source-chip";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FrameMeta,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { STATUS_FILL, StatusBadge } from "@/components/ui/status-badge";
import { LATEST_YEAR, type GapStatus } from "@/lib/data";
import {
  FIRST_YEAR,
  formatPct,
  getNationalValue,
  getRanking,
  getUnrankedCounties,
  GP_WAIT_ID,
  REFERRAL_ID,
  STATUS_LABEL,
} from "@/lib/ranking";

export default function CountyRankingPage() {
  const rows = getRanking();
  const unranked = getUnrankedCounties();
  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  const nationalReferral = getNationalValue(REFERRAL_ID);
  const worst = rows[0];
  const best = rows[rows.length - 1];

  if (!nationalGpWait || !nationalReferral || !worst || !best) {
    throw new Error("Snapshot is missing the national or county values for the ranking.");
  }

  const gap = worst.gpWait.value - best.gpWait.value;
  const ratio = worst.gpWait.value / best.gpWait.value;
  const redCount = rows.filter((row) => row.gpStatus === "red").length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 pt-4 sm:gap-8 sm:px-6 sm:pt-8">
      {/* Hero: the single message, on the one dark surface of the page. */}
      <Frame tone="inverse" aria-labelledby="home-title" className="p-1.5 sm:p-2">
        <div className="grid gap-6 px-3.5 pt-5 pb-2 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-2 type-caption font-medium text-brand-ink">
              <span aria-hidden className="hidden h-px w-6 bg-brand-ink/60 sm:block" />
              The first step towards early cancer care: getting in to see a GP
            </p>
            <h1 id="home-title" className="type-display max-w-[14ch] text-foreground">
              In Finland, where you live decides how fast you get to see a GP.
            </h1>
            <p className="max-w-[36rem] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground sm:type-lede">
              <strong className="font-semibold text-foreground">{formatPct(worst.gpWait.value)}</strong> of
              non-urgent GP visits in {worst.county.name} come more than a week after the need for
              care was assessed. In {best.county.name} it is{" "}
              <strong className="font-semibold text-foreground">{formatPct(best.gpWait.value)}</strong>.
              That is a{" "}
              <strong className="font-semibold text-foreground">{gap.toFixed(1)} percentage point</strong>{" "}
              gap, {ratio.toFixed(1)} times the share, within one country.
            </p>
          </div>

          <FramePanel padding="none" className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <h2 className="type-micro font-medium text-muted-foreground">
                Non-urgent GP visits waiting over 7 days, {LATEST_YEAR}
              </h2>
              <SourceChip sourceId={worst.gpWait.source_id} year={LATEST_YEAR} />
            </div>
            <ul className="flex flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6">
              <CompareRow
                name={worst.county.name}
                value={worst.gpWait.value}
                status={worst.gpStatus}
                finland={nationalGpWait.value}
                index={0}
                emphasis
              />
              <CompareRow
                name="Finland overall"
                value={nationalGpWait.value}
                status={null}
                finland={nationalGpWait.value}
                index={1}
              />
              <CompareRow
                name={best.county.name}
                value={best.gpWait.value}
                status={best.gpStatus}
                finland={nationalGpWait.value}
                index={2}
              />
            </ul>
            <p className="border-t border-border px-4 py-3 type-micro text-muted-foreground sm:px-5">
              Sotkanet indicator {GP_WAIT_ID}, {LATEST_YEAR}. Not cancer-specific: it covers all
              non-urgent GP visits.
            </p>
          </FramePanel>
        </div>
      </Frame>

      <Frame aria-labelledby="ranking-heading">
        <FrameHeader>
          <FrameTitle id="ranking-heading" className="type-title">
            All {rows.length + unranked.length} areas, longest GP waits first
          </FrameTitle>
          <FrameMeta className="hidden sm:flex">
            <StatusBadge status="red" className="tabular-nums">
              {redCount} of {rows.length + unranked.length} worse than Finland
            </StatusBadge>
          </FrameMeta>
          <FrameDescription>
            21 wellbeing services counties and the City of Helsinki. Pick an area to see where its
            delay sits: getting to a GP, or getting from the GP to a specialist.
          </FrameDescription>
        </FrameHeader>
        <FramePanel padding="none">
          <RankingList
            rows={rows}
            unranked={unranked}
            nationalGpWait={nationalGpWait.value}
            nationalReferral={nationalReferral.value}
            gpWaitSourceId={nationalGpWait.source_id}
            referralSourceId={nationalReferral.source_id}
          />
        </FramePanel>
        <FrameFooter className="max-w-4xl">
          All values: Sotkanet, {LATEST_YEAR}, see chips above. Bars: share of non-urgent GP
          (physician) visits in primary care that came more than 7 days after the need for care was
          assessed (Sotkanet {GP_WAIT_ID}). Red: worse than Finland. Amber: at or better than
          Finland&apos;s level, which is still a delay. Arrows: change in percentage points since{" "}
          {FIRST_YEAR}. Referral column: Sotkanet {REFERRAL_ID}, higher is faster; Finland{" "}
          {formatPct(nationalReferral.value)}.
        </FrameFooter>
      </Frame>

      <Frame id="ask" aria-labelledby="ask-heading" className="scroll-mt-4">
        <FrameHeader>
          <FrameTitle id="ask-heading" className="type-title">
            Ask the evidence, answered live from Exa search results
          </FrameTitle>
        </FrameHeader>
        <AskBox />
      </Frame>
    </main>
  );
}

function CompareRow({
  name,
  value,
  status,
  finland,
  index,
  emphasis = false,
}: {
  name: string;
  value: number;
  /** null for the Finland reference row. */
  status: GapStatus | null;
  finland: number;
  index: number;
  emphasis?: boolean;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2.5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[0.9375rem] leading-snug font-semibold">{name}</span>
        {status ? (
          <StatusBadge status={status} size="xs">
            {STATUS_LABEL[status]}
          </StatusBadge>
        ) : (
          <span className="flex h-5 items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <span aria-hidden className="h-3 w-0.5 rounded-full bg-foreground" />
            Reference line on each bar
          </span>
        )}
      </div>
      <span
        className={`numeral text-right ${emphasis ? "text-[2.75rem] sm:text-[3.75rem]" : "text-[2rem] sm:text-[2.5rem]"} ${status === "red" ? "text-status-red-ink" : status === "amber" ? "text-status-amber-ink" : "text-foreground"}`}
      >
        {formatPct(value)}
      </span>
      <div aria-hidden className="relative col-span-2 h-2.5 rounded-full bg-white/8">
        <div
          className={`animate-bar-grow h-full rounded-full ${status ? STATUS_FILL[status] : "bg-foreground/85"}`}
          style={{ width: `${value}%`, "--i": index * 6 } as CSSProperties}
        />
        <span
          className="absolute -inset-y-1.5 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${finland}%` }}
        />
      </div>
    </li>
  );
}
