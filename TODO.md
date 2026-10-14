# Labcircle patient MVP outcomes

- [x] **Patient service discovery** — Patients can switch between home blood collection and scan & imaging, search/filter the demo catalogue, read preparation guidance, and add/remove items. Browse-stage prices are hidden.
- [x] **Review-to-demo-booking journey** — The guided flow validates a six-digit demo PIN/locality, selects a date/time, reveals the illustrative quote only at review, then stores an explicitly local demo booking with no real reservation or payment.
- [x] **Booking follow-up** — Saved demo visits have a prototype timeline/status; reports and account screens use honest empty/demo states and contain no fabricated patient records.
- [x] **Responsive and accessible interaction** — Desktop and 390px mobile layouts checked; mobile overflow assertion passes with the player visible; semantic controls, keyboard-visible focus, reduced-motion support and inline validation are implemented.
- [x] **Website walkthrough video** — A silent 30-second 1280×720 H.264 walkthrough uses real app captures, carries prototype/sample-only disclosures, and is embedded on the home page with native playback controls.
- [x] **Prototype handoff** — README explains setup, behavior, browser-local data boundaries, missing integrations, video regeneration and next-launch steps; `LAUNCH_PLAN.md` prioritizes production blockers.
- [x] **Verified local implementation** — All 8 automated tests, TypeScript diagnostics and production build pass; the work is ready as a local feature-branch commit.
- [ ] **Public GitHub publication** — The selected remote is an empty **public** repository. No source or video has been pushed; keep it unpublished until the user approves the public upload.

> Production launch is still blocked on authentication and consent, a server-backed catalogue and atomic provider inventory, authoritative pricing/payment, fulfilment operations, secure reports, notifications, monitoring and compliance approval. See `LAUNCH_PLAN.md`.
