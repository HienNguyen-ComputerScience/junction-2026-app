import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

import { ConfidenceBadge } from "@/components/insights/confidence-badge";
import { Goal3Detail } from "@/components/insights/goal3-link";
import { GradingRulesBody } from "@/components/insights/grading-rules";
import { GpWaitWarningTable, PathwayStepsRow, StarterFields } from "@/components/insights/insights-story";
import { AreaTable, NO_WAY_ROUND_CAVEATS, TestsTable } from "@/components/insights/no-way-round";
import { NoWayRoundTiles, type TileLevel } from "@/components/insights/no-way-round-tiles";
import { PathwayRow } from "@/components/insights/pathway-row";
import { StarterDownload } from "@/components/insights/starter-dataset";
import { AnimatedNumber, Chunk, ChunkFigure, Disclosure, Reveal, ScrollStory } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import {
  earlyWarning,
  formatValue,
  getPathwayRow,
  type NwrArea,
  noWayRound,
  pathwayAreas,
  starterDataset,
} from "@/lib/insights";

export const metadata: Metadata = {
  title: "Where access is hardest | FirstLine",
  description:
    "Where a long GP wait meets few other routes to a doctor, which area's wait is plainly getting worse, and what a county can start recording.",
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

/** A step of the story: a short serif line, then what backs it. */
function StoryStep({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="motion-loud flex flex-col items-start gap-4 py-6">
      <Reveal>
        <h3 className="max-w-[24ch] font-display text-[1.75rem] leading-[1.2] font-light text-pretty text-forest-ink sm:text-[2.25rem]">
          {title}
        </h3>
      </Reveal>
      {children ? (
        <Reveal index={1} className="flex flex-col items-start gap-3">
          {children}
        </Reveal>
      ) : null}
    </div>
  );
}

const SECTION_TITLE =
  "max-w-[24ch] font-display text-[2rem] leading-[1.15] font-light text-pretty text-forest-ink sm:text-[2.75rem]";

/** The area picker: a plain form, so it works without script and the address can be shared. */
function AreaPicker({ selected }: { selected: string }) {
  return (
    <form action="/insights#pathway" method="get" className="flex flex-wrap items-end gap-3" data-print="hide">
      <label className="flex flex-col gap-1.5 text-base font-semibold text-forest-ink">
        Area
        <select
          name="area"
          defaultValue={selected}
          className="min-h-11 min-w-[16rem] rounded-lg border border-input bg-cream-paper px-3 text-base font-normal text-charcoal"
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
  return (
    <Disclosure
      show="Show one area's figures for each step"
      hide="Hide the area's figures"
      defaultOpen={chosen !== null}
      contentClassName="flex flex-col gap-6 pt-6"
    >
      <AreaPicker selected={chosen ?? DEFAULT_AREA} />
      <PathwayRow areaId={chosen ?? DEFAULT_AREA} strip={false} />
    </Disclosure>
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
  const steps = getPathwayRow(DEFAULT_AREA)?.steps ?? [];
  const notPublished = steps.filter((s) => !s.published).length;

  return (
    <main className="page-container flex flex-col pt-4 pb-16 sm:pt-6">
      {/* 1. The finding. */}
      <Chunk
        lead
        as="h1"
        eyebrow={`GP wait, ${noWayRound.year}`}
        statement={`In ${word(robust.length)} areas the GP queue is long, with no way round it.`}
        figure={
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
            {robust.map((a) => (
              <div key={a.county_id} className="flex flex-col items-start gap-3">
                <p className="type-heading text-forest-ink">{a.name}</p>
                <p className="numeral text-[4rem] leading-none text-status-red-ink sm:text-[5.5rem] print:text-[32pt]">
                  <AnimatedNumber value={a.wait.value} final={formatValue("6411", a.wait.value)} level="loud" />
                </p>
              </div>
            ))}
          </div>
        }
        meaning={
          <>
            of non-urgent GP visits waited more than 7 days. Finland: <span className="figure font-semibold">{FINLAND_WAIT}</span>.
          </>
        }
        source={
          <>
            <SourceChip sourceId="sotkanet-6411" year={noWayRound.year} />
            {/* One label when both figures carry the same grade; the reasons are under "Why?". */}
            {robust.every((a) => a.wait.grade.label === robust[0].wait.grade.label) ? (
              <ConfidenceBadge grade={robust[0].wait.grade} showReason={false} />
            ) : (
              robust.map((a) => (
                <span key={a.county_id} className="inline-flex items-center gap-2 text-base">
                  {a.name}: <ConfidenceBadge grade={a.wait.grade} showReason={false} />
                </span>
              ))
            )}
          </>
        }
        caveat={{
          short: "area figures, not people; not cancer-specific",
          why: (
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
          ),
        }}
      />

      {/* 2. From 22 areas to two. */}
      <section aria-labelledby="nwr-heading" className="flex flex-col gap-8 py-16 sm:py-24">
        <Reveal className="motion-loud">
          <h2 id="nwr-heading" className={SECTION_TITLE}>
            How the {word(robust.length)} stand out
          </h2>
        </Reveal>
        <ScrollStory
          label={`The ${c.areas} areas, ${noWayRound.year}`}
          picture={<NoWayRoundTiles areas={tiles} />}
          steps={[
            <StoryStep key="all" title={`All ${c.areas} areas, ${noWayRound.year}.`} />,
            <StoryStep key="long" title={`A longer GP wait than Finland's ${FINLAND_WAIT}.`}>
              <SourceChip sourceId="sotkanet-6411" year={noWayRound.year} />
            </StoryStep>,
            <StoryStep key="few" title={`${c.long_few_main} of them also use occupational-health and private doctors less than Finland.`}>
              <div className="flex flex-wrap gap-2">
                <SourceChip sourceId={robust[0].occupational.source_id} year={robust[0].occupational.year} />
                <SourceChip sourceId={robust[0].private.source_id} year={robust[0].private.year} />
              </div>
            </StoryStep>,
            <StoryStep
              key="two"
              title={`Only ${robust.map((a) => a.name).join(" and ")} stay there under all ${TESTS} cut-offs we tested.`}
            >
              <div className="flex flex-col items-start gap-3">
                <Disclosure show="Show how we tested this" hide="Hide how we tested this">
                  <TestsTable />
                </Disclosure>
                <Disclosure show="Show the full table" hide="Hide the full table">
                  <AreaTable />
                </Disclosure>
              </div>
            </StoryStep>,
          ]}
        />
      </section>

      {/* 3. Early warning. */}
      {warning && first && last ? (
        <Chunk
          eyebrow="Early warning · GP wait"
          statement={`Only ${warning.name}'s GP wait is plainly getting worse.`}
          figure={
            <ChunkFigure tone="alarm" unit={`of non-urgent GP visits waited over 7 days, ${first.year} → ${last.year}`}>
              {formatValue("6411", first.value ?? 0)} →{" "}
              <AnimatedNumber value={last.value ?? 0} from={first.value ?? 0} final={formatValue("6411", last.value ?? 0)} level="loud" />
            </ChunkFigure>
          }
          meaning={`${gp.check} more look worse, but their recorded visits changed or are incomplete.`}
          source={
            <>
              <SourceChip sourceId={warning.source_id} year={last.year} />
              <ConfidenceBadge areaId={warning.county_id} indicatorId="6411" year={last.year} showReason={false} />
            </>
          }
          caveat={{
            short: "three years only: a direction, not a forecast",
            why: (
              <>
                For each area we compare the first and the last published year. A change of more than 1 percentage point
                in the worse direction is &ldquo;getting worse&rdquo;. When the number of visits behind the figure moved by
                more than a fifth in a year, or THL reports visits missing, the flag is &ldquo;Possible, check
                recording&rdquo; instead.
              </>
            ),
          }}
        >
          <div className="flex flex-col items-start gap-3">
            <Disclosure show={`Show all ${gp.areas} areas`} hide={`Hide the ${gp.areas} areas`}>
              <GpWaitWarningTable />
            </Disclosure>
            <Disclosure show="Show how we grade each figure" hide="Hide how we grade each figure">
              <GradingRulesBody />
            </Disclosure>
          </div>
        </Chunk>
      ) : null}

      {/* 4–6. What a county can record: the empty steps, the template, Goal 3. */}
      <Chunk
        id="starter-dataset"
        eyebrow="What to record from Monday"
        statement={`${capital(word(notPublished))} of ${word(steps.length)} steps to cancer treatment are not published by area.`}
        figure={<PathwayStepsRow />}
        meaning={
          <>
            <span className="figure font-semibold">{fieldCount}</span> quarterly counts let a county measure them itself.
          </>
        }
        caveat={{
          short: "counts only, no patient data",
          why: (
            <ul className="flex list-disc flex-col gap-1.5 pl-5">
              {starterDataset.privacy.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ),
        }}
        className="scroll-mt-20"
      >
        <div className="flex flex-col items-start gap-6">
          <StarterDownload label="Download the recording template (Excel)" />
          <Disclosure show={`Show the ${fieldCount} fields`} hide={`Hide the ${fieldCount} fields`}>
            <StarterFields />
          </Disclosure>
          <div className="flex max-w-[68ch] flex-col items-start gap-3 rounded-[14px] bg-keylime-wash p-6">
            <p className="text-base font-semibold text-pretty text-forest-ink">
              Two of the counts measure Goal 3 of the national cancer strategy directly.
            </p>
            <Disclosure show="Show the Goal 3 link" hide="Hide the Goal 3 link" tone="quiet">
              <Goal3Detail />
            </Disclosure>
          </div>
          <div id="pathway" className="scroll-mt-20">
            <Suspense fallback={null}>
              <AreaPathway searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </Chunk>
    </main>
  );
}
