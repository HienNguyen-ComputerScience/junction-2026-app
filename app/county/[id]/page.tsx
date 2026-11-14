import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { buildPathwaySteps, PathwaySteps, type PathwayStep } from "@/components/pathway/pathway-steps";
import { PathwayStrip } from "@/components/pathway/pathway-strip";
import { TrendStrip, type TrendStage } from "@/components/pathway/trend-strip";
import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
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
import { getBottleneck } from "@/lib/act";
import { counties, gaps, getCounty, getValue, LATEST_YEAR, type County, type Gap } from "@/lib/data";
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
  STATUS_LABEL,
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

  const steps = buildPathwaySteps(county.id);
  const limitations = buildLimitations(county);
  const lateReferrals = getValue(county.id, REFERRAL_LATE_ID);
  const lateReferralsFinland = getNationalValue(REFERRAL_LATE_ID);
  const keyGap = keyFigureGap(county);

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:pt-6">
      {/* Desktop: title, verdict and the key figure on the left, the limitations box (quieter)
          beside them, so both are on the first screen. Below lg the limitations are a one-line
          disclosure right under the main action instead (the two are never displayed at the
          same width). */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-start lg:gap-12">
        <header className="flex flex-col items-start gap-4">
          <BackLink href="/">Back to ranking</BackLink>
          <div className="flex flex-col gap-2">
            <p className="type-caption text-balance text-muted-foreground">
              Path to early cancer care
              <span className="max-sm:hidden"> · </span>
              <span className="max-sm:block">{county.name_fi}</span>
            </p>
            <h1 className="type-page lg:text-[2.75rem] lg:leading-[1.1]">{county.name}</h1>
          </div>
          <p className="max-w-[40rem] type-lede lg:max-w-[36rem] lg:text-[1.375rem] lg:leading-8">
            {getVerdict(county.id)}
          </p>
          {keyGap && <KeyFigure gap={keyGap} />}
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
        <div className="flex flex-col gap-1.5">
          {/* The key figure above is this step's value, so its slot here shows the gap instead:
              one number, once per screen. */}
          <FramePanel padding="none">
            <PathwaySteps steps={steps} density="full" ledStage={keyGap?.stage} />
          </FramePanel>
          <TrendStrip stages={buildTrendStages(county, steps)} areaName={county.name} />
        </div>
        <FrameFooter className="flex flex-col gap-2.5">
          <BarKey />
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span>Context only, not used for status: referrals still unprocessed after 21 days.</span>
            {lateReferrals ? (
              <span>
                <span className="figure text-foreground">{lateReferrals.value}%</span> here
              </span>
            ) : (
              <span>No public data here</span>
            )}
            {lateReferralsFinland && (
              <span>
                Finland <span className="figure text-foreground">{lateReferralsFinland.value}%</span>
              </span>
            )}
            <SourceChip
              sourceId={lateReferrals?.source_id ?? lateReferralsFinland?.source_id ?? "sotkanet-5033"}
              year={LATEST_YEAR}
            />
          </p>
        </FrameFooter>
      </Frame>

      <PathwayStrip countyId={county.id} />

      <CountyBrief countyId={county.id} />
      <CountyNews key={county.id} countyId={county.id} />
    </main>
  );
}

/** Finland's value for each year of the trend, from the same indicator (null where unpublished). */
function nationalTrend(indicatorId: string) {
  return YEARS.map((year) => ({ year, value: getNationalValue(indicatorId, year)?.value ?? null }));
}

const KEY_CAPTION: Record<Gap["stage"], string> = {
  gp_access: "of non-urgent GP visits waited more than 7 days",
  referral: "of referrals were processed within 3 days (higher is faster)",
  gp_recognition: "",
};

/**
 * The stage the first screen leads with: the worst measured stage when one is worse than
 * Finland, otherwise step 1 (getting to a GP) with its amber status.
 */
function keyFigureGap(county: County): Gap | null {
  const { focus, anyRed } = getBottleneck(county.id);
  const gp = getStageGap(county.id, "gp_access");
  const gap = anyRed ? focus[0] : gp && gp.value !== null ? gp : focus[0];
  return gap && gap.value !== null ? gap : null;
}

/** The first screen's one key number: the figure, its status and source, and what it counts. */
function KeyFigure({ gap }: { gap: Gap }) {
  if (gap.value === null) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className={`numeral text-[3.5rem] leading-none sm:text-[4rem] ${STATUS_FIGURE[gap.status]}`}>
          {formatPct(gap.value)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={gap.status} size="md">
            {STATUS_LABEL[gap.status]}
          </StatusBadge>
          <SourceChip sourceId={gap.source_id} year={gap.year} />
        </div>
      </div>
      <p className="text-sm text-pretty text-muted-foreground">
        {KEY_CAPTION[gap.stage]} · Finland <span className="figure">{formatPct(gap.national_value)}</span>
      </p>
    </div>
  );
}

/** The trend of every step that has an indicator, for the panel under the steps. */
function buildTrendStages(county: County, steps: PathwayStep[]): TrendStage[] {
  const INDICATOR: Partial<Record<Gap["stage"], string>> = { gp_access: GP_WAIT_ID, referral: REFERRAL_ID };
  return steps.flatMap((step) => {
    const indicatorId = INDICATOR[step.stage];
    if (!step.measure || !indicatorId) return [];
    return [
      {
        step: step.step,
        title: step.title,
        status: step.status,
        sourceId: step.measure.sourceId,
        year: step.measure.year,
        direction: step.measure.direction,
        trend: getTrend(county.id, indicatorId).map(({ year, value }) => ({ year, value: value?.value ?? null })),
        nationalTrend: nationalTrend(indicatorId),
      },
    ];
  });
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
    text: "The GP wait covers public health centres only. Visits to occupational or private doctors are not in it. In a Finnish study of lymphoma patients, those who started in public primary care waited a median 127 days from symptoms to treatment, against 76 days for private or occupational care.",
    sourceId: "kuitunen-2026",
  });

  items.push({
    text: "GP recognition of possible cancer has no public indicator, so step 2 is grey for every county. No public county data shows it yet; one candidate would be the share of cancers first found through an emergency visit.",
  });

  const shared = getStageGap(county.id, "referral")?.shared;
  const husWide = gaps.find((gap) => gap.shared)?.shared;
  if (shared) {
    items.push({
      text: `The referral step shows the ${shared.name}-wide value, not a figure for ${county.name}. ${shared.name} handles hospital referrals from Helsinki, East, Central and West Uusimaa, and Vantaa and Kerava, and THL publishes one number for all of them. So the step stays grey, and it is not used to rank or to pick actions. THL or ${shared.name} could publish it by the patient's home county. The link shows the ${shared.name} report we used to check that the number is ${shared.name}'s.`,
      sourceId: shared.confirmed_by,
    });
  } else if (stageStatus(county.id, "referral") === "no_data") {
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
    if (county.id === "helsinki" && husWide) {
      items.push({
        text: `Helsinki's referral value covers the city's own specialist units only. Most hospital referrals from Helsinki go to ${husWide.name}, which processed ${formatPct(husWide.value)} within 3 days in ${LATEST_YEAR}.`,
        sourceId: husWide.confirmed_by,
      });
    }
  }

  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  items.push({
    text: `At or better than Finland's level does not mean good. Finland's level is itself a delay${
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
