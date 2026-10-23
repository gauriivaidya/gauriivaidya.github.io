#!/usr/bin/env python3
"""Convert content/talks.yaml + awards.yaml -> src/data/events.json and
content/teaching.yaml -> src/data/teaching.json for the website.

Talks & Events page: awards (unless `site: false`) come first within their year, then talks in file order.
CV-only fields (cv, cv_*) are ignored here. Usage: python3 scripts/content2json.py
"""
import json

import content

OUT = content.ROOT / "src/data"
SITE_EVENT = ["title", "type", "date", "year", "host", "location", "role", "description", "image", "imageAlt", "link"]
SITE_TEACH = ["code", "name", "years", "institution", "location", "role", "level", "description", "resources"]

def pick(e, keys):
    return {k: e[k] for k in keys if e.get(k) not in (None, "", [])}

def events():
    awards = [dict(e, type=content.AWARD_TYPE, role=e.get("role") or "Honouree") for e in content.awards() if e.get("site", True)]
    talks = content.talks()
    years = sorted({e["year"] for e in awards + talks}, reverse=True)
    out, seen = [], set()
    for y in years:
        for e in [a for a in awards if a["year"] == y] + [t for t in talks if t["year"] == y]:
            ident = base = content.slug(e["title"])
            n = 2
            while ident in seen: ident, n = f"{base}-{n}", n + 1
            seen.add(ident)
            out.append({"id": ident, **pick(e, SITE_EVENT)})
    return out

def main():
    ev, te = events(), [pick(e, SITE_TEACH) for e in content.teaching()]
    for name, data in (("events.json", ev), ("teaching.json", te)):
        (OUT / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"content2json: wrote {len(ev)} talks/events/awards and {len(te)} teaching records to src/data/")

if __name__ == "__main__":
    content.run(main)
