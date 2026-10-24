// Preview screenshots (not part of the site build). Usage: node tests/shots-onepage.mjs
import { chromium } from "playwright-core";
const B = process.env.BASE ?? "http://localhost:4181", OUT = process.env.OUT ?? "/workspace/gauri-shots-pro";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
async function shot(url, name, w, h, scheme, full = true) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
  const pg = await ctx.newPage();
  await pg.goto(url, { waitUntil: "networkidle" });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await pg.evaluate(() => document.fonts.ready); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(1300);
  await pg.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); await ctx.close();
}
const P = process.env.PREFIX ?? "terra";
const list = [
  ["/", `${P}-home-light`, 1440, 900, "light"],
  ["/", `${P}-home-dark`, 1440, 900, "dark"],
  ["/", `${P}-home-mobile-390`, 390, 844, "light"],
  ["/publications/", `${P}-publications-light`, 1440, 900, "light", false],
  ["/talks/", `${P}-talks-light`, 1440, 900, "light", false],
  ["/contact/", `${P}-contact-light`, 1440, 900, "light", false],
];
const only = process.env.ONLY;
for (const [p, n, w, h, s, f] of list) if (!only || n.includes(only)) await shot(B + p, n, w, h, s, f ?? true);
// Logo + favicon set at large size.
const pg = await browser.newPage({ viewport: { width: 1340, height: 420 } });
await pg.setContent(`<body style="margin:0;background:#FAFAF7;font:14px system-ui;color:#57534D;display:flex;gap:44px;align-items:flex-end;padding:40px 48px">
  ${[["favicon.svg", 256], ["icon-512.png", 200], ["apple-touch-icon.png", 180], ["icon-192.png", 140], ["favicon-32.png", 32]].map(([f, s]) =>
    `<figure style="margin:0;text-align:center"><img src="${B}/${f}" width="${s}" height="${s}" style="display:block;image-rendering:${f.endsWith("32.png") ? "pixelated" : "auto"}"><figcaption style="margin-top:10px">${f}</figcaption></figure>`).join("")}
  <div style="background:#111110;padding:24px;border-radius:12px;text-align:center"><img src="${B}/favicon.svg" width="96" height="96"><div style="color:#A8A49C;margin-top:8px">on dark</div></div></body>`);
await pg.waitForLoadState("networkidle"); await pg.screenshot({ path: `${OUT}/${P}-favicon.png` });
await browser.close();
