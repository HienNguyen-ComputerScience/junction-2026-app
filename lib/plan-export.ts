// The action plan as a Word document and as an Excel workbook, from the same Plan object the
// page shows (lib/plan-model.ts). Nothing is computed here: every figure and sentence comes
// from the plan, so paper, Word, Excel and the screen cannot disagree.

import type { Block, Run } from "@/lib/export/docx";
import type { Cell, Sheet } from "@/lib/export/xlsx";
import type { Source } from "@/lib/data";
import type { Plan, PlanAction, PlanStep } from "@/lib/plan-model";
import { FIRST_YEAR, formatPct } from "@/lib/ranking";

/** A blank to fill in by hand, for fields the form left empty. */
const BLANK = "____________________";

const NOT_PUBLISHED = "Not published";

/** A short name for a source, the same idea as the chip on screen: "Sotkanet 6411", else the publisher. */
export function shortSource(source: Source | undefined): string {
  if (!source) return "Source missing";
  const match = /^sotkanet-(\d+)$/.exec(source.source_id);
  return match ? `Sotkanet ${match[1]}` : source.publisher;
}

function sourceOf(plan: Plan, sourceId: string | null): Source | undefined {
  return sourceId ? plan.sources.find((source) => source.source_id === sourceId) : undefined;
}

export function planTitle(plan: Plan): string {
  return `Action plan for earlier cancer diagnosis: ${plan.county.name}`;
}

export function planFileName(plan: Plan, extension: "docx" | "xlsx"): string {
  return `firstline-action-plan-${plan.county.id}-${plan.date}.${extension}`;
}

/** "Finland's level (54.7%) by the end of 2028", or why the step has no target. */
export function targetGoal(step: PlanStep, year: number): string {
  if (!step.target) return "No target: the area has no figure of its own for this step";
  if (step.target.path.kind === "hold") return `Hold: already at ${step.target.levelName}`;
  return `${formatPct(step.target.level)} by the end of ${year}: ${step.target.levelName}`;
}

/** "30.7 points to close, 10.2 a year for 3 years", or "". */
export function targetPace(step: PlanStep): string {
  const path = step.target?.path;
  if (!path || path.kind === "hold") return "";
  return `${path.points.toFixed(1)} percentage points to close: ${path.perYear.toFixed(1)} a year for ${path.years} ${path.years === 1 ? "year" : "years"}`;
}

/** "2026: 75.2%, 2027: 64.9%, 2028: 54.7%", or "". */
export function targetMilestones(step: PlanStep): string {
  const path = step.target?.path;
  if (!path || path.kind === "hold") return "";
  return path.milestones.map((point) => `${point.year}: ${formatPct(point.value)}`).join(", ");
}

function roadmapLine(action: PlanAction): string {
  const measure = action.measure;
  if (!measure) return "The national roadmap has no measure that names this action.";
  return `Measure ${measure.measure_id}: ${measure.title} (roadmap ${measure.pages}). Responsible nationally: ${measure.responsible}. Funding: ${measure.funding}`;
}

function roadmapSchedule(action: PlanAction): string {
  if (!action.measure) return "";
  return action.measure.schedule.map((item) => `${item.period}: ${item.text}`).join("\n");
}

const STEP_HEAD = ["Step", "What is counted", "Area", "Finland", "Status", `Since ${FIRST_YEAR}`, "Source"];
const GAP_HEAD = ["Step", "Figure nobody publishes", "What exists today", "What the area can record now", "Who could publish it (our proposal)", "Roadmap measure"];

function stepRow(plan: Plan, step: PlanStep): string[] {
  return [
    `${step.number}. ${step.label}`,
    step.measure ? `${step.measure} (${step.direction})` : "Not measured",
    step.value !== null ? `${formatPct(step.value)} (${step.year})` : "No figure",
    step.finland !== null ? formatPct(step.finland) : NOT_PUBLISHED,
    step.statusLabel,
    [step.changeText, step.caveat].filter(Boolean).join(". ") || "",
    step.sourceId ? `${shortSource(sourceOf(plan, step.sourceId))}, ${step.year}` : "",
  ];
}

/** The plan as Word blocks: a board paper on A4, every section of the page, fields left blank to fill in by hand. */
export function planToDocx(plan: Plan): Block[] {
  const cell = (value: string): Run[] => [value];
  const blocks: Block[] = [
    { type: "title", text: planTitle(plan) },
    {
      type: "note",
      runs: [
        `Drawn up ${plan.date} with FirstLine from published figures (${plan.county.name_fi}). Decision support for service planning. Not medical advice. No patient data.`,
      ],
    },

    { type: "h1", text: "1. Where the area stands" },
    { type: "p", runs: [{ b: plan.lede }] },
    { type: "p", runs: [plan.reason] },
    ...(plan.reasonCaveat ? [{ type: "note", runs: [plan.reasonCaveat] } satisfies Block] : []),
    {
      type: "table",
      widths: [15, 21, 11, 12, 14, 17, 10],
      rows: [STEP_HEAD.map(cell), ...plan.steps.map((step) => stepRow(plan, step).map(cell))],
    },
    ...plan.steps.flatMap((step) =>
      step.note ? [{ type: "note", runs: [{ b: `${step.label}: ` }, step.note] } satisfies Block] : [],
    ),

    { type: "h1", text: "2. Target" },
    { type: "p", runs: [{ b: `${plan.targetLabel}, by the end of ${plan.input.year}.` }] },
    {
      type: "table",
      widths: [18, 12, 30, 22, 18],
      rows: [
        ["Step", "Today", "Target", "Pace", "Year by year"].map(cell),
        ...plan.steps.map((step) =>
          [
            `${step.number}. ${step.label}`,
            step.value !== null ? formatPct(step.value) : "No figure",
            targetGoal(step, plan.input.year),
            targetPace(step),
            targetMilestones(step),
          ].map(cell),
        ),
      ],
    },
    {
      type: "note",
      runs: [
        "The pace is arithmetic on the published shares: an even path from the latest figure to the target level. It is not a forecast and assumes no effect of any action.",
      ],
    },

    { type: "h1", text: "3. Actions" },
    ...plan.actions.flatMap((action): Block[] => {
      const source = sourceOf(plan, action.sourceId);
      const rows: [string, string][] = [
        ["Step on the pathway", action.step],
        ["What it is", action.detail],
        ["Responsible role", action.role],
        ["Named person responsible", action.person || BLANK],
        ["First step", action.firstStep],
        ["Review date", action.review || BLANK],
        ["National roadmap", roadmapLine(action)],
        ...(action.measure ? [["Roadmap schedule", roadmapSchedule(action)] as [string, string]] : []),
        ["How you will know it worked", action.success],
        ["Result where it was tried", `${action.triedWhere} ${action.triedResult}`.trim()],
        ["Limits of that evidence", action.limitations],
        ["Local cost estimate", action.cost || `${BLANK} (no county-level cost is published)`],
        ["Source", source ? `${source.name}. ${source.url}` : "Source missing"],
      ];
      return [
        { type: "h2", text: `Action ${action.number}: ${action.title}` },
        {
          type: "table",
          widths: [26, 74],
          header: false,
          rows: rows.map(([label, value]): Run[][] => [[{ b: label }], [value]]),
        },
      ];
    }),

    { type: "h1", text: "4. What to start recording" },
    {
      type: "p",
      runs: [
        "These figures are not published for any area. Each line says what exists today and what the area can record itself from now on, so that the next review has its own numbers.",
      ],
    },
    {
      type: "table",
      widths: [12, 20, 22, 22, 14, 10],
      rows: [
        GAP_HEAD.map(cell),
        ...plan.dataGaps.map((gap) =>
          [
            gap.stepLabel,
            gap.missing,
            gap.today,
            gap.county_can,
            gap.could_publish,
            gap.measure ? `${gap.measure.measure_id} (${gap.measure.pages})` : "None",
          ].map(cell),
        ),
      ],
    },

    { type: "h1", text: "5. Limits of this plan" },
    ...plan.limits.map((limit): Block => ({ type: "p", runs: [`• ${limit}`] })),

    { type: "h1", text: "6. Sources" },
    {
      type: "table",
      widths: [34, 18, 36, 12],
      rows: [
        ["Source", "Publisher", "Address", "Retrieved"].map(cell),
        ...plan.sources.map((source) => [source.name, source.publisher, source.url, source.retrieved].map(cell)),
      ],
    },

    { type: "h1", text: "Decision" },
    {
      type: "table",
      widths: [50, 50],
      rows: [
        ["Approved by", "Date of decision"].map(cell),
        [plan.input.approvedBy || BLANK, plan.input.decisionDate || BLANK].map(cell),
      ],
    },
  ];
  return blocks;
}

/** The plan as Excel sheets: one table per sheet, numbers as numbers so they sort and chart. */
export function planToSheets(plan: Plan): Sheet[] {
  const steps: Cell[][] = [
    ["Step", "What is counted", "Direction", `Area, % (${plan.steps[0]?.year ?? ""})`, "Finland, %", "Status", `Area, % (${FIRST_YEAR})`, "Change", "Note", "Source", "Source address"],
    ...plan.steps.map((step): Cell[] => {
      const source = sourceOf(plan, step.sourceId);
      return [
        `${step.number}. ${step.label}`,
        step.measure ?? "Not measured",
        step.direction ?? "",
        step.value,
        step.finland,
        step.statusLabel,
        step.first?.value ?? null,
        [step.changeText, step.caveat].filter(Boolean).join(". "),
        step.note ?? "",
        step.sourceId ? shortSource(source) : "",
        source?.url ?? "",
      ];
    }),
  ];

  const years = [...new Set(plan.steps.flatMap((step) => (step.target?.path.kind === "close" ? step.target.path.milestones.map((point) => point.year) : [])))].sort();
  const target: Cell[][] = [
    ["Step", "Today, %", "Target level, %", "Target", "Points to close", "Points a year", ...years.map((year) => `${year}, %`)],
    ...plan.steps.map((step): Cell[] => {
      const path = step.target?.path;
      const closing = path && path.kind === "close" ? path : null;
      return [
        `${step.number}. ${step.label}`,
        step.value,
        step.target ? Number(step.target.level.toFixed(1)) : null,
        targetGoal(step, plan.input.year),
        closing?.points ?? null,
        closing?.perYear ?? null,
        ...years.map((year) => closing?.milestones.find((point) => point.year === year)?.value ?? null),
      ];
    }),
    [],
    ["The pace is arithmetic on the published shares: an even path from the latest figure to the target level. It is not a forecast and assumes no effect of any action."],
  ];

  const actions: Cell[][] = [
    ["No.", "Action", "Step", "What it is", "Responsible role", "Named person responsible", "First step", "Review date", "National roadmap", "Roadmap schedule", "How you will know it worked", "Result where it was tried", "Limits of that evidence", "Local cost estimate (not published; the area's own)", "Source", "Source address"],
    ...plan.actions.map((action): Cell[] => {
      const source = sourceOf(plan, action.sourceId);
      return [
        action.number,
        action.title,
        action.step,
        action.detail,
        action.role,
        action.person,
        action.firstStep,
        action.review,
        roadmapLine(action),
        roadmapSchedule(action),
        action.success,
        `${action.triedWhere} ${action.triedResult}`.trim(),
        action.limitations,
        action.cost,
        source?.name ?? "Source missing",
        source?.url ?? "",
      ];
    }),
  ];

  const gaps: Cell[][] = [
    [...GAP_HEAD, "Source", "Source address"],
    ...plan.dataGaps.map((gap): Cell[] => {
      const source = sourceOf(plan, gap.source_id);
      return [
        gap.stepLabel,
        gap.missing,
        gap.today,
        gap.county_can,
        gap.could_publish,
        gap.measure ? `${gap.measure.measure_id}: ${gap.measure.title}` : "None",
        source?.name ?? "",
        source?.url ?? "",
      ];
    }),
  ];

  const about: Cell[][] = [
    [planTitle(plan)],
    [`Drawn up ${plan.date} with FirstLine from published figures.`],
    [plan.lede],
    [plan.reason],
    ...(plan.reasonCaveat ? [[plan.reasonCaveat]] : []),
    [`Target: ${plan.targetLabel}, by the end of ${plan.input.year}.`],
    [`Approved by: ${plan.input.approvedBy}`],
    [`Date of decision: ${plan.input.decisionDate}`],
    [],
    ["Limits of this plan"],
    ...plan.limits.map((limit): Cell[] => [limit]),
  ];

  const sources: Cell[][] = [
    ["Source", "Publisher", "Address", "Retrieved", "Data updated"],
    ...plan.sources.map((source): Cell[] => [source.name, source.publisher, source.url, source.retrieved, source.data_updated ?? ""]),
  ];

  return [
    { name: "Plan", widths: [110], rows: about },
    { name: "Where the area stands", widths: [28, 44, 16, 14, 12, 28, 14, 40, 50, 18, 50], rows: steps },
    { name: "Target", widths: [28, 12, 16, 50, 16, 14, ...years.map(() => 10)], rows: target },
    { name: "Actions", widths: [6, 40, 22, 50, 30, 26, 50, 14, 60, 60, 50, 60, 50, 26, 40, 50], rows: actions },
    { name: "What to start recording", widths: [22, 44, 50, 50, 40, 44, 40, 50], rows: gaps },
    { name: "Sources", widths: [60, 30, 60, 12, 12], rows: sources },
  ];
}
