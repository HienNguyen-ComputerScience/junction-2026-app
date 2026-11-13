// Derived views over the snapshot for the ranking and pathway screens.
// Pure functions over lib/data.ts; no numbers are invented here.

import {
  counties,
  getGaps,
  getValue,
  indicators,
  LATEST_YEAR,
  type County,
  type Gap,
  type GapStatus,
  type Indicator,
  type IndicatorValue,
  type Stage,
} from "@/lib/data";

export const GP_WAIT_ID = "6411";
export const REFERRAL_ID = "13";
export const REFERRAL_LATE_ID = "5033";
export const NATIONAL_ID = "finland";
export const FIRST_YEAR = 2023;
export const YEARS = [2023, 2024, 2025] as const;

export function getIndicator(indicatorId: string): Indicator | undefined {
  return indicators.find((indicator) => indicator.indicator_id === indicatorId);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export type RankingRow = {
  county: County;
  rank: number;
  gpWait: IndicatorValue;
  /** Percentage points change in 6411 since FIRST_YEAR, if both years exist. */
  gpWaitChange: number | null;
  referral: IndicatorValue | null;
  /** Stage statuses from gaps.json (the same rule as the pathway screen). */
  gpStatus: GapStatus;
  referralStatus: GapStatus;
};

/**
 * Areas (no Finland row) ranked worst-first by 6411 in LATEST_YEAR. Areas with
 * no 6411 value are not ranked; see getUnrankedCounties.
 */
export function getRanking(): RankingRow[] {
  const rows = counties.flatMap((county) => {
    const gpWait = getValue(county.id, GP_WAIT_ID);
    if (!gpWait) return [];
    const first = getValue(county.id, GP_WAIT_ID, FIRST_YEAR);
    return [
      {
        county,
        gpWait,
        gpWaitChange: first ? round1(gpWait.value - first.value) : null,
        referral: getValue(county.id, REFERRAL_ID) ?? null,
        gpStatus: stageStatus(county.id, "gp_access"),
        referralStatus: stageStatus(county.id, "referral"),
      },
    ];
  });
  return rows
    .sort((a, b) => b.gpWait.value - a.gpWait.value)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Areas with no 6411 value in LATEST_YEAR: listed after the ranking as "no data", never dropped. */
export function getUnrankedCounties(): County[] {
  return counties.filter((county) => !getValue(county.id, GP_WAIT_ID));
}

export function getNationalValue(indicatorId: string, year = LATEST_YEAR) {
  return getValue(NATIONAL_ID, indicatorId, year);
}

/** Values for the trend strip, one entry per year (null where unpublished). */
export function getTrend(countyId: string, indicatorId: string) {
  return YEARS.map((year) => ({
    year,
    value: getValue(countyId, indicatorId, year) ?? null,
  }));
}

export function getStageGap(countyId: string, stage: Stage): Gap | undefined {
  return getGaps(countyId).find((gap) => gap.stage === stage);
}

export function stageStatus(countyId: string, stage: Stage): GapStatus {
  return getStageGap(countyId, stage)?.status ?? "no_data";
}

export const STATUS_LABEL: Record<GapStatus, string> = {
  red: "Worse than Finland",
  amber: "At or better than Finland's level",
  no_data: "No public data",
};

/** One sentence: where the delay sits for this county, from gaps.json. */
export function getVerdict(countyId: string): string {
  const gp = stageStatus(countyId, "gp_access");
  const referral = stageStatus(countyId, "referral");

  if (gp === "red" && referral === "red") {
    return "The delay sits at both measured steps: getting to a GP and the GP-to-specialist referral are both worse than Finland.";
  }
  if (gp === "red" && referral === "no_data") {
    return "The delay sits at getting to a GP, which is worse than Finland. There is no public data on referral speed here.";
  }
  if (gp === "red") {
    return "The delay sits at getting to a GP: it is worse than Finland, while referrals are processed at or above Finland's level.";
  }
  if (referral === "red") {
    return "The delay sits at the GP-to-specialist referral: it is slower than Finland, while GP access is at or better than Finland's level.";
  }
  const gpValue = getStageGap(countyId, "gp_access")?.value;
  const stillWaiting =
    gpValue == null
      ? ""
      : ` Even so, ${formatPct(gpValue)} of non-urgent GP visits here still come more than a week after people ask.`;
  if (referral === "no_data") {
    return `No measured step is worse than Finland: GP access is at or better than Finland's level, and there is no public data on referral speed here.${stillWaiting}`;
  }
  return `No measured step is worse than Finland: GP access and referrals are both at or better than Finland's level.${stillWaiting}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
