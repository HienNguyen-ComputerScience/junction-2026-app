// The starter dataset as an Excel template: counts only, one row per cancer group per quarter.
// Built with the shared writer in lib/export/xlsx.ts (no dependency). It holds no patient
// data and has no column where patient-identifying data could go; the first sheet says so.

import { getSource } from "@/lib/data";
import { buildXlsx, type Cell, type Sheet } from "@/lib/export/xlsx";
import { starterDataset } from "@/lib/insights";

export const STARTER_FILENAME = "firstline-cancer-pathway-starter-template.xlsx";

function sourceLine(sourceId: string): string {
  const source = getSource(sourceId);
  return source ? `${source.name} (${source.url})` : sourceId;
}

export function starterSheets(): Sheet[] {
  const { sections, indicators, cancer_groups: groups, privacy } = starterDataset;
  const fields = sections.flatMap((s) => s.fields);

  const readMe: Sheet = {
    name: "Read me",
    widths: [110],
    rows: [
      ["Cancer pathway starter template (FirstLine)"],
      ["What this is: a short set of counts a wellbeing services county can start keeping each quarter, so that its own cancer pathway can be measured: how cancers are first found, how long the steps from GP to treatment take, and stage at diagnosis."],
      [""],
      ["NO PATIENT DATA. This file holds aggregate counts only."],
      ...privacy.map((line) => [line] as Cell[]),
      [""],
      ["How to fill it: copy the 'Quarterly counts' sheet once per quarter. Enter whole numbers. Leave a cell empty when you do not know; do not enter 0 for 'not known'."],
      ["Where each count comes from and why: see 'Field definitions'. What to calculate from the counts: see 'Indicators'."],
      ["Day bands (14, 28 days) are reporting bands, not Finnish targets. The 6-week (42-day) line is the maximum the national working group set for suspected cancer, quoted in THL Ohjaus 21/2016."],
      [""],
      ["Prepared from public sources only. No figure in this file was filled in by FirstLine."],
    ],
    headerRows: 1,
  };

  const counts: Sheet = {
    name: "Quarterly counts",
    widths: [34, ...fields.map(() => 18)],
    headerRows: 4,
    rows: [
      ["Area (wellbeing services county)", ""],
      ["Quarter (for example 2027 Q1)", ""],
      ["Cancer group", ...fields.map((f) => f.id)],
      ["", ...fields.map((f) => f.header)],
      ...groups.map((g) => [g, ...fields.map(() => null)] as Cell[]),
    ],
  };

  const definitions: Sheet = {
    name: "Field definitions",
    widths: [8, 34, 60, 34, 34, 44, 60],
    rows: [
      ["Field", "Column heading", "What to count", "Step of the pathway", "Missing figure it closes", "National roadmap measure", "Finnish definition or who publishes it abroad"],
      ...sections.flatMap((s) =>
        s.fields.map(
          (f) =>
            [
              f.id,
              f.header,
              f.count,
              s.title,
              s.data_gap?.missing ?? s.data_gap_id,
              s.measure ? `${s.measure.id}: ${s.measure.title}` : "none named",
              [s.basis ? `${s.basis.text} Source: ${sourceLine(s.basis.source_id)}` : "", s.abroad ? `${s.abroad.text} Source: ${sourceLine(s.abroad.source_id)}` : ""]
                .filter(Boolean)
                .join(" "),
            ] as Cell[],
        ),
      ),
    ],
  };

  const indicatorSheet: Sheet = {
    name: "Indicators",
    widths: [6, 52, 36, 60, 70],
    rows: [
      ["Id", "Indicator", "How to calculate", "Compare with", "Source"],
      ...indicators.map((i) => [i.id, i.name, i.formula, i.compare_with, sourceLine(i.source_id)] as Cell[]),
    ],
  };

  return [readMe, counts, definitions, indicatorSheet];
}

export function buildStarterXlsx(): Uint8Array<ArrayBuffer> {
  return buildXlsx(starterSheets());
}
