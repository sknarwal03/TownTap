# 11 — Technical Architecture and Data/API Planning Draft

**Status:** Planning draft; implementation direction updated by the owner brief on 2026-10-24. The earlier vendor-neutral planning confirmation is preserved as history, and the latest brief now directs implementation toward Firebase Auth, Firestore, Cloud Functions, Storage, and Hosting. This does not approve production deployment or settle physical schema, endpoints, indexes, security rules, credentials, budgets, or retention. Product decisions in `02-APPROVED-DECISIONS.md` and unresolved items in `10-OPEN-DECISIONS.md` take precedence.

## Goal and boundaries

Plan the production web app around approved TownTap behavior: digital cards, private saved contacts, local business discovery, and the Digital Card + Smart Phonebook Alpha (Phases 1–2). The current HTML prototype is not production architecture. Keep the design mobile-first and bilingual, and preserve the privacy boundary between public profile projections and each saver’s private notes.

The draft retains its vendor-neutral logical model and proposals for comparison, but the latest owner brief identifies Firebase as the implementation target. It does not turn the PRD’s conceptual Firestore proposal into an approved schema.

## Logical architecture — proposal for review

| Component | Responsibility | Required boundary |
|---|---|---|
| Web client / PWA | Render the five areas and 12 routes; submit user actions; show loading, empty, error and offline states | Treat client input and UI hiding as untrusted; keep private notes out of public routes |
| Authentication/session service | Sign-in, session lifecycle, mobile OTP and verified recovery | OTP proves phone control only; provider, thresholds and recovery proof remain open |
| Application API / trusted service layer | Validate requests, authorize owner/saver/admin actions, create audience-specific projections, coordinate lifecycle changes | Enforce permissions on the server/trusted boundary; never return disallowed fields and rely on CSS to hide them |
| Primary data store | Store accounts, profiles/listings, private saved references, reports and verification workflow data | Separate saver-owned private context from target-owned profile data; exact schema and provider remain open |
| Discovery index | Search only eligible public business/profile fields and approved filters | Exclude Private and Unlisted records; index only consented fields; ranking and geography remain open |
| Media storage | Store approved user-uploaded card/business images if included | Authorization, file validation, metadata stripping, deletion and retention rules need design |
| Admin/operations | Review reports and evidence, block/unpublish, record privileged actions, handle support/escalations | Least privilege, auditable actions, evidence access controls and operational ownership are required; details remain open |
| Observability/abuse controls | Operational health, rate limiting, abuse signals, incident response | Avoid logging OTPs, private notes, link tokens, or unnecessary personal data; retention/access policy requires review |

The components may be combined or split after technology and threat review. The table describes responsibilities, not deployment units.

## Logical data concepts from the PRD

The PRD proposes these concepts; names and fields below are not a final schema:

| Concept | PRD proposal / purpose | Data ownership and access invariant |
|---|---|---|
| User/account | Account identity, status, preferences | User controls own account data; authentication secrets stay with the selected identity provider |
| Profile/card | Person/professional identity, fields, visibility and status | Owner-controlled; public responses contain only currently allowed fields |
| Business listing | Business name, category, locality, services, hours, visibility and review state | Owner/staff lifecycle requires approved ownership model; Unlisted/Private content is excluded from discovery |
| Saved contact | Target reference plus nickname, private note, tags, saved time and source | Belongs to the saver; target owner and other users cannot read it; live target fields refresh only as currently permitted |
| Verification request | Business evidence and review status | Restricted reviewer access, separate from OTP status, with audit and retention policy still to be approved |
| Report/moderation record | Reporter, target, reason, status and action history | Restricted role access; Alpha needs an accountable, auditable operation |
| Business membership (later) | Business and authorized user/role relationship | PRD marks this later-phase; do not silently pull team roles into Alpha |
| Daily analytics (later) | Aggregated business view/event counts | PRD marks this later-phase; define minimization and consent before use |

Relationships stated in the PRD: one user may own multiple profiles and businesses; one saver may have many saved references; a saved reference points to a profile or business. A target update must not overwrite the saver’s private notes/tags. Business transfer/merge requires a privileged reviewed workflow. Exact identifiers, required fields, indexes, deletion/tombstone rules, and ownership-transfer policy remain open.

## API capability map — not endpoint definitions

Design APIs or equivalent service operations by capability, then define exact routes/contracts after the data model and auth policy are approved:

- **Account/auth:** signup, login, OTP verification, phone verification, recovery, session changes, account deletion/export.
- **Owner profile/card:** create/list/read/update owned cards; update field audiences; publish/unpublish; create/read/revoke/regenerate share links.
- **Public card read:** resolve Public or valid Unlisted link into a current permitted-field projection; deny Private, revoked, suspended, deleted or otherwise unauthorized records without exposing hidden fields.
- **Saved contacts:** save/unsave an eligible target; list/search own saved references; read/update only the caller’s notes/tags; refresh permitted live target projection.
- **Discovery/business:** search eligible public records; read public business detail; owner-authorized listing create/update/unpublish and service-area actions.
- **Reports/moderation/verification:** submit report/evidence; privileged review, block/unpublish and status transitions; write an auditable action record.
- **Media:** authorized upload/delete operations if media remains in scope.

For every capability specify actor, target, authentication requirement, authorization predicate, permitted response fields, validation, rate/abuse controls, audit needs, error semantics, and lifecycle/cache effects. Avoid account enumeration and bulk private-data reads per PRD security requirements.

## Proposed data ownership and access matrix

This matrix translates approved privacy boundaries into design checks. It does not settle the unresolved field matrix or authorize privileged roles.

| Data / operation | Guest | Signed-in owner | Saver | Business reviewer / admin |
|---|---|---|---|---|
| Private account details | Deny | Own account only | Deny unless same user | Deny by default; narrowly scoped support access is unresolved |
| Profile/card fields | Public projection only, if Public and each field allows it; valid Unlisted link only for Link-only/Public fields | Own full record and settings | Only currently Public-permitted live target fields; a saved relationship does not grant Link-only fields | No routine access; exceptional access policy is unresolved |
| Unlisted link | Resolve only with a valid current link; no discovery listing | Create/revoke/regenerate own link | A saved relationship does not grant link-only fields | No link access by role alone |
| Saved reference | Deny | Only if owner is also saver | Own target reference and own notes/tags | Deny by default |
| Business listing | Public/eligible fields only | Own listing, subject to ownership workflow | Public permitted fields only | Review actions/evidence only for assigned, authorized work; role policy open |
| Verification evidence | Deny | Submit and view own request status | Deny | Assigned reviewer only; exact roles, retention and audit scope open |
| Report / moderation record | Submit a report; cannot inspect queue | See only status/copy approved by product policy | Same as signed-in reporter | Least-privilege queue/action access with an audit event; operations must be approved |

**Proposed enforcement rule:** authorize every read/write on the trusted service boundary, then construct the response from the requesting audience’s allowed projection. Never send hidden fields to a browser and rely on client-side hiding. The service should re-check current profile mode, field settings, link validity, listing status, and role on each protected read or action. This is a design proposal to satisfy approved privacy and revocation requirements; exact cache mechanisms remain unselected.

## Conceptual entity and lifecycle proposal

The PRD names Firestore collections as examples. The logical ownership below can be implemented in a relational or document store; IDs and physical paths are intentionally unspecified.

| Logical record | Suggested owner/key | Candidate attributes from the PRD | Lifecycle / constraints to define |
|---|---|---|---|
| Account | Identity provider subject | Account status, locale/preferences, created time | Signup, recovery, number changes, export and deletion policy |
| Profile | Profile ID; owner account ID | Type, display fields, city/category, profile mode, per-field audiences, status, updated time | Private default; publish/unpublish; allowed transitions; owner/card limits |
| Business listing | Business ID; owning account ID | Name, categories, locality, service area, location, hours, services, visibility, review status | Ownership, branch/merge, verification, unpublish/suspend and deletion |
| Saved reference | Saver account ID + target type/ID | Private nickname, notes, tags, saved time, source | Unique target per saver proposal; live target projection changes independently; note retention after target deletion is open |
| Share-link credential | Profile/listing ID + credential ID | Token verifier, state/version, created/revoked time | Persistent until revoked/regenerated; new requests through old credentials denied immediately; expiry/multiple links open |
| Verification request | Request ID; business and requester IDs | Method, state, review timestamps, evidence reference | Restricted evidence access, reviewer audit, retention and appeal policy open |
| Report | Report ID; reporter and target IDs | Reason, state, created time | Report visibility, triage, resolution, abuse prevention and retention open |
| Moderation action | Action ID; actor and target IDs | Action, reason/reference, timestamp | Candidate append-only audit record for privileged action; exact tamper resistance and retention remain architecture decisions |

The PRD’s `businessMembers` and `analyticsDaily` are marked later-phase; keep them out of Alpha unless the owner changes scope. Search indexes should be derived projections, not sources of truth for private profile data.

### Access and lifecycle rules

- **Public read:** require active record + Public profile/listing mode + eligible discovery/listing status; return only fields whose current audience includes Public.
- **Unlisted read:** require active record + non-revoked credential + a current mode that permits link sharing; return only fields currently allowed for Link-only or Public audiences. Exclude the record from discovery.
- **Private read:** owner’s authenticated read only. No public route or search result.
- **Restrictive change / revoke:** update the authoritative authorization state before reporting success; new reads with old permissions/credentials must be denied. Cache invalidation and already-open pages need an approved technical policy.
- **Saved reference:** store saver-owned notes/tags separately from owner profile data; compose each view from the saved reference plus the target’s current allowed projection. Never copy private owner fields into the saver record.
- **Suspend/delete:** remove from discovery and deny new public/link reads. Whether saver notes remain, are anonymized, or are erased follows the owner-approved retention policy.
- **Search:** index only public, eligible, consented fields; apply filters/ranking after the pilot boundary and location-consent decisions are made.

## Example service contract shapes — proposals only

These are operation names and actor expectations, not final URL paths or OpenAPI contracts.

| Operation | Actor | Input intent | Success response | Important denial/failure behavior |
|---|---|---|---|---|
| Start / verify OTP | Guest or account holder | Phone and intended auth/verification action; code in verification step | Opaque challenge/session result and phone-control status | Generic responses that avoid account enumeration; rate limiting and thresholds pending security review |
| Create/update own profile | Authenticated owner | Profile fields and field-audience changes | Saved owner view with authoritative mode/status | Reject unauthorized owner, invalid fields, or failed persistence; no false success |
| Read public profile | Guest or signed-in viewer | Profile identifier | Public projection only | Private, suspended, deleted, or unavailable record returns a non-disclosing unavailable response |
| Read Unlisted profile | Link holder | Share credential | Current permitted link projection | Invalid/revoked credential denied without protected fields |
| Revoke/regenerate link | Authenticated owner | Own profile and selected link action | New link state or confirmation that old link no longer authorizes reads | Deny other users; do not claim copied data was recalled |
| Save / unsave target | Authenticated saver | Eligible profile/listing reference | Saver’s own reference state | Reject ineligible/private target; deduplicate behavior is still a product decision |
| List/search saved references | Authenticated saver | Query/filter inputs | Own notes/tags plus currently permitted live target fields | Never allow cross-user reads or target-owner access to saver notes |
| Search directory | Guest or signed-in viewer | Text/category/city and approved filters | Eligible public search projection | Exclude Unlisted/Private; throttle and avoid exposing bulk/private data |
| Report / moderate | Reporter or authorized reviewer | Target, reason, or assigned review action | Safe submission/status or audited action result | Check role at action time; restrict evidence and queue data; audit privileged action |

Exact schemas, validation limits, response fields, error codes, idempotency rules, page sizes, rate limits and endpoint paths must be specified after the open decisions are approved.

## Vendor-neutral deployment shape

Candidate deployment shape for evaluation: static/mobile-first web client → HTTPS application/API boundary → identity service and primary store → a separate public-only search projection; media storage and admin operations are optional components gated by approved scope. Keep secrets and privileged credentials server-side. Separate public projections and saver-private data by authorization boundary even if they share a physical database.

The PRD names Firebase Authentication, Firestore, Firebase Hosting/static hosting, Cloud Functions or equivalent, and indexed search as recommendations. The latest owner brief directs Firebase integration. No Firebase project, rules, indexes, service account, or infrastructure are configured by this planning document; implementation still requires emulator validation and approved access contracts.

## Recommended review order

1. Approve the profile/listing type and ownership model.
2. Approve the complete field audience matrix and restrictive-change/link behavior.
3. Define the accountable minimum Alpha moderation and verification operation.
4. Approve OTP/recovery and data lifecycle policies.
5. Review this logical model and access matrix with product/security owners.
6. Then compare providers and produce a physical schema, endpoint contract, index plan, and threat model.

## Approved invariants to carry into design

- New profiles are Private by default; sensitive fields are private by default and have individual controls.
- Public is discoverable only subject to permitted fields; Unlisted is valid-link only and not discoverable; Private has no public-link/discovery access.
- Revoking/regenerating an Unlisted link immediately blocks new reads through the old link. Restrictive changes must stop new access along the old sharing path. Previously copied data cannot be recalled.
- Saved records show only current permitted live target fields. Notes/tags are visible only to their saver.
- Admin, evidence, reports and moderation require trusted authorization; OTP alone never grants a business badge.
- Signup is not geographically restricted; discovery prioritizes Gohana/Sonipat without assuming an exclusive boundary.

## Decisions needed before architecture approval

See `10-OPEN-DECISIONS.md`. At minimum, settle route/access map, profile and listing types/limits, full field audience model and visibility transitions, OTP/recovery policy, Alpha moderation operations, deletion/retention rules, discovery boundary and search behavior. Then evaluate candidate hosting/auth/database/search providers against scale, cost, privacy, security, bilingual UX, operations and migration needs.

## Suggested next deliverables after owner decisions

1. Approved context/container diagram and threat boundaries.
2. Logical ER/data model with field ownership, lifecycle and public/private projections.
3. API contract with authorization matrix and error behavior.
4. Index/search plan and link/cache invalidation design.
5. Deployment, secrets, monitoring, backup/restore, incident and rollback plan.
6. Traceability from Alpha P0 requirements to acceptance checks and evidence.

Keep each item a proposal until explicitly approved; no code or infrastructure changes follow from this draft alone.

