import type { Metadata } from "next";

import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";

export const metadata: Metadata = { title: "Ask the evidence | FirstLine" };

/** The question box and the month's national news, moved off the home page. */
export default function AskPage() {
  return (
    <main className="page-container flex flex-col gap-10 pt-4 sm:gap-14 sm:pt-6">
      <h1 className="sr-only">Ask the evidence</h1>
      <AskBox />
      <NationalNews />
    </main>
  );
}
