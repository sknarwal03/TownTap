# 12 — Firebase Implementation and Local Testing

**Status:** implementation draft for emulator-backed development. This is not production approval or evidence that a live Firebase project is configured.

## Start locally

1. Install the root and Functions dependencies with `npm install` and `npm --prefix functions install`.
2. Copy `.env.emulator` to `.env.emulator.local` only if you need a local override; the checked-in demo values are emulator-only and are not credentials.
3. Run `npm run firebase:emulators` in one terminal and `npm run dev:emulator` in another. The app connects only to Auth, Firestore, Functions, and Storage emulators in this mode.
4. Phone sign-in uses Firebase Auth Emulator. No SMS is sent; inspect the emulator terminal for its test code. The Auth Emulator does not model production anti-abuse limits.
5. Run `npm test`, `npm run test:functions`, `npm run test:rules`, and `npm run test:functions:emulator` to run the automated checks. The Functions integration suite exercises profile create, private/public/link projections, link revocation/restriction, saved live views, and unauthenticated denial. Emulator checks do not prove deployed IAM, rules, billing, quotas, or live OTP configuration.

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

Automated domain tests cover private defaults, schema validation, field projections, link restriction logic, directory projection, and pilot ranking. App-shell tests cover the preserved 12 screens, five nav areas, emulator wiring, and network-only service worker. Rule tests exercise default-deny Firestore and evidence Storage paths against local emulators. A focused callable Functions emulator integration suite covers core card/privacy/share/saved-contact behavior. Business verification/moderation lifecycle integration and real browser E2E suites are still outstanding.

Local emulator success must not be described as production readiness. Before live release, review the physical data contract and open decisions in docs 04, 05, 07, 10, and 11; configure and independently review live rules/IAM, indexes, Storage bucket, App Check, OTP anti-abuse, quotas, retention, backups, monitoring, and release rollback. No deployment, billing change, production resource modification, or real OTP was performed for this implementation.
