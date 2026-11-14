import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionCard } from "@/components/act/action-card";
import { RedFlagHelper } from "@/components/act/red-flag-helper";
import { AskBox } from "@/components/exa/ask-box";
import { EvidenceFinder } from "@/components/exa/evidence-finder";
import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FrameMeta,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { MeasureBar } from "@/components/ui/measure-bar";
import { STATUS_INK, StatusBadge } from "@/components/ui/status-badge";
import {
  SELECTION_RULE,
  STAGE_LABELS,
  bottleneckSentence,
  getBottleneck,
  otherActions,
  pickActions,
} from "@/lib/act";
import { counties, getCounty, type Evidence, type Gap } from "@/lib/data";
import { formatPct, getIndicator, STATUS_LABEL } from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
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
      </header>

      <Frame aria-labelledby="where-heading">
        <FrameHeader>
          <FrameTitle id="where-heading" className="type-title">
            Where the delay sits
          </FrameTitle>
          <FrameMeta className="hidden sm:flex">
            <span aria-hidden className="h-3.5 w-0.5 bg-foreground" />
            Line on each bar: Finland&apos;s value
          </FrameMeta>
          <FrameDescription className="max-w-[52rem]">
            {bottleneckSentence(county.name, bottleneck)}
          </FrameDescription>
          <div className="col-span-2 flex flex-wrap gap-2 pt-1">
            {bottleneck.focus.map((gap) => (
              <SourceChip key={gap.stage} sourceId={gap.source_id} year={gap.year} />
            ))}
          </div>
        </FrameHeader>
        <ul className="flex flex-col gap-1.5 md:flex-row">
          {statGaps.map((gap) => (
            <li key={gap.stage} className="flex md:flex-1 md:basis-0">
              <StageStat gap={gap} />
            </li>
          ))}
          <li className="flex md:flex-1 md:basis-0">
            <FramePanel className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-sans text-sm font-semibold tracking-normal">
                  {STAGE_LABELS.gp_recognition}
                </h3>
                <StatusBadge status="no_data" size="xs">
                  {STATUS_LABEL.no_data}
                </StatusBadge>
              </div>
              <p className="text-sm text-pretty text-muted-foreground">
                No public data anywhere in Finland.
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-1">
                <MeasureBar value={null} finland={null} status="no_data" />
                <p aria-hidden className="type-mark text-muted-foreground">
                  No indicator, so nothing to draw
                </p>
              </div>
            </FramePanel>
          </li>
        </ul>
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
      </Frame>

      {unmeasured.length > 0 || remaining.length > 0 ? (
        <details className="group/disc rounded-frame border border-frame-border bg-frame p-1.5">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-panel px-3 type-heading outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-4">
            <ChevronRight
              aria-hidden
              strokeWidth={1.75}
              className="size-[1.125rem] shrink-0 text-muted-foreground transition-transform duration-150 group-open/disc:rotate-90"
            />
            Show {otherCount} other evidence-backed {otherCount === 1 ? "option" : "options"}
          </summary>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {unmeasured.map((group) => (
              <FramePanel
                role="region"
                key={group.stage}
                className="flex flex-col gap-3"
                aria-labelledby={`unmeasured-${group.stage}`}
              >
                <div className="flex flex-col gap-1">
                  <h2 id={`unmeasured-${group.stage}`} className="type-heading">
                    {STAGE_LABELS[group.stage]}: can&apos;t be measured here yet
                  </h2>
                  <p className="type-caption text-muted-foreground">
                    {group.unmeasured} These actions still apply if the county finds a delay at this step.
                  </p>
                </div>
                <CompactList actions={group.actions} />
              </FramePanel>
            ))}

            {remaining.length > 0 ? (
              <FramePanel role="region" className="flex flex-col gap-5" aria-labelledby="other">
                <h2 id="other" className="type-heading">
                  Other options for this county
                </h2>
                {remaining.map((group) => (
                  <div key={group.stage} className="flex flex-col gap-2">
                    <h3 className="flex flex-wrap items-center gap-2 font-sans text-sm font-semibold tracking-normal">
                      {STAGE_LABELS[group.stage]}
                      {group.unmeasured ? (
                        <StatusBadge status="no_data" size="xs">
                          {STATUS_LABEL.no_data}
                        </StatusBadge>
                      ) : null}
                    </h3>
                    {group.unmeasured ? (
                      <p className="type-caption text-muted-foreground">{group.unmeasured}</p>
                    ) : null}
                    <CompactList actions={group.actions} />
                  </div>
                ))}
              </FramePanel>
            ) : null}
          </div>
        </details>
      ) : null}

      <Frame aria-labelledby="red-flags">
        <FrameHeader>
          <FrameTitle id="red-flags" className="type-title">
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

/** One measured step as a compact stat: status, the number, the bar against Finland, the source. */
function StageStat({ gap }: { gap: Gap }) {
  const indicator = getIndicator(gap.indicator_id);
  return (
    <FramePanel className="flex flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-sans text-sm font-semibold tracking-normal">{STAGE_LABELS[gap.stage]}</h3>
        <StatusBadge status={gap.status} size="xs">
          {STATUS_LABEL[gap.status]}
        </StatusBadge>
      </div>
      {gap.value !== null ? (
        <div className="flex flex-col gap-2">
          <span className={`numeral text-[2.5rem] ${STATUS_INK[gap.status]}`}>{formatPct(gap.value)}</span>
          {indicator && (
            <span className="type-caption text-muted-foreground">
              {indicator.short_name}, {gap.year}
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-pretty text-muted-foreground">{gap.note}</p>
      )}
      <div className="mt-auto flex flex-col gap-3 pt-1">
        <MeasureBar
          value={gap.value}
          finland={gap.national_value}
          finlandLabel={`Finland ${formatPct(gap.national_value)}`}
          status={gap.status}
        />
        <SourceChip sourceId={gap.source_id} year={gap.year} />
      </div>
    </FramePanel>
  );
}

function CompactList({ actions }: { actions: Evidence[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border/80 rounded-lg border border-border text-sm">
      {actions.map((action) => (
        <li key={action.id} className="flex flex-col gap-2 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <span className="font-semibold">{action.action}</span>
            <SourceChip sourceId={action.source_id} />
          </div>
          <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
            <dt className="type-caption text-muted-foreground">Owner</dt>
            <dd className="text-pretty">{action.who_implements}</dd>
            <dt className="type-caption text-muted-foreground max-sm:mt-1">First step</dt>
            <dd className="font-medium text-pretty">{action.first_step}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
