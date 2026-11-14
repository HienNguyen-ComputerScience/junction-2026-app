import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { buildPathwaySteps } from "@/components/pathway/pathway-steps";
import { buildStepTabs } from "@/components/pathway/step-panels";
import { StepTabs } from "@/components/pathway/step-tabs";
import { HUS_FULL, reasonForDisplay } from "@/components/pathway/wording";
import { BackLink } from "@/components/ui/back-link";
import { BarKey } from "@/components/ui/measure-bar";
import { buttonVariants } from "@/components/ui/button";
import { getBottleneck } from "@/lib/act";
import { getMainReason } from "@/lib/main-reason";
import { counties, gaps, getCounty, getValue, LATEST_YEAR, type County } from "@/lib/data";
import {
  formatPct,
  getIndicator,
  getNationalValue,
  getStageGap,
  getTrend,
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

export async function generateMetadata({ params }: PageProps<"/county/[id]">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  const title = getBottleneck(county.id).anyRed ? "where care is delayed" : "where the pathway stands";
  return { title: `${county.name}: ${title} | FirstLine` };
}

export default async function CountyPathwayPage({ params }: PageProps<"/county/[id]">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const steps = buildPathwaySteps(county.id);
  const limitations = buildLimitations(county);
  const { anyRed } = getBottleneck(county.id);
  // The verdict is the main reason sentence, the same one as on the home card. The tab selected
  // first is the step that sentence is about (the worst one), so the two always agree.
  const reason = getMainReason(county.id);
  const reasonStage = reason.gap?.stage ?? null;
  const tabs = buildStepTabs(county.id, steps, reasonStage);
  // The key names only the marks the three steps can draw.
  const statuses = new Set(steps.map((step) => step.status));
  const keyItems = (["finland", "red", "short", "amber", "no_data"] as const).filter((item) =>
    item === "finland"
      ? true
      : item === "short"
        ? steps.some((step) => step.stage === "referral" && step.status === "red")
        : statuses.has(item),
  );

  return (
    <main className="page-container flex flex-col gap-10 pt-4 sm:gap-14 sm:pt-6">
      {/* Desktop: name, verdict and the three steps (one at a time) on the left, the limitations
          box beside them, so both are on the first screen. Below lg the limitations are a
          one-line disclosure under the main action instead (never both at the same width). */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-10">
        <header className="flex flex-col items-start gap-4">
          <BackLink href="/">Back to all areas</BackLink>
          <div className="flex flex-col gap-1.5">
            <p className="type-caption text-balance text-muted-foreground">
              Path to early cancer care
              <span className="max-sm:hidden"> · </span>
              <span className="max-sm:block">{county.name_fi}</span>
            </p>
            <h1 className="type-page lg:text-[2.5rem] lg:leading-[1.1]">{county.name}</h1>
          </div>
          <p className="max-w-[44rem] text-base leading-relaxed text-pretty text-foreground">
            {reasonForDisplay(reason.text)}
          </p>
          <section aria-labelledby="steps-heading" className="flex w-full flex-col gap-2">
            <h2 id="steps-heading" className="type-caption font-medium text-muted-foreground">
              The first three steps, compared with Finland ({LATEST_YEAR})
            </h2>
            <StepTabs
              tabs={tabs}
              defaultId={reasonStage ?? "gp_access"}
              label={`The first three steps, ${LATEST_YEAR}`}
              footer={<BarKey items={keyItems} />}
            />
          </section>
          <Link href={`/county/${county.id}/act`} className={buttonVariants({ size: "lg" })}>
            {anyRed ? "See all actions" : "Actions to keep this level"}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
          <LimitationsBox items={limitations} variant="disclosure" className="mt-2 w-full lg:hidden" />
        </header>

        <LimitationsBox items={limitations} className="max-lg:hidden" />
      </div>

      <CountyBrief countyId={county.id} />
      <CountyNews key={county.id} countyId={county.id} />
    </main>
  );
}

/** A short bold line per indicator limitation; the indicator's own text is the detail. */
const INDICATOR_TITLE: Record<string, string> = {
  [GP_WAIT_ID]: "GP wait: all visits, not only cancer",
  [REFERRAL_ID]: "Referrals: start of assessment only",
  [REFERRAL_LATE_ID]: "Over 21 days: context only",
};

/** The first "HUS" of a text, spelled out. */
const spellHus = (text: string) =>
  text.includes("the HUS-wide value")
    ? text.replace("the HUS-wide value", `one value for ${HUS_FULL}`)
    : text.replace(/\bHUS\b(?! \()/, HUS_FULL);

function buildLimitations(county: County): LimitationItem[] {
  const items: LimitationItem[] = [];

  for (const indicatorId of [GP_WAIT_ID, REFERRAL_ID, REFERRAL_LATE_ID]) {
    const indicator = getIndicator(indicatorId);
    if (indicator) {
      items.push({
        title: INDICATOR_TITLE[indicatorId] ?? indicator.short_name,
        text: spellHus(indicator.limitation),
        sourceId: indicator.source_id,
      });
    }
  }

  items.push({
    title: "Public health centres only",
    text: "Visits to occupational or private doctors are not in the GP wait. In a Finnish study of lymphoma patients, those who started in public primary care waited a median 127 days from symptoms to treatment, against 76 days for private or occupational care.",
    sourceId: "kuitunen-2026",
  });

  // How many working-age visits skip that public queue (context only, Sotkanet 2371 vs 293).
  const occupational = getValue(county.id, "2371");
  const publicVisits = getValue(county.id, "293");
  const occupationalFinland = getValue("finland", "2371");
  const publicFinland = getValue("finland", "293");
  if (occupational && publicVisits && occupationalFinland && publicFinland) {
    const n = (value: number) => Math.round(value).toLocaleString("en-GB");
    items.push({
      title: "Many working-age visits skip the public queue",
      text: `Working-age people (15-64) in ${county.name} made ${n(occupational.value)} occupational-health doctor visits per 1,000 residents in ${occupational.year}, against ${n(publicVisits.value)} public primary-care doctor visits (Finland ${n(occupationalFinland.value)} and ${n(publicFinland.value)}). These are visits, not people. People over 64, who are most cancer patients, are not in these numbers.`,
      sourceId: "sotkanet-2371",
    });
  }

  // Cancer stage by county is not published; 5-year relative survival is (context only,
  // Sotkanet 3627 bowel, 3625 breast). Latest year is 2024. No comparison wording on purpose.
  const bowel = getValue(county.id, "3627", 2024);
  const breast = getValue(county.id, "3625", 2024);
  const bowelFinland = getValue("finland", "3627", 2024);
  const breastFinland = getValue("finland", "3625", 2024);
  if (bowel && breast && bowelFinland && breastFinland) {
    items.push({
      title: "Survival mixes early finding with treatment",
      text: `5-year relative survival here was ${bowel.value}% for bowel cancer and ${breast.value}% for breast cancer (Finland ${bowelFinland.value}% and ${breastFinland.value}%), for patients diagnosed ${bowel.year - 9}-${bowel.year}. Cancer stage by county is not published. Small counties vary from year to year.`,
      sourceId: "sotkanet-3627",
    });
  }

  items.push({
    title: "Step 2 has no public indicator",
    text: "GP recognition of possible cancer is not measured anywhere in Finland, so step 2 is grey for every area. One candidate would be the share of cancers first found through an emergency visit.",
  });

  const shared = getStageGap(county.id, "referral")?.shared;
  const husWide = gaps.find((gap) => gap.shared)?.shared;
  if (shared) {
    items.push({
      title: "The referral figure is not this area's own",
      text: `${shared.name} handles hospital referrals from East, Central and West Uusimaa and Vantaa and Kerava, and THL publishes one ${shared.name}-wide number for them. So the step stays grey and is not used to rank or to pick actions. The link is the ${shared.name} report we used to check the number.`,
      sourceId: shared.confirmed_by,
    });
  } else if (stageStatus(county.id, "referral") === "no_data") {
    items.push({
      title: "No referral data for this area",
      text: `Sotkanet publishes no county-level referral data for ${county.name}, so we cannot say whether referrals here are fast or slow.`,
    });
  } else {
    const referralYears = getTrend(county.id, REFERRAL_ID)
      .filter((point) => point.value !== null)
      .map((point) => point.year);
    if (referralYears.length > 0 && referralYears.length < YEARS.length) {
      items.push({
        title: "Referral trend is incomplete",
        text: `${county.name} has referral values for ${referralYears.join(", ")} only.`,
      });
    }
    if (county.id === "helsinki" && husWide) {
      items.push({
        title: "Helsinki's referral figure: city units only",
        text: `Most hospital referrals from Helsinki go to ${HUS_FULL}, which processed ${formatPct(husWide.value)} within 3 days in ${LATEST_YEAR}.`,
        sourceId: "sotkanet-13",
      });
    }
  }

  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  items.push({
    title: "At or better than Finland's level does not mean good",
    text: `Finland's level is itself a delay${
      nationalGpWait
        ? `: ${formatPct(nationalGpWait.value)} of non-urgent GP visits nationally come more than a week after the need for care was assessed`
        : ""
    }.`,
  });
  items.push({
    title: "Colours compare with Finland, not a target",
    text: `They compare this area's ${LATEST_YEAR} value with Finland's ${LATEST_YEAR} value on the same indicator. They are not a clinical standard.`,
  });

  return items;
}
