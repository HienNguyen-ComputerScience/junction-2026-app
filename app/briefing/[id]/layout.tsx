import { notFound } from "next/navigation";

import "../briefing.css";
import { BriefingPrint } from "@/components/briefing/print-document";
import { BriefingShell } from "@/components/briefing/shell";
import { StepChange } from "@/components/briefing/step-change";
import { StepDo } from "@/components/briefing/step-do";
import { StepMeans } from "@/components/briefing/step-means";
import { StepShare } from "@/components/briefing/step-share";
import { StepStand } from "@/components/briefing/step-stand";
import { StepWhere } from "@/components/briefing/step-where";
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
    <main>
      <BriefingShell
        areaId={briefing.county.id}
        areaName={briefing.county.name}
        defaultYear={briefing.defaultTargetYear}
        steps={{
          stand: <StepStand briefing={briefing} />,
          where: <StepWhere briefing={briefing} />,
          means: <StepMeans briefing={briefing} />,
          do: <StepDo briefing={briefing} />,
          change: <StepChange briefing={briefing} />,
          share: <StepShare briefing={briefing} />,
        }}
      >
        {children}
      </BriefingShell>
      {/* The same briefing as one document: only on paper, where it replaces the card. */}
      <div className="page-container">
        <BriefingPrint briefing={briefing} />
      </div>
    </main>
  );
}
