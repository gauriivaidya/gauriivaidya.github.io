import { site } from "./data/site";
const T: Record<string, [string, string]> = {
  "/": ["Gauri Vaidya — Data, AI & Health Systems", site.description],
  "/about/": ["About — Gauri Vaidya", "About Gauri Vaidya: researcher in data, AI and health systems at the University of Limerick."],
  "/publications/": ["Publications — Gauri Vaidya", "Publications by Gauri Vaidya, searchable by year and type, with BibTeX."],
  "/teaching/": ["Teaching — Gauri Vaidya", "Modules taught and students supervised by Gauri Vaidya."],
  "/talks/": ["Talks & Events — Gauri Vaidya", "Invited talks, workshops, awards and events."],
  "/contact/": ["Contact — Gauri Vaidya", "Get in touch with Gauri Vaidya."],
};
export const meta = (path: string) => {
  const [title, description] = T[path] ?? ["Page not found — Gauri Vaidya", site.description];
  return { title, description, url: site.url + path };
};
export const ROUTE_PATHS = Object.keys(T);
