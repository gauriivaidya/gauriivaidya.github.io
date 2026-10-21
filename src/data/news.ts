/** Landing-page "Recent" list — from the CV (Oct 2026) and the verified Google Scholar profile. */
export type News = { date: string; kind: string; text: string; to?: string };
export const news: News[] = [
  { date: "2026", kind: "Paper", text: "From Natural Language to Interpretable Code: Automated Code Generation for Healthcare with Large Language Models, ICAART 2026", to: "/publications/" },
  { date: "2026", kind: "Abstract", text: "Big data for predictive patient flow, Emergency Medicine Journal", to: "/publications/" },
  { date: "Spring 2026", kind: "Teaching", text: "Instructor, CS6472 Research Methods and Specifications, University of Limerick", to: "/teaching/" },
  { date: "2025", kind: "Recognition", text: "Business Post 30 Under 30: Top People in Tech", to: "/talks/" },
  { date: "2025", kind: "Milestone", text: "PhD in Artificial Intelligence, University of Limerick" },
];
