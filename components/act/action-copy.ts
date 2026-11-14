// Short display wording for the act page's action cards. The data (data/evidence.json) keeps its
// full text, which the card shows behind "Show the full description". Each short line is a
// condensed form of that row's own `action`, `who_implements` or `detail`: nothing is added.

import { plainTitle } from "@/lib/action-title";
import type { Evidence, Stage } from "@/lib/data";

type Copy = {
  /** At most 8 words, from `action`. */
  title: string;
  /** A few words, from `who_implements`. */
  owner: string;
  /** At most 12 words: how the action helps, from `detail`. */
  why: string;
};

const COPY: Record<string, Copy> = {
  "ev-gp-capacity-roadmap": {
    title: "Add GP capacity and named GPs county-wide",
    owner: "STM and the county",
    why: "Finland's own roadmap names it as the first measure.",
  },
  "ev-gp-continuity": {
    title: "Give every patient a named GP",
    owner: "Primary care director",
    why: "A GP who knows the patient notices a new symptom sooner.",
  },
  "ev-gp-digital-triage": {
    title: "Triage contacts with Omaolo, the online checker",
    owner: "Digital services lead",
    why: "Frees phone lines and GP slots; urgent cases are routed faster.",
  },
  "ev-gp-nurse-first-contact": {
    title: "Let nurses take suitable visits",
    owner: "Primary care director",
    why: "GP appointments go to patients who need a doctor.",
  },
  "ev-rec-direct-ct-training": {
    title: "Give GPs direct imaging access, with training",
    owner: "Imaging and primary care",
    why: "With a one-hour training, diagnosis came much sooner.",
  },
  "ev-rec-nice-threshold": {
    title: "Refer at a stated cancer-risk threshold",
    owner: "County chief physician",
    why: "The decision depends less on which GP the patient sees.",
  },
  "ev-rec-safety-netting": {
    title: "Book a review for unclear symptoms",
    owner: "Health station medical lead",
    why: "The GP sets a review date when criteria are not yet met.",
  },
  "ev-ref-denmark-cpp": {
    title: "Start cancer fast-track pathways with time limits",
    owner: "Specialist care director",
    why: "Each step from referral to treatment gets a maximum wait.",
  },
  "ev-ref-dk-diagnostic-centre": {
    title: "Open a fast route for vague symptoms",
    owner: "Specialist and primary care",
    why: "Vague symptoms fit no single pathway, so they wait longest.",
  },
  "ev-ref-econsult": {
    title: "Let GPs ask a specialist online first",
    owner: "Specialty leads and primary care",
    why: "Unneeded referrals drop out, so suspected cancer moves faster.",
  },
  "ev-ref-national-criteria": {
    title: "Use national referral criteria for suspected cancer",
    owner: "FICAN; counties implement",
    why: "Met criteria send the patient straight to the right tests.",
  },
  "ev-ref-sweden-svf": {
    title: "Fund pathways that report waiting times",
    owner: "STM, the national funder",
    why: "Sweden tied state money to reporting; waits got shorter.",
  },
  "ev-ref-templates": {
    title: "Use structured e-referral templates",
    owner: "Patient record system owner",
    why: "Complete referrals stop bouncing back or being triaged wrongly.",
  },
  "ev-ref-uk-rdc": {
    title: "Pilot a rapid diagnostic centre",
    owner: "Specialist and primary care",
    why: "One place for symptoms that fit no site-specific route.",
  },
};

/** The card's short wording; a row added to the data later falls back to its own text. */
export function actionCopy(action: Evidence): Copy {
  return (
    COPY[action.id] ?? {
      title: plainTitle(action.action),
      owner: action.who_implements.split(/[:;(]/)[0].trim(),
      why: action.first_step,
    }
  );
}

/** Each pathway step in two to four words, for pills and the pathway picture. */
export const STEP_SHORT: Record<Stage, string> = {
  gp_access: "Getting to a GP",
  gp_recognition: "Spotting warning signs",
  referral: "Referral to a specialist",
};

/** "Getting to a GP" → "getting to a GP": only the first letter, so "GP" keeps its capitals. */
export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
