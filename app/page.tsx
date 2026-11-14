import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";
import { gapToFinland, RankingList } from "@/components/ranking/ranking-list";
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
import { BarKey, MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
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
    <main className="page-container flex flex-col gap-6 pt-2 sm:gap-8 sm:pt-6">
      {/* Hero: the single message. It leads by size and by its figures, on the same dark page as
          everything else. The two columns share a top edge: the eyebrow starts where the card
          does. Kept short, so the first ranking row is in the first desktop viewport. */}
      <section
        aria-labelledby="home-title"
        className="grid gap-3 sm:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-12"
      >
        <div className="flex flex-col">
          <p className="flex items-center gap-2.5 text-sm leading-6 font-medium text-foreground sm:text-[0.9375rem]">
            <span aria-hidden className="h-4 w-0.5 shrink-0 bg-foreground" />
            First step to early cancer care: getting to a GP
          </p>
          <h1
            id="home-title"
            className="mt-2 type-display max-w-[19ch] text-[1.75rem] text-foreground sm:mt-3 sm:text-[2.75rem] lg:text-[3.25rem]"
          >
            In Finland, where you live decides how fast you get to see a GP
          </h1>
          {/* Running text: the figures stay in the text face here, bolded. */}
          <p className="mt-3 max-w-[35rem] text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground sm:mt-4 sm:type-lede">
            <strong className="font-semibold text-foreground">{formatPct(worst.gpWait.value)}</strong> of
            non-urgent GP visits in {worst.county.name} come more than a week after the need for
            care was assessed. In {best.county.name} it is{" "}
            <strong className="font-semibold text-foreground">{formatPct(best.gpWait.value)}</strong>.
            That is a{" "}
            <strong className="font-semibold text-foreground">{gap.toFixed(1)} percentage point</strong>{" "}
            gap, {ratio.toFixed(1)} times the share, within one country.
          </p>
          {/* The source line sits with the paragraph's figures from sm up. On a phone it moves
              under the comparison card, whose own source chip is on the same screen as the lede. */}
          <p className="mt-2 max-w-[35rem] type-caption text-pretty text-muted-foreground max-sm:hidden sm:mt-3 sm:border-t sm:border-border sm:pt-3">
            Sotkanet indicator {GP_WAIT_ID}, {LATEST_YEAR}. Not specific to cancer: it covers
            all non-urgent GP visits.
          </p>
          {/* In-page anchor, not a route change. Phones have the list right under the card. */}
          <a
            href="#ranking"
            className="mt-3 flex h-6 w-fit items-center gap-1.5 rounded-sm type-caption font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:hidden"
          >
            See all {rows.length + unranked.length} areas
            <ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />
          </a>
        </div>

        <Frame as="div">
          <FramePanel padding="none">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 sm:px-5">
              <h2 className="font-sans type-caption font-medium tracking-normal text-foreground">
                Non-urgent GP visits waiting over 7 days
              </h2>
              <span className="flex max-sm:hidden">
                <SourceChip sourceId={worst.gpWait.source_id} year={LATEST_YEAR} />
              </span>
            </div>
            <ul className="flex flex-col gap-3 px-4 pt-3 pb-3 sm:gap-5 sm:px-5 sm:pt-5 sm:pb-4">
              <CompareRow
                name={worst.county.name}
                value={worst.gpWait.value}
                status={worst.gpStatus}
                finland={nationalGpWait.value}
                index={0}
                emphasis
                chip={<SourceChip sourceId={worst.gpWait.source_id} year={LATEST_YEAR} />}
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
                axisLabel={`Finland ${formatPct(nationalGpWait.value)}`}
              />
            </ul>
          </FramePanel>
        </Frame>
        <p className="type-caption text-pretty text-muted-foreground sm:hidden">
          Sotkanet indicator {GP_WAIT_ID}, {LATEST_YEAR}. Not specific to cancer: it covers all
          non-urgent GP visits.
        </p>
      </section>

      <Frame id="ranking" aria-labelledby="ranking-heading" className="scroll-mt-4">
        <FrameHeader>
          <FrameTitle id="ranking-heading" className="type-title">
            All {rows.length + unranked.length} areas, longest GP waits first
          </FrameTitle>
          <FrameMeta className="hidden sm:flex">
            <StatusBadge status="red" className="tabular-nums">
              {redCount} of {rows.length + unranked.length} worse than Finland
            </StatusBadge>
          </FrameMeta>
          {/* Phones skip this line so the first rows start high; its content is in the note
              under the list, and every row carries a chevron. */}
          <FrameDescription className="max-w-none max-sm:hidden">
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
        <FrameFooter className="flex flex-col gap-3 pt-4 pb-3">
          <BarKey kinds="wait" finlandLabel={`Finland ${formatPct(nationalGpWait.value)}`} />
          <p className="max-w-[52rem] type-caption text-pretty">
            <span className="sm:hidden">
              The 22 areas are the 21 wellbeing services counties and the City of Helsinki.{" "}
            </span>
            The solid red part of a bar is the share beyond Finland&apos;s line. Waits are counted
            from the day the need for care was assessed, for GP (physician) visits in primary
            care. Bars start at 0%; change is in percentage points since {FIRST_YEAR}.
            <span className="lg:hidden">
              {" "}
              Referrals: the share processed within 3 days (Sotkanet {REFERRAL_ID}). Higher is
              faster; Finland {formatPct(nationalReferral.value)}.
            </span>
          </p>
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

      <NationalNews />
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
  axisLabel,
  chip,
}: {
  name: string;
  value: number;
  /** null for the Finland reference row. */
  status: GapStatus | null;
  finland: number;
  index: number;
  emphasis?: boolean;
  /** Set on the last row: labels the Finland line on the axis under the bars. */
  axisLabel?: string;
  /** Phones only: the card's source chip, on one wrapping row with the status badge. */
  chip?: ReactNode;
}) {
  // From sm: the name and the badge stack on the left, the figure stands at their right.
  // Phone: the name and the figure share a line, then the badge (and the chip) on one row.
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 sm:grid-rows-[1fr_auto]">
      <span className="col-start-1 row-start-1 min-w-0 text-[0.9375rem] leading-snug font-semibold">
        {name}
      </span>
      <div className="col-span-2 col-start-1 row-start-2 mt-1.5 flex min-w-0 flex-wrap items-center gap-2 sm:col-span-1">
        {status ? (
          <StatusBadge status={status} size="xs">
            {STATUS_LABEL[status]}
          </StatusBadge>
        ) : (
          <span className="flex h-5 items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <span aria-hidden className="h-3 w-0.5 bg-foreground" />
            Reference line on each bar
          </span>
        )}
        {chip && <span className="flex sm:hidden">{chip}</span>}
      </div>
      {/* Only "worse than Finland" colours the figure; the calm rows stay in the text colour. */}
      <span
        className={`numeral col-start-2 row-start-1 text-right sm:row-span-2 ${emphasis ? "text-[2.5rem] sm:text-[3.5rem]" : "text-[1.75rem] sm:text-[2.25rem]"} ${status ? STATUS_FIGURE[status] : "text-foreground"}`}
      >
        {formatPct(value)}
      </span>
      <MeasureBar
        value={value}
        finland={finland}
        finlandLabel={axisLabel}
        status={status}
        index={index * 6}
        size="lg"
        gapLabel={status ? gapToFinland(value, finland) : undefined}
        className="col-span-2 mt-2.5 sm:mt-3"
      />
    </li>
  );
}
