// Renders the 1200×630 share cards: `node scripts/og-brand.mjs` → public/og-image-brand.jpg (GV monogram, used while PORTRAIT is null);
// `node scripts/og-brand.mjs photo` → public/og-image.jpg (circular portrait with a thin terracotta ring, used when PORTRAIT is set).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url);
const svg = readFileSync(new URL("brand/option-b.svg", root), "utf8");
const font = (f) => "data:font/woff2;base64," + readFileSync(new URL(`public/fonts/${f}`, root)).toString("base64");
const PHOTO = process.argv[2] === "photo";
const img = "data:image/jpeg;base64," + readFileSync(new URL("public/images/portrait-340.jpg", root)).toString("base64");
const mark = PHOTO
  ? `<div class="ph"><img src="${img}"></div>`
  : `<div class="m">${svg}</div>`;
const html = `<!doctype html><style>
@font-face{font-family:Mont;src:url(${font("montserrat-latin-var.woff2")});font-weight:100 900}
@font-face{font-family:InterV;src:url(${font("inter-latin-var.woff2")});font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;background:#FAFAF7}
.c{display:flex;align-items:center;gap:72px;height:100%;padding:0 120px;box-sizing:border-box}
.m svg{width:260px;height:260px;display:block}
.ph{width:300px;height:300px;flex:none}.ph img{width:300px;height:300px;border-radius:50%;object-fit:cover;display:block;outline:3px solid #A84B29;outline-offset:8px}
h1{font:600 76px/1 Mont;letter-spacing:-.03em;color:#1C1B19;margin:0 0 30px}
hr{width:56px;border:0;border-top:4px solid #A84B29;margin:0 0 28px}
p{font:400 30px/1.45 InterV;color:#4A4945;margin:0}
</style><div class="c">${mark}<div><h1>Gauri Vaidya</h1><hr><p>Senior Postdoctoral Researcher<br>NKDSS, School of Medicine<br>University of Limerick</p></div></div>`;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: "load" }); await p.evaluate(async () => { await document.fonts.load("600 76px Mont"); await document.fonts.load("30px InterV"); await document.fonts.ready; });
console.log(await p.evaluate(() => [...document.fonts].map((f) => f.family + ":" + f.status).join(" ")));
await p.screenshot({ path: new URL(PHOTO ? "public/og-image.jpg" : "public/og-image-brand.jpg", root).pathname, type: "jpeg", quality: 88 });
await b.close();
