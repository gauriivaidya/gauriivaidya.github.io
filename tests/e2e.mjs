// Real-browser end-to-end checks against the production build (vite preview / any static server).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
// Mirrors the PORTRAIT switch in src/data/home.ts (null → no photo).
const PORTRAIT = JSON.parse((readFileSync(new URL("../src/data/home.ts", import.meta.url), "utf8").match(/export const PORTRAIT: string \| null = (null|"[^"]*")/) ?? [, "null"])[1]);
import { chromium } from "playwright-core";
const B = process.env.BASE ?? "http://localhost:4173";
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
// Safety: never let a test reach the real FormSubmit endpoint (her inbox).
await ctx.route("https://formsubmit.co/**", (r) => r.abort());
const page = await ctx.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log("PASS", name); } catch (e) { fail++; console.log("FAIL", name, "—", e.message.split("\n")[0]); } };
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m); };

const routes = { "/": null, "/publications/": "Publications", "/teaching/": "Teaching", "/talks/": "Talks & Events", "/contact/": "Contact" };
for (const [r, h] of Object.entries(routes)) await t(`route ${r} loads directly (prerendered)`, async () => {
  const res = await page.request.get(B + r); eq(res.status(), 200, "status");
  const html = await res.text(); ok(html.includes("<main"), "no prerendered main");
  await page.goto(B + r); eq(await page.locator("h1").count(), 1, "h1 count");
  eq((await page.locator("h1").textContent()).trim(), h ?? "Gauri Vaidya");
  eq(await page.locator(".site-nav a[aria-current=page]").textContent(), h ?? "About", "current nav");
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), "horizontal scroll");
});
await t("/about/ aliases home: prerendered, canonical /, URL rewritten, not in sitemap", async () => {
  const res = await page.request.get(B + "/about/"); eq(res.status(), 200); const html = await res.text();
  ok(html.includes('rel="canonical" href="https://gauriivaidya.github.io/"') && html.includes("<title>Dr Gauri Vaidya</title>") && html.includes("about-head"), "alias html");
  await page.goto(B + "/about/"); await page.waitForURL(B + "/"); eq(await page.locator(".site-nav a[aria-current=page]").textContent(), "About");
  ok(!(await (await page.request.get(B + "/sitemap.xml")).text()).includes("/about/"), "sitemap");
});
await t("404.html & sitemap & robots exist", async () => {
  for (const f of ["/404.html", "/sitemap.xml", "/robots.txt", "/.nojekyll", "/cv.pdf"]) eq((await page.request.get(B + f)).status(), 200, f);
  ok((await (await page.request.get(B + "/404.html")).text()).includes("Page not found"), "404 content");
  const sm = await (await page.request.get(B + "/sitemap.xml")).text(); ok(!sm.includes("/cv"), "no cv in sitemap"); eq((sm.match(/<loc>/g) || []).length, 5, "sitemap urls");
  const rb = await (await page.request.get(B + "/robots.txt")).text(); ok(/^Disallow: \/cv\.pdf$/m.test(rb) && /^Allow: \/$/m.test(rb) && rb.includes("Sitemap: https://gauriivaidya.github.io/sitemap.xml"), "robots");
});
await t("header nav: About · Publications · Teaching · Talks & Events · Contact (no CV), client-side", async () => {
  await page.goto(B + "/publications/"); eq((await page.locator(".site-nav a").allTextContents()).join("|"), "About|Publications|Teaching|Talks & Events|Contact");
  eq(await page.locator(".site-nav a", { hasText: "About" }).getAttribute("href"), "/");
  await page.goto(B + "/"); await page.click(".site-nav >> text=Publications");
  await page.waitForURL(B + "/publications/"); eq((await page.locator("h1").textContent()).trim(), "Publications");
  await page.goBack(); await page.waitForURL(B + "/"); ok(await page.locator(".about-head").isVisible(), "home after back");
  for (const w of [1000, 1440]) { await page.setViewportSize({ width: w, height: 900 }); await page.goto(B + "/"); const ys = await page.locator(".site-nav a").evaluateAll((l) => l.map((a) => Math.round(a.getBoundingClientRect().top))); ok(new Set(ys).size === 1, "nav on one line at " + w); }
});
await t("home = about: hero (optional photo left, name, role, affiliation, icons), bio ¶1 + accolades verbatim (no perspective para), Background story section, copy bios, no Recent/tagline", async () => {
  await page.goto(B + "/");
  eq((await page.locator("h1").textContent()).trim(), "Gauri Vaidya");
  eq((await page.locator(".about-role").textContent()).trim(), "Senior Postdoctoral Researcher");
  eq((await page.locator(".hero-aff").textContent()).trim(), "National Kidney Disease Surveillance System · School of Medicine, University of Limerick, Ireland");
  if (PORTRAIT) {
    const [img, h1] = [await page.locator(".profile").boundingBox(), await page.locator("h1").boundingBox()]; ok(img.x + img.width < h1.x, "photo left of the name");
    const im = page.locator(".profile img"); ok(await im.evaluate((i) => i.complete && i.naturalWidth > 0), "portrait loaded"); ok(/\.(avif|webp)$/.test(await im.evaluate((i) => i.currentSrc)), "modern format");
    const sh = await im.evaluate((i) => { const f = i.closest(".hero-photo"), b = getComputedStyle(f, "::before"), r = i.getBoundingClientRect();
      return { rad: getComputedStyle(i).borderRadius, w: Math.round(r.width), h: Math.round(r.height), before: b.content, shadow: getComputedStyle(i).boxShadow }; });
    ok((sh.rad === "50%" || parseFloat(sh.rad) >= sh.w / 2) && sh.w === sh.h, "circular portrait " + JSON.stringify(sh));
    ok(sh.before === "none" || sh.before === "normal", "no offset block behind the portrait"); eq(sh.shadow, "none", "no heavy shadow"); eq(sh.w, 200, "desktop portrait 200px");
  } else {
    eq(await page.locator("main .profile, main picture, main img").count(), 0, "no photo and no placeholder in the hero");
    ok(await page.locator(".hero.no-photo").isVisible(), "type-only hero");
  }
  const paras = await page.locator(".about-text p").allTextContents();
  eq(paras.length, 2, "bio para 1 + accolades only");
  const bio = readFileSync(new URL("../src/data/bio.ts", import.meta.url), "utf8");
  ok(paras[0].startsWith("Dr Gauri Vaidya is a Senior Postdoctoral Researcher with the National Kidney Disease Surveillance System") && bio.includes(paras[0]), "background = long bio para 1, verbatim");
  ok(paras[1].startsWith("Gauri has received several national and international accolades") && bio.includes(paras[1]), "achievements = long bio para 3, verbatim, in prose");
  eq(await page.locator(".perspective").count(), 0, "no perspective paragraph");
  const homeTs = readFileSync(new URL("../src/data/home.ts", import.meta.url), "utf8");
  ok(!/PERSPECTIVE_DRAFT|perspective =/.test(homeTs), "perspective data removed");
  const bgParas = await page.locator("section[aria-labelledby=background-h] .background p").allTextContents();
  eq(bgParas.length, 2, "Background = two short paragraphs");
  ok(bgParas[0].replace(/^\s*Draft\s*/i, "").startsWith("Gauri began in computer science") && /Government College of Engineering, Aurangabad/.test(bgParas[0]), "Background para 1 (early path)");
  ok(/PhD in Artificial Intelligence at the University of Limerick \(2021–2025\)/.test(bgParas[1]) && /Senior Postdoctoral Researcher/.test(bgParas[1]), "Background para 2 (PhD → current role)");
  ok(bgParas.every((t) => !/\b(I|my|me)\b/.test(t)), "Background in third person");
  eq(await page.locator("section[aria-labelledby=background-h] .draft").count(), /BACKGROUND_DRAFT = true/.test(homeTs) ? 1 : 0, "draft marker follows BACKGROUND_DRAFT");
  if (PORTRAIT) { const srcset = await page.locator(".profile source[type='image/avif']").getAttribute("srcset");
  ok(/portrait-400\.avif 400w/.test(srcset) && /portrait-400\.webp 400w/.test(await page.locator(".profile source[type='image/webp']").getAttribute("srcset")), "srcset includes 400w " + srcset);
  ok(/portrait-1200\.avif 1200w/.test(srcset) && /portrait-800\.jpg$/.test(await page.locator(".profile img").getAttribute("src")), "hi-res portrait: 1200w in srcset, 800px jpg fallback"); }
  for (const i of [0, 1]) ok(await page.locator(".about-text p").nth(i).isVisible(), "para visible " + i);
  eq(await page.locator(".recog, .stats, .vision").count(), 0, "no stats/recognition strip, no per-card vision lines");
  await page.click("text=Copy short bio"); await page.locator(".copy-btn", { hasText: "Copied" }).waitFor();
  ok((await page.evaluate(() => navigator.clipboard.readText())).startsWith("Gauri Vaidya is a Senior Postdoctoral Researcher"), "short bio copied");
  await page.waitForTimeout(2300); await page.click("text=Copy long bio"); await page.locator(".copy-btn", { hasText: "Copied" }).waitFor();
  eq((await page.evaluate(() => navigator.clipboard.readText())).split("\n\n").length, 3, "long bio copied");
  ok(!/open to collaborations/.test(await page.evaluate(() => navigator.clipboard.readText())), "collab line not in copied long bio");
  ok(!/open to collaborations/.test(readFileSync(new URL("../src/data/bio.ts", import.meta.url), "utf8")), "collab line not in bio.ts (short/long copy text)");
  const bioLinks = await page.evaluate(() => [...document.querySelectorAll(".about-text a")].map((a) => [a.textContent, a.getAttribute("href"), a.target, a.rel, getComputedStyle(a).color]));
  const wantLinks = [["National Kidney Disease Surveillance System", "https://www.nkdss.ie/"], ["University of Limerick", "https://www.ul.ie/"], ["Business Post 30 Under 30: Top People in Tech 2025", "https://www.businesspost.ie/article/30-under-30-meet-irelands-top-tech-innovators/"], ["SPECIES International Research Scholarship", "https://species-society.org/scholarships-previous-years/"], ["atoti", "https://medium.com/atoti/meghana-and-gauri-explaining-olap-concepts-with-practical-examples-aedd541e6294"]];
  eq(JSON.stringify(bioLinks.map(([t, h]) => [t, h])), JSON.stringify(wantLinks), "intro bio links (text + URL)");
  ok(bioLinks.every(([, , t, r]) => t === "_blank" && r.includes("noopener")), "intro bio links open in new tab with rel=noopener");
  const brand = await page.evaluate(() => getComputedStyle(document.querySelector(".contact-row a[href^='mailto']")).color);
  ok(bioLinks.every((l) => l[4] === brand), "intro bio links are terracotta");
  ok(!(await page.locator(".about-text a", { hasText: "Times of India" }).count()), "Times of India unlinked (no verified article)");
  ok(!/https?:|<a/.test(await page.evaluate(() => navigator.clipboard.readText())), "copied long bio is plain text (no URLs/markup)");
  const collab = page.locator(".hero-bio .collab");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    const st = await page.evaluate(() => [...document.querySelectorAll(".about-text p, .hero-bio .collab")].map((p) => { const c = getComputedStyle(p); return [c.fontSize, c.fontWeight, c.color, c.lineHeight, c.fontFamily].join("|"); }));
    eq(st.length, 3, "3 intro paragraphs (" + theme + ")"); ok(st.every((x) => x === st[0]), "intro paragraphs share font size/weight/colour/line-height (" + theme + "): " + st.join(" ; "));
    const gaps = await page.evaluate(() => { const ps = [...document.querySelectorAll(".about-text p, .hero-bio .collab")].map((p) => p.getBoundingClientRect()); return [ps[1].top - ps[0].bottom, ps[2].top - ps[1].bottom].map(Math.round); });
    eq(gaps[0], gaps[1], "consistent intro paragraph spacing (" + theme + ")");
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
  eq((await collab.textContent()).trim(), "She is always open to collaborations, so feel free to get in touch.", "collab sentence");
  const intro = await page.evaluate(() => { const ps = [...document.querySelectorAll(".hero-bio p")].filter((p) => !p.classList.contains("bio-copy")); return ps[ps.length - 1].className; });
  eq(intro, "collab", "collab is the last line of the intro");
  const cl = collab.locator("a"); eq(await cl.textContent(), "get in touch"); eq(await cl.getAttribute("href"), "#contact");
  eq(await page.locator("section#contact h2#contact-h").count(), 1, "#contact anchor exists on the Get in touch section");
  eq(await cl.evaluate((a) => getComputedStyle(a).color), await page.evaluate(() => getComputedStyle(document.querySelector(".contact-row a[href^='mailto']")).color), "terracotta link colour (same as other links)");
  await cl.click(); await page.waitForTimeout(900);
  ok(await page.evaluate(() => { const r = document.getElementById("contact").getBoundingClientRect(); return scrollY > 0 && r.top >= -2 && r.bottom <= innerHeight + 2; }), "scrolled to Get in touch (in view)");
  eq(await page.evaluate(() => document.activeElement?.id), "contact-h", "focus moved to the section heading"); eq(new URL(page.url()).hash, "#contact");
  await page.evaluate(() => scrollTo(0, 0));
  ok(!(await page.locator("main").textContent()).includes("Recent"), "no Recent"); ok(!/news/i.test(await page.locator("main h2").allTextContents().then((x) => x.join())), "no news");
  ok(!(await page.content()).includes("I use data and AI"), "no tagline");
});
await t("home overview: hero, Research (4 cards), Get in touch only; icons; no personal email/CV", async () => {
  await page.goto(B + "/");
  eq((await page.locator("main .snap-head h2").allTextContents()).map((x) => x.trim()).join("|"), "Research|Background|Get in touch");
  eq((await page.locator(".see-all").evaluateAll((l) => l.map((a) => a.getAttribute("href")))).join("|"), "/contact/");
  eq((await page.locator(".research-list h3").allTextContents()).join("|"), "Kidney disease|Optimisation, AI & Large-Scale Data Analytics", "2 research cards");
  eq((await page.locator(".research-list .eyebrow").allTextContents()).join("|"), "Current work|Expertise");
  ok((await page.locator(".research-list li").nth(1).textContent()).includes("blockchain, knowledge graphs, large language models and agentic AI"), "Expertise card lists agentic AI");
  eq(await page.locator(".draft").count(), 0, "no draft markers left on the home page (Background approved)");
  eq((await page.locator(".research-list h3 a").evaluateAll((l) => l.map((a) => a.getAttribute("href")))).join("|"), "/publications/|/publications/?topic=expertise");
  eq(await page.locator(".research-list .tile-brand svg.icon").count(), 2, "brand icon tiles");
  const shapes = await page.evaluate(() => [...document.querySelectorAll(".snap h2")].map((h) => getComputedStyle(h, "::before").borderRadius).concat([...document.querySelectorAll(".research-list .tile")].map((t) => { const c = getComputedStyle(t), r = t.getBoundingClientRect(); return Math.round(r.width) === Math.round(r.height) ? c.borderRadius : "not-square-box"; })));
  ok(shapes.length >= 5 && shapes.every((r) => r === "50%"), "section markers and icon tiles are round " + shapes.join());
  ok(!/GPU|high computing/i.test(await page.locator("main").textContent()), "GPU sentence removed from the bio");
  await page.click(".research-list h3 a >> nth=1"); await page.waitForURL(/topic=expertise/); await page.locator(".pub").first().waitFor();
  const shown = await page.locator(".pub").count(); ok(shown > 0 && shown < 28, "expertise filter narrows the list " + shown); await page.goto(B + "/");
  eq(await page.locator("main .lines, main .modules, main .press").count(), 0, "no publications/teaching/talks/recognition snapshots");
  ok(await page.locator("main .book a").isVisible(), "booking button");
  eq(await page.locator("main .pub, main .selected, main .rows").count(), 0, "no publication rows on home");
  const s = page.locator("ul.social a"); eq((await s.evaluateAll((l) => l.map((a) => a.getAttribute("aria-label")))).join("|"), "Email|Google Scholar|ORCID|GitHub|LinkedIn");
  eq(await s.locator("svg.icon").count(), 5, "icons"); eq(await page.locator('ul.social a[href="mailto:gauri.vaidya@ul.ie"]').count(), 1, "email");
  const html = await page.content(); ok(!html.includes("gaurivaidya.work@gmail.com"), "personal email only on Contact"); ok(!/cv\.pdf|\/cv\//i.test(html), "no CV link");
  eq(await page.locator(".tile-fig, .credit").count(), 0, "no paper-figure thumbnails or credits");
  for (const w of [390, 1440]) { await page.setViewportSize({ width: w, height: 900 }); ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "hscroll " + w); }
  await page.setViewportSize({ width: 1440, height: 900 });
});
await t("uniform top nav on every page, no sidebar, aligned content", async () => {
  await page.goto(B + "/"); const x0 = await page.locator(".logo").evaluate((e) => e.getBoundingClientRect().left);
  for (const r of Object.keys(routes)) {
    await page.goto(B + r);
    eq(await page.locator(".sidebar").count(), 0, "sidebar " + r);
    eq(await page.locator(".site-header .top-nav a").count(), 5, "nav " + r);
    const lx = await page.locator(".logo").evaluate((e) => e.getBoundingClientRect().left);
    // home: the hero block (photo) starts at the logo line; inner pages: the h1 does
    const hx = await page.locator(r === "/" || r === "/about/" ? ".hero" : "h1").evaluate((e) => e.getBoundingClientRect().left);
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
  const hy = async () => (await page.locator(".yg-year").allTextContents()).map(Number);
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
await t("publications: al-folio rows — year label left, terracotta venue badge, title/authors/venue, only real URLs become buttons", async () => {
  await page.goto(B + "/publications/");
  const g = page.locator(".yg").first(); const [yb, lb] = [await g.locator(".yg-year").boundingBox(), await g.locator(".rows").boundingBox()]; ok(yb.x + yb.width <= lb.x, "year left of list");
  const [ys, hs] = [parseFloat(await g.locator(".yg-year").evaluate((e) => getComputedStyle(e).fontSize)), parseFloat(await page.locator("h1").evaluate((e) => getComputedStyle(e).fontSize))]; ok(ys >= 22 && ys < hs * 0.75, "year label clear but below h1 " + ys + "/" + hs);
  const row = page.locator(".pub").first(); const [bd, bo] = [await row.locator(".badge").boundingBox(), await row.locator(".row-body").boundingBox()]; ok(bd.x + bd.width <= bo.x, "badge | body");
  eq(await row.locator(".badge").evaluate((e) => getComputedStyle(e).backgroundColor), "rgb(168, 75, 41)", "terracotta badge");
  eq(await page.locator(".pub .badge").count(), await page.locator(".pub").count(), "badge on every entry");
  const order = await row.locator(".row-body > *").evaluateAll((l) => l.map((e) => e.className)); eq(order.slice(0, 4).join(), "pub-title,pub-authors,pub-venue,pub-links", "order");
  const labels = await page.locator(".pub .pub-links a").allTextContents();
  eq(labels.filter((l) => l === "HTML").length, 1, "one HTML (arXiv)"); eq(labels.filter((l) => ["Video", "Slides", "PDF", "DOI", "Code"].includes(l)).length, 0, "no invented buttons");
  eq(await page.locator('.pub .pub-links a[href="https://arxiv.org/abs/2410.12804"]').count(), 1, "arxiv url");
  eq(await page.locator(".pub .pub-links button", { hasText: "Bib" }).count(), await page.locator(".pub").count(), "BIB on every entry");
  eq(await page.locator(".pub .pub-links button", { hasText: "Abs" }).count(), 0, "ABS only when an abstract exists (none yet)");
  eq(await row.locator(".act").first().evaluate((e) => getComputedStyle(e).textTransform), "uppercase", "uppercase buttons");
});
await t("BibTeX expand, copy, collapse", async () => {
  await page.goto(B + "/publications/");
  const pub = page.locator(".pub").first(); const btn = pub.locator(".pub-links button", { hasText: "Bib" });
  ok(!(await pub.locator(".bib-panel").isVisible()), "hidden by default");
  await btn.click(); eq(await btn.getAttribute("aria-expanded"), "true"); ok(await pub.locator(".bib-panel").isVisible(), "expanded");
  await pub.locator("text=Copy BibTeX").click(); await pub.locator("text=Copied ✓").waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText()); ok(clip.startsWith("@") && clip.includes("author"), "clipboard: " + clip.slice(0, 30));
  await btn.click(); ok(!(await pub.locator(".bib-panel").isVisible()), "collapsed");
});
// content/*.yaml is the single source: read it (via Python + PyYAML, as the build does) and compare with the rendered pages.
const yamlCount = (file, filter = "True") => Number(execFileSync(process.env.PYTHON ?? "python3", ["-c",
  `import yaml,sys; d=yaml.safe_load(open(sys.argv[1], encoding="utf-8")) or []; print(sum(1 for e in d if ${filter}))`, new URL(`../content/${file}`, import.meta.url).pathname]).toString().trim());
await t("teaching: site matches the CV (CS6472 64 students, CS4221 Fall 2024, location shown); no CV-only overrides left", async () => {
  await page.goto(B + "/teaching/");
  const row = (code) => page.locator(".row.teach", { hasText: code }).first().innerText();
  ok((await row("CS6472")).includes("64 students (Spring 2026)"), "CS6472 64");
  ok((await row("CS4221")).includes("Fall 2024"), "CS4221 Fall 2024");
  ok((await row("CS6472")).includes("University of Limerick, Ireland"), "location");
  for (const f of ["talks.yaml", "awards.yaml", "teaching.yaml"]) {
    const y = readFileSync(new URL("../content/" + f, import.meta.url), "utf8").split("\n").filter((l) => !l.startsWith("#")).join("\n");
    ok(!/^\s*cv_\w+:/m.test(y), "no cv_* overrides in " + f); ok(!/website says|CV says|conflict/i.test(readFileSync(new URL("../content/" + f, import.meta.url), "utf8")), "no conflict notes in " + f);
  }
});
await t("talks: content/talks.yaml entry count matches the rows on the Talks page (+ awards.yaml site awards)", async () => {
  const talks = yamlCount("talks.yaml"), awards = yamlCount("awards.yaml", 'e.get("site", True) is not False');
  ok(talks > 0, "talks.yaml has entries");
  await page.goto(B + "/talks/");
  eq(await page.locator(".event-row:not([data-type='Awards / Recognition'])").count(), talks, "talks.yaml entries vs non-award rows");
  eq(await page.locator(".event-row[data-type='Awards / Recognition']").count(), awards, "awards.yaml site awards vs award rows");
  eq(await page.locator(".event-row").count(), talks + awards, "total rows");
  await page.goto(B + "/teaching/"); eq(await page.locator(".row.teach").count(), yamlCount("teaching.yaml"), "teaching.yaml entries vs Teaching rows");
});
await t("talks: year-grouped al-folio rows (badge | details), filters, mobile stacking", async () => {
  await page.goto(B + "/talks/");
  const ys = await page.locator(".yg-year").allTextContents(); ok(ys.length > 2 && ys.every((y, i) => i === 0 || Number(y) < Number(ys[i - 1])), "years " + ys);
  const n = () => page.locator(".event-row").count(); const total = await n();
  eq(await page.locator(".event-row .badge").count(), total, "badges");
  const row = page.locator(".event-row").first(); const [t, bd] = [await row.locator(".badge").boundingBox(), await row.locator(".row-body").boundingBox()];
  ok(t.x < bd.x && Math.abs(t.y - bd.y) < 30, "horizontal row");
  eq(await page.locator(".chip, #ev-year, #ev-sort, select").count(), 0, "old chip/select filters gone");
  eq(await page.locator("#ev-years input[type=checkbox]").count(), ys.length, "year checkboxes");
  eq(await page.locator("#ev-years .check, #ev-types .check").evaluateAll((l) => l.every((x) => x.closest(".check-groups"))), true, "same check-groups UI");
  await page.check('#ev-types input[value="Invited Talks"]'); const a = await n(); ok(a > 0 && a < total, "type " + a);
  ok((await page.locator(".event-row").evaluateAll((e) => e.every((x) => x.dataset.type === "Invited Talks"))), "type");
  await page.check('#ev-types input[value="Workshops"]'); const a2 = await n(); ok(a2 > a, "multi-type OR " + a2);
  await page.check('#ev-years input[value="2022"]'); eq(await page.locator(".yg-year").count(), 1, "one year group");
  await page.check('#ev-years input[value="2024"]'); eq((await page.locator(".yg-year").allTextContents()).join(), "2024,2022", "two years");
  await page.fill("#ev-q", "climate"); eq(await n(), 1, "search");
  eq(await page.locator(".active-chip").count(), 5, "active chips");
  await page.locator(".active-chip", { hasText: "Workshops" }).click(); ok(!(await page.isChecked('#ev-types input[value="Workshops"]')), "chip unticks");
  await page.click(".clear-all"); eq(await n(), total, "cleared"); eq(await page.locator("#ev-years input:checked, #ev-types input:checked").count(), 0); eq(await page.inputValue("#ev-q"), "");
  ok((await page.locator(".active-bar .count").textContent()).startsWith(`${total} of ${total}`), "count bar");
  await page.setViewportSize({ width: 390, height: 844 });
  eq(await page.locator(".yg").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length), 1, "year stacks above rows on mobile");
  eq(await page.locator(".event-row").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length), 2, "badge | body on mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
});
await t("teaching: year-grouped al-folio rows with code badges, latest first, no supervision section", async () => {
  await page.goto(B + "/teaching/");
  const ys = (await page.locator(".yg-year").allTextContents()).map(Number); ok(ys.length >= 3 && ys.every((y, i) => i === 0 || y < ys[i - 1]), "years " + ys);
  eq(ys[0], 2026, "latest first"); ok(await page.locator(".row.teach").count() >= 9, "modules");
  eq(await page.locator(".row.teach .badge").first().textContent(), "CS6604", "code badge");
  const txt = await page.locator("main").textContent(); ok(!/supervis|mentoring/i.test(txt), "supervision removed"); ok(!/applied education|real confidence/i.test(txt), "no teaching-philosophy sentence");
});
await t("cv: no visible way to the CV; /cv.pdf still served; /cv/ is not a page", async () => {
  const noCv = '[href*="/cv"], [href*="cv.pdf"]';
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const r of ["/", "/publications/", "/teaching/", "/talks/", "/contact/"]) {
      await page.goto(B + r);
      if (w < 900) { await page.click(".nav-toggle"); ok(await page.locator(".site-nav").isVisible(), "mobile menu open " + r); }
      for (const scope of [".site-header", "main", ".site-footer"]) eq(await page.locator(`${scope} :is(${noCv})`).count(), 0, `cv link in ${scope} ${r} @${w}`);
      ok(!/\bCV\b|curriculum vitae/i.test(await page.locator("body").innerText()), `CV text visible ${r} @${w}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const pdf = await page.request.get(B + "/cv.pdf"); eq(pdf.status(), 200, "cv.pdf status"); eq(pdf.headers()["content-type"], "application/pdf", "cv.pdf type");
  const res = await page.request.get(B + "/cv/"); const html = await res.text();
  ok(res.status() === 404 || !html.includes("<title>Gauri Vaidya | CV</title>"), "/cv/ must not be prerendered (" + res.status() + ")");
  ok(!html.includes("cv-frame") && !html.includes("/cv.pdf"), "no CV page markup");
  // GitHub Pages answers /cv/ with 404.html; `vite preview` falls back to index.html (SPA), where opening it would hydrate a mismatch.
  if (res.status() === 404) {
    ok(html.includes("Page not found"), "404 page");
    // Separate tab: the expected 404 document load is logged as a console error, which the global no-console-errors check must not see.
    const p = await page.context().newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errs.push(m.text()));
    await p.goto(B + "/cv/"); eq((await p.locator("h1").textContent()).trim(), "Page not found", "/cv/ renders not-found"); eq(await p.title(), "Gauri Vaidya | Page not found", "/cv/ title");
    ok(errs.length === 0, "errors on /cv/: " + errs.join(" | ")); await p.close();
  }
});
await t("tab titles: home 'Dr Gauri Vaidya', others 'Gauri Vaidya | Page' (prerendered + runtime)", async () => {
  const want = { "/": "Dr Gauri Vaidya", "/about/": "Dr Gauri Vaidya", "/publications/": "Gauri Vaidya | Publications", "/teaching/": "Gauri Vaidya | Teaching", "/talks/": "Gauri Vaidya | Talks", "/contact/": "Gauri Vaidya | Contact", "/404.html": "Gauri Vaidya | Page not found" };
  for (const [r, title] of Object.entries(want)) { ok((await (await page.request.get(B + r)).text()).includes(`<title>${title}</title>`), "prerendered " + r); await page.goto(B + r); eq(await page.title(), title, r); }
  await page.goto(B + "/"); await page.click(".site-nav >> text=Talks & Events"); await page.waitForURL(B + "/talks/"); eq(await page.title(), "Gauri Vaidya | Talks", "client nav title");
  await page.click(".site-nav >> text=Contact"); await page.waitForURL(B + "/contact/"); eq(await page.title(), "Gauri Vaidya | Contact", "client nav title contact");
});
await t("favicon: svg (pure paths, no text/fonts), 32px png, apple-touch-icon, manifest", async () => {
  const html = await (await page.request.get(B + "/")).text();
  for (const h of ['rel="icon" href="/favicon.svg"', 'href="/favicon-32.png"', 'rel="apple-touch-icon" href="/apple-touch-icon.png"', 'rel="manifest" href="/site.webmanifest"']) ok(html.includes(h), h);
  const svg = await (await page.request.get(B + "/favicon.svg")).text(); ok(svg.includes("<path") && !svg.includes("<text") && !svg.includes("font"), "svg paths only");
  for (const f of ["/favicon-32.png", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png"]) { const r = await page.request.get(B + f); eq(r.status(), 200, f); eq(r.headers()["content-type"], "image/png", f); }
  const m = await (await page.request.get(B + "/site.webmanifest")).json(); eq(m.icons.length, 3, "manifest icons");
});
await t("contact: icon buttons, no raw URLs/addresses, booking button", async () => {
  await page.goto(B + "/contact/");
  const btns = page.locator(".cbtn"); eq(await btns.count(), 6, "buttons");
  eq((await btns.allTextContents()).join("|"), "Email (work)|Email (personal)|Google Scholar|ORCID|GitHub|LinkedIn");
  eq(await page.locator(".cbtn svg.icon").count(), 6, "icons");
  eq(await page.locator('.cbtn[href="mailto:gauri.vaidya@ul.ie"]').count(), 1, "work"); eq(await page.locator('.cbtn[href="mailto:gaurivaidya.work@gmail.com"]').count(), 1, "personal");
  eq(await page.locator('.cbtn[href="https://orcid.org/0000-0002-9699-522X"]').count(), 1, "orcid");
  const txt = await page.locator("main").textContent(); ok(!/@|https?:|www\.|\.com|\.ie/.test(txt), "raw url/address visible");
  const book = page.locator(".book a"); eq((await book.textContent()).trim(), "Book a time with me"); ok((await book.getAttribute("href")).startsWith("mailto:gauri.vaidya@ul.ie?subject=Meeting%20request"), "no-JS mailto fallback");
  ok(!(await page.locator(".book-dialog").isVisible()), "dialog closed by default");
});
await t("publications: Google Scholar button by heading, opens new tab", async () => {
  await page.goto(B + "/publications/");
  const a = page.locator(".page-head .page-action a"); eq(await a.count(), 1);
  eq(await a.getAttribute("href"), "https://scholar.google.com/citations?user=HIo03L4AAAAJ&hl=en"); eq(await a.getAttribute("target"), "_blank");
  ok((await a.textContent()).includes("Full list on Google Scholar"), "label"); ok((await a.getAttribute("class")).includes("btn"), "button style");
  const [h, b] = [await page.locator("h1").boundingBox(), await a.boundingBox()]; ok(Math.abs((h.y + h.height / 2) - (b.y + b.height / 2)) < 20, "same row as heading");
});
await t("filter counts read as counts (pill + accessible text), identical on publications and talks", async () => {
  for (const [r, id, noun] of [["/publications/", "#pub-years", "publication"], ["/talks/", "#ev-years", "item"]]) {
    await page.goto(B + r); const pill = page.locator(`${id} .check-n`).first();
    const st = await pill.evaluate((e) => { const c = getComputedStyle(e); return { r: parseFloat(c.borderTopLeftRadius), bw: c.borderTopWidth }; });
    ok(st.r >= 8 && st.bw === "1px", "pill " + r + JSON.stringify(st));
    ok(new RegExp(`^\\d+ ${noun}s?$`).test(await pill.getAttribute("title")), "title " + await pill.getAttribute("title"));
    ok(/\(\d+ (publication|item)s?\)/.test(await pill.locator(".sr-only").textContent()), "sr text");
    const lbl = await page.locator(`${id} .check`).first().evaluate((e) => e.innerText.replace(/\s+/g, " ").trim()); ok(/^\d{4} \d+$/.test(lbl) || /^\d{4} \d+ \(/.test(lbl), "label " + lbl);
  }
});
await t("PORTRAIT switch: photo (200px desktop / 112px mobile) or none; share image follows it and is served", async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(B + "/", { waitUntil: "networkidle" });
  const og = await p.locator('meta[property="og:image"]').getAttribute("content");
  eq(og, "https://gauriivaidya.github.io" + (PORTRAIT ? "/og-image.jpg" : "/og-image-brand.jpg"), "og:image");
  for (const r of ["/publications/", "/contact/"]) { await p.goto(B + r); eq(await p.locator('meta[property="og:image"]').getAttribute("content"), og, "og:image " + r); }
  const res = await p.request.get(B + new URL(og).pathname); eq(res.status(), 200, "og served"); eq(res.headers()["content-type"], "image/jpeg");
  const b = await res.body(); ok(b.length > 10000, "og size");
  await p.goto(B + "/", { waitUntil: "networkidle" });
  if (PORTRAIT) {
    const r = await p.locator(".profile img").evaluate((i) => ({ w: i.getBoundingClientRect().width, src: i.currentSrc, dpr: devicePixelRatio }));
    eq(Math.round(r.w), 200, "desktop size"); ok((r.dpr >= 1.5 ? /-1200\.(avif|webp)$/ : /-(600|800|1200)\.(avif|webp)$/).test(r.src), "hi-res source: >=600w at 1x, 1200w at 2x " + JSON.stringify(r));
    await p.setViewportSize({ width: 390, height: 844 }); await p.goto(B + "/"); eq(Math.round(await p.locator(".profile img").evaluate((i) => i.getBoundingClientRect().width)), 112, "mobile size");
  } else {
    ok(!(await p.content()).includes("portrait-"), "no portrait requested or referenced");
    await p.setViewportSize({ width: 390, height: 844 }); await p.goto(B + "/");
  }
  ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "mobile hscroll"); await p.close();
});
await t("booking form: opens as modal, fields + labels, Escape closes and returns focus, validation", async () => {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
  const sent = []; await c.route("https://formsubmit.co/**", (r) => { sent.push(r.request()); return r.abort(); });
  await p.goto(B + "/contact/"); await p.click(".book a"); const d = p.locator(".book-dialog"); ok(await d.isVisible(), "open");
  eq(await d.evaluate((e) => e.open && e.matches(":modal")), true, "modal");
  eq(p.url(), B + "/contact/", "mailto not followed");
  for (const [id, lab] of [["bf-name", "Name"], ["bf-email", "Email"], ["bf-topic", "What it's about"], ["bf-times", "Preferred times"], ["bf-msg", "Message (optional)"]]) eq((await p.locator(`label[for=${id}]`).textContent()).trim(), lab, id);
  eq((await p.locator("#bf-topic option:not([disabled])").allTextContents()).join("|"), "Research collaboration|Student/supervision enquiry|Talk or event invitation|Other", "topics");
  for (const id of ["bf-name", "bf-email", "bf-topic", "bf-times"]) eq(await p.locator("#" + id).getAttribute("required"), "", "required " + id);
  eq(await p.locator("#bf-msg").getAttribute("required"), null, "message optional");
  ok(!(await p.locator("#bf-hp").isVisible()) || (await p.locator("#bf-hp").boundingBox()).x < 0, "honeypot hidden"); eq(await p.locator("#bf-hp").getAttribute("tabindex"), "-1");
  ok(await p.evaluate(() => document.activeElement.id === "bf-name" || document.querySelector(".book-dialog").contains(document.activeElement)), "focus inside");
  await p.click(".bf-actions button[type=submit]"); ok(await d.isVisible(), "invalid form stays open"); eq(sent.length, 0, "nothing sent when invalid");
  await p.keyboard.press("Escape"); ok(!(await d.isVisible()), "escape closes");
  eq(await p.evaluate(() => document.activeElement.textContent.trim()), "Book a time with me", "focus returned");
  await p.click(".book a"); await p.click(".book-x"); ok(!(await d.isVisible()), "× closes"); await c.close();
});
const fillForm = async (p) => { await p.fill("#bf-name", "Test Person"); await p.fill("#bf-email", "test@example.org"); await p.selectOption("#bf-topic", "Research collaboration"); await p.fill("#bf-times", "Tue afternoon"); await p.fill("#bf-msg", "Hello"); };
await t("booking form: posts to FormSubmit AJAX (mocked) with subject/template/captcha, shows success", async () => {
  const c = await browser.newContext(); const p = await c.newPage(); let req = null;
  await c.route("https://formsubmit.co/**", async (r) => { req = r.request(); await new Promise((z) => setTimeout(z, 150)); return r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"success":"true","message":"The form was submitted successfully."}' }); });
  await p.goto(B + "/contact/"); await p.click(".book a"); await fillForm(p);
  await p.click(".bf-actions button[type=submit]"); await p.locator(".bf-actions button", { hasText: "Sending…" }).waitFor();
  await p.locator(".book-ok").waitFor(); ok((await p.locator(".book-ok").textContent()).includes("sent"), "success text");
  eq(req.url(), "https://formsubmit.co/ajax/gauri.vaidya@ul.ie"); eq(req.method(), "POST"); eq(req.headers()["accept"], "application/json");
  const b = JSON.parse(req.postData()); eq(b._subject, "Meeting request from website"); eq(b._template, "table"); eq(b._captcha, "false");
  eq(b.name, "Test Person"); eq(b.email, "test@example.org"); eq(b.topic, "Research collaboration"); eq(b["preferred times"], "Tue afternoon"); eq(b.message, "Hello"); eq(b._honey, "");
  await p.click(".book-done button"); ok(!(await p.locator(".book-dialog").isVisible()), "closed");
  await p.click(".book a"); ok(await p.locator("#bf-name").isVisible(), "fresh form on reopen"); eq(await p.inputValue("#bf-name"), "", "reset"); await c.close();
});
await t("booking form: network error shows error + prefilled mailto fallback; FormSubmit refusal too", async () => {
  const c = await browser.newContext(); const p = await c.newPage();
  await c.route("https://formsubmit.co/**", (r) => r.abort("internetdisconnected"));
  await p.goto(B + "/contact/"); await p.click(".book a"); await fillForm(p); await p.click(".bf-actions button[type=submit]");
  const err = p.locator(".book-err[role=alert]"); await err.waitFor(); const href = await err.locator("a").getAttribute("href");
  ok(href.startsWith("mailto:gauri.vaidya@ul.ie?subject=Meeting%20request&body="), "fallback " + href.slice(0, 60));
  const body = decodeURIComponent(href.split("body=")[1]); ok(body.includes("Name: Test Person") && body.includes("Preferred times: Tue afternoon") && body.includes("Hello"), "prefilled");
  eq(await p.inputValue("#bf-name"), "Test Person", "input kept");
  await c.unroute("https://formsubmit.co/**"); await c.route("https://formsubmit.co/**", (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"success":"false","message":"This form needs Activation."}' }));
  await p.click(".bf-actions button[type=submit]"); await p.waitForTimeout(300); ok(await err.isVisible(), "refusal → error"); eq(await p.locator(".book-ok").count(), 0); await c.close();
});
await t("booking form: honeypot filled → fake success, nothing sent", async () => {
  const c = await browser.newContext(); const p = await c.newPage(); let n = 0; await c.route("https://formsubmit.co/**", (r) => { n++; return r.abort(); });
  await p.goto(B + "/contact/"); await p.click(".book a"); await fillForm(p); await p.locator("#bf-hp").evaluate((e) => { e.value = "spam"; });
  await p.click(".bf-actions button[type=submit]"); await p.locator(".book-ok").waitFor(); eq(n, 0, "no request"); await c.close();
});
await t("booking dialog: dark mode colours + mobile fits", async () => {
  const c = await browser.newContext({ colorScheme: "dark", viewport: { width: 390, height: 844 } }); const p = await c.newPage(); await c.route("https://formsubmit.co/**", (r) => r.abort());
  await p.goto(B + "/contact/"); await p.click(".book a");
  eq(await p.locator(".book-dialog").evaluate((e) => getComputedStyle(e).backgroundColor), "rgb(17, 17, 16)", "dark bg");
  const bb = await p.locator(".book-dialog").boundingBox(); ok(bb.x >= 0 && bb.x + bb.width <= 390, "fits width"); await c.close();
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
  ok(html.includes("<title>Gauri Vaidya | Teaching</title>") && html.includes('<meta property="og:title" content="Gauri Vaidya | Teaching"') && html.includes('og:title') && html.includes('rel="canonical" href="https://gauriivaidya.github.io/teaching/"'), "meta");
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
  ok(ext.length === 0, ext.join()); ok(await p2.evaluate(() => document.fonts.check("16px Raleway") && document.fonts.check("700 16px Raleway")), "fonts"); await p2.close();
});
await t("navbar logo: plain name only (no GV mark) in Raleway 600, ink colour, aligned with nav; GV kept only as favicon", async () => {
  const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const r of ["/", "/publications/", "/contact/"]) { await p3.goto(B + r);
    eq(await p3.locator(".gv-mark, .logo svg, .logo img").count(), 0, "no GV mark in the UI " + r);
    eq(await p3.locator('link[rel="icon"][href="/favicon.svg"]').count(), 1, "GV favicon kept " + r); }
  for (const f of ["/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png"]) eq((await p3.request.get(B + f)).status(), 200, "icon served " + f);
  await p3.goto(B + "/", { waitUntil: "networkidle" }); await p3.evaluate(() => document.fonts.ready);
  const r = await p3.evaluate(() => { const l = document.querySelector(".logo"), a = document.querySelector(".site-nav a");
    const lb = l.getBoundingClientRect(), ab = a.getBoundingClientRect();
    const cs = getComputedStyle(l), body = getComputedStyle(document.body);
    return { ff: cs.fontFamily, fw: cs.fontWeight, col: cs.color, ink: body.color, loaded: document.fonts.check('600 19px Raleway', "Gauri Vaidya"), text: l.textContent.trim(),
      gv: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /Great Vibes/.test(r.cssText)); } catch { return false; } }) || !!document.querySelector('link[href*="greatvibes"]'),
      dy: Math.abs((lb.top + lb.bottom) / 2 - (ab.top + ab.bottom) / 2) }; });
  ok(/^"?Raleway/.test(r.ff), r.ff); eq(r.fw, "600", "semibold"); eq(r.col, r.ink, "ink colour"); ok(r.loaded, "raleway 600 loaded"); eq(r.text, "Gauri Vaidya"); ok(!r.gv, "no Great Vibes anywhere");
  ok(r.dy <= 4, "logo/nav vertical offset " + r.dy); await p3.close();
});
await t("no console errors", async () => { ok(errors.length === 0, errors.join(" | ")); });
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); process.exit(fail ? 1 : 0);
