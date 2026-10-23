# gauriivaidya.github.io

Personal academic website of Gauri Vaidya — React 19 + TypeScript + Vite, prerendered to static HTML for GitHub Pages (user site, base `/`).

## Setup
```bash
npm install
npm run dev        # http://localhost:5173
pip install -r requirements.txt   # pyyaml + jinja2 for the content/CV scripts
npm run build      # build:cv then build:site
npm run build:cv   # content/ + cv/cv.tex.j2 → public/cv.pdf (needs TeX Live: scripts/install-texlive.sh); privacy checks
npm run build:site # content/*.yaml → src/data/*.json, bib → JSON, typecheck, client build, SSR prerender, 404.html, sitemap.xml
npm run preview    # serve dist/ at http://localhost:4173
npm run test:e2e   # browser tests against the preview (needs Chrome; set CHROME=/path if not /usr/bin/google-chrome)
```

## Deploy
Push to `main` of the repo **gauriivaidya.github.io**. In *Settings → Pages* choose **Source: GitHub Actions**. `.github/workflows/deploy.yml` installs a cached TeX Live 2025, builds the CV and the site, and publishes `dist/`.

## Updating content
| What | Where |
|---|---|
| Publications | `content/publications.bib` (BibTeX). Optional extras (type override, label, paper/slides/video/project URLs) in `content/publications.meta.json`. Run `npm run bib` (or just `npm run build`) — `scripts/bib2json.py` regenerates `src/data/publications.json`. Types: `@article`→journal, `@inproceedings`→conference, `@incollection`/`@inbook`→book chapter, arXiv `@misc`→preprint, everything else→other. Add `doi = {...}` and a DOI link appears automatically. |
| Talks, teaching, awards | `content/talks.yaml`, `content/teaching.yaml`, `content/awards.yaml` — one source for the website and the CV; see `content/README.md`. `scripts/content2json.py` writes `src/data/events.json` and `teaching.json` (generated, don't edit). |
| Contact links, hero sentence, role | `src/data/site.ts`. Values set to `PLACEHOLDER` show as “To be added”. |
| Home = About (al-folio profile) | bio text in `src/data/bio.ts`; address under the portrait in `src/data/site.ts` (`address`) |
| Venue badges / abstracts | `"abbr"` and `"abstract"` per key in `content/publications.meta.json` (an ABS button appears only when an abstract exists) |
| `/about/` | alias of `/` (prerendered with canonical `/`, URL rewritten client-side) |
| CV | generated: `cv/cv.tex.j2` (static parts) + content/ (awards, teaching, publications, talks) → `public/cv.pdf` by `scripts/build-cv.py`. Papers go on the CV via `"cv"` in `content/publications.meta.json`. Served at `/cv.pdf` for sharing privately; not linked anywhere on the site, not in the sitemap, `Disallow`ed in robots.txt |

## Logo / favicon
Sources: `brand/option-{a,b,c}.svg`, generated as pure SVG paths from the self-hosted fonts by `python3 scripts/make-logos.py` (needs `fonttools` + `brotli`).
Set the favicon (+ 32 px PNG, apple-touch-icon, manifest icons): `node scripts/render-icons.mjs c` (or `a` / `b`).

## Structure
```
content/            talks.yaml, teaching.yaml, awards.yaml, publications.bib, publications.meta.json, README.md (how to edit)
cv/                 cv.tex.j2 (CV template), texlive-packages.txt
scripts/            content2json.py, bib2json.py, build-cv.py, content.py, install-texlive.sh, prerender.mjs
src/components/     Header, Footer, PageLayout, Search, CheckList (filters), MenuToggle, ThemeToggle,
                    PublicationEntry, EventCard, TeachingRecord, YearGroup, BookingDialog, ProfileLinks, Icons
src/pages/          Home, Publications, Teaching, Events, Contact, NotFound
src/data/           site.ts, bio.ts, teaching.ts, events.ts, types.ts; events.json, teaching.json, publications.json (generated)
src/styles/         tokens.css (palette, fonts, spacing), global.css
tests/              e2e.mjs, shots.mjs, shots-std.mjs
```
