import { cn } from "cn";

import { buildPathwaySteps, glossName, StepMark } from "@/components/pathway/pathway-steps";
import { SourceChip } from "@/components/source-chip";
import { betterFromDirection, GapPhrase } from "@/components/ui/gap-phrase";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import type { Stage } from "@/lib/data";
import { formatPct, STATUS_LABEL } from "@/lib/ranking";

/** What each share counts, as a line under its figure. */
const COUNTS: Record<Stage, string> = {
  gp_access: "of non-urgent GP visits waited over 7 days",
  gp_recognition: "",
  referral: "of referrals processed within 3 days",
};

/**
 * The three steps of one area as compact chips in the home hero: per step its mark and title,
 * the value (all three in one size, on one baseline), the comparison with Finland in words,
 * what the value counts, and the status and source chips. Step 2 has no public figure anywhere
 * and points to the red-flag helper. The full cards are on the county page.
 */
export function StepChips({ countyId }: { countyId: string }) {
  const steps = buildPathwaySteps(countyId);
  return (
    // Shared rows for the title and the value, so the three values line up; under them each step
    // reads on: what the value counts and how it compares, then its status.
    <ol className="grid gap-y-5 md:grid-cols-3 md:grid-rows-[auto_auto_1fr] md:gap-y-0 md:divide-x md:divide-border">
      {steps.map((step) => {
        const { measure, status } = step;
        const value = measure?.value ?? null;
        const shared = value === null ? measure?.shared : undefined;
        const shown = value ?? shared?.value ?? null;
        return (
          <li
            key={step.stage}
            className="flex min-w-0 flex-col gap-1.5 md:row-span-3 md:grid md:grid-rows-subgrid md:gap-y-1.5 md:px-4 md:first:pl-0 md:last:pr-0"
          >
            <h3 className="flex items-start gap-2 text-[0.8125rem] leading-5 font-medium text-foreground">
              <StepMark step={step.step} status={status} className="size-5 text-[0.6875rem]" />
              <span className="min-w-0 text-pretty">
                <span className="sr-only">Step {step.step}: </span>
                {step.title}
              </span>
            </h3>
            {/* The value and its source on one row, the value at the row's top in one size for all
                three, so they share a baseline. */}
            <div className="flex items-end gap-x-2.5 self-start">
              <p
                className={cn(
                  "numeral text-[2rem] leading-none",
                  shown === null ? "text-muted-foreground" : value !== null ? STATUS_FIGURE[status] : "text-foreground",
                )}
              >
                {shown === null ? <span aria-hidden>–</span> : formatPct(shown)}
              </p>
              {measure && <SourceChip sourceId={measure.sourceId} />}
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="type-caption text-pretty text-muted-foreground">
                {value !== null && measure ? (
                  <>
                    {COUNTS[step.stage]}:{" "}
                    <GapPhrase
                      value={value}
                      finland={measure.finland}
                      better={betterFromDirection(measure.direction)}
                      inkClassName={STATUS_FIGURE[status]}
                    />
                  </>
                ) : shared ? (
                  <>
                    <span className="text-foreground">{shared.name}-wide value, not a county figure</span>:{" "}
                    {COUNTS[step.stage]} across {glossName(shared.name)}
                  </>
                ) : (
                  <>
                    Not measured anywhere in Finland.{" "}
                    <TextLink kind="nav" inline href={`/county/${countyId}/act#red-flags`} className="type-caption">
                      Use the red-flag helper
                    </TextLink>
                  </>
                )}
              </p>
              <StatusBadge status={status} size="xs">
                {shared ? "No county figure" : STATUS_LABEL[status]}
              </StatusBadge>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
