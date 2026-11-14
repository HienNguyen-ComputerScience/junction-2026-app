"use client";

import { useBriefingChoices } from "@/components/briefing/shell";
import { SaveShare, type ShareOption } from "@/components/share";

/**
 * The briefing's way out of the browser, on its last step: this briefing on paper, the action
 * plan as a Word or Excel file (with the actions shown in step 4 and the target year chosen in
 * step 5), and the briefing's address by email. The shared "Save or share" control, open.
 */
export function BriefingShare({
  areaName,
  planFilePath,
  actionIds,
  targetLevels,
  briefingPath,
}: {
  areaName: string;
  /** The plan download route, without a query. */
  planFilePath: string;
  actionIds: string[];
  /** Per action, the published level its target aims for ("finland" or "best"), or null. */
  targetLevels: (string | null)[];
  /** The address of step 1 of this briefing, without the site's origin. */
  briefingPath: string;
}) {
  const { action, year } = useBriefingChoices();
  const level = targetLevels[Math.min(action, targetLevels.length - 1)] ?? null;
  const fileHref = (format: "docx" | "xlsx") => {
    const query = new URLSearchParams({ format, year: String(year) });
    if (actionIds.length > 0) query.set("actions", actionIds.join(","));
    if (level) query.set("target", level);
    return `${planFilePath}?${query.toString()}`;
  };

  const options: ShareOption[] = [
    { kind: "print", label: "Print the whole briefing", hint: "Every figure with its source" },
    ...(actionIds.length > 0
      ? ([
          { kind: "word", href: fileHref("docx"), hint: "The action plan, with blank lines for names, dates and cost" },
          { kind: "excel", href: fileHref("xlsx"), hint: "The same plan as tables" },
        ] satisfies ShareOption[])
      : []),
    {
      kind: "email",
      label: "Email a link to this briefing",
      path: briefingPath,
      subject: `Briefing: early cancer care in ${areaName}`,
      intro: `A short briefing on where early cancer care slows in ${areaName}, and what to do about it:`,
    },
  ];

  return <SaveShare inline options={options} label={`Save or share the briefing for ${areaName}`} className="max-w-[44rem]" />;
}
