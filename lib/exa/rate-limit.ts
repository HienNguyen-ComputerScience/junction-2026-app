import "server-only";

import { NextResponse } from "next/server";

// Small fixed-window rate limiter for the Exa routes: per client IP plus a global cap per minute.
// Best effort only: the counters live in this server instance's memory, so on Vercel every
// serverless instance (and every cold start) has its own counters. It stops one browser tab or a
// script loop from burning Exa credits; it is not a security boundary.
// Per-IP caps are generous because judges at the venue likely share one public IP.

export type Bucket = "news" | "evidence" | "ask" | "brief";

const WINDOW_MS = 60_000;
const LIMITS: Record<Bucket, { perIp: number; global: number }> = {
  news: { perIp: 60, global: 600 }, // county + national strips: cheap, mostly cached
  evidence: { perIp: 40, global: 200 }, // up to ~6 panels per action page
  // ask: the route counts a request only just before it spends (a live Exa search or a Claude call),
  // at most once; cache hits, merged duplicate asks, the off-topic gate and 400s are free. Judges at the venue share one public IP, so per IP is 40 (two thirds of the global cap: the
  // venue can't be locked out by its own clicks, and other visitors keep 20). The global 60 per minute
  // per instance is the spend cap and is unchanged.
  ask: { perIp: 40, global: 60 },
  brief: { perIp: 20, global: 60 }, // each uncached request is one Claude call
};
const MAX_TRACKED_IPS = 5_000;

type Window = { start: number; global: number; perIp: Map<string, number> };
const store = globalThis as typeof globalThis & { __exaRate?: Map<Bucket, Window> };
const windows = (store.__exaRate ??= new Map<Bucket, Window>());

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Counts this request. Returns null if allowed, else the seconds until the window resets. */
export function hit(bucket: Bucket, ip: string): number | null {
  const now = Date.now();
  let w = windows.get(bucket);
  if (!w || now - w.start >= WINDOW_MS) {
    w = { start: now, global: 0, perIp: new Map() };
    windows.set(bucket, w);
  }
  const limit = LIMITS[bucket];
  const mine = w.perIp.get(ip) ?? 0;
  if (mine >= limit.perIp || w.global >= limit.global) {
    return Math.max(1, Math.ceil((w.start + WINDOW_MS - now) / 1000));
  }
  if (w.perIp.size < MAX_TRACKED_IPS || w.perIp.has(ip)) w.perIp.set(ip, mine + 1);
  w.global++;
  return null;
}

/**
 * The 429 as plain data (body + init), so one outcome can become several responses: POST /api/ask
 * hands the same outcome to every request merged into one computation, and a Response body is
 * single-use. The body also carries `freshness: "unavailable"` and empty `items`, so clients that
 * only read those fields show the normal "unavailable" state.
 */
export function limitedReply(retryAfter: number) {
  return {
    body: {
      message: "Live search is busy. Try again in a minute.",
      freshness: "unavailable" as const,
      items: [] as never[],
      nothingFound: false as const,
      answer: null,
    },
    init: { status: 429, headers: { "retry-after": String(retryAfter) } },
  };
}

export type LimitedReply = ReturnType<typeof limitedReply>;

/** Applies the limit. Returns a 429 response to send, or null to continue. */
export function rateLimit(request: Request, bucket: Bucket): NextResponse | null {
  const retryAfter = hit(bucket, clientIp(request));
  if (retryAfter === null) return null;
  const { body, init } = limitedReply(retryAfter);
  return NextResponse.json(body, init);
}
