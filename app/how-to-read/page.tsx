import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

import "./how-to-read.css";
import { GradeGlyph } from "@/components/insights/confidence-badge";
import {
  AnimatedNumber,
  Chunk,
  ChunkFigure,
  Disclosure,
  FocusGroup,
  Reveal,
  ScrollStory,
} from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { FigurePicture } from "@/components/walkthrough/figure-picture";
import { ForwardLink, longDate } from "@/components/walkthrough/parts";
import { PathwayPicture } from "@/components/walkthrough/pathway-picture";
import type { GradeLevel } from "@/lib/insights";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import {
  YEAR,
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
  { id: "trust", name: "How much to trust a figure" },
  { id: "not-published", name: "What Finland does not publish" },
  { id: "what-we-did", name: "What we did about it" },
  { id: "from-monday", name: "What a county can do" },
] as const;

const LINK =
  "rounded-sm font-semibold text-forest-ink underline underline-offset-4 hover:text-forest-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink";

/** What a "Show …" button opens. */
const DETAIL =
  "flex flex-col gap-3 rounded-[14px] bg-keylime-wash p-5 text-base leading-6 text-charcoal sm:p-7";
/** A chunk that only opens a story: no screen-height reserved, the story follows at once. */
const STORY_LEAD = "pb-6 sm:pb-8 lg:min-h-0";
/** A figure in the two-year table. */
const NUM_CELL =
  "numeral text-[2.25rem] leading-tight text-forest-ink sm:text-5xl";
/** A list whose rows are split by hairlines, with no box around each row. */
const ROWS =
  "flex flex-col divide-y divide-border rounded-[14px] bg-keylime-wash px-7 sm:px-10";

const GLYPHS: Record<GradeLevel, ReactNode> = {
  solid: <GradeGlyph level="solid" />,
  care: <GradeGlyph level="care" />,
  shared: <GradeGlyph level="shared" />,
  none: <GradeGlyph level="none" />,
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

/** One text block of a ScrollStory: a short statement and at most one plain sentence. */
function StoryStep({
  statement,
  sentence,
}: {
  statement: string;
  sentence?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-[1.75rem] leading-[1.3] font-light text-forest-ink">
        {statement}
      </p>
      {sentence ? (
        <p className="text-lg leading-8 text-charcoal">{sentence}</p>
      ) : null}
    </div>
  );
}

/** "A, B and C". */
function listNames(names: string[]): string {
  return names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * /how-to-read: where FirstLine's numbers come from and what they cannot say, told on scroll as
 * one chunk per idea (the shared Chunk and ScrollStory). Every figure comes from the snapshot
 * through lib/walkthrough/model.ts. No request leaves the server: no live search, no AI.
 */
export default function HowToReadPage() {
  const gpLead = gpWaitAreas[0];
  const gaps = pathway.filter((slot) => !slot.published);

  return (
    <main className={cn("htr-root", MOTION_LOUD_CLASS)}>
      {/* Always in view: the way to the full list of sources. */}
      <div className="sticky top-0 z-20 border-b border-frame-border bg-cream-paper print:hidden">
        <div className="page-container flex min-h-14 items-center justify-end py-2">
          <Link href="/sources" className={cn(LINK, "text-base")}>
            See the full list of sources
          </Link>
        </div>
      </div>

      <div className="page-container">
        <header className="flex max-w-[52rem] flex-col gap-8 pt-12 pb-8 sm:pt-20">
          <Reveal>
            <h1 className="font-display text-[2.5rem] leading-[1.1] font-light text-forest-ink sm:text-[3.5rem]">
              How to read these numbers
            </h1>
          </Reveal>
          <Reveal index={1}>
            <nav aria-labelledby="on-this-page">
              <h2
                id="on-this-page"
                className="text-base font-semibold text-forest-ink"
              >
                On this page
              </h2>
              <ol className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {SECTIONS.map((section, index) => (
                  <li
                    key={section.id}
                    className="flex gap-2 text-base leading-7"
                  >
                    <span className="text-charcoal tabular-nums">
                      {index + 1}.
                    </span>
                    <a href={`#${section.id}`} className={LINK}>
                      {section.name}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </header>

        <FocusGroup>
          {/* 1. Where the numbers come from */}
          <Chunk
            id={SECTIONS[0].id}
            eyebrow={SECTIONS[0].name}
            statement="Every number here comes from a public source you can open."
            figure={
              <ChunkFigure
                unit={`public sources, ${studyCount} of them studies and national documents`}
              >
                <AnimatedNumber
                  value={sourceCount}
                  final={String(sourceCount)}
                  decimals={0}
                  level="loud"
                />
              </ChunkFigure>
            }
            meaning={`Our copy was taken on ${longDate(retrieved)} and is shown unchanged.`}
          >
            <div className="flex flex-col gap-6">
              <ul className={ROWS}>
                {sourceGroups.map((group) => (
                  <li key={group.id} className="flex flex-col gap-2 py-6">
                    <h3 className="text-lg leading-7 font-semibold text-forest-ink">
                      {group.who}
                    </h3>
                    <p className="text-base leading-6 text-charcoal">
                      {group.what}
                    </p>
                    <p className="flex flex-wrap gap-2">
                      {group.sources.map((source) => (
                        <SourceChip
                          key={source.source_id}
                          sourceId={source.source_id}
                        />
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
              <Disclosure
                show="Show when each publisher last updated its figures"
                hide="Hide the update dates"
              >
                <dl
                  className={cn(
                    DETAIL,
                    "grid sm:grid-cols-[minmax(0,1fr)_12rem]",
                  )}
                >
                  {sourceGroups.flatMap((group) =>
                    group.sources.map((source) => (
                      <div key={source.source_id} className="contents">
                        <dt>{source.name}</dt>
                        <dd className="font-semibold max-sm:mb-2">
                          {longDate(source.data_updated)}
                        </dd>
                      </div>
                    )),
                  )}
                </dl>
              </Disclosure>
            </div>
          </Chunk>

          {/* 2. What one figure really counts */}
          {gpLead ? (
            <>
              <Chunk
                id={SECTIONS[1].id}
                eyebrow={SECTIONS[1].name}
                statement="A figure counts exactly one thing."
                className={STORY_LEAD}
              />
              <div className="flex flex-col items-start gap-6">
                <ScrollStory
                  className="w-full"
                  label={`${gpLead.name}'s share of non-urgent GP visits that waited more than a week, and what the figure counts`}
                  picture={
                    <FigurePicture
                      areas={gpWaitAreas}
                      year={YEAR}
                      glyphs={GLYPHS}
                      source={
                        <Sources
                          items={[{ id: "sotkanet-6411", year: YEAR }]}
                        />
                      }
                    />
                  }
                  steps={[
                    <StoryStep
                      key="visits"
                      statement="It counts visits, not people."
                      sentence="One person can make several visits."
                    />,
                    <StoryStep
                      key="cancer"
                      statement="It counts every non-urgent visit, not only cancer."
                      sentence="It shows how hard any GP appointment is to get."
                    />,
                  ]}
                />
                <div data-focus-item="" className="w-full pb-16">
                  <Disclosure
                    show="Show the official definition"
                    hide="Hide the official definition"
                    className="w-full"
                  >
                    <div className={DETAIL}>
                      <p className="font-semibold text-forest-ink">
                        Sotkanet 6411, THL&apos;s name in English
                      </p>
                      <p>{gpDefinition.officialName}</p>
                      <p>
                        In plain words: the share of kept non-urgent GP
                        appointments that came more than 7 days after the need
                        for care was assessed.
                      </p>
                      <p>{gpDefinition.limitation}</p>
                    </div>
                  </Disclosure>
                </div>
              </div>
            </>
          ) : null}

          {/* 3. How much to trust a figure: the count of labels, then the two cases a director meets most. */}
          <Chunk
            id={SECTIONS[2].id}
            eyebrow={SECTIONS[2].name}
            statement="Every figure carries a label: how far to trust it."
            figure={
              <ChunkFigure
                unit={`of ${gpGradeCounts.areas} areas' GP-wait figures for ${YEAR} are marked to read with care`}
              >
                <AnimatedNumber
                  value={gpGradeCounts.care}
                  final={String(gpGradeCounts.care)}
                  decimals={0}
                  level="loud"
                />
              </ChunkFigure>
            }
            meaning="Most often because the way visits were recorded changed."
            source={<Sources items={[{ id: "sotkanet-6411", year: YEAR }]} />}
          >
            <Disclosure
              show="Show the labels and the rules behind them"
              hide="Hide the labels and rules"
            >
              <div className={DETAIL}>
                <ul className="flex flex-col gap-2">
                  {gradeLevels.map((level) => (
                    <li key={level.level} className="flex items-start gap-2">
                      <span className="mt-[5px] text-forest-ink">
                        {GLYPHS[level.level]}
                      </span>
                      <span>
                        <strong className="font-semibold text-forest-ink">
                          {level.label}:
                        </strong>{" "}
                        {level.meaning}
                      </span>
                    </li>
                  ))}
                </ul>
                <ol className="flex list-decimal flex-col gap-2 pl-6">
                  {gradeRules.map((rule) => (
                    <li key={rule.id}>
                      <strong className="font-semibold text-forest-ink">
                        {rule.label}:
                      </strong>{" "}
                      {rule.rule}
                    </li>
                  ))}
                </ol>
                <p>
                  The first rule that applies sets the label. The labels are
                  ours, not THL&apos;s.
                </p>
              </div>
            </Disclosure>
          </Chunk>

          {recordingExample ? (
            <Chunk
              as="h3"
              statement={`${recordingExample.name}: the share rose while recorded visits fell.`}
              figure={
                <table className="text-left text-base text-charcoal">
                  <caption className="sr-only">
                    {recordingExample.name}, share of non-urgent GP visits
                    waiting more than 7 days, and recorded visits
                  </caption>
                  <thead>
                    <tr>
                      <td />
                      <th
                        scope="col"
                        className="pr-4 sm:pr-8 pb-2 font-semibold text-forest-ink"
                      >
                        {recordingExample.before.year}
                      </th>
                      <th
                        scope="col"
                        className="pb-2 font-semibold text-forest-ink"
                      >
                        {recordingExample.after.year}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th
                        scope="row"
                        className="pr-4 sm:pr-8 text-base font-semibold text-charcoal"
                      >
                        Waited over a week
                      </th>
                      <td className={cn(NUM_CELL, "pr-4 sm:pr-8")}>
                        <AnimatedNumber
                          value={recordingExample.before.value}
                          final={recordingExample.before.text}
                          level="loud"
                        />
                      </td>
                      <td className={NUM_CELL}>
                        <AnimatedNumber
                          value={recordingExample.after.value}
                          final={recordingExample.after.text}
                          level="loud"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th
                        scope="row"
                        className="pr-4 sm:pr-8 text-base font-semibold text-charcoal"
                      >
                        Recorded visits
                      </th>
                      <td className={cn(NUM_CELL, "pr-4 sm:pr-8")}>
                        <AnimatedNumber
                          value={recordingExample.before.base}
                          final={recordingExample.before.base.toLocaleString(
                            "en-GB",
                          )}
                          decimals={0}
                          level="loud"
                        />
                      </td>
                      <td className={NUM_CELL}>
                        <AnimatedNumber
                          value={recordingExample.after.base}
                          final={recordingExample.after.base.toLocaleString(
                            "en-GB",
                          )}
                          decimals={0}
                          level="loud"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              }
              source={
                <Sources
                  items={[
                    { id: "sotkanet-6411", year: recordingExample.after.year },
                  ]}
                />
              }
              caveat={{
                short: "part of the rise may be in what was recorded.",
                why: (
                  <>
                    {recordingExample.grade.reason} Recorded visits are the
                    published count of late visits divided by the published
                    share. We show the published figure unchanged, labelled
                    &ldquo;{recordingExample.grade.label}&rdquo;.
                  </>
                ),
              }}
            />
          ) : null}

          {sharedReferral ? (
            <Chunk
              as="h3"
              statement={`${sharedReferral.areas.length} areas in Uusimaa share one referral figure.`}
              figure={
                <ChunkFigure
                  unit={`of referrals processed within 3 days at ${sharedReferral.hospital}, ${YEAR}`}
                >
                  <AnimatedNumber
                    value={sharedReferral.value}
                    final={sharedReferral.text}
                    level="loud"
                  />
                </ChunkFigure>
              }
              meaning={`${listNames(sharedReferral.areas.map((area) => area.name))} all show this one value.`}
              source={
                <Sources
                  items={[
                    { id: "sotkanet-13", year: YEAR },
                    ...(sharedReferral.confirmedBy
                      ? [{ id: sharedReferral.confirmedBy }]
                      : []),
                  ]}
                />
              }
              caveat={{
                short: `this is the value of ${sharedReferral.hospital}, never one area's own.`,
                why: (
                  <>
                    {sharedReferral.hospital}, the Helsinki University Hospital
                    group, handles these areas&apos; referrals, and Sotkanet
                    publishes one value for it, not one per area. FirstLine
                    labels it &ldquo;Shared hospital value&rdquo;. It counts all
                    referrals, not only cancer.
                  </>
                ),
              }}
            />
          ) : null}

          {/* 4. What Finland does not publish */}
          <Chunk
            id={SECTIONS[3].id}
            eyebrow={SECTIONS[3].name}
            statement={`Of ${pathway.length} steps from screening to survival, ${pathwayGapCount} have no public figure by area.`}
            className={STORY_LEAD}
          />
          <div className="flex flex-col items-start gap-6">
            <ScrollStory
              className="w-full"
              label={`The cancer pathway in ${pathway.length} steps: which have a published figure by area, and which do not`}
              picture={<PathwayPicture slots={pathway} />}
              steps={[
                <StoryStep
                  key="published"
                  statement={`${pathway.length - pathwayGapCount} steps are published.`}
                />,
                <StoryStep
                  key="empty"
                  statement={`${pathwayGapCount} steps are empty.`}
                />,
                <StoryStep
                  key="gap"
                  statement="A gap stays a gap."
                  sentence="We never fill one with an estimate."
                />,
              ]}
            />
            <div data-focus-item="" className="w-full pb-16">
              <Disclosure
                show="Show what is missing, and what exists instead"
                hide="Hide what is missing"
                className="w-full"
              >
                <dl
                  className={cn(
                    DETAIL,
                    "grid sm:grid-cols-[14rem_minmax(0,1fr)]",
                  )}
                >
                  {gaps.map((slot) => (
                    <div key={slot.id} className="contents">
                      <dt className="font-semibold text-forest-ink">
                        {slot.title}
                      </dt>
                      <dd className="flex flex-col items-start gap-2 max-sm:mb-3">
                        <span>
                          <strong className="font-semibold">Missing:</strong>{" "}
                          {slot.text}
                        </span>
                        <span>
                          <strong className="font-semibold">Instead:</strong>{" "}
                          {slot.today}
                        </span>
                        {slot.sourceId ? (
                          <SourceChip sourceId={slot.sourceId} />
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Disclosure>
            </div>
          </div>

          {/* 5. What we did about it */}
          <Chunk
            id={SECTIONS[4].id}
            eyebrow={SECTIONS[4].name}
            statement="No invented numbers. No forecasts."
          >
            <ul className={ROWS}>
              <li className="flex flex-col gap-2 py-6">
                <h3 className="text-lg leading-7 font-semibold text-forest-ink">
                  Results elsewhere, not predictions
                </h3>
                <p className="text-base leading-6 text-charcoal">
                  A tried action shows the study&apos;s own result, never a
                  forecast.
                </p>
              </li>
              <li className="flex flex-col items-start gap-2 py-6">
                <h3 className="text-lg leading-7 font-semibold text-forest-ink">
                  The AI writes words, not numbers
                </h3>
                <p className="text-base leading-6 text-charcoal">
                  A checker deletes any AI sentence whose number is not in our
                  data.
                </p>
                <Disclosure
                  show="Show what the checker removes"
                  hide="Hide what the checker removes"
                  tone="quiet"
                >
                  <div className="flex flex-col gap-2 text-base leading-6 text-charcoal">
                    <p>
                      The AI summary on an area&apos;s page keeps a sentence
                      only if:
                    </p>
                    <ol className="flex list-decimal flex-col gap-1.5 pl-6">
                      <li>
                        it names a source, and every source it names is in our
                        data;
                      </li>
                      <li>
                        every number in it matches a figure we hold for that
                        source, at the precision written;
                      </li>
                      <li>
                        every statistic it names backs at least one of its
                        numbers;
                      </li>
                      <li>
                        no number is written in words (&ldquo;two in
                        three&rdquo;), as those cannot be checked;
                      </li>
                      <li>
                        if it uses the GP-visits figure, it never calls the
                        visits people or patients.
                      </li>
                    </ol>
                    <p>
                      If the AI is unavailable, a summary written in advance
                      from the same data is shown.
                    </p>
                  </div>
                </Disclosure>
              </li>
              <li className="flex flex-col items-start gap-2 py-6">
                <h3 className="text-lg leading-7 font-semibold text-forest-ink">
                  Live web results carry this label
                </h3>
                <Badge variant="unverified">Found live — unverified</Badge>
                <Disclosure
                  show="Show how live results are checked"
                  hide="Hide how live results are checked"
                  tone="quiet"
                >
                  <p className="text-base leading-6 text-charcoal">
                    The question box answers only from the live results, and
                    removes any sentence whose numbers are not in the results it
                    cites. Nobody checks the results themselves.
                  </p>
                </Disclosure>
              </li>
            </ul>
          </Chunk>

          {/* 6. What a county can do */}
          <Chunk
            id={SECTIONS[5].id}
            eyebrow={SECTIONS[5].name}
            statement="A county can start counting its own figures now."
            figure={
              <ChunkFigure
                unit={`counts in ${starter.sections.length} groups, kept once a quarter`}
              >
                <AnimatedNumber
                  value={starter.fieldCount}
                  final={String(starter.fieldCount)}
                  decimals={0}
                  level="loud"
                />
              </ChunkFigure>
            }
            meaning="Counts only: no names, identity codes or details about a patient."
          >
            <div className="flex flex-col items-start gap-6">
              <ForwardLink href="/insights#starter-dataset">
                Get the recording template
              </ForwardLink>
              <Disclosure
                show="Show the counts to record"
                hide="Hide the counts to record"
                className="w-full"
              >
                <div className={DETAIL}>
                  {starter.sections.map((section) => (
                    <div key={section.id} className="flex flex-col gap-1">
                      <p className="font-semibold text-forest-ink">
                        {section.title}
                      </p>
                      <p>{section.why}</p>
                      <ul className="list-disc pl-6">
                        {section.fields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {starter.privacy.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p>
                    Definitions and {starter.indicatorCount} figures to work out
                    from the counts:{" "}
                    <Link href="/insights#starter-dataset" className={LINK}>
                      the insights page
                    </Link>
                    .
                  </p>
                </div>
              </Disclosure>
              <div className="mt-8 grid w-full gap-3 md:max-w-[44rem] md:grid-cols-2">
                <ForwardLink href="/briefing">
                  Start the guided briefing for your area
                </ForwardLink>
                <ForwardLink href="/insights">
                  See where access is hardest
                </ForwardLink>
              </div>
            </div>
          </Chunk>
        </FocusGroup>
      </div>
    </main>
  );
}
