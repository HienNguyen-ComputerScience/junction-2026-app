import { ArrowUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

import "./how-to-read.css";
import { GradeGlyph } from "@/components/insights/confidence-badge";
import { StarterDownload } from "@/components/insights/starter-dataset";
import { AnimatedBar, AnimatedNumber, Disclosure, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { FigurePicture } from "@/components/walkthrough/figure-picture";
import { ForwardLink, Section, Statement, longDate } from "@/components/walkthrough/parts";
import { PathwayPicture } from "@/components/walkthrough/pathway-picture";
import { Story } from "@/components/walkthrough/story";
import type { GradeLevel } from "@/lib/insights";
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
/** What a "Show …" button opens. */
const DETAIL = "flex flex-col gap-3 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:p-7";
/** A figure set large. */
const NUMERAL = "numeral text-7xl leading-none text-forest-ink";
/** A short statement inside a story block or a panel. */
const SMALL_STATEMENT = "font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink";

const GLYPHS: Record<GradeLevel, ReactNode> = {
  solid: <GradeGlyph level="solid" />,
  care: <GradeGlyph level="care" />,
  shared: <GradeGlyph level="shared" />,
  none: <GradeGlyph level="none" />,
};

/** The grades in a few words each. The full meaning and the rules are behind "Show the rules". */
const LEVEL_SHORT: Record<GradeLevel, string> = {
  solid: "Published, and the count behind it is steady.",
  care: "Published, but how it was recorded or what it covers may mislead.",
  shared: "One value for a wider hospital area, not this area alone.",
  none: "Nobody publishes it for this area and year.",
};

/** Source chips, with "Source:" before them. */
function Sources({ items }: { items: { id: string; year?: number }[] }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-forest-ink">
      Source:
      {items.map((item) => (
        <SourceChip key={item.id} sourceId={item.id} year={item.year} />
      ))}
    </p>
  );
}

/** A caveat in one short line beside its figure; the detail sits behind "Why?". */
function Caveat({ children, why }: { children: ReactNode; why: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[14px] bg-cream-paper px-4 py-2">
      <span className="text-base leading-6 font-semibold text-forest-ink">{children}</span>
      <Disclosure show="Why?" hide="Hide why" tone="quiet" className="basis-full sm:basis-auto">
        <div className="flex flex-col gap-2 pb-2 text-base leading-6 text-charcoal">{why}</div>
      </Disclosure>
    </div>
  );
}

/**
 * /how-to-read: where FirstLine's numbers come from and what they cannot say, as one long page
 * that reveals itself in small pieces as it is read. Every figure comes from the snapshot through
 * lib/walkthrough/model.ts. No request leaves the server: no live search, no AI.
 */
export default function HowToReadPage() {
  const gpLead = gpWaitAreas[0];
  const gaps = pathway.filter((slot) => !slot.published);

  return (
    <main className={cn("htr-root", MOTION_LOUD_CLASS)}>
      {/* Always in view: the way to the full list of sources. */}
      <div className="sticky top-0 z-20 border-b border-frame-border bg-cream-paper print:hidden">
        <div className="page-container flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <p className="text-base font-semibold text-forest-ink">How to read these numbers</p>
          <Link href="/sources" className={cn(LINK, "text-base")}>
            See the full list of sources
          </Link>
        </div>
      </div>

      <div className="page-container">
        <header className="flex max-w-[52rem] flex-col gap-8 pt-12 pb-16 sm:pt-20">
          <Reveal>
            <h1 className="font-display text-[2.5rem] leading-[1.1] font-light text-forest-ink sm:text-[3.5rem]">
              How to read these numbers
            </h1>
          </Reveal>
          <Reveal index={1}>
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
          <Statement>Every number here comes from a public source you can open.</Statement>
          <Reveal index={2} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={NUMERAL}>
              <AnimatedNumber value={sourceCount} final={String(sourceCount)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">public sources, {studyCount} of them studies and national documents.</span>
          </Reveal>
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
          <Reveal className="flex flex-col items-start gap-4">
            <Caveat why={<p>We change nothing in them. Each publisher&apos;s last update is in the table below.</p>}>
              Our copy was taken on {longDate(retrieved)}.
            </Caveat>
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
                  The studies are on{" "}
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
            <Statement>A figure counts exactly one thing.</Statement>
            <Story
              label={`${gpLead.name}'s share of non-urgent GP visits that waited more than a week, and what the figure counts`}
              picture={
                <FigurePicture
                  areas={gpWaitAreas}
                  finland={finlandGpWait}
                  year={YEAR}
                  glyphs={GLYPHS}
                  source={<Sources items={[{ id: "sotkanet-6411", year: YEAR }]} />}
                />
              }
              blocks={[
                <Fragment key="visits">
                  <p className={SMALL_STATEMENT}>It counts visits, not people.</p>
                  <p className="text-lg leading-8 text-charcoal">One person can make several visits.</p>
                </Fragment>,
                <Fragment key="cancer">
                  <p className={SMALL_STATEMENT}>It counts every non-urgent visit, not only cancer.</p>
                  <p className="text-lg leading-8 text-charcoal">It shows how hard any GP appointment is to get.</p>
                </Fragment>,
              ]}
            />
            <Reveal>
              <Disclosure show="Show the official definition" hide="Hide the official definition">
                <div className={DETAIL}>
                  <p className="font-semibold text-forest-ink">Sotkanet 6411, THL&apos;s name in English</p>
                  <p>{gpDefinition.officialName}</p>
                  <p>
                    In plain words: the share of kept non-urgent GP appointments that came more than 7 days after the need
                    for care was assessed.
                  </p>
                  <p>{gpDefinition.limitation}</p>
                </div>
              </Disclosure>
            </Reveal>
          </Section>
        ) : null}

        {/* 3. Why some areas share a number */}
        {sharedReferral ? (
          <Section id={SECTIONS[2].id} name={SECTIONS[2].name}>
            <Statement>{sharedReferral.areas.length} areas in Uusimaa share one referral figure.</Statement>
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
                  <span
                    key={area.id}
                    className="block h-px w-16 animate-line-in bg-forest-ink"
                    style={{ "--i": index + 1 } as CSSProperties}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-[14px] bg-cream-paper p-6">
                <p className="text-base font-semibold text-forest-ink">
                  One value for all {sharedReferral.areas.length}: {sharedReferral.hospital}, the Helsinki University Hospital
                  group
                </p>
                <p className="numeral text-6xl leading-none text-forest-ink">
                  <AnimatedNumber value={sharedReferral.value} final={sharedReferral.text} decimals={1} level="loud" />
                </p>
                <p className="text-base leading-6 text-charcoal">
                  of referrals processed within 3 days, {YEAR}
                  {sharedReferral.finland ? ` (Finland ${sharedReferral.finland})` : ""}.
                </p>
              </div>
            </Reveal>
            <Reveal className="flex flex-col items-start gap-4">
              <Caveat
                why={
                  <>
                    <p>
                      Their referrals go to {sharedReferral.hospital}, and Sotkanet publishes one value for it, not one per
                      area.
                    </p>
                    <p>On FirstLine it is always labelled shared. It counts all referrals, not only cancer.</p>
                  </>
                }
              >
                Never one area&apos;s own figure.
              </Caveat>
              <Sources
                items={[
                  { id: "sotkanet-13", year: YEAR },
                  ...(sharedReferral.confirmedBy ? [{ id: sharedReferral.confirmedBy }] : []),
                ]}
              />
              {sharedReferral.gap ? (
                <Disclosure show="Show what is missing, and who could publish it" hide="Hide what is missing">
                  <dl className="grid gap-x-6 gap-y-2 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-7">
                    <dt className="font-semibold text-forest-ink">Not published</dt>
                    <dd>{sharedReferral.gap.missing}</dd>
                    <dt className="font-semibold text-forest-ink">What exists instead</dt>
                    <dd>{sharedReferral.gap.today}</dd>
                    <dt className="font-semibold text-forest-ink">Who could publish it (our proposal)</dt>
                    <dd>{sharedReferral.gap.couldPublish}</dd>
                  </dl>
                </Disclosure>
              ) : null}
            </Reveal>
          </Section>
        ) : null}

        {/* 4. How much to trust a figure */}
        <Section id={SECTIONS[3].id} name={SECTIONS[3].name}>
          <Statement>Every figure carries a label: how far to trust it.</Statement>
          <ul className="grid gap-4 sm:grid-cols-2">
            {gradeLevels.map((level, index) => (
              <Reveal as="li" key={level.level} index={index} className={cn(PANEL, "flex flex-col gap-2")}>
                <p className="flex items-center gap-2 text-lg leading-7 font-semibold text-forest-ink">
                  <GradeGlyph level={level.level} className="size-4" />
                  {level.label}
                </p>
                <p className="text-base leading-6 text-charcoal">{LEVEL_SHORT[level.level]}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={NUMERAL}>
              <AnimatedNumber value={gpGradeCounts.care} final={String(gpGradeCounts.care)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">
              of {gpGradeCounts.areas} areas&apos; GP-wait figures for {YEAR} are labelled &ldquo;read with care&rdquo;.
            </span>
          </Reveal>
          {recordingExample ? (
            <Reveal className={cn(PANEL, "flex flex-col gap-6")}>
              <h3 className={SMALL_STATEMENT}>{recordingExample.name}: the share rose while recorded visits fell.</h3>
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
              <Caveat
                why={
                  <>
                    <p>{recordingExample.grade.reason}</p>
                    <p>Recorded visits are the published count of late visits divided by the published share.</p>
                    <p>We show the published figure unchanged, with this label.</p>
                  </>
                }
              >
                <span className="inline-flex items-center gap-2">
                  {GLYPHS[recordingExample.grade.level]}
                  {recordingExample.grade.label}: part of the rise may be in the recording.
                </span>
              </Caveat>
              <Sources items={[{ id: "sotkanet-6411", year: recordingExample.after.year }]} />
            </Reveal>
          ) : null}
          <Reveal>
            <Disclosure show="Show the rules, in the order we apply them" hide="Hide the rules">
              <div className={DETAIL}>
                <ul className="flex flex-col gap-2">
                  {gradeLevels.map((level) => (
                    <li key={level.level}>
                      <strong className="font-semibold text-forest-ink">{level.label}:</strong> {level.meaning}
                    </li>
                  ))}
                </ul>
                <ol className="flex list-decimal flex-col gap-2 pl-6">
                  {gradeRules.map((rule) => (
                    <li key={rule.id}>
                      <strong className="font-semibold text-forest-ink">{rule.label}:</strong> {rule.rule}
                    </li>
                  ))}
                </ol>
                <p>The first rule that applies sets the label. The labels are ours, not THL&apos;s.</p>
              </div>
            </Disclosure>
          </Reveal>
        </Section>

        {/* 5. What Finland does not publish */}
        <Section id={SECTIONS[4].id} name={SECTIONS[4].name}>
          <Statement>
            Of {pathway.length} steps from screening to survival, {pathwayGapCount} have no public figure by area.
          </Statement>
          <Story
            label={`The cancer pathway in ${pathway.length} steps: which have a published figure by area, and which do not`}
            picture={<PathwayPicture slots={pathway} />}
            blocks={[
              <Fragment key="published">
                <p className={SMALL_STATEMENT}>{pathway.length - pathwayGapCount} steps are published.</p>
              </Fragment>,
              <Fragment key="empty">
                <p className={SMALL_STATEMENT}>{pathwayGapCount} steps are empty.</p>
              </Fragment>,
              <Fragment key="gap">
                <p className={SMALL_STATEMENT}>A gap stays a gap.</p>
                <p className="text-lg leading-8 text-charcoal">We never fill one with an estimate.</p>
              </Fragment>,
            ]}
          />
          <Reveal>
            <Disclosure show="Show what is missing, and what exists instead" hide="Hide what is missing">
              <dl className="grid gap-x-6 gap-y-3 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-7">
                {gaps.map((slot) => (
                  <div key={slot.id} className="contents">
                    <dt className="font-semibold text-forest-ink">{slot.title}</dt>
                    <dd className="flex flex-col items-start gap-2">
                      <span>
                        <strong className="font-semibold">Missing:</strong> {slot.text}
                      </span>
                      <span>
                        <strong className="font-semibold">Instead:</strong> {slot.today}
                      </span>
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
              <p className="text-base leading-6 text-charcoal">Each number shows its source and year.</p>
            </Reveal>
            <Reveal as="li" index={1} className={cn(PANEL, "flex flex-col gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">Results elsewhere, not predictions</h3>
              <p className="text-base leading-6 text-charcoal">A tried action shows the study&apos;s own result, never a forecast.</p>
            </Reveal>
            <Reveal as="li" index={2} className={cn(PANEL, "flex flex-col items-start gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">The AI writes words, not numbers</h3>
              <p className="text-base leading-6 text-charcoal">A checker deletes any AI sentence whose number is not in our data.</p>
              <Disclosure show="Show what the checker removes" hide="Hide what the checker removes" tone="quiet">
                <div className="flex flex-col gap-2 text-base leading-6 text-charcoal">
                  <p>The AI summary on an area&apos;s page keeps a sentence only if:</p>
                  <ol className="flex list-decimal flex-col gap-1.5 pl-6">
                    <li>it names a source, and every source it names is in our data;</li>
                    <li>every number in it matches a figure we hold for that source, at the precision written;</li>
                    <li>every statistic it names backs at least one of its numbers;</li>
                    <li>no number is written in words (&ldquo;two in three&rdquo;), as those cannot be checked;</li>
                    <li>if it uses the GP-visits figure, it never calls the visits people or patients.</li>
                  </ol>
                  <p>If the AI is unavailable, a summary written in advance from the same data is shown.</p>
                </div>
              </Disclosure>
            </Reveal>
            <Reveal as="li" index={3} className={cn(PANEL, "flex flex-col items-start gap-2")}>
              <h3 className="text-lg leading-7 font-semibold text-forest-ink">Live web results are labelled</h3>
              <Badge variant="unverified">Found live — unverified</Badge>
              <Disclosure show="Show how live results are checked" hide="Hide how live results are checked" tone="quiet">
                <p className="text-base leading-6 text-charcoal">
                  The question box answers only from the live results, and removes any sentence whose numbers are not in the
                  results it cites. Nobody checks the results themselves.
                </p>
              </Disclosure>
            </Reveal>
          </ol>
        </Section>

        {/* 7. What a county can do from Monday */}
        <Section id={SECTIONS[6].id} name={SECTIONS[6].name}>
          <Statement>A county can start counting its own figures now.</Statement>
          <Reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={NUMERAL}>
              <AnimatedNumber value={starter.fieldCount} final={String(starter.fieldCount)} decimals={0} level="loud" />
            </span>
            <span className="text-lg text-charcoal">counts in {starter.sections.length} groups, kept once a quarter.</span>
          </Reveal>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starter.sections.map((section, index) => (
              <Reveal as="li" key={section.id} index={index} className="rounded-[14px] bg-keylime-wash p-6">
                <span className="text-base leading-6 font-semibold text-forest-ink">{section.title}</span>
              </Reveal>
            ))}
          </ol>
          <Reveal className="flex flex-col items-start gap-4">
            <Caveat
              why={
                <>
                  {starter.privacy.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </>
              }
            >
              Counts only: no patient data.
            </Caveat>
            <StarterDownload />
            <Disclosure show="Show the counts to record" hide="Hide the counts to record">
              <div className={DETAIL}>
                {starter.sections.map((section) => (
                  <div key={section.id} className="flex flex-col gap-1">
                    <p className="font-semibold text-forest-ink">{section.title}</p>
                    <p>{section.why}</p>
                    <ul className="list-disc pl-6">
                      {section.fields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p>
                  Definitions and {starter.indicatorCount} figures to work out from the counts:{" "}
                  <Link href="/insights#starter-dataset" className={LINK}>
                    the insights page
                  </Link>
                  .
                </p>
              </div>
            </Disclosure>
          </Reveal>
          <Reveal className="mt-8 flex flex-col gap-4 rounded-[14px] bg-sage-mist p-7 sm:p-10">
            <h3 className={SMALL_STATEMENT}>Where to go next</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <ForwardLink href="/briefing">Start the guided briefing for your area</ForwardLink>
              <ForwardLink href="/insights">See where access is hardest</ForwardLink>
              <ForwardLink href="/sources">See the full list of sources</ForwardLink>
            </div>
          </Reveal>
        </Section>

        <p className="pb-8 text-base leading-6 print:hidden">
          <a href="#on-this-page" className={cn(LINK, "inline-flex items-center gap-2")}>
            Back to &ldquo;On this page&rdquo; <ArrowUp aria-hidden className="size-4" />
          </a>
        </p>
      </div>
    </main>
  );
}
