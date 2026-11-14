import { ArrowUpRight } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import {
  FINNISH_ROADMAP,
  NO_MATCH_LINKS,
  RED_FLAG_CATEGORIES,
  TIERS,
  type GuidelineLink,
  type Urgency,
} from "@/lib/red-flags";

/** The four routes, fastest first, with the short label each card leads with. */
const ROUTES: { urgency: Urgency; label: string }[] = [
  { urgency: "urgent", label: "Fast track" },
  { urgency: "vague", label: "Vague-symptoms work-up" },
  { urgency: "prompt", label: "See a GP soon" },
  { urgency: "safety_net", label: "Safety-net and recheck" },
];

/** One to three words per concern for the tags; the full label stays in the title attribute. */
const SHORT_LABEL: Record<string, string> = {
  bleeding: "Bleeding",
  lump: "Lump or swelling",
  swallowing: "Trouble swallowing",
  vague: "Vague symptoms",
  "persistent-change": "Change that won't heal",
};

/** The first sentence of a tier's gpAction. */
function firstSentence(text: string): string {
  return text.split(/(?<=\.)\s/)[0];
}

/** A guideline link's short visible name: "NICE NG12", "Käypä hoito", "Vedsted & Olesen 2015". */
function shortName(label: string): string {
  const name = label
    .split(": ")[0]
    .split(",")[0]
    .replace(/\s*\(.*$/, "");
  return name.startsWith("NICE NG12") ? "NICE NG12" : name;
}

/** Two NICE NG12 pages in one list need telling apart; the rest of the label does that. */
function detailSuffix(label: string): string {
  if (/by symptom/.test(label)) return "by symptom";
  if (/by site/.test(label)) return "by site";
  if (/safety netting/.test(label)) return "safety-netting";
  return "";
}

/** The links the tier's categories use, each once. The safety-net tier has no category: it uses the fallback links. */
function tierLinks(urgency: Urgency): GuidelineLink[] {
  const links =
    urgency === "safety_net"
      ? NO_MATCH_LINKS
      : RED_FLAG_CATEGORIES.filter(
          (category) => category.urgency === urgency,
        ).flatMap((category) => category.links);
  return [...new Map(links.map((link) => [link.url, link])).values()];
}

function LinkChips({ links }: { links: GuidelineLink[] }) {
  const names = links.map((link) => shortName(link.label));
  return (
    <ul role="list" className="contents">
      {links.map((link, index) => {
        const name = names[index];
        const suffix =
          names.filter((other) => other === name).length > 1
            ? detailSuffix(link.label)
            : "";
        return (
          <li key={link.url} className="mr-1.5 flex items-center gap-1.5">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={`${link.label} (opens in a new tab)`}
              className="inline-flex h-6 items-center gap-1 rounded-sm border border-input px-1.5 text-[0.8125rem] font-medium text-brand-ink outline-none hover:bg-background/60 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-9"
            >
              {suffix ? `${name} · ${suffix}` : name}
              <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
            </a>
            {link.source_id ? <SourceChip sourceId={link.source_id} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

const ROW_LABEL = "type-note w-[7.5rem] shrink-0 whitespace-nowrap text-muted-foreground";

/**
 * Static panel for county administrators: the four referral routes a county needs, what each is
 * for, and the precedent or guideline behind it. No input and no symptom judgement; everything
 * comes from lib/red-flags.ts. Neutral surfaces: red and amber are reserved for data status.
 */
export function ReferralRoutes() {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid gap-3 md:grid-cols-2">
        {ROUTES.map(({ urgency, label }, index) => {
          const tier = TIERS[urgency];
          const concerns = RED_FLAG_CATEGORIES.filter(
            (category) => category.urgency === urgency,
          );
          return (
            <li
              key={urgency}
              className="flex flex-col gap-2 rounded-lg border border-input px-4 py-2.5"
            >
              <div className="flex gap-2.5">
                <span
                  aria-hidden
                  className="type-heading text-muted-foreground"
                >
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <h3 className="type-heading">{label}</h3>
                  {tier.title !== label ? (
                    <p className="type-caption text-muted-foreground">
                      {tier.title}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={ROW_LABEL}>For</span>
                  {concerns.length > 0 ? (
                    concerns.map((category) => (
                      <span
                        key={category.id}
                        title={category.label}
                        className="inline-flex h-6 items-center rounded-full border border-border px-2.5 text-[0.8125rem]"
                      >
                        {SHORT_LABEL[category.id] ?? category.label}
                      </span>
                    ))
                  ) : (
                    <span className="type-caption text-muted-foreground">
                      Concerns that match no category
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-y-1">
                  <span className={ROW_LABEL}>Precedent / guideline</span>
                  <LinkChips links={tierLinks(urgency)} />
                </div>
                <p className="text-sm leading-snug text-pretty">
                  <span className="type-note mr-2 text-muted-foreground">
                    GP does
                  </span>
                  {firstSentence(tier.gpAction)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        Finland has no national referral criteria yet: Finnish cancer strategy
        roadmap 2026–2031, measure 2.5.2
        {FINNISH_ROADMAP.source_id ? (
          <SourceChip sourceId={FINNISH_ROADMAP.source_id} />
        ) : null}
      </p>
    </div>
  );
}
