import { cn } from "cn";

import { ConfidenceBadge } from "@/components/insights/confidence-badge";
import { CaveatNote } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { getSource } from "@/lib/data";
import {
  formatValue,
  getPathwayRow,
  INDICATOR_NAME,
  type PathwayItem,
  type PathwayStep,
  type PathwayStepId,
} from "@/lib/insights";

const STEP: Record<PathwayStepId, { title: string; question: string; missing?: string }> = {
  detection: { title: "1. Detection", question: "Do people invited to cancer screening attend?" },
  gp_recognition: {
    title: "2. GP recognition",
    question: "Does the GP recognise possible cancer?",
    missing: "How each cancer was first found (GP referral, screening, emergency visit) is not published by area.",
  },
  gp_access: { title: "3. Getting to a GP", question: "How long do non-urgent GP visits wait?" },
  referral: { title: "4. Referral", question: "How fast does the hospital process referrals?" },
  diagnosis: {
    title: "5. Diagnosis",
    question: "How many days from referral to diagnosis?",
    missing: "Days from referral to diagnosis are not published by area in Finland.",
  },
  treatment: {
    title: "6. Treatment start",
    question: "Do patients start treatment within the target time?",
    missing:
      "Not published by area. This is the national strategy's Goal 3 measure (roadmap 3.1.2); the target times are due 2026–2028.",
  },
  outcome: { title: "7. Outcome", question: "Five-year survival" },
};

const VERSUS: Record<NonNullable<PathwayItem["versus"]>, string> = {
  better: "ahead of Finland overall",
  same: "about the same as Finland overall",
  worse: "behind Finland overall",
};

/** One short line per step for the strip: the status in words, never colour alone. */
function stepSummary(step: PathwayStep): string {
  if (!step.published) return "Not published";
  const items = step.items;
  if (items.length === 1) {
    const it = items[0];
    if (it.value === null) return "No value";
    const value = formatValue(it.indicator_id, it.value);
    if (it.shared) return `${value}, ${it.shared.name}-wide (shared)`;
    return `${value}, ${it.versus ? VERSUS[it.versus] : ""}`;
  }
  const worse = items.filter((it) => it.versus === "worse").length;
  const better = items.filter((it) => it.versus === "better").length;
  const parts = [];
  if (worse) parts.push(`${worse} of ${items.length} behind Finland overall`);
  if (better) parts.push(`${better} of ${items.length} better`);
  if (items.length - worse - better) parts.push(`${items.length - worse - better} about the same`);
  return parts.join(", ");
}

function Item({ item }: { item: PathwayItem }) {
  const name = INDICATOR_NAME[item.indicator_id];
  if (item.value === null) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold">{name}</p>
        <p className="text-base">No value for this area.</p>
        <ConfidenceBadge grade={item.grade} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-semibold">{name}</p>
      <p className="numeral text-3xl font-normal text-forest-ink">{formatValue(item.indicator_id, item.value)}</p>
      <p className="text-base text-pretty">
        {item.shared ? (
          <>
            {item.shared.name}-wide value, not this area&apos;s own (Finland overall:{" "}
            <span className="figure">{formatValue(item.indicator_id, item.finland)}</span>).
          </>
        ) : (
          <>
            {item.versus ? VERSUS[item.versus] : ""} (Finland overall: <span className="figure">{formatValue(item.indicator_id, item.finland)}</span>)
            {item.target !== undefined ? (
              <>
                ; national target {item.target}%: {item.meets_target ? "reached" : "not reached"}
              </>
            ) : null}
            .
          </>
        )}
      </p>
      <SourceChip sourceId={item.source_id} year={item.year} />
      <ConfidenceBadge grade={item.grade} showReason={item.grade.level !== "solid"} />
    </div>
  );
}

/**
 * The whole pathway for one area in one row: detection, GP access, referral and outcome as
 * published, each against Finland with source, year and grade, and the steps nobody publishes
 * shown empty as "Not published". Side by side only: no step is said to cause another.
 */
export function PathwayRow({
  areaId,
  headingLevel = 3,
  strip = true,
}: {
  areaId: string;
  headingLevel?: 2 | 3;
  /** False leaves out the at-a-glance strip (for a page that shows its own row of steps). */
  strip?: boolean;
}) {
  const row = getPathwayRow(areaId);
  if (!row) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const roadmap = getSource("ev-files-kansallinen-syopastrategia-toimeenpanon-tiekartta-2");
  const survivalYear = row.steps.find((s) => s.id === "outcome")?.items[0]?.year ?? 2024;
  return (
    <div data-slot="pathway-row" className="flex flex-col gap-5">
      <Heading className="type-title">The whole pathway in {row.name}</Heading>
      <CaveatNote short="side by side, not cause and effect">
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li className="text-pretty">With 22 areas, the data cannot show that one step causes another.</li>
          <li className="text-pretty">
            Survival covers people diagnosed over ten years ({survivalYear - 9}–{survivalYear}), so it reflects care in
            earlier years, not this year&apos;s waits.
          </li>
          <li className="text-pretty">
            The GP wait is counted by where people live; referral speed by the hospital that received the referral.
            Neither is about cancer only.
          </li>
          <li className="text-pretty">
            &ldquo;About the same as Finland overall&rdquo; means within 1 percentage point. Screening is also compared with the
            national target of 80% attendance in every programme and county (strategy Goal 2, p. 5; roadmap measure
            2.4.1, p. 48). <SourceChip sourceId="stm-cancer-strategy-2026-2035" />
          </li>
        </ul>
      </CaveatNote>
      {strip ? (
        <ol aria-label={`The seven steps in ${row.name} at a glance`} className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {row.steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                "flex flex-col gap-1 rounded-lg p-3 text-base",
                step.published ? "bg-mint-veil" : "border-2 border-dashed border-forest-ink/50 bg-cream-paper",
              )}
            >
              <span className="font-semibold text-forest-ink">{STEP[step.id].title}</span>
              <span className="text-pretty">{stepSummary(step)}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <ol aria-label="Each step in detail" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {row.steps.map((step) => {
          const meta = STEP[step.id];
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-col gap-4 rounded-[14px] p-6",
                step.published ? "bg-keylime-wash" : "border-2 border-dashed border-forest-ink/50 bg-cream-paper",
                step.id === "detection" && "sm:col-span-2 xl:col-span-4",
                step.id === "outcome" && "sm:col-span-2 xl:col-span-3",
              )}
            >
              <div className="flex flex-col gap-1">
                <p className="type-eyebrow">{meta.title}</p>
                <p className="type-heading text-forest-ink">{meta.question}</p>
              </div>
              {step.published ? (
                <div className={cn("grid gap-5", step.items.length > 1 && "md:grid-cols-2", step.items.length > 2 && "lg:grid-cols-3")}>
                  {step.items.map((item) => (
                    <Item key={item.indicator_id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="numeral text-2xl font-normal text-forest-ink">Not published</p>
                  <p className="text-base text-pretty">{meta.missing}</p>
                  <a
                    href="#starter-dataset"
                    className="w-fit text-base font-semibold text-forest-ink underline underline-offset-4"
                  >
                    What the county can start counting
                  </a>
                  {step.id === "treatment" && roadmap ? (
                    <SourceChip sourceId={roadmap.source_id} />
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
