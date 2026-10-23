"""Load and check content/talks.yaml, teaching.yaml and awards.yaml.

Shared by scripts/content2json.py (website data) and scripts/build-cv.py (CV).
Errors name the file and the entry so they are easy to fix from GitHub's web editor.
"""
import re, sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

EVENT_TYPES = ["Invited Talks", "Conference Presentations", "Workshops", "Panels", "Media Appearances", "Other Events"]
AWARD_TYPE = "Awards / Recognition"

class ContentError(Exception):
    pass

def _load(name):
    path = CONTENT / name
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or []
    except yaml.YAMLError as e:
        raise ContentError(f"{name}: not valid YAML ({e}). Check indentation and that titles with ':' are in quotes.")
    if not isinstance(data, list):
        raise ContentError(f"{name}: expected a list of entries, each starting with '- '.")
    for i, e in enumerate(data, 1):
        if not isinstance(e, dict):
            raise ContentError(f"{name}, entry {i}: expected fields like 'title: ...'.")
        for k, v in list(e.items()):
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                e[k] = str(v)  # e.g. date: 2025 written without quotes
    return data

def _need(name, i, e, *fields):
    for f in fields:
        if not str(e.get(f) or "").strip():
            label = e.get("title") or e.get("name") or f"entry {i}"
            raise ContentError(f"{name}, entry {i} ({label}): '{f}' is required.")

def first_year(text, where):
    m = re.search(r"\b(19|20)\d{2}\b", str(text))
    if not m:
        raise ContentError(f"{where}: date '{text}' must contain a year, e.g. 'Mar 2027' or '2027'.")
    return int(m.group(0))

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:48]

def talks():
    data = _load("talks.yaml")
    for i, e in enumerate(data, 1):
        _need("talks.yaml", i, e, "title", "type", "date")
        if e["type"] not in EVENT_TYPES:
            raise ContentError(f"talks.yaml, entry {i} ({e['title']}): type must be one of: {', '.join(EVENT_TYPES)}.")
        e["year"] = first_year(e["date"], f"talks.yaml, entry {i} ({e['title']})")
    return data

def awards():
    data = _load("awards.yaml")
    for i, e in enumerate(data, 1):
        _need("awards.yaml", i, e, "title", "date")
        e["year"] = first_year(e["date"], f"awards.yaml, entry {i} ({e['title']})")
    return data

def teaching():
    data = _load("teaching.yaml")
    for i, e in enumerate(data, 1):
        _need("teaching.yaml", i, e, "name", "years", "institution", "role")
        first_year(e["years"], f"teaching.yaml, entry {i} ({e['name']})")
    return data

def run(main):
    try:
        main()
    except ContentError as e:
        sys.exit(f"content error: {e}")
