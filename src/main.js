const DEFAULT_FORM_ACTION = "https://formsubmit.co/thespencerlowe@gmail.com";
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || DEFAULT_FORM_ACTION;

const KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
const EXCLUSIVE_SHIP = new Set(["We have none of these", "Not sure"]);
const DEFAULT_SUBMIT_LABEL = "Join the waitlist";

const BANDS = [
  { max: 39, label: "Baseline not established" },
  { max: 69, label: "Some checks covered" },
  { max: 89, label: "Most checks covered" },
  { max: 100, label: "Checklist largely covered" },
];

const form = document.getElementById("priestley-form");
const success = document.getElementById("form-success");
const formError = document.getElementById("form-error");
const shipError = document.getElementById("ship-error");
const submitBtn = document.getElementById("submit-btn");
const sourceField = document.getElementById("meta-source");
const scoreTotalField = document.getElementById("meta-score-total");
const scoreVectorField = document.getElementById("meta-score-vector");
const timestampField = document.getElementById("meta-timestamp");
const scoreTotalEl = document.getElementById("score-total");
const scoreBandEl = document.getElementById("score-band");
const scoreProgressEl = document.getElementById("score-progress");
const scoreInvite = document.getElementById("score-invite");
const scoreInviteText = document.getElementById("score-invite-text");
const scoreEcho = document.getElementById("score-echo");
const shipFieldset = form.querySelector(".check-group");
const shipBoxes = [...form.querySelectorAll('input[name="ship_pieces"]')];

form.action = FORM_ENDPOINT;

let submitting = false;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function answers() {
  return KEYS.map((key) => {
    const checked = document.querySelector(`input[name="maturity-${key}"]:checked`);
    return checked ? checked.value : null;
  });
}

function bandFor(total) {
  return BANDS.find((band) => total <= band.max).label;
}

function syncScore() {
  const vector = answers();
  const answered = vector.filter((value) => value !== null);
  const yesCount = answered.filter((value) => value === "Y").length;
  const total = yesCount * 10;
  const complete = answered.length === KEYS.length;

  scoreProgressEl.textContent = `${answered.length} / 10 answered`;

  if (!answered.length) {
    scoreTotalEl.textContent = "—";
    scoreBandEl.textContent = "Answer to score";
    scoreInvite.hidden = true;
    scoreEcho.hidden = true;
    scoreTotalField.value = "";
    scoreVectorField.value = "";
    return;
  }

  if (complete) {
    const band = bandFor(total);
    scoreTotalEl.textContent = `${total} / 100`;
    scoreBandEl.textContent = band;
    scoreInvite.hidden = false;
    scoreInviteText.textContent = `Your score is ${total} / 100 — ${band}. Self-assessment; a high score does not verify that a payment will settle.`;
    scoreEcho.hidden = false;
    scoreEcho.textContent = `Scorecard result: ${total} / 100 — ${band}.`;
    scoreTotalField.value = String(total);
    scoreVectorField.value = vector.join("/");
    sourceField.value = "paymatrix-scorecard";
    return;
  }

  scoreTotalEl.textContent = String(total);
  scoreBandEl.textContent = `Partial score · ${answered.length} / 10 answered`;
  scoreInvite.hidden = true;
  scoreEcho.hidden = true;
  scoreTotalField.value = String(total);
  scoreVectorField.value = vector.map((value) => value ?? "-").join("/");
}

function setSource(source) {
  if (!scoreInvite || scoreInvite.hidden) {
    sourceField.value = source;
  }
}

document.querySelectorAll("[data-source]").forEach((link) => {
  link.addEventListener("click", () => {
    setSource(link.dataset.source);
  });
});

document.getElementById("score-items").addEventListener("change", syncScore);

function shipSelected() {
  return shipBoxes.some((box) => box.checked);
}

function clearShipError() {
  if (!shipSelected()) return;
  shipError.hidden = true;
  shipFieldset?.removeAttribute("aria-invalid");
}

function showShipError() {
  shipError.hidden = false;
  shipFieldset?.setAttribute("aria-invalid", "true");
  shipBoxes[0]?.focus();
}

function syncShipExclusivity(changed) {
  if (!changed.checked) {
    clearShipError();
    return;
  }

  if (EXCLUSIVE_SHIP.has(changed.value)) {
    shipBoxes.forEach((box) => {
      if (box !== changed) box.checked = false;
    });
  } else {
    shipBoxes.forEach((box) => {
      if (EXCLUSIVE_SHIP.has(box.value)) box.checked = false;
    });
  }

  clearShipError();
}

shipBoxes.forEach((box) => {
  box.addEventListener("change", () => syncShipExclusivity(box));
});

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function hideFormError() {
  formError.hidden = true;
  formError.textContent = "";
}

function setSubmitState(state) {
  if (state === "sending") {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    return;
  }
  if (state === "retry") {
    submitBtn.disabled = false;
    submitBtn.textContent = "Try again";
    return;
  }
  submitBtn.disabled = false;
  submitBtn.textContent = DEFAULT_SUBMIT_LABEL;
}

function isConfirmedSuccess(response, body) {
  if (!response.ok) return false;
  if (!body || typeof body !== "object") return false;
  const flag = body.success ?? body.ok;
  return flag === true || flag === "true";
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function revealSuccess() {
  form.hidden = true;
  success.hidden = false;
  success.focus();
  success.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (submitting) return;

  hideFormError();
  shipError.hidden = true;
  shipFieldset?.removeAttribute("aria-invalid");

  if (!shipSelected()) {
    showShipError();
    return;
  }

  timestampField.value = new Date().toISOString();
  if (!scoreVectorField.value) {
    scoreVectorField.value = answers()
      .map((value) => value ?? "-")
      .join("/");
  }
  if (!sourceField.value) {
    sourceField.value = "paymatrix-waitlist";
  }

  submitting = true;
  setSubmitState("sending");

  const payload = new FormData(form);

  try {
    const ajaxUrl = FORM_ENDPOINT.includes("formsubmit.co/")
      ? FORM_ENDPOINT.replace("formsubmit.co/", "formsubmit.co/ajax/")
      : FORM_ENDPOINT;

    const response = await fetch(ajaxUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
    });

    const body = await readResponseBody(response);

    if (!response.ok) {
      showFormError("We couldn't send your answers. Check your connection and try again.");
      setSubmitState("retry");
      formError.focus?.();
      return;
    }

    if (!isConfirmedSuccess(response, body)) {
      showFormError("We couldn't confirm your submission. Your answers are still here — try again.");
      setSubmitState("retry");
      formError.focus?.();
      return;
    }

    revealSuccess();
  } catch {
    showFormError("Network error. Your answers are still here — try again.");
    setSubmitState("retry");
    formError.focus?.();
  } finally {
    submitting = false;
    if (!success.hidden) {
      setSubmitState("idle");
    } else if (submitBtn.textContent === "Sending…") {
      setSubmitState("retry");
    }
  }
});

syncScore();
