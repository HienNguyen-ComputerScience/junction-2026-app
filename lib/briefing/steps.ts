// The six steps of the guided briefing, in order. Plain data with no imports, so the server
// pages (metadata, static params) and the client shell (which step is on screen) read the same
// list and can never disagree about a step's number, name or address.
//
// Address: step 1 is /briefing/<area>, steps 2 to 6 are /briefing/<area>/<slug>. The area and
// the step are both in the path, so a briefing can be linked, emailed, refreshed and reopened
// at the same place, every step is static HTML, and the browser's Back button is a real Back.

export type BriefingStepId = "stand" | "where" | "means" | "do" | "change" | "share";

export type BriefingStep = {
  id: BriefingStepId;
  number: number;
  /** The path segment after the area, or null for step 1. */
  slug: string | null;
  /** The pill at the top of the step, and the step's name in "Step 2 of 6: …". */
  label: string;
  /** How the Next button of the step before names this one: "Next: where the delay is". */
  next: string;
};

export const BRIEFING_STEPS: BriefingStep[] = [
  { id: "stand", number: 1, slug: null, label: "Where you stand", next: "where you stand" },
  { id: "where", number: 2, slug: "where-the-delay-is", label: "Where the delay is", next: "where the delay is" },
  { id: "means", number: 3, slug: "what-it-means", label: "What it means", next: "what it means" },
  { id: "do", number: 4, slug: "what-to-do", label: "What to do on Monday", next: "what to do on Monday" },
  { id: "change", number: 5, slug: "what-it-could-change", label: "What it could change", next: "what it could change" },
  // The slug is older than the label; it stays because proxy.ts lists it (see docs/audit/export/notes.md).
  { id: "share", number: 6, slug: "take-it-to-your-board", label: "Save or share this briefing", next: "save or share this briefing" },
];

export const BRIEFING_STEP_COUNT = BRIEFING_STEPS.length;

/** Slugs of the steps that have one (2 to 6), for generateStaticParams. */
export const BRIEFING_STEP_SLUGS = BRIEFING_STEPS.flatMap((step) => (step.slug ? [step.slug] : []));

/** The step a path segment names. `null` (no segment) is step 1; an unknown segment is undefined. */
export function stepForSegment(segment: string | null): BriefingStep | undefined {
  return BRIEFING_STEPS.find((step) => step.slug === segment);
}

export function stepById(id: BriefingStepId): BriefingStep {
  return BRIEFING_STEPS.find((step) => step.id === id) ?? BRIEFING_STEPS[0];
}

/** The address of a step of an area's briefing. */
export function briefingHref(areaId: string, step: BriefingStep | BriefingStepId = "stand"): string {
  const { slug } = typeof step === "string" ? stepById(step) : step;
  return slug ? `/briefing/${areaId}/${slug}` : `/briefing/${areaId}`;
}

/** "Step 2 of 6: Where the delay is", as announced and as the page title starts. */
export function stepAnnouncement(step: BriefingStep): string {
  return `Step ${step.number} of ${BRIEFING_STEP_COUNT}: ${step.label}`;
}
