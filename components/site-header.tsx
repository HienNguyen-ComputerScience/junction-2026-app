import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex flex-col">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            FirstLine
          </Link>
          <p className="text-sm text-muted-foreground">
            Where early cancer care breaks down, county by county
          </p>
        </div>
        <nav aria-label="Main" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/" className="hover:underline">
            County ranking
          </Link>
          <Link href="/#ask" className="hover:underline">
            Ask the evidence
          </Link>
          <Link href="/sources" className="hover:underline">
            Sources &amp; limitations
          </Link>
        </nav>
      </div>
    </header>
  );
}
