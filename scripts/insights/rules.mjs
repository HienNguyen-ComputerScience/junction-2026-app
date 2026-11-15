// Every rule and cut-off the insights use, in one place. The build script (build-insights.mjs)
// applies them; the check script (check-insights.mjs) re-applies them to the snapshot and fails
// if a derived row disagrees. The UI prints the same rules from data/insights/rules.json, so
// what a director reads under "How we grade this number" is what the code does.

/**
 * A count behind a share that moved by more than this between two years (up or down) means part
 * of the change may be in what was recorded. Same threshold as RECORDING_CHANGE_ABOVE in
 * lib/recording.ts (the check script asserts the two agree).
 */
export const RECORDING_CHANGE_ABOVE = 0.2;

/** A share resting on fewer visits than this is graded "read with care" (Kainuu 2023: 408). */
export const SMALL_BASE_BELOW = 1000;

/**
 * Differences from Finland smaller than this many percentage points are "about the same as
 * Finland" (same 1-point line as RISE_POINTS in lib/recording.ts). Survival is published in whole
 * numbers, so a 1-point difference there is also "about the same".
 */
export const ABOUT_SAME_POINTS = 1;

/** Screening target: at least 80% attendance in every programme in every county (Goal 2). */
export const SCREENING_TARGET = 80;

/** Indicators graded, and what the count behind each one is. */
export const GRADED = {
  "6411": { count: "visits", base: "share" },
  "13": { count: "referrals", base: "share" },
  // 5033 is 0–3% in whole numbers, so count ÷ share is undefined at 0: no count rule.
  "5033": { count: null, base: null },
  "2371": { count: "visits", base: "count" },
  "293": { count: "visits", base: "count" },
  "692": { count: "people", base: "count" },
  // Screening invitations follow programme rounds, so the number invited swings by design:
  // the recording-change rule is not applied to them.
  "3621": { count: null, base: null },
  "6103": { count: null, base: null },
  "3620": { count: null, base: null },
  "3627": { count: null, base: null },
  "3625": { count: null, base: null },
};

/** THL's own limits text reports missing visits for these areas (6411, 2371, 293). */
export const PUBLISHER_GAPS = {
  indicators: ["6411", "2371", "293"],
  areas: {
    "vantaa-kerava": {
      years: [2023, 2024, 2025],
      reason:
        "THL reports visits missing from Vantaa's and Kerava's records (about 20% and 30% of visits in 2024).",
    },
    helsinki: {
      years: [2023],
      reason: "THL reports visits missing from Helsinki's records up to 2023; from 2024 they look complete again.",
    },
  },
};

export const HUS_AREAS = ["central-uusimaa", "east-uusimaa", "vantaa-kerava", "west-uusimaa"];

/** The four grade levels, best first. Each has a text label and a shape, never colour alone. */
export const LEVELS = [
  {
    level: "solid",
    label: "Solid",
    shape: "filled circle",
    meaning: "Published for this area and year, and the count behind it is steady.",
  },
  {
    level: "care",
    label: "Read with care",
    shape: "half-filled circle",
    meaning:
      "Published, but something about how it was recorded or what it covers means the figure, or its change from last year, may not be what it seems. The reason is always given.",
  },
  {
    level: "shared",
    label: "Shared hospital value",
    shape: "two linked circles",
    meaning: "No value exists for this area alone; the figure shown covers a wider hospital area (HUS).",
  },
  {
    level: "none",
    label: "No public data",
    shape: "empty circle",
    meaning: "Nobody publishes this figure for this area and year.",
  },
];

/** The rules in the order they are tried. The first that applies sets the level. */
export const GRADE_RULES = [
  {
    id: "no-data",
    level: "none",
    label: "No public data",
    rule: "Sotkanet has no value for this area and year, and no wider value covers it.",
  },
  {
    id: "shared-hospital",
    level: "shared",
    label: "Shared hospital value",
    rule: "Referral figures (Sotkanet 13) for East, Central and West Uusimaa and Vantaa–Kerava: only one HUS-wide value is published for the hospital that handles their referrals.",
  },
  {
    id: "publisher-gap",
    level: "care",
    label: "Read with care",
    rule: "THL's own notes on the indicator say visits are missing from this area's records (Vantaa and Kerava 2023–2025, Helsinki 2023), for the GP wait (6411), occupational-health visits (2371) and public primary-care visits (293).",
  },
  {
    id: "small-base",
    level: "care",
    label: "Read with care",
    rule: `The share rests on fewer than ${SMALL_BASE_BELOW.toLocaleString("en-GB")} visits, so a few visits move it a lot.`,
  },
  {
    id: "partial-unit",
    level: "care",
    label: "Read with care",
    rule: "Helsinki's referral figure covers the city's own specialist units only; most Helsinki referrals go to HUS.",
  },
  {
    id: "recording-change",
    level: "care",
    label: "Read the trend with care",
    rule: `The count behind the figure (visits, referrals or people) changed by more than ${RECORDING_CHANGE_ABOVE * 100}% from the year before, so part of any change from last year may be in what was recorded. Checked year on year, so a rise and a fall that cancel out are still caught.`,
  },
  {
    id: "programme-widening",
    level: "care",
    label: "Read the trend with care",
    rule: "Bowel cancer screening (Sotkanet 6103) started in 2022 and is still adding age groups, so years are not fully comparable.",
  },
  {
    id: "solid",
    level: "solid",
    label: "Solid",
    rule: "None of the above applies.",
  },
];

/** What each indicator covers. Shown beside every grade; it is about scope, not reliability. */
export const SCOPE = {
  "6411": "Covers all non-urgent GP visits, not only cancer. Counts visits, not people.",
  "13": "Counts all referrals to the hospital, not only cancer, by the hospital that received them.",
  "5033": "Counts all referrals to the hospital, not only cancer. Published in whole percent.",
  "2371": "Working-age residents (15–64) only; counts visits, not people.",
  "293": "Working-age residents (15–64) only; counts visits, not people.",
  "692": "Anyone reimbursed by Kela for a private doctor visit in the year, any specialty.",
  "3621": "Women invited to breast screening who attended.",
  "6103": "People invited to bowel screening who attended.",
  "3620": "Women invited to cervical screening who attended.",
  "3627": "Patients diagnosed over ten years; published in whole percent.",
  "3625": "Patients diagnosed over ten years; published in whole percent.",
};

/**
 * "No way round" tests. The main one compares 2025 with Finland. The others change one thing at
 * a time: the reference point (the middle area instead of Finland), how far from Finland counts
 * (5% or 10%), or the year.
 */
export const NWR_TESTS = [
  { id: "main", year: 2025, reference: "finland", margin: 0, label: "2025, compared with Finland (the main view)" },
  { id: "median", year: 2025, reference: "median", margin: 0, label: "2025, compared with the middle area of the 22 instead of Finland" },
  { id: "margin5", year: 2025, reference: "finland", margin: 0.05, label: "2025, only counting areas more than 5% away from Finland overall" },
  { id: "margin10", year: 2025, reference: "finland", margin: 0.1, label: "2025, only counting areas more than 10% away from Finland overall" },
  { id: "y2024", year: 2024, reference: "finland", margin: 0, label: "2024 figures, compared with Finland" },
  { id: "y2023", year: 2023, reference: "finland", margin: 0, label: "2023 figures, compared with Finland" },
];

export const NWR_INDICATORS = { wait: "6411", occupational: "2371", private: "692" };

export const NWR_GROUPS = [
  {
    id: "long-few",
    label: "Long wait, few other routes",
    meaning: "GP wait longer than Finland overall, and both occupational-health and private-doctor use lower than Finland overall.",
  },
  {
    id: "long-some",
    label: "Long wait, other routes in use",
    meaning: "GP wait longer than Finland overall, but occupational-health or private-doctor use at or above Finland overall.",
  },
  {
    id: "short-few",
    label: "Shorter wait, few other routes",
    meaning: "GP wait at or below Finland overall, and both other routes used less than in Finland overall.",
  },
  {
    id: "short-some",
    label: "Shorter wait, other routes in use",
    meaning: "GP wait at or below Finland overall, and at least one other route used as much as or more than in Finland overall.",
  },
];

/** Early warning: which indicators, and which way is worse. */
export const WARNING_INDICATORS = ["6411", "13", "3621", "6103", "3620"];
