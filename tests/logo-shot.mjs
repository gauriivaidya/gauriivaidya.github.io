import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const dir = new URL("../brand", import.meta.url).pathname;
const svgs = ["a", "b", "c"].map((k) => "data:image/svg+xml;base64," + Buffer.from(readFileSync(`${dir}/option-${k}.svg`)).toString("base64"));
const names = ["(a) Calligraphic G · teal on soft teal", "(b) GV monogram · white on teal square", "(c) Calligraphic G · white on teal circle — wired as default"];
const tab = (src, title, active, dark) => `<div class="tab ${active ? "on" : ""} ${dark ? "dk" : ""}"><img src="${src}" width="16" height="16"><span>${title}</span><b>×</b></div>`;
const html = `<!doctype html><html><head><style>
body{margin:0;padding:36px 44px;background:#FAFAF7;font:14px/1.4 system-ui,sans-serif;color:#1C1B19;width:1200px}
h1{font:600 22px system-ui;margin:0 0 4px}p.s{margin:0 0 24px;color:#57534D}
.row{display:grid;grid-template-columns:330px 1fr;gap:28px;align-items:center;padding:22px 0;border-top:1px solid #E6E4DE}
.sizes{display:flex;align-items:flex-end;gap:22px}.sizes figure{margin:0;text-align:center;font-size:11px;color:#57534D}
.sizes img{display:block;margin:0 auto 6px;image-rendering:auto}
.big{width:128px;height:128px}
.strips{display:flex;flex-direction:column;gap:10px}
.bar{display:flex;align-items:flex-end;gap:0;background:#DEE1E6;padding:8px 8px 0;border-radius:8px 8px 0 0}
.bar.dkb{background:#202124}
.tab{display:flex;align-items:center;gap:8px;width:210px;height:34px;padding:0 12px;font-size:12px;color:#3C4043;border-radius:8px 8px 0 0}
.tab.on{background:#fff}.tab.dk{color:#BDC1C6}.tab.dk.on{background:#35363A;color:#E8EAED}
.tab span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tab b{font-weight:400;opacity:.6}
.label{font-weight:600;margin-bottom:10px}
</style></head><body><h1>Favicon / logo options</h1><p class="s">Pure SVG paths generated from the site's own Great Vibes and Montserrat fonts. Shown at 64, 32 and 16 px (actual pixels) and in light and dark browser tab strips.</p>
${svgs.map((s, i) => `<div class="row"><div><div class="label">${names[i]}</div><div class="sizes">
<figure><img class="big" src="${s}">128</figure><figure><img src="${s}" width="64" height="64">64</figure><figure><img src="${s}" width="32" height="32">32</figure><figure><img src="${s}" width="16" height="16">16</figure></div></div>
<div class="strips"><div class="bar">${tab(s, "Dr Gauri Vaidya", true)}${tab(s, "Gauri Vaidya | Publications")}${tab(s, "Gauri Vaidya | Talks")}</div>
<div class="bar dkb">${tab(s, "Dr Gauri Vaidya", true, true)}${tab(s, "Gauri Vaidya | Publications", false, true)}${tab(s, "Gauri Vaidya | Talks", false, true)}</div></div></div>`).join("")}
</body></html>`;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1288, height: 800 }, deviceScaleFactor: 1 });
await p.setContent(html); await p.waitForTimeout(300);
await p.screenshot({ path: "/workspace/gauri-shots-pro/logo-options.png", fullPage: true });
const p2 = await b.newPage({ viewport: { width: 1288, height: 800 }, deviceScaleFactor: 2 });
await p2.setContent(html); await p2.waitForTimeout(300);
await p2.screenshot({ path: "/workspace/gauri-shots-pro/logo-options@2x.png", fullPage: true });
await b.close();
