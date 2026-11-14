import { cn } from "cn";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActionSummary } from "@/components/act/action-card";
import { lowerFirst, STEP_SHORT } from "@/components/act/action-copy";
import { ActionItem } from "@/components/act/action-item";
import { ReferralRoutes } from "@/components/act/referral-routes";
import { EvidenceFinder } from "@/components/exa/evidence-finder";
import { AnimatedNumber, CaveatNote, Disclosure, FocusGroup, Reveal } from "@/components/motion";
import { SaveShare, type ShareOption } from "@/components/share";
import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/ui/status-badge";
import { SELECTION_RULE, STAGE_LABELS, getBottleneck, otherActions, pickActions, type Bottleneck } from "@/lib/act";
import { plainTitle } from "@/lib/action-title";
import { counties, getCounty, type Evidence } from "@/lib/data";
import { MOTION_LOUD_CLASS } from "@/lib/motion";
import { STATUS_LABEL, formatPct, getIndicator } from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export async function generateMetadata({ params }: PageProps<"/county/[id]/act">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  return { title: `${county.name}: what to do | FirstLine` };
}

/** What the lead figure counts, in one short line under it. */
const FIGURE_CAPTION: Record<string, string> = {
  "6411": "of non-urgent GP visits waited over 7 days",
  "13": "of referrals processed within 3 days",
};

/** The figure's main caveat in a few words, always visible; the indicator's full limitation is behind "Why?". */
const FIGURE_CAVEAT: Record<string, string> = {
  "6411": "All non-urgent GP visits, not only cancer",
  "13": "When assessment starts, not when the patient is seen",
};

/** The page's one statement: the area's main delay, in at most 12 words. */
function statement(name: string, { focus, anyRed }: Bottleneck): string {
  if (focus.length === 0) return `${name}: no published pathway figures`;
  if (!anyRed) return `${name}: no step worse than Finland. Closest: ${lowerFirst(STEP_SHORT[focus[0].stage])}`;
  return `${name}'s ${focus.length > 1 ? "worst " : ""}delay: ${lowerFirst(STEP_SHORT[focus[0].stage])}`;
}

/** Why these actions and no others: the selection rule, the unmeasured steps, and what the figure covers. */
function whyNotes(countyName: string, bottleneck: Bottleneck): string[] {
  const notes = [SELECTION_RULE];
  for (const gap of bottleneck.noData) {
    notes.push(
      gap.shared
        ? `${STAGE_LABELS[gap.stage]}: Sotkanet publishes only a ${gap.shared.name}-wide figure, not one for ${countyName}, so this step is not used to pick actions. Its options are under "Show the other actions".`
        : `${STAGE_LABELS[gap.stage]}: there is no ${countyName} figure, so this step is not used to pick actions.`,
    );
  }
  notes.push("GP recognises warning signs: there is no public data on this anywhere in Finland.");
  return notes;
}

export default async function CountyActPage({ params }: PageProps<"/county/[id]/act">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const bottleneck = getBottleneck(county.id);
  const recommended = pickActions(bottleneck);
  const others = otherActions(county.id, recommended);
  const unmeasured = others.filter((group) => group.unmeasured && group.stage !== "gp_recognition");
  const remaining = others.filter((group) => !unmeasured.includes(group));
  const otherCount = others.reduce((total, group) => total + group.actions.length, 0);
  const lead = bottleneck.focus[0];
  const leadValue = lead?.value ?? null;
  // The step pill only says something when the actions work on more than one step; otherwise the H1 already names it.
  const showStep = new Set(recommended.map((action) => action.stage)).size > 1;

  // The plan as a file: the same model and writers the plan page used, with blank lines for names, dates and cost.
  const fileHref = (format: "docx" | "xlsx") =>
    `/county/${county.id}/plan/export?${new URLSearchParams({ format, actions: recommended.map((action) => action.id).join(",") })}`;
  const shareOptions: ShareOption[] = [
    { kind: "print" },
    ...(recommended.length > 0
      ? ([
          { kind: "word", href: fileHref("docx"), hint: "The action plan, with blank lines for names, dates and cost" },
          { kind: "excel", href: fileHref("xlsx"), hint: "The same plan as tables" },
        ] satisfies ShareOption[])
      : []),
    { kind: "email", subject: `What to do: early cancer care in ${county.name}`, intro: `The recommended actions for ${county.name}, from published figures:` },
  ];

  return (
    <main className={`page-container flex flex-col pt-4 sm:pt-6 ${MOTION_LOUD_CLASS}`}>
      <Breadcrumb
        items={[{ label: "Areas", href: "/" }, { label: county.name, href: `/county/${county.id}` }, { label: "Actions" }]}
      />

      {/* The focus effect covers the opening and the action cards, not the end card or the way back. */}
      <FocusGroup>
        {/* 1. The main delay, its figure, and the one thing to do with it. */}
        <section data-focus-item aria-labelledby="act-title" className="mt-6 flex flex-col gap-6 rounded-lg bg-keylime-wash px-7 py-9 sm:px-12 sm:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <Reveal index={0}>
              <h1 id="act-title" className="type-page max-w-[22ch] text-pretty">
                {statement(county.name, bottleneck)}
              </h1>
            </Reveal>
            <SaveShare options={shareOptions} align="end" className="sm:shrink-0 sm:items-end" />
          </div>
          {lead && leadValue !== null ? (
            <Reveal index={1} className="flex flex-col gap-2">
              <p className={cn("numeral text-[4rem] leading-none sm:text-[5rem]", bottleneck.anyRed ? "text-status-red-ink" : "text-forest-ink")}>
                <AnimatedNumber value={leadValue} final={formatPct(leadValue)} decimals={1} level="loud" />
              </p>
              <p className="text-lg text-foreground">{FIGURE_CAPTION[lead.indicator_id] ?? getIndicator(lead.indicator_id)?.short_name}</p>
              <span className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex min-h-8 items-center rounded-full bg-cream-paper px-3.5 text-base text-forest-ink">
                  Finland {formatPct(lead.national_value)}
                </span>
                <SourceChip sourceId={lead.source_id} year={lead.year} />
              </span>
              {FIGURE_CAVEAT[lead.indicator_id] ? (
                <CaveatNote short={FIGURE_CAVEAT[lead.indicator_id]} className="mt-2">
                  {getIndicator(lead.indicator_id)?.limitation}
                </CaveatNote>
              ) : null}
            </Reveal>
          ) : null}
          <Reveal index={2}>
            <Disclosure tone="quiet" show="Why only these actions?" hide="Hide why">
              <ul className="flex max-w-[62ch] flex-col gap-2.5 rounded-lg bg-cream-paper px-5 py-4 text-base leading-relaxed text-pretty print:px-0">
                <li className="hidden font-semibold text-forest-ink print:block">Why only these actions</li>
                {whyNotes(county.name, bottleneck).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Disclosure>
          </Reveal>
        </section>

        {/* 2. The actions, one card each. */}
        {recommended.length > 0 ? (
          <section aria-labelledby="actions-title" className="mt-12 sm:mt-16">
            <h2 id="actions-title" className="mb-8 font-display text-[2rem] leading-[1.15] font-light text-forest-ink sm:text-[2.75rem]">
              Recommended actions for {county.name}
            </h2>
            <ol className="flex max-w-3xl flex-col gap-16 md:gap-[28vh]">
              {recommended.map((action, index) => (
                <li key={action.id} className="print-flow">
                  <ActionItem action={action} index={index + 1} showStep={showStep} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </FocusGroup>

      {/* 3. Everything else, as three buttons. */}
      <section aria-label={`More for ${county.name}`} className="mt-[14vh] flex flex-col rounded-lg bg-slate-hush px-7 py-4 sm:px-10">
        {otherCount > 0 ? (
          <Disclosure
            className="py-4"
            defaultOpen={recommended.length === 0}
            show={`Show the ${otherCount} other actions`}
            hide="Hide the other actions"
          >
            <div className="flex flex-col gap-1.5">
              {unmeasured.map((group) => (
                <section key={group.stage} aria-labelledby={`unmeasured-${group.stage}`}>
                  <GroupHead
                    id={`unmeasured-${group.stage}`}
                    title={`${STAGE_LABELS[group.stage]}: can't be measured here yet`}
                    note={`${group.unmeasured} These actions still apply if the county finds a delay at this step.`}
                    noData
                  />
                  <SummaryGrid actions={group.actions} />
                </section>
              ))}
              {remaining.map((group) => (
                <section key={group.stage} aria-labelledby={`other-${group.stage}`}>
                  <GroupHead
                    id={`other-${group.stage}`}
                    title={STAGE_LABELS[group.stage]}
                    note={group.unmeasured}
                    noData={group.unmeasured !== null}
                  />
                  <SummaryGrid actions={group.actions} />
                </section>
              ))}
            </div>
          </Disclosure>
        ) : null}

        <div id="referral-routes" className="scroll-mt-28 border-t border-border-mist py-4 first:border-t-0">
          <Disclosure show="Show the four referral routes a county needs" hide="Hide the referral routes">
            <div className="flex flex-col gap-4 rounded-lg bg-cream-paper px-5 py-5 sm:px-7">
              <p className="text-base font-semibold text-forest-ink">
                The four referral routes a county needs. Decision support for the county, not diagnosis.
              </p>
              <ReferralRoutes />
            </div>
          </Disclosure>
        </div>

        {recommended.length > 0 ? (
          <div data-print="hide" className="border-t border-border-mist py-4">
            <Disclosure show="Search new research for these actions" hide="Hide the search">
              <div className="flex flex-col gap-5 rounded-lg bg-cream-paper px-5 py-5 sm:px-7">
                <p className="text-base text-foreground">Web results are new and not checked by us.</p>
                <ol className="flex flex-col gap-5">
                  {recommended.map((action, index) => (
                    <li key={action.id} className="flex flex-col gap-2">
                      <h3 className="type-heading text-pretty">
                        Action {index + 1}: {plainTitle(action.action)}
                      </h3>
                      <EvidenceFinder actionId={action.id} actionTitle={action.action} />
                    </li>
                  ))}
                </ol>
              </div>
            </Disclosure>
          </div>
        ) : null}
      </section>

      <nav aria-label="Page" className="mt-12">
        <BackLink href={`/county/${county.id}`}>Back to {county.name}</BackLink>
      </nav>
    </main>
  );
}

function GroupHead({ id, title, note, noData = false }: { id: string; title: string; note: string | null; noData?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-1 pt-3 pb-3">
      <h3 id={id} className="type-heading flex flex-wrap items-center gap-2">
        {title}
        {noData ? (
          <StatusBadge status="no_data" size="xs">
            {STATUS_LABEL.no_data}
          </StatusBadge>
        ) : null}
      </h3>
      {note ? <p className="max-w-[52rem] text-base text-pretty text-foreground">{note}</p> : null}
    </div>
  );
}

function SummaryGrid({ actions }: { actions: Evidence[] }) {
  return (
    <ul className="grid gap-1.5 md:grid-cols-2">
      {actions.map((action) => (
        <li key={action.id}>
          <ActionSummary action={action} />
        </li>
      ))}
    </ul>
  );
}
