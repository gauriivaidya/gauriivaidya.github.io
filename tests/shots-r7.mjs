import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const B = process.env.BASE ?? "http://localhost:4174", OUT = "/workspace/gauri-shots-pro";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const list = [
  ["/about/", "r7-about-light", 1440, "light"],
  ["/preview/home-a/", "r7-home-A-light", 1440, "light"], ["/preview/home-a/", "r7-home-A-dark", 1440, "dark"],
  ["/preview/home-b/", "r7-home-B-light", 1440, "light"], ["/preview/home-b/", "r7-home-B-dark", 1440, "dark"],
  ["/preview/home-a/", "r7-home-A-mobile-390", 390, "light"], ["/preview/home-b/", "r7-home-B-mobile-390", 390, "light"],
  ["/", "r7-home-current-light", 1440, "light"],
];
for (const [p, n, w, scheme] of list) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
  const pg = await ctx.newPage();
  await pg.goto(B + p, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${OUT}/${n}.png`, fullPage: true }); await ctx.close();
}
// Tab titles as served (prerendered <title>)
const pg = await browser.newPage(); const rows = [];
for (const p of ["/", "/about/", "/publications/", "/teaching/", "/talks/", "/contact/", "/404.html"]) { await pg.goto(B + p); rows.push([p, await pg.title()]); }
writeFileSync(`${OUT}/r7-tab-titles.txt`, rows.map(([p, t]) => `${p.padEnd(16)} ${t}`).join("\n") + "\n");
const fav = "/favicon.svg";
await pg.setContent(`<body style="margin:0;padding:24px;background:#FAFAF7;font:13px system-ui"><div style="display:flex;flex-wrap:wrap;background:#DEE1E6;padding:8px 8px 0;border-radius:8px 8px 0 0;width:fit-content">${rows.map(([, t], i) => `<div style="display:flex;align-items:center;gap:8px;width:200px;height:34px;padding:0 12px;border-radius:8px 8px 0 0;${i === 0 ? "background:#fff" : ""};color:#3C4043"><img src="${B}${fav}" width="16" height="16"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span><span style="opacity:.6">×</span></div>`).join("")}</div></body>`);
await pg.setViewportSize({ width: 1100, height: 200 }); await pg.waitForTimeout(300);
await pg.screenshot({ path: `${OUT}/r7-tab-titles.png`, fullPage: true });
console.log(rows.map((r) => r.join("  →  ")).join("\n"));
await browser.close();
