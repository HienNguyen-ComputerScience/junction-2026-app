"use client";

import { useEffect, useState } from "react";

import { Disclosure } from "@/components/motion/disclosure";
import { NewsList } from "@/components/exa/news-list";
import { LiveMark, LoadingRows, Unavailable } from "@/components/exa/result-list";
import { isItemsResponse, type ItemsResponse } from "@/components/exa/types";

import { ASK_CARD } from "./ask-panel";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

/**
 * The month's national health news, as the page's second card: a title, where it comes from,
 * and the list behind "Show the news". Same request and labels as the shared NationalNews.
 * Live and unverified, so screen only.
 */
export function NewsPanel() {
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
    <section aria-labelledby="ask-news" className={`${ASK_CARD} print:hidden`} data-needs-js>
      <div className="flex flex-col gap-2">
        <h2 id="ask-news" className="type-heading text-forest-ink">
          Health care news in Finland this month
        </h2>
        <LiveMark result={state.kind === "error" ? { freshness: "unavailable" } : data} />
      </div>
      <Disclosure show="Show the news" hide="Hide the news" tone="quiet">
        {state.kind === "loading" && <LoadingRows label="Finding this month's news" rows={2} />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.freshness === "stale-cache" && data.message ? (
          <p className="mb-3 text-base text-muted-foreground">{data.message}</p>
        ) : null}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-base text-muted-foreground">No national news found this month.</p>
        )}
        {data && !unavailable && data.items.length > 0 && <NewsList items={data.items} label="National news" />}
      </Disclosure>
    </section>
  );
}
