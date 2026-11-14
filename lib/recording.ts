// Recording-sensitive 6411 trends: when the number of recorded visits behind the share moved a lot.
//
// Sotkanet 6411 is a share: visits that waited over 7 days, out of the GP visits that carry
// waiting-time data. The snapshot stores the count behind the share (`abs_value`), so the number
// of recorded visits (the base) is count / share. If the base changes sharply between two years,
// part of the share's change may be how visits are recorded rather than how long visits wait.
// This only flags that; it never changes a published share or a ranking.

import { getValue } from "@/lib/data";
import { FIRST_YEAR, GP_WAIT_ID, YEARS } from "@/lib/ranking";

const LAST_YEAR = YEARS[YEARS.length - 1];

/**
 * An area is recording-sensitive when its recorded visits changed by more than this share
 * between FIRST_YEAR and the latest year (20%, up or down). Chosen from the 22 areas' changes
 * (0.6, 4, 10, 16 | 25, 32, 34, 37 ... 50% and more): below 50%, the widest gap in the sorted
 * changes is between 16% (South Savo) and 25% (North Karelia), so 20% separates the four stable
 * areas from the rest. It is a judgment call: Finland as a whole moved 43%.
 */
export const RECORDING_CHANGE_ABOVE = 0.2;

/** A share that rose by less than this many points is "about the same", not worse (as in main-reason). */
const RISE_POINTS = 1;

/** Recorded visits behind a share: the count that waited over 7 days divided by the share. */
export function impliedVisits(sharePercent: number, waitingCount: number | null): number | null {
  if (waitingCount === null || !(sharePercent > 0)) return null;
  return Math.round(waitingCount / (sharePercent / 100));
}

/** Relative change in recorded visits: -0.37 means they fell by 37%. Null when either year is missing. */
export function visitChange(first: number | null, last: number | null): number | null {
  if (first === null || last === null || first <= 0) return null;
  return last / first - 1;
}

export function isRecordingSensitiveChange(change: number | null): boolean {
  return change !== null && Math.abs(change) > RECORDING_CHANGE_ABOVE;
}

/** "fell 37%", "rose 28%" or "more than doubled", from the rounded change. */
export function describeVisitChange(change: number): string {
  if (change >= 1) return "more than doubled";
  const percent = Math.round(Math.abs(change) * 100);
  return `${change < 0 ? "fell" : "rose"} ${percent}%`;
}

function recordedVisits(areaId: string, year: number): number | null {
  const row = getValue(areaId, GP_WAIT_ID, year);
  return row ? impliedVisits(row.value, row.abs_value) : null;
}

/** The change in recorded visits behind 6411 from FIRST_YEAR to the latest year, or null. */
export function getRecordedVisitChange(areaId: string): number | null {
  return visitChange(recordedVisits(areaId, FIRST_YEAR), recordedVisits(areaId, LAST_YEAR));
}

export function isRecordingSensitive(areaId: string): boolean {
  return isRecordingSensitiveChange(getRecordedVisitChange(areaId));
}

export type RecordingCaveat = {
  /** The short tag, e.g. "Recorded visits fell 37% since 2023". */
  tag: string;
  /** The caveat sentence shown with the share's rise. */
  text: string;
};

/**
 * The caveat for an area whose 6411 share is shown as rising since FIRST_YEAR, or null: the area
 * is not recording-sensitive, or its share did not rise (nothing is presented as worsening).
 */
export function getRecordingCaveat(areaId: string): RecordingCaveat | null {
  const change = getRecordedVisitChange(areaId);
  if (change === null || !isRecordingSensitiveChange(change)) return null;
  const first = getValue(areaId, GP_WAIT_ID, FIRST_YEAR);
  const last = getValue(areaId, GP_WAIT_ID, LAST_YEAR);
  if (!first || !last || last.value - first.value < RISE_POINTS) return null;
  const moved = describeVisitChange(change);
  return {
    tag: `Recorded visits ${moved} since ${FIRST_YEAR}`,
    text: `Recorded visits ${moved} from ${FIRST_YEAR} to ${LAST_YEAR}; part of this change may be how visits are recorded.`,
  };
}
