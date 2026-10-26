# 02 — Approved Product and UX Decisions

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `TownTap-Product-Decisions.md`

# TownTap — Product Decision Record

**Version:** 1.0  
**Date:** 24 October 2026  
**Status:** Approved product decisions; implementation details pending

## Product vision
TownTap combines a smart phonebook, digital visiting cards, and a public business directory. It helps people share up-to-date contact details and discover local businesses without unnecessarily saving phone numbers.

## Approved decisions

| ID | Area | Decision |
|---|---|---|
| PDR-01 | Main navigation | Five main areas as specified in the PRD; exact names and mapping must be taken from the PRD. |
| PDR-02 | Profile visibility | Public, Unlisted, and Private modes. |
| PDR-03 | Unlisted access | Anyone possessing a valid profile link can view the information permitted for that link; it is not listed in public discovery. |
| PDR-04 | Languages | Hindi and English. |
| PDR-05 | Initial pilot | Gohana / Sonipat. |
| PDR-06 | Verification | Mobile OTP, plus an optional verified business badge. |
| PDR-07 | Brand | TownTap (replaces the DigitalCard working brand in future user-facing materials). |

## Interpretation and safeguards

- **Public:** Eligible for public search and directory discovery, subject to field-level sharing settings.
- **Unlisted:** Not discoverable through public search or directory browsing. A valid shared link grants access only to the fields intentionally shared through that link. Treat link possession as access: avoid exposing sensitive information by default.
- **Private:** Not accessible through public search, directory browsing, or public profile links. The owner retains authenticated access.
- **OTP versus badge:** OTP proves control of a phone number; it does not prove a business is legitimate. Define separate badge eligibility and review/revocation processes before implementing badges.
- **Languages:** UI localization must support Hindi and English. Content translation, fallback language, and locale persistence still need specification.
- **Pilot geography:** Focus the initial directory rollout on Gohana/Sonipat; define whether users outside the pilot may sign up or create cards.
- **Five navigation areas:** Use the current PRD as the source for labels and destinations; do not invent labels to fill gaps.

## Items not yet approved

1. Exact five-tab navigation labels, hierarchy, and mapping of all twelve PRD screens to prototype views.
2. Default visibility mode, field-level visibility settings, link token behavior, revocation and expiry.
3. Business badge criteria, reviewers, evidence, appeals, and revocation.
4. Hindi/English language default and content localization behavior.
5. Pilot eligibility and geographic boundary enforcement.
6. Prototype selection: later resolved by UX-09, which approves `prototypes/index.html` as the UX baseline (not final design or production code). On 2026-10-24, the owner also accepted its current route grouping as the Phase 0 planning baseline; final navigation approval remains open.
7. Technical architecture, data model, authentication vendor, hosting, and release schedule.

## Document precedence

Approved decisions in this record override contradictory older draft statements **only for the seven areas listed above**. Existing PRD retains authority for unspecified product scope, subject to conflict resolution. Prototypes are design references, not authoritative feature requirements. Record unresolved conflicts explicitly rather than silently choosing.

## Change control

Any future revision should include decision ID, old and new value, reason, date, and impact on PRD, prototypes, database, and tests. Do not overwrite historical decisions without a changelog.

---

## Historical source: `TownTap-Step6-Decision-Record.md`

# TownTap — Step 6 Decision Record

Date: 2026-10-24
Status: Approved decisions; phase boundaries pending approval

## Approved decisions

| ID | Topic | Decision |
|---|---|---|
| UX-01 | Screen scope | Design all 12 PRD screens; implement in phases. Exact release allocation not yet approved. |
| UX-02 | Navigation | Use the five main areas specified in the PRD. Preserve PRD labels until explicitly revised. |
| UX-03 | Default visibility | New profiles default to Private; public exposure requires affirmative owner action. |
| UX-04 | Unlisted links | Persistent links; owner can revoke or regenerate at any time. Old links cease granting access after revocation/regeneration. |
| UX-05 | Mobile OTP | Use for signup, login, and phone verification; define throttling, recovery and anti-abuse controls before implementation. |
| UX-06 | Business verification | Evidence submission, admin review, and revocation; OTP verification alone does not confer a business badge. |
| UX-07 | Localization | Initial language based on device language, with manual switch and persisted preference. Support Hindi and English, including fallback. |
| UX-08 | Pilot | Allow signup regardless of geography; prioritize Gohana/Sonipat for business discovery. Exact listing and geographic filtering rules remain to be specified. |
| UX-09 | Prototype | Approve `prototypes/index.html` as a UX baseline, not final visual design or production code. |

## Product scope implications
- Design coverage target: all 12 screens in the PRD, mapped to five PRD navigation areas.
- Development is phased; do not equate design approval with launch scope.
- Historical Step 6 follow-up: reconcile the prototype against the PRD. The current source now contains all 12 route names; exact owner-approved navigation hierarchy remains open in `10-OPEN-DECISIONS.md`.
- Keep the approved Step 4 record (`docs/02-APPROVED-DECISIONS.md`) authoritative for its seven decisions.

## Open questions (do not silently decide)
1. Exact screen allocation to development phases and release acceptance criteria.
2. Field-level sharing and whether changing visibility affects existing shared links.
3. Link identifier format, rotation, cached content invalidation and handling of forwarded links.
4. OTP provider, limits, fallback, account recovery and privacy notices.
5. Badge evidence requirements, admin roles, appeal and audit logs.
6. Language fallback for user-entered content and accessibility requirements.
7. Business listing eligibility outside pilot geography and location search boundaries.
8. Final visual design and usability sign-off.

## Change control
Record changes with ID, date, rationale, and affected documents. Do not overwrite or delete prior artifacts without review.


---

## Historical source: `TownTap-Step7-Decision-Record.md`

# TownTap — Step 7 Release Strategy Decision Record

Date: 2026-10-24
Status: Approved
Precedence: Supplements Step 4 and Step 6 approved decision records. No change to their other decisions.

## Approved decisions

| ID | Topic | Decision |
|---|---|---|
| REL-01 | First working release | Digital Card + Smart Phonebook Alpha |
| REL-02 | Development phases | Approve proposed Phases 0–4 |
| REL-03 | Navigation | Retain exact five main areas, labels and destinations from the existing PRD; do not invent replacements |
| REL-04 | Field privacy | Individual visibility controls for each sensitive profile field |
| REL-05 | Unlisted link revocation | Revoking or regenerating a link immediately denies access through the old link |
| REL-06 | OTP recovery | Verified recovery flow, rate limits and abuse prevention |
| REL-07 | Pilot discovery | Prioritize registered businesses in Gohana/Sonipat; not an exclusive geographic restriction |
| REL-08 | Prototype update | Finalize remaining UX rules before updating the full twelve-screen prototype |

## Approved development sequence

- Phase 0: Product and interaction definition.
- Phase 1: Entry, identity, digital card, and privacy foundation.
- Phase 2: Saved contact memory / smart phonebook.
- Phase 3: Local discovery and business management.
- Phase 4: Admin, operations, and release readiness.

Phases 1 and 2 define the Alpha's functional scope. Security, operational readiness and testing needed for Alpha cannot be deferred merely because Phase 4 follows later in the roadmap.

## Implementation implications

- Profile-level visibility and field-level sharing must be enforced server-side; never rely solely on hiding UI fields.
- For unlisted profiles, invalidated tokens must cease authorizing new data reads immediately. Previously copied information cannot be recalled.
- Recovery and OTP protection need specific flow design and threat review before implementation.
- Business priority ranking must be documented; no geographic exclusion is approved.
- Use the PRD's canonical navigation labels and destinations, as extracted by Codex.
- prototypes/index.html is an approved UX baseline, not final design.

## Still open for UX specification

1. Exact sensitive field inventory, audience permissions and defaults.
2. Unlisted link behavior on changing profile mode, sharing, caching, and regeneration.
3. Recovery scenarios, proof requirements, failed-attempt thresholds, throttling, and account enumeration prevention.
4. Language selection fallback, persistence, and missing translations.
5. Screen-level empty/loading/error/offline/permission states.
6. Alpha release acceptance tests and essential administrative/security operations.
7. Business discovery priority ranking and evidence/approval details for later phases.

## Change management

Any future modification should preserve the original decision, note the revision date, rationale, affected documents, and migration/test implications.


---

## Historical source: `TownTap-Step8B-Decision-Record.md`

# TownTap — Step 8B Critical UX Decision Record

**Date:** 24 October 2026  
**Status:** Approved by product owner  
**Scope:** UX decisions UX-10 through UX-17; complements prior approved records.

| ID | Decision | Approved rule |
|---|---|---|
| UX-10 | Navigation | Use the exact five main areas and screen destinations from the PRD and `docs/03-UX-AND-SCREEN-REFERENCE.md`. Do not invent labels. |
| UX-11 | Sensitive-field defaults | Phone, WhatsApp, email, address, and location are private by default. |
| UX-12 | Field audiences | Each eligible field supports Private, Link-only, or Public visibility. |
| UX-13 | Restrictive transitions | When a profile becomes more restrictive, previous public/unlisted access is disabled immediately. |
| UX-14 | Alpha sharing | Functional QR code, shareable link, copy-link, and native share with graceful fallback. |
| UX-15 | Alpha moderation | Reporting, block/unpublish, and an admin audit trail are required for Alpha readiness. |
| UX-16 | Saved profiles | Saved cards display only data currently permitted by the owner's active privacy settings. |
| UX-17 | Deletion/private | Deletion or switching to Private disables shared and saved *live profile* access. |

## Interpretation notes

- Private-by-default applies to sensitive fields even if a profile later becomes Public, unless the owner explicitly changes those field settings.
- Link-only data is available only through a currently valid authorized share link, subject to profile-level visibility. A saved-card relationship alone does not grant link-only access.
- Link revocation and restrictive profile changes must invalidate old live access; previously copied, exported, or screenshotted information cannot be recalled.
- QR codes encode an appropriate share URL; a QR code is not itself a separate authorization mechanism.
- Native sharing must have a copy-link fallback when browser/platform support is unavailable.
- Reporting, moderation, and audit-trail prototype interactions are illustrative only; production enforcement needs authenticated server-side controls and tamper-resistant logging.
- Prototype privacy simulations are not real security controls. Do not publish sensitive user data in client-side mock fixtures.

## Still open for detailed specification

- Exact per-field handling for non-sensitive fields, profile identity display, and combined profile/field-level access rules.
- Link token entropy, expiry policy (if any), authorization and caching mechanics.
- Precise report categories, moderator permissions, audit retention, and appeal workflows.
- Account recovery proof, OTP numerical limits, and anti-abuse mechanisms.
- Detailed bilingual fallback behavior, pilot discovery ranking, and release acceptance thresholds.

## Product owner confirmations

- **UX-ROUTE-01 — Guest destinations (confirmed 2026-10-26):** Guests may view Public Cards and browse Discover. The exact guest return paths and protected Admin entry remain open.
- **UX-ROUTE-02 — Admin access (confirmed 2026-10-26):** The Admin screen is restricted to signed-in, authorized moderators and administrators.
- **UX-ROUTE-03 — Guest save return path (confirmed 2026-10-26):** When a guest signs in after being prompted to save a card, TownTap returns them to that card to complete the save flow.
- **DATA-TYPES-01 — Multiple cards (confirmed 2026-10-26):** One account may create and own multiple cards/listings. Subsequent entries below define their types, fields, and account limit.
- **DATA-TYPES-02 — Record types (confirmed 2026-10-26):** TownTap supports three distinct record types: Personal Card, Professional Card, and owned Business Listing.
- **DATA-TYPES-03 — Personal/professional separation (confirmed 2026-10-26):** Personal Cards and Professional Cards use separate fields and separate privacy settings.
- **DATA-TYPES-04 — Required card fields (confirmed 2026-10-26):** Every card requires a display name and at least one valid contact method before it can be saved.
- **DATA-TYPES-05 — Required business fields (confirmed 2026-10-26):** Every Business Listing requires a business name and category.
- **DATA-TYPES-06 — Required service area (confirmed 2026-10-26):** Every Business Listing requires a city or service area.
- **DATA-TYPES-07 — Discoverable listing fields (confirmed 2026-10-26):** For a Business Listing to appear in Discover, its business name, category, and city/service area must be Public. Since all fields default Private, the owner must explicitly make these fields Public.
- **DATA-TYPES-08 — Per-account record limit (confirmed 2026-10-26):** TownTap will not impose a hard cap on the number of cards or Business Listings an account may create.
- **DATA-TYPES-09 — Business Listing collaborators (confirmed 2026-10-26):** A Business Listing may be managed by multiple authorized people, including its owner and staff. The role and permission model remains to be specified.
- **DATA-TYPES-10 — Normal-user card cap (revision, confirmed 2026-10-26):** A normal user may create up to five cards. This revises DATA-TYPES-08 for normal-user records. The earlier no-cap statement is retained as decision history, not current policy.
- **DATA-TYPES-11 — Listing count within card cap (confirmed 2026-10-26):** Business Listings count toward the normal user's five-card limit.
- **DATA-TYPES-12 — Launch field set (confirmed 2026-10-26):** The PRD's listed card and business-listing fields form the complete launch schema; user-defined custom fields are out of launch scope. Field formats, type-specific applicability, and validation remain to be specified.
- **DATA-TYPES-13 — Staff editing and transfer (confirmed 2026-10-26):** Owner-authorized Business Listing staff may edit listing details but may not transfer listing ownership.
- **DATA-TYPES-14 — Publication authority (confirmed 2026-10-26):** Only the Business Listing owner may publish or unpublish the listing; authorized staff cannot perform either action.
- **PRIVACY-01 — All-field default (confirmed 2026-10-26):** Every card field defaults to Private, not only the sensitive fields already listed in UX-11. An owner must deliberately change a field's audience to share it.

- **ALPHA-OPS-01 — Moderator unpublish authority:** The product owner confirmed that designated moderators may unpublish a reported business as part of Alpha moderation. This confirms the existing UX-15 requirement; report categories, appeals, support, and audit retention remain unspecified.
- **ALPHA-OPS-02 — Report dismissal:** The product owner confirmed moderators may dismiss a report without taking action on the business.
- **ALPHA-OPS-03 — Audit logging:** The product owner confirmed every moderator action must be recorded in the moderation audit log. Audit retention and tamper-resistance requirements remain to be specified.
- **ALPHA-OPS-04 — Appeals:** The product owner confirmed business owners may appeal moderator decisions. Appeal submission, reviewer independence, timelines, and outcomes remain to be specified.
- **ALPHA-OPS-05 — Independent appeal reviewer:** The product owner confirmed an appeal must be reviewed by a different moderator from the one who made the original decision.
- **ALPHA-OPS-06 — Decision during appeal:** The product owner confirmed the original moderation decision remains in effect while the appeal is reviewed.
- **ALPHA-OPS-07 — Business-owner notice:** The product owner confirmed business owners must be notified when a moderator takes action on their business. Notice channel, content, and timing remain to be specified.
- **ALPHA-OPS-08 — Notice channel:** The product owner confirmed moderator notices and appeal updates are delivered inside the app. Notice content and timing remain to be specified.
- **ALPHA-OPS-09 — Appeal limit:** The product owner confirmed a business owner may appeal each moderation decision once.
- **ALPHA-OPS-10 — Appeal submission deadline:** The product owner confirmed appeals must be submitted within 10 days of the moderation decision notice.
- **ALPHA-OPS-11 — Appeal decision deadline:** The product owner decided not to require a fixed deadline for moderators to decide appeals.
- **ALPHA-OPS-12 — Pending appeal updates:** The product owner confirmed business owners receive in-app status updates every 7 days while their appeal is pending. Update content remains to be specified.
- **ALPHA-OPS-13 — Appeal outcome authority:** The product owner confirmed the appeal reviewer may overturn the original moderation decision. Permitted outcome options and resulting actions remain to be specified.
- **ALPHA-OPS-14 — Appeal outcomes:** The product owner confirmed the appeal reviewer may uphold or overturn the original decision, but may not substitute a different action.
- **ALPHA-OPS-15 — Restore after successful appeal:** The product owner confirmed that overturning an unpublish decision automatically restores the business listing.
- **ALPHA-OPS-16 — Appeal report dismissal:** The product owner confirmed business owners may appeal a moderator's report dismissal, subject to the existing one-appeal-per-decision limit.
- **ALPHA-OPS-17 — Appeal eligibility:** The product owner confirmed only the business owner may appeal a moderation decision about that business.
- **ALPHA-OPS-18 — Appeal finality:** The product owner confirmed the appeal decision is final and cannot be appealed again.
- **ALPHA-OPS-19 — Appeal materials access:** The product owner confirmed moderators reviewing an appeal may view the business owner's appeal comments and supporting evidence. Evidence handling, retention, and access logging remain to be specified.
- **ALPHA-OPS-20 — Moderator team:** The product owner confirmed TownTap will designate a moderator team to review reports and appeals. Team membership, assignment, and coverage remain to be specified.
- **ALPHA-OPS-21 — Individual moderator accounts:** The product owner confirmed moderators must use named individual accounts so actions can be attributed to a person.
- **ALPHA-OPS-22 — Moderator offboarding:** The product owner confirmed moderator access must be removed immediately when a person leaves the moderator team.
- **ALPHA-OPS-23 — Unpublish approval:** The product owner confirmed two moderators must approve a business unpublish decision.
- **ALPHA-OPS-24 — Other moderation approvals:** The product owner confirmed two-moderator approval is not required for moderation actions other than business unpublishing, including report dismissal and appeal outcomes. Business verification also does not require two-moderator approval.
- **ALPHA-OPS-25 — Audit retention:** The product owner decided moderation audit logs are retained for 6 months, then deleted.
- **ALPHA-OPS-26 — Audit immutability:** The product owner confirmed moderators must not be able to edit or delete audit-log entries.
- **ALPHA-OPS-27 — Audit event fields:** The product owner confirmed each audit entry records the moderator, action, timestamp, and affected business or report.
- **ALPHA-OPS-28 — Audit-log access and storage:** The product owner confirmed audit logs are stored separately from regular app data, with access limited to authorized personnel.
- **ALPHA-OPS-29 — Authorized audit-log roles:** The product owner confirmed only a designated audit administrator and a security lead may access audit logs.
- **ALPHA-OPS-30 — Moderation support contact:** The product owner confirmed business owners must be told how to contact TownTap support about a moderation decision. Support handling remains to be specified.
- **ALPHA-OPS-31 — Support contact channel:** The product owner confirmed moderation support contact is provided by email. The address and support handling remain to be specified.
- **ALPHA-OPS-32 — Support receipt confirmation:** The product owner confirmed TownTap must email a confirmation when it receives a moderation support request. Confirmation content remains to be specified.
- **ALPHA-OPS-33 — Support response target:** The product owner set a target of a substantive email response within 5 business days for moderation support requests.
- **ALPHA-OPS-34 — Published support email:** The product owner confirmed the moderation support email address must be published in the app. The actual address remains to be selected.
- **ALPHA-OPS-35 — Moderation notice content:** The product owner confirmed in-app notices must tell the business owner what action was taken and why.
- **ALPHA-OPS-36 — Appeal material retention:** The product owner confirmed appeal comments and supporting evidence are deleted 6 months after the appeal decision.
- **ALPHA-OPS-37 — Appeal evidence access log:** The product owner confirmed access to appeal evidence must be logged with the identity of the person accessing it and the access timestamp.
- **ALPHA-OPS-38 — Support request reference:** The product owner confirmed the email receipt confirmation must include a reference number for the support request.
- **ALPHA-OPS-39 — Automatic receipt confirmation:** The product owner confirmed the receipt confirmation is sent automatically when the support request arrives.
- **ALPHA-OPS-40 — Appeal assignment:** The product owner confirmed each appeal is assigned to a named moderator when received. The independent-review requirement still applies to ensure the appeal reviewer differs from the original decision-maker.
- **ALPHA-OPS-41 — Unpublish approver assignment:** The product owner confirmed each business unpublish decision is assigned to two named moderators for approval.
- **ALPHA-OPS-42 — Report assignment:** The product owner confirmed each incoming report is assigned to a named moderator for review.
- **ALPHA-OPS-43 — Moderator appointment:** The product owner confirmed a designated TownTap administrator appoints moderator-team members.
- **ALPHA-OPS-44 — Support response content:** The product owner confirmed substantive support responses state the request status and any next steps for the owner.
- **ALPHA-OPS-45 — Audit-log access MFA:** The product owner confirmed access to moderation audit logs requires multifactor authentication (MFA).
- **ALPHA-OPS-46 — Independent unpublish appeal reviewer:** The product owner confirmed an appeal of a business unpublish must be reviewed by a moderator who was not one of the two original approvers.
- **ALPHA-OPS-47 — Moderator team minimum:** The product owner confirmed the moderator team must have at least two members; a three-member minimum is not required.
- **ALPHA-OPS-48 — External independent appeal reviewer:** The product owner confirmed that if both moderator-team members approved an unpublish, an appointed moderator from outside the team may independently review its appeal.

## Change management

Any changes to these approved decisions require explicit owner approval and a recorded rationale. Keep earlier decision records intact; reconcile derived planning documents with this record.


---

## Historical source: `ux-decisions.md`

# TownTap UX Decisions and Open Questions

## Authority

`02-APPROVED-DECISIONS.md` contains nine approved UX decisions. This document consolidates their implications. `02-APPROVED-DECISIONS.md` remains authoritative for its seven earlier product decisions. Where the records specify different detail, apply the later Step 6 decision to its explicit UX topic while retaining the earlier record for unrelated topics. Security/technical implementation recommendations below are proposals unless they restate an approved decision.

## Nine approved Step 6 decisions

| ID | Approved decision | UX implication |
|---|---|---|
| UX-01 | Design all 12 PRD screens; implement in phases. Exact release allocation is not approved. | Design coverage includes all twelve exact PRD screens; phase boundaries and release acceptance remain proposals pending approval. |
| UX-02 | Use the five main areas in the PRD; preserve PRD labels until explicitly revised. | Use Home, Saved, Discover, My Cards, Profile. Do not preserve the prototype four-tab grouping as approved navigation, and do not invent labels. |
| UX-03 | New profiles default to Private; public exposure requires affirmative owner action. | New profile creation and editing must show private state and an explicit owner action before public exposure. What constitutes sufficient affirmative action and consent wording remains open. |
| UX-04 | Persistent Unlisted links; owner can revoke or regenerate at any time; old links stop granting access. | Unlisted is a deliberate link-sharing mode, excluded from discovery. Current shared links remain usable until revoked/regenerated; prior links must cease granting access after either action. |
| UX-05 | Mobile OTP for signup, login, and phone verification; throttling, recovery, and anti-abuse controls must be defined before implementation. | OTP is an authentication/phone-verification experience, not a business verification signal. Provide understandable resend, error, recovery, and verification states after policy is specified. |
| UX-06 | Business verification uses evidence submission, admin review, and revocation; OTP alone does not confer a badge. | Business badge must be separate from phone verification and tied to a review lifecycle. Do not promise a badge state or strength before evidence and reviewer criteria are approved. |
| UX-07 | Initial language based on device language, with manual switch and persisted preference; Hindi and English support, including fallback. | First visit uses device-language selection; user can switch and preference persists. Hindi/English coverage and fallback for application UI are required; exact content fallback behavior remains open. |
| UX-08 | Allow signup regardless of geography; prioritize Gohana/Sonipat for business discovery. Exact listing and geographic filtering rules remain open. | Signup is not restricted to the pilot geography. Discovery prioritizes the pilot, but listing eligibility and exact boundary behavior must not be assumed. |
| UX-09 | Approve `prototypes/index.html` as UX baseline, not final design or production code. | Use it as the starting interaction reference for updates and design review. It does not override PRD scope or serve as implementation/security specification. |

## Visibility and access states

The product decisions define the state meanings; Step 6 adds default and link lifecycle detail:

| State | Approved meaning and implication |
|---|---|
| Private | Default for new profiles under UX-03. Not accessible via public discovery, directory browsing, or public links. Owner retains authenticated access (PDR-02 interpretation). |
| Unlisted | Excluded from public search/discovery. A valid persistent link grants access only to information permitted for that link (PDR-03). Owner can revoke or regenerate it; old links stop granting access (UX-04). |
| Public | Eligible for public search/discovery, subject to field-level sharing settings (PDR-02 interpretation). Transition from Private requires affirmative owner action (UX-03). |

**Not decided:** whether profile-level visibility and field-level permissions apply identically to person profiles and business listings; defaults for fields; whether changing a field's permission changes existing links; whether Unlisted links expose the same projection as Public; and how quickly cached or copied content disappears. The table states access intent only and does not define technical enforcement.

## Navigation implications

The five PRD areas are Home, Saved, Discover, My Cards, Profile. UX-02 approves those names. The existing baseline prototype has four bottom tabs (Home, Saved, Discover, My Card), so it remains incomplete as a navigation model. Do not decide whether My Cards and Profile become tabs, nested destinations, or another arrangement until the navigation hierarchy and screen destinations are approved. The full mapping remains in `03-UX-AND-SCREEN-REFERENCE.md`.

## Proposed security and implementation recommendations

These recommendations are proposals for later specification and review, not additional approved decisions:

- Enforce privacy on the data returned by authorized services/storage rules, rather than relying on client-side hiding.
- Store private Saved Detail notes/tags in a user-private namespace; PRD requires that other users and the target card owner cannot read them.
- Make public and Unlisted profile reads return only approved fields. Prevent Private records and Unlisted links from appearing in search indexes.
- Treat link tokens as bearer credentials: use unguessable identifiers, avoid exposing them in logs/referrers, and define cache invalidation on revoke/regenerate.
- Define OTP rate limits, resend cooldowns, lockouts, abuse detection, and recovery before implementation, as required by UX-05; values and provider are not approved here.
- Make badge issuance/revocation auditable and visibly distinguish evidence-backed business review from phone control; this is a proposed implementation safeguard.
- Keep locale selection and persisted preference separate from user-generated content translation; do not silently translate user-entered names or descriptions.
- Add explicit consent and denial paths for any location-based discovery; the PRD calls nearby search optional and consent-dependent, but UX-08 leaves geographic filtering open.

## Remaining UX questions and edge cases

### Navigation and scope

- Which exact destinations belong to each of the five areas, including Welcome, Public Card, Business Detail, Business Studio, Settings and Admin?
- Which screens are persistent destinations versus contextual/detail flows? What happens to navigation for guests?
- How should a visitor return from an Unlisted profile, and what is shown when they open it after revocation?
- Which screen and features belong in each implementation release? Phase boundaries are explicitly pending approval.

### Privacy, visibility and links

- What affirmative action and confirmation copy are required to switch from Private to Public or Unlisted?
- Are new field-level visibility controls private by default? Which PRD fields may be exposed in each profile type?
- What is the precedence when a profile is Unlisted but one or more fields are opted out?
- On revocation/regeneration, how are already-open pages, browser caches, search-engine caches, screenshots, and forwarded URLs described to users?
- What should Saved Detail display when a target becomes Private, unlisted, unavailable, suspended, deleted, or changes fields? Which private notes remain available?
- Can an owner revoke only a link without changing profile visibility? Is there one link or multiple named links? These are open questions, not assumptions.

### OTP and account access

- Which OTP event verifies account access, and which verifies phone ownership? Can a user use another login method after phone verification?
- What are code expiry, retry/resend, lockout, provider failure, number change, lost-phone, shared/recycled number, and account recovery rules?
- Is a verified phone shown publicly, and what consent is needed before it becomes a card contact field?

### Business badge

- Which evidence is accepted, who can review it, and what claims does each badge state make?
- Can a listing be published before review? What appears while pending, rejected, expired, disputed, or revoked?
- What are renewal, appeal, ownership change, duplicate listing, business closure, and false-report flows?
- Is badge review available during the initial pilot? No launch timing is approved.

### Bilingual UI

- How is device language mapped when unsupported or ambiguous? What is the initial fallback if device settings cannot be read?
- Which text is translated: system UI, business categories, legal/privacy notices, validation, support, and accessibility labels?
- What fallback is used for untranslated user-generated content? How do search and sorting work across Hindi/English spellings/transliterations?
- How should mixed-language names, text direction, numerals, date/time, and screen-reader pronunciation be handled?

### Pilot and discovery

- What geographic boundary constitutes Gohana/Sonipat, and what does “prioritize” mean for ordering or availability?
- May users outside the pilot create listings, and can pilot users discover businesses outside it?
- What categories launch, who validates them, and how are service areas that cross the boundary treated?
- Does nearby search launch in the pilot; what is the permission-denied path and what location precision is retained?

## Source alignment note

Earlier PRD and UX handoff material describes a four-tab navigation, English-heavy sample UI, toggle-based discovery controls, and placeholder verification. Those are prototype-era concepts. The approved Step 6 decisions supersede them only on the nine topics above; PRD requirements remain source for unspecified product scope. The current prototype remains a baseline to revise, not a final approved flow or visual system.

## Owner implementation brief addendum — 2026-10-24

The owner's latest implementation brief supersedes earlier open statements where it explicitly approves the following baseline. Earlier records above are preserved as history; do not infer approval beyond these items.

| ID | Area | Owner-approved direction |
|---|---|---|
| UX-STEP8E | UX baseline | Step 8E UX/design baseline is approved. The twelve exact PRD screens and five exact PRD navigation areas remain the scope. QR scanning, mobile-card readability, and Hindi wording passed owner review. `prototypes/index.html` is the existing interactive reference; `prototypes/index-step8b-baseline.html` is preserved historical baseline. Prototype behavior is not production-ready. |
| PRIV-AUD | Field audiences | Field-level audience choices are Private, Link-only, and Public. Sensitive fields default to Private. This approves the audience vocabulary and default, not a field-by-field publication matrix. |
| PRIV-LIVE | Revocation and saved references | Unlisted links can be revoked or regenerated; restrictive visibility changes immediately close unauthorized live access for new requests. Saved contacts show only information currently authorized by the owner. Previously copied data cannot be recalled. |
| AUTH-OTP | Authentication | Phone OTP is the requested signup/login method. OTP remains distinct from business verification. Provider, thresholds, recovery details, and anti-abuse policy remain subject to security design. |
| BIZ-VERIFY | Business trust | Optional verified business badge requires evidence and admin approval. Gohana/Sonipat discovery is prioritized; signup remains open to everyone. Reporting, moderation, and audit trail are required. |
| ARCH-FIREBASE | Implementation architecture | The latest owner brief directs implementation toward Firebase Auth, Firestore, Cloud Functions, Storage, and Hosting. This supersedes the earlier vendor-neutral planning-only direction for implementation. It does not authorize production deployment, paid services, real OTP delivery, or claim that project credentials/configuration exist. |

Final screen hierarchy, profile/listing schema, complete field matrix, transition/cache contract, OTP thresholds, minimum Alpha moderator operation, and data retention remain open as tracked in `10-OPEN-DECISIONS.md`.





