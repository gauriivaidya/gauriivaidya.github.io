import data from "./teaching.json";

export type Resource = { label: string; url: string };
export type TeachingRecord = {
  code?: string;
  name: string;
  years: string;
  institution: string;
  location?: string; // City, Country (or just Country)
  role: string;
  level?: string;
  description: string;
  resources?: Resource[]; // add only verified URLs (lecture notes, handbooks, slides, Quarto books)
};

/** Generated from content/teaching.yaml by scripts/content2json.py — edit the YAML, not this. The Teaching page groups by the latest year in `years`. */
export const teaching = data as TeachingRecord[];
