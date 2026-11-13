import "server-only";

import countiesJson from "@/data/counties.json";
import evidenceJson from "@/data/evidence.json";

// Query settings come from docs/exa-probe.md (findings) and Luan's plan in
// docs/evidence/exa-queries.md. Keep them here so routes stay thin.
// Lookups by user-supplied id go through Maps, so `?county=constructor` etc. are unknown ids.

export const NEWS_FI = [
  "yle.fi", "hs.fi", "mtvuutiset.fi", "iltalehti.fi", "is.fi", "ess.fi", "kainuunsanomat.fi",
  "keski-uusimaa.fi", "vantaansanomat.fi", "laakarilehti.fi", "mediuutiset.fi",
];
export const GOV_FI = ["thl.fi", "stm.fi", "valvira.fi", "avi.fi", "syopajarjestot.fi", "syoparekisteri.fi"];
/** Site domains of the 4 hand-tuned demo counties (Luan's COUNTY list). */
export const COUNTY_SITES = ["vakehyva.fi", "hel.fi", "paijatsote.fi", "hyvinvointialue.kainuu.fi"];
export const CLINICAL = ["kaypahoito.fi", "duodecim.fi", "terveysportti.fi"];
export const NORDIC_INTL = [
  "sundhedsstyrelsen.dk", "cancer.dk", "england.nhs.uk", "nice.org.uk", "bmj.com",
  "thelancet.com", "ncbi.nlm.nih.gov", "oecd.org", "who.int",
];
/** Extra research/report sources for the evidence finder (evidence.json rows). */
const RESEARCH_EXTRA = ["cochranelibrary.com", "bjgp.org", "cmaj.ca", "julkari.fi", "fican.fi", "laakarilehti.fi", "duodecim.fi"];

// Domains whose articles are often paywalled (Luan's F3), plus the regional dailies added below.
export const MAYBE_PAYWALLED = [
  "hs.fi", "ess.fi", "kainuunsanomat.fi", "vantaansanomat.fi", "keski-uusimaa.fi",
  "aamulehti.fi", "ts.fi", "kaleva.fi", "savonsanomat.fi", "karjalainen.fi", "lapinkansa.fi",
  "ilkkapohjalainen.fi", "satakunnankansa.fi", "keskisuomalainen.fi", "hameensanomat.fi",
  "kouvolansanomat.fi", "esaimaa.fi", "lansi-savo.fi", "keskipohjanmaa.fi", "uusimaa.fi",
  "lansivayla.fi", "pohjalainen.fi",
];

// ---------- county news: all 22 areas ----------

export type CountyConfig = {
  id: string;
  name: string;
  nameFi: string;
  /** Finnish query: Finnish name forms retrieve far better than English. */
  query: string;
  includeDomains: string[];
  /** Folded (lowercase, no diacritics) word-start stems for spotting the area in a question. A trailing space = whole word. */
  aliases: string[];
};

/** The 4 demo counties, hand-tuned and probed (docs/exa-probe.md). Unchanged queries and domains. */
const HAND_TUNED: Record<string, { name: string; query: string }> = {
  "vantaa-kerava": {
    name: "Vantaa and Kerava",
    query: "Vantaan ja Keravan hyvinvointialue terveysasema lääkärille pääsy jonot",
  },
  helsinki: { name: "Helsinki", query: "Helsingin kaupunki terveysasemat lääkäriaika jonot" },
  "paijat-hame": {
    name: "Päijät-Häme",
    query: "Päijät-Hämeen hyvinvointialue terveysasema lääkärille pääsy jonot",
  },
  kainuu: { name: "Kainuu", query: "Kainuun hyvinvointialue terveysasema lääkärille pääsy lääkäripula" },
};

/**
 * Per area: the county's own site (only where we are confident of the domain), its main regional
 * daily, and aliases (English name, Finnish stems, main towns). Unknown site → national news only.
 */
const AREA_EXTRA: Record<string, { site?: string; paper?: string; aliases: string[] }> = {
  "central-finland": { site: "hyvaks.fi", paper: "keskisuomalainen.fi", aliases: ["keski suom", "central finland", "jyvaskyl"] },
  "central-ostrobothnia": { site: "soite.fi", paper: "keskipohjanmaa.fi", aliases: ["keski pohjanm", "central ostrobothnia", "kokkola", "soite"] },
  "central-uusimaa": { site: "keusote.fi", paper: "keski-uusimaa.fi", aliases: ["keski uusi", "keski uuden", "central uusimaa", "hyvinkaa", "jarvenpaa", "keusote"] },
  "east-uusimaa": { paper: "uusimaa.fi", aliases: ["ita uusi", "ita uuden", "east uusimaa", "porvoo", "porvoon "] },
  helsinki: { site: "hel.fi", paper: "hs.fi", aliases: ["helsin"] },
  kainuu: { site: "hyvinvointialue.kainuu.fi", paper: "kainuunsanomat.fi", aliases: ["kainuu", "kajaan"] },
  "kanta-hame": { site: "omahame.fi", paper: "hameensanomat.fi", aliases: ["kanta ham", "hameenlinn"] },
  kymenlaakso: { site: "kymenhva.fi", paper: "kouvolansanomat.fi", aliases: ["kymenlaak", "kotka", "kouvol"] },
  lapland: { site: "lapha.fi", paper: "lapinkansa.fi", aliases: ["lapland", "lappi ", "lapin ", "lapissa ", "lappiin ", "rovaniem"] },
  "north-karelia": { site: "siunsote.fi", paper: "karjalainen.fi", aliases: ["pohjois karjal", "north karelia", "joensu", "siun sote"] },
  "north-ostrobothnia": { site: "pohde.fi", paper: "kaleva.fi", aliases: ["pohjois pohjanm", "north ostrobothnia", "oulu"] },
  "north-savo": { site: "pshyvinvointialue.fi", paper: "savonsanomat.fi", aliases: ["pohjois savo", "north savo", "kuopio"] },
  ostrobothnia: { site: "pohjanmaanhyvinvointi.fi", paper: "pohjalainen.fi", aliases: ["pohjanmaa ", "pohjanmaan ", "pohjanmaalla ", "ostrobothnia ", "vaasa", "vasa "] },
  "paijat-hame": { site: "paijatsote.fi", paper: "ess.fi", aliases: ["paijat ham", "paijatsote", "lahti ", "lahden ", "lahdessa "] },
  pirkanmaa: { site: "pirha.fi", paper: "aamulehti.fi", aliases: ["pirkanm", "tamper", "pirha "] },
  satakunta: { paper: "satakunnankansa.fi", aliases: ["satakun", "pori ", "porin ", "porissa "] },
  "south-karelia": { site: "ekhva.fi", paper: "esaimaa.fi", aliases: ["etela karjal", "south karelia", "lappeenran"] },
  "south-ostrobothnia": { site: "hyvaep.fi", paper: "ilkkapohjalainen.fi", aliases: ["etela pohjanm", "south ostrobothnia", "seinajo"] },
  "south-savo": { site: "etelasavonha.fi", paper: "lansi-savo.fi", aliases: ["etela savo", "south savo", "mikkel"] },
  "southwest-finland": { site: "varha.fi", paper: "ts.fi", aliases: ["varsinais suom", "southwest finland", "south west finland", "turku", "turun ", "turussa "] },
  "vantaa-kerava": { site: "vakehyva.fi", paper: "vantaansanomat.fi", aliases: ["vantaa", "kerava", "vakehyva"] },
  "west-uusimaa": { site: "luvn.fi", paper: "lansivayla.fi", aliases: ["lansi uusi", "lansi uuden", "west uusimaa", "espoo", "kauniain", "lohja"] },
};

type CountyRow = { id: string; kind: string; name: string; name_fi: string };

function buildCounties(): Map<string, CountyConfig> {
  const out = new Map<string, CountyConfig>();
  for (const row of countiesJson as CountyRow[]) {
    if (row.kind !== "county" && row.kind !== "city") continue;
    const extra = AREA_EXTRA[row.id] ?? { aliases: [] };
    const tuned = Object.hasOwn(HAND_TUNED, row.id) ? HAND_TUNED[row.id] : null;
    const own = [extra.site, extra.paper].filter((d): d is string => Boolean(d));
    out.set(row.id, {
      id: row.id,
      name: tuned?.name ?? row.name,
      nameFi: row.name_fi,
      // Same pattern as the hand-tuned ones: "<X:n hyvinvointialue> terveysasema lääkärille pääsy jonot".
      query: tuned?.query ?? `${row.name_fi} terveysasema lääkärille pääsy jonot hoitotakuu`,
      includeDomains: tuned ? [...NEWS_FI, ...COUNTY_SITES] : [...new Set([...NEWS_FI, ...own])],
      aliases: extra.aliases,
    });
  }
  return out;
}

/** County ids match lib/data.ts (kind county or city; not the country row). */
export const COUNTIES: ReadonlyMap<string, CountyConfig> = buildCounties();

/** National cancer-pathway news is the same for every county (probe finding), so it is one shared call. */
export const NATIONAL_CANCER_QUERY = "syöpä diagnoosi viive lähete erikoissairaanhoito perusterveydenhuolto";

// ---------- evidence finder ----------

export type EvidenceQuery = { key: string; actionId: string | null; query: string; includeDomains: string[] };

const DEFAULT_EVIDENCE_DOMAINS = [...NORDIC_INTL, ...GOV_FI];
const ROW_EVIDENCE_DOMAINS = [...new Set([...NORDIC_INTL, ...GOV_FI, ...RESEARCH_EXTRA])];

/** Preset evidence queries for the SPEC precedents. */
const PRESETS = new Map<string, { query: string; includeDomains: string[] }>([
  ["fast-track", { query: "Danish cancer patient pathways fast-track evaluation time to diagnosis", includeDomains: DEFAULT_EVIDENCE_DOMAINS }],
  ["rapid-diagnostic-centres", { query: "NHS rapid diagnostic centres non-specific symptoms evaluation outcomes", includeDomains: DEFAULT_EVIDENCE_DOMAINS }],
  ["nurse-triage", { query: "nurse-led triage primary care access waiting time Nordic evaluation", includeDomains: DEFAULT_EVIDENCE_DOMAINS }],
  ["gp-recognition", { query: "primary care cancer red flag symptom recognition intervention diagnostic interval", includeDomains: DEFAULT_EVIDENCE_DOMAINS }],
  // Demo hook (Luan, PR #5): Lääkärilehti 23 Apr 2026 on county differences in detecting lung cancer.
  ["lung-cancer-regional", { query: "keuhkosyövän toteamisessa eroja hyvinvointialueiden välillä", includeDomains: ["laakarilehti.fi", "fican.fi", ...GOV_FI] }],
]);
export const PRESET_KEYS = [...PRESETS.keys()];

/**
 * Research queries for the rows of data/evidence.json, written from each row's `action` + `precedent`
 * (English, paper-oriented). Rows missing here get a query built from those two fields.
 */
const ROW_QUERIES: Record<string, string> = {
  "ev-gp-capacity-roadmap": "Finland national cancer strategy primary care GP capacity named GP model early cancer detection",
  "ev-gp-continuity": "continuity of care regular general practitioner mortality hospital admissions Norway cohort study",
  "ev-gp-digital-triage": "Omaolo digital symptom checker triage accuracy Finnish primary care evaluation",
  "ev-gp-nurse-first-contact": "nurses substituting for doctors in primary care systematic review patient outcomes",
  "ev-rec-direct-ct-training": "general practitioner direct access to CT imaging cancer diagnosis cluster randomised trial Denmark",
  "ev-rec-nice-threshold": "NICE NG12 suspected cancer referral 3% positive predictive value threshold evaluation",
  "ev-rec-safety-netting": "safety netting in primary care suspected cancer diagnostic delay evidence",
  "ev-ref-denmark-cpp": "Danish cancer patient pathways fast-track evaluation time to diagnosis",
  "ev-ref-dk-diagnostic-centre": "Denmark diagnostic centre non-specific serious symptoms urgent referral evaluation",
  "ev-ref-econsult": "Champlain BASE eConsult specialist e-consultation primary care referrals avoided evaluation",
  "ev-ref-national-criteria": "standardised cancer patient pathway referral criteria Denmark Sweden Norway evaluation",
  "ev-ref-sweden-svf": "Sweden standardised cancer care pathways SVF waiting times evaluation",
  "ev-ref-templates": "structured electronic referral templates cluster randomised trial Norway referral quality colorectal cancer",
  "ev-ref-uk-rdc": "NHS rapid diagnostic centres non-specific symptoms evaluation outcomes",
};

type EvidenceRow = { id: string; action: string; precedent: string };

function rowQuery(row: EvidenceRow): string {
  if (Object.hasOwn(ROW_QUERIES, row.id)) return ROW_QUERIES[row.id];
  const precedent = row.precedent.replace(/\([^)]*\)/g, "").replace(/[.;]+\s*$/, "");
  return `${precedent} evaluation: ${row.action}`.replace(/\s+/g, " ").slice(0, 200);
}

const ROWS_BY_ID = new Map<string, EvidenceRow>();
const ROWS_BY_TITLE = new Map<string, EvidenceRow>();
for (const row of evidenceJson as EvidenceRow[]) {
  ROWS_BY_ID.set(row.id, row);
  ROWS_BY_TITLE.set(row.action.trim().toLowerCase(), row);
}
export const EVIDENCE_ROW_IDS = [...ROWS_BY_ID.keys()];

/**
 * Resolves `?action=` to a query: an evidence.json row id, an evidence.json action title (what the UI
 * sends today; same query and cache key as its id), a preset key, or else free text.
 */
export function resolveEvidence(action: string): EvidenceQuery {
  const row = ROWS_BY_ID.get(action) ?? ROWS_BY_TITLE.get(action.trim().toLowerCase());
  if (row) return { key: `row:${row.id}`, actionId: row.id, query: rowQuery(row), includeDomains: ROW_EVIDENCE_DOMAINS };
  const preset = PRESETS.get(action);
  if (preset) return { key: `preset:${action}`, actionId: null, ...preset };
  return { key: `text:${action.toLowerCase()}`, actionId: null, query: action, includeDomains: DEFAULT_EVIDENCE_DOMAINS };
}

// ---------- ask box ----------

/** Domains the ask box searches: health news, authorities, clinical guidance, county sites, research. */
export const ASK_DOMAINS = [
  ...new Set([
    ...NEWS_FI, ...GOV_FI, ...CLINICAL, ...NORDIC_INTL, ...COUNTY_SITES,
    ...Object.values(AREA_EXTRA).flatMap((a) => [a.site, a.paper].filter((d): d is string => Boolean(d))),
    "laakariliitto.fi", "kela.fi", "cancer.fi", "fican.fi", "omaolo.fi", "julkari.fi", "nhs.uk", "cancerresearchuk.org",
  ]),
];

/** The ask box's example questions (components/exa/ask-box.tsx) plus the prewarm extras: pinned in the cache. */
export const ASK_EXAMPLES = [
  "How long do people wait to see a GP in Vantaa?",
  "Did Denmark's cancer fast-track pathways shorten diagnosis times?",
  "Onko Kainuussa lääkäripula?",
  "Latest news on cancer care in Finland this week",
  "Does lung cancer detection differ between Finnish wellbeing services counties?",
];

export const HOUR = 3_600_000;
export const TTL = { news: 24 * HOUR, evidence: 7 * 24 * HOUR, ask: 24 * HOUR };
