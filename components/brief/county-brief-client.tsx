"use client";

import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import type { BriefResponse } from "@/lib/brief/types";

type Status = "idle" | "loading" | "error";

const MODE_LABEL: Record<BriefResponse["mode"], string> = {
  ai: "AI-written, every number checked against the snapshot",
  fallback: "Precomputed from the snapshot",
};

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
      if (!res.ok || !isBriefResponse(data)) throw new Error("bad response");
      setBrief(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const triedAi = brief !== initial;

  return (
    <Card>
      <CardHeader>
        {/* The page section supplies the "Brief for the county director" heading. */}
        <CardDescription>
          Where the pathway breaks in {countyName}, in plain language. Every number comes from the data snapshot.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={brief.mode === "ai" ? "default" : "secondary"}>{MODE_LABEL[brief.mode]}</Badge>
          {brief.mode === "ai" && brief.model && <span className="text-xs text-muted-foreground">{brief.model}</span>}
          {triedAi && (
            <span className="text-xs text-muted-foreground">
              {brief.dropped_count === 0
                ? "The checker dropped no claims."
                : `The checker dropped ${brief.dropped_count} claim${brief.dropped_count === 1 ? "" : "s"} it could not trace to the snapshot.`}
            </span>
          )}
        </div>
        {triedAi && brief.mode === "fallback" && brief.reason && (
          <p className="text-sm text-muted-foreground">AI brief not used: {brief.reason}</p>
        )}

        <div aria-busy={status === "loading"} className={status === "loading" ? "opacity-50" : undefined}>
          <p className="text-base font-medium">{brief.headline}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {brief.claims.map((claim, i) => (
              <li key={`${i}-${claim.text.slice(0, 24)}`} className="text-sm leading-relaxed">
                <span>{claim.text}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {claim.source_ids.map((id) => (
                    <span key={id}>{chips[id] ?? <Badge variant="outline">source missing</Badge>}</span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={writeAiBrief} disabled={status === "loading"} variant="outline">
            {status === "loading" ? "Writing…" : triedAi ? "Write AI brief again" : "Write AI brief"}
          </Button>
          {status === "loading" && (
            <span role="status" className="text-sm text-muted-foreground">
              Claude is writing; the checker then drops any claim it can&apos;t trace to the snapshot.
            </span>
          )}
          {status === "error" && (
            <span role="alert" className="text-sm text-destructive">
              Could not reach the brief service. The precomputed brief is still shown.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
