# Labcircle patient booking prototype

A mobile-first, interactive patient journey for discovering diagnostic services and arranging a **demo** home sample collection or scan visit.

## Run locally

```bash
npm install
npm run dev
```

Verify changes with:

```bash
npm test
npm run typecheck
npm run build
```

## What is implemented

- Patient-first home and booking navigation.
- Searchable demo blood-test and scan catalogues with preparation notes.
- Browse-stage prices hidden; a clearly marked illustrative demo quote appears at review only.
- A guided demo flow for service, locality/PIN, date/time, review and confirmation.
- Browser-local demo booking history and honest empty report/account states.
- Responsive layout, keyboard focus states, reduced-motion support and inline form validation.

## Important limitations

This is **not a live healthcare booking service**. Demo data and bookings live in the current browser only. The app does not authenticate users, check a provider's actual service area or inventory, create lab/scan appointments, charge or refund payments, deliver notifications, store or serve patient reports, give medical advice, or protect sensitive health data. The quote is illustrative and not an offer or final price. The displayed times are not live availability.

Do not use real patient information in this prototype. Do not publish it as a production booking service.

## Recommended path to a controlled launch

1. Confirm target geography, pilot labs/scan partners, exact catalogue and provider-approved preparation guidance.
2. Build authenticated patient/household profiles and role-based staff operations.
3. Replace browser data with a server-authoritative catalogue, location serviceability, slot inventory and atomic time-limited reservations.
4. Implement secure quotations and an approved payment integration with signed webhooks, idempotency, refunds and reconciliation.
5. Add consent, privacy/retention policy, encrypted private report storage, access auditing, and least-privilege provider/admin roles.
6. Add booking/payment/report notifications, support operations, observability, incident response and backup/restore.
7. Complete security, accessibility, clinical-content, legal/compliance and end-to-end pilot reviews before accepting bookings.


## Website walkthrough video

The homepage embeds `public/labcircle-patient-demo.mp4`, a **silent, 30-second, 1280×720** product walkthrough with a matching poster image. It uses real browser captures of the prototype and labels sample data/quotes as non-live. The player uses explicit, accessible browser controls rather than autoplay.

To regenerate it, start the local app on port `4173` and run `python3 scripts/render_site_video.py --url http://127.0.0.1:4173`. The renderer uses local Chromium/Playwright, Pillow, FFmpeg and FFprobe; it also checks for horizontal overflow at a 390px mobile viewport.
