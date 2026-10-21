/**
 * Site-wide configuration. Anything marked PLACEHOLDER is unverified and is
 * shown on the site as "to be added" until you replace it.
 */
export const PLACEHOLDER = "PLACEHOLDER" as const;

export const site = {
  name: "Gauri Vaidya",
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
  /** Shown under the portrait on the home page (al-folio "more info" block). */
  address: ["National Kidney Disease Surveillance System", "School of Medicine", "University of Limerick", "Limerick, Ireland"],
};

export const isSet = (v: string) => v && v !== PLACEHOLDER;
