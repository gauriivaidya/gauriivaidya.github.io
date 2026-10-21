// Content for the home-page design options (A: research areas, B: editorial). Facts only from Gauri's
// confirmed role, long bio, teaching data and publications.json — edit freely.

/** Research areas. `topic` links to /publications/?topic=<topic>, which filters by the keywords below. */
export const areas = [
  {
    topic: "health", title: "Kidney disease surveillance & health data",
    line: "Data analytics and machine learning on large-scale health data to understand the burden of kidney disease in Ireland.",
    keywords: /health|patient|kidney|clinical|medic|hospital|fracture|cancer|EHR/i,
  },
  {
    topic: "trustworthy-ai", title: "Trustworthy AI for healthcare",
    line: "Fairness, explainability, knowledge graphs and large language models for health applications.",
    keywords: /bias|explainab|trustworth|responsible|ethic|knowledge graph|large language/i,
  },
  {
    topic: "optimisation", title: "Optimisation & AutoML",
    line: "Efficient hyperparameter optimisation for machine and deep learning, including grammatical evolution.",
    keywords: /hyperparameter|grammatical evolution|automl|optimi[sz]/i,
  },
] as const;

export const recognitions = ["Business Post 30 Under 30: Top People in Tech 2025", "SPECIES International Research Scholarship", "First prize, Smart India Hackathon"];

export const currently = [
  "Senior Postdoctoral Researcher, NKDSS, University of Limerick",
  "Module Leader, CS6604 Applications of AI in Healthcare",
  "Manages the CSIS high-performance GPU infrastructure",
];

/** Keys from publications.json shown as "Selected publications" in option B. */
export const featuredKeys = ["vaidya2025purge", "kshirsagar2025bias", "chen2026nl2code"];
