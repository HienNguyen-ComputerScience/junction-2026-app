// The compare page's figures, all read from the snapshot: one row per area for the sortable
// table and the Excel download, and the four lead figures above the table. Every number here
// is a published share or plain arithmetic on published shares (differences, counts).

import { getRecordingCaveat } from "@/lib/recording";
import type { GapStatus } from "@/lib/data";
import { diff1 } from "@/lib/what-if";
import {
  CITY_UNITS_ONLY_REFERRAL,
  FIRST_YEAR,
  getNationalValue,
  getRanking,
  GP_WAIT_ID,
  REFERRAL_ID,
} from "@/lib/ranking";
import { getValue, LATEST_YEAR } from "@/lib/data";

export type CompareRow = {
  id: string;
  name: string;
  nameFi: string;
  rank: number;
  /** Non-urgent GP visits waiting over 7 days, % of visits, LATEST_YEAR. */
  gp: number;
  gpStatus: GapStatus;
  /** Points above (+) or below (−) Finland, one decimal. */
  gpVsFinland: number;
  gpFirst: number | null;
  gpMiddle: number | null;
  /** Points since FIRST_YEAR; positive is worse (a larger share waiting). */
  gpChange: number | null;
  /** Set where the share rose and the recorded visits behind it changed a lot. */
  recording: string | null;
  /** Referrals processed within 3 days, % of referrals, the area's own figure. */
  referral: number | null;
  referralStatus: GapStatus;
  /** The value of the wider organisation that handles the referrals, when the area has none. */
  referralShared: { name: string; value: number } | null;
  referralCityOnly: boolean;
};

export type CompareLead = {
  finlandGp: number;
  finlandReferral: number;
  total: number;
  worse: number;
  longest: CompareRow;
  shortest: CompareRow;
  spread: number;
  rising: number;
  /** Areas with both years published. */
  withTrend: number;
  fastest: CompareRow | null;
  risingWithRecordingChange: number;
  gpSourceId: string;
  referralSourceId: string;
};

const MIDDLE_YEAR = FIRST_YEAR + 1;

export function getCompareRows(): CompareRow[] {
  const finland = getNationalValue(GP_WAIT_ID);
  if (!finland) throw new Error("Snapshot is missing Finland's GP-wait value.");
  return getRanking().map((row) => {
    const first = getValue(row.county.id, GP_WAIT_ID, FIRST_YEAR)?.value ?? null;
    const middle = getValue(row.county.id, GP_WAIT_ID, MIDDLE_YEAR)?.value ?? null;
    const change = first === null ? null : diff1(row.gpWait.value, first);
    const caveat = getRecordingCaveat(row.county.id);
    const cityOnly = CITY_UNITS_ONLY_REFERRAL.has(row.county.id);
    return {
      id: row.county.id,
      name: row.county.name,
      nameFi: row.county.name_fi,
      rank: row.rank,
      gp: row.gpWait.value,
      gpStatus: row.gpStatus,
      gpVsFinland: diff1(row.gpWait.value, finland.value),
      gpFirst: first,
      gpMiddle: middle,
      gpChange: change,
      recording: caveat?.tag ?? null,
      referral: row.referral?.value ?? null,
      referralStatus: row.referral === null ? "no_data" : row.referralStatus,
      referralShared: row.sharedReferral ? { name: row.sharedReferral.name, value: row.sharedReferral.value } : null,
      referralCityOnly: cityOnly,
    };
  });
}

export function getCompareLead(rows: CompareRow[] = getCompareRows()): CompareLead {
  const gp = getNationalValue(GP_WAIT_ID);
  const referral = getNationalValue(REFERRAL_ID);
  if (!gp || !referral || rows.length === 0) throw new Error("Snapshot is missing the values for the compare page.");
  const byGp = [...rows].sort((a, b) => b.gp - a.gp);
  const longest = byGp[0];
  const shortest = byGp[byGp.length - 1];
  const withTrend = rows.filter((row) => row.gpChange !== null);
  const rising = withTrend.filter((row) => (row.gpChange ?? 0) >= 1);
  const fastest = [...rising].sort((a, b) => (b.gpChange ?? 0) - (a.gpChange ?? 0))[0] ?? null;
  return {
    finlandGp: gp.value,
    finlandReferral: referral.value,
    total: rows.length,
    worse: rows.filter((row) => row.gpStatus === "red").length,
    longest,
    shortest,
    spread: diff1(longest.gp, shortest.gp),
    rising: rising.length,
    withTrend: withTrend.length,
    fastest,
    risingWithRecordingChange: rising.filter((row) => row.recording !== null).length,
    gpSourceId: gp.source_id,
    referralSourceId: referral.source_id,
  };
}

export { changeText, vsFinlandText } from "@/lib/compare-text";
export { FIRST_YEAR, LATEST_YEAR };
