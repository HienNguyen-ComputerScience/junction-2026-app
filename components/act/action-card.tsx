import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_LABELS } from "@/lib/act";
import type { Evidence } from "@/lib/data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[7rem_1fr] sm:gap-3">
      <dt className="font-medium text-foreground">{label}</dt>
      <dd className="text-muted-foreground">{children}</dd>
    </div>
  );
}

/**
 * One recommended action from data/evidence.json.
 * `children` render at the bottom of the card (e.g. a live-evidence panel).
 */
export function ActionCard({
  action,
  children,
}: {
  action: Evidence;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{STAGE_LABELS[action.stage]}</Badge>
          {action.verified ? (
            <Badge variant="outline" className="gap-1">
              <BadgeCheck aria-hidden className="size-3.5" />
              Source checked
            </Badge>
          ) : null}
          <SourceChip sourceId={action.source_id} />
        </div>
        <CardTitle className="text-lg">{action.action}</CardTitle>
        <p className="text-muted-foreground">{action.detail}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-3">
          <Field label="Owner">{action.who_implements}</Field>
          <Field label="First step">
            <span className="text-foreground">{action.first_step}</span>
          </Field>
          <Field label="Precedent">{action.precedent}</Field>
          <Field label="Evidence">
            {action.effect_text}
            {/* NICE content may not be reproduced outside the UK: link only, never the quote. */}
            {action.source_id.startsWith("ev-nice") ? null : (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs underline underline-offset-2">
                  Quote and page in the source
                </summary>
                <p className="mt-1 border-l-2 pl-3 text-xs">{action.quote_or_page}</p>
              </details>
            )}
          </Field>
          <Field label="Limitations">{action.limitations}</Field>
        </dl>
        {children}
      </CardContent>
    </Card>
  );
}
