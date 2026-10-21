/**
 * Site-wide configuration. Anything marked PLACEHOLDER is unverified and is
 * shown on the site as "to be added" until you replace it.
 */
export const PLACEHOLDER = "PLACEHOLDER" as const;

export const site = {
  name: "Gauri Vaidya",
  /** Homepage hero sentence — edit freely. */
  heroText: "I use data and AI to improve health systems, build reliable models, and turn research into real-world impact.",
  /** Confirmed by Gauri (Oct 2026). */
  role: "Senior Postdoctoral Researcher",
  affiliation: "National Kidney Disease Surveillance System (NKDSS), School of Medicine, University of Limerick",
  url: "https://gauriivaidya.github.io",
  description:
    "Gauri Vaidya, PhD — researcher using data and AI to improve health systems, build reliable models, and turn research into real-world impact. University of Limerick, Ireland.",
  contact: {
    /** Verified. */
    workEmail: "gauri.vaidya@ul.ie" as string,
    /** From CV. */
    personalEmail: "gaurivaidya.work@gmail.com",
    linkedin: "https://linkedin.com/in/gauriivaidya",
    scholar: "https://scholar.google.com/citations?user=HIo03L4AAAAJ&hl=en",
    github: "https://github.com/gauriivaidya",
    /** Verified. */
    orcid: "https://orcid.org/0000-0002-9699-522X" as string,
  },
  /**
   * "Book a time with me" target (e.g. a Calendly / Google Calendar booking page).
   * While empty, the button opens an email to the work address with subject "Meeting request".
   */
  bookingUrl: "" as string,
  /**
   * Which home page design is live: "classic" (centred intro only), "areas" (option A), "editorial" (option B),
   * "cover" (option C: portrait panel + very large name), "block" (option D: teal band + numbered index) or
   * "network" (option E: big name over a faint animated data network). Change this one word and rebuild.
   */
  homeVariant: "classic" as "classic" | "areas" | "editorial" | "cover" | "block" | "network",
};

export const isSet = (v: string) => v && v !== PLACEHOLDER;
