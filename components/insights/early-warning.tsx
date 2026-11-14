import { Disclosure, Reveal } from "@/components/motion";
import { Search, TriangleAlert } from "lucide-react";

import { SortableTable } from "@/components/insights/sortable-table";
import { SourceChip } from "@/components/source-chip";
import { earlyWarning, formatPoints, formatValue, INDICATOR_NAME, type WarningRow } from "@/lib/insights";

const DIRECTION: Record<string, string> = {
  "6411": "a higher share is worse",
  "13": "a lower share is worse",
  "3621": "lower attendance is worse",
  "6103": "lower attendance is worse",
  "3620": "lower attendance is worse",
};

export function Flag({ row }: { row: WarningRow }) {
  if (!row.flag) return <span>No flag</span>;
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-forest-ink">
      {row.flag.kind === "warning" ? (
        <TriangleAlert aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
      ) : (
        <Search aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
      )}
      {row.flag.label}
    </span>
  );
}

export function seriesText(row: WarningRow): string {
  return row.series.map((p) => `${p.year}: ${p.value === null ? "no value" : formatValue(row.indicator_id, p.value)}`).join(", ");
}

function FlagCard({ row, index }: { row: WarningRow; index: number }) {
  const last = row.series[row.series.length - 1];
  return (
    <Reveal as="li" index={index} className="flex flex-col gap-2 rounded-[14px] bg-keylime-wash p-6">
      <Flag row={row} />
      <p className="type-heading text-forest-ink">
        {row.name}: {INDICATOR_NAME[row.indicator_id]}
      </p>
      <p className="text-base text-pretty">
        {seriesText(row)} ({formatPoints(row.change)} over {row.last_year - row.first_year} years; {DIRECTION[row.indicator_id]}).
        Finland {row.last_year}: <span className="figure">{formatValue(row.indicator_id, last.finland)}</span>.
        {row.crossed ? ` Was at or better than Finland in ${row.first_year}, worse in ${row.last_year}.` : ""}
      </p>
      {row.trend_reasons.length ? (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-base">
          {row.trend_reasons.map((r) => (
            <li key={r} className="text-pretty">
              {r}
            </li>
          ))}
        </ul>
      ) : null}
      <SourceChip sourceId={row.source_id} year={row.last_year} />
    </Reveal>
  );
}

/**
 * Early warning: areas whose figure got worse over the published years, and areas that went from
 * at-or-better than Finland to worse. Always read with the confidence grade: when the recording
 * changed, the flag is "Possible, check recording", not an alarm. Three yearly points: direction
 * and size only, no forecast.
 *
 * `indicatorIds` limits it to some indicators; `areaId` to one area (for a county page).
 */
export function EarlyWarning({
  indicatorIds = ["6411", "13", "3621", "3620", "6103"],
  areaId,
  headingLevel = 2,
}: {
  indicatorIds?: string[];
  areaId?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const rows = earlyWarning.rows.filter(
    (r) => indicatorIds.includes(r.indicator_id) && (areaId === undefined || r.county_id === areaId),
  );
  const flagged = rows.filter((r) => r.flag).sort((a, b) => b.worsening - a.worsening);
  const warnings = flagged.filter((r) => r.flag?.kind === "warning");
  const checks = flagged.filter((r) => r.flag?.kind === "check");
  const gp = earlyWarning.summary["6411"];
  const bowel = earlyWarning.summary["6103"];

  return (
    <section aria-labelledby="early-warning-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="type-eyebrow">Early warning</p>
        <Heading id="early-warning-heading" className="type-title scroll-mt-20">
          What has got worse, and how sure we can be
        </Heading>
      </div>
      <div className="flex max-w-[60rem] flex-col gap-2 text-base">
        <p className="text-pretty">
          For each area we compare the first and the last published year (three years in all: 2023–2025 for waits and
          referrals, 2022–2024 for screening). A change of more than 1 percentage point in the worse direction is
          &ldquo;getting worse&rdquo;. With three yearly points we describe direction and size only; we do not forecast.
        </p>
        {areaId === undefined ? (
          <p className="text-pretty">
            The GP wait got worse in {gp.worse} of {gp.areas} areas, but in {gp.check} of them the number of visits
            recorded changed by more than a fifth from one year to the next, so those are marked &ldquo;Possible, check
            recording&rdquo;. Bowel screening attendance fell in {bowel.worse} of {bowel.areas} areas while the programme
            added age groups, so those falls are marked &ldquo;Possible, check comparability&rdquo;.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="type-heading text-forest-ink">
          Getting worse, with no recording problem found ({warnings.length})
        </h3>
        <p className="max-w-[60rem] text-base text-pretty">
          For screening, the number of people invited changes with the programme&apos;s rounds by design, so the
          recording check is not applied there; those flags rest on the published share alone.
        </p>
        {warnings.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {warnings.map((r, i) => (
              <FlagCard key={`${r.county_id}-${r.indicator_id}`} row={r} index={i} />
            ))}
          </ul>
        ) : (
          <p className="text-base">None.</p>
        )}
      </div>

      {checks.length ? (
        <Disclosure
          show={`Show the ${checks.length} possible changes to check first`}
          hide="Hide the possible changes to check first"
        >
          <ul className="grid gap-4 md:grid-cols-2">
            {checks.map((r, i) => (
              <FlagCard key={`${r.county_id}-${r.indicator_id}`} row={r} index={i} />
            ))}
          </ul>
        </Disclosure>
      ) : null}

      {areaId === undefined ? (
        <Disclosure label="all areas and figures in a table">
          <SortableTable
            caption="Change from the first to the last published year, every area and figure"
            initialSort={{ column: 3, direction: "desc" }}
            columns={[
              { header: "Area" },
              { header: "Figure" },
              { header: "Years", sortable: false },
              { header: "Change toward worse (points)", align: "end" },
              { header: "Crossed to worse than Finland" },
              { header: "Flag" },
            ]}
            rows={rows.map((r) => ({
              key: `${r.county_id}-${r.indicator_id}`,
              sort: [r.name, INDICATOR_NAME[r.indicator_id], null, r.worsening, r.crossed ? "Yes" : "No", r.flag?.label ?? "No flag"],
              cells: [
                r.name,
                `${INDICATOR_NAME[r.indicator_id]} (Sotkanet ${r.indicator_id})`,
                seriesText(r),
                r.worsening.toFixed(1),
                r.crossed ? "Yes" : "No",
                <Flag key="f" row={r} />,
              ],
            }))}
          />
          <p className="mt-3 text-base text-pretty">
            &ldquo;Change toward worse&rdquo; is the last year minus the first, turned so that a positive number is always
            worse. Areas with no figure of their own at either end (the HUS areas for referrals, Helsinki before 2025) are
            left out.
          </p>
        </Disclosure>
      ) : null}
    </section>
  );
}
