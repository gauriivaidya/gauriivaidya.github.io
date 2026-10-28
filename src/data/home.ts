import type { PhraseLink } from "./bio";

/**
 * Home-page content.
 *
 * PORTRAIT — single switch for the home photo.
 *   null  → no photo: the hero is type-only and the share (OG) image is the GV brand card /og-image-brand.jpg.
 *   "/images/portrait" → shows the framed portrait; files must exist as
 *            `${PORTRAIT}-{96,192,200,340,400}.{avif,webp}` and `${PORTRAIT}-340.jpg`; the share image becomes /og-image.jpg.
 */
export const PORTRAIT: string | null = "/images/portrait";
export const OG_IMAGE = PORTRAIT ? "/og-image.jpg" : "/og-image-brand.jpg";
export const OG_IMAGE_ALT = PORTRAIT
  ? "Gauri Vaidya, Senior Postdoctoral Researcher, University of Limerick"
  : "GV monogram — Gauri Vaidya, Senior Postdoctoral Researcher, University of Limerick";

/**
 * Research areas (home cards). Wording drawn only from her long bio.
 * `topic` + `keywords`: `/publications/?topic=<topic>` filters the list by title/venue; cards without a topic link to the full list.
 */
export type Area = { title: string; eyebrow: string; summary: string; icon: string; topic?: string; keywords?: RegExp };

export const areas: Area[] = [
  {
    eyebrow: "Current work", title: "Kidney disease", icon: "pulse",
    summary: "Advanced data analytics and machine learning with the National Kidney Disease Surveillance System, to understand the burden and impact of kidney disease in Ireland and develop evidence-based strategies that improve patient outcomes.",
  },
  {
    eyebrow: "Expertise", title: "Optimisation, AI & Large-Scale Data Analytics", icon: "sliders", topic: "expertise",
    summary: "Optimisation, artificial intelligence, machine learning and large-scale health data analytics, with interdisciplinary projects in blockchain, knowledge graphs, large language models and agentic AI.",
    keywords: /optimi[sz]|hyperparameter|grammatical evolution|machine learning|deep learning|artificial intelligence|\bAI\b|data|analytics|blockchain|knowledge graph|language model|automl|neural|evolution/i,
  },
];


/**
 * Background (Pranav Rajpurkar-style: the path told as a short story — early field → key work → move to health → degrees → current role).
 * Approved by Gauri (Oct 2026). Third person; every fact is from cv/cv.tex.j2 (Education, Professional Experience) or bio.ts.
 * Set BACKGROUND_DRAFT = false once approved to drop the marker.
 */
export const BACKGROUND_DRAFT = false;

/**
 * Background links: each organisation linked once across both paragraphs (same mechanism and look as the bio links).
 * Verified Oct 2026: official sites, HTTP 200 (intel.com blocks automated checks but is Intel's official site). The PhD links
 * to CRT-AI because the CV lists her Doctoral Fellowship (2021–2025) with that centre.
 */
export const backgroundLinks: ReadonlyArray<PhraseLink> = [
  ["Government College of Engineering, Aurangabad", "https://geca.ac.in/"],
  ["Biocomputing and Developmental Systems Research Group", "https://bds.ul.ie/"],
  ["Intel", "https://www.intel.com/"],
  ["Principal Global Services", "https://careers.principal.com/in/"],
  ["PhD in Artificial Intelligence", "https://www.crt-ai.ie/"],
  ["National Kidney Disease Surveillance System", "https://www.nkdss.ie/"],
];
export const background = [
  "Gauri began in computer science, with a Bachelor of Engineering from the Government College of Engineering, Aurangabad, India (2016–2020). As a research intern with the Biocomputing and Developmental Systems Research Group at the University of Limerick (2019–2021), she worked on a cryptographically secure pseudo-random number generator with Intel and a blockchain framework for sharing electronic health records, and she spent a year as a Trainee Analyst at Principal Global Services in India.",
  "She went on to a PhD in Artificial Intelligence at the University of Limerick (2021–2025), with a thesis on efficient hyperparameter optimisation for streamlining model training in machine and deep learning. In 2025 she joined the National Kidney Disease Surveillance System at the University of Limerick, where she is now a Senior Postdoctoral Researcher applying data analytics and machine learning to kidney disease in Ireland.",
];
