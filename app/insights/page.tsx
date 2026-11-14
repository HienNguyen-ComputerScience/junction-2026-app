import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { cn } from "cn";

import { ConfidenceBadge } from "@/components/insights/confidence-badge";
import { Goal3Detail } from "@/components/insights/goal3-link";
import { GradingRulesBody } from "@/components/insights/grading-rules";
import { GpWaitWarningTable, PathwayStepsRow, StarterFields } from "@/components/insights/insights-story";
import { AreaTable, NO_WAY_ROUND_CAVEATS, TestsTable } from "@/components/insights/no-way-round";
import { NoWayRoundTiles, type TileLevel } from "@/components/insights/no-way-round-tiles";
import { PathwayRow } from "@/components/insights/pathway-row";
import { StarterDownload } from "@/components/insights/starter-dataset";
import { AnimatedNumber, CaveatNote, Disclosure, Reveal } from "@/components/motion";
import { SaveShare } from "@/components/share";
import { SourceChip } from "@/components/source-chip";
import { dataGaps } from "@/lib/data";
import {
  earlyWarning,
  formatValue,
  getPathwayRow,
  type NwrArea,
  noWayRound,
  pathwayAreas,
  rules,
  starterDataset,
} from "@/lib/insights";
import { MOTION_LOUD_CLASS } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Where access is hardest | FirstLine",
  description:
    "Where a long GP wait meets few other routes to a doctor, which area's wait is plainly getting worse, which steps of the cancer pathway nobody publishes, and what a county can start recording.",
};

const DEFAULT_AREA = noWayRound.robust_areas[0] ?? pathwayAreas[0].id;
const TESTS = noWayRound.tests.length;
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];
const word = (n: number) => WORDS[n] ?? String(n);
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const FINLAND_WAIT = formatValue("6411", noWayRound.finland.wait);

function tileLevel(a: NwrArea): TileLevel {
  if (a.tier === "every") return 3;
  if (a.group === "long-few") return 2;
  return a.wait.value > noWayRound.finland.wait ? 1 : 0;
}

/**
 * One insight as one framed unit: eyebrow, the finding in one serif sentence, its visual, then
 * source chips and the main caveat (always visible), then plainly labelled "Show …" buttons for
 * the method and the full figures. Open on paper.
 */
function InsightCard({
  id,
  eyebrow,
  title,
  visual,
  meaning,
  source,
  caveat,
  action,
  more,
  split = false,
  className,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  visual: ReactNode;
  meaning?: ReactNode;
  source?: ReactNode;
  caveat?: ReactNode;
  action?: ReactNode;
  more: ReactNode;
  /** From 1024px the visual sits beside the text instead of under it. */
  split?: boolean;
  className?: string;
}) {
  const side = split ? "lg:col-start-1" : "";
  return (
    // Reveal takes no id, so the anchor and the label sit on the section inside it.
    <Reveal
      className={cn(
        "rounded-[14px] border border-frame-border bg-cream-paper p-[21px] sm:p-8 print:p-[10pt]",
        className,
      )}
    >
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        className={cn(
          "flex scroll-mt-28 flex-col gap-6 print:gap-3",
          split && "lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:content-start lg:gap-x-12 print:flex",
        )}
      >
        <div className={cn("flex flex-col gap-2", side)}>
          <p className="type-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="type-title max-w-[34ch] text-pretty text-forest-ink">
            {title}
          </h2>
        </div>
        <div className={cn("min-w-0", split && "lg:col-start-2 lg:row-span-4 lg:row-start-1")}>{visual}</div>
        {meaning ? <p className={cn("max-w-[60ch] text-base text-pretty text-foreground", side)}>{meaning}</p> : null}
        {source || caveat ? (
          <div className={cn("flex flex-col items-start gap-3 *:max-w-full", side)}>
            {source ? <div className="flex flex-wrap items-center gap-2">{source}</div> : null}
            {caveat}
          </div>
        ) : null}
        {action}
        <div className="flex flex-col items-start gap-2 border-t border-frame-border pt-4 *:max-w-full lg:col-span-2 print:border-0 print:pt-0">
          {more}
        </div>
      </section>
    </Reveal>
  );
}

/** A "Show …" inside a card: quiet, and full width once open. */
function More({ show, hide, defaultOpen, children }: { show: string; hide: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <Disclosure show={show} hide={hide} tone="quiet" defaultOpen={defaultOpen} className="w-full" contentClassName="flex flex-col gap-5 pt-3 pb-2">
      {children}
    </Disclosure>
  );
}

/** The area picker: a plain form, so it works without script and the address can be shared. */
function AreaPicker({ selected }: { selected: string }) {
  return (
    <form action="/insights#pathway" method="get" className="flex flex-wrap items-end gap-3" data-print="hide">
      <label className="flex max-w-full flex-col gap-1.5 text-base font-semibold text-forest-ink">
        Area
        <select
          name="area"
          defaultValue={selected}
          className="min-h-11 w-[16rem] max-w-full rounded-lg border border-input bg-cream-paper px-3 text-base font-normal text-charcoal"
        >
          {pathwayAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-lg border border-forest-ink bg-cream-paper px-4 py-2 text-base font-semibold text-forest-ink outline-none hover:bg-mint-veil focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Show this area
      </button>
    </form>
  );
}

/** One area's published figures for each step, behind a button; open when an area was chosen. */
async function AreaPathway({ searchParams }: { searchParams: PageProps<"/insights">["searchParams"] }) {
  const { area } = await searchParams;
  const chosen = typeof area === "string" && pathwayAreas.some((a) => a.id === area) ? area : null;
  return <AreaPathwayBody chosen={chosen} />;
}

/**
 * The disclosure itself. Also the Suspense fallback: the static shell (and a reader without
 * script, who never sees the streamed part) still gets the picker and the default area's figures.
 */
function AreaPathwayBody({ chosen }: { chosen: string | null }) {
  return (
    <More show="Show one area's figures for each step" hide="Hide the area's figures" defaultOpen={chosen !== null}>
      <AreaPicker selected={chosen ?? DEFAULT_AREA} />
      <PathwayRow areaId={chosen ?? DEFAULT_AREA} strip={false} />
    </More>
  );
}

/** How the early-warning flag is set, with the thresholds read from data/insights/rules.json. */
function WarningMethod() {
  const { about_same_points: points, recording_change_above: change } = rules.constants;
  const recording = rules.grade_rules.find((r) => r.id === "recording-change");
  const gap = rules.grade_rules.find((r) => r.id === "publisher-gap");
  return (
    <div className="flex max-w-[60rem] flex-col gap-2 text-base text-pretty">
      <p>
        For each area we compare the first and the last published year. A change of more than {points} percentage point
        {points === 1 ? "" : "s"} in the worse direction is &ldquo;getting worse&rdquo;. When the number of visits behind the
        figure moved by more than {Math.round(change * 100)}% in a year, or THL reports visits missing, the flag is
        &ldquo;Possible, check recording&rdquo; instead.
      </p>
      {recording ? <p>{recording.rule}</p> : null}
      {gap ? <p>{gap.rule}</p> : null}
    </div>
  );
}

export default function InsightsPage({ searchParams }: PageProps<"/insights">) {
  const robust = noWayRound.areas.filter((a) => a.tier === "every");
  const tiles = noWayRound.areas.map((a) => ({ id: a.county_id, name: a.name, level: tileLevel(a) }));
  const c = noWayRound.counts;
  const gp = earlyWarning.summary["6411"];
  const warning = earlyWarning.rows.find((r) => r.indicator_id === "6411" && r.flag?.kind === "warning");
  const first = warning?.series[0];
  const last = warning?.series[warning.series.length - 1];
  const fieldCount = starterDataset.sections.reduce((n, s) => n + s.fields.length, 0);
  // The counts behind Goal 3's own measure: the section tied to roadmap measure 3.1.2.
  const goal3Count = starterDataset.sections.find((s) => s.measure_id === "3.1.2")?.fields.length ?? 0;
  const steps = getPathwayRow(DEFAULT_AREA)?.steps ?? [];
  const notPublished = steps.filter((s) => !s.published);
  // The source behind each unpublished step: the data-gap row it points to.
  const gapSources = [
    ...new Set(
      notPublished
        .map((s) => dataGaps.find((g) => g.id === s.data_gap_id)?.source_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];

  return (
    <main className={cn("page-container flex flex-col gap-10 pt-4 pb-16 sm:gap-12 sm:pt-6", MOTION_LOUD_CLASS)}>
      {/* The finding: one serif statement, the two figures, source and main caveat. */}
      <header className="flex flex-col items-start gap-6 *:max-w-full">
        <Reveal className="flex max-w-[52rem] flex-col gap-3">
          <p className="type-eyebrow">Where access is hardest · GP wait, {noWayRound.year}</p>
          <h1 className="font-display text-[2.5rem] leading-[1.1] font-light text-balance text-forest-ink sm:text-[3.5rem]">
            In {word(robust.length)} areas the GP queue is long, with no way round it.
          </h1>
        </Reveal>
        <Reveal index={1} className="flex flex-wrap gap-x-14 gap-y-6">
          {robust.map((a) => (
            <div key={a.county_id} className="flex flex-col gap-2">
              <p className="type-heading text-forest-ink">{a.name}</p>
              <p className="numeral text-[4rem] leading-none text-status-red-ink sm:text-[5.5rem] print:text-[32pt]">
                <AnimatedNumber value={a.wait.value} final={formatValue("6411", a.wait.value)} level="loud" />
              </p>
            </div>
          ))}
        </Reveal>
        <Reveal index={2} className="flex max-w-[60ch] flex-col items-start gap-3 *:max-w-full">
          <p className="text-[1.1875rem] leading-[1.6] text-pretty text-foreground">
            of non-urgent GP visits waited more than 7 days. Finland overall:{" "}
            <span className="figure font-semibold">{FINLAND_WAIT}</span>.
          </p>
          <SourceChip sourceId="sotkanet-6411" year={noWayRound.year} />
          <CaveatNote short="area figures, not people; not cancer-specific">
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              {NO_WAY_ROUND_CAVEATS.map((text) => (
                <li key={text}>{text}</li>
              ))}
              {robust.map((a) => (
                <li key={a.county_id}>
                  {a.name}, {a.wait.grade.label.toLowerCase()}: {a.wait.grade.reason}
                </li>
              ))}
            </ul>
          </CaveatNote>
        </Reveal>
      </header>

      {/* 1. The grid of 22 areas: how the two were found. */}
      <InsightCard
        id="no-way-round"
        eyebrow={`All ${c.areas} areas, ${noWayRound.year}`}
        title={`${c.wait_above_finland} areas wait longer than Finland overall, but only ${word(c.long_few_every_test)} have no way round it in all ${word(TESTS)} tests.`}
        visual={<NoWayRoundTiles areas={tiles} counts />}
        split
        source={
          <>
            <SourceChip sourceId="sotkanet-6411" year={noWayRound.year} />
            <SourceChip sourceId={robust[0].occupational.source_id} year={robust[0].occupational.year} />
            <SourceChip sourceId={robust[0].private.source_id} year={robust[0].private.year} />
          </>
        }
        more={
          <>
            <More show="Show how we tested this" hide="Hide how we tested this">
              <TestsTable />
            </More>
            <More show={`Show the figures for all ${c.areas} areas`} hide={`Hide the figures for all ${c.areas} areas`}>
              <AreaTable />
            </More>
          </>
        }
      />

      {/* 2. Early warning. */}
      {warning && first && last ? (
        <InsightCard
          id="early-warning"
          eyebrow="Early warning · GP wait"
          title={`Only ${warning.name}'s GP wait is plainly getting worse.`}
          visual={
            <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="numeral text-[2.5rem] leading-none text-status-red-ink sm:text-[4rem] print:text-[28pt]">
                {formatValue("6411", first.value ?? 0)} →{" "}
                <AnimatedNumber value={last.value ?? 0} from={first.value ?? 0} final={formatValue("6411", last.value ?? 0)} level="loud" />
              </span>
              <span className="max-w-[26ch] text-base text-pretty text-foreground">
                of non-urgent GP visits in {warning.name} waited over 7 days, {first.year} → {last.year}
              </span>
            </p>
          }
          meaning={`${capital(String(gp.check))} more look worse, but their recorded visits changed or are incomplete.`}
          source={
            <>
              <SourceChip sourceId={warning.source_id} year={last.year} />
              <ConfidenceBadge areaId={warning.county_id} indicatorId="6411" year={last.year} showReason={false} />
            </>
          }
          caveat={<CaveatNote short="three years only: a direction, not a forecast" />}
          more={
            <>
              <More show="Show how we flag and grade a change" hide="Hide how we flag and grade a change">
                <WarningMethod />
                <GradingRulesBody />
              </More>
              <More show={`Show all ${gp.areas} areas`} hide={`Hide the ${gp.areas} areas`}>
                <GpWaitWarningTable />
              </More>
            </>
          }
        />
      ) : null}

      {/* 3. The pathway with its gaps. */}
      <InsightCard
        id="pathway"
        eyebrow="The cancer pathway"
        title={`${capital(word(notPublished.length))} of ${word(steps.length)} steps to cancer treatment are not published by area.`}
        visual={<PathwayStepsRow />}
        source={gapSources.map((id) => (
          <SourceChip key={id} sourceId={id} />
        ))}
        more={
          <Suspense fallback={<AreaPathwayBody chosen={null} />}>
            <AreaPathway searchParams={searchParams} />
          </Suspense>
        }
      />

      {/* 4. What a county can start recording: the page's one primary action. */}
      <InsightCard
        id="starter-dataset"
        eyebrow="What to start recording"
        title={`${fieldCount} quarterly counts let a county measure those steps itself.`}
        visual={
          <ol aria-label={`The ${fieldCount} counts in ${starterDataset.sections.length} groups`} className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {starterDataset.sections.map((s) => (
              <li key={s.id} className="flex items-baseline gap-3 rounded-sm bg-keylime-wash px-3 py-2.5 text-base text-pretty">
                <span className="numeral min-w-[1.5ch] text-[1.75rem] leading-none text-forest-ink">{s.fields.length}</span>
                <span>{s.title}</span>
              </li>
            ))}
          </ol>
        }
        meaning={`${capital(word(goal3Count))} of them measure Goal 3 of the national cancer strategy directly.`}
        caveat={
          <CaveatNote short="counts only, no patient data">
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              {starterDataset.privacy.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CaveatNote>
        }
        action={
          <div className="flex flex-wrap items-center gap-3 *:max-w-full">
            <StarterDownload label="Download the recording template (Excel)" />
            <SaveShare
              className="print:hidden"
              options={[
                { kind: "print" },
                {
                  kind: "email",
                  subject: "Where cancer care access is hardest in Finland",
                  intro: "Where access to early cancer care is hardest across Finland, from published figures:",
                },
              ]}
            />
          </div>
        }
        more={
          <>
            <More show={`Show the ${fieldCount} fields`} hide={`Hide the ${fieldCount} fields`}>
              <StarterFields />
            </More>
            <More show="Show the Goal 3 link" hide="Hide the Goal 3 link">
              <Goal3Detail />
            </More>
          </>
        }
      />
    </main>
  );
}
