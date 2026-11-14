import { AnimatedNumber, Disclosure, Reveal } from "@/components/motion";
import { ConfidenceBadge } from "@/components/insights/confidence-badge";
import { NoWayRoundChart } from "@/components/insights/no-way-round-chart";
import { SortableTable } from "@/components/insights/sortable-table";
import { SourceChip } from "@/components/source-chip";
import { countAreasWithRule, formatValue, groupLabel, inTen, type NwrArea, noWayRound } from "@/lib/insights";

const TESTS = noWayRound.tests.length;

/** The caveats that travel with this figure wherever it is shown. Always visible. */
export const NO_WAY_ROUND_CAVEATS = [
  "Area figures, not people: they say nothing about any one person's options.",
  "Occupational health covers people in work, so lower use can mean fewer people employed, not fewer services.",
  "None of these figures is about cancer. The GP wait counts all non-urgent GP visits, and it counts visits, not people.",
  `The number of GP visits recorded changed by more than a fifth from ${noWayRound.year - 1} to ${noWayRound.year} in ${countAreasWithRule("6411", noWayRound.year, "recording-change")} of ${noWayRound.areas.length} areas, so the wait is graded beside each figure.`,
];

function Caveats() {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-mint-veil p-6">
      <h3 className="type-heading text-forest-ink">What these figures do not show</h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base">
        {NO_WAY_ROUND_CAVEATS.map((c) => (
          <li key={c} className="text-pretty">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One area's three figures, as small chunks: number, what it means, source, grade. */
export function NoWayRoundArea({ area, index = 0 }: { area: NwrArea; index?: number }) {
  const f = noWayRound.finland;
  return (
    <Reveal index={index} className="flex flex-col gap-5 rounded-[14px] bg-keylime-wash p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h3 className="type-title">{area.name}</h3>
        <p className="text-base">
          {groupLabel(area.group)}: in {area.tests_in_group} of {TESTS} tests.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="numeral text-5xl text-forest-ink">
          <AnimatedNumber value={area.wait.value} final={formatValue("6411", area.wait.value)} />
        </p>
        <p className="text-base text-pretty">
          of non-urgent GP visits in {area.name} came more than 7 days after people asked, in {area.wait.year} (Finland{" "}
          <span className="figure">{formatValue("6411", f.wait)}</span>).
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <SourceChip sourceId={area.wait.source_id} year={area.wait.year} />
          <ConfidenceBadge grade={area.wait.grade} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="numeral text-3xl font-normal text-forest-ink">
            <AnimatedNumber
              value={area.occupational.value}
              decimals={0}
              final={area.occupational.value.toLocaleString("en-GB")}
            />
          </p>
          <p className="text-base text-pretty">
            occupational-health doctor visits per 1,000 residents aged 15–64 (Finland{" "}
            <span className="figure">{f.occupational.toLocaleString("en-GB")}</span>).
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <SourceChip sourceId={area.occupational.source_id} year={area.occupational.year} />
            <ConfidenceBadge grade={area.occupational.grade} showReason={area.occupational.grade.level !== "solid"} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="numeral text-3xl font-normal text-forest-ink">
            <AnimatedNumber value={area.private.value} final={formatValue("692", area.private.value)} />
          </p>
          <p className="text-base text-pretty">
            of residents were reimbursed by Kela for a private doctor visit (Finland{" "}
            <span className="figure">{formatValue("692", f.private)}</span>).
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <SourceChip sourceId={area.private.source_id} year={area.private.year} />
            <ConfidenceBadge grade={area.private.grade} showReason={area.private.grade.level !== "solid"} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function TestsTable() {
  const nameOf = new Map(noWayRound.areas.map((a) => [a.county_id, a.name]));
  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-[60rem] text-base text-pretty">
        The main view compares each area with Finland in 2025. Each test below changes one thing: the point of
        comparison, how far from Finland an area must be to count, or the year. An area is in &ldquo;long wait, few
        other routes&rdquo; when its GP wait is above the comparison point and both its occupational-health visits and
        its private-doctor use are below it.
      </p>
      <div className="w-full overflow-x-auto rounded-[14px] bg-cream-paper">
        <table className="w-full min-w-[40rem] border-collapse text-left text-base">
          <caption className="px-4 pt-4 pb-2 text-left font-semibold text-forest-ink">
            The six tests and the areas each puts in &ldquo;long wait, few other routes&rdquo;
          </caption>
          <thead>
            <tr className="border-b border-forest-ink/30">
              <th scope="col" className="px-4 py-2 font-semibold">Test</th>
              <th scope="col" className="px-4 py-2 font-semibold">Compared with (GP wait · occupational · private)</th>
              <th scope="col" className="px-4 py-2 font-semibold">Areas in the group</th>
            </tr>
          </thead>
          <tbody>
            {noWayRound.tests.map((t) => {
              const inGroup = noWayRound.areas.filter((a) => a.tests[t.id]).map((a) => nameOf.get(a.county_id));
              const margin = t.margin ? ` (and more than ${t.margin * 100}% away)` : "";
              return (
                <tr key={t.id} className="border-b border-border-mist align-top">
                  <th scope="row" className="px-4 py-3 font-semibold">{t.label}</th>
                  <td className="px-4 py-3">
                    {t.reference === "finland" ? "Finland" : "Middle area"} {t.year}: {formatValue("6411", t.values.wait)} ·{" "}
                    {Math.round(t.values.occupational).toLocaleString("en-GB")} · {formatValue("692", t.values.private)}
                    {margin}
                  </td>
                  <td className="px-4 py-3">
                    {inGroup.length} — {inGroup.join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AreaTable() {
  const tierWords: Record<NwrArea["tier"], string> = {
    every: "Every test",
    "main-only": "Main view, not every test",
    "other-only": "Other tests only",
    none: "No test",
  };
  return (
    <SortableTable
      caption={`All ${noWayRound.areas.length} areas, ${noWayRound.year}`}
      initialSort={{ column: 2, direction: "desc" }}
      columns={[
        { header: "Area" },
        { header: "Group (main view)" },
        { header: "GP wait over 7 days", align: "end" },
        { header: "Occupational-health visits per 1,000", align: "end" },
        { header: "Private doctor use", align: "end" },
        { header: "In 'long wait, few other routes'", align: "end" },
        { header: "GP wait grade", sortable: false },
      ]}
      rows={noWayRound.areas.map((a) => ({
        key: a.county_id,
        emphasis: a.tier === "every",
        sort: [
          a.name,
          groupLabel(a.group),
          a.wait.value,
          a.occupational.value,
          a.private.value,
          a.tests_in_group,
          null,
        ],
        cells: [
          a.name,
          groupLabel(a.group),
          formatValue("6411", a.wait.value),
          a.occupational.value.toLocaleString("en-GB"),
          formatValue("692", a.private.value),
          `${a.tests_in_group} of ${TESTS} (${tierWords[a.tier]})`,
          <span key="g" className="inline-flex flex-col gap-1">
            <ConfidenceBadge grade={a.wait.grade} showReason={false} />
          </span>,
        ],
      }))}
    />
  );
}

/**
 * Insight 1: where the public GP queue is long AND few people use another route to a doctor.
 * Self-contained: headline, the areas that hold under every test, the charts, the full table,
 * the tests and the caveats. Area-level, not cancer-specific; the caveats are always visible.
 */
export function NoWayRound({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const robust = noWayRound.areas.filter((a) => a.tier === "every");
  const c = noWayRound.counts;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const names = robust.map((a) => a.name).join(" and ");
  return (
    <section aria-labelledby="no-way-round-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="type-eyebrow">Where people have no way round the queue</p>
        <Heading id="no-way-round-heading" className="type-title scroll-mt-20">
          A long wait for a GP, and few other ways to see a doctor
        </Heading>
      </div>
      <Reveal>
        <p className="max-w-[56rem] type-statement">
          In {names}, {inTen(robust.map((a) => a.wait.value))} non-urgent GP visits come more than a week after people ask, and fewer people there
          use an occupational-health or a private doctor than in Finland as a whole. They stay in this group under all{" "}
          {TESTS} cut-offs we tested.
        </p>
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-2">
        {robust.map((a, i) => (
          <NoWayRoundArea key={a.county_id} area={a} index={i} />
        ))}
      </div>
      <Reveal className="flex max-w-[60rem] flex-col gap-2 text-base">
        <p className="text-pretty">
          On the main view (2025, compared with Finland), {c.long_few_main} of {c.areas} areas have a longer GP wait than
          Finland and use both other routes less. Only {c.long_few_every_test} stay there in every test; the others move
          when the year or the cut-off changes, so we do not single them out. {c.occupational_below_finland} of{" "}
          {c.areas} areas are below Finland on occupational-health visits (Finland&apos;s figure is pulled up by the
          large cities), so that comparison alone separates little.
        </p>
        <p className="text-pretty">
          How it was worked out: each area&apos;s published 2025 figure is compared with Finland&apos;s. No score, no
          weights: an area is in the group only if all three comparisons point the same way.
        </p>
      </Reveal>
      <Caveats />
      <NoWayRoundChart />
      <AreaTable />
      <Disclosure label="the six cut-offs we tested">
        <TestsTable />
      </Disclosure>
    </section>
  );
}
