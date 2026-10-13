/* Freedom Frank — The Porch. Countdown + ballot/pledge form logic. */
"use strict";

/* ============================================================
   MAILERLITE WIRING — LIVE (wired Oct 12, 2026)
   ------------------------------------------------------------
   Embedded form "Porch Ballot" (id 201169207867475059) in the
   Freedom Frank USA MailerLite account, attached to group
   "Porch - Main" (201157819664172651), double opt-in OFF.
   Fields: email / name / ballot_choice. The submit handlers
   POST fields[email], fields[name], fields[ballot_choice] and
   groups[] (Porch - Main + ALL three lane groups — one bundled
   opt-in per Ben's value-stack call, Oct 12, 2026: Countdown
   201157834936681683 · Frank's Law Letter 201157869256573973 ·
   Trades 201157879582950726). Joining
   Porch - Main fires welcome workflow 201158336894207617.
   Verified end-to-end Oct 12, 2026: test signup landed Active
   in both groups with name + ballot choice recorded.
   This POST URL is public by design (it is the form's embed
   endpoint) — never put an API token in this file.
   ============================================================ */
const MAILERLITE_FORM_ACTION = "https://assets.mailerlite.com/jsonp/2706155/forms/201169207867475059/subscribe";

/* ---------- Countdown to Dec 3, 2026, 00:00 America/New_York ---------- */
/* December in New York is EST (UTC-5), so the target is 05:00 UTC. */
const TARGET_UTC = Date.UTC(2026, 11, 3, 5, 0, 0);

function pad(n) { return String(n).padStart(2, "0"); }
function tickCountdown() {
  const diff = TARGET_UTC - Date.now();
  const el = (id) => document.getElementById(id);
  if (diff <= 0) {
    el("cd-days").textContent = "0";
    el("cd-hours").textContent = "00";
    el("cd-mins").textContent = "00";
    el("cd-secs").textContent = "00";
    el("cd-label").innerHTML = "<strong>DEC. 3 IS HERE.</strong> The count ends today. Be watching.";
    return;
  }
  const s = Math.floor(diff / 1000);
  el("cd-days").textContent = Math.floor(s / 86400);
  el("cd-hours").textContent = pad(Math.floor((s % 86400) / 3600));
  el("cd-mins").textContent = pad(Math.floor((s % 3600) / 60));
  el("cd-secs").textContent = pad(s % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- Ballot options (from the approved prototype / Phase 0) ---------- */
/* Weekly ballot (Ben's calls, Oct 12, 2026): THREE options total — TWO
   featured Laws from us + the Pitch Your Own card. Same two for everyone
   all week. Votes are tallied at week's end, the winner gets printed, and
   a fresh pair rotates in from BALLOT_OPTIONS. To rotate: change
   WEEKLY_FEATURED to the next two keys. */
const WEEKLY_FEATURED = ["property-taxes", "college"]; // Week of Oct 12, 2026
const BALLOT_OPTIONS = [
  { key: "property-taxes", law: "#009", title: "Property Taxes",   hook: "You rent from the county" },
  { key: "college",        law: "#005", title: "College Degrees",  hook: "Skip college, learn a trade" },
  { key: "tipping",        law: "#003", title: "Tipping Culture",  hook: "I'm not your HR department" },
  { key: "self-checkout",  law: "#008", title: "Self-Checkout",    hook: "I don't work here" },
  { key: "wfh",            law: "#004", title: "Working From Home", hook: "Your couch is not an office" },
  { key: "wages",          law: "#007", title: "Fast Food Wages",  hook: "That's not a raise, that's math" },
  { key: "ev",             law: "#006", title: "EV Mandates",      hook: "Don't plug in my truck" },
  { key: "hoa",            law: "#011", title: "HOAs",             hook: "$400 to be bullied" },
  { key: "straws",         law: "#010", title: "Paper Straws",     hook: "My straw dissolved" },
  { key: "left-lane",      law: "#012", title: "Left Lane Drivers", hook: "Get out of the left lane" },
  { key: "pitch",          law: "YOURS", title: "Pitch Your Own Law", hook: "Your idea, Frank's voice" },
];

const LANE_GROUPS = {
  "countdown":  "201157834936681683", // Countdown
  "franks-law": "201157869256573973", // Frank's Law Letter
  "trades":     "201157879582950726", // Trades
};
const PORCH_MAIN_GROUP = "201157819664172651";

const lawGrid = document.getElementById("law-grid");
const shownOptions = BALLOT_OPTIONS.filter((o) => o.key === "pitch" || WEEKLY_FEATURED.includes(o.key));
lawGrid.innerHTML = shownOptions.map((o) => `
  <label class="law-option">
    <input type="radio" name="law" value="${o.key}" ${o.key === "property-taxes" ? "checked" : ""}>
    <span class="law-card">
      <span class="law-num">Frank's Law ${o.law} <span class="law-pick">✓ Your pick</span></span>
      <span class="law-title">${o.title}</span>
      <span class="law-hook">&ldquo;${o.hook}&rdquo;</span>
    </span>
  </label>`).join("");

lawGrid.addEventListener("change", () => {
  const picked = document.querySelector('input[name="law"]:checked');
  document.getElementById("pitch-wrap").hidden = !(picked && picked.value === "pitch");
});

/* ---------- Shared submit path ---------- */
async function submitToMailerLite(payload, statusEl) {
  if (!MAILERLITE_FORM_ACTION) {
    /* Placeholder state — be honest with the visitor, log intent for debugging. */
    console.info("[Porch] MailerLite form endpoint not configured yet. Intended payload:", payload);
    statusEl.classList.add("error");
    statusEl.textContent =
      "Neighbor, the ballot box is built but the wire to Frank's list isn't hooked up yet — " +
      "your vote wasn't recorded. Check back shortly; the Porch is finishing the wiring.";
    return false;
  }
  try {
    const body = new URLSearchParams();
    body.set("fields[email]", payload.email);
    body.set("fields[name]", payload.name);
    if (payload.ballot_choice) body.set("fields[ballot_choice]", payload.ballot_choice);
    body.append("groups[]", PORCH_MAIN_GROUP);
    payload.groups.forEach((g) => body.append("groups[]", g));
    const resp = await fetch(MAILERLITE_FORM_ACTION, { method: "POST", body });
    if (!resp.ok) throw new Error("MailerLite returned " + resp.status);
    return true;
  } catch (err) {
    console.error("[Porch] signup failed:", err);
    statusEl.classList.add("error");
    statusEl.textContent = "Something jammed the ballot box. Try once more in a minute, neighbor.";
    return false;
  }
}

/* ---------- Ballot form ---------- */
document.getElementById("ballot-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("ballot-status");
  status.classList.remove("error");
  status.textContent = "";

  const picked = form.querySelector('input[name="law"]:checked');
  const firstName = form.first_name.value.trim();
  const email = form.email.value.trim();
  if (!picked) { status.classList.add("error"); status.textContent = "Pick a Law first — that's the whole point of a ballot."; return; }
  if (!firstName) { status.classList.add("error"); status.textContent = "Frank needs a first name to read on the Porch."; form.first_name.focus(); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.classList.add("error"); status.textContent = "That email doesn't look right — check it and cast again."; form.email.focus(); return; }

  let ballotChoice;
  if (picked.value === "pitch") {
    const pitch = document.getElementById("pitch-text").value.trim();
    if (!pitch) { status.classList.add("error"); status.textContent = "You picked 'pitch your own' — now pitch it. One sentence."; document.getElementById("pitch-text").focus(); return; }
    ballotChoice = "PITCH: " + pitch;
  } else {
    const opt = BALLOT_OPTIONS.find((o) => o.key === picked.value);
    ballotChoice = `Frank's Law ${opt.law} — ${opt.title}`;
  }

  /* One bundled opt-in (Ben's value-stack call, Oct 12, 2026): the single
     "join the Porch" checkbox is the whole package — every ballot signup
     joins all three lane groups. No separate lane picking. */
  if (!document.getElementById("join-porch").checked) {
    status.classList.add("error");
    status.textContent = "One box, neighbor — check it and you're on the Porch. That's the click that counts the ballot.";
    document.getElementById("join-porch").focus();
    return;
  }
  const groups = Object.values(LANE_GROUPS);

  status.textContent = "Counting your ballot…";
  const ok = await submitToMailerLite({ email, name: firstName, ballot_choice: ballotChoice, groups }, status);
  if (ok) {
    form.hidden = true;
    document.getElementById("ballot-success").hidden = false;
    document.getElementById("ballot-success").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

/* ---------- Trades Pledge form (signing = Trades lane) ---------- */
document.getElementById("pledge-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("pledge-status");
  status.classList.remove("error");
  const name = form.pledge_name.value.trim();
  const email = form.pledge_email.value.trim();
  if (!name) { status.classList.add("error"); status.textContent = "A pledge needs a name on it."; form.pledge_name.focus(); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.classList.add("error"); status.textContent = "That email doesn't look right — check it and sign again."; form.pledge_email.focus(); return; }
  status.textContent = "Putting your name on the board…";
  const ok = await submitToMailerLite({ email, name, ballot_choice: "Signed the Trades Pledge", groups: [LANE_GROUPS["trades"]] }, status);
  if (ok) {
    form.hidden = true;
    document.getElementById("pledge-success").hidden = false;
  }
});
