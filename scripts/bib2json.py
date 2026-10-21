#!/usr/bin/env python3
"""Convert content/publications.bib (+ optional content/publications.meta.json)
into src/data/publications.json. Standard library only.

Usage: python3 scripts/bib2json.py [bibfile] [outfile]
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIB = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "content/publications.bib"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "src/data/publications.json"
META = ROOT / "content/publications.meta.json"

TYPE_MAP = {"article": "journal", "inproceedings": "conference", "conference": "conference",
            "incollection": "book chapter", "inbook": "book chapter", "book": "book chapter"}
LATEX = {r"{\'e}": "é", r"\'e": "é", r"{\"o}": "ö", r"{\"u}": "ü", r"\#": "#", "--": "–", "~": " "}

def strip_comments(text):
    return "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("%"))

def entries(text):
    i = 0
    while True:
        m = re.compile(r"@(\w+)\s*\{\s*([^,\s]+)\s*,").search(text, i)
        if not m: return
        depth, j = 1, m.end()
        start = text.index("{", m.start())
        j = start + 1
        while depth and j < len(text):
            depth += {"{": 1, "}": -1}.get(text[j], 0); j += 1
        yield m.group(1).lower(), m.group(2), text[m.start():j], text[m.end():j - 1]
        i = j

def fields(body):
    out, i = {}, 0
    pat = re.compile(r"\s*(\w+)\s*=\s*")
    while i < len(body):
        m = pat.match(body, i)
        if not m: break
        name, i = m.group(1).lower(), m.end()
        if body[i] == "{":
            depth, j = 1, i + 1
            while depth: depth += {"{": 1, "}": -1}.get(body[j], 0); j += 1
            val, i = body[i + 1:j - 1], j
        elif body[i] == '"':
            j = body.index('"', i + 1); val, i = body[i + 1:j], j + 1
        else:
            j = i
            while j < len(body) and body[j] not in ",\n": j += 1
            val, i = body[i:j].strip(), j
        out[name] = val
        while i < len(body) and body[i] in ", \n\t\r": i += 1
    return out

def clean(s):
    for k, v in LATEX.items(): s = s.replace(k, v)
    return re.sub(r"\s+", " ", s.replace("{", "").replace("}", "")).strip()

def author(a):
    a = clean(a)
    if "," in a:
        last, first = [p.strip() for p in a.split(",", 1)]
    else:
        parts = a.split(); last, first = parts[-1], " ".join(parts[:-1])
    initials = "".join(p[0] for p in re.split(r"[\s.\-]+", first) if p)
    return f"{last} {initials}".strip()

def main():
    meta = json.loads(META.read_text()) if META.exists() else {}
    pubs = []
    for etype, key, raw, body in entries(strip_comments(BIB.read_text(encoding="utf-8"))):
        f = fields(body); m = meta.get(key, {})
        ptype = m.get("type") or TYPE_MAP.get(etype) or ("preprint" if "arxiv" in f.get("howpublished", "").lower() else "other")
        venue = f.get("journal") or f.get("booktitle") or f.get("howpublished") or f.get("school") or ""
        pubs.append({
            "key": key, "type": ptype, "label": m.get("label"),
            "authors": [author(a) for a in re.split(r"\s+and\s+", f.get("author", "")) if a.strip()],
            "title": clean(f.get("title", "")), "venue": clean(venue),
            "publisher": clean(f.get("publisher", "")) or None,
            "year": int(f["year"]) if f.get("year", "").isdigit() else None,
            "volume": f.get("volume"), "issue": f.get("number") or f.get("issue"),
            "pages": clean(f["pages"]) if f.get("pages") else None,
            "doi": f.get("doi") or m.get("doi"), "url": f.get("url") or m.get("link") or m.get("paper"),
            "abbr": m.get("abbr"), "selected": bool(m.get("selected")),
            "abstract": clean(m.get("abstract") or f.get("abstract", "")) or None,
            "pdf": m.get("pdf"), "code": m.get("code"), "slides": m.get("slides"), "video": m.get("video"), "project": m.get("project"),
            "bibtex": raw.strip(),
        })
    pubs.sort(key=lambda p: (-(p["year"] or 0), p["title"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pubs, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"bib2json: wrote {len(pubs)} publications to {OUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
