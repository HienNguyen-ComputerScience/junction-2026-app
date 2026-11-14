import { cn } from "cn";

import { StepMark, type PathwayStep } from "@/components/pathway/pathway-steps";
import type { StepTab } from "@/components/pathway/step-tabs";
import { TREND_FILL, TREND_PAST_FILL, WorseColumn } from "@/components/pathway/trend-strip";
import { gapWords, HUS_FULL } from "@/components/pathway/wording";
import { SourceChip } from "@/components/source-chip";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { getValue, type Stage } from "@/lib/data";
import { formatPct, getNationalValue, getTrend, GP_WAIT_ID, REFERRAL_ID, REFERRAL_LATE_ID, STATUS_LABEL } from "@/lib/ranking";

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
    const why = WHY[step.stage];
    return {
      id: step.stage,
      tab: <TabFace step={step} />,
      chip:
        step.measure || (empty && why) ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {step.measure ? <SourceChip sourceId={step.measure.sourceId} /> : null}
            {empty && why ? (
              <TextLink kind="jump" href={why} className="min-h-6 text-[0.8125rem]">
                see why
              </TextLink>
            ) : null}
          </span>
        ) : undefined,
      panel: <StepPanel countyId={countyId} step={step} />,
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
      <span
        className={cn(
          "numeral text-[1.75rem] leading-none",
          value !== null ? STATUS_FIGURE[status] : shared ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {value !== null ? formatPct(value) : shared ? formatPct(shared.value) : <span aria-hidden>–</span>}
      </span>
      <StatusBadge status={status} size="xs">
        {shared ? "No county figure" : STATUS_LABEL[status]}
      </StatusBadge>
    </>
  );
}

function StepPanel({ countyId, step }: { countyId: string; step: PathwayStep }) {
  const { measure, status } = step;

  // Step 2: nothing is published anywhere in Finland.
  if (!measure) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No public data</p>
        <p className="text-sm text-muted-foreground">
          Not measured anywhere in Finland. Use the{" "}
          <TextLink kind="nav" inline href={`/county/${countyId}/act#red-flags`}>
            red-flag helper
          </TextLink>
        </p>
      </div>
    );
  }

  const value = measure.value;
  const finlandLabel = `Finland ${formatPct(measure.finland)}`;

  if (value === null) {
    return (
      <div className="grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col gap-1">
          {measure.shared ? (
            <>
              <p className="text-sm text-pretty text-muted-foreground">
                Referrals from here go to {measure.shared.name === "HUS" ? HUS_FULL : measure.shared.name}, which
                publishes one figure for all its areas.
              </p>
              <p className="text-sm font-medium text-foreground">
                {measure.shared.name}-wide value, not a county figure
              </p>
            </>
          ) : (
            <p className="text-sm text-pretty text-muted-foreground">{measure.note}</p>
          )}
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

  const indicatorId = INDICATOR[step.stage];
  const trend = indicatorId
    ? getTrend(countyId, indicatorId).map(({ year, value: point }) => ({ year, value: point?.value ?? null }))
    : [];
  const finlandLatest = indicatorId ? (getNationalValue(indicatorId)?.value ?? null) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,1fr)_12.5rem] md:items-end">
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-pretty text-foreground">{gapWords(value, measure.finland)}.</p>
          <div className="flex flex-col gap-1.5">
            <p className="type-note text-muted-foreground">{AXIS[step.stage]}</p>
            <MeasureBar value={value} finland={measure.finland} finlandLabel={finlandLabel} status={status} />
          </div>
        </div>
        {trend.length > 1 && <CompactTrend trend={trend} finland={finlandLatest} status={status} />}
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

type Point = { year: number; value: number | null };

/** Height of the zero-based plot (0 to 100%), in px. */
const PLOT = 44;

/**
 * The years as three small zero-based columns. The earlier years are grey with their value
 * above; the latest is drawn by the bar rule and carries only its year (its value is the tab's
 * figure). Finland's latest value is the line across the latest column.
 */
function CompactTrend({ trend, finland, status }: { trend: Point[]; finland: number | null; status: StepStatus }) {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const last = trend.length - 1;
  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="type-caption text-muted-foreground">
        Trend, {trend[0].year}–{trend[last].year}
      </figcaption>
      <span aria-hidden className="flex h-[4.25rem] items-end gap-3 border-b border-foreground/30 pr-14 pl-1">
        {trend.map((point, i) => {
          const top = Math.max(point.value ?? 0, i === last && finland !== null ? finland : 0);
          return (
            <span key={point.year} className="relative h-full flex-1">
              {point.value !== null && (
                <>
                  <span className="absolute inset-x-0 bottom-0 block" style={{ height: PLOT }}>
                    {i === last && status === "red" && finland !== null ? (
                      <WorseColumn value={clamp(point.value)} finland={clamp(finland)} />
                    ) : (
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-0 rounded-t-[2px]",
                          i === last ? TREND_FILL[status] : TREND_PAST_FILL,
                        )}
                        style={{ height: `${clamp(point.value)}%` }}
                      />
                    )}
                    {i === last && finland !== null && (
                      <span
                        className="absolute -inset-x-1 h-0.5 bg-foreground"
                        style={{ bottom: `calc(${clamp(finland)}% - 1px)` }}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-0 text-center figure whitespace-nowrap",
                      i < last ? "type-note text-muted-foreground" : cn("text-[0.8125rem] font-semibold", STATUS_FIGURE[status]),
                    )}
                    style={{ bottom: (clamp(top) / 100) * PLOT + 3 }}
                  >
                    {formatPct(point.value)}
                  </span>
                  {i === last && finland !== null && (
                    <span
                      className="absolute left-full ml-2 type-note whitespace-nowrap text-foreground"
                      style={{ bottom: (clamp(finland) / 100) * PLOT - 8 }}
                    >
                      Finland
                    </span>
                  )}
                </>
              )}
            </span>
          );
        })}
      </span>
      <span aria-hidden className="flex gap-3 pr-14 pl-1 type-note text-faint">
        {trend.map((point) => (
          <span key={point.year} className="flex flex-1 justify-center figure">
            {point.year}
          </span>
        ))}
      </span>
      <span aria-hidden className="flex items-center gap-1.5 type-note text-muted-foreground">
        <span className={cn("h-2.5 w-5 rounded-[2px]", TREND_PAST_FILL)} />
        Earlier years
      </span>
      <span className="sr-only">
        {trend.map((point) => `${point.year}: ${point.value === null ? "no data" : formatPct(point.value)}`).join(", ")}.
      </span>
    </figure>
  );
}

type StepStatus = PathwayStep["status"];
