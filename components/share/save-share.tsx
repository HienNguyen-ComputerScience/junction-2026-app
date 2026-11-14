"use client";

import { ChevronDown, FileSpreadsheet, FileText, Mail, Printer } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "cn";

/**
 * One option of the "Save or share" control. Plain data, so a server page can pass it.
 *
 * - `print`: prints this page (the print stylesheet decides what goes on paper).
 * - `word` / `excel`: a file download from `href` (a route that answers with the file).
 * - `email`: opens the reader's own email program with a link to `path` (default: this page)
 *   under `intro`. Nothing is sent by FirstLine.
 */
export type ShareOption =
  | { kind: "print"; label?: string; hint?: string }
  | { kind: "word" | "excel"; href: string; label?: string; hint?: string }
  | { kind: "email"; subject: string; intro: string; path?: string; label?: string; hint?: string };

const LABEL: Record<ShareOption["kind"], string> = {
  print: "Print or save as PDF",
  word: "Download for Word",
  excel: "Download for Excel",
  email: "Email a link to this page",
};

const ICON: Record<ShareOption["kind"], ReactNode> = {
  print: <Printer aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />,
  word: <FileText aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />,
  excel: <FileSpreadsheet aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />,
  email: <Mail aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />,
};

/** The trigger: the outline button of the site (Forest Ink edge and text, 14px corners, no shadow). */
const TRIGGER =
  "inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-[14px] border border-forest-ink bg-cream-paper px-[21px] py-[13px] text-base leading-6 font-semibold text-forest-ink transition-colors hover:bg-mint-veil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink aria-expanded:bg-mint-veil";

/** One option: a full-width row with its icon, label and an optional one-line hint. */
const OPTION =
  "flex h-full min-h-[3.25rem] w-full items-start gap-3 rounded-[14px] border border-input bg-cream-paper px-4 py-3 text-left text-base leading-6 text-forest-ink transition-colors hover:bg-keylime-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink";

const noSubscribe = () => () => {};

/** The site's address ("https://…"), known only in the browser; "" while the page is drawn on the server. */
function useOrigin(): string {
  return useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
}

function emailHref(option: Extract<ShareOption, { kind: "email" }>, origin: string, pathname: string): string {
  const body = `${option.intro}

${origin}${option.path ?? pathname}

Every figure in it names its public source.`;
  return `mailto:?subject=${encodeURIComponent(option.subject)}&body=${encodeURIComponent(body)}`;
}

function OptionContent({ option }: { option: ShareOption }) {
  return (
    <>
      <span className="mt-0.5">{ICON[option.kind]}</span>
      <span className="flex flex-col">
        <span className="font-semibold">{option.label ?? LABEL[option.kind]}</span>
        {option.hint ? <span className="text-base text-charcoal">{option.hint}</span> : null}
      </span>
    </>
  );
}

/** The options as a list of real buttons and links. `done` runs after one is used. */
function Options({ options, done, id, labelledBy, label, columns = false }: {
  options: ShareOption[];
  done?: () => void;
  id?: string;
  labelledBy?: string;
  label?: string;
  /** Two columns from 640px (the open, inline list). */
  columns?: boolean;
}) {
  const origin = useOrigin();
  const pathname = usePathname();
  // Closed after the click has started the download or the email, so the link is still in the page for it.
  const after = () => setTimeout(() => done?.(), 0);
  return (
    <div id={id} role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label}>
      <ul className={cn("flex flex-col gap-2", columns && "sm:grid sm:grid-cols-2")}>
      {options.map((option) => (
        <li key={option.kind}>
          {option.kind === "print" ? (
            <button
              type="button"
              className={OPTION}
              onClick={() => {
                done?.();
                window.print();
              }}
            >
              <OptionContent option={option} />
            </button>
          ) : option.kind === "email" ? (
            <a href={emailHref(option, origin, pathname)} className={OPTION} onClick={after}>
              <OptionContent option={option} />
            </a>
          ) : (
            <a href={option.href} download className={OPTION} onClick={after}>
              <OptionContent option={option} />
            </a>
          )}
        </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Save or share": the one export entry point of a page. A plainly labelled button that opens a
 * short list of plain, labelled options (print, Word, Excel, email), only those the page has.
 *
 * A disclosure, not an ARIA menu: the options are ordinary buttons and links in Tab order, which
 * is what a reader who is not fluent with web apps already knows. It opens on click (never on
 * hover), closes on Escape, on a click outside and when an option is used, and gives the
 * keyboard focus back to the button. On a phone the list sits in the page flow under the button,
 * so it cannot be covered by a fixed bar; from 640px it floats over the page below. Hidden on paper.
 *
 * `inline`: the options are shown at once with no button, for a place whose whole job is
 * saving or sharing (the last step of the briefing).
 */
export function SaveShare({
  options,
  inline = false,
  align = "start",
  label = "Save or share",
  className,
}: {
  options: ShareOption[];
  inline?: boolean;
  /** From 640px the list floats under the button, lined up with its start or its end edge. */
  align?: "start" | "end";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const triggerId = useId();

  useEffect(() => {
    if (!open) return;
    // The first option takes the focus, so a keyboard or screen reader user lands in the list.
    wrapper.current?.querySelector<HTMLElement>(`[id="${panelId}"] a, [id="${panelId}"] button`)?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, panelId]);

  if (options.length === 0) return null;

  if (inline) {
    return (
      <div data-slot="save-share" data-print="hide" className={cn("print:hidden", className)}>
        <Options options={options} label={label} columns />
      </div>
    );
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      ref={wrapper}
      data-slot="save-share"
      data-print="hide"
      className={cn("relative flex w-full flex-col items-start gap-2 print:hidden sm:w-auto", className)}
      onBlur={(event) => {
        // Tabbing out of the list closes it, without moving the focus back.
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null) && event.relatedTarget) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={TRIGGER}
      >
        {label}
        <ChevronDown aria-hidden className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")} strokeWidth={1.75} />
      </button>
      {open ? (
        <div
          // Its own stagger index: an --i inherited from a Reveal around the control would delay it.
          style={{ "--i": 0 } as CSSProperties}
          className={cn("animate-fade-up z-30 w-full rounded-[14px] bg-mint-veil p-2 sm:absolute sm:top-full sm:mt-2 sm:w-[22rem]", align === "end" ? "sm:right-0" : "sm:left-0")}>
          <Options options={options} done={close} id={panelId} labelledBy={triggerId} />
        </div>
      ) : (
        <span id={panelId} hidden />
      )}
    </div>
  );
}
