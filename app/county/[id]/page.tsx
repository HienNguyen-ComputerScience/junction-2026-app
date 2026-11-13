import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { counties, getCounty } from "@/lib/data";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export default async function CountyPathwayPage({ params }: PageProps<"/county/[id]">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <Badge variant="secondary">Placeholder</Badge>
      <h1 className="text-3xl font-semibold">{county.name}: pathway</h1>
      <p className="text-muted-foreground">
        TODO: stage cards (getting to a GP, GP to specialist) coloured red /
        amber / grey for no public data.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Limitations</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          TODO: always-visible limitations box (e.g. 6411 covers all non-urgent
          GP visits, not only cancer).
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to ranking
        </Link>
        <Link href={`/county/${county.id}/act`} className={buttonVariants()}>
          Recommended actions
        </Link>
      </div>
    </main>
  );
}
