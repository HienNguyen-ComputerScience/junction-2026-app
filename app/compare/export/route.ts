import { buildXlsx, XLSX_TYPE, type Cell } from "@/lib/export/xlsx";
import { changeText, FIRST_YEAR, getCompareLead, getCompareRows, LATEST_YEAR, vsFinlandText } from "@/lib/compare";
import { getSource } from "@/lib/data";
import { getIndicator, GP_WAIT_ID, REFERRAL_ID } from "@/lib/ranking";

const STATUS_WORDS = {
  red: "Worse than Finland's level",
  amber: "At or better than Finland's level",
  no_data: "No public data",
} as const;

/** The compare table as an Excel workbook: every area, the figures as numbers, then the sources and limits. */
export function GET() {
  const rows = getCompareRows();
  const lead = getCompareLead(rows);
  const gpSource = getSource(lead.gpSourceId);
  const referralSource = getSource(lead.referralSourceId);

  const table: Cell[][] = [
    [
      "Rank",
      "Area",
      "Area (Finnish)",
      `GP visits waiting over 7 days, % (${FIRST_YEAR})`,
      `GP visits waiting over 7 days, % (${FIRST_YEAR + 1})`,
      `GP visits waiting over 7 days, % (${LATEST_YEAR})`,
      `Status, ${LATEST_YEAR}`,
      `Points above (+) or below (−) Finland, ${LATEST_YEAR}`,
      `Points of change since ${FIRST_YEAR} (+ is worse)`,
      "Change, in words",
      "Read with care",
      `Referrals handled within 3 days, % (${LATEST_YEAR}), area's own figure`,
      "Referral status",
      "Referral note",
    ],
    ...rows.map((row): Cell[] => [
      row.rank,
      row.name,
      row.nameFi,
      row.gpFirst,
      row.gpMiddle,
      row.gp,
      STATUS_WORDS[row.gpStatus],
      row.gpVsFinland,
      row.gpChange,
      [changeText(row.gpChange), vsFinlandText(row.gpVsFinland)].filter(Boolean).join("; "),
      row.recording ?? "",
      row.referral,
      row.referralCityOnly ? "City units only" : row.referralShared ? "HUS-wide figure only" : STATUS_WORDS[row.referralStatus],
      row.referralCityOnly
        ? "Covers the city's own specialist units; most Helsinki referrals go to HUS."
        : row.referralShared
          ? `No figure for this area. HUS-wide value, shared by four areas: ${row.referralShared.value.toFixed(1)}%.`
          : "",
    ]),
    [],
    ["Finland", "", "Koko maa", null, null, lead.finlandGp, "", null, null, "", "", lead.finlandReferral, "", ""],
  ];

  const notes: Cell[][] = [
    ["Notes and sources"],
    [`Downloaded from FirstLine. Figures are THL's, published on Sotkanet; changes are plain differences in percentage points.`],
    [`GP waits (Sotkanet 6411): ${getIndicator(GP_WAIT_ID)?.limitation ?? ""}`],
    [`Referrals (Sotkanet 13): ${getIndicator(REFERRAL_ID)?.limitation ?? ""}`],
    ["Where the number of recorded visits changed by more than 20% between 2023 and 2025, part of a change in the share may be how visits are recorded."],
    ["The status compares each area with Finland's level, not with a clinical standard."],
    [],
    ["Source", "Publisher", "Address", "Retrieved"],
    ...[gpSource, referralSource].flatMap((source): Cell[][] =>
      source ? [[source.name, source.publisher, source.url, source.retrieved]] : [],
    ),
  ];

  const body = buildXlsx([
    { name: "All areas", widths: [6, 24, 30, 14, 14, 14, 28, 16, 16, 40, 34, 18, 28, 50], rows: table },
    { name: "Notes and sources", widths: [90, 30, 60, 12], rows: notes },
  ]);
  return new Response(body, {
    headers: {
      "Content-Type": XLSX_TYPE,
      "Content-Disposition": `attachment; filename="firstline-all-areas-${LATEST_YEAR}.xlsx"`,
    },
  });
}
