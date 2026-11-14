"use client";

import { ArrowUp, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Frame, FrameDescription, FrameHeader, FrameMeta, FramePanel, FrameTitle } from "@/components/ui/frame";

import { LiveMark, LoadingRows, ResultList, Unavailable } from "./result-list";
import { isAskResponse, TOO_MANY, type AskResponse } from "./types";

const MAX_QUESTION = 300;

// `query` is what is sent to /api/ask and is the demo-cache key: never reword it.
// `label` is what the chip and the input show; without one, the query itself is shown.
const EXAMPLES: { query: string; label?: string }[] = [
  { query: "Did Denmark's cancer fast-track pathways shorten diagnosis times?" },
  {
    query: "How long do people wait to see a GP in Vantaa?",
    label: "How long is the wait for a non-urgent GP visit in Vantaa?",
  },
  { query: "Onko Kainuussa lääkäripula?" },
];

/** A suggestion's display label maps back to its query, so the input can show the label. */
function toQuery(text: string): string {
  return EXAMPLES.find((ex) => ex.label === text)?.query ?? text;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; data: AskResponse }
  | { kind: "error"; message: string };

export function AskBox() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const ctrlRef = useRef<AbortController | null>(null);
  const loading = state.kind === "loading";

  useEffect(() => () => ctrlRef.current?.abort(), []);

  function ask(text: string) {
    const q = toQuery(text.trim());
    if (q.length < 3 || loading) return;
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState({ kind: "loading" });
    fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: q }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const json: unknown = await res.json();
        if (res.ok && isAskResponse(json)) setState({ kind: "done", data: json });
        else if (res.status === 429) setState({ kind: "error", message: TOO_MANY });
        else if (res.status === 400) setState({ kind: "error", message: "Type a question about health care in Finland." });
        else setState({ kind: "error", message: "" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error", message: "" });
      });
  }

  const data = state.kind === "done" ? state.data : null;
  const unavailable = data?.freshness === "unavailable" || (state.kind === "error" && state.message === "");
  const answered = data?.answer && data.answer.sentences.length > 0;

  return (
    <Frame id="ask" aria-labelledby="ask-heading" className="scroll-mt-4">
      <FrameHeader>
        <FrameTitle id="ask-heading" className="type-title">
          Ask the evidence
        </FrameTitle>
        <FrameMeta>
          <LiveMark result={data} />
        </FrameMeta>
        <FrameDescription>
          Answered only from live Exa search results, with a numbered source for every sentence. Decision support,
          not medical advice.
        </FrameDescription>
      </FrameHeader>
      <FramePanel padding="lg" className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-2 rounded-xl border border-input bg-muted p-1.5 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="ask-box-input" className="sr-only">
          Your question about health care access in Finland
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-2.5 sm:pl-3">
          <Search aria-hidden strokeWidth={1.75} className="hidden size-[1.125rem] shrink-0 text-muted-foreground sm:block" />
          <input
            id="ask-box-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_QUESTION}
            disabled={loading}
            placeholder="e.g. Is GP access improving in Kainuu?"
            autoComplete="off"
            className="h-11 w-full min-w-0 bg-transparent text-[0.9375rem] outline-none placeholder:text-faint disabled:opacity-60"
          />
        </div>
        {/* Idle (nothing typed yet): a neutral outline with readable text, so it reads as waiting
            for a question, not as broken. It turns into the filled primary once there is one. */}
        <Button
          type="submit"
          size="lg"
          variant={question.trim().length < 3 && !loading ? "outline" : "default"}
          className="h-11 px-5 disabled:text-muted-foreground"
          disabled={loading || question.trim().length < 3}
          title={question.trim().length < 3 && !loading ? "Type a question first, or try an example" : undefined}
        >
          {loading ? "Searching…" : "Ask"}
          {!loading && <ArrowUp aria-hidden data-icon="inline-end" />}
        </Button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3" role="group" aria-label="Example questions">
        <span aria-hidden className="type-caption text-muted-foreground sm:pt-2">Try</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.query}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuestion(ex.label ?? ex.query);
                ask(ex.query);
              }}
              className="min-h-10 rounded-lg border border-input px-3 py-1.5 text-left type-caption text-foreground transition-colors outline-none hover:border-foreground/25 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 sm:min-h-9"
            >
              {ex.label ?? ex.query}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="-mt-5 [&>*]:mt-5">
          {loading && <LoadingRows label="Searching and writing an answer from the results" rows={2} />}
          {state.kind === "error" && state.message !== "" && <p className="text-sm text-muted-foreground">{state.message}</p>}
          {unavailable && <Unavailable />}
          {data && data.freshness !== "unavailable" && (
            <div className="space-y-5 border-t border-border pt-5">
              {answered && data.answer && (
                <div className="space-y-2 rounded-lg border border-dashed border-input bg-muted/40 p-4">
                  <p className="type-caption text-muted-foreground">
                    Written by AI from the live results below. Read the sources before relying on it.
                  </p>
                  <p className="text-[0.9375rem] leading-relaxed text-foreground/85">
                    {data.answer.sentences.map((s, i) => (
                      <span key={i}>
                        {s.text}{" "}
                        {s.sources.map((n, j) => (
                          <sup key={`${n}-${j}`} className="mr-0.5">
                            {Number.isInteger(n) && n >= 1 && n <= data.items.length ? (
                              <a
                                href={`#ask-src-${n}`}
                                aria-label={`Source ${n}`}
                                className="font-medium text-brand-ink underline-offset-2 hover:underline"
                              >
                                [{n}]
                              </a>
                            ) : (
                              <span>[{n}]</span>
                            )}
                          </sup>
                        ))}{" "}
                      </span>
                    ))}
                  </p>
                  <p className="type-caption text-muted-foreground">
                    Numbers here come from the web sources cited and can measure something different from the dashboard&apos;s
                    indicators (share of GP visits waiting more than 7 days).
                  </p>
                </div>
              )}

              {!answered && data.nothingFound && (
                <p className="rounded-lg border border-dashed border-input p-4 text-sm text-muted-foreground">
                  {data.message?.startsWith("Nothing found") || (typeof data.dropped === "number" && data.dropped > 0)
                    ? data.message
                    : `Nothing found. ${data.message || "The live results did not answer this question."}`}
                </p>
              )}

              {!answered && !data.nothingFound && data.message && (
                <p className="text-sm text-muted-foreground">{data.message}</p>
              )}

              {data.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="type-caption font-medium text-muted-foreground">Sources</h4>
                  <ResultList items={data.items} numbered idPrefix="ask-src" />
                </div>
              )}
            </div>
          )}
      </div>
      </FramePanel>
    </Frame>
  );
}
