# TownTap — Master Project Status

**Updated:** 2026-10-24  
**Canonical workspace:** `E:\Projects\TownTap`  
**Release status:** Alpha implementation is active; production release is not ready. No live project, production OTP, deployment, billing, or production resource was used.

**Approximate implementation progress:** 75% of the feasible emulator-backed Alpha build. Core backend/UI workflows and rule checks now run locally; the remaining quarter is concentrated in browser/device verification, untested operational flows, accessibility/performance work, and production review/configuration.

## Product baseline

TownTap is a bilingual digital card, private smart phonebook, and local business discovery web app. The existing Vite shell and the approved twelve screens/five navigation areas are preserved. Profiles and individual fields default to Private. The UX/PRD remain the product baseline; implementation assumptions are recorded in `docs/12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md` and need product review before production.

## Implemented

- Vite responsive app with all twelve screen routes, five navigation areas, Hindi/English labels, and saved language preference.
- Firebase web SDK configured for Auth, Firestore, Functions, and Storage emulators. Development builds block live Firebase by default. Auth Emulator messaging is explicitly identified as local test behavior.
- Callable Functions for private-by-default profile create/edit/list, server-projected card reads, versioned/revocable share links, QR creation in the client, saved contacts and saver-private details, live privacy-filtered saved views, directory search, reports, verification requests/reviews, and report moderation.
- Public business directory projections are created transactionally from eligible Public business profiles. Unspecified city search prioritizes Gohana and Sonipat.
- Firestore client reads/writes deny by default. Storage rules restrict verification evidence to the owner’s pending request and moderator review; server approval checks size and file signatures.
- PWA manifest/icon and network-only, no-store service worker; basic loading, error, offline, and reduced-motion/accessibility support.
- Implementation/setup guide: `docs/12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md`.

## Implementation assumptions and known limits

- This is an emulator-capable Alpha implementation, not production-ready service configuration. Firestore data is exclusively server-mediated because Admin SDK bypasses Firestore Security Rules.
- Smart Phonebook currently permits saving Public cards only. One active link per profile is enforced by a shared version. Rate limits are provisional code defaults, not policy.
- Verification/moderation functions check a Firebase `moderator: true` custom claim, but production claim assignment, reviewer operations, evidence retention/deletion, account support/recovery, and full profile restriction workflows are not configured.
- Existing profile `status` checks and link-version checks take effect on every live card/directory/saved view. Firestore has an explicit default deny. Production IAM, App Check, anti-abuse, retention, backup/restore, observability, and incident procedures need independent review.
- Focused callable integration tests cover core card/privacy/share/saved-contact flows. Business verification/report/moderation end-to-end coverage and real-browser E2E are still missing. Browser flows, OTP production, QR decode, and mobile screen-reader behavior remain unverified.
- The local machine runs Node 24 while Functions declare Node 22; Firebase Functions Emulator falls back to host Node 24. Emulator passes are useful integration evidence but should be repeated under the supported Node 22 runtime.
- npm reports transitive dependency advisories in the root audit graph. `npm audit fix` did not offer a compatible fix and proposed a breaking downgrade to Firebase 9.14.0; no forced downgrade or override was applied. Resolve via verified upstream package update before release.
- Build warns that the bundled JavaScript is about 650 kB minified; split heavy SDK/code paths before production performance review.

## Git checkpoint

The repository has no commits; all working files are untracked. `.git` is read-only in this environment. No history, index, or user work was changed, and no commit/branch checkpoint could be created. Files were edited additively in the canonical workspace.

## Verification results

| Check | Result | Notes |
|---|---|---|
| `npm test` | PASS, 11/11 | App-shell and domain/privacy projection checks. |
| `npm run test:functions` | PASS, 7/7 | Domain logic. These are unit tests, not Cloud Functions integration tests. |
| `npm run test:rules` | PASS, 3/3 | Firestore default-deny and Storage evidence checks against local Auth/Firestore/Storage emulators. Emulator logs confirm expected denied requests. |
| `npm run test:functions:emulator` | PASS, 2/2 | Callable integration against local Auth/Firestore/Functions/Storage emulators; Node 24 host fallback noted above. |
| `npm run build` | PASS | Vite production build; 650 kB minified JS chunk warning remains. |
| Chrome UI smoke | PASS, limited | Welcome, Discover and Settings render; Hindi switch updates labels/title. Desktop, signed-out only. |
| `npm audit --omit=dev --audit-level=high` | FAIL, 4 reported high | Reported transitive Firebase/Firestore dependency advisory. Compatible audit fix unavailable; no forced breaking dependency change. |
| Full browser E2E / live OTP | NOT RUN | The local UI smoke did not cover signed-in workflows, mobile viewports, QR decode, or production Firebase authorization/configuration. |

The emulator results verify only the local rules and application checks run above; they do not prove production setup or security.

## Next autonomous continuation point

1. Expand emulator integration coverage to moderator authorization, verification evidence/review, and report lifecycle.
2. Run the 12 routes in a browser at desktop/mobile sizes and verify accessibility, QR decoding, form errors, and offline states.
3. Resolve or explicitly accept the audit findings with a compatible, tested dependency update; reduce bundle size.
4. Reconcile remaining OTP/recovery, moderation, data retention, and account lifecycle decisions with `docs/10-OPEN-DECISIONS.md`.
5. Complete release operations and independent security review before any live project configuration or deployment.
