# Labcircle — launch roadmap

## Current delivery: patient booking demo

The selected GitHub repository was empty, so this delivery creates a fresh patient-facing prototype rather than restoring the earlier task's sandbox code. The demo now covers service discovery, separate home-blood and scan journeys, preparation guidance, locality/PIN and sample schedule selection, an illustrative checkout-only quote, browser-local demo bookings, and an honest reports/account experience.

These are demonstration states only. There is no live catalogue, provider serviceability check, slot inventory, identity system, payment, report storage, or lab/scan-centre integration. The demo must not accept real patient data or be represented as ready to accept bookings.

## Before any controlled pilot (P0 — launch blockers)

| Priority | Improvement | Release condition |
|---|---|---|
| P0 | Restore/establish the production application foundation in the selected repository: server, database migrations, environments and deployment pipeline. | Reproducible build and rollback; secrets are runtime-only; development/test data cannot touch production patient data. |
| P0 | Patient identity, consent, role permissions and account recovery. | Patients can see only their own profile/bookings/reports; staff scopes are explicit; security and privacy review is signed off. |
| P0 | Provider-backed catalogue, PIN-level serviceability and actual slot inventory. | Data comes from contracted partners; holds and confirmations are atomic and expire safely; no overselling in concurrent booking attempts. |
| P0 | Server-authoritative checkout quote and payment lifecycle. | The client cannot set the total; quote is bound to patient, items, fees and a short expiry; payment orders are created server-side; signed callbacks/webhooks are idempotent; refund and reconciliation cases are traceable. |
| P0 | Operational fulfilment for home collection and scan partners. | Staff can accept/assign, confirm, check in, complete, cancel and report exceptions; patients receive truthful booking status updates. |
| P0 | Secure clinical report hand-off. | Reports remain private, use encrypted managed storage, require an authorized patient session, use short-lived download access and generate access audit events. |
| P0 | Patient help, notifications, observability and incident readiness. | Booking/payment/report events are delivered through approved providers, failures are visible to operations, and there are support, backup/restore and incident runbooks. |
| P0 | Go-live content and compliance review. | Provider-approved test names/preparation text, consent/privacy/retention language, accessibility/security review and local legal/compliance approval are complete. |

## High-value patient improvements after a safe pilot (P1)

1. **Household profiles:** Save family members with explicit patient/guardian permissions; choose the visit recipient before booking and avoid mixing two people's records or reports.
2. **Preparation reminders:** Send provider-approved fasting/preparation instructions and an appointment reminder, with clear controls to reschedule or contact support. Do not infer clinical instructions.
3. **Status timeline:** Show useful, timestamped milestones such as provider accepted, collector/centre confirmed, visit complete and report ready; every state should reflect a real backend event.
4. **Repeat booking:** Rebook past services from the history while revalidating today's price, location and inventory; never silently repeat a stale quote.
5. **Accessible multilingual journeys:** Prioritize local language selection, readable type, keyboard and screen-reader use, and plain-language service explanations.
6. **Support and exception handling:** Let patients report a late visit, address change or cancellation and see an accountable resolution path.

## Product guardrails

- Keep individual blood-test prices hidden during browse if that remains the approved Labcircle policy; show only a fresh, server-authoritative payable total at review.
- Separate blood collection from imaging fulfilment because the location, slot and operating workflows differ.
- Present catalogue descriptions and preparation notes as provider-supplied information, not diagnosis or personalized medical advice.
- Label prototype content and demo quotes. Never fabricate partner availability, test results or report documents.
- Instrument conversion and service reliability using data minimization; do not add analytics that expose health information unnecessarily.

## Suggested release sequence

**Phase 1 — foundation:** Confirm pilot geography/partners; establish the deployed backend, migrations, auth/consent and non-production test environment.

**Phase 2 — book safely:** Connect catalogue and serviceability; implement real inventory holds, authoritative quotes and a sandboxed payment lifecycle; complete staff fulfilment views.

**Phase 3 — close the care loop:** Implement notifications, cancellations/refunds, private reports, patient support and monitoring.

**Phase 4 — controlled pilot:** Rehearse payment reconciliation, duplicate/timeout cases, report permissions, accessibility and incident response with synthetic data; obtain provider and compliance approvals before inviting a small pilot cohort.

**Phase 5 — improve from evidence:** Measure abandonment, successful fulfilment, cancellations, report delivery and support resolution; prioritize household profiles and reminder improvements from observed patient needs.
