import { site } from "./data/site";
// Browser-tab titles: home is "Dr Gauri Vaidya"; every other page is "Gauri Vaidya | <Page>".
const t = (page: string) => `${site.name} | ${page}`;
const T: Record<string, [string, string]> = {
  "/": ["Dr Gauri Vaidya", site.description],
  "/publications/": [t("Publications"), "Publications by Gauri Vaidya, searchable by year and type, with BibTeX."],
  "/teaching/": [t("Teaching"), "Modules taught by Gauri Vaidya at the University of Limerick."],
  "/talks/": [t("Talks"), "Invited talks, workshops, awards and events."],
  "/cv/": [t("CV"), "Curriculum vitae of Gauri Vaidya (PDF)."],
  "/contact/": [t("Contact"), "Get in touch with Gauri Vaidya."],
};
export const meta = (path: string) => {
  const [title, description] = T[path] ?? [t("Page not found"), site.description];
  return { title, description, url: site.url + path };
};
export const ROUTE_PATHS = Object.keys(T);
