"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="page-container flex flex-col items-start gap-5 pt-8 pb-16 sm:pt-12">
      <p className="type-eyebrow">Something went wrong</p>
      <h1 className="type-display text-forest-ink">This page could not load</h1>
      <p className="type-lede max-w-[60ch]">Try again. The rest of FirstLine still works.</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Pick an area
        </Link>
      </div>
    </main>
  );
}
