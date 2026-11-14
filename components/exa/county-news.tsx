"use client";

import { useEffect, useState } from "react";

import { Frame, FrameDescription, FrameHeader, FrameMeta, FramePanel, FrameTitle } from "@/components/ui/frame";

import { NewsCarousel } from "./news-carousel";
import { LiveMark, LoadingRows, Unavailable } from "./result-list";
import { isItemsResponse, type ItemsResponse } from "./types";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

// Loads on mount: the route answers in about a second (fast search, cached for a while),
// so a "Search live" button would only add a click to the demo.
export function CountyNews({ countyId }: { countyId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/county-news?county=${encodeURIComponent(countyId)}`, { signal: ctrl.signal })
      .then(async (res) => {
        const json: unknown = await res.json();
        setState(res.ok && isItemsResponse(json) ? { kind: "done", data: json } : { kind: "error" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error" });
      });
    return () => ctrl.abort();
  }, [countyId]);

  const data = state.kind === "done" ? state.data : null;
  const unavailable = state.kind === "error" || data?.freshness === "unavailable";

  return (
    <Frame aria-labelledby="county-news-title">
      <FrameHeader>
        <FrameTitle id="county-news-title" className="type-title">
          Local news, last 12 months
        </FrameTitle>
        <FrameMeta>
          <LiveMark result={state.kind === "error" ? { freshness: "unavailable" } : data} />
        </FrameMeta>
        <FrameDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            News and county pages about access to a doctor, in Finnish.
            {data?.freshness === "stale-cache" && data.message ? ` ${data.message}` : ""}
          </span>
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="none" className="px-4 py-4 sm:px-6 sm:py-5">
        {state.kind === "loading" && <LoadingRows label="Searching local news with Exa" />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No news found for this county in the last 12 months.</p>
        )}
        {data && !unavailable && data.items.length > 0 && (
          <NewsCarousel items={data.items} label="Local news" />
        )}
      </FramePanel>
    </Frame>
  );
}
