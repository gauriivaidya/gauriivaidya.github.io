// Prerender every route to static HTML for GitHub Pages, plus 404.html and sitemap.xml.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { render, meta, ROUTE_PATHS, ALIASES } = await import(pathToFileURL(join(root, "dist-ssr/entry-server.js")).href);
const template = readFileSync(join(dist, "index.html"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const page = (path, noindex = false) => {
  const m = meta(path);
  let html = template.replaceAll("%TITLE%", esc(m.title)).replaceAll("%DESC%", esc(m.description)).replaceAll("%URL%", m.url)
    .replace("<!--app-->", render(path));
  if (noindex) html = html.replace("</head>", '<meta name="robots" content="noindex" />\n  </head>');
  return html;
};

for (const p of ROUTE_PATHS) {
  const out = join(dist, p, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(p));
  console.log("prerendered", p);
}
// Aliases (e.g. /about/ → /): same page, canonical points at the target; the client then rewrites the URL.
for (const [from, to] of Object.entries(ALIASES)) {
  const out = join(dist, from, "index.html"); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(to)); console.log("prerendered alias", from, "→", to);
}
writeFileSync(join(dist, "404.html"), page("/__not-found__/", true));
const base = "https://gauriivaidya.github.io";
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ROUTE_PATHS.map((p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log("wrote 404.html, sitemap.xml");
