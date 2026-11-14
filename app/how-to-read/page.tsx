import { ArrowUp } from "lucide-react";
import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { cn } from "cn";

import "./how-to-read.css";
import { SourceLine } from "@/components/briefing/source-line";
import { GradeGlyph } from "@/components/insights/confidence-badge";
import { StarterDownload } from "@/components/insights/starter-dataset";
import { AnimatedBar, AnimatedNumber, Disclosure, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { FigurePicture } from "@/components/walkthrough/figure-picture";
import { ForwardLink, Plain, Section, Statement, longDate } from "@/components/walkthrough/parts";
import { PathwayPicture } from "@/components/walkthrough/pathway-picture";
import { Story } from "@/components/walkthrough/story";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import {
  YEAR,
  finlandGpWait,
  gpDefinition,
  gpGradeCounts,
  gpWaitAreas,
  gradeLevels,
  gradeRules,
  pathway,
  pathwayGapCount,
  recordingExample,
  retrieved,
  sharedReferral,
  sourceCount,
  sourceGroups,
  starter,
  studyCount,
} from "@/lib/walkthrough/model";

export const metadata: Metadata = {
  title: "How to read these numbers | FirstLine",
  description:
    "Where FirstLine's figures come from, what one figure really counts, how far to trust each one, what Finland does not publish, and what a county can start recording.",
};

const SECTIONS = [
  { id: "where-from", name: "Where the numbers come from" },
  { id: "one-figure", name: "What one figure really counts" },
  { id: "shared", name: "Why some areas share a number" },
  { id: "trust", name: "How much to trust a figure" },
  { id: "not-published", name: "What Finland does not publish" },
  { id: "what-we-did", name: "What we did about it" },
  { id: "from-monday", name: "What a county can do from Monday" },
] as const;

const LINK =
  "rounded-sm font-semibold text-forest-ink underline underline-offset-4 hover:text-forest-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink";

const PANEL = "rounded-[14px] bg-keylime-wash p-7 sm:p-10";

const GLYPHS = {
  solid: <GradeGlyph level="solid" />,
  care: <GradeGlyph level="care" />,
  shared: <GradeGlyph level="shared" />,
  none: <GradeGlyph level="none" />,
};

/**
 * /how-to-read: where FirstLine's numbers come from and what they cannot say, as one long page
 * that reveals itself in small pieces as it is read. Every figure comes from the snapshot through
 * lib/walkthrough/model.ts. No request leaves the server: no live search, no AI.
 */
export default function HowToReadPage() {
  const gpLead = gpWaitAreas[0];
  const fieldsTotal = starter.fieldCount;

  return (
    <main className={cn("htr-root", MOTION_LOUD_CLASS)}>
      {/* Always in view: what this page is, and the way to the full list of sources. */}
      <div className="sticky top-0 z-20 border-b border-frame-border bg-cream-paper print:hidden">
        <div className="page-container flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <p className="text-base font-semibold text-forest-ink">How to read these numbers</p>
          <Link href="/sources" className={cn(LINK, "text-base")}>
            See the full list of sources
          </Link>
        </div>
      </div>

      <div className="page-container">
        <header className="flex max-w-[52rem] flex-col gap-6 pt-12 pb-16 sm:pt-20">
          <Reveal>
            <h1 className="font-display text-[2.5rem] leading-[1.1] font-light text-forest-ink sm:text-[3.5rem]">
              How to read these numbers
            </h1>
          </Reveal>
          <Reveal index={1}>
            <p className="text-lg leading-8 text-pretty text-charcoal">
              Where FirstLine&apos;s figures come from, what each one really counts, how far to trust it, and what Finland
              does not publish at all. Seven short parts; reading it all takes about two minutes. Keep scrolling: each
              part shows itself as you reach it.
            </p>
          </Reveal>
          <Reveal index={2}>
            <nav aria-labelledby="on-this-page" className="rounded-[14px] bg-keylime-wash p-7">
              <h2 id="on-this-page" className="text-base font-semibold text-forest-ink">
                On this page
              </h2>
              <ol className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {SECTIONS.map((section, index) => (
                  <li key={section.id} className="flex gap-2 text-base leading-7">
                    <span className="text-charcoal tabular-nums">{index + 1}.</span>
                    <a href={`#${section.id}`} className={LINK}>
                      {section.name}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </header>

        {/* 1. Where the numbers come from */}
        <Section id={SECTIONS[0].id} name={SECTIONS[0].name}>
          <Statement>Every number on FirstLine comes from a public source you can open yourself.</Statement>
          <Reveal index={2} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="numeral text-7xl leading-none text-forest-ink">
              <AnimatedNumber value={sourceCount} final={String(sourceCount)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">
              public sources: official statistics, one hospital report, and {studyCount} published studies and national
              documents.
            </span>
          </Reveal>
          <Plain index={3}>
            We copied them on {longDate(retrieved)} and change nothing in them. The figures are shown as published: one
            value per area per year, for the three latest years each publisher has released.
          </Plain>
          <ol className="grid gap-4 md:grid-cols-2">
            {sourceGroups.map((group, index) => (
              <Reveal as="li" key={group.id} index={index} className={cn(PANEL, "flex flex-col gap-3")}>
                <h3 className="text-lg leading-7 font-semibold text-forest-ink">{group.who}</h3>
                <p className="text-base leading-6 text-charcoal">{group.what}</p>
                <p className="flex flex-wrap gap-2">
                  {group.sources.map((source) => (
                    <SourceChip key={source.source_id} sourceId={source.source_id} />
                  ))}
                </p>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <Disclosure show="Show who publishes each one, and when" hide="Hide who publishes each one, and when">
              <div className="overflow-x-auto rounded-[14px] bg-keylime-wash p-5 sm:p-7">
                <table className="stack-table w-full text-left text-base leading-6 text-charcoal">
                  <caption className="sr-only">Who publishes each statistic, when they last updated it, and when we copied it</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="py-2 pr-4 font-semibold text-forest-ink">Figure</th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-forest-ink">Published by</th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-forest-ink">Publisher last updated it</th>
                      <th scope="col" className="py-2 font-semibold text-forest-ink">We copied it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceGroups.flatMap((group) =>
                      group.sources.map((source) => (
                        <tr key={source.source_id} className="border-b border-border last:border-b-0">
                          <td data-label="Figure" className="py-2 pr-4 align-top">
                            <span>{source.name}</span>
                          </td>
                          <td data-label="Published by" className="py-2 pr-4 align-top">
                            <span>{source.publisher}</span>
                          </td>
                          <td data-label="Publisher last updated it" className="py-2 pr-4 align-top whitespace-nowrap">
                            <span>{longDate(source.data_updated)}</span>
                          </td>
                          <td data-label="We copied it" className="py-2 align-top whitespace-nowrap">
                            <span>{longDate(source.retrieved)}</span>
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
                <p className="mt-4 text-base leading-6 text-charcoal">
                  The studies and national documents are listed with their links on{" "}
                  <Link href="/sources" className={LINK}>
                    the full list of sources
                  </Link>
                  .
                </p>
              </div>
            </Disclosure>
          </Reveal>
        </Section>

        {/* 2. What one figure really counts */}
        {gpLead ? (
          <Section id={SECTIONS[1].id} name={SECTIONS[1].name}>
            <Statement>A figure counts exactly one thing. Read it as that, and no more.</Statement>
            <Plain index={2}>
              Our main figure is THL&apos;s Sotkanet 6411: the share of non-urgent GP visits that came more than 7 days
              after the need for care was assessed. A GP here means a doctor at a public health centre.
            </Plain>
            <Story
              label={`${gpLead.name}'s share of non-urgent GP visits that waited more than 7 days, and what the figure counts`}
              picture={<FigurePicture areas={gpWaitAreas} finland={finlandGpWait} year={YEAR} glyphs={GLYPHS} />}
              blocks={[
                <Fragment key="b1">
                  <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">It counts visits, not people.</p>
                  <p className="text-lg leading-8 text-charcoal">
                    So we say &ldquo;{gpLead.text} of non-urgent GP visits in {gpLead.name} came more than a week after people
                    asked&rdquo;, never &ldquo;{gpLead.text} of people&rdquo;. One person can make several visits.
                  </p>
                </Fragment>,
                <Fragment key="b2">
                  <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">
                    It counts every non-urgent visit, not only cancer.
                  </p>
                  <p className="text-lg leading-8 text-charcoal">
                    It shows how hard it is to get a GP appointment at all, which is the first step for anyone with a
                    possible cancer. How long people with possible cancer symptoms wait is not published.
                  </p>
                </Fragment>,
              ]}
            />
            <Reveal className="flex flex-col gap-4">
              <SourceLine sourceId="sotkanet-6411" year={YEAR}>
                {gpDefinition.limitation}
              </SourceLine>
              <Disclosure show="Show the official definition" hide="Hide the official definition">
                <div className="flex flex-col gap-2 rounded-[14px] bg-keylime-wash p-5 sm:p-7">
                  <p className="text-base leading-6 font-semibold text-forest-ink">Official name (THL, in English)</p>
                  <p className="text-base leading-6 text-charcoal">{gpDefinition.officialName}</p>
                  <p className="text-base leading-6 text-charcoal">
                    &ldquo;Appointments kept&rdquo; means visits that took place.
                  </p>
                </div>
              </Disclosure>
            </Reveal>
          </Section>
        ) : null}

        {/* 3. Why some areas share a number */}
        {sharedReferral ? (
          <Section id={SECTIONS[2].id} name={SECTIONS[2].name}>
            <Statement>
              {sharedReferral.areas.length} areas in Uusimaa show the same referral figure, because only one is published
              for all of them.
            </Statement>
            <Plain index={2}>
              Their hospital referrals go to {sharedReferral.hospital}, the Helsinki University Hospital group. Sotkanet
              publishes how fast {sharedReferral.hospital} processes referrals as one value, not one per area.
            </Plain>
            <Reveal className={cn(PANEL, "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]")}>
              <ul className="flex flex-col gap-2">
                {sharedReferral.areas.map((area) => (
                  <li key={area.id} className="rounded-[14px] bg-cream-paper px-4 py-3 text-base font-semibold text-forest-ink">
                    {area.name}
                  </li>
                ))}
              </ul>
              <div aria-hidden className="flex flex-col gap-[38px] max-md:hidden">
                {sharedReferral.areas.map((area, index) => (
                  <span key={area.id} className="block h-px w-16 animate-line-in bg-forest-ink" style={{ "--i": index + 1 } as CSSProperties} />
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-[14px] bg-cream-paper p-6">
                <p className="text-base font-semibold text-forest-ink">One value for all {sharedReferral.areas.length}: {sharedReferral.hospital}</p>
                <p className="numeral text-6xl leading-none text-forest-ink">
                  <AnimatedNumber value={sharedReferral.value} final={sharedReferral.text} decimals={1} level="loud" />
                </p>
                <p className="text-base leading-6 text-charcoal">
                  of referrals processed within 3 days in {YEAR}
                  {sharedReferral.finland ? ` (Finland ${sharedReferral.finland})` : ""}.
                </p>
              </div>
            </Reveal>
            <Plain>
              On FirstLine this value is always labelled &ldquo;shared&rdquo; or &ldquo;no county figure&rdquo;. It is never
              shown as one area&apos;s own result.
            </Plain>
            <Reveal className="flex flex-col gap-4">
              <SourceLine sourceId="sotkanet-13" year={YEAR}>
                Counts all referrals to the hospital, not only cancer.
                {sharedReferral.confirmedBy ? " Checked against HUS's own report:" : ""}
              </SourceLine>
              {sharedReferral.confirmedBy ? (
                <p className="flex">
                  <SourceChip sourceId={sharedReferral.confirmedBy} />
                </p>
              ) : null}
              {sharedReferral.gap ? (
                <Disclosure show="Show what is missing, and who could publish it" hide="Hide what is missing, and who could publish it">
                  <dl className="grid gap-x-6 gap-y-2 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-7">
                    <dt className="font-semibold text-forest-ink">Not published</dt>
                    <dd>{sharedReferral.gap.missing}</dd>
                    <dt className="font-semibold text-forest-ink">What exists instead</dt>
                    <dd>{sharedReferral.gap.today}</dd>
                    <dt className="font-semibold text-forest-ink">Our proposal</dt>
                    <dd>{sharedReferral.gap.couldPublish}</dd>
                  </dl>
                </Disclosure>
              ) : null}
            </Reveal>
          </Section>
        ) : null}

        {/* 4. How much to trust a figure */}
        <Section id={SECTIONS[3].id} name={SECTIONS[3].name}>
          <Statement>Every figure carries a plain label that says how far to trust it, and why.</Statement>
          <ul className="grid gap-4 sm:grid-cols-2">
            {gradeLevels.map((level, index) => (
              <Reveal as="li" key={level.level} index={index} className={cn(PANEL, "flex flex-col gap-2")}>
                <p className="flex items-center gap-2 text-lg leading-7 font-semibold text-forest-ink">
                  <GradeGlyph level={level.level} className="size-4" />
                  {level.label}
                </p>
                <p className="text-base leading-6 text-charcoal">{level.meaning}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="numeral text-7xl leading-none text-forest-ink">
              <AnimatedNumber value={gpGradeCounts.care} final={String(gpGradeCounts.care)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">
              of the {gpGradeCounts.areas} areas&apos; GP-wait figures for {YEAR} are labelled &ldquo;Read with care&rdquo; or
              &ldquo;Read the trend with care&rdquo;. {gpGradeCounts.solid} are &ldquo;Solid&rdquo;.
            </span>
          </Reveal>
          <Plain>
            The most common reason is a change in how visits were recorded. Here is one area where that happened.
          </Plain>
          {recordingExample ? (
            <Reveal className={cn(PANEL, "flex flex-col gap-6")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">
                {recordingExample.name}: the share of non-urgent GP visits waiting more than 7 days
              </h3>
              <div className="flex flex-col gap-4">
                {[recordingExample.before, recordingExample.after].map((row, index) => (
                  <div key={row.year} className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem] items-center gap-3">
                    <span className="text-base font-semibold text-charcoal tabular-nums">{row.year}</span>
                    <AnimatedBar
                      value={row.value}
                      tone="forest"
                      index={index}
                      label={`${recordingExample?.name ?? ""} ${row.year}: ${row.text}, from ${row.base.toLocaleString("en-GB")} recorded visits`}
                    />
                    <span className="text-right text-base font-semibold text-charcoal tabular-nums">{row.text}</span>
                    <span className="col-start-2 col-end-4 -mt-2 text-base leading-6 text-charcoal">
                      from {row.base.toLocaleString("en-GB")} recorded visits
                    </span>
                  </div>
                ))}
              </div>
              <p className="flex items-start gap-2 text-base leading-6 text-charcoal">
                <GradeGlyph level={recordingExample.grade.level} className="mt-[5px] text-forest-ink" />
                <span>
                  <strong className="font-semibold text-forest-ink">{recordingExample.grade.label}.</strong>{" "}
                  {recordingExample.grade.reason}
                </span>
              </p>
              <p className="text-base leading-6 text-charcoal">
                The share went up, but it now rests on far fewer recorded visits. Part of the rise may be in what was
                recorded, not in how long visits waited. We show the published figure unchanged, with this label.
              </p>
              <SourceLine sourceId="sotkanet-6411" year={recordingExample.after.year}>
                Recorded visits are the published count of late visits divided by the published share.
              </SourceLine>
            </Reveal>
          ) : null}
          <Reveal>
            <Disclosure show="Show the rules, in the order we apply them" hide="Hide the rules">
              <ol className="flex list-decimal flex-col gap-3 rounded-[14px] bg-keylime-wash p-5 pl-10 text-base leading-6 text-charcoal sm:p-7 sm:pl-12">
                {gradeRules.map((rule) => (
                  <li key={rule.id}>
                    <strong className="font-semibold text-forest-ink">{rule.label}:</strong> {rule.rule}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-base leading-6 text-charcoal">
                The first rule that applies sets the label. The labels are worked out from the published data and THL&apos;s
                own notes; they are ours, not THL&apos;s.
              </p>
            </Disclosure>
          </Reveal>
        </Section>

        {/* 5. What Finland does not publish */}
        <Section id={SECTIONS[4].id} name={SECTIONS[4].name}>
          <Statement>
            Of the {pathway.length} steps from screening to survival, {pathwayGapCount} have no public figure for any area.
          </Statement>
          <Plain index={2}>
            The challenge brief says Finnish cancer-care data is limited, and that addressing this data gap is part of the
            challenge. Here is exactly where the gaps are.
          </Plain>
          <Story
            label={`The cancer pathway in ${pathway.length} steps: which have a published figure by area, and which do not`}
            picture={<PathwayPicture slots={pathway} />}
            blocks={[
              <Fragment key="b3">
                <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">
                  {pathway.length - pathwayGapCount} steps are published for every area.
                </p>
                <p className="text-lg leading-8 text-charcoal">
                  Screening, getting to a GP, the hospital&apos;s referral handling and survival each have a figure on
                  Sotkanet. For four Uusimaa areas the referral figure is the shared HUS value.
                </p>
              </Fragment>,
              <Fragment key="b4">
                <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">
                  {pathwayGapCount} steps are empty.
                </p>
                <ul className="flex flex-col gap-3 text-lg leading-8 text-charcoal">
                  {pathway
                    .filter((slot) => !slot.published)
                    .map((slot) => (
                      <li key={slot.id}>
                        <strong className="font-semibold text-forest-ink">{slot.title}:</strong> {slot.text}
                      </li>
                    ))}
                </ul>
              </Fragment>,
              <Fragment key="b5">
                <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">
                  We draw a gap as a gap, never as a zero.
                </p>
                <p className="text-lg leading-8 text-charcoal">
                  Where a figure is missing, FirstLine says &ldquo;No public data&rdquo; and names who could publish it. We
                  do not fill it with an estimate.
                </p>
              </Fragment>,
            ]}
          />
          <Reveal>
            <Disclosure show="Show what exists instead of each missing figure" hide="Hide what exists instead">
              <dl className="grid gap-x-6 gap-y-3 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-7">
                {pathway
                  .filter((slot) => !slot.published)
                  .map((slot) => (
                    <div key={slot.id} className="contents">
                      <dt className="font-semibold text-forest-ink">{slot.title}</dt>
                      <dd className="flex flex-col items-start gap-2">
                        <span>{slot.today}</span>
                        {slot.sourceId ? <SourceChip sourceId={slot.sourceId} /> : null}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Disclosure>
          </Reveal>
        </Section>

        {/* 6. What we did about it */}
        <Section id={SECTIONS[5].id} name={SECTIONS[5].name}>
          <Statement>No invented numbers. No forecasts.</Statement>
          <ol className="grid gap-4 md:grid-cols-2">
            <Reveal as="li" index={0} className={cn(PANEL, "flex flex-col gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">Only published figures</h3>
              <p className="text-base leading-6 text-charcoal">
                Every number is a published value with its source and year beside it. Where nothing is published, we say so.
              </p>
            </Reveal>
            <Reveal as="li" index={1} className={cn(PANEL, "flex flex-col gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">What happened elsewhere, not a prediction</h3>
              <p className="text-base leading-6 text-charcoal">
                Where an action has been tried, we show what the study reported there, in its own words, and say it is not
                a forecast for your area.
              </p>
            </Reveal>
            <Reveal as="li" index={2} className={cn(PANEL, "flex flex-col gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">The AI writes words, not numbers</h3>
              <p className="text-base leading-6 text-charcoal">
                On an area&apos;s page the AI writes a short summary around the fixed figures. A checker on our server then
                removes every sentence whose number is not in our data for the source it names. If the AI is unavailable,
                a summary written from the same data in advance is shown instead.
              </p>
            </Reveal>
            <Reveal as="li" index={3} className={cn(PANEL, "flex flex-col gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">Live web results are labelled</h3>
              <p>
                <Badge variant="unverified">Found live — unverified</Badge>
              </p>
              <p className="text-base leading-6 text-charcoal">
                News and studies found by the live web search carry this label. The question box answers only from those
                results, and its checker removes any sentence whose numbers are not in the results it names.
              </p>
            </Reveal>
          </ol>
          <Reveal>
            <Disclosure show="Show exactly what the summary checker removes" hide="Hide what the summary checker removes">
              <div className="flex flex-col gap-3 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:p-7">
                <p>A sentence of the AI summary is kept only if all of these hold:</p>
                <ol className="flex list-decimal flex-col gap-2 pl-6">
                  <li>It names at least one source, and every source it names is in our data.</li>
                  <li>
                    Every number in it matches a figure we hold for a source it names, at the precision written (a year of
                    such a figure also counts). A percentage only matches a percentage.
                  </li>
                  <li>Every statistic it names backs at least one of its numbers.</li>
                  <li>It has no numbers written out in words (&ldquo;two in three&rdquo;, &ldquo;doubled&rdquo;), because those cannot be checked.</li>
                  <li>If it uses the GP-visits figure (Sotkanet 6411), it never calls the visits people or patients.</li>
                </ol>
                <p>
                  This page itself uses no AI and no live search: everything here is fixed text and published figures.
                </p>
              </div>
            </Disclosure>
          </Reveal>
        </Section>

        {/* 7. What a county can do from Monday */}
        <Section id={SECTIONS[6].id} name={SECTIONS[6].name}>
          <Statement>A county does not have to wait for the national figures. It can start counting its own.</Statement>
          <Reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="numeral text-7xl leading-none text-forest-ink">
              <AnimatedNumber value={fieldsTotal} final={String(fieldsTotal)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">
              counts in {starter.sections.length} groups, kept once a quarter, fill the empty steps for your own area.
            </span>
          </Reveal>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starter.sections.map((section, index) => (
              <Reveal as="li" key={section.id} index={index} className="flex flex-col gap-1 rounded-[14px] bg-keylime-wash p-6">
                <span className="text-base leading-6 font-semibold text-forest-ink">{section.title}</span>
                <span className="text-base leading-6 text-charcoal">
                  {section.fields.length} {section.fields.length === 1 ? "count" : "counts"}
                </span>
              </Reveal>
            ))}
          </ol>
          <Plain>
            {starter.privacy[0]} {starter.privacy[1]}
          </Plain>
          <Reveal className="flex flex-col items-start gap-4">
            <StarterDownload />
            <Disclosure show="Show the counts to record" hide="Hide the counts to record">
              <div className="flex flex-col gap-4 rounded-[14px] bg-keylime-wash p-5 sm:p-7">
                {starter.sections.map((section) => (
                  <div key={section.id} className="flex flex-col gap-1">
                    <p className="text-base leading-6 font-semibold text-forest-ink">{section.title}</p>
                    <p className="text-base leading-6 text-charcoal">{section.why}</p>
                    <ul className="list-disc pl-6 text-base leading-6 text-charcoal">
                      {section.fields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="text-base leading-6 text-charcoal">{starter.privacy[2]}</p>
                <p className="text-base leading-6 text-charcoal">
                  The full dataset, with the definitions behind each count and {starter.indicatorCount} figures to work out
                  from it, is on{" "}
                  <Link href="/insights#starter-dataset" className={LINK}>
                    the insights page
                  </Link>
                  .
                </p>
              </div>
            </Disclosure>
          </Reveal>
          <Reveal className="mt-8 flex flex-col gap-4 rounded-[14px] bg-sage-mist p-7 sm:p-10">
            <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">Where to go next</p>
            <div className="grid gap-3 md:grid-cols-3">
              <ForwardLink href="/briefing">Start the guided briefing for your area</ForwardLink>
              <ForwardLink href="/insights">See where access is hardest</ForwardLink>
              <ForwardLink href="/sources">See the full list of sources</ForwardLink>
            </div>
          </Reveal>
        </Section>

        <p className="pb-8 text-base leading-6 text-charcoal">
          <a href="#on-this-page" className={cn(LINK, "inline-flex items-center gap-2")}>
            Back to &ldquo;On this page&rdquo; <ArrowUp aria-hidden className="size-4" />
          </a>
        </p>
      </div>
    </main>
  );
}
