import type { Metadata } from "next";
import { cn } from "cn";

import { Reveal } from "@/components/motion";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MOTION_LOUD_CLASS } from "@/lib/motion";

import { AskPanel } from "./ask-panel";
import { NewsPanel } from "./news-panel";

export const metadata: Metadata = {
  title: "Ask the evidence | FirstLine",
  description:
    "Ask a question about health care in Finland and get recent web sources with a short answer written from them.",
};

/**
 * /ask, in the family of /how-to-read and /sources: eyebrow, one serif statement, one line on
 * what comes back (including that web results are not checked by us), then framed cards: the
 * question box with three examples, the answer once there is one, and the month's news.
 */
export default function AskPage() {
  return (
    <main className={cn("page-container flex flex-col gap-10 pt-4 pb-12 sm:pt-6", MOTION_LOUD_CLASS)}>
      {/* Asking needs script; without it, the box and the news are hidden and this says why. */}
      <noscript>
        <style>{"[data-needs-js]{display:none!important}"}</style>
      </noscript>

      <header className="flex flex-col items-start gap-6">
        <Breadcrumb items={[{ label: "Areas", href: "/" }, { label: "Ask the evidence" }]} />
        <Reveal className="flex max-w-[52rem] flex-col gap-3">
          <p className="type-eyebrow">Ask the evidence</p>
          <h1 className="type-page text-balance">Ask a question about health care in Finland.</h1>
          <p className="type-lede max-w-[44rem] text-pretty text-foreground">
            You get recent web sources and a short answer written from them by AI. If you name an area, you also get
            our dashboard figure for it. Web results are new and not checked by us.
          </p>
        </Reveal>
      </header>

      <noscript>
        <p className="rounded-[14px] border border-sage-mist bg-keylime-wash p-[21px] text-base text-foreground sm:p-7">
          Asking a question needs JavaScript, which is turned off in this browser. The rest of FirstLine works without
          it.
        </p>
      </noscript>

      <Reveal index={1}>
        <AskPanel />
      </Reveal>

      <Reveal index={2}>
        <NewsPanel />
      </Reveal>
    </main>
  );
}
