"use client";

import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { TOO_MANY } from "@/components/exa/types";
import type { BriefResponse } from "@/lib/brief/types";

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

  return (
    <Frame aria-labelledby="brief-heading">
      <FrameHeader>
        <FrameTitle id="brief-heading" className="type-title">
          Brief for the county director
        </FrameTitle>
        <FrameDescription>
          Where the pathway breaks in {countyName}, in plain language. Every number comes from the data snapshot.
        </FrameDescription>
      </FrameHeader>

      <FramePanel padding="none">
        <div className="flex flex-col gap-3 px-4 pt-4 pb-5 sm:px-6 sm:pt-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Badge variant={brief.mode === "ai" ? "brand" : "secondary"}>
              {brief.mode === "ai" && brief.headline_precomputed ? AI_PRECOMPUTED_HEADLINE_LABEL : MODE_LABEL[brief.mode]}
            </Badge>
            {brief.mode === "ai" && brief.model && <span className="type-mark text-muted-foreground">{brief.model}</span>}
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
            <p className="text-sm text-muted-foreground">AI brief not used: {brief.reason}</p>
          )}
        </div>

        <div
          aria-busy={status === "loading"}
          className={`transition-opacity duration-150 ${status === "loading" ? "opacity-50" : ""}`}
        >
          <p className="max-w-[46rem] px-4 pb-5 font-display text-[1.25rem] leading-[1.3] font-medium tracking-[-0.015em] text-pretty sm:px-6 sm:text-[1.375rem]">
            {brief.headline}
          </p>
          <ul className="border-t border-border/80">
            {brief.claims.map((claim, i) => (
              <li
                key={`${i}-${claim.text.slice(0, 24)}`}
                className="grid gap-x-8 gap-y-2 border-b border-border/80 px-4 py-3.5 last:border-b-0 sm:px-6 md:grid-cols-[minmax(0,1fr)_17rem]"
              >
                <span className="max-w-[46rem] text-sm leading-relaxed text-pretty">{claim.text}</span>
                <span className="flex min-w-0 flex-wrap content-start items-start gap-1.5 md:justify-end">
                  {claim.source_ids.map((id) => (
                    <span key={id} className="flex min-w-0 max-w-full">
                      {chips[id] ?? <Badge variant="outline">source missing</Badge>}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </FramePanel>

      <FrameFooter className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={writeAiBrief} disabled={status === "loading"} variant="outline">
          {status === "loading" ? "Writing…" : triedAi ? "Write AI brief again" : "Write AI brief"}
        </Button>
        {status === "idle" && !triedAi && (
          <span className="type-caption">
            Claude rewrites the brief; a checker drops any claim it cannot trace to the snapshot.
          </span>
        )}
        {status === "loading" && (
          <span role="status" className="type-caption">
            Claude is writing; the checker then drops any claim it can&apos;t trace to the snapshot.
          </span>
        )}
        {status === "limited" && (
          <span role="alert" className="type-caption text-destructive">
            {TOO_MANY} The precomputed brief is still shown.
          </span>
        )}
        {status === "error" && (
          <span role="alert" className="type-caption text-destructive">
            Could not reach the brief service. The precomputed brief is still shown.
          </span>
        )}
      </FrameFooter>
    </Frame>
  );
}
