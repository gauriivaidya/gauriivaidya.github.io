// Third-person bios for talk introductions, programmes and press. Facts from Gauri's CV (Oct 2026) and Google Scholar only.
export const shortBio = [
  "Gauri Vaidya is a Senior Postdoctoral Researcher with the National Kidney Disease Surveillance System (NKDSS) at the School of Medicine, University of Limerick, where she applies data analysis and machine learning to understand the burden of chronic kidney disease in Ireland. She holds a PhD in Artificial Intelligence from the University of Limerick, where she developed efficient hyperparameter optimisation frameworks for machine and deep learning. In 2025 she was named one of Business Post's 30 Under 30 Top People in Tech.",
];

/** Long bio: text supplied verbatim by Gauri (Oct 2026). */
export const longBio = [
  "Dr Gauri Vaidya is a Senior Postdoctoral Researcher with the National Kidney Disease Surveillance System at the University of Limerick. Her work applies advanced data analytics and machine learning to understand the burden and impact of kidney disease in Ireland and develop evidence-based strategies that improve patient outcomes.",
  "Her expertise spans optimisation, artificial intelligence, machine learning, and large-scale health data analytics. She has contributed to interdisciplinary projects in blockchain, knowledge graphs, large language models, and agentic AI, collaborating with domain experts, researchers, and industry partners.",
  "Gauri has received several national and international accolades, including recognition as one of the Business Post 30 Under 30: Top People in Tech 2025, the SPECIES International Research Scholarship for a research visit to Jönköping University, Sweden, and first prize at the Smart India Hackathon. Her work has also been featured by the Business Post, The Times of India, and atoti.",
];

/**
 * A link rule: wrap the first whole-word occurrence of `phrase` (searching only after `after`, when given) in an external link.
 * The text itself is never changed, and the copy buttons still copy plain text.
 */
export type PhraseLink = readonly [phrase: string, url: string, after?: string];

/**
 * Home-intro links: exact phrases inside longBio. Every URL verified Oct 2026 (HTTP 200, or an official site that blocks
 * automated checks; articles checked against independent sources). The Times of India is deliberately unlinked: no article
 * about Gauri could be found and verified. The only Business Post article about her is the 30 Under 30 one (already linked), so
 * the second mention ("featured by the Business Post") links the publication's home page.
 */
export const bioLinks: ReadonlyArray<PhraseLink> = [
  ["National Kidney Disease Surveillance System", "https://www.nkdss.ie/"],
  ["University of Limerick", "https://www.ul.ie/"],
  ["Business Post 30 Under 30: Top People in Tech 2025", "https://www.businesspost.ie/article/30-under-30-meet-irelands-top-tech-innovators/"],
  ["SPECIES International Research Scholarship", "https://species-society.org/scholarships-previous-years/"],
  ["Jönköping University", "https://ju.se/en"],
  ["Smart India Hackathon", "https://www.sih.gov.in/"],
  ["Business Post", "https://www.businesspost.ie/", "featured by the "],
  ["atoti", "https://medium.com/atoti/meghana-and-gauri-explaining-olap-concepts-with-practical-examples-aedd541e6294"],
];
