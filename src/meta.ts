import { site } from "./data/site";
// Browser-tab titles: home is "Dr Gauri Vaidya"; every other page is "Gauri Vaidya | <Page>".
const t = (page: string) => `${site.name} | ${page}`;
const T: Record<string, [string, string]> = {
  "/": ["Dr Gauri Vaidya", site.description],
  "/about/": [t("About"), "About Gauri Vaidya: researcher in data, AI and health systems at the University of Limerick."],
  "/publications/": [t("Publications"), "Publications by Gauri Vaidya, searchable by year and type, with BibTeX."],
  "/teaching/": [t("Teaching"), "Modules taught by Gauri Vaidya at the University of Limerick."],
  "/talks/": [t("Talks"), "Invited talks, workshops, awards and events."],
  "/contact/": [t("Contact"), "Get in touch with Gauri Vaidya."],
};
/** Home-page design previews (built only with VITE_PREVIEW_HOMES=1; never in the sitemap, always noindex). */
export const PREVIEW_PATHS = ["/preview/home-a/", "/preview/home-b/", "/preview/home-c/", "/preview/home-d/", "/preview/home-e/"];
export const meta = (path: string) => {
  const [title, description] = T[path] ?? (PREVIEW_PATHS.includes(path) ? T["/"] : [t("Page not found"), site.description]);
  return { title, description, url: site.url + path };
};
export const ROUTE_PATHS = Object.keys(T);
