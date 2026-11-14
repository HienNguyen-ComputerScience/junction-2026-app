import { SourceChip } from "@/components/source-chip";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "cn";

// The eight steps as drawn in the challenge talk (slide 10). FirstLine covers steps 3 to 5;
// `card` names the step on this page that shows it.
const STEPS: { label: string; card?: string; tag: string }[] = [
  { label: "Symptoms begin", tag: "Patient" },
  { label: "Considering seeking care", tag: "Patient" },
  { label: "First healthcare contact", card: "Getting to a GP", tag: "Measured" },
  { label: "Physician assessment", card: "GP recognises warning signs", tag: "No public data" },
  { label: "Tests and referrals", card: "GP → specialist referral", tag: "Measured" },
  { label: "Diagnosis", tag: "Hospital" },
  { label: "Treatment plan", tag: "Hospital" },
  { label: "Treatment starts", tag: "Hospital" },
];

/** Where FirstLine's three steps sit in the full pathway from symptoms to treatment. */
export function PathwayStrip({ countyId }: { countyId: string }) {
  return (
    <Frame aria-labelledby="whole-pathway-heading">
      <FrameHeader>
        <FrameTitle id="whole-pathway-heading" className="type-title">
          Where these steps sit on the way to treatment
        </FrameTitle>
      </FrameHeader>
      <FramePanel>
        <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.label}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-3",
                step.card
                  ? "border-input bg-muted text-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <span className="type-caption">
                <span className="figure">{index + 1}</span> · {step.tag}
              </span>
              <span className={cn("text-sm", step.card && "font-semibold")}>{step.label}</span>
              {step.card && <span className="type-caption text-muted-foreground">Here: {step.card}</span>}
            </li>
          ))}
        </ol>
        <p className="pt-4 type-caption text-pretty text-muted-foreground">
          FirstLine covers steps 3 to 5, where a county can act. Step 4 has no public data, so it is
          grey; the{" "}
          <TextLink kind="nav" inline href={`/county/${countyId}/act#red-flags`}>
            red-flag helper
          </TextLink>{" "}
          supports it. Steps 1 and 2 are the patient&apos;s own delay and steps 6 to 8 are hospital
          care. The eight steps are from the Junction 2026 challenge talk (H. Kuitunen, 13 Nov 2026).
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-3 type-caption text-pretty text-muted-foreground">
          <span>
            Why the first contact matters: in a Finnish study of 160 lymphoma patients (2014–2020),
            those who first went to public primary care waited a median 127 days from first symptoms
            to treatment. Those who went through private or occupational care waited 76.
          </span>
          <SourceChip sourceId="kuitunen-2026" year={2026} />
        </p>
      </FramePanel>
    </Frame>
  );
}
