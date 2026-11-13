// Types shared by the brief modules. Type-only, so the pure modules can
// `import type` from here and still run under plain `node` (type stripping).

import type { GapStatus, Stage } from "@/lib/data";

export type FactUnit = "%" | "percentage points" | "rank" | "areas" | "days";

/** One number the brief may use. Every value comes from the committed snapshot. */
export type BriefFact = {
  fact_id: string;
  text: string; // plain-language statement of the fact, for the model and for humans
  value: number;
  unit: FactUnit;
  decimals: number; // precision the source publishes (6411, 13: 1 decimal)
  year: number | null;
  indicator_id: string | null;
  source_id: string;
};

export type BriefStage = {
  stage: Stage;
  label: string;
  status: GapStatus;
  text: string;
  indicator_id: string | null;
  source_id: string | null; // gp_recognition has no public indicator, so no source
};

export type BriefAction = {
  id: string;
  stage: Stage;
  action: string;
  who_implements: string;
  first_step: string;
  source_id: string;
};

export type BriefSource = { source_id: string; kind: "statistic" | "evidence"; name: string };

export type BriefContext = {
  county: { id: string; name: string };
  year: number;
  facts: BriefFact[];
  stages: BriefStage[];
  worst_stages: Stage[];
  actions: BriefAction[];
  sources: BriefSource[];
};

/** What the model returns (and what the fallback produces): numbers declared per claim. */
export type ModelClaim = { text: string; numbers: number[]; source_ids: string[] };
export type ModelBrief = { headline: ModelClaim; claims: ModelClaim[] };

export type DroppedClaim = { claim: ModelClaim; reason: string };
export type ValidationResult = {
  headline: ModelClaim | null; // null when the headline failed validation
  kept: ModelClaim[];
  dropped: DroppedClaim[];
};

/** GET /api/brief response. */
export type BriefClaim = { text: string; source_ids: string[] };
export type BriefResponse = {
  mode: "ai" | "fallback";
  reason?: string;
  headline: string;
  claims: BriefClaim[];
  dropped_count: number;
  model?: string;
  /** mode "ai" only: true when the AI headline failed the check and the precomputed one was used. */
  headline_precomputed?: boolean;
};
