import { TextLink } from "@/components/ui/text-link";

export default function NotFound() {
  return (
    <main className="page-container flex flex-col gap-4 pt-4 sm:pt-6">
      <h1 className="type-display text-[1.375rem] text-foreground sm:text-[1.75rem]">Page not found</h1>
      <p className="text-muted-foreground">That area or page isn&apos;t in FirstLine.</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <TextLink kind="nav" href="/">
          Pick an area
        </TextLink>
        <TextLink kind="nav" href="/compare">
          Compare all areas
        </TextLink>
      </div>
    </main>
  );
}
