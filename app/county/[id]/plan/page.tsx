import { ChevronDown, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { cn } from "cn";

import { Disclosure, PrintButton, Reveal } from "@/components/motion";
import { EmailPlanButton } from "@/components/plan/email-plan-button";
import { StepUnit } from "@/components/stat/step-unit";
import { SourceChip } from "@/components/source-chip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FramePanel } from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
import { counties, getCounty } from "@/lib/data";
import { TARGET_YEARS } from "@/lib/plan";
import { targetGoal, targetMilestones, targetPace } from "@/lib/plan-export";
import { buildPlan, type Plan, type PlanAction } from "@/lib/plan-model";
import { formatPct } from "@/lib/ranking";

// Counties are a fixed, known set; the plan itself is drawn up per request (its query holds the
// target and the typed fields), so it streams in behind the page heading.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export async function generateMetadata({ params }: PageProps<"/county/[id]/plan">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  return { title: `${county.name}: action plan | FirstLine` };
}

const FIELD =
  "h-11 w-full rounded-lg border border-input bg-cream-paper px-3 text-base text-foreground outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const LABEL = "text-sm font-semibold text-foreground";

function longDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** A section of the plan: a numbered serif title, then its content. */
function Section({ id, number, title, intro, children }: { id: string; number: number; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 break-inside-auto">
      <div className="flex flex-col gap-1.5">
        <p className="type-eyebrow">Part {number}</p>
        <h2 id={id} className="type-title">
          {title}
        </h2>
        {intro ? <div className="max-w-[68ch] text-base text-muted-foreground">{intro}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** A table cell that also reads as a labelled row on a phone (see `stack-table` in globals.css). */
function Td({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <td data-label={label} className={cn("px-3 py-3 align-top first:pl-0 last:pr-0", className)}>
      <div>{children}</div>
    </td>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-3 pb-2 text-left align-bottom text-sm font-semibold text-muted-foreground first:pl-0 last:pr-0", className)}>
      {children}
    </th>
  );
}

/** Print, Word, Excel, email. Word and Excel are submit buttons of the plan's form, so they carry what was typed. */
function Toolbar({ plan, exportPath, position }: { plan: Plan; exportPath: string; position: "top" | "bottom" }) {
  return (
    <div data-print="hide" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <PrintButton variant="default" />
        <Button type="submit" variant="outline" formAction={exportPath} name="format" value="docx">
          <FileText aria-hidden strokeWidth={1.75} data-icon="inline-start" />
          Download as Word
        </Button>
        <Button type="submit" variant="outline" formAction={exportPath} name="format" value="xlsx">
          <FileSpreadsheet aria-hidden strokeWidth={1.75} data-icon="inline-start" />
          Download for Excel
        </Button>
        <EmailPlanButton countyName={plan.county.name} path={`/county/${plan.county.id}/plan`} />
      </div>
      {position === "top" ? (
        <p className="text-sm text-muted-foreground">
          The print, the Word file, the Excel file and the email link all include what you type into the fields below. Nothing is
          saved on FirstLine.
        </p>
      ) : null}
    </div>
  );
}

/** One step of the pathway as a small unit: the figure, what it counts, Finland, the status in words, the source. */
function Row({ label, children, strong = false }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="grid gap-1 border-t border-border py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
      <dd className={cn("text-base", strong && "font-semibold text-forest-ink")}>{children}</dd>
    </div>
  );
}

function ActionBlock({ action, index }: { action: PlanAction; index: number }) {
  const n = action.number;
  return (
    <Reveal as="article" index={index}>
      <FramePanel padding="none" className="flex flex-col gap-2 p-6 sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <p className="type-eyebrow">
            Action {n} · {action.step}
          </p>
          <SourceChip sourceId={action.sourceId} />
        </div>
        <h3 className="font-display text-[1.75rem] leading-tight font-light text-forest-ink">{action.title}</h3>
        <p className="max-w-[68ch] text-base text-muted-foreground">{action.detail}</p>

        <dl className="mt-3">
          <Row label="Responsible role">{action.role}</Row>
          <Row label="First step" strong>
            {action.firstStep}
          </Row>
          <Row label="How you will know it worked">{action.success}</Row>
          <Row label="National roadmap">
            {action.measure ? (
              <>
                Measure {action.measure.measure_id}: {action.measure.title}. Responsible nationally: {action.measure.responsible}.{" "}
                <span className="text-muted-foreground">Funding (national): {action.measure.funding}</span>
              </>
            ) : (
              "The national roadmap has no measure that names this action."
            )}
          </Row>
          <Row label="Result where it was tried">
            {`${action.triedWhere} ${action.triedResult}`.trim()}
          </Row>
          <Row label="Limits of that evidence">{action.limitations}</Row>
        </dl>

        {action.measure ? (
          <Disclosure label="the roadmap's schedule for this measure" tone="quiet" className="mt-1">
            <ol className="flex flex-col gap-2">
              {action.measure.schedule.map((item) => (
                <li key={item.period} className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                  <span className="font-semibold">{item.period}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              National cancer strategy roadmap 2026–2031, {action.measure.pages}.{" "}
              <SourceChip sourceId={action.measure.source_id} />
            </p>
          </Disclosure>
        ) : null}

        <fieldset className="print-keep mt-4 rounded-lg bg-mint-veil p-5 sm:p-6">
          <legend className="sr-only">Fill in for action {n}</legend>
          <p className="mb-4 text-base font-semibold text-forest-ink">Fill in for your board</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`person${n}`} className={LABEL}>
                Named person responsible
              </label>
              <input id={`person${n}`} name={`person${n}`} defaultValue={action.person} maxLength={80} autoComplete="off" className={FIELD} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`review${n}`} className={LABEL}>
                Review date
              </label>
              <input id={`review${n}`} name={`review${n}`} type="date" defaultValue={action.review} className={FIELD} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`cost${n}`} className={LABEL}>
                Local cost estimate (€)
              </label>
              <input id={`cost${n}`} name={`cost${n}`} defaultValue={action.cost} maxLength={80} inputMode="decimal" autoComplete="off" aria-describedby={`cost${n}-note`} className={FIELD} />
              <p id={`cost${n}-note`} className="text-sm text-muted-foreground">
                No county-level cost is published. Enter your own estimate.
              </p>
            </div>
          </div>
        </fieldset>
      </FramePanel>
    </Reveal>
  );
}

async function PlanBody({ id, searchParams }: { id: string; searchParams: PageProps<"/county/[id]/plan">["searchParams"] }) {
  // The plan is dated the day it is opened, so it is drawn up per request.
  await connection();
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  const plan = buildPlan(id, params);
  if (!plan) notFound();

  const pagePath = `/county/${plan.county.id}/plan`;
  const exportPath = `${pagePath}/export`;
  const withTarget = plan.steps.filter((step) => step.target !== null);

  return (
    <form action={pagePath} method="get" className="flex flex-col gap-16 sm:gap-20">
      {plan.input.actions.length > 0 ? <input type="hidden" name="actions" value={plan.input.actions.join(",")} /> : null}

      <div className="flex flex-col gap-6">
        <p className="text-base text-muted-foreground">
          Drawn up {longDate(plan.date)} from published figures. Decision support for service planning, not medical advice. No
          patient data.
        </p>
        <Toolbar plan={plan} exportPath={exportPath} position="top" />
      </div>

      <Section id="part-stands" number={1} title="Where the area stands">
        <Reveal>
          <p className="type-statement max-w-[40ch]">{plan.lede}</p>
        </Reveal>
        <Reveal index={1}>
          <p className="max-w-[68ch] text-base">{plan.reason}</p>
          {plan.reasonCaveat ? <p className="mt-2 max-w-[68ch] text-base text-muted-foreground">{plan.reasonCaveat}</p> : null}
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-3 print:grid-cols-3">
          {plan.steps.map((step, i) => (
            <StepUnit key={step.stage} step={step} index={i} />
          ))}
        </div>
      </Section>

      <Section
        id="part-target"
        number={2}
        title="Target"
        intro="Choose the level to aim for and the year to reach it by, then press Update the plan. The pace is arithmetic on the published shares: an even path from the latest figure to the level you choose. It is not a forecast and assumes no effect of any action."
      >
        <div data-print="hide" className="flex flex-col gap-4 rounded-lg bg-mint-veil p-5 sm:flex-row sm:items-end sm:p-6">
          <div className="flex flex-col gap-1.5 sm:w-80">
            <label htmlFor="target" className={LABEL}>
              Target level
            </label>
            <div className="relative">
              <select id="target" name="target" defaultValue={plan.input.target} className={cn(FIELD, "appearance-none pr-10")}>
                <option value="finland">Finland&apos;s level on each step</option>
                <option value="best">The best area&apos;s level on each step</option>
              </select>
              <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-forest-ink" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:w-52">
            <label htmlFor="year" className={LABEL}>
              Reach it by the end of
            </label>
            <div className="relative">
              <select id="year" name="year" defaultValue={String(plan.input.year)} className={cn(FIELD, "appearance-none pr-10")}>
                {TARGET_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-forest-ink" />
            </div>
          </div>
          <Button type="submit">
            <RefreshCw aria-hidden strokeWidth={1.75} data-icon="inline-start" />
            Update the plan
          </Button>
        </div>

        <p className="text-base font-semibold text-forest-ink">
          {plan.targetLabel}, by the end of {plan.input.year}.
        </p>
        {withTarget.length === 0 ? (
          <p className="text-base text-muted-foreground">No step has a figure of its own for this area, so no target can be set from published data.</p>
        ) : null}
        <FramePanel padding="none" className="p-5 sm:p-7">
          <table className="stack-table w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <Th>Step</Th>
                <Th>Today</Th>
                <Th>Target</Th>
                <Th>Pace</Th>
                <Th>Year by year</Th>
              </tr>
            </thead>
            <tbody>
              {plan.steps.map((step) => (
                <tr key={step.stage} className="border-b border-border last:border-b-0">
                  <Td label="Step" className="font-semibold">
                    {step.number}. {step.label}
                  </Td>
                  <Td label="Today">
                    <span className="figure">{step.value !== null ? formatPct(step.value) : "No figure"}</span>
                  </Td>
                  <Td label="Target">{targetGoal(step, plan.input.year)}</Td>
                  <Td label="Pace">{targetPace(step) || "–"}</Td>
                  <Td label="Year by year">
                    <span className="figure">{targetMilestones(step) || "–"}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </FramePanel>
      </Section>

      <Section
        id="part-actions"
        number={3}
        title="Actions"
        intro={
          plan.input.actions.length > 0
            ? "The actions chosen in the briefing, in the order chosen."
            : "The recommended actions for this area, ordered by where the pathway breaks."
        }
      >
        <div className="flex flex-col gap-4">
          {plan.actions.map((action, i) => (
            <ActionBlock key={action.id} action={action} index={i} />
          ))}
        </div>
        <TextLink kind="nav" href={`/county/${plan.county.id}/act`} className="text-base" detail="(all the evidence-backed options)">
          See every action for {plan.county.name}
        </TextLink>
      </Section>

      <Section
        id="part-recording"
        number={4}
        title="What to start recording"
        intro="These figures are not published for any area. Each line says what exists today and what the area can record itself from now on, so that the next review has its own numbers."
      >
        {/* Slot: the insights page's recording template (insights branch) is linked here after the merge. */}
        <FramePanel padding="none" className="p-5 sm:p-7">
          <table className="stack-table w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <Th>Step</Th>
                <Th>Figure nobody publishes</Th>
                <Th>What the area can record now</Th>
                <Th>Who could publish it (our proposal)</Th>
              </tr>
            </thead>
            <tbody>
              {plan.dataGaps.map((gap) => (
                <tr key={gap.id} className="border-b border-border last:border-b-0">
                  <Td label="Step" className="font-semibold">
                    {gap.stepLabel}
                  </Td>
                  <Td label="Figure nobody publishes">
                    {gap.missing}
                    <span className="mt-1 block text-sm text-muted-foreground">{gap.today}</span>
                    <span className="mt-2 block">
                      <SourceChip sourceId={gap.source_id} />
                    </span>
                  </Td>
                  <Td label="What the area can record now">{gap.county_can}</Td>
                  <Td label="Who could publish it (our proposal)">
                    {gap.could_publish}
                    {gap.measure ? (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Roadmap measure {gap.measure.measure_id}, {gap.measure.pages}
                      </span>
                    ) : null}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </FramePanel>
      </Section>

      <Section id="part-limits" number={5} title="Limits of this plan">
        <FramePanel padding="none" className="p-6 sm:p-8">
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-base">
            {plan.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </FramePanel>
      </Section>

      <Section id="part-sources" number={6} title="Sources" intro="Every figure and statement in this plan comes from one of these.">
        <ul className="flex flex-col">
          {plan.sources.map((source) => (
            <li key={source.source_id} className="grid gap-1.5 border-t border-border py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
              <div>
                <p className="text-base">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {source.publisher} · retrieved {source.retrieved}
                  <span className="hidden print:inline"> · {source.url}</span>
                </p>
              </div>
              <div>
                <SourceChip sourceId={source.source_id} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <section aria-labelledby="part-decision" className="flex flex-col gap-4">
        <h2 id="part-decision" className="type-title">
          Decision
        </h2>
        <div className="grid gap-4 rounded-lg bg-mint-veil p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="approved" className={LABEL}>
              Approved by
            </label>
            <input id="approved" name="approved" defaultValue={plan.input.approvedBy} maxLength={80} autoComplete="off" className={FIELD} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="decided" className={LABEL}>
              Date of decision
            </label>
            <input id="decided" name="decided" type="date" defaultValue={plan.input.decisionDate} className={FIELD} />
          </div>
        </div>
        <div data-print="hide" className="flex flex-col gap-4 pt-4">
          <div>
            <Button type="submit" variant="outline">
              <RefreshCw aria-hidden strokeWidth={1.75} data-icon="inline-start" />
              Update the plan
            </Button>
          </div>
          <Toolbar plan={plan} exportPath={exportPath} position="bottom" />
        </div>
      </section>
    </form>
  );
}

export default async function CountyPlanPage({ params, searchParams }: PageProps<"/county/[id]/plan">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  return (
    <main className="page-container flex max-w-[1200px] flex-col gap-10 pt-6 pb-8 sm:pt-8">
      <header className="flex flex-col items-start gap-3">
        <div data-print="hide">
          <Breadcrumb
            items={[
              { label: "Areas", href: "/" },
              { label: county.name, href: `/county/${county.id}` },
              { label: "Actions", href: `/county/${county.id}/act` },
              { label: "Action plan" },
            ]}
          />
        </div>
        <p className="type-eyebrow">Action plan for earlier cancer diagnosis</p>
        <h1 className="type-display">{county.name}</h1>
        <p className="type-lede max-w-[60ch] text-muted-foreground">
          A plan to take to the board: where the area stands, the target, the actions with who does what first, what to start
          recording, and every source. Print it, download it, or send it by email.
        </p>
      </header>
      <Suspense
        fallback={
          <p aria-busy className="rounded-lg bg-card p-8 text-base text-muted-foreground">
            Drawing up the plan…
          </p>
        }
      >
        <PlanBody id={county.id} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
