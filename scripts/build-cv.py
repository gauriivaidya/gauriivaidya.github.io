#!/usr/bin/env python3
"""Build the CV: render cv/cv.tex.j2 with content/*.yaml + content/publications.bib, compile with
latexmk (pdflatex), run the privacy checks, and copy the result to public/cv.pdf.

Filled from data: Honours and Awards, Teaching Experience, Publications (except "In Preparation"),
Invited Talks, Workshops. Everything else is static text in the template. The layout conventions (dates, places,
names, entries, citations) are defined once, below and in the template's macros, so data-driven and static
entries look the same.

Usage: python3 scripts/build-cv.py            build public/cv.pdf
       python3 scripts/build-cv.py --tex      only render cv/build/cv.tex (no TeX needed)
       python3 scripts/build-cv.py --check F  run the privacy checks on an existing PDF
Env:   CV_DATE="22 Oct 2026" overrides the "Last updated" date (default: today, Europe/London).
       CV_PLACEHOLDERS=1 also renders the placeholder entries (Institutional Service) for a local preview; never set in CI.
"""
import json, re, shutil, subprocess, sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import jinja2

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content
from bib2json import clean, entries, fields, strip_comments

ROOT = content.ROOT
TEMPLATE = ROOT / "cv/cv.tex.j2"
BUILD = ROOT / "cv/build"
OUT = ROOT / "public/cv.pdf"
TITLE = "Curriculum Vitae — Gauri Vaidya"
MONTHS = {m[:3]: m for m in ["January", "February", "March", "April", "May", "June", "July", "August",
                              "September", "October", "November", "December"]}
PUB_SECTIONS = ["Journal Articles", "Conference Papers", "Book Chapters and Short Papers", "Conference Abstracts", "Posters"]
TALK_SECTIONS = ["Invited Talks", "Workshops"]
TEACH_ORDER = ["Instructor", "Lecturer", "Teaching Assistant", "Tutor", "Demonstrator", "Moderator"]

# ---------- LaTeX escaping ----------
_SPECIAL = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_",
            "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
            "–": "--", "—": "---", "€": r"\texteuro{}", "×": r"$\times$"}

def _esc(s):
    s = "".join(_SPECIAL.get(c, c) for c in s)
    s = re.sub(r'"([^"]*)"', r"``\1''", s)                           # "quotes" -> ``quotes''
    s = re.sub(r"\b(Dr|Prof|Mr|Mrs|Ms)\.\s+", r"\1 ", s)             # convention: Prof, Dr, Mr without a full stop
    return re.sub(r"\bSt\. ", r"St.\\ ", s)                           # no sentence space after "St."

def tex(s):
    """Escape plain text for LaTeX. **bold** and *italic* (markdown-style) are kept as formatting."""
    out, s = [], str(s or "")
    for part in re.split(r"(\*\*(?=\S).+?(?<=\S)\*\*|(?<![\w*\\])\*(?=\S)[^*]+?(?<=\S)\*(?![\w*]))", s):
        if part.startswith("**") and part.endswith("**") and len(part) > 4: out.append(r"\textbf{" + _esc(part[2:-2]) + "}")
        elif part.startswith("*") and part.endswith("*") and len(part) > 2: out.append(r"\textit{" + _esc(part[1:-1]) + "}")
        else: out.append(_esc(part))
    return "".join(out)

def plain(s):
    """Escape text with no markdown interpretation (titles and venues such as "Evo* 2021")."""
    return _esc(str(s or ""))

def sentence(s):
    """Convention: every description, bullet and citation ends with a full stop."""
    s = str(s or "").strip()
    return s if not s or s[-1] in ".!?" else s + "."

# ---------- shared CV conventions (used for every data-driven entry; the template uses the same macros) ----------
_MON = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?"
TERM_RANK = {"Spring": 1, "Summer": 2, "Fall": 3, "Autumn": 3, "Winter": 4}

def fmt_date(d):
    """Convention: "D Mon YYYY" / "Mon YYYY" / "YYYY"; ranges with an unspaced en dash (2021--2025, 2025--Present);
    teaching terms as written ("Spring 2025, Spring 2026")."""
    d = re.sub(r"\b" + _MON + r"(?=\s|$)", lambda m: m.group(1), str(d).strip())
    d = re.sub(r"\s*[–—-]+\s*", "–", d)
    return tex(d)

def date_key(d):
    """Sort key for reverse-chronological order: latest year (Present highest), then month or term."""
    d = str(d)
    years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", d)] + ([9999] if "Present" in d else [])
    last = max(years) if years else 0
    months = [list(MONTHS).index(m) + 1 for m in re.findall(r"\b" + _MON[:-3] + r"\w*", d)] if not re.search(r"\b(?:19|20)\d{2}\s*[–—-]", d) else []
    terms = [TERM_RANK[t] for t, y in re.findall(r"\b(Spring|Summer|Fall|Autumn|Winter) ((?:19|20)\d{2})", d) if int(y) == last]
    return (last, max(months or terms or [0]))

def place(org, location=None):
    """Convention: "Organisation, City, Country"; the country is not repeated when the name already contains it."""
    org, loc = str(org or "").strip(), str(location or "").strip()
    if loc:
        parts = [p.strip() for p in loc.split(",")]
        if parts[-1] and parts[-1] in org: parts = parts[:-1]
        parts = [p for p in parts if p and p not in org]
        loc = ", ".join(parts)
    return tex(", ".join(x for x in (org, loc) if x))

def entry(title, date="", org="", meta=(), desc="", bullets=()):
    """Convention: bold title with the date right-aligned; italic organisation line; bold sentence-case labels
    ("Role: ..."); a description sentence; bullets. All arguments are already LaTeX."""
    out = [r"\cventry{%s}{%s}{%s}" % (title, date, org)]
    out += [r"\cvmeta{%s}{%s}" % m for m in meta]
    if desc: out.append(r"\cvdesc{%s}" % desc)
    if bullets: out += [r"\begin{itemize}"] + [r"  \item " + b for b in bullets] + [r"\end{itemize}"]
    return "\n".join(out)

def by_date(items, date):
    return sorted(items, key=lambda e: date_key(date(e)), reverse=True)     # stable: file order breaks ties

# ---------- sections ----------
def awards():
    return [entry(plain(e["title"]), fmt_date(e["date"]), place(e.get("host"), e.get("location")), desc=tex(sentence(e.get("description"))))
            for e in by_date([e for e in content.awards() if e.get("cv", True) is not False], lambda e: e["date"])]

def teaching():
    groups = {}
    for e in content.teaching():
        if e.get("cv", True) is False: continue
        title = (plain(e["code"]) + ": " if e.get("code") else "") + plain(e["name"])
        desc = " ".join(x for x in ((e["level"] + " module.") if e.get("level") else "", sentence(e.get("description"))) if x)
        groups.setdefault(e["role"], []).append((e, entry(title, fmt_date(e["years"]), place(e["institution"], e.get("location")), desc=tex(desc))))
    rank = lambda g: TEACH_ORDER.index(g) if g in TEACH_ORDER else len(TEACH_ORDER)
    return [(tex(g), [x for _e, x in sorted(groups[g], key=lambda t: date_key(t[0]["years"]), reverse=True)])
            for g in sorted(groups, key=lambda g: (rank(g), list(groups).index(g)))]

def talks():
    sections = {}
    for e in content.talks():
        sec = e.get("cv")
        if not sec: continue
        if sec not in TALK_SECTIONS: raise content.ContentError(f"talks.yaml ({e['title']}): cv must be one of {', '.join(TALK_SECTIONS)}.")
        sections.setdefault(sec, []).append(e)
    return [(sec, [entry(plain(e["title"]), fmt_date(e["date"]), place(e.get("host"), e.get("location")), desc=tex(sentence(e.get("description"))))
                   for e in by_date(sections[sec], lambda e: e["date"])]) for sec in TALK_SECTIONS if sec in sections]

def _initials(first):
    return " ".join(p[0] + "." for p in re.split(r"[\s.]+", first) if p)

def _authors(raw):
    """Convention: initials with full stops then surname ("G. Vaidya"); Oxford comma before "and"; her name in bold."""
    names = []
    for a in re.split(r"\s+and\s+", raw):
        a = clean(a)
        last, first = ([p.strip() for p in a.split(",", 1)] if "," in a else (a.split()[-1], " ".join(a.split()[:-1])))
        n = plain(f"{_initials(first)} {last}".strip())
        names.append(r"\textbf{" + n + "}" if last == "Vaidya" and first.startswith("G") else n)
    return names[0] if len(names) == 1 else " and ".join(names) if len(names) == 2 else ", ".join(names[:-1]) + ", and " + names[-1]

def _pages(p):
    """Page range -> "pp. 609--621"; a single article number -> "Article 8602"."""
    p = clean(p or "").strip()
    if not p: return ""
    return "pp. " + plain(re.sub(r"\s*[–—-]+\s*", "–", p)) if re.search(r"[–—-]", p) else "Article " + plain(p)

def _venue(etype, f, cv):
    """Convention: \\textit{Venue}, volume(issue) or Vol. N, publisher, city, pages or article number, year."""
    year = f.get("year", "")
    if etype == "article":
        vol = plain(f.get("volume", "") + (f"({f['number']})" if f.get("number") else ""))
        parts = [r"\textit{" + plain(clean(f["journal"])) + "}", vol, _pages(f.get("pages"))]
    elif f.get("eprint") and f.get("archiveprefix", "").lower() == "arxiv":
        parts = [r"\textit{arXiv preprint}", "arXiv:" + plain(f["eprint"])]
    else:
        bt = clean(f.get("booktitle", "") or re.sub(r"^Poster presented at\s+", "", clean(f.get("howpublished", ""))))
        vol = ""
        m = re.search(r",?\s*Volume\s+(\w+)$", bt)
        if m: bt, vol = bt[:m.start()], "Vol. " + m.group(1)
        parts = [r"\textit{" + plain(bt) + "}" if bt else ("Book chapter" if etype in ("incollection", "inbook") else "Manuscript"),
                 vol, plain(clean(f.get("publisher", ""))), plain(clean(f.get("address", "")) or cv.get("location", "")), _pages(f.get("pages"))]
        if year and year in bt: year = ""                                 # the year is already in the venue name
    return ", ".join(x for x in parts + [year] if x) + "."

def publications():
    """Convention: [n] Authors. ``Title.'' \\textit{Venue}, ..., year.  Titles in Title Case from the .bib;
    numbered continuously across subsections, newest first within each."""
    meta = json.loads((ROOT / "content/publications.meta.json").read_text(encoding="utf-8"))
    bib = (ROOT / "content/publications.bib").read_text(encoding="utf-8")
    secs = {}
    for idx, (etype, key, _raw, body) in enumerate(entries(strip_comments(bib))):
        cv = meta.get(key, {}).get("cv")
        if not cv: continue
        cv = {"section": cv} if isinstance(cv, str) else cv
        f = fields(body)
        cite = _authors(f.get("author", "")) + ". ``" + plain(sentence(clean(f.get("title", "")))) + "'' " + _venue(etype, f, cv)
        year = int(f["year"]) if f.get("year", "").isdigit() else 0
        secs.setdefault(cv["section"], []).append((-year, idx, cite))
    order = [s for s in PUB_SECTIONS if s in secs] + [s for s in secs if s not in PUB_SECTIONS]
    n, out = 0, []
    for s in order:
        items = []
        for _y, _i, c in sorted(secs[s]):
            n += 1; items.append(r"\pubitem{%d}{%s}" % (n, c))
        out.append((tex(s), items))
    return out

# ---------- privacy checks ----------
CHECKS = [
    ("a gmail.com address", r"gmail\s*\.\s*com"),
    ("a phone label", r"\b(?:tel|phone|mobile|mob|cell)\b\.?\s*:"),
    ("a tel: link", r"\btel:"),
    ("an international phone number", r"\+\s?\d{1,3}[\s.()-]{0,2}\d{2,4}[\s.()-]{0,2}\d{3}"),
    ("a phone number", r"(?<![\d-])\(?0\d{1,4}\)?[\s.-]\d{3}[\s.-]?\d{3,4}(?![\d-])"),
    ("a phone number", r"(?<![\d-])\d{3}[\s.-]\d{3}[\s.-]\d{3,4}(?![\d-])"),
]
PROJECTS_TEXT = r"(?im)^\s*(?:\w+\s+)?projects?\s*$"
PROJECTS_TEX = r"(?i)\\(?:sub)*section\*?\{[^}]*\bprojects?\b"

def privacy_problems(text, kind):
    found = [what for what, pat in CHECKS if re.search(pat, text, re.I)]
    if re.search(PROJECTS_TEXT if kind == "pdf" else PROJECTS_TEX, text): found.append("a 'Projects' heading")
    return sorted(set(found))

def pdf_text(pdf):
    return subprocess.run(["pdftotext", "-q", str(pdf), "-"], check=True, capture_output=True, text=True).stdout

def check_pdf(pdf):
    problems = [f"CV text contains {p}" for p in privacy_problems(pdf_text(pdf), "pdf")]
    info = subprocess.run(["pdfinfo", str(pdf)], check=True, capture_output=True, text=True).stdout
    title = re.search(r"^Title:\s*(.*)$", info, re.M)
    if not title or title.group(1).strip() != TITLE: problems.append(f"PDF title is not '{TITLE}'")
    return problems

# ---------- build ----------
def render():
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(str(TEMPLATE.parent)), block_start_string="((*", block_end_string="*))",
                             variable_start_string="(((", variable_end_string=")))", comment_start_string="((=", comment_end_string="=))",
                             trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True, undefined=jinja2.StrictUndefined, autoescape=False)
    updated = __import__("os").environ.get("CV_DATE") or datetime.now(ZoneInfo("Europe/London")).strftime("%-d %b %Y")
    src = env.get_template(TEMPLATE.name).render(updated=fmt_date(updated), show_placeholders=__import__("os").environ.get("CV_PLACEHOLDERS") == "1", awards=awards(), teaching=teaching(), talks=talks(), publications=publications())
    code = "\n".join(l for l in src.splitlines() if not l.lstrip().startswith("%"))   # commented-out lines never reach the PDF
    problems = privacy_problems(code, "tex")
    if problems: raise content.ContentError("privacy check failed on the CV source: contains " + ", ".join(problems))
    BUILD.mkdir(parents=True, exist_ok=True)
    (BUILD / "cv.tex").write_text(src, encoding="utf-8")
    return BUILD / "cv.tex"

def main():
    args = sys.argv[1:]
    if args[:1] == ["--check"]:
        problems = check_pdf(Path(args[1]))
        print("\n".join(problems) or "privacy checks passed"); sys.exit(1 if problems else 0)
    texfile = render()
    print(f"build-cv: rendered {texfile.relative_to(ROOT)}")
    todo = [i for i, l in enumerate(texfile.read_text(encoding="utf-8").splitlines(), 1) if "TODO: Gauri to fill in" in l]
    hidden = TEMPLATE.read_text(encoding="utf-8").count("((* if show_placeholders *))")
    if hidden and not todo:
        print(f"build-cv: {hidden} placeholder block(s) in cv/cv.tex.j2 are hidden from this CV (set CV_PLACEHOLDERS=1 to preview them).")
    if todo:   # placeholders must not go live: loud warning (a GitHub Actions annotation in CI), not a failure
        print(f"::warning title=CV placeholders::cv/cv.tex.j2 still has {len(todo)} placeholder entr{'y' if len(todo) == 1 else 'ies'} "
              f"('% TODO: Gauri to fill in', cv/build/cv.tex lines {', '.join(map(str, todo))}); they would be published in /cv.pdf.", file=sys.stderr)
    if "--tex" in args: return
    if not shutil.which("latexmk"): sys.exit("build-cv: latexmk not found — install TeX Live with scripts/install-texlive.sh (see content/README.md) or run `npm run build:site` for the website only.")
    r = subprocess.run(["latexmk", "-pdf", "-interaction=nonstopmode", "-halt-on-error", "-file-line-error", texfile.name], cwd=BUILD, capture_output=True, text=True)
    if r.returncode:
        log = (BUILD / "cv.log").read_text(errors="replace") if (BUILD / "cv.log").exists() else r.stdout
        errs = [l for l in log.splitlines() if l.startswith(("!", "./cv.tex:"))][:8]
        sys.exit("build-cv: LaTeX failed:\n  " + "\n  ".join(errs or log.splitlines()[-20:]))
    problems = check_pdf(BUILD / "cv.pdf")
    if problems: sys.exit("build-cv: privacy check FAILED, public/cv.pdf not updated:\n  " + "\n  ".join(problems))
    shutil.copyfile(BUILD / "cv.pdf", OUT)
    pages = re.search(r"Pages:\s*(\d+)", subprocess.run(["pdfinfo", str(OUT)], capture_output=True, text=True).stdout)
    print(f"build-cv: wrote {OUT.relative_to(ROOT)} ({pages.group(1) if pages else '?'} pages); privacy checks passed")

if __name__ == "__main__":
    content.run(main)
