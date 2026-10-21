export const EVENT_TYPES = [
  "Invited Talks",
  "Conference Presentations",
  "Workshops",
  "Panels",
  "Media Appearances",
  "Awards / Recognition",
  "Other Events",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type EventItem = {
  id: string;
  type: EventType;
  title: string;
  date: string; // display text
  year: number;
  host?: string;
  location?: string;
  role?: string; // Invited Speaker | Presenter | Facilitator | Panellist | Honouree | Organiser ...
  description?: string;
  image?: string; // path under /public/images/events — only real photos
  imageAlt?: string;
  link?: { label: string; url: string }; // only verified URLs
};

/** All entries come from the CV (Oct 2026). Newest first. */
export const events: EventItem[] = [
  { id: "bp30u30", type: "Awards / Recognition", title: "30 Under 30: Top People in Tech", date: "2025", year: 2025, host: "Business Post", role: "Honouree" },
  { id: "breaking-barriers", type: "Other Events", title: "Breaking Barriers: Addressing Algorithmic Bias for Equitable Cancer Care Access", date: "2025", year: 2025, role: "Organiser" },
  { id: "ldcrc", type: "Invited Talks", title: "Knowledge graph driven framework for comparative analysis of cohorts from transcriptomics data", date: "Oct 2024", year: 2024, host: "Limerick Digital Cancer Research Centre", location: "Ireland", role: "Invited Speaker" },
  { id: "fidelity", type: "Workshops", title: "Leveraging LLMs for Data Governance", date: "21 Oct 2024", year: 2024, host: "Fidelity Investments", role: "Technical Volunteer", description: "Delivered by Prof. Meghana Kshirsagar and Dr Vimal Kumar." },
  { id: "demystifying-ml", type: "Workshops", title: "Demystifying Machine Learning", date: "Aug 2024", year: 2024, host: "Government College of Engineering, Aurangabad", location: "India", role: "Facilitator", description: "3-day hands-on machine learning workshop, with Chinmay Kulkarni." },
  { id: "thesis-in-three", type: "Awards / Recognition", title: "Runner-Up, Thesis in Three (Faculty Heat)", date: "Apr 2023", year: 2023, host: "University of Limerick", location: "Ireland", role: "Honouree", description: "3rd place among 12 participants." },
  { id: "iscb", type: "Invited Talks", title: "Immune cell profiling from single cell RNA with R", date: "Apr 2023", year: 2023, host: "ISCB", role: "Invited Speaker", description: "With Prof. Meghana Kshirsagar." },
  { id: "ieee-icbc", type: "Other Events", title: "IEEE International Conference on Blockchain and Cryptocurrency", date: "2023", year: 2023, role: "Web Master" },
  { id: "pycon", type: "Conference Presentations", title: "SHIELD: Do it the safe way", date: "Nov 2022", year: 2022, host: "PyCon Ireland", location: "Ireland", role: "Presenter" },
  { id: "cvt-harvard", type: "Invited Talks", title: "Researching, Visualizations and Creating ML Models for Climate Change", date: "Aug 2022", year: 2022, host: "CVT, Internship Outreach Program from Harvard", role: "Invited Speaker", description: "With Dr. Meghana Kshirsagar." },
  { id: "mgm", type: "Invited Talks", title: "Artificial Intelligence in Smart Transportation", date: "Aug 2022", year: 2022, host: "Mahatma Gandhi Mission University, Aurangabad", location: "India", role: "Invited Speaker", description: "With Dr. Meghana Kshirsagar." },
  { id: "thomond", type: "Workshops", title: "Hands-on Workshop on Python Development", date: "2021–2025", year: 2021, host: "Thomond Community College", location: "Ireland", role: "Facilitator" },
  { id: "evathon", type: "Other Events", title: "Evathon, International Evolutionary Hackathon", date: "2021", year: 2021, role: "Co-Organiser" },
  { id: "sih", type: "Awards / Recognition", title: "First Prize, Smart India Hackathon", date: "Mar 2019", year: 2019, location: "India", role: "Honouree", description: "Best IoT-Based Waste Management System; 1st among 20 finalists, with team." },
  { id: "smart-aurangabad", type: "Other Events", title: "Smart Aurangabad Hackathon", date: "2019", year: 2019, role: "Organiser" },
];
