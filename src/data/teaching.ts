export type Resource = { label: string; url: string };
export type TeachingRecord = {
  code?: string;
  name: string;
  years: string;
  institution: string;
  role: string;
  level?: string;
  description: string;
  resources?: Resource[]; // add only verified URLs (lecture notes, handbooks, slides, Quarto books)
};

/** Add a module by adding an object here. The Teaching page groups by the latest year in `years`. */
export const teaching: TeachingRecord[] = [
  {
    code: "CS6604",
    name: "Applications of AI in Healthcare",
    years: "2026",
    institution: "University of Limerick",
    role: "Module Leader",
    level: "Graduate",
    // Provided directly by Gauri (not in CV of Oct 2026). Description is a PLACEHOLDER to edit.
    description: "Module description to be added.",
  },
  {
    code: "CS6472",
    name: "Research Methods and Specifications",
    years: "Spring 2025, Spring 2026",
    institution: "University of Limerick",
    role: "Instructor",
    level: "Graduate",
    description:
      "Sole responsibility for the module, which grew from 36 registered students in 2025 to 70 in 2026.",
  },
  {
    code: "CS4136",
    name: "Topics in AI",
    years: "Spring 2025",
    institution: "University of Limerick",
    role: "Teaching Assistant",
    level: "Undergraduate",
    description: "Supported undergraduate learning in AI topics; module taught by Prof. Meghana Kshirsagar.",
  },
  {
    code: "CS6163",
    name: "Advanced Topics Seminars and Project",
    years: "Spring 2024",
    institution: "University of Limerick",
    role: "Moderator",
    level: "Graduate",
    description: "Moderated the graduate seminars and project module taught by Dr. Tabea DeWille.",
  },
  {
    code: "CS4207",
    name: "Advanced Programming Concepts and Practices",
    years: "Fall 2024",
    institution: "University of Limerick",
    role: "Teaching Assistant",
    level: "Undergraduate",
    description: "Module taught by Prof. Meghana Kshirsagar.",
  },
  {
    code: "CS4222",
    name: "Software Development",
    years: "Spring 2024",
    institution: "University of Limerick",
    role: "Teaching Assistant",
    level: "Undergraduate",
    description: "Module taught by Prof. Meghana Kshirsagar.",
  },
  {
    code: "CS4116",
    name: "Software Development Project",
    years: "Spring 2022, 2023, 2024",
    institution: "University of Limerick",
    role: "Teaching Assistant",
    level: "Undergraduate",
    description: "Supported student project teams across three years; module taught by Prof. Conor Ryan.",
  },
  {
    code: "CS4221",
    name: "Foundations of Computer Science",
    years: "Fall 2022, Fall 2023",
    institution: "University of Limerick",
    role: "Teaching Assistant",
    level: "Undergraduate",
    description: "Module taught by Prof. Conor Ryan and Prof. Meghana Kshirsagar.",
  },
  {
    name: "Blockchain Technologies",
    years: "Fall 2022",
    institution: "Maharashtra Institute of Technology, India",
    role: "Module Leader (Online)",
    level: "Undergraduate",
    description: "Sole responsibility for the online module, with 65 registered students.",
  },
];
