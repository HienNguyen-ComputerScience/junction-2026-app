"use client";

import { Mail } from "lucide-react";
import { type MouseEvent } from "react";

import { Button } from "@/components/ui/button";

/**
 * "Send this plan by email": opens the reader's own email program with a message that carries a
 * link to this plan, including what has been typed into the form so far (not yet saved anywhere:
 * the link itself holds it). Nothing is sent by FirstLine.
 */
export function EmailPlanButton({ countyName, path }: { countyName: string; path: string }) {
  function send(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const params = new URLSearchParams();
    if (form) {
      for (const [name, value] of new FormData(form)) {
        if (typeof value === "string" && value.trim() !== "" && name !== "format") params.set(name, value);
      }
    }
    const query = params.toString();
    const link = `${window.location.origin}${path}${query ? `?${query}` : ""}`;
    const subject = `Action plan for earlier cancer diagnosis: ${countyName}`;
    const body = [
      `The action plan for ${countyName}, drawn up with FirstLine from published figures, with its sources:`,
      "",
      link,
      "",
      "The page prints, and downloads as Word or Excel.",
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <Button type="button" variant="outline" onClick={send}>
      <Mail aria-hidden strokeWidth={1.75} data-icon="inline-start" />
      Send this plan by email
    </Button>
  );
}
