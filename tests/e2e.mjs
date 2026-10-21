// Real-browser end-to-end checks against the production build (vite preview / any static server).
import { chromium } from "playwright-core";
const B = process.env.BASE ?? "http://localhost:4173";
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log("PASS", name); } catch (e) { fail++; console.log("FAIL", name, "—", e.message.split("\n")[0]); } };
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m); };

const routes = { "/": null, "/about/": "About", "/publications/": "Publications", "/teaching/": "Teaching", "/talks/": "Talks & Events", "/contact/": "Contact" };
for (const [r, h] of Object.entries(routes)) await t(`route ${r} loads directly (prerendered)`, async () => {
  const res = await page.request.get(B + r); eq(res.status(), 200, "status");
  const html = await res.text(); ok(html.includes("<main"), "no prerendered main");
  await page.goto(B + r); eq(await page.locator("h1").count(), 1, "h1 count");
  if (h) { eq((await page.locator("h1").textContent()).trim(), h); eq(await page.locator(".site-nav a[aria-current=page]").textContent(), h); }
  else eq((await page.locator("h1").textContent()).trim(), "Gauri Vaidya");
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), "horizontal scroll");
});
await t("404.html & sitemap & robots exist", async () => {
  for (const f of ["/404.html", "/sitemap.xml", "/robots.txt", "/.nojekyll", "/cv.pdf"]) eq((await page.request.get(B + f)).status(), 200, f);
  ok((await (await page.request.get(B + "/404.html")).text()).includes("Page not found"), "404 content");
});
await t("header nav client-side navigation", async () => {
  await page.goto(B + "/"); await page.click(".site-nav >> text=Publications");
  await page.waitForURL(B + "/publications/"); eq((await page.locator("h1").textContent()).trim(), "Publications");
  await page.goBack(); await page.waitForURL(B + "/"); ok(await page.locator(".landing-hero").isVisible(), "home after back");
});
await t("home landing: name, role, intro, 6 links, no Recent section, no tagline", async () => {
  await page.goto(B + "/");
  eq((await page.locator("h1").textContent()).trim(), "Gauri Vaidya");
  ok((await page.locator(".hero-role").textContent()).startsWith("Senior Postdoctoral Researcher, NKDSS, School of Medicine, University of Limerick"), "role");
  eq(await page.locator(".pills a").count(), 6, "links"); eq(await page.locator('.pills a[href="mailto:gauri.vaidya@ul.ie"]').count(), 1, "work email"); eq(await page.locator('.pills a[href="https://orcid.org/0000-0002-9699-522X"]').count(), 1, "orcid");
  const img = page.locator(".hero-avatar img"); ok(await img.evaluate((i) => i.complete && i.naturalWidth > 0), "portrait loaded"); ok(/\.(avif|webp)$/.test(await img.evaluate((i) => i.currentSrc)), "modern format " + await img.evaluate((i) => i.currentSrc)); eq(await page.locator('.pills a[href="/cv.pdf"]').count(), 1, "cv");
  eq(await page.locator(".recent, #recent-h").count(), 0, "recent removed"); ok(!(await page.locator("main").textContent()).includes("Recent"), "no Recent text");
  ok(!(await page.content()).includes("I use data and AI"), "no tagline");
  eq(await page.locator(".sidebar").count(), 0, "no sidebar on landing");
});
await t("uniform top nav on every page, no sidebar, aligned content", async () => {
  await page.goto(B + "/"); const x0 = await page.locator(".logo").evaluate((e) => e.getBoundingClientRect().left);
  for (const r of ["/about/", "/publications/", "/teaching/", "/talks/", "/contact/"]) {
    await page.goto(B + r);
    eq(await page.locator(".sidebar").count(), 0, "sidebar " + r);
    eq(await page.locator(".site-header .top-nav a").count(), 5, "nav " + r);
    const lx = await page.locator(".logo").evaluate((e) => e.getBoundingClientRect().left);
    const hx = await page.locator("h1").evaluate((e) => e.getBoundingClientRect().left);
    eq(Math.round(lx), Math.round(x0), "logo x " + r); eq(Math.round(hx), Math.round(x0), "h1 x " + r);
  }
});
await t("publications: her name bold, query param prefill", async () => {
  await page.goto(B + "/publications/?q=hyperparameter"); await page.waitForTimeout(200);
  eq(await page.inputValue("#pub-q"), "hyperparameter");
  ok((await page.locator(".pub-authors .me").first().evaluate((e) => Number(getComputedStyle(e).fontWeight))) >= 600, "bold");
});
await t("publications: checkbox years + types with search, sort, active chips, clear all, grouped by year", async () => {
  await page.goto(B + "/publications/");
  const n = () => page.locator(".pub").count(); const total = await n(); ok(total >= 28, "total " + total);
  const hy = async () => (await page.locator(".ev-year-h").allTextContents()).map(Number);
  let ys = await hy(); ok(ys.length > 3 && ys.every((y, i) => i === 0 || y < ys[i - 1]), "year groups desc " + ys);
  eq(await page.locator('#pub-years input[type=checkbox]').count(), ys.length, "year checkboxes");
  await page.check('#pub-years input[value="2025"]'); await page.check('#pub-years input[value="2026"]');
  const a = await n(); ok((await page.locator(".pub").evaluateAll((e) => e.every((x) => ["2025", "2026"].includes(x.dataset.year)))), "years"); ok(a > 0 && a < total, "a " + a);
  eq((await hy()).join(), "2026,2025", "groups follow filter");
  await page.check('#pub-types input[value="conference"]'); await page.check('#pub-types input[value="other"]');
  const b = await n(); ok(b > 0 && b <= a && (await page.locator(".pub").evaluateAll((e) => e.every((x) => ["conference", "other"].includes(x.dataset.type)))), "types " + b);
  await page.fill("#pub-q", "hyperparameter"); const c = await n(); ok(c > 0 && c <= b, "search " + c);
  eq(await page.locator(".active-chip").count(), 5, "active chips");
  await page.locator(".active-chip", { hasText: "2026" }).click(); ok(!(await page.isChecked('#pub-years input[value="2026"]')), "checkbox unticked");
  await page.click(".clear-all"); eq(await n(), total, "cleared"); eq(await page.locator(".active-chip").count(), 0); eq(await page.inputValue("#pub-q"), "");
  eq(await page.locator("#pub-years input:checked, #pub-types input:checked").count(), 0, "all unticked");
  await page.selectOption("#pub-sort", "oldest"); ys = await hy(); ok(ys.every((y, i) => i === 0 || y > ys[i - 1]), "oldest first " + ys);
  await page.selectOption("#pub-sort", "newest");
  await page.check('#pub-types input[value="book chapter"]'); await page.check('#pub-years input[value="2026"]'); eq(await n(), 0); ok(await page.locator(".empty").isVisible(), "empty");
});
await t("publications: strip layout, only real URLs become buttons", async () => {
  await page.goto(B + "/publications/");
  const row = page.locator(".pub").first(); const [th, bd, ln] = [await row.locator(".ev-thumb").boundingBox(), await row.locator(".ev-body").boundingBox(), await row.locator(".pub-links").boundingBox()];
  ok(th.x < bd.x && bd.x + bd.width <= ln.x + 1, "thumb | citation | actions");
  const labels = await page.locator(".pub .pub-links a").allTextContents();
  eq(labels.filter((l) => l === "Link").length, 1, "one Link (arXiv)"); eq(labels.filter((l) => ["Video", "Slides", "PDF", "DOI"].includes(l)).length, 0, "no invented buttons");
  eq(await page.locator('.pub .pub-links a[href="https://arxiv.org/abs/2410.12804"]').count(), 1, "arxiv url");
  eq(await page.locator(".pub .pub-links button").count(), await page.locator(".pub").count(), "BibTeX on every entry");
});
await t("BibTeX expand, copy, collapse", async () => {
  await page.goto(B + "/publications/");
  const pub = page.locator(".pub").first(); const btn = pub.locator(".pub-links button");
  ok(!(await pub.locator(".bib-panel").isVisible()), "hidden by default");
  await btn.click(); eq(await btn.getAttribute("aria-expanded"), "true"); ok(await pub.locator(".bib-panel").isVisible(), "expanded");
  await pub.locator("text=Copy BibTeX").click(); await pub.locator("text=Copied ✓").waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText()); ok(clip.startsWith("@") && clip.includes("author"), "clipboard: " + clip.slice(0, 30));
  await btn.click(); ok(!(await pub.locator(".bib-panel").isVisible()), "collapsed");
});
await t("talks: grouped by year desc, rows with thumb/details/links, filters, mobile stacking", async () => {
  await page.goto(B + "/talks/");
  const ys = await page.locator(".ev-year-h").allTextContents(); ok(ys.length > 2 && ys.every((y, i) => i === 0 || Number(y) < Number(ys[i - 1])), "years " + ys);
  const n = () => page.locator(".event-row").count(); const total = await n();
  eq(await page.locator(".event-row .ev-thumb").count(), total, "thumbs");
  const row = page.locator(".event-row").first(); const [t, bd] = [await row.locator(".ev-thumb").boundingBox(), await row.locator(".ev-body").boundingBox()];
  ok(t.x < bd.x && Math.abs(t.y - bd.y) < 60, "horizontal strip");
  await page.click(".chip >> text=Invited Talks"); const a = await n(); ok(a > 0 && a < total, "chip " + a);
  ok((await page.locator(".event-row").evaluateAll((e) => e.every((x) => x.dataset.type === "Invited Talks"))), "type");
  await page.selectOption("#ev-year", "2022"); eq(await page.locator(".ev-year-h").count(), 1, "one year group");
  await page.fill("#ev-q", "climate"); eq(await n(), 1, "search");
  await page.click(".chip >> text=All"); await page.fill("#ev-q", ""); await page.selectOption("#ev-year", "all"); eq(await n(), total);
  await page.setViewportSize({ width: 390, height: 844 });
  const r2 = page.locator(".event-row").first(); const w = await r2.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length); eq(w, 2, "mobile columns");
  await page.setViewportSize({ width: 1440, height: 900 });
});
await t("teaching: year-grouped strips, latest first, no supervision section", async () => {
  await page.goto(B + "/teaching/");
  const ys = (await page.locator(".ev-year-h").allTextContents()).map(Number); ok(ys.length >= 3 && ys.every((y, i) => i === 0 || y < ys[i - 1]), "years " + ys);
  eq(ys[0], 2026, "latest first"); ok(await page.locator(".strip.teach").count() >= 9, "modules");
  const txt = await page.locator("main").textContent(); ok(!/supervis|mentoring/i.test(txt), "supervision removed");
  const row = page.locator(".strip.teach").first(); ok((await row.locator(".ev-thumb").boundingBox()).x < (await row.locator(".ev-body").boundingBox()).x, "strip");
});
await t("about: short + long bio (third person) with working copy buttons", async () => {
  await page.goto(B + "/about/");
  eq(await page.locator(".bio").count(), 2); eq((await page.locator(".bio h2").allTextContents()).join("|"), "Short bio|Long bio");
  eq(await page.locator("#short-bio p").count(), 1); const lp = await page.locator("#long-bio p").count(); ok(lp >= 2 && lp <= 3, "long paras " + lp);
  const all = await page.locator(".bio").allTextContents(); ok(all.every((x) => x.includes("Senior Postdoctoral Researcher")), "title");
  ok(!/\b(I|my|me)\b/.test(all.join(" ")), "third person");
  await page.click("#short-bio .copy-btn"); await page.locator("#short-bio .copy-btn", { hasText: "Copied" }).waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText()); ok(clip.startsWith("Gauri Vaidya is a Senior Postdoctoral Researcher"), "clip " + clip.slice(0, 40));
  await page.click("#long-bio .copy-btn"); await page.locator("#long-bio .copy-btn", { hasText: "Copied" }).waitFor();
  const c2 = await page.evaluate(() => navigator.clipboard.readText()); ok(c2.split("\n\n").length === lp, "long paras copied");
});
await t("contact: icon buttons, no raw URLs/addresses, booking button", async () => {
  await page.goto(B + "/contact/");
  const btns = page.locator(".cbtn"); eq(await btns.count(), 7, "buttons");
  eq((await btns.allTextContents()).join("|"), "Email (work)|Email (personal)|Google Scholar|ORCID|GitHub|LinkedIn|CV");
  eq(await page.locator(".cbtn svg.icon").count(), 7, "icons");
  eq(await page.locator('.cbtn[href="mailto:gauri.vaidya@ul.ie"]').count(), 1, "work"); eq(await page.locator('.cbtn[href="mailto:gaurivaidya.work@gmail.com"]').count(), 1, "personal");
  eq(await page.locator('.cbtn[href="https://orcid.org/0000-0002-9699-522X"]').count(), 1, "orcid");
  const txt = await page.locator("main").textContent(); ok(!/@|https?:|www\.|\.com|\.ie/.test(txt), "raw url/address visible");
  const book = page.locator(".book a"); eq((await book.textContent()).trim(), "Book a time with me"); eq(await book.getAttribute("href"), "mailto:gauri.vaidya@ul.ie?subject=Meeting%20request", "booking fallback");
  eq(await page.locator("form").count(), 0, "no form");
});
await t("footer text", async () => { eq((await page.locator(".site-footer").textContent()).trim(), `Made with ❤️ · © ${new Date().getFullYear()} Gauri Vaidya`); });
await t("mobile nav toggle (landing + inner)", async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(B + "/publications/"); ok(!(await m.locator(".site-nav").isVisible()), "inner nav hidden");
  await m.click(".nav-toggle"); ok(await m.locator(".site-nav").isVisible(), "inner nav open");
  await m.click(".site-nav >> text=Contact"); await m.waitForURL(B + "/contact/"); ok(!(await m.locator(".site-nav").isVisible()), "inner closes");
  await m.goto(B + "/"); ok(!(await m.locator(".site-nav").isVisible()), "nav hidden");
  await m.click(".nav-toggle"); ok(await m.locator(".site-nav").isVisible(), "nav open");
  await m.click(".site-nav >> text=Teaching"); await m.waitForURL(B + "/teaching/"); ok(!(await m.locator(".site-nav").isVisible()), "closes after nav");
  for (const r of Object.keys(routes)) { await m.goto(B + r); ok(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "hscroll " + r); }
  await m.close();
});
await t("SEO meta present", async () => {
  const html = await (await page.request.get(B + "/teaching/")).text();
  ok(html.includes("<title>Teaching — Gauri Vaidya</title>") && html.includes('og:title') && html.includes('rel="canonical" href="https://gauriivaidya.github.io/teaching/"'), "meta");
});
await t("theme: defaults to system, toggle flips + persists, no flash", async () => {
  const c = await browser.newContext({ colorScheme: "dark" }); const d = await c.newPage();
  await d.goto(B + "/"); eq(await d.evaluate(() => document.documentElement.dataset.theme), "dark", "system dark");
  const bgDark = await d.evaluate(() => getComputedStyle(document.body).backgroundColor); eq(bgDark, "rgb(17, 17, 16)", "dark bg");
  eq(await d.locator(".theme-toggle").getAttribute("aria-pressed"), "true");
  await d.click(".theme-toggle"); eq(await d.evaluate(() => document.documentElement.dataset.theme), "light");
  eq(await d.evaluate(() => localStorage.getItem("theme")), "light", "stored");
  await d.goto(B + "/publications/"); eq(await d.evaluate(() => document.documentElement.dataset.theme), "light", "persisted across pages");
  await d.reload(); eq(await d.locator(".theme-toggle").getAttribute("aria-pressed"), "false");
  // no flash: theme attribute is set by inline head script before any stylesheet/body parse
  const html = await (await d.request.get(B + "/")).text();
  ok(html.indexOf("localStorage.getItem") < html.indexOf("<link rel=\"stylesheet\"") && html.indexOf("localStorage.getItem") > 0, "inline script before CSS");
  await d.click(".theme-toggle"); await d.goto(B + "/"); eq(await d.evaluate(() => document.documentElement.dataset.theme), "dark");
  await c.close();
  const l = await browser.newContext({ colorScheme: "light" }); const lp = await l.newPage(); await lp.goto(B + "/");
  eq(await lp.evaluate(() => document.documentElement.dataset.theme), "light", "system light"); await l.close();
});
await t("theme toggle keyboard accessible", async () => {
  await page.goto(B + "/"); await page.focus(".theme-toggle"); const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.keyboard.press("Enter"); ok(before !== await page.evaluate(() => document.documentElement.dataset.theme), "toggled");
  await page.keyboard.press("Enter");
});
await t("self-hosted fonts only, no third-party requests", async () => {
  const p2 = await browser.newPage(); const ext = []; p2.on("request", (r) => { if (!r.url().startsWith(B)) ext.push(r.url()); });
  await p2.goto(B + "/publications/", { waitUntil: "networkidle" }); await p2.evaluate(() => document.fonts.ready);
  ok(ext.length === 0, ext.join()); ok(await p2.evaluate(() => document.fonts.check("16px Inter") && document.fonts.check("600 16px Montserrat")), "fonts"); await p2.close();
});
await t("navbar logo in Great Vibes, loaded and vertically aligned with nav", async () => {
  const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p3.goto(B + "/", { waitUntil: "networkidle" }); await p3.evaluate(() => document.fonts.ready);
  const r = await p3.evaluate(() => { const l = document.querySelector(".logo"), a = document.querySelector(".site-nav a");
    const lb = l.getBoundingClientRect(), ab = a.getBoundingClientRect();
    return { ff: getComputedStyle(l).fontFamily, loaded: document.fonts.check('31px "Great Vibes"', "Gauri Vaidya"), text: l.textContent.trim(),
      dy: Math.abs((lb.top + lb.bottom) / 2 - (ab.top + ab.bottom) / 2) }; });
  ok(r.ff.startsWith('"Great Vibes"'), r.ff); ok(r.loaded, "great vibes loaded"); eq(r.text, "Gauri Vaidya");
  ok(r.dy <= 4, "logo/nav vertical offset " + r.dy); await p3.close();
});
await t("no console errors", async () => { ok(errors.length === 0, errors.join(" | ")); });
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); process.exit(fail ? 1 : 0);
