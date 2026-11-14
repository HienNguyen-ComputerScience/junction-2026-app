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
  tone = "ink",
}: {
  label: string;
  children: ReactNode;
  /** `ink` for what the card argues from (the evidence); `quiet` for supporting context. */
  tone?: "ink" | "quiet";
}) {
  return (
    <div className="grid gap-x-4 gap-y-1 @md:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm leading-relaxed text-pretty tabular-nums ${tone === "ink" ? "text-foreground" : "text-muted-foreground"}`}
      >
        {children}
      </dd>
    </div>
  );
}

/** A plain text tag (stage, checked): the chip shape in the UI sans, so it never reads as a source. */
const TAG =
  "inline-flex h-6 w-fit shrink-0 items-center rounded-sm border border-input px-2 text-[0.75rem] leading-none font-medium text-foreground";

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
function FirstStep({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-input bg-muted px-4 py-3">
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
          <span className="text-muted-foreground">Stage:</span>
          <span className="font-medium text-foreground">{STAGE_LABELS[action.stage]}</span>
        </span>
        <span className="flex basis-full sm:ml-auto sm:basis-auto">
          <SourceMarks action={action} />
        </span>
      </div>

      <div className="mt-3 grid gap-x-10 gap-y-4 @3xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-[1.125rem] leading-[1.35] font-semibold tracking-[-0.01em] text-pretty">
              {action.action}
            </h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.detail}</p>
          </div>
          <FirstStep>{action.first_step}</FirstStep>
          <dl>
            <Field label="Owner">{action.who_implements}</Field>
          </dl>
        </div>

        <div className="flex flex-col gap-3 @3xl:pt-1">
          <dl className="flex flex-col gap-3">
            <Field label="Precedent" tone="quiet">
              {action.precedent}
            </Field>
            <Field label="Evidence">{action.effect_text}</Field>
          </dl>
          {/* One stack with one left edge, under the evidence text: the two disclosures, then
              the secondary action. */}
          <div className="flex flex-col items-start @md:pl-[7rem]">
            {/* NICE content may not be reproduced outside the UK: link only, never the quote. */}
            {action.source_id.startsWith("ev-nice") ? null : (
              <Disclosure summary="Quote and page in the source">
                <p className="mb-2 border-l-2 border-border pl-3 type-caption text-muted-foreground">
                  {action.quote_or_page}
                </p>
              </Disclosure>
            )}
            <Disclosure summary="Limitations">
              <p className="pb-2 text-sm leading-relaxed text-pretty text-muted-foreground">
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
      <h4 className="type-heading text-pretty">{action.action}</h4>
      <FirstStep compact>{action.first_step}</FirstStep>
      <dl className="mt-1">
        <Field label="Owner">{action.who_implements}</Field>
      </dl>
    </FramePanel>
  );
}
