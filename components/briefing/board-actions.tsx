"use client";

import { ArrowRight, Mail, Printer } from "lucide-react";
import Link from "next/link";

import { useBriefingChoices } from "@/components/briefing/shell";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/briefing/ui";

/**
 * The three ways out of the browser at the end of the briefing: the board-ready plan (with the
 * target year chosen in step 5 passed on), this briefing on paper, and its address by email.
 */
export function BoardActions({
  areaName,
  planPath,
  targetLevels,
  briefingPath,
}: {
  areaName: string;
  planPath: string;
  /** Per action, the published level its target aims for ("finland" or "best"), or null. */
  targetLevels: (string | null)[];
  /** The address of step 1 of this briefing, without the site's origin. */
  briefingPath: string;
}) {
  const { action, year } = useBriefingChoices();
  const level = targetLevels[Math.min(action, targetLevels.length - 1)] ?? null;
  const query = new URLSearchParams({ ...(level ? { target: level } : {}), year: String(year) });

  function sendByEmail() {
    const address = `${window.location.origin}${briefingPath}`;
    const subject = `Briefing: early cancer care in ${areaName}`;
    const body = `A two-minute briefing on where early cancer care slows in ${areaName}, and what to do about it:\n\n${address}\n\nEvery figure in it names its public source.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link href={`${planPath}?${query.toString()}`} className={PRIMARY_BUTTON}>
        Open the plan for your board
        <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
      </Link>
      <button type="button" onClick={() => window.print()} className={SECONDARY_BUTTON}>
        <Printer aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
        Print this briefing
      </button>
      <button type="button" onClick={sendByEmail} className={SECONDARY_BUTTON}>
        <Mail aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
        Send this briefing by email
      </button>
    </div>
  );
}
