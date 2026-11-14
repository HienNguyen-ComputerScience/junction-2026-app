import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cn } from "cn";

import { COMPARE_FRAME, CompareChart } from "@/components/compare/compare-chart";
import { CompareTable } from "@/components/compare/compare-table";
import { EarlyWarning } from "@/components/home/early-warning";
import { AnimatedNumber, Chunk, ChunkFigure, Disclosure, Reveal } from "@/components/motion";
import { SaveShare } from "@/components/share";
import { SourceChip } from "@/components/source-chip";
import { FIRST_YEAR, getCompareLead, getCompareRows, LATEST_YEAR } from "@/lib/compare";
import { counties } from "@/lib/data";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import { getIndicator, GP_WAIT_ID } from "@/lib/ranking";
import { RECORDING_CHANGE_ABOVE } from "@/lib/recording";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

const pct = (value: number) => `${value.toFixed(1)}%`;
const RECORDING_PCT = Math.round(RECORDING_CHANGE_ABOVE * 100);

/** The headline follows the data, so a refresh never leaves it wrong. */
function howManyLonger(worse: number, total: number) {
  if (worse === 0) return "No area waits longer than Finland overall";
  if (worse === total) return "Every area waits longer than Finland overall";
  if (worse * 2 > total) return "Most areas wait longer than Finland overall";
  if (worse * 2 === total) return "Half the areas wait longer than Finland overall";
  return "Fewer than half the areas wait longer than Finland overall";
}

/** A section heading: the serif title, revealed once. */
function SectionHead({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Reveal>
      <h2 id={id} className="type-title scroll-mt-24 text-forest-ink">
        {children}
      </h2>
    </Reveal>
  );
}

/**
 * Every area side by side, as a plain document: the headline (how many areas wait longer than
 * Finland overall), the one picture (all areas as bars, with Finland overall's line), the table
 * (five columns, sortable, downloadable), and one framed line on which areas got worse since the
 * first year, with the five largest rises behind "Show …". Every caveat is one framed line, with
 * the per-area detail behind a button that opens on paper.
 */
export default function ComparePage() {
  const rows = getCompareRows();
  const lead = getCompareLead(rows);
  const gpIndicator = getIndicator(GP_WAIT_ID);
  const chip = <SourceChip sourceId={lead.gpSourceId} year={LATEST_YEAR} />;
  const marked = rows.filter((row) => row.recording !== null).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return (
    <main className={cn("page-container print-wide flex max-w-[1200px] flex-col gap-12 pt-6 pb-16 sm:pt-8 print:gap-6 print:pt-0", MOTION_LOUD_CLASS)}>
      <Chunk
        lead
        as="h1"
        className="pb-0 sm:pb-0"
        eyebrow={`Compare all ${lead.total} areas, ${LATEST_YEAR}`}
        statement={howManyLonger(lead.worse, lead.total)}
        figure={
          <ChunkFigure tone="alarm" unit={`of ${lead.total} areas have a longer wait than Finland overall`}>
            <AnimatedNumber value={lead.worse} decimals={0} final={String(lead.worse)} level="loud" />
          </ChunkFigure>
        }
        meaning={
          <>
            Finland overall: <span className="figure font-semibold">{pct(lead.finlandGp)}</span> of non-urgent GP visits waited
            more than 7 days. That level is itself a delay.
          </>
        }
        source={chip}
        caveat={{ short: "counts visits, not people, and every non-urgent GP visit, not only possible cancer", why: gpIndicator?.limitation }}
      >
        <SaveShare
          className="pt-2"
          options={[{ kind: "print" }, { kind: "excel", href: "/compare/export", hint: "The table of all areas" }]}
        />
      </Chunk>

      <section aria-labelledby="spread-heading" className="flex flex-col gap-5">
        <SectionHead id="spread-heading">Where you live decides how long a visit waits</SectionHead>
        <CompareChart
          rows={rows}
          finland={lead.finlandGp}
          year={LATEST_YEAR}
          caption={
            <>
              <p>
                Longest wait: {lead.longest.name}, <span className="figure font-semibold">{pct(lead.longest.gp)}</span>. Shortest:{" "}
                {lead.shortest.name}, <span className="figure font-semibold">{pct(lead.shortest.gp)}</span>,{" "}
                <span className="figure">{lead.spread.toFixed(1)}</span> points less.
              </p>
              {chip}
            </>
          }
        />
      </section>

      <section aria-labelledby="table-heading" className="flex flex-col gap-5 print:break-before-page print:gap-2">
        <SectionHead id="table-heading">Every area, side by side</SectionHead>
        <div className={cn(COMPARE_FRAME, "print-bare max-sm:rounded-none max-sm:border-0 max-sm:border-y max-sm:bg-transparent max-sm:px-0")}>
          <CompareTable rows={rows} finland={lead.finlandGp} finlandReferral={lead.finlandReferral} />
        </div>
        {marked.length > 0 ? (
          <div className={cn(COMPARE_FRAME, "print-keep flex flex-col gap-1")}>
            <p className="text-base text-pretty text-foreground">
              <span className="font-semibold">* Read with care:</span> in {marked.length} areas the share rose and recorded visits
              changed by more than {RECORDING_PCT}% since {FIRST_YEAR}. Part of that rise may be how visits are recorded, not how
              long they waited.
            </p>
            <Disclosure show={`Show the ${marked.length} areas`} hide="Hide the areas" tone="quiet" contentClassName="pt-2">
              <ul className="flex flex-col">
                {marked.map((row) => (
                  <li key={row.id} className="border-t border-frame-border py-2 text-base text-pretty">
                    <span className="font-semibold">{row.name}:</span> {row.recording?.toLowerCase()}
                  </li>
                ))}
              </ul>
            </Disclosure>
          </div>
        ) : null}
        <div className={cn(COMPARE_FRAME, "print-keep flex flex-col gap-1")}>
          <p className="text-base text-pretty text-foreground">
            Status compares each area with Finland overall, not with a clinical standard. The figure in brackets is points above (+)
            or below (−) Finland overall. Changes under 1 point read &ldquo;About the same&rdquo;.
          </p>
          <Disclosure label="what the referral labels mean" tone="quiet" contentClassName="pt-2">
            <div className="flex max-w-[68ch] flex-col gap-2 text-base text-pretty">
              <p>
                <span className="font-semibold">HUS-wide:</span> Central, East and West Uusimaa and Vantaa and Kerava send their
                referrals to HUS (the Helsinki University Hospital group), which publishes one figure for all four. It is shown for
                context and is not the area&apos;s own figure.
              </p>
              <p>
                <span className="font-semibold">City units only:</span> the Helsinki figure covers the city&apos;s own specialist
                units; most Helsinki referrals go to HUS.
              </p>
            </div>
          </Disclosure>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-base text-muted-foreground print:text-[8.5pt]">
          Sources: <SourceChip sourceId={lead.gpSourceId} year={LATEST_YEAR} /> GP waits,{" "}
          <SourceChip sourceId={lead.referralSourceId} year={LATEST_YEAR} /> referrals.
        </p>
      </section>

      <section aria-labelledby="worse-heading" className="flex flex-col gap-5">
        <SectionHead id="worse-heading">Worse than in {FIRST_YEAR}</SectionHead>
        <div className={cn(COMPARE_FRAME, "print-flow flex flex-col gap-1")}>
          <p className="text-base text-pretty text-foreground">
            In <span className="figure font-semibold">{lead.rising}</span> of {lead.withTrend} areas the share waiting over 7 days
            rose by at least 1 point since {FIRST_YEAR}.
            {lead.rising > 0 ? (
              <>
                {" "}
                <span className="font-semibold">Read with care:</span> in {lead.risingWithRecordingChange} of the {lead.rising},
                recorded visits changed by more than {RECORDING_PCT}%.
              </>
            ) : null}
          </p>
          {lead.fastest ? (
            <Disclosure show="Show the five largest rises" hide="Hide the largest rises" tone="quiet" contentClassName="pt-3">
              <EarlyWarning areas={counties} sourceId={lead.gpSourceId} />
            </Disclosure>
          ) : null}
        </div>
      </section>
    </main>
  );
}
