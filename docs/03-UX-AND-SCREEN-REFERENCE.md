# 03 — UX Flows and Screen Reference
## Current implementation reference — source review 2026-10-24

`prototypes/index.html` now declares all 12 exact PRD screen names and all five PRD navigation labels. The mapping rendered by its current source is:

| PRD area | Prototype routes |
|---|---|
| Home | Home |
| Saved | Saved Contacts, Saved Detail |
| Discover | Discover, Business Detail |
| My Cards | My Cards, Card Editor, Public Card, Business Studio |
| Profile | Settings |
| Contextual/protected routes | Welcome (entry), Admin (separate protected/demo entry) |

The prototype offers a five-area navigation bar. On 2026-10-24, the owner approved the current route grouping above as the Phase 0 planning baseline. This does not finalize the information architecture: guest/auth entry paths, Public Card return behavior, and Admin access still need approval. The 12 routes are interactive mock screens, not 12 production-complete features. Sign-in, data, OTP, moderation, permissions, and privacy enforcement are simulated; mock share links use a reserved `.invalid` host.

The imported screen mapping below describes an earlier eight-view snapshot. Its table and “missing screen” statements are historical and are superseded by this current source review. PRD requirements and production gaps remain authoritative.

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `UX_FLOWS_AND_DESIGN_SPEC.md`

# NearCard — UX Flows and Design Specification
**UI/UX Step 2 · Final Review · v1.1**

## Product promise

**Create → Share → Save → Remember → Discover → Connect.**

Users can create a card, maintain a private context-rich collection of people they have met, and find opted-in public business profiles. Public business identity and private contact memory are related but distinct features.

## Information architecture

```
HOME
├── MY CARD
│   ├── EDIT CARD
│   └── PRIVACY & SETTINGS
├── SAVED CONTACTS
│   └── CONTACT DETAIL (private notes + tags)
└── DISCOVER
    └── BUSINESS PROFILE
        └── SAVE -> SAVED CONTACTS
```

The persistent mobile navigation has four tabs: **Home, Saved, Discover, My Card**. Secondary experiences have Back buttons. Privacy is accessed from the profile avatar or card editing context.

## Screen definitions

| Screen | Primary user goal | Core components | Important empty/error state |
|---|---|---|---|
| Dashboard | Reach main tasks quickly | Identity hero, action tiles, tips | No card yet -> create CTA (for Step 3) |
| My Card | Review/share visible identity | Cover, avatar, name, role, consent-driven actions, QR placeholder | Hidden fields must not leak; QR unavailable before real URL |
| Saved Contacts | Find contacts without device phonebook clutter | Search, category filters, private notes, contact rows | No saved contacts / no search results |
| Discover | Find public local businesses | Search, category chips, business results | No matches; location unavailable/permission denied |
| Business Profile | Evaluate and remember a business | Business facts, sample hours, map placeholder, save CTA | Listing removed/private; no contact details |
| Contact Detail | Remember where a person was met | Contact identity, private note, private tags | No notes yet; deleted card reference |
| Card Editor | Update personal/professional card | Profile inputs, discovery opt-in, field visibility switches | Missing required identity, invalid URLs/phone numbers |
| Privacy & Settings | Control exposure | Search discoverability, separate field controls, deletion/export explanation | Public profile toggled off; permissions revoked |

## Key user flows

### A. Personal digital identity

1. Onboard/sign in (onboarding specification only; not implemented in Step 2).
2. Enter full name, title, city and short description.
3. Choose whether the profile is discoverable. This is separate from individually revealing phone, WhatsApp and city.
4. Review the card. A real version generates the QR from a valid, published URL only.

### B. Saving and remembering a connection

1. Open shared QR/link or a public Directory listing (link/QR ingestion is a Step 3/4 feature).
2. Select **Save Card**.
3. The record appears in **Saved**.
4. Open contact detail, add a private note and private tags.
5. Search Saved using name, profession, city, note or tag.

### C. Discover and connect

1. Open Discover.
2. Search profession, service, city or business name. Optionally filter category.
3. Open a business profile.
4. Decide whether to call/message/navigate (placeholders in Step 2) or save the card to Saved.
5. Public data can change at the owner's direction. Notes remain private to the saving user.

### D. Privacy and safety

1. Public discoverability defaults OFF.
2. Phone, WhatsApp and city reveal controls default OFF.
3. Public card only displays actions for fields that have explicitly been opted into in the current prototype.
4. Private notes are never shown on public business pages.
5. Production build needs backend authorization, deletion, breach handling, abuse reports, impersonation handling and user-facing consent notices.

## Design system tokens

| Token | Value | Use |
|---|---|---|
| Primary blue | `#3d67ec` | Main CTAs, selected navigation |
| Ink | `#17253b` | Titles/body |
| Muted | `#718094` | Supporting text |
| Soft background | `#f4f7fb` | Inputs and surfaces |
| Positive green | `#16876d` | WhatsApp/positive contexts |
| Card radius | `18px` | Card-style surfaces |
| Mobile target | `320–430px` | Small screen primary experience |
| Desktop preview | `1280px+` | Centered phone + design sidebar |

Visual direction: confident deep blue, low visual density, rounded cards, readable language, highly recognizable primary actions. The brand name is still provisional.

## Accessibility and device handoff

- Real HTML buttons, inputs and switch labels are used to support keyboard use.
- Focus-visible outlines and reduced-motion CSS are present.
- Mobile screens have a persistent 4-tab nav; page content can scroll independently.
- Production QA must additionally audit screen readers, touch target dimensions, contrast against WCAG, Android device browser quirks, font scaling and accessibility in Hindi.
- Avoid inferring business verification from badges: sample listings are explicitly *not verified*.

## Step 3 handoff decisions to confirm

- Brand name, logo, fonts and primary language (English-only vs Hindi/English).
- Exact profile fields per type: Individual, Professional, Business.
- Whether one account can own several public cards and multiple business branches in MVP.
- Whether unlisted links are indexed by search engines (recommend **noindex**).
- Real QR URL behavior and revoked/expired links.
- Full registration/onboarding and business-verification experience.
- Design of deletion/exports, report/block and error/empty/loading states.
- Contact syncing behavior when a public card is edited, made private or deleted.



---

## Historical source: `screen-mapping.md`

# TownTap Screen Mapping

Status: analysis of the approved product decision record and existing design artifacts. This mapping does not approve new screens or navigation labels.

## Source basis

- PRD: `01-PRODUCT-REQUIREMENTS.docx`, section 03 (five main areas) and section 07 (twelve screens).
- Approved decisions: `02-APPROVED-DECISIONS.md`, especially PDR-01 and the rule not to invent missing navigation labels.
- Current design candidates: `prototypes/index.html`, `NearCard_Step2_Final_Design_Board.png`, the eight `qa_screen_*.png` captures, and `docs/08-PROTOTYPE-HANDOFF-AND-EVIDENCE.md`.
- Historical candidate: `prototypes/index-step8b-baseline.html` and `prototypes/Design_Board.png`.

PDR-01 confirms the PRD’s five areas. Their labels and descriptions below are quoted from the PRD, not invented: Home, Saved, Discover, My Cards, Profile. This does not establish a final visual label treatment or resolve how the prototype’s four-tab bar should expose all five.

## Five PRD navigation areas

| PRD area | PRD contents | Current prototype coverage | Coverage note |
|---|---|---|---|
| Home | Quick actions, recently saved cards, search entry, suggested categories | `home` in `index.html` | Partial: quick access and a product message appear; global search, recent saves, and suggested categories are absent. |
| Saved | Private contact list, search, filters, folders/tags, personal notes | `saved` and `contact` in `index.html` | Partial: list/search/filter and private note/tag views exist. Folders are explicitly later-phase in PRD; recent-save ordering and unsave/detail lifecycle are incomplete. |
| Discover | City/category search, results, business profile, save/contact actions | `discover` and `business` in `index.html` | Partial: sample city/category filters and business details/actions appear. Nearby consent, verified filter, publication eligibility, and real listing behavior are not implemented. |
| My Cards | Card gallery, card editor, share QR/link, business listings | `card` and `editor` in `index.html` | Partial: one sample card and generic editor/share illustration. No multi-card gallery, QR/link, or business-listing management. |
| Profile | Account, visibility defaults, permissions, security, data management | `privacy` in `index.html` | Partial: illustrative visibility toggles and delete/export note only. Account, defaults, permissions, security, and functional data management absent. |

## Twelve PRD screens

| # | PRD screen | Purpose from PRD | Current `index.html` correspondence | Missing design / implementation coverage |
|---:|---|---|---|---|
| 01 | Welcome | Value statement, example card, sign-in, browse link; login or view shared card | None | No welcome, sign-in, guest-browse, or guest entry flow. |
| 02 | Home | Global search, quick actions, recent saves; navigate to features | `home` | Quick actions exist; global search and recent saves are missing. |
| 03 | My Cards | Card list, visibility badges, card preview; new/edit/share | `card` (single card) | No gallery/list or create-new-card entry; card-type/multiple-card decisions still open. |
| 04 | Card Editor | Profile fields, validation, field-level toggles; save/publish | `editor` | Generic fields and three illustrative toggles only; no validated schema, errors, full field visibility, or publish flow. |
| 05 | Public Card | Avatar, bio, services, public contact actions; call/WhatsApp/save | `card` (owner preview) | No distinct guest public route, visibility-state handling, or save/login handoff. |
| 06 | Saved Contacts | Search, tags, list/cards, recent saves; open/filter/unsave | `saved` | Search/list/filter are mocked; no persistent save, recent ordering, or unsave control shown. |
| 07 | Saved Detail | Current live card plus private user note; edit note/contact | `contact` | Contact and note view exists; no real live reference, update/deletion/unavailable state, or implemented contact actions. |
| 08 | Discover | City/category search, filters, results; find business | `discover` | Sample-only; verified filter and optional nearby with consent absent; pilot boundary not enforced. |
| 09 | Business Detail | Hours, service area, location, public CTA; contact/maps/save | `business` | Illustrative sample detail; no real maps/contact/save, listing status, or badge behavior. |
| 10 | Business Studio | Listing editor, verification, public settings; update/unpublish | None | Entire studio and owner lifecycle missing. Business Profile is a public detail view, not owner studio. |
| 11 | Settings | Account, privacy, data management; manage preferences | `privacy` | Some visibility concepts and explanatory copy; no account/security/preferences/export/delete flows. |
| 12 | Admin | Reports, verification queue, abuse actions; review/suspend | None | No admin interface or operational review flows. |

## Older six-screen prototype comparison

`index-step8b-baseline.html` covers Dashboard, My Digital Card, Smart Phonebook, Business Directory, Business Profile, and Create/Edit Card. These roughly correspond to PRD screens 02, 05, 06, 08, 09, and 04, respectively. It does not cover Welcome, My Cards gallery, Saved Detail, Business Studio, Settings, or Admin. The older `Design_Board.png` presents the same six conceptual views.

At the time of this historical review, `index.html` had eight views and `index-step8b-baseline.html` had six. This statement is superseded by the current source review at the top of this document, which finds all 12 PRD routes in `prototypes/index.html`. The older six-screen concept remains historical.

## Navigation mismatch

The PRD specifies five main areas: Home, Saved, Discover, My Cards, Profile. Both HTML prototypes render four bottom items: Home, Saved, Discover, My Card. The prototype routes the card editor and privacy screen to the My Card tab, the business detail to Discover, and contact detail to Saved. This is an interaction convention in the mockup, not approval to merge the five PRD areas or rename them. Resolve whether Profile and My Cards remain separate destinations and how all five areas map to navigation before treating the prototype as a navigation specification.


---

## Historical source: `screen-state-matrix.md`

# TownTap Screen State Matrix

The 12 screen names below are exact PRD section 07 names. The five area labels are exact PRD section 03 labels. Phase assignments follow approved Step 7 release strategy: Phases 1–2 are the Digital Card + Smart Phonebook Alpha; Phases 3–4 are later. State design is proposed. A dash means the state does not normally apply, not that exceptional handling may be ignored.

## Five navigation areas

| PRD area | PRD contents |
|---|---|
| Home | Quick actions, recently saved cards, search entry, suggested categories |
| Saved | Private contact list, search, filters, folders/tags, personal notes |
| Discover | City/category search, results, business profile, save/contact actions |
| My Cards | Card gallery, card editor, share QR/link, business listings |
| Profile | Account, visibility defaults, permissions, security, data management |

Exact persistent-tab presentation, guest navigation, and Admin entry remain open. The area mapping below is a proposed grouping by PRD purpose, not a new navigation decision.

## Screen states and proposed phase mapping

Columns: Load, Empty, Populated, Error, Offline, Auth, Permission. Permission includes OS/device and role permissions.

| # | Exact PRD screen | Proposed PRD area | Phase | Loading | Empty | Populated | Error | Offline | Authentication | Permission |
|---:|---|---|---|---|---|---|---|---|---|---|
| 01 | Welcome | Entry; destination open | Phase 1 / Alpha | Signup/login or shared-card resolution pending | First use, no account | Sign-in and browse entry; examples labeled illustrative | OTP, input, delivery, or network error | Explain unavailable operation and retry | Guest browse vs sign-in; return path open | None normally |
| 02 | Home | Home | Phase 1 / Alpha | Summary/search pending | No recent saves or cards | Search entry, quick actions, recent saves, suggested categories | Partial data/search failure with retry | Cached shell/data behavior open; never imply stale data is current | Guest/signed-in presentation to decide; private data only to owner | None unless an approved location feature appears |
| 03 | My Cards | My Cards | Phase 1 / Alpha | Owned card list | No cards; create-card entry | Owned cards, visibility status, previews | List/create/update failure | Explain unsaved changes; offline edit persistence open | Authenticated owner only | Media picker if used; no silent access |
| 04 | Card Editor | My Cards | Phase 1 / Alpha | Profile fields load | New-card form; Private default | Existing values, field controls, visibility mode | Validation, save conflict, authorization failure | Preserve draft safely or state unsaved status | Owner-only editing | Photo picker if used; exact behavior open |
| 05 | Public Card | My Cards (proposed); guest entry from Welcome | Phase 1 / Alpha | Public projection/link resolution | Invalid, revoked, Private, or unavailable profile state | Only audience-permitted fields/actions | Denied/unavailable/action error without private data | Do not present stale cache as authorized/current | Guest may view eligible Public/valid Unlisted; Save requires auth per PRD | No permission until visitor starts an OS action |
| 06 | Saved Contacts | Saved | Phase 2 / Alpha | Private list/search | No saved records vs no matches | Saved references, tags, recency, filters | Read/search/unsave failure | State whether content is stale; offline semantics open | Auth required; other users denied | Device contacts not required; scraping is PRD non-goal |
| 07 | Saved Detail | Saved | Phase 2 / Alpha | Live profile and private context | No note/tags; unavailable target distinct | Permitted live fields plus saver-only note/tags | Edit/save failure; target changed or removed | Clarify live data freshness; private note persistence rule open | Auth required; only saver sees private context | Call/maps are user-initiated; OS behavior contextual |
| 08 | Discover | Discover | Phase 3 / Later | Results and filters load | No eligible listings/no matches | Eligible listings and filters | Search/provider/network error | Explain discovery is not refreshed; retry | Public browse per PRD; save/manage requires auth | Nearby is optional; denial fallback follows approved location rules |
| 09 | Business Detail | Discover | Phase 3 / Later | Listing/public fields load | Unpublished, unavailable, or no permitted details | Public business information, permitted actions, approved badge state | Listing/action failure; suspended/unavailable | No stale badge/status claim | Guest public view; owner controls require auth | Directions/contact actions user-initiated |
| 10 | Business Studio | My Cards (PRD places dashboard within My Cards/Profile) | Phase 3 / Later | Owned listing/editor/review status load | No listing; create entry | Listing fields, public settings, review status | Validation/save/upload/review error | Show unsaved state; do not claim publication | Owner/authorized staff only | Media picker only if requested; no silent location access |
| 11 | Settings | Profile | Phase 1 / Alpha | Account/preferences load | Documented defaults for unset preferences | Account, privacy, security, permission, data controls | Update/export/delete failure | Explain operation unavailable; no false success | Auth required for private account/data | Show OS permission state only when applicable |
| 12 | Admin | Protected area; entry open | Phase 4 / Later | Review queues/details load | No work items | Authorized reports, verification state/evidence, actions | Queue/action/audit failure | No offline moderation claims | Admin authorization; others denied without data leakage | Role-based access; evidence restricted |

## Phase classification

- **Phase 1 / Alpha:** Welcome, Home, My Cards, Card Editor, Public Card, Settings.
- **Phase 2 / Alpha:** Saved Contacts, Saved Detail.
- **Phase 3 / later:** Discover, Business Detail, Business Studio.
- **Phase 4 / later:** Admin and operational/release work across phases.

This is aligned to the approved Step 7 phase sequence and Phase 1/2 Alpha definition. Screen phase does not permit deferring essential security, operational readiness, or testing needed for Alpha.

## Proposed state acceptance guidance

For each implemented screen, verify expected states and ensure failed actions never appear successful. Cached content must not bypass Private mode or a revoked link; private notes must not appear in public views; guest/unauthorized responses must not expose protected fields or account existence. Exact offline/caching policy and copy remain open in the privacy and authentication specs.








