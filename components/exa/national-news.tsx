"use client";

import { useEffect, useState } from "react";

import { Frame, FrameDescription, FrameHeader, FrameMeta, FramePanel, FrameTitle } from "@/components/ui/frame";

import { NewsCarousel } from "./news-carousel";
import { LiveMark, LoadingRows, Unavailable } from "./result-list";
import { isItemsResponse, type ItemsResponse } from "./types";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

// Compact national strip for the ranking page. Client-side fetch, so it never delays first render.
export function NationalNews() {
  const [state, setState] = useState<State>({ kind: "loading" });

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

  return (
    <Frame aria-labelledby="national-news-title">
      <FrameHeader>
        <FrameTitle id="national-news-title" className="type-title">
          Finland, this month
        </FrameTitle>
        <FrameMeta>
          <LiveMark result={state.kind === "error" ? { freshness: "unavailable" } : data} />
        </FrameMeta>
        <FrameDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Recent national news on the cancer care pathway, in Finnish.
            {data?.freshness === "stale-cache" && data.message ? ` ${data.message}` : ""}
          </span>
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="none" className="px-4 py-4 sm:px-6 sm:py-5">
        {state.kind === "loading" && <LoadingRows label="Searching national news with Exa" />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No national news found this month.</p>
        )}
        {data && !unavailable && data.items.length > 0 && (
          <NewsCarousel items={data.items} label="National news" />
        )}
      </FramePanel>
    </Frame>
  );
}
