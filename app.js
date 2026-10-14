/* Freedom Frank — The Porch. Countdown + free packet signup logic. */
"use strict";

/* ============================================================
   MAILERLITE WIRING — simplified free-packet offer, Oct 13, 2026
   ------------------------------------------------------------
   The existing MailerLite embedded-form endpoint is retained.
   The simplified homepage form sends only the visitor's email,
   plus the fixed source value "Free Packet" in the existing
   ballot_choice field when MailerLite records the submission.
   Subscriptions join Porch - Main (which fires the welcome
   workflow) and Countdown only.
   This POST URL is public by design — never put an API token here.
   ============================================================ */
const MAILERLITE_FORM_ACTION = "https://assets.mailerlite.com/jsonp/2706155/forms/201169207867475059/subscribe";
const PORCH_MAIN_GROUP = "201157819664172651";
const COUNTDOWN_GROUP = "201157834936681683";
const PACKET_SOURCE = "Free Packet";
const PORCH_LETTER_GROUP = "201157869256573973";
const TRADES_GROUP = "201157879582950726";
const FOURTHWALL_PACKET_URL = "https://freedom-frank-shop.fourthwall.com/products/the-count-freedom-frank-countdown-packet";

/* Page 2 only: these rows are rendered by renderPacketSuccess() after a
   successful Step 1 signup. The ballot row is gone; the total below is
   computed from exactly the four rows shown. */
const PAGE_TWO_STACK = [
  {
    label: "The Countdown Packet — all 137 pages, printed for the fridge",
    image: "assets/vs-packet.jpg",
    alt: "The Countdown Packet as a printed booklet on the porch table",
    value: 10,
  },
  {
    label: "The Porch Letter — one letter a week from Frank",
    image: "assets/vs-letter.jpg",
    alt: "A handwritten Porch Letter and lantern on the porch table",
    value: 20,
  },
  {
    label: "First to know — merch drops and Porch-only deals before the public hears a word",
    image: "assets/vs-merch.jpg",
    alt: "Frank's flag hat on the porch table — first merch, Porch members hear first",
    value: 15,
  },
  {
    label: "Members-only videos and Porch nights as they open",
    image: "assets/vs-videos.jpg",
    alt: "A phone on the porch rail playing a Frank video at dusk",
    value: 25,
  },
];

/* ---------- Countdown to Dec 3, 2026, 00:00 America/New_York ---------- */
/* December in New York is EST (UTC-5), so the target is 05:00 UTC. */
const TARGET_UTC = Date.UTC(2026, 11, 3, 5, 0, 0);

function pad(n) { return String(n).padStart(2, "0"); }
function tickCountdown() {
  const days = document.getElementById("cd-days");
  if (!days) return;
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

/* ---------- Sticky mobile CTA ---------- */
const stickyCta = document.getElementById("sticky-cta");
const packetSection = document.getElementById("get-packet");
let packetInView = false;
let packetDone = false;

function updateSticky() {
  if (!stickyCta) return;
  const show = !packetDone && !packetInView && window.scrollY > 520;
  stickyCta.hidden = !show;
  document.body.classList.toggle("sticky-on", show);
}

if (stickyCta && packetSection) {
  new IntersectionObserver((entries) => {
    packetInView = entries[0].isIntersecting;
    updateSticky();
  }, { threshold: 0.08 }).observe(packetSection);
  window.addEventListener("scroll", updateSticky, { passive: true });
  updateSticky();
}

/* ---------- MailerLite submit paths ---------- */
async function postToMailerLite(body, statusEl, errorText) {
  if (!MAILERLITE_FORM_ACTION) {
    console.info("[Porch] MailerLite form endpoint not configured. Intended payload:", body.toString());
    statusEl.classList.add("error");
    statusEl.textContent = "Neighbor, the wire to Frank's list isn't hooked up yet — that wasn't recorded. Check back shortly.";
    return false;
  }

  try {
    const resp = await fetch(MAILERLITE_FORM_ACTION, { method: "POST", body });
    if (!resp.ok) throw new Error("MailerLite returned " + resp.status);
    return true;
  } catch (err) {
    console.error("[Porch] MailerLite signup failed:", err);
    statusEl.classList.add("error");
    statusEl.textContent = errorText;
    return false;
  }
}

async function submitPacketSignup(email, statusEl) {
  const body = new URLSearchParams();
  body.set("fields[email]", email);
  body.set("fields[ballot_choice]", PACKET_SOURCE);
  body.append("groups[]", PORCH_MAIN_GROUP);
  body.append("groups[]", COUNTDOWN_GROUP);
  return postToMailerLite(
    body,
    statusEl,
    "Something went wrong sending your packet request. Try once more in a minute, neighbor."
  );
}

async function submitExtras(email, groups, statusEl) {
  const body = new URLSearchParams();
  body.set("fields[email]", email);
  groups.forEach((group) => body.append("groups[]", group));
  return postToMailerLite(
    body,
    statusEl,
    "Something went wrong adding your extras. Your packet is still yours — try the extras once more in a minute."
  );
}

/* ---------- Page 2: claim + stack + optional extras ---------- */
function renderPacketSuccess(success, email) {
  const total = PAGE_TWO_STACK.reduce((sum, item) => sum + item.value, 0);
  const stackRows = PAGE_TWO_STACK.map((item) => `
    <li>
      <span class="vs-item">${item.label}</span>
      <span class="vs-media">
        <img class="vs-thumb" src="${item.image}" alt="${item.alt}" loading="lazy">
        <span class="vs-value"><s>$${item.value}</s><span class="vs-free">FREE</span></span>
      </span>
    </li>`).join("");

  success.innerHTML = `
    <h3>You're in. Your packet is on its way. 🪑</h3>
    <p>Check your inbox — Frank's welcome email is headed there now. It carries your Countdown Packet and the way to begin.</p>
    <p>Don't want to wait for the email?</p>
    <p class="success-actions"><a class="btn btn-red" href="${FOURTHWALL_PACKET_URL}" target="_blank" rel="noopener">CLAIM YOUR PACKET NOW</a></p>

    <div class="value-stack">
      <h3 class="vs-title">Now that you're in</h3>
      <p class="vs-sub">Your packet comes first. Here's what else is waiting for you on the Porch:</p>
      <ul class="vs-list">${stackRows}</ul>
      <p class="vs-total">Total value: <s>$${total}</s> <span class="vs-free">FREE</span> — <strong>yours, all of it.</strong></p>
    </div>

    <div class="extras-panel">
      <h3>Want the extras too?</h3>
      <p>Optional — your packet is already yours either way. Skip this and you're done.</p>
      <label class="check extra-check">
        <input type="checkbox" class="extra-group" value="${PORCH_LETTER_GROUP}">
        <span>Also send me the weekly Porch Letter</span>
      </label>
      <label class="check extra-check">
        <input type="checkbox" class="extra-group" value="${TRADES_GROUP}">
        <span>Also send me the Trades word</span>
      </label>
      <button class="btn btn-dark extras-button" type="button">ADD MY EXTRAS</button>
      <p class="form-status extras-status" role="status" aria-live="polite"></p>
    </div>

    <p class="signoff">I'm Freedom Frank, and I approve this message.</p>`;

  const extrasButton = success.querySelector(".extras-button");
  const extrasStatus = success.querySelector(".extras-status");
  extrasButton.addEventListener("click", async () => {
    const selectedGroups = Array.from(success.querySelectorAll(".extra-group:checked"))
      .map((input) => input.value);

    extrasStatus.classList.remove("error");
    extrasStatus.textContent = "";

    if (!selectedGroups.length) {
      extrasStatus.classList.add("error");
      extrasStatus.textContent = "Pick one or both extras — or just claim your packet above. Skipping is fine.";
      return;
    }

    const originalText = extrasButton.textContent;
    extrasButton.disabled = true;
    extrasButton.textContent = "ADDING YOUR EXTRAS…";
    extrasStatus.textContent = "Adding your extras…";

    const ok = await submitExtras(email, selectedGroups, extrasStatus);
    if (ok) {
      extrasStatus.textContent = "Extras added. You're all set, neighbor.";
      success.querySelectorAll(".extra-group").forEach((input) => { input.disabled = true; });
      extrasButton.textContent = "EXTRAS ADDED ✓";
    } else {
      extrasButton.disabled = false;
      extrasButton.textContent = originalText;
    }
  });
}

/* ---------- Email-only packet forms ---------- */
document.querySelectorAll(".packet-signup-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const wrap = form.closest(".packet-form-wrap");
    const emailInput = form.querySelector(".packet-email");
    const status = form.querySelector(".packet-status");
    const success = wrap ? wrap.querySelector(".packet-success") : null;
    const button = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    status.classList.remove("error");
    status.textContent = "";

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      status.classList.add("error");
      status.textContent = "That email doesn't look right — check it and try again.";
      emailInput.focus();
      return;
    }

    const originalButtonText = button.textContent;
    button.disabled = true;
    button.textContent = "SENDING YOUR PACKET…";
    status.textContent = "Sending your packet request…";

    const ok = await submitPacketSignup(email, status);
    if (ok) {
      packetDone = true;
      updateSticky();
      form.hidden = true;
      if (success) {
        renderPacketSuccess(success, email);
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  });
});
