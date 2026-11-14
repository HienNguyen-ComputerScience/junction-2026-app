import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Disclosure } from "@/components/ui/disclosure";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FramePanelLabel,
  FrameTitle,
} from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
import { indicators, sources, values } from "@/lib/data";
import { GP_WAIT_ID, REFERRAL_ID } from "@/lib/ranking";

export const metadata: Metadata = { title: "Sources & limitations | FirstLine" };

const evidenceSources = sources.filter((source) => source.kind === "evidence");

// Statistic sources cited by chips on the county page that are not an indicator (e.g. the HUS report, the Kuitunen study).
const otherSources = sources.filter(
  (source) =>
    source.kind === "statistic" &&
    source.source_id !== "sotkanet-regions" &&
    !indicators.some((indicator) => indicator.source_id === source.source_id),
);

/**
 * The indicators lib/ranking.ts reads to build the county ranking: 6411 sets the order, and 13 sets the
 * referral status shown beside it. Every other indicator is context only.
 */
const RANKING_IDS: string[] = [GP_WAIT_ID, REFERRAL_ID];

/** The date when every source in the list was retrieved on the same day, otherwise null (then each card shows its own). */
function sharedRetrieved(list: { retrieved: string }[]): string | null {
  const dates = new Set(list.map((source) => source.retrieved));
  return dates.size === 1 ? [...dates][0] : null;
}
const evidenceRetrieved = sharedRetrieved(evidenceSources);
const otherRetrieved = sharedRetrieved(otherSources);

const sourceRows = indicators.map((indicator) => ({
  indicator,
  source: sources.find((source) => source.source_id === indicator.source_id),
  years: [...new Set(values.filter((value) => value.indicator_id === indicator.indicator_id).map((value) => value.year))].sort(),
}));

/** The jump links under the title, in the order the sections appear on the page. */
const sections = [
  { href: "#cannot-tell", label: "What the data can't tell you" },
  { href: "#indicators", label: "Indicators" },
  { href: "#evidence", label: "Evidence for actions" },
  { href: "#other-sources", label: "Other sources" },
];

/**
 * What each gap is about, in a few words, with its full sentence unchanged under it.
 */
const gaps: { title: string; text: string }[] = [
  {
    title: "No indicator follows a person's whole journey",
    text: "No indicator here follows a person from first symptoms through GP assessment, cancer diagnosis and specialist treatment.",
  },
  {
    title: "Referral speed is not time to specialist",
    text: "Referral processing does not establish when a patient saw a specialist, whether cancer was suspected, or why a delay occurred.",
  },
  {
    title: "Warning signs and tests are not measured",
    text: "GP recognition of warning signs and choice of tests are not quantified here. Missing evidence stays “no public data,” not a low-risk score.",
  },
  {
    title: "Four Uusimaa areas share one HUS value",
    text: "The snapshot has no county-level referral-processing value (indicator 13) for East, Central or West Uusimaa, or Vantaa and Kerava. HUS handles their hospital referrals, so the app shows the HUS-wide value instead, labelled as shared. It is not used for their status, ranking or recommended actions.",
  },
  {
    title: "Comparisons describe, they do not prove",
    text: "County comparisons are descriptive, not causal. They cannot predict an individual prognosis or prove the effect of an intervention.",
  },
];

/** The first sentence of an indicator's own limitation text: what the number covers, in its own words. */
function firstSentence(text: string): string {
  const match = /^.*?\.(?=\s|$)/.exec(text);
  return match ? match[0] : text;
}

/** A label column in muted text and the value in body ink, like the act page's Owner and Precedent rows. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd className="text-sm text-pretty text-foreground">{children}</dd>
    </div>
  );
}

/** The indicator cards, in a two-column grid on desktop. */
function IndicatorCards({ rows }: { rows: typeof sourceRows }) {
  return (
    <div className="grid items-start gap-1.5 lg:grid-cols-2">
      {rows.map(({ indicator, source, years }) => {
        const lead = firstSentence(indicator.limitation);
        // The card's summary line already shows the first sentence, so Scope continues from the second.
        const scope = indicator.limitation.slice(lead.length).trim();
        return (
          <FramePanel key={indicator.indicator_id} padding="md" className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h4 className="type-heading">{indicator.short_name}</h4>
              <SourceChip sourceId={indicator.source_id} />
            </div>
            <p className="max-w-[44rem] text-[0.9375rem] text-pretty text-foreground">{lead}</p>
            <p className="type-caption text-muted-foreground">
              Data years{" "}
              <span className="tabular-nums text-foreground">{years.length ? years.join(", ") : "No county values in snapshot"}</span>
            </p>
            <Disclosure summary="Definition and scope" className="-ml-0.5">
              <div className="flex flex-col gap-3 pt-1">
                <dl className="flex flex-col gap-2">
                  <Row label="Full name">{indicator.name}</Row>
                  <Row label="Source">
                    {indicator.source_id} · retrieved {source?.retrieved ?? "unknown"} · publisher updated {source?.data_updated ?? "unknown"}
                  </Row>
                  {scope && <Row label="Scope">{scope}</Row>}
                </dl>
                {source && (
                  <TextLink kind="external" href={source.url} className="text-sm">
                    Official definition on Sotkanet
                  </TextLink>
                )}
              </div>
            </Disclosure>
          </FramePanel>
        );
      })}
    </div>
  );
}

export default function SourcesPage() {
  const ranking = sourceRows.filter(({ indicator }) => RANKING_IDS.includes(indicator.indicator_id));
  const context = sourceRows.filter(({ indicator }) => !RANKING_IDS.includes(indicator.indicator_id));

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:pt-6">
      <header className="flex flex-col items-start gap-2">
        <Breadcrumb items={[{ label: "Areas", href: "/" }, { label: "Sources & limitations" }]} />
        <div className="flex flex-col gap-2">
          <p className="type-caption text-balance text-muted-foreground">How to read FirstLine</p>
          <h1 className="type-page">Sources &amp; limitations</h1>
          <p className="type-lede max-w-[44rem] text-pretty text-muted-foreground">
            Where every number comes from, and what it cannot tell you
          </p>
        </div>
        <nav aria-label="On this page">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-0">
            {sections.map((section) => (
              <li key={section.href}>
                <TextLink kind="jump" href={section.href} className="text-sm">
                  {section.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Frame aria-labelledby="essential-caveat">
        <FramePanel padding="none">
          <FramePanelLabel>
            <h2 id="essential-caveat" className="font-sans type-caption font-medium tracking-normal">
              The essential distinction
            </h2>
          </FramePanelLabel>
          <div className="flex max-w-[52rem] flex-col gap-2 px-4 pt-2 pb-4 sm:px-6 sm:pb-5">
            <p className="text-base font-semibold text-pretty text-foreground">
              GP-wait numbers count all non-urgent GP visits, not people with suspected cancer.
            </p>
            <p className="text-[0.9375rem] leading-relaxed text-pretty text-foreground">
              These public county indicators show access and referral processing, not a measured cancer journey.
            </p>
            <p className="text-[0.9375rem] leading-relaxed text-pretty text-foreground">
              THL Sotkanet 6411 (latest snapshot year: 2025) covers <strong className="font-semibold">non-urgent GP appointments with waiting-time data</strong>, not people with suspected cancer. GP waiting time is a proxy for access, not a cancer diagnosis or referral delay. The referral indicators describe processing of specialist referrals generally, not the whole GP-to-specialist journey.
            </p>
          </div>
        </FramePanel>
      </Frame>

      <Frame id="cannot-tell" aria-labelledby="gaps" className="scroll-mt-20">
        <FrameHeader>
          <FrameTitle id="gaps">What the data can&apos;t tell you</FrameTitle>
        </FrameHeader>
        <FramePanel padding="md" className="flex flex-col gap-4">
          <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {gaps.map((gap) => (
              <li key={gap.title} className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-pretty text-foreground">{gap.title}</p>
                <p className="text-sm leading-relaxed text-pretty text-foreground">{gap.text}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 border-t border-border pt-2">
            <p className="text-sm text-pretty text-foreground">Every recommended action cites a checked precedent. Live search results are not checked.</p>
            <TextLink kind="jump" href="#evidence" className="text-sm">
              See Evidence for actions
            </TextLink>
          </div>
        </FramePanel>
      </Frame>

      <Frame id="indicators" aria-labelledby="indicator-sources" className="scroll-mt-20">
        <FrameHeader>
          <FrameTitle id="indicator-sources">The public indicators</FrameTitle>
          <FrameDescription>Published on Sotkanet by the Finnish Institute for Health and Welfare (THL), by the Finnish Cancer Registry for screening and survival, and by Kela for private-visit reimbursements. Links open the official definitions.</FrameDescription>
        </FrameHeader>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="indicators-ranking" className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <h3 id="indicators-ranking" className="text-base font-semibold text-foreground">Used to rank counties</h3>
              <p className="type-caption text-muted-foreground">Sotkanet 6411 sets the order; 13 sets the referral status shown beside it.</p>
            </div>
            <IndicatorCards rows={ranking} />
          </section>
          <section aria-labelledby="indicators-context" className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <h3 id="indicators-context" className="text-base font-semibold text-foreground">Shown for context only</h3>
              <p className="type-caption text-muted-foreground">Not used for ranking or stage status.</p>
            </div>
            <IndicatorCards rows={context} />
          </section>
        </div>
      </Frame>

      <Frame id="evidence" aria-labelledby="evidence-sources" className="scroll-mt-20">
        <FrameHeader>
          <FrameTitle id="evidence-sources">Evidence for actions</FrameTitle>
          <FrameDescription>
            Each recommended action cites one of these checked sources.{" "}
            {evidenceRetrieved
              ? `All were retrieved on ${evidenceRetrieved}; the publisher is the host of the link.`
              : "They are listed as retrieved on the date shown; the publisher is the host of the link."}
          </FrameDescription>
          <FrameDescription>Recommended actions need a checked precedent and linked source. Checked precedents in the snapshot are distinct from Exa results, which are found live and unverified; a search result is not proof an intervention works in a Finnish county. The red-flag helper is decision support, not a diagnosis or substitute for local clinical guidance.</FrameDescription>
          <FrameDescription>Results labelled “Found live — unverified” come from Exa live search. They are not checked by the team.</FrameDescription>
        </FrameHeader>
        <ul className="grid gap-1.5 md:grid-cols-2">
          {evidenceSources.map((source) => (
            <li key={source.source_id}>
              <FramePanel padding="sm" className="flex h-full flex-col gap-1">
                {/* Inline, so the arrow follows the last word of a name of any length. */}
                <TextLink kind="external" inline href={source.url} className="text-sm text-pretty max-sm:py-2">
                  {source.name}
                </TextLink>
                <p className="type-caption text-muted-foreground">{evidenceRetrieved ? source.publisher : `${source.publisher} · retrieved ${source.retrieved}`}</p>
              </FramePanel>
            </li>
          ))}
        </ul>
        <p className="px-3 pt-4 pb-2 type-caption text-pretty text-muted-foreground sm:px-4">
          Map boundaries: Statistics Finland, wellbeing services counties 2025 (1:4 500 000), CC BY 4.0.{" "}
          <TextLink kind="external" inline href="https://stat.fi/en/services/statistical-data-services/geographic-data/statistical-areas/municipality-based-statistical-units">Statistics Finland open data</TextLink>
        </p>
      </Frame>

      <Frame id="other-sources" aria-labelledby="other-sources-title" className="scroll-mt-20">
        <FrameHeader>
          <FrameTitle id="other-sources-title">Other sources cited on county pages</FrameTitle>
          <FrameDescription>
            Background figures shown with a source chip. They are not county indicators and do not change any ranking, status or action.
            {otherRetrieved ? ` All were retrieved on ${otherRetrieved}.` : ""}
          </FrameDescription>
        </FrameHeader>
        <ul className="grid gap-1.5 md:grid-cols-2">
          {otherSources.map((source) => (
            <li key={source.source_id}>
              <FramePanel padding="sm" className="flex h-full flex-col gap-1">
                <TextLink kind="external" inline href={source.url} className="text-sm text-pretty max-sm:py-2">
                  {source.name}
                </TextLink>
                <p className="type-caption text-muted-foreground">{otherRetrieved ? source.publisher : `${source.publisher} · retrieved ${source.retrieved}`}</p>
              </FramePanel>
            </li>
          ))}
        </ul>
      </Frame>

      <nav aria-label="Page">
        <BackLink href="/">Back to areas</BackLink>
      </nav>
    </main>
  );
}
