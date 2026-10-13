# Freedom Frank — The Porch

The official Freedom Frank hub: vote on the next Frank's Law, count down to
December 3, 2026, get the free Countdown Packet, and sign the Trades Pledge.
Plain static site (HTML/CSS/JS, no build step) — deploys as-is on Vercel.

Live store / packet: https://freedom-frank-shop.fourthwall.com

## Structure
- `index.html` — the whole page: hero + live Dec. 3 countdown, the Ballot,
  Why Dec. 3, The Count (Countdown Packet), Trades Pledge, follow row, footer.
- `styles.css` — red (#A61721) / black / cream (#FAF6EC); Oswald headers,
  Libre Franklin body, Special Elite accents.
- `app.js` — countdown timer + form logic.
- `assets/` — web-sized photos: `hero.jpg` (calendar board), `gate.jpg`
  (Fort Hood gate, Day 53), `day43.jpg` (Frank on the porch at night, Day 43).

## MailerLite wiring — ✅ LIVE (wired Oct 12, 2026)
The ballot and pledge forms deliver signups to MailerLite through the embedded
form **"Porch Ballot"** (`201169207867475059`), attached to group **Porch -
Main** (`201157819664172651`), double opt-in OFF, fields email / name /
"Ballot choice". `MAILERLITE_FORM_ACTION` in `app.js` holds the form's POST
endpoint; the submit handlers send `fields[email]`, `fields[name]`,
`fields[ballot_choice]`, and `groups[]` (Porch - Main + checked lanes:
Countdown `201157834936681683`, Frank's Law Letter `201157869256573973`,
Trades `201157879582950726`). Joining Porch - Main fires the welcome workflow
(`201158336894207617`). Verified end-to-end Oct 12, 2026.

**Never put a MailerLite API token in this repo.** Embedded-form POST URLs are
public by design; API keys are not.
