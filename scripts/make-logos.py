"""Generate monogram logo options as pure-path SVGs (no webfonts) from the self-hosted fonts.
Usage: python3 scripts/make-logos.py   -> writes brand/option-{a,b,c}.svg (needs fonttools + brotli)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
TEAL, SOFT, RING = "#0F6E6E", "#E3F0EE", "#C9E1DD"

def glyphs(font, text):
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    out, x = [], 0
    for ch in text:
        name = cmap[ord(ch)]
        out.append((gs[name], x)); x += hmtx[name][0]
    return out

def path_for(font, text, box, cx=32, cy=32, tracking=0):
    """Return an SVG path 'd' for `text`, scaled so its ink bbox fits `box` (w,h) and is centred at (cx,cy)."""
    gl = glyphs(font, text)
    gl = [(g, x + i * tracking) for i, (g, x) in enumerate(gl)]
    bp = BoundsPen(font.getGlyphSet())
    for g, x in gl:
        g.draw(TransformPen(bp, (1, 0, 0, 1, x, 0)))
    x0, y0, x1, y1 = bp.bounds
    s = min(box[0] / (x1 - x0), box[1] / (y1 - y0))
    tx, ty = cx - s * (x0 + x1) / 2, cy + s * (y0 + y1) / 2  # flip y
    sp = SVGPathPen(font.getGlyphSet(), lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    for g, x in gl:
        g.draw(TransformPen(sp, (s, 0, 0, -s, tx + s * x, ty)))
    return sp.getCommands()

gv = TTFont(ROOT / "public/fonts/greatvibes-logo.woff2")
ms = instantiateVariableFont(TTFont(ROOT / "public/fonts/montserrat-latin-var.woff2"), {"wght": 600})

svg = lambda body: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{body}</svg>\n'
# A light stroke thickens the hairline calligraphy so it survives 16 px.
# Great Vibes 'G' has a long flourish; optical centre nudged slightly right/down.
opts = {
    "a": svg(f'<circle cx="32" cy="32" r="31" fill="{SOFT}" stroke="{RING}" stroke-width="2"/>'
             f'<path fill="{TEAL}" stroke="{TEAL}" stroke-width="1.6" stroke-linejoin="round" d="{path_for(gv, "G", (46, 48), 33, 33)}"/>'),
    "b": svg(f'<rect width="64" height="64" rx="14" fill="{TEAL}"/>'
             f'<path fill="#fff" d="{path_for(ms, "GV", (44, 24), 32, 32, tracking=-40)}"/>'),
    "c": svg(f'<circle cx="32" cy="32" r="32" fill="{TEAL}"/>'
             f'<path fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" d="{path_for(gv, "G", (46, 48), 33, 33)}"/>'),
}
out = ROOT / "brand"; out.mkdir(exist_ok=True)
for k, v in opts.items():
    (out / f"option-{k}.svg").write_text(v)
    print(k, len(v), "bytes")
