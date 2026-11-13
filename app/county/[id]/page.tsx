import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { StageCard, type StageCardProps } from "@/components/pathway/stage-card";
import { SourceChip } from "@/components/source-chip";
import { buttonVariants } from "@/components/ui/button";
import { counties, getCounty, getValue, LATEST_YEAR, type County } from "@/lib/data";
import {
  formatPct,
  getIndicator,
  getNationalValue,
  getStageGap,
  getTrend,
  getVerdict,
  GP_WAIT_ID,
  REFERRAL_ID,
  REFERRAL_LATE_ID,
  stageStatus,
  YEARS,
} from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export default async function CountyPathwayPage({ params }: PageProps<"/county/[id]">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const stages = buildStages(county);
  const limitations = buildLimitations(county);
  const lateReferrals = getValue(county.id, REFERRAL_LATE_ID);
  const lateReferralsFinland = getNationalValue(REFERRAL_LATE_ID);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <Link
        href="/"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}
      >
        <ArrowLeft aria-hidden />
        Back to ranking
      </Link>

      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Path to early cancer care · {county.name_fi}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{county.name}</h1>
        <p className="max-w-3xl text-lg">{getVerdict(county.id)}</p>
        <Link
          href={`/county/${county.id}/act`}
          className={buttonVariants({ size: "lg", className: "w-fit px-4 text-base" })}
        >
          What to do about it
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Link>
      </header>

      <section aria-labelledby="pathway-heading" className="flex flex-col gap-3">
        <h2 id="pathway-heading" className="text-xl font-semibold">
          The first steps, compared with Finland ({LATEST_YEAR})
        </h2>
        <ol className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          {stages.map((stage, index) => (
            <Fragment key={stage.title}>
              {index > 0 && (
                <li aria-hidden className="flex items-center justify-center text-muted-foreground">
                  <ArrowDown className="size-5 md:hidden" />
                  <ArrowRight className="hidden size-5 md:block" />
                </li>
              )}
              <li>
                <StageCard {...stage} />
              </li>
            </Fragment>
          ))}
        </ol>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Context: referrals left unprocessed for more than 21 days in {LATEST_YEAR}:{" "}
            {lateReferrals ? `${lateReferrals.value}%` : "no public data"}
            {lateReferralsFinland ? ` (Finland ${lateReferralsFinland.value}%)` : ""}. Too
            small everywhere to tell counties apart, so it does not set any colour.
          </span>
          <SourceChip
            sourceId={lateReferrals?.source_id ?? lateReferralsFinland?.source_id ?? "sotkanet-5033"}
            year={LATEST_YEAR}
          />
        </p>
      </section>

      <LimitationsBox items={limitations} />
    </main>
  );
}

function buildStages(county: County): StageCardProps[] {
  const gpGap = getStageGap(county.id, "gp_access");
  const referralGap = getStageGap(county.id, "referral");

  return [
    {
      step: 1,
      title: "Getting to a GP",
      status: stageStatus(county.id, "gp_access"),
      measure: gpGap && {
        value: gpGap.value,
        nationalValue: gpGap.national_value,
        caption: "of non-urgent GP visits came more than 7 days after people asked",
        note: gpGap.note,
        sourceId: gpGap.source_id,
        year: gpGap.year,
        trend: getTrend(county.id, GP_WAIT_ID).map(({ year, value }) => ({
          year,
          value: value?.value ?? null,
        })),
      },
    },
    {
      step: 2,
      title: "GP recognises warning signs",
      status: "no_data",
      emptyText:
        "No public statistic shows how often GPs spot possible cancer at the first visit, in any county. Nobody can see how this step performs. That blind spot is itself a finding.",
    },
    {
      step: 3,
      title: "GP → specialist referral",
      status: stageStatus(county.id, "referral"),
      measure: referralGap && {
        value: referralGap.value,
        nationalValue: referralGap.national_value,
        caption: "of referrals were processed within 3 days (higher is faster)",
        note: referralGap.note,
        sourceId: referralGap.source_id,
        year: referralGap.year,
        trend: getTrend(county.id, REFERRAL_ID).map(({ year, value }) => ({
          year,
          value: value?.value ?? null,
        })),
      },
    },
  ];
}

function buildLimitations(county: County): LimitationItem[] {
  const items: LimitationItem[] = [];

  for (const indicatorId of [GP_WAIT_ID, REFERRAL_ID, REFERRAL_LATE_ID]) {
    const indicator = getIndicator(indicatorId);
    if (indicator) {
      items.push({
        text: `${indicator.short_name}: ${indicator.limitation}`,
        sourceId: indicator.source_id,
      });
    }
  }

  items.push({
    text: "GP recognition of possible cancer has no public indicator, so step 2 is grey for every county.",
  });

  if (stageStatus(county.id, "referral") === "no_data") {
    items.push({
      text: `Sotkanet publishes no county-level referral data for ${county.name}, so its referral step is grey. We cannot say whether referrals here are fast or slow.`,
    });
  } else {
    const referralYears = getTrend(county.id, REFERRAL_ID)
      .filter((point) => point.value !== null)
      .map((point) => point.year);
    if (referralYears.length > 0 && referralYears.length < YEARS.length) {
      items.push({
        text: `${county.name} has referral values for ${referralYears.join(", ")} only, so the referral trend is incomplete.`,
      });
    }
  }

  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  items.push({
    text: `Amber does not mean good. It means at or better than Finland's level, and Finland's level is itself a delay${
      nationalGpWait
        ? `: ${formatPct(nationalGpWait.value)} of non-urgent GP visits nationally come more than a week after people ask`
        : ""
    }.`,
  });
  items.push({
    text: `Colours compare this area's ${LATEST_YEAR} value with Finland's ${LATEST_YEAR} value on the same indicator. They are not a target or a clinical standard.`,
  });

  return items;
}
