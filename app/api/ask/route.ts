import { NextResponse, type NextRequest } from "next/server";

import { writeAnswer, type Answer } from "@/lib/exa/answer";
import { cacheGet, cacheSet, search, simulateOutage, isoDaysAgo, type Freshness, type Item } from "@/lib/exa/client";
import { TTL } from "@/lib/exa/config";

// POST /api/ask  { "question": "..." }
// Answers only from Exa results. Each answer sentence cites items by 1-based index;
// unsupported sentences are dropped by the validator. Otherwise: a clean "nothing found".

const MAX_QUESTION = 300;
const RECENCY = /\b(now|current(ly)?|latest|today|this (week|month|year)|recent(ly)?|nyt|nykyään|tällä hetkellä|uusin|uusimmat|viime aikoina)\b/i;

type AskResponse = {
  question: string;
  items: Item[];
  answer: Answer | null;
  nothingFound: boolean;
  message?: string;
  freshness: Freshness;
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send JSON: { \"question\": \"...\" }" }, { status: 400 });
  }
  const raw = typeof body === "object" && body !== null && "question" in body ? body.question : undefined;
  const question = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUESTION) : "";
  if (!/\p{L}{3,}/u.test(question)) {
    return NextResponse.json({ error: "Type a question." }, { status: 400 });
  }

  const outage = simulateOutage(request);
  const cacheKey = `ask:${question.toLowerCase()}`;
  const cached = cacheGet<AskResponse>(cacheKey, TTL.ask);
  if (cached?.fresh) return NextResponse.json({ ...cached.value, freshness: "cache" });

  // Keep retrieval on topic: "GP queue in Kainuu" alone returns gaming sites (probe F4).
  const result = await search(
    {
      query: `${question} (Finland, health care)`,
      type: "auto",
      numResults: 6,
      userLocation: "FI",
      contents: { highlights: { maxCharacters: 800 } },
    },
    { ttlMs: TTL.ask, simulateOutage: outage, snippetChars: 800 },
  );

  const reply = (r: Omit<AskResponse, "question" | "freshness">) => {
    const response: AskResponse = { question, freshness: result.freshness, ...r };
    if (result.freshness === "live" && (r.answer || r.nothingFound)) cacheSet(cacheKey, response);
    return NextResponse.json(response);
  };

  if (result.freshness === "unavailable") {
    if (cached) return NextResponse.json({ ...cached.value, freshness: "stale-cache" });
    return reply({ items: [], answer: null, nothingFound: false, message: "Live search unavailable." });
  }
  if (result.items.length === 0) {
    return reply({ items: [], answer: null, nothingFound: true, message: "Nothing found." });
  }

  const twoYearsAgo = isoDaysAgo(730);
  if (RECENCY.test(question) && !result.items.some((i) => i.publishedDate && i.publishedDate >= twoYearsAgo)) {
    return reply({ items: result.items, answer: null, nothingFound: true, message: "No recent results found." });
  }

  const written = await writeAnswer(question, result.items);
  switch (written.status) {
    case "answered":
      return reply({ items: result.items, answer: written.answer, nothingFound: false });
    case "nothing-found":
      return reply({ items: result.items, answer: null, nothingFound: true, message: "Nothing found in the sources." });
    case "unavailable":
      console.warn(`[ask] answer unavailable: ${written.reason}`);
      return NextResponse.json({
        question,
        items: result.items,
        answer: null,
        nothingFound: false,
        message: "Sources only: the written answer is unavailable.",
        freshness: result.freshness,
      } satisfies AskResponse);
  }
}
