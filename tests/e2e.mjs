// Real-browser end-to-end checks against the production build (vite preview / any static server).
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
  eq(await page.locator(".chip, #ev-year, #ev-sort, select").count(), 0, "old chip/select filters gone");
  eq(await page.locator("#ev-years input[type=checkbox]").count(), ys.length, "year checkboxes");
  eq(await page.locator("#ev-years .check, #ev-types .check").evaluateAll((l) => l.every((x) => x.closest(".check-groups"))), true, "same check-groups UI");
  await page.check('#ev-types input[value="Invited Talks"]'); const a = await n(); ok(a > 0 && a < total, "type " + a);
  ok((await page.locator(".event-row").evaluateAll((e) => e.every((x) => x.dataset.type === "Invited Talks"))), "type");
  await page.check('#ev-types input[value="Workshops"]'); const a2 = await n(); ok(a2 > a, "multi-type OR " + a2);
  await page.check('#ev-years input[value="2022"]'); eq(await page.locator(".ev-year-h").count(), 1, "one year group");
  await page.check('#ev-years input[value="2024"]'); eq((await page.locator(".ev-year-h").allTextContents()).join(), "2024,2022", "two years");
  await page.fill("#ev-q", "climate"); eq(await n(), 1, "search");
  eq(await page.locator(".active-chip").count(), 5, "active chips");
  await page.locator(".active-chip", { hasText: "Workshops" }).click(); ok(!(await page.isChecked('#ev-types input[value="Workshops"]')), "chip unticks");
  await page.click(".clear-all"); eq(await n(), total, "cleared"); eq(await page.locator("#ev-years input:checked, #ev-types input:checked").count(), 0); eq(await page.inputValue("#ev-q"), "");
  ok((await page.locator(".active-bar .count").textContent()).startsWith(`${total} of ${total}`), "count bar");
  await page.setViewportSize({ width: 390, height: 844 });
  const r2 = page.locator(".event-row").first(); const w = await r2.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length); eq(w, 2, "mobile columns");
  await page.setViewportSize({ width: 1440, height: 900 });
});
await t("teaching: year-grouped strips, latest first, no supervision section", async () => {
  await page.goto(B + "/teaching/");
  const ys = (await page.locator(".ev-year-h").allTextContents()).map(Number); ok(ys.length >= 3 && ys.every((y, i) => i === 0 || y < ys[i - 1]), "years " + ys);
  eq(ys[0], 2026, "latest first"); ok(await page.locator(".strip.teach").count() >= 9, "modules");
  const txt = await page.locator("main").textContent(); ok(!/supervis|mentoring/i.test(txt), "supervision removed"); ok(!/applied education|real confidence/i.test(txt), "no teaching-philosophy sentence");
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
  eq(lp, 3, "long bio paragraphs"); ok(c2.startsWith("Dr Gauri Vaidya is a Senior Postdoctoral Researcher with the National Kidney Disease Surveillance System at the University of Limerick.") && c2.endsWith("featured by the Business Post, The Times of India, and atoti."), "long bio text " + c2.slice(0, 60));
  eq(await page.locator('main a[href="/cv.pdf"]').count(), 0, "no CV link on About"); ok(!/\bCV\b/.test(await page.locator("main").textContent()), "no CV text on About");
});
await t("tab titles: home 'Dr Gauri Vaidya', others 'Gauri Vaidya | Page' (prerendered + runtime)", async () => {
  const want = { "/": "Dr Gauri Vaidya", "/about/": "Gauri Vaidya | About", "/publications/": "Gauri Vaidya | Publications", "/teaching/": "Gauri Vaidya | Teaching", "/talks/": "Gauri Vaidya | Talks", "/contact/": "Gauri Vaidya | Contact", "/404.html": "Gauri Vaidya | Page not found" };
  for (const [r, title] of Object.entries(want)) { ok((await (await page.request.get(B + r)).text()).includes(`<title>${title}</title>`), "prerendered " + r); await page.goto(B + r); eq(await page.title(), title, r); }
  await page.goto(B + "/"); await page.click(".site-nav >> text=Talks & Events"); await page.waitForURL(B + "/talks/"); eq(await page.title(), "Gauri Vaidya | Talks", "client nav title");
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
  const btns = page.locator(".cbtn"); eq(await btns.count(), 7, "buttons");
  eq((await btns.allTextContents()).join("|"), "Email (work)|Email (personal)|Google Scholar|ORCID|GitHub|LinkedIn|CV");
  eq(await page.locator(".cbtn svg.icon").count(), 7, "icons");
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
await t("home portrait larger (272px desktop, 132px mobile) and sharp source chosen", async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(B + "/", { waitUntil: "networkidle" }); const r = await p.locator(".hero-avatar img").evaluate((i) => ({ w: i.getBoundingClientRect().width, src: i.currentSrc, nw: i.naturalWidth }));
  eq(Math.round(r.w), 272, "desktop size"); ok(/portrait-340\.(avif|webp)$/.test(r.src), "largest source " + r.src);
  await p.setViewportSize({ width: 390, height: 844 }); await p.goto(B + "/"); eq(Math.round(await p.locator(".hero-avatar img").evaluate((i) => i.getBoundingClientRect().width)), 132, "mobile size");
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
if ((await (await page.request.get(B + "/preview/home-a/")).text()).includes("area-list")) {
  await t("home option A preview: intro + 3 research areas linking to filtered publications + recognitions", async () => {
    await page.goto(B + "/preview/home-a/"); eq(await page.locator("h1").count(), 1); ok(await page.locator(".landing-hero").isVisible(), "intro");
    eq(await page.locator(".area").count(), 3, "areas"); eq(await page.locator(".area h3").first().textContent(), "Kidney disease surveillance & health data");
    eq((await page.locator(".recognitions .rec").allTextContents()).length, 3, "recognitions");
    ok((await (await page.request.get(B + "/preview/home-a/")).text()).includes('name="robots" content="noindex"'), "noindex");
    const total = 28; await page.locator(".area", { hasText: "Optimisation" }).locator("a").click(); await page.waitForURL(/topic=optimisation/);
    const n = await page.locator(".pub").count(); ok(n > 0 && n < total, "filtered " + n); eq(await page.locator(".active-chip").count(), 1, "topic chip");
    await page.click(".clear-all"); ok(await page.locator(".pub").count() >= total, "cleared");
    for (const w of [390, 1440]) { await page.setViewportSize({ width: w, height: 900 }); await page.goto(B + "/preview/home-a/"); ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "hscroll " + w); }
  });
  await t("home option B preview: editorial hero, Research/Currently, 3 selected pubs from data", async () => {
    await page.goto(B + "/preview/home-b/"); eq(await page.locator("h1").count(), 1); eq((await page.locator("h1").textContent()).trim(), "Gauri Vaidya");
    eq((await page.locator(".ed-label").allTextContents()).join("|"), "Research|Currently|Selected publications");
    eq(await page.locator(".ed-pubs li").count(), 3, "pubs"); ok((await page.locator(".ed-list.plain").textContent()).includes("CS6604"), "currently");
    await page.locator(".ed-pub-title").first().click(); await page.waitForURL(/publications\/\?q=/); eq(await page.locator(".pub").count(), 1, "pub found");
    for (const w of [390, 1440]) { await page.setViewportSize({ width: w, height: 900 }); await page.goto(B + "/preview/home-b/"); ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "hscroll " + w); }
  });
  const counts = { pubs: 28 };
  const common = async (r) => {
    eq((await page.request.get(B + r)).status(), 200, "status " + r); ok((await (await page.request.get(B + r)).text()).includes('name="robots" content="noindex"'), "noindex " + r);
    await page.goto(B + r); eq(await page.locator("h1").count(), 1); eq((await page.locator("h1").textContent()).replace(/\s+/g, " ").trim(), "Gauri Vaidya");
    eq(await page.locator("main .pills a").count(), 6, "6 profile links"); ok(await page.locator("main picture img").evaluate((i) => i.complete && i.naturalWidth > 0), "portrait");
    ok(!(await page.content()).includes("I use data and AI"), "no tagline"); ok(!(await page.locator("main").textContent()).includes("Recent"), "no Recent");
    for (const w of [390, 1440]) { await page.setViewportSize({ width: w, height: 900 }); await page.goto(B + r); ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "hscroll " + w + r); }
  };
  await t("home option C preview: cover split, very large name, real counts link to sections", async () => {
    await common("/preview/home-c/");
    const fs = await page.locator(".hc h1").evaluate((e) => parseFloat(getComputedStyle(e).fontSize)); ok(fs >= 72, "name size " + fs);
    eq(await page.locator(".hc-stats b").first().textContent(), String(counts.pubs), "pub count");
    await page.locator(".hc-stats a").nth(1).click(); await page.waitForURL(B + "/teaching/");
  });
  await t("home option D preview: teal band + numbered index 01-05 with real counts", async () => {
    await common("/preview/home-d/");
    eq((await page.locator(".hd-n").allTextContents()).join(), "01,02,03,04,05"); eq((await page.locator(".hd-l").allTextContents()).join("|"), "About|Publications|Teaching|Talks & Events|Contact");
    ok((await page.locator(".hd-s").nth(1).textContent()).startsWith(counts.pubs + " papers"), "count");
    const bg = await page.locator(".hd-band").evaluate((e) => getComputedStyle(e).backgroundColor); eq(bg, "rgb(15, 110, 110)", "band teal");
    await page.locator(".hd-index a", { hasText: "Publications" }).click(); await page.waitForURL(B + "/publications/");
  });
  await t("home option E preview: network canvas animates, pauses offscreen, static under reduced motion", async () => {
    await common("/preview/home-e/");
    const sig = () => page.evaluate(() => { const c = document.querySelector("canvas.net"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); });
    ok(await page.locator("canvas.net").getAttribute("aria-hidden") === "true", "decorative");
    const a = await sig(); await page.waitForTimeout(400); ok(a !== await sig(), "animates");
    const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }); const p = await rm.newPage(); await p.goto(B + "/preview/home-e/");
    const s1 = await p.evaluate(() => document.querySelector("canvas.net").toDataURL()); await p.waitForTimeout(400); eq(s1 === await p.evaluate(() => document.querySelector("canvas.net").toDataURL()), true, "static when reduced motion");
    ok(s1.length > 3000, "static frame drawn"); await rm.close();
  });
  await t("previews not in sitemap", async () => { ok(!(await (await page.request.get(B + "/sitemap.xml")).text()).includes("preview"), "sitemap"); });
} else console.log("(preview routes not built — skipping option A/B checks)");
await t("no console errors", async () => { ok(errors.length === 0, errors.join(" | ")); });
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); process.exit(fail ? 1 : 0);
