import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.QA_URL || "http://127.0.0.1:4173";
const REPO_OUT = path.resolve("docs/polish-qa");
const ART_OUT = "/opt/cursor/artifacts";
fs.mkdirSync(REPO_OUT, { recursive: true });
fs.mkdirSync(ART_OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const report = [];
function log(ok, message, extra = "") {
  report.push({ ok, message, extra });
  console.log(`${ok ? "PASS" : "FAIL"}  ${message}${extra ? ` — ${extra}` : ""}`);
}

async function newPage(width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  page.setDefaultTimeout(15000);
  return page;
}

async function writeShot(buffer, name) {
  const repoPath = path.join(REPO_OUT, name);
  const artPath = path.join(ART_OUT, name);
  fs.writeFileSync(repoPath, buffer);
  fs.writeFileSync(artPath, buffer);
}

const desktop = await newPage(1280, 900);
await desktop.goto(BASE, { waitUntil: "networkidle0" });

const desktopCopy = await desktop.evaluate(() => ({
  title: document.title,
  h1: document.querySelector("h1")?.textContent.trim(),
  subhead: document.querySelector(".subhead")?.innerText.replace(/\s+/g, " ").trim(),
  ship: [...document.querySelectorAll(".bullet-grid li")].map((li) =>
    li.innerText.replace(/\s+/g, " ").trim()
  ),
  whoNot: document.querySelector("#fit .split > div:last-child p")?.textContent.replace(/\s+/g, " ").trim(),
  prices: [...document.querySelectorAll(".price")].map((el) => el.textContent.trim()),
  formAction: document.getElementById("priestley-form")?.action,
  primaryCta: document.querySelector(".hero .btn.primary")?.textContent.trim(),
  primarySource: document.querySelector(".hero .btn.primary")?.dataset.source,
  secondaryCta: document.querySelector(".hero .btn.secondary")?.textContent.trim(),
  secondarySource: document.querySelector(".hero .btn.secondary")?.dataset.source,
  q4: document.querySelector('[data-key="q4"] .q-text')?.textContent.replace(/\s+/g, " ").trim(),
  disclaimer: document.querySelector(".score-disclaimer")?.textContent.trim(),
}));

log(desktopCopy.title === "PayMatrix — name the settle failure before you ship", "Title/OG string", desktopCopy.title);
log(
  desktopCopy.h1 === "See which settle path fails — by code, not by guess.",
  "H1 exact",
  desktopCopy.h1
);
log(/402_SANS_ACCEPTS/.test(desktopCopy.subhead), "Hero names 402_SANS_ACCEPTS", desktopCopy.subhead);
log(
  /payment_required/.test(desktopCopy.ship[0]) &&
    /payment_challenge_invalid/.test(desktopCopy.ship[0]) &&
    /settlement_unconfirmed/.test(desktopCopy.ship[0]) &&
    /payment_header_invalid/.test(desktopCopy.ship[0]),
  "Ship bullet 1 names four payment codes",
  desktopCopy.ship[0]
);
log(
  /settle-before-serve/.test(desktopCopy.ship[1]) && /junk payment headers marked paid/.test(desktopCopy.ship[1]),
  "Ship bullet 2 names conformance cells",
  desktopCopy.ship[1]
);
log(/402_SANS_ACCEPTS/.test(desktopCopy.ship[2]), "Ship bullet 3 names 402_SANS_ACCEPTS", desktopCopy.ship[2]);
log(/post-settlement dispute/.test(desktopCopy.whoNot), "Who-not has dispute clause", desktopCopy.whoNot);
log(
  desktopCopy.prices[0] === "$1,997–$4,997" && desktopCopy.prices[1] === "$497–$997/mo",
  "Pricing verbatim",
  desktopCopy.prices.join(" | ")
);
log(
  desktopCopy.formAction === "https://formsubmit.co/thespencerlowe@gmail.com",
  "FormSubmit recipient unchanged",
  desktopCopy.formAction
);
log(
  desktopCopy.primaryCta === "Check your payment setup — free" &&
    desktopCopy.primarySource === "paymatrix-scorecard",
  "Primary CTA/data-source unchanged",
  `${desktopCopy.primaryCta} / ${desktopCopy.primarySource}`
);
log(
  desktopCopy.secondaryCta === "Join the waitlist" && desktopCopy.secondarySource === "paymatrix-waitlist",
  "Secondary CTA/data-source unchanged",
  `${desktopCopy.secondaryCta} / ${desktopCopy.secondarySource}`
);
log(/402_SANS_ACCEPTS/.test(desktopCopy.q4), "Scorecard Q04 names 402_SANS_ACCEPTS", desktopCopy.q4);
log(
  desktopCopy.disclaimer === "Self-assessment; a high score does not verify that a payment will settle.",
  "Scorecard disclaimer unchanged"
);

const heroEl = await desktop.$(".hero");
await writeShot(await heroEl.screenshot({ type: "png" }), "hero-settle-codes-desktop.png");
await writeShot(await desktop.screenshot({ type: "png" }), "hero-desktop.png");

const yesInputs = await desktop.$$('.items input[value="Y"]');
for (const input of yesInputs) await input.click();
await desktop.waitForFunction(() => document.getElementById("score-total").textContent.includes("/ 100"));
const allYes = await desktop.evaluate(() => ({
  total: document.getElementById("score-total").textContent,
  band: document.getElementById("score-band").textContent,
}));
log(allYes.total === "100 / 100", "All Yes = 100 / 100", allYes.total);
log(allYes.band === "Checklist largely covered", "90–100 band", allYes.band);

const noInputs = await desktop.$$('.items input[value="N"]');
for (const input of noInputs) await input.click();
const allNo = await desktop.evaluate(() => ({
  total: document.getElementById("score-total").textContent,
  band: document.getElementById("score-band").textContent,
}));
log(allNo.total === "0 / 100", "All No = 0 / 100", allNo.total);
log(allNo.band === "Baseline not established", "0–39 band", allNo.band);

await desktop.evaluate(() => document.querySelector("#scorecard").scrollIntoView({ block: "start" }));
await writeShot(await desktop.screenshot({ type: "png" }), "scorecard-settle-codes.png");

const shipEl = await desktop.$(".bullets");
await writeShot(await shipEl.screenshot({ type: "png" }), "ship-pack-settle-codes.png");

const mobile = await newPage(375, 900);
await mobile.goto(BASE, { waitUntil: "networkidle0" });
const mobileHero = await mobile.$(".hero");
await writeShot(await mobileHero.screenshot({ type: "png" }), "hero-settle-codes-mobile-375.png");
await writeShot(await mobile.screenshot({ type: "png" }), "hero-mobile.png");
const mobileHasCode = await mobile.evaluate(() => document.body.innerText.includes("402_SANS_ACCEPTS"));
log(mobileHasCode, "375px page includes 402_SANS_ACCEPTS");

await desktop.close();
await mobile.close();
await browser.close();

const failed = report.filter((item) => !item.ok);
console.log(`\n${report.length - failed.length}/${report.length} checks passed`);
if (failed.length) process.exitCode = 1;
