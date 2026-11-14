import { cn } from "cn";

import { buildPathwaySteps, StepMark, type PathwayStep } from "@/components/pathway/pathway-steps";
import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { getBottleneck } from "@/lib/act";
import type { GapStatus, Stage } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

type Group = "patient" | "county" | "hospital";

// The eight steps from first symptoms to treatment, as drawn in the challenge talk (slide 10).
// FirstLine measures the middle three (`stage`): they carry the step cards' titles and marks.
const NODES: { label: string; group: Group; stage?: Stage }[] = [
  { label: "Symptoms begin", group: "patient" },
  { label: "Considering seeking care", group: "patient" },
  { label: "First healthcare contact", group: "county", stage: "gp_access" },
  { label: "Physician assessment", group: "county", stage: "gp_recognition" },
  { label: "Tests and referrals", group: "county", stage: "referral" },
  { label: "Diagnosis", group: "hospital" },
  { label: "Treatment plan", group: "hospital" },
  { label: "Treatment starts", group: "hospital" },
];

// The county's three steps get wider columns: they carry a status line under their title. (The
// node list repeats it with an `md:` prefix, written out so Tailwind sees the class.)
const COLUMNS = "grid-cols-[1fr_1fr_1.9fr_1.9fr_1.9fr_1fr_1fr_1fr]";

const GROUPS: { group: Group; label: string; span: number }[] = [
  { group: "patient", label: "Patient · not measured here", span: 2 },
  { group: "county", label: "Where a county can act", span: 3 },
  { group: "hospital", label: "Hospital · not measured here", span: 3 },
];

/** The status of a step in the one set of words: a hospital group's value stands in only as "No county figure". */
function statusWords(step: PathwayStep): string {
  if (step.measure?.shared && step.measure.value === null) return "No county figure";
  return STATUS_LABEL[step.status];
}

/** A status in words with its 8px square, wrapping under the node (never colour alone). */
function StatusWords({ status, lit, children }: { status: GapStatus; lit: boolean; children: string }) {
  const square: Record<GapStatus, string> = {
    red: "bg-status-red",
    amber: "bg-status-amber",
    no_data: "bg-status-grey",
  };
  return (
    <span
      className={cn(
        "inline text-pretty",
        lit ? "font-medium text-status-red-ink" : "text-muted-foreground",
      )}
    >
      <span aria-hidden className={cn("mr-1.5 inline-block size-2 rounded-[2px] align-[0.05em]", square[status])} />
      {children}
    </span>
  );
}

/**
 * FirstLine's signature: the pathway from first symptoms to treatment as one horizontal line,
 * with the step where this area's pathway breaks lit in red and named above it ("Breaks here:
 * Getting to a GP"). Measured steps are solid nodes in their status colour, a step with no
 * public data a hollow node with a dashed edge, and the patient's and the hospital's steps
 * (outside the data, named once per group over the line) small hollow dots on a dashed line.
 * One accent (the status red), no glow.
 *
 *  - size "lg": the home page, under the headline. "sm": the top of the county and act pages.
 *  - showValues: each measured step's share and Finland's under its status (act page, where no
 *    other figure is on screen). Off by default, so a figure shown elsewhere is not repeated.
 *  - redFlagHref: where step 2's red-flag helper link goes.
 *
 * Every status is in words; the source line under the line names where they come from.
 */
export function PathwayLine({
  countyId,
  size = "lg",
  showValues = false,
  redFlagHref,
  className,
}: {
  countyId: string;
  size?: "lg" | "sm";
  showValues?: boolean;
  redFlagHref: string;
  className?: string;
}) {
  const lg = size === "lg";
  const steps = buildPathwaySteps(countyId);
  const stepOf = (stage?: Stage) => steps.find((step) => step.stage === stage);
  const bottleneck = getBottleneck(countyId);
  const breakStage = bottleneck.anyRed ? bottleneck.focus[0]?.stage : undefined;
  const breakStep = stepOf(breakStage);
  const sources = [...new Set(steps.flatMap((step) => (step.measure ? [step.measure.sourceId] : [])))];
  const year = steps.find((step) => step.measure)?.measure?.year;

  return (
    <figure className={cn("flex flex-col", className)}>
      <figcaption className="sr-only">
        The path from first symptoms to treatment.{" "}
        {breakStep
          ? `The pathway breaks at step ${breakStep.step}, ${breakStep.title}: ${STATUS_LABEL.red}.`
          : "No measured step is worse than Finland's level."}
      </figcaption>

      {/* Over the line (desktop): the outer groups named once each, and over the county's
          steps the "Breaks here" label on the lit step (or that no step is worse). */}
      <div aria-hidden className={cn("grid items-end max-md:hidden", COLUMNS, lg ? "min-h-8 pb-2" : "min-h-6 pb-1")}>
        {GROUPS.map((group) =>
          group.group === "county" ? (
            <div key={group.group} className="grid grid-cols-3" style={{ gridColumn: `span ${group.span}` }}>
              {breakStep ? (
                <span
                  className={cn(
                    "flex flex-col items-center gap-1 justify-self-center font-medium whitespace-nowrap text-status-red-ink",
                    lg ? "text-[0.9375rem]" : "text-[0.8125rem]",
                  )}
                  style={{ gridColumnStart: breakStep.step }}
                >
                  Breaks here: {breakStep.title}
                  <span className={cn("w-px bg-status-red", lg ? "h-2" : "h-1.5")} />
                </span>
              ) : (
                <span
                  className={cn(
                    "col-span-3 justify-self-center whitespace-nowrap text-muted-foreground",
                    lg ? "text-sm" : "type-note",
                  )}
                >
                  No measured step is worse than Finland
                </span>
              )}
            </div>
          ) : (
            <span
              key={group.group}
              className="justify-self-center pb-0.5 type-note text-faint"
              style={{ gridColumn: `span ${group.span}` }}
            >
              {group.label}
            </span>
          ),
        )}
      </div>

      {/* Desktop: across. Phone: the same nodes down a vertical line. */}
      <ol className="relative grid max-md:gap-y-3 md:grid-cols-[1fr_1fr_1.9fr_1.9fr_1.9fr_1fr_1fr_1fr]">
        {/* The vertical line on a phone. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-3 bottom-3 w-px -translate-x-1/2 bg-foreground/20 md:hidden",
            lg ? "left-[1.125rem]" : "left-3.5",
          )}
        />
        {NODES.map((node, index) => {
          const step = stepOf(node.stage);
          const lit = step !== undefined && step.stage === breakStage;
          const prev = NODES[index - 1];
          const next = NODES[index + 1];
          return (
            <li key={node.label} className="relative flex items-start gap-3 md:block md:px-1.5 md:text-center">
              <span className="flex min-w-0 items-start gap-3 md:flex-col md:items-center md:gap-0">
                <span
                  className={cn(
                    "relative flex shrink-0 items-center justify-center md:w-full",
                    lg ? "h-9 w-9" : "h-7 w-7",
                  )}
                >
                  {/* The line: half a segment to each side, so it runs from node to node. */}
                  {prev && <Segment side="left" from={prev.group} to={node.group} />}
                  {next && <Segment side="right" from={node.group} to={next.group} />}
                  {step ? (
                    // A step with no public data is a hollow node with a dashed edge (the step
                    // cards' own mark); the card-coloured disc hides the line behind it.
                    <span className="relative rounded-full bg-card ring-4 ring-card">
                      <StepMark
                        step={step.step}
                        status={step.status}
                        className={cn(
                          lg ? "size-8 text-[0.875rem]" : "size-6",
                          lit && (lg ? "size-9 text-[0.9375rem]" : "size-7"),
                        )}
                      />
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "relative rounded-full border border-foreground/40 bg-card ring-4 ring-card",
                        lg ? "size-3" : "size-2.5",
                      )}
                    />
                  )}
                </span>

                <span
                  className={cn(
                    "flex min-w-0 flex-col max-md:pt-1 md:items-center",
                    lg ? "gap-1 md:pt-2.5" : "gap-0.5 md:pt-1.5",
                  )}
                >
                  {lit && step && (
                    <span className="text-[0.8125rem] font-medium text-status-red-ink md:hidden">Breaks here</span>
                  )}
                  <span
                    className={cn(
                      "leading-snug text-pretty",
                      step
                        ? cn("font-medium text-foreground", lg ? "text-[0.9375rem]" : "text-[0.8125rem]")
                        : cn("text-muted-foreground", lg ? "text-[0.8125rem]" : "type-note"),
                    )}
                  >
                    {step && <span className="sr-only">Step {step.step}: </span>}
                    {step ? step.title : node.label}
                  </span>
                  {step && (
                    <span className={cn("leading-snug", lg ? "text-[0.8125rem]" : "type-note")}>
                      <StatusWords status={step.status} lit={lit}>
                        {statusWords(step)}
                      </StatusWords>
                    </span>
                  )}
                  {step && showValues && step.measure && step.measure.value !== null && (
                    <span className="type-note text-muted-foreground">
                      <span className={cn("figure font-medium", STATUS_FIGURE[step.status])}>
                        {formatPct(step.measure.value)}
                      </span>{" "}
                      · Finland <span className="figure text-foreground">{formatPct(step.measure.finland)}</span>
                    </span>
                  )}
                  {step?.stage === "gp_recognition" && (
                    <TextLink kind="nav" href={redFlagHref} className={lg ? "text-[0.8125rem]" : "type-note"}>
                      Red-flag helper
                    </TextLink>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Where the statuses come from, and where the eight steps come from. */}
      <p
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1.5 type-caption text-muted-foreground",
          lg ? "mt-4" : "mt-2.5",
        )}
      >
        <span>Status against Finland&apos;s level{year ? ` (${year})` : ""}</span>
        {sources.map((sourceId) => (
          <SourceChip key={sourceId} sourceId={sourceId} />
        ))}
        <span className="md:ml-auto">Steps from the Junction 2026 challenge talk (H. Kuitunen, 13 Nov 2026)</span>
      </p>
    </figure>
  );
}

/**
 * Half of the line between two nodes. Inside the county's steps it is solid; where either end
 * is outside the data (the patient's or the hospital's steps) it is dashed and fainter.
 */
function Segment({ side, from, to }: { side: "left" | "right"; from: Group; to: Group }) {
  const measured = from === "county" && to === "county";
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-1/2 w-1/2 -translate-y-1/2 max-md:hidden",
        side === "left" ? "left-0" : "right-0",
        measured ? "h-0.5 bg-foreground/45" : "h-0 border-t border-dashed border-foreground/30",
      )}
    />
  );
}
