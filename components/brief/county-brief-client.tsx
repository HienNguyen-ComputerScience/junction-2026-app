"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { TOO_MANY } from "@/components/exa/types";
import type { BriefClaim, BriefResponse } from "@/lib/brief/types";

type Status = "idle" | "loading" | "error" | "limited";

const MODE_LABEL: Record<BriefResponse["mode"], string> = {
  ai: "AI-written, every number checked against the snapshot",
  fallback: "Precomputed from the snapshot",
};

const AI_PRECOMPUTED_HEADLINE_LABEL = "AI-written; headline precomputed";

function isBriefResponse(v: unknown): v is BriefResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (r.mode === "ai" || r.mode === "fallback") && typeof r.headline === "string" && Array.isArray(r.claims);
}

/**
 * How a claim is laid out. Presentation only: the text is never changed. A claim is split on
 * its known inline labels only when the pieces join back to exactly the original text;
 * anything else renders whole.
 */
type Layout =
  | { kind: "action"; action: string; who: string; firstStep: string }
  | { kind: "labelled"; label: string; status?: string; body: string }
  | { kind: "plain" };

const ACTION = "Recommended action: ";
const WHO = ". Who: ";
const FIRST_STEP = ". First step: ";
/** The precomputed brief's row labels. A free sentence with an early colon is never split. */
const ROW_LABELS = new Set(["Getting a GP appointment", "The trend", "GP to specialist"]);

function layoutOf(text: string): Layout {
  if (text.startsWith(ACTION)) {
    const who = text.indexOf(WHO, ACTION.length);
    const first = who === -1 ? -1 : text.indexOf(FIRST_STEP, who + WHO.length);
    if (who !== -1 && first !== -1) {
      // Each part keeps its own full stop.
      const action = text.slice(ACTION.length, who + 1);
      const whoText = text.slice(who + WHO.length, first + 1);
      const firstStep = text.slice(first + FIRST_STEP.length);
      if (action && whoText && firstStep && `${ACTION}${action} Who: ${whoText} First step: ${firstStep}` === text) {
        return { kind: "action", action, who: whoText, firstStep };
      }
    }
  }
  // "Short label (status): body", e.g. "The trend: ..." or "Getting a GP appointment (worse than Finland): ...".
  const match = /^([A-Z][^:().\d]{2,40}?)(?: \(([^)]+)\))?: ([\s\S]+)$/.exec(text);
  if (match && ROW_LABELS.has(match[1])) {
    const [, label, status, body] = match;
    if (`${label}${status ? ` (${status})` : ""}: ${body}` === text) return { kind: "labelled", label, status, body };
  }
  return { kind: "plain" };
}

/**
 * A data sentence with its percentages and point gaps set in the figure face, as on the act
 * page, so every data number uses the same numerals. The words, and counts like "2-3 health
 * stations", stay in the text face. Presentation only: the text is unchanged.
 */
function withFigures(text: string): ReactNode {
  return text.split(/([+−-]?\d+(?:\.\d+)?(?:%| pts\b))/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="figure">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

const ROW = "grid gap-x-6 px-4 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:px-6 md:grid-cols-[8.5rem_minmax(0,1fr)_auto]";
const DT = "type-caption text-muted-foreground sm:col-start-1 sm:pt-px";
const DD = "max-w-[51rem] text-sm leading-relaxed text-pretty sm:col-start-2";

/**
 * A recommended action, laid out like the act page's action card: the action as its title, the
 * first step in the same nested box, who owns it as a quiet line, the source chip, and a link
 * to the evidence and limitations on the act page. The text is the claim's own, unchanged.
 */
function ActionRow({
  countyId,
  layout,
  chips,
  sourceIds,
}: {
  countyId: string;
  layout: Extract<Layout, { kind: "action" }>;
  chips: Record<string, ReactNode>;
  sourceIds: string[];
}) {
  return (
    <li className="flex flex-col gap-3.5 border-b border-border/80 px-4 py-5 last:border-b-0 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="type-caption text-muted-foreground">Recommended action</p>
        <h3 className="type-heading max-w-[51rem] text-pretty">{layout.action}</h3>
      </div>
      <div className="max-w-[51rem] rounded-lg border border-input bg-muted px-4 py-3.5">
        <p className="type-caption font-medium text-muted-foreground">First step</p>
        <p className="mt-1 text-sm leading-relaxed font-medium text-pretty text-foreground">{layout.firstStep}</p>
      </div>
      <p className="max-w-[51rem] type-caption text-pretty text-muted-foreground">
        <span className="font-medium">Who</span> · {layout.who}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {sourceIds.map((id) => (
            <span key={id} className="flex max-w-full min-w-0">
              {chips[id] ?? <Badge variant="outline">source missing</Badge>}
            </span>
          ))}
        </span>
        <Link
          href={`/county/${countyId}/act`}
          className="inline-flex h-9 items-center gap-1.5 rounded-sm text-sm font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          See the evidence and limitations
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
        </Link>
      </div>
    </li>
  );
}

function ClaimRow({
  claim,
  chips,
  countyId,
}: {
  claim: BriefClaim;
  chips: Record<string, ReactNode>;
  countyId: string;
}) {
  const layout = layoutOf(claim.text);
  if (layout.kind === "action") {
    return <ActionRow countyId={countyId} layout={layout} chips={chips} sourceIds={claim.source_ids} />;
  }
  const sources = (
    <span className="flex min-w-0 flex-wrap content-start items-start gap-1.5 pt-2.5 sm:col-start-2 md:col-start-3 md:row-start-1 md:justify-end md:pt-0">
      {claim.source_ids.map((id) => (
        <span key={id} className="flex max-w-full min-w-0">
          {chips[id] ?? <Badge variant="outline">source missing</Badge>}
        </span>
      ))}
    </span>
  );

  return (
    <li className={`${ROW} gap-y-1 border-b border-border/80 last:border-b-0`}>
      {layout.kind === "labelled" ? (
        <dl className="contents">
          <dt className={`${DT} flex flex-col`}>
            {layout.label}
            {layout.status && <span className="type-micro text-faint">{layout.status}</span>}
          </dt>
          <dd className={DD}>{withFigures(layout.body)}</dd>
        </dl>
      ) : (
        // No label to show: the sentence takes the label column too, so the row has no hole.
        <p className={`${DD} sm:col-span-2 sm:col-start-1 sm:max-w-[52rem]`}>{withFigures(claim.text)}</p>
      )}
      {sources}
    </li>
  );
}

export function CountyBriefClient({
  countyId,
  countyName,
  initial,
  chips,
}: {
  countyId: string;
  countyName: string;
  initial: BriefResponse;
  chips: Record<string, ReactNode>;
}) {
  const [brief, setBrief] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");

  async function writeAiBrief() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/brief?county=${encodeURIComponent(countyId)}`);
      const data: unknown = await res.json();
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (!res.ok || !isBriefResponse(data)) throw new Error("bad response");
      setBrief(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const triedAi = brief !== initial;

  // The numbers rows lead and the recommended actions follow. When the brief has that shape,
  // the numbers (already shown in the pathway above) fold behind a disclosure and the actions
  // stay in view. Order never changes; any other shape shows every row.
  const firstAction = brief.claims.findIndex((claim) => layoutOf(claim.text).kind === "action");
  const folded = firstAction > 0 ? brief.claims.slice(0, firstAction) : [];
  const shown = folded.length > 0 ? brief.claims.slice(firstAction) : brief.claims;
  // The folded rows' sources stay on screen next to the headline, which repeats their numbers.
  const foldedSources = [...new Set(folded.flatMap((claim) => claim.source_ids))];

  return (
    <Frame aria-labelledby="brief-heading">
      {/* The AI brief is the section's main action, so it sits in the header row with the line
          that says what it does (and, while it runs or fails, what is happening). */}
      <FrameHeader className="items-start gap-y-4 max-md:grid-cols-1">
        <div className="col-start-1 flex min-w-0 flex-col gap-1">
          <FrameTitle id="brief-heading" className="type-title">
            Brief for the county director
          </FrameTitle>
          <FrameDescription>
            Where the pathway breaks in {countyName}, in plain language. Every number comes from the data snapshot.
          </FrameDescription>
          {status === "idle" && !triedAi && (
            <p className="type-note text-muted-foreground">
              Claude rewrites the brief; a checker drops any claim it cannot trace to the snapshot.
            </p>
          )}
          {status === "loading" && (
            <p role="status" className="type-note text-muted-foreground">
              Claude is writing; the checker then drops any claim it can&apos;t trace to the snapshot.
            </p>
          )}
        </div>
        <div className="md:col-start-2 md:row-start-1">
          <Button variant="outline-accent" onClick={writeAiBrief} disabled={status === "loading"}>
            {status === "loading" ? "Writing…" : triedAi ? "Write AI brief again" : "Write AI brief"}
          </Button>
        </div>
        {(status === "limited" || status === "error") && (
          <p
            role="alert"
            className="rounded-lg border border-input bg-muted px-3 py-2 type-caption font-medium text-foreground md:col-span-2"
          >
            {status === "limited" ? TOO_MANY : "Could not reach the brief service."} The precomputed brief is still
            shown.
          </p>
        )}
      </FrameHeader>

      <FramePanel padding="none">
        <div
          aria-busy={status === "loading"}
          className={`transition-opacity duration-150 ${status === "loading" ? "opacity-50" : ""}`}
        >
          <div className="flex flex-col gap-3 px-4 pt-4 pb-5 sm:px-6 sm:pt-5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <Badge variant="checked">
                {brief.mode === "ai" && brief.headline_precomputed ? AI_PRECOMPUTED_HEADLINE_LABEL : MODE_LABEL[brief.mode]}
              </Badge>
              {brief.mode === "ai" && brief.model && <span className="type-note text-muted-foreground">{brief.model}</span>}
              {brief.mode === "ai" && brief.headline_precomputed && (
                <span className="type-micro text-muted-foreground">
                  The AI headline failed the snapshot check, so the precomputed headline is shown.
                </span>
              )}
              {triedAi && (
                <span className="type-micro text-muted-foreground">
                  {brief.dropped_count === 0
                    ? "The checker dropped no claims."
                    : `The checker dropped ${brief.dropped_count} claim${brief.dropped_count === 1 ? "" : "s"} it could not trace to the snapshot.`}
                </span>
              )}
            </div>
            {triedAi && brief.mode === "fallback" && brief.reason && (
              <p className="type-caption text-muted-foreground">AI brief not used: {brief.reason}</p>
            )}
            <p className="max-w-[51rem] text-[1.0625rem] leading-relaxed font-medium text-pretty">{withFigures(brief.headline)}</p>
            {foldedSources.length > 0 && (
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 type-note text-muted-foreground">Numbers from</span>
                {foldedSources.map((id) => (
                  <span key={id} className="flex max-w-full min-w-0">
                    {chips[id] ?? <Badge variant="outline">source missing</Badge>}
                  </span>
                ))}
              </p>
            )}
          </div>

          {folded.length > 0 && (
            <Disclosure
              className="border-t border-border/80"
              summaryClassName="min-h-11 w-full px-4 sm:px-6"
              summary={
                <>
                  <span className="group-open/disc:hidden">
                    Show the {folded.length} {folded.length === 1 ? "number" : "numbers"} behind this brief
                  </span>
                  <span className="hidden group-open/disc:inline">Hide the numbers behind this brief</span>
                </>
              }
            >
              <ul className="border-t border-border/80 bg-card">
                {folded.map((claim, i) => (
                  <ClaimRow key={`${i}-${claim.text.slice(0, 24)}`} claim={claim} chips={chips} countyId={countyId} />
                ))}
              </ul>
            </Disclosure>
          )}

          <ul className="border-t border-border/80">
            {shown.map((claim, i) => (
              <ClaimRow key={`${i}-${claim.text.slice(0, 24)}`} claim={claim} chips={chips} countyId={countyId} />
            ))}
          </ul>
        </div>
      </FramePanel>
    </Frame>
  );
}
