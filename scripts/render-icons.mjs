// Render the chosen logo SVG to PNG favicons + manifest icons with headless Chrome.
// Usage: node scripts/render-icons.mjs [a|b|c]   (default c). Swap the favicon by re-running with another letter.
import { chromium } from "playwright-core";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
const opt = process.argv[2] ?? "c";
const pub = new URL("../public/", import.meta.url).pathname;
const svg = readFileSync(`${pub}../brand/option-${opt}.svg`, "utf8");
copyFileSync(`${pub}../brand/option-${opt}.svg`, `${pub}favicon.svg`);
const src = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
// Touch / manifest icons are full-bleed (iOS and Android apply their own mask): logo on its own background colour.
const bleed = opt === "a" ? "#E3F0EE" : "#0F6E6E";
const b = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
for (const [name, size, full] of [["favicon-32.png", 32, false], ["apple-touch-icon.png", 180, true], ["icon-192.png", 192, true], ["icon-512.png", 512, true]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  const pad = full ? Math.round(size * 0.06) : 0;
  await p.setContent(`<html><body style="margin:0;background:${full ? bleed : "transparent"}"><img src="${src}" style="display:block;width:${size + 2 * pad}px;height:${size + 2 * pad}px;margin:-${pad}px"></body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: pub + name, omitBackground: !full, clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
}
await b.close();
writeFileSync(pub + "site.webmanifest", JSON.stringify({
  name: "Dr Gauri Vaidya", short_name: "Gauri Vaidya", start_url: "/", display: "browser", background_color: "#FAFAF7", theme_color: "#0F6E6E",
  icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }, { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
}, null, 2) + "\n");
console.log("favicon set to option", opt);
