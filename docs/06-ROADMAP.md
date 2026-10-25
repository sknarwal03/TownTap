# 06 — TownTap Roadmap and Phase Plan

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `mvp-scope.md`

# TownTap MVP Scope and Proposed Roadmap

## Authority and status

This document separates approved scope from proposed sequencing.

- **Approved design scope:** UX-01 in `02-APPROVED-DECISIONS.md` approves designing all 12 screens listed in PRD section 07, with implementation in phases. It does not approve release allocation.
- **Approved navigation:** UX-02 and PDR-01 preserve the PRD's five areas and labels: Home, Saved, Discover, My Cards, Profile. No sixth area or replacement label is introduced here.
- **Proposed only:** The phase groupings, dependencies, and acceptance criteria below are planning proposals. They need approval before they become committed MVP/release scope.
- The PRD's priorities and P0/P1/P2 requirements remain the product baseline. This roadmap does not change their priority.

## Exact PRD navigation areas

Quoted from PRD section 03:

1. **Home** — Quick actions, recently saved cards, search entry, suggested categories.
2. **Saved** — Private contact list, search, filters, folders/tags, personal notes.
3. **Discover** — City/category search, results, business profile, save/contact actions.
4. **My Cards** — Card gallery, card editor, share QR/link, business listings.
5. **Profile** — Account, visibility defaults, permissions, security, data management.

## Exact PRD screen inventory

Names below are reproduced exactly from PRD section 07; purposes and primary actions are abbreviated from that section.

| # | PRD screen name | Core UI elements | Primary action |
|---:|---|---|---|
| 01 | Welcome | Value statement, example card, Sign in, browse link | Login / view shared card |
| 02 | Home | Global search, quick actions, recent saves | Navigate to features |
| 03 | My Cards | Card list, visibility badges, card preview | New / edit / share |
| 04 | Card Editor | Profile fields, validation, field-level toggles | Save / publish |
| 05 | Public Card | Avatar, bio, services, public contact actions | Call / WhatsApp / Save |
| 06 | Saved Contacts | Search, tags, list/cards, recent saves | Open / filter / unsave |
| 07 | Saved Detail | Current live card + private user note | Edit note / contact |
| 08 | Discover | City/category search, filters, results | Find business |
| 09 | Business Detail | Hours, service area, location, public CTA | Contact / maps / save |
| 10 | Business Studio | Listing editor, verification, public settings | Update / unpublish |
| 11 | Settings | Account, privacy, data management | Manage preferences |
| 12 | Admin | Reports, verification queue, abuse actions | Review / suspend |

## Proposed phased development roadmap

All allocations and acceptance criteria in this section are proposed. They preserve the PRD's screens and requirements without treating all P0 requirements as automatically in the first coded increment. Any deferral of P0 requirements would require explicit product approval and a revised release gate.

### Phase 0 — Product and interaction definition (planning proposal)

**Screens/areas:** Map all 12 screens to the five areas; specify transitions and guest/authenticated access paths before coding.

**Dependencies:** Approved Step 6 decisions; resolution or explicit deferral of open UX questions; PRD and `03-UX-AND-SCREEN-REFERENCE.md` review; product, privacy and security review owners identified.

**Suggested acceptance criteria:**

- Every one of the 12 exact PRD screen names has a purpose, entry/exit paths, states, and a mapping to one or more of the five PRD areas.
- Five-area navigation and destinations are documented without new labels.
- Public, Unlisted, and Private behavior, default-private behavior, link revocation/regeneration, OTP use, badge status, language behavior, and pilot discovery rules are testable in writing.
- Each PRD requirement keeps its P0/P1/P2 priority; proposed release placement and any exception are recorded for approval.

### Phase 1 — Entry, identity, and privacy foundation (implementation proposal)

**Proposed screens:** Welcome, Home, My Cards, Card Editor, Public Card, Settings.

**Dependencies:** Phase 0 flows and fields; approved account/OTP decisions; defined visibility and field-consent rules; public-link lifecycle; bilingual UI requirements; privacy notice and data lifecycle requirements. Any backend and provider choice remains subject to architecture approval.

**Suggested acceptance criteria:**

- Signup/login and phone verification follow the approved OTP scope; guest access to eligible public or valid Unlisted links follows visibility policy.
- New profiles are Private by default; owner action is required before public exposure.
- Private profiles are not available through public links or discovery; Unlisted profiles are excluded from discovery and accessible only through a valid, permitted link; public reads include only permitted fields.
- Owners can revoke/regenerate persistent Unlisted links, after which prior links no longer grant access, including documented cache behavior.
- Card editor validates fields per approved schema; unauthorized or unpermitted fields do not appear in a public response.
- Hindi and English UI paths and language preference meet the approved locale behavior.

### Phase 2 — Saved contact memory (implementation proposal)

**Proposed screens:** Saved Contacts, Saved Detail; dependencies on Public Card and account identity from Phase 1.

**Dependencies:** Live profile reference and lifecycle rules; private note/tag model; duplicate-save semantics; search fields and privacy controls.

**Suggested acceptance criteria:**

- An authenticated user can save an eligible card, open it in Saved Detail, edit private notes/tags, search by the PRD-approved fields, and unsave it.
- Only the saving user can access that user's private notes/tags; card owner and other users cannot read them.
- Saved card fields refresh from currently permitted live profile information without replacing private user context.
- Unavailable, changed-visibility, or deleted targets have a documented and tested state that preserves the PRD's private-note rules.

### Phase 3 — Local discovery and business management (implementation proposal)

**Proposed screens:** Discover, Business Detail, Business Studio.

**Dependencies:** Pilot boundary/category decisions; business profile field and ownership rules; discoverability/consent; OTP distinction from badge evidence; moderation and reporting operational definition; maps/location policy if used.

**Suggested acceptance criteria:**

- Discovery returns only eligible public/discoverable records and excludes Unlisted and Private records.
- City/category filters follow the approved Gohana/Sonipat pilot rules; nearby behavior is enabled only under the separately approved location-consent policy.
- Business owner can create/edit/unpublish a listing as required by PRD BIZ-01; public contact actions use only permitted information.
- Badge state and wording reflect approved evidence/review policy; OTP alone never grants a business badge.
- Abuse reports and moderation have a defined accountable path before the P0 report/moderation requirements are claimed complete.

### Phase 4 — Admin, operations, and release gate (implementation proposal)

**Proposed screen:** Admin, plus end-to-end verification of all preceding screens and five navigation areas.

**Dependencies:** Defined admin roles and least-privilege access, report and verification workflows, audit requirements, data lifecycle and legal/privacy review, operational support and deployment decisions.

**Suggested acceptance criteria:**

- Authorized reviewers can process reports and verification requests, suspend listings as specified, and leave the required audit trail; unauthorized actors cannot access admin actions.
- PRD security, lifecycle, abuse controls, and P0 acceptance scenarios have test evidence.
- Loading, empty, error/retry, offline, accessibility, responsive, language, deletion/export, support and rollback requirements have release evidence according to an approved checklist.



## Current prototype coverage and production gaps

Source inspection of `prototypes/index.html` on 2026-10-24 finds all 12 PRD screen route names and the five PRD area labels. The route-to-area grouping is recorded in `03-UX-AND-SCREEN-REFERENCE.md`.

| PRD screen | Current prototype route | Remaining production gap |
|---|---|---|
| Welcome | Welcome | Real account creation, OTP, guest route resolution and return paths |
| Home | Home | Real account-bound content and search |
| My Cards | My Cards | Durable owner-scoped card records and validated card types/schema |
| Card Editor | Card Editor | Server validation and persisted, authorized field updates |
| Public Card | Public Card | Hosted route and server-enforced public projection |
| Saved Contacts | Saved Contacts | Durable per-user references and authorized search |
| Saved Detail | Saved Detail | Durable saver-only notes/tags and live-reference lifecycle |
| Discover | Discover | Real public-only index, approved filters/pilot behavior and abuse controls |
| Business Detail | Business Detail | Real listing data and permitted actions |
| Business Studio | Business Studio | Authorized ownership/staff workflows and persistence |
| Settings | Settings | Real account/privacy/data lifecycle operations |
| Admin | Admin | Real least-privilege roles, review queues, enforcement and tamper-resistant audit |

Prototype behavior is simulated. Sign-in/OTP, core data, privacy/access enforcement, sharing, QR destination, business search, verification, reports and moderation are not connected to production services. Language preference uses local storage; core records/actions are in-memory mock state. The QR uses an unhosted reserved `.invalid` URL; independent scan validation was not performed according to the dated QA report. The prototype is not production authentication, storage, authorization, or release evidence.

The current five-area grouping is a UX baseline, not approval of final guest/auth navigation or Admin entry. Do not infer production scope from prototype routes.

## Decisions required before production phase commitment

- Confirm route destinations and guest/auth paths for all 12 screens, including contextual Welcome/Public Card and protected Admin.
- Approve profile/card types, per-field audiences/defaults beyond approved sensitive-field defaults, and transitions involving current links.
- Specify OTP provider-independent policy: verification purpose, recovery proof, rate limits and abuse response.
- Define minimum Alpha reporting/moderation ownership and audit operation; required Alpha gates remain even if Admin UI is Phase 4.
- Resolve data deletion/export/retention and saved-reference behavior after restriction, suspension or deletion.
- Confirm locale fallback and pilot discovery boundaries/categories.
- Select architecture, hosting, authentication and search providers only after review; the PRD stack remains a proposal.
