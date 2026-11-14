import type { ReactNode } from "react";

import { SourceChip } from "@/components/source-chip";
import { NO_MATCH_LINKS, RED_FLAG_CATEGORIES } from "@/lib/red-flags";

import { RouteFinder } from "./route-finder";

/**
 * Which referral route fits a concern? The page renders this server component; it builds the
 * source chips here, because SourceChip reads the data snapshot and the picker runs in the
 * browser and must not pull the snapshot into its bundle.
 */
export function RedFlagHelper() {
  const chips: Record<string, ReactNode> = {};
  const links = [...RED_FLAG_CATEGORIES.flatMap((category) => category.links), ...NO_MATCH_LINKS];
  for (const link of links) {
    if (link.source_id && !(link.source_id in chips)) {
      chips[link.source_id] = <SourceChip sourceId={link.source_id} />;
    }
  }
  return <RouteFinder chips={chips} />;
}
