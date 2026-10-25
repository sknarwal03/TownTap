# 12 — Firebase Implementation and Local Testing

**Status:** implementation draft for emulator-backed development. This is not production approval or evidence that a live Firebase project is configured.

## Start locally

1. Install the root and Functions dependencies with `npm ci` and `npm --prefix functions ci`.
2. Create ignored `.env.emulator.local` with the demo-only values below. `.env.emulator` is not checked in. Preserve any existing local configuration.
3. Run `npm run firebase:emulators` in one terminal and `npm run dev:emulator` in another. The app connects only to Auth, Firestore, Functions, and Storage emulators in this mode.
4. Phone sign-in uses Firebase Auth Emulator. No SMS is sent; inspect the emulator terminal for its test code. The Auth Emulator does not model production anti-abuse limits.
5. Run `npm test`, `npm run test:functions`, `npm run test:rules`, and `npm run test:functions:emulator` to run the automated checks. The Functions integration suites exercise core card/privacy/saved flows plus moderator authorization, business evidence/review, report dismissal/unpublish and audit records. Emulator checks do not prove deployed IAM, rules, billing, quotas, or live OTP configuration.

The supported local development path is the emulator mode above; development builds block live Firebase connections. Production builds require the real web project settings at build time. Never put Admin SDK credentials or service account keys in Vite variables.

## Server data model

All application data is accessed through callable Cloud Functions. Firestore client rules deny every read and write, including owner reads. Admin SDK calls bypass Firestore rules, so every function validates identity, ownership, role, lifecycle, arguments, and response projection itself.

| Collection | Purpose and access |
|---|---|
| `profiles/{profileId}` | Canonical owner profile; full fields and their audiences; status, verification state, link version, timestamps. Never client-readable. |
| `businessDirectory/{profileId}` | Small public-only projection for active, opted-in public businesses; maintained in the same transaction as profile writes/reviews. |
| `shareLinks/{sha256(token)}` | Token digest, profile ID, current version and creator. Raw 256-bit token is returned once and never stored. One active link version per profile. |
| `users/{uid}/savedContacts/{profileId}` | Saver-owned saved reference, private notes, nickname, tags, and timestamp. Reads join against the current profile and omit unavailable/restricted cards. |
| `reports/{reportId}` | Reporter, target, reason, status and moderation outcome. Moderator access is enforced by custom claim in Functions. |
| `verificationRequests/{requestId}` | Business evidence request and review state. Evidence bytes live in private Storage. |
| `moderationAudit/{eventId}` | Append-only function-created actions for verification review and report resolution. Direct client access is denied. |
| `rateLimits/{hash(uid:action)}` | Per-account request counters with TTL cleanup. Hashing avoids storing a plain UID in this operational key. |

Required composite indexes and TTL field are declared in `firestore.indexes.json`. Firestore and Storage rules deny by default. Storage permits only an authenticated owner upload to their own pending evidence request (PNG/JPEG/WebP/PDF, up to 10 MiB), and owner/moderator reads. Verification approval checks size, declared content type, and file signature.

## Privacy and sharing behavior

- Profile visibility defaults to Private; every field audience also defaults to Private.
- Public reads receive only Public fields. Valid link reads receive Public and Link-only fields. Owner reads receive values and audience settings.
- Private profiles never resolve to another user. Unlisted profiles require a current token. Every read checks current profile status and link version, so restrictions and revocation block later reads.
- Share links use random 32-byte URL-safe tokens. Only a SHA-256 digest is stored. Issuing a new link invalidates the previous link; revoke increments the version.
- Directory projections contain eligible Public business fields only. Discovery defaults to the Gohana/Sonipat pilot and can search other explicit cities.
- Smart Phonebook currently permits saving Public cards only. It stores a reference, not a snapshot; each list response uses the current allowed projection. This conservative policy and the single-active-link rule are implementation assumptions pending product review.

## Implemented callable surface

`upsertProfile`, `listMyProfiles`, `resolveCard`, `createShareLink`, `revokeShareLinks`, `saveContact`, `updateSavedContact`, `listSavedContacts`, `removeSavedContact`, `searchBusinesses`, `submitReport`, `requestBusinessVerification`, `listVerificationQueue`, `reviewBusinessVerification`, `listModerationQueue`, and `resolveReport`.

Moderator functions check the Firebase Auth `moderator: true` custom claim. Production claim assignment, reviewer identity checks, evidence retention/deletion, legal/privacy retention policy, abuse thresholds, email/support operations, account recovery, and a full account restriction workflow still need owner decisions and live operational setup. Rate limits in Functions are initial conservative engineering defaults, not approved policy and not production abuse controls.

## Test and release boundaries

Automated domain tests cover private defaults, schema validation, field projections, link restriction logic, directory projection, and pilot ranking. App-shell tests cover the preserved 12 screens, five nav areas, emulator wiring, and network-only service worker. Rule tests exercise default-deny Firestore and evidence Storage paths against local emulators. Callable Functions emulator integration covers core card/privacy/share/saved-contact behavior and business verification/report/moderation lifecycles. Core Alpha browser E2E is covered below; business/moderation browser workflows, physical devices and assistive-technology checks remain outstanding.

Local emulator success must not be described as production readiness. Before live release, review the physical data contract and open decisions in docs 04, 05, 07, 10, and 11; configure and independently review live rules/IAM, indexes, Storage bucket, App Check, OTP anti-abuse, quotas, retention, backups, monitoring, and release rollback. No deployment, billing change, production resource modification, or real OTP was performed for this implementation.

## Core Alpha browser regression (2026-10-25)

Use Node 24.12+ for the frontend/tooling dependencies (Firebase web SDK 13 and rules-unit-testing 6 declare this minimum), Java 21 for emulators, and Node 22 for the Functions runtime declared in `functions/package.json`. The cloud setup supplies Node 22 at `/workspace/.towntap-tools/node_modules/node/bin`; activate that path in the Functions emulator terminal. No live Firebase credentials are needed.

Demo-only `.env.emulator.local`:

```dotenv
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-towntap-local.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-towntap-local
VITE_FIREBASE_STORAGE_BUCKET=demo-towntap-local.appspot.com
VITE_FIREBASE_APP_ID=demo-app-id
VITE_USE_FIREBASE_EMULATORS=true
```

Run from the repository root:

1. Install locked dependencies with `npm ci` and `npm --prefix functions ci`. Use the declared Node 22 runtime for the latter.
2. Make Chromium available. Cloud uses `/usr/bin/chromium`; elsewhere run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed Chromium executable.
3. In one terminal run `npm run firebase:emulators`; in another run `npm run dev:emulator -- --host 127.0.0.1`.
4. Wait for Auth, Firestore, Functions and Storage to report ready. Run `npm run test:e2e` in a third terminal. This runs two scenarios at desktop 1280×800 and mobile 390×844, four tests total. The suite uses real local emulator requests, retrieves test OTP codes from the demo Auth Emulator, and creates isolated owner/saver accounts. Test data remains local until the emulators stop.

In this cloud, retain the normal proxy for emulator downloads from `storage.googleapis.com`. Once the artifacts are cached, run local Firebase CLI commands in a subshell with `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy`. Firebase CLI 15.34.1 proxies its local Storage-to-Firestore calls despite NO_PROXY; this causes false Storage rule denials. Do not disable TLS/checksum verification or remove the proxy from package/download commands.

Browser coverage includes emulator phone login, private defaults, card editing/publication, decoding the generated QR to its share URL, link-only phone projection, private email exclusion, saved notes/nickname/tags and search, refreshed owner edits, Public link revocation dropping link-only data, restrictive visibility with retained saver context and unsave, Unlisted link revocation, Hindi persistence, all twelve guest routes, invalid phone input, offline indication and horizontal overflow checks. Mobile coverage is Chromium viewport emulation, not a physical-device or screen-reader audit.

A restricted saved contact now retains only its existing `profileId` reference and saver-owned context while `profile` remains null. This lets the saver edit notes or remove the saved reference without exposing the owner's private profile. Editor and saved-detail forms wait for route data; auth changes no longer load the same route twice and reset typed values.

Failure traces are written under ignored `test-results/`; inspect with `npx playwright show-trace <trace.zip>`. Browser traces may contain demo account data and share links; do not publish them as production evidence.

Business/moderation browser E2E, real OTP, physical-device QR scans, assistive technology and production operations remain separate work.

## Business verification and moderation integration (2026-10-25)

`npm run test:functions:emulator` now runs both `emulator-tests/*.integration.test.js` files: 10 tests total (2 core card tests and 8 business/moderation scenarios). It starts and stops Auth, Firestore, Functions and Storage itself, so stop only your own running emulators before using this command. In the cloud, use the cached artifacts and local proxy correction described above. Functions were validated on the declared Node 22 runtime.

The new suite uses real Auth Emulator accounts and signed tokens, callable HTTP requests, and client Storage SDK uploads/downloads with rules enforced. The Admin SDK is used only for local fixture custom claims and inspecting persisted state/audit records; the suite refuses non-loopback emulator hosts and fixes the project to `demo-towntap-local`. No production reviewer roles or credentials are configured.

Covered behavior:

- Guests, ordinary users and false/string moderator claims cannot read queues, review verification or resolve reports. Other users cannot request verification for an owner's business.
- The owner uploads evidence to the callable-issued path; unrelated users cannot upload/read it, while a moderator can read it. Approval updates request/reviewer/timestamps, owner and public badge state, discovery projection, queue membership and one audit record. Repeated review and post-review evidence replacement are denied. Direct moderator-client audit reads/writes remain denied.
- Rejection removes the request from the pending queue, retains a non-verified public state and records the reviewer/audit. Missing evidence and a spoofed PNG declaration cannot approve a request or create an approval audit.
- Pending business edits retain their verification request/evidence reference. Concurrent submissions reuse one pending request through a Firestore transaction.
- Approval requires the current pending reference and an active business, checked again inside the review transaction. Converting a pending business to personal or suspending it prevents approval; rejected reviews can still close the current request without granting a badge.
- Report dismissal leaves the listing active. Unpublish suspends the profile, increments the link version, removes discovery, denies guest/other-user card and old-link reads, and hides the live saved profile while retaining saver-owned context. Owner edits cannot republish a suspended listing. Each resolved report leaves exactly one attributed audit record, and repeated resolution is denied.

These tests verify the existing draft workflow, not final business-evidence criteria, appeals, badge renewal/revocation policy, retention or production IAM/App Check. Those decisions remain in document 10. No deployment or live resource change was made.
