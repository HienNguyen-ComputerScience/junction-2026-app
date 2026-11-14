import { ArrowDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
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
import { STATUS_INK, StatusBadge } from "@/components/ui/status-badge";
import {
  SELECTION_RULE,
  STAGE_LABELS,
  bottleneckSentence,
  getBottleneck,
  otherActions,
  pickActions,
  type Bottleneck,
} from "@/lib/act";
import { counties, getCounty, type Evidence, type Gap, type Stage } from "@/lib/data";
import { formatPct, getIndicator, STATUS_LABEL } from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

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
  // The steps named in the summary sentence: the focus steps (worst first), then steps with no county value.
  const statGaps = [...bottleneck.focus, ...bottleneck.noData];

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      <header className="flex flex-col items-start gap-4">
        <BackLink href={`/county/${county.id}`}>Back to {county.name} pathway</BackLink>
        <div className="flex flex-col gap-2">
          <p className="type-caption text-muted-foreground">
            Path to early cancer care · {county.name_fi}
          </p>
          <h1 className="type-page">{county.name}: what to do next</h1>
        </div>
        {first ? (
          <div className="flex max-w-[50rem] flex-col items-start gap-3">
            <p className="type-lede text-pretty text-foreground">
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
          <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
            <p className="text-[0.9375rem] text-pretty text-foreground">{bottleneckLede(bottleneck)}</p>
            {bottleneck.focus.map((gap) => (
              <SourceChip key={gap.stage} sourceId={gap.source_id} year={gap.year} />
            ))}
          </div>
        </FrameHeader>
        <div
          role="list"
          className="flex flex-col gap-1.5 md:grid md:auto-cols-fr md:grid-flow-col md:grid-rows-[repeat(6,auto)] md:gap-y-0"
        >
          {statGaps.map((gap) => (
            <StageStat key={gap.stage} gap={gap} />
          ))}
          <StatPanel>
            <StatHead title={STAGE_LABELS.gp_recognition} status="no_data" />
            <NoFigure />
            <p className="mt-1.5 h-4 type-micro text-muted-foreground max-md:mt-3">
              No public data anywhere in Finland
            </p>
            <p className="mt-3 type-caption text-pretty text-muted-foreground">
              No statistic shows how often GPs spot possible cancer at the first visit, so nobody can see
              how this step performs.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <MeasureBar value={null} finland={null} status="no_data" />
              <p className="h-4 type-micro text-faint">No indicator, so nothing to draw</p>
            </div>
            <div className="mt-4">
              <a
                href="#red-flags"
                className="inline-flex h-9 items-center gap-1 rounded-sm type-caption font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-6"
              >
                The red-flag helper below supports it
                <ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />
              </a>
            </div>
          </StatPanel>
        </div>
        <FrameFooter className="flex flex-col gap-3 pt-4">
          <BarKey />
          <p className="max-w-[60rem] text-sm leading-relaxed text-pretty text-muted-foreground">
            {bottleneckSentence(county.name, bottleneck)}
          </p>
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

/**
 * A stat card. From md up the cards share six grid rows (head, figure, direction, caption, bar,
 * source), so every part sits at the same height in every card, whatever the caption length.
 */
function StatPanel({ children }: { children: ReactNode }) {
  return (
    <FramePanel role="listitem" className="flex flex-col md:row-span-6 md:grid md:grid-rows-subgrid">
      {children}
    </FramePanel>
  );
}

function StatHead({ title, status }: { title: string; status: Gap["status"] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 self-start">
      <h3 className="font-sans text-sm font-semibold tracking-normal">{title}</h3>
      <StatusBadge status={status} size="xs">
        {STATUS_LABEL[status]}
      </StatusBadge>
    </div>
  );
}

/**
 * The figure slot when there is no value: a dash, as statistics tables print it. It only holds
 * the row beside cards that have a figure, so a phone (one card per row) skips it.
 */
function NoFigure() {
  return (
    <p className="mt-4 numeral text-[2.5rem] text-faint max-md:hidden">
      <span aria-hidden>–</span>
      <span className="sr-only">No value</span>
    </p>
  );
}

/** Which way is better, from the indicator's direction. Referrals: a higher share is faster. */
function directionNote(gap: Gap): string | null {
  const direction = getIndicator(gap.indicator_id)?.direction;
  if (direction === "higher_is_worse") return "Lower is better";
  if (direction === "lower_is_worse") return gap.stage === "referral" ? "Higher is faster" : "Higher is better";
  return null;
}

/** One measured step: status, the number and which way is better, the bar against Finland, the source. */
function StageStat({ gap }: { gap: Gap }) {
  const direction = directionNote(gap);
  // The note starts with the figure shown above it ("67.8% of ..."), so the caption picks up after it.
  const prefix = gap.value !== null ? `${gap.value}% ` : null;
  const caption = prefix && gap.note.startsWith(prefix) ? gap.note.slice(prefix.length) : gap.note;
  return (
    <StatPanel>
      <StatHead title={STAGE_LABELS[gap.stage]} status={gap.status} />
      {gap.value !== null ? (
        <p className={`mt-4 numeral text-[2.5rem] ${STATUS_INK[gap.status]}`}>{formatPct(gap.value)}</p>
      ) : (
        <NoFigure />
      )}
      <p className={`mt-1.5 h-4 type-micro text-muted-foreground ${gap.value === null ? "max-md:mt-3" : ""}`}>
        {direction}
      </p>
      <p className="mt-3 type-caption text-pretty text-muted-foreground">{caption}</p>
      <MeasureBar
        className="mt-5"
        value={gap.value}
        finland={gap.national_value}
        finlandLabel={`Finland ${formatPct(gap.national_value)}`}
        status={gap.status}
      />
      <div className="mt-4">
        <SourceChip sourceId={gap.source_id} year={gap.year} />
      </div>
    </StatPanel>
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
