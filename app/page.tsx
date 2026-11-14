import { AskBox } from "@/components/exa/ask-box";
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
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      {/* Hero: the single message. It leads by size and by its figures, on the same dark page as
          everything else. The two columns share a top edge: the eyebrow starts where the card does. */}
      <section
        aria-labelledby="home-title"
        className="grid gap-5 pt-2 sm:gap-6 sm:pt-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-6 lg:pb-2"
      >
        <div className="flex flex-col gap-4 sm:gap-5 lg:pt-1">
            <p className="flex items-center gap-2.5 text-sm leading-6 font-medium text-foreground sm:text-[0.9375rem]">
              <span aria-hidden className="h-4 w-0.5 shrink-0 bg-foreground" />
              First step to early cancer care: getting to a GP
            </p>
            <h1 id="home-title" className="type-display max-w-[19ch] text-foreground">
              In Finland, where you live decides how fast you get to see a GP
            </h1>
            <p className="max-w-[35rem] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground sm:type-lede">
              <strong className="font-semibold text-foreground">{formatPct(worst.gpWait.value)}</strong> of
              non-urgent GP visits in {worst.county.name} come more than a week after the need for
              care was assessed. In {best.county.name} it is{" "}
              <strong className="font-semibold text-foreground">{formatPct(best.gpWait.value)}</strong>.
              That is a{" "}
              <strong className="font-semibold text-foreground">{gap.toFixed(1)} percentage point</strong>{" "}
              gap, {ratio.toFixed(1)} times the share, within one country.
            </p>
            {/* The source line sits with the paragraph's figures on every screen size. */}
            <p className="-mt-1 max-w-[35rem] type-caption text-pretty text-muted-foreground sm:mt-0 sm:border-t sm:border-border sm:pt-3">
              Sotkanet indicator {GP_WAIT_ID}, {LATEST_YEAR}. Not specific to cancer: it covers
              all non-urgent GP visits.
            </p>
        </div>

        <Frame as="div">
          <FramePanel padding="none">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <h2 className="font-sans type-caption font-medium tracking-normal text-foreground">
                Non-urgent GP visits waiting over 7 days
              </h2>
              <SourceChip sourceId={worst.gpWait.source_id} year={LATEST_YEAR} />
            </div>
            <ul className="flex flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-5 sm:pt-6 sm:pb-5">
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
                axisLabel={`Finland ${formatPct(nationalGpWait.value)}`}
              />
            </ul>
          </FramePanel>
        </Frame>
      </section>

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
        <FrameFooter className="flex flex-col gap-2.5 pt-3.5 pb-3">
          <BarKey kinds="wait" finlandLabel={`Finland ${formatPct(nationalGpWait.value)}`} />
          <p className="max-w-[76ch] type-caption text-pretty">
            <span className="sm:hidden">
              The 22 areas are the 21 wellbeing services counties and the City of Helsinki.{" "}
            </span>
            Waits are counted from the day the need for care was assessed, for GP (physician)
            visits in primary care. Bars start at 0%; change is in percentage points since{" "}
            {FIRST_YEAR}.
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
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <span className="text-[0.9375rem] leading-snug font-semibold">{name}</span>
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
      </div>
      {/* Only "worse than Finland" colours the figure; the calm rows stay in the text colour. */}
      <span
        className={`numeral text-right ${emphasis ? "text-[2.75rem] sm:text-[3.5rem]" : "text-[2rem] sm:text-[2.25rem]"} ${status ? STATUS_FIGURE[status] : "text-foreground"}`}
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
        className="col-span-2"
      />
    </li>
  );
}
