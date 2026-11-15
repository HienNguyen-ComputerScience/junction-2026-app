import { cn } from "cn";

import { Flag, seriesText } from "@/components/insights/early-warning";
import { SortableTable } from "@/components/insights/sortable-table";
import { SourceChip } from "@/components/source-chip";
import { earlyWarning, getPathwayRow, type PathwayStepId, starterDataset } from "@/lib/insights";

/**
 * Small server pieces for the /insights scroll story. The full components (NoWayRound,
 * EarlyWarning, StarterDataset, PathwayRow) stay as they are for other pages.
 */

/** The GP wait (Sotkanet 6411) for every area, first and last year, with its flag. */
export function GpWaitWarningTable() {
  const rows = earlyWarning.rows.filter((r) => r.indicator_id === "6411");
  return (
    <SortableTable
      caption={`Non-urgent GP visits waiting over 7 days, every area, ${rows[0]?.first_year}–${rows[0]?.last_year}`}
      initialSort={{ column: 2, direction: "desc" }}
      columns={[
        { header: "Area" },
        { header: "Each year", sortable: false },
        { header: "Change toward worse (points)", align: "end" },
        { header: "Flag" },
      ]}
      rows={rows.map((r) => ({
        key: r.county_id,
        emphasis: r.flag?.kind === "warning",
        sort: [r.name, null, r.worsening, r.flag?.label ?? "No flag"],
        cells: [r.name, seriesText(r), r.worsening.toFixed(1), <Flag key="f" row={r} />],
      }))}
    />
  );
}

export const STEP_NAME: Record<PathwayStepId, string> = {
  detection: "Screening",
  gp_recognition: "GP recognition",
  gp_access: "GP wait",
  referral: "Referral",
  diagnosis: "Diagnosis",
  treatment: "Treatment start",
  outcome: "Survival",
};

/**
 * The cancer pathway as one row of seven steps: published by area, or not. The empty steps are
 * the same for every area (they are not published anywhere), so this row needs no area.
 */
export function PathwayStepsRow() {
  const row = getPathwayRow("finland") ?? getPathwayRow("central-finland");
  if (!row) return null;
  return (
    <ol aria-label="The seven steps to cancer treatment" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
      {row.steps.map((step, i) => (
        <li
          key={step.id}
          className={cn(
            "flex min-h-20 flex-col justify-between gap-2 rounded-sm px-3 py-2.5 text-base",
            step.published
              ? "bg-mint-veil text-charcoal"
              : "border-2 border-dashed border-status-grey-border bg-cream-paper text-forest-ink",
          )}
        >
          <span>
            <span className="sr-only">Step {i + 1}: </span>
            {STEP_NAME[step.id]}
          </span>
          {step.published ? (
            <span className="sr-only">published by area</span>
          ) : (
            <span className="font-semibold">Not published</span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** The 18 counts, grouped as in the template, with the definition each group follows. */
export function StarterFields() {
  return (
    <ol className="flex flex-col gap-6">
      {starterDataset.sections.map((s) => (
        <li key={s.id} className="flex flex-col gap-2">
          <h3 className="type-heading text-forest-ink">{s.title}</h3>
          <ul className="flex flex-col gap-1.5 text-base">
            {s.fields.map((f) => (
              <li key={f.id} className="text-pretty">
                <span className="font-semibold">
                  {f.id}. {f.header}
                </span>
                : {f.count}
              </li>
            ))}
          </ul>
          {s.basis || s.abroad ? (
            <div className="flex flex-wrap gap-2">
              {s.basis ? <SourceChip sourceId={s.basis.source_id} /> : null}
              {s.abroad ? <SourceChip sourceId={s.abroad.source_id} /> : null}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
