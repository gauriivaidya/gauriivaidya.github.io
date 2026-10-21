/** Research areas: `/publications/?topic=<topic>` filters the list by these keywords. */
export const areas = [
  { topic: "health", title: "Kidney disease surveillance & health data", keywords: /health|patient|kidney|clinical|medic|hospital|fracture|cancer|EHR/i },
  { topic: "trustworthy-ai", title: "Trustworthy AI for healthcare", keywords: /bias|explainab|trustworth|responsible|ethic|knowledge graph|large language/i },
  { topic: "optimisation", title: "Optimisation & AutoML", keywords: /hyperparameter|grammatical evolution|automl|optimi[sz]/i },
] as const;
