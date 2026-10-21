import { chromium } from "playwright-core";
const B = process.env.BASE ?? "http://localhost:4175", OUT = process.env.OUT ?? "/workspace/gauri-shots-pro";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const list = [
  ["/", "home-desktop-light", 1440, 900, "light"], ["/publications/", "publications-desktop-light", 1440, 900, "light"],
  ["/teaching/", "teaching-desktop-light", 1440, 900, "light"], ["/talks/", "talks-desktop-light", 1440, 900, "light"],
  ["/cv/", "cv-desktop-light", 1440, 900, "light"], ["/contact/", "contact-desktop-light", 1440, 900, "light"],
  ["/", "home-desktop-dark", 1440, 900, "dark"], ["/", "home-mobile-390", 390, 844, "light"], ["/publications/", "publications-mobile-390", 390, 844, "light"],
];
for (const [p, n, w, h, scheme] of list) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
  const pg = await ctx.newPage();
  await pg.goto(B + p, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(p === "/cv/" ? 1500 : 200);
  await pg.screenshot({ path: `${OUT}/std-${n}.png`, fullPage: true }); await ctx.close();
}
await browser.close();
