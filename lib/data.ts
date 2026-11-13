// Typed shape of the static snapshot in data/ (see data/README.md).
// Stub only: real rows land on Saturday. Every row carries a source_id.

export type SourceId = string;

export type Source = {
  source_id: SourceId;
  name: string;
  url: string;
  publisher: string;
  retrieved: string; // ISO date the snapshot was taken
};

export type Indicator = {
  indicator_id: string; // e.g. Sotkanet "6411"
  name: string;
  unit: string;
  source_id: SourceId;
};

export type IndicatorValue = {
  county_id: string;
  indicator_id: string;
  year: number;
  value: number;
  source_id: SourceId;
};

export type Gap = {
  county_id: string;
  stage: "gp_access" | "gp_to_specialist";
  status: "red" | "amber" | "no_data";
  note: string;
  source_id: SourceId;
};

export type Evidence = {
  evidence_id: string;
  title: string;
  summary: string;
  source_id: SourceId;
};

export type County = {
  id: string;
  name: string;
};

// Placeholder list until data/ is filled. Not real rankings.
export const counties: County[] = [
  { id: "vantaa-kerava", name: "Vantaa and Kerava" },
  { id: "paijat-hame", name: "Päijät-Häme" },
];

export function getCounty(id: string): County | undefined {
  return counties.find((county) => county.id === id);
}
