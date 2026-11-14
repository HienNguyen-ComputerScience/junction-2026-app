"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isItemsResponse, STATUS_LABEL, statusText, type ItemsResponse } from "./types";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

/** Rows shown before "Show more" (main showed at most 4 and no more). */
const FIRST_ROWS = 4;

// Compact national strip for the ranking page. Client-side fetch, so it never delays first render.
export function NationalNews() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/national-news", { signal: ctrl.signal })
      .then(async (res) => {
        const json: unknown = await res.json();
        setState(res.ok && isItemsResponse(json) ? { kind: "done", data: json } : { kind: "error" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error" });
      });
    return () => ctrl.abort();
  }, []);

  const data = state.kind === "done" ? state.data : null;
  const unavailable = state.kind === "error" || data?.freshness === "unavailable";
  const freshness = unavailable ? STATUS_LABEL.unavailable : data ? statusText(data) : null;

  return (
    <Frame aria-labelledby="national-news-title">
      <FrameHeader>
        <FrameTitle id="national-news-title" className="type-title">
          Finland, this month
        </FrameTitle>
        {/* One provenance tag; the freshness is plain text after it, not another pill. */}
        <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
          <Badge variant="unverified">Found live — unverified</Badge>
          <span className="type-note text-muted-foreground">
            via Exa{freshness && ` · ${freshness.toLowerCase()}`}
          </span>
        </div>
        <FrameDescription>
          Recent national news on the cancer care pathway. Not checked by the team.
          {data?.freshness === "stale-cache" && data.message ? ` ${data.message}` : ""}
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="none" className="px-4 py-4 sm:px-6 sm:py-5">
        {state.kind === "loading" && <LoadingRows label="Searching national news with Exa" />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No national news found this month.</p>
        )}
        {data && !unavailable && data.items.length > 0 && (
          <div className="flex flex-col gap-4">
            <ResultList items={expanded ? data.items : data.items.slice(0, FIRST_ROWS)} />
            {data.items.length > FIRST_ROWS && (
              <div className="border-t border-border/80 pt-4">
                <Button variant="outline" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                  {expanded ? "Show fewer" : `Show ${data.items.length - FIRST_ROWS} more`}
                </Button>
              </div>
            )}
          </div>
        )}
      </FramePanel>
    </Frame>
  );
}
