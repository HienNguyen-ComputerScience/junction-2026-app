import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";

import { Disclosure, FocusGroup, Reveal } from "@/components/motion";
import { SaveShare } from "@/components/share";
import { LimitationItem, SOURCE_FRAME, SourceCard, SourceList, type SourceListItem } from "@/components/sources/source-card";
import { BackLink } from "@/components/ui/back-link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TextLink } from "@/components/ui/text-link";
import { counties, indicators, sources, values } from "@/lib/data";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import { GP_WAIT_ID, REFERRAL_ID } from "@/lib/ranking";
import {
  describeVisitChange,
  getRecordedVisitChange,
  isRecordingSensitive,
  RECORDING_CHANGE_ABOVE,
} from "@/lib/recording";

export const metadata: Metadata = { title: "Sources & limitations | FirstLine" };

const evidenceSources = sources.filter((source) => source.kind === "evidence");

// Statistic sources cited by chips on the county page that are not an indicator (e.g. the HUS report, the Kuitunen study).
const otherSources = sources.filter(
  (source) =>
    source.kind === "statistic" &&
    source.source_id !== "sotkanet-regions" &&
    !indicators.some((indicator) => indicator.source_id === source.source_id),
);
const regionsSource = sources.find((source) => source.source_id === "sotkanet-regions");

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

const flaggedAreas = counties.filter((county) => isRecordingSensitive(county.id)).length;
const finlandVisitChange = getRecordedVisitChange("finland");

/** Every limitation: a short line, always visible, and its full wording behind "Show detail". */
const limitations: { title: string; detail: ReactNode }[] = [
  {
    title: "GP-wait numbers count all non-urgent GP visits, not people with suspected cancer",
    detail: (
      <>
        <p>These public county indicators show access and referral processing, not a measured cancer journey.</p>
        <p>
          THL Sotkanet 6411 (latest snapshot year: 2025) covers <strong className="font-semibold">non-urgent GP appointments with waiting-time data</strong>, not people with suspected cancer. GP waiting time is a proxy for access, not a cancer diagnosis or referral delay. The referral indicators describe processing of specialist referrals generally, not the whole GP-to-specialist journey.
        </p>
      </>
    ),
  },
  {
    title: "No indicator follows a person's whole journey",
    detail: <p>No indicator here follows a person from first symptoms through GP assessment, cancer diagnosis and specialist treatment.</p>,
  },
  {
    title: "Referral speed is not time to specialist",
    detail: <p>Referral processing does not establish when a patient saw a specialist, whether cancer was suspected, or why a delay occurred.</p>,
  },
  {
    title: "Warning signs and tests are not measured",
    detail: <p>GP recognition of warning signs and choice of tests are not quantified here. Missing evidence stays “no public data,” not a low-risk score.</p>,
  },
  {
    title: "Recorded visits change from year to year",
    detail: (
      <p>
        {`The GP wait (6411) is the share of recorded GP visits that waited over 7 days. We divide the published count by the share to get the number of recorded visits, and where that number changed by more than ${Math.round(RECORDING_CHANGE_ABOVE * 100)}% from 2023 to 2025 (${flaggedAreas} of ${counties.length} areas${finlandVisitChange === null ? "" : `; for Finland overall they ${describeVisitChange(finlandVisitChange)}`}), part of a rise in the share may be how visits are recorded, not how long visits waited. Those rises carry a caveat; the published shares and rankings are not changed.`}
      </p>
    ),
  },
  {
    title: "Four Uusimaa areas share one HUS referral value",
    detail: (
      <p>
        The snapshot has no county-level referral-processing value (indicator 13) for East, Central or West Uusimaa, or Vantaa and Kerava. HUS handles their hospital referrals, so the app shows the HUS-wide value instead, labelled as shared. It is not used for their status, ranking or recommended actions.
      </p>
    ),
  },
  {
    title: "“Finland overall” is a reference, not a target",
    detail: (
      <p>
        Wherever FirstLine compares an area with Finland overall, it uses Sotkanet&apos;s whole-country value for the same indicator and year. It is not a target and not an average of the areas.
      </p>
    ),
  },
  {
    title: "Comparisons describe, they do not prove",
    detail: <p>County comparisons are descriptive, not causal. They cannot predict an individual prognosis or prove the effect of an intervention.</p>,
  },
  {
    title: "Live search results are not checked",
    detail: (
      <>
        <p>Every recommended action cites a checked precedent and linked source.</p>
        <p>
          Checked precedents in the snapshot are distinct from Exa results, which are found live and unverified; a search result is not proof an intervention works in a Finnish county. Results labelled “Found live — unverified” come from Exa live search. They are not checked by the team.
        </p>
      </>
    ),
  },
  {
    title: "Referral routes are decision support, not a diagnosis",
    detail: <p>The referral-routes panel describes routes a county should offer. It is decision support, not a diagnosis or substitute for local clinical guidance.</p>,
  },
];

/** The first sentence of an indicator's own limitation text: its main caveat, in its own words. */
function firstSentence(text: string): string {
  const match = /^.*?\.(?=\s|$)/.exec(text);
  return match ? match[0] : text;
}

/** A label column in muted text and the value in body ink. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base text-pretty text-foreground">{children}</dd>
    </div>
  );
}

/** A section heading: an 11px eyebrow, the serif title and at most one line under it. */
function SectionHead({ id, eyebrow, title, line }: { id: string; eyebrow?: string; title: string; line?: ReactNode }) {
  return (
    <Reveal className="flex max-w-[44rem] flex-col gap-2">
      {eyebrow && <p className="type-eyebrow">{eyebrow}</p>}
      <h2 id={id} className="type-title text-forest-ink">
        {title}
      </h2>
      {line && <p className="text-base text-pretty text-muted-foreground">{line}</p>}
    </Reveal>
  );
}

type SourceRow = (typeof sourceRows)[number];

/** "2023–2025" for consecutive years, otherwise the list. */
function yearsText(years: SourceRow["years"]): string {
  if (!years.length) return "No county values in snapshot";
  const nums = years.map(Number);
  const consecutive = nums.every((year, i) => i === 0 || year === nums[i - 1] + 1);
  return consecutive && nums.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years.join(", ");
}

/** The publisher in a few words for a list row: its abbreviation if it has one (THL, Kela), without ", Sotkanet". */
function shortPublisher(publisher: string): string {
  const abbreviation = /\(([^)]+)\)/.exec(publisher);
  return abbreviation ? abbreviation[1] : publisher.replace(/, Sotkanet$/, "");
}

/** An indicator's definition: full name, source and dates, and its scope (`withLead`: the whole limitation text). */
function Definition({ row, withLead }: { row: SourceRow; withLead: boolean }) {
  const { indicator, source } = row;
  const lead = firstSentence(indicator.limitation);
  const scope = withLead ? indicator.limitation : indicator.limitation.slice(lead.length).trim();
  return (
    <dl className="flex flex-col gap-2">
      <Row label="Full name">{indicator.name}</Row>
      <Row label="Publisher">{source?.publisher ?? "unknown"}</Row>
      <Row label="Source">
        {indicator.source_id} · retrieved {source?.retrieved ?? "unknown"} · publisher updated {source?.data_updated ?? "unknown"}
      </Row>
      {scope && <Row label="Scope">{scope}</Row>}
    </dl>
  );
}

/** The two indicators the ranking reads, as full focus cards: name, main caveat, publisher, years, link. */
function RankingCards({ rows }: { rows: SourceRow[] }) {
  return (
    <FocusGroup className="flex flex-col gap-4">
      {rows.map((row) => (
        <SourceCard
          key={row.indicator.indicator_id}
          focus
          title={row.indicator.short_name}
          note={firstSentence(row.indicator.limitation)}
          publisher={row.source?.publisher ?? row.indicator.source_id}
          years={yearsText(row.years)}
          href={row.source?.url ?? "https://sotkanet.fi"}
          linkLabel="Official definition on Sotkanet"
          detailLabel="definition and scope"
          detail={<Definition row={row} withLead={false} />}
        />
      ))}
    </FocusGroup>
  );
}

/** Context-only indicators: one framed list, one row each (name · publisher · years · Sotkanet link). */
function ContextList({ rows }: { rows: SourceRow[] }) {
  return (
    <ul className={cn(SOURCE_FRAME, "flex flex-col py-2")}>
      {rows.map((row) => (
        <li
          key={row.indicator.indicator_id}
          className="print-keep flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-frame-border py-3 last:border-b-0"
        >
          <p className="min-w-0 flex-1 basis-[30rem] text-base text-pretty">
            <span className="font-semibold text-foreground">{row.indicator.short_name}</span>
            <span className="text-muted-foreground">
              {" · "}
              {row.source ? shortPublisher(row.source.publisher) : row.indicator.source_id}
              {" · "}
              <span className="tabular-nums">{yearsText(row.years)}</span>
              {" · "}
            </span>
            {row.source && (
              <TextLink kind="external" inline href={row.source.url}>
                Sotkanet
              </TextLink>
            )}
          </p>
          {/* Closed: the button sits at the row's end. Open: the definition takes the full row. */}
          <Disclosure label="definition and scope" tone="quiet" className="open:basis-full" contentClassName="pt-2 pb-2">
            <Definition row={row} withLead />
          </Disclosure>
        </li>
      ))}
    </ul>
  );
}

export default function SourcesPage() {
  const ranking = sourceRows.filter(({ indicator }) => RANKING_IDS.includes(indicator.indicator_id));
  const context = sourceRows.filter(({ indicator }) => !RANKING_IDS.includes(indicator.indicator_id));

  const evidenceItems: SourceListItem[] = evidenceSources.map((source) => ({
    key: source.source_id,
    name: source.name,
    href: source.url,
    publisher: evidenceRetrieved ? source.publisher : `${source.publisher} · retrieved ${source.retrieved}`,
  }));
  const otherItems: SourceListItem[] = [
    ...otherSources.map((source) => ({
      key: source.source_id,
      name: source.name,
      href: source.url,
      publisher: otherRetrieved ? source.publisher : `${source.publisher} · retrieved ${source.retrieved}`,
    })),
    ...(regionsSource
      ? [
          {
            key: regionsSource.source_id,
            name: regionsSource.name,
            href: regionsSource.url,
            publisher: regionsSource.retrieved === otherRetrieved ? regionsSource.publisher : `${regionsSource.publisher} · retrieved ${regionsSource.retrieved}`,
          },
        ]
      : []),
    {
      key: "map-boundaries",
      name: "Map boundaries: wellbeing services counties 2025 (1:4 500 000), CC BY 4.0",
      href: "https://stat.fi/en/services/statistical-data-services/geographic-data/statistical-areas/municipality-based-statistical-units",
      publisher: "Statistics Finland open data",
    },
  ];

  return (
    <main className={cn("page-container flex flex-col gap-12 pt-4 pb-12 sm:pt-6", MOTION_LOUD_CLASS)}>
      <header className="flex flex-col items-start gap-6">
        <Breadcrumb items={[{ label: "Areas", href: "/" }, { label: "Sources & limitations" }]} />
        <Reveal className="flex max-w-[52rem] flex-col gap-3">
          <p className="type-eyebrow">Sources &amp; limitations</p>
          <h1 className="type-page text-balance">
            Every number in FirstLine comes from a public source. Here they are, and what they cannot tell you.
          </h1>
        </Reveal>
        <Reveal index={1} className="flex flex-col gap-4">
          <p className="text-lg text-pretty text-foreground">
            <span className="figure font-semibold">{sources.length}</span> public sources ·{" "}
            <span className="figure font-semibold">{indicators.length}</span> indicators
          </p>
          <p className="text-base text-pretty text-foreground">
            New to these numbers?{" "}
            <Link href="/how-to-read" className="font-semibold text-forest-ink underline decoration-forest-ink/40 underline-offset-4 hover:decoration-forest-ink">
              Read how to read them
            </Link>
          </p>
        </Reveal>
        <Reveal index={2}>
          <SaveShare
            className="print:hidden"
            options={[
              { kind: "print" },
              {
                kind: "email",
                subject: "FirstLine: sources and limitations",
                intro: "Every public source behind FirstLine, and what the data cannot tell you:",
              },
            ]}
          />
        </Reveal>
      </header>

      {/* The point of the page: always visible, never behind a button. */}
      <section aria-labelledby="gaps" className="flex flex-col gap-6">
        <SectionHead id="gaps" eyebrow="Read with care" title="What the data can't tell you" />
        <ul className="grid gap-3 md:grid-cols-2">
          {limitations.map((limitation) => (
            <LimitationItem key={limitation.title} title={limitation.title}>
              {limitation.detail}
            </LimitationItem>
          ))}
        </ul>
      </section>

      <section aria-labelledby="indicator-sources" className="flex flex-col gap-8">
        <SectionHead id="indicator-sources" title="Indicators" />
        <section aria-labelledby="indicators-ranking" className="flex max-w-[52rem] flex-col gap-4">
          <Reveal className="flex flex-col gap-1">
            <h3 id="indicators-ranking" className="type-heading text-forest-ink">Used to rank counties</h3>
            <p className="text-base text-muted-foreground">Sotkanet 6411 sets the order; 13 sets the referral status shown beside it.</p>
          </Reveal>
          <RankingCards rows={ranking} />
        </section>
        <section aria-labelledby="indicators-context" className="flex flex-col gap-4">
          <Reveal className="flex flex-col gap-1">
            <h3 id="indicators-context" className="type-heading text-forest-ink">Shown for context only</h3>
            <p className="text-base text-muted-foreground">Not used for ranking or stage status.</p>
          </Reveal>
          <ContextList rows={context} />
        </section>
      </section>

      <section aria-labelledby="evidence-sources" className="flex flex-col gap-6">
        <SectionHead id="evidence-sources" title="Evidence for actions" />
        <SourceList
          line={`${evidenceItems.length} studies, guidelines and strategies behind the recommended actions.${evidenceRetrieved ? ` All retrieved ${evidenceRetrieved}.` : ""}`}
          note="Each recommended action cites one of these checked sources; the publisher is the host of the link."
          items={evidenceItems}
        />
      </section>

      <section aria-labelledby="other-sources-title" className="flex flex-col gap-6">
        <SectionHead id="other-sources-title" title="Other sources" />
        <SourceList
          line={`${otherItems.length} more: background figures cited on county pages, the list of areas and the map. None changes a ranking, status or action.`}
          note={`The background figures are not county indicators and do not change any ranking, status or action.${otherRetrieved ? ` All retrieved ${otherRetrieved}.` : ""}`}
          items={otherItems}
        />
      </section>

      <nav aria-label="Page" className="print:hidden">
        <BackLink href="/">Back to areas</BackLink>
      </nav>
    </main>
  );
}
