import { cn } from "cn";

import { STEP2_NOTE, STEP2_SOURCE, StepMark, type PathwayStep } from "@/components/pathway/pathway-steps";
import type { StepTab } from "@/components/pathway/step-tabs";
import { TrendStrip, type TrendStage } from "@/components/pathway/trend-strip";
import { gapWords, HUS_FULL } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { getValue, type Stage } from "@/lib/data";
import {
  formatPct,
  getNationalValue,
  getTrend,
  GP_WAIT_ID,
  REFERRAL_ID,
  REFERRAL_LATE_ID,
  STATUS_LABEL,
  YEARS,
} from "@/lib/ranking";
import { getRecordingCaveat } from "@/lib/recording";

/** The bar's axis label: what the share counts and which way is better. */
const AXIS: Partial<Record<Stage, string>> = {
  gp_access: "% of non-urgent GP visits waiting over 7 days (lower is better)",
  referral: "% of referrals processed within 3 days (higher is better)",
};

/** Where each empty tab's "see why" link goes: the limitation that explains it (ids set in the county page). */
const WHY: Partial<Record<Stage, string>> = { gp_recognition: "#limit-step-2", referral: "#limit-referral" };

const INDICATOR: Partial<Record<Stage, string>> = { gp_access: GP_WAIT_ID, referral: REFERRAL_ID };

/**
 * The three steps as tabs for the county page: per tab the step's name, value, status word and
 * source chip (a tab without a figure says why instead); per panel only that step's detail (the
 * gap to Finland, the bar, a compact trend).
 */
export function buildStepTabs(countyId: string, steps: PathwayStep[]): StepTab[] {
  return steps.map((step) => {
    const empty = !step.measure || step.measure.value === null;
    const trendStage = trendFor(countyId, step);
    return {
      id: step.stage,
      tab: <TabFace step={step} />,
      // Only a step with a figure has a chip under its tab; a step without one shows its status
      // alone, and its source and "see why" are in its panel.
      chip: step.measure && !empty ? <SourceChip sourceId={step.measure.sourceId} /> : undefined,
      panel: <StepPanel countyId={countyId} step={step} />,
      aside: trendStage ? <TrendStrip stages={[trendStage]} areaName={countyId} /> : undefined,
    };
  });
}

function TabFace({ step }: { step: PathwayStep }) {
  const { measure, status } = step;
  const value = measure?.value ?? null;
  const shared = value === null ? measure?.shared : undefined;
  return (
    <>
      <span className="flex items-start gap-2 max-sm:w-full sm:h-10">
        <StepMark step={step.step} status={status} className="mt-px size-5 text-[0.6875rem]" />
        <span className="text-[0.9375rem] leading-5 font-semibold text-pretty text-foreground">
          <span className="sr-only">Step {step.step}: </span>
          {step.title}
        </span>
      </span>
      {value !== null && (
        // The selected tab's number is the page's focal point (44px); the others stay quiet.
        <span
          className={cn(
            "numeral text-[1.75rem] leading-none group-aria-selected/tab:text-[2.75rem]",
            STATUS_FIGURE[status],
          )}
        >
          {formatPct(value)}
        </span>
      )}
      {/* A step with no figure of its own shows its status alone: no number, no wider value
          (the hospital group's value is in the step's panel). */}
      <StatusBadge status={status} size="xs">
        {shared ? "No county figure" : STATUS_LABEL[status]}
      </StatusBadge>
    </>
  );
}

/** The step's trend card (the county page shows it beside the tabs), or null when it has under two years. */
function trendFor(countyId: string, step: PathwayStep): TrendStage | null {
  const { measure, status } = step;
  const indicatorId = INDICATOR[step.stage];
  if (!measure || measure.value === null || !indicatorId) return null;
  const trend = getTrend(countyId, indicatorId).map(({ year, value: point }) => ({
    year,
    value: point?.value ?? null,
  }));
  if (trend.length < 2) return null;
  return {
    step: step.step,
    title: step.title,
    status,
    sourceId: measure.sourceId,
    year: measure.year,
    direction: measure.direction,
    trend,
    nationalTrend: YEARS.map((year) => ({ year, value: getNationalValue(indicatorId, year)?.value ?? null })),
    recordingCaveat: indicatorId === GP_WAIT_ID ? getRecordingCaveat(countyId) : null,
  };
}

function StepPanel({ countyId, step }: { countyId: string; step: PathwayStep }) {
  const { measure, status } = step;

  // Step 2: nothing is published anywhere in Finland.
  if (!measure) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No public data</p>
        <p className="text-sm text-pretty text-muted-foreground">{STEP2_NOTE}</p>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <SourceChip sourceId={STEP2_SOURCE} />
          <TextLink kind="nav" inline href={`/county/${countyId}/act#referral-routes`} className="text-sm">
            The four referral routes a county needs
          </TextLink>
          <TextLink kind="jump" href={WHY.gp_recognition ?? "#"} className="min-h-6 text-[0.8125rem]">
            see why
          </TextLink>
        </span>
      </div>
    );
  }

  const value = measure.value;
  const finlandLabel = `Finland ${formatPct(measure.finland)}`;

  if (value === null) {
    return (
      <div className="grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col gap-1.5">
          {measure.shared ? (
            <>
              <p className="text-sm font-medium text-foreground">
                {measure.shared.name === "HUS" ? HUS_FULL : measure.shared.name} value:{" "}
                <span className="figure">{formatPct(measure.shared.value)}</span>
              </p>
              <p className="text-sm text-pretty text-muted-foreground">
                Referrals from here go to {measure.shared.name}, which publishes one figure for all its areas.{" "}
                {measure.shared.name}-wide value, not a county figure.
              </p>
            </>
          ) : (
            <p className="text-sm text-pretty text-muted-foreground">{measure.note}</p>
          )}
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <SourceChip sourceId={measure.sourceId} />
            {WHY[step.stage] ? (
              <TextLink kind="jump" href={WHY[step.stage] ?? "#"} className="min-h-6 text-[0.8125rem]">
                see why
              </TextLink>
            ) : null}
          </span>
        </div>
        {/* A shared figure is drawn as a plain neutral bar: the hatch means no public data only. */}
        <div className="flex flex-col gap-1.5">
          {measure.shared && <p className="type-note text-muted-foreground">{AXIS[step.stage]}</p>}
          <MeasureBar
            value={measure.shared ? measure.shared.value : null}
            finland={measure.finland}
            finlandLabel={finlandLabel}
            status={measure.shared ? null : status}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        <p className="text-sm text-pretty text-foreground">{gapWords(value, measure.finland)}.</p>
        <div className="flex max-w-[34rem] flex-col gap-1.5">
          <p className="type-note text-muted-foreground">{AXIS[step.stage]}</p>
          <MeasureBar value={value} finland={measure.finland} finlandLabel={finlandLabel} status={status} />
        </div>
      </div>
      {step.stage === "referral" && <LateReferrals countyId={countyId} />}
    </div>
  );
}

/** Referrals waiting over 21 days: context only, one line with its chip. */
function LateReferrals({ countyId }: { countyId: string }) {
  const here = getValue(countyId, REFERRAL_LATE_ID);
  const finland = getNationalValue(REFERRAL_LATE_ID);
  if (!here && !finland) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 type-caption text-muted-foreground">
      <span>
        Referrals waiting over 21 days (context only):{" "}
        {here ? (
          <>
            <span className="figure text-foreground">{formatPct(here.value)}</span> here
          </>
        ) : (
          "no public data here"
        )}
        {finland && (
          <>
            {" "}
            · Finland <span className="figure text-foreground">{formatPct(finland.value)}</span>
          </>
        )}
      </span>
      <SourceChip sourceId={here?.source_id ?? finland?.source_id ?? `sotkanet-${REFERRAL_LATE_ID}`} />
    </p>
  );
}
