import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="page-container flex flex-col items-start gap-5 pt-8 pb-16 sm:pt-12">
      <p className="type-eyebrow">Page not found</p>
      <h1 className="type-display text-forest-ink">This page isn&apos;t in FirstLine</h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Pick an area
        </Link>
        <Link href="/compare" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Compare all areas
        </Link>
      </div>
    </main>
  );
}
