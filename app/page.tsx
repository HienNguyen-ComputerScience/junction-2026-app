import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { counties, getCounty } from "@/lib/data";

export default function CountyRankingPage() {
  const sample = getCounty("vantaa-kerava") ?? counties[0];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <Badge variant="secondary">Placeholder</Badge>
      <h1 className="text-3xl font-semibold">County ranking</h1>
      <p className="text-muted-foreground">
        TODO: rank wellbeing services counties by GP wait (Sotkanet 6411) and
        referral processing, with a source chip on every number.
      </p>
      <Link href={`/county/${sample.id}`} className={buttonVariants({ className: "w-fit" })}>
        Open sample county: {sample.name}
      </Link>
    </main>
  );
}
