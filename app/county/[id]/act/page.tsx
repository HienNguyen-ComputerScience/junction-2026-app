import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionCard } from "@/components/act/action-card";
import { RedFlagHelper } from "@/components/act/red-flag-helper";
import { SourceChip } from "@/components/source-chip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  SELECTION_RULE,
  STAGE_LABELS,
  bottleneckSentence,
  getBottleneck,
  otherActions,
  pickActions,
} from "@/lib/act";
import { counties, getCounty, type Evidence } from "@/lib/data";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href={`/county/${county.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Back to {county.name} pathway
        </Link>
        <Link href="/sources" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Sources and limitations
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{county.name}: what to do next</h1>
        <p className="text-lg">{bottleneckSentence(county.name, bottleneck)}</p>
        <div className="flex flex-wrap gap-2">
          {bottleneck.focus.map((gap) => (
            <SourceChip key={gap.stage} sourceId={gap.source_id} year={gap.year} />
          ))}
        </div>
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="recommended">
        <div>
          <h2 id="recommended" className="text-xl font-semibold">
            Recommended actions
          </h2>
          <p className="text-sm text-muted-foreground">{SELECTION_RULE}</p>
        </div>
        {recommended.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </section>

      {unmeasured.map((group) => (
        <section key={group.stage} className="flex flex-col gap-3" aria-labelledby={`unmeasured-${group.stage}`}>
          <div>
            <h2 id={`unmeasured-${group.stage}`} className="text-xl font-semibold">
              {STAGE_LABELS[group.stage]}: can&apos;t be measured here yet
            </h2>
            <p className="text-sm text-muted-foreground">
              {group.unmeasured} These actions still apply if the county finds a delay at this step.
            </p>
          </div>
          <CompactList actions={group.actions} />
        </section>
      ))}

      {remaining.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="other">
          <h2 id="other" className="text-xl font-semibold">
            Other options for this county
          </h2>
          {remaining.map((group) => (
            <div key={group.stage} className="flex flex-col gap-2">
              <h3 className="font-medium">
                {STAGE_LABELS[group.stage]}
                {group.unmeasured ? (
                  <Badge variant="outline" className="ml-2 align-middle">
                    no public data
                  </Badge>
                ) : null}
              </h3>
              {group.unmeasured ? (
                <p className="text-sm text-muted-foreground">{group.unmeasured}</p>
              ) : null}
              <CompactList actions={group.actions} />
            </div>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-4 rounded-xl border p-5" aria-labelledby="red-flags">
        <div>
          <h2 id="red-flags" className="text-xl font-semibold">
            Red-flag helper for GPs
          </h2>
          <p className="text-sm text-muted-foreground">
            Supports the &ldquo;GP recognises warning signs&rdquo; step: a concern in, the warning-sign
            category and the fastest referral route out, with the guideline to check.
          </p>
        </div>
        <RedFlagHelper />
      </section>

      <nav className="flex flex-wrap gap-2 border-t pt-4 text-sm">
        <Link href={`/county/${county.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Back to {county.name} pathway
        </Link>
        <Link href="/sources" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Sources and limitations
        </Link>
      </nav>
    </main>
  );
}

function CompactList({ actions }: { actions: Evidence[] }) {
  return (
    <ul className="flex flex-col divide-y rounded-lg border text-sm">
      {actions.map((action) => (
        <li key={action.id} className="flex flex-col gap-1 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="font-medium">{action.action}</span>
            <SourceChip sourceId={action.source_id} />
          </div>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">Owner:</span> {action.who_implements}
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">First step:</span> {action.first_step}
          </span>
        </li>
      ))}
    </ul>
  );
}
