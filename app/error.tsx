"use client";

import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="page-container flex flex-col items-start gap-4 pt-4 sm:pt-6">
      <h1 className="type-display text-[1.375rem] text-foreground sm:text-[1.75rem]">Something went wrong</h1>
      <p className="text-muted-foreground">The rest of FirstLine still works.</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
        <TextLink kind="nav" href="/">
          Pick an area
        </TextLink>
      </div>
    </main>
  );
}
