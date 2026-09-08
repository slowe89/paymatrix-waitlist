const DEFAULT_FORM_ACTION = "https://formsubmit.co/thespencerlowe@gmail.com";
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || DEFAULT_FORM_ACTION;

const KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];

const BANDS = [
  { max: 39, label: "Blind" },
  { max: 69, label: "Partial" },
  { max: 89, label: "Fragile settle" },
  { max: 100, label: "Production-ready" },
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

form.action = FORM_ENDPOINT;

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
    scoreTotalField.value = "";
    scoreVectorField.value = "";
    return;
  }

  scoreTotalEl.textContent = String(total);
  scoreBandEl.textContent = complete ? bandFor(total) : "Score updates as you answer";

  if (complete) {
    scoreInvite.hidden = false;
    scoreInviteText.textContent = `Your Facilitator Ship Score is ${total} — ${bandFor(total)}. Share this score and your answers via the Priestley form.`;
    scoreTotalField.value = String(total);
    scoreVectorField.value = vector.join("/");
    sourceField.value = "paymatrix-scorecard";
  } else {
    scoreInvite.hidden = true;
    scoreTotalField.value = answered.length ? String(total) : "";
    scoreVectorField.value = vector.map((value) => value ?? "-").join("/");
  }
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
  return [...form.querySelectorAll('input[name="ship_pieces"]:checked')].length > 0;
}

form.addEventListener("submit", async (event) => {
  formError.hidden = true;
  shipError.hidden = true;

  if (!shipSelected()) {
    event.preventDefault();
    shipError.hidden = false;
    shipError.focus?.();
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

  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  const payload = new FormData(form);
  payload.delete("_honey");

  try {
    const ajaxUrl = FORM_ENDPOINT.includes("formsubmit.co/")
      ? FORM_ENDPOINT.replace("formsubmit.co/", "formsubmit.co/ajax/")
      : FORM_ENDPOINT;

    const response = await fetch(ajaxUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
    });

    if (!response.ok) {
      throw new Error("submit_failed");
    }

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch {
    throwNativeSubmit(form);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send my score & answers";
  }
});

function throwNativeSubmit(target) {
  const native = document.createElement("form");
  native.action = FORM_ENDPOINT;
  native.method = "POST";
  native.style.display = "none";

  for (const [name, value] of new FormData(target)) {
    if (name === "_honey") continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    native.appendChild(input);
  }

  document.body.appendChild(native);
  native.submit();
}

if (new URLSearchParams(window.location.search).has("submitted")) {
  form.hidden = true;
  success.hidden = false;
}

syncScore();
