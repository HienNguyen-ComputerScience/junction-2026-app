import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";
import { RankingList } from "@/components/ranking/ranking-list";
import { SourceChip } from "@/components/source-chip";
import { LATEST_YEAR } from "@/lib/data";
import {
  formatPct,
  getNationalValue,
  getRanking,
  getUnrankedCounties,
  GP_WAIT_ID,
  REFERRAL_ID,
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          The first step towards early cancer care: getting in to see a GP
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          In Finland, where you live decides how fast you get to see a GP.
        </h1>
      </header>

      <section
        aria-label="Key insight"
        className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40"
      >
        <p className="text-base sm:text-lg">
          <strong>{formatPct(worst.gpWait.value)}</strong> of non-urgent GP
          visits in {worst.county.name} come more than a week after people ask.
          In {best.county.name} it is{" "}
          <strong>{formatPct(best.gpWait.value)}</strong>. That is a{" "}
          <strong>{gap.toFixed(1)} percentage point</strong> gap, {ratio.toFixed(1)}{" "}
          times the share, within one country (Finland overall:{" "}
          {formatPct(nationalGpWait.value)}).
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Sotkanet indicator {GP_WAIT_ID}, {LATEST_YEAR}. Not cancer-specific: it covers all non-urgent GP visits.</span>
          <SourceChip sourceId={worst.gpWait.source_id} year={LATEST_YEAR} />
        </div>
      </section>

      <section aria-labelledby="ranking-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="ranking-heading" className="text-xl font-semibold">
            All {rows.length + unranked.length} areas, longest GP waits first
          </h2>
          <p className="text-sm text-muted-foreground">
            21 wellbeing services counties and the City of Helsinki. Pick an
            area to see where its delay sits: getting to a GP, or getting from
            the GP to a specialist.
          </p>
        </div>
        <RankingList
          rows={rows}
          unranked={unranked}
          nationalGpWait={nationalGpWait.value}
          nationalReferral={nationalReferral.value}
          gpWaitSourceId={nationalGpWait.source_id}
          referralSourceId={nationalReferral.source_id}
        />
      </section>

      <section id="ask" aria-labelledby="ask-heading" className="flex scroll-mt-4 flex-col gap-3">
        <h2 id="ask-heading" className="text-xl font-semibold">
          Ask the evidence, answered live from Exa search results
        </h2>
        <AskBox />
      </section>

      <section aria-label="National news" className="flex flex-col gap-3">
        <NationalNews />
      </section>
    </main>
  );
}
