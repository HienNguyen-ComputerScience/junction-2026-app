import { FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";

import { CompareTable } from "@/components/compare/compare-table";
import { EarlyWarning } from "@/components/home/early-warning";
import { Disclosure, PrintButton, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { StatUnit } from "@/components/stat/stat-unit";
import { buttonVariants } from "@/components/ui/button";
import { FramePanel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { FIRST_YEAR, getCompareLead, getCompareRows, LATEST_YEAR } from "@/lib/compare";
import { counties } from "@/lib/data";
import { getIndicator, GP_WAIT_ID } from "@/lib/ranking";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

const pct = (value: number) => `${value.toFixed(1)}%`;

/**
 * Every area side by side. Four lead figures first, each a small unit with its meaning, its
 * limitation and its source; then the full table, sortable and downloadable; then the areas
 * getting worse fastest.
 */
export default function ComparePage() {
  const rows = getCompareRows();
  const lead = getCompareLead(rows);
  const gpIndicator = getIndicator(GP_WAIT_ID);
  const chip = { sourceId: lead.gpSourceId, year: LATEST_YEAR };

  return (
    <main className="page-container print-wide flex max-w-[1200px] flex-col gap-16 pt-6 sm:gap-20 sm:pt-8 print:gap-8 print:pt-0">
      <header className="flex flex-col items-start gap-4">
        <p className="type-eyebrow">All {lead.total} areas</p>
        <h1 className="type-display">Compare the areas</h1>
        <p className="type-lede max-w-[62ch] text-muted-foreground">
          How long non-urgent GP visits wait in each area, how fast referrals to specialist care are handled, and which way each
          area is heading since {FIRST_YEAR}. Every figure is published by THL on Sotkanet.
        </p>
        <div data-print="hide" className="flex flex-wrap gap-2.5 pt-1">
          <PrintButton />
          <a href="/compare/export" download className={buttonVariants({ variant: "outline" })}>
            <FileSpreadsheet aria-hidden strokeWidth={1.75} data-icon="inline-start" />
            Download the table for Excel
          </a>
        </div>
      </header>

      <section aria-labelledby="lead-heading" className="flex flex-col gap-5">
        <h2 id="lead-heading" className="sr-only">
          The picture in four figures
        </h2>
        <div className="grid gap-3 md:grid-cols-2 print:grid-cols-4">
          <StatUnit
            eyebrow="Finland's level"
            value={lead.finlandGp}
            final={pct(lead.finlandGp)}
            suffix="%"
            sources={[chip]}
            limitation="Counts visits, not people, and every non-urgent GP visit, not only those where cancer is possible."
            detail={gpIndicator?.limitation}
            detailLabel="what this figure counts"
          >
            <p>
              of non-urgent GP visits in Finland waited more than 7 days in {LATEST_YEAR}. Every area is compared with this line,
              and the line itself is a delay.
            </p>
          </StatUnit>
          <StatUnit
            eyebrow="Worse than Finland"
            value={lead.worse}
            decimals={0}
            final={String(lead.worse)}
            unit={`of ${lead.total} areas`}
            tone="alarm"
            status={{ status: "red", label: "Worse than Finland's level" }}
            sources={[chip]}
            index={1}
          >
            <p>have a larger share of non-urgent GP visits waiting more than 7 days than Finland as a whole.</p>
          </StatUnit>
          <StatUnit
            eyebrow="The gap between areas"
            value={lead.spread}
            final={lead.spread.toFixed(1)}
            unit="points"
            sources={[chip]}
            index={2}
          >
            <p>
              between the longest wait, {lead.longest.name} ({pct(lead.longest.gp)}), and the shortest, {lead.shortest.name} (
              {pct(lead.shortest.gp)}). Where you live decides how long a visit waits.
            </p>
          </StatUnit>
          <StatUnit
            eyebrow={`Worse than in ${FIRST_YEAR}`}
            value={lead.rising}
            decimals={0}
            final={String(lead.rising)}
            unit={`of ${lead.withTrend} areas`}
            sources={[{ sourceId: lead.gpSourceId }]}
            limitation={
              lead.risingWithRecordingChange > 0
                ? `In ${lead.risingWithRecordingChange} of them the number of recorded visits changed by more than 20%, so part of the rise may be how visits are recorded.`
                : undefined
            }
            index={3}
          >
            <p>
              have a share of visits waiting at least 1 point higher than in {FIRST_YEAR}. Changes under 1 point count as
              about the same.
              {lead.fastest ? (
                <>
                  {" "}
                  Largest rise: {lead.fastest.name}, {lead.fastest.gpChange?.toFixed(1)} points (from {pct(lead.fastest.gpFirst ?? 0)} to{" "}
                  {pct(lead.fastest.gp)}).
                </>
              ) : null}
            </p>
          </StatUnit>
        </div>
      </section>

      <section aria-labelledby="table-heading" className="flex flex-col gap-5 print:break-before-page print:gap-2">
        <Reveal className="flex flex-col gap-2">
          <p className="type-eyebrow">The full table</p>
          <h2 id="table-heading" className="type-title">
            Every area, side by side
          </h2>
          <p data-print="hide" className="max-w-[68ch] text-base text-muted-foreground">
            Ranked by the share of non-urgent GP visits waiting more than 7 days. Choose another order from the list or press a
            column heading. Press an area&apos;s name for its full pathway.
          </p>
        </Reveal>
        <div className="flex flex-col gap-3 print:hidden">
          <BarKey items={["finland", "red", "amber"]} />
          <Disclosure label="what the referral labels mean" tone="quiet">
            <p className="max-w-[68ch] text-base">
              <span className="font-semibold">HUS-wide:</span> Central, East and West Uusimaa and Vantaa and Kerava send their
              referrals to HUS (the Helsinki University Hospital group), which publishes one figure for all of them. It is shown
              for context and is not the area&apos;s own figure. <span className="font-semibold">City units only:</span> the
              Helsinki figure covers the city&apos;s own specialist units; most Helsinki referrals go to HUS.
            </p>
          </Disclosure>
        </div>
        <FramePanel padding="none" className="print-bare p-5 sm:p-7">
          <CompareTable rows={rows} finland={lead.finlandGp} finlandReferral={lead.finlandReferral} />
        </FramePanel>
        <p className="hidden text-[8.5pt] text-muted-foreground print:block">
          HUS-wide: Central, East and West Uusimaa and Vantaa and Kerava have no referral figure of their own; HUS (the Helsinki
          University Hospital group) publishes one value for all four, shown in brackets. City units only: the Helsinki figure
          covers the city&apos;s own units; most Helsinki referrals go to HUS. Changes under 1 point read &ldquo;About the
          same&rdquo;. Where recorded visits changed by more than 20%, part of a change may be how visits are recorded.
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground print:text-[8.5pt]">
          Sources: <SourceChip sourceId={lead.gpSourceId} year={LATEST_YEAR} /> GP waits,{" "}
          <SourceChip sourceId={lead.referralSourceId} year={LATEST_YEAR} /> referrals.
        </p>
      </section>

      {/* Not on paper: the printed table already carries every area's change since 2023. */}
      <section aria-labelledby="worsening-heading" className="flex flex-col gap-5 print:hidden">
        <Reveal className="flex flex-col gap-2">
          <p className="type-eyebrow">Early warning</p>
          <h2 id="worsening-heading" className="type-title scroll-mt-20">
            Getting worse fastest
          </h2>
          <p className="max-w-[68ch] text-base text-muted-foreground">
            The five areas where the share of visits waiting more than 7 days rose the most since {FIRST_YEAR}, whatever their level
            today.
          </p>
        </Reveal>
        <EarlyWarning areas={counties} sourceId={lead.gpSourceId} />
      </section>
    </main>
  );
}
