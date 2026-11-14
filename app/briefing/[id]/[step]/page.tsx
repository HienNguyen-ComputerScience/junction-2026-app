import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BRIEFING_STEP_SLUGS, stepAnnouncement, stepForSegment } from "@/lib/briefing/steps";
import { counties, getCounty } from "@/lib/data";

// Areas and steps are fixed, known sets: every step of every area is built as static HTML.
export const instant = false;

export function generateStaticParams() {
  return counties.flatMap((county) => BRIEFING_STEP_SLUGS.map((step) => ({ id: county.id, step })));
}

export async function generateMetadata({ params }: PageProps<"/briefing/[id]/[step]">): Promise<Metadata> {
  const { id, step: slug } = await params;
  const county = getCounty(id);
  const step = stepForSegment(slug);
  if (!county || !step) return {};
  // The title starts with the step: it is what a browser announces when the step changes.
  return { title: `${stepAnnouncement(step)} · Briefing for ${county.name} | FirstLine` };
}

/** Steps 2 to 6 of an area's briefing. The step itself is drawn by the layout's shell. */
export default async function BriefingStepPage({ params }: PageProps<"/briefing/[id]/[step]">) {
  const { id, step } = await params;
  if (!getCounty(id) || !stepForSegment(step)) notFound();
  return null;
}
