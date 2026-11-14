#!/usr/bin/env node
// Appends the two sources the insights cite to data/sources.json, if they are missing.
// SourceChip resolves a source only by id from that file, so they have to live there.
// Touches nothing else in the file. `npm run data:build` regenerates data/sources.json and would
// drop them: run this again after a rebuild (check-insights.mjs fails until you do).
//
//   node scripts/insights/add-sources.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const INSIGHT_SOURCES = [
  {
    source_id: "thl-ohjaus-21-2016",
    kind: "evidence",
    name: "THL Ohjaus 21/2016: Hoitoonpääsyn seuranta syövän hoidossa. Määrittelyt ja ohjeistus (Sillanpää, Pylkkänen, Häkkinen), valid from 1 Jan 2017",
    url: "https://urn.fi/URN:ISBN:978-952-302-782-4",
    publisher: "THL",
    retrieved: "2026-11-14",
    data_updated: null,
  },
  {
    source_id: "nhs-cancer-waiting-times",
    kind: "statistic",
    name: "NHS England: Cancer Waiting Times statistics (monthly, by area and hospital: 28-day Faster Diagnosis Standard, 31-day and 62-day standards)",
    url: "https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/",
    publisher: "NHS England",
    retrieved: "2026-11-14",
    data_updated: null,
  },
];

function main() {
  const file = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "sources.json");
  const text = readFileSync(file, "utf8");
  const sources = JSON.parse(text);
  const missing = INSIGHT_SOURCES.filter((s) => !sources.some((x) => x.source_id === s.source_id));
  if (missing.length === 0) {
    console.log("data/sources.json already has the insight sources.");
    return;
  }
  // Append at the end, keeping the file's own formatting for every existing row.
  const body = text.trimEnd().replace(/\]$/, "").trimEnd();
  const added = missing.map((s) => JSON.stringify(s, null, 2).replace(/^/gm, "  ")).join(",\n");
  writeFileSync(file, `${body},\n${added}\n]\n`);
  console.log(`Appended ${missing.map((s) => s.source_id).join(", ")} to data/sources.json.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
