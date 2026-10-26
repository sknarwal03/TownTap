# 13 — Production Deployment Readiness

**Status checked:** 2026-10-26
**Current release state:** Alpha implementation runs against local Firebase emulators. Production deployment is not ready; no live Firebase project, production OTP, deployment, billing, or production resource was used in this review.

This is a preparation checklist, not authorization to create live resources or deploy. Complete the gates in order and record evidence before a production release.

## Current blockers

- **Product contracts:** Record types, required fields, five-record account limit, guest Public Card/Discover access, and Admin restriction are now approved. Field formats/type applicability, complete field-audience matrix, navigation hierarchy, and privacy transitions remain open in `10-OPEN-DECISIONS.md`.
- **Implementation gaps:** The current editor still shares a common field inventory across record types, and authorized Business Listing collaborators are not implemented yet. The owner has approved separate Personal/Professional data and authorized staff editing, but the remaining field applicability and collaborator controls need definition before production claims can be made.
- **Authentication and lifecycle:** OTP provider and limits, account recovery proof, deletion/export/retention, support ownership, and related abuse controls remain unresolved.
- **Moderation operations:** Report and appeal behavior has many owner decisions recorded in `02-APPROVED-DECISIONS.md`; moderator coverage is deferred, and the published support email address has not been selected. Finish and operationalize the remaining requirements before accepting live reports or evidence.
- **Production Firebase:** No production project, IAM, App Check, OTP provider configuration, secrets, Hosting domain, quotas, or billing setup has been configured or reviewed.
- **Independent security/operations review:** Production rules and IAM, callable authorization, Storage evidence access, retention/deletion, backups, monitoring, incident response, anti-abuse, and rollback have not received independent production review.
- **Release evidence:** Business/moderation browser E2E, real OTP, physical-device checks, assistive-technology checks, and complete Alpha P0 traceability remain open.
- **Dependencies and performance:** A fresh production dependency audit found four high-severity advisories via `@grpc/grpc-js`; npm reports no fix available. The initial JavaScript chunk has been reduced from about 650 kB to about 222 kB uncompressed by deferring QR, Functions, and Storage SDK code. Performance review on agreed devices/networks remains open.

The current automated results in `MASTER-PROJECT-STATUS.md` are historical local/emulator evidence, not production evidence. Re-run the approved checks on the release candidate and attach dated output before release; this checklist review did not run tests.

## Readiness checklist

### A. Product and release contract

- [ ] Approve the remaining P0 product decisions: final route/access map, type-specific field applicability/formats/validation, and complete privacy matrix and transitions. Record DATA-TYPES decisions in `02-APPROVED-DECISIONS.md`; the launch field inventory is fixed to the PRD and excludes custom fields.
- [ ] Confirm Alpha scope and acceptance evidence for every PRD P0 requirement; record any approved exception explicitly.
- [ ] Complete Alpha moderation staffing and support operations, including the deferred coverage decision and actual support email address.
- [ ] Approve OTP/recovery policy, data deletion/export/retention policy, discovery rules, and business badge criteria before enabling those production flows.
- [ ] Assign accountable owners for privacy, security, support, moderation, and release rollback.

### B. Code and release-candidate quality

- [ ] Resolve the dependency advisories with a compatible, reviewed package update; regenerate and commit lockfiles.
- [x] Defer QR, Functions, and Storage SDK code until needed; production build's initial chunk is about 222 kB uncompressed.
- [ ] Review production load performance on agreed target devices/networks.
- [ ] Complete browser E2E for business verification, reports, moderation, and appeals.
- [ ] Complete agreed accessibility review, including keyboard/focus, screen reader, contrast, text scaling, and Hindi/English UI.
- [ ] Validate on physical mobile devices, including QR scanning and network interruption/recovery.
- [ ] Run the approved unit, rules, Functions emulator, browser, and production-build checks against the release candidate; save dated results.
- [ ] Review exposed configuration and source maps; confirm no Admin credentials or service-account material can enter the client build.

### C. Production Firebase and hosting

Do this only after the product contract and release target are approved.

- [ ] Create/select the intended Firebase project and document project owner, region, environment separation, billing owner, and spending alerts.
- [ ] Configure least-privilege human and service identities; review IAM independently.
- [ ] Configure Firebase Authentication for the approved real OTP provider, verified domains, resend/attempt controls, abuse protection, recovery, and account-number-change handling.
- [ ] Configure and enforce App Check for the approved clients and callable Functions.
- [ ] Deploy and independently review Firestore rules and indexes; verify default-deny access and server-side authorization for every callable function.
- [ ] Configure private Storage rules, upload limits, evidence type/signature validation, access logging, retention, and deletion.
- [ ] Configure Functions runtime, region, secrets, service accounts, quotas, concurrency, and alerting. Keep privileged credentials out of Vite variables and source control.
- [ ] Configure Hosting domain, HTTPS, SPA routing, cache headers, service-worker behavior, security headers, and rollback target.
- [ ] Verify production OTP delivery, rate limiting, email/support delivery, and monitoring without using real customer data during setup.

### D. Security, privacy, and operations

- [ ] Obtain an independent review of authentication, authorization, privacy projections, share-link revocation, callable Functions, Storage, IAM, and abuse controls.
- [ ] Verify App Check, OTP abuse controls, rate limits, account recovery, and incident escalation against the approved policies.
- [ ] Implement approved retention/deletion, export, consent, privacy notice, backup/restore, and data-subject support workflows.
- [ ] Establish monitoring, alerts, audit access, backup restore drills, incident response, support escalation, moderator onboarding/offboarding, and release rollback runbooks.
- [ ] Verify business verification evidence handling and moderation evidence/audit retention in the live environment.
- [ ] Confirm all Alpha P0 and operational gates have dated evidence and named sign-off owners.

### E. Staging rehearsal and production release

- [ ] Deploy the release candidate to a separate staging project and run the full release checklist there.
- [ ] Perform signed-out, owner, other-user, moderator, and unauthorized-access smoke checks on staging.
- [ ] Verify real OTP, email notices, card link/QR, revocation, save/unsave, discovery, report, verification, moderation, appeal, and deletion paths.
- [ ] Confirm dashboards, alerts, backup, rollback, and support coverage are active before release.
- [ ] Record release approval, version/commit, deployment operator, deployment time, rollback trigger, and post-release monitoring owner.
- [ ] Deploy to production only after explicit release authorization and all required approvals are recorded.

## Immediate next work

1. Finish the remaining product decisions needed to freeze the Alpha contract, while deferring decisions explicitly marked for later phases.
2. Close implementation gaps and resolve the dependency advisories; then build and verify a release candidate.
3. Complete independent security and operational review before configuring a live Firebase project.
4. After those gates, configure staging, rehearse deployment and rollback, and seek explicit authorization for production deployment.

See `MASTER-PROJECT-STATUS.md` for the current implementation evidence, `07-ALPHA-ACCEPTANCE.md` for Alpha functional/security gates, and `10-OPEN-DECISIONS.md` for unresolved product policy.
