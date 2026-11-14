import { ArrowDown, FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";

import { CompareTable } from "@/components/compare/compare-table";
import { EarlyWarning } from "@/components/home/early-warning";
import { CompareBars } from "@/components/compare/compare-story";
import { StoryFact } from "@/components/compare/story-fact";
import { AnimatedNumber, Chunk, ChunkFigure, Disclosure, MoreCard, PrintButton, Reveal, ScrollStory } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { buttonVariants } from "@/components/ui/button";
import { FramePanel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { FIRST_YEAR, getCompareLead, getCompareRows, LATEST_YEAR } from "@/lib/compare";
import { counties } from "@/lib/data";
import { getIndicator, GP_WAIT_ID } from "@/lib/ranking";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

const pct = (value: number) => `${value.toFixed(1)}%`;

/**
 * Every area side by side, told on scroll: how many areas are worse than Finland (the headline),
 * then a ScrollStory over the 22 bars (the longest wait, the shortest, the largest rise), then the
 * full table, sortable and downloadable, open at the end.
 */
export default function ComparePage() {
  const rows = getCompareRows();
  const lead = getCompareLead(rows);
  const gpIndicator = getIndicator(GP_WAIT_ID);
  const chip = <SourceChip sourceId={lead.gpSourceId} year={LATEST_YEAR} />;

  return (
    <main className="page-container print-wide flex max-w-[1200px] flex-col pt-6 sm:pt-8 print:pt-0">
      <Chunk
        lead
        as="h1"
        eyebrow={`Compare all ${lead.total} areas, ${LATEST_YEAR}`}
        statement="Most areas wait longer than Finland"
        figure={
          <ChunkFigure tone="alarm" unit={`of ${lead.total} areas are worse than Finland's level`}>
            <AnimatedNumber value={lead.worse} decimals={0} final={String(lead.worse)} level="loud" />
          </ChunkFigure>
        }
        meaning={
          <>
            Finland&apos;s level: <span className="figure font-semibold">{pct(lead.finlandGp)}</span> of non-urgent GP visits waited
            more than 7 days. That level is itself a delay.
          </>
        }
        source={chip}
        caveat={{ short: "counts visits, not people, and every non-urgent GP visit, not only possible cancer", why: gpIndicator?.limitation }}
      >
        <div data-print="hide" className="flex flex-wrap gap-2.5 pt-2">
          <a href="#table-heading" className={buttonVariants({ size: "lg" })}>
            Go to the full table
            <ArrowDown aria-hidden data-icon="inline-end" />
          </a>
          <a href="/compare/export" download className={buttonVariants({ variant: "outline", size: "lg" })}>
            <FileSpreadsheet aria-hidden strokeWidth={1.75} data-icon="inline-start" />
            Download the table for Excel
          </a>
          <PrintButton size="lg" />
        </div>
      </Chunk>

      <section aria-labelledby="spread-heading" className="flex flex-col gap-8 py-16 sm:py-24 print:break-before-page print:py-0">
        <Reveal className="motion-loud">
          <h2 id="spread-heading" className="max-w-[24ch] font-display text-[2rem] leading-[1.15] font-light text-forest-ink sm:text-[2.75rem]">
            Where you live decides how long a visit waits
          </h2>
        </Reveal>
        <ScrollStory
          label="All areas by the share of GP visits waiting more than 7 days"
          picture={
            <CompareBars
              rows={rows}
              finland={lead.finlandGp}
              focus={[lead.longest.id, lead.shortest.id, lead.fastest?.id ?? null]}
              firstYear={FIRST_YEAR}
            />
          }
          steps={[
            <StoryFact
              key="longest"
              eyebrow="The longest wait"
              statement={lead.longest.name}
              value={lead.longest.gp}
              final={pct(lead.longest.gp)}
              tone="alarm"
              meaning="of non-urgent GP visits waited more than 7 days."
              source={chip}
            />,
            <StoryFact
              key="shortest"
              eyebrow="The shortest wait"
              statement={lead.shortest.name}
              value={lead.shortest.gp}
              final={pct(lead.shortest.gp)}
              meaning={`waited more than 7 days: ${lead.spread.toFixed(1)} points less than ${lead.longest.name}.`}
              source={chip}
            />,
            lead.fastest ? (
              <StoryFact
                key="rising"
                eyebrow={`Worse than in ${FIRST_YEAR}: ${lead.rising} of ${lead.withTrend} areas`}
                statement={`${lead.fastest.name} rose the most`}
                value={lead.fastest.gpChange ?? 0}
                final={`+${(lead.fastest.gpChange ?? 0).toFixed(1)}`}
                unit="points"
                tone="alarm"
                meaning={`From ${pct(lead.fastest.gpFirst ?? 0)} in ${FIRST_YEAR} to ${pct(lead.fastest.gp)} in ${LATEST_YEAR}. Rises under 1 point count as about the same.`}
                source={<SourceChip sourceId={lead.gpSourceId} />}
                caveat={
                  lead.risingWithRecordingChange > 0
                    ? `in ${lead.risingWithRecordingChange} of the ${lead.rising} areas, recorded visits changed by more than 20%`
                    : undefined
                }
                why="The share is of the visits recorded with waiting-time data. Where that number moved a lot, part of a change in the share may be how visits are recorded, not how long they waited."
              />
            ) : (
              <StoryFact
                key="rising"
                eyebrow={`Worse than in ${FIRST_YEAR}`}
                statement={`${lead.rising} of ${lead.withTrend} areas`}
                meaning="rose by at least 1 point."
                source={chip}
              />
            ),
          ]}
        />
      </section>

      <section aria-labelledby="table-heading" className="flex flex-col gap-5 pb-16 sm:pb-24 print:break-before-page print:gap-2 print:pb-0">
        <Reveal className="motion-loud flex flex-col gap-2">
          <p className="type-eyebrow">The full table</p>
          <h2 id="table-heading" className="scroll-mt-24 font-display text-[2rem] leading-[1.15] font-light text-forest-ink sm:text-[2.75rem]">
            Every area, side by side
          </h2>
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

      <MoreCard
        title="More on all areas"
        className="mb-8"
        rows={[
          {
            key: "worsening",
            label: `The five areas getting worse fastest since ${FIRST_YEAR}`,
            children: (
              <Disclosure show="Show the five areas" hide="Hide the five areas">
                <EarlyWarning areas={counties} sourceId={lead.gpSourceId} />
              </Disclosure>
            ),
          },
        ]}
      />
    </main>
  );
}
