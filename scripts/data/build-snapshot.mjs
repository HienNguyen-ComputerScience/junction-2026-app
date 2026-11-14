#!/usr/bin/env node
// Builds the committed data snapshot in data/ from the Sotkanet REST API
// (and, once it is on main, Luan's docs/evidence/evidence.json).
//
//   npm run data:build
//
// No dependencies: Node's built-in fetch. Sotkanet needs a User-Agent
// header (requests without one get 403). Output is sorted and stable so a
// re-run only changes lines whose data changed.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA = join(ROOT, "data");
// EVIDENCE_IN overrides the path (for testing against an unmerged copy).
const EVIDENCE_IN = process.env.EVIDENCE_IN ?? join(ROOT, "docs", "evidence", "evidence.json");

const API = "https://sotkanet.fi/rest/1.1";
const USER_AGENT = "junction-2026-firstline/0.1 (hackathon data snapshot)";
const YEARS = [2023, 2024, 2025];
const LATEST_YEAR = 2025;
const SCREENING_YEARS = [2022, 2023, 2024]; // screening statistics lag a year
const RETRIEVED = new Date().toISOString().slice(0, 10);

// The indicators we show. direction tells the ranking which way is worse.
const INDICATORS = [
  {
    indicator_id: "6411",
    short_name: "GP wait over 7 days",
    unit: "%",
    direction: "higher_is_worse",
    stage: "gp_access",
    limitation:
      "Covers all non-urgent GP (physician) appointments in primary care, not only possible cancer. Counts appointments that were kept.",
  },
  {
    indicator_id: "13",
    short_name: "Referrals processed within 3 days",
    unit: "%",
    direction: "lower_is_worse",
    stage: "referral",
    limitation:
      "Measures how fast the hospital starts assessing a referral, not when the patient sees a specialist. Not cancer-specific. Counted per hospital organisation: East, Central and West Uusimaa and Vantaa and Kerava have no value of their own, so their card shows the HUS-wide value, labelled as shared.",
  },
  {
    indicator_id: "5033",
    short_name: "Referrals waiting over 21 days",
    unit: "%",
    direction: "higher_is_worse",
    stage: null,
    limitation:
      "Published as whole percentages and 0-3% everywhere, so it barely separates counties. Shown as context only, not used for ranking or stage status.",
  },
  // Cancer screening attendance: the step before the GP (challenge deck
  // slides 9-10). Context only (stage null): never ranked, never a stage
  // status. Sotkanet publishes these a year behind, so they carry their own years.
  {
    indicator_id: "3621",
    short_name: "Breast cancer screening attendance",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    years: SCREENING_YEARS,
    limitation:
      "Share of women invited to mammography screening who attended, so it says nothing about people who were not invited. Latest year is 2024. Listed on this page as context only: not shown on county pages and not used for ranking or stage status.",
  },
  {
    indicator_id: "6103",
    short_name: "Colorectal cancer screening attendance",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    years: SCREENING_YEARS,
    limitation:
      "Share of invited women and men who attended. The programme started in 2022 and is still widening its age band, so years and counties are not fully comparable. Latest year is 2024. Listed on this page as context only: not shown on county pages and not used for ranking or stage status.",
  },
  {
    indicator_id: "3620",
    short_name: "Cervical cancer screening attendance",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    years: SCREENING_YEARS,
    limitation:
      "Share of women invited to cervical screening who attended. Tests taken outside the programme (private or occupational care) are not counted. Latest year is 2024. Listed on this page as context only: not shown on county pages and not used for ranking or stage status.",
  },
  // First contact outside the public queue (challenge deck slide 5: public,
  // occupational and private care run side by side). Context only (stage null).
  // direction is required by the type but unused for context rows.
  {
    indicator_id: "2371",
    short_name: "Occupational-health doctor visits",
    unit: "per 1,000",
    direction: "lower_is_worse",
    stage: null,
    limitation:
      "Doctor visits in occupational health care per 1,000 residents aged 15-64 (working age). Counts visits, not people, and leaves out people over 64, who are most cancer patients. These visits are outside the public queue that the GP wait (6411) measures. Context only: one line on county pages, not used for ranking, status or actions.",
  },
  {
    indicator_id: "293",
    short_name: "Public primary-care doctor visits",
    unit: "per 1,000",
    direction: "lower_is_worse",
    stage: null,
    limitation:
      "Doctor visits in public primary care per 1,000 residents aged 15-64, shown next to the occupational figure for comparison. Includes maternity, student and mental-health visits. Counts visits, not people. Context only: not used for ranking, status or actions.",
  },
  {
    indicator_id: "692",
    short_name: "Private doctor visits reimbursed by Kela",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    limitation:
      "Share of residents who got a Kela reimbursement for a private doctor visit in the year, any specialty, not only GPs. Visits with no reimbursement claim are not counted. Listed on this page as context only: not shown on county pages and not used for ranking or stage status.",
  },
  // Cancer stage by county is not published (the Cancer Registry shows stage
  // nationally only). 5-year relative survival is published by county.
  // Context only (stage null). The 2024 value covers patients diagnosed 2015-2024.
  {
    indicator_id: "3627",
    short_name: "Bowel cancer 5-year relative survival",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    years: SCREENING_YEARS,
    limitation:
      "Age-standardised 5-year relative survival of bowel cancer patients. Each year's value covers patients diagnosed in that year and the nine before it (2024: diagnosed 2015-2024). Cancer stage by county is not published, and survival mixes how early cancer is found with how well it is treated. Small counties vary from year to year. Context only: one line on county pages, not used for ranking, status or actions.",
  },
  {
    indicator_id: "3625",
    short_name: "Breast cancer 5-year relative survival",
    unit: "%",
    direction: "lower_is_worse",
    stage: null,
    years: SCREENING_YEARS,
    limitation:
      "Age-standardised 5-year relative survival of breast cancer patients. Each year's value covers patients diagnosed in that year and the nine before it (2024: diagnosed 2015-2024). Cancer stage by county is not published, and survival mixes how early cancer is found with how well it is treated. Small counties vary from year to year. Context only: one line on county pages, not used for ranking, status or actions.",
  },
];

// Values the spec and pitch quote. The build fails if Sotkanet disagrees.
const ANCHORS = [
  { county_id: "paijat-hame", indicator_id: "6411", year: 2025, value: 32.7 },
  { county_id: "vantaa-kerava", indicator_id: "6411", year: 2025, value: 85.4 },
  { county_id: "finland", indicator_id: "6411", year: 2025, value: 54.7 },
];

// HUS (Helsinki University Hospital group) runs specialised care for Helsinki
// and four Uusimaa counties, so Sotkanet has no referral row for those
// counties. It publishes one HUS row instead, under a region id that the
// region list does not name. Why we are sure it is HUS: (1) the indicator's
// own description says the statistic covers the counties, "HUSin alue" and
// Helsinki; (2) the row plus all county rows add up exactly to Finland; (3) its
// 2024 count is the figure in HUS's own report (table 3, processed in 0-3
// days). The build fails if (2) or (3) stops holding.
const HUS = {
  region_id: 599,
  counties: ["central-uusimaa", "east-uusimaa", "vantaa-kerava", "west-uusimaa"],
  anchor: { indicator_id: "13", year: 2024, abs_value: 246244 },
  source: {
    source_id: "hus-referrals-2024",
    kind: "statistic",
    name: "HUS: Hoitoa odottavat potilaat erikoisaloittain 31.12.2024 (table 3, referrals received and processing times)",
    url: "https://www.hus.fi/sites/default/files/2025-01/hoitoa-odottavat-potilaat-erikoisaloittain-2024-joulukuu.pdf",
    publisher: "HUS",
    retrieved: "2026-11-14",
    data_updated: "2024-12-31",
  },
};

// Studies quoted as context on the county page (not actions, not indicators).
const CONTEXT_SOURCES = [
  {
    source_id: "kuitunen-2026",
    kind: "statistic",
    name: "Kuitunen J. et al. Socioeconomic Status and Access to Treatment in Diffuse Large B-Cell Lymphoma. Cancer Medicine 2026;15(5):e71920",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13158131/",
    publisher: "Kuitunen et al., Cancer Medicine",
    retrieved: "2026-11-14",
    data_updated: "2026-05-01",
  },
];

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Sotkanet ${path}: HTTP ${res.status}`);
  return res.json();
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function write(name, rows) {
  writeFileSync(join(DATA, name), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`  data/${name}: ${rows.length} rows`);
}

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ---------------------------------------------------------------- sources
const sources = [
  {
    source_id: "sotkanet-regions",
    kind: "statistic",
    name: "Sotkanet region classification (wellbeing services counties)",
    url: `${API}/regions`,
    publisher: "THL (Finnish Institute for Health and Welfare), Sotkanet",
    retrieved: RETRIEVED,
    data_updated: null,
  },
];

const indicators = [];
for (const ind of INDICATORS) {
  const meta = await get(`/indicators/${ind.indicator_id}`);
  const source_id = `sotkanet-${ind.indicator_id}`;
  sources.push({
    source_id,
    kind: "statistic",
    name: `Sotkanet ${ind.indicator_id}: ${meta.title.en}`,
    url: `https://sotkanet.fi/sotkanet/en/metadata/indicators/${ind.indicator_id}`,
    publisher: `${meta.organization?.title?.en ?? "THL"}, Sotkanet`,
    retrieved: RETRIEVED,
    data_updated: meta["data-updated"] ?? meta.data?.updated?.date ?? null,
  });
  indicators.push({
    indicator_id: ind.indicator_id,
    name: meta.title.en,
    short_name: ind.short_name,
    unit: ind.unit,
    direction: ind.direction,
    stage: ind.stage,
    limitation: ind.limitation,
    source_id,
  });
}

// ---------------------------------------------------------------- counties
// The 21 wellbeing services counties plus the City of Helsinki (it organises
// its own services). Åland (code 91) is outside the reform and has no data.
// Finland is kept as kind "country" so it never enters rankings or routes.
const regions = await get("/regions");
const counties = regions
  .filter((r) => r.category === "HYVINVOINTIALUE" && r.code !== "91")
  .map((r) => {
    const name = r.title.en.replace(/ wellbeing services county$/, "");
    const id = r.code === "90" ? "helsinki" : slugify(name);
    return {
      id,
      kind: r.code === "90" ? "city" : "county",
      name: r.code === "90" ? "Helsinki" : name,
      name_fi: r.title.fi,
      sotkanet_region_id: r.id,
      source_id: "sotkanet-regions",
    };
  });
const country = regions.find((r) => r.category === "MAA");
counties.push({
  id: "finland",
  kind: "country",
  name: "Finland",
  name_fi: country.title.fi,
  sotkanet_region_id: country.id,
  source_id: "sotkanet-regions",
});
counties.sort((a, b) => a.id.localeCompare(b.id));
const countyByRegion = new Map(counties.map((c) => [c.sotkanet_region_id, c]));

// ---------------------------------------------------------------- values
const values = [];
const husRows = [];
for (const ind of INDICATORS) {
  const query = (ind.years ?? YEARS).map((y) => `years=${y}`).join("&");
  const rows = await get(`/json?indicator=${ind.indicator_id}&${query}&genders=total`);
  for (const row of rows) {
    if (row.region === HUS.region_id && row.value != null && ind.indicator_id === "13")
      husRows.push({ ...row, indicator_id: ind.indicator_id });
    const county = countyByRegion.get(row.region);
    if (!county || row.value == null) continue; // other region levels, unlabelled ids
    values.push({
      county_id: county.id,
      indicator_id: ind.indicator_id,
      year: row.year,
      value: row.value,
      abs_value: row.absValue ?? null,
      source_id: `sotkanet-${ind.indicator_id}`,
    });
  }
}
// Is the unnamed row still HUS? Checked before the gaps use it.
const husProblems = [];
for (const year of YEARS) {
  const hus = husRows.find((r) => r.indicator_id === "13" && r.year === year);
  const own = values.filter((v) => v.indicator_id === "13" && v.year === year);
  const total = own.find((v) => v.county_id === "finland")?.abs_value;
  const sum = own
    .filter((v) => v.county_id !== "finland")
    .reduce((t, v) => t + (v.abs_value ?? 0), hus?.absValue ?? 0);
  if (!hus || sum !== total)
    husProblems.push(`HUS check ${year}: county rows + region ${HUS.region_id} = ${sum}, Finland = ${total}`);
}
const husAnchor = husRows.find(
  (r) => r.indicator_id === HUS.anchor.indicator_id && r.year === HUS.anchor.year,
);
if (husAnchor?.absValue !== HUS.anchor.abs_value)
  husProblems.push(`HUS anchor ${HUS.anchor.year}: expected ${HUS.anchor.abs_value}, got ${husAnchor?.absValue}`);
sources.push(HUS.source, ...CONTEXT_SOURCES);
values.sort(
  (a, b) =>
    a.indicator_id.localeCompare(b.indicator_id) ||
    a.county_id.localeCompare(b.county_id) ||
    a.year - b.year,
);
const valueOf = (county_id, indicator_id, year) =>
  values.find((v) => v.county_id === county_id && v.indicator_id === indicator_id && v.year === year);

// ---------------------------------------------------------------- gaps
// One rule, documented in data/README.md: compare the county with Finland
// for the same indicator and year. Worse than Finland = red, otherwise amber
// (still a delay, just not worse than the national level). No county value =
// no_data. gp_recognition has no public indicator, so it gets no rows and the
// app shows it as grey.
const gaps = [];
for (const ind of INDICATORS.filter((i) => i.stage)) {
  const national = valueOf("finland", ind.indicator_id, LATEST_YEAR);
  for (const county of counties.filter((c) => c.kind !== "country")) {
    const v = valueOf(county.id, ind.indicator_id, LATEST_YEAR);
    const base = {
      county_id: county.id,
      stage: ind.stage,
      indicator_id: ind.indicator_id,
      year: LATEST_YEAR,
      source_id: `sotkanet-${ind.indicator_id}`,
    };
    if (!v) {
      // No county value. For the HUS counties the gap stays no_data (there is
      // no figure for the county alone) but carries the HUS-wide series, so
      // the app can show it, labelled as shared.
      const hus =
        ind.indicator_id === "13" && HUS.counties.includes(county.id)
          ? husRows.filter((r) => r.indicator_id === "13").sort((a, b) => a.year - b.year)
          : [];
      const husLatest = hus.find((r) => r.year === LATEST_YEAR);
      gaps.push({
        ...base,
        status: "no_data",
        value: null,
        national_value: national.value,
        note: husLatest
          ? `Sotkanet publishes no ${LATEST_YEAR} value for ${county.name} alone. At HUS, which handles its hospital referrals, ${fmt(husLatest.value)}% of referrals were processed within 3 days in ${LATEST_YEAR} (Finland ${fmt(national.value)}%).`
          : `Sotkanet publishes no ${LATEST_YEAR} value for ${county.name} on this indicator.`,
        ...(husLatest
          ? {
              shared: {
                name: "HUS",
                value: husLatest.value,
                trend: hus.map((r) => ({ year: r.year, value: r.value })),
                confirmed_by: HUS.source.source_id,
              },
            }
          : {}),
      });
      continue;
    }
    const worse =
      ind.direction === "higher_is_worse" ? v.value > national.value : v.value < national.value;
    const what =
      ind.indicator_id === "6411"
        ? "of non-urgent GP appointments waited more than 7 days"
        : "of referrals were processed within 3 days";
    gaps.push({
      ...base,
      status: worse ? "red" : "amber",
      value: v.value,
      national_value: national.value,
      note: `${fmt(v.value)}% ${what} in ${LATEST_YEAR} (Finland ${fmt(national.value)}%).`,
    });
  }
}
gaps.sort((a, b) => a.county_id.localeCompare(b.county_id) || a.stage.localeCompare(b.stage));

// ---------------------------------------------------------------- evidence
// Luan's evidence table (docs/evidence/evidence.json) gets one source per
// unique source_url; source_id is derived from the URL, so the evidence file
// itself needs no ids. Only verified rows are kept. If the file isn't on this
// branch yet, the previous evidence snapshot is kept as it is.
let evidence = [];
const evidenceSources = [];
if (existsSync(EVIDENCE_IN)) {
  const rows = JSON.parse(readFileSync(EVIDENCE_IN, "utf8"));
  const idFor = new Map();
  for (const row of rows.filter((r) => r.verified === true)) {
    if (!idFor.has(row.source_url)) {
      const url = new URL(row.source_url);
      const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
      let id = `ev-${slugify(`${url.hostname.replace(/^www\./, "").split(".")[0]} ${last}`)}`.slice(0, 60);
      while ([...idFor.values()].includes(id)) id = `${id}-x`;
      idFor.set(row.source_url, id);
      evidenceSources.push({
        source_id: id,
        kind: "evidence",
        name: row.source_title,
        url: row.source_url,
        publisher: url.hostname.replace(/^www\./, ""),
        retrieved: RETRIEVED,
        data_updated: null,
      });
    }
    // source_url and source_title move to sources.json.
    const rest = { ...row };
    delete rest.source_url;
    delete rest.source_title;
    evidence.push({ ...rest, source_id: idFor.get(row.source_url) });
  }
  evidence.sort((a, b) => a.id.localeCompare(b.id));
} else {
  console.log("  docs/evidence/evidence.json not found: keeping the current evidence snapshot");
  const keep = (name) =>
    existsSync(join(DATA, name)) ? JSON.parse(readFileSync(join(DATA, name), "utf8")) : [];
  evidence = keep("evidence.json");
  evidenceSources.push(...keep("sources.json").filter((s) => s.kind === "evidence"));
}
sources.push(...evidenceSources);
sources.sort((a, b) => a.kind.localeCompare(b.kind) || a.source_id.localeCompare(b.source_id));

// ---------------------------------------------------------------- checks
const problems = [...husProblems];
const sourceIds = new Set(sources.map((s) => s.source_id));
const countyIds = new Set(counties.map((c) => c.id));
const indicatorIds = new Set(indicators.map((i) => i.indicator_id));
const files = { counties, indicators, values, gaps, evidence };
for (const [file, rows] of Object.entries(files)) {
  rows.forEach((row, i) => {
    if (row.shared && !sourceIds.has(row.shared.confirmed_by))
      problems.push(`${file}[${i}]: shared.confirmed_by "${row.shared.confirmed_by}" is not in sources`);
    if (!row.source_id || !sourceIds.has(row.source_id))
      problems.push(`${file}[${i}]: source_id "${row.source_id}" is not in sources`);
    if ("county_id" in row && !countyIds.has(row.county_id))
      problems.push(`${file}[${i}]: unknown county_id "${row.county_id}"`);
    if (row.indicator_id != null && file !== "indicators" && !indicatorIds.has(row.indicator_id))
      problems.push(`${file}[${i}]: unknown indicator_id "${row.indicator_id}"`);
  });
}
for (const a of ANCHORS) {
  const got = valueOf(a.county_id, a.indicator_id, a.year)?.value;
  if (got !== a.value)
    problems.push(`anchor ${a.county_id} ${a.indicator_id} ${a.year}: expected ${a.value}, got ${got}`);
}
if (counties.filter((c) => c.kind !== "country").length !== 22)
  problems.push(`expected 22 counties (21 + Helsinki), got ${counties.length - 1}`);
if (problems.length) {
  console.error(`Snapshot NOT written, ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

console.log(`Writing snapshot (retrieved ${RETRIEVED}):`);
write("sources.json", sources);
write("counties.json", counties);
write("indicators.json", indicators);
write("values.json", values);
write("gaps.json", gaps);
write("evidence.json", evidence);
