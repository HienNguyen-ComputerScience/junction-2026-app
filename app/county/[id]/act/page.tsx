import { ArrowDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";
import { notFound } from "next/navigation";

import { ActionCard, ActionSummary } from "@/components/act/action-card";
import { RedFlagHelper } from "@/components/act/red-flag-helper";
import { AskBox } from "@/components/exa/ask-box";
import { EvidenceFinder } from "@/components/exa/evidence-finder";
import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import { Disclosure } from "@/components/ui/disclosure";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { BarKey, MeasureBar } from "@/components/ui/measure-bar";
import { gapToFinland } from "@/components/ranking/ranking-list";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import {
  SELECTION_RULE,
  STAGE_LABELS,
  bottleneckSentence,
  getBottleneck,
  otherActions,
  pickActions,
  type Bottleneck,
} from "@/lib/act";
import { counties, getCounty, getGaps, type Evidence, type Gap, type Stage } from "@/lib/data";
import { formatPct, getIndicator, STATUS_LABEL } from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

/** The pathway, in order: the numbered steps on the county page. */
const PATHWAY: Stage[] = ["gp_access", "gp_recognition", "referral"];

/** Stages as they read inside a sentence. */
const STAGE_IN_SENTENCE: Record<Stage, string> = {
  gp_access: "getting in to see a GP",
  gp_recognition: "whether the GP recognises warning signs",
  referral: "the GP to specialist referral",
};

/** The one-line answer above the stat cards. The full summary sentence sits under them. */
function bottleneckLede(bottleneck: Bottleneck): string {
  const { focus, anyRed } = bottleneck;
  if (focus.length === 0) return "No 2025 pathway data is published for this county.";
  const worst = STAGE_IN_SENTENCE[focus[0].stage];
  if (!anyRed) return `No measured stage is worse than Finland. Closest to Finland's level: ${worst}.`;
  if (focus.length === 1) return `The delay sits at ${worst}, which is worse than Finland.`;
  return `${focus.length === 2 ? "Both" : "All"} measured stages are worse than Finland. Worst is ${worst}.`;
}

export default async function CountyActPage({ params }: PageProps<"/county/[id]/act">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const bottleneck = getBottleneck(county.id);
  const recommended = pickActions(bottleneck);
  const first = recommended.at(0);
  const others = otherActions(county.id, recommended);
  const unmeasured = others.filter((group) => group.unmeasured && group.stage !== "gp_recognition");
  const remaining = others.filter((group) => !unmeasured.includes(group));
  const otherCount = others.reduce((total, group) => total + group.actions.length, 0);
  // Every measured step of this county, drawn in pathway order below (display only: the
  // bottleneck and the picked actions above stay as computed).
  const stageGaps = getGaps(county.id);

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      {/* A 12-column grid: the title and the lede span nine, so the lede sets the measure. */}
      <header className="grid grid-cols-12 gap-x-6 gap-y-3">
        <BackLink href={`/county/${county.id}`} className="col-span-12">
          Back to {county.name} pathway
        </BackLink>
        <div className="col-span-12 flex flex-col gap-2 lg:col-span-9">
          <p className="type-caption text-balance text-muted-foreground">
            Path to early cancer care
            <span className="max-sm:hidden"> · </span>
            <span className="max-sm:block">{county.name_fi}</span>
          </p>
          <h1 className="type-page">{county.name}: what to do next</h1>
        </div>
        {first ? (
          <div className="col-span-12 flex flex-col items-start gap-3 pt-1 lg:col-span-9">
            <p className="type-lede text-pretty text-foreground lg:text-[1.375rem] lg:leading-8">
              <span className="text-muted-foreground">Start here: </span>
              {first.first_step}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="#action-1"
                className="inline-flex h-9 items-center gap-1.5 rounded-sm text-sm font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Action 1 below
                <ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />
              </Link>
              <SourceChip sourceId={first.source_id} />
            </div>
          </div>
        ) : null}
      </header>

      <Frame aria-labelledby="where-heading">
        <FrameHeader>
          <FrameTitle id="where-heading" className="type-title">
            Where the delay sits
          </FrameTitle>
          <p className="col-span-2 pt-1 text-[0.9375rem] text-pretty text-foreground">
            {bottleneckLede(bottleneck)}
          </p>
        </FrameHeader>
        {/* One stat strip: the steps in pathway order, as on the county page. From md up the
            columns share six grid rows, so every part sits on the same line in every column. */}
        <FramePanel
          padding="none"
          role="list"
          className="flex flex-col divide-y divide-border md:grid md:auto-cols-fr md:grid-flow-col md:grid-rows-[repeat(6,auto)] md:divide-x md:divide-y-0"
        >
          {PATHWAY.map((stage, i) =>
            stage === "gp_recognition" ? (
              <RecognitionStat key={stage} step={i + 1} />
            ) : (
              stageGaps
                .filter((gap) => gap.stage === stage)
                .map((gap) => <StageStat key={stage} step={i + 1} gap={gap} />)
            ),
          )}
        </FramePanel>
        <FrameFooter className="flex flex-col gap-2 pt-4">
          <BarKey />
          {/* The full summary, data-derived, for reading without the chart. */}
          <Disclosure summary="Read as text">
            <p className="max-w-[60rem] pt-1 pb-1 text-sm leading-relaxed text-pretty text-muted-foreground">
              {bottleneckSentence(county.name, bottleneck)}
            </p>
          </Disclosure>
        </FrameFooter>
      </Frame>

      <Frame aria-labelledby="recommended">
        <FrameHeader>
          <FrameTitle id="recommended" className="type-title">
            Recommended actions
          </FrameTitle>
          <FrameDescription className="max-w-[52rem]">{SELECTION_RULE}</FrameDescription>
        </FrameHeader>
        <div className="flex flex-col gap-1.5">
          {recommended.map((action, index) => (
            <ActionCard key={action.id} action={action} index={index + 1}>
              <EvidenceFinder actionId={action.id} actionTitle={action.action} />
            </ActionCard>
          ))}
        </div>

        {otherCount > 0 ? (
          <Disclosure
            className="mt-1.5"
            summaryClassName="min-h-11 w-full gap-2 rounded-panel px-3 hover:no-underline sm:px-4"
            summary={
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className="text-sm font-medium text-foreground hover:underline hover:underline-offset-4">
                  <span className="group-open/disc:hidden">Show</span>
                  <span className="hidden group-open/disc:inline">Hide</span> {otherCount} other
                  evidence-backed {otherCount === 1 ? "option" : "options"}
                </span>
                <span className="type-micro font-normal text-muted-foreground">
                  Not picked for {county.name}, grouped by stage
                </span>
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
          <FrameDescription className="max-w-[52rem]">
            Supports the &ldquo;GP recognises warning signs&rdquo; step: a concern in, the warning-sign
            category and the fastest referral route out, with the guideline to check.
          </FrameDescription>
        </FrameHeader>
        <FramePanel padding="lg">
          <RedFlagHelper />
        </FramePanel>
      </Frame>

      <Frame aria-labelledby="ask-heading">
        <FrameHeader>
          <FrameTitle id="ask-heading" className="type-title">
            Ask the evidence, answered live from Exa search results
          </FrameTitle>
        </FrameHeader>
        <AskBox />
      </Frame>

      <nav aria-label="Page" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <BackLink href={`/county/${county.id}`}>Back to {county.name} pathway</BackLink>
        <Link
          href="/sources"
          className="inline-flex h-9 items-center rounded-sm type-caption font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Sources and limitations
        </Link>
      </nav>
    </main>
  );
}

/** The step number, drawn like the county page's pathway nodes. */
const STEP_MARK: Record<Gap["status"], string> = {
  // Dark ink on the saturated fills: 5.0:1 on red, 9.7:1 on amber.
  red: "bg-status-red text-background",
  amber: "bg-status-amber text-background",
  no_data: "border border-dashed border-status-grey-ink/60 bg-card text-status-grey-ink",
};

/**
 * One column of the stat strip. From md up the columns share six grid rows (head, figure,
 * comparison, caption, bar, source), so every part sits at the same height in every column.
 */
function StatColumn({ children }: { children: ReactNode }) {
  return (
    <div role="listitem" className="flex min-w-0 flex-col px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 md:row-span-6 md:grid md:grid-rows-subgrid">
      {children}
    </div>
  );
}

/** Step mark, step name, and the status under the name. */
function StatHead({ step, title, status }: { step: number; title: string; status: Gap["status"] }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums",
          STEP_MARK[status],
        )}
      >
        {step}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h3 className="font-heading text-base leading-7 font-semibold tracking-normal text-pretty">
          <span className="sr-only">Step {step}: </span>
          {title}
        </h3>
        <StatusBadge status={status} size="xs">
          {STATUS_LABEL[status]}
        </StatusBadge>
      </div>
    </div>
  );
}

/** In the figure's place when there is no value: a plain statement, never a dash. */
function NoFigure({ children }: { children: ReactNode }) {
  return (
    <p className="pt-5 text-[0.9375rem] leading-snug text-pretty text-muted-foreground md:self-end">
      {children}
    </p>
  );
}

/** Which way is better, from the indicator's direction. Referrals: a higher share is faster. */
function directionNote(gap: Gap): string | null {
  const direction = getIndicator(gap.indicator_id)?.direction;
  if (direction === "higher_is_worse") return "lower is better";
  if (direction === "lower_is_worse") return gap.stage === "referral" ? "higher is faster" : "higher is better";
  return null;
}

/**
 * One measured step: the figure and its gap to Finland, the caption, the bar against Finland,
 * the source. Without a county value: a statement, the note, and the hatched track.
 */
function StageStat({ step, gap }: { step: number; gap: Gap }) {
  const direction = directionNote(gap);
  // The note starts with the figure shown above it ("67.8% of ..."), so the caption picks up after it.
  const prefix = gap.value !== null ? `${gap.value}% ` : null;
  const caption = prefix && gap.note.startsWith(prefix) ? gap.note.slice(prefix.length) : gap.note;
  return (
    <StatColumn>
      <StatHead step={step} title={STAGE_LABELS[gap.stage]} status={gap.status} />
      {gap.value !== null ? (
        <>
          <p className={cn("pt-5 numeral text-[2.75rem] sm:text-[3rem]", STATUS_FIGURE[gap.status])}>
            {formatPct(gap.value)}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 pt-2.5 type-note text-muted-foreground">
            <span className={cn("figure font-medium", STATUS_FIGURE[gap.status])}>
              {gapToFinland(gap.value, gap.national_value)}
            </span>
            <span>
              vs Finland{direction ? `, ${direction}` : null}
            </span>
          </p>
        </>
      ) : (
        <>
          <NoFigure>No published value for this area</NoFigure>
          <span aria-hidden className="max-md:hidden" />
        </>
      )}
      <p className="pt-3 type-caption text-pretty text-muted-foreground">{caption}</p>
      <MeasureBar
        className="pt-5 md:self-end"
        value={gap.value}
        finland={gap.national_value}
        finlandLabel={`Finland ${formatPct(gap.national_value)}`}
        status={gap.status}
      />
      <div className="pt-4">
        <SourceChip sourceId={gap.source_id} year={gap.year} />
      </div>
    </StatColumn>
  );
}

/** The step no statistic measures anywhere: the same rows, with the red-flag helper in the source row. */
function RecognitionStat({ step }: { step: number }) {
  return (
    <StatColumn>
      <StatHead step={step} title={STAGE_LABELS.gp_recognition} status="no_data" />
      <NoFigure>No public data anywhere in Finland</NoFigure>
      <span aria-hidden className="max-md:hidden" />
      <p className="pt-3 type-caption text-pretty text-muted-foreground">
        No statistic shows how often GPs spot possible cancer at the first visit, so nobody can see how
        this step performs.
      </p>
      <div className="flex flex-col gap-2 pt-5 md:self-end">
        <MeasureBar value={null} finland={null} status="no_data" />
        <p className="h-4 type-note text-muted-foreground">No indicator, so nothing to draw</p>
      </div>
      <div className="pt-4">
        <a
          href="#red-flags"
          className="inline-flex h-9 items-center gap-1 rounded-sm type-caption font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-6"
        >
          The red-flag helper below supports it
          <ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />
        </a>
      </div>
    </StatColumn>
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
