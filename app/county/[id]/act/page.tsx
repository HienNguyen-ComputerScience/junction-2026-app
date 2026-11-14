import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActionSummary } from "@/components/act/action-card";
import { ActionItem } from "@/components/act/action-item";
import { ReferralRoutes } from "@/components/act/referral-routes";
import { EvidenceFinder } from "@/components/exa/evidence-finder";
import { BackLink } from "@/components/ui/back-link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Disclosure, PrintButton, Reveal } from "@/components/motion";
import { buttonVariants } from "@/components/ui/button";
import { Frame, FrameHeader, FrameTitle } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { STAGE_LABELS, bottleneckLede, getBottleneck, otherActions, pickActions, type Bottleneck } from "@/lib/act";
import { plainTitle } from "@/lib/action-title";
import { counties, getCounty, type Evidence, type Stage } from "@/lib/data";
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

/** Each pathway step in words that fit inside a sentence. */
const STEP_PHRASE: Record<Stage, string> = {
  gp_access: "getting to a GP",
  gp_recognition: "the GP recognising warning signs",
  referral: "referral from the GP to a specialist",
};

/**
 * Why an action is on this county's list, in one line, from the same bottleneck that picked it
 * (lib/act). Nothing is added that the selection rule does not say.
 */
function whyHere(action: Evidence, bottleneck: Bottleneck, countyName: string): string {
  const { focus, anyRed } = bottleneck;
  const step = STEP_PHRASE[action.stage];
  if (!anyRed) return `It works on ${step}, the step where ${countyName} is closest to falling below Finland's level.`;
  const position = focus.findIndex((gap) => gap.stage === action.stage);
  if (position === 0) {
    return focus.length > 1
      ? `It works on ${step}, the step where ${countyName} is furthest behind Finland.`
      : `It works on ${step}, the step where ${countyName} is worse than Finland.`;
  }
  return `It works on ${step}, which is also worse than Finland in ${countyName}.`;
}

/** Steps with no county figure (the HUS-wide referral values in Uusimaa), said once, always visible. */
function unmeasuredNotes(bottleneck: Bottleneck, countyName: string): string[] {
  return bottleneck.noData.map((gap) =>
    gap.shared
      ? `For ${STEP_PHRASE[gap.stage]}, Sotkanet publishes only a ${gap.shared.name}-wide figure, not one for ${countyName}, so that step is not used to pick these actions.`
      : `There is no ${countyName} figure for ${STEP_PHRASE[gap.stage]}, so that step is not used to pick these actions.`,
  );
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
  const planHref = `/county/${county.id}/plan?actions=${recommended.map((action) => action.id).join(",")}`;
  const count = recommended.length;
  const notes = unmeasuredNotes(bottleneck, county.name);

  return (
    <main className="page-container flex flex-col gap-10 pt-4 sm:pt-6">
      <header className="flex flex-col items-start gap-3">
        <Breadcrumb
          items={[{ label: "Areas", href: "/" }, { label: county.name, href: `/county/${county.id}` }, { label: "Actions" }]}
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-balance text-muted-foreground">
            Path to early cancer care
            <span className="max-sm:hidden"> · </span>
            <span className="max-sm:block">{county.name_fi}</span>
          </p>
          <h1 className="type-page">{county.name}: what to do next</h1>
        </div>
        <p className="type-lede max-w-[62ch] text-pretty text-foreground">
          {bottleneckLede(bottleneck)}{" "}
          {count > 0
            ? `Here ${count === 1 ? "is the action" : `are the ${count} actions`} we recommend for it, with who does each and why.`
            : "No action is picked for this area, so all the evidence-backed options are listed below."}
        </p>
        {notes.map((note) => (
          <p key={note} className="max-w-[62ch] text-base text-pretty text-muted-foreground">
            {note}
          </p>
        ))}
        {count > 0 ? (
          <div data-print="hide" className="flex flex-col items-start gap-2 pt-2">
            <div className="flex flex-wrap gap-2.5">
              <Link href={planHref} className={buttonVariants({ size: "lg" })}>
                Make the action plan for the board
                <ArrowRight aria-hidden data-icon="inline-end" />
              </Link>
              <PrintButton variant="outline" size="lg" />
            </div>
            <p className="max-w-[62ch] text-base text-pretty text-muted-foreground">
              The plan has these {count} actions filled in. You add the responsible person, a review date and the cost, then
              print it or download it for Word or Excel.
            </p>
          </div>
        ) : null}
      </header>

      <section aria-labelledby="recommended" className="flex flex-col gap-4">
        {count > 0 ? (
          <>
            <div className="flex flex-col gap-1">
              <h2 id="recommended" className="type-title">
                {bottleneck.anyRed ? "Recommended actions" : "Actions to keep this level"}
              </h2>
              <p className="text-base text-pretty text-muted-foreground">
                {bottleneck.anyRed ? "In order of where the pathway breaks." : "In order of closeness to Finland's level."}{" "}
                Each one opens to the first step, where it was done, its source and its limits.
              </p>
            </div>
            {/* Every recommended action in order, numbered, one under the other. */}
            <ol aria-label={`Recommended actions for ${county.name}`} className="flex flex-col gap-4">
              {recommended.map((action, index) => (
                <Reveal as="li" key={action.id} index={index} className="print-flow">
                  <ActionItem action={action} index={index + 1} why={whyHere(action, bottleneck, county.name)} />
                </Reveal>
              ))}
            </ol>
            <div data-print="hide" className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:gap-4">
              <Link href={planHref} className={buttonVariants({ size: "lg" })}>
                Make the action plan for the board
                <ArrowRight aria-hidden data-icon="inline-end" />
              </Link>
              <p className="text-base text-muted-foreground">With these {count} actions, ready to print or download.</p>
            </div>
          </>
        ) : (
          <h2 id="recommended" className="type-title">
            Evidence-backed options
          </h2>
        )}

        {otherCount > 0 ? (
          <Frame aria-labelledby="other-options" className="mt-2">
            <FrameHeader>
              <FrameTitle id="other-options" className="type-title">
                Other options
              </FrameTitle>
              <p className="col-span-2 max-w-[68ch] text-base text-pretty text-muted-foreground">
                {otherCount} more evidence-backed {otherCount === 1 ? "action" : "actions"}, for steps not picked here or not
                measured in {county.name}.
              </p>
            </FrameHeader>
            <Disclosure
              className="px-1"
              defaultOpen={count === 0}
              label={`the ${otherCount} other ${otherCount === 1 ? "option" : "options"}`}
            >
              <div className="flex flex-col gap-1.5">
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

                {remaining.map((group) => (
                  <section key={group.stage} aria-labelledby={`other-${group.stage}`}>
                    <GroupHead
                      id={`other-${group.stage}`}
                      title={STAGE_LABELS[group.stage]}
                      note={group.unmeasured}
                      noData={group.unmeasured !== null}
                    />
                    <SummaryGrid actions={group.actions} />
                  </section>
                ))}
              </div>
            </Disclosure>
          </Frame>
        ) : null}
      </section>

      <Reveal>
        <Frame aria-labelledby="referral-routes">
          <FrameHeader>
            <FrameTitle id="referral-routes" className="type-title scroll-mt-24">
              The four referral routes a county needs
            </FrameTitle>
            <p className="col-span-2 max-w-[68ch] text-base text-pretty text-muted-foreground">
              Does {county.name} have a written route for each: fast track, vague-symptoms work-up, GP check within two
              weeks, and safety-net recheck? Decision support for the county, not diagnosis.
            </p>
          </FrameHeader>
          <Disclosure className="px-1" label="the four routes">
            <ReferralRoutes />
          </Disclosure>
        </Frame>
      </Reveal>

      {count > 0 ? (
        <div data-print="hide">
          <Reveal>
            <Frame aria-labelledby="web-search">
              <FrameHeader>
                <FrameTitle id="web-search" className="type-title">
                  Search the web for newer studies
                </FrameTitle>
                <p className="col-span-2 max-w-[68ch] text-base text-pretty text-muted-foreground">
                  The evidence above was checked by our team. A web search can find newer studies on each action; those
                  results are not checked.
                </p>
              </FrameHeader>
              <Disclosure className="px-1" label="the web search for each action">
                <ol className="flex flex-col gap-5">
                  {recommended.map((action, index) => (
                    <li key={action.id} className="flex flex-col gap-2">
                      <h3 className="type-heading text-pretty">
                        Action {index + 1}: {plainTitle(action.action)}
                      </h3>
                      <EvidenceFinder actionId={action.id} actionTitle={action.action} />
                    </li>
                  ))}
                </ol>
              </Disclosure>
            </Frame>
          </Reveal>
        </div>
      ) : null}

      <nav aria-label="Page" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <BackLink href={`/county/${county.id}`}>Back to {county.name}</BackLink>
        <span className="flex flex-wrap gap-x-6 gap-y-2">
          <TextLink kind="nav" href="/ask" className="text-base">
            Ask the evidence
          </TextLink>
          <TextLink kind="nav" href="/sources" className="text-base">
            Sources and limitations
          </TextLink>
        </span>
      </nav>
    </main>
  );
}

function GroupHead({ id, title, note, noData = false }: { id: string; title: string; note: string | null; noData?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-3 pt-3 pb-3 sm:px-4">
      <h3 id={id} className="type-heading flex flex-wrap items-center gap-2">
        {title}
        {noData ? (
          <StatusBadge status="no_data" size="xs">
            {STATUS_LABEL.no_data}
          </StatusBadge>
        ) : null}
      </h3>
      {note ? <p className="max-w-[52rem] text-base text-pretty text-muted-foreground">{note}</p> : null}
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
