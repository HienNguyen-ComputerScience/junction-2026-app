import { ArrowUpRight } from "lucide-react";

import { SourceChip } from "@/components/source-chip";
import { Disclosure } from "@/components/ui/disclosure";
import {
  FINNISH_ROADMAP,
  KAYPA_HOITO,
  NICE_NG12,
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

/** The two studies behind the vague route, named by country and author or setting. */
const STUDY_NAME: Record<string, string> = {
  "ev-pmc-pmc4385978": "Denmark: Vedsted & Olesen 2015",
  "ev-pmc-pmc7462853": "England: diagnostic centres, 2020",
};

/** The first sentence of a tier's gpAction. */
function firstSentence(text: string): string {
  return text.split(/(?<=\.)\s/)[0];
}

/** One chip per guideline family: every NICE NG12 page is the one NICE NG12 link, every Käypä hoito page the one Käypä hoito link. */
function canonical(link: GuidelineLink): GuidelineLink {
  if (link.label.startsWith("NICE NG12")) return NICE_NG12;
  if (link.label.startsWith("Käypä hoito")) return KAYPA_HOITO;
  return link;
}

/** The chip's visible name: "NICE NG12", "Käypä hoito", or a study's country and author. */
function chipName(link: GuidelineLink): string {
  if (link.source_id && STUDY_NAME[link.source_id])
    return STUDY_NAME[link.source_id];
  const name = link.label
    .split(": ")[0]
    .split(",")[0]
    .replace(/\s*\(.*$/, "");
  return name.startsWith("NICE NG12") ? "NICE NG12" : name;
}

/** The families the tier's categories use, each once. The safety-net tier has no category: it uses the fallback links. */
function tierLinks(urgency: Urgency): GuidelineLink[] {
  const links =
    urgency === "safety_net"
      ? NO_MATCH_LINKS
      : RED_FLAG_CATEGORIES.filter(
          (category) => category.urgency === urgency,
        ).flatMap((category) => category.links);
  return [
    ...new Map(links.map(canonical).map((link) => [link.url, link])).values(),
  ];
}

/** The link chip, with its source chip next to it only where the link is itself a source. */
function LinkChips({ links }: { links: GuidelineLink[] }) {
  return (
    <ul role="list" className="contents">
      {links.map((link) => (
        <li key={link.url} className="flex items-center gap-1">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={`${link.label} (opens in a new tab)`}
            className="inline-flex h-6 items-center gap-1 rounded-sm border border-input px-1.5 text-[0.8125rem] font-medium text-brand-ink outline-none hover:bg-background/60 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-9"
          >
            {chipName(link)}
            <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
          </a>
          {link.source_id ? <SourceChip sourceId={link.source_id} /> : null}
        </li>
      ))}
    </ul>
  );
}

const ROW_LABEL = "type-note shrink-0 whitespace-nowrap text-muted-foreground";

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
          const links = tierLinks(urgency);
          const concerns = RED_FLAG_CATEGORIES.filter(
            (category) => category.urgency === urgency,
          );
          return (
            <li
              key={urgency}
              className="flex flex-col gap-1.5 rounded-lg border border-input px-4 py-2.5"
            >
              <h3 className="type-heading flex gap-2.5">
                <span aria-hidden className="text-muted-foreground">
                  {index + 1}
                </span>
                {label}
              </h3>
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
              <p className="text-sm leading-snug text-pretty">
                <span className="type-note mr-2 text-muted-foreground">
                  GP does
                </span>
                {firstSentence(tier.gpAction)}
              </p>
              <Disclosure
                summary={`Evidence (${links.length})`}
                summaryClassName="min-h-7"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 pb-1">
                  <LinkChips links={links} />
                </div>
              </Disclosure>
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
