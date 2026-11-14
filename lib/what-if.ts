// What-if arithmetic and the early-warning list for the home page.
// Pure functions on plain numbers: no snapshot imports, so `npm test` can load this file with
// plain node. The callers read the published shares from lib/data and pass them in.
//
// The what-if is arithmetic on published shares, never a forecast: "if this area's share were
// Finland's (or the best area's), how many of every 100 visits or referrals would differ". The
// amounts are per 100 visits or referrals, never people.

/** Which way a share is better: a wait share is better lower, a referral share higher. */
export type Better = "lower" | "higher";

export type AreaValue = { id: string; name: string; value: number };

export type WhatIfInput = {
  areaId: string;
  /** The area's own share, or null when nothing is published for it. */
  value: number | null;
  finland: number;
  better: Better;
  /** The best share among the areas with a value (see bestArea). */
  best: AreaValue | null;
};

export type WhatIf =
  | { kind: "no_data" }
  | {
      kind: "gap";
      /** Per 100: how many fewer (lower) or more (higher) at Finland's level. Null when already at or better. */
      toFinland: number | null;
      /** The same at the best area's level. Null when this area is the best, or level with it. */
      toBest: (AreaValue & { amount: number }) | null;
    };

/** One decimal, the way gapToFinland rounds: each share to one decimal, then the difference. */
function diff1(a: number, b: number): number {
  return Math.round((Number(a.toFixed(1)) - Number(b.toFixed(1))) * 10) / 10;
}

/** How much better `target` is than `value`, per 100, in the direction that counts as better. */
function improvement(value: number, target: number, better: Better): number {
  return better === "lower" ? diff1(value, target) : diff1(target, value);
}

export function whatIf({ areaId, value, finland, better, best }: WhatIfInput): WhatIf {
  if (value === null) return { kind: "no_data" };
  const toFinland = improvement(value, finland, better);
  const toBest = best && best.id !== areaId ? improvement(value, best.value, better) : 0;
  return {
    kind: "gap",
    toFinland: toFinland > 0 ? toFinland : null,
    toBest: best && toBest > 0 ? { ...best, amount: toBest } : null,
  };
}

/** The area with the best share; ties go to the first name in alphabetical order. */
export function bestArea(areas: AreaValue[], better: Better): AreaValue | null {
  const sorted = [...areas].sort(
    (a, b) => (better === "lower" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name, "en"),
  );
  return sorted[0] ?? null;
}

/** One decimal with a true minus sign. */
export function formatAmount(value: number): string {
  const text = Math.abs(value).toFixed(1);
  return value < 0 && text !== "0.0" ? `−${text}` : text;
}

export type TrendInput = { id: string; name: string; first: number | null; latest: number | null };
export type Worsening = { id: string; name: string; change: number; latest: number };

/**
 * Early warning: the areas whose share got worse most between the first and the latest year,
 * worst change first. Only areas that got worse (a change above 0.0 at one decimal) are listed.
 * Ties go to the area that is worse now, then to the first name in alphabetical order.
 */
export function worseningFastest(rows: TrendInput[], better: Better, limit = 5): Worsening[] {
  return rows
    .flatMap((row) => {
      if (row.first === null || row.latest === null) return [];
      const change = better === "lower" ? diff1(row.latest, row.first) : diff1(row.first, row.latest);
      return change > 0 ? [{ id: row.id, name: row.name, change, latest: row.latest }] : [];
    })
    .sort(
      (a, b) =>
        b.change - a.change ||
        (better === "lower" ? b.latest - a.latest : a.latest - b.latest) ||
        a.name.localeCompare(b.name, "en"),
    )
    .slice(0, limit);
}
