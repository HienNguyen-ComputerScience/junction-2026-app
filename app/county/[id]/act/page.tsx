import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActionCard, ActionSummary } from "@/components/act/action-card";
import { RedFlagHelper } from "@/components/act/red-flag-helper";
import { EvidenceFinder } from "@/components/exa/evidence-finder";
import { WhatIfForArea } from "@/components/home/what-if-panel";
import { buildPathwaySteps, PathwaySteps } from "@/components/pathway/pathway-steps";
import { BackLink } from "@/components/ui/back-link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Disclosure } from "@/components/ui/disclosure";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FrameMeta,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { STAGE_LABELS, bottleneckLede, getBottleneck, otherActions, pickActions } from "@/lib/act";
import { counties, getCounty, LATEST_YEAR, type Evidence } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export async function generateMetadata({ params }: PageProps<"/county/[id]/act">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  return { title: `${county.name}: what to do | FirstLine` };
}

export default async function CountyActPage({ params }: PageProps<"/county/[id]/act">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const bottleneck = getBottleneck(county.id);
  const recommended = pickActions(bottleneck);
  const others = otherActions(county.id, recommended);
  const unmeasured = others.filter((group) => group.unmeasured && group.stage !== "gp_recognition");
  const remaining = others.filter((group) => !unmeasured.includes(group));
  const otherCount = others.reduce((total, group) => total + group.actions.length, 0);

  return (
    <main className="page-container flex flex-col gap-8 pt-4 sm:pt-6">
      <header className="flex flex-col items-start gap-2">
        <Breadcrumb
          items={[{ label: "Areas", href: "/" }, { label: county.name, href: `/county/${county.id}` }, { label: "Actions" }]}
        />
        <div className="flex flex-col gap-2">
          <p className="type-caption text-balance text-muted-foreground">
            Path to early cancer care
            <span className="max-sm:hidden"> · </span>
            <span className="max-sm:block">{county.name_fi}</span>
          </p>
          <h1 className="type-page">{county.name}: what to do next</h1>
        </div>
      </header>

      {/* The compact step strip: where the delay sits, in one short row, so the first action
          is on the first screen. The full detail of each step is on the county page. */}
      <Frame aria-labelledby="where-heading">
        <FrameHeader className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <FrameTitle id="where-heading" className="type-title">
            {bottleneck.anyRed ? "Where the delay sits" : "Where the pathway stands"} ({LATEST_YEAR})
          </FrameTitle>
          <p className="text-sm text-pretty text-foreground">{bottleneckLede(bottleneck)}</p>
          <BarKey items={["finland", "short"]} className="sm:ml-auto" />
        </FrameHeader>
        <FramePanel padding="none">
          <PathwaySteps
            steps={buildPathwaySteps(county.id)}
            density="compact"
            renderExtra={(step) =>
              step.stage === "gp_recognition" ? (
                <TextLink kind="jump" href="#red-flags" className="type-caption sm:min-h-6">
                  Red-flag helper
                </TextLink>
              ) : null
            }
          />
        </FramePanel>
      </Frame>

      <WhatIfForArea countyId={county.id} areaName={county.name} />

      <Frame aria-labelledby="recommended">
        <FrameHeader>
          <FrameTitle id="recommended" className="type-title">
            {bottleneck.anyRed ? "Recommended actions" : "Actions to keep this level"}
          </FrameTitle>
          {/* The selection rule in one line (the full rule is SELECTION_RULE in lib/act). */}
          <FrameMeta className="max-sm:col-span-2 max-sm:col-start-1 max-sm:row-start-2 max-sm:justify-start">
            {bottleneck.anyRed ? "Ordered by where the pathway breaks" : "Ordered by closeness to Finland's level"}
          </FrameMeta>
        </FrameHeader>
        <div className="flex flex-col gap-3">
          {recommended.map((action, index) => (
            <ActionCard key={action.id} action={action} index={index + 1}>
              <EvidenceFinder actionId={action.id} actionTitle={action.action} />
            </ActionCard>
          ))}
        </div>

        {otherCount > 0 ? (
          <Disclosure
            className="mt-1.5"
            summaryClassName="min-h-11 w-full gap-2 rounded-panel px-3 sm:px-4"
            summary={
              <span>
                <span className="group-open/disc:hidden">Show</span>
                <span className="hidden group-open/disc:inline">Hide</span> {otherCount} other evidence-backed{" "}
                {otherCount === 1 ? "option" : "options"}
              </span>
            }
          >
            <div className="flex flex-col gap-1.5 pt-1.5">
              {unmeasured.map((group) => (
                <section key={group.stage} aria-labelledby={`unmeasured-${group.stage}`}>
                  <GroupHead
                    id={`unmeasured-${group.stage}`}
                    title={`${STAGE_LABELS[group.stage]}: can't be measured here yet`}
                    note={`${group.unmeasured} These actions still apply if the county finds a delay at this step.`}
                    noData
                  />
                  <SummaryGrid actions={group.actions} />
                </section>
              ))}

              {remaining.length > 0 ? (
                <section aria-labelledby="other" className="flex flex-col gap-1.5">
                  <div className="px-3 pt-3 sm:px-4">
                    <h3 id="other" className="type-heading">
                      Other options for this county
                    </h3>
                  </div>
                  {remaining.map((group) => (
                    <div key={group.stage}>
                      <GroupHead
                        title={STAGE_LABELS[group.stage]}
                        note={group.unmeasured}
                        noData={group.unmeasured !== null}
                        level="h4"
                      />
                      <SummaryGrid actions={group.actions} />
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
          </Disclosure>
        ) : null}
      </Frame>

      <Frame aria-labelledby="red-flags">
        <FrameHeader>
          <FrameTitle id="red-flags" className="type-title scroll-mt-24">
            Red-flag helper for GPs
          </FrameTitle>
          <FrameDescription>
            For the &ldquo;GP recognises warning signs&rdquo; step: a concern in, the referral route out.
          </FrameDescription>
        </FrameHeader>
        <FramePanel padding="lg">
          <RedFlagHelper />
        </FramePanel>
      </Frame>

      <p>
        <TextLink kind="nav" href="/ask">
          Ask the evidence
        </TextLink>
      </p>

      <nav aria-label="Page" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <BackLink href={`/county/${county.id}`}>Back to {county.name}</BackLink>
        <TextLink kind="nav" href="/sources" className="type-caption">
          Sources and limitations
        </TextLink>
      </nav>
    </main>
  );
}

function GroupHead({
  id,
  title,
  note,
  noData = false,
  level = "h3",
}: {
  id?: string;
  title: string;
  note: string | null;
  noData?: boolean;
  level?: "h3" | "h4";
}) {
  const Heading = level;
  return (
    <div className="flex flex-col gap-1 px-3 pt-3 pb-3 sm:px-4">
      <Heading
        id={id}
        className={`flex flex-wrap items-center gap-2 ${level === "h3" ? "type-heading" : "font-sans text-sm font-semibold tracking-normal"}`}
      >
        {title}
        {noData ? (
          <StatusBadge status="no_data" size="xs">
            {STATUS_LABEL.no_data}
          </StatusBadge>
        ) : null}
      </Heading>
      {note ? <p className="max-w-[52rem] type-caption text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function SummaryGrid({ actions }: { actions: Evidence[] }) {
  return (
    <ul className="grid gap-1.5 md:grid-cols-2">
      {actions.map((action) => (
        <li key={action.id}>
          <ActionSummary action={action} />
        </li>
      ))}
    </ul>
  );
}
