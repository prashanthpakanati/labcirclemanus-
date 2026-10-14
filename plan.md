# Labcircle patient booking demo — implementation plan

## Product direction
Labcircle helps patients find diagnostic tests, understand preparation requirements, arrange home sample collection or scan visits, and follow their bookings. This first development slice prioritizes the patient booking loop because it is the clearest user value and a prerequisite for a controlled pilot. It is an interactive prototype only: no real patient records, lab inventory, clinical advice, live prices, payment processing, or appointments are created.

## MVP outcomes
1. **Discover services:** Search and filter sample blood tests and scan services; browse-stage prices stay hidden. Preparation guidance is descriptive and directs patients to confirm provider-specific instructions.
2. **Complete a demo booking journey:** Choose service, add tests, provide a locality/PIN code, select a date and slot, see a clearly labeled illustrative quote at review only, and confirm a local demo booking. Show that no payment/real appointment has occurred.
3. **Follow up:** See demo booking status/history and clear empty states for reports and account. Do not show fabricated reports or claim secure live storage.
4. **Launch clarity:** Use visible prototype labels and document production dependencies (identity, provider serviceability/catalogue, concurrency-safe inventory, live server quotes, payment/wallet integration, notifications, report storage/access controls, analytics, accessibility and clinical/legal reviews).

## Architecture
- React 18 + TypeScript + Vite; client-side routes are simple tab state and URL hash-free navigation.
- A small domain module holds typed catalogue, preparation notes, cart/booking models, demo quote logic, and local-storage persistence.
- The UI is patient-first and responsive. All prototype data stays in the browser; no API or database is implied.
- Vitest covers the quote boundary and local booking state behavior.

## Project structure
- `src/App.tsx`: navigation and patient journey screens.
- `src/domain.ts`: catalogues, types and deterministic demo booking/quote helpers.
- `src/style.css`: design tokens, responsive layout and accessible motion behavior.
- `src/main.tsx`: React bootstrap.
- `src/domain.test.ts`: core prototype behavior tests.
- `README.md`, `TODO.md`: scope, run steps, limitations and outcomes.

## Design direction
- **Design movement:** Warm clinical minimalism with editorial wayfinding; clear enough for a healthcare task, never hospital-cold.
- **Core principles:** Calm first; disclose what is and is not real; keep the next step obvious; make critical choices accessible on small screens.
- **Color philosophy:** Soft parchment keeps long flows comfortable; dark forest-green anchors trust and primary actions; fresh mint marks progress; a small citrus accent provides urgency and warmth.
- **Layout paradigm:** Left-aligned, task-focused workspace with a wide booking canvas, compact context rail, and a persistent mobile action dock—not a centered generic landing-page grid.
- **Signature elements:** A simple orbit/plus brand mark; numbered booking-progress rail; softly tinted slot tiles and status chips.
- **Interaction philosophy:** Direct manipulation with visible selections, helpful inline validation, clear back navigation, and no destructive external actions.
- **Animation:** Short, subtle fades and selection transitions only; honor `prefers-reduced-motion`.
- **Typography:** Inter/system sans for utility and readability; Georgia/system serif reserved for the home hero headline; clear heading/body/helper hierarchy.
- **Brand essence:** “Labcircle makes local diagnostic care easier to navigate and book.” Personality: reassuring, capable, plain-spoken.
- **Brand voice:** Clear and warm; CTAs name the action. Example: “Find a test” / “Review your visit before you book.”
- **Wordmark & logo:** Lowercase `labcircle` paired with a custom CSS orbit/plus symbol, not a generic medical cross.
- **Signature brand color:** Forest teal `#176A57`.

## Boundaries
A test list, quote, slot, booking ID, report and price in this build are demo content. Nothing here is medical advice or a clinical recommendation. Do not connect a live payment provider or claim launch readiness without the corresponding server, security, operational and compliance work.