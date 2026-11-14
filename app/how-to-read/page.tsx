import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cn } from "cn";

import "./how-to-read.css";
import { GradeGlyph } from "@/components/insights/confidence-badge";
import {
  AnimatedNumber,
  Disclosure,
  MoreCard,
  Reveal,
} from "@/components/motion";
import { SaveShare } from "@/components/share";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TextLink } from "@/components/ui/text-link";
import { ForwardLink } from "@/components/walkthrough/parts";
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
  starter,
} from "@/lib/walkthrough/model";

export const metadata: Metadata = {
  title: "How to read these numbers | FirstLine",
  description:
    "Three things to know before you read any figure in FirstLine: what one figure counts, what “Read with care” means, and why gaps stay gaps.",
};

/** The three cards: keylime with a sage hairline, the /sources limitation look, at the card's own height. */
const CARD =
  "print-keep flex flex-col gap-4 rounded-[14px] border border-sage-mist bg-keylime-wash p-[21px] sm:p-7";
/** What a card's "Show detail" opens: stacked, so it fits a third of the page. */
const DETAIL =
  "flex flex-col gap-3 pt-2 text-base leading-relaxed text-pretty text-foreground";
const FIGURE = "numeral text-5xl leading-none text-forest-ink";

/** One of the three always-visible cards: title, the figure and its source, the main caveat, then "Show detail". */
function ReadCard({
  id,
  index,
  title,
  figure,
  children,
  detail,
}: {
  id: string;
  index: number;
  title: string;
  figure: ReactNode;
  children: ReactNode;
  detail: ReactNode;
}) {
  return (
    <Reveal as="li" index={index} className={CARD}>
      <h2 id={id} className="type-heading text-forest-ink">
        {title}
      </h2>
      {figure}
      {children}
      <Disclosure
        show="Show detail"
        hide="Hide detail"
        tone="quiet"
        className="mt-auto"
      >
        <div className={DETAIL}>{detail}</div>
      </Disclosure>
    </Reveal>
  );
}

/** A bold lead-in inside a detail panel. */
function Lead({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-forest-ink">{children}</strong>;
}

/**
 * /how-to-read: three things to know before reading any figure, each a framed card with its
 * detail behind "Show detail", then the one thing a county can start doing. Sources, limitations
 * and actions are linked, not repeated. Every figure comes from the snapshot through
 * lib/walkthrough/model.ts. No request leaves the server: no live search, no AI.
 */
export default function HowToReadPage() {
  const lead = gpWaitAreas[0];
  const gaps = pathway.filter((slot) => !slot.published);
  const careMeaning =
    gradeLevels.find((level) => level.level === "care")?.meaning ?? "";

  return (
    <main
      className={cn(
        "htr-root page-container flex flex-col gap-12 pt-4 pb-12 sm:pt-6",
        MOTION_LOUD_CLASS,
      )}
    >
      <header className="flex flex-col items-start gap-6">
        <Breadcrumb
          items={[
            { label: "Areas", href: "/" },
            { label: "How to read these numbers" },
          ]}
        />
        <Reveal className="flex max-w-[52rem] flex-col gap-3">
          <p className="type-eyebrow">How to read these numbers</p>
          <h1 className="type-page text-balance">
            Three things to know before you read any figure here.
          </h1>
        </Reveal>
        <Reveal index={1}>
          <SaveShare
            className="print:hidden"
            options={[
              { kind: "print" },
              {
                kind: "email",
                subject: "FirstLine: how to read these numbers",
                intro:
                  "Three things to know before reading any figure in FirstLine:",
              },
            ]}
          />
        </Reveal>
      </header>

      <section aria-label="Three things to know">
        <ul className="grid items-start gap-3 lg:grid-cols-3">
          {/* 1. What one figure counts */}
          {lead ? (
            <ReadCard
              id="one-figure"
              index={0}
              title="What one figure counts"
              figure={
                <div className="flex flex-col gap-2">
                  <p className={FIGURE}>
                    <AnimatedNumber
                      value={lead.value}
                      final={lead.text}
                      level="loud"
                    />
                  </p>
                  <p className="text-base text-pretty text-foreground">
                    of non-urgent GP visits in {lead.name} waited over 7 days,{" "}
                    {YEAR}.
                  </p>
                  <p className="flex flex-wrap items-center gap-2">
                    <SourceChip sourceId="sotkanet-6411" year={YEAR} />
                    {lead.grade ? (
                      <span className="inline-flex items-center gap-1.5 text-base font-semibold text-forest-ink">
                        <GradeGlyph level={lead.grade.level} />
                        {lead.grade.label}
                      </span>
                    ) : null}
                  </p>
                </div>
              }
              detail={
                <>
                  <p>
                    <Lead>It counts visits, not people.</Lead> One person can
                    make several visits.
                  </p>
                  <p>
                    <Lead>
                      It counts every non-urgent visit, not only cancer.
                    </Lead>{" "}
                    It shows how hard any GP appointment is to get.
                  </p>
                  <p>
                    <Lead>Sotkanet 6411, THL&apos;s name in English:</Lead>{" "}
                    {gpDefinition.officialName}
                  </p>
                  <p>
                    In plain words: the share of kept non-urgent GP appointments
                    that came more than 7 days after the need for care was
                    assessed. {gpDefinition.limitation}
                  </p>
                  {lead.grade ? (
                    <p>
                      <Lead>
                        Why {lead.name}&apos;s figure is marked &ldquo;
                        {lead.grade.label}&rdquo;:
                      </Lead>{" "}
                      {lead.grade.reason}
                    </p>
                  ) : null}
                  <p>
                    <Lead>&ldquo;Finland overall&rdquo;</Lead> is
                    Sotkanet&apos;s whole-country value for the same indicator
                    and year. It is a reference, not a target, and not an
                    average of the areas.
                  </p>
                </>
              }
            >
              <p className="text-base font-semibold text-pretty text-foreground">
                Visits, not people, and every non-urgent visit, not only cancer.
              </p>
            </ReadCard>
          ) : null}

          {/* 2. What "Read with care" means */}
          <ReadCard
            id="trust"
            index={1}
            title="What “Read with care” means"
            figure={
              <div className="flex flex-col gap-2">
                <p className={FIGURE}>
                  <AnimatedNumber
                    value={gpGradeCounts.care}
                    final={String(gpGradeCounts.care)}
                    decimals={0}
                    level="loud"
                  />
                  <span className="text-2xl"> of {gpGradeCounts.areas}</span>
                </p>
                <p className="text-base text-pretty text-foreground">
                  areas&apos; GP-wait figures for {YEAR} are marked to read with
                  care.
                </p>
                <p>
                  <SourceChip sourceId="sotkanet-6411" year={YEAR} />
                </p>
              </div>
            }
            detail={
              <>
                {recordingExample ? (
                  <div className="flex flex-col gap-2">
                    <p>
                      <Lead>
                        {recordingExample.name}: the share rose while recorded
                        visits fell.
                      </Lead>
                    </p>
                    <table className="w-full max-w-[20rem] text-left text-base">
                      <caption className="sr-only">
                        {recordingExample.name}, share of non-urgent GP visits
                        waiting more than 7 days, and recorded visits
                      </caption>
                      <thead>
                        <tr>
                          <td />
                          <th
                            scope="col"
                            className="pb-1 text-right font-semibold text-forest-ink"
                          >
                            {recordingExample.before.year}
                          </th>
                          <th
                            scope="col"
                            className="pb-1 text-right font-semibold text-forest-ink"
                          >
                            {recordingExample.after.year}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        <tr>
                          <th scope="row" className="pr-3 font-normal">
                            Waited over a week
                          </th>
                          <td className="pl-3 text-right font-semibold">
                            {recordingExample.before.text}
                          </td>
                          <td className="pl-3 text-right font-semibold">
                            {recordingExample.after.text}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="pr-3 font-normal">
                            Recorded visits
                          </th>
                          <td className="pl-3 text-right font-semibold">
                            {recordingExample.before.base.toLocaleString(
                              "en-GB",
                            )}
                          </td>
                          <td className="pl-3 text-right font-semibold">
                            {recordingExample.after.base.toLocaleString(
                              "en-GB",
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p>
                      <SourceChip
                        sourceId="sotkanet-6411"
                        year={recordingExample.after.year}
                      />
                    </p>
                    <p>
                      {recordingExample.grade.reason} Recorded visits are the
                      published count of late visits divided by the published
                      share. We show the published figure unchanged, labelled
                      &ldquo;
                      {recordingExample.grade.label}&rdquo;.
                    </p>
                  </div>
                ) : null}
                <p>
                  <Lead>Every figure carries one of four labels:</Lead>
                </p>
                <ul className="flex flex-col gap-2">
                  {gradeLevels.map((level) => (
                    <li key={level.level} className="flex items-start gap-2">
                      <span className="mt-[5px] text-forest-ink">
                        <GradeGlyph level={level.level} />
                      </span>
                      <span>
                        <Lead>{level.label}:</Lead> {level.meaning}
                      </span>
                    </li>
                  ))}
                </ul>
                <p>
                  <Lead>The rules, in order:</Lead>
                </p>
                <ol className="flex list-decimal flex-col gap-2 pl-6">
                  {gradeRules.map((rule) => (
                    <li key={rule.id}>
                      <Lead>{rule.label}:</Lead> {rule.rule}
                    </li>
                  ))}
                </ol>
                <p>
                  The first rule that applies sets the label. The labels are
                  ours, not THL&apos;s.
                </p>
              </>
            }
          >
            <p className="text-base font-semibold text-pretty text-foreground">
              Most often because the way visits were recorded changed.
            </p>
            <p className="text-base text-pretty text-foreground">
              {careMeaning}
            </p>
          </ReadCard>

          {/* 3. Gaps stay gaps */}
          <ReadCard
            id="not-published"
            index={2}
            title="Gaps stay gaps"
            figure={
              <div className="flex flex-col gap-2">
                <p className={FIGURE}>
                  <AnimatedNumber
                    value={pathwayGapCount}
                    final={String(pathwayGapCount)}
                    decimals={0}
                    level="loud"
                  />
                  <span className="text-2xl"> of {pathway.length}</span>
                </p>
                <p className="text-base text-pretty text-foreground">
                  steps from screening to survival have no public figure by
                  area.
                </p>
              </div>
            }
            detail={
              <>
                <p>
                  <Lead>What is missing, and what exists instead:</Lead>
                </p>
                <dl className="flex flex-col gap-3">
                  {gaps.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col items-start gap-1"
                    >
                      <dt className="font-semibold text-forest-ink">
                        {slot.title}
                      </dt>
                      <dd>
                        <strong className="font-semibold">Missing:</strong>{" "}
                        {slot.text}
                      </dd>
                      <dd>
                        <strong className="font-semibold">Instead:</strong>{" "}
                        {slot.today}
                      </dd>
                      {slot.sourceId ? (
                        <dd className="max-w-full">
                          <SourceChip sourceId={slot.sourceId} />
                        </dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
                <p>
                  <Lead>No forecasts.</Lead> A tried action shows the
                  study&apos;s own result, never a prediction for an area.
                </p>
                <p>
                  <Lead>The AI writes words, not numbers.</Lead> The AI summary
                  on an area&apos;s page keeps a sentence only if:
                </p>
                <ol className="flex list-decimal flex-col gap-1.5 pl-6">
                  <li>
                    it names a source, and every source it names is in our data;
                  </li>
                  <li>
                    every number in it matches a figure we hold for that source,
                    at the precision written;
                  </li>
                  <li>
                    every statistic it names backs at least one of its numbers;
                  </li>
                  <li>
                    no number is written in words (&ldquo;two in three&rdquo;),
                    as those cannot be checked;
                  </li>
                  <li>
                    if it uses the GP-visits figure, it never calls the visits
                    people or patients.
                  </li>
                </ol>
                <p>
                  If the AI is unavailable, a summary written in advance from
                  the same data is shown.
                </p>
                <p className="flex flex-col items-start gap-2">
                  <Badge variant="unverified">Found live — unverified</Badge>
                  <span>
                    Live web results carry this label. The question box answers
                    only from them and removes any sentence whose numbers are
                    not in the results it cites. Nobody checks the results
                    themselves.
                  </span>
                </p>
              </>
            }
          >
            <p className="text-base font-semibold text-pretty text-foreground">
              What isn&apos;t published by area is shown as missing, never
              filled in with an estimate.
            </p>
          </ReadCard>
        </ul>
      </section>

      {/* The one thing a director can act on. #from-monday is kept for old links. */}
      <section aria-labelledby="from-monday">
        <Reveal className="print-keep flex flex-col gap-4 rounded-[14px] border border-frame-border bg-cream-paper p-[21px] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <div className="flex min-w-0 flex-1 basis-[28rem] flex-col gap-1">
              <h2 id="from-monday" className="type-heading text-forest-ink">
                A county can start counting its own figures now:{" "}
                <span className="figure">{starter.fieldCount}</span> counts in{" "}
                {starter.sections.length} groups, kept once a quarter.
              </h2>
              <p className="text-base text-pretty text-foreground">
                Counts only: no names, identity codes or details about a
                patient.
              </p>
            </div>
            <ForwardLink href="/insights#starter-dataset">
              Get the recording template
            </ForwardLink>
          </div>
          <Disclosure label="the counts" tone="quiet">
            <div className="flex flex-col gap-4 pt-2 text-base leading-relaxed text-foreground md:grid md:grid-cols-2">
              {starter.sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-1">
                  <p className="font-semibold text-forest-ink">
                    {section.title}
                  </p>
                  <p className="text-pretty">{section.why}</p>
                  <ul className="list-disc pl-6">
                    {section.fields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex flex-col gap-1 md:col-span-2">
                {starter.privacy.map((line) => (
                  <p key={line} className="text-pretty">
                    {line}
                  </p>
                ))}
                <p>
                  Definitions and {starter.indicatorCount} figures to work out
                  from the counts are on{" "}
                  <TextLink kind="nav" inline href="/insights#starter-dataset">
                    the insights page
                  </TextLink>
                  .
                </p>
              </div>
            </div>
          </Disclosure>
        </Reveal>
      </section>

      <MoreCard
        title="Read next"
        className="print:hidden"
        rows={[
          {
            key: "sources",
            label: "Every source, and everything the data can't tell you",
            action: (
              <TextLink kind="nav" href="/sources">
                Sources &amp; limitations
              </TextLink>
            ),
          },
          ...(lead
            ? [
                {
                  key: "act",
                  label: "What an area can do about its wait",
                  action: (
                    <TextLink kind="nav" href={`/county/${lead.id}/act`}>
                      Recommended actions
                    </TextLink>
                  ),
                },
              ]
            : []),
        ]}
      />
    </main>
  );
}
