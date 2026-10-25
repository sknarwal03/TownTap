# TownTap — Master Project Status

**Updated:** 2026-10-25
**Current cloud workspace:** `/workspace/TownTap`
**Release status:** Alpha implementation is active; production release is not ready. No live project, production OTP, deployment, billing, or production resource was used.

**Current checkpoint:** Core Alpha browser regression and business verification/moderation emulator integration coverage are implemented, with saved-reference and verification lifecycle fixes. Production release gates remain open.

## Product baseline

TownTap is a bilingual digital card, private smart phonebook, and local business discovery web app. The existing Vite shell and the approved twelve screens/five navigation areas are preserved. Profiles and individual fields default to Private. The UX/PRD remain the product baseline; implementation assumptions are recorded in `docs/12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md` and need product review before production.

## Implemented

- Vite responsive app with all twelve screen routes, five navigation areas, Hindi/English labels, and saved language preference.
- Firebase web SDK configured for Auth, Firestore, Functions, and Storage emulators. Development builds block live Firebase by default. Auth Emulator messaging is explicitly identified as local test behavior.
- Callable Functions for private-by-default profile create/edit/list, server-projected card reads, versioned/revocable share links, QR creation in the client, saved contacts and saver-private details, live privacy-filtered saved views, directory search, reports, verification requests/reviews, and report moderation.
- Public business directory projections are created transactionally from eligible Public business profiles. Unspecified city search prioritizes Gohana and Sonipat.
- Firestore client reads/writes deny by default. Storage rules restrict verification evidence to the owner’s pending request and moderator review; server approval checks size and file signatures.
- PWA manifest/icon and network-only, no-store service worker; basic loading, error, offline, and reduced-motion/accessibility support.
- Pending verification request references now survive profile edits; concurrent submissions reuse one request, and approval rechecks the current active business inside its transaction.
- Implementation/setup guide: `docs/12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md`.

## Implementation assumptions and known limits

- This is an emulator-capable Alpha implementation, not production-ready service configuration. Firestore data is exclusively server-mediated because Admin SDK bypasses Firestore Security Rules.
- Smart Phonebook currently permits saving Public cards only. One active link per profile is enforced by a shared version. Rate limits are provisional code defaults, not policy.
- Verification/moderation functions check a Firebase `moderator: true` custom claim, but production claim assignment, reviewer operations, evidence retention/deletion, account support/recovery, and full profile restriction workflows are not configured.
- Existing profile `status` checks and link-version checks take effect on every live card/directory/saved view. Firestore has an explicit default deny. Production IAM, App Check, anti-abuse, retention, backup/restore, observability, and incident procedures need independent review.
- Callable integration tests cover core card/privacy/share/saved-contact flows and business evidence/review, moderator authorization, report dismissal/unpublish and audit records. Business/moderation browser E2E remains missing. Core Alpha browser journeys and generated QR decoding are now covered at desktop/mobile Chromium viewports; production OTP, physical devices and screen readers remain unverified.
- Cloud Functions emulator runs under the declared Node 22 runtime. Frontend/rules tooling uses Node 24, matching the Firebase web SDK 13 and rules-unit-testing 6 engine requirements.
- The previous workstation audit reported transitive dependency advisories in the root audit graph. `npm audit fix` did not offer a compatible fix and proposed a breaking downgrade to Firebase 9.14.0; no forced downgrade or override was applied. Resolve via verified upstream package update before release.
- Build warns that the bundled JavaScript is about 650 kB minified; split heavy SDK/code paths before production performance review.

## Git checkpoint

The cloud checkout has committed baseline `1ebd169ce68e8a04bdd297559368352ac9668f80`. The development checkpoint adds core Alpha browser regression coverage, business/moderation integration tests, and the associated privacy and verification lifecycle fixes. No production deployment has been performed.

## Verification results

| Check | Result | Notes |
|---|---|---|
| `npm test` | PASS, 11/11 | App-shell and domain/privacy projection checks. |
| `npm run test:functions` | PASS, 7/7 | Domain logic. These are unit tests, not Cloud Functions integration tests. |
| `npm run test:rules` | PASS, 3/3 | Firestore default-deny and Storage evidence checks against local Auth/Firestore/Storage emulators. Emulator logs confirm expected denied requests. |
| `npm run test:functions:emulator` | PASS, 10/10 | 2 core card and 8 business/moderation tests against local Auth/Firestore/Functions/Storage; Node 22 Functions. Covers real token authorization, evidence, badges, audit records, concurrent requests, lifecycle changes and unpublish restrictions. |
| `npm run build` | PASS | Vite production build; 650 kB minified JS chunk warning remains. |
| Chrome UI smoke | PASS, limited | Welcome, Discover and Settings render; Hindi switch updates labels/title. Desktop, signed-out only. |
| `npm audit --omit=dev --audit-level=high` | Historical FAIL, 4 reported high; not rerun in this change | Reported transitive Firebase/Firestore dependency advisory. Compatible audit fix unavailable; no forced breaking dependency change. |
| Core Alpha browser E2E | PASS, 4/4 | Real local emulator OTP and core card/share/saved/privacy flow plus guest-route/state checks at desktop and mobile Chromium viewports; generated QR decoded independently. |
| Live OTP / physical devices / screen readers | NOT RUN | Production and device-specific checks remain open. |

The emulator results verify only the local rules and application checks run above; they do not prove production setup or security.

## Next autonomous continuation point

1. Expand browser coverage to business/moderation workflows, full accessibility and physical-device checks. Core Alpha, twelve guest routes, QR decoding, invalid phone input and offline indication now have browser regression coverage.
2. Resolve or explicitly accept the audit findings with a compatible, tested dependency update; reduce bundle size.
3. Reconcile remaining OTP/recovery, moderation, data retention, and account lifecycle decisions with `docs/10-OPEN-DECISIONS.md`.
4. Complete release operations and independent security review before any live project configuration or deployment.
