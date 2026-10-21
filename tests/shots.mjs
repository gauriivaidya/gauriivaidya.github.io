import { chromium } from "playwright-core";
const B = process.env.BASE ?? "http://localhost:4174", OUT = "/workspace/gauri-shots-pro";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const list = [
  ["/", "home-desktop-light-1440x900", 1440, 900, false, "light"], ["/", "home-desktop-dark-1440x900", 1440, 900, false, "dark"],
  ["/", "home-desktop-light-full", 1440, 900, true, "light"],
  ["/about/", "about-desktop-full", 1440, 900, true, "light"],
  ["/publications/", "publications-desktop-dark-full", 1440, 900, true, "dark"],
  ["/publications/", "publications-desktop-light-full", 1440, 900, true, "light"],
  ["/talks/", "talks-desktop-dark-full", 1440, 900, true, "dark"],
  ["/", "home-mobile-dark-390-full", 390, 844, true, "dark"], ["/", "home-mobile-light-390-full", 390, 844, true, "light"],
];
for (const [p, n, w, h, full, scheme] of list) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
  const pg = await ctx.newPage();
  await pg.goto(B + p, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${OUT}/v3-${n}.png`, fullPage: full }); await ctx.close();
}
await browser.close();
