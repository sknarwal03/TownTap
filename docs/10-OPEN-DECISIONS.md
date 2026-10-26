# 10 — Open Decisions and Specification Gaps

This register lists product and technical choices that still need owner approval. Approved rules are in `02-APPROVED-DECISIONS.md`; planning proposals are not approvals. The prototype has routes for all 12 PRD screens, but production behavior and security decisions remain open.

## P0 — Resolve before detailed production design

| ID | Decision | Already approved / current evidence | Owner decision still needed |
|---|---|---|---|
| UX-ROUTE | Screen-to-area and guest/auth map | Five areas and twelve screens are fixed; prototype route grouping is the Phase 0 baseline. Guests may view Public Cards and Discover; Admin is restricted to signed-in, authorized moderators and administrators; guests return to the card after signing in from a save prompt (2026-10-26; `02-APPROVED-DECISIONS.md`, UX-ROUTE-01–03). | Confirm final destination hierarchy and any remaining guest return paths. |
| DATA-TYPES | Profile and listing types | Owner confirms distinct Personal Card, Professional Card, and owned Business Listing types; separate Personal/Professional fields and privacy; PRD fields as the complete launch field set with no custom fields; display name plus one valid contact method on every card; business name/category/city-or-service-area on every listing, with those listing fields Public for discovery; multiple authorized listing managers; staff may edit listing details but not transfer, publish, or unpublish; only the owner may publish/unpublish; and a five-record cap for normal users that includes Business Listings (2026-10-26; `02-APPROVED-DECISIONS.md`, DATA-TYPES-01–14). | Define field formats/type applicability/validation and remaining listing collaborator permissions and ownership controls. |
| PRIVACY-MATRIX | Field audiences/defaults and transitions | Owner confirms every card field defaults to Private (2026-10-26; `02-APPROVED-DECISIONS.md`, PRIVACY-01). Field audiences are Private, Link-only, or Public; restrictive changes deny new unauthorized reads. | Approve the complete field-by-field audience matrix and effects of mode/field/listing changes on links, already-open pages, caches, and saved-reference lifecycle. |
| ALPHA-OPS | Minimum Alpha moderation operation | Reporting, a moderator team of at least two members appointed by a designated TownTap administrator to review reports and appeals, with no three-member minimum; named individual moderator accounts for action attribution, immediate access removal upon leaving the team, every incoming report assigned to a named moderator, two-moderator approval for business unpublishing only with each decision assigned to two named moderators, no two-moderator requirement for report dismissal or appeal outcomes, and no two-moderator requirement for business verification; report dismissal without action, audit logging of every moderator action, business-owner-only appeals (including report dismissals) limited to one per decision and submitted within 10 days of the decision notice, independent appeal review, named moderator assignment to each appeal upon receipt, the appeal reviewer must differ from the original decision maker or both unpublish approvers as applicable, and an appointed moderator from outside the team may review an unpublish appeal if both team members approved it; original decisions stay in effect during appeal review, reviewer authority is limited to upholding or overturning (no substituted action), overturning an unpublish automatically restores the listing, appeal decisions are final, in-app notices explain the action and reason and appeal updates arrive every 7 days while pending, there is no fixed moderator appeal-decision deadline, assigned appeal reviewers can access owner comments and supporting evidence, and an in-app published email support contact handles moderation decisions with automatic receipt confirmation including a request reference number and a target substantive response within 5 business days. Substantive support responses state request status and next steps. Audit logs are retained for 6 months, then deleted; moderators cannot edit or delete entries; each entry records the moderator, action, timestamp, and affected business or report; logs are stored separately from regular app data, accessible only to a designated audit administrator and security lead, and require MFA. Appeal comments and supporting evidence are deleted 6 months after the appeal decision; access is logged with the person's identity and timestamp (see `02-APPROVED-DECISIONS.md`, ALPHA-OPS-01–48). Admin screen is Phase 4. | Specify moderator-team coverage; support email address and handling; and minimum operation available at Alpha. |

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

