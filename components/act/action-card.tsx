import type { ReactNode } from "react";

import { OwnerRow } from "@/components/act/owner-row";
import { SourceChip, sourceLabel } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel } from "@/components/ui/frame";
import { STAGE_LABELS } from "@/lib/act";
import { getSource, type Evidence } from "@/lib/data";

/** The evidence source's name as plain text, for the one "Owner … · Evidence …" line. */
function evidenceName(action: Evidence): string {
  const source = getSource(action.source_id);
  return source ? sourceLabel(source) : action.source_id;
}

/** A plain text tag (step, checked): the chip shape in the UI sans, so it never reads as a source. */
const TAG =
  "inline-flex h-6 w-fit shrink-0 items-center rounded-sm border border-input px-2 text-[0.75rem] leading-none font-medium text-muted-foreground";

/** "Source checked" (the quiet provenance mark, solid: the team checked it) plus the source chip. */
function SourceMarks({ action }: { action: Evidence }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
      {action.verified ? <Badge variant="checked">Source checked</Badge> : null}
      <SourceChip sourceId={action.source_id} />
    </span>
  );
}

/** The step to take first: the one emphasised block on a card. */
export function FirstStep({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-r-lg border-l-[3px] border-brand bg-muted px-4 py-2.5">
      <p className="type-caption font-medium text-muted-foreground">First step</p>
      <p
        className={
          compact
            ? "mt-0.5 text-sm leading-relaxed font-medium text-pretty text-foreground"
            : "mt-1 text-base leading-[1.5] font-medium text-pretty text-foreground"
        }
      >
        {children}
      </p>
    </div>
  );
}

/** An action title without its trailing full stop (stripped at render; the data keeps its text). */
export const plainTitle = (title: string) => title.replace(/\.+\s*$/, "");

type Effect = NonNullable<Evidence["effect_size"]>;

const rounded = (n: number) => String(Math.round(n * 10) / 10);

/**
 * The measured figure in plain words, read from the data's own value, unit and metric. Only
 * the combinations whose direction and meaning the fields state outright are turned into
 * words; anything else gets no big stat (the evidence sentence still says it).
 */
export function plainStat({ value, unit, metric }: Effect): string | null {
  if (unit === "odds ratio" && /^mortality/.test(metric) && value > 0 && value < 1) {
    return `${rounded((1 - value) * 100)}% lower odds of dying`;
  }
  if (unit === "days" && /^median diagnostic interval/.test(metric) && value < 0) {
    return `Diagnosis ${rounded(Math.abs(value))} days faster`;
  }
  if (unit === "days" && /^median specialist response time/.test(metric) && value > 0) {
    return `Specialist reply in ${rounded(value)} days`;
  }
  if (unit === "%" && /judged safe/.test(metric) && value >= 0 && value <= 100) {
    return `${rounded(value)}% judged safe`;
  }
  if (unit === "%" && /^referral quality score/.test(metric) && value > 0) {
    return `${rounded(value)}% higher referral quality`;
  }
  if (unit === "%" && /^conversion rate/.test(metric) && value >= 0 && value <= 100) {
    return `${rounded(value)}% of referrals ended in a cancer diagnosis`;
  }
  return null;
}

/** The statistic as the data states it, for the caption under the plain-words stat. */
function statisticLine({ value, unit, metric }: Effect): string {
  const number = value < 0 ? `−${Math.abs(value)}` : String(value);
  const figure = unit === "%" ? `${number}%` : unit === "odds ratio" ? `odds ratio ${number}` : `${number} ${unit}`;
  return `${figure}, ${metric}`;
}

/**
 * The evidence headline of an action: the figure in plain words (24px) or, where the data has
 * none the words can state outright, the evidence sentence itself in two lines. `children`
 * (the source chip) follow it, so the number never stands without its source.
 */
function EvidenceStat({ action, children }: { action: Evidence; children?: ReactNode }) {
  const stat = action.effect_size ? plainStat(action.effect_size) : null;
  return (
    <div className="flex flex-col gap-1">
      {stat ? (
        <p className="numeral text-[1.5rem] leading-tight text-foreground">{stat}</p>
      ) : (
        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-foreground tabular-nums">
          {action.effect_text}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * One recommended action from data/evidence.json, as a panel inside a Frame. Collapsed it shows
 * the action, its First step, one muted "Owner … · Evidence …" line and the evidence headline
 * with its source; the description, the evidence sentence, the precedent, the original
 * statistic and the limitations are behind "Evidence details". `children` sit on the
 * disclosure's row (e.g. a live-evidence search).
 */
export function ActionCard({
  action,
  index,
  children,
}: {
  action: Evidence;
  /** 1-based position in the list of recommended actions. */
  index?: number;
  children?: ReactNode;
}) {
  return (
    <FramePanel
      padding="none"
      id={index !== undefined ? `action-${index}` : undefined}
      className="@container scroll-mt-20 px-4 py-3.5 sm:px-6"
    >
      <div className="grid gap-x-10 gap-y-2.5 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[1.5rem] leading-[1.2] font-semibold tracking-[-0.01em] text-pretty">
            {plainTitle(action.action)}
          </h3>
          <FirstStep compact>{action.first_step}</FirstStep>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {index !== undefined && (
              <span className="type-caption font-medium text-muted-foreground tabular-nums">Action {index}</span>
            )}
            <span className={`${TAG} gap-1`}>
              <span>Step:</span>
              <span>{STAGE_LABELS[action.stage]}</span>
            </span>
          </div>
          <EvidenceStat action={action}>
            <SourceMarks action={action} />
          </EvidenceStat>
          {/* One row: the one disclosure, then the secondary action. */}
          <div className="flex flex-wrap items-start gap-x-4 gap-y-1 [&>section]:w-auto [&>section]:min-w-0 [&>section]:flex-1">
            <Disclosure summary="Evidence details">
              <div className="flex flex-col gap-3 pb-2 pl-[1.375rem]">
                <div className="flex flex-col gap-1">
                  <p className="type-caption font-medium text-muted-foreground">What to do</p>
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.detail}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="type-caption font-medium text-muted-foreground">Evidence</p>
                  <p className="text-sm leading-relaxed text-pretty text-foreground tabular-nums">
                    {action.effect_text}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="type-caption font-medium text-muted-foreground">Precedent</p>
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.precedent}</p>
                </div>
                {action.effect_size || !action.source_id.startsWith("ev-nice") ? (
                  <div className="flex flex-col gap-1">
                    <p className="type-caption font-medium text-muted-foreground">Quote and page in the source</p>
                    {action.effect_size ? (
                      <p className="type-caption text-pretty text-muted-foreground">
                        Original statistic: {statisticLine(action.effect_size)}
                      </p>
                    ) : null}
                    {/* NICE content may not be reproduced outside the UK: link only, never the quote. */}
                    {action.source_id.startsWith("ev-nice") ? null : (
                      <p className="border-l-2 border-border pl-3 type-caption text-muted-foreground">
                        {action.quote_or_page}
                      </p>
                    )}
                  </div>
                ) : null}
                <div className="flex flex-col gap-1">
                  <p className="type-caption font-medium text-muted-foreground">Limitations</p>
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.limitations}</p>
                </div>
              </div>
            </Disclosure>
            {children}
          </div>
        </div>

        <OwnerRow owner={action.who_implements} evidence={evidenceName(action)} className="@3xl:col-span-2" />
      </div>
    </FramePanel>
  );
}

/**
 * The compact form of an action card, for the options not picked for this county: the checked
 * source, the action, its first step and its owner.
 */
export function ActionSummary({ action }: { action: Evidence }) {
  return (
    <FramePanel padding="none" className="@container flex h-full flex-col gap-3 px-4 py-4 sm:px-5">
      <SourceMarks action={action} />
      <h4 className="type-heading text-pretty">{plainTitle(action.action)}</h4>
      <FirstStep compact>{action.first_step}</FirstStep>
      <OwnerRow owner={action.who_implements} />
    </FramePanel>
  );
}
