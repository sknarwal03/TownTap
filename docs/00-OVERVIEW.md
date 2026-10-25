# TownTap — Project Overview

**Purpose:** This is the simple-language guide to what TownTap is, what has been decided, how the web app is planned in phases, and where each detailed document belongs. The product requirements document (PRD) remains the detailed requirements baseline; this overview helps readers find and understand it.

## What TownTap does

TownTap is planned as a web app for digital cards, a private smart phonebook, and local business discovery. People can share a current card, save another person's live profile with private notes and tags, and find local businesses. The first pilot prioritizes Gohana/Sonipat, while signup is open regardless of a person's location.

## Current approved direction

- The product name is **TownTap**.
- The PRD defines five main areas: **Home, Saved, Discover, My Cards, Profile**, and twelve screens. Keep these labels and destinations as the source unless an approved decision changes them.
- New profiles start **Private**. The owner must choose to share them.
- Visibility modes are **Private**, **Unlisted** (valid link only, not discoverable), and **Public** (eligible for discovery, subject to field settings).
- Sensitive fields are private by default and have individual visibility controls. Revoking or regenerating an Unlisted link must immediately stop new access through its old link.
- Hindi and English are supported. The first language follows the device setting; the user can switch language and the choice is saved.
- Mobile OTP is planned for signup, login, and phone verification. OTP is not business verification. A business badge needs evidence and admin review.
- `prototypes/index.html` is the approved UX starting point, not final design, production code, authentication, or a security model.

See **02 — Approved Decisions** for the full decision history and **10 — Open Decisions** for details still awaiting specification or approval.

## Web app plan in phases

The release strategy approved Phases 0–4. Phases 1 and 2 are the first working release, called **Digital Card + Smart Phonebook Alpha**. Security and operations needed for Alpha remain release gates even if the Admin screen is developed in a later phase.

| Phase | Plain-language purpose | Main areas of work |
|---|---|---|
| **00 — Define** | Finish the rules and screen behavior before production coding. | Map all 12 PRD screens to five areas; define fields, privacy transitions, OTP/recovery, language behavior, states, and release checks. Resolve or clearly track open decisions. |
| **01 — Identity and cards** | Let people enter TownTap and safely create, manage, and share digital cards. | Welcome, Home, My Cards, Card Editor, Public Card, Profile/Settings; private-by-default profiles; field-level privacy; working link and QR; account/OTP and language support. |
| **02 — Smart Phonebook** | Let a signed-in person save other profiles and manage their own private contact context. | Saved Contacts and Saved Detail; search, tags, notes, save/unsave; live profile updates that respect the owner's current sharing settings. |
| **03 — Discovery and business tools** | Help people find local businesses and let businesses manage listings. | Discover, Business Detail, Business Studio; approved pilot prioritization; listing lifecycle, location consent, reporting and badge policy. |
| **04 — Admin and release readiness** | Operate and support the service safely. | Admin review queues, reports, verification, moderation, audit trail, privacy/data lifecycle, support, security and release evidence. |

**Alpha scope:** Phases 1–2. The phase table is a product roadmap, not a production-readiness claim. The Vite app now has emulator-backed Firebase Auth, callable profile/card/share/phonebook/directory/report/verification flows, server-generated projections, and default-deny client rules. Live project security, OTP, and operations remain release gates. See 12 for current behavior and local testing.

## How to read the documentation

| Number | Document | Use it for |
|---|---|---|
| 00 | [This overview](00-OVERVIEW.md) | Simple product and phase summary; entry point for the docs. |
| 01 | [Product requirements (PRD)](01-PRODUCT-REQUIREMENTS.docx) | Detailed product scope, requirements, priorities, journeys, and constraints. |
| 02 | [Approved decisions](02-APPROVED-DECISIONS.md) | Product/UX decisions and their history; authoritative approved changes. |
| 03 | [UX and screen reference](03-UX-AND-SCREEN-REFERENCE.md) | Flows, the 12-screen mapping, and screen states. |
| 04 | [Profile privacy](04-PROFILE-PRIVACY.md) | Visibility modes, field rules, and link behavior. |
| 05 | [Authentication UX](05-AUTHENTICATION-UX.md) | Signup, login, OTP, recovery, and related unresolved policy. |
| 06 | [Roadmap](06-ROADMAP.md) | Phase detail, dependencies, and proposed phase-level acceptance. |
| 07 | [Alpha acceptance criteria](07-ALPHA-ACCEPTANCE.md) | Checks and release gates for the first working release. |
| 08 | [Prototype handoff and evidence](08-PROTOTYPE-HANDOFF-AND-EVIDENCE.md) | Prototype boundaries, update plan, implementation notes, and QA history. |
| 09 | [Prototype and project inventory](09-DOCUMENTATION-INVENTORY.md) | Current file inventory and audit observations. |
| 10 | [Open decisions](10-OPEN-DECISIONS.md) | Unresolved product/UX choices and their dependencies. |
| 11 | [Architecture and data/API planning draft](11-TECHNICAL-ARCHITECTURE-AND-DATA-API-PLAN.md) | Logical architecture proposal updated with Firebase as the current implementation target; detailed schema and security rules remain open. |
| 12 | [Firebase implementation and local testing](12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md) | Emulator architecture, schema, callable functions, privacy behavior, assumptions, test commands, and release boundaries. |
| — | [Master project status](MASTER-PROJECT-STATUS.md) | Current implementation status, architecture direction, checks, blockers, and next work. |
| — | `AGENTS.md` | Repository working instructions, not product requirements. |

## Recommended reading order

Start here, then read 01 PRD, 02 approved decisions, 03 UX/screens, 04 privacy, 05 authentication, 06 roadmap, and 07 Alpha criteria. Use 08 for prototype history, 10 for owner decisions still needed, 11 for architecture planning, 12 for emulator implementation/testing, and `MASTER-PROJECT-STATUS.md` for current evidence. Do not treat emulator behavior or proposals as production approval.






