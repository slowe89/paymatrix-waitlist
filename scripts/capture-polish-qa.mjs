import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.QA_URL || "http://127.0.0.1:4173";
const OUT = path.resolve("docs/polish-qa");
fs.mkdirSync(OUT, { recursive: true });

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
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  page.setDefaultTimeout(15000);
  return page;
}

async function goto(page, hash = "") {
  await page.goto(`${BASE}/${hash}`, { waitUntil: "networkidle0" });
}

const CORS = { "Access-Control-Allow-Origin": "*" };

async function interceptForm(page, mode) {
  if (!page.__intercepting) {
    await page.setRequestInterception(true);
    page.__intercepting = true;
  }
  page.removeAllListeners("request");
  page.on("request", (request) => {
    const url = request.url();
    if (!url.includes("formsubmit.co")) {
      request.continue();
      return;
    }
    if (mode === "success") {
      request.respond({
        status: 200,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ success: "true", message: "ok" }),
      });
      return;
    }
    if (mode === "body-fail") {
      request.respond({
        status: 200,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ success: "false", message: "rejected" }),
      });
      return;
    }
    if (mode === "http-fail") {
      request.respond({
        status: 500,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ success: "false" }),
      });
      return;
    }
    request.abort("failed");
  });
}

async function fillRequired(page) {
  await page.type("#email", "qa@example.com");
  await page.type("#q1", "Facilitator returns 402 with no reason.");
  await page.click('input[name="ship_pieces"][value="Live 402 route"]');
  await page.type("#q3", "Tried docs and a one-off curl.");
  await page.type("#q4", "About 8 hours a week in troubleshooting.");
  await page.type("#q5", "One facilitator that actually settles.");
  await page.click('input[name="budget_band"][value="Not sure yet"]');
}

const desktop = await newPage(1280, 800);
await goto(desktop);
await desktop.screenshot({ path: path.join(OUT, "hero-desktop.png"), fullPage: false });

const heroCtaVisible = await desktop.evaluate(() => {
  const email = document.querySelector("#hero-email");
  const cta = document.querySelector(".hero .btn.primary");
  const emailBox = email.getBoundingClientRect();
  const ctaBox = cta.getBoundingClientRect();
  const inFold = (r) => r.top >= 0 && r.bottom <= window.innerHeight;
  return inFold(emailBox) && inFold(ctaBox);
});
log(heroCtaVisible, "Email-only CTA above the fold at 1280×800");

const overflowDesktop = await desktop.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
log(!overflowDesktop, "No horizontal overflow at 1280×800");

const mobile = await newPage(375, 667);
await goto(mobile);
await mobile.screenshot({ path: path.join(OUT, "hero-mobile.png"), fullPage: false });
const heroCtaMobile = await mobile.evaluate(() => {
  const email = document.querySelector("#hero-email");
  const cta = document.querySelector(".hero .btn.primary");
  const emailBox = email.getBoundingClientRect();
  const ctaBox = cta.getBoundingClientRect();
  const inFold = (r) => r.top >= 0 && r.bottom <= window.innerHeight;
  return inFold(emailBox) && inFold(ctaBox);
});
log(heroCtaMobile, "Email-only CTA above the fold at 375×667");
const overflowMobile = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
log(!overflowMobile, "No horizontal overflow at 390×844");
await mobile.close();

const widths = [320, 360, 768, 1440];
for (const width of widths) {
  const page = await newPage(width, 900);
  await goto(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  log(!overflow, `No horizontal overflow at ${width}px`);
  await page.close();
}

const zoom = await newPage(1280, 800);
await zoom.setViewport({ width: 640, height: 400, deviceScaleFactor: 2 });
await goto(zoom);
const overflowZoom = await zoom.evaluate(() => document.documentElement.scrollWidth > 640 + 1);
log(!overflowZoom, "No horizontal overflow at 200% zoom (640 CSS px)");
await zoom.close();

await desktop.evaluate(() => document.querySelector("#scorecard").scrollIntoView({ block: "start" }));
await desktop.waitForSelector(".items li");

const yesInputs = await desktop.$$('.items input[value="Y"]');
for (const input of yesInputs) {
  await input.click();
}
await desktop.waitForFunction(() => document.getElementById("score-total").textContent.includes("/ 100"));
const completeText = await desktop.evaluate(() => ({
  total: document.getElementById("score-total").textContent,
  band: document.getElementById("score-band").textContent,
  invite: document.getElementById("score-invite-text").textContent,
}));
log(completeText.total === "100 / 100", "All Yes = 100 / 100", completeText.total);
log(completeText.band === "Checklist largely covered", "90–100 band renamed", completeText.band);
log(!/production-ready/i.test(completeText.invite), "Invite does not claim production-ready");

const noInputs = await desktop.$$('.items input[value="N"]');
for (const input of noInputs) {
  await input.click();
}
const allNo = await desktop.evaluate(() => ({
  total: document.getElementById("score-total").textContent,
  band: document.getElementById("score-band").textContent,
}));
log(allNo.total === "0 / 100", "All No = 0 / 100", allNo.total);
log(allNo.band === "Baseline not established", "0–39 band renamed", allNo.band);

const partialPage = await newPage(1280, 800);
await goto(partialPage, "#scorecard");
const partialYes = await partialPage.$$('.items input[value="Y"]');
await partialYes[0].click();
await partialYes[1].click();
await partialYes[2].click();
const partial = await partialPage.evaluate(() => ({
  total: document.getElementById("score-total").textContent,
  band: document.getElementById("score-band").textContent,
  inviteHidden: document.getElementById("score-invite").hidden,
}));
log(
  /partial/i.test(partial.band) && partial.total === "30" && partial.inviteHidden,
  "Partial answers stay labeled partial and are not a completed band",
  JSON.stringify(partial)
);

async function completeScore(page, yesCount) {
  for (let index = 1; index <= 10; index += 1) {
    const value = index <= yesCount ? "Y" : "N";
    await page.click(`input[name="maturity-q${index}"][value="${value}"]`);
  }
  return page.evaluate(() => ({
    total: document.getElementById("score-total").textContent,
    band: document.getElementById("score-band").textContent,
  }));
}

const band40 = await completeScore(partialPage, 4);
log(band40.band === "Some checks covered" && band40.total === "40 / 100", "40 boundary band", JSON.stringify(band40));
const band70 = await completeScore(partialPage, 7);
log(band70.band === "Most checks covered" && band70.total === "70 / 100", "70 boundary band", JSON.stringify(band70));
const band90 = await completeScore(partialPage, 9);
log(band90.band === "Checklist largely covered" && band90.total === "90 / 100", "90 boundary band", JSON.stringify(band90));
await partialPage.close();

for (const input of yesInputs) {
  await input.click();
}
await desktop.evaluate(() => {
  const header = document.querySelector(".site-header").getBoundingClientRect().height;
  const top = document.querySelector("#scorecard").getBoundingClientRect().top + window.scrollY - header - 8;
  window.scrollTo(0, Math.max(0, top));
});
await desktop.screenshot({ path: path.join(OUT, "scorecard.png"), fullPage: false });

const controlMetrics = await desktop.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      cssWidth: style.width,
      cssFlex: style.flex,
    };
  };
  const row = (sel) => {
    const el = document.querySelector(sel);
    return Math.round(el.getBoundingClientRect().height);
  };
  const labelGap = () => {
    const label = document.querySelector(".check");
    const input = label.querySelector("input");
    const textLeft = label.getBoundingClientRect().left;
    const inputBox = input.getBoundingClientRect();
    return {
      inputLeft: Math.round(inputBox.left - textLeft),
      inputWidth: Math.round(inputBox.width),
      rowWidth: Math.round(label.getBoundingClientRect().width),
    };
  };
  const fieldsetBorders = [...document.querySelectorAll(".items fieldset, .priestley fieldset")].map((fs) =>
    getComputedStyle(fs).borderTopWidth
  );
  return {
    scoreRadio: pick('.items input[type="radio"]'),
    budgetRadio: pick('input[name="budget_band"]'),
    checkbox: pick('input[name="ship_pieces"]'),
    ynRow: row(".yn label"),
    checkRow: row(".check"),
    radioRow: row(".radio"),
    labelGap: labelGap(),
    fieldsetBorders,
  };
});

log(
  controlMetrics.scoreRadio.width === 18 && controlMetrics.scoreRadio.height === 18,
  "Score radios are 18×18",
  JSON.stringify(controlMetrics.scoreRadio)
);
log(
  controlMetrics.budgetRadio.width === 18 && controlMetrics.budgetRadio.height === 18,
  "Budget radios are 18×18",
  JSON.stringify(controlMetrics.budgetRadio)
);
log(
  controlMetrics.checkbox.width === 18 && controlMetrics.checkbox.height === 18,
  "Q2 checkboxes are 18×18",
  JSON.stringify(controlMetrics.checkbox)
);
log(controlMetrics.ynRow >= 44, "Yes/No labels are at least 44px", String(controlMetrics.ynRow));
log(controlMetrics.checkRow >= 44, "Q2 rows are at least 44px", String(controlMetrics.checkRow));
log(controlMetrics.radioRow >= 44, "Budget rows are at least 44px", String(controlMetrics.radioRow));
log(
  controlMetrics.labelGap.inputLeft < 20 && controlMetrics.labelGap.inputWidth === 18,
  "Checkbox sits beside its label (not centered/far-right)",
  JSON.stringify(controlMetrics.labelGap)
);
log(
  controlMetrics.fieldsetBorders.every((w) => w === "0px"),
  "No nested default fieldset borders",
  controlMetrics.fieldsetBorders.join(",")
);

const copyScan = await desktop.evaluate(() => document.body.innerText);
for (const banned of ["UNPROVEN", "Priestley", "Capture:", "No SOLVD branding", "Production-ready"]) {
  log(!copyScan.includes(banned), `Visitor copy does not include “${banned}”`);
}

await desktop.evaluate(() => document.querySelector("#waitlist").scrollIntoView({ block: "start" }));
await desktop.waitForSelector(".check-group");
const q2Box = await desktop.$(".check-group");
await q2Box.screenshot({ path: path.join(OUT, "form-checkboxes.png") });

await interceptForm(desktop, "success");
await fillRequired(desktop);

await desktop.evaluate(() => {
  document.querySelector("#priestley-form").requestSubmit();
});
await desktop.waitForFunction(() => !document.getElementById("form-success").hidden);
const successFocused = await desktop.evaluate(() => document.activeElement?.id === "form-success");
log(successFocused, "Mock success reveals and focuses confirmation");
await desktop.screenshot({ path: path.join(OUT, "success-mock.png"), fullPage: false });

const errorPage = await newPage(1280, 900);
await goto(errorPage, "#waitlist");
await interceptForm(errorPage, "body-fail");
await fillRequired(errorPage);
await errorPage.evaluate(() => document.querySelector("#priestley-form").requestSubmit());
await errorPage.waitForFunction(() => !document.getElementById("form-error").hidden);
const bodyFail = await errorPage.evaluate(() => ({
  formHidden: document.getElementById("priestley-form").hidden,
  error: document.getElementById("form-error").textContent,
  email: document.getElementById("email").value,
  retry: document.getElementById("submit-btn").textContent,
}));
log(!bodyFail.formHidden && bodyFail.email === "qa@example.com", "Body-level rejection keeps answers visible");
log(/try again/i.test(bodyFail.retry), "Body-level rejection shows retry", bodyFail.retry);

await interceptForm(errorPage, "http-fail");
await errorPage.click("#submit-btn");
await errorPage.waitForFunction(() => document.getElementById("form-error").textContent.includes("couldn't send") || document.getElementById("form-error").textContent.includes("couldn't confirm") || document.getElementById("form-error").textContent.length > 0);
const httpFail = await errorPage.evaluate(() => ({
  formHidden: document.getElementById("priestley-form").hidden,
  email: document.getElementById("email").value,
}));
log(!httpFail.formHidden && httpFail.email === "qa@example.com", "HTTP error keeps answers visible");

await interceptForm(errorPage, "network-fail");
await errorPage.click("#submit-btn");
await errorPage.waitForFunction(() => /network/i.test(document.getElementById("form-error").textContent));
const netFail = await errorPage.evaluate(() => ({
  formHidden: document.getElementById("priestley-form").hidden,
  email: document.getElementById("email").value,
  retry: document.getElementById("submit-btn").textContent,
}));
log(!netFail.formHidden && netFail.email === "qa@example.com", "Network error keeps answers visible");
log(/try again/i.test(netFail.retry), "Network error shows retry");

const rapidPage = await newPage(1280, 900);
await goto(rapidPage, "#waitlist");
let submitCount = 0;
await interceptForm(rapidPage, "success");
rapidPage.removeAllListeners("request");
rapidPage.on("request", (request) => {
  if (request.url().includes("formsubmit.co")) {
    submitCount += 1;
    request.respond({
      status: 200,
      contentType: "application/json",
      headers: CORS,
      body: JSON.stringify({ success: "true" }),
    });
    return;
  }
  request.continue();
});
await fillRequired(rapidPage);
await rapidPage.evaluate(() => {
  const form = document.getElementById("priestley-form");
  form.requestSubmit();
  form.requestSubmit();
  form.requestSubmit();
});
await rapidPage.waitForFunction(() => !document.getElementById("form-success").hidden);
log(submitCount === 1, "Rapid repeat clicks do not send twice", `sends=${submitCount}`);
await rapidPage.close();

const q2Page = await newPage(1280, 900);
await goto(q2Page, "#waitlist");
await q2Page.type("#email", "qa@example.com");
await q2Page.type("#q1", "Facilitator returns 402 with no reason.");
await q2Page.type("#q3", "Tried docs and a one-off curl.");
await q2Page.type("#q4", "About 8 hours a week in troubleshooting.");
await q2Page.type("#q5", "One facilitator that actually settles.");
await q2Page.click('input[name="budget_band"][value="Not sure yet"]');
await q2Page.evaluate(() => document.getElementById("priestley-form").requestSubmit());
const q2Empty = await q2Page.evaluate(() => ({
  errorShown: !document.getElementById("ship-error").hidden,
  focused: document.activeElement?.name === "ship_pieces",
}));
log(q2Empty.errorShown && q2Empty.focused, "Empty Q2 is announced and focused", JSON.stringify(q2Empty));

await q2Page.evaluate(() => {
  const check = (value) => document.querySelector(`input[name="ship_pieces"][value="${value}"]`).click();
  check("Live 402 route");
  check("Named facilitator(s)");
  check("We have none of these");
});
const exclusiveNone = await q2Page.evaluate(() =>
  [...document.querySelectorAll('input[name="ship_pieces"]:checked')].map((el) => el.value)
);
log(
  exclusiveNone.length === 1 && exclusiveNone[0] === "We have none of these",
  "None clears substantive answers",
  exclusiveNone.join("|")
);

await q2Page.evaluate(() => {
  document.querySelector('input[name="ship_pieces"][value="Not sure"]').click();
});
const exclusiveNotSure = await q2Page.evaluate(() =>
  [...document.querySelectorAll('input[name="ship_pieces"]:checked')].map((el) => el.value)
);
log(exclusiveNotSure.length === 1 && exclusiveNotSure[0] === "Not sure", "None and Not sure are exclusive");

await q2Page.evaluate(() => {
  document.querySelector('input[name="ship_pieces"][value="Settled once"]').click();
  document.querySelector('input[name="ship_pieces"][value="Reject reasons logged"]').click();
});
const substantive = await q2Page.evaluate(() =>
  [...document.querySelectorAll('input[name="ship_pieces"]:checked')].map((el) => el.value)
);
log(
  substantive.includes("Settled once") &&
    substantive.includes("Reject reasons logged") &&
    !substantive.includes("Not sure"),
  "Substantive values are retained together",
  substantive.join("|")
);

const formAction = await q2Page.evaluate(() => document.getElementById("priestley-form").action);
log(
  formAction === "https://formsubmit.co/thespencerlowe@gmail.com",
  "Native form still targets FormSubmit recipient",
  formAction
);

const hidden = await q2Page.evaluate(() => ({
  subject: document.querySelector("#priestley-form input[name='_subject']").value,
  honey: document.querySelector("#priestley-form input[name='_honey']") != null,
}));
log(hidden.subject.includes("PayMatrix"), "Site subject is present", hidden.subject);
log(hidden.honey, "Honeypot field is present");

const emailFirstMeta = await q2Page.evaluate(() => {
  const form = document.getElementById("email-first-form");
  const scorecard = document.getElementById("scorecard");
  const waitlist = document.getElementById("waitlist");
  const hero = document.getElementById("top");
  const afterHero = (el) => hero.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING;
  return {
    action: form.action,
    source: form.querySelector('input[name="source"]').value,
    cta: form.querySelector('input[name="cta"]').value,
    subject: form.querySelector('input[name="_subject"]').value,
    honey: form.querySelector('input[name="_honey"]') != null,
    requiredOnlyEmail: [...form.querySelectorAll("[required]")].every((el) => el.name === "email"),
    scorecardPresent: Boolean(scorecard),
    waitlistPresent: Boolean(waitlist),
    scorecardAfterHero: afterHero(scorecard),
    waitlistAfterScorecard: scorecard.compareDocumentPosition(waitlist) & Node.DOCUMENT_POSITION_FOLLOWING,
    label: document.querySelector('label[for="hero-email"]')?.textContent || "",
  };
});
log(
  emailFirstMeta.action === "https://formsubmit.co/thespencerlowe@gmail.com",
  "Email-first form still targets FormSubmit recipient",
  emailFirstMeta.action
);
log(emailFirstMeta.source === "paymatrix-email-first", "Email-first source field", emailFirstMeta.source);
log(emailFirstMeta.cta === "hero-email-only", "Email-first cta field", emailFirstMeta.cta);
log(emailFirstMeta.subject === "PayMatrix email-first CTA", "Email-first subject", emailFirstMeta.subject);
log(emailFirstMeta.honey, "Email-first honeypot is present");
log(emailFirstMeta.requiredOnlyEmail, "Email-first required field is email only");
log(/work email/i.test(emailFirstMeta.label), "Email-first work email is labeled", emailFirstMeta.label);
log(emailFirstMeta.scorecardPresent && emailFirstMeta.scorecardAfterHero, "Scorecard remains below the hero");
log(emailFirstMeta.waitlistPresent && emailFirstMeta.waitlistAfterScorecard, "Priestley waitlist remains below the scorecard");

const emailFirstPage = await newPage(1280, 800);
await goto(emailFirstPage);
await interceptForm(emailFirstPage, "success");
await emailFirstPage.type("#hero-email", "qa@example.com");
await emailFirstPage.evaluate(() => document.getElementById("email-first-form").requestSubmit());
await emailFirstPage.waitForFunction(() => !document.getElementById("email-first-success").hidden);
const emailFirstOk = await emailFirstPage.evaluate(() => ({
  formHidden: document.getElementById("email-first-form").hidden,
  copy: document.getElementById("email-first-success").textContent,
  priestleyVisible: !document.getElementById("priestley-form").hidden,
}));
log(
  emailFirstOk.formHidden && /thespencerlowe@gmail.com/.test(emailFirstOk.copy) && /Ship Score/.test(emailFirstOk.copy),
  "Email-first success copy names the reply address",
  emailFirstOk.copy.trim()
);
log(emailFirstOk.priestleyVisible, "Priestley form stays available after hero submit");
await emailFirstPage.close();

const prices = await q2Page.evaluate(() => document.body.innerText);
log(prices.includes("$1,997–$4,997") && prices.includes("$497–$997/mo"), "Both soft price ranges remain");
log(
  ["Under $500", "$500–$1,500", "$1,500–$4,000", "$4,000+", "Not sure yet"].every((band) =>
    prices.includes(band)
  ),
  "All five budget choices remain"
);

const noscript = await q2Page.evaluate(() => document.querySelector("noscript")?.textContent || "");
log(/javascript/i.test(noscript) && /waitlist/i.test(noscript), "Noscript score guidance links to waitlist");

await q2Page.close();
await errorPage.close();
await desktop.close();
await browser.close();

const failed = report.filter((item) => !item.ok);
console.log(`\n${report.length - failed.length}/${report.length} checks passed`);
if (failed.length) {
  process.exitCode = 1;
}
