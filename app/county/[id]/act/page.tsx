import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { counties, getCounty } from "@/lib/data";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export default async function CountyActPage({ params }: PageProps<"/county/[id]/act">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <Badge variant="secondary">Placeholder</Badge>
      <h1 className="text-3xl font-semibold">{county.name}: recommended actions</h1>
      <p className="text-muted-foreground">
        TODO: 2–3 actions for this county&apos;s bottleneck (owner, first step,
        precedent, source) and the red-flag helper (decision support, not
        diagnosis).
      </p>
      <Link href={`/county/${county.id}`} className={buttonVariants({ variant: "outline", className: "w-fit" })}>
        Back to pathway
      </Link>
    </main>
  );
}
