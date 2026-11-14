import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel } from "@/components/ui/frame";
import { STAGE_LABELS } from "@/lib/act";
import type { Evidence } from "@/lib/data";

/** Label and value. Side by side when the card has room, stacked on a phone. */
function Field({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: ReactNode;
  /** The one line of a card that reads in the text colour (the evidence). */
  strong?: boolean;
}) {
  return (
    <div className="grid items-start gap-x-4 gap-y-1 @md:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm leading-relaxed text-pretty tabular-nums ${strong ? "text-foreground" : "text-muted-foreground"}`}
      >
        {children}
      </dd>
    </div>
  );
}

/** A plain text tag (step, checked): the chip shape in the UI sans, so it never reads as a source. */
const TAG =
  "inline-flex h-6 w-fit shrink-0 items-center rounded-sm border border-input px-2 text-[0.75rem] leading-none font-medium text-muted-foreground";

/** "Source checked" (the quiet provenance mark, solid: the team checked it) plus the source chip. */
function SourceMarks({ action }: { action: Evidence }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      {action.verified ? <Badge variant="checked">Source checked</Badge> : null}
      <SourceChip sourceId={action.source_id} />
    </span>
  );
}

/** The step to take first: the one emphasised block on a card. */
export function FirstStep({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-r-lg border-l-[3px] border-brand bg-muted px-4 py-3">
      <p className="type-caption font-medium text-muted-foreground">First step</p>
      <p
        className={
          compact
            ? "mt-1 text-sm leading-relaxed font-medium text-pretty text-foreground"
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

/** The precedent is one line (two at most) on the card; a longer text opens in full behind a disclosure. */
const PRECEDENT_LONG = 120;

/**
 * One recommended action from data/evidence.json, as a panel inside a Frame.
 * Label row: the action's place in the list, its pathway stage, and its checked source.
 * Left: what to do, the first step (the emphasised block) and who owns it. Right: precedent,
 * evidence and limitations. `children` render under the evidence (e.g. a live-evidence search).
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
  const stat = action.effect_size ? plainStat(action.effect_size) : null;
  return (
    <FramePanel
      padding="none"
      id={index !== undefined ? `action-${index}` : undefined}
      className="@container scroll-mt-20 px-4 py-4 sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {index !== undefined && (
          <span className="type-caption font-medium text-muted-foreground tabular-nums">
            Action {index}
          </span>
        )}
        <span className={`${TAG} gap-1`}>
          <span>Step:</span>
          <span>{STAGE_LABELS[action.stage]}</span>
        </span>
        <span className="flex basis-full sm:ml-auto sm:basis-auto">
          <SourceMarks action={action} />
        </span>
      </div>

      <div className="mt-3 grid gap-x-10 gap-y-4 @3xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-[1.625rem] leading-[1.2] font-semibold tracking-[-0.01em] text-pretty">
              {plainTitle(action.action)}
            </h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.detail}</p>
          </div>
          <FirstStep>{action.first_step}</FirstStep>
          <dl>
            <Field label="Owner">{action.who_implements}</Field>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="type-caption font-medium text-muted-foreground">Evidence</p>
            {stat && action.effect_size ? (
              <>
                <p className="numeral text-[1.5rem] leading-tight text-foreground">{stat}</p>
                <p className="type-caption text-pretty text-muted-foreground">{statisticLine(action.effect_size)}</p>
              </>
            ) : null}
            <p className="text-sm leading-relaxed text-pretty text-foreground tabular-nums">{action.effect_text}</p>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            <span className="font-medium">Precedent: </span>
            {action.precedent}
          </p>
          {/* One stack with one left edge: the disclosures, then the secondary action. */}
          <div className="flex flex-col items-start">
            {action.precedent.length > PRECEDENT_LONG ? (
              <Disclosure summary="Full precedent">
                <p className="pb-2 pl-[1.375rem] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {action.precedent}
                </p>
              </Disclosure>
            ) : null}
            {/* NICE content may not be reproduced outside the UK: link only, never the quote. */}
            {action.source_id.startsWith("ev-nice") ? null : (
              <Disclosure summary="Quote and page in the source">
                <p className="mb-2 ml-[1.375rem] border-l-2 border-border pl-3 type-caption text-muted-foreground">
                  {action.quote_or_page}
                </p>
              </Disclosure>
            )}
            <Disclosure summary="Limitations">
              <p className="pb-2 pl-[1.375rem] text-sm leading-relaxed text-pretty text-muted-foreground">
                {action.limitations}
              </p>
            </Disclosure>
            {children ? <div className="w-full pt-2">{children}</div> : null}
          </div>
        </div>
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
      <dl className="mt-1">
        <Field label="Owner">{action.who_implements}</Field>
      </dl>
    </FramePanel>
  );
}
