import Link from "next/link";

import { SourceChip } from "@/components/source-chip";

// The eight steps as drawn in the challenge talk (slide 10). FirstLine covers
// steps 3 to 5; `card` names the stage card on this page that shows the step.
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
    <section aria-labelledby="whole-pathway-heading" className="flex flex-col gap-3">
      <h2 id="whole-pathway-heading" className="text-xl font-semibold">
        Where these steps sit on the way to treatment
      </h2>
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.label}
            className={`flex flex-col gap-1 rounded-lg border p-2 text-xs ${
              step.card
                ? "border-2 border-foreground/70 bg-background"
                : "bg-muted/40 text-muted-foreground"
            }`}
          >
            <span className="font-medium tabular-nums">
              {index + 1} · {step.tag}
            </span>
            <span className={step.card ? "text-sm font-semibold" : "text-sm"}>{step.label}</span>
            {step.card && <span>Here: {step.card}</span>}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">
        FirstLine covers steps 3 to 5, where a county can act. Step 4 has no public data, so
        it is grey; the{" "}
        <Link href={`/county/${countyId}/act#red-flags`} className="underline underline-offset-2">
          red-flag helper
        </Link>{" "}
        supports it. Steps 1 and 2 are the patient&apos;s own delay and steps 6 to 8 are hospital
        care. The eight steps are from the Junction 2026 challenge talk (H. Kuitunen, 13 Nov
        2026).
      </p>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span>
          Why the first contact matters: in a Finnish study of 160 lymphoma patients (2014–2020),
          those who first went to public primary care waited a median 127 days from first
          symptoms to treatment. Those who went through private or occupational care waited 76.
        </span>
        <SourceChip sourceId="kuitunen-2026" year={2026} />
      </p>
    </section>
  );
}
