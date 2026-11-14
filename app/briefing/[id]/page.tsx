import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BRIEFING_STEPS, stepAnnouncement } from "@/lib/briefing/steps";
import { counties, getCounty } from "@/lib/data";

// Areas are a fixed, known set, so a blocking route is fine here (as on the county pages).
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export async function generateMetadata({ params }: PageProps<"/briefing/[id]">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  // The title starts with the step: it is what a browser announces when the step changes.
  return { title: `${stepAnnouncement(BRIEFING_STEPS[0])} · Briefing for ${county.name} | FirstLine` };
}

/** Step 1 of an area's briefing. The step itself is drawn by the layout's shell. */
export default async function BriefingStartStepPage({ params }: PageProps<"/briefing/[id]">) {
  const { id } = await params;
  if (!getCounty(id)) notFound();
  return null;
}
