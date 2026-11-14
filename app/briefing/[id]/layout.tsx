import { notFound } from "next/navigation";

import "../briefing.css";
import { BriefingShell } from "@/components/briefing/shell";
import { StepStand } from "@/components/briefing/step-stand";
import { buildBriefing } from "@/lib/briefing/model";

/**
 * One area's briefing. The layout builds the model once and renders all six steps on the
 * server; the shell shows the one the address names. Because the steps live in the layout,
 * they stay in place while the address moves from step to step: a press of Next changes the
 * screen at once and what the director chose on one step is still there on the next.
 */
export default async function BriefingAreaLayout({ params, children }: LayoutProps<"/briefing/[id]">) {
  const { id } = await params;
  const briefing = buildBriefing(id);
  if (!briefing) notFound();

  return (
    <BriefingShell
      areaId={briefing.county.id}
      areaName={briefing.county.name}
      defaultYear={briefing.defaultTargetYear}
      steps={{
        stand: <StepStand briefing={briefing} />,
        where: <p>where</p>,
        means: <p>means</p>,
        do: <p>do</p>,
        change: <p>change</p>,
        board: <p>board</p>,
      }}
    >
      {children}
    </BriefingShell>
  );
}
