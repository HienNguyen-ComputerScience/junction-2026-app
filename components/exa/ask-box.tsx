"use client";

import { ArrowUp, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isAskResponse, STATUS_LABEL, TOO_MANY, type AskResponse } from "./types";

const MAX_QUESTION = 300;

const EXAMPLES = [
  "Did Denmark's cancer fast-track pathways shorten diagnosis times?",
  "How long do people wait to see a GP in Vantaa?",
  "Onko Kainuussa lääkäripula?",
];

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
    const q = text.trim();
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
    <div aria-labelledby="ask-box-title" role="group" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="ask-box-title" className="type-heading">
            Ask a question
          </h3>
          <Badge variant="secondary">Found live — unverified</Badge>
          <span className="type-micro text-muted-foreground">via Exa</span>
        </div>
        <p className="max-w-2xl type-caption text-muted-foreground">
          Answered only from live Exa search results, with a numbered source for every sentence. Decision support, not medical advice.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 rounded-2xl border border-input bg-card p-1.5 shadow-[0_1px_2px_oklch(0.2_0.03_262/0.05)] transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="ask-box-input" className="sr-only">
          Your question about health care access in Finland
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-3">
          <Search aria-hidden className="size-[1.125rem] shrink-0 text-muted-foreground" />
          <input
            id="ask-box-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_QUESTION}
            disabled={loading}
            placeholder="e.g. Is GP access getting better in Kainuu this year?"
            autoComplete="off"
            className="h-11 w-full min-w-0 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground/80 disabled:opacity-60"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-5" disabled={loading || question.trim().length < 3}>
          {loading ? "Searching…" : "Ask"}
          {!loading && <ArrowUp aria-hidden data-icon="inline-end" />}
        </Button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3" role="group" aria-label="Example questions">
        <span aria-hidden className="pt-2 type-micro font-medium text-muted-foreground">Try</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuestion(ex);
                ask(ex);
              }}
              className="min-h-9 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-left text-[0.8125rem] text-foreground/80 transition-colors outline-none hover:border-brand/30 hover:bg-brand-soft hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              {ex}
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{STATUS_LABEL[data.freshness]}</Badge>
                <span className="type-micro text-muted-foreground">Answered only from these Exa results.</span>
              </div>

              {answered && data.answer && (
                <div className="space-y-2 rounded-xl border border-dashed border-input bg-muted/40 p-4">
                  <p className="type-micro text-muted-foreground">
                    Not checked by the team. Written by AI from the live results below; read the sources before relying on it.
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
                </div>
              )}

              {!answered && data.nothingFound && (
                <p className="rounded-xl border border-dashed border-input p-4 text-sm text-muted-foreground">
                  {data.message?.startsWith("Nothing found")
                    ? data.message
                    : `Nothing found. ${data.message || "The live results did not answer this question."}`}
                </p>
              )}

              {!answered && !data.nothingFound && data.message && (
                <p className="text-sm text-muted-foreground">{data.message}</p>
              )}

              {data.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="type-micro font-semibold text-muted-foreground">Sources</h4>
                  <ResultList items={data.items} numbered idPrefix="ask-src" />
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
