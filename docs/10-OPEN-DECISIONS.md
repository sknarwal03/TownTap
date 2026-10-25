# 10 — Open Decisions and Specification Gaps

This register lists product and technical choices that still need owner approval. Approved rules are in `02-APPROVED-DECISIONS.md`; planning proposals are not approvals. The prototype has routes for all 12 PRD screens, but production behavior and security decisions remain open.

## P0 — Resolve before detailed production design

| ID | Decision | Already approved / current evidence | Owner decision still needed |
|---|---|---|---|
| UX-ROUTE | Screen-to-area and guest/auth map | Five areas and twelve PRD screens are fixed; the owner accepted the prototype route grouping in `03-UX-AND-SCREEN-REFERENCE.md` as the Phase 0 planning baseline on 2026-10-24. | Confirm final destination hierarchy, guest entry/return paths, Public Card access and protected Admin entry. |
| DATA-TYPES | Profile and listing types | PRD distinguishes personal/professional/business concepts and assumes one account may own multiple records. | Approve type distinctions, field schema, account/card limits, required public business fields and ownership/staff model. |
| PRIVACY-MATRIX | Field audiences/defaults and transitions | Private-by-default; sensitive fields default Private with individual controls. Owner brief approves Private, Link-only, Public field audiences, immediate denial of unauthorized new reads after restrictive changes, and currently permitted fields on saved contacts. | Approve the complete field-by-field matrix and detailed effects of mode/field/listing changes on existing links, already-open pages, caches and saved-reference lifecycle. |
| ALPHA-OPS | Minimum Alpha moderation operation | Reporting, block/unpublish and audit trail are Alpha requirements; Admin screen is Phase 4. | Name accountable roles, review actions, audit detail, appeals/support path and minimum operation available at Alpha. |

## P1 — Resolve before implementation contracts

| ID | Decision | Already approved / current evidence | Owner decision still needed |
|---|---|---|---|
| AUTH-POLICY | OTP and recovery | Mobile OTP for signup/login/phone verification; verified recovery, rate limits and abuse prevention required. OTP is not business verification. | Select provider; code expiry, resend/attempt thresholds, recovery proof, number-change/recycled-number handling and abuse escalation after security review. |
| LANGUAGE | Language fallback and content | Hindi/English support, device-language initial choice, manual switch and persisted preference approved. | Unsupported-device and missing-translation fallback, content/search language behavior and translation review owner. |
| DISCOVERY | Pilot boundary and ranking | Signup is geographically open; Gohana/Sonipat discovery priority approved. | Define boundary, launch categories, outside-area listing/search eligibility, nearby consent and what “prioritize” means in ranking. |
| LIFECYCLE | Deletion, export and retention | PRD requires lifecycle capabilities; saved records are live references and saver notes are private. | Approve deletion/export/retention timing, privacy notice owner and saver-note behavior after target restriction, suspension or deletion. |
| BADGE | Business verification | Evidence review/revocation is separate from OTP; OTP alone cannot confer a badge. | Evidence criteria, reviewer permissions, states/wording, timing, appeals, renewal and audit process. |

## P2 — Resolve before later-phase/release commitments

- Accessibility conformance target, audit method, and final visual design approval.
- Deployment environment, budget, support ownership and release date for the selected Firebase implementation target.
- Search ranking details, exact filters and duplicate business ownership/merge/transfer workflow.

## Architecture and data/API planning status

The latest owner implementation brief directs the app toward Firebase Authentication, Firestore, Cloud Functions, Storage and Hosting. The PRD’s Firestore entities remain conceptual; paths, indexes, rules, field schema, project credentials and production configuration are not approved or present. No deployment, paid service, or real OTP is authorized.

`11-TECHNICAL-ARCHITECTURE-AND-DATA-API-PLAN.md` retains the earlier vendor-neutral logical planning model, with the latest Firebase implementation direction recorded at the top. Physical schema, endpoint contracts, indexes, security rules and deployment details remain open.

## Documentation facts reconciled in this pass

- The prototype source exposes all 12 named routes and the five PRD navigation labels; earlier eight-screen/missing-route statements are historical.
- Prototype account, backend, privacy enforcement, moderation and sharing behavior are simulations. The mock QR URL is unhosted and independent decoding remains unverified in the dated QA report.
- The old machine-readable QA snapshot represented an earlier prototype state and was removed; dated QA evidence remains in `08-PROTOTYPE-HANDOFF-AND-EVIDENCE.md`.

