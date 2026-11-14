// Red-flag helper data: our own plain-language warning-sign categories.
//
// Licence rule: NICE NG12 and Käypä hoito text may not be reproduced in the app
// (see docs/evidence/red-flags.md). Nothing here is copied from them: no
// symptom lists, age thresholds, day counts or named tests. Categories are
// deliberately general and every one links to the guideline pages for detail.
// This file is imported by a client component, so it must not import lib/data.

export type Urgency = "urgent" | "vague" | "prompt" | "safety_net";

export type GuidelineLink = {
  label: string;
  url: string;
  /** Matches a row in data/sources.json when the link is also an evidence source. */
  source_id?: string;
};

export type Tier = {
  urgency: Urgency;
  rank: number; // lower = more urgent
  title: string;
  speed: string;
  gpAction: string;
};

export type RedFlagCategory = {
  id: string;
  label: string; // plain-language category name
  examples: string; // a few everyday words, not a clinical list
  urgency: Urgency;
  keywords: string[]; // lowercase English and Finnish stems for local matching
  links: GuidelineLink[];
};

export const NICE_NG12: GuidelineLink = {
  label: "NICE NG12 Suspected cancer: recognition and referral (UK, last updated April 2026)",
  url: "https://www.nice.org.uk/guidance/ng12",
};
const NICE_BY_SYMPTOM: GuidelineLink = {
  label: "NICE NG12: recommended actions organised by symptom",
  url: "https://www.nice.org.uk/guidance/ng12/chapter/Recommended-actions-organised-by-symptom-and-findings-of-primary-care-investigations",
};
const NICE_BY_SITE: GuidelineLink = {
  label: "NICE NG12: recommendations organised by site of cancer",
  url: "https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer",
};
const NICE_SAFETY_NETTING: GuidelineLink = {
  label: "NICE NG12: patient support, safety netting and the diagnostic process",
  url: "https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-on-patient-support-safety-netting-and-the-diagnostic-process",
  source_id: "ev-nice-recommendations-on-patient-support-safety-netting-th",
};
export const KAYPA_HOITO: GuidelineLink = {
  label: "Käypä hoito (Duodecim): Finnish guidelines, per cancer type",
  url: "https://www.kaypahoito.fi/",
};
export const FINNISH_ROADMAP: GuidelineLink = {
  label: "Finnish cancer strategy roadmap 2026–2031, measure 2.5.2 (p. 52): national referral criteria, not yet published",
  url: "https://files.hackjunction.app/resources/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf",
  source_id: "ev-files-kansallinen-syopastrategia-toimeenpanon-tiekartta-2",
};
const DANISH_THREE_LEGGED: GuidelineLink = {
  label: "Vedsted & Olesen 2015: Denmark's route for vague but serious symptoms",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4385978/",
  source_id: "ev-pmc-pmc4385978",
};
const UK_RDC: GuidelineLink = {
  label: "Br J Cancer 2020: England's diagnostic centres for non-specific symptoms",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7462853/",
  source_id: "ev-pmc-pmc7462853",
};

export const TIERS: Record<Urgency, Tier> = {
  urgent: {
    urgency: "urgent",
    rank: 0,
    title: "Fast track: consider a suspected-cancer referral now",
    speed: "Seen by a GP without waiting for a routine slot, and referred on the fastest suspected-cancer route available locally.",
    gpAction:
      "The GP checks the guideline for the exact criteria and, if they fit or the GP is unsure, refers or orders the test now rather than booking a routine follow-up.",
  },
  vague: {
    urgency: "vague",
    rank: 1,
    title: "Vague-symptoms route: a fast, full work-up",
    speed: "Seen by a GP soon. These symptoms don't point to one cancer, which is why they tend to wait longest.",
    gpAction:
      "The GP runs basic tests and, if nothing explains the symptoms, refers to a unit that investigates vague but serious symptoms (the Danish diagnostic-centre and UK Rapid Diagnostic Centre model).",
  },
  prompt: {
    urgency: "prompt",
    rank: 2,
    title: "See a GP soon and check it against the guideline",
    speed: "See a GP within the next couple of weeks, sooner if it gets worse or something new appears.",
    gpAction:
      "The GP checks the guideline criteria for this symptom. If they fit, refer or test now. If not, book a review date and tell the person exactly when to come back.",
  },
  safety_net: {
    urgency: "safety_net",
    rank: 3,
    title: "Safety-net and recheck",
    speed: "See a GP within the next few weeks, sooner if it gets worse or something new appears.",
    gpAction:
      "If referral criteria aren't met, the GP books a review date and tells the person exactly when to come back. Test results get a named owner.",
  },
};

/** Filled by `fi()` below: which keywords are Finnish. Used to pair a negation with its own language. */
const FINNISH_KEYWORDS = new Set<string>();

/**
 * Marks keywords as Finnish. Finnish stems change when a word is inflected
 * (veri, veren, verta; ääni, äänen, ääntä; kipu, kivun), and matching is by
 * prefix, so every stem that occurs has to be listed.
 */
function fi(...stems: string[]): string[] {
  for (const stem of stems) FINNISH_KEYWORDS.add(stem);
  return stems;
}

export const RED_FLAG_CATEGORIES: RedFlagCategory[] = [
  {
    id: "bleeding",
    label: "Bleeding that has no clear reason",
    examples: "blood in stool, urine or when coughing; unexpected bleeding",
    urgency: "urgent",
    keywords: [
      "blood",
      "bleed",
      "bled",
      "bloody",
      ...fi("veri", "vere", "verta", "vuoto", "vuota", "vuodo", "verenvuoto"),
    ],
    links: [NICE_BY_SYMPTOM, NICE_BY_SITE, KAYPA_HOITO],
  },
  {
    id: "lump",
    label: "A new lump or swelling that doesn't go away",
    examples: "a lump in the breast, neck, armpit or elsewhere",
    urgency: "urgent",
    keywords: ["lump", "swell", "swollen", ...fi("kyhmy", "patti", "turvo", "turpo")],
    links: [NICE_BY_SYMPTOM, NICE_BY_SITE, KAYPA_HOITO],
  },
  {
    id: "swallowing",
    label: "Trouble swallowing",
    examples: "food sticking, pain when swallowing",
    urgency: "urgent",
    keywords: ["swallow", "food stick", "food stuck", "food gets stuck", "chok", ...fi("niel")],
    links: [NICE_BY_SYMPTOM, NICE_BY_SITE, KAYPA_HOITO],
  },
  {
    id: "vague",
    label: "Vague symptoms that keep going",
    examples: "weight loss without trying, tiredness, unexplained pain, nausea",
    urgency: "vague",
    keywords: [
      "weight",
      "tired",
      "fatigue",
      "exhaust",
      "nause",
      "sick",
      "pain",
      "pained", // listed separately because the stop "paine" (Finnish: pressure) would hide it
      "ache",
      "aching",
      "achy",
      "appetite",
      "sweat",
      // Not being able to eat. Whole phrases only: "eat" alone is not a symptom.
      "can't eat",
      "cant eat",
      "cannot eat",
      "can not eat",
      "couldn't eat",
      "couldnt eat",
      "could not eat",
      "unable to eat",
      "not able to eat",
      ...fi(
        "laihtu",
        "laihdu",
        "paino", // weight: "paino laskenut", "painonlasku"
        "väsy",
        "uupu",
        "pahoinvoi",
        "kipu",
        "kivu",
        "kipe",
        "ruokahalu",
        "pysty syömään", // only ever negative: "en/ei pysty syömään"
        "en voi syödä",
        "ei voi syödä",
      ),
    ],
    links: [DANISH_THREE_LEGGED, UK_RDC, NICE_BY_SYMPTOM],
  },
  {
    id: "persistent-change",
    label: "A change that lasts or doesn't heal",
    examples: "a cough or hoarse voice that won't clear, a change in bowel habit, a sore or mole that changes",
    urgency: "prompt",
    keywords: [
      "cough",
      "hoarse",
      "voice",
      "bowel",
      "diarr",
      "constipat",
      "mole",
      "sore",
      "ulcer",
      "healing",
      "n't heal",
      "not heal",
      "cannot heal",
      "doesnt heal",
      "didnt heal",
      "hasnt heal",
      "wont heal",
      ...fi(
        "ysk",
        "käheä",
        "kähey",
        "ääni",
        "ääne",
        "ääntä",
        "suoli",
        "suole",
        "suolta",
        "luomi",
        "luome",
        "haava",
        "iho",
      ),
    ],
    links: [NICE_BY_SYMPTOM, NICE_SAFETY_NETTING, KAYPA_HOITO],
  },
];

/** Fallback when nothing matches: never reassure, always safety-net. */
export const NO_MATCH_LINKS: GuidelineLink[] = [NICE_SAFETY_NETTING, NICE_NG12, KAYPA_HOITO];

/**
 * Words that start like a keyword but mean something else, listed under the
 * keyword they would wrongly match. A word starting with one of these does not
 * match that keyword (it can still match another: "painonlasku" is not "pain"
 * but is "paino", weight). Every entry must start with its keyword, otherwise it
 * can never fire; tests/red-flags.test.mjs checks this.
 */
export const STOP_PREFIXES = new Map<string, string[]>([
  // "painting", and Finnish paine (pressure), paino (weight, its own keyword) and
  // painajainen (nightmare). Kept short on purpose: "paining" and "painaa" still match.
  ["pain", ["paint", "paine", "paino", "painaj"]],
  // verenpaine (blood pressure), verensokeri, verenkierto, verenluovutus.
  ["vere", ["verenpain", "verensok", "verenkier", "verenluov"]],
  ["veri", ["verif"]], // verify, verification
  ["voice", ["voicemail"]],
  ["mole", ["molem"]], // Finnish molemmat (both)
  ["ääne", ["äänest", "äänek"]], // äänestää (to vote), äänekäs (loud)
  ["sweat", ["sweater"]],
]);

/** Everyday phrases that contain a keyword but are not a symptom. Removed before matching. */
const STOP_PHRASES = /\b(sick (leave|note|day|days|pay)|blood (pressure|sugar))\b/g;

/**
 * A keyword directly after one of these words is a symptom being denied and is
 * not counted ("no blood", "ei verta"). Do not widen these lists or their reach:
 * a missed red flag is worse than a false one.
 *
 * A negation only counts in front of a keyword of its own language. "No" is
 * also a Finnish filler word ("No verta tuli" means "well, there was blood").
 */
const NEGATIONS_EN = new Set(["no", "not", "without", "never"]);
const NEGATIONS_FI = new Set(["ei", "eikä", "ilman"]);

/**
 * Keywords a negation never cancels, because losing the function is the symptom:
 * "can not swallow", "no voice", "ei ääntä", "no appetite", "not healing",
 * "no bowel movement". Keyed by keyword, so every stem of such a word in
 * RED_FLAG_CATEGORIES has to be listed here too.
 */
export const LOSS_IS_SYMPTOM = new Set([
  "swallow",
  "niel",
  "voice",
  "ääni",
  "ääne",
  "ääntä",
  "appetite",
  "ruokahalu",
  "healing",
  "bowel",
  "suoli",
  "suole",
  "suolta",
]);

/** "can not X" / "could not X" is an inability, never a denial, whatever X is. */
const ABILITY = new Set(["can", "could"]);

/**
 * Local, in-browser keyword match. Nothing is sent or stored.
 *
 * Single-word keywords match the start of a word ("tired" matches "tiredness",
 * not "retired"), except words on that keyword's stop-list.
 *
 * Negation: a keyword is dropped only when the word directly before it, in the
 * same clause, is a negation in the keyword's language ("no blood", "ei
 * verta"). It is kept when the keyword is in LOSS_IS_SYMPTOM ("no voice") or
 * the negation follows "can"/"could" ("can not swallow"). When in doubt the
 * keyword counts.
 *
 * Keywords with a space or apostrophe match as phrases inside one clause, from
 * the start of a word ("en voi syödä" must not match "ihminen voi syödä"). Only
 * the "n't ..." phrases start inside a word ("doesn't heal"). Phrases ignore
 * negation.
 */
export function matchCategories(text: string): string[] {
  const normalised = text
    .normalize("NFC") // pasted text can carry "ä" as "a" plus a combining mark
    .toLowerCase()
    .replace(/[‘’´`]/g, "'")
    .replace(STOP_PHRASES, " ");
  // Words per clause, so a negation never reaches across punctuation ("Pain? No. Blood").
  const clauses = normalised
    .split(/[.,;:!?\n]+/)
    .map((clause) => clause.split(/[^\p{L}']+/u).filter(Boolean))
    .filter((words) => words.length > 0);
  if (clauses.length === 0) return [];
  // The same clauses as text with single spaces and a leading space, for phrases.
  const clauseTexts = clauses.map((words) => ` ${words.join(" ")}`);

  const denied = (keyword: string, words: string[], i: number) =>
    (FINNISH_KEYWORDS.has(keyword) ? NEGATIONS_FI : NEGATIONS_EN).has(words[i - 1] ?? "") &&
    !LOSS_IS_SYMPTOM.has(keyword) &&
    !ABILITY.has(words[i - 2] ?? "");

  const hit = (keyword: string) => {
    if (/[\s']/.test(keyword)) {
      const phrase = keyword.startsWith("n't") ? keyword : ` ${keyword}`;
      return clauseTexts.some((clause) => clause.includes(phrase));
    }
    const stops = STOP_PREFIXES.get(keyword) ?? [];
    return clauses.some((words) =>
      words.some(
        (word, i) =>
          word.startsWith(keyword) &&
          !stops.some((stop) => word.startsWith(stop)) &&
          !denied(keyword, words, i),
      ),
    );
  };

  return RED_FLAG_CATEGORIES.filter((category) => category.keywords.some(hit)).map(
    (category) => category.id,
  );
}
