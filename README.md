# gauriivaidya.github.io

Personal academic website of Gauri Vaidya — React 19 + TypeScript + Vite, prerendered to static HTML for GitHub Pages (user site, base `/`).

## Setup
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # bib → JSON, typecheck, client build, SSR prerender of every route, 404.html, sitemap.xml
npm run preview    # serve dist/ at http://localhost:4173
npm run test:e2e   # browser tests against the preview (needs Chrome; set CHROME=/path if not /usr/bin/google-chrome)
```

## Deploy
Push to `main` of the repo **gauriivaidya.github.io**. In *Settings → Pages* choose **Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes `dist/`.

## Updating content
| What | Where |
|---|---|
| Publications | `content/publications.bib` (BibTeX). Optional extras (type override, label, paper/slides/video/project URLs) in `content/publications.meta.json`. Run `npm run bib` (or just `npm run build`) — `scripts/bib2json.py` regenerates `src/data/publications.json`. Types: `@article`→journal, `@inproceedings`→conference, `@incollection`/`@inbook`→book chapter, arXiv `@misc`→preprint, everything else→other. Add `doi = {...}` and a DOI link appears automatically. |
| Teaching | `src/data/teaching.ts` — add an object (code, name, years, institution, role, description, optional `resources`). |
| Events & Media | `src/data/events.ts` — add an item; put real photos in `public/images/events/` and set `image`/`imageAlt`. Without an image a neutral placeholder is drawn. |
| Contact links, hero sentence, role | `src/data/site.ts`. Values set to `PLACEHOLDER` show as “To be added”. |
| About text | `src/pages/About.tsx` |
| Portrait | replace the `.portrait-ph` block in `src/pages/About.tsx` with an `<img>` |
| CV | `public/cv.pdf` |

## Home page design
`src/data/site.ts` → `homeVariant`: `"classic"` (centred intro, live default), `"areas"` (option A: research areas + recognitions) or `"editorial"` (option B). Content for A/B lives in `src/data/home.ts`.
To preview both without changing the default: `VITE_PREVIEW_HOMES=1 npm run build && npm run preview`, then open `/preview/home-a/` and `/preview/home-b/` (noindex, not in sitemap, not built in normal/CI builds).
Research-area links use `/publications/?topic=health|trustworthy-ai|optimisation` (keyword filter in `home.ts`).

## Logo / favicon
Sources: `brand/option-{a,b,c}.svg`, generated as pure SVG paths from the self-hosted fonts by `python3 scripts/make-logos.py` (needs `fonttools` + `brotli`).
Set the favicon (+ 32 px PNG, apple-touch-icon, manifest icons): `node scripts/render-icons.mjs c` (or `a` / `b`).

## Structure
```
content/            publications.bib, publications.meta.json
scripts/            bib2json.py, prerender.mjs
src/components/     Header, Footer, PageLayout, Button, Search/Select/Chips (filters),
                    PublicationEntry, EventCard, TeachingRecord, InteractiveWorkspace (SVG), BackgroundWaves
src/pages/          Home, About, Publications, Teaching, Events, Contact, NotFound
src/data/           site.ts, teaching.ts, events.ts, publications.json (generated), types.ts
src/styles/         tokens.css (palette, fonts, spacing), global.css
tests/              e2e.mjs, shots.mjs
```

## Illustration
`src/components/InteractiveWorkspace.tsx` is hand-authored SVG (no raster). Interactive groups: `#nav-about` (researcher + chair), `#nav-publications` (shelf books), `#nav-teaching` (notebook), `#nav-events-media` (corkboard + camera), `#nav-contact` ("Let's connect" card). They are focusable (Tab/Enter/Space), show a label only on hover/focus, and navigate client-side.
