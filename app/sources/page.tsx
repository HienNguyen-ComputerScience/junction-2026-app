import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
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

export const metadata: Metadata = { title: "Sources & limitations | FirstLine" };

const evidenceSources = sources.filter((source) => source.kind === "evidence");

// Statistic sources cited by chips on the county page that are not an indicator (e.g. the HUS report, the Kuitunen study).
const otherSources = sources.filter(
  (source) =>
    source.kind === "statistic" &&
    source.source_id !== "sotkanet-regions" &&
    !indicators.some((indicator) => indicator.source_id === source.source_id),
);

const sourceRows = indicators.map((indicator) => ({
  indicator,
  source: sources.find((source) => source.source_id === indicator.source_id),
  years: [...new Set(values.filter((value) => value.indicator_id === indicator.indicator_id).map((value) => value.year))].sort(),
}));

/** A label column in muted text and the value in body ink, like the act page's Owner and Precedent rows. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd className="text-sm text-pretty text-foreground">{children}</dd>
    </div>
  );
}

export default function SourcesPage() {
  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:pt-6">
      <header className="grid grid-cols-12 gap-x-6 gap-y-3">
        <BackLink href="/" className="col-span-12">
          Back to county ranking
        </BackLink>
        <div className="col-span-12 flex flex-col gap-2 lg:col-span-9">
          <p className="type-caption text-balance text-muted-foreground">How to read FirstLine</p>
          <h1 className="type-page">Sources &amp; limitations</h1>
        </div>
        <p className="type-lede col-span-12 max-w-[44rem] text-pretty text-foreground">
          These public county indicators show access and referral processing, not a measured cancer journey.
        </p>
      </header>

      <Frame aria-labelledby="essential-caveat">
        <FramePanel padding="none">
          <FramePanelLabel>
            <h2 id="essential-caveat" className="font-sans type-caption font-medium tracking-normal">
              The essential distinction
            </h2>
          </FramePanelLabel>
          <p className="max-w-[52rem] px-4 py-4 text-[0.9375rem] leading-relaxed text-pretty text-foreground sm:px-6 sm:py-5">
            THL Sotkanet 6411 (latest snapshot year: 2025) covers <strong className="font-semibold">non-urgent GP appointments with waiting-time data</strong>, not people with suspected cancer. GP waiting time is a proxy for access, not a cancer diagnosis or referral delay. The referral indicators describe processing of specialist referrals generally, not the whole GP-to-specialist journey.
          </p>
        </FramePanel>
      </Frame>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <Frame aria-labelledby="indicator-sources">
          <FrameHeader>
            <FrameTitle id="indicator-sources">The public indicators</FrameTitle>
            <FrameDescription>Published on Sotkanet by the Finnish Institute for Health and Welfare (THL), by the Finnish Cancer Registry for screening and survival, and by Kela for private-visit reimbursements. Links open the official definitions.</FrameDescription>
          </FrameHeader>
          <div className="flex flex-col gap-1.5">
            {sourceRows.map(({ indicator, source, years }) => (
              <FramePanel key={indicator.indicator_id} padding="md" className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h3 className="type-heading">{indicator.short_name}</h3>
                  <SourceChip sourceId={indicator.source_id} />
                </div>
                <p className="max-w-[44rem] text-[0.9375rem] text-pretty text-foreground">{indicator.name}</p>
                <dl className="flex flex-col gap-2">
                  <Row label="Data years">
                    <span className="tabular-nums">{years.length ? years.join(", ") : "No county values in snapshot"}</span>
                  </Row>
                  <Row label="Source">
                    {indicator.source_id} · retrieved {source?.retrieved ?? "unknown"} · publisher updated {source?.data_updated ?? "unknown"}
                  </Row>
                  <Row label="Scope">{indicator.limitation}</Row>
                </dl>
                {source && (
                  <TextLink kind="external" href={source.url} className="text-sm">
                    Official definition on Sotkanet
                  </TextLink>
                )}
              </FramePanel>
            ))}
          </div>
        </Frame>

        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Frame aria-labelledby="gaps">
            <FrameHeader>
              <FrameTitle id="gaps">What the map cannot tell you</FrameTitle>
            </FrameHeader>
            <FramePanel padding="none">
              <ul className="divide-y divide-border text-sm leading-relaxed text-pretty [&>li]:px-4 [&>li]:py-3 sm:[&>li]:px-5">
                <li>No indicator here follows a person from first symptoms through GP assessment, cancer diagnosis and specialist treatment.</li>
                <li>Referral processing does not establish when a patient saw a specialist, whether cancer was suspected, or why a delay occurred.</li>
                <li>GP recognition of warning signs and choice of tests are not quantified here. Missing evidence stays “no public data,” not a low-risk score.</li>
                <li>The snapshot has no county-level referral-processing value (indicator 13) for East, Central or West Uusimaa, or Vantaa and Kerava. HUS handles their hospital referrals, so the app shows the HUS-wide value instead, labelled as shared. It is not used for their status, ranking or recommended actions.</li>
                <li>County comparisons are descriptive, not causal. They cannot predict an individual prognosis or prove the effect of an intervention.</li>
              </ul>
            </FramePanel>
          </Frame>

          <Frame aria-labelledby="evidence">
            <FrameHeader>
              <FrameTitle id="evidence">Actions and live evidence</FrameTitle>
            </FrameHeader>
            <FramePanel padding="md">
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">Recommended actions need a checked precedent and linked source. Checked precedents in the snapshot are distinct from Exa results, which are found live and unverified; a search result is not proof an intervention works in a Finnish county. The red-flag helper is decision support, not a diagnosis or substitute for local clinical guidance.</p>
            </FramePanel>
          </Frame>
        </div>
      </div>

      <Frame aria-labelledby="evidence-sources">
        <FrameHeader>
          <FrameTitle id="evidence-sources">Evidence behind the recommended actions</FrameTitle>
          <FrameDescription>Each recommended action cites one of these checked sources. They are listed as retrieved on the date shown; the publisher is the host of the link.</FrameDescription>
        </FrameHeader>
        <ul className="grid gap-1.5 md:grid-cols-2">
          {evidenceSources.map((source) => (
            <li key={source.source_id}>
              <FramePanel padding="sm" className="flex h-full flex-col gap-1">
                {/* Inline, so the arrow follows the last word of a name of any length. */}
                <TextLink kind="external" inline href={source.url} className="text-sm text-pretty max-sm:py-2">
                  {source.name}
                </TextLink>
                <p className="type-caption text-muted-foreground">{source.publisher} · retrieved {source.retrieved}</p>
              </FramePanel>
            </li>
          ))}
        </ul>
        <p className="px-3 pt-4 pb-2 type-caption text-pretty text-muted-foreground sm:px-4">Results labelled “Found live — unverified” come from Exa live search. They are not checked by the team.</p>
        <p className="px-3 pb-2 type-caption text-pretty text-muted-foreground sm:px-4">
          Map boundaries: Statistics Finland, wellbeing services counties 2025 (1:4 500 000), CC BY 4.0.{" "}
          <TextLink kind="external" inline href="https://www.stat.fi/org/avoindata/paikkatietoaineistot_en.html">Statistics Finland open data</TextLink>
        </p>
      </Frame>

      <Frame aria-labelledby="other-sources">
        <FrameHeader>
          <FrameTitle id="other-sources">Other sources cited on county pages</FrameTitle>
          <FrameDescription>Background figures shown with a source chip. They are not county indicators and do not change any ranking, status or action.</FrameDescription>
        </FrameHeader>
        <ul className="grid gap-1.5 md:grid-cols-2">
          {otherSources.map((source) => (
            <li key={source.source_id}>
              <FramePanel padding="sm" className="flex h-full flex-col gap-1">
                <TextLink kind="external" inline href={source.url} className="text-sm text-pretty max-sm:py-2">
                  {source.name}
                </TextLink>
                <p className="type-caption text-muted-foreground">{source.publisher} · retrieved {source.retrieved}</p>
              </FramePanel>
            </li>
          ))}
        </ul>
      </Frame>

      <nav aria-label="Page">
        <BackLink href="/">Back to county ranking</BackLink>
      </nav>
    </main>
  );
}
