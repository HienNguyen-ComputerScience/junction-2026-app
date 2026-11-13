import "server-only";

// Query settings come from docs/exa-probe.md (findings) and Luan's plan in
// docs/evidence/exa-queries.md. Keep them here so routes stay thin.

export const NEWS_FI = [
  "yle.fi", "hs.fi", "mtvuutiset.fi", "iltalehti.fi", "is.fi", "ess.fi", "kainuunsanomat.fi",
  "keski-uusimaa.fi", "vantaansanomat.fi", "laakarilehti.fi", "mediuutiset.fi",
];
export const GOV_FI = ["thl.fi", "stm.fi", "valvira.fi", "avi.fi", "syopajarjestot.fi", "syoparekisteri.fi"];
export const COUNTY_SITES = ["vakehyva.fi", "hel.fi", "paijatsote.fi", "hyvinvointialue.kainuu.fi"];
export const NORDIC_INTL = [
  "sundhedsstyrelsen.dk", "cancer.dk", "england.nhs.uk", "nice.org.uk", "bmj.com",
  "thelancet.com", "ncbi.nlm.nih.gov", "oecd.org", "who.int",
];

// Domains whose articles are often paywalled (Luan's F3).
export const MAYBE_PAYWALLED = ["hs.fi", "ess.fi", "kainuunsanomat.fi", "vantaansanomat.fi", "keski-uusimaa.fi"];

/** County ids match lib/data.ts. Finnish name forms retrieve far better than English. */
export const COUNTY_QUERIES: Record<string, { name: string; query: string }> = {
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

/** National cancer-pathway news is the same for every county (probe finding), so it is one shared call. */
export const NATIONAL_CANCER_QUERY = "syöpä diagnoosi viive lähete erikoissairaanhoito perusterveydenhuolto";

/** Preset evidence queries for the SPEC precedents. Any other `action` is used as free text. */
export const ACTION_QUERIES: Record<string, string> = {
  "fast-track": "Danish cancer patient pathways fast-track evaluation time to diagnosis",
  "rapid-diagnostic-centres": "NHS rapid diagnostic centres non-specific symptoms evaluation outcomes",
  "nurse-triage": "nurse-led triage primary care access waiting time Nordic evaluation",
  "gp-recognition": "primary care cancer red flag symptom recognition intervention diagnostic interval",
  // Demo hook (Luan, PR #5): Lääkärilehti 23 Apr 2026 on county differences in detecting lung cancer.
  "lung-cancer-regional": "keuhkosyövän toteamisessa eroja hyvinvointialueiden välillä",
};

/** Presets that search other domains than the default evidence set (NORDIC_INTL + GOV_FI). */
export const ACTION_DOMAINS: Record<string, string[]> = {
  "lung-cancer-regional": ["laakarilehti.fi", "fican.fi", ...GOV_FI],
};

export const HOUR = 3_600_000;
export const TTL = { news: 24 * HOUR, evidence: 7 * 24 * HOUR, ask: 24 * HOUR };
