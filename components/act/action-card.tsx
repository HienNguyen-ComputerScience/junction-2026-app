import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel } from "@/components/ui/frame";
import { STAGE_LABELS } from "@/lib/act";
import type { Evidence } from "@/lib/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed text-pretty">{children}</dd>
    </div>
  );
}

/**
 * One recommended action from data/evidence.json, as a panel inside a Frame.
 * Left: what to do and the first step (the one highlighted block). Right: who, precedent,
 * evidence and limitations. `children` render in a footer row (e.g. a live-evidence panel).
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
    <FramePanel padding="none" className="@container">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/80 px-4 py-2.5 sm:px-6">
        {index !== undefined && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[0.75rem] font-semibold text-background tabular-nums">
            <span className="sr-only">Action </span>
            {index}
          </span>
        )}
        <span className="type-caption font-medium">{STAGE_LABELS[action.stage]}</span>
        <span className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">
          {/* Phone: the chip first, then a bare "Checked", so both fit on one line. */}
          {action.verified ? (
            <Badge
              variant="outline"
              className="gap-1 max-sm:order-last max-sm:h-7 max-sm:border-transparent max-sm:bg-transparent max-sm:px-0"
            >
              <BadgeCheck aria-hidden className="size-3.5!" />
              <span aria-hidden className="sm:hidden">
                Checked
              </span>
              <span className="max-sm:sr-only">Source checked</span>
            </Badge>
          ) : null}
          <SourceChip sourceId={action.source_id} />
        </span>
      </div>

      <div className="grid gap-x-10 gap-y-6 px-4 py-5 sm:px-6 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="type-title text-pretty">{action.action}</h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{action.detail}</p>
          </div>
          <div className="rounded-lg border border-brand/15 bg-brand-soft px-4 py-3">
            <p className="type-micro font-semibold text-brand-ink">First step</p>
            <p className="mt-1 text-[0.9375rem] leading-normal font-medium text-pretty">{action.first_step}</p>
          </div>
        </div>

        <dl className="flex flex-col gap-3.5">
          <Field label="Owner">{action.who_implements}</Field>
          <Field label="Precedent">{action.precedent}</Field>
          <Field label="Evidence">
            {action.effect_text}
            {/* NICE content may not be reproduced outside the UK: link only, never the quote. */}
            {action.source_id.startsWith("ev-nice") ? null : (
              <Disclosure summary="Quote and page in the source" summaryClassName="min-h-8">
                <p className="mb-1 border-l-2 border-border pl-3 type-caption text-muted-foreground">
                  {action.quote_or_page}
                </p>
              </Disclosure>
            )}
          </Field>
          <Field label="Limitations">{action.limitations}</Field>
        </dl>
      </div>

      {children ? <div className="border-t border-border/80 px-4 py-3 sm:px-6">{children}</div> : null}
    </FramePanel>
  );
}
