import { cn } from "cn";

import { SourceChip } from "@/components/source-chip";
import { GP_WAIT_ID } from "@/lib/ranking";
import type { RecordingCaveat } from "@/lib/recording";

/**
 * One short line under a rise in the GP wait share: the recorded visits behind it changed a lot,
 * so part of the rise may be how visits are recorded (lib/recording). With the Sotkanet 6411 chip.
 */
export function RecordingNote({ caveat, className }: { caveat: RecordingCaveat; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 type-caption text-muted-foreground", className)}>
      <span>{caveat.text}</span>
      <SourceChip sourceId={`sotkanet-${GP_WAIT_ID}`} />
    </p>
  );
}
