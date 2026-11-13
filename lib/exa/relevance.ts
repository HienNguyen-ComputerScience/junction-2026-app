// Relevance rules for the ask box (pure functions, no I/O, so they can be tested offline).
//  1. Topic gate: a question must name a health-care term (fi/en) or a known area, else it is
//     answered "nothing found" without calling Exa ("tell me a joke", "asdfgh").
//  2. County detection: "GP wait in Vantaa" / "Kainuussa" → that county's query, domains and window.
//  3. Result bar: drop items with no topic term and no content word from the question; for
//     questions about an unknown place or name ("Narnia"), require that name in some result.

import type { Item } from "./client";

type AreaAliases = { id: string; aliases: string[] };

/** Lowercase, strip diacritics (ä→a, ö→o), non-letters → spaces, padded with spaces for word-start matching. */
export function fold(s: string): string {
  const plain = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${plain} `;
}

/** Word-start stems. A trailing space means a whole word. */
const TOPIC = [
  // English
  "health", "care ", "healthcare", "hospital", "doctor", "physician", "gp ", "gps ", "nurse", "patient", "clinic",
  "cancer", "tumour", "tumor", "oncolog", "diagnos", "screening", "symptom", "treatment", "therap", "wait", "queue",
  "referral", "refer ", "pathway", "wellbeing", "welfare", "medical", "medicine", "drug", "disease", "illness",
  "mortalit", "surviv", "lung", "breast", "bowel", "colorectal", "prostate", "skin cancer", "appointment",
  "primary care", "specialist", "emergency", "mental", "dental", "sote", "nhs ", "thl ", "kela ", "astrazeneca",
  "imaging", "ct scan", "mri ", "biopsy", "red flag", "guarantee", "fast track", "triage", "e consult", "econsult",
  "health centre", "health center", "life expectancy", "vaccin", "elderly care", "pharma",
  // Finnish
  "terve", "hoit", "hoid", "laakar", "sairaa", "sairau", "syop", "kasvai", "potila", "jono", "odot", "lahete",
  "lahett", "hyvinvointialue", "diagno", "seulo", "seula", "oire", "kuolle", "laake", "hammas", "mielenterv",
  "neuvola", "paivyst", "vastaanot", "omalaakar", "tutkimu", "kuvanta",
];

/** Places and names that need no confirmation in the results (they are on topic by design). */
const KNOWN_NAMES = new Set([
  "finland", "finnish", "suomi", "suomen", "suomessa", "denmark", "danish", "sweden", "swedish", "norway",
  "norwegian", "nordic", "uk", "england", "english", "britain", "british", "scotland", "europe", "european",
  "eu", "oecd", "who", "nhs", "thl", "stm", "kela", "gp", "gps", "ct", "mri", "nice", "astrazeneca", "covid",
  "omaolo", "sotkanet", "i",
]);

const STOPWORDS = new Set([
  "what", "which", "when", "where", "does", "have", "with", "from", "that", "this", "there", "about", "into",
  "they", "their", "them", "were", "been", "being", "will", "would", "could", "should", "your", "tell", "please",
  "many", "much", "long", "more", "most", "less", "than", "then", "some", "other", "people", "doing", "getting",
  "better", "worse", "ignore", "rules", "previous", "instructions", "kuinka", "miten", "mita", "onko", "mika",
]);

const hasStem = (folded: string, stems: readonly string[]) => stems.some((s) => folded.includes(` ${s}`));

/**
 * The first area named in the question. Among matches, the one starting earliest wins, then the
 * longest, so "Etelä-Pohjanmaalla" is South Ostrobothnia, not Ostrobothnia.
 */
export function detectCounty(question: string, areas: readonly AreaAliases[]): string | null {
  const text = fold(question);
  let best: { id: string; at: number; len: number } | null = null;
  for (const area of areas) {
    for (const alias of area.aliases) {
      const at = text.indexOf(` ${alias}`);
      if (at < 0) continue;
      if (!best || at < best.at || (at === best.at && alias.length > best.len)) best = { id: area.id, at, len: alias.length };
    }
  }
  return best?.id ?? null;
}

export function isOnTopic(question: string, countyId: string | null): boolean {
  return countyId !== null || hasStem(fold(question), TOPIC);
}

/** Content words (≥ 4 letters, not stopwords), folded, cut to a 5-letter stem for loose matching. */
export function contentStems(question: string): string[] {
  const words = fold(question).trim().split(" ").filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return [...new Set(words.map((w) => w.slice(0, 5)))];
}

/** Capitalised words after the first word that are not known places/names, e.g. ["narnia"]. */
export function unknownNames(question: string): string[] {
  const tokens = question.split(/\s+/).slice(1);
  // Title Case or ALL CAPS questions: capitals say nothing about names, so skip the rule.
  const words = tokens.filter((t) => /\p{L}{3,}/u.test(t));
  if (words.filter((t) => /^\P{L}*\p{Lu}/u.test(t)).length * 2 > words.length) return [];
  const out: string[] = [];
  for (const t of tokens) {
    const word = t.replace(/['’]s$/i, "").replace(/[^\p{L}-]/gu, "");
    if (word.length < 3 || !/^\p{Lu}/u.test(word)) continue;
    const folded = fold(word).trim();
    if (KNOWN_NAMES.has(folded) || hasStem(` ${folded} `, TOPIC)) continue;
    out.push(folded);
  }
  return out;
}

/**
 * Applies the result bar. Returns the kept items (order unchanged), or [] when nothing passes.
 * `countyId` set: the search was already scoped to the county, so only the per-item bar applies.
 */
export function filterRelevant(question: string, items: Item[], countyId: string | null): Item[] {
  const stems = contentStems(question);
  const texts = items.map((i) => fold(`${i.title} ${i.snippet}`));
  const kept = items.filter((_, n) => hasStem(texts[n], TOPIC) || stems.some((s) => texts[n].includes(` ${s}`)));
  if (kept.length === 0 || countyId !== null) return kept;
  const names = unknownNames(question);
  if (names.length === 0) return kept;
  const all = items.map((i) => fold(`${i.title} ${i.snippet} ${i.url}`)).join(" ");
  return names.some((n) => all.includes(` ${n}`) || all.includes(n)) ? kept : [];
}

/** Mentions a country other than Finland, so the query should not be framed as "Finland". */
export function namesOtherCountry(question: string): boolean {
  return hasStem(fold(question), ["denmark", "danish", "sweden", "swedish", "norway", "norwegian", "uk ", "england", "english", "britain", "british", "nhs ", "canada", "ontario", "tanska", "ruotsi", "norja", "britannia", "englanti"]);
}
