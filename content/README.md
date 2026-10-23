# Updating your website and CV

Your talks, teaching and awards are kept in a few plain text files in this folder. Each one feeds **both** your website and your CV.
When you save a change, GitHub rebuilds both automatically and they go live in a few minutes.

| To add… | Edit this file | It appears on |
|---|---|---|
| A talk, workshop or event | `talks.yaml` | Talks & Events page, and the CV if you add `cv: Invited Talks` or `cv: Workshops` |
| A module you taught | `teaching.yaml` | Teaching page and the CV's Teaching Experience |
| An award or honour | `awards.yaml` | CV's Honours and Awards, and the Talks & Events page (unless `site: false`) |
| A paper | `publications.bib` (+ `publications.meta.json`) | Publications page, and the CV if its entry in `publications.meta.json` has `"cv": "Journal Articles"` (or another CV subsection) |

## Adding something from your browser (no software needed)

1. Go to <https://github.com/gauriivaidya/gauriivaidya.github.io/tree/main/content> and open the file, e.g. `talks.yaml`.
2. Click the **pencil** icon (Edit this file).
3. The top of the file has an example entry in grey (lines starting with `#`). Copy it, paste it **at the top of the list** (newest first), remove the `#`s and change the details.
4. Click **Commit changes…** and then **Commit changes** again.
5. Open the **Actions** tab to watch it build. A green tick means the website and the CV are updated (usually 1–2 minutes; up to about 5 minutes the first time in a while).
   A red cross means something needs fixing. Click it and the message says which file and entry, e.g. *"talks.yaml, entry 3 (My talk): 'date' is required"*. Nothing changes on the live site until it builds.

## Example: a new talk in `talks.yaml`

```yaml
- title: Machine Learning for Kidney Disease Surveillance
  type: Invited Talks
  date: Mar 2027
  host: Royal College of Surgeons in Ireland
  location: Dublin, Ireland
  role: Invited Speaker
  cv: Invited Talks
```

Every line starts with two spaces except the first one, which starts with `- `. The spaces matter.

## Tips

- **Colons in a title:** put the title in quotes, e.g. `title: "SHIELD: Do It the Safe Way"`.
- **Dates:** `Mar 2027`, `21 Oct 2024`, `2027` or `2021–2025` (teaching: `Spring 2027`, `Fall 2026, Fall 2027`). The year is picked out automatically and the CV puts the date on the right.
- **Same text everywhere:** the website and the CV use the same title, host and description, so write each once:
  titles in Title Case; `location` as `City, Country` (or just `Country`); descriptions as full sentences ending in a full stop;
  people as `Prof Name` / `Dr Name` (no full stop; the CV removes one if you type it).
- **Keeping something off the CV:** for talks, leave out the `cv:` line. For teaching and awards, add `cv: false`. To keep an award off the website, add `site: false`.
- **CV layout is automatic:** dates, bold and italics, punctuation, the order (newest first) and the citation style for papers are set by `scripts/build-cv.py` and `cv/cv.tex.j2`, so don't add formatting in the YAML.
- **Privacy:** the CV build stops if the CV would contain a phone number, a gmail.com address or a "Projects" heading.
- **Everything else on the CV** (education, experience, funding, supervision, service…) is in `cv/cv.tex.j2` for now.

## On your own computer (optional)

`npm run build` builds the CV and the website. This needs Python with `pip install -r requirements.txt`, and TeX Live from `scripts/install-texlive.sh`.
`npm run build:site` builds only the website. `npm run build:cv` builds only `public/cv.pdf`.
