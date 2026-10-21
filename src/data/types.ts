export type Publication = {
  key: string;
  type: "journal" | "conference" | "preprint" | "book chapter" | "other";
  label?: string | null;
  /** Venue abbreviation shown as the badge (content/publications.meta.json). */
  abbr?: string | null;
  /** Listed under "Selected publications" on the home page. */
  abstract?: string | null;
  authors: string[];
  title: string;
  venue: string;
  publisher?: string | null;
  year: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  url?: string | null;
  pdf?: string | null;
  code?: string | null;
  slides?: string | null;
  video?: string | null;
  project?: string | null;
  bibtex: string;
};
