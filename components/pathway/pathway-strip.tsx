import { buildPathwaySteps, StepMark } from "@/components/pathway/pathway-steps";
import { STAGE_LABELS } from "@/lib/act";
import { SourceChip } from "@/components/source-chip";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
import type { Stage } from "@/lib/data";
import { getStageGap, STATUS_LABEL, stageStatus } from "@/lib/ranking";
import { cn } from "cn";

type Group = "patient" | "county" | "hospital";

// The eight steps as drawn in the challenge talk (slide 10). FirstLine covers steps 3 to 5;
// `stage` marks the steps that are FirstLine's own (their mark and status come from the data).
const STEPS: { label: string; group: Group; stage?: Stage }[] = [
  { label: "Symptoms begin", group: "patient" },
  { label: "Considering seeking care", group: "patient" },
  { label: "First healthcare contact", group: "county", stage: "gp_access" },
  { label: "Physician assessment", group: "county", stage: "gp_recognition" },
  { label: "Tests and referrals", group: "county", stage: "referral" },
  { label: "Diagnosis", group: "hospital" },
  { label: "Treatment plan", group: "hospital" },
  { label: "Treatment starts", group: "hospital" },
];

const GROUPS: { group: Group; label: string; from: number; span: number }[] = [
  { group: "patient", label: "Patient", from: 1, span: 2 },
  { group: "county", label: "Where a county can act", from: 3, span: 3 },
  { group: "hospital", label: "Hospital", from: 6, span: 3 },
];

/** The status of one of FirstLine's steps in words: the status label, or why there is none. */
function stageTag(countyId: string, stage: Stage): string {
  if (stage === "gp_recognition") return STATUS_LABEL.no_data;
  const status = stageStatus(countyId, stage);
  if (status === "red" || status === "amber") return STATUS_LABEL[status];
  const shared = getStageGap(countyId, stage)?.shared;
  return shared ? `${shared.name}-wide only` : STATUS_LABEL.no_data;
}

/**
 * Where FirstLine's three steps sit in the full pathway from symptoms to treatment: one
 * stepper of eight nodes. FirstLine's steps carry the same marks as the step cards (number and
 * status); the patient's and the hospital's steps are quiet outline dots. Desktop: a horizontal
 * line with a bracket over each group. Phone: the same nodes on a vertical line.
 */
export function PathwayStrip({ countyId }: { countyId: string }) {
  const cards = buildPathwaySteps(countyId);
  const cardOf = (stage?: Stage) => cards.find((card) => card.stage === stage);

  return (
    <Frame aria-labelledby="whole-pathway-heading">
      <FrameHeader>
        <FrameTitle id="whole-pathway-heading" className="type-title">
          Where these steps sit on the way to treatment
        </FrameTitle>
      </FrameHeader>
      <FramePanel padding="none" className="px-4 pt-4 pb-4 sm:px-6 md:pt-5">
        {/* The brackets over the groups (desktop). */}
        <div aria-hidden className="grid grid-cols-8 max-md:hidden">
          {GROUPS.map((group) => (
            <div
              key={group.group}
              className="relative flex flex-col items-center pb-3"
              style={{ gridColumn: `${group.from} / span ${group.span}` }}
            >
              <span
                className={cn(
                  "type-caption",
                  group.group === "county" ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {group.label}
              </span>
              <span
                className={cn(
                  "absolute bottom-0 h-1.5 border-x border-t",
                  group.group === "county" ? "border-foreground/60" : "border-foreground/20",
                )}
                style={{ left: `${50 / group.span}%`, right: `${50 / group.span}%` }}
              />
            </div>
          ))}
        </div>

        <ol className="relative grid gap-y-3 pt-0 md:grid-cols-8 md:gap-y-0 md:pt-3">
          {/* The line the nodes sit on: across on desktop, down on a phone. */}
          <span
            aria-hidden
            className="absolute bg-foreground/20 max-md:top-3 max-md:bottom-3 max-md:left-3.5 max-md:w-px md:top-[1.625rem] md:right-[6.25%] md:left-[6.25%] md:h-px"
          />
          {STEPS.map((step, index) => {
            const card = cardOf(step.stage);
            const groupStart = GROUPS.find((group) => group.from === index + 1);
            return (
              <li
                key={step.label}
                className="relative flex items-start gap-3 md:flex-col md:items-center md:gap-2 md:px-1 md:text-center"
              >
                <span className="flex size-7 shrink-0 items-center justify-center">
                  {card ? (
                    <StepMark
                      step={card.step}
                      status={card.status}
                      className={cn(
                        "size-7 text-[0.8125rem] ring-4 ring-card",
                        card.status === "no_data" && "bg-muted",
                      )}
                    />
                  ) : (
                    <span aria-hidden className="size-2.5 rounded-full border border-foreground/35 bg-card" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 max-md:pt-1 md:items-center">
                  {groupStart && (
                    <span
                      className={cn(
                        "type-note md:hidden",
                        groupStart.group === "county" ? "font-medium text-foreground" : "text-faint",
                      )}
                    >
                      {groupStart.label}
                    </span>
                  )}
                  <span
                    title={step.stage ? `Challenge talk wording: ${step.label}` : undefined}
                    className={cn(
                      "text-[0.8125rem] leading-snug text-pretty",
                      card ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {card && <span className="sr-only">FirstLine step {card.step}, </span>}
                    {step.stage ? STAGE_LABELS[step.stage] : step.label}
                  </span>
                  {card && step.stage && (
                    <span className="type-note text-muted-foreground">{stageTag(countyId, step.stage)}</span>
                  )}
                  {step.stage === "gp_recognition" && (
                    <TextLink kind="nav" href={`/county/${countyId}/act#referral-routes`} className="type-note">
                      The four referral routes a county needs
                    </TextLink>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col gap-2">
            <p className="type-caption text-muted-foreground">
              Median days from first symptoms to treatment: one lymphoma type, 160 patients
            </p>
            <dl className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <div className="flex flex-col">
                <dt className="order-2 type-caption text-muted-foreground">First contact public</dt>
                <dd className="numeral text-[1.75rem] leading-tight text-foreground">
                  127 <span className="text-base text-muted-foreground">days</span>
                </dd>
              </div>
              <span aria-hidden className="pb-6 type-caption text-faint">
                vs
              </span>
              <div className="flex flex-col">
                <dt className="order-2 type-caption text-muted-foreground">Private or occupational</dt>
                <dd className="numeral text-[1.75rem] leading-tight text-foreground">
                  76 <span className="text-base text-muted-foreground">days</span>
                </dd>
              </div>
              <span className="pb-1">
                <SourceChip sourceId="kuitunen-2026" />
              </span>
            </dl>
          </div>
          <p className="type-caption text-muted-foreground md:max-w-[22rem] md:text-right">
            The eight steps are from the Junction 2026 challenge talk (H. Kuitunen, 13 Nov 2026).
          </p>
        </div>
      </FramePanel>
    </Frame>
  );
}
