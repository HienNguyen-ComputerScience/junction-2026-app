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

export const RED_FLAG_CATEGORIES: RedFlagCategory[] = [
  {
    id: "bleeding",
    label: "Bleeding that has no clear reason",
    examples: "blood in stool, urine or when coughing; unexpected bleeding",
    urgency: "urgent",
    keywords: ["blood", "bleed", "bloody", "veri", "verta", "vuoto", "verenvuoto"],
    links: [NICE_BY_SYMPTOM, NICE_BY_SITE, KAYPA_HOITO],
  },
  {
    id: "lump",
    label: "A new lump or swelling that doesn't go away",
    examples: "a lump in the breast, neck, armpit or elsewhere",
    urgency: "urgent",
    keywords: ["lump", "swelling", "swollen", "kyhmy", "patti", "turvotus", "turpoa"],
    links: [NICE_BY_SYMPTOM, NICE_BY_SITE, KAYPA_HOITO],
  },
  {
    id: "swallowing",
    label: "Trouble swallowing",
    examples: "food sticking, pain when swallowing",
    urgency: "urgent",
    keywords: ["swallow", "food stick", "choking", "nielemi", "nielu"],
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
      "nausea",
      "sick",
      "pain",
      "ache",
      "appetite",
      "sweat",
      "laihtu",
      "laihdu",
      "väsy",
      "uupu",
      "pahoinvoin",
      "kipu",
      "ruokahalu",
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
      "yskä",
      "käheä",
      "ääni",
      "suoli",
      "luomi",
      "haava",
      "iho",
    ],
    links: [NICE_BY_SYMPTOM, NICE_SAFETY_NETTING, KAYPA_HOITO],
  },
];

/** Fallback when nothing matches: never reassure, always safety-net. */
export const NO_MATCH_LINKS: GuidelineLink[] = [NICE_SAFETY_NETTING, NICE_NG12, KAYPA_HOITO];

/**
 * Words that start like a keyword but mean something else ("iho" vs "ihminen",
 * "veri" vs "verenpaine", "pain" vs "painting"). A word starting with one of
 * these never matches.
 */
const STOP_PREFIXES = ["ihmi", "verenpain", "paint", "voicemail"];

/** Everyday phrases that contain a keyword but are not a symptom. Removed before matching. */
const STOP_PHRASES = /\bsick (leave|note|day|days|pay)\b/g;

/** A keyword directly after one of these words is not counted ("no blood", "ei verta"). */
const NEGATIONS = new Set(["no", "not", "without", "never", "ei", "eikä", "ilman"]);

/** Keywords where the absence is the symptom ("no appetite", "ei ruokahalua"). */
const ABSENCE_IS_SYMPTOM = new Set(["appetite", "ruokahalu", "healing"]);

/**
 * Local, in-browser keyword match. Nothing is sent or stored.
 * Single-word keywords match the start of a word ("tired" matches "tiredness",
 * not "retired"), except words on the stop-list, and not when the word directly
 * before is a negation ("no blood"). Keywords with a space or apostrophe match
 * as phrases.
 */
export function matchCategories(text: string): string[] {
  const normalised = text.toLowerCase().replace(/[‘’]/g, "'").replace(STOP_PHRASES, " ");
  // Words per clause, so a negation never reaches across punctuation ("Pain? No. Blood").
  const clauses = normalised
    .split(/[.,;:!?\n]+/)
    .map((clause) => clause.split(/[^\p{L}']+/u).filter(Boolean))
    .filter((words) => words.length > 0);
  if (clauses.length === 0) return [];
  const hit = (keyword: string) =>
    /[\s']/.test(keyword)
      ? normalised.includes(keyword)
      : clauses.some((words) =>
          words.some(
            (word, i) =>
              word.startsWith(keyword) &&
              !STOP_PREFIXES.some((stop) => word.startsWith(stop)) &&
              (ABSENCE_IS_SYMPTOM.has(keyword) || !NEGATIONS.has(words[i - 1] ?? "")),
          ),
        );
  return RED_FLAG_CATEGORIES.filter((category) => category.keywords.some(hit)).map(
    (category) => category.id,
  );
}
