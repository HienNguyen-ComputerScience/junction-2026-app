import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { StageCard, StepRail, type StageCardProps } from "@/components/pathway/stage-card";
import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import { BarKey } from "@/components/ui/measure-bar";
import { buttonVariants } from "@/components/ui/button";
import {
  Frame,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
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
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      {/* Desktop: title and verdict on the left, the limitations box beside them, so both are
          on the first screen. Below lg the limitations are a one-line disclosure right under
          the main action instead (the two are never displayed at the same width). */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start lg:gap-10">
        <header className="flex flex-col items-start gap-4 lg:gap-5">
          <BackLink href="/">Back to ranking</BackLink>
          <div className="flex flex-col gap-2">
            <p className="type-caption text-balance text-muted-foreground">
              Path to early cancer care
              <span className="max-sm:hidden"> · </span>
              <span className="max-sm:block">{county.name_fi}</span>
            </p>
            <h1 className="type-page">{county.name}</h1>
          </div>
          <p className="max-w-[40rem] type-lede lg:max-w-[31rem] lg:text-[1.375rem] lg:leading-8">
            {getVerdict(county.id)}
          </p>
          <Link href={`/county/${county.id}/act`} className={buttonVariants({ size: "lg" })}>
            What to do about it
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
          <LimitationsBox items={limitations} variant="disclosure" className="mt-2 w-full lg:hidden" />
        </header>

        <LimitationsBox items={limitations} className="max-lg:hidden" />
      </div>

      <Frame aria-labelledby="pathway-heading">
        <FrameHeader>
          <FrameTitle id="pathway-heading" className="type-title">
            The first steps, compared with Finland ({LATEST_YEAR})
          </FrameTitle>
        </FrameHeader>
        <FramePanel padding="none">
          <ol className="grid grid-cols-1 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-0 lg:pt-5 lg:pb-7">
            {stages.map((stage, index) => (
              <li
                key={stage.title}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 lg:row-span-6 lg:grid-cols-1 lg:grid-rows-subgrid"
              >
                <StepRail
                  step={stage.step}
                  status={stage.status}
                  first={index === 0}
                  last={index === stages.length - 1}
                />
                <div
                  className={`min-w-0 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:px-6 ${index === stages.length - 1 ? "" : "max-lg:pb-10"}`}
                >
                  <StageCard {...stage} />
                </div>
              </li>
            ))}
          </ol>
        </FramePanel>
        <FrameFooter className="flex flex-col gap-3">
          <BarKey />
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span>
              Context, not used for colour: referrals unprocessed after 21 days in {LATEST_YEAR},{" "}
              {lateReferrals ? `${lateReferrals.value}% here` : "no public data here"}
              {lateReferralsFinland ? ` (Finland ${lateReferralsFinland.value}%)` : ""}
            </span>
            <SourceChip
              sourceId={lateReferrals?.source_id ?? lateReferralsFinland?.source_id ?? "sotkanet-5033"}
              year={LATEST_YEAR}
            />
          </p>
        </FrameFooter>
      </Frame>

      <CountyBrief countyId={county.id} />
      <CountyNews key={county.id} countyId={county.id} />
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
        caption: "of non-urgent GP visits came more than 7 days after the need for care was assessed",
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
      title: "GP to specialist referral",
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
        ? `: ${formatPct(nationalGpWait.value)} of non-urgent GP visits nationally come more than a week after the need for care was assessed`
        : ""
    }.`,
  });
  items.push({
    text: `Colours compare this area's ${LATEST_YEAR} value with Finland's ${LATEST_YEAR} value on the same indicator. They are not a target or a clinical standard.`,
  });

  return items;
}
