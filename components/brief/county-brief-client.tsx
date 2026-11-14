"use client";

import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FramePanelLabel,
  FrameTitle,
} from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
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

const ROW = "grid gap-x-6 px-5 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:px-6 md:grid-cols-[8.5rem_minmax(0,1fr)_auto]";
const DT = "type-caption text-muted-foreground sm:col-start-1 sm:pt-px";
const DD = "text-sm leading-relaxed text-pretty sm:col-start-2";

function Chips({ ids, chips }: { ids: string[]; chips: Record<string, ReactNode> }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} className="flex max-w-full min-w-0">
          {chips[id] ?? <Badge variant="outline">source missing</Badge>}
        </span>
      ))}
    </>
  );
}

/**
 * A recommended action as one compact row: the action and who owns it, its first step in the
 * same nested box as on the act page, and the source chip. The evidence and the limitations are
 * on the act page, behind the one link of the section. The text is the claim's own, unchanged.
 */
function ActionRow({
  layout,
  chips,
  sourceIds,
}: {
  layout: Extract<Layout, { kind: "action" }>;
  chips: Record<string, ReactNode>;
  sourceIds: string[];
}) {
  return (
    <li className="grid gap-y-3 border-b border-border px-5 py-4 last:border-b-0 sm:px-6 lg:col-span-3 lg:grid-cols-subgrid lg:items-start">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h4 className="type-heading text-pretty">{layout.action}</h4>
        <dl className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 type-caption text-muted-foreground">
          <dt>Owner</dt>
          <dd className="text-pretty">{layout.who}</dd>
        </dl>
      </div>
      <div className="rounded-lg border border-input bg-muted px-4 py-3">
        <p className="type-caption font-medium text-muted-foreground">First step</p>
        <p className="mt-1 text-sm leading-relaxed font-medium text-pretty text-foreground">{layout.firstStep}</p>
      </div>
      <span className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
        <Chips ids={sourceIds} chips={chips} />
      </span>
    </li>
  );
}

function ClaimRow({ claim, chips }: { claim: BriefClaim; chips: Record<string, ReactNode> }) {
  const layout = layoutOf(claim.text);
  return (
    <li className={`${ROW} gap-y-1 border-b border-border last:border-b-0`}>
      {layout.kind === "labelled" ? (
        <dl className="contents">
          <dt className={`${DT} flex flex-col`}>
            {layout.label}
            {layout.status && <span className="type-caption text-muted-foreground">{layout.status}</span>}
          </dt>
          <dd className={DD}>{withFigures(layout.body)}</dd>
        </dl>
      ) : (
        // No label to show: the sentence takes the label column too, so the row has no hole.
        <p className={`${DD} sm:col-span-2 sm:col-start-1`}>{withFigures(claim.text)}</p>
      )}
      <span className="flex min-w-0 flex-wrap content-start items-start gap-1.5 pt-2.5 sm:col-start-2 md:col-start-3 md:row-start-1 md:justify-end md:pt-0">
        <Chips ids={claim.source_ids} chips={chips} />
      </span>
    </li>
  );
}

/** The claims in order, with each run of recommended actions kept together as one section. */
type Segment =
  | { kind: "claim"; claim: BriefClaim; key: string }
  | { kind: "actions"; key: string; items: { claim: BriefClaim; layout: Extract<Layout, { kind: "action" }> }[] };

function segmentsOf(claims: BriefClaim[]): Segment[] {
  const segments: Segment[] = [];
  claims.forEach((claim, i) => {
    const layout = layoutOf(claim.text);
    const key = `${i}-${claim.text.slice(0, 24)}`;
    if (layout.kind !== "action") {
      segments.push({ kind: "claim", claim, key });
      return;
    }
    const last = segments[segments.length - 1];
    if (last?.kind === "actions") last.items.push({ claim, layout });
    else segments.push({ kind: "actions", key, items: [{ claim, layout }] });
  });
  return segments;
}

function Claims({
  claims,
  chips,
  countyId,
}: {
  claims: BriefClaim[];
  chips: Record<string, ReactNode>;
  countyId: string;
}) {
  return (
    <>
      {segmentsOf(claims).map((segment) =>
        segment.kind === "claim" ? (
          <ul key={segment.key} className="border-t border-border">
            <ClaimRow claim={segment.claim} chips={chips} />
          </ul>
        ) : (
          <section key={segment.key} aria-label="Recommended actions" className="border-t border-border">
            <FramePanelLabel divider>
              <h3 className="font-sans type-caption font-medium tracking-normal">
                Recommended {segment.items.length === 1 ? "action" : "actions"}
              </h3>
              <TextLink kind="nav" href={`/county/${countyId}/act`} className="type-caption">
                See the evidence and limitations
              </TextLink>
            </FramePanelLabel>
            {/* One grid for the section, so every row has the same three columns. */}
            <ul className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] lg:gap-x-8">
              {segment.items.map(({ claim, layout }, i) => (
                <ActionRow
                  key={`${i}-${claim.text.slice(0, 24)}`}
                  layout={layout}
                  chips={chips}
                  sourceIds={claim.source_ids}
                />
              ))}
            </ul>
          </section>
        ),
      )}
    </>
  );
}

export function CountyBriefClient({
  countyId,
  initial,
  chips,
}: {
  countyId: string;
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
            Every number comes from the data snapshot. The AI rewrite is checked against it, claim by claim.
          </FrameDescription>
          {status === "loading" && (
            <p role="status" className="type-caption text-muted-foreground">
              Claude is writing; the checker then drops any claim it can&apos;t trace to the snapshot.
            </p>
          )}
        </div>
        <div className="md:col-start-2 md:row-start-1">
          <Button variant="outline" onClick={writeAiBrief} disabled={status === "loading"}>
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
          {/* Label strip: where the brief comes from on the left, its sources on the right. */}
          <FramePanelLabel divider>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-normal">
              <Badge variant="checked" source={brief.mode === "fallback" ? "snapshot" : undefined}>
                {brief.mode === "ai" && brief.headline_precomputed ? AI_PRECOMPUTED_HEADLINE_LABEL : MODE_LABEL[brief.mode]}
              </Badge>
              {brief.mode === "ai" && brief.model && <span className="text-muted-foreground">{brief.model}</span>}
            </span>
            {foldedSources.length > 0 && (
              <span className="flex flex-wrap items-center gap-1.5 font-normal">
                <span className="mr-0.5 text-muted-foreground">Numbers from</span>
                <Chips ids={foldedSources} chips={chips} />
              </span>
            )}
          </FramePanelLabel>
          <div className="flex flex-col gap-2 px-5 py-4 sm:px-6 sm:py-5">
            <p className="max-w-[60rem] text-[1.0625rem] leading-relaxed font-medium text-pretty">{withFigures(brief.headline)}</p>
            {brief.mode === "ai" && brief.headline_precomputed && (
              <p className="type-caption text-muted-foreground">
                The AI headline failed the snapshot check, so the precomputed headline is shown.
              </p>
            )}
            {triedAi && (
              <p className="type-caption text-muted-foreground">
                {brief.dropped_count === 0
                  ? "The checker dropped no claims."
                  : `The checker dropped ${brief.dropped_count} claim${brief.dropped_count === 1 ? "" : "s"} it could not trace to the snapshot.`}
                {brief.mode === "fallback" && brief.reason ? ` AI brief not used: ${brief.reason}` : ""}
              </p>
            )}
          </div>

          {folded.length > 0 && (
            <Disclosure
              className="border-t border-border"
              summaryClassName="min-h-11 w-full px-5 sm:px-6"
              summary={
                <>
                  <span className="group-open/disc:hidden">
                    Show the {folded.length} {folded.length === 1 ? "number" : "numbers"} behind this brief
                  </span>
                  <span className="hidden group-open/disc:inline">Hide the numbers behind this brief</span>
                </>
              }
            >
              <Claims claims={folded} chips={chips} countyId={countyId} />
            </Disclosure>
          )}

          <Claims claims={shown} chips={chips} countyId={countyId} />
        </div>
      </FramePanel>
    </Frame>
  );
}
